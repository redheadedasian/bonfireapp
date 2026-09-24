import React, { useState } from 'react';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { X, Divide, Check, Coins } from 'lucide-react';
import { CurrencyType } from '../../types/campaign';
import { ASSET_MAP } from '@/config/assets';

interface PartySplitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PartySplitModal({ isOpen, onClose }: PartySplitModalProps) {
  const { getActiveCampaign, splitPartyWealthEqually } = useCampaignStore();
  const { character, updateCurrency } = useStore();
  const campaign = getActiveCampaign();

  const [splitResult, setSplitResult] = useState<{
    perPerson: Record<CurrencyType, number>;
    totalSplit: number;
  } | null>(null);

  if (!isOpen || !campaign) return null;

  const memberCount = Math.max(1, campaign.party.length);
  const treasury = campaign.treasury;

  const handleExecuteSplit = () => {
    const res = splitPartyWealthEqually(character.name);
    setSplitResult(res);

    // If active character is a party member, automatically award their cut to their personal sheet
    if (res.perPerson.gp > 0) updateCurrency('gp', res.perPerson.gp);
    if (res.perPerson.sp > 0) updateCurrency('sp', res.perPerson.sp);
    if (res.perPerson.pp > 0) updateCurrency('pp', res.perPerson.pp);
    if (res.perPerson.cp > 0) updateCurrency('cp', res.perPerson.cp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 relative overflow-hidden text-[#161616]">

        <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <Coins size={16} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
              Split Party Wealth Equally
            </h3>
          </div>
          <button onClick={onClose} className="text-[#777777] hover:text-[#161616] p-1 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <p className="font-serif text-xs text-[#555555]">
          Evenly divide current Party Treasury coinage across all <strong className="text-[#161616]">{memberCount} active heroes</strong> in the party roster ({campaign.party.map(p => p.name).join(', ')}).
        </p>

        {/* Current Treasury Available */}
        <div className="grid grid-cols-4 gap-2 bg-white/80 border border-[#141414]/15 p-3 rounded-sm text-center shadow-xs">
          {[
            { label: 'PP', val: treasury.pp || 0, svg: ASSET_MAP.currency.pp, color: 'text-[#161616]' },
            { label: 'GP', val: treasury.gp || 0, svg: ASSET_MAP.currency.gp, color: 'text-[var(--accent-ink)]' },
            { label: 'SP', val: treasury.sp || 0, svg: ASSET_MAP.currency.sp, color: 'text-[#555555]' },
            { label: 'CP', val: treasury.cp || 0, svg: ASSET_MAP.currency.cp, color: 'text-[#888888]' }
          ].map(c => (
            <div key={c.label} className="flex flex-col items-center gap-0.5">
              <img src={c.svg} alt={c.label} className="w-6 h-6 object-contain drop-shadow-xs" />
              <span className="text-[9px] font-display text-[#555555] uppercase font-bold">{c.label}</span>
              <div className={`font-mono text-xs sm:text-sm font-bold ${c.color}`}>{c.val}</div>
            </div>
          ))}
        </div>

        {splitResult ? (
          <div className="p-4 bg-[#1EB253]/10 border border-[#1EB253]/30 rounded-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-[#1EB253] font-bold">
              <Check size={16} />
              <span>Wealth Successfully Distributed!</span>
            </div>
            <p className="font-serif text-xs text-[#161616]">
              Each of the {memberCount} party members received:
            </p>
            <div className="font-mono text-sm font-bold text-[var(--accent-ink)]">
              {splitResult.perPerson.gp} GP • {splitResult.perPerson.sp} SP • {splitResult.perPerson.pp} PP • {splitResult.perPerson.cp} CP
            </div>
            <p className="font-serif text-[11px] text-[#555555] italic mt-1">
              Your share has been added directly to {character.name}'s character sheet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-sm text-xs font-serif text-[#555555]">
              Each hero will receive:
              <div className="font-mono text-sm font-bold text-[var(--accent-ink)] mt-1">
                ~{Math.floor((treasury.gp || 0) / memberCount)} GP, {Math.floor((treasury.sp || 0) / memberCount)} SP, {Math.floor((treasury.pp || 0) / memberCount)} PP
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2 border-t border-[#141414]/15">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            {splitResult ? 'Done' : 'Cancel'}
          </button>
          {!splitResult && (
            <button
              onClick={handleExecuteSplit}
              className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer"
            >
              Confirm Split
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

