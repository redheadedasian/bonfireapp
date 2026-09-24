import React from 'react';
import { LevelBadge } from '../character/LevelBadge';

export interface LevelEmblemProps {
  level: number;
  className?: string;
  isEditMode?: boolean;
  onUpdateLevel: (val: number) => void;
}

export function LevelEmblem({
  level,
  className = '',
  isEditMode = false,
  onUpdateLevel,
}: LevelEmblemProps) {
  return (
    <LevelBadge
      level={level}
      className={className}
      isEditMode={isEditMode}
      onUpdateLevel={onUpdateLevel}
    />
  );
}

export default LevelEmblem;
