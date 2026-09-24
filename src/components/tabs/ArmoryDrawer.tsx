import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { Item } from '../../types';
import { SRD_WEAPONS_CATALOG, SRDWeaponData } from '../../data/srdWeapons';
import { getWeaponIcon, IconPlaceholder, GameItemIcon } from '../ui/GameIcons';
import { IconPickerModal } from '../common/IconPickerModal';
import {
  Swords,
  Search,
  Plus,
  Trash2,
  X,
  Shield,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Info
} from 'lucide-react';

export function ArmoryDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    character,
    updateInventoryItem,
    addInventoryItem,
    deleteInventoryItem,
    toggleReadyWeapon,
    getReadiedWeaponsCount,
    getProficiencyBonus,
    isEditMode
  } = useStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedWeaponId, setExpandedWeaponId] = useState<string | null>(null);

  // Modals state
  const [srdModalOpen, setSrdModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [iconPickerWeapon, setIconPickerWeapon] = useState<Item | null>(null);

  // SRD Search & filters in modal
  const [srdSearch, setSrdSearch] = useState('');
  const [srdCategoryFilter, setSrdCategoryFilter] = useState('All');
  const [srdSelectedWeapon, setSrdSelectedWeapon] = useState<SRDWeaponData | null>(null);

  // Warning state when attempting to ready past 4
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Custom Weapon Form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Martial Melee' | 'Simple Melee' | 'Martial Ranged' | 'Simple Ranged'>('Martial Melee');
  const [customDamageDice, setCustomDamageDice] = useState('1d8');
  const [customDamageType, setCustomDamageType] = useState('Slashing');
  const [customAtkBonus, setCustomAtkBonus] = useState<number>(0);
  const [customDmgBonus, setCustomDmgBonus] = useState<number>(0);
  const [customRange, setCustomRange] = useState('5 ft.');
  const [customWeight, setCustomWeight] = useState('3');
  const [customRarity, setCustomRarity] = useState<Item['rarity']>('Common');
  const [customProperties, setCustomProperties] = useState('Versatile (1d10)');
  const [customDesc, setCustomDesc] = useState('');

  const readiedCount = getReadiedWeaponsCount();
  const profBonus = getProficiencyBonus();

  const weaponsList = (character.inventory || []).filter((i) => i.type === 'weapon');

  const getFilteredWeapons = () => {
    let filtered = weaponsList;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          (w.damageType && w.damageType.toLowerCase().includes(q)) ||
          (w.description && w.description.toLowerCase().includes(q))
      );
    }
    if (filter === 'Readied') filtered = filtered.filter((w) => w.isReadiedInCombat);
    else if (filter === 'Equipped') filtered = filtered.filter((w) => w.equipped);
    else if (filter === 'Magical') filtered = filtered.filter((w) => w.rarity !== 'Common');

    return filtered;
  };

  const handleToggleReady = (weaponId: string) => {
    const weapon = weaponsList.find((w) => w.id === weaponId);
    if (!weapon) return;

    if (!weapon.isReadiedInCombat && readiedCount >= 4) {
      setWarningMessage(
        `Armory Limit Reached: You already have 4 weapons equipped for combat. Please unready a weapon before readying "${weapon.name}".`
      );
      setTimeout(() => setWarningMessage(null), 5000);
      return;
    }

    const res = toggleReadyWeapon(weaponId);
    if (!res.success && res.message) {
      setWarningMessage(res.message);
      setTimeout(() => setWarningMessage(null), 5000);
    }
  };

  const handleImportSRDWeapon = (srdWeapon: SRDWeaponData) => {
    const exists = character.inventory.some(
      (i) => i.type === 'weapon' && i.name.toLowerCase() === srdWeapon.name.toLowerCase()
    );
    if (exists) {
      setWarningMessage(`"${srdWeapon.name}" is already in your Armory inventory.`);
      setTimeout(() => setWarningMessage(null), 4000);
      setSrdModalOpen(false);
      return;
    }

    addInventoryItem({
      name: srdWeapon.name,
      type: 'weapon',
      rarity: 'Common',
      damageDice: srdWeapon.damageDice,
      damageType: srdWeapon.damageType,
      attackBonus: profBonus + 3,
      damageBonus: 3,
      range: srdWeapon.range,
      weight: srdWeapon.weight,
      quantity: 1,
      equipped: true,
      requiresAttunement: false,
      attuned: false,
      isReadiedInCombat: readiedCount < 4,
      weaponProperties: srdWeapon.properties,
      description: `${srdWeapon.category}. ${srdWeapon.description}`
    });

    setSrdModalOpen(false);
  };

  const handleCreateCustomWeapon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const propsArray = customProperties
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addInventoryItem({
      name: customName.trim(),
      type: 'weapon',
      rarity: customRarity,
      damageDice: customDamageDice.trim() || '1d8',
      damageType: customDamageType.trim() || 'Slashing',
      attackBonus: customAtkBonus || profBonus + 3,
      damageBonus: customDmgBonus || 3,
      range: customRange.trim() || '5 ft.',
      weight: parseFloat(customWeight) || 3,
      quantity: 1,
      equipped: true,
      requiresAttunement: customRarity !== 'Common',
      attuned: false,
      isReadiedInCombat: readiedCount < 4,
      weaponProperties: propsArray,
      description: customDesc.trim() || `${customCategory} weapon.`
    });

    // Reset Form
    setCustomName('');
    setCustomDesc('');
    setCustomModalOpen(false);
  };

  const filteredWeapons = getFilteredWeapons();

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
            {/* Header & Action Toolbar */}
            <div className="flex flex-col gap-4 p-5 sm:p-6 border-b border-[#141414]/15 bg-white/90 shrink-0 shadow-xs">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <Swords className="w-5 h-5 text-[#1a1a1a]" />
                    <h2 className="font-display text-lg sm:text-xl tracking-[0.2em] text-[#1a1a1a] uppercase font-bold">
                      ARMORY & WEAPON VAULT
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-[#555555] mt-1 flex-wrap">
                    <span>
                      Total Weapons in Vault: <strong className="text-[#161616]">{weaponsList.length}</strong>
                    </span>
                    <span>
                      HUD Readied Slots:{' '}
                      <strong className={readiedCount >= 4 ? 'text-[var(--accent-ink)]' : 'text-[#161616]'}>
                        {readiedCount} / 4
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded border border-[#141414]/20 text-[#555555] hover:text-[#161616] hover:border-black/40 transition-colors cursor-pointer"
                  title="Close Armory"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Buttons */}
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
                  <span>+ Forged Custom Weapon</span>
                </button>
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

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 px-5 py-3.5 bg-white/80 border-b border-[#141414]/15 shrink-0 shadow-xs">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]"
                  />
                  <input
                    type="text"
                    placeholder="Search armory by name, type, damage dice..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#141414]/20 pl-9 pr-8 py-1.5 text-xs text-[#161616] placeholder:text-[#888888] rounded focus:outline-none focus:border-black/40 font-serif shadow-xs"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-2.5 text-[#777777] hover:text-[#161616] cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                {['All', 'Readied', 'Equipped', 'Magical'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={filter === f ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                    className={`spell-filter-tab px-3 py-1 rounded-xs text-[11px] font-display uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      filter === f
                        ? 'text-white font-bold shadow-xs'
                        : 'bg-transparent text-[#4a4a4a] border border-[#141414]/15 hover:text-[#161616] hover:border-black/25'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Weapons Scroll Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 flex flex-col gap-3">
              {filteredWeapons.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-[#777777]">
                  <Swords size={32} className="opacity-40 text-[var(--accent-ink)]" />
                  <p className="font-serif text-sm">No weapons found matching your filter.</p>
                  <button
                    onClick={() => setSrdModalOpen(true)}
                    className="text-xs font-display text-[var(--accent-ink)] underline tracking-wider uppercase mt-2 font-bold cursor-pointer"
                  >
                    Browse 5e SRD Weapon Vault
                  </button>
                </div>
              ) : (
                filteredWeapons.map((weapon) => {
                  const isExpanded = expandedWeaponId === weapon.id;

                  return (
                    <div
                      key={weapon.id}
                      className={`border rounded p-3.5 flex flex-col gap-2.5 transition-all shadow-sm ${
                        weapon.isReadiedInCombat
                          ? 'border-[var(--accent-ink)] bg-white shadow-md'
                          : weapon.equipped
                          ? 'border-[#141414]/20 bg-white/90'
                          : 'border-[#141414]/10 bg-white/50 opacity-75'
                      }`}
                    >
                      {/* Top Row: Icon, Name, Stats & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          {isEditMode ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <GameItemIcon
                                  item={weapon}
                                  size={28}
                                  onClick={() => setIconPickerWeapon(weapon)}
                                />
                                <input
                                  type="text"
                                  value={weapon.name}
                                  onChange={(e) => updateInventoryItem(weapon.id, { name: e.target.value })}
                                  className="font-serif text-sm text-[#161616] font-bold bg-white border border-[#141414]/20 px-2 py-0.5 rounded focus:border-[var(--accent-ink)] focus:outline-none flex-1"
                                  placeholder="Weapon Name"
                                />
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Atk:</span>
                                  <input
                                    type="number"
                                    value={weapon.attackBonus ?? 0}
                                    onChange={(e) => updateInventoryItem(weapon.id, { attackBonus: parseInt(e.target.value, 10) || 0 })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Dmg:</span>
                                  <input
                                    type="text"
                                    value={weapon.damageDice || '1d8'}
                                    onChange={(e) => updateInventoryItem(weapon.id, { damageDice: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Type:</span>
                                  <input
                                    type="text"
                                    value={weapon.damageType || 'Slashing'}
                                    onChange={(e) => updateInventoryItem(weapon.id, { damageType: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#141414]/20 rounded">
                                  <span className="text-[9px] text-[#555555]">Rng:</span>
                                  <input
                                    type="text"
                                    value={weapon.range || '5 ft.'}
                                    onChange={(e) => updateInventoryItem(weapon.id, { range: e.target.value })}
                                    className="w-full bg-transparent text-[#161616] focus:outline-none text-center text-[10px] font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <GameItemIcon
                                item={weapon}
                                size={40}
                                className="rounded-sm shrink-0"
                                onClick={() => setIconPickerWeapon(weapon)}
                              />
                              <div className="flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-serif font-bold text-sm sm:text-base text-[#161616] truncate">
                                    {weapon.name}
                                  </span>
                                  {weapon.rarity && weapon.rarity !== 'Common' && (
                                    <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/40 leading-none font-bold">
                                      {weapon.rarity}
                                    </span>
                                  )}
                                  {weapon.isReadiedInCombat && (
                                    <span
                                      style={{ backgroundColor: 'var(--accent-ink)' }}
                                      className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.2 rounded-xs text-white font-bold leading-none shadow-xs"
                                    >
                                      Readied in HUD
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-mono text-[#555555] flex-wrap mt-0.5">
                                  <span className="text-[var(--accent-ink)] font-bold">
                                    {weapon.damageDice} {weapon.damageBonus ? `+${weapon.damageBonus}` : ''} {weapon.damageType}
                                  </span>
                                  <span>•</span>
                                  <span>Attack: +{weapon.attackBonus ?? (profBonus + 3)}</span>
                                  <span>•</span>
                                  <span>Range: {weapon.range || '5 ft.'}</span>
                                  <span>•</span>
                                  <span>{weapon.weight || 1} lbs</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          onClick={() => setExpandedWeaponId(isExpanded ? null : weapon.id)}
                          className="p-1 text-[#555555] hover:text-[#161616] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand Description'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Controls Bar per Weapon */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#141414]/15 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Equipped Toggle */}
                          <button
                            onClick={() => updateInventoryItem(weapon.id, { equipped: !weapon.equipped })}
                            className={`px-2.5 py-1 rounded-xs border text-[10px] font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                              weapon.equipped
                                ? 'border-[#1EB253] bg-[#1EB253]/15 text-[#1EB253] font-bold'
                                : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40'
                            }`}
                            title="Toggle Equipped state"
                          >
                            <div
                              className={`w-2.5 h-2.5 border rounded-xs flex items-center justify-center ${
                                weapon.equipped ? 'border-[#1EB253] bg-[#1EB253]' : 'border-[#999999]'
                              }`}
                            >
                              {weapon.equipped && <Check size={8} className="text-white stroke-[3]" />}
                            </div>
                            <span>{weapon.equipped ? 'Equipped' : 'Unequipped'}</span>
                          </button>

                          {/* Ready for Combat HUD Toggle Switch */}
                          <button
                            onClick={() => handleToggleReady(weapon.id)}
                            style={weapon.isReadiedInCombat ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                            className={`px-2.5 py-1 rounded-xs border text-[10px] font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                              weapon.isReadiedInCombat
                                ? 'text-white font-bold shadow-xs'
                                : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-[var(--accent-ink)] hover:text-[#161616]'
                            }`}
                            title={`Toggle Readied in Combat HUD (${readiedCount}/4)`}
                          >
                            <Swords size={11} className={weapon.isReadiedInCombat ? 'text-white' : ''} />
                            <span>{weapon.isReadiedInCombat ? 'Readied in HUD' : '+ Ready in HUD'}</span>
                          </button>
                        </div>

                        {/* Delete Weapon Action */}
                        <div className="flex items-center gap-1">
                          {deleteConfirmId === weapon.id ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-300 rounded px-1.5 py-0.5">
                              <span className="text-[9px] text-red-700">Delete?</span>
                              <button
                                onClick={() => {
                                  deleteInventoryItem(weapon.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[9px] text-red-700 font-bold hover:underline cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[9px] text-[#555555] hover:underline ml-1 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(weapon.id)}
                              className="p-1 text-[#5A5348] hover:text-[#E33526] transition-colors"
                              title="Delete Weapon from Inventory"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded View: Properties & Lore / Rules */}
                      {isExpanded && (
                        <div className="flex flex-col gap-2 p-3 bg-white/70 rounded border border-[#141414]/15 text-xs font-serif animate-fade-in shadow-inner">
                          {weapon.weaponProperties && weapon.weaponProperties.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-display text-[#555555] uppercase font-bold">Properties:</span>
                              {weapon.weaponProperties.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-[#fdfbf7] border border-[#141414]/15 text-[10px] text-[#161616] rounded"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-[#555555] leading-relaxed whitespace-pre-line">
                            {weapon.description || 'No detailed lore or rules description.'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* SRD Modal */}
          {srdModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="relative w-full max-w-3xl bg-white/95 border-2 border-black/30 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#161616]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-white/90">
                  <div className="flex items-center gap-2.5">
                    <Download className="text-[#1a1a1a]" size={20} />
                    <h3 className="font-display font-bold text-base tracking-widest text-[#1a1a1a] uppercase">
                      5E SYSTEM REFERENCE DOCUMENT (SRD) WEAPON VAULT
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSrdModalOpen(false);
                      setSrdSelectedWeapon(null);
                    }}
                    className="p-1 text-[#555555] hover:text-[#161616] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* SRD Filters */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 bg-[#fdfbf7] border-b border-[#141414]/15">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-[#777777]" size={14} />
                    <input
                      type="text"
                      value={srdSearch}
                      onChange={(e) => setSrdSearch(e.target.value)}
                      placeholder="Filter SRD weapons (e.g. Battleaxe, Rapier, Greatsword)..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#141414]/20 rounded text-xs text-[#161616] placeholder-[#888888] focus:border-[var(--accent-ink)] focus:outline-none shadow-xs font-serif"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                    {['All', 'Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSrdCategoryFilter(cat)}
                        style={srdCategoryFilter === cat ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                        className={`spell-filter-tab px-2.5 py-1 rounded-xs text-[10px] font-display uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                          srdCategoryFilter === cat
                            ? 'text-white font-bold shadow-xs'
                            : 'bg-white text-[#555555] border border-[#141414]/15 hover:border-black/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SRD Weapons List & Preview Split View */}
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
                  {/* Left List */}
                  <div className="overflow-y-auto hide-scrollbar border-r border-[#141414]/15 p-4 flex flex-col gap-2 bg-[#fcfbf9]">
                    {SRD_WEAPONS_CATALOG.filter((w) => {
                      if (srdSearch.trim() && !w.name.toLowerCase().includes(srdSearch.toLowerCase())) {
                        return false;
                      }
                      if (srdCategoryFilter !== 'All' && w.category !== srdCategoryFilter) {
                        return false;
                      }
                      return true;
                    }).map((w) => {
                      const isSelected = srdSelectedWeapon?.name === w.name;
                      return (
                        <div
                          key={w.name}
                          onClick={() => setSrdSelectedWeapon(w)}
                          style={isSelected ? { borderColor: 'var(--accent-ink)' } : {}}
                          className={`p-2.5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-white shadow-md'
                              : 'border-[#141414]/15 bg-white/80 hover:border-black/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GameItemIcon item={{ name: w.name, type: 'weapon' }} size={28} />
                            <div className="flex flex-col">
                              <span className="font-serif font-bold text-xs text-[#161616]">{w.name}</span>
                              <span className="text-[10px] font-mono text-[#555555]">
                                {w.damageDice} {w.damageType} • {w.category}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">{w.cost}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Preview */}
                  <div className="p-5 overflow-y-auto hide-scrollbar bg-white flex flex-col justify-between">
                    {srdSelectedWeapon ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <GameItemIcon item={{ name: srdSelectedWeapon.name, type: 'weapon' }} size={44} />
                          <div className="flex flex-col">
                            <h4 className="font-serif font-bold text-lg text-[#161616]">{srdSelectedWeapon.name}</h4>
                            <span className="text-xs font-display text-[var(--accent-ink)] uppercase tracking-wider font-bold">
                              {srdSelectedWeapon.category} • Cost: {srdSelectedWeapon.cost} • Weight: {srdSelectedWeapon.weight} lbs
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-[#fdfbf7] p-2.5 rounded border border-[#141414]/15 text-center text-xs font-mono">
                          <div>
                            <span className="text-[9px] text-[#555555] uppercase block font-bold">Damage</span>
                            <span className="text-[var(--accent-ink)] font-bold">
                              {srdSelectedWeapon.damageDice} {srdSelectedWeapon.damageType}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#555555] uppercase block font-bold">Range</span>
                            <span className="text-[#161616] font-bold">{srdSelectedWeapon.range}</span>
                          </div>
                        </div>

                        {srdSelectedWeapon.properties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {srdSelectedWeapon.properties.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded bg-[#fdfbf7] border border-[#141414]/15 text-[#555555] text-[10px] font-bold"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="font-serif text-xs text-[#555555] leading-relaxed">
                          {srdSelectedWeapon.description}
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-[#777777] font-serif text-xs">
                        Select a weapon from the list to view specifications and add to your Armory.
                      </div>
                    )}

                    {srdSelectedWeapon && (
                      <div className="pt-4 border-t border-[#141414]/15 flex justify-end">
                        <button
                          onClick={() => handleImportSRDWeapon(srdSelectedWeapon)}
                          className="px-5 py-2 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] text-white font-display text-xs font-bold tracking-widest uppercase rounded-xs shadow transition-all flex items-center gap-1.5 cursor-pointer hover:drop-shadow-[0_0_6px_var(--accent-glow)]"
                        >
                          <Plus size={14} />
                          <span>Add to Armory</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Weapon Modal */}
          {customModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <form
                onSubmit={handleCreateCustomWeapon}
                className="relative w-full max-w-lg bg-white/95 border-2 border-black/30 rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#161616]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-white/90">
                  <div className="flex items-center gap-2.5">
                    <Plus className="text-[#1a1a1a]" size={18} />
                    <h3 className="font-display font-bold text-sm tracking-widest text-[#1a1a1a] uppercase">
                      FORGE CUSTOM WEAPON
                    </h3>
                  </div>
                  <button onClick={() => setCustomModalOpen(false)} className="p-1 text-[#555555] hover:text-[#161616] cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-3.5 max-h-[70vh] overflow-y-auto hide-scrollbar">
                  <div>
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                      Weapon Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Dawnbreaker Battleaxe"
                      className="w-full bg-white border border-[#141414]/20 rounded px-3 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as 'Martial Melee' | 'Simple Melee' | 'Martial Ranged' | 'Simple Ranged')}
                        className="w-full bg-white border border-[#141414]/20 rounded px-2.5 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-sans"
                      >
                        <option value="Martial Melee">Martial Melee</option>
                        <option value="Simple Melee">Simple Melee</option>
                        <option value="Martial Ranged">Martial Ranged</option>
                        <option value="Simple Ranged">Simple Ranged</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                        Rarity
                      </label>
                      <select
                        value={customRarity}
                        onChange={(e) => setCustomRarity(e.target.value as Item['rarity'])}
                        className="w-full bg-white border border-[#141414]/20 rounded px-2.5 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-sans"
                      >
                        <option value="Common">Common</option>
                        <option value="Uncommon">Uncommon</option>
                        <option value="Rare">Rare</option>
                        <option value="Very Rare">Very Rare</option>
                        <option value="Legendary">Legendary</option>
                        <option value="Artifact">Artifact</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                        Damage Dice
                      </label>
                      <input
                        type="text"
                        value={customDamageDice}
                        onChange={(e) => setCustomDamageDice(e.target.value)}
                        placeholder="1d8, 2d6..."
                        className="w-full bg-white border border-[#141414]/20 rounded px-2.5 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                        Damage Type
                      </label>
                      <input
                        type="text"
                        value={customDamageType}
                        onChange={(e) => setCustomDamageType(e.target.value)}
                        placeholder="Slashing, Radiant..."
                        className="w-full bg-white border border-[#141414]/20 rounded px-2.5 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                        Range
                      </label>
                      <input
                        type="text"
                        value={customRange}
                        onChange={(e) => setCustomRange(e.target.value)}
                        placeholder="5 ft., 20/60..."
                        className="w-full bg-white border border-[#141414]/20 rounded px-2.5 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                      Properties (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={customProperties}
                      onChange={(e) => setCustomProperties(e.target.value)}
                      placeholder="e.g. Versatile (1d10), Finesse, Light, Heavy"
                      className="w-full bg-white border border-[#141414]/20 rounded px-3 py-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold block mb-1">
                      Description & Special Properties
                    </label>
                    <textarea
                      rows={3}
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Weapon history, enchantment lore, magical bonuses..."
                      className="w-full bg-white border border-[#141414]/20 rounded p-2.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-serif resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 px-6 py-4 bg-[#fdfbf7] border-t border-[#141414]/15">
                  <button
                    type="button"
                    onClick={() => setCustomModalOpen(false)}
                    className="px-4 py-2 text-xs font-display tracking-wider uppercase text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs font-bold tracking-widest uppercase rounded-xs shadow cursor-pointer transition-all"
                  >
                    Forge Weapon
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Weapon Icon Picker Modal */}
          <IconPickerModal
            isOpen={Boolean(iconPickerWeapon)}
            onClose={() => setIconPickerWeapon(null)}
            initialCategory="weapon"
            itemName={iconPickerWeapon?.name}
            onSelectIcon={(iconUrl) => {
              if (iconPickerWeapon) {
                updateInventoryItem(iconPickerWeapon.id, { iconUrl });
              }
              setIconPickerWeapon(null);
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
