import React from 'react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface ArmorClassMedallionProps {
  ac: number;
  isEditMode: boolean;
  onUpdateAc: (val: number) => void;
}

export function ArmorClassMedallion({ ac, isEditMode, onUpdateAc }: ArmorClassMedallionProps) {
  return (
    <div className="w-full h-[100px] sm:h-[108px] lg:h-[114px] flex items-center justify-center pt-1.5 sm:pt-2">
      <div
        className="relative flex items-center justify-center select-none h-full aspect-[754/1008] group cursor-pointer isolate"
        title={`Armor Class: ${ac}`}
      >
        {/* Dynamic Shield Calligraphic Brush Slash */}
        <BadgeBrushStroke variant="shield" id="ac" />

        {/* Background Frame: src/assets/ac.svg */}
        <GameAssetImg
          src={ASSET_MAP.vitals.ac.svg}
          alt="Armor Class Frame"
          className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_14px_var(--accent-glow)] transition-all duration-200 z-10"
        />

        {/* Top Title Label */}
        <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
          <span className="font-gw2 font-bold text-xs sm:text-sm text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
            AC
          </span>
        </div>

        {/* Hero AC Value positioned in the central shield opening */}
        <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
          {isEditMode ? (
            <input
              type="number"
              min={1}
              max={35}
              value={ac}
              onChange={(e) => onUpdateAc(parseInt(e.target.value, 10) || 10)}
              onClick={(e) => e.stopPropagation()}
              className="w-10 sm:w-12 text-center bg-black/90 border border-black/30 focus:border-[var(--accent-ink)] text-[#FFFFFF] font-edo text-2xl sm:text-3xl font-bold rounded-sm p-0.5 focus:outline-none shadow-inner"
            />
          ) : (
            <span className="font-edo text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white transition-all leading-none">
              {ac}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
