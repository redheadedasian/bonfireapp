import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '../../types/campaign';
import { useCampaignStore } from '../../store/campaignStore';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { saveCampaignToCloud, generateJoinCode, formatBannerImageUrl } from '../../services/cloudCampaignVault';
import { 
  X, 
  Settings, 
  Image, 
  Key, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Archive, 
  Play, 
  Trash2, 
  Save 
} from 'lucide-react';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
}

const PRESET_BANNERS = [
  {
    name: 'High Fantasy Realm',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=80'
  },
  {
    name: 'Misty Ancient Forest',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=240&q=80'
  },
  {
    name: 'Mountain Fortress & Castle',
    url: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=240&q=80'
  },
  {
    name: 'Dark Gothic Spire',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=240&q=80'
  },
  {
    name: 'Underground Ruins & Cavern',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=80'
  }
];

export function CampaignSettingsModal({ isOpen, onClose, campaign }: CampaignSettingsModalProps) {
  const { updateCampaign, deleteCampaign } = useCampaignStore();

  const [title, setTitle] = useState(campaign.title);
  const [subtitle, setSubtitle] = useState(campaign.subtitle || '');
  const [setting, setSetting] = useState(campaign.setting || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [bannerUrl, setBannerUrl] = useState(campaign.bannerUrl || '');
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [joinCode, setJoinCode] = useState(campaign.joinCode || generateJoinCode());
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    setJoinCode(generateJoinCode());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const updates: Partial<Campaign> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      setting: setting.trim(),
      description: description.trim(),
      bannerUrl: bannerUrl.trim() ? formatBannerImageUrl(bannerUrl) : undefined,
      status,
      joinCode: joinCode.trim()
    };

    updateCampaign(campaign.id, updates);

    const updatedCampaign: Campaign = {
      ...campaign,
      ...updates,
      updatedAt: Date.now()
    };

    await saveCampaignToCloud(updatedCampaign);
    setIsSaving(false);
    onClose();
  };

  const handleDelete = () => {
    if (!isConfirmDelete) {
      setIsConfirmDelete(true);
      return;
    }
    deleteCampaign(campaign.id);
    onClose();
  };

  const previewBanner = formatBannerImageUrl(bannerUrl);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 overflow-hidden animate-fadeIn my-8 text-[#161616]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/5 border border-black/10 rounded text-[var(--accent-ink)] shadow-xs">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#1a1a1a] uppercase tracking-wider">
                Campaign Settings
              </h3>
              <p className="font-serif text-xs text-[#555555]">
                Dungeon Master Grimoire & Chronicle Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#161616] p-1.5 transition-colors cursor-pointer rounded-sm hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] hide-scrollbar pr-1">
          
          {/* 1. Campaign Title & Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-display uppercase tracking-wider text-[#555555] font-semibold">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] px-3.5 py-2 rounded text-sm text-[#161616] font-serif focus:outline-none"
              placeholder="e.g. Shadows over Drakkenheim"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display uppercase tracking-wider text-[#555555] font-semibold">
                Subtitle / Chapter
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] px-3.5 py-2 rounded text-xs text-[#161616] font-serif focus:outline-none"
                placeholder="e.g. The Delirium Crown"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display uppercase tracking-wider text-[#555555] font-semibold">
                World Setting / Theme
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] px-3.5 py-2 rounded text-xs text-[#161616] font-serif focus:outline-none"
                placeholder="e.g. Grimdark Urban Fantasy"
              />
            </div>
          </div>

          {/* 2. Banner Artwork URL & Google Drive ID & Presets */}
          <div className="flex flex-col gap-2 p-3.5 bg-white/90 border border-[#141414]/15 rounded-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-bold flex items-center gap-1.5">
                <Image size={14} />
                <span>Campaign Banner Artwork (16:9 Landscape)</span>
              </label>
              <span className="text-[11px] font-sans text-[#777777]">
                Direct image URL or Google Drive Link
              </span>
            </div>

            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] px-3 py-1.5 rounded text-xs text-[#161616] font-mono focus:outline-none"
              placeholder="https://... or Google Drive Share Link"
            />

            {/* Banner Presets */}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-sans text-[#777777]">Or choose a fantasy landscape preset:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    className={`relative h-14 rounded overflow-hidden border transition-all group cursor-pointer ${
                      bannerUrl === preset.url ? 'border-[var(--accent-ink)] shadow-[0_0_8px_var(--accent-glow)]' : 'border-[#141414]/20 hover:border-black/40'
                    }`}
                  >
                    <img src={preset.thumb} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] font-display uppercase font-bold text-white leading-tight drop-shadow">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Lens Preview */}
            <div className="mt-2 relative w-full h-28 rounded overflow-hidden border border-[#141414]/20 shadow-inner bg-white">
              <img src={previewBanner} alt="Banner Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 right-3 text-right">
                <span className="font-display text-sm font-bold text-white block drop-shadow-md">
                  {title || 'Campaign Name Preview'}
                </span>
                <span className="font-serif text-xs text-[#cccccc] block">
                  Thorin Ironforge • Lv. 12 (88/96 HP)
                </span>
              </div>
            </div>
          </div>

          {/* 3. Campaign Status Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-display uppercase tracking-wider text-[#555555] font-semibold">
              Campaign Lifecycle Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-3 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  status === 'active'
                    ? 'bg-[#1EB253]/15 border-[#1EB253]/40 text-[#1EB253] shadow-xs'
                    : 'bg-white/80 border-[#141414]/15 text-[#555555] hover:text-[#161616]'
                }`}
              >
                <Play size={13} />
                <span>Active Chronicle</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  status !== 'active'
                    ? 'bg-black/10 border-black/30 text-[#161616] shadow-xs'
                    : 'bg-white/80 border-[#141414]/15 text-[#555555] hover:text-[#161616]'
                }`}
              >
                <Archive size={13} />
                <span>Completed / Archived</span>
              </button>
            </div>
          </div>

          {/* 4. Join Code Display & Regeneration */}
          <div className="flex flex-col gap-1.5 p-3 bg-white/90 border border-[#141414]/15 rounded-sm">
            <label className="text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-semibold flex items-center gap-1.5">
              <Key size={13} className="text-[var(--accent-ink)]" />
              <span>Player Invitation Join Code</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinCode}
                className="flex-1 bg-white border border-[#141414]/20 px-3 py-1.5 rounded text-sm text-[var(--accent-ink)] font-mono font-bold text-center tracking-widest"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 text-xs flex items-center gap-1 cursor-pointer"
                title="Copy Join Code to clipboard"
              >
                {copiedCode ? <Check size={13} className="text-[#1EB253]" /> : <Key size={13} />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateCode}
                className="px-3 py-1.5 rounded border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 text-xs flex items-center gap-1 cursor-pointer"
                title="Generate new 6-character Join Code"
              >
                <RefreshCw size={13} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#141414]/15 mt-2">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-3 py-2 rounded text-xs font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isConfirmDelete
                  ? 'bg-[#E33526] hover:bg-red-700 text-white font-bold animate-pulse'
                  : 'text-[#c53030] hover:bg-red-50'
              }`}
            >
              <Trash2 size={14} />
              <span>{isConfirmDelete ? 'Confirm Delete Campaign?' : 'Delete Campaign'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
