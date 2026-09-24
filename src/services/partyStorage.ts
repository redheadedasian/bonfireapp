import { SharedItem, PartyTreasury, PartyTreasuryEntry, CurrencyType } from '../types/campaign';
import { Item, CharacterState } from '../types';

const PARTY_STASH_STORAGE_KEY = 'bonfire_party_stash_v1';
const PARTY_TREASURY_STORAGE_KEY = 'bonfire_party_treasury_v1';

export const INITIAL_PARTY_TREASURY: PartyTreasury = {
  cp: 350,
  sp: 120,
  ep: 0,
  gp: 580,
  pp: 15,
  ledger: [
    {
      id: 'pt-init-1',
      date: Date.now() - 86400000 * 2,
      actor: 'Party',
      description: 'Dungeon bounty reward from Baron von Richter',
      amount: 500,
      currency: 'gp',
      type: 'reward'
    },
    {
      id: 'pt-init-2',
      date: Date.now() - 86400000,
      actor: 'Thorin Ironforge',
      description: 'Deposit from personal spoils',
      amount: 80,
      currency: 'gp',
      type: 'contribution'
    }
  ]
};

export const INITIAL_PARTY_STASH: SharedItem[] = [
  {
    id: 'ps-1',
    name: 'Bag of Holding',
    description: 'This bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. Can hold up to 500 pounds.',
    weight: 15,
    quantity: 1,
    rarity: 'Uncommon',
    type: 'gear',
    holder: 'Party Wagon',
    iconUrl: '',
    addedBy: 'Party',
    dateAdded: Date.now() - 86400000 * 3
  },
  {
    id: 'ps-2',
    name: 'Potion of Greater Healing',
    description: 'A magical amber elixir. You regain 4d4 + 4 hit points when you drink this potion.',
    weight: 0.5,
    quantity: 3,
    rarity: 'Uncommon',
    type: 'consumable',
    holder: 'Bag of Holding',
    iconUrl: '',
    addedBy: 'Vespera Nightshade',
    dateAdded: Date.now() - 86400000 * 2
  },
  {
    id: 'ps-3',
    name: 'Scroll of Revivify',
    description: 'Touch a creature that has died within the last minute. That creature returns to life with 1 hit point.',
    weight: 0.1,
    quantity: 1,
    rarity: 'Rare',
    type: 'consumable',
    holder: 'Bag of Holding',
    iconUrl: '',
    addedBy: 'Thorin Ironforge',
    dateAdded: Date.now() - 86400000
  },
  {
    id: 'ps-4',
    name: 'Folding Boat',
    description: 'A wooden box 12 inches long, 6 inches wide, and 6 inches deep. Commands unfold it into a skiff or a large ship.',
    weight: 4,
    quantity: 1,
    rarity: 'Rare',
    type: 'magic',
    holder: 'Party Wagon',
    iconUrl: '',
    addedBy: 'Party',
    dateAdded: Date.now() - 86400000 * 4
  }
];

export function getLocalPartyTreasury(): PartyTreasury {
  if (typeof window === 'undefined') return INITIAL_PARTY_TREASURY;
  try {
    const raw = localStorage.getItem(PARTY_TREASURY_STORAGE_KEY);
    if (!raw) return INITIAL_PARTY_TREASURY;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARTY_TREASURY;
  }
}

export function saveLocalPartyTreasury(treasury: PartyTreasury): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARTY_TREASURY_STORAGE_KEY, JSON.stringify(treasury));
}

export function getLocalPartyStash(): SharedItem[] {
  if (typeof window === 'undefined') return INITIAL_PARTY_STASH;
  try {
    const raw = localStorage.getItem(PARTY_STASH_STORAGE_KEY);
    if (!raw) return INITIAL_PARTY_STASH;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARTY_STASH;
  }
}

export function saveLocalPartyStash(stash: SharedItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARTY_STASH_STORAGE_KEY, JSON.stringify(stash));
}
