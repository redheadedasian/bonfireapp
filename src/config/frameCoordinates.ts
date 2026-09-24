/**
 * Strict Cutout & Cavity Coordinate Registry for Bonfire 9-Slice Assets
 * All coordinates are defined as percentage bounds relative to raw asset dimensions.
 */

export const FRAME_COORDINATES = {
  vitals: {
    hp: {
      aspectRatio: '1869/400',
      slot: {
        left: '20.8%',
        right: '14.2%',
        top: '56.0%',
        bottom: '23.0%',
      },
      textOverlay: {
        left: '20.8%',
        right: '14.2%',
        top: '56.0%',
        bottom: '23.0%',
      },
    },
    xp: {
      aspectRatio: '1040/284',
      slot: {
        left: '23.5%',
        right: '13.8%',
        top: '54.5%',
        bottom: '24.5%',
      },
      crest: {
        left: '0%',
        width: '22.5%',
      },
      nextLvlHeader: {
        right: '14.0%',
        top: '19.0%',
      },
    },
    ac: {
      aspectRatio: '200/280',
      textCenter: {
        top: '48%',
      },
    },
  },
  secondaryBadges: {
    initiative: { translateY: '0px' },
    speed: { translateY: '0px' },
    hitDice: { translateY: '0px' },
    deathSaves: { translateY: '0px' },
    inspiration: {
      translateY: '0px',
      activeSlot: {
        left: '36%',
        right: '10%',
      },
    },
  },
} as const;

export type FrameCoordinates = typeof FRAME_COORDINATES;