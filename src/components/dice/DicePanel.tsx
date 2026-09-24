import React, { useState, useEffect } from 'react';
import DiceRoller from './DiceRoller';
import { useStore } from '../../store';
import { onRollRequest } from './rollBus';

export function DicePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const character = useStore(state => state.character);

  // Auto-open panel when a roll is requested
  useEffect(() => {
    return onRollRequest(() => {
      setIsOpen(true);
    });
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-white/[0.96] border-2 border-black/30 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center justify-center hover:scale-110 hover:border-[var(--accent-ink)] hover:drop-shadow-[0_0_12px_var(--accent-glow)] active:scale-95 transition-all group cursor-pointer"
        title="Open 3D Dice Roller"
      >
        <div className="absolute inset-1 rounded-full border border-black/15 pointer-events-none group-hover:border-[var(--accent-ink)] transition-colors" />
        <span className="font-edo text-[#161616] text-xl font-bold group-hover:text-[var(--accent-ink)] transition-colors">d20</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 w-full sm:w-[440px] bg-[#fcfbf9] washi-bg text-[#161616] border-r-2 border-black/30 shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 p-5 sm:p-6 overflow-hidden flex flex-col pt-8">
          <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-[#141414]/15 pb-3">
            <h2 className="font-display text-[#161616] tracking-[0.18em] text-lg uppercase font-bold">Dice Roller & 3D Physics</h2>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[#555555] hover:text-[#161616] text-2xl font-serif p-1 hover:bg-black/5 rounded cursor-pointer leading-none"
            >
              &times;
            </button>
          </div>
          <div className="flex-1 min-h-0 relative">
            <DiceRoller character={character} />
          </div>
        </div>
      </div>
    </>
  );
}
