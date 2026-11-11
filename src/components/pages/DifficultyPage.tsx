import React, { useState } from 'react';
import { GameDifficulty } from '../../types/game';
import { sounds } from '../../services/soundEffects';
import { ArrowRight, ArrowLeft, Brain, Zap, Flame, Award, Check } from 'lucide-react';

interface Props {
  initialDifficulty: GameDifficulty;
  onSelectDifficulty: (diff: GameDifficulty) => void;
  onBack: () => void;
  onNext: () => void;
}

const DIFFICULTIES: {
  id: GameDifficulty;
  label: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  borderColor: string;
  icon: typeof Brain;
  description: string;
  aiStrategy: string;
  bonusMMR: string;
}[] = [
  {
    id: 'easy',
    label: 'Level Mudah (Easy)',
    tagline: 'Santai & Ramah Pemula',
    badge: '🟢 PEMULA',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    gradient: 'from-emerald-950/50 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/50',
    icon: Brain,
    description: 'AI bermain dengan santai dan tidak agresif. Sangat cocok bagi yang baru memulai permainan atau ingin berlatih menghitung persamaan linear.',
    aiStrategy: 'AI memilih kartu acak yang valid tanpa memblokir pemain.',
    bonusMMR: '+20 MMR per Kemenangan',
  },
  {
    id: 'medium',
    label: 'Level Sedang (Medium)',
    tagline: 'Taktis & Seimbang',
    badge: '🟡 TAKTIS',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    gradient: 'from-amber-950/50 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/50',
    icon: Zap,
    description: 'AI mulai memperhitungkan kartu balak ganda dan berusaha menjaga pilihan kartu di tangannya agar tidak buntu.',
    aiStrategy: 'AI memprioritaskan kartu bernilai pas dan menjaga variasi nomor.',
    bonusMMR: '+35 MMR per Kemenangan',
  },
  {
    id: 'hard',
    label: 'Level Sulit (Hard)',
    tagline: 'Tantangan Master Domino',
    badge: '🔴 MASTER',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    gradient: 'from-rose-950/50 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/50',
    icon: Flame,
    description: 'AI sangat pintar dalam membaca permainan! AI akan menghitung sisa nomor domino di meja, membuang kartu berat lebih cepat, dan mencoba mengunci/memblokir lawan.',
    aiStrategy: 'AI menghitung pips tertinggi, melempar kartu balak, dan memblokir angka lawan.',
    bonusMMR: '+50 MMR per Kemenangan',
  },
];

export const DifficultyPage: React.FC<Props> = ({
  initialDifficulty,
  onSelectDifficulty,
  onBack,
  onNext,
}) => {
  const [selected, setSelected] = useState<GameDifficulty>(initialDifficulty);

  const handleSelect = (diff: GameDifficulty) => {
    sounds.playClick();
    setSelected(diff);
    onSelectDifficulty(diff);
  };

  const handleProceed = () => {
    sounds.playClick();
    onSelectDifficulty(selected);
    onNext();
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between p-4 z-10 animate-fadeIn">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs font-mono">
            3
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-fun text-white">
              Langkah 3: Pilih Tingkat Kesulitan AI
            </h2>
            <p className="text-xs text-slate-400">
              Sesuaikan tantangan strategi bot matematika sesuai keahlianmu
            </p>
          </div>
        </div>
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
        {DIFFICULTIES.map((lvl) => {
          const isChosen = selected === lvl.id;
          const IconComponent = lvl.icon;

          return (
            <div
              key={lvl.id}
              onClick={() => handleSelect(lvl.id)}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                isChosen
                  ? `bg-gradient-to-br ${lvl.gradient} ${lvl.borderColor} ring-4 ring-cyan-400/30 scale-[1.03] shadow-2xl`
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-lg'
              }`}
            >
              {/* Selected Badge */}
              {isChosen && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                    {lvl.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
                  <IconComponent className="w-6 h-6 text-cyan-400" />
                </div>

                <h3 className="text-xl font-bold font-fun text-white">
                  {lvl.label}
                </h3>
                <div className="text-xs text-indigo-300 font-semibold mt-0.5">
                  {lvl.tagline}
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {lvl.description}
                </p>

                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-400 block mb-0.5">Taktik AI:</span>
                  <span>{lvl.aiStrategy}</span>
                </div>
              </div>

              {/* Reward Bonus Tag */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lvl.bonusMMR}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Ruangan</span>
        </button>

        <button
          onClick={handleProceed}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black font-fun text-base flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Lanjut: Pilih Arena &amp; Tempat</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
