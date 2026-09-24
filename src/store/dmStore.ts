import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeCharacterStorage } from '../services/characterStorage';
import { rollDie } from '../components/dice/random';
import { 
  InitiativeCombatant, 
  CombatState, 
  DmSecretRoll, 
  DmPrivateNote, 
  PartyPurchaseRequest,
  BattlefieldBackground
} from '../types/dm';
import { CurrencyType } from '../types/campaign';
import { Item } from '../types';

export const DEFAULT_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Concentration',
  'Exhaustion'
];

interface DmStoreState {
  combatState: CombatState;
  secretRolls: DmSecretRoll[];
  dmNotes: DmPrivateNote[];
  selectedCombatantId: string | null;
  battlefieldBackground: BattlefieldBackground;

  // Combat Actions
  startCombat: (initialCombatants?: InitiativeCombatant[]) => void;
  endCombat: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  rollAllInitiative: () => void;
  addCombatant: (combatant: Partial<InitiativeCombatant>) => void;
  updateCombatant: (id: string, updates: Partial<InitiativeCombatant>) => void;
  removeCombatant: (id: string) => void;
  toggleCombatantAction: (id: string, actionType: 'action' | 'bonusAction' | 'reaction' | 'movement') => void;
  applyHpAdjustment: (id: string, amount: number, type: 'damage' | 'heal' | 'temp') => void;
  toggleCondition: (id: string, condition: string) => void;
  selectCombatant: (id: string | null) => void;
  setBattlefieldBackground: (background: BattlefieldBackground) => void;

  // Secret Dice Roller
  performSecretRoll: (command: string, label?: string) => DmSecretRoll;
  toggleRevealRoll: (rollId: string) => void;
  clearRollHistory: () => void;

  // Shrouded DM Notes
  addDmNote: (note: Partial<DmPrivateNote>) => void;
  updateDmNote: (id: string, updates: Partial<DmPrivateNote>) => void;
  deleteDmNote: (id: string) => void;
  togglePinDmNote: (id: string) => void;
}

export const useDmStore = create<DmStoreState>()(
  persist(
    (set, get) => ({
      combatState: {
        inCombat: false,
        round: 1,
        turnIndex: 0,
        combatants: [
          {
            id: 'cb-1',
            name: 'Thorin Ironforge',
            type: 'player',
            initiativeRoll: 14,
            hpCurrent: 88,
            hpMax: 96,
            tempHp: 5,
            ac: 21,
            speed: 25,
            passivePerception: 18,
            conditions: [],
            concentration: false,
            deathSaves: { successes: 0, failures: 0 },
            isCurrentTurn: true,
            characterRefId: 'pm-1'
          },
          {
            id: 'cb-2',
            name: 'Vespera Nightshade',
            type: 'player',
            initiativeRoll: 22,
            hpCurrent: 58,
            hpMax: 68,
            tempHp: 0,
            ac: 17,
            speed: 35,
            passivePerception: 19,
            conditions: [],
            concentration: false,
            deathSaves: { successes: 0, failures: 0 },
            isCurrentTurn: false,
            characterRefId: 'pm-2'
          },
          {
            id: 'cb-3',
            name: 'Eldritch Flesh-Hulk',
            type: 'monster',
            initiativeRoll: 11,
            hpCurrent: 145,
            hpMax: 145,
            tempHp: 0,
            ac: 16,
            speed: 40,
            conditions: [],
            concentration: false,
            isCurrentTurn: false,
            notes: 'Multiattack (3 slams + Delirium bile breath DC 15 CON)'
          },
          {
            id: 'cb-4',
            name: 'Haze Mutated Ghouls (x4)',
            type: 'monster',
            initiativeRoll: 8,
            hpCurrent: 44,
            hpMax: 44,
            tempHp: 0,
            ac: 12,
            speed: 30,
            conditions: [],
            concentration: false,
            isCurrentTurn: false,
            notes: 'Claw attacks inflict Paralyzed on DC 10 CON save'
          }
        ],
        combatLog: [
          { id: 'cl-1', timestamp: Date.now() - 60000, text: 'Encounter initialized: 2 heroes vs 2 monster groups' }
        ]
      },
      secretRolls: [
        {
          id: 'sr-1',
          timestamp: Date.now() - 300000,
          command: '1d20+7',
          result: 18,
          breakdown: '11 + 7',
          label: 'Eldritch Hulk Perception Check vs Vespera Stealth',
          isRevealed: false
        },
        {
          id: 'sr-2',
          timestamp: Date.now() - 120000,
          command: '3d8+4',
          result: 17,
          breakdown: '5 + 4 + 4 + 4',
          label: 'Mutated Slam Damage (Secret)',
          isRevealed: false
        }
      ],
      dmNotes: [
        {
          id: 'dn-1',
          title: 'Delirium Fog Hazard Mechanics',
          category: 'traps',
          content: 'Creatures ending turn inside deep Haze must succeed DC 13 Constitution saving throw or gain 1 level of Delirium Contamination. Tier 1: warped shadow; Tier 2: vulnerability to necrotic; Tier 3: eldritch mutation.',
          updatedAt: Date.now() - 86400000
        },
        {
          id: 'dn-2',
          title: 'Blackjack Mel\'s Backup Ambush',
          category: 'tactics',
          content: 'If the party escapes the Cisterns with the alchemical cargo, 3 Queen\'s Men cross-bowmen are stationed on the aqueduct roof aiming down with poisoned bolts (DC 13 CON, 2d6 poison).',
          updatedAt: Date.now() - 86400000 * 2
        }
      ],
      selectedCombatantId: null,
      battlefieldBackground: { source: 'preset', presetId: 'default' },

      startCombat: (initialCombatants) => {
        const combatants = (initialCombatants && initialCombatants.length > 0)
          ? initialCombatants
          : get().combatState.combatants;

        // Sort descending by initiative roll
        const sorted = [...combatants].sort((a, b) => b.initiativeRoll - a.initiativeRoll);
        sorted.forEach((c, idx) => {
          c.isCurrentTurn = idx === 0;
        });

        set(state => ({
          combatState: {
            inCombat: true,
            round: 1,
            turnIndex: 0,
            combatants: sorted,
            combatLog: [
              { id: 'cl-' + Date.now(), timestamp: Date.now(), text: 'Combat begins! Round 1 started.' },
              ...state.combatState.combatLog
            ]
          }
        }));
      },

      endCombat: () => {
        set(state => ({
          combatState: {
            ...state.combatState,
            inCombat: false,
            turnIndex: 0,
            combatLog: [
              { id: 'cl-' + Date.now(), timestamp: Date.now(), text: `Combat ended at Round ${state.combatState.round}.` },
              ...state.combatState.combatLog
            ]
          }
        }));
      },

      nextTurn: () => {
        const { combatants, turnIndex, round } = get().combatState;
        if (combatants.length === 0) return;

        let nextIndex = turnIndex + 1;
        let nextRound = round;

        if (nextIndex >= combatants.length) {
          nextIndex = 0;
          nextRound += 1;
        }

        const updated = combatants.map((c, i) => ({
          ...c,
          isCurrentTurn: i === nextIndex
        }));

        const currentActor = updated[nextIndex];
        const logEntry = {
          id: 'cl-' + Date.now(),
          timestamp: Date.now(),
          text: `Turn advanced to ${currentActor.name} (Round ${nextRound})`
        };

        set(state => ({
          combatState: {
            ...state.combatState,
            round: nextRound,
            turnIndex: nextIndex,
            combatants: updated,
            combatLog: [logEntry, ...state.combatState.combatLog]
          }
        }));
      },

      prevTurn: () => {
        const { combatants, turnIndex, round } = get().combatState;
        if (combatants.length === 0) return;

        let prevIndex = turnIndex - 1;
        let prevRound = round;

        if (prevIndex < 0) {
          prevIndex = combatants.length - 1;
          prevRound = Math.max(1, round - 1);
        }

        const updated = combatants.map((c, i) => ({
          ...c,
          isCurrentTurn: i === prevIndex
        }));

        set(state => ({
          combatState: {
            ...state.combatState,
            round: prevRound,
            turnIndex: prevIndex,
            combatants: updated
          }
        }));
      },

      rollAllInitiative: () => {
        const updated = get().combatState.combatants.map(c => {
          const roll = rollDie(20);
          return {
            ...c,
            initiativeRoll: roll
          };
        });

        // Re-sort
        updated.sort((a, b) => b.initiativeRoll - a.initiativeRoll);
        updated.forEach((c, idx) => {
          c.isCurrentTurn = idx === 0;
        });

        set(state => ({
          combatState: {
            ...state.combatState,
            turnIndex: 0,
            combatants: updated,
            combatLog: [
              { id: 'cl-' + Date.now(), timestamp: Date.now(), text: 'Rolled initiative for all combatants!' },
              ...state.combatState.combatLog
            ]
          }
        }));
      },

      addCombatant: (combatant) => {
        const newC: InitiativeCombatant = {
          id: 'cb-' + crypto.randomUUID(),
          name: combatant.name || 'New Combatant',
          type: combatant.type || 'monster',
          initiativeRoll: combatant.initiativeRoll ?? rollDie(20),
          hpCurrent: combatant.hpCurrent ?? 25,
          hpMax: combatant.hpMax ?? 25,
          tempHp: combatant.tempHp ?? 0,
          ac: combatant.ac ?? 12,
          speed: combatant.speed ?? 30,
          conditions: combatant.conditions || [],
          concentration: combatant.concentration ?? false,
          isCurrentTurn: false,
          ...combatant
        };

        const sorted = [...get().combatState.combatants, newC].sort((a, b) => b.initiativeRoll - a.initiativeRoll);

        set(state => ({
          combatState: {
            ...state.combatState,
            combatants: sorted,
            combatLog: [
              { id: 'cl-' + Date.now(), timestamp: Date.now(), text: `Added ${newC.name} to initiative order.` },
              ...state.combatState.combatLog
            ]
          }
        }));
      },

      updateCombatant: (id, updates) => set(state => ({
        combatState: {
          ...state.combatState,
          combatants: state.combatState.combatants.map(c => c.id === id ? { ...c, ...updates } : c)
        }
      })),

      removeCombatant: (id) => set(state => {
        const c = state.combatState.combatants.find(item => item.id === id);
        return {
          combatState: {
            ...state.combatState,
            combatants: state.combatState.combatants.filter(item => item.id !== id),
            combatLog: [
              { id: 'cl-' + Date.now(), timestamp: Date.now(), text: `Removed ${c?.name || 'combatant'} from combat.` },
              ...state.combatState.combatLog
            ]
          }
        };
      }),

      toggleCombatantAction: (id, actionType) => set(state => ({
        combatState: {
          ...state.combatState,
          combatants: state.combatState.combatants.map(c => {
            if (c.id !== id) return c;
            const currentActions = c.actionsUsed || {};
            return {
              ...c,
              actionsUsed: {
                ...currentActions,
                [actionType]: !currentActions[actionType]
              }
            };
          })
        }
      })),

      applyHpAdjustment: (id, amount, type) => set(state => ({
        combatState: {
          ...state.combatState,
          combatants: state.combatState.combatants.map(c => {
            if (c.id !== id) return c;
            let current = c.hpCurrent;
            let temp = c.tempHp;

            if (type === 'damage') {
              if (temp > 0) {
                if (amount <= temp) {
                  temp -= amount;
                  amount = 0;
                } else {
                  amount -= temp;
                  temp = 0;
                }
              }
              current = Math.max(0, current - amount);
            } else if (type === 'heal') {
              current = Math.min(c.hpMax, current + amount);
            } else if (type === 'temp') {
              temp = Math.max(temp, amount);
            }

            return { ...c, hpCurrent: current, tempHp: temp };
          })
        }
      })),

      toggleCondition: (id, condition) => set(state => ({
        combatState: {
          ...state.combatState,
          combatants: state.combatState.combatants.map(c => {
            if (c.id !== id) return c;
            const hasCondition = c.conditions.includes(condition);
            const nextConditions = hasCondition 
              ? c.conditions.filter(x => x !== condition)
              : [...c.conditions, condition];
            return { ...c, conditions: nextConditions };
          })
        }
      })),

      selectCombatant: (id) => set({ selectedCombatantId: id }),

      setBattlefieldBackground: (background) => set({ battlefieldBackground: background }),

      performSecretRoll: (command, label = 'DM Secret Check') => {
        // Parse basic dice command (e.g. 1d20+5, 2d6+3, 1d20)
        let total = 0;
        let breakdown = '';
        const match = command.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

        if (match) {
          const count = parseInt(match[1], 10);
          const sides = parseInt(match[2], 10);
          const mod = match[3] ? parseInt(match[3], 10) : 0;
          const rolls: number[] = [];
          for (let i = 0; i < count; i++) {
            rolls.push(rollDie(sides));
          }
          const sum = rolls.reduce((a, b) => a + b, 0);
          total = sum + mod;
          breakdown = `(${rolls.join('+')})${mod !== 0 ? (mod > 0 ? '+' + mod : mod) : ''}`;
        } else {
          total = rollDie(20);
          breakdown = `${total}`;
        }

        const newRoll: DmSecretRoll = {
          id: 'sr-' + crypto.randomUUID(),
          timestamp: Date.now(),
          command,
          result: total,
          breakdown,
          label,
          isRevealed: false
        };

        set(state => ({
          secretRolls: [newRoll, ...state.secretRolls]
        }));

        return newRoll;
      },

      toggleRevealRoll: (rollId) => set(state => ({
        secretRolls: state.secretRolls.map(r => r.id === rollId ? { ...r, isRevealed: !r.isRevealed } : r)
      })),

      clearRollHistory: () => set({ secretRolls: [] }),

      addDmNote: (note) => set(state => ({
        dmNotes: [
          {
            id: 'dn-' + crypto.randomUUID(),
            title: note.title || 'New DM Note',
            category: note.category || 'tactics',
            content: note.content || '',
            tags: note.tags || ['#Tactics'],
            isPinned: note.isPinned || false,
            updatedAt: Date.now(),
            ...note
          },
          ...state.dmNotes
        ]
      })),

      updateDmNote: (id, updates) => set(state => ({
        dmNotes: state.dmNotes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
      })),

      deleteDmNote: (id) => set(state => ({
        dmNotes: state.dmNotes.filter(n => n.id !== id)
      })),

      togglePinDmNote: (id) => set(state => ({
        dmNotes: state.dmNotes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n)
      }))
    }),
    {
      name: 'bonfire-dm-storage-v1',
      storage: createJSONStorage(() => safeCharacterStorage)
    }
  )
);
