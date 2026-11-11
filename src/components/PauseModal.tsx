import React from 'react';
import { sounds } from '../services/soundEffects';
import { Play, Volume2, VolumeX, Sparkles, Home, X } from 'lucide-react';

interface Props {
  onResume: () => void;
  onOpenShop: () => void;
  onQuitToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<Props> = ({
  onResume,
  onOpenShop,
  onQuitToLobby,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        {/* Close icon */}
        <button
          onClick={onResume}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Play className="w-6 h-6 ml-0.5" />
        </div>

        <div>
          <h3 className="text-2xl font-bold font-fun text-white">Permainan Dijeda</h3>
          <p className="text-xs text-slate-400 mt-1">
            Waktu istirahat sejenak! Kamu bisa berganti skin atau mengatur audio.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-fun text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Lanjutkan Permainan</span>
          </button>

          {/* Change Skin / Shop */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/30 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ganti Skin & Aksesori Avatar</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Nyalakan Musik & Suara</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Senyapkan Musik & Suara (Mute)</span>
              </>
            )}
          </button>

          {/* Quit to lobby */}
          <button
            onClick={() => {
              sounds.playClick();
              onQuitToLobby();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-800/50"
          >
            <Home className="w-4 h-4" />
            <span>Keluar ke Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
