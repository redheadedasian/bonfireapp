import React, { useState } from 'react';
import { DMPartyMember } from '../../types/campaign';
import { ASSET_MAP } from '@/config/assets';
import { 
  Shield, 
  Zap, 
  ChevronRight, 
  Copy, 
  Check, 
  Feather, 
  Skull, 
  BookOpen, 
  SlidersHorizontal,
  Flame,
  Eye
} from 'lucide-react';

export interface DMPartyCardProps {
  member: DMPartyMember;
  onAdjustHp?: (delta: number) => void;
  onAdjustXp?: (delta: number) => void;
  onSetHpDirect?: (current: number, max: number) => void;
  onSetXpDirect?: (xp: number) => void;
  onToggleSpellSlot?: (level: number, slotIndex: number) => void;
  onInspect?: () => void;
  onToggleCondition?: (condition: string) => void;
  onOpenLootModal?: () => void;
  className?: string;
}

const COMMON_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Concentration',
  'Mage Armor',
  'Blessed'
];

const DEFAULT_CLASS_PORTRAITS: Record<string, string> = {
  paladin: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80',
  cleric: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  rogue: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  wizard: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  fighter: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80',
  warlock: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  ranger: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  barbarian: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
  monk: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80',
  bard: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  druid: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  sorcerer: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80'
};

function getDefaultPortraitForClass(className?: string): string {
  if (!className) return DEFAULT_CLASS_PORTRAITS.default;
  const lower = className.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_CLASS_PORTRAITS)) {
    if (lower.includes(key)) return url;
  }
  return DEFAULT_CLASS_PORTRAITS.default;
}

/**
 * 9-Slice Border Frame Overlay with 4 Corner Caps and 4 Rails
 */
function NineSliceBorder({
  cornerSize = 16,
  className = '',
  isMagical = false,
}: {
  cornerSize?: number;
  className?: string;
  isMagical?: boolean;
}) {
  const sliceAssets = isMagical ? ASSET_MAP.frames.magicalSlice : ASSET_MAP.frames.slice;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Top Rail */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          marginLeft: cornerSize - 1,
          marginRight: cornerSize - 1,
          height: cornerSize,
        }}
      >
        <img src={sliceAssets.railTop} alt="" className="w-full h-full object-fill pointer-events-none" />
      </div>

      {/* Bottom Rail */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          marginLeft: cornerSize - 1,
          marginRight: cornerSize - 1,
          height: cornerSize,
        }}
      >
        <img src={sliceAssets.railBottom} alt="" className="w-full h-full object-fill pointer-events-none" />
      </div>

      {/* Left Rail */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{
          marginTop: cornerSize - 1,
          marginBottom: cornerSize - 1,
          width: cornerSize,
        }}
      >
        <img src={sliceAssets.railLeft} alt="" className="w-full h-full object-fill pointer-events-none" />
      </div>

      {/* Right Rail */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          marginTop: cornerSize - 1,
          marginBottom: cornerSize - 1,
          width: cornerSize,
        }}
      >
        <img src={sliceAssets.railRight} alt="" className="w-full h-full object-fill pointer-events-none" />
      </div>

      {/* 4 Corner Caps */}
      <img
        src={sliceAssets.cornerTopLeft}
        alt=""
        className="absolute top-0 left-0 pointer-events-none z-10"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={sliceAssets.cornerTopRight}
        alt=""
        className="absolute top-0 right-0 pointer-events-none z-10"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={sliceAssets.cornerBottomLeft}
        alt=""
        className="absolute bottom-0 left-0 pointer-events-none z-10"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={sliceAssets.cornerBottomRight}
        alt=""
        className="absolute bottom-0 right-0 pointer-events-none z-10"
        style={{ width: cornerSize, height: cornerSize }}
      />
    </div>
  );
}

/**
 * Razor-sharp 4-point diamond star / gem for 5e spell slots
 */
function DiamondSlot({ 
  filled, 
  onClick 
}: { 
  filled: boolean; 
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-0.5 group/slot focus:outline-none cursor-pointer transition-transform hover:scale-115 active:scale-95"
      title={filled ? 'Slot Ready (Click to expend)' : 'Slot Expended (Click to restore)'}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-all duration-200 ${
          filled
            ? 'fill-[#38bdf8] text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.95)]'
            : 'fill-transparent text-[#262b3a] stroke-[#3a445c] stroke-[1.5]'
        }`}
      >
        <path d="M12 2L20 12L12 22L4 12Z" />
      </svg>
    </button>
  );
}

/**
 * Winged Crest Icon for Level Indicator
 */
function WingedShieldCrest() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#c9963d] fill-current shrink-0 filter drop-shadow-[0_0_4px_rgba(201,150,61,0.5)]">
      <path d="M12 2L15 5V9L12 7L9 9V5L12 2ZM4 6L7 8V14L3 11V7L4 6ZM20 6L21 7V11L17 14V8L20 6ZM12 8L15 10V18L12 22L9 18V10L12 8Z" />
    </svg>
  );
}

export function DMPartyCard({
  member,
  onAdjustHp,
  onToggleSpellSlot,
  onInspect,
  onToggleCondition,
  onOpenLootModal,
  className = ''
}: DMPartyCardProps) {
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const {
    playerName,
    characterName,
    classAndLevel,
    ancestry,
    portraitUrl,
    isIncapacitated,
    isInspired,
    conditions = [],
    combatMods,
    vitals,
    progression,
    health,
    spellSlots = []
  } = member;

  const resolvedPortrait = portraitUrl || getDefaultPortraitForClass(classAndLevel);

  const currentHp = health.currentHp;
  const maxHp = Math.max(1, health.maxHp);
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentHp / maxHp) * 100)));
  const isDown = isIncapacitated || currentHp <= 0;

  // XP Progress Calculation
  const currentXp = progression.currentXp ?? 0;
  const nextLevelXp = Math.max(1, progression.nextLevelXp ?? 100000);
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / nextLevelXp) * 100)));

  const handleCopyCode = () => {
    if (member.dmShareCode) {
      navigator.clipboard.writeText(member.dmShareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div
      className={`relative w-full max-w-[420px] bg-white/[0.76] backdrop-blur-[2px] border border-[#141414]/25 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-[#161616] select-none overflow-hidden transition-all duration-300 ${
        isDown 
          ? 'border-[#881337] ring-2 ring-[#881337]/30 shadow-[0_0_25px_rgba(225,29,72,0.25)]' 
          : 'hover:border-black/40'
      } ${className}`}
    >
      {/* ── 9-Slice Border Frame around entire card container ── */}
      <NineSliceBorder cornerSize={24} />

      {/* ========================================================================= */}
      {/* 1. EXPANDED PORTRAIT & HUD STAGE (PHOTO EXTENDS TO TOP OF CARD)           */}
      {/* ========================================================================= */}
      <div className="relative h-[430px] w-full rounded-lg overflow-hidden my-0 bg-[#070608] border border-[#141414]/20 flex flex-col justify-between shadow-inner">
        
        {/* Full-Bleed High Quality Character Art expanding to top of card */}
        <img
          src={resolvedPortrait}
          alt={characterName}
          className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.06]"
        />

        {/* ── Top Header overlay with lower opacity backdrop ── */}
        <div className="relative z-20 bg-[#0a0a0d]/75 backdrop-blur-xs p-3 rounded-t-lg border-b border-[#2a241e]/40 flex flex-col gap-0.5 text-[#f0ece1]">
          
          {/* Top Row: Player Name + Conditions Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[#8c8273] uppercase tracking-widest text-[11px] font-serif font-medium">
                PLAYER <strong className="text-[#d6cdbe] font-serif font-normal ml-0.5">{playerName}</strong>
              </span>
              {member.dmShareCode && (
                <button
                  onClick={handleCopyCode}
                  className="ml-1 text-[9px] font-mono text-[#736c62] hover:text-[#e8e2d5] bg-[#141217] border border-[#26201a] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy DM Share Code"
                >
                  {copiedCode ? (
                    <>
                      <Check size={9} className="text-[#4ade80]" />
                      <span className="text-[#4ade80] font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={9} />
                      <span>{member.dmShareCode}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Outlined Pill: [ CONDITIONS ({count}) ] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsConditionsOpen(!isConditionsOpen)}
                className={`px-2.5 py-0.5 rounded border text-[10px] tracking-widest uppercase font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  conditions.length > 0
                    ? 'border-[#e11d48]/60 bg-[#2b0c16] text-[#fda4af]'
                    : 'border-[#2a241e] bg-[#121116]/80 text-[#8c8273] hover:text-[#e8e2d5] hover:border-[#524638]'
                }`}
              >
                <SlidersHorizontal size={11} />
                <span>CONDITIONS ({conditions.length})</span>
              </button>

              {/* Conditions Interactive Dropdown */}
              {isConditionsOpen && (
                <div className="absolute right-0 top-8 w-48 bg-[#0e0e13] border border-[#332b22] rounded-lg p-2 shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                  <span className="text-[9px] font-serif uppercase tracking-wider text-[#736c62] border-b border-[#231d16] pb-1 mb-0.5">
                    Toggle Status Effects
                  </span>
                  {COMMON_CONDITIONS.map((cond) => {
                    const isApplied = conditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => onToggleCondition?.(cond)}
                        className={`px-2 py-1 rounded text-[11px] font-serif text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isApplied
                            ? 'bg-[#881337]/40 text-[#fda4af] font-semibold border border-[#e11d48]/30'
                            : 'text-[#8c8273] hover:bg-[#1a1714] hover:text-[#e8e2d5]'
                        }`}
                      >
                        <span>{cond}</span>
                        {isApplied && <Check size={11} className="text-[#fda4af]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Character Name */}
          <h2 className="font-serif tracking-widest uppercase text-xl sm:text-2xl text-[#f0ece1] leading-tight mt-0.5 font-normal truncate">
            {characterName}
          </h2>

          {/* Subtitle: Level, Class, Subclass & Ancestry */}
          <p className="text-xs text-[#8c8273] tracking-wide font-serif truncate">
            {classAndLevel} • {ancestry}
          </p>

          {/* Left-Aligned Outlined Status Badge: [ ✧ INSPIRED ] */}
          {isInspired && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-0.5 rounded bg-[#0c1524]/90 border border-[#1e3a5f] text-[#60a5fa] text-[10px] font-serif tracking-widest uppercase self-start shadow-[0_0_10px_rgba(30,58,95,0.4)]">
              <span className="text-xs">✶</span>
              <span>INSPIRED</span>
            </div>
          )}
        </div>

        {/* Seamless Atmospheric Vignettes blending art into #0a0a0d */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0a0a0d]/80 via-[#0a0a0d]/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0a0a0d]/80 via-[#0a0a0d]/20 to-transparent pointer-events-none" />

        {/* Downed / Incapacitated Warning Overlay */}
        {isDown && (
          <div className="absolute inset-0 bg-[#4c0519]/80 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 gap-2 text-center animate-pulse">
            <Skull size={36} className="text-[#fda4af] drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            <span className="font-serif text-sm uppercase tracking-widest text-[#ffe4e6] font-bold">
              HERO DOWN (0 HP)
            </span>
            <span className="text-[11px] font-serif text-[#fecdd3]">
              Requires Healing or Death Saves
            </span>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* MIDDLE STAGE: STAT SQUARES WITH EXACT SAME 75% OPACITY AS TOP HEADER    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-20 flex justify-between items-start px-3 pt-2 pb-2">
          
          {/* LEFT FLOATING STACK */}
          <div className="flex flex-col gap-2 text-left pointer-events-none">
            
            {/* Melee Attack Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1.5 px-2.5 shadow-lg flex flex-col min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <span className="text-[9px] uppercase tracking-widest text-[#a88a53] font-serif font-semibold relative z-10">
                MELEE
              </span>
              <span className="text-2xl font-serif text-[#f3ece0] font-normal leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] my-0.5 relative z-10">
                +{combatMods.melee.bonus}
              </span>
              <span className="text-[11px] font-mono text-[#8a8070] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] relative z-10">
                {combatMods.melee.formula}
              </span>
            </div>

            {/* Ranged Attack Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1.5 px-2.5 shadow-lg flex flex-col min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <div className="flex items-center gap-1 relative z-10">
                <span className="text-[#38bdf8] text-[10px]">✶</span>
                <span className="text-[9px] uppercase tracking-widest text-[#38bdf8] font-serif font-semibold">
                  RANGED
                </span>
              </div>
              <span className="text-2xl font-serif text-[#f3ece0] font-normal leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] my-0.5 relative z-10">
                +{combatMods.ranged.bonus}
              </span>
              <span className="text-[11px] font-mono text-[#8a8070] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] relative z-10">
                {combatMods.ranged.formula}
              </span>
            </div>

            {/* Spells Attack Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1.5 px-2.5 shadow-lg flex flex-col min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <div className="flex items-center gap-1 relative z-10">
                <Flame size={11} className="text-[#c084fc] drop-shadow-[0_0_4px_rgba(192,132,252,0.8)]" />
                <span className="text-[9px] uppercase tracking-widest text-[#c084fc] font-serif font-semibold">
                  SPELLS
                </span>
              </div>
              <span className="text-2xl font-serif text-[#f3ece0] font-normal leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] my-0.5 relative z-10">
                +{combatMods.spells.bonus}
              </span>
              <span className="text-[11px] font-mono text-[#c084fc] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] relative z-10">
                DC {combatMods.spells.dc}
              </span>
            </div>

          </div>

          {/* RIGHT FLOATING STACK */}
          <div className="flex flex-col gap-2 text-right pointer-events-none">
            
            {/* Armor Class Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1.5 px-2.5 shadow-lg flex flex-col items-end min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <span className="text-[9px] uppercase tracking-widest text-[#8a8070] font-serif font-semibold relative z-10">
                AC
              </span>
              <div className="flex items-center gap-1.5 leading-none my-0.5 relative z-10">
                <Shield size={14} className="text-[#8c8273] shrink-0" />
                <span className="text-2xl font-serif text-[#f3ece0] font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  {vitals.ac}
                </span>
              </div>
            </div>

            {/* Initiative Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1.5 px-2.5 shadow-lg flex flex-col items-end min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <span className="text-[9px] uppercase tracking-widest text-[#4ade80] font-serif font-semibold relative z-10">
                INITIATIVE
              </span>
              <div className="flex items-center gap-1 leading-none my-0.5 relative z-10">
                <Zap size={14} className="text-[#4ade80] shrink-0 fill-[#4ade80]/20" />
                <span className="text-2xl font-serif text-[#4ade80] font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  {vitals.initiative >= 0 ? `+${vitals.initiative}` : vitals.initiative}
                </span>
              </div>
            </div>

            {/* Speed Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1 px-2.5 shadow-lg flex flex-col items-end min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <span className="text-[8px] uppercase tracking-widest text-[#8a8070] font-serif font-semibold relative z-10">
                SPEED
              </span>
              <div className="flex items-center gap-1 leading-none relative z-10">
                <Feather size={13} className="text-[#8c8273] shrink-0" />
                <span className="text-lg font-serif text-[#f3ece0] font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  {vitals.speed} ft
                </span>
              </div>
            </div>

            {/* Senses Frame */}
            <div className="relative bg-[#0a0a0d]/75 backdrop-blur-xs border border-[#2a241e]/80 rounded-md py-1 px-2.5 shadow-lg flex flex-col items-end min-w-[78px] overflow-hidden">
              <NineSliceBorder cornerSize={10} />
              <span className="text-[8px] uppercase tracking-widest text-[#d97706] font-serif font-semibold relative z-10">
                SENSES
              </span>
              <div className="flex items-center gap-1 text-[11px] font-serif text-[#d6cdbe] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] relative z-10">
                <Eye size={11} className="text-[#d97706] shrink-0" />
                <span>P {vitals.senses.passivePerception}</span>
                <span className="text-[#736c62]">/</span>
                <span>D {vitals.senses.passiveInsight}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Active Conditions Badges at Bottom of Stage */}
        {conditions.length > 0 && (
          <div className="relative z-20 flex flex-wrap gap-1 items-center justify-center p-2 pointer-events-none">
            {conditions.map((cond) => (
              <span
                key={cond}
                className="px-2 py-0.5 bg-black/85 border border-[#e11d48]/70 text-[#fecdd3] text-[9px] font-serif uppercase tracking-wider rounded shadow backdrop-blur-xs font-semibold"
              >
                {cond}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. PROGRESSION & VITALS HUB (PARCHMENT INTEGRATED CARRY-WEIGHT BARS)      */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 relative z-20">
        
        {/* Level & XP Row */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#1a1a1a]">
              <WingedShieldCrest />
              <span className="font-serif text-xs sm:text-sm tracking-widest font-bold uppercase">
                LEVEL {progression.level}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#555555] font-bold">
              {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>

          {/* Exact Carry Weight Sumi-e Brush Bar (XP) */}
          <div 
            className="relative w-full h-[6px] bg-[#141414]/10 overflow-hidden"
            style={{ 
              clipPath: 'polygon(0% 20%, 15% 5%, 85% 10%, 100% 30%, 98% 80%, 80% 95%, 20% 90%, 0% 75%)' 
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#9a6714] via-[#c9963d] to-[#f5d77f] transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
            {/* Encumbrance-style Milestone Tick */}
            <div 
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#141414]/40 pointer-events-none" 
              style={{ left: '50%' }}
              title="Midpoint Milestone (50%)"
            />
          </div>
        </div>

        {/* Hit Points Bar & Steppers */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#555555] font-bold">
              HIT POINTS
            </span>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-serif font-bold text-[#161616]">
              <span>{currentHp} / {maxHp}</span>
              {health.tempHp ? (
                <span className="text-[#0284c7] text-xs font-mono font-bold">(+{health.tempHp})</span>
              ) : null}
              <span className="text-[#e11d48] text-xs ml-0.5">♡</span>
            </div>
          </div>

          {/* Exact Carry Weight Sumi-e Brush Bar (HP) */}
          <div 
            className="relative w-full h-[6px] bg-[#141414]/10 overflow-hidden"
            style={{ 
              clipPath: 'polygon(0% 20%, 15% 5%, 85% 10%, 100% 30%, 98% 80%, 80% 95%, 20% 90%, 0% 75%)' 
            }}
          >
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-[#059669] to-[#22c55e]'
                  : hpPercent > 25
                    ? 'bg-gradient-to-r from-[#d97706] to-[#eab308]'
                    : 'bg-gradient-to-r from-[#b91c1c] to-[#ef4444] animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            {/* Encumbrance-style Bloodied (50%) and Critical (25%) Ticks */}
            <div 
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#141414]/40 pointer-events-none" 
              style={{ left: '25%' }}
              title="Critical Health (25%)"
            />
            <div 
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#141414]/40 pointer-events-none" 
              style={{ left: '50%' }}
              title="Bloodied (50%)"
            />
          </div>

          {/* HP Steppers Row: [-5] [-1] | [+1] [+5] */}
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAdjustHp?.(-5)}
                className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white/90 border border-[#141414]/20 hover:border-red-500 hover:bg-rose-50 text-red-600 rounded shadow-xs transition-colors cursor-pointer"
                title="Deduct 5 HP"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => onAdjustHp?.(-1)}
                className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white/90 border border-[#141414]/20 hover:border-red-500 hover:bg-rose-50 text-red-600 rounded shadow-xs transition-colors cursor-pointer"
                title="Deduct 1 HP"
              >
                -1
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAdjustHp?.(1)}
                className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white/90 border border-[#141414]/20 hover:border-[#1EB253] hover:bg-emerald-50 text-[#1EB253] rounded shadow-xs transition-colors cursor-pointer"
                title="Heal 1 HP"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => onAdjustHp?.(5)}
                className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white/90 border border-[#141414]/20 hover:border-[#1EB253] hover:bg-emerald-50 text-[#1EB253] rounded shadow-xs transition-colors cursor-pointer"
                title="Heal 5 HP"
              >
                +5
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. LOWER DEFENSE MATRIX (3-Column Strip WITH 9-SLICE BORDERS)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-3 gap-2.5 relative z-20">
        
        {/* Armor Class */}
        <div className="relative bg-white/80 border border-[#141414]/20 rounded-md p-2.5 flex items-center gap-2 shadow-xs overflow-hidden">
          <NineSliceBorder cornerSize={12} />
          <Shield size={16} className="text-[#555555] shrink-0 relative z-10" />
          <div className="flex flex-col leading-tight min-w-0 relative z-10">
            <span className="text-[8px] font-serif uppercase tracking-wider text-[#555555] font-bold truncate">
              ARMOR CLASS
            </span>
            <span className="text-xs sm:text-sm font-serif font-bold text-[#161616] truncate">
              {vitals.ac} AC
            </span>
          </div>
        </div>

        {/* Speed */}
        <div className="relative bg-white/80 border border-[#141414]/20 rounded-md p-2.5 flex items-center gap-2 shadow-xs overflow-hidden">
          <NineSliceBorder cornerSize={12} />
          <Feather size={16} className="text-[#555555] shrink-0 relative z-10" />
          <div className="flex flex-col leading-tight min-w-0 relative z-10">
            <span className="text-[8px] font-serif uppercase tracking-wider text-[#555555] font-bold truncate">
              SPEED
            </span>
            <span className="text-xs sm:text-sm font-serif font-bold text-[#161616] truncate">
              {vitals.speed} ft
            </span>
          </div>
        </div>

        {/* Initiative */}
        <div className="relative bg-white/80 border border-[#141414]/20 rounded-md p-2.5 flex items-center gap-2 shadow-xs overflow-hidden">
          <NineSliceBorder cornerSize={12} />
          <Zap size={16} className="text-[var(--accent-ink)] shrink-0 fill-[var(--accent-ink)]/15 relative z-10" />
          <div className="flex flex-col leading-tight min-w-0 relative z-10">
            <span className="text-[8px] font-serif uppercase tracking-wider text-[#555555] font-bold truncate">
              INITIATIVE
            </span>
            <span className="text-xs sm:text-sm font-serif font-bold text-[var(--accent-ink)] truncate">
              {vitals.initiative >= 0 ? `+${vitals.initiative}` : vitals.initiative}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. SPELL SLOTS MATRIX (WITH 9-SLICE BORDER)                               */}
      {/* ========================================================================= */}
      <div className="relative bg-white/70 border border-[#141414]/20 rounded-md p-3 flex flex-col gap-2 relative z-20 shadow-xs overflow-hidden">
        <NineSliceBorder cornerSize={14} />
        
        <span className="text-[10px] font-serif uppercase tracking-widest text-[#555555] font-bold relative z-10">
          SPELL SLOTS
        </span>

        {spellSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative z-10">
            {spellSlots.slice(0, 3).map((tier) => {
              const remaining = Math.max(0, tier.total - tier.used);
              const ordinalLabel = tier.level === 1 ? '1ST LEVEL' : tier.level === 2 ? '2ND LEVEL' : tier.level === 3 ? '3RD LEVEL' : `${tier.level}TH LEVEL`;
              
              return (
                <div 
                  key={tier.level} 
                  className="bg-white/90 border border-[#141414]/15 rounded p-2 flex flex-col gap-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-serif uppercase tracking-wider text-[#555555] font-bold">
                      {ordinalLabel}
                    </span>
                    <span className="text-xs font-serif text-[#161616] font-bold">
                      {remaining} / {tier.total}
                    </span>
                  </div>

                  {/* Diamond Slots Indicator */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {Array.from({ length: tier.total }).map((_, slotIdx) => {
                      const isFilled = slotIdx < remaining;
                      return (
                        <DiamondSlot
                          key={slotIdx}
                          filled={isFilled}
                          onClick={() => onToggleSpellSlot?.(tier.level, slotIdx)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[11px] font-serif text-[#555555] italic py-1 text-center relative z-10">
            Martial Prowess • No Active Spell Slots
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. FOOTER BUTTONS (WITH 9-SLICE BORDERS & DESCRIPTOR)                     */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 relative z-20 pt-1">
        <button
          type="button"
          onClick={onInspect}
          className="relative flex-1 py-3 px-4 bg-white/[0.92] hover:bg-[var(--accent-ink)] hover:text-white border border-black/20 hover:border-[var(--accent-ink)] text-[#1a1a1a] rounded-md font-serif text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer overflow-hidden"
        >
          <NineSliceBorder cornerSize={12} />
          <BookOpen size={14} className="text-[#555555] group-hover:text-white transition-colors relative z-10" />
          <span className="relative z-10 font-bold">INSPECT CHARACTER SHEET</span>
          <ChevronRight size={14} className="text-[#555555] group-hover:text-white group-hover:translate-x-0.5 transition-transform relative z-10" />
        </button>

        {onOpenLootModal && (
          <button
            type="button"
            onClick={onOpenLootModal}
            className="relative py-3 px-4 bg-white/[0.92] hover:bg-[var(--accent-ink)] hover:text-white border border-black/20 hover:border-[var(--accent-ink)] text-[#1a1a1a] rounded-md font-serif text-xs tracking-widest uppercase transition-all shadow-xs cursor-pointer shrink-0 overflow-hidden flex items-center justify-center"
            title="Inject Loot to Hero"
          >
            <NineSliceBorder cornerSize={12} />
            <span className="relative z-10 font-bold">LOOT</span>
          </button>
        )}
      </div>

    </div>
  );
}

/**
 * Utility adapter to convert PartyMemberRef to DMPartyMember
 */
export function partyMemberToDMPartyMember(
  member: any,
  xpThresholds: Record<number, number> = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000, 9: 48000,
    10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000, 16: 195000,
    17: 225000, 18: 265000, 19: 305000, 20: 355000
  }
): DMPartyMember {
  const level = member.level ?? 1;
  const currentBaseXp = xpThresholds[level] || 0;
  const nextTargetXp = xpThresholds[level + 1] || 355000;
  const currentXp = member.currentXp !== undefined ? member.currentXp : currentBaseXp;

  const profBonus = Math.floor(level / 4) + 2;
  const defaultMeleeBonus = profBonus + 3;
  const defaultRangedBonus = profBonus + 2;
  const defaultSpellAtk = profBonus + 3;
  const defaultSpellDc = 8 + profBonus + 3;

  // Spell slots array
  const spellSlots: DMPartyMember['spellSlots'] = [];
  const maxSlots = member.spellSlotsMax || {};
  const currentSlots = member.spellSlotsCurrent || {};

  for (let lvl = 1; lvl <= 9; lvl++) {
    const total = maxSlots[lvl] || 0;
    if (total > 0) {
      const remaining = currentSlots[lvl] !== undefined ? currentSlots[lvl] : total;
      const used = Math.max(0, total - remaining);
      spellSlots.push({
        level: lvl,
        total,
        used
      });
    }
  }

  const portrait = member.avatarUrl || member.portraitUrl || getDefaultPortraitForClass(member.class);

  return {
    id: member.id,
    playerName: member.player || 'Player',
    characterName: member.name || 'Hero',
    classAndLevel: `Level ${level} ${member.class || 'Adventurer'}`,
    ancestry: member.species || 'Human',
    portraitUrl: portrait,
    isIncapacitated: (member.hpCurrent ?? 25) <= 0,
    isInspired: member.inspiration ?? false,
    conditionsCount: (member.conditions || []).length,
    conditions: member.conditions || [],
    dmShareCode: member.dmShareCode,
    combatMods: {
      melee: {
        bonus: member.meleeAttack?.bonus ?? defaultMeleeBonus,
        formula: member.meleeAttack?.damage ? `1d20+${member.meleeAttack.bonus ?? defaultMeleeBonus}` : `1d20+${defaultMeleeBonus}`
      },
      ranged: {
        bonus: member.rangedAttack?.bonus ?? defaultRangedBonus,
        formula: member.rangedAttack?.damage ? `1d20+${member.rangedAttack.bonus ?? defaultRangedBonus}` : `1d20+${defaultRangedBonus}`
      },
      spells: {
        bonus: member.spellAttack ?? defaultSpellAtk,
        dc: member.spellDC ?? defaultSpellDc
      }
    },
    vitals: {
      ac: member.ac ?? 14,
      initiative: member.initiativeBonus ?? 0,
      speed: member.speed ?? 30,
      senses: {
        passivePerception: member.passivePerception ?? 10,
        passiveInsight: member.passiveInsight ?? 10
      }
    },
    progression: {
      level,
      currentXp,
      nextLevelXp: nextTargetXp
    },
    health: {
      currentHp: member.hpCurrent ?? 25,
      maxHp: member.hpMax ?? 25,
      tempHp: member.tempHp
    },
    spellSlots
  };
}

export default DMPartyCard;
