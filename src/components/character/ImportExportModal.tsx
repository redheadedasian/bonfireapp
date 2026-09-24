import React from 'react';
import { CharacterModal } from './CharacterModal';

export function ImportExportModal({ 
  isOpen, 
  onClose, 
  initialTab = 'data' 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialTab?: 'roster' | 'vitals' | 'data';
}) {
  return <CharacterModal isOpen={isOpen} onClose={onClose} initialTab={initialTab} />;
}
