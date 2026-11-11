import React from 'react';
import { ArenaTheme } from '../types/themes';

interface Props {
  theme: ArenaTheme;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ArenaVisualCard: React.FC<Props> = ({
  theme,
  isSelected = false,
  onClick,
  size = 'md',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border-2 select-none flex flex-col ${
        isSelected
          ? 'border-cyan-400 ring-4 ring-cyan-400/30 scale-[1.02] shadow-2xl shadow-cyan-500/25'
          : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-xl'
      } ${size === 'lg' ? 'h-80 md:h-96' : 'h-64'}`}
    >
      {/* Visual Panorama Artwork Canvas */}
      <div className="relative w-full flex-1 overflow-hidden">
        {theme.id === 'cyber-classroom' && <CyberClassroomArtwork />}
        {theme.id === 'sakura-garden' && <SakuraGardenArtwork />}
        {theme.id === 'neon-cosmos' && <NeonCosmosArtwork />}
        {theme.id === 'ancient-library' && <AncientLibraryArtwork />}

        {/* Top Tag & Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-md">
          <span>{theme.badge}</span>
        </div>

        {/* Selected Tick Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-lg animate-bounce">
            ✓
          </div>
        )}
      </div>

      {/* Card Info Details Footer */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col justify-between backdrop-blur-md">
        <div>
          <h4 className="font-bold text-base md:text-lg font-fun text-white flex items-center justify-between">
            <span>{theme.name}</span>
            <span className="text-xs font-sans text-cyan-400 font-normal">
              {isSelected ? 'Dipilih' : 'Klik untuk Pilih'}
            </span>
          </h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {theme.description}
          </p>
        </div>

        {/* Particles preview */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Atmosfer:
          </span>
          <div className="flex gap-1.5">
            {theme.particles.map((p, i) => (
              <span key={i} className="text-sm">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 1. Ruang Kelas Futuristik (Cyber Classroom) Visual Illustration
 */
const CyberClassroomArtwork: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-950 via-[#071328] to-[#042442] overflow-hidden flex items-center justify-center">
      {/* 3D Perspective Grid Floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          transform: 'perspective(220px) rotateX(60deg) translateY(20px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Glowing Holographic Blackboard */}
      <div className="relative z-10 w-4/5 h-3/5 rounded-2xl bg-cyan-950/40 border-2 border-cyan-400/60 p-3 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xs flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] text-cyan-300 font-mono font-bold border-b border-cyan-500/30 pb-1">
          <span>HOLO-CHALKBOARD v4.2</span>
          <span className="animate-pulse">● LIVE QUANTUM</span>
        </div>

        <div className="text-center font-mono space-y-1">
          <div className="text-xs md:text-sm text-cyan-200 font-extrabold tracking-wider">
            3x - 5 = 7 &rArr; x = 4
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold opacity-90">
            5x + 2 = 3x + 8 &rArr; 2x = 6
          </div>
          <div className="text-[10px] text-cyan-500">
            &Sigma;(Domino Matrix) = 28 Kartu
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] text-cyan-400 font-mono">
          <span>[LINEAR EQUATION 1V]</span>
          <span>99.9% SYNC</span>
        </div>
      </div>

      {/* Floating 3D Geometric Cyber Cubes & Particles */}
      <div className="absolute top-4 left-6 text-xl text-cyan-300 opacity-70 animate-float">
        📐
      </div>
      <div className="absolute bottom-10 right-6 text-xl text-cyan-400 opacity-80 animate-float" style={{ animationDelay: '1s' }}>
        ⚡
      </div>
      <div className="absolute top-12 right-10 text-base text-cyan-200 opacity-60 animate-float" style={{ animationDelay: '2s' }}>
        ∫
      </div>
    </div>
  );
};

/**
 * 2. Taman Sakura Aljabar (Algebra Garden) Visual Illustration
 */
const SakuraGardenArtwork: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#2e1065] via-[#4c0519] to-[#1c1917] overflow-hidden flex items-end justify-center">
      {/* Giant Soft Moon & Mt Fuji Silhouette */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-b from-rose-200 to-rose-400/40 opacity-80 shadow-[0_0_40px_rgba(251,113,133,0.5)]" />
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[70px] border-l-transparent border-r-[70px] border-r-transparent border-b-[60px] border-b-slate-900 opacity-90"
      />

      {/* Traditional Wooden Pagoda Roof Silhouette */}
      <div className="absolute bottom-8 right-5 z-10 w-16 h-20 flex flex-col items-center">
        <div className="w-14 h-3 bg-rose-950 border-t border-rose-400 rounded-t-full shadow-md" />
        <div className="w-10 h-3 bg-stone-900 mt-0.5" />
        <div className="w-16 h-4 bg-rose-950 border-t border-rose-400 rounded-t-full" />
        <div className="w-12 h-6 bg-stone-900 mt-0.5" />
      </div>

      {/* Zen Garden Stone Lantern (Tōrō) */}
      <div className="absolute bottom-4 left-6 z-10 flex flex-col items-center opacity-85">
        <div className="w-8 h-2 bg-stone-700 rounded-full" />
        <div className="w-6 h-6 bg-amber-500/80 rounded shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
        <div className="w-4 h-6 bg-stone-800" />
        <div className="w-10 h-2 bg-stone-700 rounded-full" />
      </div>

      {/* Blooming Cherry Blossom Branch */}
      <div className="absolute top-0 right-0 w-36 h-28 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M100,0 Q60,20 40,40 Q20,60 10,90"
            fill="none"
            stroke="#451a03"
            strokeWidth="4"
          />
          <circle cx="45" cy="35" r="7" fill="#f472b6" opacity="0.9" />
          <circle cx="65" cy="20" r="8" fill="#fda4af" opacity="0.9" />
          <circle cx="80" cy="15" r="9" fill="#fb7185" opacity="0.9" />
          <circle cx="30" cy="55" r="6" fill="#f43f5e" opacity="0.9" />
          <circle cx="15" cy="80" r="5" fill="#fda4af" opacity="0.9" />
        </svg>
      </div>

      {/* Falling Sakura Petals */}
      <div className="absolute top-10 left-12 text-sm text-pink-300 animate-float opacity-80">
        🌸
      </div>
      <div className="absolute top-20 left-1/3 text-xs text-rose-300 animate-float opacity-75" style={{ animationDelay: '1.2s' }}>
        🌸
      </div>
      <div className="absolute bottom-16 left-1/2 text-sm text-pink-200 animate-float opacity-90" style={{ animationDelay: '2.5s' }}>
        🌸
      </div>
    </div>
  );
};

/**
 * 3. Arena Kosmik Neon (Neon Cosmos) Visual Illustration
 */
const NeonCosmosArtwork: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#090014] via-[#1e0836] to-[#050515] overflow-hidden flex items-center justify-center">
      {/* Cosmic Nebula Swirls */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-purple-600/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-cyan-600/25 blur-2xl pointer-events-none" />

      {/* Saturn-like Ringed Planet with Neon Glow */}
      <div className="relative z-10 w-24 h-24 flex items-center justify-center animate-float">
        {/* Planet Sphere */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.7)] relative overflow-hidden">
          <div className="absolute top-3 left-0 right-0 h-2 bg-white/20 -rotate-12" />
          <div className="absolute top-8 left-0 right-0 h-3 bg-purple-950/40 -rotate-12" />
        </div>

        {/* Planet Rings */}
        <div
          className="absolute w-36 h-10 rounded-full border-4 border-cyan-300/80 -rotate-25 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          style={{ transform: 'rotate(-25deg) scaleY(0.35)' }}
        />
      </div>

      {/* Twinkling Constellations & Math Geometries */}
      <div className="absolute top-6 left-10 text-xs text-amber-300 animate-ping">
        ⭐
      </div>
      <div className="absolute top-8 right-14 text-sm text-purple-300 animate-pulse">
        ✨
      </div>
      <div className="absolute bottom-8 left-8 text-sm text-cyan-300">
        💫
      </div>
      <div className="absolute bottom-10 right-10 text-xs text-pink-300 animate-ping" style={{ animationDelay: '1s' }}>
        ⭐
      </div>
    </div>
  );
};

/**
 * 4. Perpustakaan Kuno Mesir (Ancient Library) Visual Illustration
 */
const AncientLibraryArtwork: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#1c120c] via-[#2d1806] to-[#120a04] overflow-hidden flex items-center justify-between px-6">
      {/* Stone Hieroglyphic Pillars (Left & Right) */}
      <div className="w-10 h-full bg-gradient-to-r from-amber-950 to-stone-900 border-x border-amber-600/40 relative flex flex-col justify-around items-center py-4">
        <span className="text-[10px] text-amber-400 opacity-70">𓀀</span>
        <span className="text-[10px] text-amber-300 opacity-80">𓃭</span>
        <span className="text-[10px] text-yellow-500 opacity-70">𓆣</span>
        <span className="text-[10px] text-amber-300 opacity-90">𓅃</span>
      </div>

      {/* Center Grand Archway with Torch & Papyrus Scrolls */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Golden Pyramid Silhouette in Desert Window */}
        <div className="w-24 h-24 rounded-t-full bg-gradient-to-b from-amber-500/20 to-amber-950/60 border border-amber-500/40 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[35px] border-b-amber-500/90" />
        </div>

        {/* Flickering Torches & Scrolls */}
        <div className="flex items-center gap-4 mt-2">
          <div className="text-base text-amber-400 animate-bounce">
            🔥
          </div>
          <div className="text-xl">
            📜
          </div>
          <div className="text-base text-amber-400 animate-bounce" style={{ animationDelay: '0.5s' }}>
            🔥
          </div>
        </div>

        <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-widest mt-1">
          Koleksi Al-Khwarizmi
        </div>
      </div>

      {/* Right Column */}
      <div className="w-10 h-full bg-gradient-to-l from-amber-950 to-stone-900 border-x border-amber-600/40 relative flex flex-col justify-around items-center py-4">
        <span className="text-[10px] text-amber-300 opacity-80">𓅃</span>
        <span className="text-[10px] text-yellow-500 opacity-70">𓆣</span>
        <span className="text-[10px] text-amber-400 opacity-70">𓃭</span>
        <span className="text-[10px] text-amber-300 opacity-90">𓀀</span>
      </div>
    </div>
  );
};
