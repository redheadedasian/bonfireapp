import React from 'react';
import { useStore } from '../../store';
import { ACCENT_THEMES, AccentColorKey } from '../../types';
import { Palette, Sparkles, Check } from 'lucide-react';

interface ThemeColorPickerProps {
  compact?: boolean;
  className?: string;
}

export function ThemeColorPicker({ compact = false, className = '' }: ThemeColorPickerProps) {
  const { character, setAccentColor } = useStore();
  const currentAccent = character.theme?.accentColor || 'default';

  const themesList = Object.values(ACCENT_THEMES);

  return (
    <div className={`flex flex-col gap-2 select-none text-[#161616] ${className}`}>
      {!compact && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-[#161616] font-bold">
            <Palette size={14} className="text-[var(--accent-ink)]" />
            <span>Watercolor Ink Palette</span>
          </div>
          <span className="text-[11px] font-serif text-[#555555]">
            {ACCENT_THEMES[currentAccent]?.name} ({ACCENT_THEMES[currentAccent]?.archetype})
          </span>
        </div>
      )}

      {/* Sumi-e Circular Ink-Drop Swatches */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 p-2 bg-black/5 rounded-md border border-black/15 shadow-inner">
        {themesList.map((t) => {
          const isSelected = currentAccent === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setAccentColor(t.key)}
              className={`relative rounded-full transition-all duration-200 cursor-pointer group flex items-center justify-center ${
                compact ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-8 sm:h-8'
              } ${
                isSelected
                  ? 'scale-110 ring-2 ring-black ring-offset-2 ring-offset-white shadow-md'
                  : 'hover:scale-105 opacity-85 hover:opacity-100 hover:ring-1 hover:ring-black/40'
              }`}
              style={{ backgroundColor: t.ink }}
              title={`${t.name} — ${t.archetype}`}
              aria-label={`Select ${t.name} theme`}
            >
              {/* Organic Sumi-e Ink Texture Layer */}
              <span
                className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 60%)',
                }}
              />

              {/* Hover Glow Corona */}
              <span
                className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xs"
                style={{ backgroundColor: t.glow }}
              />

              {/* Active Indicator Checkmark */}
              {isSelected && (
                <Check
                  size={compact ? 12 : 14}
                  className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] z-10 animate-scaleIn"
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeColorPicker;
