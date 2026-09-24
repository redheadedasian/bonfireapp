// SRD 5.1 / Open5e Monster Compendium for Bonfire D&D 5e

export interface MonsterAction {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
}

export interface MonsterTrait {
  name: string;
  description: string;
}

export interface SRDMonster {
  id: string;
  name: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  type: string;
  subtype?: string;
  alignment: string;
  ac: number;
  acType?: string;
  hp: number;
  hitDice: string;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  savingThrows?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;
  cr: string;
  xp: number;
  traits: MonsterTrait[];
  actions: MonsterAction[];
  legendaryActions?: MonsterTrait[];
  lairActions?: MonsterTrait[];
  regionalEffects?: string[];
  imageUrl?: string;
  isCustom?: boolean;
}

export const SRD_MONSTERS_CATALOG: SRDMonster[] = [
  {
    id: 'srd-goblin',
    name: 'Goblin',
    size: 'Small',
    type: 'Humanoid',
    subtype: 'Goblinoid',
    alignment: 'Neutral Evil',
    ac: 15,
    acType: 'Leather Armor, Shield',
    hp: 7,
    hitDice: '2d6',
    speed: '30 ft.',
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    skills: 'Stealth +6',
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'Common, Goblin',
    cr: '1/4',
    xp: 50,
    traits: [
      {
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'
      }
    ],
    actions: [
      {
        name: 'Scimitar',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
        attackBonus: 4,
        damage: '1d6+2'
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2'
      }
    ]
  },
  {
    id: 'srd-skeleton',
    name: 'Skeleton',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Lawful Evil',
    ac: 13,
    acType: 'Armor Scraps',
    hp: 13,
    hitDice: '2d8 + 4',
    speed: '30 ft.',
    str: 10,
    dex: 14,
    con: 15,
    int: 6,
    wis: 8,
    cha: 5,
    damageImmunities: 'Poison',
    conditionImmunities: 'Exhaustion, Poisoned',
    senses: 'Darkvision 60 ft., Passive Perception 9',
    languages: 'Understands languages it knew in life but cannot speak',
    cr: '1/4',
    xp: 50,
    traits: [
      {
        name: 'Vulnerability',
        description: 'The skeleton is vulnerable to bludgeoning damage.'
      }
    ],
    actions: [
      {
        name: 'Shortsword',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2'
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2'
      }
    ]
  },
  {
    id: 'srd-zombie',
    name: 'Zombie',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Neutral Evil',
    ac: 8,
    hp: 22,
    hitDice: '3d8 + 9',
    speed: '20 ft.',
    str: 13,
    dex: 6,
    con: 16,
    int: 3,
    wis: 6,
    cha: 5,
    savingThrows: 'Wis +0',
    damageImmunities: 'Poison',
    conditionImmunities: 'Poisoned',
    senses: 'Darkvision 60 ft., Passive Perception 8',
    languages: 'Understands the languages it knew in life but cannot speak',
    cr: '1/4',
    xp: 50,
    traits: [
      {
        name: 'Undead Fortitude',
        description: 'If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.'
      }
    ],
    actions: [
      {
        name: 'Slam',
        description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.',
        attackBonus: 3,
        damage: '1d6+1'
      }
    ]
  },
  {
    id: 'srd-orc',
    name: 'Orc',
    size: 'Medium',
    type: 'Humanoid',
    subtype: 'Orc',
    alignment: 'Chaotic Evil',
    ac: 13,
    acType: 'Hide Armor',
    hp: 15,
    hitDice: '2d8 + 6',
    speed: '30 ft.',
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    skills: 'Intimidation +2',
    senses: 'Darkvision 60 ft., Passive Perception 10',
    languages: 'Common, Orc',
    cr: '1/2',
    xp: 100,
    traits: [
      {
        name: 'Aggressive',
        description: 'As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.'
      }
    ],
    actions: [
      {
        name: 'Greataxe',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.',
        attackBonus: 5,
        damage: '1d12+3'
      },
      {
        name: 'Javelin',
        description: 'Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 6 (1d6 + 3) piercing damage.',
        attackBonus: 5,
        damage: '1d6+3'
      }
    ]
  },
  {
    id: 'srd-ghoul',
    name: 'Ghoul',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Chaotic Evil',
    ac: 12,
    hp: 22,
    hitDice: '5d8',
    speed: '30 ft.',
    str: 13,
    dex: 15,
    con: 10,
    int: 7,
    wis: 10,
    cha: 6,
    damageImmunities: 'Poison',
    conditionImmunities: 'Charmed, Exhaustion, Poisoned',
    senses: 'Darkvision 60 ft., Passive Perception 10',
    languages: 'Common',
    cr: '1',
    xp: 200,
    traits: [],
    actions: [
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) piercing damage.',
        attackBonus: 2,
        damage: '2d6+2'
      },
      {
        name: 'Claws',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage. If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute.',
        attackBonus: 4,
        damage: '2d4+2'
      }
    ]
  },
  {
    id: 'srd-ogre',
    name: 'Ogre',
    size: 'Large',
    type: 'Giant',
    alignment: 'Chaotic Evil',
    ac: 11,
    acType: 'Hide Armor',
    hp: 59,
    hitDice: '7d10 + 21',
    speed: '40 ft.',
    str: 19,
    dex: 8,
    con: 16,
    int: 5,
    wis: 7,
    cha: 7,
    senses: 'Darkvision 60 ft., Passive Perception 8',
    languages: 'Common, Giant',
    cr: '2',
    xp: 450,
    traits: [],
    actions: [
      {
        name: 'Greatclub',
        description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage.',
        attackBonus: 6,
        damage: '2d8+4'
      },
      {
        name: 'Javelin',
        description: 'Ranged Weapon Attack: +6 to hit, range 30/120 ft., one target. Hit: 11 (2d6 + 4) piercing damage.',
        attackBonus: 6,
        damage: '2d6+4'
      }
    ]
  },
  {
    id: 'srd-owlbear',
    name: 'Owlbear',
    size: 'Large',
    type: 'Monstrosity',
    alignment: 'Unaligned',
    ac: 13,
    acType: 'Natural Armor',
    hp: 59,
    hitDice: '7d10 + 21',
    speed: '40 ft.',
    str: 20,
    dex: 12,
    con: 17,
    int: 3,
    wis: 12,
    cha: 7,
    skills: 'Perception +3',
    senses: 'Darkvision 60 ft., Passive Perception 13',
    languages: '—',
    cr: '3',
    xp: 700,
    traits: [
      {
        name: 'Keen Sight and Smell',
        description: 'The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The owlbear makes two attacks: one with its beak and one with its claws.'
      },
      {
        name: 'Beak',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d10 + 5) piercing damage.',
        attackBonus: 7,
        damage: '1d10+5'
      },
      {
        name: 'Claws',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage.',
        attackBonus: 7,
        damage: '2d8+5'
      }
    ]
  },
  {
    id: 'srd-wraith',
    name: 'Wraith',
    size: 'Medium',
    type: 'Undead',
    alignment: 'Neutral Evil',
    ac: 13,
    hp: 67,
    hitDice: '9d8 + 27',
    speed: '0 ft., fly 60 ft. (hover)',
    str: 6,
    dex: 16,
    con: 16,
    int: 12,
    wis: 14,
    cha: 15,
    damageResistances: 'Acid, Cold, Fire, Lightning, Thunder; Bludgeoning, Piercing, and Slashing from Nonmagical Attacks',
    damageImmunities: 'Necrotic, Poison',
    conditionImmunities: 'Charmed, Exhaustion, Grappled, Paralyzed, Petrified, Poisoned, Prone, Restrained',
    senses: 'Darkvision 60 ft., Passive Perception 12',
    languages: 'Common, Infernal',
    cr: '5',
    xp: 1800,
    traits: [
      {
        name: 'Incorporeal Movement',
        description: 'The wraith can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.'
      },
      {
        name: 'Sunlight Sensitivity',
        description: 'While in sunlight, the wraith has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.'
      }
    ],
    actions: [
      {
        name: 'Life Drain',
        description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 21 (4d8 + 3) necrotic damage. The target must succeed on a DC 14 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken.',
        attackBonus: 6,
        damage: '4d8+3'
      },
      {
        name: 'Create Specter',
        description: 'The wraith targets a humanoid within 10 feet of it that has been dead for no longer than 1 minute and died violently. The target\'s spirit rises as a specter in the space of its corpse or in the nearest unoccupied space.'
      }
    ]
  },
  {
    id: 'srd-young-red-dragon',
    name: 'Young Red Dragon',
    size: 'Large',
    type: 'Dragon',
    alignment: 'Chaotic Evil',
    ac: 18,
    acType: 'Natural Armor',
    hp: 178,
    hitDice: '17d10 + 85',
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    str: 23,
    dex: 10,
    con: 21,
    int: 14,
    wis: 11,
    cha: 19,
    savingThrows: 'Dex +4, Con +9, Wis +4, Cha +8',
    skills: 'Perception +8, Stealth +4',
    damageImmunities: 'Fire',
    senses: 'Blindsight 30 ft., Darkvision 120 ft., Passive Perception 18',
    languages: 'Common, Draconic',
    cr: '10',
    xp: 5900,
    traits: [],
    actions: [
      {
        name: 'Multiattack',
        description: 'The dragon makes three attacks: one with its bite and two with its claws.'
      },
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 3 (1d6) fire damage.',
        attackBonus: 10,
        damage: '2d10+6+1d6'
      },
      {
        name: 'Claw',
        description: 'Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage.',
        attackBonus: 10,
        damage: '2d6+6'
      },
      {
        name: 'Fire Breath (Recharge 5–6)',
        description: 'The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one.'
      }
    ]
  },
  {
    id: 'srd-adult-red-dragon',
    name: 'Adult Red Dragon',
    size: 'Huge',
    type: 'Dragon',
    alignment: 'Chaotic Evil',
    ac: 19,
    acType: 'Natural Armor',
    hp: 256,
    hitDice: '19d12 + 133',
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    str: 27,
    dex: 10,
    con: 25,
    int: 16,
    wis: 13,
    cha: 21,
    savingThrows: 'Dex +6, Con +13, Wis +7, Cha +11',
    skills: 'Perception +13, Stealth +6',
    damageImmunities: 'Fire',
    senses: 'Blindsight 60 ft., Darkvision 120 ft., Passive Perception 23',
    languages: 'Common, Draconic',
    cr: '17',
    xp: 18000,
    traits: [
      {
        name: 'Legendary Resistance (3/Day)',
        description: 'If the dragon fails a saving throw, it can choose to succeed instead.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
      },
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.',
        attackBonus: 14,
        damage: '2d10+8+2d6'
      },
      {
        name: 'Claw',
        description: 'Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage.',
        attackBonus: 14,
        damage: '2d6+8'
      },
      {
        name: 'Fire Breath (Recharge 5–6)',
        description: 'The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.'
      }
    ],
    legendaryActions: [
      {
        name: 'Detect',
        description: 'The dragon makes a Wisdom (Perception) check.'
      },
      {
        name: 'Tail Attack',
        description: 'The dragon makes a tail attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage.'
      },
      {
        name: 'Wing Attack (Costs 2 Actions)',
        description: 'The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.'
      }
    ]
  }
];
