// Centralized, type-safe Asset Registry for RPG UI components
// Vite handles bundling, hashing, and compile-time validation.

// Site-Wide Background
import backgroundJpg from '@/assets/background.jpeg';

// Vitals & Medallions (SVGs from src/assets/)
import acSvg from '@/assets/ac.svg';
import speedSvg from '@/assets/speed.svg';
import initiativeSvg from '@/assets/initiative.svg';
import inspirationSvg from '@/assets/inspiration.svg';
import levelSvg from '@/assets/level.svg';
import deathSavesSvg from '@/assets/Death saves.svg';
import hitDiceSvg from '@/assets/hit dice.svg';
import saveSvg from '@/assets/panel/save.svg';
import savePng from '@/assets/panel/save.png';
import failSvg from '@/assets/panel/fail.svg';
import failPng from '@/assets/panel/fail.png';

// HP Bar Assets (src/assets/HP/)
import hpBarSvg from '@/assets/HP/hp bar.svg';
import hpMinus5Svg from '@/assets/HP/-5.svg';
import hpMinus1Svg from '@/assets/HP/-1.svg';
import hpPlus1Svg from '@/assets/HP/plus 1.svg';
import hpPlus5Svg from '@/assets/HP/plus 5.svg';
import hpBlankSvg from '@/assets/HP/blank.svg';
import hpTextBoxSvg from '@/assets/HP/text box.svg';

// XP Bar Assets (src/assets/xp/)
import xpBarSvg from '@/assets/xp/xp bar.svg';
import xpTextBoxSvg from '@/assets/xp/text box.svg';

// Frames & Borders
import inventoryIconBorderSvg from '@/assets/panel/inventory_icon_boarder.svg';
import inventoryIconBorderPng from '@/assets/panel/inventory_icon_boarder.png';
import boarderNoJewelsSvg from '@/assets/panel/boarder no jewels.svg';
import boarderNoJewelsPng from '@/assets/panel/boarder no jewels.png';
import shortBoarderSvg from '@/assets/panel/short_boarder.svg';
import shortBoarderPng from '@/assets/panel/short_boarder.png';
import characterPortraitSvg from '@/assets/character portrait.svg';
import profileCirclePng from '@/assets/profile circle.png';
import abilityScoresSvg from '@/assets/ability scores.svg';

// 9-Slice Ink Brush Frame (src/assets/9slice frame/)
import cornerTopLeftSvg from '@/assets/9slice frame/corner-tl.svg';
import cornerTopRightSvg from '@/assets/9slice frame/corner-tr.svg';
import cornerBottomLeftSvg from '@/assets/9slice frame/corner-bl.svg';
import cornerBottomRightSvg from '@/assets/9slice frame/corner-br.svg';
import railTopSvg from '@/assets/9slice frame/rail-top.svg';
import railBottomSvg from '@/assets/9slice frame/rail-bottom.svg';
import railLeftSvg from '@/assets/9slice frame/rail-left.svg';
import railRightSvg from '@/assets/9slice frame/rail-right.svg';

// 9-Slice Magical Frame Assets (Gems & Filigree)
import magicalCornerTopLeftSvg from '@/assets/magical frame/corner-tl.svg';
import magicalCornerTopRightSvg from '@/assets/magical frame/corner-tr.svg';
import magicalCornerBottomLeftSvg from '@/assets/magical frame/corner-bl.svg';
import magicalCornerBottomRightSvg from '@/assets/magical frame/corner-br.svg';
import magicalRailTopSvg from '@/assets/magical frame/rail-top.svg';
import magicalRailBottomSvg from '@/assets/magical frame/rail-bottom.svg';
import magicalRailLeftSvg from '@/assets/magical frame/rail-left.svg';
import magicalRailRightSvg from '@/assets/magical frame/rail-right.svg';

// Calligraphic Brush Strokes (src/assets/brush_strokes/)
import brush1Svg from '@/assets/brush_strokes/Brush 1.svg';
import brush2Svg from '@/assets/brush_strokes/Brush 2.svg';
import brush3Svg from '@/assets/brush_strokes/Brush 3.svg';
import brush4Svg from '@/assets/brush_strokes/Brush 4.svg';
import brush5Svg from '@/assets/brush_strokes/brush 5.svg';
import brush6Svg from '@/assets/brush_strokes/brush 6.svg';
import brush7Svg from '@/assets/brush_strokes/brush 7.svg';
import brush8Svg from '@/assets/brush_strokes/brush 8.svg';
import brush9Svg from '@/assets/brush_strokes/brush 9.svg';

// Ability Icons (SVGs and PNG fallbacks)
import strSvg from '@/assets/abilities/str.svg';
import strPng from '@/assets/abilities/str.png';
import dexSvg from '@/assets/abilities/dex.svg';
import dexPng from '@/assets/abilities/dex.png';
import conSvg from '@/assets/abilities/con.svg';
import conPng from '@/assets/abilities/con.png';
import intSvg from '@/assets/abilities/int.svg';
import intPng from '@/assets/abilities/int.png';
import wisSvg from '@/assets/abilities/wis.svg';
import wisPng from '@/assets/abilities/wis.png';
import chaSvg from '@/assets/abilities/cha.svg';
import chaPng from '@/assets/abilities/cha.png';

// Currency SVGs (from src/assets/vectors/tokens/)
import currency1Svg from '@/assets/vectors/tokens/currency 1.svg';
import currency2Svg from '@/assets/vectors/tokens/currency2.svg';
import currency3Svg from '@/assets/vectors/tokens/currency3.svg';
import currency4Svg from '@/assets/vectors/tokens/currency4.svg';
import currency5Svg from '@/assets/vectors/tokens/currency5.svg';

// Saving Throws Indicators (src/assets/Saving Throws/)
import saveOpenSvg from '@/assets/Saving Throws/skills open circle.svg';
import saveFilledSvg from '@/assets/Saving Throws/skills filled in .svg';

// Character Portrait & Bestiary Specialty Frames
import characterPortraitWatercolorSvg from '@/assets/panel/character_portrait_watercolor.svg';
import monsterFrameSvg from '@/assets/bestiary/monster_frame.svg';

// Skills Indicators (src/assets/Skills/)
import skillEmptySvg from '@/assets/Skills/empty.svg';
import skillFilledSvg from '@/assets/Skills/filled in.svg';
import skillExpertiseSvg from '@/assets/skills/expertise.svg';

// UI & FX Assets
import splashMaskSvg from '@/assets/ui/splash_mask.svg';
import tabLineSvg from '@/assets/tab line.svg';

export const ASSET_MAP = {
  background: backgroundJpg,
  ui: {
    splashMask: splashMaskSvg,
    tabLine: tabLineSvg,
  },
  savingThrows: {
    open: saveOpenSvg,
    filled: saveFilledSvg,
  },
  skills: {
    empty: skillEmptySvg,
    filled: skillFilledSvg,
    expertise: skillExpertiseSvg,
  },
  vitals: {
    ac: {
      svg: acSvg,
    },
    speed: {
      svg: speedSvg,
    },
    initiative: {
      svg: initiativeSvg,
    },
    inspiration: {
      svg: inspirationSvg,
    },
    level: {
      svg: levelSvg,
    },
    xp: {
      bar: xpBarSvg,
      textBox: xpTextBoxSvg,
    },
    hitDice: {
      svg: hitDiceSvg,
    },
    deathSaves: {
      svg: deathSavesSvg,
      saveOrb: {
        svg: saveSvg,
        png: savePng,
      },
      failOrb: {
        svg: failSvg,
        png: failPng,
      },
    },
    hp: {
      frame: hpBarSvg,
      modifiers: {
        minus5: hpMinus5Svg,
        minus1: hpMinus1Svg,
        plus1: hpPlus1Svg,
        plus5: hpPlus5Svg,
      },
      temp: {
        blank: hpBlankSvg,
        textBox: hpTextBoxSvg,
      },
    },
  },
  frames: {
    characterPortrait: {
      svg: characterPortraitSvg,
      png: profileCirclePng,
      watercolor: characterPortraitWatercolorSvg,
    },
    monsterFrame: {
      svg: monsterFrameSvg,
    },
    abilityFrame: {
      svg: abilityScoresSvg,
    },
    inventoryIconBorder: {
      svg: inventoryIconBorderSvg,
      png: inventoryIconBorderPng,
    },
    boarderNoJewels: {
      svg: boarderNoJewelsSvg,
      png: boarderNoJewelsPng,
    },
    shortBoarder: {
      svg: shortBoarderSvg,
      png: shortBoarderPng,
    },
    // 9-Slice Panel Slices (Hand-Inked Frame)
    slice: {
      cornerTopLeft: cornerTopLeftSvg,
      cornerTopRight: cornerTopRightSvg,
      cornerBottomLeft: cornerBottomLeftSvg,
      cornerBottomRight: cornerBottomRightSvg,
      railTop: railTopSvg,
      railBottom: railBottomSvg,
      railLeft: railLeftSvg,
      railRight: railRightSvg,
    },
    // 9-Slice Magical Frame Slices (Gems & Filigree)
    magicalSlice: {
      cornerTopLeft: magicalCornerTopLeftSvg,
      cornerTopRight: magicalCornerTopRightSvg,
      cornerBottomLeft: magicalCornerBottomLeftSvg,
      cornerBottomRight: magicalCornerBottomRightSvg,
      railTop: magicalRailTopSvg,
      railBottom: magicalRailBottomSvg,
      railLeft: magicalRailLeftSvg,
      railRight: magicalRailRightSvg,
    },
  },
  abilities: {
    str: { svg: strSvg, png: strPng },
    dex: { svg: dexSvg, png: dexPng },
    con: { svg: conSvg, png: conPng },
    int: { svg: intSvg, png: intPng },
    wis: { svg: wisSvg, png: wisPng },
    cha: { svg: chaSvg, png: chaPng },
  },
  currency: {
    cp: currency1Svg,
    sp: currency2Svg,
    ep: currency4Svg,
    gp: currency3Svg,
    pp: currency5Svg,
  },
  brushStrokes: {
    brush1: brush1Svg,
    brush2: brush2Svg,
    brush3: brush3Svg,
    brush4: brush4Svg,
    brush5: brush5Svg,
    brush6: brush6Svg,
    brush7: brush7Svg,
    brush8: brush8Svg,
    brush9: brush9Svg,
    // Dedicated role-based mappings for character sheet components
    abilityCard: brush1Svg, // Uniform brush for all 6 ability score cards
    heroBanner: brush2Svg,
    acMedallion: brush3Svg,
    initiativeBadge: brush4Svg,
    speedBadge: brush5Svg,
    hitDiceBadge: brush6Svg,
    levelBadge: brush7Svg,
    inspirationBadge: brush8Svg,
    deathSavesBadge: brush9Svg,
  },
} as const;

export type AbilityAssetKey = keyof typeof ASSET_MAP.abilities;
export type CurrencyAssetKey = keyof typeof ASSET_MAP.currency;
export type BrushStrokeKey = keyof typeof ASSET_MAP.brushStrokes;
