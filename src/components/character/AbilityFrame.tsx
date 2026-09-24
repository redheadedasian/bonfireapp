import React, { useState, useRef, useEffect } from 'react';
import { Ability } from '../../types';
import { formatModifier } from '../../utils';
import { ASSET_MAP } from '@/config/assets';
import { AbilityBrushStroke } from './AbilityBrushStroke';

interface AbilityFrameProps {
  key?: React.Key;
  ability: Ability;
  fullName: string;
  score: number;
  modifier: number;
  isEditMode: boolean;
  onRoll: (mod: number, label: string) => void;
  onUpdateScore: (val: number) => void;
}

export function AbilityFrame({
  ability,
  fullName,
  score,
  modifier,
  isEditMode,
  onRoll,
  onUpdateScore,
}: AbilityFrameProps) {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [localScore, setLocalScore] = useState(score.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalScore(score.toString());
  }, [score]);

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInlineEditing]);

  const formattedMod = formatModifier(modifier);
  const frameSvg = ASSET_MAP.frames.abilityFrame.svg;
  const upperAbility = ability.toUpperCase();

  const handleScoreChange = (valStr: string) => {
    setLocalScore(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) {
      onUpdateScore(parsed);
    }
  };

  const handleModifierChange = (modStr: string) => {
    const parsedMod = parseInt(modStr, 10);
    if (!isNaN(parsedMod)) {
      // mod = Math.floor((score - 10) / 2) => score = 10 + mod * 2
      const derivedScore = Math.max(1, Math.min(30, 10 + parsedMod * 2));
      onUpdateScore(derivedScore);
    }
  };

  const handleBlur = () => {
    setIsInlineEditing(false);
    const parsed = parseInt(localScore, 10);
    if (isNaN(parsed) || parsed < 1) {
      onUpdateScore(10);
      setLocalScore('10');
    } else if (parsed > 30) {
      onUpdateScore(30);
      setLocalScore('30');
    }
  };

  return (
    <div
      className={`ability-card relative w-full flex-shrink-0 min-w-0 select-none flex flex-col items-center justify-center transition-transform duration-150 aspect-[486/1254] group isolate ${
        !isEditMode && !isInlineEditing ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.97]' : ''
      }`}
      onClick={() => {
        if (!isEditMode && !isInlineEditing) {
          onRoll(modifier, `${upperAbility} Check`);
        }
      }}
      title={!isEditMode && !isInlineEditing ? `${fullName} (${score}): Click frame to roll check, or click score below to edit` : undefined}
    >
      {/* Procedural Sumi-e Calligraphic Brush Stroke Background */}
      <AbilityBrushStroke ability={ability} />

      {/* Bundled Ability Frame Vector (src/assets/panel/ability scores.svg) */}
      <img
        src={frameSvg}
        alt={`${fullName} Frame`}
        className="frame-border w-full h-full object-contain pointer-events-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 z-[2]"
      />

      {/* Top Ability Label: Centered in upper plaque with GWTwoFont */}
      <div className="absolute top-[21%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-[3]">
        <span className="font-gw2 font-bold text-xs sm:text-sm text-[#f8f5ee] tracking-[0.14em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] select-none leading-none">
          {upperAbility}
        </span>
      </div>

      {/* Hero Modifier Display - enlarged and centered in the upper section below divider */}
      <div className="absolute top-[44.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-[3]">
        {isEditMode ? (
          <div className="flex items-center justify-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={formattedMod}
              onChange={(e) => handleModifierChange(e.target.value.replace('+', ''))}
              className="w-14 text-center bg-black/80 border border-[#6F5326] focus:border-[#C49A50] text-[#FFF5DC] font-edo font-bold text-2xl sm:text-3xl rounded p-0 focus:outline-none shadow-lg"
              title="Edit modifier or edit score below"
            />
          </div>
        ) : (
          <span className="font-edo font-bold text-3xl sm:text-4xl md:text-[42px] text-[#FFFFFF] drop-shadow-[0_3px_8px_rgba(0,0,0,0.98)] select-none leading-none block tracking-tight pointer-events-none">
            {formattedMod}
          </span>
        )}
      </div>

      {/* Base Score Display (or Edit Input) - centered inside the lower gold ring */}
      <div 
        className="absolute top-[76.6%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditMode) {
            setIsInlineEditing(true);
          }
        }}
      >
        {isEditMode || isInlineEditing ? (
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={30}
            value={localScore}
            onChange={(e) => handleScoreChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                handleBlur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-8 sm:w-9 text-center bg-black border border-[#C49A50] text-[#FFF2D0] font-edo text-sm sm:text-base font-bold rounded-sm p-0.5 focus:outline-none shadow-[0_0_8px_rgba(196,154,80,0.6)]"
            title="Type ability score (1-30)"
          />
        ) : (
          <span 
            className="font-edo font-bold text-base sm:text-lg md:text-[20px] text-[#FFFFFF] hover:text-[#f3d78a] hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] select-none leading-none cursor-pointer transition-all"
            title="Click to edit score"
          >
            {score}
          </span>
        )}
      </div>
    </div>
  );
}
