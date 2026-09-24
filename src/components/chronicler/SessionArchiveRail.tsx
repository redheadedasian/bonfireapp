import React from 'react';
import { ChroniclerSession } from '../../types/session';
import { hasConfiguredApiKey } from '../../services/geminiChronicler';
import { 
  Scroll, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  Key, 
  CheckCircle2, 
  Trash2, 
  FileAudio,
  ShieldAlert
} from 'lucide-react';

interface SessionArchiveRailProps {
  sessions: ChroniclerSession[];
  activeSessionId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSession: (id: string) => void;
  onOpenUploadModal: () => void;
  onOpenApiKeyModal: () => void;
  onDeleteSession: (id: string) => void;
}

export function SessionArchiveRail({
  sessions,
  activeSessionId,
  searchQuery,
  onSearchChange,
  onSelectSession,
  onOpenUploadModal,
  onOpenApiKeyModal,
  onDeleteSession
}: SessionArchiveRailProps) {
  const isKeySet = hasConfiguredApiKey();

  // Filter sessions by search query (title, narrative, NPCs, dates)
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.sessionTitle.toLowerCase().includes(q);
    const dateMatch = s.date.toLowerCase().includes(q);
    const narrativeMatch = s.data.overallSummary.highLevelNarrative.toLowerCase().includes(q);
    const npcMatch = s.data.overallSummary.npcInteractions.some(
      (npc) => npc.name.toLowerCase().includes(q) || npc.loreRevealed.toLowerCase().includes(q)
    );
    const lootMatch = s.data.overallSummary.lootAndRewards.magicItems.some(
      (item) => item.name.toLowerCase().includes(q)
    );
    return titleMatch || dateMatch || narrativeMatch || npcMatch || lootMatch;
  });

  return (
    <aside className="w-full lg:w-[32%] xl:w-[28%] flex flex-col h-full bg-[#fcfbf9] border-r border-[#141414]/15 select-none shrink-0 text-[#161616]">
      
      {/* Rail Top Header */}
      <div className="p-4 border-b border-[#141414]/15 bg-white/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <Scroll size={16} className="text-[var(--accent-ink)]" />
            </div>
            <h2 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
              Chronicles & Sessions
            </h2>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-display uppercase tracking-wider font-bold transition-colors border shadow-xs cursor-pointer ${
              isKeySet
                ? 'bg-white text-[#1EB253] border-[#1EB253]/40 hover:border-[#1EB253]'
                : 'bg-white text-[var(--accent-ink)] border-[var(--accent-ink)]/40 hover:border-[var(--accent-ink)]'
            }`}
            title="Configure Gemini API Key"
          >
            <Key size={11} />
            <span>{isKeySet ? 'AI Connected' : 'Set AI Key'}</span>
          </button>
        </div>

        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] font-display text-xs tracking-[0.1em] font-bold uppercase rounded-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Upload New Session</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search lore, NPCs, loot, dates..."
            className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder-[#888888] text-xs pl-9 pr-3 py-1.5 rounded-xs focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#777777] hover:text-[#161616] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Session Archive List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 hide-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#777777] gap-2">
            <Scroll size={32} className="text-black/20" />
            <p className="font-serif text-xs italic">
              {searchQuery ? 'No chronicles matched your search query.' : 'No recorded sessions in the campaign archive yet.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenUploadModal}
                className="mt-2 text-xs font-display uppercase tracking-wider text-[var(--accent-ink)] hover:underline font-bold cursor-pointer"
              >
                + Upload your first session
              </button>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`relative group rounded-xs p-3 border transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-white border-2 border-[var(--accent-ink)] shadow-md'
                    : 'bg-white border-[#141414]/15 hover:border-black/30 shadow-xs'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-ink)]" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest text-[var(--accent-ink)] font-bold">
                    <span>Act {session.sessionNumber}</span>
                    <span className="text-[#888888]">•</span>
                    <span className="flex items-center gap-1 text-[#777777]">
                      <Calendar size={10} />
                      {session.date}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className="flex items-center gap-1 text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[#1EB253] font-bold">
                    <CheckCircle2 size={10} />
                    <span>{session.status === 'ready' ? 'Ready' : session.status}</span>
                  </span>
                </div>

                {/* Session Title */}
                <h3 className="font-serif text-sm font-bold text-[#161616] mt-1.5 line-clamp-1 group-hover:text-[var(--accent-ink)] transition-colors">
                  {session.sessionTitle}
                </h3>

                {/* Narrative Snippet */}
                <p className="font-serif text-[11px] text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                  {session.data.overallSummary.highLevelNarrative}
                </p>

                {/* Metadata Footer */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#141414]/10 text-[10px] text-[#777777]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-serif text-[var(--accent-ink)] font-bold">
                      <Clock size={11} />
                      {session.formattedDuration || '3h 42m'}
                    </span>
                    <span className="flex items-center gap-1 font-serif">
                      <FileAudio size={11} />
                      {session.data.fullTranscript.length} Lines
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove "${session.sessionTitle}" from the chronicler archive?`)) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#777777] hover:text-[#c53030] transition-opacity cursor-pointer"
                    title="Delete Session"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Rail Bottom Footer */}
      <div className="p-3 bg-white/80 border-t border-[#141414]/15 flex items-center justify-between text-[11px] text-[#777777]">
        <span className="font-serif italic">
          {sessions.length} {sessions.length === 1 ? 'Session Chronicled' : 'Sessions Chronicled'}
        </span>
        <span className="font-display tracking-widest text-[9px] uppercase text-[#777777] font-bold">
          Bonfire Scribe v2.4
        </span>
      </div>

    </aside>
  );
}
