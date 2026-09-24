import React, { useState } from 'react';
import { useStore } from '../../store';
import { requestRoll } from '../dice/rollBus';
import { Zap, ShieldCheck, X, AlertCircle } from 'lucide-react';

export function ConcentrationBanner() {
  const { character, setActiveConcentration, getSavingThrowModifier } = useStore();
  const [dcValue, setDcValue] = useState<number>(10);
  const [isEditingDC, setIsEditingDC] = useState<boolean>(false);

  if (!character.activeConcentration) return null;

  const conSaveMod = getSavingThrowModifier('con');

  const handleConcentrationSave = () => {
    requestRoll({
      command: `1d20${conSaveMod >= 0 ? '+' : ''}${conSaveMod}`,
      label: `Concentration Save (DC ${dcValue}) for ${character.activeConcentration?.spellName}`
    });
  };

  const handleDropConcentration = () => {
    setActiveConcentration(null);
  };

  return (
    <div className="w-full bg-white/95 border-2 border-[var(--accent-ink)] rounded-lg p-2.5 sm:p-3 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fade-in text-[#161616]">
      {/* Left: Active Spell Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-ink)]/10 border border-[var(--accent-ink)] flex items-center justify-center text-[var(--accent-ink)] shrink-0 animate-pulse">
          <Zap size={16} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[var(--accent-ink)] font-bold">
              Active Concentration
            </span>
            {character.activeConcentration.duration && (
              <span className="text-[9px] font-mono text-[#555555] bg-black/5 px-1.5 py-0.2 rounded border border-black/10 font-semibold">
                {character.activeConcentration.duration}
              </span>
            )}
          </div>

          <span className="font-serif font-bold text-sm sm:text-base text-[#161616]">
            {character.activeConcentration.spellName}
          </span>
        </div>
      </div>

      {/* Right: Saving Throw Roller & Dismiss Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white border border-[#141414]/20 rounded px-2 py-1 shadow-xs">
          <span className="text-[10px] font-display text-[#555555] uppercase font-bold mr-1">DC:</span>
          {isEditingDC ? (
            <input
              type="number"
              value={dcValue}
              onChange={(e) => setDcValue(parseInt(e.target.value, 10) || 10)}
              onBlur={() => setIsEditingDC(false)}
              autoFocus
              className="w-10 text-xs font-mono text-center bg-white border border-[var(--accent-ink)] text-[#161616] rounded"
            />
          ) : (
            <button
              onClick={() => setIsEditingDC(true)}
              className="text-xs font-mono font-bold text-[#161616] hover:underline cursor-pointer"
              title="Click to edit Concentration DC (default 10 or half damage taken)"
            >
              {dcValue}
            </button>
          )}
        </div>

        {/* 1-Click Roll CON Save Button */}
        <button
          onClick={handleConcentrationSave}
          className="sumie-btn-primary text-xs"
          title="Roll Constitution saving throw to maintain concentration"
        >
          <ShieldCheck size={14} />
          <span>Roll CON Save ({conSaveMod >= 0 ? `+${conSaveMod}` : conSaveMod})</span>
        </button>

        {/* Drop Concentration Button */}
        <button
          onClick={handleDropConcentration}
          className="p-1.5 text-[#777777] hover:text-[#e53e3e] hover:bg-red-50 rounded transition-colors cursor-pointer"
          title="Drop Concentration"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
