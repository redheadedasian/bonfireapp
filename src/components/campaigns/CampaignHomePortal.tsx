import React, { useState } from 'react';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { Campaign, PartyMemberRef } from '../../types/campaign';
import { 
  Plus, 
  Sparkles, 
  Settings, 
  Key, 
  Flame, 
  Play, 
  Archive, 
  User, 
  Shield, 
  Heart,
  Crown,
  Compass,
  ChevronRight
} from 'lucide-react';
import { CreateCampaignModal } from './CreateCampaignModal';
import { JoinCampaignModal } from './JoinCampaignModal';
import { CampaignSettingsModal } from './CampaignSettingsModal';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { isUserDM, navigateTo } from '../../services/router';
import { formatBannerImageUrl } from '../../services/cloudCampaignVault';

interface CampaignHomePortalProps {
  onSelectCampaign: (campaignId: string) => void;
}

export function CampaignHomePortal({ onSelectCampaign }: CampaignHomePortalProps) {
  const { campaigns, setActiveCampaignId } = useCampaignStore() as any;
  const { character } = useStore();
  const { user, isAuthenticated } = useAuthStore();

  const [roleFilter, setRoleFilter] = useState<'all' | 'player' | 'dm'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [settingsCampaign, setSettingsCampaign] = useState<Campaign | null>(null);

  // 1. Role Filter Logic (All / Player / DM)
  const matchesRoleFilter = (campaign: Campaign) => {
    const isDM = isUserDM(campaign, user?.uid);
    if (roleFilter === 'dm') return isDM;
    if (roleFilter === 'player') {
      const hasPlayerChar = campaign.party?.some(
        (p: PartyMemberRef) =>
          p.name.toLowerCase() === character.name.toLowerCase() ||
          p.player.toLowerCase() === (user?.displayName || 'preston').toLowerCase()
      );
      return hasPlayerChar || !isDM;
    }
    return true; // 'all'
  };

  // 2. Separate into Current (Active) and Previous (Completed / Archived)
  const currentCampaigns = campaigns.filter(
    (c: Campaign) => c.status === 'active' && matchesRoleFilter(c)
  );
  const previousCampaigns = campaigns.filter(
    (c: Campaign) => (c.status === 'completed' || c.status === 'archived') && matchesRoleFilter(c)
  );

  const handleEnterCampaign = (campaign: Campaign) => {
    setActiveCampaignId(campaign.id);
    onSelectCampaign(campaign.id);
    const isDM = isUserDM(campaign, user?.uid);
    if (isDM) {
      navigateTo(`/campaigns/${campaign.id}/dm`);
    } else {
      navigateTo(`/campaigns/${campaign.id}/hud`);
    }
  };

  const handleQuickResumeHUD = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    setActiveCampaignId(campaign.id);
    navigateTo(`/campaigns/${campaign.id}/hud`);
  };

  const handleQuickDMCommand = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    setActiveCampaignId(campaign.id);
    navigateTo(`/campaigns/${campaign.id}/dm`);
  };

  // Helper to find player's character in campaign or default to first party member
  const getHeroForCampaign = (campaign: Campaign): PartyMemberRef => {
    if (!campaign.party || campaign.party.length === 0) {
      return {
        id: 'default-hero',
        name: character.name || 'Hero',
        class: character.class || 'Adventurer',
        level: character.level || 1,
        species: character.species || 'Human',
        player: 'You',
        hpCurrent: character.hp.current,
        hpMax: character.hp.max,
        tempHp: character.hp.temp,
        ac: character.ac,
        passivePerception: 14,
        passiveInsight: 14,
        passiveInvestigation: 12
      };
    }
    const matchingHero = campaign.party.find(
      (p: PartyMemberRef) => p.name.toLowerCase() === character.name.toLowerCase()
    );
    return matchingHero || campaign.party[0];
  };

  const renderCampaignCard = (campaign: Campaign, isPrevious = false) => {
    const hero = getHeroForCampaign(campaign);
    const hpPercent = Math.min(100, Math.round((hero.hpCurrent / Math.max(1, hero.hpMax)) * 100));
    const isDM = isUserDM(campaign, user?.uid);
    const banner = formatBannerImageUrl(campaign.bannerUrl);

    return (
      <div
        key={campaign.id}
        onClick={() => handleEnterCampaign(campaign)}
        className={`group relative w-full aspect-[16/9] sm:aspect-[16/10] rounded-sm overflow-hidden border transition-all duration-300 cursor-pointer shadow-2xl flex flex-col justify-between select-none bg-[#0e0c15] ${
          isPrevious
            ? 'border-[#2A2318] hover:border-[#8A6827] opacity-85 hover:opacity-100'
            : 'border-[#3d2d14] hover:border-[#ffd700]'
        }`}
      >
        {/* Background Artwork Banner */}
        <img
          src={banner}
          alt={campaign.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isPrevious ? 'filter grayscale-[30%] brightness-90 group-hover:grayscale-0' : ''
          }`}
        />

        {/* 1. Cabochon Convex Glass Dome Inner Shader */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.25), inset 0 -4px 10px rgba(0,0,0,0.85)'
          }}
        />

        {/* 2. Top-down Curved Specular Highlight Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 15%, rgba(255,255,255,0.22) 0%, transparent 65%)'
          }}
        />

        {/* 3. Bottom-to-Top Vignette Gradient for High Text Legibility */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, rgba(14,12,21,0.95) 0%, rgba(14,12,21,0.4) 40%, transparent 80%)'
          }}
        />

        {/* Top Floating Badges & DM Settings Gear */}
        <div className="relative z-20 p-3 flex items-start justify-between gap-2">
          {/* Setting / Status Badge */}
          <span className="bg-black/70 border border-white/20 px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-display uppercase tracking-wider font-bold text-white shadow-md truncate max-w-[65%] backdrop-blur-xs">
            {campaign.setting || 'Chronicle'}
          </span>

          <div className="flex items-center gap-1.5">
            {isDM && (
              <span className="bg-[var(--accent-ink)] border border-white/30 text-white px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider shadow-xs">
                DM
              </span>
            )}

            {/* DM Campaign Settings Trigger Gear */}
            {isDM && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsCampaign(campaign);
                }}
                className="p-1.5 rounded-sm bg-black/75 hover:bg-[var(--accent-ink)] border border-white/20 text-white transition-all shadow-md cursor-pointer backdrop-blur-xs"
                title="Configure Campaign Settings (Title, Banner, Status, Join Code)"
              >
                <Settings size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom-Right Anchored Text & Metadata Overlay */}
        <div className="relative z-20 p-3.5 pb-3 flex flex-col items-end text-right">
          {/* Campaign Name */}
          <h4 className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] group-hover:text-white transition-colors leading-tight line-clamp-1">
            {campaign.title}
          </h4>

          {/* Player / Character Name */}
          <p className="font-serif text-xs sm:text-sm text-[var(--accent-ink)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-snug mt-0.5 font-bold">
            {hero.name} {hero.class ? `(${hero.class})` : ''}
          </p>

          {/* Level & Health / Status summary */}
          <p className="text-[11px] sm:text-xs text-[#dddddd] font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] leading-snug mt-0.5">
            Lv. {hero.level} • {hero.hpCurrent}/{hero.hpMax} HP {hero.tempHp > 0 ? `(+${hero.tempHp})` : ''}
          </p>

          {/* Hover Quick Action Buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 mt-2 pt-1 border-t border-white/10 w-full justify-end">
            {isDM && (
              <button
                onClick={(e) => handleQuickDMCommand(e, campaign)}
                className="px-2.5 py-1 rounded-xs bg-white text-[#161616] hover:bg-[var(--accent-ink)] hover:text-white text-[10px] font-display uppercase tracking-wider font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Compass size={11} />
                <span>DM View</span>
              </button>
            )}
            <button
              onClick={(e) => handleQuickResumeHUD(e, campaign)}
              className="px-3 py-1 rounded-xs bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-[10px] font-display uppercase tracking-wider font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <span>Enter</span>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>

        {/* Bottom Stylized Indicator Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 z-30 overflow-hidden">
          <div
            className="h-full transition-all duration-300 bg-[var(--accent-ink)]"
            style={{ width: `${Math.max(15, hpPercent)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto hide-scrollbar p-4 sm:p-8 bg-transparent text-[#161616] select-none">
      
      <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">

        {/* 1. TOP HEADER & FILTER CONTROLS BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[#fcfbf9] border-2 border-black/30 rounded-xl relative overflow-hidden shadow-xl">
          
          {/* Left: Filter Toggle Pills & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
            <div className="p-3 bg-black/5 border border-black/10 rounded text-[var(--accent-ink)] shrink-0 shadow-xs">
              <Flame size={24} className="animate-pulse" />
            </div>

            <div>
              <h2 className="font-display text-base sm:text-lg uppercase tracking-[0.2em] text-[#1a1a1a] font-bold">
                Campaign Directory
              </h2>
              <p className="font-serif text-xs text-[#555555] mt-0.5">
                {isAuthenticated && user && !user.isAnonymous
                  ? `Welcome, ${user.displayName || 'Adventurer'} — Select a chronicle or manage your campaigns.`
                  : 'Welcome, Adventurer — Launch a new campaign chronicle or resume an ongoing saga.'}
              </p>
            </div>
          </div>

          {/* Right Controls: Filter Pills + Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10 justify-start md:justify-end">
            
            {/* View Filter Toggle Pills: [ All ] [ Player ] [ DM ] */}
            <div className="flex items-center bg-white/80 border border-[#141414]/15 p-1 rounded-sm shadow-xs gap-1">
              {(['all', 'player', 'dm'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRoleFilter(mode)}
                  style={roleFilter === mode ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                  className={`px-3.5 py-1.5 rounded-xs text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    roleFilter === mode
                      ? 'text-white shadow-xs'
                      : 'text-[#555555] hover:text-[#161616] hover:bg-black/5'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'player' ? 'Player' : 'DM'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-3.5 py-2 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:text-black hover:border-black/40 text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Key size={13} />
              <span>Join Code</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xs bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              id="btn-create-new-campaign"
            >
              <Plus size={15} strokeWidth={3} />
              <span>+ Create Campaign</span>
            </button>
          </div>
        </div>

        {/* 2. SECTION 1: Current Campaigns (Active Chronicles) */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-ink)] shadow-[0_0_8px_var(--accent-glow)]" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-[0.2em] text-[#1a1a1a] font-bold">
                Current Campaigns
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--accent-ink)] font-bold">
              {currentCampaigns.length} Active {currentCampaigns.length === 1 ? 'Saga' : 'Sagas'}
            </span>
          </div>

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCampaigns.map((campaign: Campaign) => renderCampaignCard(campaign, false))}
          </div>

          {currentCampaigns.length === 0 && (
            <div className="p-8 text-center bg-white/80 border border-[#141414]/15 rounded-sm text-xs font-serif text-[#777777]">
              No active campaigns match the current "{roleFilter.toUpperCase()}" view filter.
            </div>
          )}
        </section>

        {/* 3. SECTION 2: Previous Campaigns (Archived / Completed Chronicles) */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#888888]" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-[0.2em] text-[#555555] font-bold">
                Previous Campaigns
              </h3>
            </div>
            <span className="font-mono text-xs text-[#777777]">
              {previousCampaigns.length} Completed / Archived
            </span>
          </div>

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousCampaigns.map((campaign: Campaign) => renderCampaignCard(campaign, true))}
          </div>

          {previousCampaigns.length === 0 && (
            <div className="p-8 text-center bg-white/80 border border-[#141414]/15 rounded-sm text-xs font-serif text-[#777777]">
              No previous campaigns found in this view.
            </div>
          )}
        </section>

      </div>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <JoinCampaignModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {settingsCampaign && (
        <CampaignSettingsModal
          isOpen={Boolean(settingsCampaign)}
          onClose={() => setSettingsCampaign(null)}
          campaign={settingsCampaign}
        />
      )}

    </div>
  );
}
