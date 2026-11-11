import React from 'react';
import { getGlobalLeaderboard, getUserStats } from '../services/storage';
import { Trophy, Medal, Award, Flame, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ onClose }) => {
  const leaderboard = getGlobalLeaderboard();
  const stats = getUserStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-fun text-white">
                Papan Peringkat Global
              </h2>
              <p className="text-xs text-slate-400">
                Peringkat master domino matematika dari seluruh dunia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Stats Card Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider">
              Statistik Akun Kamu
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{stats.rankPoints} Poin MMR</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {stats.wins} Menang / {stats.matchesPlayed} Laga
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{stats.miniGamesWon} Mini Game Selesai</span>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {leaderboard.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadge =
              entry.rank === 1
                ? 'bg-amber-500 text-slate-950 font-extrabold'
                : entry.rank === 2
                ? 'bg-slate-300 text-slate-950 font-extrabold'
                : entry.rank === 3
                ? 'bg-amber-700 text-amber-100 font-extrabold'
                : 'bg-slate-800 text-slate-400';

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  entry.isUser
                    ? 'bg-cyan-950/50 border-cyan-400/80 ring-2 ring-cyan-400/30'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                {/* Left: Rank & Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-xs ${rankBadge}`}
                  >
                    {isTop3 ? (
                      entry.rank === 1 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )
                    ) : (
                      `#${entry.rank}`
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {entry.name}
                      </span>
                      {entry.isUser && (
                        <span className="text-[10px] bg-cyan-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
                          KAMU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-indigo-300 font-medium">
                      {entry.tier}
                    </div>
                  </div>
                </div>

                {/* Right: Points & Winrate */}
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-amber-300">
                    {entry.points} pts
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Win Rate: {entry.winRate}% ({entry.wins}W)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
