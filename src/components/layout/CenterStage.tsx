import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { CombatTab } from '../tabs/CombatTab';
import { InventoryTab } from '../tabs/InventoryTab';
import { JournalTab } from '../tabs/JournalTab';
import { SessionChroniclerTab } from '../chronicler/SessionChroniclerTab';
import { DeathSavesWidget } from '../combat/DeathSavesWidget';

const GrimoireDrawer = React.lazy(() => import('../tabs/GrimoireDrawer').then(m => ({ default: m.GrimoireDrawer })));
const ArmoryDrawer = React.lazy(() => import('../tabs/ArmoryDrawer').then(m => ({ default: m.ArmoryDrawer })));
import { ArmorClassMedallion } from '../character/ArmorClassMedallion';
import { ExperienceBar } from '../character/ExperienceBar';
import { HitPointsBar } from '../vitals/HitPointsBar';
import { VitalsStrip } from '../vitals/VitalsStrip';
import { FramedPanel } from '../common/FramedPanel';
import { requestRoll } from '../dice/rollBus';
import { compressImageDataUrl } from '../../utils';
import { Upload } from 'lucide-react';

export function CenterStage() {
  const {
    character,
    activeTab,
    updateCharacterField,
    updateHP,
    rollDeathSave,
    setHeroUrl,
    isGrimoireOpen,
    setGrimoireOpen,
    isArmoryOpen,
    setArmoryOpen,
    isEditMode,
    getProficiencyBonus
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const rawData = event.target.result as string;
            const compressed = await compressImageDataUrl(rawData, 960, 0.82);
            setHeroUrl(compressed);
          } catch {
            setHeroUrl(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    const current = character.deathSaves[type];
    const next = current === index ? index - 1 : index;
    updateCharacterField('deathSaves', {
      ...character.deathSaves,
      [type]: next
    });
  };

  const handleQuickRollDeathSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const roll = Math.floor(Math.random() * 20) + 1;
    requestRoll({
      command: '1d20',
      label: `Death Saving Throw (Result: ${roll})`
    });
    rollDeathSave(roll);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar px-3 sm:px-6 lg:px-8 py-6 pb-28 relative bg-transparent select-none">
      
      <div className="relative z-10 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        
        {/* 1. Character Header Card & Hero Banner */}
        <FramedPanel
          variant="default"
          cornerSize={36}
          insetPadding="p-0"
          className="w-full relative group/banner shrink-0 h-auto"
          contentClassName="flex flex-col items-center overflow-hidden h-auto"
        >
          {/* Integrated Hero Banner Header */}
          <div
            className="relative w-full h-44 sm:h-52 cursor-pointer overflow-hidden flex flex-col justify-end items-center pb-4 px-4 border-b border-[#141414]/15 bg-white/30"
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload Hero Banner"
          >
            {/* Background Image / Texture */}
            {character.heroUrl ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={character.heroUrl}
                  className="w-full h-full object-cover opacity-70 group-hover/banner:opacity-85 transition-all duration-300"
                  style={{
                    maskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 95%), linear-gradient(to bottom, black 60%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 95%), linear-gradient(to bottom, black 60%, transparent 100%)',
                  }}
                  alt="Hero Banner"
                />
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                {/* Atmospheric Washi Calligraphic Banner Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8e2d8]/60 via-[#f4efe6]/80 to-[#e8e2d8]/60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(201,151,66,0.12)_0%,_transparent_65%)]" />
                
                {/* Subtle Filigree Runes Silhouette */}
                <div className="absolute inset-0 opacity-10 flex items-center justify-between px-12 pointer-events-none select-none">
                  <div className="w-32 h-32 border-2 border-black/30 rotate-45 rounded-xl border-dashed" />
                  <div className="w-44 h-44 border border-black/30 rotate-12 rounded-full border-dotted" />
                  <div className="w-32 h-32 border-2 border-black/30 -rotate-45 rounded-xl border-dashed" />
                </div>
              </div>
            )}

            {/* Translucent overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent pointer-events-none" />

            {/* Upload Button overlay on hover */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#1a1a1a] hover:text-[var(--accent-ink)] border border-[#141414]/20 px-2.5 py-1 rounded-md text-[10px] font-display uppercase tracking-wider opacity-0 group-hover/banner:opacity-100 transition-opacity shadow-sm backdrop-blur-sm z-20 cursor-pointer">
              <Upload size={13} />
              <span>Change Banner</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleHeroUpload}
            />

            {/* Character Title Block inside Hero Banner: THORIN IRONFORGE */}
            <div className="relative z-10 text-center flex flex-col items-center w-full max-w-2xl" onClick={(e) => isEditMode && e.stopPropagation()}>
              {isEditMode ? (
                <input
                  value={character.name}
                  onChange={(e) => updateCharacterField('name', e.target.value)}
                  className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#161616] tracking-[0.25em] uppercase font-bold bg-white/90 border border-black/30 focus:border-[var(--accent-ink)] px-3 py-1 rounded focus:outline-none text-center w-full max-w-md shadow-md"
                  placeholder="Character Name"
                />
              ) : (
                <h1
                  className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#161616] tracking-[0.22em] uppercase font-bold drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]"
                >
                  {character.name}
                </h1>
              )}

              <div className="h-[1.5px] w-72 sm:w-[420px] bg-gradient-to-r from-transparent via-[var(--accent-ink)]/60 to-transparent mt-2 mb-1.5" />

              <div className="flex flex-wrap items-center justify-center gap-2.5 font-sans text-sm sm:text-base tracking-wide">
                {isEditMode ? (
                  <div className="flex items-center gap-2 flex-wrap justify-center bg-white/90 px-3 py-1 rounded border border-[#141414]/20 shadow-sm">
                    <input
                      value={character.species}
                      onChange={(e) => updateCharacterField('species', e.target.value)}
                      className="text-[#161616] bg-transparent border-b border-black/20 focus:border-[var(--accent-ink)] focus:outline-none w-32 text-center text-sm font-semibold"
                      placeholder="Species"
                    />
                    <span className="text-[var(--accent-ink)]">•</span>
                    <input
                      value={character.background}
                      onChange={(e) => updateCharacterField('background', e.target.value)}
                      className="text-[#555555] bg-transparent border-b border-black/20 focus:border-[var(--accent-ink)] focus:outline-none w-28 text-center text-sm font-medium"
                      placeholder="Background"
                    />
                    <span className="text-[var(--accent-ink)]">•</span>
                    <input
                      value={character.alignment}
                      onChange={(e) => updateCharacterField('alignment', e.target.value)}
                      className="text-[#555555] bg-transparent border-b border-black/20 focus:border-[var(--accent-ink)] focus:outline-none w-28 text-center text-sm font-medium"
                      placeholder="Alignment"
                    />
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[var(--accent-ink)] font-bold text-sm">Level {character.level}</span>
                    <input
                      value={character.class}
                      onChange={(e) => updateCharacterField('class', e.target.value)}
                      className="text-[var(--accent-ink)] font-bold bg-transparent border-b border-black/20 focus:border-[var(--accent-ink)] focus:outline-none w-28 text-center text-sm ml-1"
                      placeholder="Class"
                    />
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[var(--accent-ink)] font-bold text-sm">Prof +</span>
                    <input
                      type="number"
                      min={1}
                      max={9}
                      value={character.proficiencyBonusOverride ?? getProficiencyBonus()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateCharacterField('proficiencyBonusOverride', isNaN(val) ? undefined : val);
                      }}
                      className="text-[var(--accent-ink)] font-bold bg-transparent border-b border-black/20 focus:border-[var(--accent-ink)] focus:outline-none w-10 text-center text-sm ml-0.5"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm sm:text-[15px]">
                    <span className="text-[#161616] font-bold">
                      {(!character.species || character.species.toLowerCase().includes('drow') || character.species.toLowerCase().includes('lolth')) ? 'Mountain Dwarf' : character.species}
                    </span>
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[#555555] font-medium">{character.background || 'Soldier'}</span>
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[#555555] font-medium">{character.alignment || 'Neutral'}</span>
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[var(--accent-ink)] font-bold">Level {character.level} {character.class || 'Cleric'}</span>
                    <span className="text-[var(--accent-ink)]">•</span>
                    <span className="text-[var(--accent-ink)] font-bold">Proficiency +{getProficiencyBonus()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vitals Body Section */}
          <div className="w-full flex flex-col items-center gap-6 p-4 sm:p-6">

            {/* Row 1: Core Vitals -> Health (Col 1), Experience & Level (Col 2), AC (Col 3) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] items-start gap-4 lg:gap-6 px-2">
              
              {/* 1. Hit Points / Health on the Left */}
              <div className="w-full flex flex-col items-center justify-start min-w-0">
                <HitPointsBar
                  currentHp={character.hp.current}
                  maxHp={character.hp.max}
                  tempHp={character.hp.temp}
                  isEditMode={isEditMode}
                  onUpdateHp={(current, max) => updateCharacterField('hp', { ...character.hp, current, max })}
                  onAdjustHp={(amount, type) => updateHP(amount, type)}
                  onSetTempHp={(temp) => updateCharacterField('hp', { ...character.hp, temp })}
                />
              </div>

              {/* 2. Experience & Level Module in the Center */}
              <div className="w-full flex flex-col items-center justify-start min-w-0">
                <ExperienceBar
                  currentXp={character.currentXp ?? 105000}
                  level={character.level}
                  isEditMode={isEditMode}
                  onUpdateXp={(xp) => updateCharacterField('currentXp', xp)}
                  onUpdateLevel={(val) => updateCharacterField('level', val)}
                />
              </div>

              {/* 3. Armor Class on the Right - aligned with the horizontal midpoint of HP and XP */}
              <div className="w-full lg:w-auto flex flex-col items-center justify-center min-w-0 self-center">
                <ArmorClassMedallion
                  ac={character.ac}
                  isEditMode={isEditMode}
                  onUpdateAc={(val) => updateCharacterField('ac', val)}
                />
              </div>
            </div>

            {/* Row 2: Secondary Combat Badges -> LOCKED True Single Horizontal Center Axis */}
            <div className="w-full pt-4 border-t border-[#141414]/15 text-[#222222]">
              <VitalsStrip
                character={character}
                isEditMode={isEditMode}
                onUpdateField={updateCharacterField}
                onToggleDeathSave={toggleDeathSave}
                onRollDeathSave={handleQuickRollDeathSave}
              />
            </div>

            {/* Critical Alert Banner: Character Down at 0 HP */}
            {character.hp.current === 0 && (
              <div className="w-full px-4 pb-3">
                <DeathSavesWidget />
              </div>
            )}

          </div>

        </FramedPanel>

        {/* 2. Tab Content Display with Smooth Animated Transitions */}
        <div className="w-full min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="w-full"
            >
              {(activeTab === 'CHARACTER / HUD' ||
                activeTab === 'COMBAT / HUD' ||
                activeTab === 'CHARACTER' ||
                activeTab === 'COMBAT / ACTIONS' ||
                activeTab === 'SPELLS') && <CombatTab />}
              {activeTab === 'INVENTORY' && <InventoryTab />}
              {activeTab === 'JOURNAL' && <JournalTab />}
              {activeTab === 'SESSIONS' && <SessionChroniclerTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Lazy Loaded Drawers */}
      <React.Suspense fallback={null}>
        {isGrimoireOpen && (
          <GrimoireDrawer isOpen={isGrimoireOpen} onClose={() => setGrimoireOpen(false)} />
        )}
        {isArmoryOpen && (
          <ArmoryDrawer isOpen={isArmoryOpen} onClose={() => setArmoryOpen(false)} />
        )}
      </React.Suspense>

    </div>
  );
}
