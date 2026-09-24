import React from 'react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface SpeedBadgeProps {
  speed: number;
  isEditMode?: boolean;
  onUpdateSpeed: (val: number) => void;
  className?: string;
}

export function SpeedBadge({ speed, isEditMode = false, onUpdateSpeed, className = '' }: SpeedBadgeProps) {
  return (
    <div
      className={`relative flex items-center justify-center self-center select-none w-full h-20 sm:h-24 md:h-28 lg:h-32 max-w-[170px] aspect-[1200/696] group cursor-pointer isolate ${className}`}
      title={`Speed: ${speed} ft.`}
    >
      {/* Dynamic Calligraphic Brush Sweep */}
      <BadgeBrushStroke variant="horizontal" id="speed" />

      {/* Background Frame: src/assets/speed.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.speed.svg}
        alt="Speed Frame"
        className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-10"
      />

      {/* Top Title Label in GWTwoFont */}
      <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          SPEED
        </span>
      </div>

      {/* Centered Speed Number and Unit */}
      <div className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
        {isEditMode ? (
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              value={speed}
              onChange={(e) => onUpdateSpeed(parseInt(e.target.value, 10) || 0)}
              onClick={(e) => e.stopPropagation()}
              className="w-10 sm:w-12 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-[#FFFFFF] font-edo text-xl sm:text-2xl font-bold rounded-sm p-0.5 focus:outline-none"
            />
            <span className="text-xs sm:text-sm font-edo font-bold text-white/90 tracking-wider">ft.</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-edo text-2xl sm:text-3xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors leading-none">
              {speed}
            </span>
            <span className="text-xs sm:text-sm font-edo font-bold text-white/90 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none">
              ft.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
