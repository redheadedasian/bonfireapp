import { useStore } from '../store';
import { useCampaignStore } from '../store/campaignStore';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Campaign } from '../types/campaign';

export function isUserDM(campaign: Campaign | null | undefined, userId?: string | null): boolean {
  if (!campaign || !campaign.dmUserId) return false;
  if (!userId) return false;
  if (campaign.dmUserId === userId) return true;
  if (campaign.dmUserId === 'dm_local' || campaign.dmUserId === 'local_dm') return true;
  return false;
}

export interface ParsedRoute {
  type: 'home' | 'dm' | 'hud' | 'inventory' | 'journal' | 'sessions' | 'campaign_hub' | 'unknown';
  campaignId?: string;
}

export function parseRoute(pathname: string): ParsedRoute {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // Check /campaigns/:id/dm
  const dmMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/dm$/i);
  if (dmMatch) {
    return { type: 'dm', campaignId: dmMatch[1] };
  }

  // Check /campaigns/:id/hud or /campaigns/:id/character
  const hudMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/(hud|character)$/i);
  if (hudMatch) {
    return { type: 'hud', campaignId: hudMatch[1] };
  }

  // Check /campaigns/:id/inventory
  const invMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/inventory$/i);
  if (invMatch) {
    return { type: 'inventory', campaignId: invMatch[1] };
  }

  // Check /campaigns/:id/journal
  const journalMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/journal$/i);
  if (journalMatch) {
    return { type: 'journal', campaignId: journalMatch[1] };
  }

  // Check /campaigns/:id/sessions
  const sessionMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/sessions$/i);
  if (sessionMatch) {
    return { type: 'sessions', campaignId: sessionMatch[1] };
  }

  // Check /campaigns/:id
  const campMatch = cleanPath.match(/^\/campaigns\/([^/]+)$/i);
  if (campMatch && campMatch[1] !== 'new') {
    return { type: 'hud', campaignId: campMatch[1] };
  }

  // Check /campaigns, /home, /
  if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/campaigns') {
    return { type: 'home' };
  }

  return { type: 'unknown' };
}

export function evaluateRoute(pathname: string): { allowed: boolean; finalPath: string } {
  const parsed = parseRoute(pathname);
  const { campaigns, setActiveCampaignId, activeCampaignId } = useCampaignStore.getState();
  const { setActiveTab } = useStore.getState();
  const { user } = useAuthStore.getState();
  const { showToast } = useToastStore.getState();

  if (parsed.type === 'home') {
    setActiveTab('HOME');
    return { allowed: true, finalPath: '/' };
  }

  if (parsed.campaignId) {
    const targetCampaign = campaigns.find(c => c.id === parsed.campaignId) || campaigns[0];
    const campaignId = targetCampaign ? targetCampaign.id : parsed.campaignId;
    setActiveCampaignId(campaignId);

    if (parsed.type === 'dm') {
      const isDm = isUserDM(targetCampaign, user?.uid);
      if (isDm) {
        setActiveTab('DM_COMMAND');
        return { allowed: true, finalPath: `/campaigns/${campaignId}/dm` };
      } else {
        // SECURITY GUARD INTERCEPTION: Non-DM user attempting to view DM route
        const redirectedPath = `/campaigns/${campaignId}/hud`;
        setActiveTab('CHARACTER / HUD');
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', redirectedPath);
        }
        showToast('Access Restricted: Grimoire Sealed to the Dungeon Master', 'warning', 5000);
        return { allowed: false, finalPath: redirectedPath };
      }
    }

    if (parsed.type === 'inventory') {
      setActiveTab('INVENTORY');
      return { allowed: true, finalPath: `/campaigns/${campaignId}/inventory` };
    }

    if (parsed.type === 'journal') {
      setActiveTab('JOURNAL');
      return { allowed: true, finalPath: `/campaigns/${campaignId}/journal` };
    }

    if (parsed.type === 'sessions') {
      setActiveTab('SESSIONS');
      return { allowed: true, finalPath: `/campaigns/${campaignId}/sessions` };
    }

    // Default to HUD / Player view
    setActiveTab('CHARACTER / HUD');
    return { allowed: true, finalPath: `/campaigns/${campaignId}/hud` };
  }

  return { allowed: true, finalPath: pathname };
}

export function navigateTo(path: string, replace: boolean = false): void {
  if (typeof window === 'undefined') return;

  const result = evaluateRoute(path);
  if (replace || !result.allowed) {
    window.history.replaceState(null, '', result.finalPath);
  } else {
    window.history.pushState(null, '', result.finalPath);
  }
}

export function syncUrlWithTab(tab: string, campaignId?: string): void {
  if (typeof window === 'undefined') return;

  const activeId = campaignId || useCampaignStore.getState().activeCampaignId || 'cmp_drakkenheim_01';
  let targetPath = '/';

  switch (tab) {
    case 'HOME':
      targetPath = '/';
      break;
    case 'DM_COMMAND':
      targetPath = `/campaigns/${activeId}/dm`;
      break;
    case 'CHARACTER / HUD':
      targetPath = `/campaigns/${activeId}/hud`;
      break;
    case 'INVENTORY':
      targetPath = `/campaigns/${activeId}/inventory`;
      break;
    case 'JOURNAL':
      targetPath = `/campaigns/${activeId}/journal`;
      break;
    case 'SESSIONS':
      targetPath = `/campaigns/${activeId}/sessions`;
      break;
    case 'CAMPAIGNS':
      targetPath = `/campaigns/${activeId}/hud`;
      break;
    default:
      targetPath = `/campaigns/${activeId}/hud`;
      break;
  }

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (currentPath !== targetPath) {
    const evalResult = evaluateRoute(targetPath);
    window.history.pushState(null, '', evalResult.finalPath);
  }
}
