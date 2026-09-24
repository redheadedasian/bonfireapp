import React from 'react';
import { RefreshCw } from 'lucide-react';
import { GameAssetImg } from '../common/GameAssetImg';
import { ASSET_MAP } from '@/config/assets';
import { BadgeBrushStroke } from './BadgeBrushStroke';

interface DeathSavesOrbGroupProps {
  successes: number;
  failures: number;
  onToggleSuccess: (index: number) => void;
  onToggleFailure: (index: number) => void;
  onRoll?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DeathSavesOrbGroup({
  successes,
  failures,
  onToggleSuccess,
  onToggleFailure,
  onRoll,
  className = '',
}: DeathSavesOrbGroupProps) {
  // Socket centers precisely measured from the SVG asset (295x187):
  // X centers: x=97 (32.88%), x=147 (49.83%), x=198 (67.12%)
  // Y center for row 1 (successes): y=83 (44.4%)
  // Y center for row 2 (failures): y=140 (74.9%)
  const socketCols = ['32.88%', '49.83%', '67.12%'];
  const successRowY = '44.4%';
  const failureRowY = '74.9%';

  return (
    <div className={`relative select-none flex items-center justify-center self-center w-full h-20 sm:h-24 md:h-28 lg:h-32 max-w-[210px] aspect-[1229/779] group cursor-pointer isolate ${className}`}>
      {/* Wide Calligraphic Ink Wash Bar */}
      <BadgeBrushStroke variant="wide" id="deathsaves" />

      {/* Background Frame: src/assets/Death saves.svg */}
      <GameAssetImg
        src={ASSET_MAP.vitals.deathSaves.svg}
        alt="Death Saves Panel"
        className="medallion-frame frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-10"
      />

      {/* Top Title Label in GWTwoFont */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-20">
        <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
          DEATH SAVES
        </span>
      </div>

      {/* Quick Roll Trigger */}
      {onRoll && (
        <button
          onClick={onRoll}
          className="absolute top-1.5 right-2 sm:right-3 z-20 text-[#cccccc] hover:text-[var(--accent-ink)] transition-colors p-0.5 opacity-70 hover:opacity-100 flex items-center cursor-pointer"
          title="Roll d20 Death Saving Throw"
        >
          <RefreshCw size={10} className="hover:rotate-180 transition-transform duration-300" />
        </button>
      )}

      {/* Interactive Sockets Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        {/* Top Row: Success Sockets (1..3) */}
        {[1, 2, 3].map((i) => {
          const isFilled = successes >= i;
          const leftPos = socketCols[i - 1];

          return (
            <div
              key={`success-${i}`}
              onClick={() => onToggleSuccess(i)}
              style={{
                left: leftPos,
                top: successRowY,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute w-[12%] aspect-square cursor-pointer flex items-center justify-center rounded-full group/orb"
              title={`Success ${i}: Click to toggle`}
            >
              {/* Glowing Save Orb Asset with Emerald Aura - Halved glow */}
              {isFilled ? (
                <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-200">
                  <div className="absolute inset-[-1px] bg-[#1EB253] blur-[2px] opacity-40 rounded-full animate-pulse pointer-events-none" />
                  <GameAssetImg
                    src={ASSET_MAP.vitals.deathSaves.saveOrb.svg}
                    fallbackSrc={ASSET_MAP.vitals.deathSaves.saveOrb.png}
                    alt="Save Orb"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_3px_rgba(30,178,83,0.5)] brightness-105 relative z-10"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full opacity-0 group-hover/orb:opacity-20 bg-[#1EB253] transition-opacity border border-[#1EB253]/30" />
              )}
            </div>
          );
        })}

        {/* Bottom Row: Failure Sockets (1..3) */}
        {[1, 2, 3].map((i) => {
          const isFilled = failures >= i;
          const leftPos = socketCols[i - 1];

          return (
            <div
              key={`failure-${i}`}
              onClick={() => onToggleFailure(i)}
              style={{
                left: leftPos,
                top: failureRowY,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute w-[12%] aspect-square cursor-pointer flex items-center justify-center rounded-full group/orb"
              title={`Failure ${i}: Click to toggle`}
            >
              {/* Glowing Ruby Skull Orb Asset with Crimson Aura - Halved glow */}
              {isFilled ? (
                <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-200">
                  <div className="absolute inset-[-1px] bg-[#E33526] blur-[2px] opacity-45 rounded-full animate-pulse pointer-events-none" />
                  <GameAssetImg
                    src={ASSET_MAP.vitals.deathSaves.failOrb.svg}
                    fallbackSrc={ASSET_MAP.vitals.deathSaves.failOrb.png}
                    alt="Fail Orb"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(227,53,38,0.5)] brightness-105 relative z-10"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full opacity-0 group-hover/orb:opacity-20 bg-[#E33526] transition-opacity border border-[#E33526]/30" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
