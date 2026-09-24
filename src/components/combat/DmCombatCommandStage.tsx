import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Heart, 
  Flame, 
  Zap, 
  Skull, 
  Crosshair, 
  Plus, 
  Minus, 
  RotateCcw, 
  Dices, 
  Eye, 
  EyeOff, 
  Trash2,
  Sparkles,
  Edit2,
  Activity,
  Check
} from 'lucide-react';
import { InitiativeCombatant } from '../../types/dm';
import { useDmStore, DEFAULT_CONDITIONS } from '../../store/dmStore';
import { requestRoll } from '../dice/rollBus';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';

interface DmCombatCommandStageProps {
  combatant: InitiativeCombatant | null;
  onOpenAddMonster?: () => void;
  className?: string;
}

export function DmCombatCommandStage({
  combatant,
  onOpenAddMonster,
  className = ''
}: DmCombatCommandStageProps) {
  const {
    applyHpAdjustment,
    toggleCondition,
    updateCombatant,
    removeCombatant,
    performSecretRoll
  } = useDmStore();

  const [customHpInput, setCustomHpInput] = useState<string>('');

  if (!combatant) {
    return (
      <div className={`p-6 washi-card text-center flex flex-col items-center justify-center gap-3 text-[#777777] select-none ${className}`}>
        <Dices size={32} className="text-[#4a4a4a]/50" />
        <p className="font-serif text-sm italic">
          Select any combatant from the initiative timeline or battlefield to inspect and control.
        </p>
        {onOpenAddMonster && (
          <button
            onClick={onOpenAddMonster}
            className="px-3.5 py-1.5 bg-white border border-purple-300 hover:border-purple-500 text-purple-700 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Plus size={13} />
            <span>+ Add Monster / NPC</span>
          </button>
        )}
      </div>
    );
  }

  const handleCustomHpAction = (type: 'damage' | 'heal') => {
    const val = parseInt(customHpInput, 10);
    if (!isNaN(val) && val > 0) {
      applyHpAdjustment(combatant.id, val, type);
      setCustomHpInput('');
    }
  };

  const handleMonsterRoll = (actionText: string, secret = false) => {
    const hitMatch = actionText.match(/\+(\d+)\s*(?:to\s*hit)?/i);
    const dmgMatch = actionText.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/i);
    
    let command = '1d20+5';
    let label = `${combatant.name} Action`;

    if (hitMatch) {
      command = `1d20+${hitMatch[1]}`;
      label = `${combatant.name} Attack (+${hitMatch[1]})`;
    } else if (dmgMatch) {
      command = dmgMatch[1].replace(/\s+/g, '');
      label = `${combatant.name} Damage (${command})`;
    }

    if (secret) {
      performSecretRoll(command, label);
    } else {
      requestRoll({ command, label });
    }
  };

  const isMonster = combatant.type === 'monster';

  return (
    <div className={`relative flex flex-col gap-3.5 p-3.5 sm:p-4 washi-card select-none overflow-hidden ${className}`}>
      
      {/* Ornate Frame Chrome Overlay */}
      <OrnateCardFrame variant="standard" cornerSize={20} showRails={false} />

      {/* Top Combatant Inspector Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-black/10 z-10">
        <div className="flex items-center gap-3">
          {/* Avatar Medallion */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-black/15 shrink-0 shadow-sm">
            <img 
              src={combatant.avatarUrl || ASSET_MAP.frames.characterPortrait.png} 
              alt={combatant.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#161616] font-bold">
                {combatant.name}
              </h3>
              <span className="px-1.5 py-0.2 bg-white border border-black/15 rounded text-[9px] font-mono text-[#4a4a4a] font-bold uppercase tracking-wider">
                {combatant.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#4a4a4a] font-mono">
              <span>AC {combatant.ac}</span>
              <span>•</span>
              <span>Speed {combatant.speed}ft</span>
              <span>•</span>
              <span>Init {combatant.initiativeRoll}</span>
            </div>
          </div>
        </div>

        {/* Remove Combatant Button */}
        <button
          onClick={() => removeCombatant(combatant.id)}
          className="p-1.5 bg-white hover:bg-red-50 border border-red-200 hover:border-red-400 text-red-700 rounded text-xs transition-all cursor-pointer shadow-xs active:scale-95"
          title="Remove Combatant from Encounter"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Zero-Friction HP Math Controller */}
      <div className="flex flex-col gap-2 p-2.5 washi-subcard rounded z-10">
        <div className="flex items-center justify-between text-xs font-display tracking-wider">
          <span className="text-[10px] uppercase font-bold text-[#777777]">
            Health & Pool Adjustment
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            {combatant.tempHp > 0 && (
              <span className="text-sky-600 font-bold text-xs">(+{combatant.tempHp} Temp)</span>
            )}
            <strong className="text-sm font-bold text-[#161616]">{combatant.hpCurrent}</strong>
            <span className="text-[#777777]">/</span>
            <span className="text-[#777777]">{combatant.hpMax} HP</span>
          </div>
        </div>

        {/* Quick Modifier Keypad */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            onClick={() => applyHpAdjustment(combatant.id, 10, 'damage')}
            className="py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Deal 10 Damage"
          >
            -10
          </button>
          <button
            onClick={() => applyHpAdjustment(combatant.id, 5, 'damage')}
            className="py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Deal 5 Damage"
          >
            -5
          </button>
          <button
            onClick={() => applyHpAdjustment(combatant.id, 1, 'damage')}
            className="py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Deal 1 Damage"
          >
            -1
          </button>
          <button
            onClick={() => applyHpAdjustment(combatant.id, 1, 'heal')}
            className="py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Heal 1 HP"
          >
            +1
          </button>
          <button
            onClick={() => applyHpAdjustment(combatant.id, 5, 'heal')}
            className="py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Heal 5 HP"
          >
            +5
          </button>
          <button
            onClick={() => applyHpAdjustment(combatant.id, 10, 'heal')}
            className="py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Heal 10 HP"
          >
            +10
          </button>
        </div>

        {/* Custom Exact HP Input */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <input
            type="number"
            value={customHpInput}
            onChange={(e) => setCustomHpInput(e.target.value)}
            placeholder="Amount"
            className="w-24 sumie-input"
          />
          <button
            onClick={() => handleCustomHpAction('damage')}
            disabled={!customHpInput}
            className="flex-1 py-1 bg-white hover:bg-red-50 border border-red-200 hover:border-red-400 text-red-700 rounded text-[11px] font-display uppercase tracking-wider font-bold disabled:opacity-30 transition-all cursor-pointer active:scale-95"
          >
            Damage
          </button>
          <button
            onClick={() => handleCustomHpAction('heal')}
            disabled={!customHpInput}
            className="flex-1 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-700 rounded text-[11px] font-display uppercase tracking-wider font-bold disabled:opacity-30 transition-all cursor-pointer active:scale-95"
          >
            Heal
          </button>
        </div>
      </div>

      {/* Condition Badges */}
      <div className="flex flex-col gap-1.5 z-10">
        <span className="text-[10px] font-display uppercase tracking-widest text-[#777777] font-bold">
          Conditions & Status Effects
        </span>
        <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto custom-scrollbar p-1.5 washi-subcard rounded">
          {DEFAULT_CONDITIONS.map((cond) => {
            const hasCondition = combatant.conditions.includes(cond);
            return (
              <button
                key={cond}
                onClick={() => toggleCondition(combatant.id, cond)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold transition-all cursor-pointer ${
                  hasCondition
                    ? 'bg-[#161616] border border-[#161616] text-white'
                    : 'bg-white border border-black/15 text-[#777777] hover:border-[var(--accent-ink)] hover:text-[#161616]'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monster Action Rolls */}
      {isMonster && (
        <div className="flex flex-col gap-2 p-2.5 washi-subcard rounded z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-display uppercase tracking-widest text-[#161616] font-bold">
              Monster Action Directives
            </span>
            <span className="text-[9px] text-[#777777] font-serif italic">1-Click Execution</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleMonsterRoll(combatant.notes || 'Melee Attack +5', false)}
              className="sumie-btn-primary py-1.5"
            >
              <Crosshair size={12} />
              <span>Public Roll</span>
            </button>

            <button
              onClick={() => handleMonsterRoll(combatant.notes || 'Melee Attack +5', true)}
              className="py-1.5 px-3 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 hover:border-purple-500 rounded text-[11px] font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <EyeOff size={12} />
              <span>Secret Roll</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
