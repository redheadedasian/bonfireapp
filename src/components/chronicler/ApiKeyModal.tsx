import React, { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../../services/geminiChronicler';
import { Key, Shield, CheckCircle2, AlertCircle, X, ExternalLink, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getStoredApiKey();
      setApiKey(existing);
      setIsSaved(Boolean(existing));
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please provide a valid Gemini API key.');
      return;
    }
    setStoredApiKey(apiKey.trim());
    setIsSaved(true);
    setError(null);
    onKeySaved?.();
    onClose();
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKey('');
    setIsSaved(false);
    onKeySaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-lg bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#161616]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#141414]/15">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 border border-black/10 rounded">
              <Key size={18} className="text-[var(--accent-ink)]" />
            </div>
            <h3 className="font-display text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
              Gemini API Key Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#777777] hover:text-[#161616] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-sm text-[#161616]">
          <p className="font-serif leading-relaxed text-xs sm:text-sm text-[#555555]">
            To enable transcription and campaign event synthesis, configure your Google Gemini API key. Your key is stored strictly within your local browser storage and used directly for multi-modal audio analysis.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-display uppercase tracking-[0.1em] text-[#555555] font-bold flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {isSaved ? (
                <span className="flex items-center gap-1 text-[10px] text-[#1EB253] font-bold normal-case tracking-normal">
                  <CheckCircle2 size={12} /> Key Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-[var(--accent-ink)] font-bold normal-case tracking-normal">
                  <AlertCircle size={12} /> Key Required for New Transcriptions
                </span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] px-3.5 py-2.5 rounded-xs font-mono text-xs focus:outline-none transition-colors shadow-inner"
            />
            {error && <p className="text-xs text-[#c53030] font-bold mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#141414]/15 text-xs text-[#555555] shadow-xs">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[var(--accent-ink)]" />
              <span>Recommended Model: <strong className="text-[#161616]">gemini-3.7-flash</strong></span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[var(--accent-ink)] hover:underline font-display tracking-wider text-[11px] font-bold"
            >
              <span>Get API Key</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-t border-[#141414]/15">
          {isSaved ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#c53030] hover:bg-[#E33526]/10 border border-[#E33526]/30 rounded-xs font-display tracking-wider uppercase font-bold transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Key</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] transition-colors cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] font-display text-xs tracking-[0.1em] font-bold uppercase rounded-xs shadow-xs transition-all cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
