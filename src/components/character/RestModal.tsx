import React, { useState } from 'react';
import { useStore } from '../../store';
import { requestRoll } from '../dice/rollBus';
import { Moon, Flame, Sun, Sparkles, Heart, Shield, X, Check, RefreshCw } from 'lucide-react';

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RestModal({ isOpen, onClose }: RestModalProps) {
  const { character, performShortRest, performLongRest, getAbilityModifier } = useStore();
  const [restType, setRestType] = useState<'short' | 'long'>('short');
  
  // Short rest local state
  const [diceToSpend, setDiceToSpend] = useState<number>(1);
  const [rolledHealingTotal, setRolledHealingTotal] = useState<number>(0);
  const [spentDiceCount, setSpentDiceCount] = useState<number>(0);
  const [isRestComplete, setIsRestComplete] = useState<boolean>(false);
  const [completeMessage, setCompleteMessage] = useState<string>('');

  if (!isOpen) return null;

  const conMod = getAbilityModifier('con');
  const availableHitDice = character.hitDice.current;
  const totalDiceMatch = character.hitDice.total.match(/^(\d+)d(\d+)$/i);
  const hitDieFace = totalDiceMatch ? parseInt(totalDiceMatch[2], 10) : 8;

  const handleRollSingleHitDie = () => {
    if (availableHitDice - spentDiceCount <= 0) return;

    // Roll 1 hit die + CON mod (minimum 0)
    const roll = Math.floor(Math.random() * hitDieFace) + 1;
    const total = Math.max(1, roll + conMod);

    requestRoll({
      command: `1d${hitDieFace}${conMod >= 0 ? '+' : ''}${conMod}`,
      label: `Short Rest Hit Die (Roll: ${roll} + CON ${conMod})`
    });

    setSpentDiceCount((prev) => prev + 1);
    setRolledHealingTotal((prev) => prev + total);
  };

  const handleApplyShortRest = () => {
    performShortRest(spentDiceCount, rolledHealingTotal);
    setIsRestComplete(true);
    setCompleteMessage(`Short Rest Finished! Regained ${rolledHealingTotal} HP using ${spentDiceCount} Hit Dice.`);
    setTimeout(() => {
      setIsRestComplete(false);
      onClose();
    }, 1400);
  };

  const handleApplyLongRest = () => {
    performLongRest();
    setIsRestComplete(true);
    setCompleteMessage(`Long Rest Finished! Restored to ${character.hp.max} HP, all spell slots replenished, and hit dice recovered.`);
    setTimeout(() => {
      setIsRestComplete(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl overflow-hidden text-[#161616]">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-white/90 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Flame className="text-[var(--accent-ink)] animate-pulse" size={22} />
            <h3 className="font-display font-bold text-lg tracking-[0.2em] text-[#1a1a1a] uppercase">
              Campfire & Resting
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#555555] hover:text-[#161616] hover:bg-black/5 rounded transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle: Short Rest vs Long Rest */}
        <div className="grid grid-cols-2 border-b border-[#141414]/15 bg-white/80">
          <button
            onClick={() => {
              setRestType('short');
              setSpentDiceCount(0);
              setRolledHealingTotal(0);
            }}
            style={restType === 'short' ? { borderColor: 'var(--accent-ink)', color: 'var(--accent-ink)' } : {}}
            className={`py-3 px-4 text-xs font-display tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              restType === 'short'
                ? 'border-b-2 font-bold'
                : 'text-[#555555] hover:text-[#161616]'
            }`}
          >
            <Moon size={14} className={restType === 'short' ? 'text-[var(--accent-ink)]' : ''} />
            <span>Short Rest (1 Hour)</span>
          </button>

          <button
            onClick={() => setRestType('long')}
            style={restType === 'long' ? { borderColor: 'var(--accent-ink)', color: 'var(--accent-ink)' } : {}}
            className={`py-3 px-4 text-xs font-display tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              restType === 'long'
                ? 'border-b-2 font-bold'
                : 'text-[#555555] hover:text-[#161616]'
            }`}
          >
            <Sun size={14} className={restType === 'long' ? 'text-[var(--accent-ink)]' : ''} />
            <span>Long Rest (8 Hours)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 bg-white/40">
          {isRestComplete ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 border border-green-500 flex items-center justify-center text-green-700 shadow-sm">
                <Check size={24} />
              </div>
              <p className="font-serif text-sm text-[#161616] max-w-sm font-medium">
                {completeMessage}
              </p>
            </div>
          ) : restType === 'short' ? (
            /* Short Rest View */
            <div className="flex flex-col gap-5">
              {/* Hit Dice Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-white/90 rounded-lg border border-[#141414]/15 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-display uppercase tracking-widest text-[#555555] font-bold">
                    Available Hit Dice
                  </span>
                  <span className="font-serif text-lg font-bold text-[#161616]">
                    {availableHitDice - spentDiceCount} <span className="text-xs text-[#555555]">/ {character.hitDice.total}</span>
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-display uppercase tracking-widest text-[#555555] font-bold">
                    CON Modifier
                  </span>
                  <span className="font-mono text-base font-bold text-[var(--accent-ink)]">
                    {conMod >= 0 ? `+${conMod}` : conMod} HP per die
                  </span>
                </div>
              </div>

              {/* Rolling / Spending Dice Controls */}
              <div className="flex flex-col gap-3 p-4 bg-white/90 rounded-lg border border-[#141414]/15 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif text-[#161616]">
                    Spend Hit Dice to bind wounds & recover HP:
                  </span>
                  <span className="font-mono text-xs text-green-700 font-bold">
                    +{rolledHealingTotal} HP Rolled
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRollSingleHitDie}
                    disabled={availableHitDice - spentDiceCount <= 0}
                    className="flex-1 py-2.5 px-3 bg-[#fdfbf7] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed border border-black/20 hover:border-[var(--accent-ink)] text-[#161616] font-display text-xs tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer font-bold"
                  >
                    <RefreshCw size={13} className="text-[var(--accent-ink)]" />
                    <span>Roll 1d{hitDieFace} + {conMod}</span>
                  </button>
                </div>

                {spentDiceCount > 0 && (
                  <div className="text-[11px] font-serif text-[#555555] italic text-center">
                    Spent {spentDiceCount} dice. Current HP will increase from {character.hp.current} to{' '}
                    <strong className="text-green-700 font-bold">
                      {Math.min(character.hp.max, character.hp.current + rolledHealingTotal)}
                    </strong>
                    /{character.hp.max}.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-display tracking-wider uppercase text-[#555555] hover:text-[#161616] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyShortRest}
                  className="px-5 py-2 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs font-bold tracking-widest uppercase rounded shadow-sm transition-all cursor-pointer"
                >
                  Apply Short Rest
                </button>
              </div>
            </div>
          ) : (
            /* Long Rest View */
            <div className="flex flex-col gap-5">
              <div className="p-4 bg-white/90 rounded-lg border border-[#141414]/15 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[var(--accent-ink)]">
                  <Sparkles size={16} />
                  <span className="font-display text-xs font-bold tracking-widest uppercase">
                    Full Rest Benefits
                  </span>
                </div>

                <ul className="text-xs font-serif text-[#161616] flex flex-col gap-2 list-disc pl-4">
                  <li>
                    <strong>Hit Points:</strong> Fully restored to <span className="text-green-700 font-bold">{character.hp.max} HP</span>.
                  </li>
                  <li>
                    <strong>Spell Slots:</strong> All 1st through 9th level spell slots completely replenished.
                  </li>
                  <li>
                    <strong>Hit Dice:</strong> Regains half of total hit dice pool (up to {character.hitDice.total}).
                  </li>
                  <li>
                    <strong>Death Saves & Concentration:</strong> All death saving throw counters reset to zero; active concentration dropped.
                  </li>
                  <li>
                    <strong>Exhaustion:</strong> Reduces exhaustion level by 1.
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-display tracking-wider uppercase text-[#555555] hover:text-[#161616] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyLongRest}
                  className="px-6 py-2.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs font-bold tracking-widest uppercase rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sun size={15} />
                  <span>Take Long Rest</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
