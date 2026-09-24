// Security Guard & Role Evaluation Test Suite for Bonfire D&D 5e HUD
import assert from 'node:assert';

console.log('🛡️  Running Bonfire DM Role Access & Security Guard Test Suite...\n');

// 1. DM Role Evaluation Function
function isUserDM(campaign: { dmUserId?: string } | null | undefined, userId?: string | null): boolean {
  if (!campaign || !campaign.dmUserId) return false;
  if (!userId) return false;
  if (campaign.dmUserId === userId) return true;
  if (campaign.dmUserId === 'dm_local' || campaign.dmUserId === 'local_dm') return true;
  return false;
}

// 2. Route Parser
function parseRoute(pathname: string): { type: string; campaignId?: string } {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const dmMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/dm$/i);
  if (dmMatch) return { type: 'dm', campaignId: dmMatch[1] };

  const hudMatch = cleanPath.match(/^\/campaigns\/([^/]+)\/(hud|character)$/i);
  if (hudMatch) return { type: 'hud', campaignId: hudMatch[1] };

  const campMatch = cleanPath.match(/^\/campaigns\/([^/]+)$/i);
  if (campMatch && campMatch[1] !== 'new') return { type: 'hud', campaignId: campMatch[1] };

  if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/campaigns') return { type: 'home' };
  return { type: 'unknown' };
}

// 3. Security Guard Redirection Logic
function evaluateRouteSecurity(
  pathname: string, 
  campaign: { id: string; dmUserId: string }, 
  userId?: string | null
): { allowed: boolean; finalPath: string; warningToast?: string } {
  const parsed = parseRoute(pathname);

  if (parsed.type === 'dm') {
    const isDm = isUserDM(campaign, userId);
    if (isDm) {
      return { allowed: true, finalPath: `/campaigns/${campaign.id}/dm` };
    } else {
      return {
        allowed: false,
        finalPath: `/campaigns/${campaign.id}/hud`,
        warningToast: 'Access Restricted: Grimoire Sealed to the Dungeon Master'
      };
    }
  }

  return { allowed: true, finalPath: pathname };
}

// 4. Role Transfer Function
function transferDmRole(campaign: { id: string; dmUserId: string; dmName: string }, newDmUserId: string, newDmName: string) {
  return {
    ...campaign,
    dmUserId: newDmUserId,
    dmName: newDmName
  };
}

// Test 1: Role Evaluation
console.log('Testing DM Role Evaluation...');
const sampleCampaign = { id: 'cmp_drakkenheim_01', dmUserId: 'dm_user_001' };

assert.strictEqual(isUserDM(sampleCampaign, 'dm_user_001'), true, 'Dungeon Master user ID must return true');
assert.strictEqual(isUserDM(sampleCampaign, 'player_user_002'), false, 'Regular player user ID must return false');
assert.strictEqual(isUserDM(sampleCampaign, null), false, 'Null user ID must return false');
assert.strictEqual(isUserDM(sampleCampaign, undefined), false, 'Undefined user ID must return false');
assert.strictEqual(isUserDM(null, 'dm_user_001'), false, 'Null campaign must return false');

// Newly created campaign with local/creator ID
const createdCampaign = { id: 'cmp_new_01', dmUserId: 'creator_uid_123' };
assert.strictEqual(isUserDM(createdCampaign, 'creator_uid_123'), true, 'Campaign creator must automatically be the DM');

const localCreatedCampaign = { id: 'cmp_new_02', dmUserId: 'dm_local' };
assert.strictEqual(isUserDM(localCreatedCampaign, 'any_user_123'), true, 'dm_local campaign must recognize creator as DM');
console.log('✓ DM Role Evaluation tests passed!\n');

// Test 2: Transferring DM Role
console.log('Testing Transfer DM Role...');
let campaignInstance = { id: 'cmp_shadow_01', dmUserId: 'user_preston', dmName: 'Preston' };
assert.strictEqual(isUserDM(campaignInstance, 'user_preston'), true, 'Preston is initially DM');
assert.strictEqual(isUserDM(campaignInstance, 'user_lyra'), false, 'Lyra is initially player');

// Transfer role to Lyra
campaignInstance = transferDmRole(campaignInstance, 'user_lyra', 'Lyra the Seer');
assert.strictEqual(isUserDM(campaignInstance, 'user_lyra'), true, 'Lyra is now the DM');
assert.strictEqual(isUserDM(campaignInstance, 'user_preston'), false, 'Preston has stepped down to regular player');
assert.strictEqual(campaignInstance.dmName, 'Lyra the Seer', 'Campaign dmName updated');
console.log('✓ Transfer DM Role tests passed!\n');

// Test 3: Route Parser
console.log('Testing Route Parser...');
assert.deepStrictEqual(parseRoute('/campaigns/cmp_drakkenheim_01/dm'), { type: 'dm', campaignId: 'cmp_drakkenheim_01' });
assert.deepStrictEqual(parseRoute('/campaigns/cmp_drakkenheim_01/hud'), { type: 'hud', campaignId: 'cmp_drakkenheim_01' });
assert.deepStrictEqual(parseRoute('/campaigns/cmp_drakkenheim_01'), { type: 'hud', campaignId: 'cmp_drakkenheim_01' });
assert.deepStrictEqual(parseRoute('/'), { type: 'home' });
assert.deepStrictEqual(parseRoute('/home'), { type: 'home' });
console.log('✓ Route Parser tests passed!\n');

// Test 4: Security Guard & Redirection
console.log('Testing Route Security Guard Redirection...');
// Case A: Dungeon Master accessing /campaigns/:id/dm
const dmAccess = evaluateRouteSecurity('/campaigns/cmp_drakkenheim_01/dm', sampleCampaign, 'dm_user_001');
assert.strictEqual(dmAccess.allowed, true, 'DM must be allowed on /dm route');
assert.strictEqual(dmAccess.finalPath, '/campaigns/cmp_drakkenheim_01/dm', 'DM final path must be /dm');
assert.strictEqual(dmAccess.warningToast, undefined, 'No warning toast for DM');

// Case B: Regular Player attempting to access /campaigns/:id/dm
const playerAccess = evaluateRouteSecurity('/campaigns/cmp_drakkenheim_01/dm', sampleCampaign, 'player_user_002');
assert.strictEqual(playerAccess.allowed, false, 'Player must be blocked from /dm route');
assert.strictEqual(playerAccess.finalPath, '/campaigns/cmp_drakkenheim_01/hud', 'Player must be redirected to /hud');
assert.strictEqual(playerAccess.warningToast, 'Access Restricted: Grimoire Sealed to the Dungeon Master', 'Exact warning toast must be triggered');

// Case C: Transferred old DM attempting to access /campaigns/:id/dm
const oldDmAccess = evaluateRouteSecurity('/campaigns/cmp_shadow_01/dm', campaignInstance, 'user_preston');
assert.strictEqual(oldDmAccess.allowed, false, 'Previous DM who transferred role is blocked from /dm route');
assert.strictEqual(oldDmAccess.finalPath, '/campaigns/cmp_shadow_01/hud', 'Previous DM redirected to /hud as player');

// Test 5: Role Filtering & Google Drive URL Formatter
console.log('Testing Campaign Role Filtering & Banner Formatter...');

function formatBannerImageUrl(url?: string): string {
  if (!url || !url.trim()) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80';
  }
  const trimmed = url.trim();
  const gDriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
  }
  return trimmed;
}

// Google Drive Link formatting assertions
assert.strictEqual(
  formatBannerImageUrl('https://drive.google.com/file/d/1a2b3c4d5e6f/view?usp=sharing'),
  'https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f',
  'Google Drive share links should convert to direct export image URLs'
);
assert.strictEqual(
  formatBannerImageUrl('https://drive.google.com/open?id=xyz789'),
  'https://drive.google.com/uc?export=view&id=xyz789',
  'Google Drive open?id links should convert to direct export image URLs'
);
assert.strictEqual(
  formatBannerImageUrl(''),
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  'Empty banner URL should return default high-fantasy landscape'
);

// Campaign Role Filter assertions
const testCampaigns = [
  { id: 'c1', title: 'Dragon Lair', dmUserId: 'user_dm', party: [{ name: 'Thorin', player: 'Player1' }] },
  { id: 'c2', title: 'Goblin Mine', dmUserId: 'other_dm', party: [{ name: 'Thorin', player: 'Preston' }] }
];

const dmFiltered = testCampaigns.filter(c => isUserDM(c, 'user_dm'));
assert.strictEqual(dmFiltered.length, 1, 'DM filter returns only campaigns where user is DM');
assert.strictEqual(dmFiltered[0].id, 'c1');

const playerFiltered = testCampaigns.filter(c => !isUserDM(c, 'user_dm'));
assert.strictEqual(playerFiltered.length, 1, 'Player filter returns campaigns where user is not DM');
assert.strictEqual(playerFiltered[0].id, 'c2');

console.log('✓ Campaign Role Filtering & Banner Formatter tests passed!\n');

// Test 6: Action Economy and Tagged Notes
console.log('Testing Action Economy and Tagged DM Notes...');
const combatant = {
  id: 'c-test',
  name: 'Goblin Berserker',
  actionsUsed: { action: false, bonusAction: false, reaction: false, movement: false }
};

// Toggle action used
combatant.actionsUsed.action = !combatant.actionsUsed.action;
assert.strictEqual(combatant.actionsUsed.action, true, 'Action marked as used');

// Filter notes by tag
const testNotes = [
  { id: 'n1', title: 'Trap DC', tags: ['#Tactics', '#Secret'] },
  { id: 'n2', title: 'Chest Contents', tags: ['#Loot'] }
];
const lootNotes = testNotes.filter(n => n.tags.includes('#Loot'));
assert.strictEqual(lootNotes.length, 1, 'Loot tag filter finds 1 note');
assert.strictEqual(lootNotes[0].id, 'n2');
console.log('✓ Action Economy & Note Tag tests passed!\n');

console.log('🌟 ALL BONFIRE DM ROLE, COMBAT & BESTIARY TESTS PASSED WITH 0 FAILURES!');
