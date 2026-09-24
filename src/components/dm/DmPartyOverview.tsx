import React, { useState } from 'react';
import { PartyMemberRef, Campaign } from '../../types/campaign';
import { useDmStore } from '../../store/dmStore';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { DMPartyCard, partyMemberToDMPartyMember } from './DMPartyCard';
import { 
  Shield, 
  Heart, 
  Swords, 
  Sparkles, 
  Eye, 
  User, 
  Gift, 
  Copy, 
  Check, 
  Zap, 
  Flame, 
  Users, 
  ChevronDown, 
  Sparkle, 
  Compass, 
  Crosshair, 
  Skull,
  Award,
  X
} from 'lucide-react';

interface DmPartyOverviewProps {
  campaign: Campaign | null;
  onOpenLootModal: (recipientId: string) => void;
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

const LEVEL_XP_THRESHOLDS: Record<number, number> = {
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

function calculateLevelFromXp(xp: number): number {
  let level = 1;
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= (LEVEL_XP_THRESHOLDS[lvl] || 0)) {
      level = lvl;
      break;
    }
  }
  return level;
}

function getXpProgress(currentXp: number | undefined, level: number) {
  const currentBase = LEVEL_XP_THRESHOLDS[level] || 0;
  const nextTarget = LEVEL_XP_THRESHOLDS[level + 1] || 355000;
  const xp = currentXp !== undefined ? currentXp : currentBase;
  const range = nextTarget - currentBase;
  if (range <= 0) return { percent: 100, current: xp, next: nextTarget };
  const currentInTier = Math.max(0, xp - currentBase);
  const percent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
  return { percent, current: xp, next: nextTarget };
}

export function DmPartyOverview({ campaign, onOpenLootModal }: DmPartyOverviewProps) {
  const { updateCampaign, getPartyAverageLevel, populateSampleParty } = useCampaignStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeConditionDropdown, setActiveConditionDropdown] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isBulkXpOpen, setIsBulkXpOpen] = useState(false);
  const [bulkXpInput, setBulkXpInput] = useState('500');
  const [selectedInspectMember, setSelectedInspectMember] = useState<PartyMemberRef | null>(null);

  if (!campaign) {
    return (
      <div className="p-12 text-center text-xs font-serif text-[#7E7465]">
        No active campaign selected. Please select or create a campaign from the Home Portal.
      </div>
    );
  }

  const party = campaign.party || [];

  if (party.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-xl gap-4 max-w-xl mx-auto my-12 text-center relative overflow-hidden text-[#161616]">
        
        <div className="p-4 bg-black/5 border border-black/10 rounded-full text-[var(--accent-ink)]">
          <Users size={36} />
        </div>
        <div>
          <h3 className="font-display text-base uppercase tracking-widest text-[#1a1a1a] font-bold">
            No Party Members in Chronicle
          </h3>
          <p className="font-serif text-xs text-[#555555] mt-1 max-w-md">
            Players can join using join code <strong className="text-[var(--accent-ink)] font-mono">{campaign.joinCode}</strong>, or you can populate 4 balanced test heroes right now to test tactical telemetry and combat views.
          </p>
        </div>
        <button
          onClick={() => populateSampleParty(campaign.id)}
          className="px-5 py-2.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Sparkles size={15} />
          <span>Populate 4 Test Heroes</span>
        </button>
      </div>
    );
  }

  const averageLevel = getPartyAverageLevel(campaign.id);
  const totalPartyHpCurrent = party.reduce((sum, p) => sum + (p.hpCurrent || 0), 0);
  const totalPartyHpMax = party.reduce((sum, p) => sum + (p.hpMax || 1), 0);
  const partyHpPercent = Math.min(100, Math.round((totalPartyHpCurrent / Math.max(1, totalPartyHpMax)) * 100));

  const filteredParty = party.filter(p => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.class.toLowerCase().includes(q) ||
      p.player.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q)
    );
  });

  const handleAdjustMemberHp = (memberId: string, delta: number) => {
    const targetMember = party.find(m => m.id === memberId);
    if (targetMember) {
      const activeChar = useStore.getState().character;
      if (activeChar && activeChar.name.toLowerCase() === targetMember.name.toLowerCase()) {
        if (delta < 0) {
          useStore.getState().updateHP(Math.abs(delta), 'damage');
        } else {
          useStore.getState().updateHP(delta, 'heal');
        }
      }
    }

    const nextParty = party.map(m => {
      if (m.id === memberId) {
        let current = m.hpCurrent;
        let temp = m.tempHp || 0;

        if (delta < 0) {
          const dmg = Math.abs(delta);
          if (temp > 0) {
            if (dmg <= temp) {
              temp -= dmg;
            } else {
              const rem = dmg - temp;
              temp = 0;
              current = Math.max(0, current - rem);
            }
          } else {
            current = Math.max(0, current - dmg);
          }
        } else {
          current = Math.min(m.hpMax, current + delta);
        }

        return { ...m, hpCurrent: current, tempHp: temp };
      }
      return m;
    });

    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleSetMemberHpDirect = (memberId: string, current: number, max: number) => {
    const safeMax = Math.max(1, max);
    const safeCurrent = Math.max(0, Math.min(safeMax, current));
    const targetMember = party.find(m => m.id === memberId);

    if (targetMember) {
      const activeChar = useStore.getState().character;
      if (activeChar && activeChar.name.toLowerCase() === targetMember.name.toLowerCase()) {
        useStore.getState().updateCharacterField('hp', {
          ...activeChar.hp,
          current: safeCurrent,
          max: safeMax
        });
      }
    }

    const nextParty = party.map(m => {
      if (m.id === memberId) {
        return { ...m, hpCurrent: safeCurrent, hpMax: safeMax };
      }
      return m;
    });

    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleAdjustMemberXp = (memberId: string, delta: number) => {
    const targetMember = party.find(m => m.id === memberId);
    const currentBase = LEVEL_XP_THRESHOLDS[targetMember?.level ?? 1] || 0;
    const currentVal = targetMember?.currentXp !== undefined ? targetMember.currentXp : currentBase;
    const nextXp = Math.max(0, currentVal + delta);
    const nextLevel = calculateLevelFromXp(nextXp);

    if (targetMember) {
      const activeChar = useStore.getState().character;
      if (activeChar && activeChar.name.toLowerCase() === targetMember.name.toLowerCase()) {
        useStore.getState().updateCharacterField('currentXp', nextXp);
        useStore.getState().updateCharacterField('level', nextLevel);
      }
    }

    const nextParty = party.map(m => {
      if (m.id === memberId) {
        return { ...m, currentXp: nextXp, level: nextLevel };
      }
      return m;
    });

    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleSetMemberXpDirect = (memberId: string, newXp: number) => {
    const targetMember = party.find(m => m.id === memberId);
    const safeXp = Math.max(0, newXp);
    const nextLevel = calculateLevelFromXp(safeXp);

    if (targetMember) {
      const activeChar = useStore.getState().character;
      if (activeChar && activeChar.name.toLowerCase() === targetMember.name.toLowerCase()) {
        useStore.getState().updateCharacterField('currentXp', safeXp);
        useStore.getState().updateCharacterField('level', nextLevel);
      }
    }

    const nextParty = party.map(m => {
      if (m.id === memberId) {
        return { ...m, currentXp: safeXp, level: nextLevel };
      }
      return m;
    });

    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleBulkAwardXp = (amount: number) => {
    if (amount === 0) return;
    const activeChar = useStore.getState().character;

    const nextParty = party.map(m => {
      const currentBase = LEVEL_XP_THRESHOLDS[m.level ?? 1] || 0;
      const currentVal = m.currentXp !== undefined ? m.currentXp : currentBase;
      const nextXp = Math.max(0, currentVal + amount);
      const nextLevel = calculateLevelFromXp(nextXp);

      if (activeChar && activeChar.name.toLowerCase() === m.name.toLowerCase()) {
        useStore.getState().updateCharacterField('currentXp', nextXp);
        useStore.getState().updateCharacterField('level', nextLevel);
      }

      return { ...m, currentXp: nextXp, level: nextLevel };
    });

    updateCampaign(campaign.id, { party: nextParty });
    setIsBulkXpOpen(false);
  };

  const handleToggleCondition = (memberId: string, condition: string) => {
    const nextParty = party.map(m => {
      if (m.id === memberId) {
        const currentConditions = m.conditions || [];
        const exists = currentConditions.includes(condition);
        const updated = exists 
          ? currentConditions.filter(c => c !== condition)
          : [...currentConditions, condition];
        return { ...m, conditions: updated };
      }
      return m;
    });

    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleToggleSpellSlot = (memberId: string, level: number, slotIndex: number) => {
    const nextParty = party.map(m => {
      if (m.id === memberId) {
        const maxSlots = m.spellSlotsMax?.[level] || 0;
        const current = m.spellSlotsCurrent?.[level] !== undefined ? m.spellSlotsCurrent[level] : maxSlots;
        let nextVal = current;
        if (slotIndex < current) {
          nextVal = Math.max(0, current - 1);
        } else {
          nextVal = Math.min(maxSlots, current + 1);
        }
        return {
          ...m,
          spellSlotsCurrent: {
            ...(m.spellSlotsCurrent || {}),
            [level]: nextVal
          }
        };
      }
      return m;
    });
    updateCampaign(campaign.id, { party: nextParty });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1920px] mx-auto w-full select-none pb-12">
      
      {/* 1. TOP STATS & QUICK TELEMETRY RIBBON */}
      <div className="p-4 bg-[#fcfbf9] border-2 border-black/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shrink-0 shadow-sm text-[#161616]">

        {/* Left: Campaign & Party Summary */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black/5 border border-black/10 rounded text-[var(--accent-ink)] shrink-0 shadow-xs">
            <Users size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm sm:text-base uppercase tracking-[0.1em] text-[#1a1a1a] font-bold">
                {campaign.title} • Party Overview
              </h3>
              <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-widest font-bold">
                {party.length} {party.length === 1 ? 'Hero' : 'Heroes'}
              </span>
            </div>
            <p className="font-serif italic text-xs text-[#555555] mt-0.5">
              Average Party Level: <strong className="text-[#161616]">Lv. {averageLevel}</strong> • World Setting: {campaign.setting}
            </p>
          </div>
        </div>

        {/* Right: Quick Vitals Health Pool & Search */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          
          {/* Aggregate Party Health */}
          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded border border-[#141414]/15 shadow-xs">
            <Heart size={16} className="text-[#c53030] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-display uppercase text-[#555555] font-bold">Party Vitality</span>
              <span className="font-mono text-xs font-bold text-[#161616]">
                {totalPartyHpCurrent} / {totalPartyHpMax} HP <span className="text-[var(--accent-ink)]">({partyHpPercent}%)</span>
              </span>
            </div>
          </div>

          {/* Quick Filter if large party */}
          {party.length > 4 && (
            <input
              type="text"
              placeholder="Filter hero..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] px-3 py-1.5 text-xs text-[#161616] rounded font-serif w-36 focus:outline-none"
            />
          )}

          {/* Add 4 Test Heroes button */}
          <button
            onClick={() => populateSampleParty(campaign.id)}
            className="px-3.5 py-2 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
            title="Reset or populate 4 standard test heroes for this campaign"
          >
            <Sparkles size={13} className="text-[var(--accent-ink)]" />
            <span>Add 4 Test Heroes</span>
          </button>

          {/* Inject Loot shortcut */}
          <button
            onClick={() => onOpenLootModal('party_stash')}
            className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
          >
            <Gift size={13} />
            <span>Party Loot</span>
          </button>
        </div>

      </div>

      {/* 2. INFINITE WRAPPING CRPG PARTY LINEUP GRID (4 Columns on Desktop, Continuous Rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 items-stretch justify-items-center">
        {filteredParty.map(member => {
          const dmMember = partyMemberToDMPartyMember(member, LEVEL_XP_THRESHOLDS);

          return (
            <DMPartyCard
              key={member.id}
              member={dmMember}
              onAdjustHp={(delta) => handleAdjustMemberHp(member.id, delta)}
              onAdjustXp={(delta) => handleAdjustMemberXp(member.id, delta)}
              onSetHpDirect={(cur, max) => handleSetMemberHpDirect(member.id, cur, max)}
              onSetXpDirect={(xp) => handleSetMemberXpDirect(member.id, xp)}
              onToggleSpellSlot={(level, slotIdx) => handleToggleSpellSlot(member.id, level, slotIdx)}
              onToggleCondition={(cond) => handleToggleCondition(member.id, cond)}
              onOpenLootModal={() => onOpenLootModal(member.id)}
              onInspect={() => setSelectedInspectMember(member)}
            />
          );
        })}
      </div>

      {filteredParty.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#141414]/15 rounded-xl text-xs font-serif text-[#555555]">
          No party members match "{searchFilter}".
        </div>
      )}

      {/* 3. BULK AWARD XP TO PARTY MODAL */}
      {isBulkXpOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 shadow-2xl flex flex-col gap-4 overflow-hidden text-[#161616]">
            <OrnateCardFrame cornerSize={24} />

            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3 relative z-20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-black/5 border border-black/10 rounded text-[var(--accent-ink)]">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-gw2 text-base font-bold text-[#1a1a1a] uppercase tracking-wider">
                    Award Party XP
                  </h3>
                  <span className="text-xs font-serif italic text-[#555555]">
                    Distribute experience equally to all {party.length} active party members.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkXpOpen(false)}
                className="text-[#555555] hover:text-[#161616] transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 relative z-20">
              <label className="text-[11px] font-gw2 uppercase tracking-wider text-[#555555] font-bold">
                Experience Amount to Grant (Each)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={bulkXpInput}
                  onChange={(e) => setBulkXpInput(e.target.value)}
                  className="flex-1 bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2.5 rounded font-edo text-base font-bold text-[#161616] focus:outline-none"
                  placeholder="e.g. 500"
                />
                <span className="text-xs font-gw2 font-bold text-[#555555]">XP</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: '+100 XP', val: 100 },
                  { label: '+250 XP', val: 250 },
                  { label: '+500 XP', val: 500 },
                  { label: '+1,000 XP', val: 1000 },
                  { label: '+2,500 XP', val: 2500 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setBulkXpInput(preset.val.toString())}
                    className="px-2.5 py-1 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] text-xs font-mono font-bold rounded transition-all cursor-pointer shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#141414]/15 relative z-20">
              <button
                type="button"
                onClick={() => setIsBulkXpOpen(false)}
                className="px-4 py-2 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] rounded-xs text-xs uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkAwardXp(parseInt(bulkXpInput, 10) || 0)}
                className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Grant XP to All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSPECT CHARACTER SHEET MODAL */}
      {selectedInspectMember && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden text-[#161616] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <OrnateCardFrame cornerSize={26} />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black/30 bg-[#141210] shrink-0 shadow-md">
                  {selectedInspectMember.avatarUrl ? (
                    <img src={selectedInspectMember.avatarUrl} alt={selectedInspectMember.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--accent-ink)]">
                      <User size={28} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-gw2 text-xl font-bold uppercase tracking-wider text-[#161616]">
                      {selectedInspectMember.name}
                    </h3>
                    {selectedInspectMember.inspiration && (
                      <span className="px-2 py-0.5 rounded bg-[var(--accent-ink)] text-white text-[9px] font-gw2 uppercase tracking-widest font-bold">
                        ★ Inspired
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-serif italic text-[#555555]">
                    Level {selectedInspectMember.level} {selectedInspectMember.class} • {selectedInspectMember.species} • Player: <strong className="text-[#161616] font-mono">{selectedInspectMember.player}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInspectMember(null)}
                className="text-[#555555] hover:text-[#161616] p-1.5 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vitals Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-[#141414]/15 rounded-md p-3 flex flex-col items-center text-center shadow-xs">
                <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#555555] font-bold">Hit Points</span>
                <span className="text-lg font-edo font-bold text-[#161616] mt-0.5">
                  {selectedInspectMember.hpCurrent} / {selectedInspectMember.hpMax}
                </span>
                {selectedInspectMember.tempHp ? (
                  <span className="text-[10px] text-[#0284c7] font-mono font-bold">+{selectedInspectMember.tempHp} Temp</span>
                ) : null}
              </div>

              <div className="bg-white border border-[#141414]/15 rounded-md p-3 flex flex-col items-center text-center shadow-xs">
                <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#555555] font-bold">Armor Class</span>
                <span className="text-lg font-edo font-bold text-[var(--accent-ink)] mt-0.5">
                  {selectedInspectMember.ac} AC
                </span>
              </div>

              <div className="bg-white border border-[#141414]/15 rounded-md p-3 flex flex-col items-center text-center shadow-xs">
                <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#555555] font-bold">Speed</span>
                <span className="text-lg font-edo font-bold text-[#161616] mt-0.5">
                  {selectedInspectMember.speed ?? 30} ft
                </span>
              </div>

              <div className="bg-white border border-[#141414]/15 rounded-md p-3 flex flex-col items-center text-center shadow-xs">
                <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#555555] font-bold">Initiative</span>
                <span className="text-lg font-edo font-bold text-[#1EB253] mt-0.5">
                  {selectedInspectMember.initiativeBonus !== undefined ? (selectedInspectMember.initiativeBonus >= 0 ? `+${selectedInspectMember.initiativeBonus}` : selectedInspectMember.initiativeBonus) : '+0'}
                </span>
              </div>
            </div>

            {/* Attacks & Combat Readouts */}
            <div className="bg-white border border-[#141414]/15 rounded-md p-4 flex flex-col gap-3 shadow-xs">
              <span className="text-[10px] font-gw2 uppercase tracking-widest text-[#555555] font-bold">
                Attacks & Spellcasting
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-black/5 border border-[#141414]/10 rounded p-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] font-gw2 uppercase tracking-wider text-[var(--accent-ink)] font-bold">Melee Strike</span>
                  <span className="text-sm font-edo font-bold text-[#161616]">
                    +{selectedInspectMember.meleeAttack?.bonus ?? 5} ({selectedInspectMember.meleeAttack?.damage ?? '1d8+3'})
                  </span>
                  <span className="text-[10px] font-serif text-[#555555] truncate">{selectedInspectMember.meleeAttack?.name || 'Standard Strike'}</span>
                </div>

                <div className="bg-black/5 border border-[#141414]/10 rounded p-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#0284c7] font-bold">Ranged Strike</span>
                  <span className="text-sm font-edo font-bold text-[#161616]">
                    +{selectedInspectMember.rangedAttack?.bonus ?? 5} ({selectedInspectMember.rangedAttack?.damage ?? '1d6+3'})
                  </span>
                  <span className="text-[10px] font-serif text-[#555555] truncate">{selectedInspectMember.rangedAttack?.name || 'Ranged Weapon'}</span>
                </div>

                <div className="bg-black/5 border border-[#141414]/10 rounded p-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] font-gw2 uppercase tracking-wider text-[#7c3aed] font-bold">Spellcasting</span>
                  <span className="text-sm font-edo font-bold text-[#161616]">
                    +{selectedInspectMember.spellAttack ?? 5} (DC {selectedInspectMember.spellDC ?? 13})
                  </span>
                  <span className="text-[10px] font-serif text-[#555555]">Save DC & Attack Bonus</span>
                </div>
              </div>
            </div>

            {/* Passive Senses */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-[#141414]/15 rounded-md p-2.5 text-center shadow-xs">
                <span className="text-[9px] font-gw2 uppercase text-[#555555] font-bold">Passive Perception</span>
                <span className="block text-base font-edo font-bold text-[#161616] mt-0.5">{selectedInspectMember.passivePerception}</span>
              </div>
              <div className="bg-white border border-[#141414]/15 rounded-md p-2.5 text-center shadow-xs">
                <span className="text-[9px] font-gw2 uppercase text-[#555555] font-bold">Passive Insight</span>
                <span className="block text-base font-edo font-bold text-[#161616] mt-0.5">{selectedInspectMember.passiveInsight}</span>
              </div>
              <div className="bg-white border border-[#141414]/15 rounded-md p-2.5 text-center shadow-xs">
                <span className="text-[9px] font-gw2 uppercase text-[#555555] font-bold">Passive Investigation</span>
                <span className="block text-base font-edo font-bold text-[#161616] mt-0.5">{selectedInspectMember.passiveInvestigation}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={() => {
                  const id = selectedInspectMember.id;
                  setSelectedInspectMember(null);
                  onOpenLootModal(id);
                }}
                className="px-4 py-2 bg-white hover:bg-black/5 border border-[#141414]/20 text-[var(--accent-ink)] rounded-xs text-xs font-gw2 uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles size={14} />
                <span>Inject Loot / Item</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInspectMember(null)}
                className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] rounded-xs text-xs font-gw2 uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default DmPartyOverview;
