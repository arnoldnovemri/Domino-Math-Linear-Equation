import React, { useState } from 'react';
import { AvatarConfig, GameDifficulty, GameMode, Player } from '../types/game';
import { ARENA_THEMES, ArenaTheme } from '../types/themes';
import { Avatar3DViewer } from './Avatar3DViewer';
import { sounds } from '../services/soundEffects';
import {
  Sparkles,
  Trophy,
  Users,
  Bot,
  Play,
  Volume2,
  VolumeX,
  Plus,
  Key,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  playerName: string;
  avatar: AvatarConfig;
  coins: number;
  onStartMatch: (mode: GameMode, difficulty: GameDifficulty, theme: ArenaTheme, customRoomPlayers?: Player[]) => void;
  onOpenCustomizer: () => void;
  onOpenLeaderboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LobbyView: React.FC<Props> = ({
  playerName,
  avatar,
  coins,
  onStartMatch,
  onOpenCustomizer,
  onOpenLeaderboard,
  isMuted,
  onToggleMute,
}) => {
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(ARENA_THEMES[0].id);

  // Multiplayer Room state
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
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
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState<boolean>(false);

  const selectedTheme = ARENA_THEMES.find((t) => t.id === selectedThemeId) || ARENA_THEMES[0];

  // Create room
  const handleCreateRoom = () => {
    sounds.playClick();
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoomCode(code);
    setMultiplayerPlayers([
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
  };

  // Simulate quick match or bots joining to reach 4 players
  const handleQuickMatch = () => {
    sounds.playClick();
    setIsSearchingQuickMatch(true);

    const botNames = ['Budi Euler', 'Siti Gauss', 'Dewi Lovelace', 'Arya Turing', 'Rian Al-Khwarizmi'];
    const shuffled = [...botNames].sort(() => Math.random() - 0.5);

    let count = 1;
    const interval = setInterval(() => {
      count++;
      sounds.playTileSnap();
      setMultiplayerPlayers((prev) => [
        ...prev,
        {
          id: `bot_player_${count}`,
          name: shuffled[count - 2],
          avatar: {
            ...avatar,
            hairColor: ['#ef4444', '#10b981', '#f59e0b', '#ec4899'][count % 4],
            outfitColor: ['#06b6d4', '#e11d48', '#8b5cf6', '#10b981'][count % 4],
            headwear: count === 2 ? 'headset' : count === 3 ? 'visor' : 'catears',
          },
          type: 'ai',
          cards: [],
          score: 0,
          isReady: true,
          coins: 200,
          rankPoints: 1100 + count * 50,
        },
      ]);

      if (count >= 4) {
        clearInterval(interval);
        setIsSearchingQuickMatch(false);
      }
    }, 1000);
  };

  // Join room
  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    sounds.playClick();
    setRoomCode(joinCodeInput.toUpperCase());
    handleQuickMatch();
  };

  // Add a bot immediately to fill empty slot
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

  const handleStart = () => {
    sounds.playClick();
    if (mode === 'multiplayer' && multiplayerPlayers.length < 4) {
      sounds.playWrongBuzz();
      return;
    }
    onStartMatch(mode, difficulty, selectedTheme, mode === 'multiplayer' ? multiplayerPlayers : undefined);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-between p-4 z-10">
      {/* Top Header Navbar */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-slate-950 font-fun text-xl shadow-lg">
            DM
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-fun text-white tracking-wide">
              Domino Math
            </h1>
            <p className="text-xs text-slate-400">
              Permainan Domino Aljabar Persamaan Linear 1 Variabel
            </p>
          </div>
        </div>

        {/* Global Buttons: Leaderboard, Shop, Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Peringkat Global</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenCustomizer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{coins} Koin</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title={isMuted ? 'Nyalakan Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-stretch">
        {/* Left: 3D Character Profile Card */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between">
          <div className="w-full text-center">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Profil Pemain
            </span>
            <h2 className="text-xl font-bold font-fun text-white mt-0.5">{playerName}</h2>
          </div>

          {/* Interactive 3D Avatar */}
          <div className="w-48 h-56 flex items-center justify-center my-2">
            <Avatar3DViewer avatar={avatar} className="w-full h-full" interactive={true} />
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCustomizer();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-950 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Kustomisasi Avatar 3D & Toko Skin</span>
            </button>
          </div>
        </div>

        {/* Right: Mode, Room, Arena Map Configuration */}
        <div className="lg:col-span-8 flex flex-col gap-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          {/* Game Mode Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Pilih Mode Permainan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setMode('ai');
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  mode === 'ai'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/20 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Lawan AI Cerdas</div>
                  <div className="text-[11px] text-slate-400">Main solo vs 3 bot AI</div>
                </div>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setMode('multiplayer');
                  if (!roomCode) handleCreateRoom();
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  mode === 'multiplayer'
                    ? 'bg-indigo-950/50 border-indigo-400 ring-2 ring-indigo-400/20 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Multiplayer 4 Pemain</div>
                  <div className="text-[11px] text-slate-400">Sistem ruang pribadi real-time</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Sub-settings: AI Difficulty vs Multiplayer Room */}
          {mode === 'ai' ? (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tingkat Kesulitan AI:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'easy', label: 'Mudah', desc: 'Langkah santai' },
                  { id: 'medium', label: 'Sedang', desc: 'Taktik seimbang' },
                  { id: 'hard', label: 'Sulit', desc: 'Pemblokiran pintar' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => {
                      sounds.playClick();
                      setDifficulty(diff.id as GameDifficulty);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      difficulty === diff.id
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{diff.label}</div>
                    <div className="text-[10px] opacity-80">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/70 border border-indigo-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Ruang Pribadi (Kode Room)
                  </span>
                  <div className="text-lg font-mono font-extrabold text-white flex items-center gap-2 mt-0.5">
                    <span>{roomCode || 'MEMBUAT...'}</span>
                    <span className="text-[10px] font-sans font-normal px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                      Tersambung
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Kode Ruang..."
                    maxLength={5}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white uppercase font-mono text-center"
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Gabung</span>
                  </button>
                </div>
              </div>

              {/* 4 Player Slots Indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
                  <span>Slot Pemain ({multiplayerPlayers.length} / 4)</span>
                  {multiplayerPlayers.length < 4 && (
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Menunggu 4 pemain untuk mulai...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const p = multiplayerPlayers[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center min-h-[70px] ${
                          p
                            ? 'bg-slate-900 border-indigo-500/50 text-white'
                            : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                        }`}
                      >
                        {p ? (
                          <>
                            <span className="text-base mb-0.5">
                              {p.type === 'human' ? '👑' : '🤖'}
                            </span>
                            <span className="text-xs font-bold truncate max-w-[100px]">
                              {p.name}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-semibold">
                              Siap
                            </span>
                          </>
                        ) : (
                          <span className="text-xs italic">Menunggu...</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {multiplayerPlayers.length < 4 && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleQuickMatch}
                      disabled={isSearchingQuickMatch}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all"
                    >
                      {isSearchingQuickMatch ? 'Mencari Lawan Cepat...' : '🔍 Cari Lawan Otomatis'}
                    </button>
                    <button
                      onClick={handleAddBot}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Isi Bot</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Arena / Map Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              2. Pilih Peta / Tema Arena
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ARENA_THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedThemeId(theme.id);
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/30 scale-102 shadow-lg'
                        : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-lg mb-1">{theme.badge.split(' ')[0]}</div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {theme.name}
                      </h4>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                      {theme.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Launch Match Bar */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Arena:{' '}
          <strong className="text-white">{selectedTheme.name}</strong> &bull; Total 28 Kartu Domino (7 Kartu / Pemain)
        </div>

        <button
          onClick={handleStart}
          disabled={mode === 'multiplayer' && multiplayerPlayers.length < 4}
          className={`px-8 py-3.5 rounded-2xl font-bold font-fun text-base flex items-center gap-2 shadow-xl transition-transform active:scale-95 ${
            mode === 'multiplayer' && multiplayerPlayers.length < 4
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-cyan-500/25 hover:scale-105'
          }`}
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>
            {mode === 'multiplayer' && multiplayerPlayers.length < 4
              ? 'Tunggu 4 Pemain...'
              : 'Mulai Permainan!'}
          </span>
        </button>
      </div>
    </div>
  );
};
