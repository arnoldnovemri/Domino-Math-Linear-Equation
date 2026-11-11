import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { sounds } from '../services/soundEffects';
import { DominoTile } from './DominoTile';
import { Avatar3DViewer } from './Avatar3DViewer';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Coins,
  RotateCcw,
  Home,
  Sparkles,
  ArrowRight,
  Eye,
  Crown,
  Medal,
} from 'lucide-react';

interface Props {
  winner: Player;
  players: Player[];
  isDeadlock: boolean;
  onPlayAgain: () => void;
  onOpenShop: () => void;
  onQuitToLobby: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  winner,
  players,
  isDeadlock,
  onPlayAgain,
  onOpenShop,
  onQuitToLobby,
}) => {
  // Directly display 3D Champion Podium (Cards were already revealed for 10s on the table)
  const [stage, setStage] = useState<'podium' | 'reveal'>('podium');

  const isUserWinner = winner.type === 'human';

  // Sort players by final standing (Rank 1, 2, 3, 4)
  const rankedPlayers = [...players].sort((a, b) => {
    if (a.id === winner.id) return -1;
    if (b.id === winner.id) return 1;
    if (a.cards.length !== b.cards.length) {
      return a.cards.length - b.cards.length;
    }
    const sumA = a.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0);
    const sumB = b.cards.reduce((acc, c) => acc + c.leftVal + c.rightVal, 0);
    return sumA - sumB;
  });

  // Trigger celebration effects upon entering podium
  useEffect(() => {
    if (stage === 'podium') {
      if (isUserWinner) {
        sounds.playVictory();
        confetti({
          particleCount: 140,
          spread: 100,
          origin: { y: 0.5 },
        });
      } else {
        sounds.playPass();
      }
    }
  }, [stage, isUserWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-3xl p-5 md:p-7 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* ========================================================= */}
        {/* STAGE 1: PEMAIN MEMBUKA SISA KARTU DI TANGAN (REVEAL)   */}
        {/* ========================================================= */}
        {stage === 'reveal' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fase 1: Pembuktian Sisa Kartu Domino Semua Pemain</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-fun text-white">
                {isDeadlock
                  ? 'Pertandingan Buntu! Semua Pemain Membuka Kartu'
                  : 'Pertandingan Selesai! Pembukaan Kartu Tangan'}
              </h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Lihat kartu yang tersisa di tangan setiap pemain beserta jumlah titik domino (*pips*) untuk menentukan peringkat akhir.
              </p>
            </div>

            {/* 4 Players Hand Cards Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
              {rankedPlayers.map((p, rankIdx) => {
                const isThisWinner = p.id === winner.id;
                const pipsSum = p.cards.reduce(
                  (acc, c) => acc + c.leftVal + c.rightVal,
                  0
                );

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isThisWinner
                        ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    {/* Player Info Header */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                            isThisWinner
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rankIdx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.type === 'human' && (
                              <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                                KAMU
                              </span>
                            )}
                            {isThisWinner && <Crown className="w-4 h-4 text-amber-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Status & Pips Badge */}
                      <div className="text-right">
                        <div
                          className={`text-xs font-bold ${
                            isThisWinner ? 'text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          Sisa: <strong className="text-white">{p.cards.length} Kartu</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Total Pips: <strong className="text-cyan-400">{pipsSum}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Flipped Open Cards Display */}
                    <div className="min-h-[55px] flex items-center justify-start gap-2 overflow-x-auto py-1 no-scrollbar">
                      {p.cards.length === 0 ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center gap-2 text-emerald-300 text-xs font-black shadow-inner">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>KARTU HABIS BERSIH (0 KARTU) 🏆</span>
                        </div>
                      ) : (
                        p.cards.map((card, cIdx) => (
                          <div
                            key={`${card.id}_${cIdx}`}
                            className="shrink-0 transition-transform hover:scale-105"
                          >
                            <DominoTile
                              card={{ ...card, isSolved: true }}
                              orientation="vertical"
                              size="sm"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stage 1 Footer with Direct Switch back to Podium */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                Rincian sisa kartu dan total titik domino seluruh pemain.
              </span>

              <button
                onClick={() => {
                  sounds.playClick();
                  setStage('podium');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-fun text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Lihat Podium Pemenang 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: UPACARA PODIUM PEMENANG 3D DENGAN AVATAR         */}
        {/* ========================================================= */}
        {stage === 'podium' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header Result */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{isDeadlock ? 'Pemenang Buntu (Kartu Tersedikit)' : 'Pemenang Domino Math'}</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black font-fun text-white mt-1">
                {isUserWinner ? 'Selamat! Kamu Menjadi Juara 1! 🏆' : `${winner.name} Menjadi Juara 1! 👑`}
              </h2>

              <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto">
                {isUserWinner
                  ? 'Kombinasi kecerdasan aljabar dan strategi kartu domino membawamu ke puncak podium!'
                  : `${winner.name} berhasil memenangkan pertandingan dengan sisa kartu paling sedikit.`}
              </p>
            </div>

            {/* 3D CHAMPION PODIUM (#1 Center Gold, #2 Left Silver, #3 Right Bronze) */}
            <div className="w-full flex items-end justify-center gap-2 md:gap-4 pt-6 pb-2 min-h-[280px]">
              {/* PODIUM #2 (SILVER - LEFT) */}
              {rankedPlayers[1] && (
                <div className="flex-1 max-w-[170px] flex flex-col items-center animate-slideUp">
                  {/* 3D Avatar */}
                  <div className="w-20 h-24 md:w-24 md:h-28 flex items-center justify-center relative -mb-2">
                    <Avatar3DViewer
                      avatar={rankedPlayers[1].avatar}
                      className="w-full h-full"
                      interactive={false}
                    />
                    <span className="absolute -top-1 -right-1 text-lg">🥈</span>
                  </div>

                  <div className="text-center w-full px-1">
                    <div className="font-bold text-xs text-white truncate">
                      {rankedPlayers[1].name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sisa: {rankedPlayers[1].cards.length} kartu
                    </div>
                  </div>

                  {/* Silver Pillar */}
                  <div className="w-full h-24 md:h-28 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 border-t-2 border-x-2 border-slate-300 shadow-xl flex flex-col items-center justify-center text-slate-950 font-black font-fun">
                    <span className="text-2xl md:text-3xl">#2</span>
                    <span className="text-[10px] tracking-wider uppercase opacity-90">Juara 2</span>
                  </div>
                </div>
              )}

              {/* PODIUM #1 (GOLD - CENTER HIGHEST) */}
              {rankedPlayers[0] && (
                <div className="flex-1 max-w-[210px] flex flex-col items-center -mt-6 animate-slideUp z-10">
                  {/* Floating Golden Crown */}
                  <div className="text-3xl mb-0.5 animate-bounce">👑</div>

                  {/* Winner 3D Avatar with Interactive 360 Spin */}
                  <div className="w-24 h-28 md:w-32 md:h-36 flex items-center justify-center relative -mb-2">
                    <Avatar3DViewer
                      avatar={rankedPlayers[0].avatar}
                      className="w-full h-full"
                      interactive={true}
                    />
                    <div className="absolute inset-0 pointer-events-none rounded-full ring-4 ring-amber-400/40 animate-pulse" />
                  </div>

                  <div className="text-center w-full px-1">
                    <div className="font-black text-sm md:text-base text-amber-300 truncate">
                      {rankedPlayers[0].name}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400">
                      🏆 Sisa: {rankedPlayers[0].cards.length} kartu
                    </div>
                  </div>

                  {/* Gold Pillar */}
                  <div className="w-full h-32 md:h-36 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-t-2 border-x-2 border-yellow-200 shadow-2xl flex flex-col items-center justify-center text-slate-950 font-black font-fun ring-2 ring-amber-400/50">
                    <Trophy className="w-6 h-6 mb-1 text-slate-950 fill-current" />
                    <span className="text-3xl md:text-4xl">#1</span>
                    <span className="text-xs tracking-wider uppercase font-black">JUARA 1</span>
                  </div>
                </div>
              )}

              {/* PODIUM #3 (BRONZE - RIGHT) */}
              {rankedPlayers[2] && (
                <div className="flex-1 max-w-[170px] flex flex-col items-center animate-slideUp">
                  {/* 3D Avatar */}
                  <div className="w-20 h-24 md:w-24 md:h-28 flex items-center justify-center relative -mb-2">
                    <Avatar3DViewer
                      avatar={rankedPlayers[2].avatar}
                      className="w-full h-full"
                      interactive={false}
                    />
                    <span className="absolute -top-1 -right-1 text-lg">🥉</span>
                  </div>

                  <div className="text-center w-full px-1">
                    <div className="font-bold text-xs text-white truncate">
                      {rankedPlayers[2].name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sisa: {rankedPlayers[2].cards.length} kartu
                    </div>
                  </div>

                  {/* Bronze Pillar */}
                  <div className="w-full h-18 md:h-22 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-t-2 border-x-2 border-amber-600 shadow-xl flex flex-col items-center justify-center text-amber-200 font-black font-fun">
                    <span className="text-2xl md:text-3xl">#3</span>
                    <span className="text-[10px] tracking-wider uppercase opacity-90">Juara 3</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4th Place Honorable Mention (if 4 players) */}
            {rankedPlayers[3] && (
              <div className="w-full max-w-sm mx-auto p-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 px-3">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500">#4</span>
                  <span className="text-slate-300 font-semibold">{rankedPlayers[3].name}</span>
                </span>
                <span className="text-[11px]">Sisa: {rankedPlayers[3].cards.length} kartu</span>
              </div>
            )}

            {/* Winner Rewards Banner */}
            {isUserWinner && (
              <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs md:text-sm shadow-md">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Hadiah Kemenangan: +200 Koin &amp; +35 MMR Peringkat Global!</span>
              </div>
            )}

            {/* Action Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => setStage('reveal')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Lihat Kartu</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onPlayAgain();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-fun text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Lagi</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenShop();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Toko Skin</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onQuitToLobby();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Menu Utama</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
