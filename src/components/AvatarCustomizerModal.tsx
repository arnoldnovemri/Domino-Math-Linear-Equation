import React, { useState } from 'react';
import { AvatarConfig } from '../types/game';
import { Avatar3DViewer } from './Avatar3DViewer';
import {
  COSMETIC_SHOP_ITEMS,
  getUnlockedItems,
  unlockItem,
  getUserCoins,
  addCoins,
  saveUserProfile,
  CosmeticTier,
} from '../services/storage';
import { sounds } from '../services/soundEffects';
import { Sparkles, Coins, Check, Lock, X, Crown, ShieldAlert, Sparkle } from 'lucide-react';

interface Props {
  initialAvatar: AvatarConfig;
  initialName: string;
  onSave: (name: string, updatedAvatar: AvatarConfig) => void;
  onClose: () => void;
}

const SKIN_COLORS = ['#fcd34d', '#fde047', '#fed7aa', '#f87171', '#38bdf8', '#c084fc', '#fef08a'];
const HAIR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#1e293b'];
const OUTFIT_COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#e11d48', '#0f172a'];

export const AvatarCustomizerModal: React.FC<Props> = ({
  initialAvatar,
  initialName,
  onSave,
  onClose,
}) => {
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...initialAvatar });
  const [playerName, setPlayerName] = useState<string>(initialName);
  const [coins, setCoins] = useState<number>(getUserCoins());
  const [unlockedItems, setUnlockedItems] = useState<string[]>(getUnlockedItems());
  const [activeTab, setActiveTab] = useState<'headwear' | 'eyewear' | 'outfit' | 'hairStyle' | 'colors'>('headwear');
  const [tierFilter, setTierFilter] = useState<'all' | 'exclusive' | 'default'>('all');
  const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const getTierBadge = (tier: CosmeticTier) => {
    switch (tier) {
      case 'legendary':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 border border-amber-300 animate-pulse">
            <Crown className="w-2.5 h-2.5 fill-current" />
            <span>LEGENDARIS (SULTAN)</span>
          </span>
        );
      case 'epic':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/30 border border-purple-400">
            <Sparkles className="w-2.5 h-2.5" />
            <span>EPIC EKSKLUSIF</span>
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
            <span>PREMIUM</span>
          </span>
        );
      case 'standard':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
            <span>STANDAR</span>
          </span>
        );
      case 'default':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase bg-slate-900 text-slate-400 border border-slate-800">
            <span>DEFAULT &bull; BIASA</span>
          </span>
        );
    }
  };

  const handleBuyOrEquip = (
    itemId: string,
    category: 'headwear' | 'eyewear' | 'outfit' | 'hairStyle',
    value: string,
    cost: number,
    tier: CosmeticTier
  ) => {
    const isOwned = unlockedItems.includes(itemId) || cost === 0;

    if (isOwned) {
      if (tier === 'legendary' || tier === 'epic') {
        sounds.playExclusiveSparkle();
      } else {
        sounds.playClick();
      }

      setAvatar((prev) => ({
        ...prev,
        [category]: value,
      }));
      setPurchaseMsg({ text: `Aksesori berhasil dipasang!` });
      setTimeout(() => setPurchaseMsg(null), 2000);
    } else {
      // Need purchase
      if (coins >= cost) {
        if (tier === 'legendary' || tier === 'epic') {
          sounds.playExclusiveSparkle();
        } else {
          sounds.playCoin();
        }

        const remaining = addCoins(-cost);
        setCoins(remaining);
        unlockItem(itemId);
        setUnlockedItems(getUnlockedItems());
        setAvatar((prev) => ({
          ...prev,
          [category]: value,
        }));
        setPurchaseMsg({
          text: `🎉 Berhasil membuka aksesori eksklusif ${tier.toUpperCase()}!`,
        });
        setTimeout(() => setPurchaseMsg(null), 2500);
      } else {
        sounds.playWrongBuzz();
        setPurchaseMsg({
          text: `Koin tidak mencukupi! Dapatkan koin dengan menyelesaikan mini game kucing atau menang di meja domino.`,
          isError: true,
        });
        setTimeout(() => setPurchaseMsg(null), 3500);
      }
    }
  };

  const handleSaveAndExit = () => {
    sounds.playClick();
    saveUserProfile(playerName, avatar);
    onSave(playerName, avatar);
    onClose();
  };

  const filteredItems = COSMETIC_SHOP_ITEMS.filter((item) => {
    if (item.category !== activeTab) return false;
    if (tierFilter === 'exclusive') return item.cost > 0;
    if (tierFilter === 'default') return item.cost === 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                👑
              </div>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-fun text-white flex items-center gap-2">
                <span>Studio Avatar 3D &amp; Toko Aksesoris Eksklusif</span>
              </h2>
              <p className="text-xs text-slate-400">
                Item bawaan berpenampilan sederhana, koleksi berbayar memiliki model 3D unik, efek emas &amp; partikel mewah!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-sm shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins} Koin</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Purchase Notification */}
        {purchaseMsg && (
          <div
            className={`py-2 px-4 text-xs font-semibold text-center text-white ${
              purchaseMsg.isError ? 'bg-rose-600/90' : 'bg-emerald-600/90'
            } animate-slideDown`}
          >
            {purchaseMsg.text}
          </div>
        )}

        {/* Content Body: Left 3D View, Right Options */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* 3D Preview Column */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-900 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 relative">
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                <Sparkle className="w-3.5 h-3.5" />
                <span>Live 3D Real-time Preview</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                Geser kursor / layar untuk memutar avatar 360&deg;
              </div>

              <div className="w-56 h-64 flex items-center justify-center relative">
                <Avatar3DViewer avatar={avatar} className="w-full h-full" interactive={true} />
              </div>

              {/* Name Editor */}
              <div className="w-full mt-3 max-w-xs">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Profil Pemain:
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold text-center focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              {/* Current outfit tier badge */}
              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Status Penampilan:</span>
                <span className="text-amber-400 font-bold">
                  {avatar.headwear === 'crown' || avatar.outfit === 'emperor_armor' || avatar.hairStyle === 'flame_spikes'
                    ? '👑 Sultan Legendaris'
                    : avatar.headwear === 'dragon_horns' || avatar.outfit === 'cyber_exosuit' || avatar.headwear === 'halo'
                    ? '✨ Bangsawan Epic'
                    : avatar.outfit === 'plain_tee' && avatar.headwear === 'none'
                    ? '👕 Kasual Biasa Saja'
                    : '⭐ Kustom Pribadi'}
                </span>
              </div>
            </div>
          </div>

          {/* Customization Controls Column */}
          <div className="md:col-span-7 flex flex-col p-6 overflow-y-auto">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 border-b border-slate-800 no-scrollbar">
              {[
                { id: 'headwear', label: 'Topi & Hiasan Kepala', icon: '👑' },
                { id: 'eyewear', label: 'Kacamata & Scouter', icon: '👓' },
                { id: 'outfit', label: 'Pakaian & Zirah', icon: '🛡️' },
                { id: 'hairStyle', label: 'Gaya Rambut & Aura', icon: '🔥' },
                { id: 'colors', label: 'Warna Karakter', icon: '🎨' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Filter Pills for items */}
            {activeTab !== 'colors' && (
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-semibold">Filter:</span>
                  {[
                    { id: 'all', label: 'Semua Koleksi' },
                    { id: 'exclusive', label: '✨ Eksklusif Berbayar' },
                    { id: 'default', label: '👕 Default Gratis' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTierFilter(f.id as typeof tierFilter)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        tierFilter === f.id
                          ? 'bg-slate-700 text-white border border-slate-500'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shop items list for headwear, eyewear, outfit, hairStyle */}
            {activeTab !== 'colors' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredItems.map((item) => {
                  const isEquipped = avatar[item.category] === item.value;
                  const isUnlocked = unlockedItems.includes(item.id) || item.cost === 0;

                  // Distinctive border and background based on tier exclusivity
                  let tierCardStyle = 'border-slate-800 bg-slate-800/40 hover:border-slate-700';
                  if (isEquipped) {
                    tierCardStyle = 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/40';
                  } else if (item.tier === 'legendary') {
                    tierCardStyle = 'border-amber-500/60 bg-gradient-to-br from-amber-950/30 to-slate-900 hover:border-amber-400 shadow-md shadow-amber-500/10';
                  } else if (item.tier === 'epic') {
                    tierCardStyle = 'border-purple-500/50 bg-gradient-to-br from-purple-950/30 to-slate-900 hover:border-purple-400 shadow-md shadow-purple-500/10';
                  } else if (item.tier === 'premium') {
                    tierCardStyle = 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400';
                  } else if (item.tier === 'default') {
                    tierCardStyle = 'border-slate-800 bg-slate-900/50 hover:border-slate-700 opacity-90';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${tierCardStyle}`}
                    >
                      <div>
                        {/* Top Tier Badge & Icon */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                            {item.icon}
                          </span>
                          <div>{getTierBadge(item.tier)}</div>
                        </div>

                        {/* Name and Price */}
                        <div className="mb-2">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Equip / Buy Button */}
                      <button
                        onClick={() =>
                          handleBuyOrEquip(
                            item.id,
                            item.category,
                            item.value,
                            item.cost,
                            item.tier
                          )
                        }
                        className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                            : isUnlocked
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : item.tier === 'legendary'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                            : item.tier === 'epic'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold shadow-md shadow-purple-500/20'
                            : coins >= item.cost
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Sedang Dipakai</span>
                          </>
                        ) : isUnlocked ? (
                          <span>Gunakan</span>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Beli Eksklusif ({item.cost} Koin)</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Color Pickers */
              <div className="space-y-4">
                {/* Skin Color */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Warna Kulit Karakter:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          sounds.playClick();
                          setAvatar((prev) => ({ ...prev, skinColor: c }));
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                          avatar.skinColor === c
                            ? 'scale-115 border-white ring-2 ring-cyan-400 shadow-md'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Warna Rambut / Aura:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          sounds.playClick();
                          setAvatar((prev) => ({ ...prev, hairColor: c }));
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                          avatar.hairColor === c
                            ? 'scale-115 border-white ring-2 ring-cyan-400 shadow-md'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Outfit Color */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Warna Utama Pakaian:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          sounds.playClick();
                          setAvatar((prev) => ({ ...prev, outfitColor: c }));
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                          avatar.outfitColor === c
                            ? 'scale-115 border-white ring-2 ring-cyan-400 shadow-md'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleSaveAndExit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black font-fun text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simpan Avatar &amp; Pakai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
