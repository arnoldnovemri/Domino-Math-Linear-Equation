import React, { useState } from 'react';
import { DominoCard, Player } from '../types/game';
import { sounds } from '../services/soundEffects';
import { getUserCoins, addCoins } from '../services/storage';
import {
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Coins,
  Send,
  AlertOctagon,
  Check,
} from 'lucide-react';

interface Props {
  player: Player;
  onAllCardsSolved: (solvedCards: DominoCard[]) => void;
  arenaThemeName: string;
}

export const MathSolvePhase: React.FC<Props> = ({
  player,
  onAllCardsSolved,
  arenaThemeName,
}) => {
  const [cards, setCards] = useState<DominoCard[]>(player.cards);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);
  const [currentSide, setCurrentSide] = useState<'left' | 'right'>('left');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [hint, setHint] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [coinNotification, setCoinNotification] = useState<string | null>(null);

  // Remaining mistakes limit: 3 maximum per equation
  const [mistakesLeft, setMistakesLeft] = useState<number>(3);
  const [coins, setCoins] = useState<number>(getUserCoins());

  const currentCard = cards[selectedCardIdx];
  const totalSolved = cards.filter((c) => c.isSolved).length;
  const allSolved = totalSolved === cards.length;

  // Process user answer submission (direct input, not multiple choice)
  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCard || inputAnswer.trim() === '') return;

    setErrorFeedback(null);
    setHint(null);

    const parsedGuess = parseInt(inputAnswer.trim(), 10);
    if (isNaN(parsedGuess)) {
      setErrorFeedback('Masukkan angka bilangan bulat yang valid.');
      return;
    }

    const isLeftSide = currentSide === 'left';
    const targetVal = isLeftSide ? currentCard.leftVal : currentCard.rightVal;

    if (parsedGuess === targetVal) {
      // Correct!
      sounds.playCorrectDing();
      const updatedCards = [...cards];
      const card = { ...updatedCards[selectedCardIdx] };

      if (isLeftSide) {
        card.leftAnswer = parsedGuess;
        if (card.rightAnswer !== undefined) {
          card.isSolved = true;
        } else {
          setCurrentSide('right');
        }
      } else {
        card.rightAnswer = parsedGuess;
        if (card.leftAnswer !== undefined) {
          card.isSolved = true;
        } else {
          setCurrentSide('left');
        }
      }

      updatedCards[selectedCardIdx] = card;
      setCards(updatedCards);
      setInputAnswer('');
      setMistakesLeft(3); // Reset mistakes for next side

      // If card solved, automatically move to next unsolved card
      if (card.isSolved) {
        const nextUnsolved = updatedCards.findIndex((c) => !c.isSolved);
        if (nextUnsolved !== -1) {
          setSelectedCardIdx(nextUnsolved);
          setCurrentSide(
            updatedCards[nextUnsolved].leftAnswer === undefined ? 'left' : 'right'
          );
        }
      }
    } else {
      // WRONG ANSWER: Deduct coin and reduce mistake attempts
      const newMistakes = mistakesLeft - 1;
      setMistakesLeft(newMistakes);

      // Penalty: deduct 20 coins
      const updatedCoins = addCoins(-20);
      setCoins(updatedCoins);
      sounds.playWrongBuzz();
      sounds.playCoinLoss();

      setCoinNotification('-20 Koin (Jawaban Salah)');
      setTimeout(() => setCoinNotification(null), 2500);

      if (newMistakes <= 0) {
        // Max 3 mistakes reached: reveal with explanation & extra penalty
        const finalCoins = addCoins(-30);
        setCoins(finalCoins);
        setErrorFeedback(
          `Batas 3 kali salah tercapai! Koin berkurang total -50. Solusi yang benar adalah x = ${targetVal}. Sisi ini dibuka otomatis.`
        );

        // Auto unlock this side
        const updatedCards = [...cards];
        const card = { ...updatedCards[selectedCardIdx] };
        if (isLeftSide) {
          card.leftAnswer = targetVal;
          if (card.rightAnswer !== undefined) {
            card.isSolved = true;
          } else {
            setCurrentSide('right');
          }
        } else {
          card.rightAnswer = targetVal;
          if (card.leftAnswer !== undefined) {
            card.isSolved = true;
          } else {
            setCurrentSide('left');
          }
        }
        updatedCards[selectedCardIdx] = card;
        setCards(updatedCards);
        setInputAnswer('');
        setMistakesLeft(3);
      } else {
        setErrorFeedback(
          `Jawaban x = ${parsedGuess} salah! Koin kamu berkurang -20. Sisa kesempatan salah: ${newMistakes} kali.`
        );
      }
    }
  };

  const handleShowHint = () => {
    sounds.playClick();
    const equation =
      currentSide === 'left' ? currentCard.leftEquation : currentCard.rightEquation;
    setHint(
      `Petunjuk: Pindahkan semua suku yang memiliki x ke ruas kiri dan konstanta ke ruas kanan. Persamaan: ${equation}`
    );
  };

  // Skip All Equations by Exchanging 600 Coins
  const handleSkipWithCoins = () => {
    if (coins >= 600) {
      sounds.playCoin();
      sounds.playExclusiveSparkle();
      const updatedCoins = addCoins(-600);
      setCoins(updatedCoins);

      const allSolvedCards = cards.map((c) => ({
        ...c,
        leftAnswer: c.leftVal,
        rightAnswer: c.rightVal,
        isSolved: true,
      }));
      setCards(allSolvedCards);
      setErrorFeedback(null);
      setHint(null);
      setCoinNotification('-600 Koin (Buka Instan Sukses!)');
      setTimeout(() => setCoinNotification(null), 3000);
    } else {
      sounds.playWrongBuzz();
      setErrorFeedback(
        `Koin tidak mencukupi untuk skip! Kamu membutuhkan 600 koin (Koinmu saat ini: ${coins} koin). Selesaikan persamaan manual atau menangkan koin di mini game kucing!`
      );
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-3 md:p-4 z-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="w-full text-center mb-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs shadow-sm">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>Fase Pemecahan Persamaan &bull; {arenaThemeName}</span>
          </div>

          {/* Current Coins display */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins} Koin</span>
          </div>

          {/* 600 Coins Skip Option Button */}
          {!allSolved && (
            <button
              type="button"
              onClick={handleSkipWithCoins}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-500/60 text-amber-300 text-xs font-black shadow-md shadow-amber-500/15 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Tukar 600 Koin untuk langsung membuka seluruh 7 kartu domino tanpa menghitung manual"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Buka Semua Kartu (Tukar 600 Koin)</span>
            </button>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold font-fun text-white tracking-wide">
          Buka Angka 7 Kartu Domino Asli
        </h2>
        <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto mt-1">
          Pecahkan persamaan linear untuk mengukir titik domino aslimu.
          Maksimal salah <strong className="text-rose-400">3 kali</strong>, koin berkurang jika salah jawab!
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mt-2.5">
          <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
            <span>Kartu Terbuka: {totalSolved} / {cards.length}</span>
            <span>{Math.round((totalSolved / cards.length) * 100)}% Siap</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${(totalSolved / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Solver Card Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
        {/* Left: 7 Realistic Domino Cards Deck Selector */}
        <div className="md:col-span-5 flex flex-col gap-2 bg-slate-900/90 p-3.5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-1 px-1">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🀄 7 Kartu Domino Kamu</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-semibold">
              Pilih kartu untuk dihitung
            </span>
          </div>

          {/* Cards Grid: Rendered as realistic authentic Dominoes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 max-h-[390px] overflow-y-auto pr-1">
            {cards.map((c, idx) => {
              const isSelected = idx === selectedCardIdx;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCardIdx(idx);
                    setCurrentSide(c.leftAnswer === undefined ? 'left' : 'right');
                    setErrorFeedback(null);
                    setHint(null);
                    setInputAnswer('');
                    setMistakesLeft(3);
                  }}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center relative select-none ${
                    isSelected
                      ? 'bg-cyan-950/60 ring-3 ring-cyan-400 shadow-xl shadow-cyan-500/25 scale-[1.03]'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-1 font-bold">
                    <span># {idx + 1}</span>
                    {c.isSolved && (
                      <span className="text-emerald-400 flex items-center gap-0.5 text-[9px] font-black uppercase">
                        <Check className="w-3 h-3" /> Siap
                      </span>
                    )}
                  </div>

                  {/* Real Physical Ivory Domino Tile Preview */}
                  <div className="relative w-16 h-30 rounded-xl bg-gradient-to-b from-[#fffdf9] via-[#f7f2e7] to-[#e4dbc6] shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_1.5px_1.5px_rgba(255,255,255,0.9),inset_0_-1.5px_1.5px_rgba(0,0,0,0.2)] border-2 border-[#d5ccb6] flex flex-col overflow-hidden">
                    {/* Top Half */}
                    <div className="flex-1 flex items-center justify-center p-1 relative border-b border-[#cfc6b2]">
                      {c.leftAnswer !== undefined ? (
                        <AuthenticDominoPips count={c.leftAnswer} size="sm" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] font-mono font-black text-indigo-900 leading-tight px-0.5">
                            {c.leftEquation}
                          </span>
                          <span className="text-[8px] text-indigo-600 font-bold mt-0.5 animate-pulse">
                            ?
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle Divider Groove & Brass Spinner Pin */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-[#b2a58b] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-700 via-amber-300 to-yellow-100 border border-amber-800 shadow-sm pointer-events-none z-10" />

                    {/* Bottom Half */}
                    <div className="flex-1 flex items-center justify-center p-1 relative">
                      {c.rightAnswer !== undefined ? (
                        <AuthenticDominoPips count={c.rightAnswer} size="sm" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] font-mono font-black text-purple-900 leading-tight px-0.5">
                            {c.rightEquation}
                          </span>
                          <span className="text-[8px] text-purple-600 font-bold mt-0.5 animate-pulse">
                            ?
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Value tag underneath */}
                  <div className="mt-1.5 text-center font-mono text-[11px] font-extrabold text-slate-300">
                    {c.leftAnswer !== undefined ? c.leftAnswer : '?'}{' '}
                    <span className="text-slate-500">:</span>{' '}
                    {c.rightAnswer !== undefined ? c.rightAnswer : '?'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Direct Input Answer Box with Large 3D Domino Solver Tile */}
        <div className="md:col-span-7 bg-slate-900/95 p-5 md:p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          {/* Floating Coin Deduction Alert */}
          {coinNotification && (
            <div className="absolute top-2 right-4 bg-rose-600 text-white font-black px-3.5 py-1.5 rounded-full text-xs shadow-xl animate-bounce z-20">
              {coinNotification}
            </div>
          )}

          <div>
            {/* Header: Selected Card & Mistakes Left Hearts */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Memecahkan Kartu #{selectedCardIdx + 1}</span>
              </span>

              {/* Mistakes Limit Remaining (3 Hearts) */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                  Sisa Hati:
                </span>
                {[1, 2, 3].map((heartIdx) => (
                  <span
                    key={heartIdx}
                    className={`text-sm transition-transform ${
                      heartIdx <= mistakesLeft
                        ? 'opacity-100 scale-100 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        : 'opacity-25 grayscale scale-90'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>

            {/* REALISTIC LARGE 3D DOMINO TILE ACTIVE WORKBENCH */}
            <div className="my-3 flex flex-col sm:flex-row items-center justify-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-inner">
              {/* The Physical Realistic Domino Tile Representation */}
              <div className="relative w-28 h-56 rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#f7f3e8] to-[#e4dbc8] shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,1),inset_0_-2px_3px_rgba(0,0,0,0.25)] border-4 border-[#d5ccb6] flex flex-col overflow-hidden shrink-0">
                {/* Top Half of Domino */}
                <div
                  onClick={() => {
                    setCurrentSide('left');
                    setInputAnswer('');
                    setErrorFeedback(null);
                    setHint(null);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center p-2 relative cursor-pointer transition-all border-b-2 border-[#cfc6b2] ${
                    currentSide === 'left'
                      ? 'bg-amber-100/60 ring-inset ring-4 ring-cyan-500 shadow-inner'
                      : 'hover:bg-slate-200/40'
                  }`}
                  title="Klik untuk memilih persamaan sisi atas/kiri"
                >
                  {currentCard.leftAnswer !== undefined ? (
                    <AuthenticDominoPips count={currentCard.leftAnswer} size="lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Sisi Kiri
                      </span>
                      <span className="text-xs font-mono font-black text-indigo-950 px-1 py-0.5 leading-snug">
                        {currentCard.leftEquation}
                      </span>
                      <span className="text-xs font-mono font-black text-cyan-600 mt-1 animate-pulse">
                        x = ?
                      </span>
                    </div>
                  )}
                </div>

                {/* Center Divider Groove & Brass Spinner Rivet */}
                <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-[#b2a58b] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-700 via-amber-300 to-yellow-100 border border-amber-900 shadow-md pointer-events-none z-10" />

                {/* Bottom Half of Domino */}
                <div
                  onClick={() => {
                    setCurrentSide('right');
                    setInputAnswer('');
                    setErrorFeedback(null);
                    setHint(null);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center p-2 relative cursor-pointer transition-all ${
                    currentSide === 'right'
                      ? 'bg-amber-100/60 ring-inset ring-4 ring-cyan-500 shadow-inner'
                      : 'hover:bg-slate-200/40'
                  }`}
                  title="Klik untuk memilih persamaan sisi bawah/kanan"
                >
                  {currentCard.rightAnswer !== undefined ? (
                    <AuthenticDominoPips count={currentCard.rightAnswer} size="lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Sisi Kanan
                      </span>
                      <span className="text-xs font-mono font-black text-purple-950 px-1 py-0.5 leading-snug">
                        {currentCard.rightEquation}
                      </span>
                      <span className="text-xs font-mono font-black text-indigo-600 mt-1 animate-pulse">
                        x = ?
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Equation Details */}
              <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                    Sedang Dihitung: {currentSide === 'left' ? 'Sisi Kiri' : 'Sisi Kanan'}
                  </span>
                  {(currentSide === 'left' ? currentCard.leftAnswer : currentCard.rightAnswer) !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                      ✓ Sudah Terbuka
                    </span>
                  )}
                </div>

                <div className="text-2xl md:text-3xl font-mono font-black text-white tracking-wider my-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-inner text-center">
                  {currentSide === 'left'
                    ? currentCard.leftEquation
                    : currentCard.rightEquation}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  Cari nilai bilangan bulat <span className="text-cyan-400 font-bold font-mono">x</span> (0 - 6) agar persamaan di atas terpenuhi.
                </div>
              </div>
            </div>

            {/* Hint & Feedback alert */}
            {hint && (
              <div className="mb-2 p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-200 text-xs">
                {hint}
              </div>
            )}
            {errorFeedback && (
              <div className="mb-2 p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            {/* DIRECT INPUT FORM (NO MULTIPLE CHOICE) */}
            <form onSubmit={handleAnswerSubmit} className="mt-2 space-y-2.5">
              <label className="block text-xs font-bold text-slate-300">
                Ketikkan Nilai x:
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="6"
                  step="1"
                  placeholder="Ketik nilai x (misal: 4)"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={inputAnswer.trim() === ''}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-bold font-fun text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </button>
              </div>

              {/* Quick integer helper buttons (0 to 6) */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Tombol Angka:</span>
                {[0, 1, 2, 3, 4, 5, 6].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => setInputAnswer(digit.toString())}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleShowHint}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Butuh Petunjuk Aljabar?</span>
            </button>

            {allSolved ? (
              <button
                type="button"
                onClick={() => onAllCardsSolved(cards)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-fun text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Masuk ke Meja Domino!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Buka semua sisi kartu untuk memulai pertandingan...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Authentic recessed countersunk domino pips (dots)
 */
const AuthenticDominoPips: React.FC<{ count: number; size: 'sm' | 'md' | 'lg' }> = ({
  count,
  size,
}) => {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  }[size];

  // Standard domino pips pattern (3x3 grid)
  const dotPatterns: Record<number, number[]> = {
    0: [],
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeIndices = dotPatterns[count] || [];

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      {count === 0 ? (
        <span className="text-[10px] font-bold text-slate-400/50 font-mono">&bull;</span>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full place-items-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div key={idx} className="flex items-center justify-center w-full h-full">
              {activeIndices.includes(idx) ? (
                <div
                  className={`${dotSize} rounded-full bg-[#1c1d22] shadow-[inset_0_2px_3px_rgba(0,0,0,0.95),0_0.8px_1px_rgba(255,255,255,0.9)] border border-slate-900`}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
