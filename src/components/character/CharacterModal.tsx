import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { PRESET_CHARACTERS } from '../../data/presetCharacters';
import { CharacterState, INITIAL_CHARACTER } from '../../types';
import { BonfireLogo } from '../ui/BonfireLogo';
import { 
  X, 
  Download, 
  Upload, 
  Check, 
  Shield, 
  Heart, 
  Zap, 
  Sparkles, 
  UserPlus, 
  Copy, 
  RotateCcw,
  ChevronRight,
  Flame,
  Award,
  Cloud,
  Share2,
  Trash2,
  Archive,
  RefreshCw,
  Eye
} from 'lucide-react';
import { generateShareCode } from '../../services/cloudCharacterVault';
import { ThemeColorPicker } from '../common/ThemeColorPicker';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'roster' | 'vitals' | 'data';
}

const LOCAL_ROSTER_KEY = 'bonfire_local_roster_list_v1';

export function CharacterModal({ isOpen, onClose, initialTab = 'roster' }: CharacterModalProps) {
  const { character, updateCharacterField, getAbilityModifier, getSpellSaveDC, getSpellAttackBonus } = useStore();
  const { 
    user, 
    isAuthenticated, 
    userCharacters, 
    syncCurrentCharacterToCloud, 
    fetchUserCharacters, 
    archiveCharacter, 
    deleteCharacterFromCloud,
    syncStatus 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'roster' | 'vitals' | 'data'>(initialTab);
  const [importData, setImportData] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareCodeCopied, setShareCodeCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Local heroes roster stored in localStorage
  const [localRoster, setLocalRoster] = useState<CharacterState[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ROSTER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_CHARACTERS;
  });

  const saveRoster = (newList: CharacterState[]) => {
    setLocalRoster(newList);
    try {
      localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(newList));
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCharacters();
    }
  }, [isAuthenticated]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${character.name.replace(/\s+/g, '_')}_Bonfire.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(character, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareCode = () => {
    const code = character.dmShareCode || generateShareCode();
    if (!character.dmShareCode) {
      updateCharacterField('dmShareCode', code);
    }
    navigator.clipboard.writeText(code);
    setShareCodeCopied(true);
    setTimeout(() => setShareCodeCopied(false), 2000);
  };

  const handleSyncCloud = async () => {
    if (!isAuthenticated || !user || user.isAnonymous) {
      setImportStatus({ type: 'error', message: 'Please sign in with Firebase to sync to Cloud Vault.' });
      setTimeout(() => setImportStatus(null), 2500);
      return;
    }
    try {
      await syncCurrentCharacterToCloud(character);
      setImportStatus({ type: 'success', message: `Saved ${character.name} to Cloud Vault!` });
      setTimeout(() => setImportStatus(null), 2000);
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err?.message || 'Sync failed.' });
      setTimeout(() => setImportStatus(null), 2500);
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      if (parsed.name && parsed.abilities) {
        useStore.setState({ character: parsed });
        
        // Add to local roster if not present
        if (!localRoster.some(r => r.name.toLowerCase() === parsed.name.toLowerCase())) {
          saveRoster([parsed, ...localRoster]);
        }

        setImportStatus({ type: 'success', message: `Successfully loaded ${parsed.name}!` });
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } else {
        setImportStatus({ type: 'error', message: 'Invalid Bonfire JSON structure. Must contain name and abilities.' });
      }
    } catch (e) {
      if (importData.includes("character") && importData.includes("stats")) {
        setImportStatus({ type: 'error', message: 'D&D Beyond format detected — please paste exported Bonfire JSON.' });
      } else {
        setImportStatus({ type: 'error', message: 'Failed to parse JSON text. Please check syntax.' });
      }
    }
  };

  const handleSelectCharacter = (selected: CharacterState) => {
    useStore.setState({ character: JSON.parse(JSON.stringify(selected)) });
    setImportStatus({ type: 'success', message: `Switched to ${selected.name} (${selected.class} Lv.${selected.level})` });
    setTimeout(() => {
      setImportStatus(null);
    }, 1500);
  };

  const handleCloneCharacter = (target: CharacterState, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: CharacterState = {
      ...JSON.parse(JSON.stringify(target)),
      name: `${target.name} (Copy)`
    };
    saveRoster([cloned, ...localRoster]);
    setImportStatus({ type: 'success', message: `Duplicated ${target.name}!` });
    setTimeout(() => setImportStatus(null), 1500);
  };

  const handleDeleteCharacter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (localRoster.length <= 1) {
      setImportStatus({ type: 'error', message: 'Cannot delete the only character in the roster.' });
      setTimeout(() => setImportStatus(null), 2000);
      return;
    }
    const filtered = localRoster.filter(r => r.name !== name);
    saveRoster(filtered);
    if (character.name === name) {
      useStore.setState({ character: filtered[0] });
    }
    setImportStatus({ type: 'success', message: `Deleted ${name} from roster.` });
    setTimeout(() => setImportStatus(null), 1500);
  };

  const handleCreateBlankHero = () => {
    const blankHero: CharacterState = {
      ...INITIAL_CHARACTER,
      name: "New Adventurer",
      class: "Fighter",
      level: 1,
      species: "Human",
      background: "Folk Hero",
      alignment: "Neutral Good",
      hp: { current: 12, max: 12, temp: 0 },
      ac: 14,
      acDetails: "Ring Mail",
      speed: 30,
      initiativeBonus: 0,
      hitDice: { total: "1d10", current: 1 },
      currency: { cp: 50, sp: 20, ep: 0, gp: 15, pp: 0 },
      inventory: [],
      spells: [],
      features: [],
      ledger: []
    };
    saveRoster([blankHero, ...localRoster]);
    useStore.setState({ character: blankHero });
    setImportStatus({ type: 'success', message: 'Created new hero!' });
    setTimeout(() => {
      setImportStatus(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Backdrop with dark blur */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Large Themed Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[92vh] bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 text-[#161616]"
          >
            {/* Corner Accents */}
            <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-2 border-l-2 border-black/30 pointer-events-none z-20" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-2 border-r-2 border-black/30 pointer-events-none z-20" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-2 border-l-2 border-black/30 pointer-events-none z-20" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-2 border-r-2 border-black/30 pointer-events-none z-20" />

            {/* Modal Header */}
            <div className="relative border-b border-[#141414]/15 bg-white/90 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3.5">
                <BonfireLogo size={34} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm tracking-[0.25em] text-[#1a1a1a] uppercase font-bold">
                      Character Codex & Cloud Vault
                    </span>
                    <span className="text-[10px] font-mono text-[#555555] px-1.5 py-0.5 rounded bg-[#fdfbf7] border border-[#141414]/15 font-bold">
                      v3.0
                    </span>
                  </div>
                  <span className="text-xs font-serif text-[#555555]">
                    Active Hero: <strong className="text-[#161616]">{character.name}</strong> • Level {character.level} {character.class}
                  </span>
                </div>
              </div>

              {/* Action Header Buttons */}
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    onClick={handleSyncCloud}
                    className="px-2.5 py-1 bg-white hover:bg-[var(--accent-ink)] hover:text-white text-[#1a1a1a] border border-black/20 rounded text-xs font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-xs"
                    title="Sync current character to Firestore Cloud Vault"
                  >
                    <Cloud size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                    <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Cloud Backup'}</span>
                  </button>
                )}

                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#141414]/20 bg-white text-[#555555] hover:text-[#161616] hover:border-black/40 transition-colors shadow-xs cursor-pointer"
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tab Navigation Ribbon */}
            <div className="flex border-b border-[#141414]/15 bg-white/80 px-6 gap-2 sm:gap-6 shrink-0 overflow-x-auto hide-scrollbar shadow-xs">
              <button
                onClick={() => setActiveTab('roster')}
                style={activeTab === 'roster' ? { borderColor: 'var(--accent-ink)', color: 'var(--accent-ink)' } : {}}
                className={`py-3 px-3 font-display text-xs tracking-[0.18em] uppercase transition-all flex items-center gap-2 border-b-2 font-bold cursor-pointer ${
                  activeTab === 'roster'
                    ? 'border-b-2'
                    : 'border-transparent text-[#555555] hover:text-[#161616]'
                }`}
              >
                <Award size={14} className={activeTab === 'roster' ? 'text-[var(--accent-ink)]' : 'text-[#555555]'} />
                <span>Hero Gallery & Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('vitals')}
                style={activeTab === 'vitals' ? { borderColor: 'var(--accent-ink)', color: 'var(--accent-ink)' } : {}}
                className={`py-3 px-3 font-display text-xs tracking-[0.18em] uppercase transition-all flex items-center gap-2 border-b-2 font-bold cursor-pointer ${
                  activeTab === 'vitals'
                    ? 'border-b-2'
                    : 'border-transparent text-[#555555] hover:text-[#161616]'
                }`}
              >
                <Shield size={14} className={activeTab === 'vitals' ? 'text-[var(--accent-ink)]' : 'text-[#555555]'} />
                <span>Quick Vitals</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                style={activeTab === 'data' ? { borderColor: 'var(--accent-ink)', color: 'var(--accent-ink)' } : {}}
                className={`py-3 px-3 font-display text-xs tracking-[0.18em] uppercase transition-all flex items-center gap-2 border-b-2 font-bold cursor-pointer ${
                  activeTab === 'data'
                    ? 'border-b-2'
                    : 'border-transparent text-[#555555] hover:text-[#161616]'
                }`}
              >
                <Upload size={14} className={activeTab === 'data' ? 'text-[var(--accent-ink)]' : 'text-[#555555]'} />
                <span>Import / Export & Share</span>
              </button>
            </div>

            {/* Status Alert Banner */}
            {importStatus && (
              <div className={`px-6 py-2 text-xs font-serif flex items-center gap-2 ${
                importStatus.type === 'success' ? 'bg-green-100 text-green-800 border-b border-green-300 font-medium' : 'bg-red-100 text-red-800 border-b border-red-300 font-medium'
              }`}>
                {importStatus.type === 'success' ? <Check size={14} /> : <X size={14} />}
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white/40">
              
              {/* TAB 1: HERO ROSTER */}
              {activeTab === 'roster' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Share with DM / Party Banner */}
                  <div className="p-3.5 bg-white/90 border border-black/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--accent-ink)]/15 border border-[var(--accent-ink)]/30 rounded-md text-[var(--accent-ink)]">
                        <Share2 size={16} />
                      </div>
                      <div>
                        <div className="font-display text-xs uppercase tracking-wider text-[#161616] font-bold">
                          DM Party Share Code: <span className="font-mono text-[var(--accent-ink)]">{character.dmShareCode || 'BF-THORIN'}</span>
                        </div>
                        <div className="font-serif text-[11px] text-[#555555]">
                          Provide this code to your Dungeon Master for live sheet oversight and loot injection.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyShareCode}
                      className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs uppercase tracking-wider font-bold rounded flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {shareCodeCopied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{shareCodeCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                        Hero Gallery
                      </h3>
                      <p className="text-xs text-[#555555] font-serif mt-0.5">
                        Switch between characters, duplicate heroes for leveling experiments, or create new adventurers.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateBlankHero}
                      className="px-3.5 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white rounded-md font-display text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-xs font-bold cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>+ Create Hero</span>
                    </button>
                  </div>

                  {/* Character Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localRoster.map((hero, idx) => {
                      const isCurrent = character.name.toLowerCase() === hero.name.toLowerCase();

                      return (
                        <div 
                          key={idx}
                          onClick={() => handleSelectCharacter(hero)}
                          className={`relative p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-sm ${
                            isCurrent
                              ? 'bg-white border-2 border-[var(--accent-ink)] shadow-md'
                              : 'bg-white/80 border-[#141414]/15 hover:border-[var(--accent-ink)] hover:bg-white'
                          }`}
                        >
                          {/* Active Badge */}
                          {isCurrent && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-display uppercase tracking-widest text-[var(--accent-ink)] bg-[var(--accent-ink)]/15 border border-[var(--accent-ink)]/40 px-2 py-0.5 rounded-full font-bold">
                              <Sparkles size={10} />
                              <span>Active</span>
                            </div>
                          )}

                          {/* Top Row: Avatar & Basic Info */}
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-[#fdfbf7] border-2 border-[var(--accent-ink)] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                              {hero.portraitUrl ? (
                                <img src={hero.portraitUrl} alt={hero.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-display font-bold text-base text-[var(--accent-ink)]">
                                  {hero.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 pr-14">
                              <h4 className="font-display text-sm tracking-[0.1em] text-[#161616] uppercase font-bold truncate">
                                {hero.name}
                              </h4>
                              <span className="text-xs font-serif text-[#555555] truncate">
                                Level {hero.level} {hero.class} • {hero.species || 'Hero'}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Key Combat Stats */}
                          <div className="grid grid-cols-3 gap-2 bg-[#fdfbf7] p-2 rounded-lg border border-[#141414]/10 text-center">
                            <div>
                              <span className="block text-[9px] font-display text-[#555555] uppercase font-bold">HP</span>
                              <span className="text-xs font-mono font-bold text-[#161616]">
                                {hero.hp.current}/{hero.hp.max}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-display text-[#555555] uppercase font-bold">AC</span>
                              <span className="text-xs font-mono font-bold text-[var(--accent-ink)]">
                                {hero.ac}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-display text-[#555555] uppercase font-bold">Speed</span>
                              <span className="text-xs font-mono font-bold text-[#555555]">
                                {hero.speed} ft
                              </span>
                            </div>
                          </div>

                          {/* Footer Actions: Clone & Delete */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#141414]/15">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handleCloneCharacter(hero, e)}
                                className="p-1.5 text-[#555555] hover:text-[var(--accent-ink)] hover:bg-[#fdfbf7] rounded transition-colors cursor-pointer"
                                title="Duplicate / Clone Hero"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteCharacter(hero.name, e)}
                                className="p-1.5 text-[#555555] hover:text-[#E53E3E] hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete Hero"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <span className="text-[11px] font-display uppercase tracking-wider text-[var(--accent-ink)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-bold">
                              <span>Select Hero</span>
                              <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: QUICK VITALS */}
              {activeTab === 'vitals' && (
                <div className="flex flex-col gap-5">
                  <div className="border-b border-[#141414]/15 pb-3">
                    <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                      Hero Vitals & Attributes
                    </h3>
                    <p className="text-xs text-[#555555] font-serif">
                      Comprehensive tactical attributes for {character.name}.
                    </p>
                  </div>

                  {/* Character Theme Ink Palette */}
                  <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-lg shadow-sm">
                    <ThemeColorPicker />
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-lg text-center shadow-sm">
                      <span className="text-[10px] font-display uppercase text-[#555555] font-bold">Hit Points</span>
                      <div className="font-mono text-base font-bold text-[#161616] mt-1">
                        {character.hp.current} / {character.hp.max}
                      </div>
                    </div>
                    <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-lg text-center shadow-sm">
                      <span className="text-[10px] font-display uppercase text-[#555555] font-bold">Armor Class</span>
                      <div className="font-mono text-base font-bold text-[var(--accent-ink)] mt-1">
                        {character.ac}
                      </div>
                    </div>
                    <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-lg text-center shadow-sm">
                      <span className="text-[10px] font-display uppercase text-[#555555] font-bold">Spell Save DC</span>
                      <div className="font-mono text-base font-bold text-[var(--accent-ink)] mt-1">
                        {getSpellSaveDC()}
                      </div>
                    </div>
                    <div className="p-3 bg-white/90 border border-[#141414]/15 rounded-lg text-center shadow-sm">
                      <span className="text-[10px] font-display uppercase text-[#555555] font-bold">Spell Attack</span>
                      <div className="font-mono text-base font-bold text-[#161616] mt-1">
                        +{getSpellAttackBonus()}
                      </div>
                    </div>
                  </div>

                  {/* Ability Scores Summary */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(ab => {
                      const score = character.abilities[ab]?.score || 10;
                      const mod = getAbilityModifier(ab);
                      return (
                        <div key={ab} className="p-2.5 bg-white/90 border border-[#141414]/15 rounded text-center shadow-sm">
                          <span className="text-[10px] font-display uppercase text-[var(--accent-ink)] font-bold">{ab.toUpperCase()}</span>
                          <div className="font-mono text-base font-bold text-[#161616]">
                            {mod >= 0 ? `+${mod}` : mod}
                          </div>
                          <span className="text-[10px] font-serif text-[#555555]">({score})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: IMPORT & EXPORT */}
              {activeTab === 'data' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-[#141414]/15 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base tracking-[0.15em] text-[#1a1a1a] uppercase font-bold">
                        Export & Backup Hero JSON
                      </h3>
                      <p className="text-xs text-[#555555] font-serif">
                        Safely download or copy character JSON data across devices.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyToClipboard}
                        className="px-3 py-1.5 bg-white hover:bg-[var(--accent-ink)] hover:text-white text-[#1a1a1a] border border-black/20 rounded text-xs font-display uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs font-bold cursor-pointer"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                      <button
                        onClick={handleExport}
                        className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs uppercase tracking-wider font-bold rounded flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Import Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-bold">
                      Import Hero JSON
                    </label>
                    <textarea
                      rows={6}
                      value={importData}
                      onChange={e => setImportData(e.target.value)}
                      placeholder="Paste exported Bonfire character JSON here..."
                      className="w-full bg-white border border-[#141414]/20 text-[#161616] font-mono text-xs p-3 rounded focus:border-[var(--accent-ink)] focus:outline-none custom-scrollbar shadow-xs"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importData.trim()}
                      className="py-2 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs uppercase font-bold tracking-wider rounded disabled:opacity-40 transition-all shadow cursor-pointer"
                    >
                      Import Hero to Codex
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
