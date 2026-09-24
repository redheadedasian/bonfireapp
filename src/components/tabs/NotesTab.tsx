import React from 'react';
import { useStore } from '../../store';
import { Frame } from '../ui';

export function NotesTab() {
  const { character, updateCharacterField } = useStore();

  return (
    <div className="flex flex-col gap-8 pointer-events-auto h-full pb-10">
      <Frame title="CHARACTER NOTES" className="flex flex-col h-full min-h-[500px]">
        <textarea
          value={character.notes}
          onChange={(e) => updateCharacterField('notes', e.target.value)}
          className="flex-1 w-full bg-transparent text-[#161616] font-serif p-4 focus:outline-none resize-none leading-relaxed min-h-[400px] placeholder:text-[#888888]"
          placeholder="Enter character backstory, quest logs, and important notes here..."
        />
      </Frame>
    </div>
  );
}
