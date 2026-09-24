import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToastStore, ToastNotification } from '../../store/toastStore';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, X, Lock } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((toast: ToastNotification) => {
          const isWarning = toast.type === 'warning' || toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-xl border-2 shadow-2xl flex items-start gap-3.5 backdrop-blur-md relative overflow-hidden ${
                isWarning
                  ? 'bg-white/98 border-red-400 text-red-950 shadow-lg'
                  : 'bg-white/98 border-black/30 text-[#161616] shadow-lg'
              }`}
            >
              {/* Crest Accents */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isWarning
                    ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600'
                    : 'bg-gradient-to-r from-transparent via-[var(--accent-ink)] to-transparent'
                }`}
              />

              {/* Icon */}
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                  isWarning
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-black/5 border-black/15 text-[var(--accent-ink)]'
                }`}
              >
                {isWarning ? <Lock size={18} className="animate-pulse" /> : <Info size={18} />}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span
                  className={`font-display text-xs uppercase tracking-widest font-bold ${
                    isWarning ? 'text-red-700' : 'text-[#161616]'
                  }`}
                >
                  {isWarning ? 'Access Restricted' : 'Notice'}
                </span>
                <p className="font-serif text-xs leading-relaxed text-[#2a2a2a]">
                  {toast.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-sm text-[#777777] hover:text-[#161616] hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
