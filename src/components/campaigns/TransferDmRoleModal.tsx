import React, { useState } from 'react';
import { Campaign, PartyMemberRef } from '../../types/campaign';
import { useCampaignStore } from '../../store/campaignStore';
import { useToastStore } from '../../store/toastStore';
import { navigateTo } from '../../services/router';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { 
  X, 
  Crown, 
  ShieldAlert, 
  UserCheck, 
  User, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TransferDmRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export function TransferDmRoleModal({ isOpen, onClose, campaign }: TransferDmRoleModalProps) {
  const { transferDmRole } = useCampaignStore();
  const { showToast } = useToastStore();

  const [selectedMemberId, setSelectedMemberId] = useState<string>('custom');
  const [customDmName, setCustomDmName] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !campaign) return null;

  const party = campaign.party || [];
  const selectedMember = party.find(p => p.id === selectedMemberId);

  const effectiveNewDmName = selectedMember
    ? (selectedMember.player ? `${selectedMember.player} (${selectedMember.name})` : selectedMember.name)
    : (customDmName.trim() || 'New Dungeon Master');

  const effectiveNewDmUserId = selectedMember
    ? (selectedMember.player ? `user_${selectedMember.player.toLowerCase().replace(/\s+/g, '_')}` : `user_${selectedMember.id}`)
    : `user_dm_${Math.random().toString(36).substring(2, 8)}`;

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId === 'custom' && !customDmName.trim()) return;

    transferDmRole(campaign.id, effectiveNewDmUserId, effectiveNewDmName);
    showToast(`Dungeon Master mantle transferred to ${effectiveNewDmName}`, 'info', 5000);
    onClose();

    // Transition previous DM to player view
    navigateTo(`/campaigns/${campaign.id}/hud`, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 relative overflow-hidden text-[#161616]">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/5 border border-black/10 rounded">
              <Crown size={20} className="text-[var(--accent-ink)]" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Pass Dungeon Master Role
              </h3>
              <p className="font-serif text-xs text-[#555555]">
                Campaign: <strong className="text-[#161616]">{campaign.title}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#777777] hover:text-[#161616] p-1 rounded transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">
              Select New Dungeon Master from Party:
            </label>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto hide-scrollbar pr-1">
              {party.map((member: PartyMemberRef) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setIsConfirming(false);
                    }}
                    className={`p-3 rounded-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-2 border-[var(--accent-ink)] shadow-sm'
                        : 'bg-white/70 border border-[#141414]/15 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-bold text-[#161616] truncate">
                            {member.name}
                          </span>
                          {member.player && (
                            <span className="text-[10px] font-serif text-[var(--accent-ink)] font-bold">
                              ({member.player})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-serif text-[#555555] block truncate">
                          Lv. {member.level} {member.class} • {member.species}
                        </span>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[var(--accent-ink)] bg-[var(--accent-ink)]' : 'border-[#141414]/30 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}

              {/* Custom Name Option */}
              <div
                onClick={() => {
                  setSelectedMemberId('custom');
                  setIsConfirming(false);
                }}
                className={`p-3 rounded-sm transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedMemberId === 'custom'
                    ? 'bg-white border-2 border-[var(--accent-ink)] shadow-sm'
                    : 'bg-white/70 border border-[#141414]/15 hover:border-black/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[var(--accent-ink)]" />
                    <span className="font-display text-xs font-bold text-[#161616]">
                      Assign to Other Player / Co-DM
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMemberId === 'custom' ? 'border-[var(--accent-ink)] bg-[var(--accent-ink)]' : 'border-[#141414]/30 bg-white'
                  }`}>
                    {selectedMemberId === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {selectedMemberId === 'custom' && (
                  <input
                    type="text"
                    required={selectedMemberId === 'custom'}
                    value={customDmName}
                    onChange={e => setCustomDmName(e.target.value)}
                    placeholder="Enter adventurer or DM name (e.g. Lyra the Seer)"
                    className="w-full bg-white border border-[#141414]/20 text-[#161616] text-xs p-2 rounded focus:border-[var(--accent-ink)] focus:outline-none font-serif"
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>

            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 bg-[#ECC94B]/15 border border-[#ECC94B]/40 rounded text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-[#B7791F] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-display uppercase tracking-wider text-[#B7791F] font-bold text-[10px]">
                Confirm Transfer of Authority
              </span>
              <p className="font-serif text-[#161616] leading-relaxed text-[11px]">
                Passing the DM mantle will grant tactical DM control to <strong>{effectiveNewDmName}</strong>. You will automatically become a player in this campaign.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#141414]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedMemberId === 'custom' && !customDmName.trim()}
              className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <Crown size={14} />
              <span>Confirm & Pass DM Mantle</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
