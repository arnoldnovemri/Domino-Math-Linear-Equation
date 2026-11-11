import React, { useState, useEffect } from 'react';
import { sounds } from '../services/soundEffects';
import { addCoins, updateStats } from '../services/storage';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Clock, X, Heart } from 'lucide-react';

interface Props {
  onClose: (earnedCoins: number) => void;
}

interface CatCard {
  id: number;
  catType: string;
  name: string;
  emoji: string;
  bgGradient: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// 8 distinct cat breeds/characters for 8 pairs in 4x4 grid (16 cards total)
const CAT_TYPES = [
  { type: 'oren', name: 'Kucing Oren', emoji: '🐈', bg: 'from-amber-400 to-orange-500' },
  { type: 'calico', name: 'Kucing Calico', emoji: '🐱', bg: 'from-rose-400 to-pink-500' },
  { type: 'siam', name: 'Kucing Siam', emoji: '😺', bg: 'from-sky-400 to-blue-500' },
  { type: 'hitam', name: 'Kucing Hitam', emoji: '🐈‍⬛', bg: 'from-purple-600 to-slate-900' },
  { type: 'putih', name: 'Putih Persia', emoji: '🤍', bg: 'from-slate-100 to-slate-300' },
  { type: 'belang', name: 'Belang Tabby', emoji: '🐅', bg: 'from-emerald-400 to-teal-600' },
  { type: 'manx', name: 'Manx Manja', emoji: '😻', bg: 'from-violet-400 to-fuchsia-600' },
  { type: 'cyber', name: 'Mecha Cyber', emoji: '🤖', bg: 'from-cyan-400 to-indigo-600' },
];

export const CatMiniGame: React.FC<Props> = ({ onClose }) => {
  const generateDeck = () => {
    const list: CatCard[] = [];
    let idCounter = 0;
    CAT_TYPES.forEach((cat) => {
      // 2 cards per cat type = 8 pairs = 16 cards total (4x4)
      for (let i = 0; i < 2; i++) {
        list.push({
          id: idCounter++,
          catType: cat.type,
          name: cat.name,
          emoji: cat.emoji,
          bgGradient: cat.bg,
          isFlipped: false,
          isMatched: false,
        });
      }
    });
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const [cards, setCards] = useState<CatCard[]>(generateDeck);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60); // Exactly 1 minute (60 seconds)
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Timer countdown: 60 seconds (1 minute), strictly 1 chance only
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Card Flip Handler
  const handleCardClick = (cardId: number) => {
    if (isChecking || gameOver) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    sounds.playCatMeow();

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === cardId);

      if (firstCard && secondCard && firstCard.catType === secondCard.catType) {
        // Matched!
        sounds.playCorrectDing();
        setTimeout(() => {
          const matchedCards = newCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          );
          setCards(matchedCards);
          setSelectedCards([]);
          setIsChecking(false);

          // Check if all 8 pairs are matched
          const allMatched = matchedCards.every((c) => c.isMatched);
          if (allMatched) {
            sounds.playVictory();
            sounds.playCoin();
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            addCoins(200);
            updateStats(false, true);
            setIsVictory(true);
            setGameOver(true);
          }
        }, 400);
      } else {
        // No match, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsChecking(false);
        }, 750);
      }
    }
  };

  const matchedPairsCount = cards.filter((c) => c.isMatched).length / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-3xl p-5 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-indigo-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-fun text-white">
                Mini Game: 4x4 Tebak Gambar Kucing (1 Menit)
              </h3>
              <p className="text-[11px] text-indigo-300">
                Cocokkan 8 pasang kucing dalam 1 menit. Kesempatan hanya 1 kali (tidak ada pengulangan)!
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose(0)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Lewati Mini Game"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between py-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-colors ${
              timeLeft <= 10
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
                : 'bg-indigo-950/80 border-indigo-500/40 text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Waktu: {timeLeft} Detik</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              Kesempatan: 1x Saja
            </span>
            <div className="flex items-center gap-1 text-xs text-indigo-300 font-bold">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>
                {matchedPairsCount} / 8 Pasang
              </span>
            </div>
          </div>
        </div>

        {/* Game Grid: EXACT 4x4 (16 cards total) */}
        {!gameOver ? (
          <div className="grid grid-cols-4 gap-2.5 my-2 w-full max-w-md mx-auto">
            {cards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-18 md:h-20 rounded-2xl cursor-pointer transition-all duration-300 transform flex items-center justify-center select-none shadow-lg border-2 ${
                    showFace
                      ? `bg-gradient-to-br ${card.bgGradient} border-white scale-100`
                      : 'bg-slate-800 border-slate-700 hover:border-indigo-400 hover:scale-105 active:scale-95'
                  } ${card.isMatched ? 'opacity-90 ring-2 ring-emerald-400 shadow-emerald-500/30' : ''}`}
                >
                  {showFace ? (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-2xl md:text-3xl animate-bounce">{card.emoji}</span>
                      <span className="text-[9px] font-bold text-white drop-shadow-sm line-clamp-1 px-1">
                        {card.name.split(' ')[1] || card.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <span className="text-xl md:text-2xl opacity-70">🐾</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            {isVictory ? (
              <div className="space-y-3">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-1">
                  <Trophy className="w-12 h-12" />
                </div>
                <h4 className="text-2xl font-bold font-fun text-white">
                  Luar Biasa! 8 Pasang Kucing Berhasil Cocok!
                </h4>
                <p className="text-xs md:text-sm text-indigo-200">
                  Kamu berhasil menuntaskan tantangan memori 4x4 dalam 1 menit!
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-lg shadow-lg">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>+200 Koin Berhasil Ditambahkan!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl mb-1">⏰</div>
                <h4 className="text-xl font-bold font-fun text-white">
                  Waktu 1 Menit Habis!
                </h4>
                <p className="text-xs md:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Kesempatan bermain mini game ini hanya 1 kali saja tanpa pengulangan. Kamu mencocokkan {matchedPairsCount} dari 8 pasang kucing.
                </p>
                <p className="text-[11px] text-amber-300 font-semibold">
                  Ayo kembali dan fokus menangkan pertandingan kartu domino kamu!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions: Strictly No Retry Button */}
        <div className="mt-auto pt-3 border-t border-indigo-500/30 flex items-center justify-between">
          <button
            onClick={() => onClose(0)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
          >
            Tutup Mini Game
          </button>

          {gameOver && (
            <button
              onClick={() => onClose(isVictory ? 200 : 0)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-transform active:scale-95 cursor-pointer"
            >
              Lanjutkan Domino
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
