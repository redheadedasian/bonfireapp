import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { Campaign, CampaignStatus, PartyMemberRef, QuestItem, HandoutItem } from '../../types/campaign';
import { HandoutDetailModal } from './HandoutDetailModal';
import { PartySplitModal } from './PartySplitModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { TransferDmRoleModal } from './TransferDmRoleModal';
import { useAuthStore } from '../../store/authStore';
import { isUserDM } from '../../services/router';
import { 
  BookOpen, 
  Users, 
  Shield, 
  Heart, 
  MapPin, 
  Compass, 
  Scroll, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  Coins, 
  Archive, 
  Share2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  ChevronRight, 
  User, 
  Sword, 
  Search,
  Filter,
  Flame,
  Award,
  X,
  Crown
} from 'lucide-react';
import { GameItemIcon } from '../ui/GameIcons';
import { CampaignHomePortal } from './CampaignHomePortal';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';

export function CampaignsHub() {
  const { 
    campaigns, 
    activeCampaignId, 
    setActiveCampaignId, 
    activeDirectoryTab, 
    setActiveDirectoryTab, 
    getActiveCampaign, 
    archiveCampaign, 
    deleteCampaign,
    addQuest,
    updateQuest,
    deleteQuest,
    addHandout,
    deleteHandout,
    toggleHandoutVisibility,
    populateSampleParty
  } = useCampaignStore();

  const { setActiveTab } = useStore();
  const { user } = useAuthStore();
  const activeCampaign = getActiveCampaign();

  const [viewMode, setViewMode] = useState<'portal' | 'workspace'>('portal');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'quests' | 'timeline' | 'handouts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandout, setSelectedHandout] = useState<HandoutItem | null>(null);
  const [isHandoutModalOpen, setIsHandoutModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferDmModalOpen, setIsTransferDmModalOpen] = useState(false);

  // New Quest state
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDesc, setNewQuestDesc] = useState('');
  const [newQuestGiver, setNewQuestGiver] = useState('');
  const [newQuestReward, setNewQuestReward] = useState('');
  const [newQuestPriority, setNewQuestPriority] = useState<QuestItem['priority']>('main');

  // New Handout state
  const [isAddingHandout, setIsAddingHandout] = useState(false);
  const [newHandoutTitle, setNewHandoutTitle] = useState('');
  const [newHandoutType, setNewHandoutType] = useState<HandoutItem['type']>('lore');
  const [newHandoutUrl, setNewHandoutUrl] = useState('');
  const [newHandoutContent, setNewHandoutContent] = useState('');
  const [newHandoutTags, setNewHandoutTags] = useState('Lore, Clue');

  const filteredCampaigns = campaigns.filter(c => {
    if (c.status !== activeDirectoryTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.setting.toLowerCase().includes(q) || c.dmName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAddQuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim() || !activeCampaign) return;

    addQuest(activeCampaign.id, {
      title: newQuestTitle.trim(),
      description: newQuestDesc.trim(),
      giver: newQuestGiver.trim(),
      reward: newQuestReward.trim(),
      priority: newQuestPriority,
      status: 'in_progress'
    });

    setNewQuestTitle('');
    setNewQuestDesc('');
    setNewQuestGiver('');
    setNewQuestReward('');
    setIsAddingQuest(false);
  };

  const handleAddHandoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandoutTitle.trim() || !activeCampaign) return;

    addHandout(activeCampaign.id, {
      title: newHandoutTitle.trim(),
      type: newHandoutType,
      imageUrl: newHandoutUrl.trim() || undefined,
      content: newHandoutContent.trim(),
      tags: newHandoutTags.split(',').map(t => t.trim()).filter(Boolean),
      isRevealedToParty: true
    });

    setNewHandoutTitle('');
    setNewHandoutUrl('');
    setNewHandoutContent('');
    setIsAddingHandout(false);
  };

  if (viewMode === 'portal') {
    return (
      <div className="w-full h-full flex flex-col bg-transparent text-[#161616] overflow-hidden select-none">
        <CampaignHomePortal 
          onSelectCampaign={(campaignId) => {
            setActiveCampaignId(campaignId);
            setViewMode('workspace');
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-[#161616] overflow-hidden select-none">
      
      {/* Top Directory Bar */}
      <div className="border-b border-[#141414]/15 bg-[#fcfbf9] px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        
        {/* Back to Portal + Directory Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('portal')}
            className="px-3 py-1.5 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            title="Return to Campaigns Home Portal Grid"
          >
            <span>← All Campaigns</span>
          </button>

          {(['active', 'completed', 'archived'] as CampaignStatus[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDirectoryTab(tab)}
              style={activeDirectoryTab === tab ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-display uppercase tracking-widest font-bold transition-all cursor-pointer ${
                activeDirectoryTab === tab
                  ? 'text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#161616] hover:bg-black/5'
              }`}
            >
              {tab === 'active' ? 'Active Campaigns' : tab === 'completed' ? 'Completed Sagas' : 'Archived Chronicles'}
            </button>
          ))}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              placeholder="Search sagas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#141414]/20 pl-8 pr-3 py-1.5 text-xs text-[#161616] rounded-xs focus:border-[var(--accent-ink)] focus:outline-none font-serif"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs uppercase tracking-wider font-bold rounded-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Main Campaign Container (Sidebar List + Active Campaign Stage) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Campaign Directory Rail (280px) */}
        <div className="w-full md:w-72 border-r border-[#141414]/15 bg-white/70 p-3 flex flex-col gap-2 overflow-y-auto hide-scrollbar shrink-0">
          <span className="text-[10px] font-display uppercase tracking-widest text-[#777777] px-2 py-1 font-bold">
            Campaign Chronicles ({filteredCampaigns.length})
          </span>

          {filteredCampaigns.map(c => {
            const isSelected = c.id === activeCampaignId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveCampaignId(c.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-white border-2 border-[var(--accent-ink)] shadow-sm'
                    : 'bg-white/80 border border-[#141414]/15 hover:border-black/30 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-xs font-bold text-[#161616] uppercase tracking-wider truncate">
                    {c.title}
                  </h4>
                  {isSelected && <Sparkles size={12} className="text-[var(--accent-ink)] shrink-0" />}
                </div>

                <div className="text-[11px] font-serif text-[#555555] truncate">
                  DM: {c.dmName} • {c.setting}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--accent-ink)] font-bold pt-1 border-t border-[#141414]/10">
                  <span>{c.party.length} Heroes</span>
                  <span>{c.questLog.filter(q => q.status === 'in_progress').length} Active Quests</span>
                </div>
              </div>
            );
          })}

          {filteredCampaigns.length === 0 && (
            <div className="p-6 text-center text-xs font-serif text-[#777777]">
              No {activeDirectoryTab} campaigns found.
            </div>
          )}
        </div>

        {/* Right Active Campaign Stage */}
        {activeCampaign ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto hide-scrollbar bg-white/40">
            
            {/* Campaign Banner Header */}
            <div className="relative p-6 bg-[#fcfbf9] border-b border-[#141414]/15 flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-widest font-bold">
                      {activeCampaign.setting}
                    </span>
                    <span className="text-xs font-serif text-[#555555]">
                      Current World Date: <strong className="text-[#161616]">{activeCampaign.currentWorldDate}</strong>
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] uppercase tracking-[0.2em] font-bold mt-1">
                    {activeCampaign.title}
                  </h1>
                  {activeCampaign.subtitle && (
                    <p className="font-serif italic text-sm text-[#555555] mt-0.5">
                      {activeCampaign.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {isUserDM(activeCampaign, user?.uid) && (
                    <button
                      onClick={() => setIsTransferDmModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Pass Dungeon Master role to another player"
                    >
                      <Crown size={14} />
                      <span>Pass DM Role</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsSplitModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Coins size={14} />
                    <span>Split Wealth Equally</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('SESSIONS')}
                    className="px-4 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Scroll size={14} />
                    <span>Open Chronicler</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex gap-6 border-b border-[#141414]/15 pt-2 text-xs font-display uppercase tracking-widest text-[#777777]">
                {[
                  { id: 'overview', label: 'Overview & Party Roster', icon: Users },
                  { id: 'quests', label: `Quest Board (${activeCampaign.questLog.filter(q => q.status === 'in_progress').length})`, icon: Sword },
                  { id: 'timeline', label: 'Session Timeline', icon: Clock },
                  { id: 'handouts', label: `Handouts & Lore (${activeCampaign.handouts.length})`, icon: Scroll }
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = activeSubTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveSubTab(t.id as any)}
                      className={`pb-3 flex items-center gap-2 font-bold transition-all relative cursor-pointer ${
                        isActive ? 'text-[#161616]' : 'hover:text-[#161616]'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-[var(--accent-ink)]' : ''} />
                      <span>{t.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeCampaignSubTabIndicator"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-ink)] shadow-[0_0_8px_var(--accent-glow)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Tab Content */}
            <div className="p-6 flex flex-col gap-6 text-[#161616]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="flex flex-col gap-6 w-full"
                >
                  {/* SUB-TAB 1: OVERVIEW & PARTY ROSTER */}
                  {activeSubTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Synopsis Box */}
                  <div className="p-4 bg-white/90 border border-[#141414]/15 rounded-sm shadow-xs">
                    <h4 className="text-xs font-display uppercase tracking-wider text-[var(--accent-ink)] font-bold mb-1">
                      Campaign Premise & Setting
                    </h4>
                    <p className="font-serif text-sm text-[#161616] leading-relaxed">
                      {activeCampaign.description}
                    </p>
                  </div>

                  {/* Party Roster Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                        Adventuring Party ({activeCampaign.party.length} Heroes)
                      </h3>
                      <button
                        onClick={() => populateSampleParty(activeCampaign.id)}
                        className="px-3.5 py-1.5 border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Add 4 standard test heroes for testing views"
                      >
                        <Sparkles size={13} className="text-[var(--accent-ink)]" />
                        <span>{activeCampaign.party.length === 0 ? 'Populate 4 Test Heroes' : 'Reset / Add 4 Test Heroes'}</span>
                      </button>
                    </div>

                    {activeCampaign.party.length === 0 ? (
                      <div className="p-8 text-center bg-[#fcfbf9] border-2 border-black/30 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden shadow-xl">
                        <div className="p-3 bg-black/5 border border-black/10 rounded-full">
                          <Users size={32} className="text-[var(--accent-ink)]" />
                        </div>
                        <p className="text-xs font-serif text-[#555555] max-w-md">
                          No party members in this chronicle yet. Click below to add 4 test heroes (Paladin, Rogue, Cleric, Sorcerer).
                        </p>
                        <button
                          onClick={() => populateSampleParty(activeCampaign.id)}
                          className="px-5 py-2.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                        >
                          <Sparkles size={14} />
                          <span>Populate 4 Test Heroes</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeCampaign.party.map(member => (
                          <div
                            key={member.id}
                            className="p-4 bg-white/90 border border-[#141414]/15 rounded-sm flex flex-col justify-between gap-3 shadow-xs group transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center font-display font-bold text-base shadow-xs">
                                {member.avatarUrl ? (
                                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  member.name.charAt(0)
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="font-display text-sm font-bold text-[#161616] uppercase truncate">
                                  {member.name}
                                </h4>
                                <span className="text-xs font-serif text-[var(--accent-ink)] font-bold truncate">
                                  Level {member.level} {member.class}
                                </span>
                                <span className="text-[10px] font-serif text-[#555555]">
                                  Player: {member.player}
                                </span>
                              </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-3 gap-1.5 bg-black/5 p-2 rounded text-center text-xs font-mono">
                              <div>
                                <span className="block text-[8px] font-display text-[#777777] uppercase font-bold">HP</span>
                                <span className="font-bold text-[#161616]">{member.hpCurrent}/{member.hpMax}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-display text-[#777777] uppercase font-bold">AC</span>
                                <span className="font-bold text-[var(--accent-ink)]">{member.ac}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-display text-[#777777] uppercase font-bold">Pass. Perc</span>
                                <span className="font-bold text-[#555555]">{member.passivePerception}</span>
                              </div>
                            </div>

                            {member.dmShareCode && (
                              <div className="text-[10px] font-mono text-[#555555] text-center">
                                Code: <span className="text-[var(--accent-ink)] font-bold">{member.dmShareCode}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shared Wealth Chest Summary */}
                  <div className="p-5 bg-white/90 border border-[#141414]/15 rounded-sm flex flex-col gap-3.5 shadow-xs">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-black/5 border border-black/10 rounded">
                          <Coins size={16} className="text-[var(--accent-ink)]" />
                        </div>
                        <h4 className="font-display text-xs uppercase tracking-wider text-[#1a1a1a] font-bold">
                          Party Treasury Chest
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsSplitModalOpen(true)}
                        className="text-xs font-display uppercase tracking-wider text-[var(--accent-ink)] hover:underline font-bold cursor-pointer"
                      >
                        Split Among Party
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      {[
                        { label: 'Platinum', key: 'pp', val: activeCampaign.treasury.pp || 0, svg: ASSET_MAP.currency.pp, color: 'text-[#161616]' },
                        { label: 'Gold', key: 'gp', val: activeCampaign.treasury.gp || 0, svg: ASSET_MAP.currency.gp, color: 'text-[var(--accent-ink)]' },
                        { label: 'Electrum', key: 'ep', val: activeCampaign.treasury.ep || 0, svg: ASSET_MAP.currency.ep, color: 'text-[#555555]' },
                        { label: 'Silver', key: 'sp', val: activeCampaign.treasury.sp || 0, svg: ASSET_MAP.currency.sp, color: 'text-[#555555]' },
                        { label: 'Copper', key: 'cp', val: activeCampaign.treasury.cp || 0, svg: ASSET_MAP.currency.cp, color: 'text-[#888888]' }
                      ].map(coin => (
                        <div key={coin.key} className="p-3 bg-white border border-[#141414]/15 rounded shadow-xs flex flex-col items-center gap-1">
                          <img src={coin.svg} alt={coin.label} className="w-8 h-8 object-contain drop-shadow-xs" />
                          <span className="text-[9px] font-display uppercase text-[#555555] font-bold">{coin.label}</span>
                          <div className={`font-mono text-sm sm:text-base font-bold ${coin.color}`}>
                            {coin.val.toLocaleString()} {coin.key.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SUB-TAB 2: QUEST BOARD */}
              {activeSubTab === 'quests' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                        Campaign Quest Board
                      </h3>
                      <p className="text-xs font-serif text-[#555555]">
                        Track main story missions, faction contracts, and tavern bounties.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingQuest(true)}
                      className="px-4 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>+ Add Quest</span>
                    </button>
                  </div>

                  {/* Quests Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCampaign.questLog.map(quest => (
                      <div
                        key={quest.id}
                        className={`p-4 rounded-sm bg-white/90 border flex flex-col justify-between gap-3 shadow-xs transition-all ${
                          quest.status === 'completed'
                            ? 'border-[#1EB253]/40 bg-[#1EB253]/5 opacity-85'
                            : 'border-[#141414]/15 hover:border-black/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-widest font-bold ${
                                quest.priority === 'main'
                                  ? 'bg-[var(--accent-ink)]/15 text-[var(--accent-ink)]'
                                  : quest.priority === 'side'
                                  ? 'bg-black/10 text-[#555555]'
                                  : 'bg-[#E33526]/15 text-[#c53030]'
                              }`}>
                                {quest.priority}
                              </span>
                              <span className={`text-[10px] font-mono uppercase font-bold ${
                                quest.status === 'completed' ? 'text-[#1EB253]' : 'text-[var(--accent-ink)]'
                              }`}>
                                {quest.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h4 className="font-display text-sm font-bold text-[#161616] uppercase mt-1">
                              {quest.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuest(activeCampaign.id, quest.id, {
                                status: quest.status === 'completed' ? 'in_progress' : 'completed'
                              })}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                quest.status === 'completed'
                                  ? 'text-[#1EB253] hover:bg-[#1EB253]/15'
                                  : 'text-[#555555] hover:text-[#1EB253] hover:bg-black/5'
                              }`}
                              title={quest.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => deleteQuest(activeCampaign.id, quest.id)}
                              className="p-1.5 text-[#555555] hover:text-[#c53030] rounded transition-colors cursor-pointer"
                              title="Delete Quest"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p className="font-serif text-xs text-[#555555] leading-relaxed">
                          {quest.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between text-xs font-serif text-[#555555] pt-2 border-t border-[#141414]/15">
                          {quest.giver && <span>Giver: <strong className="text-[#161616]">{quest.giver}</strong></span>}
                          {quest.reward && <span>Reward: <strong className="text-[var(--accent-ink)]">{quest.reward}</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: TIMELINE */}
              {activeSubTab === 'timeline' && (
                <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
                  <div className="border-b border-[#141414]/15 pb-3">
                    <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                      Campaign Storyline Milestones
                    </h3>
                    <p className="text-xs font-serif text-[#555555]">
                      Chronological history of triumphs, encounters, and critical narrative beats.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 pl-4 border-l-2 border-[var(--accent-ink)] relative">
                    {activeCampaign.milestones.map((m) => (
                      <div key={m.id} className="relative flex flex-col gap-1 pl-4">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[var(--accent-ink)] border-2 border-white shadow-[0_0_8px_var(--accent-glow)]" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">
                            {m.date}
                          </span>
                          {m.sessionNumber && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-display uppercase bg-white border border-[#141414]/15 text-[#555555] font-bold">
                              Session #{m.sessionNumber}
                            </span>
                          )}
                        </div>
                        <h4 className="font-display text-sm font-bold text-[#161616] uppercase">
                          {m.title}
                        </h4>
                        <p className="font-serif text-xs text-[#555555]">
                          {m.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: HANDOUTS & LORE REPOSITORY */}
              {activeSubTab === 'handouts' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                        Handouts & Lore Repository
                      </h3>
                      <p className="text-xs font-serif text-[#555555]">
                        Broadcast maps, secret letters, monster sketches, and ancient tomes.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingHandout(true)}
                      className="px-4 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>+ Add Handout</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCampaign.handouts.map(handout => (
                      <div
                        key={handout.id}
                        onClick={() => {
                          setSelectedHandout(handout);
                          setIsHandoutModalOpen(true);
                        }}
                        className="p-4 bg-white/90 border border-[#141414]/15 hover:border-black/40 rounded-sm flex flex-col justify-between gap-3 shadow-xs cursor-pointer group transition-all"
                      >
                        {handout.imageUrl && (
                          <div className="w-full h-36 rounded-sm overflow-hidden border border-[#141414]/15 bg-white">
                            <img src={handout.imageUrl} alt={handout.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-widest font-bold">
                              {handout.type}
                            </span>
                            <div className="flex items-center gap-1">
                              {handout.isRevealedToParty ? (
                                <span title="Revealed to party"><Eye size={13} className="text-[#1EB253]" /></span>
                              ) : (
                                <span title="DM Only"><EyeOff size={13} className="text-[#c53030]" /></span>
                              )}
                            </div>
                          </div>

                          <h4 className="font-display text-sm font-bold text-[#161616] group-hover:text-black uppercase mt-2 truncate">
                            {handout.title}
                          </h4>

                          <p className="font-serif text-xs text-[#555555] line-clamp-2 mt-1">
                            {handout.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-serif text-[#777777] pt-2 border-t border-[#141414]/10">
                          <span>{new Date(handout.dateAdded || (handout as any).createdAt || Date.now()).toLocaleDateString()}</span>
                          <span className="text-[var(--accent-ink)] font-bold group-hover:translate-x-0.5 transition-transform">Inspect Handout →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#777777] gap-3">
            <BookOpen size={48} className="text-black/20" />
            <h3 className="font-serif text-lg text-[#161616] font-bold">No Campaign Selected</h3>
            <p className="font-serif text-xs max-w-sm">
              Select an active campaign chronicle from the left directory or create a new saga to begin.
            </p>
          </div>
        )}

      </div>

      {/* MODALS */}
      <HandoutDetailModal
        isOpen={isHandoutModalOpen}
        onClose={() => setIsHandoutModalOpen(false)}
        handout={selectedHandout}
        onToggleVisibility={activeCampaign ? (id) => toggleHandoutVisibility(activeCampaign.id, id) : undefined}
      />

      <PartySplitModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* ADD QUEST MODAL */}
      {isAddingQuest && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 text-[#161616]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Add Campaign Quest
              </h3>
              <button onClick={() => setIsAddingQuest(false)} className="text-[#777777] hover:text-[#161616] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddQuestSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Quest Title *</label>
                <input
                  type="text"
                  required
                  value={newQuestTitle}
                  onChange={e => setNewQuestTitle(e.target.value)}
                  placeholder="e.g. Infiltrate the Sunken Grotto"
                  className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Priority</label>
                  <select
                    value={newQuestPriority}
                    onChange={e => setNewQuestPriority(e.target.value as any)}
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                  >
                    <option value="main">Main Story</option>
                    <option value="side">Side Quest</option>
                    <option value="bounty">Bounty / Contract</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Quest Giver</label>
                  <input
                    type="text"
                    value={newQuestGiver}
                    onChange={e => setNewQuestGiver(e.target.value)}
                    placeholder="e.g. Captain Vane"
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Reward</label>
                <input
                  type="text"
                  value={newQuestReward}
                  onChange={e => setNewQuestReward(e.target.value)}
                  placeholder="e.g. 500 gp & Map to Sunken Citadel"
                  className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Description / Objectives</label>
                <textarea
                  rows={3}
                  value={newQuestDesc}
                  onChange={e => setNewQuestDesc(e.target.value)}
                  placeholder="Details of the task..."
                  className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs resize-none focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsAddingQuest(false)}
                  className="px-3 py-1.5 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs font-display uppercase tracking-wider font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase font-bold rounded-xs transition-all shadow-xs cursor-pointer"
                >
                  Add Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HANDOUT MODAL */}
      {isAddingHandout && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-5 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-[#161616]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-[#1a1a1a] font-bold">
                Add Handout or Lore Document
              </h3>
              <button onClick={() => setIsAddingHandout(false)} className="text-[#777777] hover:text-[#161616] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddHandoutSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Handout Title *</label>
                <input
                  type="text"
                  required
                  value={newHandoutTitle}
                  onChange={e => setNewHandoutTitle(e.target.value)}
                  placeholder="e.g. Map of the Sunken Crypts"
                  className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Type</label>
                  <select
                    value={newHandoutType}
                    onChange={e => setNewHandoutType(e.target.value as any)}
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                  >
                    <option value="map">Map</option>
                    <option value="letter">Letter / Parchment</option>
                    <option value="lore">Lore Treatise</option>
                    <option value="item">Discovered Artifact</option>
                    <option value="npc">NPC Portrait / Dossier</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newHandoutUrl}
                    onChange={e => setNewHandoutUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-display uppercase text-[#555555] font-bold">Content / Parchment Text</label>
                <textarea
                  rows={4}
                  required
                  value={newHandoutContent}
                  onChange={e => setNewHandoutContent(e.target.value)}
                  placeholder="Write the letter contents, deciphered runes, or lore background..."
                  className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-[#161616] rounded font-serif text-xs resize-none focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsAddingHandout(false)}
                  className="px-3 py-1.5 border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs font-display uppercase tracking-wider font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase font-bold rounded-xs transition-all shadow-xs cursor-pointer"
                >
                  Save Handout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer DM Role Modal */}
      <TransferDmRoleModal
        isOpen={isTransferDmModalOpen}
        onClose={() => setIsTransferDmModalOpen(false)}
        campaign={activeCampaign}
      />

    </div>
  );
}
