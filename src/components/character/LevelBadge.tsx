import React from 'react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface LevelBadgeProps {
  level: number;
  className?: string;
  isEditMode: boolean;
  onUpdateLevel: (val: number) => void;
}

export function LevelBadge({
  level,
  className = '',
  isEditMode,
  onUpdateLevel,
}: LevelBadgeProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none w-full h-24 sm:h-28 md:h-32 max-w-[140px] aspect-[988/1021] group cursor-pointer isolate ${className}`}
      title={`Character Level: ${level}`}
    >
      {/* Calligraphic Ensō Brush Swipe */}
      <BadgeBrushStroke variant="circle" id="level" />

      {/* Background Frame: src/assets/level.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.level.svg}
        alt="Level Frame"
        className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-10"
      />

      {/* Top Title Label in GWTwoFont */}
      <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          LEVEL
        </span>
      </div>

      {/* Centered Single Level Number */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
        {isEditMode ? (
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => onUpdateLevel(parseInt(e.target.value, 10) || 1)}
            onClick={(e) => e.stopPropagation()}
            className="w-10 sm:w-12 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-[#FFFFFF] font-edo text-2xl sm:text-3xl font-bold rounded-sm p-0.5 focus:outline-none shadow-inner"
          />
        ) : (
          <span className="font-edo text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white group-hover:scale-105 transition-all leading-none">
            {level}
          </span>
        )}
      </div>
    </div>
  );
}

export default LevelBadge;
