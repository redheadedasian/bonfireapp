import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { Frame } from '../ui';
import { BookOpen, Scroll, Plus, Trash2, CheckSquare, Check, Sparkles, Feather, Download } from 'lucide-react';

export function JournalTab() {
  const { character, updateCharacterField } = useStore();
  const [activeSection, setActiveSection] = useState<'notes' | 'backstory' | 'quests'>('notes');
  const [newQuest, setNewQuest] = useState('');

  const handleExportObsidian = () => {
    const frontmatter = `---
title: "${character.name} - Adventurer Journal"
character: "${character.name}"
class: "${character.class}"
level: ${character.level}
export_date: "${new Date().toISOString()}"
tags:
  - bonfire/journal
  - dnd5e
---

# ${character.name}'s Journal

## 📝 Field Notes & Scratchpad
${character.notes || '_No field notes recorded._'}

## 🎯 Active Quest Objectives
${(quests || []).map((q) => `- [${q.completed ? 'x' : ' '}] ${q.text}`).join('\n')}

## 📜 Character Backstory & Lore
${character.backstory || '_No backstory recorded._'}
`;

    const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.toLowerCase().replace(/\s+/g, '_')}_journal.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fallback / initialization for quests if stored as string/array
  const quests = Array.isArray(character.quests)
    ? character.quests
    : [
        { id: 'q1', text: 'Locate the hidden adamantine entrance to Karak-Varn', completed: false },
        { id: 'q2', text: 'Retrieve the white wyrmling Calcryx from the hobgoblins', completed: false },
        { id: 'q3', text: 'Deliver the dwarven sigil to the High Scribe in Neverwinter', completed: false }
      ];

  const handleAddQuest = () => {
    if (!newQuest.trim()) return;
    const updated = [...quests, { id: 'q-' + Date.now(), text: newQuest.trim(), completed: false }];
    updateCharacterField('quests', updated);
    setNewQuest('');
  };

  const handleToggleQuest = (id: string) => {
    const updated = quests.map((q) => (q.id === id ? { ...q, completed: !q.completed } : q));
    updateCharacterField('quests', updated);
  };

  const handleDeleteQuest = (id: string) => {
    const updated = quests.filter((q) => q.id !== id);
    updateCharacterField('quests', updated);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto select-none">
      
      {/* Journal Header Bar */}
      <Frame title="ADVENTURER'S JOURNAL & CHRONICLES">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-3">
            <Feather size={20} className="text-[var(--accent-ink)]" />
            <div>
              <p className="font-serif text-xs text-[#555555]">
                Personal player notes, active quest objectives, and character lore
              </p>
            </div>
          </div>

          {/* Section Tabs & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportObsidian}
              className="sumie-btn-secondary text-xs"
              title="Export character journal to Obsidian Markdown (.md)"
            >
              <Download size={13} />
              <span>Export to Obsidian (.md)</span>
            </button>

            <div className="flex items-center bg-white/80 p-1 rounded border border-[#141414]/15 shadow-sm">
              <button
                onClick={() => setActiveSection('notes')}
                style={activeSection === 'notes' ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeSection === 'notes'
                    ? 'text-white font-bold shadow-xs'
                    : 'text-[#555555] hover:text-[#161616]'
                }`}
              >
                Notes & Scratchpad
              </button>
              <button
                onClick={() => setActiveSection('quests')}
                style={activeSection === 'quests' ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeSection === 'quests'
                    ? 'text-white font-bold shadow-xs'
                    : 'text-[#555555] hover:text-[#161616]'
                }`}
              >
                Quest Log
              </button>
              <button
                onClick={() => setActiveSection('backstory')}
                style={activeSection === 'backstory' ? { backgroundColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeSection === 'backstory'
                    ? 'text-white font-bold shadow-xs'
                    : 'text-[#555555] hover:text-[#161616]'
                }`}
              >
                Backstory & Lore
              </button>
            </div>
          </div>
        </div>
      </Frame>

      {/* Main Journal Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="w-full"
        >
          {activeSection === 'notes' && (
            <Frame title="SESSION SCRATCHPAD & FIELD NOTES">
              <div className="flex flex-col gap-4 p-2 sm:p-3">
            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
              <span className="font-display text-xs uppercase tracking-widest text-[#1a1a1a] font-bold">
                Auto-saved to character storage
              </span>
            </div>

            <textarea
              value={character.notes || ''}
              onChange={(e) => updateCharacterField('notes', e.target.value)}
              placeholder="Record dungeon clues, rumors heard at the tavern, NPC debts, and personal goals here..."
              className="w-full bg-white/90 border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder:text-[#888888] font-serif p-4 rounded-sm focus:outline-none resize-y min-h-[420px] text-sm sm:text-[15px] leading-relaxed shadow-xs"
            />
          </div>
        </Frame>
      )}

      {activeSection === 'quests' && (
        <Frame title="ACTIVE QUEST OBJECTIVES & LEADS">
          <div className="flex flex-col gap-4 p-2 sm:p-3">
            <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
              <span className="text-[11px] font-serif text-[#555555]">
                {quests.filter((q) => !q.completed).length} Pending Objectives
              </span>
            </div>

            {/* Add Quest Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuest}
                onChange={(e) => setNewQuest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuest())}
                placeholder="Add new quest objective..."
                className="flex-1 bg-white/90 border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder:text-[#888888] px-3.5 py-2 rounded-sm font-serif text-sm focus:outline-none shadow-xs"
              />
              <button
                onClick={handleAddQuest}
                className="px-4 py-2 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] text-white font-display text-xs uppercase tracking-wider rounded-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Plus size={14} />
                <span>Add Quest</span>
              </button>
            </div>

            {/* Quest List */}
            <div className="flex flex-col gap-2.5 mt-2">
              {quests.length === 0 ? (
                <p className="text-center p-8 text-xs font-serif text-[#777777] italic">
                  No active quests logged. Record new objectives above.
                </p>
              ) : (
                quests.map((quest) => (
                  <div
                    key={quest.id}
                    onClick={() => handleToggleQuest(quest.id)}
                    className={`p-3.5 rounded-sm border transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs ${
                      quest.completed
                        ? 'bg-white/50 border-[#141414]/10 opacity-60'
                        : 'bg-white/90 border-[#141414]/15 hover:border-[var(--accent-ink)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleQuest(quest.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          quest.completed
                            ? 'bg-[#1EB253] border-[#1EB253] text-white'
                            : 'bg-white border-[#141414]/30 hover:border-[#1EB253]'
                        }`}
                      >
                        {quest.completed && <Check size={11} strokeWidth={3} />}
                      </button>
                      <span
                        className={`text-xs font-serif ${
                          quest.completed ? 'line-through text-[#777777]' : 'text-[#161616] font-medium'
                        }`}
                      >
                        {quest.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuest(quest.id);
                      }}
                      className="text-[#777777] hover:text-[#c53030] p-1 transition-colors cursor-pointer"
                      title="Delete Quest Objective"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Frame>
      )}

      {activeSection === 'backstory' && (
        <Frame title="CHARACTER BACKGROUND & PERSONAL HISTORY">
          <div className="flex flex-col gap-5 p-2 sm:p-3 font-serif">
            <div>
              <label className="text-[10px] font-display uppercase tracking-[0.2em] text-[#1a1a1a] font-bold block mb-1.5">
                Origin & Lineage
              </label>
              <textarea
                value={character.backstory || 'Thorin was born in the deep iron fortresses of the northern mountains. Dedicated to the Silver Dawn at an early age, he took the vows of the Iron Vanguard to safeguard the dwarven realms from dark subterranean horrors.'}
                onChange={(e) => updateCharacterField('backstory', e.target.value)}
                className="w-full bg-white/90 border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder:text-[#888888] p-3 rounded-sm text-sm focus:outline-none min-h-[120px] shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-display uppercase tracking-[0.2em] text-[#1a1a1a] font-bold block mb-1.5">
                  Personality Traits & Ideals
                </label>
                <textarea
                  value={character.personalityTraits || 'I face problems head-on. A simple, direct solution is the best path to victory.'}
                  onChange={(e) => updateCharacterField('personalityTraits', e.target.value)}
                  className="w-full bg-white/90 border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder:text-[#888888] p-3 rounded-sm text-sm focus:outline-none min-h-[100px] shadow-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-display uppercase tracking-[0.2em] text-[#1a1a1a] font-bold block mb-1.5">
                  Bonds & Flaws
                </label>
                <textarea
                  value={character.flaws || 'My honor is my life. I have little tolerance for those who lie or deceive their companions.'}
                  onChange={(e) => updateCharacterField('flaws', e.target.value)}
                  className="w-full bg-white/90 border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] placeholder:text-[#888888] p-3 rounded-sm text-sm focus:outline-none min-h-[100px] shadow-xs"
                />
              </div>
            </div>
          </div>
        </Frame>
      )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
