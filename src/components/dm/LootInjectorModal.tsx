import React, { useState } from 'react';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { SRD_WEAPONS_CATALOG } from '../../data/srdWeapons';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { X, Sparkles, Gift, Coins, Shield, Swords, Check } from 'lucide-react';
import { CurrencyType } from '../../types/campaign';
import { Item, Rarity } from '../../types';

interface LootInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientId?: string;
}

export function LootInjectorModal({
  isOpen,
  onClose,
  defaultRecipientId
}: LootInjectorModalProps) {
  const { getActiveCampaign, addToPartyStash, contributeToPartyTreasury } = useCampaignStore();
  const { character, addInventoryItem, updateCurrency, addLedgerEntry } = useStore();
  const campaign = getActiveCampaign();

  const [recipient, setRecipient] = useState<string>(defaultRecipientId || 'party_stash');
  const [lootType, setLootType] = useState<'item' | 'currency'>('item');
  const [itemSource, setItemSource] = useState<'custom' | 'srd'>('custom');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<Item['type']>('weapon');
  const [itemRarity, setItemRarity] = useState<Rarity>('Rare');
  const [itemDesc, setItemDesc] = useState('');
  const [itemDamage, setItemDamage] = useState('1d8+2');
  const [itemWeight, setItemWeight] = useState('2');
  const [selectedSrdWeapon, setSelectedSrdWeapon] = useState(SRD_WEAPONS_CATALOG[0]?.name || '');

  // Currency form
  const [coinAmount, setCoinAmount] = useState('250');
  const [coinType, setCoinType] = useState<CurrencyType>('gp');
  const [rewardNote, setRewardNote] = useState('Dungeon boss reward');

  const [injectedNotice, setInjectedNotice] = useState(false);

  if (!isOpen) return null;

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();

    if (lootType === 'item') {
      const isSrd = itemSource === 'srd';
      const srdMatch = SRD_WEAPONS_CATALOG.find(w => w.name === selectedSrdWeapon);

      const resolvedItem: Partial<Item> = isSrd && srdMatch ? {
        name: srdMatch.name,
        type: 'weapon',
        rarity: 'Common',
        damageDice: srdMatch.damageDice,
        damageType: srdMatch.damageType,
        range: srdMatch.range,
        description: srdMatch.properties.join(', '),
        weight: srdMatch.weight,
        quantity: 1
      } : {
        name: itemName.trim() || 'Enchanted Blade',
        type: itemType,
        rarity: itemRarity,
        damageDice: itemType === 'weapon' ? itemDamage : undefined,
        description: itemDesc.trim(),
        weight: parseFloat(itemWeight) || 1,
        quantity: 1
      };

      if (recipient === 'party_stash') {
        addToPartyStash(resolvedItem, 'Bag of Holding', 'DM Reward');
      } else {
        // Direct to active player sheet if recipient matches
        addInventoryItem(resolvedItem);
      }
    } else {
      // Currency injection
      const amount = parseInt(coinAmount, 10) || 0;
      if (amount <= 0) return;

      if (recipient === 'party_stash') {
        contributeToPartyTreasury(amount, coinType, 'Dungeon Master Reward');
      } else {
        updateCurrency(coinType, amount);
        addLedgerEntry({
          description: `DM Loot Injection: ${rewardNote}`,
          amount,
          currency: coinType,
          type: 'income'
        });
      }
    }

    setInjectedNotice(true);
    setTimeout(() => {
      setInjectedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 relative overflow-hidden text-[#161616]">

        <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <Gift size={16} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
              Direct Vault Oversight & Loot Injector
            </h3>
          </div>
          <button onClick={onClose} className="text-[#777777] hover:text-[#161616] p-1 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {injectedNotice ? (
          <div className="p-6 text-center flex flex-col items-center gap-2 bg-[#1EB253]/15 border border-[#1EB253]/40 rounded-lg text-[#1EB253]">
            <Check size={32} />
            <span className="font-display text-sm uppercase tracking-wider font-bold">
              Loot Successfully Injected!
            </span>
          </div>
        ) : (
          <form onSubmit={handleInject} className="flex flex-col gap-3">
            
            {/* Recipient Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Inject Loot Target</label>
              <select
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none transition-colors"
              >
                <option value="party_stash">Shared Party Stash (Bag of Holding / Treasury)</option>
                <option value="active_hero">{character.name} (Active Hero Character Sheet)</option>
                {campaign?.party.filter(p => p.name !== character.name).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.class} Lv.{p.level})</option>
                ))}
              </select>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLootType('item')}
                className={`py-2 text-xs font-display uppercase tracking-wider font-bold rounded-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lootType === 'item'
                    ? 'bg-[#1c1c1c] text-white border-black'
                    : 'bg-white text-[#555555] border-[#141414]/20 hover:border-black/40'
                }`}
              >
                <Swords size={13} className={lootType === 'item' ? 'text-[var(--accent-ink)]' : ''} />
                <span>Magic Item / Weapon</span>
              </button>

              <button
                type="button"
                onClick={() => setLootType('currency')}
                className={`py-2 text-xs font-display uppercase tracking-wider font-bold rounded-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lootType === 'currency'
                    ? 'bg-[#1c1c1c] text-white border-black'
                    : 'bg-white text-[#555555] border-[#141414]/20 hover:border-black/40'
                }`}
              >
                <Coins size={13} className={lootType === 'currency' ? 'text-[var(--accent-ink)]' : ''} />
                <span>Coinage / Gold Bounty</span>
              </button>
            </div>

            {lootType === 'item' ? (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-4 text-xs font-serif text-[#555555]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="itemSource"
                      checked={itemSource === 'custom'}
                      onChange={() => setItemSource('custom')}
                      className="accent-[var(--accent-ink)]"
                    />
                    <span className={itemSource === 'custom' ? 'text-[#161616] font-bold' : ''}>Custom Magic Item</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="itemSource"
                      checked={itemSource === 'srd'}
                      onChange={() => setItemSource('srd')}
                      className="accent-[var(--accent-ink)]"
                    />
                    <span className={itemSource === 'srd' ? 'text-[#161616] font-bold' : ''}>SRD Equipment Library</span>
                  </label>
                </div>

                {itemSource === 'srd' ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Select SRD Weapon</label>
                    <select
                      value={selectedSrdWeapon}
                      onChange={e => setSelectedSrdWeapon(e.target.value)}
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                    >
                      {SRD_WEAPONS_CATALOG.map(w => (
                        <option key={w.name} value={w.name}>{w.name} ({w.damageDice} {w.damageType})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Item Name *</label>
                      <input
                        type="text"
                        required
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        placeholder="e.g. Dawnbringer Longsword +2"
                        className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs transition-colors focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Rarity</label>
                        <select
                          value={itemRarity}
                          onChange={e => setItemRarity(e.target.value as Rarity)}
                          className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                        >
                          <option value="Common">Common</option>
                          <option value="Uncommon">Uncommon</option>
                          <option value="Rare">Rare</option>
                          <option value="Very Rare">Very Rare</option>
                          <option value="Legendary">Legendary</option>
                          <option value="Artifact">Artifact</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Type</label>
                        <select
                          value={itemType}
                          onChange={e => setItemType(e.target.value as Item['type'])}
                          className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                        >
                          <option value="weapon">Weapon</option>
                          <option value="armor">Armor / Shield</option>
                          <option value="magic">Wondrous Item</option>
                          <option value="consumable">Potion / Scroll</option>
                          <option value="gear">Adventuring Gear</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Properties & Lore</label>
                      <textarea
                        rows={2}
                        value={itemDesc}
                        onChange={e => setItemDesc(e.target.value)}
                        placeholder="Deals bonus radiant damage; sheds 20ft sunlight..."
                        className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs resize-none transition-colors focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Coin Amount *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={coinAmount}
                      onChange={e => setCoinAmount(e.target.value)}
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-mono text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Denomination</label>
                    <select
                      value={coinType}
                      onChange={e => setCoinType(e.target.value as CurrencyType)}
                      className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                    >
                      <option value="gp">Gold Pieces (GP)</option>
                      <option value="pp">Platinum Pieces (PP)</option>
                      <option value="sp">Silver Pieces (SP)</option>
                      <option value="cp">Copper Pieces (CP)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Ledger Note</label>
                  <input
                    type="text"
                    value={rewardNote}
                    onChange={e => setRewardNote(e.target.value)}
                    placeholder="e.g. Cleared Delirium Hulk encounter"
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs transition-colors focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#141414]/15">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer"
              >
                Inject into Vault
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
