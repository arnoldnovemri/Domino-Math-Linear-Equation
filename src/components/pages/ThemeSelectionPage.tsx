import React, { useState } from 'react';
import { ARENA_THEMES, ArenaTheme } from '../../types/themes';
import { ArenaVisualCard } from '../ArenaVisualCard';
import { sounds } from '../../services/soundEffects';
import { ArrowRight, ArrowLeft, Play, MapPin, Sparkles } from 'lucide-react';

interface Props {
  initialTheme: ArenaTheme;
  onSelectTheme: (theme: ArenaTheme) => void;
  onBack: () => void;
  onStartMatch: () => void;
}

export const ThemeSelectionPage: React.FC<Props> = ({
  initialTheme,
  onSelectTheme,
  onBack,
  onStartMatch,
}) => {
  const [selected, setSelected] = useState<ArenaTheme>(initialTheme);

  const handleSelect = (theme: ArenaTheme) => {
    sounds.playClick();
    setSelected(theme);
    onSelectTheme(theme);
  };

  const handleStart = () => {
    sounds.playClick();
    onSelectTheme(selected);
    onStartMatch();
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-between p-4 z-10 animate-fadeIn">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs font-mono">
            4
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-fun text-white flex items-center gap-2">
              <span>Langkah 4: Pilih Tempat &amp; Arena Permainan</span>
              <span className="text-xs font-normal text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Gambar Panorama 3D
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Lihat gambaran pemandangan visual unik dari masing-masing arena pertandingan domino
            </p>
          </div>
        </div>
      </div>

      {/* Visual Arena Cards Grid (Rich Visual Illustrations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
        {ARENA_THEMES.map((theme) => {
          const isSelected = selected.id === theme.id;
          return (
            <ArenaVisualCard
              key={theme.id}
              theme={theme}
              isSelected={isSelected}
              onClick={() => handleSelect(theme)}
            />
          );
        })}
      </div>

      {/* Selected Arena Spotlight Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              Arena yang Dipilih:
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{selected.name}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({selected.badge})
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {selected.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-300 font-bold bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Total 28 Kartu Domino (7 Kartu / Pemain)</span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Level</span>
        </button>

        <button
          onClick={handleStart}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black font-fun text-base flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Mulai Persiapan Kartu!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
