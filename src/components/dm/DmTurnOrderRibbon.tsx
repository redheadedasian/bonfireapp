import React from 'react';
import { 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Square, 
  Play, 
  Plus, 
  Crown, 
  Shield 
} from 'lucide-react';
import { CombatState } from '../../types/dm';

interface DmTurnOrderRibbonProps {
  combatState: CombatState;
  rollAllInitiative: () => void;
  prevTurn: () => void;
  nextTurn: () => void;
  endCombat: () => void;
  startCombat: () => void;
  isMonsterDrawerOpen: boolean;
  setIsMonsterDrawerOpen: (open: boolean) => void;
}

export function DmTurnOrderRibbon({
  combatState,
  rollAllInitiative,
  prevTurn,
  nextTurn,
  endCombat,
  startCombat,
  isMonsterDrawerOpen,
  setIsMonsterDrawerOpen
}: DmTurnOrderRibbonProps) {
  return (
    <div className="p-3 bg-[#fcfbf9] border-b border-[#141414]/15 flex flex-col gap-2 shrink-0 z-20 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#141414]/15 rounded font-mono text-xs">
            <span className="font-display uppercase text-[#555555] font-bold">Round</span>
            <strong className="text-[var(--accent-ink)] text-sm">{combatState.round}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#141414]/15 rounded font-mono text-xs">
            <span className="font-display uppercase text-[#555555] font-bold">Combatants</span>
            <strong className="text-[#161616]">{combatState.combatants.length}</strong>
          </div>
        </div>

        {/* Combat Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={rollAllInitiative}
            className="px-3 py-1 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            title="Roll initiative for all combatants"
          >
            <RotateCcw size={12} />
            <span>Roll All</span>
          </button>

          <button
            onClick={prevTurn}
            disabled={!combatState.inCombat}
            className="px-2.5 py-1 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs disabled:opacity-30 cursor-pointer"
            title="Previous Turn"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={nextTurn}
            disabled={!combatState.inCombat}
            className="px-3.5 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1 shadow-xs disabled:opacity-30 transition-all cursor-pointer"
            title="Advance to Next Turn"
          >
            <span>Next Turn</span>
            <SkipForward size={13} />
          </button>

          {combatState.inCombat ? (
            <button
              onClick={endCombat}
              className="px-3 py-1 bg-[#E33526]/15 hover:bg-[#E33526]/25 text-[#c53030] border border-[#E33526]/40 rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Square size={12} />
              <span>End Encounter</span>
            </button>
          ) : (
            <button
              onClick={() => startCombat()}
              className="px-3.5 py-1 bg-[#1EB253] hover:bg-[#28D164] text-white font-display text-xs uppercase font-bold rounded-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            >
              <Play size={12} />
              <span>Start Battle</span>
            </button>
          )}

          {/* Open In-Panel Monster Drawer */}
          <button
            onClick={() => setIsMonsterDrawerOpen(!isMonsterDrawerOpen)}
            className="px-3.5 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>+ Add Monster</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL INITIATIVE QUEUE RAIL */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1">
        {combatState.combatants.map((c) => {
          const isCurrent = c.isCurrentTurn;
          const hpRatio = Math.min(100, Math.round((c.hpCurrent / Math.max(1, c.hpMax)) * 100));
          
          return (
            <div
              key={c.id}
              className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded border shrink-0 transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#241A0E] via-[#1A140B] to-[#0E0D0A] border-[#ffd700] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                  : 'bg-[#050505] border-[#231f1a] opacity-80 hover:opacity-100'
              }`}
            >
              {isCurrent && (
                <Crown size={12} className="absolute -top-2 left-2 text-[#ffd700] animate-bounce" />
              )}

              {/* Avatar / Token */}
              <div className="w-7 h-7 rounded-full bg-[#141210] border border-[#8A6827] flex items-center justify-center text-[10px] font-bold text-[#ffd700] overflow-hidden shrink-0">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  c.name.charAt(0)
                )}
              </div>

              {/* Name & HP Pill */}
              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-display uppercase font-bold truncate max-w-[110px] ${
                  isCurrent ? 'text-[#ffd700]' : 'text-[#f5ede0]'
                }`}>
                  {c.name}
                </span>
                
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a89f91]">
                  <span>HP {c.hpCurrent}/{c.hpMax}</span>
                  <div className="w-12 h-1 bg-[#1a1714] rounded-full overflow-hidden border border-[#3a3227]">
                    <div 
                      className={`h-full ${
                        hpRatio > 50 ? 'bg-[#1EB253]' : hpRatio > 25 ? 'bg-[#D97706]' : 'bg-[#E33526]'
                      }`}
                      style={{ width: `${hpRatio}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Initiative & AC Badge */}
              <div className="flex flex-col items-end pl-1 border-l border-[#3a3227] text-[10px] font-mono shrink-0">
                <span className="font-bold text-[#ffd700]">Init {c.initiativeRoll}</span>
                <span className="text-[#a89f91] flex items-center gap-0.5">
                  <Shield size={9} />
                  {c.ac}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
