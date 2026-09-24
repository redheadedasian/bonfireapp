import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, 
  Sparkles, 
  Package, 
  ShieldAlert, 
  Zap, 
  Flame, 
  ChevronRight, 
  Plus, 
  X, 
  Crosshair, 
  RotateCcw, 
  Check, 
  Eye, 
  Wind, 
  ShieldCheck, 
  HelpCircle, 
  Clock 
} from 'lucide-react';
import { useStore } from '../../store';
import { requestRoll } from '../dice/rollBus';
import { Item, Spell } from '../../types';
import { formatModifier } from '../../utils';
import { getWeaponIcon, getSpellIcon } from '../ui/GameIcons';
import { OrnateCardFrame } from '../common/OrnateCardFrame';

interface PlayerCombatActionBarProps {
  isCurrentTurn?: boolean;
  onSelectInspect?: (data: { weapon?: Item; spell?: Spell }) => void;
  className?: string;
}

export function PlayerCombatActionBar({
  isCurrentTurn = false,
  onSelectInspect,
  className = ''
}: PlayerCombatActionBarProps) {
  const {
    character,
    spendSpellSlot,
    recoverSpellSlot,
    getProficiencyBonus,
    getSpellSaveDC,
    getSpellAttackBonus,
    getAbilityModifier,
    setActiveConcentration,
    setArmoryOpen,
    setGrimoireOpen
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<'attack' | 'spells' | 'items' | 'tactical'>('attack');
  const [advStates, setAdvStates] = useState<Record<string, 'none' | 'adv' | 'dis'>>({});
  const [critStates, setCritStates] = useState<Record<string, boolean>>({});

  const profBonus = getProficiencyBonus();
  const spellSaveDC = getSpellSaveDC();
  const spellAtkBonus = getSpellAttackBonus();
  const strMod = getAbilityModifier('str');
  const dexMod = getAbilityModifier('dex');

  // Weapons & Spells
  const readiedWeapons = character.inventory.filter(i => i.type === 'weapon' && i.isReadiedInCombat);
  const readiedSpells = character.spells.filter(s => s.isReadiedInCombat);
  const combatConsumables = character.inventory.filter(i => 
    i.type === 'consumable' || 
    (i.description && (i.description.toLowerCase().includes('potion') || i.description.toLowerCase().includes('heal')))
  );

  const getWeaponDefaultMod = (weapon: Item) => {
    const isFinesse = weapon.description?.toLowerCase().includes('finesse') || weapon.properties?.includes('finesse') || weapon.weaponProperties?.some(p => p.toLowerCase().includes('finesse'));
    const isRanged = weapon.range && !weapon.range.startsWith('5') && !weapon.range.startsWith('Reach');
    if (isRanged) return dexMod;
    if (isFinesse) return Math.max(strMod, dexMod);
    return strMod;
  };

  const toggleAdvState = (id: string) => {
    setAdvStates(prev => {
      const current = prev[id] || 'none';
      if (current === 'none') return { ...prev, [id]: 'adv' };
      if (current === 'adv') return { ...prev, [id]: 'dis' };
      return { ...prev, [id]: 'none' };
    });
  };

  const toggleCrit = (id: string) => {
    setCritStates(prev => ({ ...prev, [id]: !prev[id] }));
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
    const isCrit = critStates[weapon.id] || false;
    const defaultMod = getWeaponDefaultMod(weapon);
    const bonus = weapon.damageBonus ?? defaultMod;
    const baseDice = weapon.damageDice || '1d8';
    
    let rollCommand = baseDice;
    if (isCrit) {
      const match = baseDice.match(/^(\d+)d(\d+)(.*)$/);
      if (match) {
        const count = parseInt(match[1], 10) * 2;
        rollCommand = `${count}d${match[2]}${match[3]}`;
      } else {
        rollCommand = `${baseDice}+${baseDice}`;
      }
    }

    const sign = bonus >= 0 ? '+' : '';
    const formula = bonus !== 0 ? `${rollCommand}${sign}${bonus}` : rollCommand;
    
    requestRoll({
      command: formula,
      label: `${weapon.name} Damage ${isCrit ? '(CRITICAL!)' : ''}`
    });
  };

  const handleCastSpellAttack = (spell: Spell) => {
    const sign = spellAtkBonus >= 0 ? '+' : '';
    requestRoll({
      command: `1d20${sign}${spellAtkBonus}`,
      label: `${spell.name} Spell Attack`
    });
  };

  const handleCastSpellSave = (spell: Spell) => {
    const saveAttr = spell.saveRequired || 'dex';
    requestRoll({
      command: `1d20`,
      label: `${spell.name} Save (DC ${spellSaveDC} ${saveAttr.toUpperCase()})`
    });
  };

  const handleCastSpellDamage = (spell: Spell) => {
    if (spell.damageDice) {
      requestRoll({
        command: spell.damageDice,
        label: `${spell.name} Effect / Damage`
      });
    }
  };

  const handleTacticalAction = (actionName: string, description: string, rollCmd?: string) => {
    if (rollCmd) {
      requestRoll({
        command: rollCmd,
        label: `Action: ${actionName}`
      });
    } else {
      requestRoll({
        command: '1d20',
        label: `Tactical Action: ${actionName} (${description})`
      });
    }
  };

  return (
    <div className={`relative flex flex-col gap-3 p-3.5 sm:p-4 washi-card ${
      isCurrentTurn ? 'glow-active-turn border-2' : ''
    } select-none overflow-hidden ${className}`}>
      
      {/* Ornate Frame Chrome Overlay */}
      <OrnateCardFrame variant="standard" cornerSize={20} showRails={false} />

      {/* Active Turn Banner */}
      {isCurrentTurn && (
        <div className="relative z-10 flex items-center justify-between px-3 py-1.5 bg-black/5 border border-[var(--accent-ink)] rounded">
          <div className="flex items-center gap-2 text-[#161616] font-display text-xs sm:text-sm font-extrabold uppercase tracking-widest glow-active-text">
            <Sparkles size={14} />
            <span>Your Turn — Select Combat Action</span>
          </div>
          <span className="text-[10px] font-mono text-[#4a4a4a] font-bold uppercase tracking-wider">
            Active Hero
          </span>
        </div>
      )}

      {/* Primary Category Selector */}
      <div className="grid grid-cols-4 gap-2 z-10">
        <button
          onClick={() => setActiveCategory('attack')}
          className={`py-2 px-1 sm:px-3 rounded font-display text-xs uppercase tracking-wider font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'attack'
              ? 'bg-red-50 border border-red-400 text-red-700 scale-102'
              : 'bg-white border border-black/15 text-[#4a4a4a] hover:text-[#161616] hover:border-[var(--accent-ink)]'
          }`}
        >
          <Swords size={15} className={activeCategory === 'attack' ? 'text-red-600' : 'text-[#4a4a4a]'} />
          <span>Attack</span>
          <span className="text-[10px] text-[#777777] font-mono hidden sm:inline">({readiedWeapons.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('spells')}
          className={`py-2 px-1 sm:px-3 rounded font-display text-xs uppercase tracking-wider font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'spells'
              ? 'bg-purple-50 border border-purple-400 text-purple-700 scale-102'
              : 'bg-white border border-black/15 text-[#4a4a4a] hover:text-[#161616] hover:border-[var(--accent-ink)]'
          }`}
        >
          <Sparkles size={15} className={activeCategory === 'spells' ? 'text-purple-600' : 'text-[#4a4a4a]'} />
          <span>Spells</span>
          <span className="text-[10px] text-[#777777] font-mono hidden sm:inline">({readiedSpells.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('items')}
          className={`py-2 px-1 sm:px-3 rounded font-display text-xs uppercase tracking-wider font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'items'
              ? 'bg-amber-50 border border-amber-400 text-amber-700 scale-102'
              : 'bg-white border border-black/15 text-[#4a4a4a] hover:text-[#161616] hover:border-[var(--accent-ink)]'
          }`}
        >
          <Package size={15} className={activeCategory === 'items' ? 'text-amber-600' : 'text-[#4a4a4a]'} />
          <span>Items</span>
          <span className="text-[10px] text-[#777777] font-mono hidden sm:inline">({combatConsumables.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('tactical')}
          className={`py-2 px-1 sm:px-3 rounded font-display text-xs uppercase tracking-wider font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'tactical'
              ? 'bg-sky-50 border border-sky-400 text-sky-700 scale-102'
              : 'bg-white border border-black/15 text-[#4a4a4a] hover:text-[#161616] hover:border-[var(--accent-ink)]'
          }`}
        >
          <ShieldAlert size={15} className={activeCategory === 'tactical' ? 'text-sky-600' : 'text-[#4a4a4a]'} />
          <span>Tactics</span>
        </button>
      </div>

      {/* Dynamic Content Panel for the Active Category */}
      <div className="washi-subcard rounded p-2.5 sm:p-3 min-h-[160px] max-h-[300px] overflow-y-auto custom-scrollbar z-10">
        
        {/* 1. WEAPONS ATTACK DECK */}
        {activeCategory === 'attack' && (
          <div className="flex flex-col gap-2">
            {readiedWeapons.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center gap-2 text-[#777777]">
                <Swords size={24} className="text-black/20" />
                <p className="font-serif text-xs italic">No weapons currently readied in combat slots.</p>
                <button
                  onClick={() => setArmoryOpen(true)}
                  className="sumie-btn-secondary"
                >
                  Open Armory to Ready Weapons
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {readiedWeapons.map((weapon) => {
                  const defaultMod = getWeaponDefaultMod(weapon);
                  const bonus = weapon.attackBonus ?? (profBonus + defaultMod);
                  const adv = advStates[weapon.id] || 'none';
                  const isCrit = critStates[weapon.id] || false;

                  return (
                    <div
                      key={weapon.id}
                      className="p-2.5 bg-white border border-black/10 rounded flex flex-col justify-between gap-2 shadow-sm hover:border-black/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-white border border-black/15 rounded text-[#4a4a4a]">
                            {getWeaponIcon(weapon)}
                          </div>
                          <div>
                            <strong className="font-display text-xs text-[#161616] block font-bold">
                              {weapon.name}
                            </strong>
                            <span className="text-[10px] text-[#777777] font-mono">
                              {weapon.damageDice || '1d8'} • {weapon.range || '5 ft'}
                            </span>
                          </div>
                        </div>

                        {/* Adv / Crit Toggles */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleAdvState(weapon.id)}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              adv === 'adv'
                                ? 'bg-emerald-50 border border-emerald-400 text-emerald-700'
                                : adv === 'dis'
                                ? 'bg-red-50 border border-red-400 text-red-700'
                                : 'bg-white border border-black/15 text-[#777777] hover:border-[var(--accent-ink)]'
                            }`}
                            title="Toggle Advantage / Disadvantage"
                          >
                            {adv === 'adv' ? 'ADV' : adv === 'dis' ? 'DIS' : 'NORM'}
                          </button>

                          <button
                            onClick={() => toggleCrit(weapon.id)}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              isCrit
                                ? 'bg-[#161616] border border-[#161616] text-white animate-pulse'
                                : 'bg-white border border-black/15 text-[#777777] hover:border-[var(--accent-ink)]'
                            }`}
                            title="Toggle Critical Hit"
                          >
                            CRIT
                          </button>
                        </div>
                      </div>

                      {/* Roll Buttons */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleWeaponAttack(weapon)}
                          className="py-1 px-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-400 rounded text-[11px] font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Crosshair size={11} />
                          <span>Hit ({formatModifier(bonus)})</span>
                        </button>

                        <button
                          onClick={() => handleWeaponDamage(weapon)}
                          className="sumie-btn-secondary !justify-center"
                        >
                          <Flame size={11} className="text-amber-600" />
                          <span>Dmg ({weapon.damageDice || '1d8'})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. SPELLS CASTING DECK */}
        {activeCategory === 'spells' && (
          <div className="flex flex-col gap-2">
            {readiedSpells.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center gap-2 text-[#777777]">
                <Sparkles size={24} className="text-black/20" />
                <p className="font-serif text-xs italic">No spells currently readied in combat slots.</p>
                <button
                  onClick={() => setGrimoireOpen(true)}
                  className="sumie-btn-secondary"
                >
                  Open Grimoire to Ready Spells
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {readiedSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="p-2.5 bg-white border border-black/10 rounded flex flex-col justify-between gap-2 shadow-sm hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white border border-purple-200 rounded text-purple-600">
                          {getSpellIcon(spell)}
                        </div>
                        <div>
                          <strong className="font-display text-xs text-[#161616] block font-bold">
                            {spell.name}
                          </strong>
                          <span className="text-[10px] text-purple-600 font-mono">
                            {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.castingTime || '1 Action'}
                          </span>
                        </div>
                      </div>

                      {spell.concentration && (
                        <span className="px-1.5 py-0.2 bg-purple-50 border border-purple-300 text-purple-700 rounded text-[9px] font-mono font-bold">
                          CONC
                        </span>
                      )}
                    </div>

                    {/* Spell Actions Grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {spell.damageDice ? (
                        <button
                          onClick={() => handleCastSpellDamage(spell)}
                          className="py-1 px-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-400 rounded text-[11px] font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Zap size={11} />
                          <span>Cast ({spell.damageDice})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCastSpellAttack(spell)}
                          className="py-1 px-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-400 rounded text-[11px] font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Crosshair size={11} />
                          <span>Atk ({formatModifier(spellAtkBonus)})</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCastSpellSave(spell)}
                        className="sumie-btn-secondary !justify-center"
                      >
                        <ShieldCheck size={11} />
                        <span>DC {spellSaveDC} {(spell.saveRequired || 'Save').toString().toUpperCase()}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. COMBAT ITEMS & CONSUMABLES */}
        {activeCategory === 'items' && (
          <div className="flex flex-col gap-2">
            {combatConsumables.length === 0 ? (
              <div className="text-center py-6 text-[#777777] font-serif text-xs italic">
                No combat consumables or potions detected in inventory.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {combatConsumables.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white border border-black/10 rounded flex items-center justify-between gap-2"
                  >
                    <div>
                      <strong className="font-display text-xs text-[#161616] block font-bold">
                        {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                      </strong>
                      <span className="text-[10px] text-[#777777] font-serif italic truncate max-w-[160px] block">
                        {item.description || 'Consumable item'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        requestRoll({
                          command: '2d4+2',
                          label: `Used Item: ${item.name}`
                        });
                      }}
                      className="sumie-btn-secondary shrink-0"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. STANDARD 5E TACTICAL ACTIONS */}
        {activeCategory === 'tactical' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleTacticalAction('Dash', 'Double movement speed for the current turn')}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-sky-400 rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-sky-600 font-display text-xs uppercase tracking-wider font-bold">
                <Wind size={13} />
                <span>Dash</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                Double movement speed this turn.
              </span>
            </button>

            <button
              onClick={() => handleTacticalAction('Disengage', 'Movement provokes no opportunity attacks')}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-emerald-400 rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 font-display text-xs uppercase tracking-wider font-bold">
                <ShieldAlert size={13} />
                <span>Disengage</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                No opportunity attacks provoked.
              </span>
            </button>

            <button
              onClick={() => handleTacticalAction('Dodge', 'Attacks vs you have DIS; DEX saves have ADV')}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-amber-400 rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-amber-600 font-display text-xs uppercase tracking-wider font-bold">
                <ShieldCheck size={13} />
                <span>Dodge</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                Attacks vs you have Disadvantage.
              </span>
            </button>

            <button
              onClick={() => handleTacticalAction('Hide', 'Stealth check vs passive perception', `1d20+${dexMod + profBonus}`)}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-purple-400 rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-purple-600 font-display text-xs uppercase tracking-wider font-bold">
                <Eye size={13} />
                <span>Hide (Stealth)</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                Roll Stealth check (+{dexMod + profBonus}).
              </span>
            </button>

            <button
              onClick={() => handleTacticalAction('Help', 'Grant ally advantage on their next attack or ability check')}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-rose-400 rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-rose-600 font-display text-xs uppercase tracking-wider font-bold">
                <HelpCircle size={13} />
                <span>Help Ally</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                Give ally Advantage on next check/attack.
              </span>
            </button>

            <button
              onClick={() => handleTacticalAction('Ready Action', 'Prepare a reaction triggered by a specific event')}
              className="p-2.5 bg-white hover:bg-black/5 border border-black/10 hover:border-[var(--accent-ink)] rounded text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-[#4a4a4a] font-display text-xs uppercase tracking-wider font-bold">
                <Clock size={13} />
                <span>Ready Action</span>
              </div>
              <span className="text-[10px] text-[#777777] font-serif block mt-0.5">
                Prepare reaction for a trigger.
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
