import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Swords, 
  Shield, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Plus, 
  Crosshair, 
  Layers, 
  Maximize2, 
  Minimize2,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import { useDmStore } from '../../store/dmStore';
import { useStore } from '../../store';
import { useCampaignStore } from '../../store/campaignStore';
import { InitiativeCombatant, BattlefieldBackground } from '../../types/dm';
import { CombatInitiativeRibbon } from './CombatInitiativeRibbon';
import { CombatTargetBanner } from './CombatTargetBanner';
import { PlayerCombatActionBar } from './PlayerCombatActionBar';
import { DmCombatCommandStage } from './DmCombatCommandStage';
import { CombatPartyTray } from './CombatPartyTray';
import { OrnateCardFrame } from '../common/OrnateCardFrame';
import { ASSET_MAP } from '@/config/assets';
import { compressImageDataUrl } from '../../utils';

// Bundled generic battlefield backdrop presets.
// 'default' reuses the site-wide washi texture; more presets can be added
// here as bundled art becomes available — this registry is the only place
// that needs updating to add one.
const BACKGROUND_PRESETS: { id: string; name: string; url: string }[] = [
  { id: 'default', name: 'Default Washi', url: ASSET_MAP.background }
];

interface CombatTheaterStageProps {
  mode?: 'player' | 'dm';
  onOpenAddMonster?: () => void;
  className?: string;
}

export function CombatTheaterStage({
  mode = 'player',
  onOpenAddMonster,
  className = ''
}: CombatTheaterStageProps) {
  const {
    combatState,
    startCombat,
    endCombat,
    nextTurn,
    prevTurn,
    rollAllInitiative,
    applyHpAdjustment,
    selectedCombatantId,
    selectCombatant,
    battlefieldBackground,
    setBattlefieldBackground
  } = useDmStore();

  const { character } = useStore();
  const { getActiveCampaign } = useCampaignStore();
  const campaign = getActiveCampaign();

  const [showBgPicker, setShowBgPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize initial selection if none is active
  useEffect(() => {
    if (!selectedCombatantId && combatState.combatants.length > 0) {
      const active = combatState.combatants.find(c => c.isCurrentTurn);
      const enemy = combatState.combatants.find(c => c.type === 'monster');
      selectCombatant(enemy?.id || active?.id || combatState.combatants[0].id);
    }
  }, [combatState.combatants, selectedCombatantId]);

  // Resolve the active backdrop image: DM's uploaded image takes precedence,
  // otherwise fall back to the selected bundled preset (or default).
  const activeBgUrl = battlefieldBackground.source === 'upload' && battlefieldBackground.imageUrl
    ? battlefieldBackground.imageUrl
    : (BACKGROUND_PRESETS.find(p => p.id === battlefieldBackground.presetId)?.url || BACKGROUND_PRESETS[0].url);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const rawData = event.target.result as string;
          const compressed = await compressImageDataUrl(rawData, 1600, 0.85);
          setBattlefieldBackground({ source: 'upload', imageUrl: compressed });
        } catch {
          setBattlefieldBackground({ source: 'upload', imageUrl: event.target.result as string });
        } finally {
          setIsUploadingBg(false);
          setShowBgPicker(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedCombatant = combatState.combatants.find(c => c.id === selectedCombatantId) || null;
  const activeTurnCombatant = combatState.combatants.find(c => c.isCurrentTurn);

  // Categorize combatants
  const partyMembers = combatState.combatants.filter(c => c.type === 'player');
  const monsterCombatants = combatState.combatants.filter(c => c.type === 'monster' || c.type === 'npc');

  // Check if active turn is the current player's character
  const isPlayerCurrentTurn = mode === 'player' && activeTurnCombatant?.name?.toLowerCase() === character.name?.toLowerCase();

  return (
    <div className={`w-full flex flex-col gap-3.5 relative overflow-hidden rounded-lg washi-card ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none p-4 overflow-y-auto' : 'p-3 sm:p-4'
    } ${className}`}>
      
      {/* Ornate Frame Chrome Overlay */}
      <OrnateCardFrame variant="standard" cornerSize={24} showRails={false} />

      {/* 1. ATMOSPHERIC BATTLEFIELD BACKGROUND CANVAS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={activeBgUrl}
          alt="Battlefield backdrop"
          className="w-full h-full object-cover opacity-25"
        />
        {/* Soft ink wash overlay to keep foreground text legible on a light theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/60 to-white/75" />
      </div>

      {/* 2. TOP THEATER TOOLBAR */}
      <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap px-3 py-2 washi-subcard rounded-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white border border-black/15 rounded text-[#161616] shadow-inner">
            <Swords size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xs sm:text-sm uppercase tracking-widest text-[#161616] font-bold">
                Combat Theater {mode === 'dm' ? '— Tactical Console' : '— Player HUD'}
              </h1>
              <span className="px-1.5 py-0.2 bg-white border border-black/15 rounded text-[9px] font-display font-bold uppercase text-[#4a4a4a] tracking-wider">
                {campaign?.title || 'Active Chronicle'}
              </span>
            </div>
            <span className="text-[10px] text-[#777777] font-serif italic hidden sm:inline">
              Tactical Combat Theater
            </span>
          </div>
        </div>

        {/* Action Controls & Background Picker (DM only) */}
        <div className="flex items-center gap-1.5">
          {mode === 'dm' && (
            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className="sumie-btn-secondary"
                title="Change Battlefield Background"
              >
                <ImageIcon size={12} />
                <span className="hidden sm:inline">Background</span>
              </button>

              {showBgPicker && (
                <div className="absolute right-0 top-full mt-1 w-56 washi-card p-2 z-50 flex flex-col gap-1.5 shadow-2xl">
                  <span className="text-[10px] font-display uppercase tracking-widest text-[#777777] font-bold px-1">
                    Bundled Presets
                  </span>
                  {BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setBattlefieldBackground({ source: 'preset', presetId: bg.id });
                        setShowBgPicker(false);
                      }}
                      className={`px-2 py-1.5 text-left text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer ${
                        battlefieldBackground.source === 'preset' && battlefieldBackground.presetId === bg.id
                          ? 'bg-[#161616] text-white font-bold'
                          : 'text-[#4a4a4a] hover:bg-black/5 hover:text-[#161616]'
                      }`}
                    >
                      {bg.name}
                    </button>
                  ))}

                  <div className="border-t border-black/10 my-1" />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingBg}
                    className="px-2 py-1.5 text-left text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 text-[#4a4a4a] hover:bg-black/5 hover:text-[#161616] disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {isUploadingBg ? 'Uploading…' : 'Upload Custom Image'}
                  </button>

                  {battlefieldBackground.source === 'upload' && (
                    <button
                      onClick={() => {
                        setBattlefieldBackground({ source: 'preset', presetId: 'default' });
                        setShowBgPicker(false);
                      }}
                      className="px-2 py-1.5 text-left text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 text-red-700/80 hover:bg-red-50"
                    >
                      <X size={12} />
                      Remove Custom Image
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="sumie-btn-secondary !px-1.5"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Theater'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* 3. INITIATIVE TIMELINE / RIBBON */}
      <div className="relative z-10">
        <CombatInitiativeRibbon
          combatState={combatState}
          selectedCombatantId={selectedCombatantId}
          onSelectCombatant={(id) => selectCombatant(id)}
          onNextTurn={nextTurn}
          onPrevTurn={prevTurn}
          onRollAll={rollAllInitiative}
          onStartCombat={startCombat}
          onEndCombat={endCombat}
          onOpenAddMonster={onOpenAddMonster}
          isDm={mode === 'dm'}
          orientation="horizontal"
        />
      </div>

      {/* 4. TARGET & BOSS HEALTH BANNER */}
      <div className="relative z-10">
        <CombatTargetBanner
          target={selectedCombatant}
          onApplyHp={(amount, type) => {
            if (selectedCombatant) {
              applyHpAdjustment(selectedCombatant.id, amount, type);
            }
          }}
          isDm={mode === 'dm'}
        />
      </div>

      {/* 5. MAIN STAGE CONTENT (PLAYER ACTION BAR OR DM COMMAND CONSOLE) */}
      <div className="relative z-10 grid grid-cols-1 gap-3.5">
        {mode === 'player' ? (
          /* Player Combat Action Bar (Weapons, Spells, Items, Tactics) */
          <PlayerCombatActionBar
            isCurrentTurn={isPlayerCurrentTurn}
          />
        ) : (
          /* DM Combat Tactical Console (Instant Math, Monster Actions, Conditions) */
          <DmCombatCommandStage
            combatant={selectedCombatant}
            onOpenAddMonster={onOpenAddMonster}
          />
        )}
      </div>

      {/* 6. BOTTOM PARTY VITALS TRAY */}
      <div className="relative z-10">
        <CombatPartyTray
          partyMembers={partyMembers}
          selectedCombatantId={selectedCombatantId}
          onSelectMember={(id) => selectCombatant(id)}
        />
      </div>
    </div>
  );
}
