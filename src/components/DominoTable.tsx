import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Player, PlacedDomino, DominoCard, ChatMessage } from '../types/game';
import { ArenaTheme } from '../types/themes';
import { DominoTile } from './DominoTile';
import { DominoScene3D } from './DominoScene3D';
import { Avatar3DViewer } from './Avatar3DViewer';
import { PlayerFirstPerson3D } from './PlayerFirstPerson3D';
import { InGameChat } from './InGameChat';
import { PauseModal } from './PauseModal';
import { CatMiniGame } from './CatMiniGame';
import { sounds } from '../services/soundEffects';
import casinoDealerImg from '../assets/images/casino_dealer.jpg';
import {
  Pause,
  AlertTriangle,
  SkipForward,
  Info,
  CornerDownLeft,
  CornerDownRight,
  Sparkles,
  Eye,
  Clock,
  ArrowRight,
  Trophy,
} from 'lucide-react';

interface Props {
  players: Player[];
  theme: ArenaTheme;
  difficulty: 'easy' | 'medium' | 'hard';
  onGameOver: (winner: Player, updatedPlayers: Player[], isDeadlock: boolean) => void;
  onOpenShop: () => void;
  onQuitToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface OpponentThrowAnimation {
  fromPosition: 'top' | 'left' | 'right';
  card: DominoCard;
  targetEnd: 'left' | 'right' | 'first';
}

export type OpponentMood = 'thinking' | 'confused' | 'angry' | 'happy' | 'neutral';

export interface OpponentDialogueState {
  playerIdx: number;
  text: string;
  mood: OpponentMood;
  expression: string;
}

export const DominoTable: React.FC<Props> = ({
  players: initialPlayers,
  theme,
  difficulty,
  onGameOver,
  onOpenShop,
  onQuitToLobby,
  isMuted,
  onToggleMute,
}) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [boardChain, setBoardChain] = useState<PlacedDomino[]>([]);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number>(0);
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [oneCardAlert, setOneCardAlert] = useState<{ playerName: string; text: string } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCatMiniGame, setShowCatMiniGame] = useState<boolean>(false);
  const [hasTriggeredMiniGame, setHasTriggeredMiniGame] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedHandCard, setSelectedHandCard] = useState<DominoCard | null>(null);
  const [draggedCard, setDraggedCard] = useState<DominoCard | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'left' | 'right' | 'center' | null>(null);
  const [mismatchAlert, setMismatchAlert] = useState<{ text: string } | null>(null);

  // Opponent Animated Card Throw & Expression
  const [activeThrowAnim, setActiveThrowAnim] = useState<OpponentThrowAnimation | null>(null);
  const [opponentDialogue, setOpponentDialogue] = useState<OpponentDialogueState | null>(null);
  const [botThinkingTimerSeconds, setBotThinkingTimerSeconds] = useState<number | null>(null);

  // Multiplayer Mini-Game Wait Simulation
  const [opponentWaitingMiniGame, setOpponentWaitingMiniGame] = useState<{
    name: string;
    countdown: number;
  } | null>(null);
  const [playedMiniGameMap, setPlayedMiniGameMap] = useState<Record<string, boolean>>({});

  // In-Table 10-Second Card Reveal State (SAME SCREEN BEFORE PODIUM)
  const [matchEndState, setMatchEndState] = useState<{
    isEnding: boolean;
    winner: Player;
    finalPlayers: Player[];
    isDeadlock: boolean;
    countdown: number;
  } | null>(null);

  const [, startTransition] = useTransition();

  const currentPlayer = players[activeTurnIdx];
  const isHumanTurn = currentPlayer?.type === 'human';

  // 1. Tense Suspense BGM during in-game match!
  useEffect(() => {
    sounds.startTenseBGM();
    return () => {
      sounds.stopTenseBGM();
    };
  }, []);

  const showMismatch = (text: string) => {
    sounds.playWrongBuzz();
    setMismatchAlert({ text });
    setTimeout(() => {
      setMismatchAlert(null);
    }, 3500);
  };

  // Calculate open ends
  const getOpenEnds = useCallback((): { leftEnd: number; rightEnd: number } | null => {
    if (boardChain.length === 0) return null;
    const firstDomino = boardChain[0];
    const lastDomino = boardChain[boardChain.length - 1];
    return {
      leftEnd: firstDomino.leftVal,
      rightEnd: lastDomino.rightVal,
    };
  }, [boardChain]);

  // Check if card can be played on board
  const canPlayCard = useCallback(
    (card: DominoCard) => {
      const ends = getOpenEnds();
      if (!ends) return true;
      return (
        card.leftVal === ends.leftEnd ||
        card.rightVal === ends.leftEnd ||
        card.leftVal === ends.rightEnd ||
        card.rightVal === ends.rightEnd
      );
    },
    [getOpenEnds]
  );

  // Trigger match completion on the SAME TABLE with 10-second reveal countdown
  const triggerMatchEnd = useCallback(
    (winner: Player, currentPlayersList: Player[], isDeadlock: boolean) => {
      sounds.playTileSnap();
      setMatchEndState({
        isEnding: true,
        winner,
        finalPlayers: currentPlayersList,
        isDeadlock,
        countdown: 10,
      });
    },
    []
  );

  // Countdown timer for 10-second in-table reveal
  useEffect(() => {
    if (!matchEndState) return;

    const timer = setInterval(() => {
      setMatchEndState((prev) => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          clearInterval(timer);
          // Transition to 3D Podium after 10 full seconds of viewing cards on table
          onGameOver(prev.winner, prev.finalPlayers, prev.isDeadlock);
          return null;
        }
        return {
          ...prev,
          countdown: prev.countdown - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchEndState, onGameOver]);

  // Check game over
  const checkEndConditions = useCallback(
    (currentPlayersList: Player[], passesCount: number) => {
      const emptyHandPlayer = currentPlayersList.find((p) => p.cards.length === 0);
      if (emptyHandPlayer) {
        triggerMatchEnd(emptyHandPlayer, currentPlayersList, false);
        return true;
      }

      if (passesCount >= 4) {
        const sorted = [...currentPlayersList].sort((a, b) => {
          if (a.cards.length !== b.cards.length) {
            return a.cards.length - b.cards.length;
          }
          const sumA = a.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0);
          const sumB = b.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0);
          return sumA - sumB;
        });

        const winner = sorted[0];
        triggerMatchEnd(winner, currentPlayersList, true);
        return true;
      }

      return false;
    },
    [triggerMatchEnd]
  );

  // Execute card play logic
  const executePlayCard = useCallback(
    (playerIdx: number, card: DominoCard, endToAttach: 'left' | 'right') => {
      sounds.playTileSnap();

      setBoardChain((prevChain) => {
        if (prevChain.length === 0) {
          return [
            {
              card,
              leftVal: card.leftVal,
              rightVal: card.rightVal,
              placedBy: players[playerIdx].name,
              turnIndex: 1,
              end: 'first',
            },
          ];
        }

        const newChain = [...prevChain];
        const firstDomino = newChain[0];
        const lastDomino = newChain[newChain.length - 1];

        if (endToAttach === 'left') {
          const target = firstDomino.leftVal;
          let lVal = card.leftVal;
          let rVal = card.rightVal;
          if (lVal === target) {
            lVal = card.rightVal;
            rVal = card.leftVal;
          }
          newChain.unshift({
            card,
            leftVal: lVal,
            rightVal: rVal,
            placedBy: players[playerIdx].name,
            turnIndex: newChain.length + 1,
            end: 'left',
          });
        } else {
          const target = lastDomino.rightVal;
          let lVal = card.leftVal;
          let rVal = card.rightVal;
          if (rVal === target) {
            lVal = card.rightVal;
            rVal = card.leftVal;
          }
          newChain.push({
            card,
            leftVal: lVal,
            rightVal: rVal,
            placedBy: players[playerIdx].name,
            turnIndex: newChain.length + 1,
            end: 'right',
          });
        }

        return newChain;
      });

      // Update player's hand
      setPlayers((prev) => {
        const updated = [...prev];
        const targetP = { ...updated[playerIdx] };
        targetP.cards = targetP.cards.filter((c) => c.id !== card.id);
        updated[playerIdx] = targetP;

        // 1 card notification
        if (targetP.cards.length === 1) {
          sounds.playOneCardAlert();
          setOneCardAlert({
            playerName: targetP.name,
            text: `⚠️ ${targetP.name} tinggal 1 kartu lagi!`,
          });
          setTimeout(() => setOneCardAlert(null), 3500);
        }

        // Trigger Cat mini-game on exactly 3 cards (1 chance only per player rule)
        if (targetP.cards.length === 3 && !playedMiniGameMap[targetP.id]) {
          setPlayedMiniGameMap((pm) => ({ ...pm, [targetP.id]: true }));

          if (targetP.type === 'human') {
            setHasTriggeredMiniGame(true);
            setTimeout(() => {
              setShowCatMiniGame(true);
            }, 800);
          } else {
            // Multiplayer rule: Bot / opponent plays mini game, other players must wait!
            setOpponentWaitingMiniGame({
              name: targetP.name,
              countdown: 10,
            });

            const waitInterval = setInterval(() => {
              setOpponentWaitingMiniGame((cur) => {
                if (!cur || cur.countdown <= 1) {
                  clearInterval(waitInterval);
                  return null;
                }
                return { ...cur, countdown: cur.countdown - 1 };
              });
            }, 1000);
          }
        }

        setConsecutivePasses(0);
        checkEndConditions(updated, 0);
        return updated;
      });

      setActiveTurnIdx((prev) => (prev + 1) % 4);
      setSelectedHandCard(null);
      setDraggedCard(null);
      setDragOverZone(null);
      setBotThinkingTimerSeconds(null);
    },
    [players, playedMiniGameMap, checkEndConditions]
  );

  // Pass turn
  const handlePassTurn = useCallback(() => {
    sounds.playPass();
    const updatedPasses = consecutivePasses + 1;
    setConsecutivePasses(updatedPasses);

    setPlayers((prev) => {
      const updated = [...prev];
      updated[activeTurnIdx] = {
        ...updated[activeTurnIdx],
        isPassed: true,
      };
      return updated;
    });

    setTimeout(() => {
      setPlayers((prev) => {
        const updated = [...prev];
        updated[activeTurnIdx] = {
          ...updated[activeTurnIdx],
          isPassed: false,
        };
        return updated;
      });
    }, 1500);

    const ended = checkEndConditions(players, updatedPasses);
    if (!ended) {
      setActiveTurnIdx((prev) => (prev + 1) % 4);
    }
  }, [consecutivePasses, activeTurnIdx, players, checkEndConditions]);

  // Drag and drop handlers for Human player
  const handleDragStart = (e: React.DragEvent, card: DominoCard) => {
    if (!isHumanTurn || isPaused || !!matchEndState) return;
    setDraggedCard(card);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, zone: 'left' | 'right' | 'center') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverZone !== zone) {
      setDragOverZone(zone);
    }
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDropOnZone = (e: React.DragEvent, zone: 'left' | 'right' | 'center') => {
    e.preventDefault();
    setDragOverZone(null);

    if (!draggedCard || !isHumanTurn || isPaused || !!matchEndState) return;

    if (boardChain.length === 0) {
      setMismatchAlert(null);
      executePlayCard(activeTurnIdx, draggedCard, 'right');
      return;
    }

    const ends = getOpenEnds();
    if (!ends) return;

    if (zone === 'left') {
      const matchesLeft =
        draggedCard.leftVal === ends.leftEnd || draggedCard.rightVal === ends.leftEnd;
      if (matchesLeft) {
        setMismatchAlert(null);
        executePlayCard(activeTurnIdx, draggedCard, 'left');
      } else {
        showMismatch(
          `Kartu tidak cocok! Ujung kiri membutuhkan nomor ${ends.leftEnd}, sedangkan kartu yang kamu geser adalah [${draggedCard.leftVal}:${draggedCard.rightVal}].`
        );
      }
    } else if (zone === 'right') {
      const matchesRight =
        draggedCard.leftVal === ends.rightEnd || draggedCard.rightVal === ends.rightEnd;
      if (matchesRight) {
        setMismatchAlert(null);
        executePlayCard(activeTurnIdx, draggedCard, 'right');
      } else {
        showMismatch(
          `Kartu tidak cocok! Ujung kanan membutuhkan nomor ${ends.rightEnd}, sedangkan kartu yang kamu geser adalah [${draggedCard.leftVal}:${draggedCard.rightVal}].`
        );
      }
    }
  };

  const handleCardClick = (card: DominoCard) => {
    if (!isHumanTurn || isPaused || !!matchEndState) return;
    sounds.playClick();
    setSelectedHandCard(card);
  };

  const handleZoneClick = (zone: 'left' | 'right') => {
    if (!selectedHandCard) {
      showMismatch('Pilih kartu di tanganmu terlebih dahulu, lalu klik atau drag ke ujung kiri/kanan.');
      return;
    }
    const ends = getOpenEnds();
    if (!ends) return;

    if (zone === 'left') {
      const matchesLeft =
        selectedHandCard.leftVal === ends.leftEnd || selectedHandCard.rightVal === ends.leftEnd;
      if (matchesLeft) {
        setMismatchAlert(null);
        executePlayCard(activeTurnIdx, selectedHandCard, 'left');
      } else {
        showMismatch(
          `Kartu tidak cocok! Ujung kiri membutuhkan nomor ${ends.leftEnd}, sedangkan kartumu bernilai [${selectedHandCard.leftVal}:${selectedHandCard.rightVal}].`
        );
      }
    } else {
      const matchesRight =
        selectedHandCard.leftVal === ends.rightEnd || selectedHandCard.rightVal === ends.rightEnd;
      if (matchesRight) {
        setMismatchAlert(null);
        executePlayCard(activeTurnIdx, selectedHandCard, 'right');
      } else {
        showMismatch(
          `Kartu tidak cocok! Ujung kanan membutuhkan nomor ${ends.rightEnd}, sedangkan kartumu bernilai [${selectedHandCard.leftVal}:${selectedHandCard.rightVal}].`
        );
      }
    }
  };

  // 4 & 5: AI Turn with realistic 5–8 seconds thinking delay and expressions
  useEffect(() => {
    if (
      isHumanTurn ||
      isPaused ||
      showCatMiniGame ||
      !!opponentWaitingMiniGame ||
      !!matchEndState
    )
      return;

    const bot = players[activeTurnIdx];
    if (!bot) return;

    const pos: 'left' | 'top' | 'right' =
      activeTurnIdx === 1 ? 'left' : activeTurnIdx === 2 ? 'top' : 'right';

    const thinkingTotalSeconds = Math.floor(Math.random() * 3) + 5; // 5, 6, or 7 seconds
    setBotThinkingTimerSeconds(thinkingTotalSeconds);

    const confusedLines = [
      { text: 'Hmm... bingung mau buang kartu yang mana 🤔💭', expr: '🤔' },
      { text: 'Biar kuamati angka-angka ujung di meja dulu... 🌀', expr: '🧐' },
      { text: 'Pilihan rumit nih... apa ada jalan? 💭', expr: '🤔' },
      { text: 'Sebentar, jangan ganggu konsentrasiku! 📐', expr: '🤨' },
    ];
    const pickConfused = confusedLines[Math.floor(Math.random() * confusedLines.length)];

    setOpponentDialogue({
      playerIdx: activeTurnIdx,
      text: pickConfused.text,
      mood: 'confused',
      expression: pickConfused.expr,
    });

    const midTimer = setTimeout(() => {
      setOpponentDialogue({
        playerIdx: activeTurnIdx,
        text: 'Menghitung sisa kartu dan persamaan matematika... 💭📐',
        mood: 'thinking',
        expression: '💭',
      });
    }, 2400);

    const decisionTimer = setTimeout(() => {
      startTransition(() => {
        const ends = getOpenEnds();

        if (boardChain.length === 0) {
          const firstCard = bot.cards[0];
          setOpponentDialogue({
            playerIdx: activeTurnIdx,
            text: 'Buka meja dulu dengan kartu pertamaku! 😎🀄',
            mood: 'happy',
            expression: '😎',
          });
          sounds.playJoyfulChime();

          triggerThrowAnimation(pos, firstCard, 'right', () => {
            executePlayCard(activeTurnIdx, firstCard, 'right');
            setTimeout(() => setOpponentDialogue(null), 1800);
          });
          return;
        }

        if (!ends) return;

        const playableOptions: { card: DominoCard; end: 'left' | 'right' }[] = [];
        bot.cards.forEach((c) => {
          if (c.leftVal === ends.leftEnd || c.rightVal === ends.leftEnd) {
            playableOptions.push({ card: c, end: 'left' });
          }
          if (c.leftVal === ends.rightEnd || c.rightVal === ends.rightEnd) {
            playableOptions.push({ card: c, end: 'right' });
          }
        });

        if (playableOptions.length > 0) {
          let chosen = playableOptions[0];

          if (difficulty === 'hard') {
            chosen = playableOptions.reduce((best, cur) => {
              const curWeight =
                cur.card.leftVal + cur.card.rightVal + (cur.card.leftVal === cur.card.rightVal ? 10 : 0);
              const bestWeight =
                best.card.leftVal + best.card.rightVal + (best.card.leftVal === best.card.rightVal ? 10 : 0);
              return curWeight > bestWeight ? cur : best;
            }, playableOptions[0]);
          } else if (difficulty === 'medium') {
            chosen = playableOptions[Math.floor(Math.random() * playableOptions.length)];
          }

          const happyLines = [
            { text: `Hahaha, cocok sekali! Pasang di ujung ${chosen.end === 'left' ? 'kiri' : 'kanan'}! 😎✨`, expr: '😎' },
            { text: 'Ketemu! Taktik matematikaku berhasil jalan! 🎯🎉', expr: '🎉' },
            { text: `Rasakan lemparanku ke sisi ${chosen.end === 'left' ? 'kiri' : 'kanan'}! ⚡`, expr: '🔥' },
            { text: 'Yes! Kartuku berkurang lagi, siap-siap kalah ya! ⭐', expr: '🥳' },
          ];
          const pickHappy = happyLines[Math.floor(Math.random() * happyLines.length)];

          setOpponentDialogue({
            playerIdx: activeTurnIdx,
            text: pickHappy.text,
            mood: 'happy',
            expression: pickHappy.expr,
          });
          sounds.playJoyfulChime();

          triggerThrowAnimation(pos, chosen.card, chosen.end, () => {
            executePlayCard(activeTurnIdx, chosen.card, chosen.end);
            setTimeout(() => setOpponentDialogue(null), 2000);
          });
        } else {
          const angryLines = [
            { text: 'Grrr! Gak ada kartu yang pas sama sekali! Sial, lewat (pass)! 😤💢', expr: '😤' },
            { text: 'Argh! Kenapa angkanya ditutup semua?! Buntu deh! 😡🔥', expr: '😡' },
            { text: 'Sialan! Gak ada jalan! Terpaksa pass dulu! 🤬💥', expr: '🤬' },
          ];
          const pickAngry = angryLines[Math.floor(Math.random() * angryLines.length)];

          setOpponentDialogue({
            playerIdx: activeTurnIdx,
            text: pickAngry.text,
            mood: 'angry',
            expression: pickAngry.expr,
          });
          sounds.playAngryGroan();

          setTimeout(() => {
            handlePassTurn();
            setTimeout(() => setOpponentDialogue(null), 1800);
          }, 1200);
        }
      });
    }, thinkingTotalSeconds * 1000);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(decisionTimer);
    };
  }, [
    activeTurnIdx,
    isHumanTurn,
    isPaused,
    showCatMiniGame,
    opponentWaitingMiniGame,
    matchEndState,
    boardChain,
    difficulty,
    getOpenEnds,
    executePlayCard,
    handlePassTurn,
    players,
  ]);

  const triggerThrowAnimation = (
    fromPos: 'left' | 'top' | 'right',
    card: DominoCard,
    targetEnd: 'left' | 'right',
    onComplete: () => void
  ) => {
    sounds.playWhooshThrow();
    setActiveThrowAnim({
      fromPosition: fromPos,
      card,
      targetEnd,
    });

    setTimeout(() => {
      setActiveThrowAnim(null);
      onComplete();
    }, 650);
  };

  const humanPlayer = players[0];
  const pLeft = players[1];
  const pTop = players[2];
  const pRight = players[3];

  const ends = getOpenEnds();
  const humanHasPlayable = humanPlayer?.cards.some((c) => canPlayCard(c));

  return (
    <div
      className={`relative w-full h-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b ${theme.bgGradient} p-2 md:p-3 select-none`}
    >
      {/* Top Bar: Match Info, Theme, Pause Button */}
      <div className="w-full flex items-center justify-between z-20 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-xs font-bold font-fun text-white flex items-center gap-1.5">
            <span className="text-base">{theme.badge.split(' ')[0]}</span>
            <span className="hidden sm:inline">{theme.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode: {difficulty === 'easy' ? 'Mudah' : difficulty === 'medium' ? 'Sedang' : 'Sulit'}</span>
          </div>
        </div>

        {/* Turn Indicator Banner & FPV Tag */}
        <div className="flex items-center gap-2">
          {matchEndState ? (
            <div className="text-xs font-black px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 flex items-center gap-2 shadow-lg animate-pulse">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>PEMBUKTIAN KARTU DI MEJA ({matchEndState.countdown}s)</span>
            </div>
          ) : (
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                Giliran:{' '}
                <strong className="text-white">
                  {isHumanTurn ? 'Kamu (Drag Kartumu!)' : currentPlayer?.name}
                </strong>
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>FPV Kasino</span>
          </div>
        </div>

        {/* Action Controls & Chat */}
        <div className="flex items-center gap-2">
          <InGameChat
            messages={chatMessages}
            onSendMessage={(text, isEmote) => {
              const human = players.find((p) => p.type === 'human');
              const newMsg: ChatMessage = {
                id: `msg_${Date.now()}`,
                senderId: human ? human.id : 'player_1',
                senderName: human ? human.name : 'Kamu',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isEmote,
              };
              setChatMessages((prev) => [...prev, newMsg]);
            }}
            playerName={humanPlayer.name}
          />

          <button
            onClick={() => {
              sounds.playClick();
              setIsPaused(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="Jeda Permainan / Buka Toko Skin"
          >
            <Pause className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Jeda &amp; Skin</span>
          </button>
        </div>
      </div>

      {/* 1 Card Alert Toast */}
      {oneCardAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black px-5 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-sm md:text-base animate-bounce">
          <AlertTriangle className="w-5 h-5 text-slate-950" />
          <span>{oneCardAlert.text}</span>
        </div>
      )}

      {/* Card Mismatch Alert Toast */}
      {mismatchAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs md:text-sm border-2 border-rose-300 animate-shake max-w-lg text-center">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
          <span>{mismatchAlert.text}</span>
        </div>
      )}

      {/* MULTIPLAYER / OPPONENT MINI-GAME WAITING MODAL OVERLAY */}
      {opponentWaitingMiniGame && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-2xl max-w-md animate-fadeIn">
            <span className="text-4xl animate-bounce inline-block">🐱</span>
            <h3 className="text-lg font-bold text-white mt-2">
              {opponentWaitingMiniGame.name} Sedang Bermain Mini Game Kucing!
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Setiap pemain berkesempatan bermain 1 kali saat menyisakan 3 kartu. Pemain lain harap menunggu sejenak...
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-500/40">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Menunggu pemain: {opponentWaitingMiniGame.countdown}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Opponent Top (Player 3) in FULL 3D */}
      <div className="w-full flex justify-center z-10 my-0.5">
        <PlayerAvatarPod3D
          player={pTop}
          isActive={activeTurnIdx === 2}
          position="top"
          dialogue={opponentDialogue?.playerIdx === 2 ? opponentDialogue : null}
          thinkingSeconds={activeTurnIdx === 2 ? botThinkingTimerSeconds : null}
          isRevealingAll={!!matchEndState}
        />
      </div>

      {/* Center Arena: Left Player (3D), Winding Looping Table, Right Player (3D), & CASINO DEALER */}
      <div className="w-full flex-1 grid grid-cols-12 items-center gap-2 relative my-1">
        {/* Left Player (Player 2) in FULL 3D */}
        <div className="col-span-2 md:col-span-3 flex justify-start items-center z-10 pl-1">
          <PlayerAvatarPod3D
            player={pLeft}
            isActive={activeTurnIdx === 1}
            position="left"
            dialogue={opponentDialogue?.playerIdx === 1 ? opponentDialogue : null}
            thinkingSeconds={activeTurnIdx === 1 ? botThinkingTimerSeconds : null}
            isRevealingAll={!!matchEndState}
          />
        </div>

        {/* Center Playing Surface: Dominoes in a Winding / Serpentine Loop (MELINGKAR) */}
        <div
          className="col-span-8 md:col-span-6 h-full min-h-[260px] md:min-h-[340px] rounded-3xl border-2 shadow-2xl flex flex-col items-center justify-between p-3 relative overflow-hidden backdrop-blur-xs transition-colors"
          style={{
            backgroundColor: theme.tableSurfaceColor,
            borderColor: theme.tableBorderColor,
          }}
        >
          {/* Real 3D Three.js Table Surface & Particles */}
          <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
            <DominoScene3D theme={theme} />
          </div>

          {/* Top Info: Open Ends Numbers or 10s Reveal Banner */}
          {matchEndState ? (
            <div className="w-full z-20 flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/90 border-2 border-amber-400 shadow-2xl animate-fadeIn text-center">
              <div className="text-amber-300 font-black text-xs md:text-sm flex items-center gap-1.5 uppercase">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Semua Pemain Membuka Sisa Kartu di Meja!</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Pemenang: <strong className="text-white">{matchEndState.winner.name}</strong> ({matchEndState.isDeadlock ? 'Kartu Paling Sedikit' : 'Kartu Habis'})
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-500/40">
                  Podium Pemenang 3D dalam {matchEndState.countdown}s...
                </span>
                <button
                  onClick={() => onGameOver(matchEndState.winner, matchEndState.finalPlayers, matchEndState.isDeadlock)}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Lihat Podium Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : ends ? (
            <div className="flex items-center gap-4 bg-slate-950/85 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 shadow-md z-20">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Ujung Kiri:</span>
                <span className="text-cyan-400 font-mono text-base font-extrabold px-2 py-0.5 bg-cyan-950 rounded-lg border border-cyan-500/40">
                  {ends.leftEnd}
                </span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Ujung Kanan:</span>
                <span className="text-indigo-400 font-mono text-base font-extrabold px-2 py-0.5 bg-indigo-950 rounded-lg border border-indigo-500/40">
                  {ends.rightEnd}
                </span>
              </span>
            </div>
          ) : (
            <div className="text-xs font-bold text-amber-300 bg-amber-950/70 px-3.5 py-1.5 rounded-full border border-amber-500/40 z-20 shadow-md">
              Tarik kartu apa saja ke tengah meja untuk membuka permainan!
            </div>
          )}

          {/* MELINGKAR (CIRCULAR / WINDING SERPENTINE) DOMINO CHAIN */}
          {/* No horizontal scrolling! Wrapped in a natural casino serpentine track */}
          <div className="w-full flex-1 flex items-center justify-center p-2 relative overflow-hidden">
            {boardChain.length === 0 ? (
              <div
                onDragOver={(e) => handleDragOver(e, 'center')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnZone(e, 'center')}
                className={`w-full max-w-md h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all ${
                  dragOverZone === 'center'
                    ? 'border-cyan-400 bg-cyan-950/50 scale-105 shadow-xl'
                    : 'border-slate-700 bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-1">🀄</div>
                <h4 className="text-sm font-bold text-white">Letakkan Kartu Pertama</h4>
                <p className="text-xs text-slate-400 text-center mt-1">
                  Drag kartu dari tanganmu dan lepas (drop) di tengah meja.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-center gap-1.5 md:gap-2 p-2 rounded-2xl bg-black/20 border border-white/5 max-h-[180px] md:max-h-[220px] overflow-hidden select-none">
                {boardChain.map((p, idx) => {
                  const isDouble = p.leftVal === p.rightVal;
                  const isLeftEnd = idx === 0;
                  const isRightEnd = idx === boardChain.length - 1;

                  return (
                    <div
                      key={`${p.card.id}_${idx}`}
                      className={`relative transition-all duration-200 transform hover:scale-105 ${
                        isLeftEnd
                          ? 'ring-2 ring-cyan-400 rounded-lg shadow-md shadow-cyan-500/40'
                          : ''
                      } ${
                        isRightEnd
                          ? 'ring-2 ring-indigo-400 rounded-lg shadow-md shadow-indigo-500/40'
                          : ''
                      }`}
                      title={`Diletakkan oleh ${p.placedBy}`}
                    >
                      <DominoTile
                        card={{
                          ...p.card,
                          leftVal: p.leftVal,
                          rightVal: p.rightVal,
                          isSolved: true,
                        }}
                        orientation={isDouble ? 'vertical' : 'horizontal'}
                        size="sm"
                        borderColor={theme.dominoBorderColor}
                      />
                      {isLeftEnd && (
                        <span className="absolute -top-2 -left-1 px-1 rounded bg-cyan-500 text-slate-950 text-[8px] font-black uppercase shadow-xs">
                          Kiri
                        </span>
                      )}
                      {isRightEnd && (
                        <span className="absolute -top-2 -right-1 px-1 rounded bg-indigo-500 text-white text-[8px] font-black uppercase shadow-xs">
                          Kanan
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INTERACTIVE DRAG & DROP ZONES (LEFT & RIGHT) */}
          {boardChain.length > 0 && ends && isHumanTurn && !matchEndState && (
            <div className="w-full grid grid-cols-2 gap-3 z-20 pt-1">
              {/* Left End Drop Target */}
              <div
                onDragOver={(e) => handleDragOver(e, 'left')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnZone(e, 'left')}
                onClick={() => handleZoneClick('left')}
                className={`py-2 px-3 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  dragOverZone === 'left'
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-lg shadow-cyan-500/30 scale-102 ring-2 ring-cyan-400'
                    : 'border-cyan-500/40 bg-slate-950/70 hover:bg-slate-900/90 hover:border-cyan-400'
                }`}
              >
                <CornerDownLeft className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-cyan-300 truncate">
                    Drop ke Sisi Kiri
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Cocokkan angka: <strong className="text-white">{ends.leftEnd}</strong>
                  </div>
                </div>
              </div>

              {/* Right End Drop Target */}
              <div
                onDragOver={(e) => handleDragOver(e, 'right')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnZone(e, 'right')}
                onClick={() => handleZoneClick('right')}
                className={`py-2 px-3 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  dragOverZone === 'right'
                    ? 'border-indigo-400 bg-indigo-950/80 shadow-lg shadow-indigo-500/30 scale-102 ring-2 ring-indigo-400'
                    : 'border-indigo-500/40 bg-slate-950/70 hover:bg-slate-900/90 hover:border-indigo-400'
                }`}
              >
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-indigo-300 truncate">
                    Drop ke Sisi Kanan
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Cocokkan angka: <strong className="text-white">{ends.rightEnd}</strong>
                  </div>
                </div>
                <CornerDownRight className="w-4 h-4 text-indigo-400 shrink-0" />
              </div>
            </div>
          )}

          {/* Opponent Flying Card Throw Animation Element */}
          {activeThrowAnim && (
            <div
              className={`absolute pointer-events-none z-30 transition-all duration-500 ease-out ${
                activeThrowAnim.fromPosition === 'top'
                  ? 'top-4 left-1/2 -translate-x-1/2 animate-throwFromTop'
                  : activeThrowAnim.fromPosition === 'left'
                  ? 'left-4 top-1/2 -translate-y-1/2 animate-throwFromLeft'
                  : 'right-4 top-1/2 -translate-y-1/2 animate-throwFromRight'
              }`}
            >
              <div className="scale-110 shadow-2xl transform rotate-12">
                <DominoTile
                  card={{ ...activeThrowAnim.card, isSolved: true }}
                  orientation="vertical"
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Player (Player 4) in FULL 3D & CASINO DEALER PEDESTAL */}
        <div className="col-span-2 md:col-span-3 flex flex-col md:flex-row justify-end items-center gap-3 z-10 pr-1">
          {/* ELEGANT CASINO DEALER / CROUPIER PEDESTAL */}
          <div className="hidden lg:flex flex-col items-center p-2 rounded-2xl bg-slate-950/85 border-2 border-amber-500/50 shadow-2xl backdrop-blur-md w-34 shrink-0 relative">
            <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-amber-400/40 shadow-inner">
              <img
                src={casinoDealerImg}
                alt="Croupier Pelayan Kasino"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1 text-center">
                <span className="text-[9px] font-black tracking-wider text-amber-300 uppercase">
                  Croupier Kasino
                </span>
              </div>
            </div>

            <div className="mt-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-semibold text-center leading-tight">
              {matchEndState
                ? 'Semua pemain silakan buka sisa kartu di meja! 🀄'
                : opponentWaitingMiniGame
                ? 'Pemain sedang di ruang bonus kucing... 🐾'
                : isHumanTurn
                ? 'Giliran Anda, letakkan kartu yang cocok 🎲'
                : 'Pemain sedang memikirkan langkah aljabar... 💭'}
            </div>
          </div>

          <PlayerAvatarPod3D
            player={pRight}
            isActive={activeTurnIdx === 3}
            position="right"
            dialogue={opponentDialogue?.playerIdx === 3 ? opponentDialogue : null}
            thinkingSeconds={activeTurnIdx === 3 ? botThinkingTimerSeconds : null}
            isRevealingAll={!!matchEndState}
          />
        </div>
      </div>

      {/* Human Player Hand Area (Bottom) with FIRST PERSON 3D VIEW */}
      <div className="w-full bg-slate-950/95 border border-slate-800 rounded-3xl p-3 backdrop-blur-md z-20 flex flex-col items-center gap-1.5 shadow-2xl relative">
        {/* FIRST PERSON VIEW 3D ARMS & HANDS REACHING ONTO TABLE */}
        <div className="w-full -mt-2">
          <PlayerFirstPerson3D
            avatar={humanPlayer.avatar}
            isHumanTurn={isHumanTurn}
            isDragging={!!draggedCard}
            className="w-full h-16 md:h-20"
          />
        </div>

        {/* Hand Status Bar */}
        <div className="w-full flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>{humanPlayer.name} (Kamu)</span>
            </span>
            <span className="text-slate-400">
              Sisa Kartu: <strong className="text-cyan-400 font-mono text-sm">{humanPlayer.cards.length}</strong>
              {matchEndState && (
                <span className="ml-2 text-amber-300 font-semibold">
                  (Total Pips: {humanPlayer.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0)})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isHumanTurn && !humanHasPlayable && boardChain.length > 0 && !matchEndState && (
              <button
                onClick={handlePassTurn}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Tidak Ada Kartu Cocok (Lewat / Pass)</span>
              </button>
            )}

            {isHumanTurn && !matchEndState && (
              <span className="text-cyan-300 font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilih &amp; drag kartumu ke ujung meja</span>
              </span>
            )}
          </div>
        </div>

        {/* Hand Cards List - Real physical domino tiles! */}
        <div className="w-full flex items-center justify-center gap-2.5 overflow-x-auto py-1 no-scrollbar min-h-[110px]">
          {humanPlayer.cards.length === 0 ? (
            <div className="py-4 px-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-black text-sm flex items-center gap-2 animate-bounce">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>KARTU HABIS BERSIH! KAMU BERHASIL MENGHABISKAN SEMUA KARTU!</span>
            </div>
          ) : (
            humanPlayer.cards.map((card) => {
              const isSelected = selectedHandCard?.id === card.id;

              return (
                <div key={card.id} className="relative group">
                  <DominoTile
                    card={{ ...card, isSolved: true }}
                    orientation="vertical"
                    size="md"
                    isSelected={isSelected}
                    isDraggable={isHumanTurn && !matchEndState}
                    onDragStart={(e) => handleDragStart(e, card)}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cat Mini Game Modal (triggers when human reaches 3 cards, exactly 1 chance for 60s) */}
      {showCatMiniGame && (
        <CatMiniGame
          onClose={(earnedCoins) => {
            setShowCatMiniGame(false);
            if (earnedCoins > 0) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `cat_win_${Date.now()}`,
                  senderId: humanPlayer.id,
                  senderName: humanPlayer.name,
                  text: '🐱 Menang mini game kucing 4x4! Dapat +200 koin!',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          }}
        />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onOpenShop={() => {
            setIsPaused(false);
            onOpenShop();
          }}
          onQuitToLobby={onQuitToLobby}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}
    </div>
  );
};

/**
 * Visual Pod for Player Avatars rendering FULL 3D CHARACTER MODEL with
 * dynamic expressions (Bingung, Marah, Senang) and Open Hand Cards on reveal!
 */
const PlayerAvatarPod3D: React.FC<{
  player: Player;
  isActive: boolean;
  position: 'top' | 'left' | 'right';
  dialogue?: OpponentDialogueState | null;
  thinkingSeconds?: number | null;
  isRevealingAll?: boolean;
}> = ({ player, isActive, position, dialogue, thinkingSeconds, isRevealingAll }) => {
  const mood = dialogue?.mood || 'neutral';

  let moodBorder = 'border-slate-800 bg-slate-900/80';

  if (mood === 'angry') {
    moodBorder = 'border-rose-500 bg-rose-950/70 ring-4 ring-rose-500/40 animate-shake';
  } else if (mood === 'happy') {
    moodBorder = 'border-emerald-400 bg-emerald-950/70 ring-4 ring-emerald-400/40';
  } else if (mood === 'confused' || mood === 'thinking') {
    moodBorder = 'border-amber-400 bg-amber-950/70 ring-4 ring-amber-400/30';
  } else if (isActive) {
    moodBorder = 'border-cyan-400 bg-cyan-950/80 ring-4 ring-cyan-400/30';
  }

  const pipsSum = player.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0);

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 rounded-3xl transition-all duration-300 border-2 shadow-2xl backdrop-blur-md ${moodBorder} ${
        position === 'top' ? 'w-56' : 'w-32 md:w-44'
      }`}
    >
      {/* Dialogue Speech Bubble */}
      {dialogue && !isRevealingAll && (
        <div
          className={`absolute z-30 max-w-[230px] text-xs font-bold px-3.5 py-2 rounded-2xl shadow-2xl border flex items-center gap-2 whitespace-normal text-left ${
            dialogue.mood === 'angry'
              ? 'bg-rose-950 text-rose-100 border-rose-400 animate-bounce'
              : dialogue.mood === 'happy'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-400 animate-bounce'
              : 'bg-slate-900 text-amber-100 border-amber-400'
          } ${
            position === 'top'
              ? '-bottom-14'
              : position === 'left'
              ? '-top-12 left-4 md:left-10'
              : '-top-12 right-4 md:right-10'
          }`}
        >
          <span className="text-xl shrink-0">{dialogue.expression}</span>
          <div className="leading-tight text-[11px]">{dialogue.text}</div>
        </div>
      )}

      {/* Passed Banner */}
      {player.isPassed && !isRevealingAll && (
        <div className="absolute inset-0 bg-rose-950/95 rounded-3xl flex flex-col items-center justify-center text-xs font-black text-rose-300 border-2 border-rose-500 animate-fadeIn z-30">
          <span>LEWAT (PASS)</span>
          <span className="text-base mt-0.5">😤💢</span>
        </div>
      )}

      {/* REAL 3D OPPONENT AVATAR CHARACTER */}
      <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative overflow-visible">
        <Avatar3DViewer
          avatar={player.avatar}
          className="w-full h-full"
          interactive={false}
        />

        {/* Floating Expression Badges */}
        {mood === 'angry' && !isRevealingAll && (
          <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-full shadow-lg border border-rose-300 animate-bounce">
            <span>😤 MARAH</span>
          </div>
        )}
        {mood === 'happy' && !isRevealingAll && (
          <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full shadow-lg border border-emerald-300 animate-bounce">
            <span>😎 SENANG</span>
          </div>
        )}
        {(mood === 'confused' || mood === 'thinking') && !isRevealingAll && (
          <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full shadow-lg border border-amber-300 animate-pulse">
            <span>🤔 BINGUNG</span>
          </div>
        )}
      </div>

      {/* Name, Card Count, & 10s Reveal Display on Table */}
      <div className="text-center mt-0.5 w-full overflow-hidden">
        <div className="text-xs font-bold text-white truncate px-1 flex items-center justify-center gap-1">
          <span>{player.name}</span>
        </div>

        <div className="text-[10px] text-cyan-300 font-semibold flex items-center justify-center gap-1.5 mt-0.5">
          <span>🀄 {player.cards.length} kartu</span>
          {isRevealingAll && <span className="text-amber-300 font-mono">({pipsSum} pips)</span>}
        </div>

        {/* Sisa kartu yang terbuka langsung di meja pada saat 10s reveal */}
        {isRevealingAll && (
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 max-w-[170px] mx-auto p-1 bg-black/40 rounded-xl border border-white/10">
            {player.cards.length === 0 ? (
              <span className="text-[9px] font-black text-emerald-400">HABIS (0 KARTU) 👑</span>
            ) : (
              player.cards.map((c, cIdx) => (
                <div key={`${c.id}_${cIdx}`} className="scale-75 -m-1">
                  <DominoTile
                    card={{ ...c, isSolved: true }}
                    orientation="vertical"
                    size="sm"
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* 5-8 Second Thinking Timer Badge */}
        {isActive && thinkingSeconds && !isRevealingAll && (
          <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Sedang Berpikir ({thinkingSeconds} dtk)...</span>
          </div>
        )}
      </div>
    </div>
  );
};
