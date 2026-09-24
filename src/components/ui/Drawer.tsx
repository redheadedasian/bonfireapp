import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils';
import { Button } from './index';

export function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children,
  side = 'right'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  side?: 'left' | 'right';
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    hidden: { x: side === 'right' ? '100%' : '-100%' },
    visible: { x: 0 },
    exit: { x: side === 'right' ? '100%' : '-100%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div 
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 bottom-0 w-full md:w-[500px] bg-[#fcfbf9] text-[#161616] z-50 flex flex-col p-4 shadow-2xl border-l-2 border-black/30",
              side === 'right' ? "right-0" : "left-0"
            )}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-[#141414]/15 bg-white/90 rounded-t">
              <h2 className="font-display text-[#161616] text-lg tracking-widest uppercase font-bold">{title}</h2>
              <Button variant="ghost" onClick={onClose} className="text-[#555555] hover:text-[#161616] cursor-pointer">
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
