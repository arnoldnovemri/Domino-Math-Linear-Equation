import { useState, useEffect } from 'react';
import {
  AvatarConfig,
  GameDifficulty,
  GameMode,
  GamePhase,
  Player,
  DominoCard,
} from './types/game';
import { ARENA_THEMES, ArenaTheme } from './types/themes';
import {
  getUserProfile,
  getUserCoins,
  saveUserProfile,
  updateStats,
  addCoins,
} from './services/storage';
import { sounds } from './services/soundEffects';
import { generateFullDominoDeck, dealCardsToPlayers } from './utils/dominoMath';
import { FallingDominoesBackground } from './components/FallingDominoesBackground';
import { ProfileAvatarPage } from './components/pages/ProfileAvatarPage';
import { RoomSelectionPage } from './components/pages/RoomSelectionPage';
import { DifficultyPage } from './components/pages/DifficultyPage';
import { ThemeSelectionPage } from './components/pages/ThemeSelectionPage';
import { MathSolvePhase } from './components/MathSolvePhase';
import { DominoTable } from './components/DominoTable';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { Play, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: AvatarConfig }>(
    getUserProfile()
  );
  const [coins, setCoins] = useState<number>(getUserCoins());
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMute());

  // Match setup configurations
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [selectedTheme, setSelectedTheme] = useState<ArenaTheme>(ARENA_THEMES[0]);
  const [multiplayerRoomPlayers, setMultiplayerRoomPlayers] = useState<Player[] | undefined>(undefined);

  // Active game match state
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [gameOverData, setGameOverData] = useState<{
    winner: Player;
    players: Player[];
    isDeadlock: boolean;
  } | null>(null);

  // Modals
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Audio Toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMute(next);
  };

  // Start from Intro to Page 1: Profile & Avatar
  const handleEnterLobby = () => {
    sounds.playClick();
    sounds.startBGM();
    setPhase('profile');
  };

  // Start Match Handler
  const handleStartMatch = () => {
    sounds.playClick();

    // 1. Generate 28 dominoes with linear equations
    const deck = generateFullDominoDeck();
    const hands = dealCardsToPlayers(deck);

    // 2. Prepare 4 players
    let playersList: Player[] = [];

    if (gameMode === 'multiplayer' && multiplayerRoomPlayers && multiplayerRoomPlayers.length === 4) {
      playersList = multiplayerRoomPlayers.map((p, idx) => ({
        ...p,
        cards: hands[idx],
      }));
    } else {
      // Human + 3 Smart Bots
      const botNames = ['Budi Aljabar', 'Siti Gauss', 'Arya Archimedes'];
      playersList = [
        {
          id: 'player_human',
          name: userProfile.name,
          avatar: userProfile.avatar,
          type: 'human',
          cards: hands[0],
          score: 0,
          isReady: true,
          coins,
          rankPoints: 1200,
        },
        ...botNames.map((name, idx) => ({
          id: `bot_${idx + 1}`,
          name,
          avatar: {
            ...userProfile.avatar,
            skinColor: ['#fed7aa', '#f87171', '#38bdf8'][idx],
            hairColor: ['#ef4444', '#10b981', '#f59e0b'][idx],
            headwear: (['headset', 'tophat', 'visor'] as const)[idx],
          },
          type: 'ai' as const,
          cards: hands[idx + 1].map((c) => ({
            ...c,
            isSolved: true, // Bots auto-solve their equations
          })),
          score: 0,
          isReady: true,
          coins: 200,
          rankPoints: 1100 + idx * 75,
        })),
      ];
    }

    setActivePlayers(playersList);
    setPhase('solving');
  };

  // When human player finishes solving equations on their 7 cards
  const handleAllCardsSolved = (solvedCards: DominoCard[]) => {
    sounds.playCorrectDing();
    setActivePlayers((prev) => {
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        cards: solvedCards,
      };
      return updated;
    });
    setPhase('playing');
  };

  // Game Over Handler
  const handleGameOver = (
    winner: Player,
    finalPlayers: Player[],
    isDeadlock: boolean
  ) => {
    sounds.stopTenseBGM();
    sounds.playVictory();

    const isHumanWin = winner.type === 'human';
    if (isHumanWin) {
      addCoins(200);
      setCoins(getUserCoins());
    }
    updateStats(isHumanWin);

    setGameOverData({
      winner,
      players: finalPlayers,
      isDeadlock,
    });
    setPhase('gameover');
  };

  // Save profile & avatar
  const handleSaveProfile = (name: string, updatedAvatar: AvatarConfig) => {
    setUserProfile({ name, avatar: updatedAvatar });
    saveUserProfile(name, updatedAvatar);
    setCoins(getUserCoins());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sounds.stopBGM();
      sounds.stopTenseBGM();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between overflow-x-hidden font-sans">
      {/* PHASE 0: INTRO WELCOME SCREEN */}
      {phase === 'intro' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden">
          <FallingDominoesBackground />

          {/* Top Mute Button */}
          <div className="absolute top-5 right-5 z-20">
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 shadow-lg transition-transform active:scale-95 backdrop-blur-md"
              title={isMuted ? 'Nyalakan Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Hero Center */}
          <div className="relative z-10 max-w-2xl text-center space-y-6 animate-float">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 text-xs md:text-sm font-bold shadow-lg shadow-indigo-500/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Game Kartu Domino Matematika 3D Real-Time</span>
            </div>

            <div className="relative">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-fun tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-500 drop-shadow-2xl">
                Domino Math
              </h1>
              <div className="text-sm md:text-lg text-indigo-200/90 font-medium max-w-lg mx-auto mt-3 leading-relaxed">
                Pecahkan persamaan linear 1 variabel, pasangkan kartu domino di meja 3D, dan raih posisi teratas di peringkat global!
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800">
                🀄 28 Kartu Domino Aljabar
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800">
                🎮 Lawan AI &amp; Ruang Pribadi 4 Pemain
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800">
                🐱 Mini Game Kucing Berhadiah Koin
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800">
                ✨ Kustomisasi Avatar 3D
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleEnterLobby}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black font-fun text-lg md:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-slate-950" />
                <span>Mulai Bermain</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowLeaderboard(true);
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold font-fun text-base flex items-center justify-center gap-2 shadow-lg backdrop-blur-md transition-transform hover:scale-102"
              >
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Peringkat Global</span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 text-center text-xs text-slate-500 z-10">
            Dibuat untuk pembelajaran matematika interaktif &amp; kompetisi domino 3D
          </div>
        </div>
      )}

      {/* HALAMAN 1: PROFIL & KUSTOMISASI AVATAR 3D */}
      {phase === 'profile' && (
        <ProfileAvatarPage
          initialName={userProfile.name}
          initialAvatar={userProfile.avatar}
          coins={coins}
          onNext={(name, updatedAvatar) => {
            handleSaveProfile(name, updatedAvatar);
            setPhase('room');
          }}
          onOpenShop={() => setShowCustomizer(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* HALAMAN 2: PEMILIHAN RUANGAN & MODE BERMAIN */}
      {phase === 'room' && (
        <RoomSelectionPage
          playerName={userProfile.name}
          avatar={userProfile.avatar}
          coins={coins}
          selectedMode={gameMode}
          onSelectMode={(mode, customPlayers) => {
            setGameMode(mode);
            setMultiplayerRoomPlayers(customPlayers);
          }}
          onBack={() => setPhase('profile')}
          onNext={() => setPhase('difficulty')}
        />
      )}

      {/* HALAMAN 3: PEMILIHAN LEVEL KESULITAN */}
      {phase === 'difficulty' && (
        <DifficultyPage
          initialDifficulty={difficulty}
          onSelectDifficulty={(diff) => setDifficulty(diff)}
          onBack={() => setPhase('room')}
          onNext={() => setPhase('theme')}
        />
      )}

      {/* HALAMAN 4: PEMILIHAN TEMPAT / PETA BERGELOMBANG VISUAL */}
      {phase === 'theme' && (
        <ThemeSelectionPage
          initialTheme={selectedTheme}
          onSelectTheme={(th) => setSelectedTheme(th)}
          onBack={() => setPhase('difficulty')}
          onStartMatch={handleStartMatch}
        />
      )}

      {/* HALAMAN 5: FASE PEMECAHAN PERSAMAAN LINEAR PADA 7 KARTU */}
      {phase === 'solving' && activePlayers.length > 0 && (
        <MathSolvePhase
          player={activePlayers[0]}
          onAllCardsSolved={handleAllCardsSolved}
          arenaThemeName={selectedTheme.name}
        />
      )}

      {/* HALAMAN 6: MEJA PERMAINAN DOMINO 3D */}
      {phase === 'playing' && activePlayers.length === 4 && (
        <DominoTable
          players={activePlayers}
          theme={selectedTheme}
          difficulty={difficulty}
          onGameOver={handleGameOver}
          onOpenShop={() => setShowCustomizer(true)}
          onQuitToLobby={() => {
            sounds.playClick();
            sounds.stopTenseBGM();
            sounds.startBGM();
            setPhase('profile');
          }}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* HALAMAN 7: RINGKASAN HASIL PERTANDINGAN (GAME OVER) */}
      {phase === 'gameover' && gameOverData && (
        <GameOverModal
          winner={gameOverData.winner}
          players={gameOverData.players}
          isDeadlock={gameOverData.isDeadlock}
          onPlayAgain={() => {
            handleStartMatch();
          }}
          onOpenShop={() => setShowCustomizer(true)}
          onQuitToLobby={() => {
            sounds.playClick();
            sounds.stopTenseBGM();
            sounds.startBGM();
            setPhase('profile');
          }}
        />
      )}

      {/* Global Avatar Customizer & Skin Shop Modal */}
      {showCustomizer && (
        <AvatarCustomizerModal
          initialAvatar={userProfile.avatar}
          initialName={userProfile.name}
          onSave={handleSaveProfile}
          onClose={() => {
            setShowCustomizer(false);
            setCoins(getUserCoins());
          }}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
