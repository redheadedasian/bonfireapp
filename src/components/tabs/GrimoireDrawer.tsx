import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { requestRoll } from '../dice/rollBus';
import { Spell, Ability } from '../../types';
import { SRD_SPELLS_CATALOG, SRDSpellData } from '../../data/srdSpells';
import { getSpellIcon, GameSpellIcon, findBestMatchingIcon } from '../ui/GameIcons';
import { IconPickerModal } from '../common/IconPickerModal';
import {
  BookOpen,
  Sparkles,
  Search,
  Plus,
  Trash2,
  X,
  Swords,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  Check,
  AlertTriangle
} from 'lucide-react';

export function GrimoireDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    character,
    updateSpell,
    addSpell,
    deleteSpell,
    togglePrepareSpell,
    toggleReadySpell,
    getMaxPreparedSpells,
    getPreparedSpellsCount,
    getSpellSaveDC,
    getSpellAttackBonus,
    getReadiedSpellsCount,
    isEditMode
  } = useStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  
  // Modals state
  const [srdModalOpen, setSrdModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [iconPickerSpell, setIconPickerSpell] = useState<Spell | null>(null);

  // SRD Search & filters in modal
  const [srdSearch, setSrdSearch] = useState('');
  const [srdLevelFilter, setSrdLevelFilter] = useState('All');
  const [srdSelectedSpell, setSrdSelectedSpell] = useState<SRDSpellData | null>(null);

  // Custom Spell Form
  const [customName, setCustomName] = useState('');
  const [customLevel, setCustomLevel] = useState<number>(1);
  const [customSchool, setCustomSchool] = useState('Evocation');
  const [customCastingTime, setCustomCastingTime] = useState('1 Action');
  const [customRange, setCustomRange] = useState('60 ft.');
  const [customDuration, setCustomDuration] = useState('Instantaneous');
  const [customComponents, setCustomComponents] = useState('V, S');
  const [customConcentration, setCustomConcentration] = useState(false);
  const [customRitual, setCustomRitual] = useState(false);
  const [customCategory, setCustomCategory] = useState<'attack' | 'save' | 'heal' | 'utility'>('attack');
  const [customSaveStat, setCustomSaveStat] = useState<Ability>('dex');
  const [customDamageDice, setCustomDamageDice] = useState('');
  const [customDamageType, setCustomDamageType] = useState('Radiant');
  const [customDesc, setCustomDesc] = useState('');

  const maxPrepared = getMaxPreparedSpells();
  const preparedSpellsCount = getPreparedSpellsCount();
  const readiedSpellsCount = getReadiedSpellsCount();
  const spellSaveDC = getSpellSaveDC();
  const spellAttack = getSpellAttackBonus();

  const getFilteredSpells = () => {
    let filtered = character.spells || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    if (filter === 'Cantrips') filtered = filtered.filter((s) => s.level === 0);
    else if (filter === '1st - 2nd') filtered = filtered.filter((s) => s.level === 1 || s.level === 2);
    else if (filter === '3rd - 5th') filtered = filtered.filter((s) => s.level >= 3 && s.level <= 5);
    else if (filter === '6th+') filtered = filtered.filter((s) => s.level >= 6);
    else if (filter === 'Rituals') filtered = filtered.filter((s) => s.ritual);
    else if (filter === 'Concentration') filtered = filtered.filter((s) => s.concentration);
    else if (filter === 'Prepared') filtered = filtered.filter((s) => s.prepared);
    else if (filter === 'Readied') filtered = filtered.filter((s) => s.isReadiedInCombat);

    return filtered.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  };

  const handleImportSRDSpell = (srdSpell: SRDSpellData) => {
    // Check if already in grimoire
    const exists = character.spells.some(
      (s) => s.name.toLowerCase() === srdSpell.name.toLowerCase()
    );
    if (exists) {
      alert(`${srdSpell.name} is already in your Grimoire.`);
      return;
    }

    addSpell({
      name: srdSpell.name,
      level: srdSpell.level,
      school: srdSpell.school,
      castingTime: srdSpell.castingTime,
      range: srdSpell.range,
      components: srdSpell.components,
      duration: srdSpell.duration,
      description: srdSpell.description,
      concentration: srdSpell.concentration,
      ritual: srdSpell.ritual,
      damageDice: srdSpell.damageDice,
      damageType: srdSpell.damageType,
      saveRequired: srdSpell.saveRequired,
      spellCategory: srdSpell.spellCategory,
      prepared: srdSpell.level === 0 || preparedSpellsCount < maxPrepared,
      isPrepared: srdSpell.level === 0 || preparedSpellsCount < maxPrepared,
      isReadiedInCombat: false
    });

    setSrdModalOpen(false);
  };

  const handleCreateCustomSpell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addSpell({
      name: customName.trim(),
      level: customLevel,
      school: customSchool,
      castingTime: customCastingTime,
      range: customRange,
      duration: customDuration,
      components: customComponents,
      concentration: customConcentration,
      ritual: customRitual,
      spellCategory: customCategory,
      saveRequired: customCategory === 'save' ? customSaveStat : undefined,
      damageDice: customDamageDice.trim() || undefined,
      damageType: customDamageType.trim() || undefined,
      description: customDesc.trim(),
      prepared: customLevel === 0 || preparedSpellsCount < maxPrepared,
      isPrepared: customLevel === 0 || preparedSpellsCount < maxPrepared,
      isReadiedInCombat: false
    });

    // Reset form
    setCustomName('');
    setCustomLevel(1);
    setCustomDesc('');
    setCustomDamageDice('');
    setCustomModalOpen(false);
  };

  const handleToggleReadySpell = (spellId: string) => {
    const spell = character.spells.find((s) => s.id === spellId);
    if (!spell) return;

    if (!spell.isReadiedInCombat) {
      if (!spell.prepared && spell.level > 0) {
        setWarningMessage(`Preparation Required: You must prepare "${spell.name}" before readying it for Combat HUD.`);
        setTimeout(() => setWarningMessage(null), 5000);
        return;
      }
      if (readiedSpellsCount >= 6) {
        setWarningMessage(
          `Grimoire Limit Reached: Maximum 6 combat spells can be readied on your Combat HUD. Please unready a spell before readying "${spell.name}".`
        );
        setTimeout(() => setWarningMessage(null), 5000);
        return;
      }
    }

    const res = toggleReadySpell(spellId);
    if (!res.success && res.message) {
      setWarningMessage(res.message);
      setTimeout(() => setWarningMessage(null), 5000);
    }
  };

  const filteredSpells = getFilteredSpells();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-full max-w-2xl bg-[#fcfbf9] border-l border-[#141414]/25 h-full flex flex-col shadow-2xl z-10 text-[#161616]"
          >
            {/* 1. Header & Action Toolbar */}
            <div className="flex flex-col gap-4 p-5 sm:p-6 border-b border-[#141414]/15 bg-white/90 shrink-0 shadow-xs">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-[#1a1a1a]" />
                    <h2 className="font-display text-lg sm:text-xl tracking-[0.2em] text-[#1a1a1a] uppercase font-bold">
                      SPELLBOOK & GRIMOIRE
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-[#555555] mt-1 flex-wrap">
                    <span>
                      Spell Save DC: <strong className="text-[#1a1a1a]">{spellSaveDC}</strong>
                    </span>
                    <span>
                      Attack: <strong className="text-[#161616]">+{spellAttack}</strong>
                    </span>
                    <span>
                      Prepared Spells:{' '}
                      <strong
                        className={`${
                          preparedSpellsCount >= maxPrepared ? 'text-[var(--accent-ink)]' : 'text-[#161616]'
                        }`}
                      >
                        {preparedSpellsCount} / {maxPrepared}
                      </strong>
                    </span>
                    <span>
                      HUD Readied:{' '}
                      <strong className="text-[#1a1a1a]">{readiedSpellsCount} / 6</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded border border-[#141414]/20 text-[#555555] hover:text-[#161616] hover:border-black/40 transition-colors cursor-pointer"
                  title="Close Grimoire"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Two Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#141414]/15">
                <button
                  onClick={() => setSrdModalOpen(true)}
                  className="px-3.5 py-2 rounded-xs border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:text-[#000000] text-xs font-display uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>+ Import from 5e SRD</span>
                </button>

                <button
                  onClick={() => setCustomModalOpen(true)}
                  className="px-3.5 py-2 rounded-xs border border-black/20 bg-[#fdfbf7] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:bg-white hover:text-[#000000] text-xs font-display uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Create Custom Spell</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]"
                  />
                  <input
                    type="text"
                    placeholder="Search spells by name or school..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#141414]/20 pl-9 pr-3 py-1.5 text-xs text-[#161616] placeholder:text-[#888888] rounded focus:outline-none focus:border-black/40 font-serif shadow-xs"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                  {[
                    'All',
                    'Cantrips',
                    '1st - 2nd',
                    '3rd - 5th',
                    '6th+',
                    'Prepared',
                    'Readied',
                    'Rituals',
                    'Concentration'
                  ].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={filter === f ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                      className={`spell-filter-tab whitespace-nowrap px-2.5 py-1 text-[9px] uppercase tracking-wider font-display border transition-all rounded-xs cursor-pointer ${
                        filter === f
                          ? 'text-white font-bold shadow-xs'
                          : 'border-[#141414]/15 bg-transparent text-[#4a4a4a] hover:border-black/25 hover:text-[#161616]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* In-Drawer Notification / Warning Banner */}
            {warningMessage && (
              <div className="px-5 py-3 bg-[#fed7d7] border-y border-[#feb2b2] text-[#c53030] text-xs font-serif flex items-center justify-between gap-3 shadow-xs animate-fade-in shrink-0 font-medium">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={17} className="text-[#c53030] shrink-0" />
                  <span>{warningMessage}</span>
                </div>
                <button
                  onClick={() => setWarningMessage(null)}
                  className="p-1 hover:text-[#9b2c2c] text-[#c53030] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* 2. Spell List Cards */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 hide-scrollbar">
              {filteredSpells.length === 0 ? (
                <div className="p-12 text-center text-sm font-serif text-[#777777] flex flex-col items-center gap-3">
                  <BookOpen className="w-8 h-8 text-[var(--accent-ink)]/40" />
                  <span>No spells match the current filter or search criteria.</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setSrdModalOpen(true)}
                      className="text-xs font-display text-[var(--accent-ink)] underline tracking-wider uppercase font-bold cursor-pointer"
                    >
                      Browse 5e SRD Spells
                    </button>
                  </div>
                </div>
              ) : (
                filteredSpells.map((spell) => {
                  const isExpanded = expandedSpellId === spell.id;
                  const isCantrip = spell.level === 0;

                  return (
                    <div
                      key={spell.id}
                      className={`border rounded p-3.5 flex flex-col gap-2.5 transition-all shadow-sm ${
                        spell.isReadiedInCombat
                          ? 'border-[var(--accent-ink)] bg-white shadow-md'
                          : spell.prepared
                          ? 'border-[#141414]/20 bg-white/90'
                          : 'border-[#141414]/10 bg-white/50 opacity-75'
                      }`}
                    >
                      {/* Top Row: Name, Level, Badges & Expand Arrow */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          {isEditMode ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <GameSpellIcon
                                  spell={spell}
                                  size={28}
                                  onClick={() => setIconPickerSpell(spell)}
                                />
                                <input
                                  type="text"
                                  value={spell.name}
                                  onChange={(e) => updateSpell(spell.id, { name: e.target.value })}
                                  className="font-serif text-sm text-[#161616] font-bold bg-white border border-[#141414]/20 px-2 py-0.5 rounded focus:border-[var(--accent-ink)] focus:outline-none flex-1"
                                  placeholder="Spell Name"
                                />
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Lvl:</span>
                                  <input
                                    type="number"
                                    value={spell.level}
                                    onChange={(e) => updateSpell(spell.id, { level: parseInt(e.target.value, 10) || 0 })}
                                    className="w-8 bg-transparent text-[#161616] focus:outline-none text-center font-mono text-xs font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">School:</span>
                                  <input
                                    type="text"
                                    value={spell.school}
                                    onChange={(e) => updateSpell(spell.id, { school: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Dmg:</span>
                                  <input
                                    type="text"
                                    value={spell.damageDice || ''}
                                    onChange={(e) => updateSpell(spell.id, { damageDice: e.target.value })}
                                    placeholder="Dice"
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Time:</span>
                                  <input
                                    type="text"
                                    value={spell.castingTime}
                                    onChange={(e) => updateSpell(spell.id, { castingTime: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Range:</span>
                                  <input
                                    type="text"
                                    value={spell.range}
                                    onChange={(e) => updateSpell(spell.id, { range: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-wrap mt-1 sm:mt-0">
                                <GameSpellIcon
                                  spell={spell}
                                  size={30}
                                  onClick={() => setIconPickerSpell(spell)}
                                />
                                <span className="font-serif text-base sm:text-lg text-[#161616] font-bold">
                                  {spell.name}
                                </span>
                                <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold">
                                  {isCantrip ? 'Cantrip' : `Level ${spell.level}`}
                                </span>
                                <span className="text-[9px] font-display uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                                  {spell.school}
                                </span>
                                {spell.concentration && (
                                  <span className="text-[8px] font-display uppercase tracking-wider px-1 py-0.2 rounded-xs bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 font-bold">
                                    Conc.
                                  </span>
                                )}
                                {spell.ritual && (
                                  <span className="text-[8px] font-display uppercase tracking-wider px-1 py-0.2 rounded-xs bg-[var(--accent-ink)]/10 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold">
                                    Ritual
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs font-mono text-[#555555] flex-wrap mt-0.5">
                                <span>{spell.castingTime}</span>
                                <span>•</span>
                                <span>{spell.range}</span>
                                <span>•</span>
                                <span>{spell.components}</span>
                                <span>•</span>
                                <span>{spell.duration}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          onClick={() => setExpandedSpellId(isExpanded ? null : spell.id)}
                          className="p-1 text-[#555555] hover:text-[#161616] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand Description'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Controls Bar per Spell */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#141414]/15 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Prepared Toggle Checkbox */}
                          {!isCantrip && (
                            <button
                              onClick={() => {
                                const res = togglePrepareSpell(spell.id);
                                if (!res.success && res.message) alert(res.message);
                              }}
                              className={`px-2.5 py-1 rounded-xs border text-[9px] font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                spell.prepared
                                  ? 'border-[#1EB253] bg-[#1EB253]/15 text-[#1EB253] font-bold'
                                  : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40'
                              }`}
                              title={`Toggle Prepared (${preparedSpellsCount}/${maxPrepared})`}
                            >
                              <div
                                className={`w-2.5 h-2.5 border rounded-xs flex items-center justify-center ${
                                  spell.prepared ? 'border-[#1EB253] bg-[#1EB253]' : 'border-[#999999]'
                                }`}
                              >
                                {spell.prepared && <Check size={8} className="text-white stroke-[3]" />}
                              </div>
                              <span>{spell.prepared ? 'Prepared' : 'Unprepared'}</span>
                            </button>
                          )}

                          {/* Ready for Combat HUD Toggle Switch */}
                          <button
                            onClick={() => handleToggleReadySpell(spell.id)}
                            disabled={!spell.prepared && !isCantrip}
                            style={spell.isReadiedInCombat ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                            className={`px-2.5 py-1 rounded-xs border text-[9px] font-display uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              spell.isReadiedInCombat
                                ? 'text-white font-bold shadow-xs cursor-pointer'
                                : spell.prepared || isCantrip
                                ? 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-[var(--accent-ink)] hover:text-[#161616] cursor-pointer'
                                : 'border-[#141414]/10 bg-transparent text-[#999999] cursor-not-allowed opacity-50'
                            }`}
                            title={
                              spell.prepared || isCantrip
                                ? 'Toggle Readied in Combat HUD deck (Max 6)'
                                : 'Must be prepared first'
                            }
                          >
                            <Sparkles size={11} className={spell.isReadiedInCombat ? 'text-white' : ''} />
                            <span>{spell.isReadiedInCombat ? 'Ready in Combat HUD' : 'Not Readied'}</span>
                          </button>
                        </div>

                        {/* Action Buttons: Roll / Cast / Delete */}
                        <div className="flex items-center gap-1.5">
                          {spell.damageDice && (
                            <button
                              onClick={() =>
                                requestRoll({
                                  command: `${spell.damageDice}${spell.damageBonus ? `+${spell.damageBonus}` : ''}`,
                                  label: `${spell.name} Damage`
                                })
                              }
                              className="px-2 py-1 rounded-xs border border-black/20 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] text-[9px] font-mono uppercase tracking-wider transition-all font-bold shadow-xs cursor-pointer hover:drop-shadow-[0_0_6px_var(--accent-glow)]"
                            >
                              DMG ({spell.damageDice})
                            </button>
                          )}

                          {deleteConfirmId === spell.id ? (
                            <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-300">
                              <span className="text-[8px] font-display text-red-700 uppercase tracking-wider font-bold">
                                Confirm?
                              </span>
                              <button
                                onClick={() => {
                                  deleteSpell(spell.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[8px] font-display text-red-700 uppercase tracking-wider font-bold hover:underline cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-[8px] font-display uppercase text-[#555555] hover:text-[#161616] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(spell.id)}
                              className="p-1 text-[#777777] hover:text-[#E33526] transition-colors cursor-pointer"
                              title="Delete spell from Grimoire"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Description Text */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-[#141414]/15 flex flex-col gap-1.5 bg-[#fdfbf7] p-2.5 rounded text-xs font-serif text-[#555555] leading-relaxed">
                          <p>{spell.description}</p>
                          {spell.damageType && (
                            <div className="text-[10px] font-mono text-[var(--accent-ink)] mt-1 font-bold">
                              Damage Type: {spell.damageType}
                            </div>
                          )}
                          {spell.saveRequired && (
                            <div className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">
                              Saving Throw: DC {spellSaveDC} {spell.saveRequired.toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. SRD Spell Importer Modal */}
      {srdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
          <div className="bg-white/95 border-2 border-black/30 w-full max-w-2xl rounded-xl shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] text-[#161616]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#1a1a1a]" />
                <h3 className="font-display text-base sm:text-lg tracking-widest text-[#1a1a1a] uppercase font-bold">
                  Import Spells from 5e SRD Catalog
                </h3>
              </div>
              <button onClick={() => setSrdModalOpen(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* SRD Filters */}
            <div className="flex flex-col gap-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  placeholder="Search 5e SRD spells (e.g. Fireball, Spirit Guardians, Bless)..."
                  value={srdSearch}
                  onChange={(e) => setSrdSearch(e.target.value)}
                  className="w-full bg-white border border-[#141414]/20 pl-9 pr-3 py-2 text-[#161616] font-serif text-xs rounded focus:outline-none focus:border-[var(--accent-ink)] shadow-xs"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                {['All', 'Cantrips', '1st', '2nd', '3rd', '4th', '5th', '6th+'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSrdLevelFilter(lvl)}
                    style={srdLevelFilter === lvl ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                    className={`spell-filter-tab whitespace-nowrap px-2.5 py-1 text-[9px] uppercase tracking-wider font-display border transition-all rounded-xs cursor-pointer ${
                      srdLevelFilter === lvl
                        ? 'text-white font-bold shadow-xs'
                        : 'border-[#141414]/15 bg-white text-[#555555] hover:border-black/30'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* SRD Spells Catalog List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 hide-scrollbar">
              {SRD_SPELLS_CATALOG.filter((s) => {
                if (srdSearch.trim()) {
                  const q = srdSearch.toLowerCase();
                  if (!s.name.toLowerCase().includes(q) && !s.school.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
                    return false;
                  }
                }
                if (srdLevelFilter === 'Cantrips') return s.level === 0;
                if (srdLevelFilter === '1st') return s.level === 1;
                if (srdLevelFilter === '2nd') return s.level === 2;
                if (srdLevelFilter === '3rd') return s.level === 3;
                if (srdLevelFilter === '4th') return s.level === 4;
                if (srdLevelFilter === '5th') return s.level === 5;
                if (srdLevelFilter === '6th+') return s.level >= 6;
                return true;
              }).map((srdSpell) => {
                const alreadyInGrimoire = character.spells.some(
                  (s) => s.name.toLowerCase() === srdSpell.name.toLowerCase()
                );

                return (
                  <div
                    key={srdSpell.index}
                    className="flex flex-col gap-2 bg-white/90 border border-[#141414]/15 p-3 rounded hover:border-[var(--accent-ink)] transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <GameSpellIcon
                            spell={srdSpell}
                            size={28}
                          />
                          <span className="font-serif text-[#161616] font-bold text-sm">
                            {srdSpell.name}
                          </span>
                          <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold">
                            {srdSpell.level === 0 ? 'Cantrip' : `Lvl ${srdSpell.level}`} • {srdSpell.school}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#555555] mt-0.5">
                          {srdSpell.castingTime} • {srdSpell.range} • {srdSpell.duration}
                        </span>
                      </div>

                      {alreadyInGrimoire ? (
                        <span className="px-3 py-1 rounded-xs border border-[#141414]/15 bg-[#fdfbf7] text-[#555555] text-[10px] font-display uppercase tracking-wider font-bold">
                          In Grimoire
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImportSRDSpell(srdSpell)}
                          className="px-3 py-1 rounded-xs bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus size={12} />
                          <span>Import</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-serif text-[#555555] line-clamp-2 leading-relaxed">
                      {srdSpell.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#141414]/15 pt-3 flex justify-end">
              <button
                onClick={() => setSrdModalOpen(false)}
                className="px-4 py-1.5 bg-[#1c1c1c] text-white text-xs font-display uppercase tracking-wider rounded-xs font-bold hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] cursor-pointer transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Custom Homebrew Spell Creator Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
          <div className="bg-white/95 border-2 border-black/30 w-full max-w-xl rounded-xl shadow-2xl p-5 flex flex-col gap-4 max-h-[88vh] text-[#161616]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#1a1a1a]" />
                <h3 className="font-display text-base sm:text-lg tracking-widest text-[#1a1a1a] uppercase font-bold">
                  Create Custom Homebrew Spell
                </h3>
              </div>
              <button onClick={() => setCustomModalOpen(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomSpell} className="flex flex-col gap-3 overflow-y-auto pr-1 hide-scrollbar">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Spell Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawn's Radiance"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-sm focus:outline-none focus:border-[var(--accent-ink)]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Spell Level</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(parseInt(e.target.value, 10))}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  >
                    <option value={0}>Cantrip (Level 0)</option>
                    <option value={1}>1st Level</option>
                    <option value={2}>2nd Level</option>
                    <option value={3}>3rd Level</option>
                    <option value={4}>4th Level</option>
                    <option value={5}>5th Level</option>
                    <option value={6}>6th Level</option>
                    <option value={7}>7th Level</option>
                    <option value={8}>8th Level</option>
                    <option value={9}>9th Level</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">School</label>
                  <select
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  >
                    <option value="Abjuration">Abjuration</option>
                    <option value="Conjuration">Conjuration</option>
                    <option value="Divination">Divination</option>
                    <option value="Enchantment">Enchantment</option>
                    <option value="Evocation">Evocation</option>
                    <option value="Illusion">Illusion</option>
                    <option value="Necromancy">Necromancy</option>
                    <option value="Transmutation">Transmutation</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Casting Time</label>
                  <input
                    type="text"
                    value={customCastingTime}
                    onChange={(e) => setCustomCastingTime(e.target.value)}
                    placeholder="1 Action / Bonus Action"
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Range</label>
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="60 ft. / Self"
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Duration</label>
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Instantaneous / 1 minute"
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Components</label>
                  <input
                    type="text"
                    value={customComponents}
                    onChange={(e) => setCustomComponents(e.target.value)}
                    placeholder="V, S, M"
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              {/* Tags: Conc, Ritual */}
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-[#161616] cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={customConcentration}
                    onChange={(e) => setCustomConcentration(e.target.checked)}
                    className="rounded border-black/30 text-[var(--accent-ink)]"
                  />
                  <span>Concentration</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-[#161616] cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={customRitual}
                    onChange={(e) => setCustomRitual(e.target.checked)}
                    className="rounded border-black/30 text-[var(--accent-ink)]"
                  />
                  <span>Ritual</span>
                </label>
              </div>

              {/* Spell Category / Mechanics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fdfbf7] p-3 rounded border border-[#141414]/15">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Action Type</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as 'attack' | 'save' | 'heal' | 'utility')}
                    className="bg-white border border-[#141414]/20 p-1.5 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  >
                    <option value="attack">Spell Attack</option>
                    <option value="save">Saving Throw</option>
                    <option value="heal">Healing</option>
                    <option value="utility">Utility / Buff</option>
                  </select>
                </div>

                {customCategory === 'save' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Save Stat</label>
                    <select
                      value={customSaveStat}
                      onChange={(e) => setCustomSaveStat(e.target.value as Ability)}
                      className="bg-white border border-[#141414]/20 p-1.5 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                    >
                      <option value="str">Strength</option>
                      <option value="dex">Dexterity</option>
                      <option value="con">Constitution</option>
                      <option value="int">Intelligence</option>
                      <option value="wis">Wisdom</option>
                      <option value="cha">Charisma</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Dice Formula</label>
                  <input
                    type="text"
                    value={customDamageDice}
                    onChange={(e) => setCustomDamageDice(e.target.value)}
                    placeholder="3d8 / 4d6"
                    className="bg-white border border-[#141414]/20 p-1.5 text-[#161616] rounded font-mono text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Damage/Type</label>
                  <input
                    type="text"
                    value={customDamageType}
                    onChange={(e) => setCustomDamageType(e.target.value)}
                    placeholder="Radiant / Fire"
                    className="bg-white border border-[#141414]/20 p-1.5 text-[#161616] rounded font-mono text-xs focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Description</label>
                <textarea
                  rows={3}
                  required
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Enter full spell lore, effects, targeting rules, and mechanics..."
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:outline-none focus:border-[var(--accent-ink)] resize-none"
                />
              </div>

              <div className="border-t border-[#141414]/15 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-1.5 border border-[#141414]/20 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] text-white text-xs font-display uppercase tracking-wider font-bold hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] cursor-pointer shadow-xs rounded-xs transition-all"
                >
                  Create & Learn Spell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spell Icon Picker Modal */}
      <IconPickerModal
        isOpen={Boolean(iconPickerSpell)}
        onClose={() => setIconPickerSpell(null)}
        initialCategory="spell"
        itemName={iconPickerSpell?.name}
        onSelectIcon={(iconUrl) => {
          if (iconPickerSpell) {
            updateSpell(iconPickerSpell.id, { iconUrl });
          }
          setIconPickerSpell(null);
        }}
      />
    </AnimatePresence>
  );
}
