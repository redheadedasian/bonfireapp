import React, { useState, useEffect } from 'react';
import { ChroniclerSession } from '../../types/session';
import { getAllSessions, seedDefaultSessionIfEmpty, deleteSession } from '../../services/sessionDb';
import { SessionArchiveRail } from './SessionArchiveRail';
import { SessionActiveViewer } from './SessionActiveViewer';
import { UploadSessionModal } from './UploadSessionModal';
import { ApiKeyModal } from './ApiKeyModal';
import { Scroll, Sparkles } from 'lucide-react';

export function SessionChroniclerTab() {
  const [sessions, setSessions] = useState<ChroniclerSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Load sessions from IndexedDB
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const loaded = await seedDefaultSessionIfEmpty();
      setSessions(loaded);
      if (loaded.length > 0 && !activeSessionId) {
        setActiveSessionId(loaded[0].id);
      }
    } catch (err) {
      console.error('Failed to load chronicler sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSessionCreated = (newSession: ChroniclerSession) => {
    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-transparent overflow-hidden select-none">
      
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#555555]">
          <Scroll size={36} className="text-[var(--accent-ink)] animate-pulse" />
          <span className="font-display text-xs uppercase tracking-[0.2em] text-[#161616] font-bold">
            Opening Campaign Chronicles...
          </span>
        </div>
      ) : (
        <>
          {/* Left Archive Rail (30%) */}
          <SessionArchiveRail
            sessions={sessions}
            activeSessionId={activeSessionId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectSession={setActiveSessionId}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onDeleteSession={handleDeleteSession}
          />

          {/* Right Active Viewer Stage (70%) */}
          {activeSession ? (
            <SessionActiveViewer session={activeSession} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#555555] gap-3">
              <Scroll size={48} className="text-[#141414]/20" />
              <h3 className="font-serif text-lg text-[#161616] font-bold">No Session Selected</h3>
              <p className="font-serif text-xs max-w-sm">
                Select an existing chronicle from the left archive or upload a new audio session to transcribe and analyze.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-2 px-4 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] font-display text-xs uppercase tracking-wider rounded-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                + Upload Session Recording
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <UploadSessionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSessionCreated={handleSessionCreated}
        onOpenApiKeyModal={() => {
          setIsUploadModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        nextSessionNumber={sessions.length + 1}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

    </div>
  );
}
