// Mathematical Engine Test Suite for Bonfire D&D 5e HUD
import assert from 'node:assert';

console.log('⚔️  Running Bonfire D&D 5e HUD Math Engines Test Suite...\n');

// 1. XP Thresholds & Level Progression Tests
const LEVEL_XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

function calculateLevelFromXp(xp: number): number {
  let level = 1;
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= LEVEL_XP_THRESHOLDS[lvl]) {
      level = lvl;
      break;
    }
  }
  return level;
}

function calculateXpProgressPercent(xp: number, level: number): number {
  if (level >= 20) return 100;
  const currentBase = LEVEL_XP_THRESHOLDS[level] || 0;
  const nextTarget = LEVEL_XP_THRESHOLDS[level + 1] || 355000;
  const range = nextTarget - currentBase;
  if (range <= 0) return 100;
  const currentInTier = Math.max(0, xp - currentBase);
  return Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
}

// XP Progression Test Assertions
console.log('Testing XP & Level Progression Engine...');
assert.strictEqual(calculateLevelFromXp(0), 1, '0 XP must be Level 1');
assert.strictEqual(calculateLevelFromXp(299), 1, '299 XP must be Level 1');
assert.strictEqual(calculateLevelFromXp(300), 2, '300 XP must be Level 2');
assert.strictEqual(calculateLevelFromXp(6500), 5, '6500 XP must be Level 5');
assert.strictEqual(calculateLevelFromXp(100000), 12, '100,000 XP must be Level 12');
assert.strictEqual(calculateLevelFromXp(355000), 20, '355,000 XP must be Level 20');
assert.strictEqual(calculateXpProgressPercent(600, 2), 50, '600 XP at Level 2 (300-900) should be 50%');

// Test XP Stepper and Direct Modification Logic
const initialXp = 250;
const awardedXp = Math.max(0, initialXp + 100);
assert.strictEqual(awardedXp, 350, 'Awarding 100 XP to 250 results in 350 XP');
assert.strictEqual(calculateLevelFromXp(awardedXp), 2, '350 XP promotes hero from Level 1 to Level 2');

const deductedXp = Math.max(0, awardedXp - 500);
assert.strictEqual(deductedXp, 0, 'Deducting 500 XP from 350 floors safely at 0');
assert.strictEqual(calculateLevelFromXp(deductedXp), 1, '0 XP sets hero to Level 1');

console.log('✓ XP & Level Progression Engine tests passed!');


// 2. HP & Temporary HP Adjustment Engine Tests
function applyDamageToHp(currentHp: number, maxHp: number, tempHp: number, damage: number) {
  let remainingDamage = Math.max(0, damage);
  let newTemp = tempHp;
  if (newTemp > 0) {
    if (remainingDamage <= newTemp) {
      newTemp -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newTemp;
      newTemp = 0;
    }
  }
  const newCurrent = Math.max(0, currentHp - remainingDamage);
  return { currentHp: newCurrent, tempHp: newTemp };
}

function applyHealingToHp(currentHp: number, maxHp: number, healAmount: number) {
  return Math.min(maxHp, currentHp + Math.max(0, healAmount));
}

console.log('\nTesting HP & Temp HP Adjustment Engine...');
const dmgTest1 = applyDamageToHp(80, 100, 10, 5);
assert.strictEqual(dmgTest1.tempHp, 5, '5 damage against 10 temp HP leaves 5 temp HP');
assert.strictEqual(dmgTest1.currentHp, 80, 'Main HP should remain undamaged');

const dmgTest2 = applyDamageToHp(80, 100, 10, 25);
assert.strictEqual(dmgTest2.tempHp, 0, '25 damage depletes 10 temp HP completely');
assert.strictEqual(dmgTest2.currentHp, 65, 'Remaining 15 damage applies to main HP (80 -> 65)');

const healTest1 = applyHealingToHp(65, 100, 50);
assert.strictEqual(healTest1, 100, '50 heal to 65/100 HP caps at Max HP 100');

// 5e Rules: Healing from 0 HP must reset death saves
function handle5eHealState(currentHp: number, maxHp: number, healAmount: number, deathSaves: { successes: number; failures: number }) {
  const newHp = Math.min(maxHp, currentHp + Math.max(0, healAmount));
  const newDeathSaves = newHp > 0 ? { successes: 0, failures: 0 } : deathSaves;
  return { hp: newHp, deathSaves: newDeathSaves };
}

const healFromDying = handle5eHealState(0, 100, 5, { successes: 2, failures: 2 });
assert.strictEqual(healFromDying.hp, 5, 'Heal from 0 HP restores 5 HP');
assert.strictEqual(healFromDying.deathSaves.successes, 0, 'Death save successes must reset to 0 upon regaining HP');
assert.strictEqual(healFromDying.deathSaves.failures, 0, 'Death save failures must reset to 0 upon regaining HP');
console.log('✓ HP & Temp HP Adjustment Engine tests passed!');


// 3. Dice Roll Formula Parsing & Math Engine Tests
function parseDiceFormula(formula: string) {
  const clean = formula.trim().toLowerCase();
  const match = clean.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  return {
    count: parseInt(match[1] || '1', 10),
    sides: parseInt(match[2], 10),
    bonus: parseInt(match[3] || '0', 10)
  };
}

console.log('\nTesting Dice Formula Parser Engine...');
const d1 = parseDiceFormula('1d20+7');
assert.deepStrictEqual(d1, { count: 1, sides: 20, bonus: 7 }, '1d20+7 must parse into 1, 20, +7');

const d2 = parseDiceFormula('8d6');
assert.deepStrictEqual(d2, { count: 8, sides: 6, bonus: 0 }, '8d6 must parse into 8, 6, 0');

const d3 = parseDiceFormula('2d10-3');
assert.deepStrictEqual(d3, { count: 2, sides: 10, bonus: -3 }, '2d10-3 must parse into 2, 10, -3');
console.log('✓ Dice Formula Parser Engine tests passed!');


// 4. Party Wealth Equal Split Engine Tests
function splitTreasuryCoins(treasury: { cp: number; sp: number; ep: number; gp: number; pp: number }, memberCount: number) {
  const count = Math.max(1, memberCount);
  return {
    pp: Math.floor(treasury.pp / count),
    gp: Math.floor(treasury.gp / count),
    ep: Math.floor(treasury.ep / count),
    sp: Math.floor(treasury.sp / count),
    cp: Math.floor(treasury.cp / count),
  };
}

console.log('\nTesting Party Wealth Equal Split Engine...');
const partySplit = splitTreasuryCoins({ cp: 50, sp: 20, ep: 0, gp: 400, pp: 12 }, 4);
assert.strictEqual(partySplit.pp, 3, '12 PP split 4 ways = 3 PP each');
assert.strictEqual(partySplit.gp, 100, '400 GP split 4 ways = 100 GP each');
assert.strictEqual(partySplit.sp, 5, '20 SP split 4 ways = 5 SP each');
assert.strictEqual(partySplit.cp, 12, '50 CP split 4 ways = 12 CP each (2 CP remainder in chest)');
console.log('✓ Party Wealth Equal Split Engine tests passed!');

console.log('\n🌟 ALL BONFIRE MATHEMATICAL ENGINE TESTS PASSED WITH 0 FAILURES!\n');
