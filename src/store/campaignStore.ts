import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeCharacterStorage } from '../services/characterStorage';
import { 
  Campaign, 
  CampaignStatus, 
  PartyMemberRef, 
  QuestItem, 
  SharedItem, 
  PartyTreasury, 
  HandoutItem, 
  CampaignMilestone, 
  CurrencyType 
} from '../types/campaign';
import { INITIAL_PARTY_STASH, INITIAL_PARTY_TREASURY } from '../services/partyStorage';
import { Item, CharacterState } from '../types';

export const SAMPLE_CAMPAIGN: Campaign = {
  id: 'cmp_drakkenheim_01',
  title: 'Shadows over Drakkenheim',
  subtitle: 'The Delirium Crown & The Amethyst Vault',
  description: 'An eldritch meteor fell fifteen years ago, destroying the capital city of Drakkenheim. Now, rival factions clash amidst mutating mists, hazardous eldritch contamination, and hordes of mutated horrors in search of ancient royal treasures.',
  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  dmName: 'Master Eldritch',
  dmUserId: 'dm_user_001',
  joinCode: 'BF-DRAK12',
  status: 'active',
  setting: 'Grimdark Urban Fantasy / Eldritch Contamination',
  startDate: '1492 DR, Hammer 15',
  currentWorldDate: '1492 DR, Ches 02',
    party: [
    {
      id: 'pm-1',
      name: 'Thorin Ironforge',
      class: 'Cleric (Forge Domain)',
      level: 12,
      species: 'Mountain Dwarf',
      player: 'Preston',
      avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      hpCurrent: 88,
      hpMax: 96,
      tempHp: 5,
      ac: 21,
      speed: 25,
      initiativeBonus: 0,
      inspiration: true,
      currentXp: 108500,
      meleeAttack: { name: 'Forge Warhammer +2', bonus: 9, damage: '1d8+5' },
      rangedAttack: { name: 'Sacred Flame (Save)', bonus: 8, damage: '3d8' },
      spellAttack: 8,
      spellDC: 16,
      passivePerception: 18,
      passiveInsight: 18,
      passiveInvestigation: 11,
      spellSlotsCurrent: { 1: 4, 2: 3, 3: 2, 4: 2, 5: 1, 6: 1 },
      spellSlotsMax: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      conditions: [],
      dmShareCode: 'BF-THORIN'
    },
    {
      id: 'pm-2',
      name: 'Vespera Nightshade',
      class: 'Rogue (Soulknife)',
      level: 10,
      species: 'Elf (Shadar-kai)',
      player: 'Lyra',
      avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      hpCurrent: 58,
      hpMax: 68,
      tempHp: 0,
      ac: 17,
      speed: 35,
      initiativeBonus: 5,
      inspiration: false,
      currentXp: 68500,
      meleeAttack: { name: 'Psychic Blade Rapier', bonus: 9, damage: '1d8+5+5d6' },
      rangedAttack: { name: 'Honed Dagger', bonus: 9, damage: '1d4+5' },
      spellAttack: 0,
      spellDC: 17,
      passivePerception: 19,
      passiveInsight: 15,
      passiveInvestigation: 16,
      spellSlotsCurrent: {},
      spellSlotsMax: {},
      conditions: ['Shadow Stride'],
      dmShareCode: 'BF-VESPERA'
    },
    {
      id: 'pm-3',
      name: 'Aurelius Dawnseeker',
      class: 'Paladin (Oath of Devotion)',
      level: 11,
      species: 'Human',
      player: 'Marcus',
      avatarUrl: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80',
      hpCurrent: 102,
      hpMax: 102,
      tempHp: 0,
      ac: 20,
      speed: 30,
      initiativeBonus: 1,
      inspiration: true,
      currentXp: 91000,
      meleeAttack: { name: 'Sunblade Longsword', bonus: 10, damage: '1d8+6+1d8' },
      rangedAttack: { name: 'Javelin of Lightning', bonus: 8, damage: '1d6+4' },
      spellAttack: 7,
      spellDC: 15,
      passivePerception: 14,
      passiveInsight: 16,
      passiveInvestigation: 10,
      spellSlotsCurrent: { 1: 4, 2: 3, 3: 2 },
      spellSlotsMax: { 1: 4, 2: 3, 3: 3 },
      conditions: [],
      dmShareCode: 'BF-AURELIUS'
    },
    {
      id: 'pm-4',
      name: 'Sylas Runeweaver',
      class: 'Wizard (Order of Scribes)',
      level: 11,
      species: 'Gnome (Deep)',
      player: 'Kael',
      avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      hpCurrent: 44,
      hpMax: 54,
      tempHp: 10,
      ac: 15,
      speed: 25,
      initiativeBonus: 2,
      inspiration: false,
      currentXp: 88500,
      meleeAttack: { name: 'Staff of Defense', bonus: 4, damage: '1d6' },
      rangedAttack: { name: 'Fire Bolt Cantrip', bonus: 9, damage: '3d10' },
      spellAttack: 9,
      spellDC: 17,
      passivePerception: 13,
      passiveInsight: 14,
      passiveInvestigation: 21,
      spellSlotsCurrent: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 1, 6: 0 },
      spellSlotsMax: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      conditions: ['Mage Armor'],
      dmShareCode: 'BF-SYLAS'
    }
  ],
  questLog: [
    {
      id: 'q-1',
      title: 'Infiltrate the Inscrutable Tower',
      description: 'The Amethyst Academy archmage requires a sample of crystallized delirium core from the central planar containment chamber.',
      giver: 'Archmage River',
      location: 'Inscrutable Tower, Drakkenheim Inner City',
      reward: '2,500 gp & Rare Arcane Focus',
      status: 'in_progress',
      priority: 'main',
      dateAdded: Date.now() - 86400000 * 5
    },
    {
      id: 'q-2',
      title: 'Purify Saint Vitruvio\'s Cathedral',
      description: 'Cleanse the subterranean crypts of the contaminated mutated clergy and recover the Sacred Relic of the Silver Order.',
      giver: 'High Curator Lucretia',
      location: 'Cathedral of Saint Vitruvio',
      reward: 'Mace of Disruption & Holy Blessing',
      status: 'completed',
      priority: 'main',
      dateAdded: Date.now() - 86400000 * 12,
      dateCompleted: Date.now() - 86400000 * 2
    },
    {
      id: 'q-3',
      title: 'Smuggle Contraband past Queen\'s Men',
      description: 'Transport the shipment of alchemical neutralizing draughts through the Cistern tunnels avoiding Blackjack Mel\'s toll inspectors.',
      giver: 'Old Town Apothecary',
      location: 'Drakkenheim Cisterns',
      reward: '350 gp',
      status: 'in_progress',
      priority: 'side',
      dateAdded: Date.now() - 86400000 * 3
    }
  ],
  treasury: INITIAL_PARTY_TREASURY,
  sharedInventory: INITIAL_PARTY_STASH,
  handouts: [
    {
      id: 'h-1',
      title: 'Drakkenheim City Ruins & Contamination Zones',
      type: 'map',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      content: 'Cartographer map showing the Outer City barricades, Haze borders, Queen\'s Park Barracks, and the high-contamination Inner City ruins.',
      tags: ['Map', 'Urban', 'Haze', 'Tactical'],
      isRevealedToParty: true,
      dateAdded: Date.now() - 86400000 * 10,
      authorOrSource: 'Amethyst Academy Cartographer'
    },
    {
      id: 'h-2',
      title: 'Intercepted Letter: Blackjack Mel\'s Directive',
      type: 'letter',
      content: '"To all lieutenants at Buckled Plate Tavern: Anyone attempting to transport purple crystals through the sewer gates without paying the 20% Guild tribute is to be strung up on the ruins wall. No exceptions."',
      tags: ['Letter', 'Queen\'s Men', 'Blackmail'],
      isRevealedToParty: true,
      dateAdded: Date.now() - 86400000 * 4,
      authorOrSource: 'Blackjack Mel'
    },
    {
      id: 'h-3',
      title: 'Ancient Treatise on Delirium Geodes',
      type: 'lore',
      content: 'Eldritch delirium crystals pulse with planar resonance. Prolonged contact causes psychic degradation unless encased in refined lead containers or protected by abjuration wards.',
      tags: ['Lore', 'Magic', 'Delirium'],
      isRevealedToParty: false,
      dateAdded: Date.now() - 86400000 * 1,
      authorOrSource: 'Forbidden Scriptorium'
    }
  ],
  milestones: [
    {
      id: 'm-1',
      title: 'Arrival at Emberwood Village',
      description: 'Party established base camp at the Red Lion Inn and secured initial contracts.',
      date: 'Hammer 15',
      sessionNumber: 1
    },
    {
      id: 'm-2',
      title: 'The Slaughter at Saint Vitruvio',
      description: 'Defeated the mutated abomination in the cathedral belfry, securing the relic.',
      date: 'Alturiak 04',
      sessionNumber: 24
    }
  ],
  sessionIds: ['session-24', 'sample-session-24'],
  createdAt: Date.now() - 86400000 * 30,
  updatedAt: Date.now()
};

export const SAMPLE_CAMPAIGN_2: Campaign = {
  id: 'cmp_frost_wyrm_02',
  title: 'Tomb of the Frost Wyrm',
  subtitle: 'The Frozen Spire of Rimepeak',
  description: 'An ancient white wyrm has awakened beneath the glaciers of the Spine of the World, threatening northern settlements with eternal winter.',
  bannerUrl: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=1200&q=80',
  dmName: 'Master Matthew',
  dmUserId: 'dm_user_002',
  status: 'active',
  setting: 'Arctic High Fantasy / Glacier Dungeons',
  startDate: '1493 DR, Alturiak 10',
  currentWorldDate: '1493 DR, Ches 12',
  party: [
    {
      id: 'pm-201',
      name: 'Vespera Nightshade',
      class: 'Rogue (Soulknife)',
      level: 10,
      species: 'Elf (Shadar-kai)',
      player: 'Lyra',
      avatarUrl: '',
      hpCurrent: 58,
      hpMax: 68,
      tempHp: 0,
      ac: 17,
      passivePerception: 19,
      passiveInsight: 15,
      passiveInvestigation: 16
    },
    {
      id: 'pm-202',
      name: 'Thorin Ironforge',
      class: 'Cleric (Forge Domain)',
      level: 12,
      species: 'Mountain Dwarf',
      player: 'Preston',
      avatarUrl: '',
      hpCurrent: 88,
      hpMax: 96,
      tempHp: 5,
      ac: 21,
      passivePerception: 18,
      passiveInsight: 18,
      passiveInvestigation: 11
    }
  ],
  questLog: [
    {
      id: 'q-201',
      title: 'Recover the Glacial Rune Key',
      description: 'Find the frost giant relic hidden within the howling chasm.',
      giver: 'Chieftain Hrothgar',
      location: 'Spine of the World',
      reward: '1,200 gp & Cloak of the Winter Wolf',
      status: 'in_progress',
      priority: 'main',
      dateAdded: Date.now() - 86400000 * 4
    }
  ],
  treasury: {
    cp: 100,
    sp: 450,
    ep: 0,
    gp: 820,
    pp: 25,
    ledger: []
  },
  sharedInventory: INITIAL_PARTY_STASH,
  handouts: [],
  milestones: [],
  sessionIds: [],
  createdAt: Date.now() - 86400000 * 15,
  updatedAt: Date.now()
};

export const PAST_CAMPAIGN_1: Campaign = {
  id: 'cmp_past_citadel_01',
  title: 'Curse of the Sunken Citadel',
  subtitle: 'The Twilight Grove & Gulthias Tree',
  description: 'The ancient fortress submerged during a cataclysmic rift. The party descended into its blighted depths and eradicated the cursed Gulthias tree.',
  bannerUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  dmName: 'Master Eldritch',
  dmUserId: 'dm_user_001',
  status: 'completed',
  setting: 'Underdark & Sunken Ruins',
  startDate: '1490 DR, Mirtul 01',
  currentWorldDate: 'Completed',
  party: [
    {
      id: 'pm-301',
      name: 'Thorin Ironforge',
      class: 'Cleric (Forge Domain)',
      level: 8,
      species: 'Mountain Dwarf',
      player: 'Preston',
      avatarUrl: '',
      hpCurrent: 64,
      hpMax: 64,
      tempHp: 0,
      ac: 20,
      passivePerception: 16,
      passiveInsight: 16,
      passiveInvestigation: 11
    }
  ],
  questLog: [],
  treasury: INITIAL_PARTY_TREASURY,
  sharedInventory: [],
  handouts: [],
  milestones: [],
  sessionIds: [],
  createdAt: Date.now() - 86400000 * 180,
  updatedAt: Date.now() - 86400000 * 60
};

export const PAST_CAMPAIGN_2: Campaign = {
  id: 'cmp_past_ravenloft_02',
  title: 'Siege of Castle Ravenloft',
  subtitle: 'The Amber Temple & Vampyr Curse',
  description: 'Trapped in the mists of Barovia, the party united the Holy Symbol of Ravenkind and the Sunsword to liberate the realm from darkness.',
  bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  dmName: 'Master Matthew',
  dmUserId: 'dm_user_002',
  status: 'completed',
  setting: 'Gothic Horror / Barovia',
  startDate: '1491 DR, Eleint 12',
  currentWorldDate: 'Completed',
  party: [
    {
      id: 'pm-401',
      name: 'Aurelius Dawnseeker',
      class: 'Paladin (Oath of Devotion)',
      level: 11,
      species: 'Human',
      player: 'Marcus',
      avatarUrl: '',
      hpCurrent: 102,
      hpMax: 102,
      tempHp: 0,
      ac: 20,
      passivePerception: 14,
      passiveInsight: 16,
      passiveInvestigation: 10
    }
  ],
  questLog: [],
  treasury: INITIAL_PARTY_TREASURY,
  sharedInventory: [],
  handouts: [],
  milestones: [],
  sessionIds: [],
  createdAt: Date.now() - 86400000 * 365,
  updatedAt: Date.now() - 86400000 * 120
};

export const PAST_CAMPAIGN_3: Campaign = {
  id: 'cmp_past_phandelver_03',
  title: 'The Lost Mines of Phandelver',
  subtitle: 'Wave Echo Cave & The Forge of Spells',
  description: 'The rediscovery of the legendary Forge of Spells in the Sword Mountains and the defeat of the Black Spider.',
  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  dmName: 'Master Matthew',
  dmUserId: 'dm_user_002',
  status: 'archived',
  setting: 'Sword Coast Classic',
  startDate: '1489 DR, Flamerule 04',
  currentWorldDate: 'Archived',
  party: [
    {
      id: 'pm-501',
      name: 'Sylas Runeweaver',
      class: 'Wizard (Order of Scribes)',
      level: 5,
      species: 'Gnome (Deep)',
      player: 'Kael',
      avatarUrl: '',
      hpCurrent: 32,
      hpMax: 32,
      tempHp: 0,
      ac: 14,
      passivePerception: 12,
      passiveInsight: 13,
      passiveInvestigation: 18
    }
  ],
  questLog: [],
  treasury: INITIAL_PARTY_TREASURY,
  sharedInventory: [],
  handouts: [],
  milestones: [],
  sessionIds: [],
  createdAt: Date.now() - 86400000 * 500,
  updatedAt: Date.now() - 86400000 * 300
};

export const DEFAULT_SAMPLE_PARTY_MEMBERS: PartyMemberRef[] = [
  {
    id: 'pm-test-101',
    name: 'Valerius Brightflame',
    class: 'Paladin (Oath of Vengeance)',
    level: 10,
    species: 'Aasimar',
    player: 'Marcus',
    avatarUrl: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80',
    hpCurrent: 86,
    hpMax: 86,
    tempHp: 10,
    ac: 20,
    speed: 30,
    initiativeBonus: 1,
    inspiration: true,
    currentXp: 64000,
    meleeAttack: { name: 'Holy Greatsword +1', bonus: 9, damage: '2d6+5' },
    rangedAttack: { name: 'Javelin', bonus: 8, damage: '1d6+4' },
    spellAttack: 7,
    spellDC: 15,
    spellSlotsCurrent: { 1: 4, 2: 3, 3: 2 },
    spellSlotsMax: { 1: 4, 2: 3, 3: 2 },
    passivePerception: 15,
    passiveInsight: 16,
    passiveInvestigation: 11,
    conditions: ['Blessed']
  },
  {
    id: 'pm-test-102',
    name: 'Lyra Nightwhisper',
    class: 'Rogue (Arcane Trickster)',
    level: 10,
    species: 'Elf (Moon)',
    player: 'Elena',
    avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    hpCurrent: 63,
    hpMax: 63,
    tempHp: 0,
    ac: 17,
    speed: 35,
    initiativeBonus: 5,
    inspiration: false,
    currentXp: 64000,
    meleeAttack: { name: 'Shadow Rapier +1', bonus: 9, damage: '1d8+5+5d6' },
    rangedAttack: { name: 'Shortbow', bonus: 9, damage: '1d6+5' },
    spellAttack: 6,
    spellDC: 14,
    spellSlotsCurrent: { 1: 4, 2: 3 },
    spellSlotsMax: { 1: 4, 2: 3 },
    passivePerception: 19,
    passiveInsight: 15,
    passiveInvestigation: 18,
    conditions: []
  },
  {
    id: 'pm-test-103',
    name: 'Brother Alistair',
    class: 'Cleric (Life Domain)',
    level: 10,
    species: 'Human',
    player: 'Devon',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    hpCurrent: 78,
    hpMax: 78,
    tempHp: 0,
    ac: 19,
    speed: 30,
    initiativeBonus: 0,
    inspiration: true,
    currentXp: 64000,
    meleeAttack: { name: 'Mace of Disruption', bonus: 7, damage: '1d6+3' },
    rangedAttack: { name: 'Sacred Flame', bonus: 7, damage: '2d8' },
    spellAttack: 7,
    spellDC: 15,
    spellSlotsCurrent: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellSlotsMax: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    passivePerception: 18,
    passiveInsight: 19,
    passiveInvestigation: 12,
    conditions: []
  },
  {
    id: 'pm-test-104',
    name: 'Zephyra Gale',
    class: 'Sorcerer (Draconic Bloodline)',
    level: 10,
    species: 'Dragonborn (Blue)',
    player: 'Kai',
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    hpCurrent: 62,
    hpMax: 62,
    tempHp: 5,
    ac: 15,
    speed: 30,
    initiativeBonus: 2,
    inspiration: false,
    currentXp: 64000,
    meleeAttack: { name: 'Dagger', bonus: 6, damage: '1d4+2' },
    rangedAttack: { name: 'Lightning Bolt', bonus: 8, damage: '8d6' },
    spellAttack: 8,
    spellDC: 16,
    spellSlotsCurrent: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellSlotsMax: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    passivePerception: 13,
    passiveInsight: 14,
    passiveInvestigation: 14,
    conditions: ['Mage Armor']
  }
];

interface CampaignStoreState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeDirectoryTab: CampaignStatus;
  
  // Getters
  getActiveCampaign: () => Campaign | null;

  // Campaign Management
  setActiveCampaignId: (id: string | null) => void;
  setActiveDirectoryTab: (tab: CampaignStatus) => void;
  createCampaign: (campaign: Partial<Campaign>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  transferDmRole: (campaignId: string, newDmUserId: string, newDmName: string) => void;
  populateSampleParty: (campaignId: string) => void;
  deleteCampaign: (id: string) => void;
  archiveCampaign: (id: string, status: CampaignStatus) => void;

  // Party Roster
  addPartyMember: (campaignId: string, member: Partial<PartyMemberRef>) => void;
  updatePartyMember: (campaignId: string, memberId: string, updates: Partial<PartyMemberRef>) => void;
  removePartyMember: (campaignId: string, memberId: string) => void;

  // Quest Log
  addQuest: (campaignId: string, quest: Partial<QuestItem>) => void;
  updateQuest: (campaignId: string, questId: string, updates: Partial<QuestItem>) => void;
  deleteQuest: (campaignId: string, questId: string) => void;

  // Handouts & Lore
  addHandout: (campaignId: string, handout: Partial<HandoutItem>) => void;
  updateHandout: (campaignId: string, handoutId: string, updates: Partial<HandoutItem>) => void;
  deleteHandout: (campaignId: string, handoutId: string) => void;
  toggleHandoutVisibility: (campaignId: string, handoutId: string) => void;

  // Shared Inventory & Treasury
  addToPartyStash: (item: Partial<SharedItem>, holder?: string, addedBy?: string) => void;
  updatePartyStashItem: (itemId: string, updates: Partial<SharedItem>) => void;
  removeFromPartyStash: (itemId: string) => void;
  transferPersonalItemToPartyStash: (item: Item, actorName: string, holder?: string) => void;
  contributeToPartyTreasury: (amount: number, currency: CurrencyType, actorName: string) => void;
  withdrawFromPartyTreasury: (amount: number, currency: CurrencyType, actorName: string, reason: string) => boolean;
  makePartyPurchase: (buyerName: string, description: string, cost: number, currency: CurrencyType) => boolean;
  splitPartyWealthEqually: (actorName: string) => { perPerson: Record<CurrencyType, number>; totalSplit: number };
  joinCampaignByCode: (code: string, character: Partial<CharacterState> & { id?: string }, playerName?: string) => { success: boolean; message: string; campaignId?: string };
  getPartyAverageLevel: (campaignId?: string) => number;
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      campaigns: [
        SAMPLE_CAMPAIGN, 
        SAMPLE_CAMPAIGN_2, 
        PAST_CAMPAIGN_1, 
        PAST_CAMPAIGN_2, 
        PAST_CAMPAIGN_3
      ],
      activeCampaignId: SAMPLE_CAMPAIGN.id,
      activeDirectoryTab: 'active',

      getActiveCampaign: () => {
        const id = get().activeCampaignId;
        return get().campaigns.find(c => c.id === id) || get().campaigns[0] || null;
      },

      getPartyAverageLevel: (campaignId) => {
        const targetId = campaignId || get().activeCampaignId;
        const campaign = get().campaigns.find(c => c.id === targetId);
        if (!campaign || campaign.party.length === 0) return 1;
        const total = campaign.party.reduce((acc, p) => acc + (p.level || 1), 0);
        return Math.round((total / campaign.party.length) * 10) / 10;
      },

      setActiveCampaignId: (id) => set({ activeCampaignId: id }),
      setActiveDirectoryTab: (tab) => set({ activeDirectoryTab: tab }),

      createCampaign: (data) => {
        const randomCode = 'BF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const newCampaign: Campaign = {
          id: 'cmp_' + Math.random().toString(36).substring(2, 11),
          title: data.title || 'New Campaign Chronicle',
          subtitle: data.subtitle || '',
          description: data.description || '',
          dmName: data.dmName || 'Dungeon Master',
          dmUserId: data.dmUserId || 'local_dm',
          joinCode: data.joinCode || randomCode,
          status: 'active',
          setting: data.setting || 'Forgotten Realms',
          startDate: data.startDate || new Date().toLocaleDateString(),
          currentWorldDate: data.currentWorldDate || 'Day 1',
          party: data.party || [],
          questLog: data.questLog || [],
          treasury: data.treasury || INITIAL_PARTY_TREASURY,
          sharedInventory: data.sharedInventory || INITIAL_PARTY_STASH,
          handouts: data.handouts || [],
          milestones: data.milestones || [],
          sessionIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...data
        } as Campaign;

        set(state => ({
          campaigns: [newCampaign, ...state.campaigns],
          activeCampaignId: newCampaign.id
        }));

        return newCampaign;
      },

      updateCampaign: (id, updates) => set(state => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c)
      })),

      transferDmRole: (campaignId, newDmUserId, newDmName) => set(state => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? { ...c, dmUserId: newDmUserId, dmName: newDmName, updatedAt: Date.now() }
            : c
        )
      })),

      populateSampleParty: (campaignId) => set(state => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? { ...c, party: [...DEFAULT_SAMPLE_PARTY_MEMBERS], updatedAt: Date.now() }
            : c
        )
      })),

      deleteCampaign: (id) => set(state => {
        const remaining = state.campaigns.filter(c => c.id !== id);
        return {
          campaigns: remaining,
          activeCampaignId: state.activeCampaignId === id ? (remaining[0]?.id || null) : state.activeCampaignId
        };
      }),

      archiveCampaign: (id, status) => set(state => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, status, updatedAt: Date.now() } : c)
      })),

      addPartyMember: (campaignId, member) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          const newMember: PartyMemberRef = {
            id: 'pm-' + Math.random().toString(36).substring(2, 9),
            name: member.name || 'New Hero',
            class: member.class || 'Adventurer',
            level: member.level || 1,
            species: member.species || 'Human',
            player: member.player || 'Player',
            avatarUrl: member.avatarUrl || '',
            hpCurrent: member.hpCurrent || 10,
            hpMax: member.hpMax || 10,
            tempHp: member.tempHp || 0,
            ac: member.ac || 10,
            passivePerception: member.passivePerception || 10,
            passiveInsight: member.passiveInsight || 10,
            passiveInvestigation: member.passiveInvestigation || 10,
            spellSlotsCurrent: member.spellSlotsCurrent || {},
            spellSlotsMax: member.spellSlotsMax || {},
            conditions: [],
            ...member
          };
          return { ...c, party: [...c.party, newMember], updatedAt: Date.now() };
        })
      })),

      updatePartyMember: (campaignId, memberId, updates) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            party: c.party.map(p => p.id === memberId ? { ...p, ...updates } : p),
            updatedAt: Date.now()
          };
        })
      })),

      removePartyMember: (campaignId, memberId) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            party: c.party.filter(p => p.id !== memberId),
            updatedAt: Date.now()
          };
        })
      })),

      addQuest: (campaignId, quest) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          const newQuest: QuestItem = {
            id: 'q-' + Math.random().toString(36).substring(2, 9),
            title: quest.title || 'New Quest Objective',
            description: quest.description || '',
            giver: quest.giver || '',
            location: quest.location || '',
            reward: quest.reward || '',
            status: quest.status || 'in_progress',
            priority: quest.priority || 'side',
            dateAdded: Date.now(),
            ...quest
          };
          return { ...c, questLog: [newQuest, ...c.questLog], updatedAt: Date.now() };
        })
      })),

      updateQuest: (campaignId, questId, updates) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            questLog: c.questLog.map(q => q.id === questId ? { ...q, ...updates } : q),
            updatedAt: Date.now()
          };
        })
      })),

      deleteQuest: (campaignId, questId) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            questLog: c.questLog.filter(q => q.id !== questId),
            updatedAt: Date.now()
          };
        })
      })),

      addHandout: (campaignId, handout) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          const newHandout: HandoutItem = {
            id: 'h-' + Math.random().toString(36).substring(2, 9),
            title: handout.title || 'New Handout',
            type: handout.type || 'lore',
            imageUrl: handout.imageUrl || '',
            content: handout.content || '',
            tags: handout.tags || ['Handout'],
            isRevealedToParty: handout.isRevealedToParty ?? true,
            dateAdded: Date.now(),
            authorOrSource: handout.authorOrSource || '',
            ...handout
          };
          return { ...c, handouts: [newHandout, ...c.handouts], updatedAt: Date.now() };
        })
      })),

      updateHandout: (campaignId, handoutId, updates) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            handouts: c.handouts.map(h => h.id === handoutId ? { ...h, ...updates } : h),
            updatedAt: Date.now()
          };
        })
      })),

      deleteHandout: (campaignId, handoutId) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            handouts: c.handouts.filter(h => h.id !== handoutId),
            updatedAt: Date.now()
          };
        })
      })),

      toggleHandoutVisibility: (campaignId, handoutId) => set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            handouts: c.handouts.map(h => h.id === handoutId ? { ...h, isRevealedToParty: !h.isRevealedToParty } : h),
            updatedAt: Date.now()
          };
        })
      })),

      // Shared Party Inventory & Treasury
      addToPartyStash: (item, holder = 'Bag of Holding', addedBy = 'Party') => {
        const campaign = get().getActiveCampaign();
        if (!campaign) return;

        const newItem: SharedItem = {
          id: 'ps-' + Math.random().toString(36).substring(2, 9),
          name: item.name || 'Shared Item',
          description: item.description || '',
          weight: item.weight || 0,
          quantity: item.quantity || 1,
          rarity: item.rarity || 'Common',
          type: item.type || 'gear',
          holder: holder || 'Bag of Holding',
          iconUrl: item.iconUrl || '',
          addedBy: addedBy,
          dateAdded: Date.now(),
          ...item
        };

        get().updateCampaign(campaign.id, {
          sharedInventory: [newItem, ...(campaign.sharedInventory || [])]
        });
      },

      updatePartyStashItem: (itemId, updates) => {
        const campaign = get().getActiveCampaign();
        if (!campaign) return;
        get().updateCampaign(campaign.id, {
          sharedInventory: campaign.sharedInventory.map(i => i.id === itemId ? { ...i, ...updates } : i)
        });
      },

      removeFromPartyStash: (itemId) => {
        const campaign = get().getActiveCampaign();
        if (!campaign) return;
        get().updateCampaign(campaign.id, {
          sharedInventory: campaign.sharedInventory.filter(i => i.id !== itemId)
        });
      },

      transferPersonalItemToPartyStash: (item, actorName, holder = 'Bag of Holding') => {
        get().addToPartyStash(
          {
            name: item.name,
            description: item.description,
            weight: item.weight,
            quantity: item.quantity,
            rarity: item.rarity,
            type: item.type,
            iconUrl: item.iconUrl
          },
          holder,
          actorName
        );
      },

      contributeToPartyTreasury: (amount, currency, actorName) => {
        const campaign = get().getActiveCampaign();
        if (!campaign || amount <= 0) return;

        const currentTreasury = campaign.treasury || INITIAL_PARTY_TREASURY;
        const nextAmount = (currentTreasury[currency] || 0) + amount;
        const entry = {
          id: 'pt-' + Math.random().toString(36).substring(2, 9),
          date: Date.now(),
          actor: actorName,
          description: `Contributed ${amount} ${currency.toUpperCase()} to party chest`,
          amount,
          currency,
          type: 'contribution' as const
        };

        get().updateCampaign(campaign.id, {
          treasury: {
            ...currentTreasury,
            [currency]: nextAmount,
            ledger: [entry, ...(currentTreasury.ledger || [])]
          }
        });
      },

      withdrawFromPartyTreasury: (amount, currency, actorName, reason) => {
        const campaign = get().getActiveCampaign();
        if (!campaign || amount <= 0) return false;

        const currentTreasury = campaign.treasury || INITIAL_PARTY_TREASURY;
        if ((currentTreasury[currency] || 0) < amount) {
          return false;
        }

        const nextAmount = (currentTreasury[currency] || 0) - amount;
        const entry = {
          id: 'pt-' + Math.random().toString(36).substring(2, 9),
          date: Date.now(),
          actor: actorName,
          description: reason ? `Withdrew ${amount} ${currency.toUpperCase()}: ${reason}` : `Withdrew ${amount} ${currency.toUpperCase()}`,
          amount,
          currency,
          type: 'withdrawal' as const
        };

        get().updateCampaign(campaign.id, {
          treasury: {
            ...currentTreasury,
            [currency]: nextAmount,
            ledger: [entry, ...(currentTreasury.ledger || [])]
          }
        });
        return true;
      },

      makePartyPurchase: (buyerName, description, cost, currency) => {
        const campaign = get().getActiveCampaign();
        if (!campaign || cost <= 0) return false;

        const currentTreasury = campaign.treasury || INITIAL_PARTY_TREASURY;
        if ((currentTreasury[currency] || 0) < cost) {
          return false;
        }

        const nextAmount = (currentTreasury[currency] || 0) - cost;
        const entry = {
          id: 'pt-' + Math.random().toString(36).substring(2, 9),
          date: Date.now(),
          actor: buyerName,
          description: `Purchased "${description}" for ${cost} ${currency.toUpperCase()}`,
          amount: cost,
          currency,
          type: 'purchase' as const
        };

        get().updateCampaign(campaign.id, {
          treasury: {
            ...currentTreasury,
            [currency]: nextAmount,
            ledger: [entry, ...(currentTreasury.ledger || [])]
          }
        });
        return true;
      },

      splitPartyWealthEqually: (actorName) => {
        const campaign = get().getActiveCampaign();
        if (!campaign) {
          return { perPerson: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, totalSplit: 0 };
        }

        const memberCount = Math.max(1, campaign.party.length);
        const currentTreasury = campaign.treasury || INITIAL_PARTY_TREASURY;

        const perPerson: Record<CurrencyType, number> = {
          pp: Math.floor((currentTreasury.pp || 0) / memberCount),
          gp: Math.floor((currentTreasury.gp || 0) / memberCount),
          ep: Math.floor((currentTreasury.ep || 0) / memberCount),
          sp: Math.floor((currentTreasury.sp || 0) / memberCount),
          cp: Math.floor((currentTreasury.cp || 0) / memberCount),
        };

        const totalSplitGoldEquivalent = 
          perPerson.pp * 10 + 
          perPerson.gp + 
          perPerson.ep * 0.5 + 
          perPerson.sp * 0.1 + 
          perPerson.cp * 0.01;

        // Deduct split coins from treasury
        const nextTreasury: PartyTreasury = {
          pp: (currentTreasury.pp || 0) - perPerson.pp * memberCount,
          gp: (currentTreasury.gp || 0) - perPerson.gp * memberCount,
          ep: (currentTreasury.ep || 0) - perPerson.ep * memberCount,
          sp: (currentTreasury.sp || 0) - perPerson.sp * memberCount,
          cp: (currentTreasury.cp || 0) - perPerson.cp * memberCount,
          ledger: [
            {
              id: 'pt-' + Math.random().toString(36).substring(2, 9),
              date: Date.now(),
              actor: actorName,
              description: `Split wealth equally among ${memberCount} heroes (${perPerson.gp} GP, ${perPerson.sp} SP, ${perPerson.pp} PP each)`,
              amount: totalSplitGoldEquivalent * memberCount,
              currency: 'gp',
              type: 'split'
            },
            ...(currentTreasury.ledger || [])
          ]
        };

        get().updateCampaign(campaign.id, { treasury: nextTreasury });
        return { perPerson, totalSplit: totalSplitGoldEquivalent * memberCount };
      },

      joinCampaignByCode: (code, characterData, playerName) => {
        const clean = code.trim().toUpperCase();
        const campaign = get().campaigns.find(c => 
          (c.joinCode && c.joinCode.toUpperCase() === clean) ||
          c.id.toUpperCase() === clean ||
          ('BF-' + clean) === (c.joinCode && c.joinCode.toUpperCase())
        );

        if (!campaign) {
          return { success: false, message: `No active campaign found with Join Code "${code}". Please check with your DM.` };
        }

        // Check if character already in campaign
        const existingIdx = campaign.party.findIndex(p => p.name.toLowerCase() === (characterData.name || '').toLowerCase());
        const heroRef: PartyMemberRef = {
          id: 'pm-' + Math.random().toString(36).substring(2, 9),
          characterId: characterData.id,
          name: characterData.name || 'Hero',
          class: characterData.class || 'Adventurer',
          level: characterData.level || 1,
          species: characterData.species || 'Human',
          player: playerName || 'Player',
          avatarUrl: characterData.portraitUrl || '',
          hpCurrent: characterData.hp?.current ?? 25,
          hpMax: characterData.hp?.max ?? 25,
          tempHp: characterData.hp?.temp ?? 0,
          ac: characterData.ac ?? 14,
          passivePerception: 14,
          passiveInsight: 14,
          passiveInvestigation: 12,
          conditions: []
        };

        const nextParty = [...campaign.party];
        if (existingIdx >= 0) {
          nextParty[existingIdx] = { ...nextParty[existingIdx], ...heroRef, id: nextParty[existingIdx].id };
        } else {
          nextParty.push(heroRef);
        }

        get().updateCampaign(campaign.id, { party: nextParty });
        set({ activeCampaignId: campaign.id });

        return { 
          success: true, 
          message: `Successfully joined "${campaign.title}" as ${heroRef.name}!`,
          campaignId: campaign.id 
        };
      }
    }),
    {
      name: 'bonfire-campaigns-storage-v1',
      storage: createJSONStorage(() => safeCharacterStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.campaigns = state.campaigns.map(c => {
          if ((c.title.toLowerCase().includes('test') || c.title.toLowerCase() === 'test 2') && (!c.party || c.party.length === 0)) {
            return {
              ...c,
              party: [...DEFAULT_SAMPLE_PARTY_MEMBERS],
              updatedAt: Date.now()
            };
          }
          return c;
        });
      }
    }
  )
);
