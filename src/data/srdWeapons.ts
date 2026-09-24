export interface SRDWeaponData {
  name: string;
  category: 'Simple Melee' | 'Simple Ranged' | 'Martial Melee' | 'Martial Ranged';
  damageDice: string;
  damageType: string;
  damageBonus?: number;
  attackBonus?: number;
  weight: number;
  cost: string;
  range: string;
  properties: string[];
  description: string;
}

export const SRD_WEAPONS_CATALOG: SRDWeaponData[] = [
  // Simple Melee
  {
    name: "Club",
    category: "Simple Melee",
    damageDice: "1d4",
    damageType: "Bludgeoning",
    weight: 2,
    cost: "1 sp",
    range: "5 ft.",
    properties: ["Light"],
    description: "A solid wooden club used for simple bludgeoning attacks."
  },
  {
    name: "Dagger",
    category: "Simple Melee",
    damageDice: "1d4",
    damageType: "Piercing",
    weight: 1,
    cost: "2 gp",
    range: "20/60 ft.",
    properties: ["Finesse", "Light", "Thrown"],
    description: "A small, easily concealed blade favored for swift strikes and throwing."
  },
  {
    name: "Greatclub",
    category: "Simple Melee",
    damageDice: "1d8",
    damageType: "Bludgeoning",
    weight: 10,
    cost: "2 sp",
    range: "5 ft.",
    properties: ["Two-Handed"],
    description: "A hefty two-handed timber club capable of crushing blows."
  },
  {
    name: "Handaxe",
    category: "Simple Melee",
    damageDice: "1d6",
    damageType: "Slashing",
    weight: 2,
    cost: "5 gp",
    range: "20/60 ft.",
    properties: ["Light", "Thrown"],
    description: "A versatile hatchet useful in melee combat or hurled across distance."
  },
  {
    name: "Javelin",
    category: "Simple Melee",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 2,
    cost: "5 sp",
    range: "30/120 ft.",
    properties: ["Thrown"],
    description: "A light spear designed primarily to be thrown with deadly precision."
  },
  {
    name: "Light Hammer",
    category: "Simple Melee",
    damageDice: "1d4",
    damageType: "Bludgeoning",
    weight: 2,
    cost: "2 gp",
    range: "20/60 ft.",
    properties: ["Light", "Thrown"],
    description: "A compact forged hammer suited for rapid swings or thrown strikes."
  },
  {
    name: "Mace",
    category: "Simple Melee",
    damageDice: "1d6",
    damageType: "Bludgeoning",
    weight: 4,
    cost: "5 gp",
    range: "5 ft.",
    properties: [],
    description: "A flanged metal-headed cudgel standard issue among temple guards and clerics."
  },
  {
    name: "Quarterstaff",
    category: "Simple Melee",
    damageDice: "1d6",
    damageType: "Bludgeoning",
    weight: 4,
    cost: "2 sp",
    range: "5 ft.",
    properties: ["Versatile (1d8)"],
    description: "A sturdy wooden staff that can be swung one-handed or two-handed."
  },
  {
    name: "Spear",
    category: "Simple Melee",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 3,
    cost: "1 gp",
    range: "20/60 ft.",
    properties: ["Thrown", "Versatile (1d8)"],
    description: "A pointed shaft weapon that excels when held or thrown."
  },

  // Simple Ranged
  {
    name: "Light Crossbow",
    category: "Simple Ranged",
    damageDice: "1d8",
    damageType: "Piercing",
    weight: 5,
    cost: "25 gp",
    range: "80/320 ft.",
    properties: ["Ammunition", "Loading", "Two-Handed"],
    description: "A mechanized bow firing bolts with great force at medium range."
  },
  {
    name: "Dart",
    category: "Simple Ranged",
    damageDice: "1d4",
    damageType: "Piercing",
    weight: 0.25,
    cost: "5 cp",
    range: "20/60 ft.",
    properties: ["Finesse", "Thrown"],
    description: "A weighted throwing dart used for rapid harassment."
  },
  {
    name: "Shortbow",
    category: "Simple Ranged",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 2,
    cost: "25 gp",
    range: "80/320 ft.",
    properties: ["Ammunition", "Two-Handed"],
    description: "A curved tension bow suitable for skirmishers and hunters."
  },
  {
    name: "Sling",
    category: "Simple Ranged",
    damageDice: "1d4",
    damageType: "Bludgeoning",
    weight: 0,
    cost: "1 sp",
    range: "30/120 ft.",
    properties: ["Ammunition"],
    description: "A leather pouch and cords for hurling smooth river stones or bullets."
  },

  // Martial Melee
  {
    name: "Battleaxe",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Slashing",
    weight: 4,
    cost: "10 gp",
    range: "5 ft.",
    properties: ["Versatile (1d10)"],
    description: "A heavy-bladed axe built for devastating one- or two-handed strikes."
  },
  {
    name: "Flail",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Bludgeoning",
    weight: 2,
    cost: "10 gp",
    range: "5 ft.",
    properties: [],
    description: "A spiked metal ball joined by a chain to a rugged haft."
  },
  {
    name: "Glaive",
    category: "Martial Melee",
    damageDice: "1d10",
    damageType: "Slashing",
    weight: 6,
    cost: "20 gp",
    range: "10 ft.",
    properties: ["Heavy", "Reach", "Two-Handed"],
    description: "A curved polearm blade offering superior reach in melee lines."
  },
  {
    name: "Greataxe",
    category: "Martial Melee",
    damageDice: "1d12",
    damageType: "Slashing",
    weight: 7,
    cost: "30 gp",
    range: "5 ft.",
    properties: ["Heavy", "Two-Handed"],
    description: "A massive, double-bitted axe designed for sheer cleavage and destruction."
  },
  {
    name: "Greatsword",
    category: "Martial Melee",
    damageDice: "2d6",
    damageType: "Slashing",
    weight: 6,
    cost: "50 gp",
    range: "5 ft.",
    properties: ["Heavy", "Two-Handed"],
    description: "A massive two-handed sword with high, reliable damage potential."
  },
  {
    name: "Halberd",
    category: "Martial Melee",
    damageDice: "1d10",
    damageType: "Slashing",
    weight: 6,
    cost: "20 gp",
    range: "10 ft.",
    properties: ["Heavy", "Reach", "Two-Handed"],
    description: "A combined axe blade, spear tip, and hook mounted upon a long haft."
  },
  {
    name: "Longsword",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Slashing",
    weight: 3,
    cost: "15 gp",
    range: "5 ft.",
    properties: ["Versatile (1d10)"],
    description: "The quintessential knightly blade, balanced for both single- and two-handed fencing."
  },
  {
    name: "Maul",
    category: "Martial Melee",
    damageDice: "2d6",
    damageType: "Bludgeoning",
    weight: 10,
    cost: "10 gp",
    range: "5 ft.",
    properties: ["Heavy", "Two-Handed"],
    description: "A towering warhammer requiring two hands to shatter heavy plate."
  },
  {
    name: "Morningstar",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Piercing",
    weight: 4,
    cost: "15 gp",
    range: "5 ft.",
    properties: [],
    description: "A solid spiked club head capable of puncturing through chain and leather."
  },
  {
    name: "Pike",
    category: "Martial Melee",
    damageDice: "1d10",
    damageType: "Piercing",
    weight: 18,
    cost: "5 gp",
    range: "10 ft.",
    properties: ["Heavy", "Reach", "Two-Handed"],
    description: "A very long spear used in infantry formations to impale advancing foes."
  },
  {
    name: "Rapier",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Piercing",
    weight: 2,
    cost: "25 gp",
    range: "5 ft.",
    properties: ["Finesse"],
    description: "A slender, sharp-pointed sword optimized for agile dueling."
  },
  {
    name: "Scimitar",
    category: "Martial Melee",
    damageDice: "1d6",
    damageType: "Slashing",
    weight: 3,
    cost: "25 gp",
    range: "5 ft.",
    properties: ["Finesse", "Light"],
    description: "A curved saber suited for rapid slicing and dual-wielding."
  },
  {
    name: "Shortsword",
    category: "Martial Melee",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 2,
    cost: "10 gp",
    range: "5 ft.",
    properties: ["Finesse", "Light"],
    description: "A double-edged thrusting blade versatile in close-quarters skirmishing."
  },
  {
    name: "Trident",
    category: "Martial Melee",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 4,
    cost: "5 gp",
    range: "20/60 ft.",
    properties: ["Thrown", "Versatile (1d8)"],
    description: "A three-pronged spear effective in underwater or surface combat."
  },
  {
    name: "War Pick",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Piercing",
    weight: 2,
    cost: "5 gp",
    range: "5 ft.",
    properties: [],
    description: "A beaked metal pick designed specifically to pierce iron helmets and armor."
  },
  {
    name: "Warhammer",
    category: "Martial Melee",
    damageDice: "1d8",
    damageType: "Bludgeoning",
    weight: 2,
    cost: "15 gp",
    range: "5 ft.",
    properties: ["Versatile (1d10)"],
    description: "A devastating war hammer favored by dwarven warriors and holy paladins."
  },
  {
    name: "Whip",
    category: "Martial Melee",
    damageDice: "1d4",
    damageType: "Slashing",
    weight: 3,
    cost: "2 gp",
    range: "10 ft.",
    properties: ["Finesse", "Reach"],
    description: "A braided leather lash extending attack reach with agile precision."
  },

  // Martial Ranged
  {
    name: "Blowgun",
    category: "Martial Ranged",
    damageDice: "1",
    damageType: "Piercing",
    weight: 1,
    cost: "10 gp",
    range: "25/100 ft.",
    properties: ["Ammunition", "Loading"],
    description: "A slender tube used to fire poisoned darts silently."
  },
  {
    name: "Hand Crossbow",
    category: "Martial Ranged",
    damageDice: "1d6",
    damageType: "Piercing",
    weight: 3,
    cost: "75 gp",
    range: "30/120 ft.",
    properties: ["Ammunition", "Light", "Loading"],
    description: "A compact one-handed crossbow favored by rogues and assassins."
  },
  {
    name: "Heavy Crossbow",
    category: "Martial Ranged",
    damageDice: "1d10",
    damageType: "Piercing",
    weight: 18,
    cost: "50 gp",
    range: "100/400 ft.",
    properties: ["Ammunition", "Heavy", "Loading", "Two-Handed"],
    description: "A high-tension winch crossbow delivering devastating armor-piercing bolts."
  },
  {
    name: "Longbow",
    category: "Martial Ranged",
    damageDice: "1d8",
    damageType: "Piercing",
    weight: 2,
    cost: "50 gp",
    range: "150/600 ft.",
    properties: ["Ammunition", "Heavy", "Two-Handed"],
    description: "A tall stave bow with unmatched tactical range."
  },
  {
    name: "Net",
    category: "Martial Ranged",
    damageDice: "0",
    damageType: "Special",
    weight: 3,
    cost: "1 gp",
    range: "5/15 ft.",
    properties: ["Special", "Thrown"],
    description: "A weighted mesh net designed to entangle and restrain Large or smaller creatures."
  }
];
