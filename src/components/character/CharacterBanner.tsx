import React from 'react';
import { CharacterState } from '../../types';
import { ASSET_MAP } from '@/config/assets';
import { Shield, Heart, Zap, Sparkles, Award } from 'lucide-react';

interface CharacterBannerProps {
  character: CharacterState;
  className?: string;
}

export function CharacterBanner({ character, className = '' }: CharacterBannerProps) {
  const hpPercent = Math.min(100, Math.max(0, Math.round(((character.hp?.current ?? 25) / Math.max(1, character.hp?.max ?? 25)) * 100)));

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-2 border-black/40 bg-white/95 text-[#161616] shadow-xl select-none ${className}`}
      id="character-banner-vignette"
    >
      {/* Background Painted Brush Wash with Dynamic Accent Color */}
      <div
        className="absolute -right-6 -bottom-14 w-[110%] h-[160%] pointer-events-none z-0"
        aria-hidden="true"
      >
        <div
          style={{
            maskImage: `url("${ASSET_MAP.brushStrokes.heroBanner}")`,
            WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.heroBanner}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            backgroundColor: 'var(--accent-ink)',
            opacity: 0.25,
          }}
          className="w-full h-full shrink-0 transition-colors duration-300 pointer-events-none"
        />
      </div>

      {/* 1. Hero Content */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-16 h-16 rounded-full border-2 border-black/30 overflow-hidden shadow-md shrink-0 bg-[#141210]">
            {character.portraitUrl ? (
              <img
                src={character.portraitUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-xl font-bold text-white">
                {character.name?.charAt(0) || 'H'}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-gw2 text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#161616] truncate">
                {character.name}
              </h2>
              {character.inspiration && (
                <span className="px-2.5 py-0.5 rounded text-xs font-gw2 uppercase tracking-wider bg-[var(--accent-ink)] text-white font-bold animate-pulse shadow">
                  ★ Inspired
                </span>
              )}
            </div>

            <p className="font-serif italic text-sm text-[#555555] mt-0.5 truncate">
              Level {character.level} {character.class} • {character.species || 'Hero'} • {character.alignment || 'Neutral Good'}
            </p>
          </div>
        </div>

        {/* Right: Vitals Readouts */}
        <div className="flex items-center gap-3.5 bg-white/80 px-4 py-2.5 rounded-lg border border-black/15 shadow-sm shrink-0">
          
          {/* Health */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-gw2 uppercase text-[#555555] tracking-wider font-semibold">Health</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#161616]">
              {character.hp?.current ?? 25} / {character.hp?.max ?? 25}
            </span>
          </div>

          <div className="w-[1px] h-7 bg-black/15" />

          {/* AC */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-gw2 uppercase text-[#555555] tracking-wider font-semibold">AC</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[var(--accent-ink)]">
              {character.ac ?? 14}
            </span>
          </div>

          <div className="w-[1px] h-7 bg-black/15" />

          {/* Speed */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-display uppercase text-[#555555] tracking-wider font-semibold">Speed</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#161616]">
              {character.speed ?? 30} ft
            </span>
          </div>

          <div className="w-[1px] h-7 bg-black/15" />

          {/* Passive Perception */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-display uppercase text-[#555555] tracking-wider font-semibold">Perception</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[var(--accent-ink)]">
              {10 + Math.floor(((character.abilities?.wis?.score ?? 10) - 10) / 2) + (character.skills?.perception?.proficiency === 'proficient' ? 4 : character.skills?.perception?.proficiency === 'expertise' ? 8 : 0)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CharacterBanner;
