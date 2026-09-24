// D&D 5e Multi-Source Monster Compendium Service
import { SRDMonster, SRD_MONSTERS_CATALOG } from '../data/srdMonsters';

export const LOCAL_BESTIARY_KEY = 'bonfire_custom_bestiary_v1';

// Default atmospheric fantasy creature portraits by monster type
export const MONSTER_TYPE_ARTWORK: Record<string, string> = {
  aberration: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  beast: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1200&q=80',
  celestial: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  construct: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
  dragon: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?auto=format&fit=crop&w=1200&q=80',
  elemental: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  fey: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  fiend: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1200&q=80',
  giant: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=1200&q=80',
  humanoid: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
  monstrosity: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
  ooze: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  plant: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  undead: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
};

export function getMonsterDefaultArtwork(type: string): string {
  const normalized = type?.toLowerCase() || '';
  for (const [key, url] of Object.entries(MONSTER_TYPE_ARTWORK)) {
    if (normalized.includes(key)) return url;
  }
  return MONSTER_TYPE_ARTWORK.default;
}

export function getCustomMonsters(): SRDMonster[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_BESTIARY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomMonster(monster: SRDMonster): void {
  if (typeof window === 'undefined') return;
  const current = getCustomMonsters();
  const index = current.findIndex(m => m.id === monster.id);
  let next: SRDMonster[];
  if (index >= 0) {
    next = [...current];
    next[index] = monster;
  } else {
    next = [monster, ...current];
  }
  localStorage.setItem(LOCAL_BESTIARY_KEY, JSON.stringify(next));
}

export function deleteCustomMonster(id: string): void {
  if (typeof window === 'undefined') return;
  const current = getCustomMonsters();
  const next = current.filter(m => m.id !== id);
  localStorage.setItem(LOCAL_BESTIARY_KEY, JSON.stringify(next));
}

// In-memory cache for API queried monsters
const onlineCache = new Map<string, SRDMonster[]>();

interface Open5eRawMonster {
  slug?: string;
  name: string;
  size?: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  type?: string;
  subtype?: string;
  alignment?: string;
  armor_class?: number;
  armor_desc?: string;
  hit_points?: number;
  hit_dice?: string;
  speed?: Record<string, number> | string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  senses?: string;
  languages?: string;
  challenge_rating?: string | number;
  cr?: string | number;
  img_main?: string;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string; attack_bonus?: number; damage_dice?: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
}

export async function searchOpen5eApi(query: string): Promise<SRDMonster[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  if (onlineCache.has(cleanQuery)) {
    return onlineCache.get(cleanQuery)!;
  }

  try {
    const url = `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(cleanQuery)}&limit=15`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    const mapped: SRDMonster[] = (data.results as Open5eRawMonster[]).map((r) => ({
      id: `open5e-${r.slug || Math.random().toString(36).substr(2, 9)}`,
      name: r.name,
      size: r.size || 'Medium',
      type: r.type || 'Monstrosity',
      subtype: r.subtype || undefined,
      alignment: r.alignment || 'Unaligned',
      ac: r.armor_class || 12,
      acType: r.armor_desc || undefined,
      hp: r.hit_points || 30,
      hitDice: r.hit_dice || '4d8',
      speed: typeof r.speed === 'object' && r.speed !== null ? Object.entries(r.speed).map(([k, v]) => `${k} ${v} ft.`).join(', ') : String(r.speed || '30 ft.'),
      str: r.strength || 10,
      dex: r.dexterity || 10,
      con: r.constitution || 10,
      int: r.intelligence || 10,
      wis: r.wisdom || 10,
      cha: r.charisma || 10,
      senses: r.senses || 'Passive Perception 10',
      languages: r.languages || '—',
      cr: String(r.challenge_rating ?? '1'),
      xp: r.cr ? Math.round(Number(r.cr) * 200) || 100 : 100,
      imageUrl: r.img_main || getMonsterDefaultArtwork(r.type || ''),
      traits: Array.isArray(r.special_abilities)
        ? r.special_abilities.map((a) => ({ name: a.name, description: a.desc }))
        : [],
      actions: Array.isArray(r.actions)
        ? r.actions.map((a) => ({
            name: a.name,
            description: a.desc,
            attackBonus: a.attack_bonus,
            damage: a.damage_dice
          }))
        : [],
      legendaryActions: Array.isArray(r.legendary_actions)
        ? r.legendary_actions.map((a) => ({ name: a.name, description: a.desc }))
        : undefined,
      isCustom: false
    }));

    onlineCache.set(cleanQuery, mapped);
    return mapped;
  } catch {
    return [];
  }
}

export async function searchAllMonstersCombined(query: string, typeFilter: string = 'all'): Promise<SRDMonster[]> {
  const custom = getCustomMonsters();
  const srd = SRD_MONSTERS_CATALOG;
  const localCombined = [...custom, ...srd];

  const q = query.trim().toLowerCase();
  let localFiltered = localCombined;

  if (typeFilter !== 'all') {
    localFiltered = localFiltered.filter(m => m.type.toLowerCase() === typeFilter.toLowerCase());
  }

  if (q) {
    localFiltered = localFiltered.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.type.toLowerCase().includes(q) || 
      m.cr.includes(q)
    );
  }

  // If query is provided, query Open5e API in parallel to fetch any extended 5e monsters
  if (q.length >= 2) {
    try {
      const apiResults = await searchOpen5eApi(q);
      const existingNames = new Set(localFiltered.map(m => m.name.toLowerCase()));
      const uniqueApiResults = apiResults.filter(m => !existingNames.has(m.name.toLowerCase()));
      return [...localFiltered, ...uniqueApiResults];
    } catch {
      return localFiltered;
    }
  }

  return localFiltered;
}
