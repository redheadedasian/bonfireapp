import React from 'react';
import { useStore } from '../../store';
import { Spell, Item } from '../../types';
import { requestRoll } from '../dice/rollBus';
import { Sparkles, Swords, Zap, X, Shield, Clock, Compass, BookOpen, AlertCircle } from 'lucide-react';

interface QuickInspectModalProps {
  spell?: Spell | null;
  weapon?: Item | null;
  onClose: () => void;
  onCastSpell?: (spell: Spell, upcastLevel?: number) => void;
  onAttackWeapon?: (weapon: Item) => void;
}

export function QuickInspectModal({ spell, weapon, onClose, onCastSpell, onAttackWeapon }: QuickInspectModalProps) {
  const { setActiveConcentration, character, getSpellAttackBonus, getSpellSaveDC, getProficiencyBonus } = useStore();

  if (!spell && !weapon) return null;

  const profBonus = getProficiencyBonus();
  const spellAtk = getSpellAttackBonus();
  const spellDC = getSpellSaveDC();

  const handleConcentrate = () => {
    if (spell) {
      setActiveConcentration({
        spellId: spell.id,
        spellName: spell.name,
        level: spell.level,
        school: spell.school,
        duration: spell.duration
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl overflow-hidden text-[#161616]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#141414]/15 bg-white/90">
          <div className="flex items-center gap-2.5">
            {spell ? (
              <Sparkles size={18} className="text-[var(--accent-ink)]" />
            ) : (
              <Swords size={18} className="text-[var(--accent-ink)]" />
            )}
            <div className="flex flex-col">
              <h3 className="font-display font-bold text-base tracking-widest text-[#161616] uppercase">
                {spell ? spell.name : weapon?.name}
              </h3>
              <span className="text-[10px] font-display text-[#555555] uppercase tracking-wider font-semibold">
                {spell
                  ? `${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • ${spell.school || 'Evocation'}`
                  : `${weapon?.rarity || 'Common'} • ${weapon?.damageType || 'Weapon'}`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#555555] hover:text-[#161616] hover:bg-black/5 rounded transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto hide-scrollbar">
          
          {/* Quick Metrics Grid */}
          {spell ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-[#141414]/15 text-center shadow-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Casting Time</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">{spell.castingTime || '1 Action'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Range / Area</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">{spell.range || 'Touch'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Components</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">{spell.components || 'V, S'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Duration</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">{spell.duration || 'Instant'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-[#141414]/15 text-center shadow-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Damage</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">
                  {weapon?.damageDice} {weapon?.damageBonus ? `+${weapon.damageBonus}` : ''}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Attack Bonus</span>
                <span className="font-serif text-xs font-bold text-[var(--accent-ink)] mt-0.5">
                  +{weapon?.attackBonus ?? 8} to hit
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-display uppercase tracking-wider text-[#777777] font-bold">Range</span>
                <span className="font-serif text-xs font-bold text-[#161616] mt-0.5">{weapon?.range || '5 ft.'}</span>
              </div>
            </div>
          )}

          {/* Spell Tags (Concentration, Ritual, Save DC) */}
          {spell && (
            <div className="flex flex-wrap gap-2 items-center">
              {spell.concentration && (
                <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-display uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Zap size={11} /> Requires Concentration
                </span>
              )}
              {spell.ritual && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-display uppercase tracking-wider font-bold">
                  Ritual Spell
                </span>
              )}
              {spell.spellCategory === 'save' && (
                <span className="px-2.5 py-0.5 rounded bg-black/5 border border-black/20 text-[#161616] text-[10px] font-display uppercase tracking-wider font-bold">
                  Spell Save DC: {spellDC} ({spell.saveRequired?.toUpperCase() || 'WIS'})
                </span>
              )}
              {spell.spellCategory === 'attack' && (
                <span className="px-2.5 py-0.5 rounded bg-black/5 border border-black/20 text-[#161616] text-[10px] font-display uppercase tracking-wider font-bold">
                  Spell Attack: +{spellAtk}
                </span>
              )}
            </div>
          )}

          {/* Weapon Properties */}
          {weapon?.weaponProperties && weapon.weaponProperties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {weapon.weaponProperties.map((prop, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-black/5 border border-black/15 text-[#444444] text-[10px] font-display uppercase tracking-wider font-semibold"
                >
                  {prop}
                </span>
              ))}
            </div>
          )}

          {/* Detailed Description / Rules Text */}
          <div className="flex flex-col gap-1.5 bg-white p-4 rounded-lg border border-[#141414]/15 shadow-xs">
            <span className="text-[10px] font-display uppercase tracking-widest text-[#777777] font-bold">
              Description & Rules
            </span>
            <p className="font-serif text-xs sm:text-sm text-[#2a2a2a] leading-relaxed whitespace-pre-line">
              {spell ? spell.description || 'No detailed spell description provided.' : weapon?.description || 'No weapon description provided.'}
            </p>
          </div>

          {/* Actions & Rollers */}
          <div className="flex flex-wrap justify-end gap-2.5 pt-2 border-t border-[#141414]/15">
            {spell?.concentration && (
              <button
                onClick={handleConcentrate}
                className="sumie-btn-secondary"
              >
                <Zap size={13} />
                <span>Concentrate on Spell</span>
              </button>
            )}

            {spell && onCastSpell && (
              <button
                onClick={() => {
                  onCastSpell(spell);
                  onClose();
                }}
                className="sumie-btn-primary"
              >
                <Sparkles size={14} />
                <span>Cast Spell</span>
              </button>
            )}

            {weapon && onAttackWeapon && (
              <button
                onClick={() => {
                  onAttackWeapon(weapon);
                  onClose();
                }}
                className="sumie-btn-primary"
              >
                <Swords size={14} />
                <span>Attack with {weapon.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
