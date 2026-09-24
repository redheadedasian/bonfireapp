export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Skill =
  | "acrobatics"
  | "animalHandling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleightOfHand"
  | "stealth"
  | "survival";

export type ProficiencyLevel = "none" | "proficient" | "expertise";

export interface AbilityScore {
  score: number;
  savingThrowProficiency: ProficiencyLevel;
  customBonus?: number;
}

export interface SkillData {
  ability: Ability;
  proficiency: ProficiencyLevel;
  customBonus?: number;
}

export type Rarity = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary" | "Artifact";

export interface Item {
  id: string;
  name: string;
  iconUrl?: string;
  portraitUrl?: string;
  heroUrl?: string;
  description: string;
  weight: number;
  quantity: number;
  rarity: Rarity;
  equipped: boolean;
  attuned: boolean;
  requiresAttunement: boolean;
  type: "weapon" | "armor" | "consumable" | "gear" | "magic";
  isReadiedInCombat?: boolean; // Max 4 weapons readied in Combat HUD
  damageDice?: string; // e.g., "1d8"
  damageBonus?: number; // e.g., 4
  damageType?: string; // e.g., "Slashing"
  weaponProperties?: string[]; // e.g., ["Versatile (1d10)"]
  properties?: string[]; // e.g., ["finesse", "light"]
  range?: string; // e.g., "5 ft."
  attackBonus?: number; // e.g., 8
  armorClass?: number;
}

export interface Spell {
  id: string;
  name: string;
  iconUrl?: string;
  portraitUrl?: string;
  level: number; // 0 for cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean; // Alias / state for prepared spell
  isPrepared?: boolean; // Unified prepared state
  isReadiedInCombat?: boolean; // Max 6 spells readied in Combat HUD
  concentration: boolean;
  ritual: boolean;
  damageDice?: string;
  damageBonus?: number;
  damageType?: string;
  saveRequired?: Ability;
  spellCategory?: "attack" | "save" | "heal" | "utility";
}

export interface SpellSlotData {
  max: number;
  current: number;
}

export interface LedgerEntry {
  id: string;
  description: string;
  amount: number;
  currency: 'cp' | 'sp' | 'ep' | 'gp' | 'pp';
  type: 'income' | 'expense';
  date: number;
}

export type AccentColorKey =
  | 'default'
  | 'crimson'
  | 'gold'
  | 'cyan'
  | 'umber'
  | 'amber'
  | 'emerald'
  | 'shadow'
  | 'violet';

export interface ThemeConfig {
  accentColor: AccentColorKey;
  customHex?: string;
}

export interface AccentThemeDef {
  key: AccentColorKey;
  name: string;
  archetype: string;
  ink: string;
  glow: string;
}

export const ACCENT_THEMES: Record<AccentColorKey, AccentThemeDef> = {
  default: {
    key: 'default',
    name: 'Default',
    archetype: 'Charcoal / Monochrome',
    ink: '#4a4a4a',
    glow: 'rgba(80, 80, 80, 0.4)',
  },
  crimson: {
    key: 'crimson',
    name: 'Crimson',
    archetype: 'Elementalist',
    ink: '#b81d36',
    glow: 'rgba(220, 40, 70, 0.5)',
  },
  gold: {
    key: 'gold',
    name: 'Autumn Gold',
    archetype: 'Ranger',
    ink: '#b57d22',
    glow: 'rgba(220, 160, 40, 0.5)',
  },
  cyan: {
    key: 'cyan',
    name: 'Celestial Cyan',
    archetype: 'Guardian',
    ink: '#1e6e96',
    glow: 'rgba(45, 165, 220, 0.5)',
  },
  umber: {
    key: 'umber',
    name: 'Rust Umber',
    archetype: 'Engineer',
    ink: '#8c532b',
    glow: 'rgba(180, 100, 50, 0.5)',
  },
  amber: {
    key: 'amber',
    name: 'Sun Amber',
    archetype: 'Warrior',
    ink: '#c98518',
    glow: 'rgba(240, 170, 30, 0.5)',
  },
  emerald: {
    key: 'emerald',
    name: 'Jade Emerald',
    archetype: 'Necromancer',
    ink: '#1e7a4b',
    glow: 'rgba(35, 175, 105, 0.5)',
  },
  shadow: {
    key: 'shadow',
    name: 'Shadow',
    archetype: 'Thief',
    ink: '#242424',
    glow: 'rgba(150, 150, 150, 0.35)',
  },
  violet: {
    key: 'violet',
    name: 'Mesmer Violet',
    archetype: 'Mesmer',
    ink: '#8a2be2',
    glow: 'rgba(180, 70, 240, 0.5)',
  },
};

export interface CharacterState {
  ledger: LedgerEntry[];
  name: string;
  theme?: ThemeConfig;
  portraitUrl?: string;
  heroUrl?: string;
  class: string;
  level: number;
  currentXp?: number;
  species: string;
  background: string;
  alignment: string;
  
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  
  ac: number;
  acDetails?: string;
  speed: number;
  initiativeBonus: number;
  hitDice: {
    total: string;
    current: number;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  exhaustion: number;
  inspiration: boolean;
  proficiencyBonusOverride?: number;
  
  abilities: Record<Ability, AbilityScore>;
  skills: Record<Skill, SkillData>;
  
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  
  inventory: Item[];
  spells: Spell[];
  spellSlots: Record<number, SpellSlotData>; // 1-9
  spellcastingAbility: Ability;
  
  features: {
    id: string;
    name: string;
    portraitUrl?: string;
    description: string;
    source: string;
  }[];
  notes: string;
  activeConcentration?: {
    spellId?: string;
    spellName: string;
    level?: number;
    school?: string;
    duration?: string;
  } | null;
  quests?: { id: string; text: string; completed: boolean }[];
  backstory?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  dmShareCode?: string;
}

export const INITIAL_CHARACTER: CharacterState = {
  name: "Thorin Ironforge",
  theme: {
    accentColor: "default",
  },
  portraitUrl: "",
  heroUrl: "",
  class: "Cleric",
  level: 12,
  currentXp: 105000,
  species: "Mountain Dwarf",
  background: "Soldier",
  alignment: "Neutral",
  hp: { current: 62, max: 74, temp: 0 },
  ac: 18,
  acDetails: "Medium Armor + Shield",
  speed: 25,
  initiativeBonus: 1,
  hitDice: { total: "12d8", current: 5 },
  deathSaves: { successes: 0, failures: 0 },
  exhaustion: 0,
  inspiration: true,
  abilities: {
    str: { score: 18, savingThrowProficiency: "none" },
    dex: { score: 12, savingThrowProficiency: "none" },
    con: { score: 14, savingThrowProficiency: "none" },
    int: { score: 10, savingThrowProficiency: "none" },
    wis: { score: 18, savingThrowProficiency: "proficient" },
    cha: { score: 14, savingThrowProficiency: "proficient" }
  },
  skills: {
    acrobatics: { ability: "dex", proficiency: "none" },
    animalHandling: { ability: "wis", proficiency: "none" },
    arcana: { ability: "int", proficiency: "none" },
    athletics: { ability: "str", proficiency: "proficient" },
    deception: { ability: "cha", proficiency: "none" },
    history: { ability: "int", proficiency: "proficient" },
    insight: { ability: "wis", proficiency: "proficient" },
    intimidation: { ability: "cha", proficiency: "none" },
    investigation: { ability: "int", proficiency: "none" },
    medicine: { ability: "wis", proficiency: "proficient" },
    nature: { ability: "int", proficiency: "none" },
    perception: { ability: "wis", proficiency: "proficient" },
    performance: { ability: "cha", proficiency: "none" },
    persuasion: { ability: "cha", proficiency: "none" },
    religion: { ability: "int", proficiency: "proficient" },
    sleightOfHand: { ability: "dex", proficiency: "none" },
    stealth: { ability: "dex", proficiency: "none" },
    survival: { ability: "wis", proficiency: "none" }
  },
  currency: { cp: 2101, sp: 8, ep: 0, gp: 142, pp: 0 },
  inventory: [
    {
      id: "w1",
      name: "Battleaxe +1",
      description: "A finely forged dwarven battleaxe engraved with radiant sun runes. Versatile and deadly.",
      weight: 4,
      quantity: 1,
      rarity: "Uncommon",
      equipped: true,
      attuned: false,
      requiresAttunement: false,
      type: "weapon",
      isReadiedInCombat: true,
      damageDice: "1d8",
      damageBonus: 5,
      damageType: "Slashing",
      weaponProperties: ["Versatile (1d10)", "Magical"],
      range: "5 ft.",
      attackBonus: 9
    },
    {
      id: "w2",
      name: "Sun Mace of Smiting",
      description: "A glowing adamantine morningstar that pulses with solar warmth. Deals bonus radiant damage on fiends and undead.",
      weight: 4,
      quantity: 1,
      rarity: "Rare",
      equipped: true,
      attuned: false,
      requiresAttunement: false,
      type: "weapon",
      isReadiedInCombat: true,
      damageDice: "1d6",
      damageBonus: 4,
      damageType: "Bludgeoning",
      weaponProperties: ["Radiant Glow", "Light"],
      range: "5 ft.",
      attackBonus: 8
    },
    {
      id: "w3",
      name: "Heavy Crossbow +1",
      description: "Reinforced steel crossbow with an eagle-eye optical sight.",
      weight: 18,
      quantity: 1,
      rarity: "Uncommon",
      equipped: false,
      attuned: false,
      requiresAttunement: false,
      type: "weapon",
      isReadiedInCombat: true,
      damageDice: "1d10",
      damageBonus: 2,
      damageType: "Piercing",
      weaponProperties: ["Ammunition (100/400)", "Heavy", "Two-Handed", "Loading"],
      range: "100/400 ft.",
      attackBonus: 6
    },
    {
      id: "w4",
      name: "Dagger of Venom",
      description: "Blackened curved blade that can coat itself with deadly poison once per day.",
      weight: 1,
      quantity: 1,
      rarity: "Rare",
      equipped: false,
      attuned: false,
      requiresAttunement: false,
      type: "weapon",
      isReadiedInCombat: false,
      damageDice: "1d4",
      damageBonus: 4,
      damageType: "Piercing",
      weaponProperties: ["Finesse", "Light", "Thrown (20/60)"],
      range: "20/60 ft.",
      attackBonus: 8
    },
    {
      id: "a1",
      name: "Breastplate +1",
      description: "Mastercrafted dwarven steel cuirass that protects without hindering movement.",
      weight: 20,
      quantity: 1,
      rarity: "Rare",
      equipped: true,
      attuned: false,
      requiresAttunement: false,
      type: "armor",
      armorClass: 15
    },
    {
      id: "a2",
      name: "Shield of the Sentinel",
      description: "A polished steel shield (+2 AC) granting advantage on initiative rolls and Perception checks.",
      weight: 6,
      quantity: 1,
      rarity: "Uncommon",
      equipped: true,
      attuned: true,
      requiresAttunement: true,
      type: "armor",
      armorClass: 2
    },
    {
      id: "m1",
      name: "Ring of Protection",
      description: "+1 bonus to AC and Saving Throws.",
      weight: 0.1,
      quantity: 1,
      rarity: "Rare",
      equipped: true,
      attuned: true,
      requiresAttunement: true,
      type: "magic"
    },
    {
      id: "m2",
      name: "Periapt of Wound Closure",
      description: "Stabilizes immediately when dying and doubles hit dice healing.",
      weight: 0.5,
      quantity: 1,
      rarity: "Uncommon",
      equipped: true,
      attuned: true,
      requiresAttunement: true,
      type: "magic"
    },
    {
      id: "c1",
      name: "Potion of Superior Healing",
      description: "Restores 8d4 + 8 hit points when consumed.",
      weight: 0.5,
      quantity: 3,
      rarity: "Rare",
      equipped: false,
      attuned: false,
      requiresAttunement: false,
      type: "consumable"
    },
    {
      id: "c2",
      name: "Scroll of Revivify",
      description: "Touch a creature that has died within the last minute to return it to life with 1 HP.",
      weight: 0.2,
      quantity: 2,
      rarity: "Uncommon",
      equipped: false,
      attuned: false,
      requiresAttunement: false,
      type: "consumable"
    },
    {
      id: "g1",
      name: "Explorer's Pack & Rations",
      description: "Bedroll, mess kit, tinderbox, 10 days of dried meat and water rations.",
      weight: 15,
      quantity: 1,
      rarity: "Common",
      equipped: false,
      attuned: false,
      requiresAttunement: false,
      type: "gear"
    }
  ],
  spells: [
    {
      id: "s1",
      name: "Spiritual Weapon",
      level: 2,
      school: "Evocation",
      castingTime: "Bonus Action",
      range: "60 ft.",
      components: "V, S",
      duration: "1 minute",
      description: "You create a floating, spectral weapon within range that lasts for 1 minute. When cast and as a bonus action on subsequent turns, you can make a melee spell attack against a target within 5 ft of the weapon.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "1d8",
      damageBonus: 4,
      damageType: "Force",
      spellCategory: "attack"
    },
    {
      id: "s2",
      name: "Sacred Flame",
      level: 0,
      school: "Evocation",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S",
      duration: "Instantaneous",
      description: "Flame-like radiance descends on a creature you can see within range. The target must succeed on a DEX saving throw (DC 16) or take 3d8 radiant damage. The target gains no benefit from cover.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "3d8",
      damageType: "Radiant",
      saveRequired: "dex",
      spellCategory: "save"
    },
    {
      id: "s3",
      name: "Cure Wounds",
      level: 1,
      school: "Evocation",
      castingTime: "1 Action",
      range: "Touch",
      components: "V, S",
      duration: "Instantaneous",
      description: "A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier (+4). Upcast: +1d8 per spell level.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "1d8",
      damageBonus: 4,
      spellCategory: "heal"
    },
    {
      id: "s4",
      name: "Guiding Bolt",
      level: 1,
      school: "Evocation",
      castingTime: "1 Action",
      range: "120 ft.",
      components: "V, S",
      duration: "1 round",
      description: "A flash of light streaks toward a creature within range. Make a ranged spell attack (+8). On a hit, target takes 4d6 radiant damage, and next attack roll made against it has advantage.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "4d6",
      damageType: "Radiant",
      spellCategory: "attack"
    },
    {
      id: "s5",
      name: "Toll the Dead",
      level: 0,
      school: "Necromancy",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S",
      duration: "Instantaneous",
      description: "You point at one creature within range as dolorous bell tolls. The target must succeed on a WIS saving throw (DC 16) or take 3d8 necrotic damage (or 3d12 if missing any HP).",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "3d8",
      damageType: "Necrotic",
      saveRequired: "wis",
      spellCategory: "save"
    },
    {
      id: "s6",
      name: "Healing Word",
      level: 1,
      school: "Evocation",
      castingTime: "Bonus Action",
      range: "60 ft.",
      components: "V",
      duration: "Instantaneous",
      description: "A creature of your choice within range regains 1d4 + 4 hit points as a quick bonus action prayer.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: true,
      concentration: false,
      ritual: false,
      damageDice: "1d4",
      damageBonus: 4,
      spellCategory: "heal"
    },
    {
      id: "s7",
      name: "Spirit Guardians",
      level: 3,
      school: "Conjuration",
      castingTime: "1 Action",
      range: "Self (15 ft. emanation)",
      components: "V, S, M",
      duration: "Concentration, up to 10 mins",
      description: "Protective spirits flit around you. Enemies have halved speed and take 3d8 radiant damage on a failed WIS save (DC 16), or half on a success.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: true,
      ritual: false,
      damageDice: "3d8",
      damageType: "Radiant",
      saveRequired: "wis",
      spellCategory: "save"
    },
    {
      id: "s8",
      name: "Bless",
      level: 1,
      school: "Enchantment",
      castingTime: "1 Action",
      range: "30 ft.",
      components: "V, S, M",
      duration: "Concentration, up to 1 min",
      description: "Bless up to three creatures. Whenever a target makes an attack roll or saving throw, it adds 1d4 to the roll.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: true,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s9",
      name: "Flame Strike",
      level: 5,
      school: "Evocation",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S, M",
      duration: "Instantaneous",
      description: "A vertical column of divine fire roars down. Creatures in a 10-ft radius must make a DEX save (DC 16) taking 4d6 fire + 4d6 radiant damage, or half on success.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      damageDice: "8d6",
      damageType: "Radiant / Fire",
      saveRequired: "dex",
      spellCategory: "save"
    },
    {
      id: "s10",
      name: "Mass Healing Word",
      level: 3,
      school: "Evocation",
      castingTime: "Bonus Action",
      range: "60 ft.",
      components: "V",
      duration: "Instantaneous",
      description: "As you call out words of restoration, up to six creatures of your choice within range regain 1d4 + 4 hit points.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      damageDice: "1d4",
      damageBonus: 4,
      spellCategory: "heal"
    },
    {
      id: "s11",
      name: "Revivify",
      level: 3,
      school: "Necromancy",
      castingTime: "1 Action",
      range: "Touch",
      components: "V, S, M (diamonds worth 300 gp)",
      duration: "Instantaneous",
      description: "Touch a creature that has died within the last minute. The creature revives with 1 hit point.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s12",
      name: "Banishment",
      level: 4,
      school: "Abjuration",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S, M",
      duration: "Concentration, up to 1 min",
      description: "Attempt to send one creature to another plane of existence. Target must succeed on a Charisma save (DC 16) or be banished.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: true,
      ritual: false,
      saveRequired: "cha",
      spellCategory: "save"
    },
    {
      id: "s13",
      name: "Thaumaturgy",
      level: 0,
      school: "Transmutation",
      castingTime: "1 Action",
      range: "30 ft.",
      components: "V",
      duration: "Up to 1 minute",
      description: "Manifest minor wonders: booming voice, tremors, flickering flames, slamming doors, or ominous whispers.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s14",
      name: "Guidance",
      level: 0,
      school: "Divination",
      castingTime: "1 Action",
      range: "Touch",
      components: "V, S",
      duration: "Concentration, up to 1 min",
      description: "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number to one ability check of its choice.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: true,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s15",
      name: "Lesser Restoration",
      level: 2,
      school: "Abjuration",
      castingTime: "1 Action",
      range: "Touch",
      components: "V, S",
      duration: "Instantaneous",
      description: "You touch a creature and can end either one disease or one condition afflicting it: blinded, deafened, paralyzed, or poisoned.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s16",
      name: "Death Ward",
      level: 4,
      school: "Abjuration",
      castingTime: "1 Action",
      range: "Touch",
      components: "V, S",
      duration: "8 hours",
      description: "You touch a creature. The first time the target would drop to 0 hit points, it instead drops to 1 hit point, and the spell ends.",
      prepared: true,
      isPrepared: true,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      spellCategory: "utility"
    },
    {
      id: "s17",
      name: "Heal",
      level: 6,
      school: "Evocation",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S",
      duration: "Instantaneous",
      description: "A surge of positive energy washes through a creature. Target regains 70 hit points and ends blindness, deafness, and diseases.",
      prepared: false,
      isPrepared: false,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      spellCategory: "heal"
    },
    {
      id: "s18",
      name: "Harm",
      level: 6,
      school: "Necromancy",
      castingTime: "1 Action",
      range: "60 ft.",
      components: "V, S",
      duration: "Instantaneous",
      description: "You unleash a virulent disease. Target must make a CON save (DC 16) taking 14d6 necrotic damage on failure, or half on success.",
      prepared: false,
      isPrepared: false,
      isReadiedInCombat: false,
      concentration: false,
      ritual: false,
      damageDice: "14d6",
      damageType: "Necrotic",
      saveRequired: "con",
      spellCategory: "save"
    }
  ],
  spellSlots: {
    1: { max: 4, current: 3 },
    2: { max: 3, current: 3 },
    3: { max: 3, current: 3 },
    4: { max: 3, current: 3 },
    5: { max: 2, current: 2 },
    6: { max: 1, current: 1 }
  },
  spellcastingAbility: "wis",
  features: [
    { id: "f1", name: "Drow Weapon Training", description: "Proficiency with rapiers, shortswords, and hand crossbows.", source: "Species" },
    { id: "f2", name: "War Priest", description: "When you use the Attack action, you can make one weapon attack as a bonus action (WIS modifier times per long rest).", source: "Class" },
    { id: "f3", name: "Guided Strike", description: "Channel Divinity: You can grant yourself a +10 bonus to an attack roll.", source: "Class" },
    { id: "f4", name: "War God's Blessing", description: "Channel Divinity: When a creature within 30 ft makes an attack roll, you can use your reaction to grant that creature a +10 bonus to the roll.", source: "Class" },
    { id: "f5", name: "Divine Strike", description: "Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage.", source: "Class" }
  ],
  notes: "Thorin Ironforge - Veteran chaplain of the Iron Vanguard. Sworn to the silver dawn, wielding radiant light against deep dark horrors.\n\nCurrent Quest: Investigate the ancient dwarven crypts of Karak-Varn and locate the Sunken Sun Shard.",
  activeConcentration: null,
  ledger: [
    { id: "l1", description: "Inn Stay & Rations", amount: 5, currency: "sp", type: "expense", date: Date.now() - 86400000 },
    { id: "l2", description: "Bounty on Shadow Beast", amount: 150, currency: "gp", type: "income", date: Date.now() - 3600000 },
    { id: "l3", description: "Sold Broken Halberd", amount: 5, currency: "gp", type: "income", date: Date.now() - 1800000 },
    { id: "l4", description: "Purchased Diamond Dust for Revivify", amount: 300, currency: "gp", type: "expense", date: Date.now() }
  ]
};
