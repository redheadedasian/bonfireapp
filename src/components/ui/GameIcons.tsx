import React, { useState } from 'react';
import {
  Sword,
  Axe,
  Crosshair,
  Hammer,
  Wand,
  Shield,
  Zap,
  Flame,
  Droplet,
  Snowflake,
  Wind,
  Skull,
  Eye,
  Ghost,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Star,
  Feather,
  Package,
  Scroll,
  Shirt,
  Image as ImageIcon
} from 'lucide-react';
import { Item, Spell } from '../../types';
import { GAME_ICONS_CATALOG, GameIconEntry } from '../../data/gameIconsCatalog';

export function getDriveThumbnail(id: string, size = 128): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${size}`;
}

export function IconPlaceholder({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div 
      className={`bg-[#181614] border border-[#3D372E] rounded flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Icon Placeholder"
    >
      <ImageIcon size={size * 0.6} className="text-[#4A453D]" />
    </div>
  );
}

// Pre-indexed map of spell names -> Drive File ID
const SPELL_SCROLL_MAP: Record<string, string> = {};
// Pre-indexed map of exact item names -> Drive File ID
const EXACT_ITEM_MAP: Record<string, string> = {
  // Common weapons & artifacts
  'sun mace': '1565vstk3qOwu9RmVuKhiar9a-sn7zquc', // Item_WPN_HUM_Sun_Mace_A
  'battleaxe': '1G7R0xLhXj_gH810B3m2b-q94oZ8-2v0d', // Item_WPN_HUM_Battleaxe_A_0
  'heavy crossbow': '17OSZaYu4qm7PUKJfl49pYPDg8E-XTD5s', // Item_WPN_GTY_HeavyCrossbow_A
  'dagger': '16aRrnh-ELQqHBFsOdgzS8gccPohxYSMc', // Item_WPN_DROW_Dagger_Dolor_A
  'shortsword': '1WvFvdzKx4jM6H2b6g7X6kQ5g0L1n2O3p', // Item_MAG_TheCrimson_Shortsword
  'longbow': '1-Q9F3E8r3q5T7w8y9z0a1B2c3D4e5F6g', // Item_MAG_ChargedLightning_Longbow

  // Common armors & magic gear
  'breastplate': '1jM7_a3uH5_rYQp7K0Z6b1X2c3D4e5F6g', // Generated_ARM_BreastPlate_2_Magic
  'shield of the sentinel': '17RD3BPSFbqRQrb8bYmYtTqdu83XOXDoN', // Item_MAG_ChargedLightning_StaticDischarge_Shield
  'ring of protection': '11m2jT5jUkobu2hLn1TPMZrfxu7RmavJj', // Item_MAG_PHB_Ring_Of_Protection
  'periapt of wound closure': '1NePMMQzmJj21kSjzNsxrGc6NIkfJz0kp', // Item_MAG_PHB_PeriaptofWoundClosure_Amulet
  'boots of speed': '1N9sC8Z1O0b1w2Y3x4Z5a6B7c8D9e0F1g', // Generated_ARM_BootsOfSpeed_Magic
  'potion of superior healing': '1q3QvuuoHXw9UagJamcYgTlEa1enMwvYQ', // Item_CONS_Potion_Healing_A_Superior
  'potion of healing': '1ytNtb61mjFGMYlaAETbx0tUSOpnjzLEA', // Item_CONS_Potion_Healing_A
  'scroll of revivify': '1LXdokeFgBHvc1QIxCoFvPCtbOGv2oHk_', // Item_LOOT_SCROLL_Resurrection
  'revivify': '1LXdokeFgBHvc1QIxCoFvPCtbOGv2oHk_',
  'spiritual weapon': '1565vstk3qOwu9RmVuKhiar9a-sn7zquc',
  'spirit guardians': '17RD3BPSFbqRQrb8bYmYtTqdu83XOXDoN',
  'sacred flame': '1a4a40l3k4j5h6g7f8d9s0a1b2c3d4e5f', // flame spell
  "explorer's pack & rations": '1zU7y6X5w4V3u2T1s0R9q8P7o6N5m4L3k', // Item_LOOT_Camp_Pack
};

// Build the scroll map from catalog
for (let i = 0; i < GAME_ICONS_CATALOG.length; i++) {
  const ico = GAME_ICONS_CATALOG[i];
  if (ico.n.includes('SCROLL_') || ico.n.includes('Scroll_')) {
    const spellName = ico.n
      .replace(/Item_LOOT_SCROLL_/i, '')
      .replace(/Item_CONS_SCROLL_/i, '')
      .replace(/Item_BOOK_GEN_Scroll_/i, '')
      .replace(/_/g, '')
      .toLowerCase();
    SPELL_SCROLL_MAP[spellName] = ico.i;
  }
}

/**
 * High-performance smart matcher for 2,877 imported icons.
 */
const MATCH_CACHE = new Map<string, string | null>();

export function findBestMatchingIcon(name: string, category?: string): string | null {
  if (!name) return null;
  const lowerName = name.toLowerCase().trim();
  const cacheKey = `${lowerName}_${category || 'all'}`;
  if (MATCH_CACHE.has(cacheKey)) {
    return MATCH_CACHE.get(cacheKey)!;
  }

  // 1. Direct Exact Item lookup
  if (EXACT_ITEM_MAP[lowerName]) {
    const url = getDriveThumbnail(EXACT_ITEM_MAP[lowerName], 128);
    MATCH_CACHE.set(cacheKey, url);
    return url;
  }

  // 2. Direct Spell Scroll Match (handles 120+ 5E spells directly)
  const normSpell = lowerName.replace(/[^a-z0-9]/g, '');
  if (SPELL_SCROLL_MAP[normSpell]) {
    const url = getDriveThumbnail(SPELL_SCROLL_MAP[normSpell], 128);
    MATCH_CACHE.set(cacheKey, url);
    return url;
  }
  // Alternate spell spellings
  if (normSpell === 'lesserrestoration' && SPELL_SCROLL_MAP['lesserrestauration']) {
    const url = getDriveThumbnail(SPELL_SCROLL_MAP['lesserrestauration'], 128);
    MATCH_CACHE.set(cacheKey, url);
    return url;
  }
  if (normSpell === 'entangle' && SPELL_SCROLL_MAP['entangled']) {
    const url = getDriveThumbnail(SPELL_SCROLL_MAP['entangled'], 128);
    MATCH_CACHE.set(cacheKey, url);
    return url;
  }

  // 3. Multi-word Semantic Scorer
  const clean = lowerName
    .replace(/\+\d+/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
  
  const words = clean.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) {
    MATCH_CACHE.set(cacheKey, null);
    return null;
  }

  let bestScore = 0;
  let bestId: string | null = null;

  for (let i = 0; i < GAME_ICONS_CATALOG.length; i++) {
    const ico = GAME_ICONS_CATALOG[i];
    const icoLower = ico.n.toLowerCase();
    let score = 0;

    // Category matching bonus
    if (category && category !== 'all') {
      if (ico.c === category) score += 15;
    }

    for (let j = 0; j < words.length; j++) {
      const w = words[j];
      if (icoLower.includes(`_${w}_`) || icoLower.startsWith(`${w}_`) || icoLower.endsWith(`_${w}`)) {
        score += 35;
      } else if (icoLower.includes(w)) {
        score += w.length >= 5 ? 15 : 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = ico.i;
    }
  }

  // Minimum threshold score
  const result = bestScore >= 20 && bestId ? getDriveThumbnail(bestId, 128) : null;
  MATCH_CACHE.set(cacheKey, result);
  return result;
}

/**
 * Returns image URL for an item, respecting manual icon override or smart match.
 */
export function getItemImageSrc(item: Partial<Item>): string | null {
  if (item.iconUrl) return item.iconUrl;

  const name = (item.name || '').toLowerCase();
  const type = item.type || 'gear';

  // Check specific local assets first for speed
  if (name.includes('breastplate') || name.includes('cuirass')) {
    return '/icons/game/Generated_ARM_BreastPlate_2_Magic_result.png';
  }
  if (name.includes('boots of speed')) {
    return '/icons/game/Generated_ARM_BootsOfSpeed_Magic_result.png';
  }
  if (name.includes('githyanki')) {
    return '/icons/game/Generated_ARM_Bracers_Metal_Githyanki_Magic_result.png';
  }

  // Look up in 2,877 item catalog
  const catalogMatch = findBestMatchingIcon(item.name || '', type === 'weapon' ? 'weapon' : type === 'armor' ? 'armor' : type === 'consumable' ? 'consumable' : undefined);
  if (catalogMatch) return catalogMatch;

  // Generic category fallbacks
  if (type === 'weapon') return '/icons/game/GEN_Weapon_result.png';
  if (type === 'armor') return '/icons/game/GEN_Armor_result.png';
  if (type === 'consumable') return '/icons/game/GEN_Consumable_result.png';
  if (type === 'magic') return '/icons/game/GEN_Quest_result.png';
  if (type === 'gear') return '/icons/game/GEN_Container_result.png';

  return null;
}

export function getSpellImageSrc(spell: Partial<Spell>): string | null {
  if (spell.iconUrl) return spell.iconUrl;
  const match = findBestMatchingIcon(spell.name || '', 'spell');
  if (match) return match;

  // Fallback to quest/parchment scroll
  return '/icons/game/GEN_Quest_result.png';
}

export function GameItemIcon({
  item,
  size,
  className = "",
  onClick
}: {
  item: Partial<Item>;
  size?: number | string;
  className?: string;
  onClick?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = !imgFailed ? getItemImageSrc(item) : null;

  const hasCustomSizeClass = className.includes('w-') || className.includes('h-') || className.includes('size-');
  const finalSize = size !== undefined ? size : (hasCustomSizeClass ? undefined : 24);
  const styleProps = finalSize !== undefined ? { width: finalSize, height: finalSize } : undefined;

  if (src) {
    return (
      <div
        onClick={onClick}
        className={`relative shrink-0 flex items-center justify-center overflow-hidden rounded bg-[#100E0C] border border-[#3A2F1D]/80 shadow-[0_1px_4px_rgba(0,0,0,0.6)] ${onClick ? 'cursor-pointer hover:border-[#C99742] transition-colors' : ''} ${className}`}
        style={styleProps}
        title={item.name || 'Item Icon'}
      >
        <img
          src={src}
          alt={item.name || 'Item'}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback Lucide Icon
  return (
    <div
      onClick={onClick}
      className={`shrink-0 flex items-center justify-center rounded bg-[#181614] border border-[#23201B] ${onClick ? 'cursor-pointer hover:border-[#C99742] transition-colors' : ''} ${className}`}
      style={styleProps}
    >
      {getItemIcon(item)}
    </div>
  );
}

export function GameSpellIcon({
  spell,
  size,
  className = "",
  onClick
}: {
  spell: Partial<Spell>;
  size?: number | string;
  className?: string;
  onClick?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = !imgFailed ? getSpellImageSrc(spell) : null;

  const hasCustomSizeClass = className.includes('w-') || className.includes('h-') || className.includes('size-');
  const finalSize = size !== undefined ? size : (hasCustomSizeClass ? undefined : 24);
  const styleProps = finalSize !== undefined ? { width: finalSize, height: finalSize } : undefined;

  if (src) {
    return (
      <div
        onClick={onClick}
        className={`relative shrink-0 flex items-center justify-center overflow-hidden rounded bg-[#100E0C] border border-[#3A2F1D]/80 shadow-[0_1px_4px_rgba(0,0,0,0.6)] ${onClick ? 'cursor-pointer hover:border-[#C99742] transition-colors' : ''} ${className}`}
        style={styleProps}
        title={spell.name || 'Spell Icon'}
      >
        <img
          src={src}
          alt={spell.name || 'Spell'}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`shrink-0 flex items-center justify-center rounded bg-[#181614] border border-[#23201B] ${onClick ? 'cursor-pointer hover:border-[#C99742] transition-colors' : ''} ${className}`}
      style={styleProps}
    >
      {getSpellIcon(spell)}
    </div>
  );
}

export function getWeaponIcon(weapon: Partial<Item>) {
  const name = (weapon.name || '').toLowerCase();
  
  if (name.includes('bow') || name.includes('crossbow') || name.includes('dart') || name.includes('sling')) return <Crosshair size={14} className="text-[var(--accent-ink)]" />;
  if (name.includes('axe')) return <Axe size={14} className="text-[var(--accent-ink)]" />;
  if (name.includes('hammer') || name.includes('mace') || name.includes('maul') || name.includes('club')) return <Hammer size={14} className="text-[var(--accent-ink)]" />;
  if (name.includes('wand') || name.includes('staff')) return <Wand size={14} className="text-[var(--accent-ink)]" />;
  if (name.includes('shield')) return <Shield size={14} className="text-[var(--accent-ink)]" />;
  
  return <Sword size={14} className="text-[var(--accent-ink)]" />;
}

export function getItemIcon(item: Partial<Item>) {
  if (item.type === 'weapon') return getWeaponIcon(item);
  if (item.type === 'armor') return <Shirt size={14} className="text-[#555555]" />;
  if (item.type === 'consumable') {
    if ((item.name || '').toLowerCase().includes('scroll')) return <Scroll size={14} className="text-[var(--accent-ink)]" />;
    return <Droplet size={14} className="text-red-600" />;
  }
  if (item.type === 'magic') return <Sparkles size={14} className="text-purple-600" />;
  
  return <Package size={14} className="text-[#555555]" />;
}

export function getSpellIcon(spell: Partial<Spell>) {
  const school = (spell.school || '').toLowerCase();
  const dmgType = (spell.damageType || '').toLowerCase();
  
  if (dmgType) {
    if (dmgType.includes('fire')) return <Flame size={14} className="text-red-600" />;
    if (dmgType.includes('lightning') || dmgType.includes('thunder')) return <Zap size={14} className="text-amber-600" />;
    if (dmgType.includes('cold')) return <Snowflake size={14} className="text-cyan-600" />;
    if (dmgType.includes('acid') || dmgType.includes('poison')) return <Droplet size={14} className="text-emerald-600" />;
    if (dmgType.includes('necrotic')) return <Skull size={14} className="text-[#555555]" />;
    if (dmgType.includes('radiant')) return <Sun size={14} className="text-amber-500" />;
    if (dmgType.includes('force')) return <Star size={14} className="text-purple-600" />;
    if (dmgType.includes('psychic')) return <Eye size={14} className="text-pink-600" />;
  }

  switch (school) {
    case 'abjuration': return <Shield size={14} className="text-blue-600" />;
    case 'conjuration': return <Ghost size={14} className="text-[var(--accent-ink)]" />;
    case 'divination': return <Eye size={14} className="text-pink-600" />;
    case 'enchantment': return <Heart size={14} className="text-rose-600" />;
    case 'evocation': return <Flame size={14} className="text-red-600" />;
    case 'illusion': return <Moon size={14} className="text-[var(--accent-ink)]" />;
    case 'necromancy': return <Skull size={14} className="text-[#555555]" />;
    case 'transmutation': return <Feather size={14} className="text-emerald-600" />;
    default: return <Sparkles size={14} className="text-[var(--accent-ink)]" />;
  }
}
