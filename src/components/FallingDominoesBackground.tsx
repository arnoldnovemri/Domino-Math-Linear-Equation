import React, { useMemo } from 'react';

interface FallingCard {
  id: number;
  left: number; // percentage 0-100
  duration: number; // seconds
  delay: number; // seconds
  leftVal: number;
  rightVal: number;
  size: number;
  rotation: number;
}

export const FallingDominoesBackground: React.FC = () => {
  const cards = useMemo<FallingCard[]>(() => {
    const list: FallingCard[] = [];
    for (let i = 0; i < 22; i++) {
      list.push({
        id: i,
        left: Math.random() * 94 + 2,
        duration: Math.random() * 6 + 7, // 7s to 13s
        delay: Math.random() * 8,
        leftVal: Math.floor(Math.random() * 7),
        rightVal: Math.floor(Math.random() * 7),
        size: Math.floor(Math.random() * 16) + 38, // 38px to 54px
        rotation: Math.random() * 60 - 30,
      });
    }
    return list;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {cards.map((c) => (
        <div
          key={c.id}
          className="absolute animate-falling-card select-none"
          style={{
            left: `${c.left}%`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            width: `${c.size}px`,
            height: `${c.size * 1.8}px`,
          }}
        >
          <div
            className="w-full h-full rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl border-2 border-slate-300/80 flex flex-col p-1.5 justify-between backdrop-blur-xs opacity-75"
            style={{ transform: `rotate(${c.rotation}deg)` }}
          >
            {/* Top Half */}
            <div className="flex-1 flex items-center justify-center border-b border-dashed border-slate-400">
              <PipsGrid count={c.leftVal} />
            </div>
            {/* Bottom Half */}
            <div className="flex-1 flex items-center justify-center">
              <PipsGrid count={c.rightVal} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PipsGrid: React.FC<{ count: number }> = ({ count }) => {
  const pips = Array.from({ length: count });
  return (
    <div className="grid grid-cols-3 gap-0.5 w-full h-full place-items-center p-0.5">
      {count === 0 && <span className="text-[9px] text-slate-400 font-bold">0</span>}
      {count > 0 &&
        pips.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-800 shadow-xs"
          />
        ))}
    </div>
  );
};
