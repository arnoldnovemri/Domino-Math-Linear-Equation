import React from 'react';
import { DominoCard } from '../types/game';

interface Props {
  card: DominoCard;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  showEquations?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: () => void;
  className?: string;
  faceColor?: string;
  borderColor?: string;
}

export const DominoTile: React.FC<Props> = ({
  card,
  orientation = 'vertical',
  size = 'md',
  showEquations = false,
  isPlayable = false,
  isSelected = false,
  isDraggable = false,
  onDragStart,
  onClick,
  className = '',
  borderColor = '#d1d5db',
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Proportional sizing matching real 2:1 domino standard
  const sizeClasses = {
    sm: isHorizontal ? 'w-16 h-8 text-xs' : 'w-8 h-16 text-xs',
    md: isHorizontal ? 'w-24 h-12 text-sm' : 'w-12 h-24 text-sm',
    lg: isHorizontal ? 'w-32 h-16 text-base' : 'w-16 h-32 text-base',
  }[size];

  return (
    <div
      draggable={isDraggable || isPlayable}
      onDragStart={onDragStart}
      onClick={isPlayable || onClick ? onClick : undefined}
      style={{
        borderColor: isSelected ? '#38bdf8' : borderColor,
      }}
      className={`relative select-none rounded-xl transition-all duration-200 border-2 flex ${
        isHorizontal ? 'flex-row' : 'flex-col'
      } ${sizeClasses} ${
        // Physical domino tile look: realistic ivory bone bevel and depth
        'bg-gradient-to-br from-[#fffdf9] via-[#f7f2e7] to-[#e8e1cf] shadow-[0_6px_12px_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.9)]'
      } ${
        isPlayable || isDraggable
          ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-cyan-500/50 hover:border-cyan-400 ring-2 ring-cyan-400/60'
          : ''
      } ${
        isSelected
          ? 'scale-105 ring-4 ring-cyan-400 shadow-xl shadow-cyan-400/50 -translate-y-1'
          : ''
      } ${className}`}
    >
      {/* First Half */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-1 overflow-hidden relative ${
          isHorizontal ? 'border-r border-[#cfc6b2]' : 'border-b border-[#cfc6b2]'
        }`}
      >
        {showEquations && !card.isSolved ? (
          <span className="text-[10px] md:text-xs font-mono font-extrabold text-indigo-950 text-center px-1 line-clamp-2 leading-tight">
            {card.leftEquation}
          </span>
        ) : (
          <DominoDots count={card.leftVal} size={size} />
        )}
      </div>

      {/* Middle Dividing Groove line */}
      <div
        className={`absolute bg-[#b5ab95] pointer-events-none shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)] ${
          isHorizontal
            ? 'top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2'
            : 'left-0 right-0 top-1/2 h-[2px] -translate-y-1/2'
        }`}
      />

      {/* Authentic Brass Spinner Pin (Centering Metal Rivet) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-700 via-amber-300 to-yellow-100 border border-amber-800 shadow-[0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none z-10"
        title="Spinner Pin Domino"
      />

      {/* Second Half */}
      <div className="flex-1 flex flex-col items-center justify-center p-1 overflow-hidden relative">
        {showEquations && !card.isSolved ? (
          <span className="text-[10px] md:text-xs font-mono font-extrabold text-purple-950 text-center px-1 line-clamp-2 leading-tight">
            {card.rightEquation}
          </span>
        ) : (
          <DominoDots count={card.rightVal} size={size} />
        )}
      </div>

      {/* Small numerical badge indicator */}
      {card.isSolved && (
        <div className="absolute -top-2 -right-2 bg-slate-900 text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-md border border-slate-700">
          {card.leftVal}:{card.rightVal}
        </div>
      )}
    </div>
  );
};

/**
 * Authentic recessed / countersunk domino pips (dots)
 */
const DominoDots: React.FC<{ count: number; size: 'sm' | 'md' | 'lg' }> = ({
  count,
  size,
}) => {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size];

  // Standard domino pips pattern (3x3 grid)
  const dotPatterns: Record<number, number[]> = {
    0: [],
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeIndices = dotPatterns[count] || [];

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      {count === 0 ? (
        <span className="text-[10px] font-bold text-slate-400/60 font-mono">&bull;</span>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full place-items-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div key={idx} className="flex items-center justify-center w-full h-full">
              {activeIndices.includes(idx) ? (
                <div
                  className={`${dotSize} rounded-full bg-[#1e2024] shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.9),0_0.5px_1px_rgba(255,255,255,0.8)] border border-slate-800`}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
