import React, { useState } from 'react';
import { GameMode, Player, AvatarConfig } from '../../types/game';
import { sounds } from '../../services/soundEffects';
import { Bot, Users, ArrowRight, ArrowLeft, Key, Plus, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  playerName: string;
  avatar: AvatarConfig;
  coins: number;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode, customRoomPlayers?: Player[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const RoomSelectionPage: React.FC<Props> = ({
  playerName,
  avatar,
  coins,
  selectedMode: initialMode,
  onSelectMode,
  onBack,
  onNext,
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [roomCode, setRoomCode] = useState<string>('MATH' + Math.floor(10 + Math.random() * 89));
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState<boolean>(false);

  const [multiplayerPlayers, setMultiplayerPlayers] = useState<Player[]>([
    {
      id: 'human_host',
      name: playerName,
      avatar,
      type: 'human',
      cards: [],
      score: 0,
      isReady: true,
      coins,
      rankPoints: 1200,
    },
  ]);

  const handleModeChange = (newMode: GameMode) => {
    sounds.playClick();
    setMode(newMode);
    onSelectMode(newMode, newMode === 'multiplayer' ? multiplayerPlayers : undefined);
  };

  const handleQuickMatch = () => {
    sounds.playClick();
    setIsSearchingQuickMatch(true);

    const botNames = ['Budi Euler', 'Siti Gauss', 'Dewi Lovelace', 'Arya Turing', 'Rian Al-Khwarizmi'];
    const shuffled = [...botNames].sort(() => Math.random() - 0.5);

    let count = multiplayerPlayers.length;
    const interval = setInterval(() => {
      count++;
      sounds.playTileSnap();
      setMultiplayerPlayers((prev) => {
        if (prev.length >= 4) {
          clearInterval(interval);
          setIsSearchingQuickMatch(false);
          return prev;
        }
        const updated = [
          ...prev,
          {
            id: `bot_player_${count}`,
            name: shuffled[(count - 2) % shuffled.length],
            avatar: {
              ...avatar,
              skinColor: ['#fed7aa', '#f87171', '#38bdf8'][count % 3],
              hairColor: ['#ef4444', '#10b981', '#f59e0b', '#ec4899'][count % 4],
              outfitColor: ['#06b6d4', '#e11d48', '#8b5cf6', '#10b981'][count % 4],
              headwear: (count === 2 ? 'headset' : count === 3 ? 'visor' : 'catears') as AvatarConfig['headwear'],
            },
            type: 'ai' as const,
            cards: [],
            score: 0,
            isReady: true,
            coins: 200,
            rankPoints: 1100 + count * 50,
          },
        ];
        return updated;
      });

      if (count >= 4) {
        clearInterval(interval);
        setIsSearchingQuickMatch(false);
      }
    }, 900);
  };

  const handleAddBot = () => {
    if (multiplayerPlayers.length >= 4) return;
    sounds.playTileSnap();
    const nextIdx = multiplayerPlayers.length;
    const names = ['Dewi Lovelace', 'Siti Gauss', 'Arya Turing', 'Raden Archimedes'];
    setMultiplayerPlayers((prev) => [
      ...prev,
      {
        id: `bot_slot_${nextIdx}`,
        name: names[nextIdx - 1] || `Pemain ${nextIdx + 1}`,
        avatar: {
          ...avatar,
          hairColor: '#ef4444',
          headwear: 'headset',
        },
        type: 'ai',
        cards: [],
        score: 0,
        isReady: true,
        coins: 150,
        rankPoints: 1150,
      },
    ]);
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    sounds.playClick();
    setRoomCode(joinCodeInput.toUpperCase());
    handleQuickMatch();
  };

  const handleProceed = () => {
    sounds.playClick();
    onSelectMode(mode, mode === 'multiplayer' ? multiplayerPlayers : undefined);
    onNext();
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between p-4 z-10 animate-fadeIn">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs font-mono">
            2
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-fun text-white">
              Langkah 2: Pilih Ruangan &amp; Mode Bermain
            </h2>
            <p className="text-xs text-slate-400">
              Pilih apakah ingin bertanding melawan AI atau masuk ke Ruang Pribadi 4 Pemain
            </p>
          </div>
        </div>
      </div>

      {/* Main Choice Grid */}
      <div className="my-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: AI Room */}
          <div
            onClick={() => handleModeChange('ai')}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              mode === 'ai'
                ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-400 ring-4 ring-cyan-400/25 shadow-2xl scale-[1.02]'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
                  <Bot className="w-8 h-8" />
                </div>
                {mode === 'ai' && (
                  <span className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-xs">
                    Aktif
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold font-fun text-white">
                Ruangan Lawan AI
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Bermain langsung tanpa menunggu pemain lain. Tiga bot AI pintar akan menjadi lawanmu di meja domino.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instan langsung main &bull; 3 Lawan Bot</span>
            </div>
          </div>

          {/* Option 2: Multiplayer 4 Player Room */}
          <div
            onClick={() => handleModeChange('multiplayer')}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              mode === 'multiplayer'
                ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-400 ring-4 ring-indigo-400/25 shadow-2xl scale-[1.02]'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
                  <Users className="w-8 h-8" />
                </div>
                {mode === 'multiplayer' && (
                  <span className="px-3 py-1 rounded-full bg-indigo-400 text-slate-950 font-extrabold text-xs">
                    Aktif
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold font-fun text-white">
                Ruang Pribadi 4 Pemain
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Sistem ruang pribadi real-time. Bagikan kode ruangan kepada teman atau cari lawan cepat hingga berkumpul 4 pemain.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Wajib 4 Pemain &bull; Sistem Kode Ruang</span>
            </div>
          </div>
        </div>

        {/* Multiplayer Configuration Panel (if multiplayer selected) */}
        {mode === 'multiplayer' && (
          <div className="p-6 bg-slate-900/90 border border-indigo-500/40 rounded-3xl space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Kode Ruangan Kamu:
                </span>
                <div className="text-2xl font-mono font-black text-white flex items-center gap-2 mt-0.5">
                  <span className="px-3 py-0.5 rounded-xl bg-indigo-950 border border-indigo-500/50">
                    {roomCode}
                  </span>
                  <span className="text-xs font-sans font-semibold text-emerald-400 px-2.5 py-1 bg-emerald-500/20 rounded-full">
                    ● Ruangan Siap
                  </span>
                </div>
              </div>

              {/* Join another code */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Kode Teman..."
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase text-center w-32 focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Gabung</span>
                </button>
              </div>
            </div>

            {/* 4 Player Slots Indicator */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5 font-semibold">
                <span>Lobi Menunggu: {multiplayerPlayers.length} / 4 Pemain</span>
                {multiplayerPlayers.length < 4 ? (
                  <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Menunggu 4 pemain untuk mulai...
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    ✓ 4 Pemain Lengkap! Siap Lanjut
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const p = multiplayerPlayers[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center min-h-[90px] transition-all ${
                        p
                          ? 'bg-slate-950/80 border-indigo-400 text-white shadow-lg'
                          : 'bg-slate-950/30 border-dashed border-slate-800 text-slate-500'
                      }`}
                    >
                      {p ? (
                        <>
                          <span className="text-2xl mb-1">
                            {p.type === 'human' ? '👑' : '🤖'}
                          </span>
                          <span className="text-xs font-bold truncate max-w-[110px]">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                            Siap Bertanding
                          </span>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-lg opacity-40">⏳</span>
                          <div className="text-[11px] italic">Slot Kosong</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bot fill / quick match buttons */}
              {multiplayerPlayers.length < 4 && (
                <div className="flex gap-2.5 mt-3">
                  <button
                    onClick={handleQuickMatch}
                    disabled={isSearchingQuickMatch}
                    className="flex-1 py-2 px-4 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all"
                  >
                    {isSearchingQuickMatch ? 'Sedang Mencari Pemain...' : '🔍 Cari Lawan Cepat Otomatis'}
                  </button>
                  <button
                    onClick={handleAddBot}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Isi Bot Pengganti</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Profil</span>
        </button>

        <button
          onClick={handleProceed}
          disabled={mode === 'multiplayer' && multiplayerPlayers.length < 4}
          className={`px-8 py-3.5 rounded-2xl font-black font-fun text-base flex items-center gap-2 shadow-xl transition-transform ${
            mode === 'multiplayer' && multiplayerPlayers.length < 4
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-cyan-500/25 hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          <span>
            {mode === 'multiplayer' && multiplayerPlayers.length < 4
              ? 'Menunggu 4 Pemain...'
              : 'Lanjut: Pilih Level Kesulitan'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
