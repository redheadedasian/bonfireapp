import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { useCampaignStore } from '../../store/campaignStore';
import { BonfireLogo } from '../ui/BonfireLogo';
import { CharacterSelector } from '../character/CharacterSelector';
import { RestModal } from '../character/RestModal';
import { AuthModal } from '../auth/AuthModal';
import { ASSET_MAP } from '@/config/assets';
import { 
  BookOpen, 
  Upload, 
  Pencil, 
  Moon, 
  Cloud, 
  User, 
  Compass, 
  Swords, 
  Scroll, 
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Flame,
  Palette
} from 'lucide-react';
import { ThemeColorPicker } from '../common/ThemeColorPicker';

interface TopNavigationProps {
  onOpenSettings: () => void;
  onOpenCharacterModal: () => void;
}

export function TopNavigation({ onOpenSettings, onOpenCharacterModal }: TopNavigationProps) {
  const { activeTab, setActiveTab, isEditMode, setEditMode } = useStore();
  const { user, isAuthenticated, syncStatus, initAuth } = useAuthStore();
  const { getActiveCampaign } = useCampaignStore();

  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const activeCampaign = getActiveCampaign();
  const isDmMode = activeTab === 'DM_COMMAND';
  const isHomeMode = activeTab === 'HOME';

  // Character Sheet tabs (only displayed when in character player mode)
  const PLAYER_TABS = [
    { id: 'CHARACTER / HUD', label: 'CHARACTER / HUD' },
    { id: 'INVENTORY', label: 'INVENTORY & STASH' },
    { id: 'JOURNAL', label: 'JOURNAL' },
    { id: 'SESSIONS', label: 'SESSIONS & CHRONICLER' },
  ];

  return (
    <div className="flex flex-col shrink-0 z-20 select-none shadow-[0_2px_12px_rgba(0,0,0,0.06)] relative">
      {/* Rest / Campfire Modal */}
      <RestModal isOpen={isRestModalOpen} onClose={() => setIsRestModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Main Top Bar */}
      <div className="w-full bg-white/85 backdrop-blur-xs border-b border-[#141414]/15 z-10">
        <div className="max-w-[1920px] mx-auto w-full flex justify-between items-center px-4 sm:px-6 py-2">
          
          {/* Left Section: Brand Logo & Context */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Bonfire Logo (Always routes to Campaign Home Portal) */}
            <button 
              type="button"
              className="flex items-center cursor-pointer group transition-all bg-transparent border-0 p-0 m-0 outline-none" 
              onClick={() => setActiveTab('HOME')}
              title="Bonfire - Return to Campaign Home Portal"
              id="top-nav-brand-logo"
            >
              <BonfireLogo height={52} className="max-h-[50px] sm:max-h-[56px] w-auto" />
            </button>
            
            {/* If in DM Mode: show DM Mode Badge and Back Button */}
            {isDmMode ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('HOME')}
                  className="px-3.5 py-1.5 bg-white/[0.95] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Campaigns Home</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-white/90 border border-black/15 rounded text-xs text-[#161616]">
                  <Compass size={13} className="text-[var(--accent-ink)]" />
                  <span className="font-display font-bold text-[#161616]">
                    DM Console: {activeCampaign?.title || 'Active Session'}
                  </span>
                </div>
              </div>
            ) : isHomeMode ? (
              /* If on Home Page: show Home Portal tagline */
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-white/90 border border-black/15 rounded-md text-xs text-[#161616]">
                <Flame size={13} className="text-[var(--accent-ink)]" />
                <span className="font-display text-[11px] uppercase tracking-widest text-[#555555] font-bold">
                  Campaign Chronicles & Sagas Portal
                </span>
              </div>
            ) : (
              /* If in Player Character Sheet Mode: show Character Selector & Active Campaign badge */
              <>
                <div className="hidden md:block">
                  <CharacterSelector onOpenModal={onOpenCharacterModal} />
                </div>

                {activeCampaign && (
                  <div 
                    onClick={() => setActiveTab('HOME')}
                    className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-black/15 rounded-md text-xs cursor-pointer hover:border-[var(--accent-ink)] hover:shadow-sm transition-all group shadow-xs"
                    title="Click to switch campaigns (Home Portal)"
                  >
                    <Compass size={14} className="text-[var(--accent-ink)] group-hover:rotate-45 transition-transform" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] font-display uppercase tracking-widest text-[#777777] font-bold">Campaign</span>
                      <span className="font-display font-bold text-[11px] text-[#161616] group-hover:text-[var(--accent-ink)] truncate max-w-[140px]">
                        {activeCampaign.title}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex gap-2 sm:gap-2.5 items-center">
            
            {/* Firebase Auth & Cloud Sync Profile Badge */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`px-3 py-1.5 border-[1.5px] bg-white/[0.95] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded text-xs font-display uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                isAuthenticated && user && !user.isAnonymous
                  ? 'text-[#276749] border-[#276749]/60'
                  : 'text-[#1a1a1a] border-[#1a1a1a]'
              }`}
              title="Cloud Character Vault & Firebase Account"
            >
              {isAuthenticated && user && !user.isAnonymous ? (
                <>
                  <Cloud size={14} className={syncStatus === 'syncing' ? 'animate-spin text-[var(--accent-ink)]' : 'text-[#276749]'} />
                  <span className="hidden sm:inline font-bold">{user.displayName || 'Vault Synced'}</span>
                </>
              ) : (
                <>
                  <Cloud size={14} className="text-[#555555]" />
                  <span className="hidden sm:inline font-bold">Sign In / Cloud</span>
                </>
              )}
            </button>

            {!isHomeMode && !isDmMode && (
              <>
                {/* Rest / Campfire Button */}
                <button
                  onClick={() => setIsRestModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white/[0.95] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] font-display text-xs tracking-[0.15em] transition-all shadow-xs flex items-center gap-1.5 rounded group font-bold cursor-pointer"
                  title="Take a Short or Long Rest (Campfire)"
                >
                  <Moon size={14} className="text-[var(--accent-ink)] group-hover:text-white group-hover:rotate-12 transition-all" />
                  <span>REST</span>
                </button>

                {/* Journal Button */}
                <button
                  onClick={() => setActiveTab('JOURNAL')}
                  className={`px-3.5 py-1.5 font-display text-xs tracking-[0.15em] transition-all shadow-xs hidden sm:flex items-center gap-1.5 rounded font-bold border-[1.5px] cursor-pointer ${
                    activeTab === 'JOURNAL'
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)] drop-shadow-[0_0_8px_var(--accent-glow)]'
                      : 'bg-white/[0.95] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)]'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>JOURNAL</span>
                </button>
                
                {/* Edit Mode Toggle */}
                <button
                  onClick={() => setEditMode(!isEditMode)}
                  className={`p-2 rounded border-[1.5px] transition-all shadow-xs cursor-pointer ${
                    isEditMode 
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)] drop-shadow-[0_0_8px_var(--accent-glow)]' 
                      : 'bg-white/[0.95] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)]'
                  }`}
                  title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                >
                  <Pencil size={15} />
                </button>
              </>
            )}

            {/* Theme Ink Palette Selector */}
            <div className="relative">
              <button
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className={`p-2 border-[1.5px] rounded transition-all shadow-xs cursor-pointer ${
                  isThemePickerOpen
                    ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)] drop-shadow-[0_0_8px_var(--accent-glow)]'
                    : 'bg-white/[0.95] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[var(--accent-ink)] hover:text-white hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)]'
                }`}
                title="Select Watercolor Ink Theme for this Character"
              >
                <Palette size={15} />
              </button>

              {/* Popover Card */}
              {isThemePickerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsThemePickerOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 p-3 bg-white/98 border-2 border-black/30 rounded-md shadow-2xl animate-fadeIn text-[#161616]">
                    <ThemeColorPicker />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sub Navigation Bar - Only show Character Sheet tabs when in Player view */}
      {!isHomeMode && !isDmMode && (
        <div className="w-full bg-white/90 border-b border-[#141414]/15 z-10">
          <div className="max-w-[1920px] mx-auto w-full flex px-4 sm:px-6 gap-4 sm:gap-8 overflow-x-auto hide-scrollbar text-xs sm:text-sm font-display tracking-[0.18em] text-[#555555] justify-center relative">
            {PLAYER_TABS.map((tab) => {
              const isActive =
                activeTab === tab.id ||
                (tab.id === 'CHARACTER / HUD' && (activeTab === 'COMBAT / HUD' || activeTab === 'CHARACTER'));
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 whitespace-nowrap transition-colors relative font-bold outline-none flex flex-col items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'text-[#161616]'
                      : 'hover:text-[#161616]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute -bottom-1 left-0 right-0 h-3 flex items-center justify-center pointer-events-none"
                    >
                      <img
                        src={ASSET_MAP.ui.tabLine}
                        alt="Active Tab Indicator"
                        className="w-full max-w-[180px] h-full object-contain filter drop-shadow-[0_0_4px_var(--accent-glow)]"
                      />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
