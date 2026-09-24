import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Edit2, 
  Trash2, 
  Save 
} from 'lucide-react';
import { DmPrivateNote } from '../../types/dm';

interface DmNotesLedgerViewProps {
  dmNotes: DmPrivateNote[];
  addDmNote: (note: Partial<DmPrivateNote>) => void;
  updateDmNote: (id: string, updates: Partial<DmPrivateNote>) => void;
  deleteDmNote: (id: string) => void;
  togglePinDmNote: (id: string) => void;
  setConfirmDeleteNote: (note: { id: string; title: string } | null) => void;
}

export function DmNotesLedgerView({
  dmNotes,
  addDmNote,
  updateDmNote,
  deleteDmNote,
  togglePinDmNote,
  setConfirmDeleteNote
}: DmNotesLedgerViewProps) {
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [selectedNoteTag, setSelectedNoteTag] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteTags, setEditNoteTags] = useState('');

  const handleStartEditNote = (note: DmPrivateNote) => {
    setEditingNoteId(note.id);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setEditNoteTags((note.tags || []).join(', '));
  };

  const handleSaveNote = (id: string) => {
    const parsedTags = editNoteTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    updateDmNote(id, {
      title: editNoteTitle.trim() || 'Untitled Note',
      content: editNoteContent.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['#Tactics']
    });

    setEditingNoteId(null);
  };

  const handleCreateNewNote = () => {
    addDmNote({
      title: 'New Shrouded Note',
      content: '',
      tags: ['#Tactics', '#Secret'],
      category: 'tactics',
      isPinned: false
    });
  };

  const filteredNotes = dmNotes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(t => t.toLowerCase().includes(noteSearchQuery.toLowerCase())));

    const matchesTag = selectedNoteTag === 'all' || 
      (note.tags && note.tags.some(t => t.toLowerCase() === selectedNoteTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="w-full h-full overflow-y-auto hide-scrollbar p-6 max-w-5xl mx-auto flex flex-col gap-6 text-[#161616]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414]/15 pb-3">
        <div>
          <h3 className="font-display text-base uppercase tracking-wider text-[#1a1a1a] font-bold">
            Shrouded DM Ledger & Tactical Notes
          </h3>
          <p className="font-serif text-xs text-[#555555]">
            Encrypted notes, trap DCs, lore secrets, and plot beats hidden from players.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-display uppercase font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>+ Create Secret Note</span>
        </button>
      </div>

      {/* Search Bar & Tag Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={noteSearchQuery}
            onChange={e => setNoteSearchQuery(e.target.value)}
            placeholder="Search ledger notes by title, content, or tag..."
            className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] rounded pl-8 pr-3 py-1.5 text-xs text-[#161616] font-serif focus:outline-none"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', '#Tactics', '#Secret', '#Loot', '#NPC', '#Plot', '#Location'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedNoteTag(tag)}
              className={`px-2.5 py-1 rounded text-[11px] font-display uppercase tracking-wider transition-colors cursor-pointer ${
                selectedNoteTag.toLowerCase() === tag.toLowerCase()
                  ? 'bg-[#1c1c1c] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#141414]/20 text-[#555555] hover:text-[#161616]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => {
          const isEditing = editingNoteId === note.id;

          return (
            <div
              key={note.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-xs transition-all ${
                note.isPinned
                  ? 'bg-white border-2 border-[var(--accent-ink)]'
                  : 'bg-white/80 border-[#141414]/15'
              }`}
            >
              {isEditing ? (
                /* IN-PLACE NOTE EDITOR */
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={editNoteTitle}
                    onChange={e => setEditNoteTitle(e.target.value)}
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-1.5 text-sm text-[#161616] font-display uppercase font-bold rounded focus:outline-none"
                  />
                  <textarea
                    rows={4}
                    value={editNoteContent}
                    onChange={e => setEditNoteContent(e.target.value)}
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-2 text-xs text-[#161616] font-serif rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editNoteTags}
                    onChange={e => setEditNoteTags(e.target.value)}
                    placeholder="#Tags (e.g. #Secret, #Loot)"
                    className="bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] p-1.5 text-xs text-[var(--accent-ink)] font-mono rounded focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1 rounded-xs border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveNote(note.id)}
                      className="px-4 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-xs font-bold uppercase flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* NOTE DISPLAY CARD */
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(note.tags || ['#Tactics']).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-[var(--accent-ink)]/15 border border-[var(--accent-ink)]/30 text-[var(--accent-ink)] rounded text-[9px] font-mono font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h4 className="font-display text-sm font-bold text-[#161616] uppercase tracking-wide mt-1.5">
                        {note.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinDmNote(note.id)}
                        className={`p-1 rounded ${note.isPinned ? 'text-[var(--accent-ink)]' : 'text-[#777777] hover:text-[#161616]'}`}
                        title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        <Pin size={13} />
                      </button>
                      <button
                        onClick={() => handleStartEditNote(note)}
                        className="p-1 text-[#777777] hover:text-[#161616]"
                        title="Edit Note"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteNote({ id: note.id, title: note.title })}
                        className="p-1 text-[#777777] hover:text-[#c53030]"
                        title="Delete Note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="font-serif text-xs text-[#555555] leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <span className="text-[10px] font-mono text-[#777777] pt-2 border-t border-[#141414]/10">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
