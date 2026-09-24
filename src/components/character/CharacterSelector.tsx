import React from 'react';
import { useStore } from '../../store';
import { ChevronDown, User } from 'lucide-react';
import characterSelectorSvg from '../ui/character selecter.svg';

interface CharacterSelectorProps {
  onOpenModal: () => void;
  className?: string;
}

export function CharacterSelector({ onOpenModal, className = '' }: CharacterSelectorProps) {
  const { character } = useStore();

  return (
    <div
      onClick={onOpenModal}
      className={`relative cursor-pointer select-none group transition-all duration-200 hover:brightness-110 active:scale-[0.99] shrink-0 w-[290px] sm:w-[320px] h-[50px] sm:h-[54px] ${className}`}
      title="Character Codex & Hero Switcher"
      id="character-selector-btn"
    >
      {/* Background Frame SVG */}
      <img
        src={characterSelectorSvg}
        alt="Character Selector Frame"
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
        draggable={false}
      />

      {/* 1. Left Socket: Circular Avatar cleanly centered inside the medallion ring with margin */}
      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center pointer-events-none shadow-inner ring-1 ring-black/50"
        style={{
          left: '10.85%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          height: '58%',
          aspectRatio: '1 / 1',
        }}
      >
        {character.portraitUrl ? (
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1c1c1c] text-white">
            {character.name ? (
              <span className="font-display font-bold text-xs sm:text-sm tracking-wider text-white">
                {character.name.charAt(0)}
              </span>
            ) : (
              <User size={14} className="text-[#888888]" />
            )}
          </div>
        )}
      </div>

      {/* 2. Middle Text Area: Character Name & Level/Class fitted to plaque interior without clipping */}
      <div 
        className="absolute inset-y-0 left-[21.5%] right-[17.5%] flex flex-col justify-center px-1.5 pointer-events-none min-w-0 overflow-hidden"
      >
        <div className="flex items-center min-w-0">
          <span className="font-display font-bold text-[12px] sm:text-[13.5px] tracking-wider text-white uppercase group-hover:text-white transition-colors truncate">
            {character.name}
          </span>
        </div>

        <div className="flex items-center mt-0.5 min-w-0">
          <span className="font-serif italic text-[11px] sm:text-xs text-[#cccccc] tracking-wide font-normal truncate">
            Lv. {character.level} {character.class}
          </span>
        </div>
      </div>

      {/* 3. Right Dropdown Chevron: Vertically and horizontally centered inside the endcap plaque */}
      <div 
        className="absolute inset-y-0 right-0 w-[16%] flex items-center justify-center pointer-events-none"
      >
        <div className="flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
          <ChevronDown 
            size={16} 
            strokeWidth={2.5} 
            className="transition-transform duration-200 group-hover:translate-y-[1px]" 
          />
        </div>
      </div>
    </div>
  );
}

export default CharacterSelector;
