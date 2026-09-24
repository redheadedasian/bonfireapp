import React, { useRef, useState } from 'react';
import { useStore } from '../../store';
import { formatModifier, compressImageDataUrl } from '../../utils';
import { Ability, Skill, ProficiencyLevel } from '../../types';
import { requestRoll } from '../dice/rollBus';
import { AbilityFrame } from '../character/AbilityFrame';
import { FramedPanel } from '../common/FramedPanel';
import { ASSET_MAP } from '@/config/assets';
import { Camera, Edit2 } from 'lucide-react';

const ABILITIES_ROW_1: Ability[] = ['str', 'dex', 'con'];
const ABILITIES_ROW_2: Ability[] = ['int', 'wis', 'cha'];

const ABILITY_FULL_NAMES: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
};

const ALL_ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const SKILL_DISPLAY_NAMES: Record<Skill, string> = {
  acrobatics: 'ACROBATICS',
  animalHandling: 'ANIMAL HANDLING',
  arcana: 'ARCANA',
  athletics: 'ATHLETICS',
  deception: 'DECEPTION',
  history: 'HISTORY',
  insight: 'INSIGHT',
  intimidation: 'INTIMIDATION',
  investigation: 'INVESTIGATION',
  medicine: 'MEDICINE',
  nature: 'NATURE',
  perception: 'PERCEPTION',
  performance: 'PERFORMANCE',
  persuasion: 'PERSUASION',
  religion: 'RELIGION',
  sleightOfHand: 'SLEIGHT OF HAND',
  stealth: 'STEALTH',
  survival: 'SURVIVAL'
};

const SAVES_LIST: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function LeftSidebar() {
  const {
    character,
    getAbilityModifier,
    getSkillModifier,
    getSavingThrowModifier,
    getProficiencyBonus,
    updateAbility,
    updateCharacterField,
    toggleSkillProficiency,
    updateSkillAbility,
    updateSkillBonus,
    toggleSavingThrowProficiency,
    updateSavingThrowBonus,
    setPortraitUrl,
    isEditMode
  } = useStore();

  const [isEditingSpecies, setIsEditingSpecies] = useState(false);
  const portraitInputRef = useRef<HTMLInputElement>(null);

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const rawData = event.target.result as string;
            const compressed = await compressImageDataUrl(rawData, 400, 0.88);
            setPortraitUrl(compressed);
          } catch {
            setPortraitUrl(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoll = (mod: number, label: string) => {
    if (!isEditMode) {
      requestRoll({ command: `1d20${mod >= 0 ? '+' : ''}${mod}`, label });
    }
  };

  const getNextProficiency = (current: ProficiencyLevel): ProficiencyLevel => {
    if (current === 'none') return 'proficient';
    if (current === 'proficient') return 'expertise';
    return 'none';
  };

  const profBonus = getProficiencyBonus();

  return (
    <aside className="w-[380px] min-w-[380px] max-w-[380px] shrink-0 h-full min-h-0 flex flex-col bg-transparent select-none relative z-10">
      <FramedPanel
        variant="sidebar"
        cornerSize={32}
        insetPadding="p-0"
        className="w-full h-full min-h-0"
        contentClassName="h-full w-full overflow-hidden flex flex-col min-h-0"
      >
        {/* Inner Scroll Container: smoothly scrolls all sections behind pinned frame corners */}
        <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pt-6 pb-20 flex flex-col gap-5">
          
          {/* 1. Character Portrait Frame & Header Block */}
          <div className="flex flex-col items-center text-center pt-1 pb-1">
            
            {/* Clickable Portrait Frame with character portrait watercolor border */}
            <div
              className="relative w-64 h-64 sm:w-68 sm:h-68 cursor-pointer group flex-shrink-0 mb-1 flex items-center justify-center isolate"
              onClick={() => portraitInputRef.current?.click()}
              title="Click to add or change character portrait"
            >
              {/* Dynamic Theme-Colored Watercolor Brush Splotch Border */}
              <div
                className="absolute inset-0 pointer-events-none z-10 select-none"
                aria-hidden="true"
              >
                <div
                  style={{
                    maskImage: `url("${ASSET_MAP.frames.characterPortrait.watercolor}")`,
                    WebkitMaskImage: `url("${ASSET_MAP.frames.characterPortrait.watercolor}")`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    backgroundColor: 'var(--accent-ink)',
                    opacity: 0.95,
                  }}
                  className="w-full h-full shrink-0 transition-colors duration-300 pointer-events-none filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                />
              </div>

              {/* Inner Circular Aperture for the Portrait Image */}
              <div 
                className="relative w-[62%] h-[62%] rounded-full bg-[#0a0806] flex items-center justify-center overflow-hidden z-0 border border-black/30 shadow-inner -translate-x-[2.5%] translate-y-[0.7%]"
              >
                {character.portraitUrl ? (
                  <img
                    src={character.portraitUrl}
                    alt={character.name}
                    className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d160e] via-[#0e0c0a] to-[#050505] text-[#C49A50] group-hover:text-[#F3D78A] transition-all duration-200 p-2 text-center select-none">
                    <Camera size={30} className="mb-1.5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                    <span className="font-gw2 font-bold text-xs tracking-[0.2em] uppercase text-[#C49A50] group-hover:text-[#F3D78A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      ADD PORTRAIT
                    </span>
                  </div>
                )}

                {/* Hover Change Hint Overlay */}
                {character.portraitUrl && (
                  <div 
                    className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-gw2 text-[#F3D78A] uppercase tracking-widest backdrop-blur-[1px] z-20 pointer-events-none"
                  >
                    <Camera size={24} className="mb-1 text-[#F3D78A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                    <span className="font-bold tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      CHANGE
                    </span>
                  </div>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={portraitInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePortraitUpload}
            />

          </div>

          {/* Proficiency Bonus Callout */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/80 rounded border border-[#141414]/15 shadow-xs">
            <span className="font-display text-xs text-[#555555] tracking-wider uppercase font-semibold">
              PROFICIENCY BONUS
            </span>
            {isEditMode ? (
              <input
                type="number"
                min={1}
                max={9}
                value={character.proficiencyBonusOverride ?? profBonus}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateCharacterField('proficiencyBonusOverride', isNaN(val) ? undefined : val);
                }}
                className="w-12 text-center bg-transparent border-b border-[var(--accent-ink)] text-[#161616] font-mono text-sm font-bold focus:outline-none"
              />
            ) : (
              <span className="font-mono text-sm sm:text-base font-bold text-[#1a1a1a] bg-[#fdfbf7] px-2.5 py-0.5 rounded border border-[#141414]/20 shadow-xs">
                +{profBonus}
              </span>
            )}
          </div>

          {/* 2. Ability Scores Section (3 COLUMNS ACROSS) */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between px-1">
              <div className="relative inline-flex items-center">
                <div
                  style={{
                    maskImage: `url("${ASSET_MAP.brushStrokes.brush9}")`,
                    WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush9}")`,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    backgroundColor: 'var(--accent-ink)',
                    opacity: 0.35,
                  }}
                  className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
                />
                <span className="relative z-10 font-gw2 text-xs sm:text-[13px] text-[#1a1a1a] tracking-[0.15em] uppercase font-bold">
                  ABILITY SCORES
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-sans font-semibold text-[#555555] uppercase tracking-wider">
                <span>SCORE</span>
                <span>MOD / SAVE</span>
              </div>
            </div>

            {/* Row 1: STR, DEX, CON */}
            <div className="grid grid-cols-3 gap-2 w-[90%] mx-auto">
              {ABILITIES_ROW_1.map((ab) => (
                <AbilityFrame
                  key={ab}
                  ability={ab}
                  fullName={ABILITY_FULL_NAMES[ab]}
                  score={character.abilities[ab].score}
                  modifier={getAbilityModifier(ab)}
                  onRoll={(mod, label) => handleRoll(mod, label)}
                  onUpdateScore={(score) => updateAbility(ab, score)}
                  isEditMode={isEditMode}
                />
              ))}
            </div>

            {/* Row 2: INT, WIS, CHA */}
            <div className="grid grid-cols-3 gap-2 w-[90%] mx-auto">
              {ABILITIES_ROW_2.map((ab) => (
                <AbilityFrame
                  key={ab}
                  ability={ab}
                  fullName={ABILITY_FULL_NAMES[ab]}
                  score={character.abilities[ab].score}
                  modifier={getAbilityModifier(ab)}
                  onRoll={(mod, label) => handleRoll(mod, label)}
                  onUpdateScore={(score) => updateAbility(ab, score)}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          </div>

          {/* 3. Saving Throws Section (2-Column Grid matching reference) */}
          <div className="flex flex-col gap-2 w-full">
            <div className="relative flex items-center justify-between px-1 py-0.5">
              <div className="relative inline-flex items-center">
                <div
                  style={{
                    maskImage: `url("${ASSET_MAP.brushStrokes.brush7}")`,
                    WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush7}")`,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    backgroundColor: 'var(--accent-ink)',
                    opacity: 0.35,
                  }}
                  className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
                />
                <span className="relative z-10 font-gw2 text-xs sm:text-[13px] text-[#1a1a1a] tracking-[0.15em] uppercase font-bold">
                  SAVING THROWS
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] font-sans font-semibold text-[#555555] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <img src={ASSET_MAP.savingThrows.filled} alt="Proficient" className="w-3 h-3 object-contain inline-block" />
                PROFICIENT SAVE
              </span>
              <span>SAVE MODIFIER</span>
            </div>

            <div className="relative grid grid-cols-2 gap-x-5 gap-y-1.5 px-1 py-1">
              {/* Faint vertical divider line between the two columns/tracks */}
              <div className="absolute left-1/2 top-0.5 bottom-0.5 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none" />

              {SAVES_LIST.map((ab) => {
                const isProf = character.abilities[ab].savingThrowProficiency === 'proficient' ||
                               character.abilities[ab].savingThrowProficiency === 'expertise';
                const isExp = character.abilities[ab].savingThrowProficiency === 'expertise';
                const saveMod = getSavingThrowModifier(ab);
                const customBonus = character.abilities[ab].customBonus || 0;

                return (
                  <div
                    key={ab}
                    onClick={() => {
                      if (!isEditMode) {
                        handleRoll(saveMod, `${ABILITY_FULL_NAMES[ab]} Save`);
                      }
                    }}
                    className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors group select-none ${
                      !isEditMode ? 'cursor-pointer hover:bg-black/5' : 'bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Sumi-e Circle Dot - Fully interactive in BOTH modes */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavingThrowProficiency(ab, getNextProficiency(character.abilities[ab].savingThrowProficiency));
                        }}
                        className="w-4 h-4 flex items-center justify-center transition-transform cursor-pointer shrink-0 hover:scale-110 active:scale-95"
                        title={`Saving Throw Proficiency: ${character.abilities[ab].savingThrowProficiency}. Click to cycle none / proficient / expertise.`}
                      >
                        <img
                          src={isProf ? ASSET_MAP.savingThrows.filled : ASSET_MAP.savingThrows.open}
                          alt={isProf ? 'Proficient' : 'Open'}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </button>
                      <span className="font-sans text-xs sm:text-[13px] text-[#161616] group-hover:text-[var(--accent-ink)] uppercase font-semibold">
                        {ab.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isEditMode && (
                        <input
                          type="number"
                          value={customBonus === 0 ? '' : customBonus}
                          placeholder="+0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateSavingThrowBonus(ab, isNaN(val) ? 0 : val);
                          }}
                          className="w-8 text-center bg-white border border-black/30 focus:border-[var(--accent-ink)] text-[#161616] font-mono text-xs rounded p-0.5 focus:outline-none"
                          title="Custom bonus / override"
                        />
                      )}
                      <span className={`font-mono text-xs sm:text-[13px] font-bold ${
                        isExp ? 'text-[var(--accent-ink)]' : isProf ? 'text-[#161616]' : 'text-[#555555]'
                      }`}>
                        {formatModifier(saveMod)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Skills Section (Matching Reference List) */}
          <div className="flex flex-col gap-2 w-full">
            <div className="relative flex items-center justify-between px-1 py-0.5">
              <div className="relative inline-flex items-center">
                <div
                  style={{
                    maskImage: `url("${ASSET_MAP.brushStrokes.brush6}")`,
                    WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush6}")`,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    backgroundColor: 'var(--accent-ink)',
                    opacity: 0.35,
                  }}
                  className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
                />
                <span className="relative z-10 font-gw2 text-xs sm:text-[13px] text-[#1a1a1a] tracking-[0.15em] uppercase font-bold">
                  SKILLS
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] font-sans font-semibold text-[#555555] uppercase tracking-wider">
              <span>18 CORE SKILLS</span>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <img src={ASSET_MAP.skills.filled} alt="Prof" className="w-3 h-3 object-contain inline-block" />
                  PROF
                </span>
                <span className="flex items-center gap-1 text-[var(--accent-ink)] font-bold">
                  <img src={ASSET_MAP.skills.expertise} alt="Exp" className="w-3 h-3 object-contain inline-block" />
                  EXP
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 px-0.5">
              {(Object.keys(character.skills) as Skill[]).map((skillKey) => {
                const skill = character.skills[skillKey];
                const mod = getSkillModifier(skillKey);
                const isProf = skill.proficiency === 'proficient';
                const isExp = skill.proficiency === 'expertise';
                const skillName = SKILL_DISPLAY_NAMES[skillKey] || skillKey.toUpperCase();
                const customBonus = skill.customBonus || 0;

                return (
                  <div
                    key={skillKey}
                    onClick={() => {
                      if (!isEditMode) {
                        handleRoll(mod, `${skillName} (${skill.ability.toUpperCase()})`);
                      }
                    }}
                    className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors group select-none ${
                      !isEditMode ? 'cursor-pointer hover:bg-black/5' : 'bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Sumi-e Proficiency Indicator Diamond - Clickable in BOTH modes */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkillProficiency(skillKey, getNextProficiency(skill.proficiency));
                        }}
                        className="w-4 h-4 flex items-center justify-center transition-transform cursor-pointer shrink-0 hover:scale-110 active:scale-95"
                        title={`Proficiency: ${skill.proficiency}. Click to cycle none / proficient / expertise.`}
                      >
                        <img
                          src={
                            isExp
                              ? ASSET_MAP.skills.expertise
                              : isProf
                              ? ASSET_MAP.skills.filled
                              : ASSET_MAP.skills.empty
                          }
                          alt={skill.proficiency}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </button>

                      <span className="font-sans text-xs sm:text-[13px] font-medium text-[#161616] group-hover:text-[var(--accent-ink)] truncate">
                        {skillName}
                      </span>

                      {/* Governing Ability Selector in edit mode or label */}
                      {isEditMode ? (
                        <select
                          value={skill.ability}
                          onChange={(e) => updateSkillAbility(skillKey, e.target.value as Ability)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white text-[11px] text-[#161616] border border-black/30 rounded px-1 py-0 font-mono focus:outline-none"
                          title="Change governing ability"
                        >
                          {ALL_ABILITIES.map((ab) => (
                            <option key={ab} value={ab}>
                              {ab}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-mono text-[11px] text-[#777777] lowercase">
                          ({skill.ability})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isEditMode && (
                        <input
                          type="number"
                          value={customBonus === 0 ? '' : customBonus}
                          placeholder="+0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateSkillBonus(skillKey, isNaN(val) ? 0 : val);
                          }}
                          className="w-8 text-center bg-white border border-black/30 focus:border-[var(--accent-ink)] text-[#161616] font-mono text-xs rounded p-0.5 focus:outline-none"
                          title="Custom bonus / override"
                        />
                      )}
                      <span className={`font-mono text-xs sm:text-[13px] font-bold ${
                        isExp ? 'text-[var(--accent-ink)]' : isProf ? 'text-[#161616]' : 'text-[#555555]'
                      }`}>
                        {formatModifier(mod)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </FramedPanel>
    </aside>
  );
}
