import React from 'react';
import { SpeedBadge as CharacterSpeedBadge } from '../character/SpeedBadge';

export interface SpeedBadgeProps {
  speed: number;
  isEditMode?: boolean;
  onUpdateSpeed: (val: number) => void;
  className?: string;
}

export function SpeedBadge({
  speed,
  isEditMode = false,
  onUpdateSpeed,
  className = '',
}: SpeedBadgeProps) {
  return (
    <CharacterSpeedBadge
      speed={speed}
      isEditMode={isEditMode}
      onUpdateSpeed={onUpdateSpeed}
      className={className}
    />
  );
}

export default SpeedBadge;
