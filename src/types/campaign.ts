// Campaign & Shared Party Types for Bonfire D&D 5e
import { Item, Rarity } from '../types';

export type CampaignStatus = 'active' | 'completed' | 'archived';

export interface PartyMemberRef {
  id: string;
  characterId?: string;
  name: string;
  class: string;
  level: number;
  species: string;
  player: string;
  avatarUrl?: string;
  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  ac: number;
  passivePerception: number;
  passiveInsight: number;
  passiveInvestigation: number;
  spellSlotsCurrent?: Record<number, number>;
  spellSlotsMax?: Record<number, number>;
  conditions?: string[];
  deathSaves?: {
    successes: number;
    failures: number;
  };
  dmShareCode?: string;
  meleeAttack?: { name: string; bonus: number; damage: string };
  rangedAttack?: { name: string; bonus: number; damage: string };
  spellAttack?: number;
  spellDC?: number;
  speed?: number;
  initiativeBonus?: number;
  inspiration?: boolean;
  currentXp?: number;
}

export interface DMPartyMember {
  id: string;
  playerName: string;
  characterName: string;
  classAndLevel: string; // e.g. "Level 11 Paladin (Oath of Devotion)"
  ancestry: string;      // e.g. "Human"
  portraitUrl: string;
  isIncapacitated?: boolean;
  isInspired?: boolean;
  conditionsCount: number;
  conditions?: string[];
  dmShareCode?: string;
  combatMods: {
    melee: { bonus: number; formula: string };
    ranged: { bonus: number; formula: string };
    spells: { bonus: number; dc: number };
  };
  vitals: {
    ac: number;
    initiative: number;
    speed: number;
    senses: { passivePerception: number; passiveInsight: number };
  };
  progression: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
  };
  health: {
    currentHp: number;
    maxHp: number;
    tempHp?: number;
  };
  spellSlots: Array<{
    level: number;
    total: number;
    used: number;
  }>;
}

export type QuestStatus = 'in_progress' | 'completed' | 'failed';
export type QuestPriority = 'main' | 'side' | 'bounty';

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  giver?: string;
  location?: string;
  reward?: string;
  status: QuestStatus;
  priority: QuestPriority;
  dateAdded: number;
  dateCompleted?: number;
}

export interface SharedItem {
  id: string;
  name: string;
  description: string;
  weight: number;
  quantity: number;
  rarity: Rarity;
  type: 'weapon' | 'armor' | 'consumable' | 'gear' | 'magic';
  holder: string; // e.g. "Bag of Holding", "Party Wagon", "Thorin", etc.
  iconUrl?: string;
  addedBy?: string;
  dateAdded: number;
}

export type CurrencyType = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

export interface PartyTreasuryEntry {
  id: string;
  date: number;
  actor: string;
  description: string;
  amount: number;
  currency: CurrencyType;
  type: 'contribution' | 'withdrawal' | 'purchase' | 'split' | 'reward';
}

export interface PartyTreasury {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
  ledger: PartyTreasuryEntry[];
}

export type HandoutType = 'map' | 'letter' | 'lore' | 'item' | 'npc';

export interface HandoutItem {
  id: string;
  title: string;
  type: HandoutType;
  imageUrl?: string;
  content: string;
  tags: string[];
  isRevealedToParty: boolean;
  dateAdded: number;
  authorOrSource?: string;
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  sessionNumber?: number;
  icon?: string;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  bannerUrl?: string;
  dmName: string;
  dmUserId: string;
  joinCode?: string;
  status: CampaignStatus;
  setting: string;
  startDate: string;
  currentWorldDate: string;
  party: PartyMemberRef[];
  questLog: QuestItem[];
  treasury: PartyTreasury;
  sharedInventory: SharedItem[];
  handouts: HandoutItem[];
  milestones: CampaignMilestone[];
  sessionIds: string[];
  createdAt: number;
  updatedAt: number;
}
