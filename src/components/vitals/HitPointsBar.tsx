import React, { useState, useEffect, useRef } from 'react';
import { ASSET_MAP } from '@/config/assets';

interface HitPointsBarProps {
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  isEditMode?: boolean;
  onUpdateHp: (current: number, max: number) => void;
  onAdjustHp: (amount: number, type: 'damage' | 'heal' | 'temp') => void;
  onSetTempHp?: (temp: number) => void;
}

export function HitPointsBar({
  currentHp,
  maxHp,
  tempHp = 0,
  isEditMode = false,
  onUpdateHp,
  onAdjustHp,
  onSetTempHp,
}: HitPointsBarProps) {
  const [tempInputVal, setTempInputVal] = useState<string>('');

  // Health calculations
  const safeMaxHp = Math.max(1, maxHp);
  const safeCurrentHp = Math.max(0, currentHp);
  const safeTempHp = Math.max(0, tempHp);
  const totalCap = Math.max(safeMaxHp, safeCurrentHp + safeTempHp);

  const currentHpPercent = Math.min(100, Math.max(0, (safeCurrentHp / totalCap) * 100));
  const tempHpPercent = Math.min(100 - currentHpPercent, Math.max(0, (safeTempHp / totalCap) * 100));

  // Ghost Damage Bar (Skyrim-style damage catchup)
  const [ghostHpPercent, setGhostHpPercent] = useState<number>(currentHpPercent);
  const ghostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current);
      ghostTimeoutRef.current = null;
    }

    if (currentHpPercent < ghostHpPercent) {
      // Took damage: Wait 300ms then smoothly catch up over 700ms
      ghostTimeoutRef.current = setTimeout(() => {
        setGhostHpPercent(currentHpPercent);
      }, 300);
    } else {
      // Healed or equal: Snap immediately to current HP percent
      setGhostHpPercent(currentHpPercent);
    }

    return () => {
      if (ghostTimeoutRef.current) {
        clearTimeout(ghostTimeoutRef.current);
      }
    };
  }, [currentHpPercent]);

  const handleAddTemp = () => {
    const parsed = Math.max(0, parseInt(tempInputVal, 10) || 0);
    if (parsed > 0) {
      const newTemp = safeTempHp + parsed;
      if (onSetTempHp) {
        onSetTempHp(newTemp);
      } else {
        onAdjustHp(newTemp, 'temp');
      }
      setTempInputVal('');
    }
  };

  const handleTempKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTemp();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Health threshold styling based on (currentHp / maxHp) * 100
  const healthPercent = (safeCurrentHp / safeMaxHp) * 100;
  let healthColorClasses = 'bg-gradient-to-r from-emerald-600 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]';
  if (healthPercent < 25) {
    healthColorClasses = 'bg-gradient-to-r from-red-700 to-rose-600 shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse';
  } else if (healthPercent <= 50) {
    healthColorClasses = 'bg-gradient-to-r from-amber-600 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]';
  }

  const hpAssets = ASSET_MAP.vitals.hp;

  return (
    <div
      className="flex flex-col items-center select-none w-full max-w-none overflow-visible"
      id="hitpoints-module"
    >
      {/* 1. Main Hit Points Frame & Multi-Segment Dynamic Health Bar */}
      <div className="w-full flex items-center justify-center overflow-visible">
        <div
          className="relative w-full max-w-[520px] aspect-[872/255] group flex items-center justify-center overflow-visible"
          id="hitpoints-bar-frame"
        >
          {/* Layer 0 & 1 (Chamber Base, Ghost Damage Bar & Multi-Segment Progress Fill) */}
          <div 
            className="absolute left-[23.5%] right-[11.5%] top-[49%] bottom-[33%] bg-[#080706] rounded-xs overflow-hidden flex items-stretch z-0 shadow-inner"
            id="hp-progress-track"
          >
            {/* Ghost Damage Bar (Behind current HP, smoothly catches up on damage) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-red-950/90 transition-all duration-700 ease-out z-0 pointer-events-none"
              style={{ width: `${ghostHpPercent}%` }}
              id="hp-ghost-bar"
            />

            {/* Current HP Fill: Dynamic gradient based on health threshold */}
            <div
              className={`relative h-full ${healthColorClasses} animate-liquid-breathe transition-all duration-150 ease-out flex-shrink-0 z-10 overflow-hidden`}
              style={{ width: `${currentHpPercent}%` }}
              id="hp-current-fill"
            >
              {/* Subtle Sheen Sweep */}
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.18)_45%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.18)_55%,transparent_80%)] animate-sheen-sweep pointer-events-none" />
            </div>

            {/* Temp HP Fill: Crystalline Cyan-to-Blue progress stacked directly to the right */}
            {safeTempHp > 0 && (
              <div
                className="relative h-full bg-gradient-to-r from-cyan-500 to-blue-400 border-l border-cyan-300/40 shadow-[0_0_10px_rgba(56,189,248,0.6)] transition-all duration-300 ease-out flex-shrink-0 z-10 overflow-hidden"
                style={{ width: `${tempHpPercent}%` }}
                id="hp-temp-fill"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.2)_45%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.2)_55%,transparent_80%)] animate-sheen-sweep pointer-events-none" />
              </div>
            )}
          </div>

          {/* Layer 2 (Frame Overlay): The unclipped HP frame asset */}
          <img
            src={hpAssets.frame}
            alt="Hit Points Frame"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] group-hover:brightness-105 group-hover:drop-shadow-[0_0_14px_var(--accent-glow)] transition-all duration-200"
          />

          {/* Layer 2A (Top Title Label centered in upper plaque with GWTwoFont) */}
          <div className="absolute left-[23.5%] right-[11.5%] top-[21%] flex items-center justify-center z-20 pointer-events-none">
            <span className="font-gw2 font-bold text-[10px] sm:text-[11px] md:text-xs text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-none select-none">
              HIT POINTS
            </span>
          </div>

          {/* Layer 3 (Centered Text Overlay): Live health numbers inside the cutout chamber */}
          <div className="absolute left-[23.5%] right-[11.5%] top-[49%] bottom-[33%] flex items-center justify-center z-20 pointer-events-none">
            {isEditMode ? (
              <div className="flex items-center gap-1.5 pointer-events-auto bg-black/90 px-2.5 py-0.5 rounded border border-[#6F5326] shadow-lg">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={currentHp}
                  onChange={(e) => onUpdateHp(Math.max(0, parseInt(e.target.value, 10) || 0), maxHp)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-12 text-center bg-black border border-[#6F5326] focus:border-[#C49A50] text-[#FFFFFF] font-edo text-xs sm:text-sm font-bold rounded-sm p-0.5 focus:outline-none"
                  title="Current HP"
                />
                <span className="text-[#b5a895] font-edo font-bold text-xs">/</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={maxHp}
                  onChange={(e) => onUpdateHp(currentHp, Math.max(1, parseInt(e.target.value, 10) || 1))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-12 text-center bg-black border border-[#6F5326] focus:border-[#C49A50] text-[#ffd700] font-edo text-xs sm:text-sm font-bold rounded-sm p-0.5 focus:outline-none"
                  title="Max HP"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                <span className="font-edo font-bold text-sm sm:text-base text-[#FFFFFF] tracking-wide leading-none">
                  {safeCurrentHp}
                </span>
                <span className="font-edo text-xs font-bold text-[#d8cdba] leading-none">
                  /
                </span>
                <span className="font-edo font-bold text-sm sm:text-base text-[#ffd700] tracking-wide leading-none">
                  {safeMaxHp}
                </span>
                {safeTempHp > 0 && (
                  <span className="font-edo font-bold text-sm sm:text-base text-cyan-200 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] ml-1 leading-none">
                    +{safeTempHp}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls Row: [-5] [-1] [+1] [+5] [temp hp text box] [add button] */}
      <div 
        className="w-full flex justify-center items-center mt-2.5"
        id="hp-controls-row-wrapper"
      >
        <div 
          className="flex items-center justify-center gap-1.5 sm:gap-2 w-auto max-w-sm sm:max-w-md mx-auto px-1"
          id="hp-controls-row"
        >
          {/* -5 Damage Button */}
          <button
            type="button"
            onClick={() => onAdjustHp(5, 'damage')}
            className="relative h-6 sm:h-7 aspect-[71/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Take 5 Damage (subtracts from Temp HP first)"
            id="hp-minus-5-btn"
          >
            <img
              src={hpAssets.modifiers.minus5}
              alt="-5 Damage"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all"
            />
          </button>

          {/* -1 Damage Button */}
          <button
            type="button"
            onClick={() => onAdjustHp(1, 'damage')}
            className="relative h-6 sm:h-7 aspect-[69/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Take 1 Damage (subtracts from Temp HP first)"
            id="hp-minus-1-btn"
          >
            <img
              src={hpAssets.modifiers.minus1}
              alt="-1 Damage"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all"
            />
          </button>

          {/* +1 Heal Button */}
          <button
            type="button"
            onClick={() => onAdjustHp(1, 'heal')}
            className="relative h-6 sm:h-7 aspect-[69/45] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Heal 1 HP (capped at Max HP)"
            id="hp-plus-1-btn"
          >
            <img
              src={hpAssets.modifiers.plus1}
              alt="+1 Heal"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all"
            />
          </button>

          {/* +5 Heal Button */}
          <button
            type="button"
            onClick={() => onAdjustHp(5, 'heal')}
            className="relative h-6 sm:h-7 aspect-[70/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Heal 5 HP (capped at Max HP)"
            id="hp-plus-5-btn"
          >
            <img
              src={hpAssets.modifiers.plus5}
              alt="+5 Heal"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all"
            />
          </button>

          {/* Temp HP Text Box */}
          <div 
            className="relative h-6 sm:h-7 aspect-[120/43] flex items-center justify-center flex-shrink-0 group/temp-box"
            id="hp-temp-text-box"
          >
            <img
              src={hpAssets.temp.textBox}
              alt="Temp HP Box"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/temp-box:brightness-110 transition-all"
            />
            <input
              type="number"
              min={0}
              max={999}
              value={tempInputVal}
              onChange={(e) => setTempInputVal(e.target.value)}
              onKeyDown={handleTempKeyDown}
              className="relative z-10 w-full h-full bg-transparent border-0 outline-none text-center font-mono text-xs sm:text-sm font-bold text-cyan-300 placeholder-cyan-500/50 px-2 py-0.5 focus:text-cyan-100"
              title="Enter Temporary HP amount"
              placeholder="TEMP"
            />
          </div>

          {/* Add Temp Button */}
          <button
            type="button"
            onClick={handleAddTemp}
            className="relative h-6 sm:h-7 aspect-[69/43] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group/btn flex-shrink-0"
            title="Add entered amount to Temporary HP"
            id="hp-add-temp-btn"
          >
            <img
              src={hpAssets.temp.blank}
              alt="Add Temp HP"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover/btn:brightness-115 group-hover/btn:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all"
            />
            <span className="absolute inset-0 flex items-center justify-center text-center font-display font-black leading-none text-[10px] sm:text-[11px] uppercase tracking-wider text-white group-hover/btn:text-cyan-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none">
              ADD
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HitPointsBar;
