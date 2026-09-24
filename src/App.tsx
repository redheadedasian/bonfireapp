import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from './store';
import { useCampaignStore } from './store/campaignStore';
import { useAuthStore } from './store/authStore';
import { ACCENT_THEMES } from './types';
import { TopNavigation } from './components/layout/TopNavigation';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { CenterStage } from './components/layout/CenterStage';
import { RightSidebar } from './components/layout/RightSidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/ToastContainer';
import { evaluateRoute, syncUrlWithTab } from './services/router';

// Lazy-loaded portals & secondary heavy modules for bundle optimization
const ImportExportModal = lazy(() => import('./components/character/ImportExportModal').then(m => ({ default: m.ImportExportModal })));
const DicePanel = lazy(() => import('./components/dice/DicePanel').then(m => ({ default: m.DicePanel })));
const SessionChroniclerTab = lazy(() => import('./components/chronicler/SessionChroniclerTab').then(m => ({ default: m.SessionChroniclerTab })));
const CampaignHomePortal = lazy(() => import('./components/campaigns/CampaignHomePortal').then(m => ({ default: m.CampaignHomePortal })));
const CampaignsHub = lazy(() => import('./components/campaigns/CampaignsHub').then(m => ({ default: m.CampaignsHub })));
const DmCommandView = lazy(() => import('./components/dm/DmCommandView').then(m => ({ default: m.DmCommandView })));

function PortalLoadingFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#555555] select-none">
      <div className="w-8 h-8 border-2 border-[var(--accent-ink)] border-t-transparent rounded-full animate-spin" />
      <span className="font-display text-xs uppercase tracking-widest font-bold">Summoning Chronicle...</span>
    </div>
  );
}

export default function App() {
  const { activeTab, setActiveTab, character } = useStore();
  const { activeCampaignId } = useCampaignStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'roster' | 'vitals' | 'data'>('roster');

  const themeKey = character.theme?.accentColor || 'default';
  const activeTheme = ACCENT_THEMES[themeKey] || ACCENT_THEMES.default;
  const accentInk = character.theme?.customHex || activeTheme.ink;
  const accentGlow = activeTheme.glow;

  // 1. Initial Route Evaluation, Popstate Security Guard Listener & Test Campaign Hydration
  useEffect(() => {
    evaluateRoute(window.location.pathname);

    // Auto-populate 4 sample heroes for any test campaigns created with empty party (e.g. "test 2")
    const { campaigns, populateSampleParty } = useCampaignStore.getState();
    campaigns.forEach(c => {
      if ((c.title.toLowerCase().includes('test') || c.title.toLowerCase() === 'test 2') && (!c.party || c.party.length === 0)) {
        populateSampleParty(c.id);
      }
    });

    const handlePopState = () => {
      evaluateRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Re-evaluate security guard when user auth state changes (e.g. login/logout while on DM view)
  useEffect(() => {
    if (activeTab === 'DM_COMMAND') {
      evaluateRoute(window.location.pathname);
    }
  }, [user?.uid]);

  // 3. Sync URL whenever active tab or active campaign changes
  useEffect(() => {
    syncUrlWithTab(activeTab, activeCampaignId);
  }, [activeTab, activeCampaignId]);

  const openDataModal = () => {
    setModalTab('data');
    setIsModalOpen(true);
  };

  const openCharacterModal = () => {
    setModalTab('roster');
    setIsModalOpen(true);
  };

  return (
    <ErrorBoundary>
      <div 
        className="h-screen w-screen flex flex-col washi-bg text-[#161616] font-serif overflow-hidden select-none"
        style={{
          '--accent-ink': accentInk,
          '--accent-glow': accentGlow,
        } as React.CSSProperties}
      >
        <Suspense fallback={null}>
          <ToastContainer />
          {activeTab !== 'HOME' && <DicePanel />}
          <ImportExportModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialTab={modalTab}
          />
        </Suspense>
        
        <TopNavigation 
          onOpenSettings={openDataModal}
          onOpenCharacterModal={openCharacterModal}
        />
        
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden max-w-[1920px] mx-auto">
          <Suspense fallback={<PortalLoadingFallback />}>
            <AnimatePresence mode="wait">
              {activeTab === 'HOME' ? (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-full w-full overflow-hidden"
                >
                  <CampaignHomePortal 
                    onSelectCampaign={() => {}} 
                  />
                </motion.div>
              ) : activeTab === 'DM_COMMAND' ? (
                <motion.div 
                  key="dm_command"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-full w-full overflow-hidden"
                >
                  <DmCommandView />
                </motion.div>
              ) : activeTab === 'CAMPAIGNS' ? (
                <motion.div 
                  key="campaigns"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-full w-full overflow-hidden"
                >
                  <CampaignsHub />
                </motion.div>
              ) : activeTab === 'SESSIONS' ? (
                <motion.div 
                  key="sessions"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-full w-full overflow-hidden"
                >
                  <SessionChroniclerTab />
                </motion.div>
              ) : (
                <motion.div 
                  key="player_hud"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-full w-full grid grid-cols-[380px_1fr_360px] overflow-hidden"
                >
                  <LeftSidebar />
                  <CenterStage />
                  <RightSidebar />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}
