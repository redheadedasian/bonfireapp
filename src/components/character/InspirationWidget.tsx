import React from 'react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface InspirationWidgetProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
}

export function InspirationWidget({ active, onToggle, className = '' }: InspirationWidgetProps) {
  return (
    <div
      onClick={onToggle}
      className={`group relative cursor-pointer select-none flex items-center justify-center self-center w-full h-20 sm:h-24 md:h-28 lg:h-32 max-w-[210px] aspect-[1288/575] transition-all duration-300 isolate ${
        active
          ? 'opacity-100'
          : 'opacity-50 grayscale-[30%] hover:opacity-85 hover:grayscale-0 hover:brightness-100'
      } ${className}`}
      title={active ? 'Inspiration Active (Click to spend)' : 'Inspiration Inactive (Click to gain inspiration)'}
    >
      {/* Horizontal Calligraphic Ink Slash */}
      <BadgeBrushStroke variant="horizontal" id="insp" />

      {/* Background Radiant Aura when Active */}
      {active && (
        <div className="absolute inset-3 bg-[#E1BD72] blur-md opacity-30 rounded-full animate-pulse pointer-events-none z-0" />
      )}

      {/* Frame Asset: src/assets/inspiration.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.inspiration.svg}
        alt="Inspiration Frame"
        className={`medallion-frame frame-border w-full h-full object-contain pointer-events-none transition-all duration-300 z-10 ${
          active
            ? 'filter drop-shadow-[0_0_10px_var(--accent-glow)] brightness-110'
            : 'filter brightness-80'
        }`}
      />

      {/* Left Title Label in GWTwoFont */}
      <div className="absolute left-[8%] top-[25%] -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[9px] sm:text-[10px] md:text-[11px] text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          INSPIRATION
        </span>
      </div>

      {/* Text "ACTIVE" strictly centered within the inner horizontal slot */}
      <div className="absolute left-[36%] right-[10%] inset-y-0 translate-y-[3.5px] z-20 flex items-center justify-center pointer-events-none">
        <span
          className={`font-edo uppercase whitespace-nowrap text-center transition-all duration-300 ${
            active
              ? 'text-[#f3d78a] font-bold text-xs sm:text-sm tracking-wider drop-shadow-[0_0_8px_var(--accent-glow)]'
              : 'text-[#6e5d47] font-bold text-[10px] sm:text-[11px] tracking-wider opacity-60'
          }`}
        >
          ACTIVE
        </span>
      </div>
    </div>
  );
}

export default InspirationWidget;
