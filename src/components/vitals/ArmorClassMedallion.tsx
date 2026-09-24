import React from 'react';
import { ArmorClassMedallion as CharacterArmorClassMedallion } from '../character/ArmorClassMedallion';

export interface ArmorClassMedallionProps {
  ac: number;
  isEditMode: boolean;
  onUpdateAc: (val: number) => void;
}

export function ArmorClassMedallion(props: ArmorClassMedallionProps) {
  return <CharacterArmorClassMedallion {...props} />;
}

export default ArmorClassMedallion;
