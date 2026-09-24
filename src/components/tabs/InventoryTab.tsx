import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { useCampaignStore } from '../../store/campaignStore';
import { Frame } from '../ui';
import { requestRoll } from '../dice/rollBus';
import { 
  Package, 
  Swords, 
  Shield, 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  ArrowRightLeft, 
  Coins, 
  ShoppingBag, 
  Archive, 
  Check, 
  Share2, 
  Download, 
  Upload,
  Layers,
  DollarSign
} from 'lucide-react';
import { Item } from '../../types';
import { SharedItem, CurrencyType } from '../../types/campaign';
import { getItemIcon, GameItemIcon } from '../ui/GameIcons';
import { IconPickerModal } from '../common/IconPickerModal';

export function InventoryTab() {
  const {
    character,
    updateInventoryItem,
    addInventoryItem,
    deleteInventoryItem,
    toggleReadyWeapon,
    getReadiedWeaponsCount,
    setArmoryOpen,
    updateCurrency,
    isEditMode
  } = useStore();

  const {
    getActiveCampaign,
    addToPartyStash,
    removeFromPartyStash,
    transferPersonalItemToPartyStash,
    contributeToPartyTreasury,
    withdrawFromPartyTreasury,
    makePartyPurchase
  } = useCampaignStore();

  const activeCampaign = getActiveCampaign();
  const partyTreasury = activeCampaign?.treasury;
  const partyStash = activeCampaign?.sharedInventory || [];
  const partyLedger = partyTreasury?.ledger || [];

  const [viewMode, setViewMode] = useState<'personal' | 'party'>('personal');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [stashFilter, setStashFilter] = useState('All');

  // Modals / forms
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingPartyItem, setIsAddingPartyItem] = useState(false);
  const [isPartyPurchaseModalOpen, setIsPartyPurchaseModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<Item['type']>('gear');
  const [newItemRarity, setNewItemRarity] = useState<Item['rarity']>('Common');
  const [newItemWeight, setNewItemWeight] = useState('1');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemDamage, setNewItemDamage] = useState('');
  const [newItemRange, setNewItemRange] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemReqAttune, setNewItemReqAttune] = useState(false);
  const [newItemHolder, setNewItemHolder] = useState('Bag of Holding');
  const [iconPickerItem, setIconPickerItem] = useState<Item | null>(null);

  // Treasury Form state
  const [txAmount, setTxAmount] = useState('10');
  const [txCurrency, setTxCurrency] = useState<CurrencyType>('gp');
  const [txReason, setTxReason] = useState('');
  const [purchaseItemName, setPurchaseItemName] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('25');
  const [purchaseCurrency, setPurchaseCurrency] = useState<CurrencyType>('gp');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 2500);
  };

  const readiedWeaponsCount = getReadiedWeaponsCount();
  const attunedItems = character.inventory.filter((i) => i.attuned);
  const attunedCount = attunedItems.length;

  const totalWeight = character.inventory.reduce(
    (sum, item) => sum + (item.weight || 0) * (item.quantity || 1),
    0
  );
  const strScore = character.abilities.str.score;
  const maxCarryWeight = strScore * 15;
  const encumberedWeight = strScore * 5;
  const weightPercentage = Math.min(100, Math.round((totalWeight / maxCarryWeight) * 100));

  const getFilteredInventory = () => {
    let list = character.inventory || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }

    if (filter === 'Weapons') list = list.filter((i) => i.type === 'weapon');
    else if (filter === 'Armor') list = list.filter((i) => i.type === 'armor');
    else if (filter === 'Magic') list = list.filter((i) => i.type === 'magic' || i.rarity !== 'Common');
    else if (filter === 'Consumables') list = list.filter((i) => i.type === 'consumable');
    else if (filter === 'Readied') list = list.filter((i) => i.isReadiedInCombat);
    else if (filter === 'Attuned') list = list.filter((i) => i.attuned);

    return list;
  };

  const getFilteredPartyStash = () => {
    let list = partyStash;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.holder.toLowerCase().includes(q)
      );
    }
    if (stashFilter !== 'All') {
      list = list.filter((i) => i.holder === stashFilter);
    }
    return list;
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (viewMode === 'party') {
      addToPartyStash(
        {
          name: newItemName.trim(),
          type: newItemType,
          rarity: newItemRarity,
          weight: parseFloat(newItemWeight) || 0,
          quantity: parseInt(newItemQty, 10) || 1,
          description: newItemDesc.trim()
        },
        newItemHolder,
        character.name
      );
      showStatus(`Added ${newItemName} to Party Stash (${newItemHolder})`);
      setIsAddingPartyItem(false);
    } else {
      addInventoryItem({
        name: newItemName.trim(),
        type: newItemType,
        rarity: newItemRarity,
        weight: parseFloat(newItemWeight) || 0,
        quantity: parseInt(newItemQty, 10) || 1,
        damageDice: newItemDamage || undefined,
        range: newItemRange || undefined,
        description: newItemDesc.trim(),
        requiresAttunement: newItemReqAttune,
        attuned: false,
        equipped: newItemType === 'weapon' || newItemType === 'armor',
        isReadiedInCombat: false
      });
      showStatus(`Added ${newItemName} to Personal Backpack`);
      setIsAddingItem(false);
    }

    setNewItemName('');
    setNewItemDesc('');
    setNewItemDamage('');
    setNewItemRange('');
  };

  const handleTransferToPartyStash = (item: Item) => {
    transferPersonalItemToPartyStash(item, character.name, 'Bag of Holding');
    deleteInventoryItem(item.id);
    showStatus(`Transferred ${item.name} to Party Stash (Bag of Holding)`);
  };

  const handleClaimFromPartyStash = (sharedItem: SharedItem) => {
    addInventoryItem({
      name: sharedItem.name,
      description: sharedItem.description,
      weight: sharedItem.weight,
      quantity: sharedItem.quantity,
      rarity: sharedItem.rarity,
      type: sharedItem.type,
      iconUrl: sharedItem.iconUrl
    });
    removeFromPartyStash(sharedItem.id);
    showStatus(`Claimed ${sharedItem.name} into personal backpack!`);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(txAmount, 10) || 0;
    if (amount <= 0) return;
    if ((character.currency[txCurrency] || 0) < amount) {
      showStatus(`Not enough ${txCurrency.toUpperCase()} in personal purse!`);
      return;
    }

    updateCurrency(txCurrency, -amount);
    contributeToPartyTreasury(amount, txCurrency, character.name);
    showStatus(`Deposited ${amount} ${txCurrency.toUpperCase()} into Party Treasury`);
    setIsDepositModalOpen(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(txAmount, 10) || 0;
    if (amount <= 0) return;

    const success = withdrawFromPartyTreasury(amount, txCurrency, character.name, txReason);
    if (!success) {
      showStatus(`Not enough ${txCurrency.toUpperCase()} in Party Treasury!`);
      return;
    }

    updateCurrency(txCurrency, amount);
    showStatus(`Withdrew ${amount} ${txCurrency.toUpperCase()} into personal purse`);
    setIsWithdrawModalOpen(false);
    setTxReason('');
  };

  const handlePartyPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(purchaseCost, 10) || 0;
    if (cost <= 0 || !purchaseItemName.trim()) return;

    const success = makePartyPurchase(character.name, purchaseItemName.trim(), cost, purchaseCurrency);
    if (!success) {
      showStatus(`Party Treasury has insufficient ${purchaseCurrency.toUpperCase()} for this purchase!`);
      return;
    }

    showStatus(`Purchased "${purchaseItemName}" using Party Treasury funds!`);
    setIsPartyPurchaseModalOpen(false);
    setPurchaseItemName('');
  };

  const filteredItems = getFilteredInventory();
  const filteredPartyStash = getFilteredPartyStash();

  return (
    <div className="flex flex-col gap-6 pointer-events-auto pb-10 select-none">
      
      {/* 0. Top View Mode Switcher: Personal Backpack vs Shared Party Stash */}
      <div className="flex items-center justify-between p-2 bg-white/80 border border-[#141414]/15 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('personal')}
            style={viewMode === 'personal' ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
            className={`px-4 py-2 font-display text-xs tracking-wider uppercase font-bold rounded flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'personal'
                ? 'text-white shadow-sm'
                : 'text-[#555555] hover:text-[#161616] hover:bg-black/5'
            }`}
          >
            <Package size={15} />
            <span>Personal Backpack</span>
          </button>

          <button
            onClick={() => setViewMode('party')}
            style={viewMode === 'party' ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
            className={`px-4 py-2 font-display text-xs tracking-wider uppercase font-bold rounded flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'party'
                ? 'text-white shadow-sm'
                : 'text-[#555555] hover:text-[#161616] hover:bg-black/5'
            }`}
          >
            <Archive size={15} />
            <span>Party Stash & Treasury</span>
            {partyStash.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fdfbf7] text-[#1a1a1a] border border-black/20 font-bold">
                {partyStash.length}
              </span>
            )}
          </button>
        </div>

        {/* Campaign indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-serif text-[#555555]">
          <span className="text-[#1a1a1a] font-bold">Campaign:</span>
          <span className="text-[#161616] font-medium truncate max-w-[200px]">
            {activeCampaign?.title || 'Standalone Adventure'}
          </span>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 bg-[#c6f6d5] border border-[#9ae6b4] text-[#276749] text-xs rounded-md flex items-center gap-2 shadow-sm font-medium">
          <Check size={16} />
          <span>{statusNotice}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* VIEW 1: PERSONAL BACKPACK */}
        {viewMode === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Inventory Summary Header */}
            <Frame title="FULL ARSENAL & PERSONAL GEAR">
            <div className="flex flex-col gap-4 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-serif text-[#555555]">
                    Manage weapons, equipped armor, attuned magic items, and personal coins.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setArmoryOpen(true)}
                    className="px-3.5 py-1.5 rounded-xs border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] text-xs font-display uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Swords size={14} />
                    <span>Armory Drawer</span>
                  </button>

                  <button
                    onClick={() => setIsAddingItem(true)}
                    className="px-3.5 py-1.5 rounded-xs border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:bg-white hover:text-[#000000] text-xs font-display uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards + Encumbrance Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#141414]/15">
                
                {/* Readied Weapons */}
                <div className="flex flex-col items-center bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm">
                  <span className="text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
                    Weapons Readied for Combat
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--accent-ink)]">
                      {readiedWeaponsCount}
                    </span>
                    <span className="font-serif text-xs text-[#555555]">/ 4 Max</span>
                  </div>
                </div>

                {/* Attuned Magic Items */}
                <div className="flex flex-col bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
                      Attuned Items
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-base font-bold text-[#161616]">
                        {attunedCount}
                      </span>
                      <span className="font-serif text-[10px] text-[#555555]">/ 3 Max</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#141414]/10">
                    {[0, 1, 2].map((slotIdx) => {
                      const attunedItem = attunedItems[slotIdx];
                      return attunedItem ? (
                        <div
                          key={attunedItem.id}
                          className="flex items-center gap-1.5 bg-white border border-[#a855f7]/40 shadow-sm p-1 rounded transition-all flex-1 min-w-0 group/attune select-none"
                          title={`${attunedItem.name} (Attuned)`}
                        >
                          <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-[2px] pointer-events-none group-hover/attune:bg-purple-500/40" />
                            <GameItemIcon item={attunedItem} size={22} className="relative z-10" />
                          </div>
                          <span className="text-[11px] font-serif text-[#161616] group-hover/attune:text-[#a855f7] truncate font-medium">
                            {attunedItem.name}
                          </span>
                        </div>
                      ) : (
                        <div
                          key={`empty-attune-${slotIdx}`}
                          className="flex items-center justify-center bg-white/50 border border-dashed border-[#141414]/20 hover:border-[#a855f7]/40 p-1 rounded flex-1 text-[10px] text-[#777777] font-mono h-[30px] transition-colors"
                        >
                          Empty
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Carrying Capacity */}
                <div className="flex flex-col justify-center bg-white/90 p-2.5 rounded border border-[#141414]/15 shadow-sm gap-1">
                  <div className="flex justify-between items-center text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold">
                    <span>Carrying Weight</span>
                    <span className="text-[#161616] font-mono font-bold">
                      {totalWeight.toFixed(1)} / {maxCarryWeight} lbs
                    </span>
                  </div>
                  <div className="w-full bg-[#eae5dc] h-2 rounded overflow-hidden border border-[#141414]/15">
                    <div
                      className={`h-full transition-all duration-300 ${
                        totalWeight > maxCarryWeight
                          ? 'bg-[#E33526]'
                          : totalWeight > encumberedWeight
                          ? 'bg-[var(--accent-ink)]'
                          : 'bg-[#1EB253]'
                      }`}
                      style={{ width: `${weightPercentage}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </Frame>

          {/* Search & Filter Bar */}
          <Frame title="SEARCH & FILTER VAULT">
            <div className="flex flex-col gap-3 p-2 sm:p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  placeholder="Search items by name, category, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/90 border border-[#141414]/20 pl-9 pr-3 py-2 text-[#161616] placeholder:text-[#888888] focus:outline-none focus:border-[var(--accent-ink)] font-serif text-sm rounded shadow-xs"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {[
                  'All',
                  'Weapons',
                  'Armor',
                  'Readied',
                  'Magic',
                  'Attuned',
                  'Consumables'
                ].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={filter === f ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                    className={`spell-filter-tab whitespace-nowrap px-3 py-1 text-[10px] uppercase tracking-wider font-display border transition-all rounded-xs cursor-pointer ${
                      filter === f
                        ? 'text-white font-bold shadow-xs'
                        : 'border-[#141414]/15 text-[#4a4a4a] bg-transparent hover:border-black/25 hover:text-[#161616]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Frame>

          {/* Personal Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const rarity = item.rarity?.toLowerCase() || 'common';
              let rarityBorder = 'border-[#141414]/15 hover:border-[var(--accent-ink)]';
              let rarityBadge = 'bg-white text-[#555555] border-[#141414]/20';
              if (rarity === 'uncommon') {
                rarityBorder = 'border-[#22C55E]/40 hover:border-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.15)]';
                rarityBadge = 'bg-[#22C55E]/15 text-[#276749] border-[#22C55E]/40';
              } else if (rarity === 'rare') {
                rarityBorder = 'border-[#3B82F6]/50 hover:border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.2)]';
                rarityBadge = 'bg-[#3B82F6]/15 text-[#2563EB] border-[#3B82F6]/40';
              } else if (rarity === 'very rare') {
                rarityBorder = 'border-[#A855F7]/50 hover:border-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.25)]';
                rarityBadge = 'bg-[#A855F7]/15 text-[#7C3AED] border-[#A855F7]/40';
              } else if (rarity === 'legendary') {
                rarityBorder = 'border-[#F59E0B]/60 hover:border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.3)]';
                rarityBadge = 'bg-[#F59E0B]/15 text-[#B45309] border-[#F59E0B]/40';
              } else if (rarity === 'artifact') {
                rarityBorder = 'border-[#EF4444]/70 hover:border-[#EF4444] shadow-[0_0_14px_rgba(239,68,68,0.35)]';
                rarityBadge = 'bg-[#EF4444]/15 text-[#DC2626] border-[#EF4444]/40';
              }

              return (
                <div
                  key={item.id}
                  className={`bg-white/85 border ${rarityBorder} p-3.5 rounded-lg flex flex-col justify-between gap-3 shadow-sm hover:shadow-md group transition-all text-[#161616]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setIconPickerItem(item)}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        title="Click to customize icon"
                      >
                        <GameItemIcon item={item} size={36} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-bold text-[#161616] group-hover:text-[var(--accent-ink)] uppercase tracking-wider transition-colors">
                            {item.name}
                          </h4>
                          <span className={`px-1.5 py-0.2 text-[9px] font-display uppercase tracking-wider rounded border ${rarityBadge}`}>
                            {item.rarity || 'Common'}
                          </span>
                        </div>
                        <span className="text-xs font-serif text-[#555555]">
                          {item.type.toUpperCase()} • {item.weight} lbs (x{item.quantity})
                        </span>
                      </div>
                    </div>

                  <div className="flex items-center gap-1.5">
                    {item.type === 'weapon' && (
                      <button
                        onClick={() => toggleReadyWeapon(item.id)}
                        style={item.isReadiedInCombat ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                        className={`px-2.5 py-1 text-[10px] font-display uppercase tracking-wider rounded-xs border transition-all cursor-pointer ${
                          item.isReadiedInCombat
                            ? 'text-white font-bold shadow-xs'
                            : 'bg-white/[0.92] text-[#555555] border-[#141414]/20 hover:text-[#161616] hover:border-[var(--accent-ink)]'
                        }`}
                        title="Toggle ready weapon in Combat HUD"
                      >
                        {item.isReadiedInCombat ? 'Readied' : 'Ready'}
                      </button>
                    )}

                    <button
                      onClick={() => handleTransferToPartyStash(item)}
                      className="p-1.5 text-[#555555] hover:text-[var(--accent-ink)] hover:bg-black/5 rounded transition-colors cursor-pointer"
                      title="Send to Party Stash (Bag of Holding)"
                    >
                      <Share2 size={14} />
                    </button>

                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      className="p-1.5 text-[#555555] hover:text-[#E53E3E] hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs font-serif text-[#555555] bg-[#fdfbf7] p-2 rounded border border-[#141414]/10 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.damageDice && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-ink)] font-bold">
                    <span>Damage: {item.damageDice} {item.damageType || ''}</span>
                    {item.range && <span>• Range: {item.range}</span>}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* VIEW 2: PARTY STASH & SHARED TREASURY */}
      {viewMode === 'party' && (
        <motion.div
          key="party"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex flex-col gap-6 w-full"
        >
          {/* Party Treasury Chest */}
          <Frame title="SHARED PARTY TREASURY & COINAGE">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                    Party Wealth Chest
                  </h3>
                  <p className="font-serif text-xs text-[#555555]">
                    Shared coins used for group provisions, inn stays, resurrections, and inter-party purchases.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 py-1.5 bg-white/[0.92] hover:bg-white text-[#1a1a1a] border border-black/20 hover:border-[var(--accent-ink)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Contribute Gold</span>
                  </button>

                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-white text-[#161616] border border-[#141414]/20 hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Withdraw</span>
                  </button>

                  <button
                    onClick={() => setIsPartyPurchaseModalOpen(true)}
                    className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] text-white font-display text-xs uppercase tracking-wider font-bold rounded-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:drop-shadow-[0_0_6px_var(--accent-glow)]"
                  >
                    <ShoppingBag size={13} />
                    <span>Party Purchase</span>
                  </button>
                </div>
              </div>

              {/* Currency Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#141414]/15">
                <div className="p-2.5 bg-white/90 border border-[#141414]/15 rounded text-center shadow-xs">
                  <span className="text-[10px] font-display uppercase text-[#2563EB] font-bold">Platinum (PP)</span>
                  <div className="font-mono text-lg font-bold text-[#161616] mt-0.5">
                    {partyTreasury?.pp || 0}
                  </div>
                </div>

                <div className="p-2.5 bg-white/90 border border-black/20 rounded text-center shadow-xs">
                  <span className="text-[10px] font-display uppercase text-[#B45309] font-bold">Gold (GP)</span>
                  <div className="font-mono text-lg font-bold text-[var(--accent-ink)] mt-0.5">
                    {partyTreasury?.gp || 0}
                  </div>
                </div>

                <div className="p-2.5 bg-white/90 border border-[#141414]/15 rounded text-center shadow-xs">
                  <span className="text-[10px] font-display uppercase text-[#D97706] font-bold">Electrum (EP)</span>
                  <div className="font-mono text-lg font-bold text-[#161616] mt-0.5">
                    {partyTreasury?.ep || 0}
                  </div>
                </div>

                <div className="p-2.5 bg-white/90 border border-[#141414]/15 rounded text-center shadow-xs">
                  <span className="text-[10px] font-display uppercase text-[#475569] font-bold">Silver (SP)</span>
                  <div className="font-mono text-lg font-bold text-[#161616] mt-0.5">
                    {partyTreasury?.sp || 0}
                  </div>
                </div>

                <div className="p-2.5 bg-white/90 border border-[#141414]/15 rounded text-center shadow-xs">
                  <span className="text-[10px] font-display uppercase text-[#C2410C] font-bold">Copper (CP)</span>
                  <div className="font-mono text-lg font-bold text-[#161616] mt-0.5">
                    {partyTreasury?.cp || 0}
                  </div>
                </div>
              </div>
            </div>
          </Frame>

          {/* Party Stash Items (Bag of Holding / Wagon) */}
          <Frame title="PARTY STASH & BAG OF HOLDING">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['All', 'Bag of Holding', 'Party Wagon', 'Unassigned'].map(holderName => (
                    <button
                      key={holderName}
                      onClick={() => setStashFilter(holderName)}
                      style={stashFilter === holderName ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                      className={`spell-filter-tab px-3 py-1 text-xs font-display uppercase tracking-wider rounded-xs border transition-all cursor-pointer ${
                        stashFilter === holderName
                          ? 'text-white font-bold shadow-xs'
                          : 'border-[#141414]/15 bg-white/80 text-[#555555] hover:text-[#161616] hover:border-black/30'
                      }`}
                    >
                      {holderName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddingPartyItem(true)}
                  className="px-3 py-1.5 bg-white/[0.92] hover:bg-white text-[#1a1a1a] border border-black/20 hover:border-[var(--accent-ink)] rounded-xs text-xs font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer font-bold"
                >
                  <Plus size={13} />
                  <span>Add to Stash</span>
                </button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPartyStash.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/85 border border-[#141414]/15 hover:border-[var(--accent-ink)] p-3.5 rounded-lg flex flex-col justify-between gap-3 shadow-sm group transition-all text-[#161616]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <GameItemIcon item={item} size={36} />
                        <div>
                          <h4 className="font-display text-sm font-bold text-[#161616] group-hover:text-[var(--accent-ink)] uppercase tracking-wider transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-xs font-serif text-[#555555]">
                            {item.rarity} {item.type} • {item.weight} lbs (x{item.quantity}) • <span className="text-[var(--accent-ink)] font-bold">{item.holder}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleClaimFromPartyStash(item)}
                          className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] text-white font-display text-[10px] uppercase font-bold tracking-wider rounded-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all hover:drop-shadow-[0_0_6px_var(--accent-glow)]"
                          title="Claim this item into personal backpack"
                        >
                          <Download size={12} />
                          <span>Take</span>
                        </button>

                        <button
                          onClick={() => removeFromPartyStash(item.id)}
                          className="p-1.5 text-[#555555] hover:text-[#E53E3E] hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPartyStash.length === 0 && (
                <div className="text-center py-10 text-[#777777] font-serif text-sm italic">
                  No items found in {stashFilter === 'All' ? 'the party stash' : stashFilter}.
                </div>
              )}
            </div>
          </Frame>

          {/* Party Transaction Ledger History */}
          <Frame title="CAMPAIGN TREASURY LOG">
            <div className="p-4 flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {partyLedger.length === 0 && (
                <p className="text-xs font-serif text-[#777777] italic text-center py-4">No treasury transactions recorded yet.</p>
              )}
              {partyLedger.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-white/70 border border-[#141414]/10 text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#161616]">{entry.actor} — {entry.description || entry.type.toUpperCase()}</span>
                    <span className="text-[10px] text-[#777777] font-sans">{new Date(entry.date).toLocaleString()}</span>
                  </div>
                  <div className="font-mono font-bold text-[var(--accent-ink)]">
                    {entry.type === 'contribution' || entry.type === 'reward' ? '+' : '-'}{entry.amount} {entry.currency.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </Frame>

        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL: ADD ITEM (PERSONAL OR PARTY) */}
      {(isAddingItem || isAddingPartyItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 border-2 border-black/30 rounded-xl p-5 w-full max-w-lg shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                {isAddingPartyItem ? 'Add Item to Party Stash' : 'Add Item to Personal Backpack'}
              </h3>
              <button onClick={() => { setIsAddingItem(false); setIsAddingPartyItem(false); }} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Dwarven Sun Shield"
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Item Type</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as Item['type'])}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                  >
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="consumable">Consumable</option>
                    <option value="magic">Magic Item</option>
                    <option value="gear">Gear & Tools</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Rarity</label>
                  <select
                    value={newItemRarity}
                    onChange={(e) => setNewItemRarity(e.target.value as Item['rarity'])}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
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

              {isAddingPartyItem && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Party Container / Holder</label>
                  <select
                    value={newItemHolder}
                    onChange={(e) => setNewItemHolder(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)]"
                  >
                    <option value="Bag of Holding">Bag of Holding</option>
                    <option value="Party Wagon">Party Wagon / Mount</option>
                    <option value="Shared Vault">Shared Vault</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Quantity</label>
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono focus:outline-none focus:border-[var(--accent-ink)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Description</label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  rows={3}
                  placeholder="Enter item description..."
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif focus:outline-none focus:border-[var(--accent-ink)] resize-none"
                />
              </div>

              <div className="border-t border-[#141414]/15 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingItem(false); setIsAddingPartyItem(false); }}
                  className="px-4 py-1.5 border border-[#141414]/20 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] text-white text-xs font-display uppercase tracking-wider font-bold hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] cursor-pointer shadow-xs rounded-xs transition-all"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT GOLD */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Contribute to Party Treasury
              </h3>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono text-sm focus:border-[var(--accent-ink)] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Currency</label>
                <select
                  value={txCurrency}
                  onChange={e => setTxCurrency(e.target.value as CurrencyType)}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                >
                  <option value="gp">Gold Pieces (GP) - Have {character.currency.gp}</option>
                  <option value="sp">Silver Pieces (SP) - Have {character.currency.sp}</option>
                  <option value="pp">Platinum Pieces (PP) - Have {character.currency.pp}</option>
                  <option value="cp">Copper Pieces (CP) - Have {character.currency.cp}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-3 py-1.5 border border-[#141414]/20 text-xs font-display uppercase text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase font-bold rounded-xs cursor-pointer shadow-xs transition-all"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW GOLD */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 border-2 border-black/30 rounded-xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Withdraw from Party Treasury
              </h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono text-sm focus:border-[var(--accent-ink)] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Currency</label>
                <select
                  value={txCurrency}
                  onChange={e => setTxCurrency(e.target.value as CurrencyType)}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                >
                  <option value="gp">Gold Pieces (GP) - Party has {partyTreasury?.gp || 0}</option>
                  <option value="sp">Silver Pieces (SP) - Party has {partyTreasury?.sp || 0}</option>
                  <option value="pp">Platinum Pieces (PP) - Party has {partyTreasury?.pp || 0}</option>
                  <option value="cp">Copper Pieces (CP) - Party has {partyTreasury?.cp || 0}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Reason / Purpose</label>
                <input
                  type="text"
                  value={txReason}
                  onChange={e => setTxReason(e.target.value)}
                  placeholder="e.g. Bought alchemical reagents for party"
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-3 py-1.5 border border-[#141414]/20 text-xs font-display uppercase text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase font-bold rounded-xs cursor-pointer shadow-xs transition-all"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PARTY PURCHASE */}
      {isPartyPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 border-2 border-black/30 rounded-xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Make Party Purchase
              </h3>
              <button onClick={() => setIsPartyPurchaseModalOpen(false)} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePartyPurchaseSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Item or Service Description</label>
                <input
                  type="text"
                  required
                  value={purchaseItemName}
                  onChange={e => setPurchaseItemName(e.target.value)}
                  placeholder="e.g. 4x Riding Horses & Stabling"
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Total Cost</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={purchaseCost}
                    onChange={e => setPurchaseCost(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-mono text-sm focus:border-[var(--accent-ink)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Currency</label>
                  <select
                    value={purchaseCurrency}
                    onChange={e => setPurchaseCurrency(e.target.value as CurrencyType)}
                    className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                  >
                    <option value="gp">Gold Pieces (GP)</option>
                    <option value="sp">Silver Pieces (SP)</option>
                    <option value="pp">Platinum Pieces (PP)</option>
                  </select>
                </div>
              </div>

              <p className="font-serif text-[11px] text-[#555555]">
                This will deduct funds directly from the Party Treasury and create an entry in the campaign transaction ledger.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsPartyPurchaseModalOpen(false)}
                  className="px-3 py-1.5 border border-[#141414]/20 text-xs font-display uppercase text-[#555555] hover:text-[#161616] cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase font-bold rounded-xs cursor-pointer shadow-xs transition-all"
                >
                  Complete Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Icon Vault Picker Modal */}
      {iconPickerItem && (
        <IconPickerModal
          isOpen={!!iconPickerItem}
          onClose={() => setIconPickerItem(null)}
          currentItemName={iconPickerItem.name}
          category={iconPickerItem.type}
          onSelectIcon={(iconUrl) => {
            updateInventoryItem(iconPickerItem.id, { iconUrl });
            setIconPickerItem(null);
          }}
        />
      )}

    </div>
  );
}
