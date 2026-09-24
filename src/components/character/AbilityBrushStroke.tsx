import React from 'react';
import { ASSET_MAP } from '@/config/assets';

interface AbilityBrushStrokeProps {
  ability?: string;
  className?: string;
  opacity?: number;
}

export function AbilityBrushStroke({ className = '', opacity = 0.85 }: AbilityBrushStrokeProps) {
  return (
    <div
      className={`brush-stroke-bg absolute -inset-6 sm:-inset-8 pointer-events-none z-[1] select-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div
        style={{
          maskImage: `url("${ASSET_MAP.brushStrokes.abilityCard}")`,
          WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.abilityCard}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: 'var(--accent-ink)',
          opacity: opacity,
          transform: 'rotate(90deg) scale(1.45)',
        }}
        className="w-full h-full shrink-0 transition-colors duration-300 pointer-events-none"
      />
    </div>
  );
}

export default AbilityBrushStroke;
