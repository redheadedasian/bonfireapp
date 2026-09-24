import React from 'react';
import { formatModifier } from '../../utils';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface InitiativeBadgeProps {
  bonus: number;
  isEditMode?: boolean;
  onUpdateBonus: (val: number) => void;
  onRoll: () => void;
  className?: string;
}

export function InitiativeBadge({
  bonus,
  isEditMode = false,
  onUpdateBonus,
  onRoll,
  className = '',
}: InitiativeBadgeProps) {
  const formatted = formatModifier(bonus);

  return (
    <div
      onClick={() => !isEditMode && onRoll()}
      className={`relative flex items-center justify-center self-center select-none w-full h-20 sm:h-24 md:h-28 lg:h-32 max-w-[160px] aspect-[979/925] group isolate ${
        !isEditMode ? 'cursor-pointer' : ''
      } ${className}`}
      title={!isEditMode ? `Initiative (${formatted}): Click to roll` : undefined}
    >
      {/* Dynamic Diagonal Calligraphic Slash */}
      <BadgeBrushStroke variant="diagonal" id="initiative" />

      {/* Background Frame: src/assets/initiative.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.initiative.svg}
        alt="Initiative Frame"
        className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-10"
      />

      {/* Top Title Label in GWTwoFont */}
      <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          INITIATIVE
        </span>
      </div>

      {/* Centered Modifier inside the opening */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
        {isEditMode ? (
          <input
            type="number"
            value={bonus}
            onChange={(e) => onUpdateBonus(parseInt(e.target.value, 10) || 0)}
            onClick={(e) => e.stopPropagation()}
            className="w-10 sm:w-12 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-[#FFFFFF] font-edo text-xl sm:text-2xl font-bold rounded-sm p-0.5 focus:outline-none"
          />
        ) : (
          <span className="font-edo text-2xl sm:text-3xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors leading-none">
            {formatted}
          </span>
        )}
      </div>
    </div>
  );
}
