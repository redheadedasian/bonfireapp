import React, { useState } from 'react';
import { useStore } from '../../store';
import { Frame } from '../ui';
import { requestRoll } from '../dice/rollBus';
import { formatModifier } from '../../utils';
import { Item, Spell, Ability } from '../../types';
import { Swords, Sparkles, Plus, Zap, Shield, ChevronRight, BookOpen, X, Crosshair, Info, Eye } from 'lucide-react';
import { getWeaponIcon, getSpellIcon, GameItemIcon, GameSpellIcon } from '../ui/GameIcons';
import { ConcentrationBanner } from '../combat/ConcentrationBanner';
import { QuickInspectModal } from '../combat/QuickInspectModal';
import { IconPickerModal } from '../common/IconPickerModal';
import { CombatTheaterStage } from '../combat/CombatTheaterStage';
import { ASSET_MAP } from '@/config/assets';

export function CombatTab() {
  const {
    character,
    toggleReadyWeapon,
    toggleReadySpell,
    spendSpellSlot,
    recoverSpellSlot,
    updateSpellSlotMax,
    updateSpellSlotCurrent,
    updateInventoryItem,
    updateSpell,
    updateCharacterField,
    setActiveConcentration,
    getProficiencyBonus,
    getSpellSaveDC,
    getSpellAttackBonus,
    getAbilityModifier,
    setGrimoireOpen,
    setArmoryOpen,
    setActiveTab,
    isEditMode
  } = useStore();

  const [advStates, setAdvStates] = useState<Record<string, 'none' | 'adv' | 'dis'>>({});
  const [critStates, setCritStates] = useState<Record<string, boolean>>({});
  const [readyWeaponModalOpen, setReadyWeaponModalOpen] = useState(false);
  const [readySpellModalOpen, setReadySpellModalOpen] = useState(false);
  const [inspectModalData, setInspectModalData] = useState<{ spell?: Spell | null; weapon?: Item | null } | null>(null);
  const [iconPickerTarget, setIconPickerTarget] = useState<{ type: 'weapon' | 'spell'; item?: Item; spell?: Spell } | null>(null);
  const [spellFilter, setSpellFilter] = useState<'all' | 'cantrip' | 'attack' | 'heal' | 'save' | 'bonus' | 'conc'>('all');
  const [combatViewMode, setCombatViewMode] = useState<'cinematic' | 'classic'>('cinematic');

  const profBonus = getProficiencyBonus();
  const spellSaveDC = getSpellSaveDC();
  const spellAtkBonus = getSpellAttackBonus();
  const wisMod = getAbilityModifier('wis');
  const strMod = getAbilityModifier('str');
  const dexMod = getAbilityModifier('dex');

  // Helper to determine default weapon ability mod (Finesse/Ranged -> DEX or higher of STR/DEX; Melee -> STR)
  const getWeaponDefaultMod = (weapon: Item) => {
    const isFinesse = weapon.description?.toLowerCase().includes('finesse') || weapon.properties?.includes('finesse') || weapon.weaponProperties?.some(p => p.toLowerCase().includes('finesse'));
    const isRanged = weapon.range && !weapon.range.startsWith('5') && !weapon.range.startsWith('Reach');
    if (isRanged) return dexMod;
    if (isFinesse) return Math.max(strMod, dexMod);
    return strMod;
  };

  // 1. Readied Weapons (max 4)
  const readiedWeapons = character.inventory.filter(
    (i) => i.type === 'weapon' && i.isReadiedInCombat
  );
  const unreadiedWeapons = character.inventory.filter(
    (i) => i.type === 'weapon' && !i.isReadiedInCombat
  );
  const maxWeapons = 4;
  const emptyWeaponSlots = Math.max(0, maxWeapons - readiedWeapons.length);

  // 2. Readied Spells (max 6)
  const readiedSpells = character.spells.filter((s) => s.isReadiedInCombat);
  const preparedUnreadiedSpells = character.spells.filter(
    (s) => s.prepared && !s.isReadiedInCombat
  );
  const maxSpells = 6;
  const emptySpellSlots = Math.max(0, maxSpells - readiedSpells.length);

  const toggleAdvState = (id: string) => {
    setAdvStates((prev) => {
      const current = prev[id] || 'none';
      if (current === 'none') return { ...prev, [id]: 'adv' };
      if (current === 'adv') return { ...prev, [id]: 'dis' };
      return { ...prev, [id]: 'none' };
    });
  };

  const toggleCrit = (id: string) => {
    setCritStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWeaponAttack = (weapon: Item) => {
    const adv = advStates[weapon.id] || 'none';
    const defaultMod = getWeaponDefaultMod(weapon);
    const bonus = weapon.attackBonus ?? (profBonus + defaultMod);
    const advTag = adv === 'adv' ? ' adv' : adv === 'dis' ? ' dis' : '';
    const sign = bonus >= 0 ? '+' : '';
    requestRoll({
      command: `1d20${sign}${bonus}${advTag}`,
      label: `${weapon.name} Attack`
    });
  };

  const handleWeaponDamage = (weapon: Item) => {
    const isCrit = critStates[weapon.id];
    const dice = weapon.damageDice || '1d8';
    const defaultMod = getWeaponDefaultMod(weapon);
    const bonus = weapon.damageBonus ?? defaultMod;
    const sign = bonus >= 0 ? `+${bonus}` : `${bonus}`;
    
    let rollCommand = `${dice}${sign}`;
    if (isCrit) {
      // Double the dice count for critical hit
      const match = dice.match(/^(\d+)d(\d+)$/i);
      if (match) {
        const count = parseInt(match[1], 10) * 2;
        rollCommand = `${count}d${match[2]}${sign}`;
      } else {
        rollCommand = `2d8${sign}`;
      }
    }

    requestRoll({
      command: rollCommand,
      label: `${weapon.name} Damage${isCrit ? ' (CRIT)' : ''} [${weapon.damageType || 'Slashing'}]`
    });
  };

  const handleSpellAttack = (spell: Spell) => {
    const adv = advStates[spell.id] || 'none';
    const advTag = adv === 'adv' ? ' adv' : adv === 'dis' ? ' dis' : '';
    const sign = spellAtkBonus >= 0 ? '+' : '';
    requestRoll({
      command: `1d20${sign}${spellAtkBonus}${advTag}`,
      label: `${spell.name} Spell Attack`
    });
  };

  const handleSpellDamage = (spell: Spell) => {
    const isCrit = critStates[spell.id];
    const dice = spell.damageDice || '1d8';
    const bonus = spell.damageBonus ? `+${spell.damageBonus}` : '';
    
    let rollCommand = `${dice}${bonus}`;
    if (isCrit) {
      const match = dice.match(/^(\d+)d(\d+)$/i);
      if (match) {
        const count = parseInt(match[1], 10) * 2;
        rollCommand = `${count}d${match[2]}${bonus}`;
      }
    }

    requestRoll({
      command: rollCommand,
      label: `${spell.name} Damage${isCrit ? ' (CRIT)' : ''} [${spell.damageType || spell.school}]`
    });
  };

  const handleCastSpell = (spell: Spell) => {
    if (spell.level > 0) {
      const slot = character.spellSlots[spell.level];
      if (slot && slot.current > 0) {
        spendSpellSlot(spell.level);
      }
    }
    if (spell.damageDice) {
      handleSpellDamage(spell);
    } else {
      requestRoll({
        command: '1d20',
        label: `Cast ${spell.name} (Lvl ${spell.level})`
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 pointer-events-auto pb-10 select-none">
      
      {/* View Mode Toggle: Cinematic Theater vs Classic Sheet */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-[#0c0a0f] border border-[#2a241e] rounded-lg shadow-2xl text-stone-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setCombatViewMode('cinematic')}
            className={`px-3 py-1.5 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              combatViewMode === 'cinematic'
                ? 'bg-gradient-to-b from-[#2a1f14] to-[#140e08] text-[#fde047] border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.35)] scale-102'
                : 'bg-gradient-to-b from-[#1c1612] to-[#0e0b09] border border-[#3a2d1d] text-[#c49a50] hover:text-[#e1bd72] hover:border-[#c49a50]'
            }`}
          >
            <Swords size={13} className={combatViewMode === 'cinematic' ? 'text-[#fde047]' : 'text-[#c49a50]'} />
            <span>Cinematic Combat Theater</span>
          </button>
          <button
            onClick={() => setCombatViewMode('classic')}
            className={`px-3 py-1.5 rounded text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              combatViewMode === 'classic'
                ? 'bg-gradient-to-b from-[#2a1f14] to-[#140e08] text-[#fde047] border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.35)] scale-102'
                : 'bg-gradient-to-b from-[#1c1612] to-[#0e0b09] border border-[#3a2d1d] text-[#c49a50] hover:text-[#e1bd72] hover:border-[#c49a50]'
            }`}
          >
            <BookOpen size={13} />
            <span>Classic Readied HUD</span>
          </button>
        </div>
      </div>

      {combatViewMode === 'cinematic' ? (
        <CombatTheaterStage mode="player" />
      ) : (
        <>
          {/* Active Concentration Banner */}
          <ConcentrationBanner />

          {/* Quick Inspect Modal for Spells and Weapons */}
          {inspectModalData && (
            <QuickInspectModal
              spell={inspectModalData.spell}
              weapon={inspectModalData.weapon}
              onClose={() => setInspectModalData(null)}
              onCastSpell={(s) => handleCastSpell(s)}
              onAttackWeapon={(w) => handleWeaponAttack(w)}
            />
          )}

          {/* 1. EQUIPPED WEAPONS Table (Max 4 Readied) */}
          <Frame
            title={`EQUIPPED WEAPONS (${readiedWeapons.length} / ${maxWeapons})`}
          >
        <div className="flex flex-col gap-2.5 p-3 sm:p-4">
          
          {/* Header Sub-row */}
          <div className="relative flex flex-wrap justify-between items-center text-xs font-display text-[#555555] tracking-wider uppercase border-b border-[#141414]/15 pb-2.5 px-2 sm:px-3 gap-2">
            <div className="relative inline-flex items-center gap-2">
              <div
                style={{
                  maskImage: `url("${ASSET_MAP.brushStrokes.brush4}")`,
                  WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush4}")`,
                  maskSize: '100% 100%',
                  WebkitMaskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  backgroundColor: 'var(--accent-ink)',
                  opacity: 0.35,
                }}
                className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
              />
              <div className="relative z-10 flex items-center gap-2">
                <Swords size={16} className="text-[var(--accent-ink)]" />
                <span className="font-gw2 font-bold text-sm text-[#161616] tracking-wide">Weapons Readied for Combat</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-4 flex-wrap">
              <span>Proficiency: <strong className="text-[#161616] font-mono">{formatModifier(profBonus)}</strong></span>
              <span>Slots: <strong className="text-[var(--accent-ink)] font-bold font-mono">{readiedWeapons.length}</strong> / {maxWeapons}</span>
              <button
                onClick={() => setArmoryOpen(true)}
                className="sumie-btn-primary text-xs"
                title="Open Weapon Vault & Armory"
              >
                <Swords size={13} />
                <span>Open Armory</span>
              </button>
            </div>
          </div>

          {/* Weapons Rows */}
          {readiedWeapons.map((weapon) => {
            const adv = advStates[weapon.id] || 'none';
            const isCrit = critStates[weapon.id] || false;
            const defaultMod = getWeaponDefaultMod(weapon);
            const atkBonus = weapon.attackBonus ?? (profBonus + defaultMod);
            const dmgDice = weapon.damageDice || '1d8';
            const dmgBonus = weapon.damageBonus ?? defaultMod;

            return (
              <div
                key={weapon.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/85 border border-[#141414]/15 p-3 rounded shadow-sm hover:border-[var(--accent-ink)] hover:shadow-md transition-all group"
              >
                {/* Col 1 & 2: Name, Type, Range & Properties */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {isEditMode ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <GameItemIcon
                          item={weapon}
                          size={28}
                          onClick={() => setIconPickerTarget({ type: 'weapon', item: weapon })}
                        />
                        <input
                          type="text"
                          value={weapon.name}
                          onChange={(e) => updateInventoryItem(weapon.id, { name: e.target.value })}
                          className="font-serif text-sm text-[#161616] font-bold bg-white/90 border border-[#141414]/20 px-2 py-0.5 rounded focus:border-[var(--accent-ink)] focus:outline-none flex-1"
                          placeholder="Weapon Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                        <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                          <span className="text-[9px] text-[#555555]">Atk:</span>
                          <input
                            type="number"
                            value={weapon.attackBonus ?? 0}
                            onChange={(e) => updateInventoryItem(weapon.id, { attackBonus: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-transparent text-[#161616] focus:outline-none text-center font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                          <span className="text-[9px] text-[#555555]">Dmg:</span>
                          <input
                            type="text"
                            value={weapon.damageDice || '1d8'}
                            onChange={(e) => updateInventoryItem(weapon.id, { damageDice: e.target.value })}
                            className="w-full bg-transparent text-[#161616] focus:outline-none text-center font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                          <span className="text-[9px] text-[#555555]">Type:</span>
                          <input
                            type="text"
                            value={weapon.damageType || 'Slashing'}
                            onChange={(e) => updateInventoryItem(weapon.id, { damageType: e.target.value })}
                            className="w-full bg-transparent text-[#555555] focus:outline-none text-center text-[10px]"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                          <span className="text-[9px] text-[#555555]">Rng:</span>
                          <input
                            type="text"
                            value={weapon.range || '5 ft.'}
                            onChange={(e) => updateInventoryItem(weapon.id, { range: e.target.value })}
                            className="w-full bg-transparent text-[#555555] focus:outline-none text-center text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <GameItemIcon
                        item={weapon}
                        size={42}
                        className="rounded-sm shrink-0"
                        onClick={() => setIconPickerTarget({ type: 'weapon', item: weapon })}
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-base text-[#161616] font-bold truncate">
                            {weapon.name}
                          </span>
                          <span className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold leading-none">
                            Readied
                          </span>
                          {weapon.rarity && weapon.rarity !== 'Common' && (
                            <span className="text-xs font-display uppercase tracking-wider text-[var(--accent-ink)] font-semibold">
                              {weapon.rarity}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-[#555555] flex-wrap mt-0.5">
                          <span>{weapon.range || '5 ft.'}</span>
                          <span className="text-[var(--accent-ink)]/40">•</span>
                          <span className="text-[#161616] font-medium">{weapon.damageType || 'Slashing'}</span>
                          {weapon.weaponProperties && weapon.weaponProperties.length > 0 && (
                            <>
                              <span className="text-[var(--accent-ink)]/40">•</span>
                              <span className="truncate">
                                {weapon.weaponProperties.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Col 3: D&D Beyond Interactive Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  
                  {/* Advantage / Disadvantage Toggle */}
                  <button
                    onClick={() => toggleAdvState(weapon.id)}
                    className={`px-2.5 py-1.5 rounded-xs border text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      adv === 'adv'
                        ? 'border-[#1EB253] bg-[#1EB253]/15 text-[#147a38]'
                        : adv === 'dis'
                        ? 'border-[#E33526] bg-[#E33526]/15 text-[#b82014]'
                        : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                    }`}
                    title="Toggle Advantage / Disadvantage"
                  >
                    {adv === 'adv' ? 'ADV' : adv === 'dis' ? 'DIS' : 'NORM'}
                  </button>

                  {/* Attack Roll Button */}
                  <button
                    onClick={() => handleWeaponAttack(weapon)}
                    className="px-3.5 py-1.5 rounded-xs border border-black/30 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs sm:text-sm font-display font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Roll Weapon Attack"
                  >
                    ATK {formatModifier(atkBonus)}
                  </button>

                  {/* Damage Roll Button */}
                  <button
                    onClick={() => handleWeaponDamage(weapon)}
                    className="px-3.5 py-1.5 rounded-xs border border-black/30 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Roll Weapon Damage"
                  >
                    DMG {dmgDice}{dmgBonus ? `+${dmgBonus}` : ''}
                  </button>

                  {/* Crit Toggle */}
                  <button
                    onClick={() => toggleCrit(weapon.id)}
                    style={isCrit ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                    className={`px-2.5 py-1.5 rounded-xs border text-xs font-display uppercase tracking-wider transition-colors cursor-pointer ${
                      isCrit
                        ? 'text-white font-bold shadow-sm'
                        : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                    }`}
                    title="Toggle Critical Hit"
                  >
                    CRIT
                  </button>

                  {/* Quick Inspect Button */}
                  <button
                    onClick={() => setInspectModalData({ weapon })}
                    className="p-2 rounded-xs border border-[#141414]/20 text-[#555555] hover:text-[#161616] hover:border-black/40 bg-[#fdfbf7] hover:bg-white transition-colors cursor-pointer"
                    title="Inspect Weapon Details & Properties"
                  >
                    <Info size={14} />
                  </button>

                  {/* Unready Toggle */}
                  <button
                    onClick={() => toggleReadyWeapon(weapon.id)}
                    className="p-2 rounded-xs border border-[#141414]/20 text-[#777777] hover:text-[#E33526] hover:border-[#E33526]/50 bg-[#fdfbf7] hover:bg-white transition-colors cursor-pointer"
                    title="Unready from Combat HUD (move to backpack)"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty Weapon Slots (Up to 4) */}
          {Array.from({ length: emptyWeaponSlots }).map((_, index) => (
            <div
              key={`empty-w-${index}`}
              onClick={() => setArmoryOpen(true)}
              className="border border-[#141414]/20 border-dashed rounded p-3 bg-white/50 hover:bg-white/80 hover:border-black/40 cursor-pointer flex items-center justify-between text-[#555555] hover:text-[#161616] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-[var(--accent-ink)] group-hover:scale-110 transition-transform" />
                <span className="font-display text-xs sm:text-sm uppercase tracking-wider font-semibold">
                  + Open Armory Drawer (Slot {readiedWeapons.length + index + 1} of {maxWeapons})
                </span>
              </div>
              <span className="text-xs font-display tracking-wider text-[var(--accent-ink)] underline font-bold">
                Browse Armory
              </span>
            </div>
          ))}

        </div>
      </Frame>

      {/* 2. SPELL SLOTS & STATS BAR (Place Directly Above Spells) */}
      <Frame title="SPELL SLOTS AVAILABLE">
        <div className="flex flex-col gap-3 p-3.5 sm:p-4">
          
          {/* Stats Sub-bar */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono border-b border-[#141414]/15 pb-2.5 px-1 text-[#555555]">
            <div className="relative z-10 flex items-center gap-4 flex-wrap">
              {isEditMode ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-display uppercase tracking-wider text-[var(--accent-ink)] font-bold">Spell Ability:</span>
                  <select
                    value={character.spellcastingAbility || 'wis'}
                    onChange={(e) => updateCharacterField('spellcastingAbility', e.target.value as Ability)}
                    className="bg-white/90 border border-black/30 text-xs text-[#161616] px-2 py-0.5 rounded font-display uppercase focus:outline-none focus:border-[var(--accent-ink)] font-bold"
                  >
                    <option value="wis">WIS</option>
                    <option value="int">INT</option>
                    <option value="cha">CHA</option>
                    <option value="str">STR</option>
                    <option value="dex">DEX</option>
                    <option value="con">CON</option>
                  </select>
                </div>
              ) : (
                <span>
                  Spellcasting Ability: <strong className="text-[#161616] font-serif font-bold text-sm">{character.spellcastingAbility?.toUpperCase() || 'WIS'} ({formatModifier(getAbilityModifier(character.spellcastingAbility || 'wis'))})</strong>
                </span>
              )}
              <span className="text-[var(--accent-ink)]/40">•</span>
              <span>
                Spell Attack: <strong className="text-[#161616] font-bold text-sm">+{spellAtkBonus}</strong>
              </span>
              <span className="text-[var(--accent-ink)]/40">•</span>
              <span>
                Spell Save DC: <strong className="text-[var(--accent-ink)] font-bold text-sm">{spellSaveDC}</strong>
              </span>
            </div>

            <button
              onClick={() => setGrimoireOpen(true)}
              className="sumie-btn-primary text-xs"
              title="Open Grimoire & Manage Spellbook"
            >
              <BookOpen size={13} />
              <span>Open Grimoire</span>
            </button>
          </div>

          {/* Diamond Row: Single horizontal, pixel-aligned row for Levels 1–6 */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const slot = character.spellSlots[level] || { current: 0, max: 0 };
              const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';

              return (
                <div
                  key={level}
                  className="flex flex-col items-center justify-center p-2.5 rounded bg-white/85 border border-[#141414]/15 shadow-sm gap-1.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-bold">
                    <span>{level}{suffix}</span>
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={slot.max}
                          onChange={(e) => updateSpellSlotMax(level, parseInt(e.target.value, 10) || 0)}
                          className="w-8 bg-white/90 border border-black/20 text-[#161616] text-center font-mono text-xs rounded focus:outline-none focus:border-[var(--accent-ink)] font-bold"
                          title="Max Spell Slots"
                        />
                        <span className="text-[10px] text-[#555555]">max</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#555555] font-normal">({slot.current}/{slot.max})</span>
                    )}
                  </div>

                  {/* Clickable Diamonds */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: slot.max }).map((_, i) => {
                      const isAvailable = i < slot.current;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (isAvailable) {
                              spendSpellSlot(level);
                            } else {
                              recoverSpellSlot(level);
                            }
                          }}
                          style={isAvailable ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)' } : {}}
                          className={`w-4 h-4 rotate-45 border transition-all flex items-center justify-center cursor-pointer ${
                            isAvailable
                              ? 'shadow-sm hover:drop-shadow-[0_0_6px_var(--accent-glow)]'
                              : 'border-[#141414]/25 bg-[#eae5dc] hover:border-black/40'
                          }`}
                          title={`Click to ${isAvailable ? 'spend' : 'recover'} ${level}${suffix} level slot`}
                        />
                      );
                    })}
                    {slot.max === 0 && (
                      <span className="text-xs font-serif text-[#777777] italic">None</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </Frame>

      {/* 3. READIED COMBAT SPELLS Table (Max 6 Readied) */}
      <Frame
        title={`READIED COMBAT SPELLS (${readiedSpells.length} / ${maxSpells})`}
      >
        <div className="flex flex-col gap-2.5 p-3 sm:p-4">
          
          {/* Header Sub-row with Combat Spell Filters */}
          <div className="flex flex-col gap-2 border-b border-[#141414]/15 pb-2.5 px-2 sm:px-3">
            <div className="flex flex-wrap justify-between items-center text-xs font-display text-[#555555] tracking-wider uppercase gap-2">
              <div className="relative inline-flex items-center gap-2">
                <div
                  style={{
                    maskImage: `url("${ASSET_MAP.brushStrokes.brush8}")`,
                    WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush8}")`,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    backgroundColor: 'var(--accent-ink)',
                    opacity: 0.35,
                  }}
                  className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
                />
                <div className="relative z-10 flex items-center gap-2">
                  <Sparkles size={15} className="text-[var(--accent-ink)]" />
                  <span className="font-bold text-[#161616]">Prepared Combat Spells</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span>Save DC: <strong className="text-[var(--accent-ink)] font-bold">{spellSaveDC}</strong></span>
                <span>Spell Atk: <strong className="text-[#161616] font-bold">+{spellAtkBonus}</strong></span>
                <span>Slots: <strong className="text-[var(--accent-ink)] font-bold">{readiedSpells.length}</strong> / {maxSpells}</span>
              </div>
            </div>

            {/* Quick Spell Type Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[
                { key: 'all', label: 'All Readied' },
                { key: 'cantrip', label: 'Cantrips' },
                { key: 'attack', label: 'Attacks' },
                { key: 'heal', label: 'Heals' },
                { key: 'save', label: 'Save DC' },
                { key: 'bonus', label: 'Bonus Actions' },
                { key: 'conc', label: 'Concentration' }
              ].map((tab) => {
                const isActive = spellFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSpellFilter(tab.key as 'all' | 'cantrip' | 'attack' | 'heal' | 'save' | 'bonus' | 'conc')}
                    style={isActive ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                    className={`spell-filter-tab px-2.5 py-1 rounded-xs text-xs font-display uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'text-white font-bold shadow-xs'
                        : 'bg-white/80 hover:bg-white text-[#555555] hover:text-[#161616] border border-[#141414]/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spell Rows & List Container with Fixed Min Height */}
          <div className="flex flex-col gap-2.5 min-h-[440px]">
            {readiedSpells
              .filter((spell) => {
                if (spellFilter === 'all') return true;
                const isHeal = spell.spellCategory === 'heal' || spell.name.toLowerCase().includes('cure') || spell.name.toLowerCase().includes('healing') || spell.name.toLowerCase().includes('heal');
                const isSave = !isHeal && (spell.spellCategory === 'save' || Boolean(spell.saveRequired));
                const isAttack = !isHeal && !isSave && (spell.spellCategory === 'attack' || (!spell.saveRequired && Boolean(spell.damageDice)));
                const isBonus = spell.castingTime?.toLowerCase().includes('bonus');

                if (spellFilter === 'cantrip') return spell.level === 0;
                if (spellFilter === 'attack') return isAttack;
                if (spellFilter === 'heal') return isHeal;
                if (spellFilter === 'save') return isSave;
                if (spellFilter === 'bonus') return isBonus;
                if (spellFilter === 'conc') return Boolean(spell.concentration);
                return true;
              })
              .map((spell) => {
                const adv = advStates[spell.id] || 'none';
                const isCrit = critStates[spell.id] || false;
                const isHeal = spell.spellCategory === 'heal' || spell.name.toLowerCase().includes('cure') || spell.name.toLowerCase().includes('healing') || spell.name.toLowerCase().includes('heal');
                const isSave = !isHeal && (spell.spellCategory === 'save' || Boolean(spell.saveRequired));
                const isAttack = !isHeal && !isSave && (spell.spellCategory === 'attack' || (!spell.saveRequired && Boolean(spell.damageDice)));
                const isBonusAction = spell.castingTime?.toLowerCase().includes('bonus');

                return (
                  <div
                    key={spell.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/85 border border-[#141414]/15 p-3 rounded shadow-sm hover:border-[var(--accent-ink)] hover:shadow-md transition-all group"
                  >
                    {/* Col 1 & 2: Name, Level, Category & Description snippet */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      {isEditMode ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <GameSpellIcon
                              spell={spell}
                              size={28}
                              onClick={() => setIconPickerTarget({ type: 'spell', spell })}
                            />
                            <input
                              type="text"
                              value={spell.name}
                              onChange={(e) => updateSpell(spell.id, { name: e.target.value })}
                              className="font-serif text-sm text-[#161616] font-bold bg-white/90 border border-[#141414]/20 px-2 py-0.5 rounded focus:border-[var(--accent-ink)] focus:outline-none flex-1"
                              placeholder="Spell Name"
                            />
                            <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 border border-[#141414]/20 rounded">
                              <span className="text-xs text-[#555555]">Lvl:</span>
                              <input
                                type="number"
                                value={spell.level}
                                onChange={(e) => updateSpell(spell.id, { level: parseInt(e.target.value, 10) || 0 })}
                                className="w-8 bg-transparent text-[var(--accent-ink)] focus:outline-none text-center font-mono text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                              <span className="text-[9px] text-[#555555]">Dmg:</span>
                              <input
                                type="text"
                                value={spell.damageDice || ''}
                                onChange={(e) => updateSpell(spell.id, { damageDice: e.target.value })}
                                placeholder="e.g. 1d8"
                                className="w-full bg-transparent text-[#161616] focus:outline-none text-center font-bold"
                              />
                            </div>
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                              <span className="text-[9px] text-[#555555]">Type:</span>
                              <input
                                type="text"
                                value={spell.damageType || ''}
                                onChange={(e) => updateSpell(spell.id, { damageType: e.target.value })}
                                placeholder="Radiant"
                                className="w-full bg-transparent text-[#555555] focus:outline-none text-center text-[10px]"
                              />
                            </div>
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                              <span className="text-[9px] text-[#555555]">Time:</span>
                              <input
                                type="text"
                                value={spell.castingTime || '1 Action'}
                                onChange={(e) => updateSpell(spell.id, { castingTime: e.target.value })}
                                className="w-full bg-transparent text-[#555555] focus:outline-none text-center text-[10px]"
                              />
                            </div>
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-[#141414]/20 rounded">
                              <span className="text-[9px] text-[#555555]">Range:</span>
                              <input
                                type="text"
                                value={spell.range || '60 ft.'}
                                onChange={(e) => updateSpell(spell.id, { range: e.target.value })}
                                className="w-full bg-transparent text-[#555555] focus:outline-none text-center text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <GameSpellIcon
                            spell={spell}
                            size={42}
                            className="rounded-sm shrink-0"
                            onClick={() => setIconPickerTarget({ type: 'spell', spell })}
                          />
                          <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-base text-[#161616] font-bold truncate">
                                {spell.name}
                              </span>
                              <span className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold leading-none">
                                {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                              </span>
                              {isBonusAction && (
                                <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-amber-500/15 text-amber-700 border border-amber-500/40 font-bold leading-none">
                                  Bonus Action
                                </span>
                              )}
                              {spell.concentration && (
                                <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#E33526]/10 text-[#b82014] border border-[#E33526]/30 font-bold leading-none">
                                  Conc.
                                </span>
                              )}
                              {spell.ritual && (
                                <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] border border-[var(--accent-ink)]/30 font-bold leading-none">
                                  Ritual
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono text-[#555555] flex-wrap mt-0.5">
                              <span>{spell.castingTime}</span>
                              <span className="text-[var(--accent-ink)]/40">•</span>
                              <span>{spell.range}</span>
                              <span className="text-[var(--accent-ink)]/40">•</span>
                              <span className="text-[#161616] font-medium">{spell.school}</span>
                              {spell.damageType && (
                                <>
                                  <span className="text-[var(--accent-ink)]/40">•</span>
                                  <span className="text-[var(--accent-ink)] font-semibold">{spell.damageType}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Right Side */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      
                      {/* 1. Attack Spells */}
                      {isAttack && (
                        <>
                          <button
                            onClick={() => toggleAdvState(spell.id)}
                            className={`px-2.5 py-1.5 rounded-xs border text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              adv === 'adv'
                                ? 'border-[#1EB253] bg-[#1EB253]/15 text-[#147a38]'
                                : adv === 'dis'
                                ? 'border-[#E33526] bg-[#E33526]/15 text-[#b82014]'
                                : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                            }`}
                            title="Toggle Advantage / Disadvantage"
                          >
                            {adv === 'adv' ? 'ADV' : adv === 'dis' ? 'DIS' : 'NORM'}
                          </button>

                          <button
                            onClick={() => handleSpellAttack(spell)}
                            className="px-3.5 py-1.5 rounded-xs border border-black/30 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs sm:text-sm font-display font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95 cursor-pointer"
                            title="Roll Spell Attack"
                          >
                            ATK +{spellAtkBonus}
                          </button>

                          {spell.damageDice && (
                            <button
                              onClick={() => handleSpellDamage(spell)}
                              className="px-3.5 py-1.5 rounded-xs border border-black/30 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                              title="Roll Spell Damage"
                            >
                              DMG {spell.damageDice}{spell.damageBonus ? `+${spell.damageBonus}` : ''}
                            </button>
                          )}

                          <button
                            onClick={() => toggleCrit(spell.id)}
                            style={isCrit ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                            className={`px-2.5 py-1.5 rounded-xs border text-xs font-display uppercase tracking-wider transition-colors cursor-pointer ${
                              isCrit
                                ? 'text-white font-bold shadow-sm'
                                : 'border-[#141414]/20 bg-[#fdfbf7] text-[#555555] hover:border-black/40 hover:text-[#161616]'
                            }`}
                            title="Toggle Critical Hit"
                          >
                            CRIT
                          </button>
                        </>
                      )}

                      {/* 2. Save DC Spells */}
                      {isSave && (
                        <>
                          <div className="px-3 py-1.5 rounded-xs border border-black/20 bg-[#fdfbf7] text-xs font-display uppercase tracking-wider text-[#161616] font-semibold">
                            SAVE <strong className="text-[var(--accent-ink)] font-bold">DC {spellSaveDC}</strong> {spell.saveRequired?.toUpperCase() || 'DEX'}
                          </div>

                          {spell.damageDice && (
                            <button
                              onClick={() => handleSpellDamage(spell)}
                              className="px-3.5 py-1.5 rounded-xs border border-black/30 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                              title="Roll Save Damage"
                            >
                              DMG {spell.damageDice}
                            </button>
                          )}
                        </>
                      )}

                      {/* 3. Healing Spells */}
                      {isHeal && (
                        <button
                          onClick={() => handleSpellDamage(spell)}
                          className="px-3.5 py-1.5 rounded-xs border border-[#1EB253]/60 bg-[#1EB253]/15 text-[#147a38] hover:bg-[#1EB253]/25 text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Roll Healing Amount"
                        >
                          HEAL {spell.damageDice || '1d8'}{spell.damageBonus ? `+${spell.damageBonus}` : '+4'}
                        </button>
                      )}

                      {/* Cast / Spend Slot Button */}
                      <button
                        onClick={() => handleCastSpell(spell)}
                        className="btn-cast px-3.5 py-1.5 rounded-xs bg-[#1c1c1c] hover:bg-[var(--accent-ink)] border border-black/40 hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white shadow-sm text-xs sm:text-sm font-display font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                        title={`Cast ${spell.name}${spell.level > 0 ? ` (Spends Lvl ${spell.level} Slot)` : ''}`}
                      >
                        Cast{spell.level > 0 ? ` (Slot)` : ''}
                      </button>

                      {/* Concentration Toggle */}
                      {spell.concentration && (
                        <button
                          onClick={() =>
                            setActiveConcentration({
                              spellId: spell.id,
                              spellName: spell.name,
                              level: spell.level,
                              school: spell.school,
                              duration: spell.duration
                            })
                          }
                          className={`p-2 rounded-xs border text-xs transition-colors cursor-pointer ${
                            character.activeConcentration?.spellId === spell.id
                              ? 'border-black/40 bg-[var(--accent-ink)] text-white shadow-sm'
                              : 'border-black/20 bg-[#fdfbf7] text-[#161616] hover:border-black/40'
                          }`}
                          title="Set active concentration to this spell"
                        >
                          <Zap size={14} fill={character.activeConcentration?.spellId === spell.id ? 'currentColor' : 'none'} />
                        </button>
                      )}

                      {/* Quick Inspect */}
                      <button
                        onClick={() => setInspectModalData({ spell })}
                        className="p-2 rounded-xs border border-[#141414]/20 text-[#555555] hover:text-[#161616] hover:border-black/40 bg-[#fdfbf7] hover:bg-white transition-colors cursor-pointer"
                        title="Inspect Spell Description & Components"
                      >
                        <Info size={14} />
                      </button>

                      {/* Unready Toggle */}
                      <button
                        onClick={() => toggleReadySpell(spell.id)}
                        className="p-2 rounded-xs border border-[#141414]/20 text-[#777777] hover:text-[#E33526] hover:border-[#E33526]/50 bg-[#fdfbf7] hover:bg-white transition-colors cursor-pointer"
                        title="Unready spell from Combat HUD"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Empty Slots */}
            {spellFilter === 'all' && Array.from({ length: emptySpellSlots }).map((_, index) => (
              <div
                key={`empty-s-${index}`}
                onClick={() => setReadySpellModalOpen(true)}
                className="border border-[#141414]/20 border-dashed rounded p-3 bg-white/50 hover:bg-white/80 hover:border-black/40 cursor-pointer flex items-center justify-between text-[#555555] hover:text-[#161616] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-[var(--accent-ink)] group-hover:scale-110 transition-transform" />
                  <span className="font-display text-xs uppercase tracking-widest">
                    + Ready Spell from Spellbook (Slot {readiedSpells.length + index + 1} of {maxSpells})
                  </span>
                </div>
                <span className="text-[10px] font-display tracking-wider text-[var(--accent-ink)] underline font-bold">
                  Select Spell
                </span>
              </div>
            ))}
          </div>

        </div>
      </Frame>

      {/* 4. Pinned Grimoire & Armory Trigger Buttons at the Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setArmoryOpen(true)}
          className="btn-open-drawer w-full py-3.5 px-6 rounded border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:text-[#000000] font-display text-xs sm:text-sm tracking-[0.2em] uppercase font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
        >
          <Swords size={16} />
          <span>OPEN ARMORY & WEAPONS</span>
        </button>

        <button
          onClick={() => setGrimoireOpen(true)}
          className="btn-open-drawer w-full py-3.5 px-6 rounded border border-black/20 bg-white/[0.92] text-[#1a1a1a] hover:border-[var(--accent-ink)] hover:text-[#000000] font-display text-xs sm:text-sm tracking-[0.2em] uppercase font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
        >
          <BookOpen size={16} />
          <span>OPEN GRIMOIRE & SPELLS</span>
        </button>
      </div>

      {/* Quick Modal: Ready Weapon from Inventory */}
      {readyWeaponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-white/95 border-2 border-black/30 w-full max-w-lg rounded-xl shadow-2xl p-5 flex flex-col gap-4 max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <h3 className="font-display text-base tracking-widest text-[#1a1a1a] uppercase font-bold">
                Ready Weapon for Combat HUD
              </h3>
              <button
                onClick={() => setReadyWeaponModalOpen(false)}
                className="text-[#777777] hover:text-[#161616] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 hide-scrollbar">
              {unreadiedWeapons.length === 0 ? (
                <div className="p-6 text-center text-sm font-serif text-[#777777]">
                  No unreadied weapons in inventory. Add weapons in the Inventory tab.
                </div>
              ) : (
                unreadiedWeapons.map((weapon) => (
                  <div
                    key={weapon.id}
                    className="flex justify-between items-center bg-white border border-[#141414]/15 p-3 rounded hover:border-[var(--accent-ink)] transition-colors shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-serif text-[#161616] font-semibold">{weapon.name}</span>
                      <span className="text-xs font-mono text-[#555555]">
                        {weapon.damageDice} {weapon.damageType} • {weapon.range || '5 ft.'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        toggleReadyWeapon(weapon.id);
                        setReadyWeaponModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xs bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase tracking-wider transition-all font-bold cursor-pointer"
                    >
                      Ready
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#141414]/15 pt-3 flex justify-between items-center">
              <button
                onClick={() => {
                  setReadyWeaponModalOpen(false);
                  setActiveTab('INVENTORY');
                }}
                className="text-xs font-display text-[var(--accent-ink)] hover:text-[#000000] uppercase tracking-wider font-bold cursor-pointer"
              >
                Open Full Inventory →
              </button>
              <button
                onClick={() => setReadyWeaponModalOpen(false)}
                className="px-4 py-1.5 border border-[#141414]/20 bg-[#fdfbf7] text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] cursor-pointer rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Ready Spell from Spellbook */}
      {readySpellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-white/95 border-2 border-black/30 w-full max-w-lg rounded-xl shadow-2xl p-5 flex flex-col gap-4 max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
              <h3 className="font-display text-base tracking-widest text-[#1a1a1a] uppercase font-bold">
                Ready Spell for Combat HUD
              </h3>
              <button
                onClick={() => setReadySpellModalOpen(false)}
                className="text-[#777777] hover:text-[#161616] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 hide-scrollbar">
              {preparedUnreadiedSpells.length === 0 ? (
                <div className="p-6 text-center text-sm font-serif text-[#777777]">
                  No prepared spells available to ready. Prepare spells in the Grimoire first.
                </div>
              ) : (
                preparedUnreadiedSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="flex justify-between items-center bg-white border border-[#141414]/15 p-3 rounded hover:border-[var(--accent-ink)] transition-colors shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-serif text-[#161616] font-semibold">{spell.name}</span>
                      <span className="text-xs font-mono text-[#555555]">
                        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school}
                        {spell.damageDice ? ` • ${spell.damageDice}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        toggleReadySpell(spell.id);
                        setReadySpellModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xs bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white text-xs font-display uppercase tracking-wider transition-all font-bold cursor-pointer"
                    >
                      Ready
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#141414]/15 pt-3 flex justify-between items-center">
              <button
                onClick={() => {
                  setReadySpellModalOpen(false);
                  setGrimoireOpen(true);
                }}
                className="text-xs font-display text-[var(--accent-ink)] hover:text-[#000000] uppercase tracking-wider font-bold cursor-pointer"
              >
                Open Full Grimoire →
              </button>
              <button
                onClick={() => setReadySpellModalOpen(false)}
                className="px-4 py-1.5 border border-[#141414]/20 bg-[#fdfbf7] text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] cursor-pointer rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={Boolean(iconPickerTarget)}
        onClose={() => setIconPickerTarget(null)}
        initialCategory={iconPickerTarget?.type === 'weapon' ? 'weapon' : 'spell'}
        itemName={iconPickerTarget?.type === 'weapon' ? iconPickerTarget.item?.name : iconPickerTarget?.spell?.name}
        onSelectIcon={(iconUrl) => {
          if (iconPickerTarget?.type === 'weapon' && iconPickerTarget.item) {
            updateInventoryItem(iconPickerTarget.item.id, { iconUrl });
          } else if (iconPickerTarget?.type === 'spell' && iconPickerTarget.spell) {
            updateSpell(iconPickerTarget.spell.id, { iconUrl });
          }
          setIconPickerTarget(null);
        }}
      />

    </div>
  );
}
