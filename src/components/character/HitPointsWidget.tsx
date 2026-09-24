import React from 'react';
import { HitPointsBar } from '../vitals/HitPointsBar';

interface HitPointsWidgetProps {
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  isEditMode?: boolean;
  onUpdateHp: (current: number, max: number) => void;
  onAdjustHp: (amount: number, type: 'damage' | 'heal' | 'temp') => void;
  onSetTempHp?: (temp: number) => void;
}

export function HitPointsWidget(props: HitPointsWidgetProps) {
  return <HitPointsBar {...props} />;
}

export default HitPointsWidget;
