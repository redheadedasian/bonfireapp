import React, { useState, useEffect, useRef } from 'react';
import { SRDMonster, SRD_MONSTERS_CATALOG } from '../../data/srdMonsters';
import { useDmStore } from '../../store/dmStore';
import { 
  searchAllMonstersCombined, 
  saveCustomMonster, 
  deleteCustomMonster, 
  getMonsterDefaultArtwork,
  MONSTER_TYPE_ARTWORK
} from '../../services/dnd5eMonsterService';
import { 
  Search, 
  Filter, 
  Swords, 
  Shield, 
  Heart, 
  Plus, 
  Sparkles, 
  X, 
  Check, 
  BookOpen, 
  Flame,
  Zap,
  ChevronRight,
  Brain,
  Download,
  Dices,
  Trash2,
  Image as ImageIcon,
  Edit3,
  RefreshCw,
  Eye,
  Crown,
  List,
  AlertTriangle
} from 'lucide-react';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { requestRoll } from '../dice/rollBus';
import { AIMonsterForge } from './AIMonsterForge';
import { ASSET_MAP } from '@/config/assets';

export function DmBestiaryVault() {
  const { addCombatant } = useDmStore();

  const [monsters, setMonsters] = useState<SRDMonster[]>(SRD_MONSTERS_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMonster, setSelectedMonster] = useState<SRDMonster>(SRD_MONSTERS_CATALOG[0]);
  const [injectedNotice, setInjectedNotice] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // In-panel Drawers
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isEditArtOpen, setIsEditArtOpen] = useState(false);
  const [customArtUrl, setCustomArtUrl] = useState('');

  // Confirm Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load and search monsters
  useEffect(() => {
    let active = true;
    const fetchMonsters = async () => {
      setIsSearchingOnline(Boolean(searchQuery.trim().length >= 2));
      const results = await searchAllMonstersCombined(searchQuery, selectedType);
      if (active) {
        setMonsters(results);
        setIsSearchingOnline(false);
        // Only open dropdown if user is actively searching
        if (searchQuery.trim().length > 0) {
          setIsSearchDropdownOpen(true);
        }
      }
    };

    const timer = setTimeout(fetchMonsters, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedType]);

  const handleSelectMonster = (monster: SRDMonster) => {
    setSelectedMonster(monster);
    setIsSearchDropdownOpen(false);
    setIsCatalogOpen(false);
  };

  const handleAddToCombat = (monster: SRDMonster) => {
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

    setInjectedNotice(`Added "${monster.name}" to Active Combat Encounter!`);
    setTimeout(() => setInjectedNotice(null), 2500);
  };

  const handleRollAction = (action: { name: string; attackBonus?: number; damage?: string }) => {
    const bonus = action.attackBonus ?? 5;
    requestRoll({
      command: `1d20+${bonus}`,
      label: `${selectedMonster.name}: ${action.name} (Attack Roll)`
    });
  };

  const handleSaveArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArtUrl.trim()) return;

    const updated = {
      ...selectedMonster,
      imageUrl: customArtUrl.trim()
    };
    saveCustomMonster(updated);
    setSelectedMonster(updated);
    setIsEditArtOpen(false);
    setCustomArtUrl('');
  };

  const handleExecuteDeleteMonster = (id: string) => {
    deleteCustomMonster(id);
    const refreshed = monsters.filter(m => m.id !== id);
    setMonsters(refreshed);
    setConfirmDeleteId(null);
    if (refreshed.length > 0) setSelectedMonster(refreshed[0]);
    setInjectedNotice('Deleted custom monster from vault.');
    setTimeout(() => setInjectedNotice(null), 2000);
  };

  const handleMonsterCreated = (newMonster: SRDMonster) => {
    setMonsters([newMonster, ...monsters]);
    setSelectedMonster(newMonster);
    setIsAiDrawerOpen(false);
  };

  const activeArtwork = selectedMonster.imageUrl || getMonsterDefaultArtwork(selectedMonster.type);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-transparent text-[#161616] select-none">
      
      {/* Toast Notice */}
      {injectedNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-sm text-xs font-display uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check size={14} />
          <span>{injectedNotice}</span>
        </div>
      )}

      {/* TOP TACTICAL RIBBON: Search Dropdown, Type Filters & Browse Catalog */}
      <div className="p-3.5 bg-[#fcfbf9] border-b border-[#141414]/15 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-30 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          
          {/* Search Input with Auto-Complete Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsSearchDropdownOpen(true);
              }}
              placeholder="Search 5e SRD, Open5e & Custom Bestiary..."
              className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded pl-8 pr-8 py-1.5 text-xs text-[#161616] font-serif focus:outline-none placeholder-[#888888] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#161616] cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
            {isSearchingOnline && (
              <RefreshCw size={12} className="absolute right-7 top-1/2 -translate-y-1/2 text-[var(--accent-ink)] animate-spin" />
            )}

            {/* AUTOCOMPLETE SEARCH DROPDOWN */}
            {isSearchDropdownOpen && monsters.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/30 rounded-lg shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-[#141414]/10">
                {monsters.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMonster(m)}
                    className="p-2.5 hover:bg-black/5 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-black/5 border border-black/20 overflow-hidden shrink-0">
                        <img
                          src={m.imageUrl || getMonsterDefaultArtwork(m.type)}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <strong className="font-display text-xs text-[#161616] group-hover:text-[var(--accent-ink)] uppercase truncate block font-bold">
                          {m.name}
                        </strong>
                        <span className="text-[10px] font-serif text-[#555555] truncate block">
                          {m.size} {m.type} • {m.ac} AC • {m.hp} HP
                        </span>
                      </div>
                    </div>
                    <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                      CR {m.cr}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-white p-0.5 border border-[#141414]/15 rounded shadow-xs">
            {['all', 'Dragon', 'Undead', 'Fiend', 'Monstrosity', 'Humanoid', 'Beast'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setIsCatalogOpen(true);
                }}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-display uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedType.toLowerCase() === t.toLowerCase()
                    ? 'bg-[#1c1c1c] text-white font-bold shadow-xs'
                    : 'text-[#555555] hover:text-[#161616]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Browse Catalog Trigger Button */}
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`px-3 py-1.5 rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-xs ${
              isCatalogOpen
                ? 'bg-[#1c1c1c] text-white border-black'
                : 'bg-white border-[#141414]/20 text-[#161616] hover:border-black/40'
            }`}
            title="Browse all monsters in catalog"
          >
            <List size={13} />
            <span>Browse Catalog ({monsters.length})</span>
          </button>
        </div>

        {/* Action Buttons: Add Monster to Combat & AI Forge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddToCombat(selectedMonster)}
            className="px-3.5 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Swords size={13} />
            <span>+ Add to Combat Tracker</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3.5 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles size={13} className="text-[var(--accent-ink)] animate-pulse" />
            <span>AI Monster Forge</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT STAGE */}
      <div className="relative flex-1 min-h-0 w-full grid grid-cols-1 md:grid-cols-[380px_1fr] lg:grid-cols-[440px_1fr] overflow-hidden text-[#161616]">
        
        {/* LEFT COLUMN: Monster Stat Block & Compendium Info */}
        <div className="h-full min-h-0 overflow-y-auto hide-scrollbar p-5 bg-[#fcfbf9] border-r border-[#141414]/15 flex flex-col gap-4 relative z-10">
          
          {/* Monster Header */}
          <div className="flex flex-col gap-1 border-b border-[#141414]/15 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold">
                CR {selectedMonster.cr} ({selectedMonster.xp.toLocaleString()} XP)
              </span>
              <div className="flex items-center gap-1.5">
                {selectedMonster.isCustom && (
                  <span className="px-2 py-0.5 bg-[var(--accent-ink)]/15 border border-[var(--accent-ink)]/30 text-[var(--accent-ink)] rounded text-[10px] font-bold uppercase">
                    Custom
                  </span>
                )}
                <button
                  onClick={() => setIsEditArtOpen(!isEditArtOpen)}
                  className="p-1 rounded bg-white border border-[#141414]/20 text-[#555555] hover:text-[#161616] transition-colors cursor-pointer"
                  title="Change Monster Artwork URL"
                >
                  <ImageIcon size={12} />
                </button>
                {selectedMonster.isCustom && (
                  <button
                    onClick={() => setConfirmDeleteId(selectedMonster.id)}
                    className="p-1 rounded bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Delete Custom Monster"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#161616] tracking-wide mt-1">
              {selectedMonster.name}
            </h2>
            <p className="font-serif italic text-xs text-[#555555]">
              {selectedMonster.size} {selectedMonster.type} {selectedMonster.subtype ? `(${selectedMonster.subtype})` : ''}, {selectedMonster.alignment}
            </p>
          </div>

          {/* Vitals Grid: AC, HP, Speed */}
          <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-white border border-[#141414]/15 rounded-sm shadow-xs">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-display uppercase text-[#777777] font-bold">Armor Class</span>
              <span className="text-base font-mono font-bold text-[#161616]">{selectedMonster.ac}</span>
              <span className="text-[9px] text-[#555555] truncate max-w-full font-medium">{selectedMonster.acType || 'Natural'}</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#141414]/15">
              <span className="text-[10px] font-display uppercase text-[#777777] font-bold">Hit Points</span>
              <span className="text-base font-mono font-bold text-[#161616]">{selectedMonster.hp}</span>
              <span className="text-[9px] text-[#555555] font-medium">{selectedMonster.hitDice}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-display uppercase text-[#777777] font-bold">Speed</span>
              <span className="text-xs font-mono font-bold text-[#161616] mt-1 truncate max-w-full">{selectedMonster.speed}</span>
            </div>
          </div>

          {/* Ability Scores Matrix */}
          <div className="grid grid-cols-6 gap-1.5 p-2 bg-white border border-[#141414]/15 rounded text-center shadow-xs">
            {[
              { label: 'STR', val: selectedMonster.str },
              { label: 'DEX', val: selectedMonster.dex },
              { label: 'CON', val: selectedMonster.con },
              { label: 'INT', val: selectedMonster.int },
              { label: 'WIS', val: selectedMonster.wis },
              { label: 'CHA', val: selectedMonster.cha }
            ].map(ab => {
              const mod = Math.floor((ab.val - 10) / 2);
              return (
                <div key={ab.label} className="flex flex-col items-center bg-black/5 p-1 rounded border border-black/10">
                  <span className="text-[9px] font-display uppercase text-[#555555] font-bold">{ab.label}</span>
                  <span className="text-xs font-mono font-bold text-[#161616]">{ab.val}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">
                    {mod >= 0 ? `+${mod}` : mod}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Senses & Languages */}
          <div className="flex flex-col gap-1 text-xs font-serif text-[#444444] bg-white p-2.5 border border-[#141414]/15 rounded shadow-xs">
            {selectedMonster.savingThrows && <div><strong className="text-[#161616] font-display text-[11px] uppercase">Saving Throws:</strong> {selectedMonster.savingThrows}</div>}
            {selectedMonster.skills && <div><strong className="text-[#161616] font-display text-[11px] uppercase">Skills:</strong> {selectedMonster.skills}</div>}
            {selectedMonster.damageResistances && <div><strong className="text-[#161616] font-display text-[11px] uppercase">Resistances:</strong> {selectedMonster.damageResistances}</div>}
            <div><strong className="text-[#161616] font-display text-[11px] uppercase">Senses:</strong> {selectedMonster.senses}</div>
            <div><strong className="text-[#161616] font-display text-[11px] uppercase">Languages:</strong> {selectedMonster.languages}</div>
          </div>

          {/* Traits */}
          {selectedMonster.traits && selectedMonster.traits.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
              <span className="font-display text-xs uppercase tracking-wider text-[#161616] font-bold">
                Special Traits
              </span>
              {selectedMonster.traits.map(t => (
                <div key={t.name} className="text-xs font-serif leading-relaxed text-[#444444]">
                  <strong className="text-[#161616] font-sans font-bold">{t.name}.</strong> {t.description}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {selectedMonster.actions && selectedMonster.actions.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
              <span className="font-display text-xs uppercase tracking-wider text-[#161616] font-bold">
                Actions
              </span>
              {selectedMonster.actions.map(act => (
                <div key={act.name} className="p-2.5 bg-white border border-[#141414]/15 rounded shadow-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-display text-[#161616] uppercase tracking-wide font-bold">
                      {act.name}
                    </strong>
                    {act.attackBonus !== undefined && (
                      <button
                        onClick={() => handleRollAction(act)}
                        className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold flex items-center gap-1 border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 shadow-xs cursor-pointer"
                        title="Roll Attack in 3D Dice Console"
                      >
                        <Dices size={11} className="text-[var(--accent-ink)]" />
                        <span>Roll +{act.attackBonus}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-serif text-[#555555] leading-relaxed">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Legendary Actions */}
          {selectedMonster.legendaryActions && selectedMonster.legendaryActions.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
              <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                Legendary Actions (3/Round)
              </span>
              {selectedMonster.legendaryActions.map(la => (
                <div key={la.name} className="text-xs font-serif leading-relaxed text-[#555555]">
                  <strong className="text-[#161616] font-sans font-bold">{la.name}.</strong> {la.description}
                </div>
              ))}
            </div>
          )}

          {/* Lair Actions */}
          {selectedMonster.lairActions && selectedMonster.lairActions.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
              <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                Lair Actions
              </span>
              {selectedMonster.lairActions.map(la => (
                <div key={la.name} className="text-xs font-serif leading-relaxed text-[#555555]">
                  <strong className="text-[#161616] font-sans font-bold">{la.name}.</strong> {la.description}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Cinematic Creature Showcase with Sculpted Monster Frame */}
        <div className="relative w-full h-full overflow-hidden bg-[#0d0c0a] flex items-center justify-center p-2 sm:p-4 lg:p-6">
          
          {/* Atmospheric Blurred Background Backdrop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={activeArtwork}
              alt=""
              className="w-full h-full object-cover filter blur-3xl opacity-30 scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/85" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.9)_100%)]" />
          </div>

          {/* Full-Bleed Monster Frame Container */}
          <div className="relative z-10 w-full h-full max-w-full max-h-full flex items-center justify-center isolate group select-none">
            <div className="relative h-full w-full max-h-full aspect-[3600/3736] flex items-center justify-center isolate">
              {/* Monster Artwork positioned inside the frame window */}
              <div 
                className="relative w-[72%] h-[72%] overflow-hidden bg-black shadow-2xl flex items-center justify-center rounded-sm -translate-x-[0.5%] -translate-y-[0.5%]"
              >
                <img
                  src={activeArtwork}
                  alt={selectedMonster.name}
                  className="w-full h-full object-cover object-center filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Monster Frame Overlay SVG (src/assets/bestiary/monster_frame.svg) */}
              <img
                src={ASSET_MAP.frames.monsterFrame.svg}
                alt="Monster Frame"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_16px_48px_rgba(0,0,0,0.95)] z-20"
              />
            </div>
          </div>

          {/* Bottom-Right Floating Creature Title Plaque */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end text-right p-4 bg-white/95 border-2 border-black/30 rounded-xl backdrop-blur-md shadow-2xl max-w-sm text-[#161616]">
            <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-gw2 uppercase tracking-widest font-bold mb-1">
              Challenge Rating {selectedMonster.cr}
            </span>
            <h3 className="font-gw2 text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-wider uppercase">
              {selectedMonster.name}
            </h3>
            <p className="font-serif italic text-xs text-[#555555]">
              {selectedMonster.size} {selectedMonster.type}
            </p>
          </div>

          {/* IN-PANEL SLIDING DRAWER: BROWSE CATALOG LIST */}
          {isCatalogOpen && (
            <div className="absolute inset-y-0 left-0 w-full max-w-md bg-[#fcfbf9] border-r-2 border-black/30 shadow-2xl z-40 p-5 flex flex-col gap-3 overflow-hidden animate-slideInLeft text-[#161616]">
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <List size={16} className="text-[var(--accent-ink)]" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Monster Catalog ({monsters.length})
                  </h3>
                </div>
                <button onClick={() => setIsCatalogOpen(false)} className="text-[#777777] hover:text-[#161616] p-1 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {/* Monster Catalog Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col gap-1.5 pr-1">
                {monsters.map(m => {
                  const isSelected = selectedMonster.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMonster(m)}
                      className={`p-2.5 rounded border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-2 border-[var(--accent-ink)] shadow-md'
                          : 'bg-white border-[#141414]/15 hover:border-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 overflow-hidden shrink-0">
                          <img src={m.imageUrl || getMonsterDefaultArtwork(m.type)} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <strong className={`font-display text-xs uppercase truncate block ${isSelected ? 'text-[var(--accent-ink)]' : 'text-[#161616]'}`}>
                            {m.name}
                          </strong>
                          <span className="text-[10px] font-serif text-[#555555] truncate block">
                            {m.size} {m.type} • {m.ac} AC • {m.hp} HP
                          </span>
                        </div>
                      </div>
                      <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                        CR {m.cr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* IN-PANEL SLIDING DRAWER: UPGRADED AI MONSTER FORGE */}
          <AIMonsterForge
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            onMonsterCreated={handleMonsterCreated}
          />

          {/* IN-PANEL SLIDING DRAWER: Custom Artwork URL Editor */}
          {isEditArtOpen && (
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#fcfbf9] border-l-2 border-black/30 shadow-2xl z-30 p-6 flex flex-col gap-4 overflow-y-auto hide-scrollbar animate-slideInRight text-[#161616]">
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-[var(--accent-ink)]" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Change Creature Artwork
                  </h3>
                </div>
                <button onClick={() => setIsEditArtOpen(false)} className="text-[#777777] hover:text-[#161616] p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveArtwork} className="flex flex-col gap-3">
                <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
                  Image URL / Link
                </label>
                <input
                  type="text"
                  required
                  value={customArtUrl}
                  onChange={(e) => setCustomArtUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded p-2.5 text-xs text-[#161616] font-mono focus:outline-none"
                />

                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-[11px] text-[#555555]">Or choose a creature preset:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(MONSTER_TYPE_ARTWORK).map(([type, url]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCustomArtUrl(url)}
                        className="relative h-12 rounded overflow-hidden border border-[#141414]/20 hover:border-black/40 text-center flex items-center justify-center p-1 group cursor-pointer shadow-xs"
                      >
                        <img src={url} alt={type} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90" />
                        <span className="relative z-10 text-[10px] font-display uppercase font-bold text-white drop-shadow">
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs font-display uppercase tracking-wider text-xs font-bold mt-2 transition-all shadow-xs cursor-pointer"
                >
                  Save Artwork
                </button>
              </form>
            </div>
          )}

          {/* CONFIRM DELETE MODAL */}
          {confirmDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
              <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-3.5 animate-fadeIn text-[#161616]">
                <div className="flex items-center gap-2 text-[#c53030]">
                  <AlertTriangle size={18} />
                  <h4 className="font-display text-sm uppercase font-bold">Confirm Deletion</h4>
                </div>
                <p className="font-serif text-xs text-[#555555] leading-relaxed">
                  Are you sure you want to permanently delete <strong>"{selectedMonster.name}"</strong> from your Bestiary Vault?
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteDeleteMonster(confirmDeleteId)}
                    className="px-3.5 py-1.5 bg-[#c53030] hover:bg-[#9B2C2C] text-white text-xs font-display uppercase font-bold rounded shadow-xs cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
