import React from 'react';
import { DeathSavesOrbGroup as CharacterDeathSavesOrbGroup } from '../character/DeathSavesOrbGroup';

export interface DeathSavesOrbGroupProps {
  successes: number;
  failures: number;
  onToggleSuccess: (index: number) => void;
  onToggleFailure: (index: number) => void;
  onRoll?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DeathSavesOrbGroup(props: DeathSavesOrbGroupProps) {
  return <CharacterDeathSavesOrbGroup {...props} />;
}

export default DeathSavesOrbGroup;
