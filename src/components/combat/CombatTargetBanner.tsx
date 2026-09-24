import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Heart, 
  Flame, 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  AlertTriangle,
  Zap,
  Plus,
  Minus
} from 'lucide-react';
import { InitiativeCombatant } from '../../types/dm';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';

interface CombatTargetBannerProps {
  target: InitiativeCombatant | null;
  onApplyHp?: (amount: number, type: 'damage' | 'heal' | 'temp') => void;
  isDm?: boolean;
  className?: string;
}

export function CombatTargetBanner({
  target,
  onApplyHp,
  isDm = false,
  className = ''
}: CombatTargetBannerProps) {
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [ghostHp, setGhostHp] = useState<number>(target?.hpCurrent || 0);

  // Update ghost HP with a slight delay for damage visual impact
  useEffect(() => {
    if (!target) return;
    const timer = setTimeout(() => {
      setGhostHp(target.hpCurrent);
    }, 600);
    return () => clearTimeout(timer);
  }, [target?.hpCurrent]);

  if (!target) {
    return (
      <div className={`w-full py-4 px-6 washi-card text-center text-[#777777] font-serif italic ${className}`}>
        Select a target or combatant from the initiative timeline to inspect vitals.
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.min(100, (target.hpCurrent / Math.max(1, target.hpMax)) * 100));
  const ghostPercent = Math.max(0, Math.min(100, (ghostHp / Math.max(1, target.hpMax)) * 100));
  const isBloodied = target.hpCurrent <= target.hpMax / 2;
  const isCritical = target.hpCurrent <= target.hpMax * 0.25;

  return (
    <div className={`relative flex flex-col gap-2.5 p-3.5 sm:p-4 washi-card select-none overflow-hidden ${className}`}>
      
      {/* Decorative Ornate Corner Filigree */}
      <OrnateCardFrame variant="standard" cornerSize={20} showRails={false} />

      {/* Top Target Meta Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap z-10">
        
        {/* Target Title & Type Badge */}
        <div className="flex items-center gap-3">
          {/* Avatar Medallion */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-black/15 shrink-0 shadow-sm">
            <img 
              src={target.avatarUrl || ASSET_MAP.frames.characterPortrait.png} 
              alt={target.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base uppercase tracking-widest text-[#161616] font-bold">
                {target.name}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9px] font-display uppercase font-bold tracking-widest border ${
                target.type === 'monster' 
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : target.type === 'player'
                  ? 'bg-white text-[#4a4a4a] border-black/15'
                  : 'bg-white text-[#777777] border-black/10'
              }`}>
                {target.type}
              </span>
            </div>
            {target.notes && (
              <p className="text-[11px] text-[#4a4a4a] font-serif italic truncate max-w-xs sm:max-w-md">
                {target.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right Status Effects Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {target.concentration && (
            <span className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
              <Zap size={10} /> Concentration
            </span>
          )}
          
          {target.conditions.map((c) => (
            <span 
              key={c}
              className="px-2.5 py-0.5 bg-white border border-black/15 text-[#4a4a4a] rounded text-[10px] font-display uppercase font-bold tracking-wider flex items-center gap-1"
            >
              <Flame size={10} className="text-[#4a4a4a]" />
              {c}
            </span>
          ))}

          {/* Quick Stats Toggle Button */}
          <button
            onClick={() => setShowStatsDrawer(!showStatsDrawer)}
            className="sumie-btn-secondary ml-1"
            title="Toggle Detailed Target Stats"
          >
            <Info size={11} />
            <span className="hidden sm:inline">Stats</span>
            {showStatsDrawer ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* Vitals Bar */}
      <div className="flex flex-col gap-1 z-10">
        <div className="flex items-center justify-between text-xs font-display tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-[#777777] uppercase font-bold text-[10px]">Vitality Gauge</span>
            {isBloodied && (
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                isCritical 
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {isCritical ? 'Critical' : 'Bloodied'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#161616] font-mono">
            {target.tempHp > 0 && (
              <span className="text-sky-600 font-bold text-xs">(+{target.tempHp} Temp)</span>
            )}
            <strong className="text-sm font-bold text-[#161616]">{target.hpCurrent}</strong>
            <span className="text-[#777777]">/</span>
            <span className="text-[#777777]">{target.hpMax} HP</span>
          </div>
        </div>

        {/* Health Track */}
        <div className="relative w-full h-4 sm:h-5 bg-black/5 border border-black/10 shadow-inner rounded overflow-hidden p-0.5">
          {/* Ghost Bar (Trailing Damage) */}
          <div
            className="absolute top-0.5 bottom-0.5 left-0.5 bg-red-300/40 rounded transition-all duration-700 ease-out"
            style={{ width: `${ghostPercent}%` }}
          />
          {/* Layered Fill */}
          <div
            className={`relative h-full rounded transition-all duration-300 ease-out shadow-sm ${
              isCritical
                ? 'bg-gradient-to-r from-red-800 via-red-600 to-red-500'
                : isBloodied
                ? 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-400'
                : 'bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* HP Adjustment Controls */}
      {isDm && onApplyHp && (
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-black/10 z-10">
          <span className="text-[10px] font-display uppercase tracking-widest text-[#777777] font-bold">
            Damage & Vitality Modifiers
          </span>
          <div className="flex items-center gap-1">
            {/* Damage buttons */}
            <button
              onClick={() => onApplyHp(10, 'damage')}
              className="px-2.5 py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Deal 10 Damage"
            >
              -10
            </button>
            <button
              onClick={() => onApplyHp(5, 'damage')}
              className="px-2.5 py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Deal 5 Damage"
            >
              -5
            </button>
            <button
              onClick={() => onApplyHp(1, 'damage')}
              className="px-2 py-1 bg-white border border-black/15 hover:border-red-400 hover:text-red-700 hover:bg-red-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Deal 1 Damage"
            >
              -1
            </button>

            {/* Healing buttons */}
            <button
              onClick={() => onApplyHp(1, 'heal')}
              className="px-2 py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Heal 1 HP"
            >
              +1
            </button>
            <button
              onClick={() => onApplyHp(5, 'heal')}
              className="px-2.5 py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Heal 5 HP"
            >
              +5
            </button>
            <button
              onClick={() => onApplyHp(10, 'heal')}
              className="px-2.5 py-1 bg-white border border-black/15 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-[#4a4a4a] rounded text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title="Heal 10 HP"
            >
              +10
            </button>
          </div>
        </div>
      )}

      {/* Expandable Stats Drawer */}
      <AnimatePresence>
        {showStatsDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono z-10 overflow-hidden"
          >
            <div className="p-2.5 washi-subcard rounded flex items-center gap-2.5">
              <Shield size={14} className="text-[#4a4a4a]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#777777] font-display uppercase tracking-wider font-bold">Armor Class</span>
                <strong className="text-sm text-[#161616] font-bold">{target.ac} AC</strong>
              </div>
            </div>

            <div className="p-2.5 washi-subcard rounded flex items-center gap-2.5">
              <Activity size={14} className="text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#777777] font-display uppercase tracking-wider font-bold">Speed</span>
                <strong className="text-sm text-[#161616] font-bold">{target.speed} ft</strong>
              </div>
            </div>

            <div className="p-2.5 washi-subcard rounded flex items-center gap-2.5">
              <Sparkles size={14} className="text-[#4a4a4a]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#777777] font-display uppercase tracking-wider font-bold">Initiative</span>
                <strong className="text-sm text-[#161616] font-bold">+{target.initiativeRoll}</strong>
              </div>
            </div>

            <div className="p-2.5 washi-subcard rounded flex items-center gap-2.5">
              <Heart size={14} className="text-rose-600" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#777777] font-display uppercase tracking-wider font-bold">Perception</span>
                <strong className="text-sm text-[#161616] font-bold">{target.passivePerception || 10}</strong>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
