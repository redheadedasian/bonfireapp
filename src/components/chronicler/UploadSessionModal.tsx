import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { ChroniclerSession, SessionChroniclerData } from '../../types/session';
import { saveSession } from '../../services/sessionDb';
import { analyzeSessionAudio, hasConfiguredApiKey } from '../../services/geminiChronicler';
import { SAMPLE_SESSION_24 } from '../../data/sampleSession';
import { UploadCloud, FileAudio, CheckCircle2, AlertCircle, X, Sparkles, Plus, Trash2, Key } from 'lucide-react';

interface UploadSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: ChroniclerSession) => void;
  onOpenApiKeyModal: () => void;
  nextSessionNumber: number;
}

export function UploadSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
  onOpenApiKeyModal,
  nextSessionNumber
}: UploadSessionModalProps) {
  const { character } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number>(nextSessionNumber);
  const [sessionTitle, setSessionTitle] = useState<string>(`Session ${nextSessionNumber}: `);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [partyMembers, setPartyMembers] = useState<string[]>([
    character.name || 'Thorin Ironforge',
    'Lyra Nightbreeze',
    'Krag Stoutheart',
    'Zephyr Stormborn'
  ]);
  const [newMemberName, setNewMemberName] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      // Auto suggest title from file name if blank
      if (sessionTitle === `Session ${nextSessionNumber}: ` || !sessionTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setSessionTitle(`Session ${sessionNumber}: ${cleanName}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a', 'audio/webm', 'audio/ogg'];
      if (validTypes.includes(file.type) || file.name.match(/\.(mp3|m4a|wav|webm|ogg)$/i)) {
        setSelectedFile(file);
        setErrorMessage(null);
        if (sessionTitle === `Session ${nextSessionNumber}: ` || !sessionTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setSessionTitle(`Session ${sessionNumber}: ${cleanName}`);
        }
      } else {
        setErrorMessage('Unsupported file format. Please provide an MP3, M4A, WAV, WebM, or OGG audio file.');
      }
    }
  };

  const handleAddPartyMember = () => {
    if (newMemberName.trim() && !partyMembers.includes(newMemberName.trim())) {
      setPartyMembers([...partyMembers, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemovePartyMember = (index: number) => {
    setPartyMembers(partyMembers.filter((_, i) => i !== index));
  };

  const handleLoadDemoSession = async () => {
    setIsProcessing(true);
    setProgressStatus('Constructing chronicle report from campaign demo archive...');
    try {
      const newSession: ChroniclerSession = {
        ...SAMPLE_SESSION_24,
        id: 'session-' + Date.now(),
        sessionNumber: sessionNumber,
        sessionTitle: sessionTitle || `Session ${sessionNumber}: Depths of the Sunless Citadel`,
        date: date,
        partyMembers: partyMembers,
        createdAt: Date.now()
      };
      await saveSession(newSession);
      onSessionCreated(newSession);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to seed demo session.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drag an audio file to transcribe.');
      return;
    }

    if (!hasConfiguredApiKey()) {
      setErrorMessage('A Google Gemini API key is required for multi-modal audio transcription. Please configure your key.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStatus('Reading audio recording payload...');

    try {
      // 1. Analyze audio via Gemini
      const data: SessionChroniclerData = await analyzeSessionAudio(
        selectedFile,
        {
          sessionNumber,
          sessionTitle: sessionTitle || `Session ${sessionNumber}`,
          partyMembers
        },
        (status) => setProgressStatus(status)
      );

      // 2. Compute audio duration and create object URL
      let durationSeconds = 3600;
      let formattedDuration = '1h 00m';
      try {
        const audioUrl = URL.createObjectURL(selectedFile);
        const tempAudio = new Audio(audioUrl);
        await new Promise((res) => {
          tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              durationSeconds = Math.round(tempAudio.duration);
              const hrs = Math.floor(durationSeconds / 3600);
              const mins = Math.floor((durationSeconds % 3600) / 60);
              formattedDuration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
            }
            res(true);
          };
          tempAudio.onerror = () => res(true);
        });
      } catch (e) {
        // Fallback duration
      }

      // 3. Save into IndexedDB
      const newSession: ChroniclerSession = {
        id: 'session-' + Date.now(),
        sessionNumber,
        sessionTitle: sessionTitle || `Session ${sessionNumber}`,
        date,
        durationSeconds,
        formattedDuration,
        status: 'ready',
        audioBlob: selectedFile,
        audioFileName: selectedFile.name,
        audioFileSize: selectedFile.size,
        data,
        partyMembers,
        createdAt: Date.now()
      };

      await saveSession(newSession);
      onSessionCreated(newSession);
      onClose();
    } catch (err: any) {
      console.error('Session transcription failed:', err);
      setErrorMessage(err?.message || 'Failed to process audio session. Please verify your Gemini API key and file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const keyConfigured = hasConfiguredApiKey();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-[#161616]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#141414]/15">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <UploadCloud size={18} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm sm:text-base tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
              Upload Session Recording
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded text-[#777777] hover:text-[#161616] hover:bg-black/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 text-sm text-[#161616] max-h-[75vh] overflow-y-auto hide-scrollbar">
          
          {/* Audio Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              selectedFile
                ? 'bg-white border-[var(--accent-ink)] shadow-md'
                : 'bg-white/60 border-[#141414]/20 hover:border-black/40 hover:bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".mp3,.m4a,.wav,.webm,.ogg,audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-ink)]/15 border border-[var(--accent-ink)]/30 flex items-center justify-center text-[var(--accent-ink)] shadow-xs">
                  <FileAudio size={24} />
                </div>
                <div className="font-display text-sm text-[#161616] font-bold tracking-wide mt-1">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-[#555555] font-serif">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Audio Ready for Chronicler
                </div>
                <span className="text-[11px] text-[var(--accent-ink)] hover:underline mt-1 font-display uppercase tracking-wider font-bold">
                  Click to replace audio file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-[var(--accent-ink)]">
                  <UploadCloud size={24} />
                </div>
                <div className="font-display text-sm text-[#161616] font-bold tracking-wider mt-1">
                  Drag and drop session audio file here
                </div>
                <div className="text-xs text-[#555555] font-serif">
                  Supports MP3, M4A, WAV, WebM, and OGG formats (multi-hour recordings supported)
                </div>
                <div className="mt-2 px-3.5 py-1.5 rounded-xs bg-white border border-[#141414]/20 text-[11px] font-display uppercase tracking-widest text-[#161616] font-bold shadow-xs">
                  Browse Files
                </div>
              </div>
            )}
          </div>

          {/* Session Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-display uppercase tracking-[0.1em] text-[#555555] font-bold block mb-1.5">
                Session Number
              </label>
              <input
                type="number"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] px-3 py-2 rounded-xs font-serif text-sm focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-display uppercase tracking-[0.1em] text-[#555555] font-bold block mb-1.5">
                Session Title / Arc
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g., Session 24: Depths of the Sunless Citadel"
                className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] px-3 py-2 rounded-xs font-serif text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-display uppercase tracking-[0.1em] text-[#555555] font-bold block mb-1.5">
              Recording Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] px-3 py-2 rounded-xs font-serif text-sm focus:outline-none"
            />
          </div>

          {/* Party Members Roster for Personalized Spotlights */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-display uppercase tracking-[0.1em] text-[#555555] font-bold flex items-center justify-between">
              <span>Active Party Members (For Character Spotlights)</span>
              <span className="text-[var(--accent-ink)] font-serif normal-case font-bold">{partyMembers.length} Adventurers</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-[#141414]/15 rounded-xs min-h-[50px] items-center">
              {partyMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-black/5 border border-black/10 text-xs font-serif text-[#161616]"
                >
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePartyMember(i)}
                    className="text-[#777777] hover:text-[#c53030] transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPartyMember())}
                placeholder="Add companion name..."
                className="flex-1 bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] px-3 py-1.5 rounded-xs font-serif text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPartyMember}
                className="px-3 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs font-display text-xs uppercase tracking-wider font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* API Key Status Notice */}
          {!keyConfigured && (
            <div className="p-3.5 rounded bg-[var(--accent-ink)]/10 border border-[var(--accent-ink)]/30 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 text-[var(--accent-ink)]">
                <Key size={16} className="shrink-0 mt-0.5" />
                <div className="font-serif leading-relaxed text-[#161616]">
                  <strong>Gemini API Key Needed:</strong> To analyze newly uploaded audio recordings with AI, configure your Gemini key. Alternatively, you can click <em>Load Campaign Demo</em> to immediately experience the chronicler hub.
                </div>
              </div>
              <button
                onClick={onOpenApiKeyModal}
                className="px-3 py-1.5 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] font-display text-[10px] uppercase tracking-wider font-bold rounded-xs shrink-0 whitespace-nowrap shadow-xs cursor-pointer"
              >
                Set Key
              </button>
            </div>
          )}

          {/* Progress Status Bar during active transcription */}
          {isProcessing && (
            <div className="p-4 rounded bg-white border border-[var(--accent-ink)] shadow-md flex flex-col gap-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-display tracking-wider text-[var(--accent-ink)] font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin text-[var(--accent-ink)]" />
                  <span>Processing Session Audio</span>
                </span>
                <span>Please wait...</span>
              </div>
              <p className="font-serif text-xs text-[#555555] italic">
                {progressStatus}
              </p>
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden border border-black/10">
                <div className="h-full bg-[var(--accent-ink)] w-full animate-progress" />
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3 rounded bg-[#E33526]/15 border border-[#E33526]/40 flex items-center gap-2.5 text-xs text-[#c53030]">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-serif leading-relaxed font-bold">{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-t border-[#141414]/15 flex-wrap gap-3">
          
          <button
            type="button"
            onClick={handleLoadDemoSession}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xs bg-white border border-[#141414]/20 text-[#161616] hover:border-black/40 font-display text-xs uppercase tracking-wider font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Load ready-to-explore sample session with full transcript, timeline, and character spotlights"
          >
            <Sparkles size={13} className="text-[var(--accent-ink)]" />
            <span>Load Campaign Demo</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] transition-colors disabled:opacity-50 cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isProcessing || !selectedFile}
              className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] font-display text-xs tracking-[0.1em] font-bold uppercase rounded-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud size={15} />
              <span>Transcribe & Analyze</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
