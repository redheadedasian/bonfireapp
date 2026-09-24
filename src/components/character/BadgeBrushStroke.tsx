import React from 'react';
import { ASSET_MAP } from '@/config/assets';

interface BadgeBrushStrokeProps {
  variant?: 'horizontal' | 'diagonal' | 'shield' | 'circle' | 'square' | 'wide';
  className?: string;
  id?: string;
  opacity?: number;
}

export function BadgeBrushStroke({
  variant = 'horizontal',
  className = '',
  id = 'badge-brush',
  opacity = 0.8,
}: BadgeBrushStrokeProps) {
  // Select a distinct brush stroke for each badge type
  const getBrushStroke = () => {
    switch (id) {
      case 'ac':
        return ASSET_MAP.brushStrokes.acMedallion;
      case 'initiative':
        return ASSET_MAP.brushStrokes.initiativeBadge;
      case 'speed':
        return ASSET_MAP.brushStrokes.speedBadge;
      case 'hitdice':
        return ASSET_MAP.brushStrokes.hitDiceBadge;
      case 'level':
        return ASSET_MAP.brushStrokes.levelBadge;
      case 'insp':
        return ASSET_MAP.brushStrokes.inspirationBadge;
      case 'deathsaves':
        return ASSET_MAP.brushStrokes.deathSavesBadge;
      default:
        if (variant === 'shield') return ASSET_MAP.brushStrokes.acMedallion;
        if (variant === 'diagonal') return ASSET_MAP.brushStrokes.initiativeBadge;
        if (variant === 'circle') return ASSET_MAP.brushStrokes.levelBadge;
        if (variant === 'square') return ASSET_MAP.brushStrokes.hitDiceBadge;
        if (variant === 'wide') return ASSET_MAP.brushStrokes.deathSavesBadge;
        return ASSET_MAP.brushStrokes.speedBadge;
    }
  };

  const strokeImg = getBrushStroke();

  return (
    <div
      className={`brush-stroke-bg absolute -inset-6 sm:-inset-8 pointer-events-none z-[1] select-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div
        style={{
          maskImage: `url("${strokeImg}")`,
          WebkitMaskImage: `url("${strokeImg}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: 'var(--accent-ink)',
          opacity: opacity,
        }}
        className="w-full h-full shrink-0 transition-colors duration-300 pointer-events-none"
      />
    </div>
  );
}

export default BadgeBrushStroke;
