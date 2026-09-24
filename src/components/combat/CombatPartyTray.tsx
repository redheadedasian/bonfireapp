import React from 'react';
import { motion } from 'motion/react';
import { Shield, Heart, Zap, Flame, Skull, Sparkles } from 'lucide-react';
import { InitiativeCombatant } from '../../types/dm';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';

interface CombatPartyTrayProps {
  partyMembers: InitiativeCombatant[];
  selectedCombatantId: string | null;
  onSelectMember: (id: string) => void;
  className?: string;
}

const DEFAULT_PORTRAIT = ASSET_MAP.frames.characterPortrait.png;

export function CombatPartyTray({
  partyMembers,
  selectedCombatantId,
  onSelectMember,
  className = ''
}: CombatPartyTrayProps) {
  if (partyMembers.length === 0) return null;

  return (
    <div className={`relative flex flex-col gap-2 p-2.5 sm:p-3 washi-card select-none overflow-hidden ${className}`}>
      
      {/* Ornate Frame Chrome Overlay */}
      <OrnateCardFrame variant="standard" cornerSize={18} showRails={false} />

      {/* Title */}
      <div className="flex items-center justify-between px-1 z-10">
        <span className="font-display text-[10px] sm:text-xs uppercase tracking-widest text-[#777777] font-bold">
          Party Vitals
        </span>
        <span className="text-[10px] font-mono text-[#4a4a4a] font-bold">
          {partyMembers.length} Allies Active
        </span>
      </div>

      {/* Grid of Party Members */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 z-10">
        {partyMembers.map((member) => {
          const isActive = member.isCurrentTurn;
          const isSelected = selectedCombatantId === member.id;
          const hpPercent = Math.max(0, Math.min(100, (member.hpCurrent / Math.max(1, member.hpMax)) * 100));
          const isBloodied = member.hpCurrent <= member.hpMax / 2;
          const isCritical = member.hpCurrent <= member.hpMax * 0.25;

          return (
            <motion.div
              key={member.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectMember(member.id)}
              className={`relative flex flex-col gap-1.5 p-2 rounded cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'glow-active-turn bg-white border-2 shadow-md scale-102 z-10'
                  : isSelected
                  ? 'bg-black/5 border border-[var(--accent-ink)] shadow-sm'
                  : 'bg-white hover:bg-black/5 border border-black/10'
              }`}
            >
              {/* Active Turn Tag */}
              {isActive && (
                <div className="absolute -top-2 right-2 px-1.5 py-0.2 bg-[var(--accent-ink)] text-white rounded-full text-[8px] font-display font-extrabold uppercase tracking-widest shadow-[0_0_8px_var(--accent-glow)] flex items-center gap-0.5">
                  <Sparkles size={7} /> Turn
                </div>
              )}

              {/* Avatar + Name + AC */}
              <div className="flex items-center gap-2">
                <div className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${
                  isActive ? 'border-[var(--accent-ink)] shadow-[0_0_10px_var(--accent-glow)]' : 'border-black/15'
                }`}>
                  <img
                    src={member.avatarUrl || DEFAULT_PORTRAIT}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  {member.hpCurrent <= 0 && (
                    <div className="absolute inset-0 bg-red-950/85 flex items-center justify-center">
                      <Skull size={13} className="text-red-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <span className={`font-display text-xs truncate font-bold ${
                    isActive ? 'text-[#161616] glow-active-text' : 'text-[#161616]'
                  }`}>
                    {member.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono">
                    <span className="text-[#4a4a4a] font-bold">AC {member.ac}</span>
                    <span className={isCritical ? 'text-red-600 font-bold' : ''}>
                      {member.hpCurrent}/{member.hpMax}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Track */}
              <div className="w-full h-1.5 bg-black/10 border border-black/10 rounded-full overflow-hidden p-0.2 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-700 to-rose-500'
                      : isBloodied
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500'
                      : 'bg-gradient-to-r from-emerald-700 to-emerald-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Status Badges */}
              {member.conditions.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                  {member.conditions.slice(0, 2).map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.2 bg-white border border-black/15 text-[#4a4a4a] rounded text-[8px] font-display uppercase font-bold truncate max-w-[80px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
