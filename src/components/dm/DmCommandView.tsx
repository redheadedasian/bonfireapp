import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDmStore, DEFAULT_CONDITIONS } from '../../store/dmStore';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { isUserDM, navigateTo } from '../../services/router';
import { LootInjectorModal } from './LootInjectorModal';
import { 
  Shield, 
  Heart, 
  Swords, 
  Dices, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Sparkles, 
  Coins, 
  Gift, 
  FileText, 
  AlertCircle, 
  Zap, 
  Check, 
  X,
  Lock,
  Compass,
  ShoppingBag,
  Activity,
  Flame,
  ArrowLeft,
  Crown,
  Search,
  Tag,
  Pin,
  Edit2,
  Save,
  Volume2,
  RefreshCw,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { CurrencyType } from '../../types/campaign';
import { InitiativeCombatant, DmNoteCategory, DmPrivateNote } from '../../types/dm';
import { SRDMonster } from '../../data/srdMonsters';
import { searchAllMonstersCombined, getMonsterDefaultArtwork } from '../../services/dnd5eMonsterService';
import { ASSET_MAP } from '@/config/assets';
import { requestRoll } from '../dice/rollBus';

import { DmBestiaryVault } from './DmBestiaryVault';
import { DmPartyOverview } from './DmPartyOverview';
import { TransferDmRoleModal } from '../campaigns/TransferDmRoleModal';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { DmTurnOrderRibbon } from './DmTurnOrderRibbon';
import { DmTreasuryOversightView } from './DmTreasuryOversightView';
import { DmSecretDiceStation } from './DmSecretDiceStation';
import { DmNotesLedgerView } from './DmNotesLedgerView';
import { CombatTheaterStage } from '../combat/CombatTheaterStage';

const AIMonsterForge = React.lazy(() => import('./AIMonsterForge').then(m => ({ default: m.AIMonsterForge })));

export function DmCommandView() {
  const {
    combatState,
    secretRolls,
    dmNotes,
    startCombat,
    endCombat,
    nextTurn,
    prevTurn,
    rollAllInitiative,
    addCombatant,
    updateCombatant,
    removeCombatant,
    toggleCombatantAction,
    applyHpAdjustment,
    toggleCondition,
    performSecretRoll,
    toggleRevealRoll,
    clearRollHistory,
    addDmNote,
    updateDmNote,
    deleteDmNote,
    togglePinDmNote
  } = useDmStore();

  const { getActiveCampaign, makePartyPurchase } = useCampaignStore();
  const { character, updateHP, setActiveTab } = useStore();
  const { user } = useAuthStore();
  const campaign = getActiveCampaign();
  const isDM = isUserDM(campaign, user?.uid);

  useEffect(() => {
    if (!isDM) {
      navigateTo(`/campaigns/${campaign?.id || 'cmp_drakkenheim_01'}/hud`, true);
    }
  }, [isDM, campaign?.id]);

  const [activeDmTab, setActiveDmTab] = useState<'vitals' | 'combat' | 'vault' | 'bestiary' | 'secret_dice' | 'notes'>('vitals');
  const [dmCombatMode, setDmCombatMode] = useState<'theater' | 'classic'>('theater');
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [isTransferDmModalOpen, setIsTransferDmModalOpen] = useState(false);
  const [selectedRecipientForLoot, setSelectedRecipientForLoot] = useState<string>('party_stash');

  // Dynamic In-Panel "Add Monster" Drawer & 5e API Search
  const [isMonsterDrawerOpen, setIsMonsterDrawerOpen] = useState(false);
  const [isAiForgeOpen, setIsAiForgeOpen] = useState(false);
  const [monsterSearchQuery, setMonsterSearchQuery] = useState('');
  const [searchedMonsters, setSearchedMonsters] = useState<SRDMonster[]>([]);
  const [isSearchingMonsters, setIsSearchingMonsters] = useState(false);

  // Quick Custom Monster Form (inside drawer)
  const [customMonsterName, setCustomMonsterName] = useState('');
  const [customMonsterHp, setCustomMonsterHp] = useState('35');
  const [customMonsterAc, setCustomMonsterAc] = useState('14');
  const [customMonsterCr, setCustomMonsterCr] = useState('2');
  const [customMonsterNotes, setCustomMonsterNotes] = useState('');

  // Confirm Delete Dialog States
  const [confirmDeleteCombatant, setConfirmDeleteCombatant] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<{ id: string; title: string } | null>(null);
  const [confirmClearRolls, setConfirmClearRolls] = useState<boolean>(false);

  // Search monsters live for In-Panel Drawer
  useEffect(() => {
    let active = true;
    const fetchM = async () => {
      if (!isMonsterDrawerOpen) return;
      setIsSearchingMonsters(true);
      const results = await searchAllMonstersCombined(monsterSearchQuery);
      if (active) {
        setSearchedMonsters(results);
        setIsSearchingMonsters(false);
      }
    };

    const timer = setTimeout(fetchM, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [monsterSearchQuery, isMonsterDrawerOpen]);

  const handleQuickAddMonsterToCombat = (monster: SRDMonster) => {
    addCombatant({
      name: monster.name,
      type: 'monster',
      hpCurrent: monster.hp,
      hpMax: monster.hp,
      ac: monster.ac,
      speed: parseInt(monster.speed, 10) || 30,
      avatarUrl: monster.imageUrl || getMonsterDefaultArtwork(monster.type),
      notes: `CR ${monster.cr} • ${monster.actions[0]?.name || 'Attack'}`
    });
  };

  const handleCreateCustomMonsterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMonsterName.trim()) return;

    addCombatant({
      name: customMonsterName.trim(),
      type: 'monster',
      hpCurrent: parseInt(customMonsterHp, 10) || 30,
      hpMax: parseInt(customMonsterHp, 10) || 30,
      ac: parseInt(customMonsterAc, 10) || 12,
      speed: 30,
      avatarUrl: getMonsterDefaultArtwork('monstrosity'),
      notes: `CR ${customMonsterCr} • ${customMonsterNotes.trim() || 'Melee Attack'}`
    });

    setCustomMonsterName('');
    setCustomMonsterNotes('');
    setIsMonsterDrawerOpen(false);
  };

  if (!isDM) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 washi-bg text-[#161616] select-none text-center">
        <div className="p-6 max-w-md bg-white border-2 border-red-400 rounded-xl shadow-xl flex flex-col items-center gap-4 animate-fadeIn text-[#161616]">
          <div className="p-4 bg-red-50 border border-red-200 rounded-full text-red-600">
            <Lock size={32} />
          </div>
          <h2 className="font-display text-lg uppercase tracking-widest text-red-700 font-bold">
            Access Restricted
          </h2>
          <p className="font-serif text-sm text-[#444444] leading-relaxed">
            Grimoire Sealed to the Dungeon Master. Only the designated DM for <strong>{campaign?.title || 'this campaign'}</strong> may access this console.
          </p>
          <button
            onClick={() => navigateTo(`/campaigns/${campaign?.id || 'cmp_drakkenheim_01'}/hud`)}
            className="sumie-btn-primary"
          >
            Enter as Player
          </button>
        </div>
      </div>
    );
  }

  const activeCombatant = combatState.combatants.find(c => c.isCurrentTurn) || combatState.combatants[0];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent text-[#161616] select-none relative">

      {/* TOP TACTICAL NAVIGATION STRIP */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#fcfbf9] border-b border-[#141414]/15 z-20 shrink-0 shadow-sm text-[#161616]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/5 border border-black/10 rounded text-[var(--accent-ink)] shrink-0 shadow-xs">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base uppercase tracking-wider text-[#1a1a1a] font-bold">
                DM Command Console
              </h2>
              <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.2 rounded text-[10px] font-display font-bold uppercase">
                {campaign?.title || 'Active Chronicle'}
              </span>
            </div>
            <span className="font-serif text-[11px] text-[#555555] hidden sm:inline">
              Tactical Telemetry, Video-Game Encounter Engine, Bestiary & Secret Rolling
            </span>
          </div>
        </div>

        {/* Action Buttons: Pass DM Role + Inject Loot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferDmModalOpen(true)}
            className="px-3 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-[11px] font-display uppercase font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Pass Dungeon Master role to another party member"
          >
            <Crown size={13} className="text-[var(--accent-ink)]" />
            <span className="hidden sm:inline">Pass DM Role</span>
          </button>

          <button
            onClick={() => {
              setSelectedRecipientForLoot('party_stash');
              setIsLootModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-[11px] font-display uppercase font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Gift size={13} />
            <span>+ Inject Loot</span>
          </button>
        </div>
      </div>

      {/* DM TABS BAR */}
      <div className="flex items-center justify-center px-4 sm:px-6 bg-white/80 border-b border-[#141414]/15 overflow-x-auto hide-scrollbar shrink-0 z-10 gap-1 sm:gap-4">
        {[
          { id: 'vitals', label: 'Party Telemetry', icon: Activity },
          { id: 'combat', label: 'Combat Tracker', icon: Swords },
          { id: 'bestiary', label: 'Bestiary Vault', icon: BookOpen },
          { id: 'vault', label: 'Party Stash & Treasury', icon: Coins },
          { id: 'secret_dice', label: 'Dice Console', icon: Dices },
          { id: 'notes', label: 'DM Ledger', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeDmTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDmTab(tab.id as any)}
              className={`px-3 sm:px-4 py-3 text-xs font-display uppercase tracking-wider font-bold flex flex-col items-center gap-1 relative transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#161616]'
                  : 'text-[#555555] hover:text-[#161616]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={14} className={isActive ? 'text-[var(--accent-ink)]' : 'text-[#777777]'} />
                <span>{tab.label}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeDmTabIndicator"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute -bottom-1 left-0 right-0 h-3 flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={ASSET_MAP.ui.tabLine}
                    alt="Active Tab"
                    className="w-full max-w-[140px] h-full object-contain filter drop-shadow-[0_0_4px_var(--accent-glow)]"
                  />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 min-h-0 w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDmTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="w-full h-full min-h-0 overflow-hidden"
          >
            {/* 1. PARTY VITALS & TELEMETRY */}
            {activeDmTab === 'vitals' && (
              <div className="w-full h-full overflow-y-auto hide-scrollbar p-4 sm:p-6">
            <DmPartyOverview 
              campaign={campaign} 
              onOpenLootModal={(recipientId) => {
                setSelectedRecipientForLoot(recipientId);
                setIsLootModalOpen(true);
              }}
            />
          </div>
        )}

        {/* 2. DYNAMIC VIDEO-GAME CRPG COMBAT ENGINE */}
        {activeDmTab === 'combat' && (
          <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
            
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0c0a0f] border-b border-[#2a241e] text-stone-200 shrink-0 z-20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDmCombatMode('theater')}
                  className={`px-3 py-1.5 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    dmCombatMode === 'theater'
                      ? 'bg-gradient-to-b from-[#2a1f14] to-[#140e08] text-[#fde047] border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.35)] scale-102'
                      : 'bg-gradient-to-b from-[#1c1612] to-[#0e0b09] border border-[#3a2d1d] text-[#c49a50] hover:text-[#e1bd72] hover:border-[#c49a50]'
                  }`}
                >
                  <Swords size={13} className={dmCombatMode === 'theater' ? 'text-[#fde047]' : 'text-[#c49a50]'} />
                  <span>Cinematic Theater Console</span>
                </button>

                <button
                  onClick={() => setDmCombatMode('classic')}
                  className={`px-3 py-1.5 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    dmCombatMode === 'classic'
                      ? 'bg-gradient-to-b from-[#2a1f14] to-[#140e08] text-[#fde047] border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.35)] scale-102'
                      : 'bg-gradient-to-b from-[#1c1612] to-[#0e0b09] border border-[#3a2d1d] text-[#c49a50] hover:text-[#e1bd72] hover:border-[#c49a50]'
                  }`}
                >
                  <Activity size={13} />
                  <span>Classic Roster List</span>
                </button>
              </div>

              <button
                onClick={() => setIsMonsterDrawerOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-b from-[#201426] to-[#100816] hover:from-[#2c1c34] hover:to-[#180d22] border border-[#4a2e5c] hover:border-[#a855f7] text-[#d8b4fe] rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
              >
                <Plus size={12} />
                <span>+ Add Monster / NPC</span>
              </button>
            </div>

            {dmCombatMode === 'theater' ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-5">
                <CombatTheaterStage
                  mode="dm"
                  onOpenAddMonster={() => setIsMonsterDrawerOpen(true)}
                />
              </div>
            ) : (
              <>
                {/* TOP COMBAT TACTICAL RIBBON & INITIATIVE QUEUE RAIL */}
                <DmTurnOrderRibbon
                  combatState={combatState}
                  rollAllInitiative={rollAllInitiative}
                  prevTurn={prevTurn}
                  nextTurn={nextTurn}
                  endCombat={endCombat}
                  startCombat={startCombat}
                  isMonsterDrawerOpen={isMonsterDrawerOpen}
                  setIsMonsterDrawerOpen={setIsMonsterDrawerOpen}
                />

                {/* COMBAT STAGE: ACTIVE COMBATANT SPOTLIGHT & COMBATANTS LIST */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* ACTIVE TURN SPOTLIGHT PANEL */}
              <div className="lg:col-span-1 p-5 bg-[#fcfbf9] border-2 border-black/30 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl h-fit text-[#161616]">

                {activeCombatant ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3">
                      <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider">
                        ★ Active Turn Spotlight
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--accent-ink)]">
                        Initiative {activeCombatant.initiativeRoll}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center text-lg font-bold overflow-hidden shadow-sm shrink-0">
                        {activeCombatant.avatarUrl ? (
                          <img src={activeCombatant.avatarUrl} alt={activeCombatant.name} className="w-full h-full object-cover" />
                        ) : (
                          activeCombatant.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">
                          {activeCombatant.name}
                        </h3>
                        <span className="text-xs font-serif text-[var(--accent-ink)] font-bold">
                          {activeCombatant.type.toUpperCase()} • {activeCombatant.ac} AC • {activeCombatant.speed} ft.
                        </span>
                      </div>
                    </div>

                    {/* Action Economy Trackers */}
                    <div className="flex flex-col gap-1.5 p-3 bg-white/80 border border-[#141414]/15 rounded-sm">
                      <span className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">
                        Turn Action Economy
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'action', label: 'Action [A]' },
                          { key: 'bonusAction', label: 'Bonus Act [BA]' },
                          { key: 'reaction', label: 'Reaction [R]' },
                          { key: 'movement', label: 'Movement [M]' }
                        ].map(act => {
                          const isUsed = activeCombatant.actionsUsed?.[act.key as any];
                          return (
                            <button
                              key={act.key}
                              onClick={() => toggleCombatantAction(activeCombatant.id, act.key as any)}
                              className={`py-1 px-2 rounded-xs text-[10px] font-display uppercase tracking-wider font-bold border transition-all cursor-pointer ${
                                isUsed
                                  ? 'bg-[#E33526]/15 border-[#E33526]/40 text-[#c53030] line-through opacity-70'
                                  : 'bg-[#1EB253]/15 border-[#1EB253]/40 text-[#1EB253]'
                              }`}
                            >
                              {act.label} {isUsed ? '✓ Used' : 'Ready'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vitals & Fast HP Actions */}
                    <div className="flex flex-col gap-2 p-3 bg-white/80 border border-[#141414]/15 rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display uppercase text-[#555555] font-bold">Hit Points</span>
                        <span className="font-mono text-sm font-bold text-[#161616]">
                          {activeCombatant.hpCurrent} / {activeCombatant.hpMax} HP
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        {[-10, -5, -1, 1, 5, 10].map(val => (
                          <button
                            key={val}
                            onClick={() => applyHpAdjustment(activeCombatant.id, Math.abs(val), val < 0 ? 'damage' : 'heal')}
                            className={`flex-1 py-1 rounded-xs text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                              val < 0
                                ? 'bg-[#E33526]/15 hover:bg-[#E33526]/25 text-[#c53030] border-[#E33526]/40'
                                : 'bg-[#1EB253]/15 hover:bg-[#1EB253]/25 text-[#1EB253] border-[#1EB253]/40'
                            }`}
                          >
                            {val > 0 ? `+${val}` : val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-serif text-[#777777]">
                    No active combatants in initiative order.
                  </div>
                )}
              </div>

              {/* ALL COMBATANTS ROSTER LIST */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {combatState.combatants.map(c => {
                  const isCurrent = c.isCurrentTurn;
                  const hpPercent = Math.min(100, Math.round((c.hpCurrent / Math.max(1, c.hpMax)) * 100));

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        isCurrent
                          ? 'bg-white border-2 border-[var(--accent-ink)] shadow-md'
                          : 'bg-white/80 border-[#141414]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-sm flex flex-col items-center justify-center font-mono font-bold shrink-0 border ${
                          isCurrent ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]' : 'bg-black/5 text-[#555555] border-black/10'
                        }`}>
                          <span className="text-[8px] font-display uppercase">INIT</span>
                          <span className="text-sm leading-none">{c.initiativeRoll}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-sm font-bold text-[#161616] uppercase truncate">
                              {c.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-display uppercase font-bold ${
                              c.type === 'player' ? 'bg-[#1EB253]/15 text-[#1EB253] border border-[#1EB253]/40' : 'bg-[#E33526]/15 text-[#c53030] border border-[#E33526]/40'
                            }`}>
                              {c.type}
                            </span>
                          </div>
                          <span className="text-xs font-serif text-[#555555] truncate block">
                            {c.ac} AC • {c.speed} ft. {c.notes ? `• ${c.notes}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* HP Gauge & Steppers */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono font-bold text-[#161616]">
                            {c.hpCurrent}/{c.hpMax} HP
                          </span>
                          <div className="w-24 bg-black/10 h-1.5 rounded-full overflow-hidden border border-black/10 mt-0.5">
                            <div
                              className={`h-full ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => applyHpAdjustment(c.id, 5, 'damage')}
                            className="px-2 py-1 bg-[#E33526]/15 hover:bg-[#E33526]/25 text-[#c53030] border border-[#E33526]/40 rounded-xs text-xs font-mono font-bold cursor-pointer"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => applyHpAdjustment(c.id, 5, 'heal')}
                            className="px-2 py-1 bg-[#1EB253]/15 hover:bg-[#1EB253]/25 text-[#1EB253] border border-[#1EB253]/40 rounded-xs text-xs font-mono font-bold cursor-pointer"
                          >
                            +5
                          </button>
                        </div>

                        {/* Remove Combatant with Confirmation */}
                        <button
                          onClick={() => setConfirmDeleteCombatant({ id: c.id, name: c.name })}
                          className="p-1.5 text-[#777777] hover:text-[#c53030] rounded transition-colors cursor-pointer"
                          title="Remove Combatant from Encounter"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
              </>
            )}

            {/* DYNAMIC IN-PANEL "ADD MONSTER / 5E API SEARCH" DRAWER */}
            {isMonsterDrawerOpen && (
              <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-[#fcfbf9] border-l-2 border-black/30 shadow-2xl z-40 p-5 flex flex-col gap-4 overflow-y-auto hide-scrollbar animate-slideInRight text-[#161616]">
                <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[var(--accent-ink)]" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                      Add 5e Monster or NPC
                    </h3>
                  </div>
                  <button onClick={() => setIsMonsterDrawerOpen(false)} className="text-[#777777] hover:text-[#161616] p-1 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Live 5e Compendium Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                  <input
                    type="text"
                    value={monsterSearchQuery}
                    onChange={(e) => setMonsterSearchQuery(e.target.value)}
                    placeholder="Search D&D 5e Compendium (Goblin, Dragon, Lich...)"
                    className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded pl-8 pr-3 py-2 text-xs text-[#161616] font-serif focus:outline-none"
                  />
                  {isSearchingMonsters && (
                    <RefreshCw size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-ink)] animate-spin" />
                  )}
                </div>

                {/* Searched Monster Results */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto hide-scrollbar pr-1">
                  {searchedMonsters.slice(0, 15).map(m => (
                    <div key={m.id} className="p-2.5 bg-white border border-[#141414]/15 hover:border-black/30 rounded flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-display text-xs text-[#161616] uppercase">{m.name}</strong>
                          <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-1.5 py-0.2 rounded text-[9px] font-bold">CR {m.cr}</span>
                        </div>
                        <span className="text-[11px] font-serif text-[#555555]">
                          {m.size} {m.type} • {m.ac} AC • {m.hp} HP
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickAddMonsterToCombat(m)}
                        className="px-3 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-[10px] font-display uppercase font-bold shrink-0 transition-all shadow-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Custom Monster Stat Creator */}
                <form onSubmit={handleCreateCustomMonsterSubmit} className="flex flex-col gap-3 pt-3 border-t border-[#141414]/15">
                  <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                    Or Quick Create Custom Combatant
                  </span>

                  <input
                    type="text"
                    required
                    value={customMonsterName}
                    onChange={e => setCustomMonsterName(e.target.value)}
                    placeholder="Creature / Boss Name *"
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-serif focus:outline-none"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={customMonsterHp}
                      onChange={e => setCustomMonsterHp(e.target.value)}
                      placeholder="HP"
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-mono text-center focus:outline-none"
                    />
                    <input
                      type="number"
                      value={customMonsterAc}
                      onChange={e => setCustomMonsterAc(e.target.value)}
                      placeholder="AC"
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-mono text-center focus:outline-none"
                    />
                    <input
                      type="text"
                      value={customMonsterCr}
                      onChange={e => setCustomMonsterCr(e.target.value)}
                      placeholder="CR"
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-mono text-center focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    value={customMonsterNotes}
                    onChange={e => setCustomMonsterNotes(e.target.value)}
                    placeholder="Attacks / Traits (e.g. 2 Claws +10 2d8+5)"
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-serif focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold transition-all shadow-xs cursor-pointer"
                  >
                    + Add Custom Combatant
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiForgeOpen(true)}
                    className="py-2 rounded-xs text-xs font-display uppercase font-bold flex items-center justify-center gap-1.5 border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 shadow-xs cursor-pointer"
                  >
                    <Sparkles size={13} className="text-[var(--accent-ink)] animate-pulse" />
                    <span>Launch 5e AI Monster Forge</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* 3. BESTIARY VAULT (Cinematic View) */}
        {activeDmTab === 'bestiary' && (
          <DmBestiaryVault />
        )}

        {/* 4. PARTY STASH & TREASURY OVERSIGHT */}
        {activeDmTab === 'vault' && (
          <DmTreasuryOversightView
            campaign={campaign}
            makePartyPurchase={makePartyPurchase}
            addLedgerEntry={useStore.getState().addLedgerEntry}
          />
        )}

        {/* 5. SECRET DICE CONSOLE */}
        {activeDmTab === 'secret_dice' && (
          <DmSecretDiceStation
            character={character}
            secretRolls={secretRolls}
            toggleRevealRoll={toggleRevealRoll}
            setConfirmClearRolls={setConfirmClearRolls}
          />
        )}

        {/* 6. SHROUDED & SEARCHABLE DM LEDGER WITH TAGS */}
        {activeDmTab === 'notes' && (
          <DmNotesLedgerView
            dmNotes={dmNotes}
            addDmNote={addDmNote}
            updateDmNote={updateDmNote}
            deleteDmNote={deleteDmNote}
            togglePinDmNote={togglePinDmNote}
            setConfirmDeleteNote={setConfirmDeleteNote}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CONFIRMATION MODALS (DELETE / CLEAR) */}
      
      {/* 1. Confirm Delete Combatant */}
      {confirmDeleteCombatant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-3.5 animate-fadeIn text-[#161616]">
            <div className="flex items-center gap-2 text-[#c53030]">
              <AlertTriangle size={18} />
              <h4 className="font-display text-sm uppercase font-bold">Remove from Encounter</h4>
            </div>
            <p className="font-serif text-xs text-[#555555] leading-relaxed">
              Are you sure you want to remove <strong>"{confirmDeleteCombatant.name}"</strong> from the combat tracker?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={() => setConfirmDeleteCombatant(null)}
                className="px-3 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCombatant(confirmDeleteCombatant.id);
                  setConfirmDeleteCombatant(null);
                }}
                className="px-3.5 py-1.5 bg-[#c53030] hover:bg-[#9B2C2C] text-white text-xs font-display uppercase font-bold rounded shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Confirm Delete DM Note */}
      {confirmDeleteNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-3.5 animate-fadeIn text-[#161616]">
            <div className="flex items-center gap-2 text-[#c53030]">
              <AlertTriangle size={18} />
              <h4 className="font-display text-sm uppercase font-bold">Delete Note</h4>
            </div>
            <p className="font-serif text-xs text-[#555555] leading-relaxed">
              Are you sure you want to permanently delete note <strong>"{confirmDeleteNote.title}"</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={() => setConfirmDeleteNote(null)}
                className="px-3 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDmNote(confirmDeleteNote.id);
                  setConfirmDeleteNote(null);
                }}
                className="px-3.5 py-1.5 bg-[#c53030] hover:bg-[#9B2C2C] text-white text-xs font-display uppercase font-bold rounded shadow-xs cursor-pointer"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Clear Secret Roll History */}
      {confirmClearRolls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-3.5 animate-fadeIn text-[#161616]">
            <div className="flex items-center gap-2 text-[#c53030]">
              <AlertTriangle size={18} />
              <h4 className="font-display text-sm uppercase font-bold">Clear Roll History</h4>
            </div>
            <p className="font-serif text-xs text-[#555555] leading-relaxed">
              Are you sure you want to clear all secret rolls from history?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={() => setConfirmClearRolls(false)}
                className="px-3 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRollHistory();
                  setConfirmClearRolls(false);
                }}
                className="px-3.5 py-1.5 bg-[#c53030] hover:bg-[#9B2C2C] text-white text-xs font-display uppercase font-bold rounded shadow-xs cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Transfer Dialogs */}
      <LootInjectorModal
        isOpen={isLootModalOpen}
        onClose={() => setIsLootModalOpen(false)}
        defaultRecipientId={selectedRecipientForLoot}
      />

      <TransferDmRoleModal
        isOpen={isTransferDmModalOpen}
        onClose={() => setIsTransferDmModalOpen(false)}
        campaign={campaign}
      />

      <React.Suspense fallback={null}>
        {isAiForgeOpen && (
          <AIMonsterForge
            isOpen={isAiForgeOpen}
            onClose={() => setIsAiForgeOpen(false)}
          />
        )}
      </React.Suspense>

    </div>
  );
}
