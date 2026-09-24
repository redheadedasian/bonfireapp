import React, { useState } from 'react';
import { 
  ShoppingBag, 
  FileText, 
  X, 
  Coins 
} from 'lucide-react';
import { Campaign, CurrencyType } from '../../types/campaign';
import { LedgerEntry } from '../../types';
import { ASSET_MAP } from '@/config/assets';

interface DmTreasuryOversightViewProps {
  campaign: Campaign | undefined;
  makePartyPurchase: (
    buyerName: string,
    description: string,
    cost: number,
    currency: CurrencyType
  ) => boolean;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date'> & Partial<Pick<LedgerEntry, 'id' | 'date'>>) => void;
}

export function DmTreasuryOversightView({
  campaign,
  makePartyPurchase,
  addLedgerEntry
}: DmTreasuryOversightViewProps) {
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [purchaseBuyer, setPurchaseBuyer] = useState('Party (Group Fund)');
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('10');
  const [purchaseCurrency, setPurchaseCurrency] = useState<CurrencyType>('gp');

  const handleExecutePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !purchaseItem.trim()) return;

    const costNum = Math.max(1, parseInt(purchaseCost, 10) || 1);
    const success = makePartyPurchase(purchaseBuyer, purchaseItem.trim(), costNum, purchaseCurrency);

    if (success) {
      if (purchaseBuyer !== 'Party (Group Fund)') {
        addLedgerEntry({
          type: 'expense',
          amount: costNum,
          currency: purchaseCurrency,
          description: `Group Purchase (${purchaseBuyer}): ${purchaseItem.trim()}`
        });
      }

      setPurchaseItem('');
      setIsPurchaseDrawerOpen(false);
    } else {
      alert('Insufficient funds in Party Treasury!');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto hide-scrollbar p-6 max-w-5xl mx-auto flex flex-col gap-6 text-[#161616]">
      <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
        <div>
          <h3 className="font-display text-base uppercase tracking-wider text-[#1a1a1a] font-bold">
            Party Vault & Shared Treasury Oversight
          </h3>
          <p className="font-serif text-xs text-[#555555]">
            Manage group assets, gold distribution, and inspect permanent transaction records.
          </p>
        </div>

        <button
          onClick={() => setIsPurchaseDrawerOpen(true)}
          className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <ShoppingBag size={14} />
          <span>Record Purchase</span>
        </button>
      </div>

      {/* Official Coin Tokens */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Platinum', key: 'pp', val: campaign?.treasury.pp || 0, svg: ASSET_MAP.currency.pp },
          { label: 'Gold', key: 'gp', val: campaign?.treasury.gp || 0, svg: ASSET_MAP.currency.gp },
          { label: 'Electrum', key: 'ep', val: campaign?.treasury.ep || 0, svg: ASSET_MAP.currency.ep },
          { label: 'Silver', key: 'sp', val: campaign?.treasury.sp || 0, svg: ASSET_MAP.currency.sp },
          { label: 'Copper', key: 'cp', val: campaign?.treasury.cp || 0, svg: ASSET_MAP.currency.cp }
        ].map(coin => (
          <div key={coin.key} className="p-3.5 bg-white border border-[#141414]/15 rounded-sm flex items-center gap-3 shadow-xs">
            <img src={coin.svg} alt={coin.label} className="w-9 h-9 object-contain drop-shadow" />
            <div>
              <span className="text-[10px] font-display uppercase tracking-wider text-[#555555] block font-bold">
                {coin.label}
              </span>
              <span className="font-mono text-base font-bold text-[#161616]">
                {coin.val.toLocaleString()} {coin.key.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* In-Panel Purchase Drawer */}
      {isPurchaseDrawerOpen && (
        <div className="p-5 bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
            <h4 className="font-display text-sm uppercase text-[var(--accent-ink)] font-bold flex items-center gap-2">
              <ShoppingBag size={15} />
              <span>Record Group Expenditure</span>
            </h4>
            <button onClick={() => setIsPurchaseDrawerOpen(false)} className="text-[#777777] hover:text-[#161616] p-1 cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleExecutePurchase} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={purchaseBuyer}
              onChange={e => setPurchaseBuyer(e.target.value)}
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-serif focus:outline-none"
            >
              <option value="Party (Group Fund)">Party (Group Fund)</option>
              {campaign?.party.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.player})</option>
              ))}
            </select>

            <input
              type="text"
              required
              value={purchaseItem}
              onChange={e => setPurchaseItem(e.target.value)}
              placeholder="Item / Service Name *"
              className="sm:col-span-2 bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-serif focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                min="1"
                value={purchaseCost}
                onChange={e => setPurchaseCost(e.target.value)}
                className="w-20 bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] rounded font-mono text-center focus:outline-none"
              />
              <select
                value={purchaseCurrency}
                onChange={e => setPurchaseCurrency(e.target.value as CurrencyType)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[var(--accent-ink)] rounded font-mono font-bold focus:outline-none"
              >
                <option value="gp">GP</option>
                <option value="sp">SP</option>
                <option value="cp">CP</option>
                <option value="pp">PP</option>
              </select>

              <button type="submit" className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold shrink-0 transition-all shadow-xs cursor-pointer">
                Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PERMANENT TREASURY TRANSACTION LEDGER TABLE */}
      <div className="p-5 bg-white border border-[#141414]/15 rounded-xl flex flex-col gap-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--accent-ink)]" />
            <h4 className="font-display text-xs uppercase tracking-wider text-[#1a1a1a] font-bold">
              Permanent Treasury Transaction Ledger
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#555555]">
            {campaign?.treasury.ledger?.length || 0} recorded entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-serif">
            <thead>
              <tr className="border-b border-[#141414]/10 text-[10px] font-display uppercase text-[#777777]">
                <th className="pb-2 font-bold">Timestamp</th>
                <th className="pb-2 font-bold">Actor / Buyer</th>
                <th className="pb-2 font-bold">Description</th>
                <th className="pb-2 font-bold">Type</th>
                <th className="pb-2 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {(campaign?.treasury.ledger || []).length > 0 ? (
                campaign?.treasury.ledger.map(entry => (
                  <tr key={entry.id} className="hover:bg-black/5 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-[#777777]">
                      {new Date(entry.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2.5 font-bold text-[#161616]">
                      {entry.actor}
                    </td>
                    <td className="py-2.5 text-[#333333]">
                      {entry.description}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-display uppercase font-bold ${
                        entry.type === 'purchase' || entry.type === 'withdrawal' ? 'bg-[#E33526]/10 text-[#c53030]' : 'bg-[#1EB253]/10 text-[#1EB253]'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className={`py-2.5 font-mono font-bold text-right ${
                      entry.type === 'purchase' || entry.type === 'withdrawal' ? 'text-[#c53030]' : 'text-[#1EB253]'
                    }`}>
                      {entry.type === 'purchase' || entry.type === 'withdrawal' ? '-' : '+'}{entry.amount} {entry.currency.toUpperCase()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#777777] italic">
                    No transactions recorded in this campaign treasury yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
