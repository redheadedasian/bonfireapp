import React, { useState } from 'react';
import { useStore } from '../../store';
import { Frame } from '../ui';
import { TitleBanner } from '../common/TitleBanner';
import { FramedPanel } from '../common/FramedPanel';
import { AttunementSection } from '../character/AttunementSection';
import { GameAssetImg } from '../common/GameAssetImg';
import { Item } from '../../types';
import { ASSET_MAP } from '@/config/assets';
import { Plus, Minus, ChevronDown, ChevronUp, Sparkles, Shield, Package, Trash2, Check, Crosshair } from 'lucide-react';
import { getItemIcon, IconPlaceholder, GameItemIcon } from '../ui/GameIcons';
import { IconPickerModal } from '../common/IconPickerModal';

export function RightSidebar() {
  const {
    character,
    addLedgerEntry,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateCurrency,
    setCurrencyDirect,
    isEditMode
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'equipped' | 'consumable' | 'magic'>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [iconPickerItem, setIconPickerItem] = useState<Item | null>(null);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<Item['type']>('gear');
  const [newItemWeight, setNewItemWeight] = useState('1');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemReqAttune, setNewItemReqAttune] = useState(false);
  const [newItemRarity, setNewItemRarity] = useState<Item['rarity']>('Common');

  // Ledger Form State
  const [ledgerDesc, setLedgerDesc] = useState('');
  const [ledgerAmt, setLedgerAmt] = useState('');
  const [ledgerCurr, setLedgerCurr] = useState<'cp' | 'sp' | 'ep' | 'gp' | 'pp'>('gp');
  const [ledgerType, setLedgerType] = useState<'income' | 'expense'>('expense');

  const [attunementError, setAttunementError] = useState<string | null>(null);

  // 1. Attunement calculations
  const attunedItems = character.inventory.filter((i) => i.attuned);
  const attunementSlots = 3;
  const attunementCount = attunedItems.length;

  // 2. Weight calculations
  const totalWeight = character.inventory.reduce(
    (sum, item) => sum + (item.weight || 0) * (item.quantity || 1),
    0
  );
  const strScore = character.abilities.str.score;
  const maxCarryWeight = strScore * 15; // 5e carrying capacity = STR * 15
  const encumberedWeight = strScore * 5; // 5e variant encumbrance = STR * 5
  const weightPercentage = Math.min(100, Math.round((totalWeight / maxCarryWeight) * 100));

  // 3. Filtered items
  const filteredInventory = character.inventory.filter((item) => {
    if (activeFilter === 'equipped') return item.equipped;
    if (activeFilter === 'consumable') return item.type === 'consumable';
    if (activeFilter === 'magic') return item.type === 'magic' || item.rarity !== 'Common';
    return true;
  });

  const handleToggleAttune = (item: Item) => {
    if (item.attuned) {
      updateInventoryItem(item.id, { attuned: false });
      setAttunementError(null);
    } else {
      if (attunementCount >= attunementSlots) {
        setAttunementError('All 3 attunement slots are occupied. Un-attune another item first.');
        setTimeout(() => setAttunementError(null), 4000);
        return;
      }
      setAttunementError(null);
      updateInventoryItem(item.id, { attuned: true, requiresAttunement: true });
    }
  };

  const handleToggleEquip = (item: Item) => {
    updateInventoryItem(item.id, { equipped: !item.equipped });
  };

  const handleAddLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerDesc.trim() || !ledgerAmt) return;
    addLedgerEntry({
      description: ledgerDesc.trim(),
      amount: parseInt(ledgerAmt, 10) || 0,
      currency: ledgerCurr,
      type: ledgerType
    });
    setLedgerDesc('');
    setLedgerAmt('');
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addInventoryItem({
      name: newItemName.trim(),
      type: newItemType,
      weight: parseFloat(newItemWeight) || 0,
      quantity: parseInt(newItemQty, 10) || 1,
      rarity: newItemRarity,
      requiresAttunement: newItemReqAttune,
      attuned: false,
      equipped: newItemType === 'armor' || newItemType === 'weapon',
      description: ''
    });
    setNewItemName('');
    setIsAddingItem(false);
  };

  const selectedItem = character.inventory.find((i) => i.id === selectedItemId);

  return (
    <aside className="w-[360px] min-w-[360px] max-w-[360px] shrink-0 h-full flex flex-col bg-transparent select-none relative z-10">
      <FramedPanel
        variant="sidebar"
        cornerSize={32}
        insetPadding="p-0"
        className="w-full h-full"
        contentClassName="h-full w-full overflow-hidden"
      >
        <div className="h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pt-8 pb-16 flex flex-col gap-6">
          {/* 1. 5e Native Attunement Section with 9-Slice Magical Framed Cards */}
          <AttunementSection
            onSelectItem={(item) => setSelectedItemId(item.id)}
            onPickIcon={(item) => setIconPickerItem(item)}
          />

          {/* 2. Unified Inventory Grid & Filter Tabs */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="ornament-divider opacity-50 mt-1 mb-1" />
        <TitleBanner
          title="Inventory"
          subtitle="Equipment & Gear"
          action={
            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="text-[9px] font-display uppercase tracking-widest text-[#1a1a1a] hover:text-[#000000] flex items-center gap-1 transition-colors font-bold px-2 py-0.5 bg-white/[0.92] rounded border border-black/20 hover:border-[var(--accent-ink)] cursor-pointer shadow-xs"
            >
              <Plus size={12} /> {isAddingItem ? 'Cancel' : 'Add Item'}
            </button>
          }
        />

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'ALL ITEMS' },
            { id: 'equipped', label: 'EQUIPPED' },
            { id: 'consumable', label: 'CONSUMABLES' },
            { id: 'magic', label: 'MAGIC' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as 'all' | 'equipped' | 'consumable' | 'magic')}
              style={activeFilter === tab.id ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
              className={`spell-filter-tab flex-1 py-1 px-1.5 text-[9.5px] sm:text-[10.5px] font-display uppercase tracking-wider rounded-xs border transition-all cursor-pointer whitespace-nowrap text-center ${
                activeFilter === tab.id
                  ? 'text-white font-bold shadow-xs'
                  : 'bg-transparent text-[#4a4a4a] border border-[#141414]/15 hover:text-[#161616] hover:border-black/25'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Item Form (Collapsible) */}
        {isAddingItem && (
          <form onSubmit={handleCreateItem} className="p-3 bg-white/95 border border-black/20 rounded flex flex-col gap-2.5 shadow-sm text-[#161616]">
            <input
              type="text"
              placeholder="Item Name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-white border border-[#141414]/20 p-1.5 text-xs text-[#161616] placeholder:text-[#888888] focus:border-[var(--accent-ink)] focus:outline-none font-serif rounded"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as Item['type'])}
                className="bg-white border border-[#141414]/20 p-1 text-[10px] text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-display uppercase rounded"
              >
                <option value="gear">Gear</option>
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="consumable">Consumable</option>
                <option value="magic">Magic</option>
              </select>
              <select
                value={newItemRarity}
                onChange={(e) => setNewItemRarity(e.target.value as Item['rarity'])}
                className="bg-white border border-[#141414]/20 p-1 text-[10px] text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-display uppercase rounded"
              >
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Very Rare">Very Rare</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1 bg-white border border-[#141414]/20 px-2 py-1 rounded">
                <span className="text-[8px] font-display text-[#555555] uppercase font-bold">Wgt:</span>
                <input
                  type="number"
                  step="0.1"
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#161616] focus:outline-none font-mono"
                />
              </div>
              <div className="flex-1 flex items-center gap-1 bg-white border border-[#141414]/20 px-2 py-1 rounded">
                <span className="text-[8px] font-display text-[#555555] uppercase font-bold">Qty:</span>
                <input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#161616] focus:outline-none font-mono"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[9px] font-display uppercase tracking-wider text-[#555555] cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={newItemReqAttune}
                onChange={(e) => setNewItemReqAttune(e.target.checked)}
                className="accent-[var(--accent-ink)]"
              />
              Requires Attunement
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-2.5 py-1 text-[10px] font-display uppercase text-[#555555] hover:text-[#161616] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#1c1c1c] text-white text-[10px] font-display uppercase font-bold hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs cursor-pointer shadow-xs transition-all"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Unified Inventory Grid with Rarity Accents */}
        <div className="grid grid-cols-5 gap-2 p-2 bg-white/70 border border-[#141414]/15 rounded max-h-64 overflow-y-auto custom-scrollbar">
          {filteredInventory.map((item) => {
            const isSelected = selectedItemId === item.id;
            const rarity = item.rarity?.toLowerCase() || 'common';
            
            // Item Rarity Visual Theming
            let rarityBorder = 'border-[#141414]/15 hover:border-[var(--accent-ink)]';
            let rarityGlow = '';
            if (rarity === 'uncommon') {
              rarityBorder = 'border-[#22C55E]/60 hover:border-[#22C55E]';
              rarityGlow = 'shadow-[0_0_8px_rgba(34,197,94,0.25)]';
            } else if (rarity === 'rare') {
              rarityBorder = 'border-[#3B82F6]/60 hover:border-[#3B82F6]';
              rarityGlow = 'shadow-[0_0_8px_rgba(59,130,246,0.3)]';
            } else if (rarity === 'very rare') {
              rarityBorder = 'border-[#A855F7]/70 hover:border-[#A855F7]';
              rarityGlow = 'shadow-[0_0_10px_rgba(168,85,247,0.35)]';
            } else if (rarity === 'legendary') {
              rarityBorder = 'border-[#F59E0B]/80 hover:border-[#F59E0B]';
              rarityGlow = 'shadow-[0_0_10px_rgba(245,158,11,0.4)]';
            } else if (rarity === 'artifact') {
              rarityBorder = 'border-[#EF4444]/90 hover:border-[#EF4444]';
              rarityGlow = 'shadow-[0_0_12px_rgba(239,68,68,0.5)]';
            }

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                className={`aspect-square relative rounded overflow-hidden transition-all cursor-pointer flex items-center justify-center group select-none bg-white/90 border ${rarityBorder} ${rarityGlow} ${
                  isSelected
                    ? 'ring-2 ring-[var(--accent-ink)] bg-white scale-105 z-20 shadow-[0_0_12px_var(--accent-glow)]'
                    : item.equipped
                    ? 'bg-[#fdfbf7] ring-1 ring-[var(--accent-ink)]/40'
                    : 'hover:bg-white'
                }`}
                title={`${item.name} (${item.rarity || 'Common'} ${item.type})`}
              >
                {/* Equipped or Attuned Indicators */}
                {item.equipped && (
                  <div className="absolute top-1 left-1 z-20 w-2 h-2 rounded-full bg-[var(--accent-ink)] shadow-[0_0_4px_var(--accent-glow)] border border-white" />
                )}
                {item.attuned && (
                  <div className="absolute top-1 right-1 z-20 w-2 h-2 rotate-45 bg-[#A855F7] shadow-[0_0_4px_rgba(168,85,247,0.8)] border border-white" />
                )}

                {/* Item Icon taking up full height and width of the square */}
                <div className="w-full h-full p-1 flex items-center justify-center relative z-10 pointer-events-none">
                  <GameItemIcon
                    item={item}
                    className="w-full h-full border-0 bg-transparent shadow-none"
                  />
                </div>

                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 z-20 text-[9px] font-mono font-bold text-[#161616] bg-white/95 px-1 py-0.2 rounded-xs border border-[#141414]/20 shadow-sm leading-none">
                    {item.quantity}
                  </span>
                )}
              </div>
            );
          })}

          {/* Empty filler slots */}
          {Array.from({ length: Math.max(0, 15 - filteredInventory.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square relative rounded bg-white/40 border border-[#141414]/10 transition-colors flex items-center justify-center"
            />
          ))}
        </div>

        {/* Selected Item Quick Action Card */}
        {selectedItem && (
          <div className="p-3 bg-white/95 border border-black/20 rounded shadow-md flex flex-col gap-2.5 animate-fadeIn">
            {isEditMode ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-display text-[#1a1a1a] uppercase tracking-wider font-bold">
                    Edit Item Details
                  </span>
                  <button
                    onClick={() => deleteInventoryItem(selectedItem.id)}
                    className="text-[#E33526] hover:text-red-700 p-1 transition-colors flex items-center gap-1 text-[9px] font-display uppercase tracking-wider font-bold cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 shrink-0 relative rounded bg-white border border-[#141414]/20 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                    <GameItemIcon
                      item={selectedItem}
                      className="w-full h-full border-0 bg-transparent shadow-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => updateInventoryItem(selectedItem.id, { name: e.target.value })}
                    placeholder="Item Name"
                    className="flex-1 bg-white border border-[#141414]/20 p-1.5 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-serif font-bold rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedItem.type}
                    onChange={(e) => updateInventoryItem(selectedItem.id, { type: e.target.value as Item['type'] })}
                    className="bg-white border border-[#141414]/20 p-1 text-[10px] text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-display uppercase rounded"
                  >
                    <option value="gear">Gear</option>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="consumable">Consumable</option>
                    <option value="magic">Magic</option>
                  </select>
                  <select
                    value={selectedItem.rarity || 'Common'}
                    onChange={(e) => updateInventoryItem(selectedItem.id, { rarity: e.target.value as Item['rarity'] })}
                    className="bg-white border border-[#141414]/20 p-1 text-[10px] text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-display uppercase rounded"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Very Rare">Very Rare</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1 bg-white border border-[#141414]/20 px-2 py-1 rounded">
                    <span className="text-[8px] font-display text-[#555555] uppercase">Wgt:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedItem.weight || 0}
                      onChange={(e) => updateInventoryItem(selectedItem.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent text-xs text-[#161616] focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-[#141414]/20 px-2 py-1 rounded">
                    <span className="text-[8px] font-display text-[#555555] uppercase">Qty:</span>
                    <input
                      type="number"
                      value={selectedItem.quantity || 1}
                      onChange={(e) => updateInventoryItem(selectedItem.id, { quantity: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-transparent text-xs text-[#161616] focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 shrink-0 relative rounded bg-white border border-[#141414]/20 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                    <GameItemIcon
                      item={selectedItem}
                      className="w-full h-full border-0 bg-transparent shadow-none"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif text-xs font-bold text-[#161616] truncate leading-tight">
                      {selectedItem.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--accent-ink)] block truncate font-bold">
                      {selectedItem.rarity || 'Common'} • {selectedItem.type.toUpperCase()} • {selectedItem.weight} lb
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Toggle Controls */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-[#141414]/15">
              <button
                onClick={() => handleToggleEquip(selectedItem)}
                className={`flex-1 py-1 text-[9px] font-display uppercase tracking-wider border transition-all rounded flex items-center justify-center gap-1 cursor-pointer ${
                  selectedItem.equipped
                    ? 'border-[#1EB253] bg-[#1EB253]/15 text-[#1EB253] font-bold'
                    : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                }`}
              >
                <Shield size={11} /> {selectedItem.equipped ? 'Equipped' : 'Equip'}
              </button>

              <button
                onClick={() => handleToggleAttune(selectedItem)}
                className={`flex-1 py-1 text-[9px] font-display uppercase tracking-wider border transition-all rounded flex items-center justify-center gap-1 cursor-pointer ${
                  selectedItem.attuned
                    ? 'border-[#A855F7] bg-[#A855F7]/15 text-[#7C3AED] font-bold'
                    : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                }`}
              >
                <Sparkles size={11} /> {selectedItem.attuned ? 'Attuned' : 'Attune'}
              </button>

              <div className="flex items-center gap-1 border border-[#141414]/20 bg-[#fdfbf7] px-1.5 rounded">
                <button
                  onClick={() => updateInventoryItem(selectedItem.id, { quantity: Math.max(1, selectedItem.quantity - 1) })}
                  className="text-[#555555] hover:text-[#161616] cursor-pointer"
                >
                  <Minus size={10} />
                </button>
                <span className="font-mono text-xs text-[#161616] font-bold px-1">{selectedItem.quantity}</span>
                <button
                  onClick={() => updateInventoryItem(selectedItem.id, { quantity: selectedItem.quantity + 1 })}
                  className="text-[#555555] hover:text-[#161616] cursor-pointer"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Carry Weight Sub-bar (Procedural Sumi-e Dry-Brush) */}
        <div className="carry-weight-container mt-1 pt-2 border-t border-[#141414]/15">
          <div className="carry-weight-header">
            <span className="weight-label">CARRY WEIGHT</span>
            <span className="weight-numbers font-mono text-xs text-[#555555]">
              <strong className="text-[#1a1a1a] font-bold">{totalWeight.toFixed(1)}</strong> / {maxCarryWeight} lbs
            </span>
          </div>

          {/* Procedural Sumi-e Bar */}
          <div className="weight-bar-track">
            {/* Fill Width dynamically controlled via style="width: XX%" */}
            <div
              className="weight-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, weightPercentage))}%` }}
            >
              <svg className="brush-edge-tip" viewBox="0 0 16 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,0 C6,3 16,8 14,12 C12,16 6,18 0,20 Z" fill="currentColor" />
              </svg>
            </div>

            {/* Encumbrance Notches */}
            <div
              className="weight-notch notch-light"
              style={{ left: `${(encumberedWeight / maxCarryWeight) * 100}%` }}
              title={`Encumbered (${encumberedWeight} lbs)`}
            />
            <div
              className="weight-notch notch-heavy"
              style={{ left: '100%' }}
              title={`Max Capacity (${maxCarryWeight} lbs)`}
            />
          </div>

          <div className="carry-weight-footer font-display text-[9px] uppercase tracking-wider text-[#777777]">
            <span>LIGHT ({encumberedWeight} LBS)</span>
            <span>MAX ({maxCarryWeight} LBS)</span>
          </div>
        </div>
      </div>

      {/* 3. Currency & Ledger (2 on top, 3 on bottom) */}
      <div className="flex flex-col gap-3">
        <div className="ornament-divider opacity-40 mt-1 mb-1" />
        <TitleBanner
          title="Coins & Wealth"
          subtitle="Coinage Ledger"
          action={
            <button
              onClick={() => setIsLedgerOpen(!isLedgerOpen)}
              className="text-[10px] font-display uppercase tracking-wider text-[#1a1a1a] hover:text-[#000000] flex items-center gap-1 transition-colors bg-white/[0.92] hover:bg-white px-2 py-0.5 rounded border border-black/20 hover:border-[var(--accent-ink)] shadow-xs cursor-pointer font-bold"
            >
              {isLedgerOpen ? 'Hide Ledger' : 'View Ledger'}
              {isLedgerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          }
        />

        {/* Unified CRPG Currency Vault */}
        <div className="flex flex-col gap-1.5 bg-white/80 p-2.5 rounded-xl border border-[#141414]/15 shadow-sm">
          {[
            { key: 'gp' as const, label: 'GP', name: 'Gold', subtitle: 'Pieces', color: 'text-[#B45309]', icon: ASSET_MAP.currency.gp, border: 'border-[#F59E0B]/40 hover:border-[#F59E0B]' },
            { key: 'sp' as const, label: 'SP', name: 'Silver', subtitle: 'Pieces', color: 'text-[#475569]', icon: ASSET_MAP.currency.sp, border: 'border-[#94A3B8]/40 hover:border-[#475569]' },
            { key: 'cp' as const, label: 'CP', name: 'Copper', subtitle: 'Pieces', color: 'text-[#C2410C]', icon: ASSET_MAP.currency.cp, border: 'border-[#EA580C]/40 hover:border-[#EA580C]' },
            { key: 'ep' as const, label: 'EP', name: 'Electrum', subtitle: 'Pieces', color: 'text-[#D97706]', icon: ASSET_MAP.currency.ep, border: 'border-[#FBBF24]/40 hover:border-[#FBBF24]' },
            { key: 'pp' as const, label: 'PP', name: 'Platinum', subtitle: 'Pieces', color: 'text-[#2563EB]', icon: ASSET_MAP.currency.pp, border: 'border-[#93C5FD]/40 hover:border-[#2563EB]' },
          ].map((curr) => {
            const amount = character.currency[curr.key] ?? 0;
            return (
              <div
                key={curr.key}
                className={`flex items-center justify-between bg-white/90 border ${curr.border} px-2.5 py-1.5 rounded-lg transition-all select-none group shadow-xs gap-2`}
              >
                {/* Left: Coin Icon & Full Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform">
                    <img src={curr.icon} alt={curr.name} className="w-full h-full object-contain" draggable={false} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`font-sans text-xs font-bold uppercase tracking-wider ${curr.color}`}>
                        {curr.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#555555] font-bold px-1 py-0.2 bg-[#fdfbf7] rounded border border-[#141414]/15">
                        {curr.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans text-[#777777] leading-none">
                      {curr.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right: Currency Value & Steppers */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditMode ? (
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setCurrencyDirect(curr.key, parseInt(e.target.value, 10) || 0)}
                      className="font-mono text-[#161616] text-sm font-bold text-right w-14 bg-transparent border-b border-[#141414]/40 focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-[#161616] text-sm sm:text-base font-bold leading-none tabular-nums text-right" title={amount.toLocaleString()}>
                      {amount.toLocaleString()}
                    </span>
                  )}

                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCurrency(curr.key, -1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-[#fdfbf7] hover:bg-white border border-[#141414]/20 hover:border-black/40 text-[#161616] text-[10px] sm:text-xs font-mono font-bold rounded flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                      title={`Spend 1 ${curr.label}`}
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateCurrency(curr.key, 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-[#fdfbf7] hover:bg-white border border-[#141414]/20 hover:border-black/40 text-[#161616] text-[10px] sm:text-xs font-mono font-bold rounded flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                      title={`Add 1 ${curr.label}`}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable Transaction Ledger with Scrollable Zebra-Striped History */}
        {isLedgerOpen && (
          <div className="p-3.5 bg-white/95 border border-black/20 rounded-xl flex flex-col gap-2.5 shadow-lg animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
              <span className="text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-bold">
                Transaction Ledger
              </span>
              <span className="text-xs font-sans text-[#555555]">
                {(character.ledger || []).length} Recorded Entries
              </span>
            </div>

            {/* Non-Overflowing Record Transaction Form */}
            <form onSubmit={handleAddLedger} className="flex flex-col gap-2 bg-[#fdfbf7] p-2.5 border border-[#141414]/15 rounded-lg w-full box-border shadow-xs">
              <input
                type="text"
                placeholder="Transaction memo (e.g. Tavern bill, Dungeon loot)..."
                value={ledgerDesc}
                onChange={(e) => setLedgerDesc(e.target.value)}
                className="w-full bg-transparent border-b border-[#141414]/20 text-xs sm:text-sm text-[#161616] focus:outline-none focus:border-[var(--accent-ink)] px-1 py-1 font-sans"
                required
              />
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <input
                  type="number"
                  placeholder="Amount"
                  value={ledgerAmt}
                  onChange={(e) => setLedgerAmt(e.target.value)}
                  className="w-full min-w-0 bg-white border border-[#141414]/20 text-xs sm:text-sm text-[var(--accent-ink)] focus:outline-none focus:border-[var(--accent-ink)] px-1.5 py-1 font-mono font-bold rounded text-center"
                  required
                />
                <select
                  value={ledgerCurr}
                  onChange={(e) => setLedgerCurr(e.target.value as 'cp' | 'sp' | 'ep' | 'gp' | 'pp')}
                  className="w-full min-w-0 bg-white border border-[#141414]/20 text-xs text-[#161616] focus:outline-none focus:border-[var(--accent-ink)] px-1 py-1 uppercase font-display font-semibold rounded text-center"
                >
                  <option value="gp">GP</option>
                  <option value="sp">SP</option>
                  <option value="cp">CP</option>
                  <option value="ep">EP</option>
                  <option value="pp">PP</option>
                </select>
                <select
                  value={ledgerType}
                  onChange={(e) => setLedgerType(e.target.value as 'income' | 'expense')}
                  className="w-full min-w-0 bg-white border border-[#141414]/20 text-xs text-[#161616] focus:outline-none focus:border-[var(--accent-ink)] px-1 py-1 uppercase font-display font-semibold rounded text-center"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-1 w-full text-xs font-display font-bold tracking-wider uppercase bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white py-2 rounded-xs transition-all shadow-xs cursor-pointer"
              >
                + Record Entry
              </button>
            </form>

            {/* Scrollable Zebra-Striped History List */}
            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto custom-scrollbar text-xs font-serif text-[#555555] pr-1">
              {character.ledger && character.ledger.length > 0 ? (
                character.ledger.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className={`flex justify-between items-center px-2.5 py-1.5 rounded border border-[#141414]/10 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf7]'
                    }`}
                  >
                    <span className="truncate max-w-[170px] text-[#161616] font-medium text-xs">
                      {entry.description}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        entry.type === 'expense'
                          ? 'bg-[#fed7d7] text-[#c53030] border border-[#feb2b2]'
                          : 'bg-[#c6f6d5] text-[#276749] border border-[#9ae6b4]'
                      }`}
                    >
                      {entry.type === 'expense' ? '-' : '+'}
                      {entry.amount.toLocaleString()} {entry.currency.toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-[#777777] italic text-xs">
                  No recorded transactions yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
      </FramedPanel>

      {/* Inventory Item Icon Picker Modal */}
      <IconPickerModal
        isOpen={Boolean(iconPickerItem)}
        onClose={() => setIconPickerItem(null)}
        initialCategory={iconPickerItem?.type === 'weapon' ? 'weapon' : iconPickerItem?.type === 'armor' ? 'armor' : iconPickerItem?.type === 'consumable' ? 'consumable' : 'all'}
        itemName={iconPickerItem?.name}
        onSelectIcon={(iconUrl) => {
          if (iconPickerItem) {
            updateInventoryItem(iconPickerItem.id, { iconUrl });
          }
          setIconPickerItem(null);
        }}
      />
    </aside>
  );
}
