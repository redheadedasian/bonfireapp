import React from 'react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface HitDiceBadgeProps {
  current: number;
  total: string | number;
  dieType?: string;
  isEditMode?: boolean;
  onUpdateCurrent: (val: number) => void;
  onUpdateTotal: (val: string) => void;
  className?: string;
}

export function HitDiceBadge({
  current,
  total,
  dieType = 'd8',
  isEditMode = false,
  onUpdateCurrent,
  onUpdateTotal,
  className = '',
}: HitDiceBadgeProps) {
  const numericTotal = typeof total === 'number' ? total : parseInt(total, 10) || 5;

  return (
    <div
      className={`relative flex items-center justify-center self-center select-none w-full h-20 sm:h-24 md:h-28 lg:h-32 max-w-[160px] aspect-[908/858] group isolate ${className}`}
      title={`Hit Dice: ${current}/${total}`}
    >
      {/* Square Calligraphic Ink Wash */}
      <BadgeBrushStroke variant="square" id="hitdice" />

      {/* Background Frame: src/assets/hit dice.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.hitDice.svg}
        alt="Hit Dice Frame"
        className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-10"
      />

      {/* Top Title Label in GWTwoFont */}
      <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          HIT DICE
        </span>
      </div>

      {/* Centered Hit Dice Value in opening */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20">
        {isEditMode ? (
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              min={0}
              max={numericTotal}
              value={current}
              onChange={(e) => onUpdateCurrent(parseInt(e.target.value, 10) || 0)}
              onClick={(e) => e.stopPropagation()}
              className="w-8 sm:w-9 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-[#FFFFFF] font-edo text-sm sm:text-base font-bold rounded-sm p-0.5 focus:outline-none"
            />
            <span className="text-white/80 font-edo text-xs">/</span>
            <input
              type="text"
              value={total}
              onChange={(e) => onUpdateTotal(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-9 sm:w-11 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-white font-edo text-xs sm:text-sm font-bold rounded-sm p-0.5 focus:outline-none"
            />
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-edo text-2xl sm:text-3xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors leading-none">
              {current}
            </span>
            <span className="font-edo text-xs sm:text-sm font-bold text-white/90 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none">
              /{total}
            </span>
          </div>
        )}

        {/* Hit Dice Spend/Recover Stepper Buttons */}
        {!isEditMode && (
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateCurrent(Math.max(0, current - 1));
              }}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#120B08] border border-[#8C4A21] hover:border-[#E33526] text-[#E33526] hover:bg-[#8C4A21]/40 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer leading-none"
              title="Spend 1 Hit Die"
            >
              -
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateCurrent(Math.min(numericTotal, current + 1));
              }}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0B140E] border border-[#1EB253]/60 hover:border-[#68D391] text-[#68D391] hover:bg-[#1EB253]/40 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer leading-none"
              title="Recover 1 Hit Die"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
