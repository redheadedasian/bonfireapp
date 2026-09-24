import React from 'react';
import { InitiativeBadge as CharacterInitiativeBadge } from '../character/InitiativeBadge';

export interface InitiativeBadgeProps {
  bonus: number;
  isEditMode?: boolean;
  onUpdateBonus: (val: number) => void;
  onRoll: () => void;
  className?: string;
}

export function InitiativeBadge({
  bonus,
  isEditMode = false,
  onUpdateBonus,
  onRoll,
  className = '',
}: InitiativeBadgeProps) {
  return (
    <CharacterInitiativeBadge
      bonus={bonus}
      isEditMode={isEditMode}
      onUpdateBonus={onUpdateBonus}
      onRoll={onRoll}
      className={className}
    />
  );
}

export default InitiativeBadge;
