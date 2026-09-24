import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CharacterState, INITIAL_CHARACTER, Ability, Skill, ProficiencyLevel, Spell, Item, AccentColorKey, LedgerEntry } from './types';
import { findBestMatchingIcon } from './components/ui/GameIcons';
import { safeCharacterStorage } from './services/characterStorage';

interface BonfireStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGrimoireOpen: boolean;
  setGrimoireOpen: (open: boolean) => void;
  isArmoryOpen: boolean;
  setArmoryOpen: (open: boolean) => void;
  isEditMode: boolean;
  setEditMode: (edit: boolean) => void;
  
  // Spell Actions
  addSpell: (spell: Partial<Spell>) => void;
  updateSpell: (id: string, updates: Partial<Spell>) => void;
  deleteSpell: (id: string) => void;
  togglePrepareSpell: (id: string) => { success: boolean; message?: string };
  toggleReadySpell: (id: string) => { success: boolean; message?: string };
  
  // Inventory Actions
  addInventoryItem: (item: Partial<Item>) => void;
  updateInventoryItem: (id: string, updates: Partial<Item>) => void;
  deleteInventoryItem: (id: string) => void;
  toggleReadyWeapon: (id: string) => { success: boolean; message?: string };
  
  // Character Profile
  setAccentColor: (accentColor: AccentColorKey, customHex?: string) => void;
  setPortraitUrl: (url: string) => void;
  setHeroUrl: (url: string) => void;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date'> & Partial<Pick<LedgerEntry, 'id' | 'date'>>) => void;
  updateCharacterField: <K extends keyof CharacterState>(field: K, value: CharacterState[K]) => void;
  toggleSavingThrowProficiency: (ability: Ability, level: ProficiencyLevel) => void;
  updateSavingThrowBonus: (ability: Ability, bonus: number) => void;
  updateHP: (amount: number, type: 'damage' | 'heal' | 'temp') => void;
  updateAbility: (ability: Ability, score: number) => void;
  toggleSkillProficiency: (skill: Skill, level: ProficiencyLevel) => void;
  updateSkillBonus: (skill: Skill, bonus: number) => void;
  updateSkillAbility: (skill: Skill, ability: Ability) => void;
  updateCurrency: (type: keyof CharacterState['currency'], amount: number) => void;
  setCurrencyDirect: (type: keyof CharacterState['currency'], value: number) => void;
  spendSpellSlot: (level: number) => void;
  recoverSpellSlot: (level: number) => void;
  updateSpellSlotMax: (level: number, max: number) => void;
  updateSpellSlotCurrent: (level: number, current: number) => void;
  addFeature: (feature: Partial<CharacterState['features'][0]>) => void;
  updateFeature: (id: string, updates: Partial<CharacterState['features'][0]>) => void;
  deleteFeature: (id: string) => void;
  resetCharacterToDefault: () => void;

  // Rest & Active Combat State
  performShortRest: (spentHitDiceCount: number, hpRegained: number) => void;
  performLongRest: () => void;
  setActiveConcentration: (concentration: CharacterState['activeConcentration']) => void;
  rollDeathSave: (customRoll?: number) => { roll: number; outcome: 'success' | 'failure' | 'crit_success' | 'crit_failure' };

  character: CharacterState;
  
  // Derived Helpers
  getModifier: (score: number) => number;
  getProficiencyBonus: () => number;
  getAbilityModifier: (ability: Ability) => number;
  getSkillModifier: (skill: Skill) => number;
  getSavingThrowModifier: (ability: Ability) => number;
  getSpellSaveDC: () => number;
  getSpellAttackBonus: () => number;
  getPassiveSense: (skill: 'perception' | 'investigation' | 'insight') => number;
  getMaxPreparedSpells: () => number;
  getPreparedSpellsCount: () => number;
  getReadiedWeaponsCount: () => number;
  getReadiedSpellsCount: () => number;
}

export const useStore = create<BonfireStore>()(
  persist(
    (set, get) => ({
      character: INITIAL_CHARACTER,
      activeTab: 'HOME',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isGrimoireOpen: false,
      setGrimoireOpen: (open) => set({ isGrimoireOpen: open }),
      isArmoryOpen: false,
      setArmoryOpen: (open) => set({ isArmoryOpen: open }),
      isEditMode: false,
      setEditMode: (edit) => set({ isEditMode: edit }),

      resetCharacterToDefault: () => set({ character: INITIAL_CHARACTER }),

      addSpell: (spell) => {
        const spellName = spell.name || 'New Spell';
        const matchedIcon = spell.iconUrl || findBestMatchingIcon(spellName, 'spell');
        set(state => ({
          character: {
            ...state.character,
            spells: [
              ...state.character.spells,
              {
                id: 's-' + Math.random().toString(36).substr(2, 9),
                name: spellName,
                level: 1,
                school: 'Evocation',
                castingTime: '1 Action',
                range: '30 ft',
                components: 'V, S',
                duration: 'Instantaneous',
                description: '',
                prepared: true,
                isPrepared: true,
                isReadiedInCombat: false,
                concentration: false,
                ritual: false,
                iconUrl: matchedIcon,
                ...spell
              } as Spell
            ]
          }
        }));
      },

      deleteSpell: (id) => set(state => ({
        character: {
          ...state.character,
          spells: state.character.spells.filter(s => s.id !== id)
        }
      })),

      updateSpell: (id, updates) => set(state => ({
        character: {
          ...state.character,
          spells: state.character.spells.map(s => {
            if (s.id !== id) return s;
            const updated = { ...s, ...updates };
            if (updates.prepared !== undefined) updated.isPrepared = updates.prepared;
            if (updates.isPrepared !== undefined) updated.prepared = updates.isPrepared;
            // If unprepared, cannot be readied in combat HUD
            if (updated.prepared === false) {
              updated.isReadiedInCombat = false;
            }
            return updated;
          })
        }
      })),

      togglePrepareSpell: (id: string) => {
        const spell = get().character.spells.find(s => s.id === id);
        if (!spell) return { success: false, message: "Spell not found" };
        
        const nextState = !spell.prepared;
        // If preparing, check limit for non-cantrips
        if (nextState && spell.level > 0) {
          const maxPrepared = get().getMaxPreparedSpells();
          const currentPrepared = get().character.spells.filter(s => s.level > 0 && s.prepared).length;
          if (currentPrepared >= maxPrepared) {
            return {
              success: false,
              message: `Maximum prepared spells limit (${maxPrepared}) reached. Unprepare another spell first.`
            };
          }
        }

        get().updateSpell(id, {
          prepared: nextState,
          isPrepared: nextState,
          isReadiedInCombat: nextState ? spell.isReadiedInCombat : false
        });
        return { success: true };
      },

      toggleReadySpell: (id: string) => {
        const spell = get().character.spells.find(s => s.id === id);
        if (!spell) return { success: false, message: "Spell not found" };

        if (!spell.isReadiedInCombat) {
          // Must be prepared first
          if (!spell.prepared) {
            return {
              success: false,
              message: "You must prepare this spell before readying it for Combat HUD."
            };
          }
          const readiedCount = get().getReadiedSpellsCount();
          if (readiedCount >= 6) {
            return {
              success: false,
              message: "Maximum 6 combat spells can be readied at once. Unready a spell first."
            };
          }
          get().updateSpell(id, { isReadiedInCombat: true });
          return { success: true };
        } else {
          get().updateSpell(id, { isReadiedInCombat: false });
          return { success: true };
        }
      },

      addInventoryItem: (item) => {
        const itemName = item.name || 'New Item';
        const itemCat = item.type || 'gear';
        const matchedIcon = item.iconUrl || findBestMatchingIcon(itemName, itemCat);
        set(state => ({
          character: {
            ...state.character,
            inventory: [
              ...state.character.inventory,
              {
                id: 'i-' + Math.random().toString(36).substr(2, 9),
                name: itemName,
                description: "",
                weight: 0,
                quantity: 1,
                rarity: "Common",
                equipped: false,
                attuned: false,
                requiresAttunement: false,
                type: "gear",
                isReadiedInCombat: false,
                iconUrl: matchedIcon,
                ...item
              } as Item
            ]
          }
        }));
      },

      updateInventoryItem: (id, updates) => set(state => ({
        character: {
          ...state.character,
          inventory: state.character.inventory.map(i => i.id === id ? { ...i, ...updates } : i)
        }
      })),

      deleteInventoryItem: (id) => set(state => ({
        character: {
          ...state.character,
          inventory: state.character.inventory.filter(i => i.id !== id)
        }
      })),

      toggleReadyWeapon: (id: string) => {
        const item = get().character.inventory.find(i => i.id === id);
        if (!item) return { success: false, message: "Item not found" };
        if (item.type !== 'weapon') return { success: false, message: "Only weapons can be readied in weapon slots" };

        if (!item.isReadiedInCombat) {
          const currentReadied = get().getReadiedWeaponsCount();
          if (currentReadied >= 4) {
            return {
              success: false,
              message: "Maximum 4 weapons can be readied for combat at once. Unready a weapon first."
            };
          }
          get().updateInventoryItem(id, { isReadiedInCombat: true, equipped: true });
          return { success: true };
        } else {
          get().updateInventoryItem(id, { isReadiedInCombat: false });
          return { success: true };
        }
      },

      setAccentColor: (accentColor, customHex) => set((state) => ({
        character: {
          ...state.character,
          theme: {
            accentColor,
            customHex,
          }
        }
      })),
      setPortraitUrl: (url) => set((state) => ({ character: { ...state.character, portraitUrl: url } })),
      setHeroUrl: (url) => set((state) => ({ character: { ...state.character, heroUrl: url } })),
      
      toggleSavingThrowProficiency: (ability, level) => set((state) => ({
        character: {
          ...state.character,
          abilities: {
            ...state.character.abilities,
            [ability]: { ...state.character.abilities[ability], savingThrowProficiency: level }
          }
        }
      })),

      updateSavingThrowBonus: (ability, bonus) => set((state) => ({
        character: {
          ...state.character,
          abilities: {
            ...state.character.abilities,
            [ability]: { ...state.character.abilities[ability], customBonus: bonus }
          }
        }
      })),

      addLedgerEntry: (entry) => set((state) => {
        const newEntry = { ...entry, id: Math.random().toString(), date: Date.now() };
        const newCurrency = { ...state.character.currency };
        if (entry.type === 'expense') {
          newCurrency[entry.currency] = Math.max(0, (newCurrency[entry.currency] || 0) - entry.amount);
        } else {
          newCurrency[entry.currency] = (newCurrency[entry.currency] || 0) + entry.amount;
        }
        return {
          character: {
            ...state.character,
            ledger: [newEntry, ...(state.character.ledger || [])],
            currency: newCurrency
          }
        };
      }),

      updateCharacterField: (field, value) => set((state) => ({
        character: { ...state.character, [field]: value }
      })),

      updateHP: (amount, type) => set((state) => {
        const hp = { ...state.character.hp };
        if (type === 'damage') {
          if (hp.temp > 0) {
            if (amount <= hp.temp) {
              hp.temp -= amount;
              amount = 0;
            } else {
              amount -= hp.temp;
              hp.temp = 0;
            }
          }
          hp.current = Math.max(0, hp.current - amount);
        } else if (type === 'heal') {
          hp.current = Math.min(hp.max, hp.current + amount);
          if (hp.current > 0) {
            return {
              character: {
                ...state.character,
                hp,
                deathSaves: { successes: 0, failures: 0 }
              }
            };
          }
        } else if (type === 'temp') {
          hp.temp = Math.max(hp.temp, amount);
        }
        return { character: { ...state.character, hp } };
      }),
      
      updateAbility: (ability, score) => set((state) => ({
        character: {
          ...state.character,
          abilities: {
            ...state.character.abilities,
            [ability]: { ...state.character.abilities[ability], score }
          }
        }
      })),
      
      toggleSkillProficiency: (skill, level) => set((state) => ({
        character: {
          ...state.character,
          skills: {
            ...state.character.skills,
            [skill]: { ...state.character.skills[skill], proficiency: level }
          }
        }
      })),

      updateSkillBonus: (skill, bonus) => set((state) => ({
        character: {
          ...state.character,
          skills: {
            ...state.character.skills,
            [skill]: { ...state.character.skills[skill], customBonus: bonus }
          }
        }
      })),

      updateSkillAbility: (skill, ability) => set((state) => ({
        character: {
          ...state.character,
          skills: {
            ...state.character.skills,
            [skill]: { ...state.character.skills[skill], ability }
          }
        }
      })),
      
      updateCurrency: (type, amount) => set((state) => ({
        character: {
          ...state.character,
          currency: {
            ...state.character.currency,
            [type]: Math.max(0, (state.character.currency[type] || 0) + amount)
          }
        }
      })),

      setCurrencyDirect: (type, value) => set((state) => ({
        character: {
          ...state.character,
          currency: {
            ...state.character.currency,
            [type]: Math.max(0, value)
          }
        }
      })),
      
      spendSpellSlot: (level) => set((state) => {
        const slot = state.character.spellSlots[level];
        if (!slot || slot.current <= 0) return state;
        return {
          character: {
            ...state.character,
            spellSlots: {
              ...state.character.spellSlots,
              [level]: { ...slot, current: slot.current - 1 }
            }
          }
        };
      }),
      
      recoverSpellSlot: (level) => set((state) => {
        const slot = state.character.spellSlots[level];
        if (!slot || slot.current >= slot.max) return state;
        return {
          character: {
            ...state.character,
            spellSlots: {
              ...state.character.spellSlots,
              [level]: { ...slot, current: slot.current + 1 }
            }
          }
        };
      }),

      updateSpellSlotMax: (level, max) => set((state) => {
        const slot = state.character.spellSlots[level] || { current: 0, max: 0 };
        const safeMax = Math.max(0, max);
        return {
          character: {
            ...state.character,
            spellSlots: {
              ...state.character.spellSlots,
              [level]: {
                ...slot,
                max: safeMax,
                current: Math.min(slot.current, safeMax)
              }
            }
          }
        };
      }),

      updateSpellSlotCurrent: (level, current) => set((state) => {
        const slot = state.character.spellSlots[level] || { current: 0, max: 0 };
        return {
          character: {
            ...state.character,
            spellSlots: {
              ...state.character.spellSlots,
              [level]: {
                ...slot,
                current: Math.max(0, Math.min(current, slot.max))
              }
            }
          }
        };
      }),

      addFeature: (feature) => set((state) => ({
        character: {
          ...state.character,
          features: [
            ...state.character.features,
            {
              id: 'f-' + Math.random().toString(36).substr(2, 9),
              name: 'New Feature',
              description: '',
              source: 'Class',
              ...feature
            }
          ]
        }
      })),

      updateFeature: (id, updates) => set((state) => ({
        character: {
          ...state.character,
          features: state.character.features.map(f => f.id === id ? { ...f, ...updates } : f)
        }
      })),

      deleteFeature: (id) => set((state) => ({
        character: {
          ...state.character,
          features: state.character.features.filter(f => f.id !== id)
        }
      })),

      setActiveConcentration: (concentration) => set((state) => ({
        character: {
          ...state.character,
          activeConcentration: concentration
        }
      })),

      performShortRest: (spentHitDiceCount, hpRegained) => set((state) => {
        const nextHitDiceCurrent = Math.max(0, state.character.hitDice.current - spentHitDiceCount);
        const nextHpCurrent = Math.min(state.character.hp.max, state.character.hp.current + hpRegained);
        return {
          character: {
            ...state.character,
            hp: {
              ...state.character.hp,
              current: nextHpCurrent
            },
            hitDice: {
              ...state.character.hitDice,
              current: nextHitDiceCurrent
            }
          }
        };
      }),

      performLongRest: () => set((state) => {
        // 1. Recover full HP & clear temp HP
        const fullHp = {
          ...state.character.hp,
          current: state.character.hp.max,
          temp: 0
        };

        // 2. Restore all spell slots
        const restoredSpellSlots: Record<number, { max: number; current: number }> = {};
        Object.entries(state.character.spellSlots).forEach(([lvl, slot]) => {
          restoredSpellSlots[Number(lvl)] = {
            max: slot.max,
            current: slot.max
          };
        });

        // 3. Regain up to half total hit dice (min 1)
        const totalDiceMatch = state.character.hitDice.total.match(/^(\d+)d/i);
        const maxHitDice = totalDiceMatch ? parseInt(totalDiceMatch[1], 10) : state.character.level;
        const regainedDice = Math.max(1, Math.floor(maxHitDice / 2));
        const newHitDiceCurrent = Math.min(maxHitDice, state.character.hitDice.current + regainedDice);

        // 4. Reset death saves & drop concentration
        return {
          character: {
            ...state.character,
            hp: fullHp,
            spellSlots: restoredSpellSlots,
            hitDice: {
              ...state.character.hitDice,
              current: newHitDiceCurrent
            },
            deathSaves: {
              successes: 0,
              failures: 0
            },
            exhaustion: Math.max(0, (state.character.exhaustion || 0) - 1),
            activeConcentration: null
          }
        };
      }),

      rollDeathSave: (customRoll?: number) => {
        const roll = customRoll !== undefined ? customRoll : Math.floor(Math.random() * 20) + 1;
        const char = get().character;
        let outcome: 'success' | 'failure' | 'crit_success' | 'crit_failure' = 'failure';

        if (roll === 20) {
          outcome = 'crit_success';
          // Regain 1 HP and clear death saves
          set((state) => ({
            character: {
              ...state.character,
              hp: { ...state.character.hp, current: 1 },
              deathSaves: { successes: 0, failures: 0 }
            }
          }));
        } else if (roll === 1) {
          outcome = 'crit_failure';
          const newFailures = Math.min(3, char.deathSaves.failures + 2);
          set((state) => ({
            character: {
              ...state.character,
              deathSaves: { ...state.character.deathSaves, failures: newFailures }
            }
          }));
        } else if (roll >= 10) {
          outcome = 'success';
          const newSuccesses = Math.min(3, char.deathSaves.successes + 1);
          set((state) => ({
            character: {
              ...state.character,
              deathSaves: { ...state.character.deathSaves, successes: newSuccesses }
            }
          }));
        } else {
          outcome = 'failure';
          const newFailures = Math.min(3, char.deathSaves.failures + 1);
          set((state) => ({
            character: {
              ...state.character,
              deathSaves: { ...state.character.deathSaves, failures: newFailures }
            }
          }));
        }

        return { roll, outcome };
      },
      
      getModifier: (score: number) => Math.floor((score - 10) / 2),
      
      getProficiencyBonus: () => {
        const char = get().character;
        if (char.proficiencyBonusOverride !== undefined && char.proficiencyBonusOverride !== null) {
          return char.proficiencyBonusOverride;
        }
        const level = char.level || 1;
        return Math.ceil(level / 4) + 1;
      },
      
      getAbilityModifier: (ability: Ability) => {
        const score = get().character.abilities[ability]?.score || 10;
        return get().getModifier(score);
      },
      
      getSkillModifier: (skill: Skill) => {
        const skillData = get().character.skills[skill];
        if (!skillData) return 0;
        const abilityMod = get().getAbilityModifier(skillData.ability);
        const profBonus = get().getProficiencyBonus();
        let bonus = 0;
        if (skillData.proficiency === 'proficient') bonus = profBonus;
        else if (skillData.proficiency === 'expertise') bonus = profBonus * 2;
        return abilityMod + bonus + (skillData.customBonus || 0);
      },
      
      getSavingThrowModifier: (ability: Ability) => {
        const abilityData = get().character.abilities[ability];
        if (!abilityData) return 0;
        const abilityMod = get().getModifier(abilityData.score);
        const profBonus = get().getProficiencyBonus();
        let bonus = 0;
        if (abilityData.savingThrowProficiency === 'proficient') bonus = profBonus;
        else if (abilityData.savingThrowProficiency === 'expertise') bonus = profBonus * 2;
        return abilityMod + bonus + (abilityData.customBonus || 0);
      },
      
      getSpellSaveDC: () => {
        const ability = get().character.spellcastingAbility || 'wis';
        return 8 + get().getProficiencyBonus() + get().getAbilityModifier(ability);
      },
      
      getSpellAttackBonus: () => {
        const ability = get().character.spellcastingAbility || 'wis';
        return get().getProficiencyBonus() + get().getAbilityModifier(ability);
      },
      
      getPassiveSense: (skill: 'perception' | 'investigation' | 'insight') => {
        return 10 + get().getSkillModifier(skill);
      },

      getMaxPreparedSpells: () => {
        const level = get().character.level || 1;
        const ability = get().character.spellcastingAbility || 'wis';
        const spellMod = get().getAbilityModifier(ability);
        return Math.max(1, level + spellMod);
      },

      getPreparedSpellsCount: () => {
        return (get().character.spells || []).filter(s => s.level > 0 && s.prepared).length;
      },

      getReadiedWeaponsCount: () => {
        return (get().character.inventory || []).filter(i => i.type === 'weapon' && i.isReadiedInCombat).length;
      },

      getReadiedSpellsCount: () => {
        return (get().character.spells || []).filter(s => s.isReadiedInCombat).length;
      }
    }),
    {
      name: 'bonfire-character-storage-v2',
      storage: createJSONStorage(() => safeCharacterStorage),
      migrate: (persistedState: any) => {
        if (persistedState?.character?.species === 'Lolth-Sworn Drow' || persistedState?.character?.species?.includes('Lolth')) {
          persistedState.character.species = 'Mountain Dwarf';
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.character?.species === 'Lolth-Sworn Drow' || state?.character?.species?.includes('Lolth')) {
          state.character.species = 'Mountain Dwarf';
        }
      },
    }
  )
);
