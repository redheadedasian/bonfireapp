import React, { useState } from 'react';
import { ASSET_MAP } from '@/config/assets';

// D&D 5e Standard Experience Points by Level
export const LEVEL_XP_TABLE: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

export function getXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.min(20, level));
  return LEVEL_XP_TABLE[safeLevel] ?? 0;
}

export function getNextLevelXp(level: number): number {
  const nextLevel = Math.min(20, Math.max(1, level) + 1);
  return LEVEL_XP_TABLE[nextLevel] ?? 355000;
}

export function getLevelFromXp(xp: number): number {
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= LEVEL_XP_TABLE[lvl]) {
      return lvl;
    }
  }
  return 1;
}

export interface ExperienceBarProps {
  currentXp: number;
  level: number;
  isEditMode?: boolean;
  onUpdateXp: (xp: number) => void;
  onUpdateLevel?: (level: number) => void;
}

export function ExperienceBar({
  currentXp,
  level,
  isEditMode = false,
  onUpdateXp,
  onUpdateLevel,
}: ExperienceBarProps) {
  const [xpAmount, setXpAmount] = useState<string>('');

  const safeCurrentXp = Math.max(0, currentXp);
  const safeLevel = Math.max(1, Math.min(20, level));
  const tierMin = getXpForLevel(safeLevel);
  const tierMax = getNextLevelXp(safeLevel);

  // Calculate percentage within current tier
  let percent = 100;
  if (safeLevel < 20 && tierMax > tierMin) {
    const progressInTier = Math.max(0, safeCurrentXp - tierMin);
    const tierSpan = tierMax - tierMin;
    percent = Math.min(100, Math.max(0, (progressInTier / tierSpan) * 100));
  } else if (safeLevel >= 20) {
    percent = 100;
  }

  // Deduct XP (Subtract)
  const handleDeductXp = () => {
    const val = Math.max(0, parseInt(xpAmount, 10) || 0);
    if (val <= 0) return;
    const nextXp = Math.max(0, safeCurrentXp - val);
    onUpdateXp(nextXp);
    const calcLevel = getLevelFromXp(nextXp);
    if (calcLevel !== safeLevel && onUpdateLevel) {
      onUpdateLevel(calcLevel);
    }
    setXpAmount('');
  };

  // Award XP (Add)
  const handleAwardXp = () => {
    const val = Math.max(0, parseInt(xpAmount, 10) || 0);
    if (val <= 0) return;
    const nextXp = safeCurrentXp + val;
    onUpdateXp(nextXp);
    const calcLevel = getLevelFromXp(nextXp);
    if (calcLevel !== safeLevel && onUpdateLevel) {
      onUpdateLevel(calcLevel);
    }
    setXpAmount('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAwardXp();
      (e.target as HTMLInputElement).blur();
    }
  };

  const xpAssets = ASSET_MAP.vitals.xp;

  return (
    <div
      className="flex flex-col items-center select-none w-full max-w-none overflow-visible opacity-90 hover:opacity-100 transition-opacity duration-300"
      id="experience-module"
    >
      {/* 1. Main Experience & Level Frame with Crest & Calibrated Cutout Chamber */}
      <div className="w-full flex items-center justify-center overflow-visible">
        <div
          className="relative w-full max-w-[520px] aspect-[872/255] group flex items-center justify-center overflow-visible"
          id="experience-bar-frame"
        >
          {/* Layer 0 (Chamber Base & Dynamic Amber/Gold Progress Fill with Idle Animations) */}
          <div
            className="absolute left-[23.5%] right-[11.5%] top-[49%] bottom-[33%] bg-[#080706] rounded-xs overflow-hidden flex items-stretch z-0 shadow-inner"
            id="xp-progress-track"
          >
            {/* Dynamic Fill Bar with Gold Gradient, Sheen & Molten Pulse */}
            <div
              className="relative h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.5)] animate-xp-wave animate-liquid-breathe transition-all duration-300 ease-out flex-shrink-0 overflow-hidden"
              style={{ width: `${percent}%` }}
              id="xp-progress-fill"
            >
              {/* Subtle Sheen Sweep Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.18)_45%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.18)_55%,transparent_80%)] animate-sheen-sweep pointer-events-none" />
            </div>
          </div>

          {/* Layer 1 (Frame Overlay): The main sculpted XP frame asset */}
          <img
            src={xpAssets.bar}
            alt="Experience & Level Frame"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] group-hover:brightness-105 group-hover:drop-shadow-[0_0_14px_var(--accent-glow)] transition-all duration-200"
          />

          {/* Layer 2 (Top Title Label centered in upper plaque with GWTwoFont) */}
          <div className="absolute left-[23.5%] right-[11.5%] top-[21%] flex items-center justify-center z-20 pointer-events-none">
            <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
              EXPERIENCE
            </span>
          </div>

          {/* Layer 2A (Left Circular Crest Level container) */}
          <div
            className="absolute left-[1%] w-[18%] top-[15%] bottom-[15%] flex flex-col items-center justify-center z-20 pointer-events-none"
            id="level-crest-container"
          >
            <span className="text-[10px] sm:text-[11px] text-[#ffd700] tracking-widest uppercase font-gw2 font-bold leading-none mb-0.5">
              LVL
            </span>
            {isEditMode ? (
              <input
                type="number"
                min={1}
                max={20}
                value={safeLevel}
                onChange={(e) =>
                  onUpdateLevel?.(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))
                }
                onClick={(e) => e.stopPropagation()}
                className="w-10 text-center bg-black/90 border border-[#6F5326] focus:border-[#C49A50] text-[#FFFFFF] font-edo text-lg font-bold rounded-sm p-0.5 focus:outline-none shadow-inner pointer-events-auto"
                title="Edit Level"
              />
            ) : (
              <span
                className="font-edo text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-amber-100 transition-all leading-none"
                title={`Level ${safeLevel}`}
              >
                {safeLevel}
              </span>
            )}
          </div>

          {/* Layer 2B (Right Header: Next Level Target centered in upper black plate) */}
          <div className="absolute right-[11%] top-[28%] -translate-y-1/2 flex items-center justify-end z-20 text-[10px] sm:text-xs text-[#ffd700] font-gw2 font-bold uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none">
            {safeLevel >= 20 ? 'MAX LEVEL' : `NEXT LVL ${safeLevel + 1}`}
          </div>

          {/* Layer 2C (Center Bar Readout: Current XP / Next XP inside chamber) */}
          <div className="absolute left-[23.5%] right-[11.5%] top-[49%] bottom-[33%] flex items-center justify-center z-20 pointer-events-none text-xs sm:text-sm font-edo font-bold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {isEditMode ? (
              <div className="flex items-center gap-1.5 pointer-events-auto bg-black/90 px-2.5 py-0.5 rounded border border-[#6F5326] shadow-lg">
                <input
                  type="number"
                  min={0}
                  value={safeCurrentXp}
                  onChange={(e) => onUpdateXp(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 text-center bg-black border border-[#6F5326] focus:border-[#C49A50] text-[#FFFFFF] font-edo text-xs sm:text-sm font-bold rounded-sm p-0.5 focus:outline-none"
                  title="Current XP"
                />
                <span className="text-[#b5a895] font-edo font-bold text-xs">/</span>
                <span className="text-[#ffd700] font-edo text-xs sm:text-sm font-bold">
                  {tierMax.toLocaleString()} XP
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-edo font-bold text-sm sm:text-base text-[#FFFFFF] tracking-wide leading-none">
                  {safeCurrentXp.toLocaleString()}
                </span>
                <span className="font-edo text-xs font-bold text-[#d8cdba] leading-none">
                  /
                </span>
                <span className="font-edo font-bold text-sm sm:text-base text-[#ffd700] tracking-wide leading-none">
                  {tierMax.toLocaleString()} XP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Semantic XP Controls: [ Minus (-) Button ] | [ Text Box ] | [ Plus (+) Button ] */}
      <div
        className="w-full flex justify-center items-center mt-2.5"
        id="xp-controls-row-wrapper"
      >
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 w-auto max-w-sm sm:max-w-md mx-auto px-1"
          id="xp-controls-row"
        >
          {/* Left: Deduct Button (Minus) */}
          <button
            type="button"
            onClick={handleDeductXp}
            className="relative h-6 sm:h-7 aspect-[69/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Deduct entered XP amount"
            id="xp-deduct-button"
          >
            <img
              src={ASSET_MAP.vitals.hp.temp.blank}
              alt="Minus XP"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all"
            />
            <span className="absolute inset-0 flex items-center justify-center text-center font-gw2 font-bold leading-none text-[10px] sm:text-[11px] uppercase tracking-wider text-white group-hover/btn:text-rose-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none">
              MINUS
            </span>
          </button>

          {/* Center: Graphic Text Box with Centered Input */}
          <div 
            className="relative h-6 sm:h-7 aspect-[120/43] flex items-center justify-center flex-shrink-0 group/xp-box"
            id="xp-text-box-wrapper"
          >
            <img
              src={xpAssets.textBox}
              alt="XP Text Box"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/xp-box:brightness-110 transition-all"
            />
            <input
              type="number"
              min={0}
              placeholder="XP"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="relative z-10 w-full h-full bg-transparent border-0 outline-none text-center font-edo text-xs sm:text-sm font-bold text-amber-200 placeholder-amber-400/60 px-2 flex items-center justify-center focus:text-amber-100 leading-none"
              title="Enter XP amount to deduct or apply"
              id="xp-amount-input"
            />
          </div>

          {/* Right: Apply Button (Plus) */}
          <button
            type="button"
            onClick={handleAwardXp}
            className="relative h-6 sm:h-7 aspect-[69/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Add entered XP amount"
            id="xp-apply-button"
          >
            <img
              src={ASSET_MAP.vitals.hp.temp.blank}
              alt="Plus XP"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all"
            />
            <span className="absolute inset-0 flex items-center justify-center text-center font-gw2 font-bold leading-none text-[10px] sm:text-[11px] uppercase tracking-wider text-white group-hover/btn:text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none">
              PLUS
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperienceBar;
