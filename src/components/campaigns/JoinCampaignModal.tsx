import React, { useState } from 'react';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { PRESET_CHARACTERS } from '../../data/presetCharacters';
import { CharacterState } from '../../types';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { 
  X, 
  Key, 
  Check, 
  Shield, 
  Compass, 
  Users, 
  UserPlus, 
  Sparkles, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface JoinCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinedSuccess?: (campaignId: string) => void;
}

export function JoinCampaignModal({ isOpen, onClose, onJoinedSuccess }: JoinCampaignModalProps) {
  const { campaigns, joinCampaignByCode } = useCampaignStore();
  const { character, setActiveTab } = useStore();
  const { user } = useAuthStore();

  const [code, setCode] = useState('');
  const [selectedHeroSource, setSelectedHeroSource] = useState<'current' | 'roster'>('current');
  const [selectedRosterHero, setSelectedRosterHero] = useState<CharacterState>(character);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Real-time lookup matching the entered code
  const cleanCode = code.trim().toUpperCase();
  const matchedCampaign = campaigns.find(c => 
    (c.joinCode && c.joinCode.toUpperCase() === cleanCode) ||
    c.id.toUpperCase() === cleanCode ||
    ('BF-' + cleanCode) === (c.joinCode && c.joinCode.toUpperCase())
  );

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const heroToJoin = selectedHeroSource === 'current' ? character : selectedRosterHero;
    const result = joinCampaignByCode(code.trim(), heroToJoin, user?.displayName || 'Player');

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
        if (result.campaignId && onJoinedSuccess) {
          onJoinedSuccess(result.campaignId);
        }
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 relative overflow-hidden text-[#161616]">

        <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <Key size={16} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
              Join Campaign with Join Code
            </h3>
          </div>
          <button onClick={onClose} className="text-[#777777] hover:text-[#161616] p-1 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {feedback?.type === 'success' ? (
          <div className="p-6 text-center flex flex-col items-center gap-2 bg-[#1EB253]/15 border border-[#1EB253]/40 rounded-lg text-[#1EB253]">
            <Check size={32} />
            <span className="font-display text-sm uppercase tracking-wider font-bold">
              {feedback.message}
            </span>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            
            {/* Join Code Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">
                6-Character Campaign Join Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => {
                    setCode(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="e.g. BF-DRAK12 or DRAK12"
                  className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2.5 text-[#161616] rounded font-mono text-base tracking-[0.2em] uppercase focus:outline-none placeholder:text-[#888888] transition-colors"
                />
                {matchedCampaign && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#1EB253] flex items-center gap-1">
                    <Check size={14} />
                    <span>Campaign Found</span>
                  </span>
                )}
              </div>
            </div>

            {/* Campaign Preview Card if matched */}
            {matchedCampaign && (
              <div className="p-3.5 bg-white/90 border border-[#141414]/15 rounded flex flex-col gap-1 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-widest font-bold">
                    Target Campaign
                  </span>
                  <span className="text-[10px] font-mono text-[#555555]">
                    DM: {matchedCampaign.dmName}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-[#161616] uppercase mt-1">
                  {matchedCampaign.title}
                </h4>
                <p className="font-serif text-xs text-[#555555]">
                  {matchedCampaign.setting} • {matchedCampaign.party.length} Current Heroes
                </p>
              </div>
            )}

            {/* Character Selection */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#141414]/15">
              <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">
                Select Hero to Enter Campaign
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedHeroSource('current')}
                  className={`p-2.5 rounded-sm text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedHeroSource === 'current'
                      ? 'bg-white border-2 border-[var(--accent-ink)] shadow-sm'
                      : 'bg-white/70 border border-[#141414]/15 text-[#555555] hover:border-black/30'
                  }`}
                >
                  <span className="text-[9px] font-display uppercase text-[var(--accent-ink)] font-bold">Active Sheet Hero</span>
                  <span className="font-display text-xs font-bold text-[#161616] truncate">{character.name}</span>
                  <span className="text-[10px] font-serif text-[#555555]">Lv.{character.level} {character.class}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedHeroSource('roster')}
                  className={`p-2.5 rounded-sm text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedHeroSource === 'roster'
                      ? 'bg-white border-2 border-[var(--accent-ink)] shadow-sm'
                      : 'bg-white/70 border border-[#141414]/15 text-[#555555] hover:border-black/30'
                  }`}
                >
                  <span className="text-[9px] font-display uppercase text-[var(--accent-ink)] font-bold">Vault / Preset Hero</span>
                  <span className="font-display text-xs font-bold text-[#161616] truncate">
                    {selectedRosterHero.name || 'Choose from Vault'}
                  </span>
                  <span className="text-[10px] font-serif text-[#555555]">
                    Lv.{selectedRosterHero.level} {selectedRosterHero.class}
                  </span>
                </button>
              </div>

              {selectedHeroSource === 'roster' && (
                <select
                  value={selectedRosterHero.name}
                  onChange={(e) => {
                    const hero = PRESET_CHARACTERS.find(p => p.name === e.target.value);
                    if (hero) setSelectedRosterHero(hero);
                  }}
                  className="bg-white border border-[#141414]/20 p-2 text-[#161616] rounded font-serif text-xs focus:border-[var(--accent-ink)] focus:outline-none"
                >
                  {PRESET_CHARACTERS.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} (Lv.{p.level} {p.class} • {p.species})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {feedback?.type === 'error' && (
              <div className="p-2.5 bg-[#E33526]/15 border border-[#E33526]/40 text-[#c53030] text-xs rounded font-serif">
                {feedback.message}
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
                className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Join Party</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
