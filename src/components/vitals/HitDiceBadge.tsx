import React from 'react';
import { HitDiceBadge as CharacterHitDiceBadge } from '../character/HitDiceBadge';

export interface HitDiceBadgeProps {
  current: number;
  total: string | number;
  dieType?: string;
  isEditMode?: boolean;
  onUpdateCurrent: (val: number) => void;
  onUpdateTotal: (val: string) => void;
  className?: string;
}

export function HitDiceBadge({
  current,
  total,
  dieType = 'd8',
  isEditMode = false,
  onUpdateCurrent,
  onUpdateTotal,
  className = '',
}: HitDiceBadgeProps) {
  return (
    <CharacterHitDiceBadge
      current={current}
      total={total}
      dieType={dieType}
      isEditMode={isEditMode}
      onUpdateCurrent={onUpdateCurrent}
      onUpdateTotal={onUpdateTotal}
      className={className}
    />
  );
}

export default HitDiceBadge;
