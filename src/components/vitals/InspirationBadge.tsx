import React from 'react';
import { InspirationWidget } from '../character/InspirationWidget';

export interface InspirationBadgeProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
}

export function InspirationBadge(props: InspirationBadgeProps) {
  return <InspirationWidget {...props} />;
}

export default InspirationBadge;
