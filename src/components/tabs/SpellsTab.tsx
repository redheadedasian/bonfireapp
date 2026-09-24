import React, { useState } from 'react';
import { useStore } from '../../store';
import { Frame } from '../ui';
import { requestRoll } from '../dice/rollBus';
import { Sparkles, Search, Plus, Check, Shield, Flame, BookOpen, X, Trash2 } from 'lucide-react';
import { Spell } from '../../types';
import { GameSpellIcon } from '../ui/GameIcons';
import { IconPickerModal } from '../common/IconPickerModal';

export function SpellsTab() {
  const {
    character,
    updateCharacterField,
    updateSpell,
    addSpell,
    deleteSpell,
    togglePrepareSpell,
    toggleReadySpell,
    spendSpellSlot,
    recoverSpellSlot,
    getSpellSaveDC,
    getSpellAttackBonus,
    getMaxPreparedSpells,
    getPreparedSpellsCount,
    getReadiedSpellsCount
  } = useStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddingSpell, setIsAddingSpell] = useState(false);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState(1);
  const [newSpellSchool, setNewSpellSchool] = useState('Evocation');
  const [newSpellCastingTime, setNewSpellCastingTime] = useState('1 Action');
  const [newSpellRange, setNewSpellRange] = useState('60 ft.');
  const [newSpellComponents, setNewSpellComponents] = useState('V, S');
  const [newSpellDuration, setNewSpellDuration] = useState('Instantaneous');
  const [newSpellDamage, setNewSpellDamage] = useState('');
  const [newSpellDescription, setNewSpellDescription] = useState('');
  const [iconPickerSpell, setIconPickerSpell] = useState<Spell | null>(null);

  const spellSaveDC = getSpellSaveDC();
  const spellAtkBonus = getSpellAttackBonus();
  const maxPrepared = getMaxPreparedSpells();
  const preparedCount = getPreparedSpellsCount();
  const readiedCount = getReadiedSpellsCount();

  const getFilteredSpells = () => {
    let list = character.spells || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    if (filter === 'Cantrips') list = list.filter((s) => s.level === 0);
    else if (filter === '1st - 2nd') list = list.filter((s) => s.level === 1 || s.level === 2);
    else if (filter === '3rd - 5th') list = list.filter((s) => s.level >= 3 && s.level <= 5);
    else if (filter === '6th+') list = list.filter((s) => s.level >= 6);
    else if (filter === 'Prepared') list = list.filter((s) => s.prepared);
    else if (filter === 'Combat HUD') list = list.filter((s) => s.isReadiedInCombat);
    else if (filter === 'Rituals') list = list.filter((s) => s.ritual);
    else if (filter === 'Concentration') list = list.filter((s) => s.concentration);

    return list.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  };

  const handleAddSpellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpellName.trim()) return;

    addSpell({
      name: newSpellName.trim(),
      level: newSpellLevel,
      school: newSpellSchool,
      castingTime: newSpellCastingTime,
      range: newSpellRange,
      components: newSpellComponents,
      duration: newSpellDuration,
      description: newSpellDescription.trim(),
      damageDice: newSpellDamage || undefined,
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false
    });

    setNewSpellName('');
    setNewSpellDescription('');
    setNewSpellDamage('');
    setIsAddingSpell(false);
  };

  const filteredSpells = getFilteredSpells();

  return (
    <div className="flex flex-col gap-6 pointer-events-auto pb-10 select-none">
      
      {/* 1. Header Grimoire Strip */}
      <div className="bg-white/[0.72] backdrop-blur-[2px] border border-[#141414]/25 p-4 sm:p-5 rounded-lg shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl tracking-[0.2em] text-[#1a1a1a] flex items-center gap-2 font-bold">
              <BookOpen className="w-5 h-5 text-[#1a1a1a]" />
              FULL GRIMOIRE & SPELLBOOK
            </h2>
            <p className="text-xs font-serif text-[#555555] mt-0.5">
              Cleric Divine Spellbook • Prepared Spells Limit = Level (12) + WIS (+4) = 16
            </p>
          </div>

          <button
            onClick={() => setIsAddingSpell(true)}
            className="px-4 py-1.5 rounded-xs border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:text-[#000000] text-xs font-display uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Custom Spell</span>
          </button>
        </div>

        {/* 4 Key Vitals Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#141414]/15">
          <div className="flex flex-col items-center bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm">
            <span className="text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
              Spell Save DC
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
              {spellSaveDC}
            </span>
          </div>

          <div className="flex flex-col items-center bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm">
            <span className="text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
              Spell Attack Bonus
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#161616]">
              +{spellAtkBonus}
            </span>
          </div>

          <div className="flex flex-col items-center bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm">
            <span className="text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
              Prepared Spells
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`font-serif text-xl sm:text-2xl font-bold ${preparedCount >= maxPrepared ? 'text-[var(--accent-ink)]' : 'text-[#161616]'}`}>
                {preparedCount}
              </span>
              <span className="font-serif text-xs text-[#555555]">/ {maxPrepared}</span>
            </div>
          </div>

          <div className="flex flex-col items-center bg-white/90 p-2.5 rounded border border-black/20 shadow-sm">
            <span className="text-[9px] font-display uppercase tracking-widest text-[#1a1a1a] font-bold">
              Combat HUD Readied
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                {readiedCount}
              </span>
              <span className="font-serif text-xs text-[#555555]">/ 6 Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Spell Slots Tracker Matrix (Horizontal Strip) */}
      <Frame title="SPELL SLOTS & EXPENDITURE">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-3 sm:p-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = character.spellSlots[level] || { max: 0, current: 0 };
            const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
            return (
              <div
                key={level}
                className="bg-white/80 border border-[#141414]/15 p-2.5 rounded flex flex-col gap-2 shadow-xs"
              >
                <div className="flex justify-between items-center border-b border-[#141414]/10 pb-1">
                  <span className="font-display text-xs text-[#1a1a1a] font-bold tracking-wider">
                    {level}{suffix} Level
                  </span>
                  <span className="font-mono text-[11px] text-[#555555]">
                    {slot.current} / {slot.max}
                  </span>
                </div>

                {/* Spell Slot Pip Diamonds */}
                <div className="flex gap-1.5 flex-wrap min-h-[22px] items-center">
                  {Array.from({ length: slot.max }).map((_, idx) => {
                    const isAvailable = idx < slot.current;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isAvailable) {
                            spendSpellSlot(level);
                          } else {
                            recoverSpellSlot(level);
                          }
                        }}
                        style={isAvailable ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)' } : {}}
                        className={`w-3.5 h-3.5 rotate-45 border transition-all cursor-pointer ${
                          isAvailable
                            ? 'shadow-xs hover:drop-shadow-[0_0_6px_var(--accent-glow)]'
                            : 'border-[#141414]/25 bg-[#eae5dc] hover:border-[var(--accent-ink)]'
                        }`}
                        title={`Click to ${isAvailable ? 'spend' : 'recover'} ${level}${suffix} level slot`}
                      />
                    );
                  })}
                  {slot.max === 0 && (
                    <span className="text-[10px] font-serif text-[#777777] italic">No slots</span>
                  )}
                </div>

                {/* Slot Override Controls */}
                <div className="flex items-center justify-between text-[9px] font-mono text-[#777777] pt-1 border-t border-[#141414]/10">
                  <span>Max:</span>
                  <input
                    type="number"
                    min={0}
                    max={9}
                    value={slot.max}
                    onChange={(e) => {
                      const maxVal = Math.max(0, parseInt(e.target.value, 10) || 0);
                      const newSlots = {
                        ...character.spellSlots,
                        [level]: {
                          max: maxVal,
                          current: Math.min(slot.current, maxVal)
                        }
                      };
                      updateCharacterField('spellSlots', newSlots);
                    }}
                    className="w-5 text-center bg-transparent border-b border-transparent hover:border-black/30 focus:border-[var(--accent-ink)] outline-none text-[#161616] font-mono text-xs font-bold"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Frame>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col gap-3 bg-white/80 border border-[#141414]/15 p-3 rounded-lg shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search spells by name, school, or effect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/90 border border-[#141414]/20 pl-9 pr-3 py-2 text-[#161616] placeholder:text-[#888888] focus:outline-none focus:border-[var(--accent-ink)] font-serif text-sm rounded shadow-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            'All',
            'Prepared',
            'Combat HUD',
            'Cantrips',
            '1st - 2nd',
            '3rd - 5th',
            '6th+',
            'Concentration',
            'Rituals'
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filter === f ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
              className={`spell-filter-tab whitespace-nowrap px-3 py-1 text-[10px] uppercase tracking-wider font-display border transition-all rounded-xs cursor-pointer ${
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

      {/* 4. Full Spells List */}
      <Frame title={`SPELLBOOK (${filteredSpells.length} SPELLS)`}>
        <div className="flex flex-col gap-3 p-3 sm:p-4">
          
          {filteredSpells.length === 0 ? (
            <div className="p-8 text-center text-sm font-serif text-[#777777]">
              No spells match your search criteria.
            </div>
          ) : (
            filteredSpells.map((spell) => {
              const isPrepared = spell.isPrepared;
              const isReadied = spell.isReadiedInCombat;

              return (
                <div
                  key={spell.id}
                  className="bg-white/85 border border-[#141414]/15 rounded-lg p-3.5 sm:p-4 flex flex-col gap-3 transition-all hover:border-black/30 shadow-xs"
                >
                  {/* Top Bar: Controls + Identity */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      
                      {/* Prepared Checkbox */}
                      <button
                        onClick={() => {
                          const res = togglePrepareSpell(spell.id);
                          if (!res.success && res.message) alert(res.message);
                        }}
                        className={`px-2 py-1 rounded-xs border text-[9px] font-display uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                          isPrepared
                            ? 'border-black/30 bg-black/10 text-[#161616] font-bold'
                            : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/30'
                        }`}
                        title="Toggle Prepared Status"
                      >
                        <div className={`w-2.5 h-2.5 rotate-45 border ${isPrepared ? 'border-black/40 bg-[var(--accent-ink)]' : 'border-[#555555]'}`} />
                        <span>{isPrepared ? 'Prepared' : 'Unprepared'}</span>
                      </button>

                      {/* Readied in Combat Toggle */}
                      <button
                        onClick={() => {
                          const res = toggleReadySpell(spell.id);
                          if (!res.success && res.message) alert(res.message);
                        }}
                        disabled={!isPrepared}
                        className={`px-2 py-1 rounded-xs border text-[9px] font-display uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isReadied
                            ? 'border-black/40 bg-[var(--accent-ink)] text-white font-bold cursor-pointer shadow-xs'
                            : isPrepared
                            ? 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/30 cursor-pointer'
                            : 'border-[#141414]/10 bg-transparent text-[#999999] cursor-not-allowed opacity-40'
                        }`}
                        title={!isPrepared ? 'Prepare spell first to ready for Combat HUD' : 'Toggle Combat HUD Readied state'}
                      >
                        <span>{isReadied ? '[ Ready in Combat HUD ]' : '+ Ready in HUD'}</span>
                      </button>

                      {/* Spell Icon, Name & Level */}
                      <div className="flex items-center gap-2.5">
                        <GameSpellIcon
                          spell={spell}
                          size={28}
                          onClick={() => setIconPickerSpell(spell)}
                        />
                        <span className="font-serif text-base sm:text-lg text-[#161616] font-bold">
                          {spell.name}
                        </span>
                        <span className="text-[10px] font-display uppercase tracking-widest text-[#1a1a1a] font-bold">
                          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school}
                        </span>
                      </div>
                    </div>

                    {/* Action Roll Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {spell.damageDice && (
                        <button
                          onClick={() =>
                            requestRoll({
                              command: spell.damageDice || '1d8',
                              label: `${spell.name} Damage`
                            })
                          }
                          className="px-3 py-1 rounded-xs border border-black/20 bg-[#fdfbf7] hover:bg-white text-[#161616] hover:border-black/40 text-[10px] font-display uppercase tracking-wider transition-all cursor-pointer font-bold shadow-xs hover:drop-shadow-[0_0_6px_var(--accent-glow)]"
                        >
                          Roll Damage ({spell.damageDice})
                        </button>
                      )}

                      {spell.saveRequired && (
                        <div className="px-2 py-1 rounded-xs border border-[#141414]/15 bg-[#fdfbf7] text-[9px] font-display uppercase text-[#555555] font-semibold">
                          Save: DC {spellSaveDC} {spell.saveRequired.toUpperCase()}
                        </div>
                      )}

                      {/* Ready for Combat Switch */}
                      <button
                        onClick={() => toggleReadySpell(spell.id)}
                        disabled={!spell.prepared && spell.level !== 0}
                        style={spell.isReadiedInCombat ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                        className={`px-3 py-1 text-xs font-display uppercase tracking-wider border rounded transition-all flex items-center gap-1.5 ${
                          spell.isReadiedInCombat
                            ? 'text-white font-bold shadow-xs cursor-pointer'
                            : spell.prepared || spell.level === 0
                            ? 'bg-white/80 border-[#141414]/20 text-[#555555] hover:border-[var(--accent-ink)] hover:text-[#161616] cursor-pointer'
                            : 'bg-white/40 border-[#141414]/10 text-[#999999] cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Sparkles size={13} className={spell.isReadiedInCombat ? 'text-white' : ''} />
                        <span>{spell.isReadiedInCombat ? 'In Combat Deck' : 'Ready'}</span>
                      </button>

                      <button
                        onClick={() => deleteSpell(spell.id)}
                        className="text-[#777777] hover:text-[#E33526] p-1.5 transition-colors cursor-pointer"
                        title="Delete spell"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Casting Metadata Chips */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-[#555555] bg-[#fdfbf7] p-2 rounded border border-[#141414]/10">
                    <div><span className="text-[#777777]">Time:</span> {spell.castingTime}</div>
                    <div><span className="text-[#777777]">Range:</span> {spell.range}</div>
                    <div><span className="text-[#777777]">Components:</span> {spell.components}</div>
                    <div><span className="text-[#777777]">Duration:</span> {spell.duration}</div>
                    {spell.concentration && <div className="text-[#DC2626] font-bold">Concentration</div>}
                    {spell.ritual && <div className="text-[var(--accent-ink)] font-bold">Ritual</div>}
                  </div>

                  {/* Spell Description */}
                  <p className="text-xs sm:text-sm font-serif text-[#555555] leading-relaxed">
                    {spell.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Frame>

      {/* Add Custom Spell Modal */}
      {isAddingSpell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white/95 border-2 border-black/30 w-full max-w-lg rounded-xl shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <h3 className="font-display text-base tracking-widest text-[#1a1a1a] uppercase font-bold">
                Add Custom Spell
              </h3>
              <button onClick={() => setIsAddingSpell(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSpellSubmit} className="flex flex-col gap-3 overflow-y-auto pr-1 hide-scrollbar">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Spell Name</label>
                <input
                  type="text"
                  required
                  value={newSpellName}
                  onChange={(e) => setNewSpellName(e.target.value)}
                  placeholder="e.g. Flame Strike"
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Spell Level (0 = Cantrip)</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={newSpellLevel}
                    onChange={(e) => setNewSpellLevel(parseInt(e.target.value, 10) || 0)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">School</label>
                  <input
                    type="text"
                    value={newSpellSchool}
                    onChange={(e) => setNewSpellSchool(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Casting Time</label>
                  <input
                    type="text"
                    value={newSpellCastingTime}
                    onChange={(e) => setNewSpellCastingTime(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Range</label>
                  <input
                    type="text"
                    value={newSpellRange}
                    onChange={(e) => setNewSpellRange(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Damage / Healing Dice (Optional)</label>
                <input
                  type="text"
                  value={newSpellDamage}
                  onChange={(e) => setNewSpellDamage(e.target.value)}
                  placeholder="e.g. 4d6"
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono focus:outline-none focus:border-[var(--accent-ink)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Description</label>
                <textarea
                  value={newSpellDescription}
                  onChange={(e) => setNewSpellDescription(e.target.value)}
                  rows={3}
                  placeholder="Enter spell description and effects..."
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)] resize-none"
                />
              </div>

              <div className="border-t border-[#141414]/15 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSpell(false)}
                  className="px-4 py-1.5 border border-[#141414]/20 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] text-white text-xs font-display uppercase tracking-wider font-bold hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] cursor-pointer shadow-xs rounded-xs transition-all"
                >
                  Add Spell
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

    </div>
  );
}
