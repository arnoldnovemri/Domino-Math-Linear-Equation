import React, { useState } from 'react';
import { AvatarConfig } from '../../types/game';
import { Avatar3DViewer } from '../Avatar3DViewer';
import { saveUserProfile } from '../../services/storage';
import { sounds } from '../../services/soundEffects';
import { Sparkles, Trophy, ArrowRight, UserCheck, Crown, Flame } from 'lucide-react';

interface Props {
  initialName: string;
  initialAvatar: AvatarConfig;
  coins: number;
  onNext: (name: string, updatedAvatar: AvatarConfig) => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
}

export const ProfileAvatarPage: React.FC<Props> = ({
  initialName,
  initialAvatar,
  coins,
  onNext,
  onOpenShop,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState<string>(initialName);
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...initialAvatar });
  const [activeTab, setActiveTab] = useState<'quick' | 'head' | 'hair' | 'outfit' | 'skin'>('quick');

  const handleSaveAndNext = () => {
    sounds.playClick();
    const finalName = playerName.trim() || 'Pemain Math';
    saveUserProfile(finalName, avatar);
    onNext(finalName, avatar);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between p-4 z-10 animate-fadeIn">
      {/* Step Header Indicator */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs font-mono">
            1
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-fun text-white flex items-center gap-2">
              <span>Langkah 1: Profil &amp; Kustomisasi Avatar 3D</span>
            </h2>
            <p className="text-xs text-slate-400">
              Tentukan nama pemain dan sesuaikan penampilan karakter 3D milikmu (Bawaan Biasa vs Eksklusif)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Peringkat Global</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{coins} Koin</span>
          </button>
        </div>
      </div>

      {/* Main Content: Left 3D Viewer, Right Name & Customization */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* Left Column: 3D Interactive Character */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center relative backdrop-blur-md">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Avatar 3D Interaktif</span>
          </div>

          <div className="text-xs text-slate-400 mb-2">
            Klik dan geser untuk memutar 360&deg;
          </div>

          <div className="w-56 h-64 flex items-center justify-center my-2">
            <Avatar3DViewer avatar={avatar} className="w-full h-full" interactive={true} />
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Buka Toko Aksesoris Eksklusif &amp; Skin</span>
          </button>
        </div>

        {/* Right Column: Name Input & Quick Styling */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            {/* Player Name Field */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Pemain Kamu:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ketik nama kamu..."
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-base font-bold text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                  {playerName.length}/16
                </span>
              </div>
            </div>

            {/* Customizer Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto no-scrollbar">
              {[
                { id: 'quick', label: 'Preset Gaya', icon: '✨' },
                { id: 'head', label: 'Topi/Aksesoris', icon: '👑' },
                { id: 'hair', label: 'Rambut/Aura', icon: '🔥' },
                { id: 'outfit', label: 'Pakaian', icon: '🛡️' },
                { id: 'skin', label: 'Warna Kulit', icon: '🎨' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tab: Preset Gaya */}
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Coba perbandingan gaya bawaan santai vs outfit sultan eksklusif:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      label: 'Kasual Santai (Default)',
                      tierBadge: 'Default',
                      cfg: {
                        headwear: 'none',
                        eyewear: 'none',
                        outfit: 'plain_tee',
                        outfitColor: '#64748b',
                        hairStyle: 'simple_short',
                        hairColor: '#475569',
                      },
                    },
                    {
                      label: 'Kaisar Emas Pythagoras',
                      tierBadge: 'Legendary',
                      cfg: {
                        headwear: 'crown',
                        eyewear: 'gold_shades',
                        outfit: 'emperor_armor',
                        outfitColor: '#fbbf24',
                        hairStyle: 'royal_curls',
                        hairColor: '#facc15',
                      },
                    },
                    {
                      label: 'Cyber Mecha Dragon',
                      tierBadge: 'Epic',
                      cfg: {
                        headwear: 'dragon_horns',
                        eyewear: 'cyber_eye',
                        outfit: 'cyber_exosuit',
                        outfitColor: '#0f172a',
                        hairStyle: 'dreadlocks',
                        hairColor: '#ef4444',
                      },
                    },
                    {
                      label: 'Super Flame Warrior',
                      tierBadge: 'Legendary',
                      cfg: {
                        headwear: 'none',
                        eyewear: 'gold_shades',
                        outfit: 'cyber',
                        outfitColor: '#ea580c',
                        hairStyle: 'flame_spikes',
                        hairColor: '#f97316',
                      },
                    },
                    {
                      label: 'Penyihir Bintang Kosmik',
                      tierBadge: 'Epic',
                      cfg: {
                        headwear: 'halo',
                        eyewear: 'monocle',
                        outfit: 'galaxy_wizard',
                        outfitColor: '#1e1b4b',
                        hairStyle: 'ponytail',
                        hairColor: '#e0e7ff',
                      },
                    },
                    {
                      label: 'Sultan VIP Tuxedo',
                      tierBadge: 'Premium',
                      cfg: {
                        headwear: 'tophat',
                        eyewear: 'gold_shades',
                        outfit: 'vip_tuxedo',
                        outfitColor: '#09090b',
                        hairStyle: 'spiky',
                        hairColor: '#1e293b',
                      },
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playClick();
                        setAvatar((prev) => ({ ...prev, ...preset.cfg } as AvatarConfig));
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-white transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                          {preset.tierBadge}
                        </span>
                        <span className="text-cyan-400 text-[10px]">Coba</span>
                      </div>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Topi/Aksesoris */}
            {activeTab === 'head' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Polos (Biasa)', icon: '🚫', isDefault: true },
                  { id: 'cap', label: 'Topi Baseball (Biasa)', icon: '🧢', isDefault: true },
                  { id: 'crown', label: 'Mahkota Emas (Sultan)', icon: '👑', isDefault: false },
                  { id: 'dragon_horns', label: 'Tanduk Dragon (Epic)', icon: '🐉', isDefault: false },
                  { id: 'halo', label: 'Halo Malaikat', icon: '😇', isDefault: false },
                  { id: 'visor', label: 'VR Cyber Visor', icon: '🥽', isDefault: false },
                  { id: 'catears', label: 'Telinga Kucing LED', icon: '🐱', isDefault: false },
                  { id: 'tophat', label: 'Topi Sutra Emas', icon: '🎩', isDefault: false },
                  { id: 'headset', label: 'Headset Gamer', icon: '🎧', isDefault: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      setAvatar((prev) => ({ ...prev, headwear: item.id as AvatarConfig['headwear'] }));
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      avatar.headwear === item.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                        : item.isDefault
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                        : 'bg-slate-800/80 border-amber-500/30 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{item.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Gaya Rambut */}
            {activeTab === 'hair' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'simple_short', label: 'Pendek (Biasa)', icon: '✂️', isDefault: true },
                  { id: 'spiky', label: 'Spiky (Biasa)', icon: '👦', isDefault: true },
                  { id: 'flame_spikes', label: 'Rambut Api (Sultan)', icon: '🔥', isDefault: false },
                  { id: 'royal_curls', label: 'Ikal Bangsawan (Epic)', icon: '👑', isDefault: false },
                  { id: 'dreadlocks', label: 'Dreadlocks Gold', icon: '🪮', isDefault: false },
                  { id: 'ponytail', label: 'Kuncir Kuda', icon: '👱‍♀️', isDefault: false },
                  { id: 'curly', label: 'Afro Bervolume', icon: '🧑‍🦱', isDefault: false },
                  { id: 'bangs', label: 'Poni Anime', icon: '💇', isDefault: false },
                  { id: 'beanie', label: 'Kupluk Beanie', icon: '🧢', isDefault: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      setAvatar((prev) => ({ ...prev, hairStyle: item.id as AvatarConfig['hairStyle'] }));
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      avatar.hairStyle === item.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                        : item.isDefault
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                        : 'bg-slate-800/80 border-amber-500/30 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{item.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Pakaian & Zirah */}
            {activeTab === 'outfit' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'plain_tee', label: 'Kaos Oblong (Biasa)', icon: '👕', isDefault: true },
                  { id: 'school', label: 'Kemeja (Biasa)', icon: '👔', isDefault: true },
                  { id: 'emperor_armor', label: 'Zirah Emas Kaisar', icon: '🛡️', isDefault: false },
                  { id: 'galaxy_wizard', label: 'Jubah Galaksi', icon: '🧙‍♂️', isDefault: false },
                  { id: 'cyber_exosuit', label: 'Cyber Exosuit', icon: '🤖', isDefault: false },
                  { id: 'vip_tuxedo', label: 'VIP Tuxedo Emas', icon: '🤵', isDefault: false },
                  { id: 'cyber', label: 'Jaket Neon', icon: '⚡', isDefault: false },
                  { id: 'hoodie', label: 'Street Hoodie', icon: '🧥', isDefault: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      setAvatar((prev) => ({ ...prev, outfit: item.id as AvatarConfig['outfit'] }));
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      avatar.outfit === item.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                        : item.isDefault
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                        : 'bg-slate-800/80 border-amber-500/30 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{item.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Warna Kulit */}
            {activeTab === 'skin' && (
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-semibold">
                  Pilih Warna Kulit Avatar:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['#fcd34d', '#fde047', '#fed7aa', '#f87171', '#38bdf8', '#c084fc', '#fef08a'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        sounds.playClick();
                        setAvatar((prev) => ({ ...prev, skinColor: c }));
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform cursor-pointer ${
                        avatar.skinColor === c
                          ? 'scale-115 border-white ring-4 ring-cyan-400 shadow-lg'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Langkah 1 dari 4 &bull; Profil &amp; Avatar
        </div>

        <button
          onClick={handleSaveAndNext}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black font-fun text-base flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Lanjut: Pilih Ruangan</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
