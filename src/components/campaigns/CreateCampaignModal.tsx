import React, { useState } from 'react';
import { useCampaignStore, DEFAULT_SAMPLE_PARTY_MEMBERS } from '../../store/campaignStore';
import { useAuthStore } from '../../store/authStore';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { X, BookOpen, Sparkles, Shield, User, Users } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { createCampaign } = useCampaignStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [setting, setSetting] = useState('Forgotten Realms');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [dmName, setDmName] = useState(user?.displayName || 'Dungeon Master');
  const [includeSampleParty, setIncludeSampleParty] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let effectiveUid = user?.uid;
    if (!effectiveUid) {
      const authState = useAuthStore.getState();
      authState.setGuestUser();
      effectiveUid = useAuthStore.getState().user?.uid || 'dm_local';
    }

    createCampaign({
      title: title.trim(),
      subtitle: subtitle.trim(),
      setting: setting.trim(),
      bannerUrl: bannerUrl.trim() || undefined,
      description: description.trim(),
      dmName: dmName.trim() || user?.displayName || 'Dungeon Master',
      dmUserId: effectiveUid,
      party: includeSampleParty ? [...DEFAULT_SAMPLE_PARTY_MEMBERS] : []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 relative overflow-hidden text-[#161616]">
        
        <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <BookOpen size={16} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
              Begin New Campaign Chronicle
            </h3>
          </div>
          <button onClick={onClose} className="text-[#777777] hover:text-[#161616] transition-colors p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Campaign Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Shadows over Drakkenheim"
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-sm focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Subtitle / Arc</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. The Delirium Crown"
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">World / Setting</label>
              <input
                type="text"
                value={setting}
                onChange={e => setSetting(e.target.value)}
                placeholder="e.g. Grimdark Urban / Ravenloft"
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Dungeon Master Name</label>
            <input
              type="text"
              value={dmName}
              onChange={e => setDmName(e.target.value)}
              placeholder="e.g. Master Matthew"
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Banner Image URL (Optional)</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={e => setBannerUrl(e.target.value)}
              placeholder="https://... (Direct image or Google Drive link)"
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-mono text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Campaign Synopsis</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide background, premise, and central conflicts..."
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-white/80 border border-[#141414]/15 rounded">
            <input
              type="checkbox"
              id="includeSampleParty"
              checked={includeSampleParty}
              onChange={e => setIncludeSampleParty(e.target.checked)}
              className="accent-[var(--accent-ink)] w-4 h-4 rounded cursor-pointer shrink-0"
            />
            <label htmlFor="includeSampleParty" className="text-xs font-serif text-[#555555] cursor-pointer leading-tight">
              Populate 4 balanced sample heroes (Paladin, Rogue, Cleric, Sorcerer) for testing views
            </label>
          </div>

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
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

