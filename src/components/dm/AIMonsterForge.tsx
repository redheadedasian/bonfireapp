import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SRDMonster, MonsterAction, MonsterTrait } from '../../data/srdMonsters';
import { saveCustomMonster, getMonsterDefaultArtwork } from '../../services/dnd5eMonsterService';
import { useDmStore } from '../../store/dmStore';
import { 
  Sparkles, 
  X, 
  Check, 
  Shield, 
  Heart, 
  Swords, 
  Flame, 
  Zap, 
  Skull, 
  Crown, 
  RefreshCw, 
  Save, 
  ArrowLeft, 
  Dices,
  AlertCircle,
  Activity,
  Layers,
  Wand2
} from 'lucide-react';
import { requestRoll } from '../dice/rollBus';

export type MonsterSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type MonsterType = 
  | 'Aberration' 
  | 'Beast' 
  | 'Celestial' 
  | 'Construct' 
  | 'Dragon' 
  | 'Elemental' 
  | 'Fey' 
  | 'Fiend' 
  | 'Giant' 
  | 'Humanoid' 
  | 'Monstrosity' 
  | 'Ooze' 
  | 'Plant' 
  | 'Undead';

export type CombatRole = 'Brute' | 'Skirmisher' | 'Artillery/Caster' | 'Controller' | 'Solo Boss';
export type DamageAffinity = 'Psychic' | 'Necrotic' | 'Radiant' | 'Fire' | 'Cold' | 'Lightning' | 'Acid' | 'Poison' | 'Force';

interface AIMonsterForgeProps {
  isOpen: boolean;
  onClose: () => void;
  onMonsterCreated?: (monster: SRDMonster) => void;
}

// 5e DMG Monster Statistics By Challenge Rating (Chapter 9: Creating a Monster)
export const DMG_CR_TABLE: Record<string, {
  pb: number;
  ac: number;
  hpMin: number;
  hpMax: number;
  atkBonus: number;
  dprMin: number;
  dprMax: number;
  saveDc: number;
  xp: number;
}> = {
  '0':    { pb: 2, ac: 13, hpMin: 1,   hpMax: 6,   atkBonus: 3,  dprMin: 0,   dprMax: 1,   saveDc: 13, xp: 10 },
  '1/8':  { pb: 2, ac: 13, hpMin: 7,   hpMax: 35,  atkBonus: 3,  dprMin: 2,   dprMax: 3,   saveDc: 13, xp: 25 },
  '1/4':  { pb: 2, ac: 13, hpMin: 36,  hpMax: 49,  atkBonus: 3,  dprMin: 4,   dprMax: 5,   saveDc: 13, xp: 50 },
  '1/2':  { pb: 2, ac: 13, hpMin: 50,  hpMax: 70,  atkBonus: 3,  dprMin: 6,   dprMax: 8,   saveDc: 13, xp: 100 },
  '1':    { pb: 2, ac: 13, hpMin: 71,  hpMax: 85,  atkBonus: 3,  dprMin: 9,   dprMax: 14,  saveDc: 13, xp: 200 },
  '2':    { pb: 2, ac: 13, hpMin: 86,  hpMax: 100, atkBonus: 3,  dprMin: 15,  dprMax: 20,  saveDc: 13, xp: 450 },
  '3':    { pb: 2, ac: 13, hpMin: 101, hpMax: 115, atkBonus: 4,  dprMin: 21,  dprMax: 26,  saveDc: 13, xp: 700 },
  '4':    { pb: 2, ac: 14, hpMin: 116, hpMax: 130, atkBonus: 5,  dprMin: 27,  dprMax: 32,  saveDc: 14, xp: 1100 },
  '5':    { pb: 3, ac: 15, hpMin: 131, hpMax: 145, atkBonus: 6,  dprMin: 33,  dprMax: 38,  saveDc: 15, xp: 1800 },
  '6':    { pb: 3, ac: 15, hpMin: 146, hpMax: 160, atkBonus: 6,  dprMin: 39,  dprMax: 44,  saveDc: 15, xp: 2300 },
  '7':    { pb: 3, ac: 15, hpMin: 161, hpMax: 175, atkBonus: 6,  dprMin: 45,  dprMax: 50,  saveDc: 15, xp: 2900 },
  '8':    { pb: 3, ac: 16, hpMin: 176, hpMax: 190, atkBonus: 7,  dprMin: 51,  dprMax: 56,  saveDc: 16, xp: 3900 },
  '9':    { pb: 4, ac: 16, hpMin: 191, hpMax: 205, atkBonus: 7,  dprMin: 57,  dprMax: 62,  saveDc: 16, xp: 5000 },
  '10':   { pb: 4, ac: 17, hpMin: 206, hpMax: 220, atkBonus: 7,  dprMin: 63,  dprMax: 68,  saveDc: 16, xp: 5900 },
  '11':   { pb: 4, ac: 17, hpMin: 221, hpMax: 235, atkBonus: 8,  dprMin: 69,  dprMax: 74,  saveDc: 17, xp: 7200 },
  '12':   { pb: 4, ac: 17, hpMin: 236, hpMax: 250, atkBonus: 8,  dprMin: 75,  dprMax: 80,  saveDc: 17, xp: 8400 },
  '13':   { pb: 5, ac: 18, hpMin: 251, hpMax: 265, atkBonus: 8,  dprMin: 81,  dprMax: 86,  saveDc: 18, xp: 10000 },
  '14':   { pb: 5, ac: 18, hpMin: 266, hpMax: 280, atkBonus: 8,  dprMin: 87,  dprMax: 92,  saveDc: 18, xp: 11500 },
  '15':   { pb: 5, ac: 18, hpMin: 281, hpMax: 295, atkBonus: 8,  dprMin: 93,  dprMax: 98,  saveDc: 18, xp: 13000 },
  '16':   { pb: 5, ac: 18, hpMin: 296, hpMax: 310, atkBonus: 9,  dprMin: 99,  dprMax: 104, saveDc: 18, xp: 15000 },
  '17':   { pb: 6, ac: 19, hpMin: 311, hpMax: 325, atkBonus: 10, dprMin: 105, dprMax: 110, saveDc: 19, xp: 18000 },
  '18':   { pb: 6, ac: 19, hpMin: 326, hpMax: 340, atkBonus: 10, dprMin: 111, dprMax: 116, saveDc: 19, xp: 20000 },
  '19':   { pb: 6, ac: 19, hpMin: 341, hpMax: 355, atkBonus: 10, dprMin: 117, dprMax: 122, saveDc: 19, xp: 22000 },
  '20':   { pb: 6, ac: 19, hpMin: 356, hpMax: 400, atkBonus: 10, dprMin: 123, dprMax: 140, saveDc: 19, xp: 25000 },
  '21':   { pb: 7, ac: 19, hpMin: 401, hpMax: 445, atkBonus: 11, dprMin: 141, dprMax: 158, saveDc: 20, xp: 33000 },
  '22':   { pb: 7, ac: 19, hpMin: 446, hpMax: 490, atkBonus: 11, dprMin: 159, dprMax: 176, saveDc: 20, xp: 41000 },
  '23':   { pb: 7, ac: 19, hpMin: 491, hpMax: 535, atkBonus: 11, dprMin: 177, dprMax: 194, saveDc: 20, xp: 50000 },
  '24':   { pb: 7, ac: 19, hpMin: 536, hpMax: 580, atkBonus: 12, dprMin: 195, dprMax: 212, saveDc: 21, xp: 62000 },
  '25':   { pb: 8, ac: 19, hpMin: 581, hpMax: 625, atkBonus: 12, dprMin: 213, dprMax: 230, saveDc: 21, xp: 75000 },
  '30':   { pb: 9, ac: 19, hpMin: 801, hpMax: 850, atkBonus: 14, dprMin: 301, dprMax: 320, saveDc: 23, xp: 155000 }
};

const SIZE_HIT_DIE: Record<MonsterSize, { die: string; avg: number }> = {
  Tiny: { die: 'd4', avg: 2.5 },
  Small: { die: 'd6', avg: 3.5 },
  Medium: { die: 'd8', avg: 4.5 },
  Large: { die: 'd10', avg: 5.5 },
  Huge: { die: 'd12', avg: 6.5 },
  Gargantuan: { die: 'd20', avg: 10.5 }
};

export function AIMonsterForge({ isOpen, onClose, onMonsterCreated }: AIMonsterForgeProps) {
  const { addCombatant } = useDmStore();

  // Configuration Form State
  const [size, setSize] = useState<MonsterSize>('Large');
  const [type, setType] = useState<MonsterType>('Monstrosity');
  const [role, setRole] = useState<CombatRole>('Brute');
  const [hasLegendaryResistances, setHasLegendaryResistances] = useState(false);
  const [hasLegendaryActions, setHasLegendaryActions] = useState(false);
  const [hasLairActions, setHasLairActions] = useState(false);
  const [damageAffinities, setDamageAffinities] = useState<DamageAffinity[]>(['Psychic', 'Necrotic']);
  const [conceptPrompt, setConceptPrompt] = useState('Eldritch Delirium Abomination with mutating crystal claws and sanity-rending psychic pulse');
  const [targetCr, setTargetCr] = useState<string>('6');

  // Forge Lifecycle State: 'configure' | 'preview'
  const [stage, setStage] = useState<'configure' | 'preview'>('configure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMonster, setGeneratedMonster] = useState<SRDMonster | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleAffinity = (aff: DamageAffinity) => {
    if (damageAffinities.includes(aff)) {
      setDamageAffinities(damageAffinities.filter(a => a !== aff));
    } else {
      setDamageAffinities([...damageAffinities, aff]);
    }
  };

  // Handle role selection and auto-adjust boss multipliers
  const handleSelectRole = (newRole: CombatRole) => {
    setRole(newRole);
    if (newRole === 'Solo Boss') {
      setHasLegendaryResistances(true);
      setHasLegendaryActions(true);
      setHasLairActions(true);
    }
  };

  // 5e DMG Procedural Generation Engine (High-Accuracy Mathematical Fallback)
  const synthesizeProceduralMonster = (): SRDMonster => {
    const dmg = DMG_CR_TABLE[targetCr] || DMG_CR_TABLE['6'];
    const crNum = parseFloat(targetCr) || (targetCr === '1/2' ? 0.5 : targetCr === '1/4' ? 0.25 : 6);
    const hitDieInfo = SIZE_HIT_DIE[size];

    // Role-based stat adjustments
    let baseHp = Math.round((dmg.hpMin + dmg.hpMax) / 2);
    let baseAc = dmg.ac;
    let atkBonus = dmg.atkBonus;
    let saveDc = dmg.saveDc;

    let str = 10, dex = 10, con = 10, int = 10, wis = 10, cha = 10;

    if (role === 'Brute') {
      baseHp = Math.round(baseHp * 1.25);
      baseAc = Math.max(11, baseAc - 2);
      str = Math.min(28, Math.round(14 + crNum * 0.7));
      con = Math.min(26, Math.round(14 + crNum * 0.6));
      dex = Math.max(8, Math.round(12 - crNum * 0.2));
    } else if (role === 'Skirmisher') {
      baseAc += 1;
      dex = Math.min(24, Math.round(16 + crNum * 0.5));
      str = Math.round(12 + crNum * 0.3);
      con = Math.round(12 + crNum * 0.4);
    } else if (role === 'Artillery/Caster') {
      baseHp = Math.round(baseHp * 0.85);
      int = Math.min(24, Math.round(16 + crNum * 0.5));
      wis = Math.min(22, Math.round(14 + crNum * 0.4));
      con = Math.round(12 + crNum * 0.3);
    } else if (role === 'Controller') {
      wis = Math.min(24, Math.round(16 + crNum * 0.5));
      cha = Math.min(22, Math.round(14 + crNum * 0.4));
      con = Math.round(14 + crNum * 0.4);
      saveDc += 1;
    } else if (role === 'Solo Boss') {
      baseHp = Math.round(baseHp * 1.4);
      baseAc += 1;
      str = Math.min(26, Math.round(16 + crNum * 0.6));
      con = Math.min(24, Math.round(16 + crNum * 0.5));
      dex = Math.min(20, Math.round(14 + crNum * 0.3));
    }

    const conMod = Math.floor((con - 10) / 2);
    const numDice = Math.max(2, Math.round(baseHp / (hitDieInfo.avg + Math.max(0, conMod))));
    const finalHp = Math.round(numDice * hitDieInfo.avg + numDice * conMod);
    const hitDiceStr = `${numDice}${hitDieInfo.die} + ${numDice * Math.max(0, conMod)}`;

    // Build damage traits & immunities
    const affinityStr = damageAffinities.join(', ');
    const traits: MonsterTrait[] = [];

    if (hasLegendaryResistances) {
      traits.push({
        name: 'Legendary Resistance (3/Day)',
        description: 'If the monster fails a saving throw, it can choose to succeed instead.'
      });
    }

    if (role === 'Brute') {
      traits.push({
        name: 'Brutal Impact',
        description: 'Melee weapon attacks deal one extra die of damage (included in the attack).'
      });
    } else if (role === 'Skirmisher') {
      traits.push({
        name: 'Flyby / Nimble Agility',
        description: 'The creature does not provoke opportunity attacks when moving out of an enemy’s reach.'
      });
    } else if (role === 'Controller') {
      traits.push({
        name: `Aura of ${damageAffinities[0] || 'Dread'}`,
        description: `Any enemy creature starting its turn within 15 ft. must succeed on a DC ${saveDc} WIS save or become Frightened or Restrained until the end of its turn.`
      });
    }

    if (damageAffinities.length > 0) {
      traits.push({
        name: `${damageAffinities[0]} Infusion`,
        description: `Weapon attacks inflict an additional 1d8 ${damageAffinities[0].toLowerCase()} damage.`
      });
    }

    // Build Actions
    const dmgPerRound = Math.round((dmg.dprMin + dmg.dprMax) / 2);
    const numAttacks = crNum >= 11 ? 3 : crNum >= 5 ? 2 : 1;
    const dmgPerHit = Math.max(4, Math.round(dmgPerRound / numAttacks));
    const hitDiceSides = crNum <= 2 ? '1d8' : crNum <= 7 ? '2d8' : crNum <= 15 ? '3d10' : '4d12';

    const actions: MonsterAction[] = [
      {
        name: 'Multiattack',
        description: `The creature makes ${numAttacks === 1 ? 'one attack' : `${numAttacks} attacks`}.`
      },
      {
        name: `${role === 'Artillery/Caster' ? 'Eldritch Ray' : 'Slam / Claw Strike'}`,
        description: `Melee or Ranged Attack: +${atkBonus} to hit, reach 10 ft. or range 60 ft., one target. Hit: ${dmgPerHit} (${hitDiceSides} + ${Math.floor((str - 10)/2) || 4}) ${damageAffinities[0]?.toLowerCase() || 'slashing'} damage.`,
        attackBonus: atkBonus,
        damage: `${hitDiceSides}+4`
      }
    ];

    // Legendary Actions
    const legendaryActions: MonsterTrait[] | undefined = hasLegendaryActions ? [
      {
        name: 'Quick Strike',
        description: 'The creature makes one claw or ray attack.'
      },
      {
        name: `Surge of ${damageAffinities[0] || 'Torment'} (Costs 2 Actions)`,
        description: `Emits an area pulse. Each creature within 20 ft. takes 2d8 ${damageAffinities[0]?.toLowerCase() || 'force'} damage (DC ${saveDc} DEX save for half).`
      }
    ] : undefined;

    // Lair Actions
    const lairActions: MonsterTrait[] | undefined = hasLairActions ? [
      {
        name: 'Grasping Shadows & Fog',
        description: `On initiative count 20 (losing ties), spectral tendrils erupt. Creatures within 30 ft. of the lair center must make a DC ${saveDc} STR save or be Restrained.`
      },
      {
        name: 'Tremor of the Deep',
        description: `A shockwave ripples across the stone floor. Hostile creatures must make a DC ${saveDc} DEX save or be knocked Prone.`
      }
    ] : undefined;

    return {
      id: 'forged-' + Date.now(),
      name: conceptPrompt.slice(0, 32) || `${role} of ${type}`,
      size,
      type,
      alignment: 'Chaotic Evil',
      ac: baseAc,
      acType: 'Natural Armor',
      hp: finalHp,
      hitDice: hitDiceStr,
      speed: size === 'Tiny' || size === 'Small' ? '25 ft.' : '35 ft., climb 20 ft.',
      str,
      dex,
      con,
      int,
      wis,
      cha,
      savingThrows: `CON +${conMod + dmg.pb}, WIS +${Math.floor((wis-10)/2) + dmg.pb}`,
      skills: `Perception +${Math.floor((wis-10)/2) + dmg.pb}, Athletics +${Math.floor((str-10)/2) + dmg.pb}`,
      damageResistances: affinityStr || undefined,
      senses: 'Darkvision 120 ft., Passive Perception ' + (10 + Math.floor((wis-10)/2) + dmg.pb),
      languages: 'Deep Speech, Common',
      cr: targetCr,
      xp: dmg.xp,
      imageUrl: getMonsterDefaultArtwork(type),
      traits,
      actions,
      legendaryActions,
      lairActions,
      isCustom: true
    };
  };

  // Main Generation Handler
  const handleForgeMonster = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setNotice(null);

    const apiKey = 
      localStorage.getItem('gemini_api_key') || 
      localStorage.getItem('bonfire_gemini_api_key') || 
      (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

    try {
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const dmg = DMG_CR_TABLE[targetCr] || DMG_CR_TABLE['6'];

        const systemPrompt = `You are an expert D&D 5e Monster Designer strictly adhering to Dungeon Master's Guide (DMG) CR guidelines.
Design a balanced 5e monster stat block based on:
- Concept: "${conceptPrompt}"
- Size: ${size}
- Type: ${type}
- Role: ${role}
- CR: ${targetCr} (Proficiency Bonus: +${dmg.pb}, Target HP: ${dmg.hpMin}-${dmg.hpMax}, Target AC: ${dmg.ac}, Attack Bonus: +${dmg.atkBonus}, Save DC: ${dmg.saveDc})
- Primary Damage Affinities: ${damageAffinities.join(', ')}
- Legendary Resistances: ${hasLegendaryResistances ? 'Yes (3/Day)' : 'No'}
- Legendary Actions: ${hasLegendaryActions ? 'Yes (3 Actions/Round)' : 'No'}
- Lair Actions: ${hasLairActions ? 'Yes' : 'No'}

Return ONLY a JSON object matching this exact schema:
{
  "name": "string",
  "size": "${size}",
  "type": "${type}",
  "alignment": "string",
  "ac": ${dmg.ac},
  "acType": "Natural Armor",
  "hp": ${Math.round((dmg.hpMin + dmg.hpMax) / 2)},
  "hitDice": "string",
  "speed": "30 ft., climb 20 ft.",
  "str": 18,
  "dex": 14,
  "con": 16,
  "int": 10,
  "wis": 12,
  "cha": 8,
  "savingThrows": "string",
  "skills": "string",
  "damageResistances": "${damageAffinities.join(', ')}",
  "senses": "Darkvision 60 ft., Passive Perception 14",
  "languages": "string",
  "cr": "${targetCr}",
  "xp": ${dmg.xp},
  "traits": [{"name": "string", "description": "string"}],
  "actions": [{"name": "string", "description": "string", "attackBonus": ${dmg.atkBonus}, "damage": "string"}],
  "legendaryActions": [{"name": "string", "description": "string"}]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
          config: { responseMimeType: 'application/json' }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);

        const monster: SRDMonster = {
          id: 'forged-' + Date.now(),
          name: parsed.name || conceptPrompt,
          size: parsed.size || size,
          type: parsed.type || type,
          alignment: parsed.alignment || 'Neutral Evil',
          ac: parsed.ac || dmg.ac,
          acType: parsed.acType || 'Natural Armor',
          hp: parsed.hp || Math.round((dmg.hpMin + dmg.hpMax) / 2),
          hitDice: parsed.hitDice || `8${SIZE_HIT_DIE[size].die} + 24`,
          speed: parsed.speed || '30 ft.',
          str: parsed.str || 16,
          dex: parsed.dex || 14,
          con: parsed.con || 16,
          int: parsed.int || 10,
          wis: parsed.wis || 12,
          cha: parsed.cha || 8,
          savingThrows: parsed.savingThrows || undefined,
          skills: parsed.skills || undefined,
          damageResistances: parsed.damageResistances || damageAffinities.join(', ') || undefined,
          senses: parsed.senses || 'Darkvision 60 ft., Passive Perception 12',
          languages: parsed.languages || '—',
          cr: targetCr,
          xp: dmg.xp,
          imageUrl: getMonsterDefaultArtwork(type),
          traits: parsed.traits || [],
          actions: parsed.actions || [],
          legendaryActions: hasLegendaryActions ? parsed.legendaryActions : undefined,
          isCustom: true
        };

        setGeneratedMonster(monster);
        setStage('preview');
      } else {
        // Procedural Fallback Engine
        const procedural = synthesizeProceduralMonster();
        setGeneratedMonster(procedural);
        setStage('preview');
      }
    } catch {
      const procedural = synthesizeProceduralMonster();
      setGeneratedMonster(procedural);
      setStage('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick-Tweak Modifiers
  const handleAddRechargeAbility = () => {
    if (!generatedMonster) return;
    const saveDc = DMG_CR_TABLE[generatedMonster.cr]?.saveDc || 15;
    const aff = damageAffinities[0] || 'Psychic';
    const rechargeAction: MonsterAction = {
      name: `${aff} Cataclysm (Recharge 5–6)`,
      description: `The creature unleashes a 30-foot cone of ${aff.toLowerCase()} energy. Each creature in the area must make a DC ${saveDc} DEX/WIS saving throw, taking 6d8 ${aff.toLowerCase()} damage on a failed save, or half as much on a successful one.`,
      damage: '6d8'
    };

    setGeneratedMonster({
      ...generatedMonster,
      actions: [...generatedMonster.actions, rechargeAction]
    });
    setNotice('Added (Recharge 5–6) ability!');
    setTimeout(() => setNotice(null), 2000);
  };

  const handleIncreaseSurvivability = () => {
    if (!generatedMonster) return;
    const newAc = generatedMonster.ac + 2;
    const newHp = Math.round(generatedMonster.hp * 1.25);
    const magicResTrait: MonsterTrait = {
      name: 'Magic Resistance',
      description: 'The creature has advantage on saving throws against spells and other magical effects.'
    };

    setGeneratedMonster({
      ...generatedMonster,
      ac: newAc,
      hp: newHp,
      traits: generatedMonster.traits.some(t => t.name === 'Magic Resistance')
        ? generatedMonster.traits
        : [...generatedMonster.traits, magicResTrait]
    });
    setNotice('Buffed Survivability: +2 AC, +25% HP, Magic Resistance!');
    setTimeout(() => setNotice(null), 2000);
  };

  const handleMakeMoreAggressive = () => {
    if (!generatedMonster) return;
    const updatedActions = generatedMonster.actions.map(a => {
      if (a.attackBonus !== undefined) {
        return {
          ...a,
          attackBonus: a.attackBonus + 1,
          description: a.description.replace(/\+(\d+) to hit/, `+${a.attackBonus + 1} to hit`)
        };
      }
      return a;
    });

    setGeneratedMonster({
      ...generatedMonster,
      actions: updatedActions
    });
    setNotice('Made More Aggressive: +1 Attack Bonus & Extra Lethality!');
    setTimeout(() => setNotice(null), 2000);
  };

  // Final Action Handlers
  const handleSaveToBestiary = () => {
    if (!generatedMonster) return;
    saveCustomMonster(generatedMonster);
    if (onMonsterCreated) onMonsterCreated(generatedMonster);
    setNotice(`Saved "${generatedMonster.name}" to Bestiary Vault!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handlePushToCombat = () => {
    if (!generatedMonster) return;
    saveCustomMonster(generatedMonster);
    addCombatant({
      name: generatedMonster.name,
      type: 'monster',
      hpCurrent: generatedMonster.hp,
      hpMax: generatedMonster.hp,
      ac: generatedMonster.ac,
      speed: parseInt(generatedMonster.speed, 10) || 30,
      avatarUrl: generatedMonster.imageUrl || getMonsterDefaultArtwork(generatedMonster.type),
      notes: `CR ${generatedMonster.cr} • ${generatedMonster.actions[0]?.name || 'Attack'}`
    });
    if (onMonsterCreated) onMonsterCreated(generatedMonster);
    setNotice(`Pushed "${generatedMonster.name}" to Active Combat Tracker!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-[#fcfbf9] border-l-2 border-black/30 shadow-2xl z-50 flex flex-col overflow-hidden animate-slideInRight select-none text-[#161616]">
      
      {/* Toast Notice */}
      {notice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 border border-black/20 text-white rounded-xs text-xs font-display uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check size={14} className="text-[#1EB253]" />
          <span>{notice}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/80 border-b border-[#141414]/15 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-black/5 border border-black/10 rounded">
            <Sparkles size={16} className="text-[var(--accent-ink)] animate-pulse" />
          </div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
            {stage === 'configure' ? 'AI Monster Forge (5e DMG)' : 'Stat Block Preview & Refine'}
          </h3>
        </div>
        <button onClick={onClose} className="text-[#777777] hover:text-[#161616] p-1 cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* STAGE 1: CONFIGURATION VIEW */}
      {stage === 'configure' && (
        <form onSubmit={handleForgeMonster} className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-5 flex flex-col gap-4 text-xs font-serif">
          
          {/* Concept Prompt */}
          <div className="flex flex-col gap-1">
            <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
              Creature Concept & Lore Prompt
            </label>
            <textarea
              rows={3}
              required
              value={conceptPrompt}
              onChange={e => setConceptPrompt(e.target.value)}
              placeholder="e.g. Delirium Behemoth with crystalline spikes, reality-warping aura, and toxic bile breath..."
              className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded p-2.5 text-xs text-[#161616] font-serif focus:outline-none"
            />
          </div>

          {/* Size & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
                Creature Size
              </label>
              <select
                value={size}
                onChange={e => setSize(e.target.value as MonsterSize)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded p-2 text-xs text-[#161616] font-mono focus:outline-none"
              >
                {['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'].map(s => (
                  <option key={s} value={s}>{s} (Hit Die: {SIZE_HIT_DIE[s as MonsterSize].die})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
                Creature Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as MonsterType)}
                className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded p-2 text-xs text-[#161616] font-mono focus:outline-none"
              >
                {[
                  'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 
                  'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 
                  'Monstrosity', 'Ooze', 'Plant', 'Undead'
                ].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Combat Role / Archetype Segmented Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
              Combat Role / Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'Brute', label: 'Brute (High HP/Low AC)' },
                { id: 'Skirmisher', label: 'Skirmisher (Mobile/Agile)' },
                { id: 'Artillery/Caster', label: 'Artillery / Caster' },
                { id: 'Controller', label: 'Controller (Stuns/Grapples)' },
                { id: 'Solo Boss', label: 'Solo Boss (Legendary)' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRole(r.id as CombatRole)}
                  className={`p-2 rounded text-[10px] font-display uppercase tracking-wider font-bold border transition-colors cursor-pointer text-left ${
                    role === r.id
                      ? 'bg-[#1c1c1c] border-black text-white shadow-xs'
                      : 'bg-white border-[#141414]/15 text-[#555555] hover:text-[#161616] hover:border-black/30'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Boss Multipliers & Action Economy Toggles */}
          <div className="p-3 bg-white border border-[#141414]/15 rounded flex flex-col gap-2 shadow-xs">
            <span className="font-display uppercase tracking-wider text-[var(--accent-ink)] text-[10px] font-bold">
              Boss Multipliers & Action Economy
            </span>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLegendaryResistances}
                  onChange={e => setHasLegendaryResistances(e.target.checked)}
                  className="accent-[var(--accent-ink)] rounded cursor-pointer"
                />
                <span className="text-xs text-[#161616]">Legendary Resistances (3/Day)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLegendaryActions}
                  onChange={e => setHasLegendaryActions(e.target.checked)}
                  className="accent-[var(--accent-ink)] rounded cursor-pointer"
                />
                <span className="text-xs text-[#161616]">Legendary Actions (3 Actions/Round)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLairActions}
                  onChange={e => setHasLairActions(e.target.checked)}
                  className="accent-[var(--accent-ink)] rounded cursor-pointer"
                />
                <span className="text-xs text-[#161616]">Lair Actions & Regional Effects</span>
              </label>
            </div>
          </div>

          {/* Damage & Theme Affinity Multi-Select Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
              Primary Damage / Theme Affinity (Multi-Select)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Psychic', 'Necrotic', 'Radiant', 'Fire', 
                'Cold', 'Lightning', 'Acid', 'Poison', 'Force'
              ].map(aff => {
                const active = damageAffinities.includes(aff as DamageAffinity);
                return (
                  <button
                    key={aff}
                    type="button"
                    onClick={() => toggleAffinity(aff as DamageAffinity)}
                    className={`px-2.5 py-1 rounded text-[10px] font-display uppercase tracking-wider font-bold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--accent-ink)]/15 border-[var(--accent-ink)] text-[var(--accent-ink)] shadow-xs'
                        : 'bg-white border-[#141414]/15 text-[#555555] hover:text-[#161616]'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{aff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target CR Selector */}
          <div className="flex flex-col gap-1">
            <label className="font-display uppercase tracking-wider text-[#555555] text-[11px] font-bold">
              Target Challenge Rating (CR) & DMG Scaling
            </label>
            <select
              value={targetCr}
              onChange={e => setTargetCr(e.target.value)}
              className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded p-2 text-xs text-[#161616] font-mono font-bold focus:outline-none"
            >
              {Object.keys(DMG_CR_TABLE).map(cr => {
                const row = DMG_CR_TABLE[cr];
                return (
                  <option key={cr} value={cr}>
                    CR {cr} (HP: ~{Math.round((row.hpMin+row.hpMax)/2)}, AC: {row.ac}, Atk: +{row.atkBonus}, Save DC: {row.saveDc}, XP: {row.xp.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="py-2.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs font-display uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-xs transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Synthesizing Monster with 5e DMG Math...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Forge Custom Monster</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STAGE 2: INTERACTIVE STAT BLOCK PREVIEW & REFINE */}
      {stage === 'preview' && generatedMonster && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fcfbf9] text-[#161616]">
          
          {/* Scrollable 5e Stat Block Preview */}
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-5 flex flex-col gap-4 text-xs font-serif">
            
            {/* Creature Header */}
            <div className="flex flex-col gap-1 border-b border-[#141414]/15 pb-3">
              <div className="flex items-center justify-between">
                <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold">
                  CR {generatedMonster.cr} ({generatedMonster.xp.toLocaleString()} XP)
                </span>
                <span className="font-mono text-[10px] text-[var(--accent-ink)] font-bold">
                  Proficiency Bonus +{DMG_CR_TABLE[generatedMonster.cr]?.pb || 3}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-[#1a1a1a] uppercase tracking-wide mt-1">
                {generatedMonster.name}
              </h2>
              <p className="italic text-xs text-[#555555]">
                {generatedMonster.size} {generatedMonster.type}, {generatedMonster.alignment}
              </p>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-white border border-[#141414]/15 rounded shadow-xs">
              <div>
                <span className="text-[9px] font-display uppercase text-[#555555] font-bold">Armor Class</span>
                <div className="font-mono text-sm font-bold text-[var(--accent-ink)]">{generatedMonster.ac} ({generatedMonster.acType || 'Natural Armor'})</div>
              </div>
              <div className="border-x border-[#141414]/15">
                <span className="text-[9px] font-display uppercase text-[#555555] font-bold">Hit Points</span>
                <div className="font-mono text-sm font-bold text-[#161616]">{generatedMonster.hp} <span className="text-[10px] text-[#777777]">({generatedMonster.hitDice})</span></div>
              </div>
              <div>
                <span className="text-[9px] font-display uppercase text-[#555555] font-bold">Speed</span>
                <div className="font-mono text-xs font-bold text-[#161616] mt-0.5">{generatedMonster.speed}</div>
              </div>
            </div>

            {/* Ability Scores Matrix */}
            <div className="grid grid-cols-6 gap-1 p-2 bg-white border border-[#141414]/15 rounded text-center shadow-xs">
              {[
                { label: 'STR', val: generatedMonster.str },
                { label: 'DEX', val: generatedMonster.dex },
                { label: 'CON', val: generatedMonster.con },
                { label: 'INT', val: generatedMonster.int },
                { label: 'WIS', val: generatedMonster.wis },
                { label: 'CHA', val: generatedMonster.cha }
              ].map(ab => {
                const mod = Math.floor((ab.val - 10) / 2);
                return (
                  <div key={ab.label} className="flex flex-col items-center bg-black/5 p-1 rounded border border-black/10">
                    <span className="text-[8px] font-display uppercase text-[#555555] font-bold">{ab.label}</span>
                    <span className="text-xs font-mono font-bold text-[#161616]">{ab.val}</span>
                    <span className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Saves, Skills, Resistances */}
            <div className="flex flex-col gap-1 text-[11px] font-serif bg-white p-2.5 border border-[#141414]/15 rounded text-[#555555] shadow-xs">
              {generatedMonster.savingThrows && <div><strong className="text-[var(--accent-ink)] uppercase font-sans text-[10px] font-bold">Saving Throws:</strong> {generatedMonster.savingThrows}</div>}
              {generatedMonster.skills && <div><strong className="text-[var(--accent-ink)] uppercase font-sans text-[10px] font-bold">Skills:</strong> {generatedMonster.skills}</div>}
              {generatedMonster.damageResistances && <div><strong className="text-[var(--accent-ink)] uppercase font-sans text-[10px] font-bold">Damage Resistances:</strong> {generatedMonster.damageResistances}</div>}
              <div><strong className="text-[var(--accent-ink)] uppercase font-sans text-[10px] font-bold">Senses:</strong> {generatedMonster.senses}</div>
              <div><strong className="text-[var(--accent-ink)] uppercase font-sans text-[10px] font-bold">Languages:</strong> {generatedMonster.languages}</div>
            </div>

            {/* Traits */}
            {generatedMonster.traits && generatedMonster.traits.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
                <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                  Traits & Passives
                </span>
                {generatedMonster.traits.map(t => (
                  <div key={t.name} className="text-xs font-serif leading-relaxed text-[#555555]">
                    <strong className="text-[#161616] font-sans font-bold">{t.name}.</strong> {t.description}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {generatedMonster.actions && generatedMonster.actions.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
                <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                  Actions & Attacks
                </span>
                {generatedMonster.actions.map(a => (
                  <div key={a.name} className="p-2.5 bg-white border border-[#141414]/15 rounded flex flex-col gap-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-display text-[#161616] uppercase font-bold">{a.name}</strong>
                      {a.attackBonus !== undefined && (
                        <span className="text-[10px] font-mono text-[var(--accent-ink)] font-bold">
                          +{a.attackBonus} to hit
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif text-[#555555] leading-relaxed">{a.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Legendary Actions */}
            {generatedMonster.legendaryActions && generatedMonster.legendaryActions.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
                <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                  Legendary Actions (3/Round)
                </span>
                <p className="text-[11px] font-serif text-[#555555] italic">
                  The monster can take 3 legendary actions, choosing from the options below. Only one option can be used at a time and only at the end of another creature’s turn.
                </p>
                {generatedMonster.legendaryActions.map(la => (
                  <div key={la.name} className="text-xs font-serif leading-relaxed text-[#555555]">
                    <strong className="text-[#161616] font-sans font-bold">{la.name}.</strong> {la.description}
                  </div>
                ))}
              </div>
            )}

            {/* Lair Actions */}
            {generatedMonster.lairActions && generatedMonster.lairActions.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-[#141414]/15">
                <span className="font-display text-xs uppercase tracking-wider text-[var(--accent-ink)] font-bold">
                  Lair Actions
                </span>
                {generatedMonster.lairActions.map(la => (
                  <div key={la.name} className="text-xs font-serif leading-relaxed text-[#555555]">
                    <strong className="text-[#161616] font-sans font-bold">{la.name}.</strong> {la.description}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* QUICK-TWEAK ACTION CHIPS SECTION */}
          <div className="p-3 bg-white/80 border-t border-[#141414]/15 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">
              Quick-Tweak Actions
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleAddRechargeAbility}
                className="px-2.5 py-1 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] rounded text-[10px] font-display uppercase font-bold transition-colors cursor-pointer shadow-xs"
              >
                ⚔️ Add Recharge Ability
              </button>

              <button
                type="button"
                onClick={handleIncreaseSurvivability}
                className="px-2.5 py-1 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] rounded text-[10px] font-display uppercase font-bold transition-colors cursor-pointer shadow-xs"
              >
                🛡️ Increase Survivability
              </button>

              <button
                type="button"
                onClick={handleMakeMoreAggressive}
                className="px-2.5 py-1 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] rounded text-[10px] font-display uppercase font-bold transition-colors cursor-pointer shadow-xs"
              >
                ⚡ Make More Aggressive
              </button>

              <button
                type="button"
                onClick={handleForgeMonster}
                className="px-2.5 py-1 bg-white hover:bg-black/5 border border-[#141414]/20 text-[#161616] rounded text-[10px] font-display uppercase font-bold transition-colors cursor-pointer shadow-xs"
              >
                🎲 Re-roll Concept
              </button>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS: SAVE / PUSH TO COMBAT / BACK */}
          <div className="p-3.5 bg-white/80 border-t border-[#141414]/15 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => setStage('configure')}
              className="px-3 py-2 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs font-display uppercase font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Edit Settings</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToBestiary}
                className="px-3.5 py-2 rounded-xs border border-[#141414]/20 bg-white text-[#161616] hover:border-black/40 text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save size={13} className="text-[var(--accent-ink)]" />
                <span>💾 Save to Bestiary</span>
              </button>

              <button
                onClick={handlePushToCombat}
                className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Swords size={13} />
                <span>⚔️ Push to Combat</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
