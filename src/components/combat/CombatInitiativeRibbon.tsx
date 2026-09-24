import React from 'react';
import { motion } from 'motion/react';
import { 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Square, 
  Play, 
  Plus, 
  Shield, 
  Skull, 
  Heart,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { InitiativeCombatant, CombatState } from '../../types/dm';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';

interface CombatInitiativeRibbonProps {
  combatState: CombatState;
  selectedCombatantId: string | null;
  onSelectCombatant: (id: string) => void;
  onNextTurn?: () => void;
  onPrevTurn?: () => void;
  onRollAll?: () => void;
  onStartCombat?: () => void;
  onEndCombat?: () => void;
  onOpenAddMonster?: () => void;
  isDm?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_PORTRAIT = ASSET_MAP.frames.characterPortrait.png;

export function CombatInitiativeRibbon({
  combatState,
  selectedCombatantId,
  onSelectCombatant,
  onNextTurn,
  onPrevTurn,
  onRollAll,
  onStartCombat,
  onEndCombat,
  onOpenAddMonster,
  isDm = false,
  className = '',
  orientation = 'horizontal'
}: CombatInitiativeRibbonProps) {
  const { combatants, inCombat, round } = combatState;

  if (orientation === 'vertical') {
    return (
      <div className={`relative flex flex-col gap-2 p-3 washi-card select-none ${className}`}>
        <OrnateCardFrame variant="standard" cornerSize={18} showRails={false} />
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/10 z-10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-[#161616] font-bold">
              Turn Order
            </span>
            <span className="px-1.5 py-0.5 washi-subcard rounded text-[10px] font-mono text-[#161616] font-bold">
              R{round}
            </span>
          </div>
          {isDm && onNextTurn && inCombat && (
            <button
              onClick={onNextTurn}
              className="p-1 bg-white hover:bg-black/5 border border-black/15 hover:border-[var(--accent-ink)] text-[#4a4a4a] hover:text-[#161616] rounded transition-all cursor-pointer shadow-xs"
              title="Next Turn (Space)"
            >
              <SkipForward size={14} />
            </button>
          )}
        </div>

        {/* Combatants Vertical Queue */}
        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1 z-10">
          {combatants.map((c) => {
            const isActive = c.isCurrentTurn;
            const isSelected = selectedCombatantId === c.id;

            return (
              <motion.div
                key={c.id}
                layout
                onClick={() => onSelectCombatant(c.id)}
                className={`relative flex items-center gap-2.5 p-2 rounded cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'glow-active-turn bg-white border-2 shadow-md z-10' 
                    : isSelected
                    ? 'bg-black/5 border border-[var(--accent-ink)] shadow-sm'
                    : 'bg-white hover:bg-black/5 border border-black/10'
                }`}
              >
                {/* Active Indicator Chevron */}
                {isActive && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[var(--accent-ink)] rounded-r-full shadow-[0_0_10px_var(--accent-glow)]" />
                )}

                {/* Token Portrait in Medallion Frame */}
                <div className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${
                  isActive ? 'border-[var(--accent-ink)] shadow-[0_0_10px_var(--accent-glow)]' : 'border-black/15'
                }`}>
                  <img
                    src={c.avatarUrl || DEFAULT_PORTRAIT}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Death Overlay */}
                  {c.hpCurrent <= 0 && (
                    <div className="absolute inset-0 bg-red-950/85 flex items-center justify-center">
                      <Skull size={14} className="text-red-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-display text-xs truncate font-bold ${
                      isActive ? 'text-[#161616] glow-active-text' : 'text-[#161616]'
                    }`}>
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#4a4a4a] shrink-0 font-bold">
                      {c.initiativeRoll}
                    </span>
                  </div>
                  
                  {/* Mini HP / Status */}
                  <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono">
                    <span className={c.hpCurrent <= c.hpMax * 0.25 ? 'text-red-600 font-bold' : ''}>
                      {c.hpCurrent}/{c.hpMax} HP
                    </span>
                    {c.conditions.length > 0 && (
                      <span className="text-[#4a4a4a] text-[9px] truncate max-w-[70px] font-display uppercase font-bold">
                        {c.conditions[0]}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal Ribbon Layout
  return (
    <div className={`relative flex flex-col gap-2 p-2.5 washi-card select-none overflow-hidden ${className}`}>
      
      {/* Ornate Corner Accents */}
      <OrnateCardFrame variant="standard" cornerSize={18} showRails={false} />

      {/* Control Header Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 washi-subcard rounded font-mono text-xs">
            <span className="font-display uppercase text-[#777777] text-[10px] tracking-widest font-bold">Round</span>
            <strong className="text-[#161616] text-sm font-bold">{round}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 washi-subcard rounded font-mono text-xs">
            <span className="font-display uppercase text-[#777777] text-[10px] tracking-widest font-bold">Combatants</span>
            <strong className="text-[#161616] text-sm font-bold">{combatants.length}</strong>
          </div>
        </div>

        {/* DM Controls */}
        {isDm && (
          <div className="flex items-center gap-1.5">
            {onRollAll && (
              <button
                onClick={onRollAll}
                className="sumie-btn-secondary"
                title="Roll initiative for all combatants"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Roll All</span>
              </button>
            )}

            {onPrevTurn && inCombat && (
              <button
                onClick={onPrevTurn}
                className="sumie-btn-secondary !px-1.5"
                title="Previous Turn"
              >
                <SkipBack size={13} />
              </button>
            )}

            {onNextTurn && inCombat && (
              <button
                onClick={onNextTurn}
                className="sumie-btn-primary"
                title="Advance to Next Turn"
              >
                <span>Next</span>
                <SkipForward size={13} />
              </button>
            )}

            {inCombat && onEndCombat ? (
              <button
                onClick={onEndCombat}
                className="px-2.5 py-1 bg-white border border-red-300 hover:border-red-500 text-red-700 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Square size={11} />
                <span className="hidden sm:inline">End</span>
              </button>
            ) : onStartCombat ? (
              <button
                onClick={onStartCombat}
                className="px-3 py-1 bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-700 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
              >
                <Play size={11} />
                <span>Start</span>
              </button>
            ) : null}

            {onOpenAddMonster && (
              <button
                onClick={onOpenAddMonster}
                className="px-2.5 py-1 bg-white border border-purple-300 hover:border-purple-500 text-purple-700 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                title="Add Monster to Combat"
              >
                <Plus size={12} />
                <span className="hidden sm:inline">Monster</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Initiative Tokens Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-2 px-1 z-10">
        {combatants.map((c) => {
          const isActive = c.isCurrentTurn;
          const isSelected = selectedCombatantId === c.id;

          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => onSelectCombatant(c.id)}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded shrink-0 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'glow-active-turn bg-white border-2 scale-105 shadow-md z-10'
                  : isSelected
                  ? 'bg-black/5 border border-[var(--accent-ink)] shadow-sm'
                  : 'bg-white hover:bg-black/5 border border-black/10 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Active Tag */}
              {isActive && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-[var(--accent-ink)] text-white rounded-full text-[8px] font-display font-extrabold uppercase tracking-widest shadow-[0_0_10px_var(--accent-glow)] flex items-center gap-0.5">
                  <Sparkles size={8} /> Active
                </div>
              )}

              {/* Portrait Token */}
              <div className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${
                isActive ? 'border-[var(--accent-ink)] shadow-[0_0_10px_var(--accent-glow)]' : 'border-black/15'
              }`}>
                <img
                  src={c.avatarUrl || DEFAULT_PORTRAIT}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
                {c.hpCurrent <= 0 && (
                  <div className="absolute inset-0 bg-red-950/85 flex items-center justify-center">
                    <Skull size={13} className="text-red-400" />
                  </div>
                )}
              </div>

              {/* Name & Initiative Score */}
              <div className="flex flex-col text-left">
                <span className={`font-display text-xs truncate max-w-[95px] font-bold ${
                  isActive ? 'text-[#161616] glow-active-text' : 'text-[#161616]'
                }`}>
                  {c.name}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-[#4a4a4a]">
                  <span className="font-mono font-bold">Init {c.initiativeRoll}</span>
                  <span className="text-[#999999]">•</span>
                  <span className={`font-mono ${c.hpCurrent <= c.hpMax * 0.25 ? 'text-red-600 font-bold' : 'text-[#777777]'}`}>
                    {c.hpCurrent}/{c.hpMax}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
