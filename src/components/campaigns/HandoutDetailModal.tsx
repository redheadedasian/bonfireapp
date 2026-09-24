import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandoutItem } from '../../types/campaign';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { X, Eye, EyeOff, Tag, Calendar, User, MapPin } from 'lucide-react';

interface HandoutDetailModalProps {
  handout: HandoutItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleVisibility?: (id: string) => void;
}

export function HandoutDetailModal({
  handout,
  isOpen,
  onClose,
  onToggleVisibility
}: HandoutDetailModalProps) {
  if (!handout) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050504]/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 text-[#161616]"
          >
            {/* Header */}
            <div className="border-b border-[#141414]/15 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="bg-[var(--accent-ink)]/15 text-[var(--accent-ink)] px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-widest font-bold">
                  {handout.type}
                </span>
                <h3 className="font-display text-base uppercase tracking-wider text-[#1a1a1a] font-bold truncate">
                  {handout.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onToggleVisibility && (
                  <button
                    onClick={() => onToggleVisibility(handout.id)}
                    className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
                      handout.isRevealedToParty
                        ? 'bg-[#1EB253]/15 border-[#1EB253]/40 text-[#1EB253] font-bold'
                        : 'bg-[#E33526]/15 border-[#E33526]/40 text-[#c53030] font-bold'
                    }`}
                  >
                    {handout.isRevealedToParty ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{handout.isRevealedToParty ? 'Revealed to Party' : 'DM Only (Hidden)'}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded flex items-center justify-center border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 overflow-y-auto hide-scrollbar flex flex-col gap-5">
              
              {/* Optional Handout Image / Map */}
              {handout.imageUrl && (
                <div className="w-full rounded-sm overflow-hidden border border-[#141414]/20 shadow-md bg-white max-h-96 flex items-center justify-center">
                  <img
                    src={handout.imageUrl}
                    alt={handout.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Handout Parchment Text */}
              <div className="p-5 bg-white/90 border border-[#141414]/15 rounded-sm shadow-xs">
                <p className="font-serif text-sm text-[#161616] leading-relaxed whitespace-pre-wrap">
                  {handout.content}
                </p>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-serif text-[#555555] pt-2 border-t border-[#141414]/15">
                <div className="flex items-center gap-4">
                  {handout.authorOrSource && (
                    <div className="flex items-center gap-1">
                      <User size={13} className="text-[var(--accent-ink)]" />
                      <span>Source: <strong className="text-[#161616]">{handout.authorOrSource}</strong></span>
                    </div>
                  )}
                  {handout.tags && handout.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag size={12} className="text-[#777777]" />
                      {handout.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-white border border-[#141414]/20 text-[10px] font-display uppercase tracking-wider text-[#555555] rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#777777]">
                  <Calendar size={12} />
                  <span>Added {new Date(handout.dateAdded || (handout as any).createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
