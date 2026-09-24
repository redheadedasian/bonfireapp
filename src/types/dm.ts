// Dungeon Master (DM) Command Types for Bonfire D&D 5e
import { CurrencyType } from './campaign';

export type CombatantType = 'player' | 'npc' | 'monster';

export interface InitiativeCombatant {
  id: string;
  name: string;
  type: CombatantType;
  initiativeRoll: number;
  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  ac: number;
  speed: number;
  passivePerception?: number;
  conditions: string[];
  concentration: boolean;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  notes?: string;
  characterRefId?: string;
  avatarUrl?: string;
  isCurrentTurn: boolean;
  legendaryActionsMax?: number;
  legendaryActionsRemaining?: number;
  actionsUsed?: {
    action?: boolean;
    bonusAction?: boolean;
    reaction?: boolean;
    movement?: boolean;
  };
}

export interface CombatState {
  inCombat: boolean;
  round: number;
  turnIndex: number;
  combatants: InitiativeCombatant[];
  combatLog: { id: string; timestamp: number; text: string }[];
}

export interface BattlefieldBackground {
  source: 'preset' | 'upload';
  presetId?: string;   // key into the bundled preset registry
  imageUrl?: string;   // compressed base64 data URL, when source === 'upload'
}

export interface DmSecretRoll {
  id: string;
  timestamp: number;
  command: string;
  result: number;
  breakdown: string;
  label: string;
  isRevealed: boolean;
}

export type DmNoteCategory = 'tactics' | 'traps' | 'secrets' | 'npcs' | 'lore' | 'loot' | 'plot';

export interface DmPrivateNote {
  id: string;
  title: string;
  category: DmNoteCategory;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  updatedAt: number;
}

export interface PartyPurchaseRequest {
  id: string;
  buyerName: string;
  itemOrService: string;
  cost: number;
  currency: CurrencyType;
  target: 'individual' | 'party';
  recipientCharacterId?: string;
  date: number;
}
