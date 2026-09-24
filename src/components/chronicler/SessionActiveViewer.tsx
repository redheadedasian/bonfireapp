import React, { useState, useEffect } from 'react';
import { ChroniclerSession, TimelineEvent, TranscriptLine } from '../../types/session';
import { AudioPlayerBar } from './AudioPlayerBar';
import { audioBus } from '../../services/audioBus';
import { useCampaignStore } from '../../store/campaignStore';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { isUserDM } from '../../services/router';
import { 
  Scroll, 
  Users, 
  User, 
  Sparkles, 
  Sword, 
  Coins, 
  Compass, 
  ListOrdered, 
  FileText, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Clock, 
  Shield, 
  Flame, 
  HelpCircle,
  Share2,
  CheckSquare,
  Plus,
  Check,
  PackagePlus,
  Upload
} from 'lucide-react';

interface SessionActiveViewerProps {
  session: ChroniclerSession;
}

export function SessionActiveViewer({ session }: SessionActiveViewerProps) {
  const [activePerspective, setActivePerspective] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'structured' | 'transcript'>('structured');
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');
  const [expandedNpc, setExpandedNpc] = useState<Record<number, boolean>>({ 0: true });
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const { getActiveCampaign, contributeToPartyTreasury, addToPartyStash, addQuest } = useCampaignStore();
  const { addInventoryItem } = useStore();
  const { user } = useAuthStore();
  const activeCampaign = getActiveCampaign();
  const isDM = isUserDM(activeCampaign, user?.uid);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Sync with audio bus
  useEffect(() => {
    const unsub = audioBus.subscribe((seconds) => {
      setCurrentPlayTime(seconds);
    });
    return () => unsub();
  }, []);

  const data = session.data;
  const partyList = session.partyMembers || Object.keys(data.characterBreakdowns || {});

  // Handle jump to timestamp
  const handleJumpToTimestamp = (seconds: number) => {
    audioBus.seekTo(seconds, true);
  };

  // Toggle NPC accordion
  const toggleNpc = (idx: number) => {
    setExpandedNpc((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Push parsed loot gold to party treasury
  const handlePushGoldToTreasury = () => {
    const goldStr = data.overallSummary.lootAndRewards.goldAcquired || '0';
    const numMatch = goldStr.match(/(\d+[\d,]*)/);
    const parsedAmount = numMatch ? parseInt(numMatch[1].replace(/,/g, ''), 10) : 100;
    
    contributeToPartyTreasury(parsedAmount, 'gp', `Session #${session.sessionNumber} Spoils`);
    showNotice(`Pushed ${parsedAmount} GP to Party Treasury!`);
  };

  // Push parsed magic item to party stash
  const handlePushItemToStash = (item: { name: string; properties: string; recipient: string }) => {
    addToPartyStash(
      {
        name: item.name,
        description: item.properties,
        rarity: 'Rare',
        type: 'magic'
      },
      'Bag of Holding',
      `Session #${session.sessionNumber}`
    );
    showNotice(`Added ${item.name} to Party Bag of Holding!`);
  };

  // Push unresolved hook to campaign quest log
  const handlePushHookToQuests = (hook: string) => {
    if (!activeCampaign) return;
    addQuest(activeCampaign.id, {
      title: hook.length > 50 ? hook.substring(0, 50) + '...' : hook,
      description: hook,
      priority: 'main',
      status: 'in_progress'
    });
    showNotice(`Added objective to Campaign Quest Board!`);
  };

  // Export summary report
  const handleExportReport = () => {
    const markdownContent = `# ${data.sessionTitle}
**Date:** ${session.date} | **Runtime:** ${session.formattedDuration}

## Executive Summary
${data.overallSummary.highLevelNarrative}

## Story Timeline
${data.overallSummary.timeline.map((t) => `- **[${t.timestamp}]** ${t.event}`).join('\n')}

## Notable NPCs & Lore
${data.overallSummary.npcInteractions.map((n) => `### ${n.name}\n- **Description:** ${n.description}\n- **Lore Revealed:** ${n.loreRevealed}`).join('\n\n')}

## Combat Encounters
${data.overallSummary.combatEncounters.map((c) => `### ${c.encounter}\n- **Enemies:** ${c.enemies}\n- **Outcome:** ${c.outcome}\n- **Casualties:** ${c.casualties}`).join('\n\n')}

## Loot & Spoils
- **Gold/Currency:** ${data.overallSummary.lootAndRewards.goldAcquired}
- **Magic Items:**
${data.overallSummary.lootAndRewards.magicItems.map((m) => `  - **${m.name}** (Recipient: ${m.recipient}): ${m.properties}`).join('\n')}
- **Mundane Spoils:** ${data.overallSummary.lootAndRewards.mundaneLoot.join(', ')}

## Next Session Objectives
${data.overallSummary.unresolvedHooks.map((h) => `- [ ] ${h}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.sessionTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTranscript = data.fullTranscript.filter((line) => {
    if (!transcriptSearch.trim()) return true;
    const q = transcriptSearch.toLowerCase();
    return line.speaker.toLowerCase().includes(q) || line.text.toLowerCase().includes(q) || line.timestamp.includes(q);
  });

  const selectedCharacterBreakdown =
    activePerspective !== 'all' ? data.characterBreakdowns[activePerspective] : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fcfbf9] text-[#161616]">
      
      {/* 1. Top Session Header Bar */}
      <div className="border-b border-[#141414]/15 bg-white/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        
        {/* Title Block */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[var(--accent-ink)] bg-[var(--accent-ink)]/10 border border-[var(--accent-ink)]/30 px-2 py-0.5 rounded">
              SESSION #{session.sessionNumber}
            </span>
            <span className="text-xs text-[#777777] font-serif">• {session.date}</span>
            <span className="text-xs text-[#777777] font-serif">• {session.formattedDuration}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-[0.1em] text-[#1a1a1a]">
            {data.sessionTitle}
          </h2>
        </div>

        {/* View Mode & Export Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Structured vs Raw Transcript Toggle */}
          <div className="flex rounded-xs bg-white border border-[#141414]/20 p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('structured')}
              className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'structured'
                  ? 'bg-[#1c1c1c] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-[#161616]'
              }`}
            >
              <FileText size={13} />
              <span>Structured Chronicle</span>
            </button>
            <button
              onClick={() => setViewMode('transcript')}
              className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'transcript'
                  ? 'bg-[#1c1c1c] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-[#161616]'
              }`}
            >
              <Scroll size={13} />
              <span>Raw Spoken Dialogue</span>
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-1.5 rounded-xs bg-white border border-[#141414]/20 text-xs font-display uppercase tracking-wider text-[#161616] hover:border-black/40 font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export full campaign report as Markdown"
          >
            <Download size={13} className="text-[var(--accent-ink)]" />
            <span>Export Report</span>
          </button>
        </div>

      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="mx-6 mt-3 p-3 bg-black/80 text-white text-xs rounded-xs flex items-center gap-2 shadow-md">
          <Check size={16} className="text-[#1EB253]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. Audio Playback Control Bar */}
      <AudioPlayerBar session={session} />

      {/* 3. Perspective Switcher Rail */}
      {viewMode === 'structured' && (
        <div className="border-b border-[#141414]/15 bg-white/60 px-6 py-2 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
          <span className="text-[10px] font-display uppercase tracking-widest text-[#555555] font-bold shrink-0 mr-2 flex items-center gap-1">
            <Users size={12} />
            <span>Hero Spotlight:</span>
          </span>

          <button
            onClick={() => setActivePerspective('all')}
            className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded-full border transition-all shrink-0 cursor-pointer ${
              activePerspective === 'all'
                ? 'bg-[#1c1c1c] text-white border-black font-bold shadow-xs'
                : 'bg-white border-[#141414]/15 text-[#555555] hover:text-[#161616]'
            }`}
          >
            Entire Campaign Overview
          </button>

          {partyList.map((member) => (
            <button
              key={member}
              onClick={() => setActivePerspective(member)}
              className={`px-3 py-1 text-xs font-display uppercase tracking-wider rounded-full border transition-all shrink-0 cursor-pointer ${
                activePerspective === member
                  ? 'bg-[#1c1c1c] text-white border-black font-bold shadow-xs'
                  : 'bg-white border-[#141414]/15 text-[#555555] hover:text-[#161616]'
              }`}
            >
              {member}
            </button>
          ))}
        </div>
      )}

      {/* 4. Main Chronicler Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-6 bg-[#fcfbf9]">
        
        {viewMode === 'structured' ? (
          
          activePerspective === 'all' ? (
            
            /* Party Overview Mode */
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              
              {/* Executive Summary */}
              <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm relative text-[#161616]">
                <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-3 mb-4">
                  <Scroll size={18} className="text-[var(--accent-ink)]" />
                  <h3 className="font-display text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                    Executive Campaign Narrative
                  </h3>
                </div>
                <p className="font-serif text-sm text-[#161616] leading-relaxed whitespace-pre-wrap">
                  {data.overallSummary.highLevelNarrative}
                </p>
              </section>

              {/* Story Timeline */}
              <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm text-[#161616]">
                <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-3 mb-4">
                  <Clock size={18} className="text-[var(--accent-ink)]" />
                  <h3 className="font-display text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                    Chronological Story Timeline
                  </h3>
                </div>

                <div className="flex flex-col gap-3 pl-2 border-l-2 border-[#141414]/20 ml-2">
                  {data.overallSummary.timeline.map((event, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3 relative cursor-pointer hover:translate-x-1 transition-transform"
                      onClick={() => handleJumpToTimestamp(event.seconds || 0)}
                      title={`Jump audio scrubber to ${event.timestamp}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-ink)] -ml-[19px] mt-1.5 border-2 border-white group-hover:scale-125 transition-transform" />
                      <button className="font-mono text-xs text-[var(--accent-ink)] bg-white border border-[#141414]/20 px-2 py-0.5 rounded-xs shrink-0 group-hover:border-[var(--accent-ink)] font-bold shadow-xs cursor-pointer">
                        {event.timestamp}
                      </button>
                      <p className="font-serif text-xs text-[#555555] group-hover:text-[#161616] leading-relaxed">
                        {event.event}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Notable NPCs and Combat Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* NPC & Lore Interactions */}
                <section className="bg-white border border-[#141414]/15 rounded-xl p-5 shadow-sm flex flex-col gap-3 text-[#161616]">
                  <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2.5">
                    <User size={16} className="text-[var(--accent-ink)]" />
                    <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                      Notable NPCs & Discovered Lore
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {data.overallSummary.npcInteractions.map((npc, idx) => {
                      const isExpanded = expandedNpc[idx];
                      return (
                        <div
                          key={idx}
                          className="border border-[#141414]/15 bg-white rounded-xs overflow-hidden shadow-xs"
                        >
                          <button
                            onClick={() => toggleNpc(idx)}
                            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-black/5 transition-colors cursor-pointer"
                          >
                            <span className="font-display text-xs font-bold text-[#161616] uppercase tracking-wider">
                              {npc.name}
                            </span>
                            {isExpanded ? <ChevronDown size={14} className="text-[var(--accent-ink)]" /> : <ChevronRight size={14} className="text-[#777777]" />}
                          </button>

                          {isExpanded && (
                            <div className="px-3.5 pb-3 pt-1 border-t border-[#141414]/10 flex flex-col gap-1.5 text-xs font-serif">
                              <p className="text-[#555555]">{npc.description}</p>
                              <div className="p-2.5 bg-black/5 border border-[#141414]/10 rounded-xs text-[11px] mt-1">
                                <span className="text-[var(--accent-ink)] font-display uppercase text-[10px] tracking-wider font-bold block mb-0.5">
                                  Lore Uncovered:
                                </span>
                                <p className="text-[#161616] leading-relaxed italic">{npc.loreRevealed}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Combat Encounters Log */}
                <section className="bg-white border border-[#141414]/15 rounded-xl p-5 shadow-sm flex flex-col gap-3 text-[#161616]">
                  <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2.5">
                    <Sword size={16} className="text-[#c53030]" />
                    <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                      Combat Encounters
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {data.overallSummary.combatEncounters.map((combat, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-[#141414]/15 rounded-xs flex flex-col gap-1.5 text-xs font-serif shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs uppercase tracking-wider font-bold text-[#161616]">
                            {combat.encounter}
                          </span>
                          <span className="text-[10px] font-display uppercase tracking-widest text-[#1EB253] bg-[#1EB253]/10 px-1.5 py-0.5 rounded border border-[#1EB253]/30 font-bold">
                            Victory
                          </span>
                        </div>

                        <p className="text-[#555555] leading-snug">
                          <strong className="text-[#161616] font-display uppercase text-[10px] tracking-wider">Foes: </strong>
                          {combat.enemies}
                        </p>
                        <p className="text-[#161616] leading-snug">
                          <strong className="text-[var(--accent-ink)] font-display uppercase text-[10px] tracking-wider font-bold">Tactical Outcome: </strong>
                          {combat.outcome}
                        </p>
                        <p className="text-[#c53030] leading-snug">
                          <strong className="font-display uppercase text-[10px] tracking-wider font-bold">Party Casualties: </strong>
                          {combat.casualties}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Loot & Spoils Ledger */}
              <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm text-[#161616]">
                <div className="flex items-center justify-between border-b border-[#141414]/15 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-[var(--accent-ink)]" />
                    <h3 className="font-display text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                      Loot & Spoils Ledger
                    </h3>
                  </div>

                  {isDM && (
                    <button
                      onClick={handlePushGoldToTreasury}
                      className="px-3 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] font-display text-xs uppercase tracking-wider font-bold rounded-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Push parsed gold spoils to active campaign party treasury (DM Only)"
                    >
                      <Upload size={12} />
                      <span>Push Gold to Party Treasury (DM)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif">
                  
                  {/* Coinage */}
                  <div className="p-3.5 bg-black/5 border border-[#141414]/10 rounded-xs flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-display text-[10px] uppercase tracking-widest text-[#555555] font-bold block mb-1">
                        Acquired Currency
                      </span>
                      <p className="text-base font-bold text-[var(--accent-ink)] font-mono">
                        {data.overallSummary.lootAndRewards.goldAcquired}
                      </p>
                    </div>
                  </div>

                  {/* Magic Relics */}
                  <div className="md:col-span-2 p-3.5 bg-black/5 border border-[#141414]/10 rounded-xs flex flex-col gap-2">
                    <span className="font-display text-[10px] uppercase tracking-widest text-[#555555] font-bold block">
                      Enchanted Relics & Attunements
                    </span>
                    <div className="flex flex-col gap-2">
                      {data.overallSummary.lootAndRewards.magicItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-white border border-[#141414]/15 rounded-xs flex flex-col gap-1 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-display font-bold text-[#161616] tracking-wider">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-serif text-[var(--accent-ink)] bg-[var(--accent-ink)]/10 px-2 py-0.5 rounded border border-[var(--accent-ink)]/30 font-bold">
                                Recipient: {item.recipient}
                              </span>
                              <button
                                onClick={() => handlePushItemToStash(item)}
                                className="px-2 py-0.5 bg-[#1c1c1c] hover:bg-[var(--accent-ink)] text-white rounded-xs text-[10px] font-display uppercase tracking-wider font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Push item into Party Stash (Bag of Holding)"
                              >
                                <PackagePlus size={11} />
                                <span>Push to Stash</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#555555] leading-snug">
                            {item.properties}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Mundane Items */}
                <div className="mt-3 p-3 bg-white border border-[#141414]/15 rounded-xs text-xs shadow-xs">
                  <span className="font-display text-[10px] uppercase tracking-widest text-[#555555] font-bold block mb-1">
                    Mundane Equipment & Curios:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.overallSummary.lootAndRewards.mundaneLoot.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-black/5 border border-black/10 rounded text-[#161616] text-[11px] font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Next Session Directives */}
              <section className="bg-white border border-[#141414]/15 rounded-xl p-5 shadow-sm text-[#161616]">
                <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2.5 mb-3">
                  <Compass size={16} className="text-[var(--accent-ink)]" />
                  <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                    Unresolved Hooks & Next Directives
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {data.overallSummary.unresolvedHooks.map((hook, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xs bg-white border border-[#141414]/15 shadow-xs">
                      <div className="flex items-start gap-2 min-w-0">
                        <CheckSquare size={14} className="text-[var(--accent-ink)] shrink-0 mt-0.5" />
                        <span className="font-serif text-xs text-[#161616] leading-relaxed">
                          {hook}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePushHookToQuests(hook)}
                        className="px-2.5 py-1 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] rounded-xs text-[10px] font-display uppercase tracking-wider font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                        title="Add this objective as an active quest in the Campaigns Hub"
                      >
                        <Plus size={11} />
                        <span>Add as Quest</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          ) : (
            
            /* Specific Character Spotlight View */
            <div className="max-w-4xl mx-auto flex flex-col gap-6 text-[#161616]">
              
              {/* Character Header Banner */}
              <div className="p-6 bg-white border-2 border-black/30 rounded-xl shadow-md flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent-ink)]/15 border-2 border-[var(--accent-ink)] flex items-center justify-center text-[var(--accent-ink)] shadow-md font-display text-xl font-bold">
                    {activePerspective.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[var(--accent-ink)] font-bold block">
                      Heroic Spotlight
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                      {activePerspective}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setActivePerspective('all')}
                  className="px-3.5 py-1.5 rounded-xs bg-white border border-[#141414]/20 text-xs font-display uppercase tracking-wider text-[#555555] hover:text-[#161616] hover:border-black/40 font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Return to Party Overview
                </button>
              </div>

              {selectedCharacterBreakdown ? (
                <>
                  {/* Role Summary */}
                  <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2.5 mb-3">
                      <Scroll size={16} className="text-[var(--accent-ink)]" />
                      <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                        Session Role & Narrative Contribution
                      </h3>
                    </div>
                    <p className="font-serif text-sm text-[#161616] leading-relaxed">
                      {selectedCharacterBreakdown.roleSummary}
                    </p>
                  </section>

                  {/* Heroic Highlights */}
                  <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2.5 mb-3">
                      <Sparkles size={16} className="text-[var(--accent-ink)]" />
                      <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                        Heroic Highlights & Critical Rolls
                      </h3>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {selectedCharacterBreakdown.keyMoments.map((moment, idx) => (
                        <div key={idx} className="p-3 bg-white border border-[#141414]/15 rounded-xs flex items-start gap-2.5 shadow-xs">
                          <Flame size={14} className="text-[var(--accent-ink)] shrink-0 mt-0.5" />
                          <span className="font-serif text-xs text-[#161616] leading-relaxed">
                            {moment}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Two-Column Grid: Combat & Social Roleplay */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Combat & Spellcraft */}
                    <section className="bg-white border border-[#141414]/15 rounded-xl p-5 shadow-sm flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2">
                        <Sword size={16} className="text-[#c53030]" />
                        <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                          Combat & Spellcraft
                        </h3>
                      </div>
                      <p className="font-serif text-xs text-[#555555] leading-relaxed">
                        {selectedCharacterBreakdown.combatPerformance}
                      </p>
                    </section>

                    {/* Roleplay & Dialogue */}
                    <section className="bg-white border border-[#141414]/15 rounded-xl p-5 shadow-sm flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 border-b border-[#141414]/15 pb-2">
                        <User size={16} className="text-[var(--accent-ink)]" />
                        <h3 className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#1a1a1a]">
                          Dialogue & Party Roleplay
                        </h3>
                      </div>
                      <p className="font-serif text-xs text-[#555555] leading-relaxed">
                        {selectedCharacterBreakdown.socialAndRoleplay}
                      </p>
                    </section>

                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-white border border-[#141414]/15 rounded-xl text-[#555555] font-serif text-sm">
                  No individual spotlight found for {activePerspective} in this session record.
                </div>
              )}

            </div>
          )

        ) : (
          
          /* Full Raw Transcript Mode */
          <div className="max-w-4xl mx-auto flex flex-col gap-4 text-[#161616]">
            
            {/* Transcript Search Filter */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search raw transcript spoken dialogue..."
                className="w-full bg-white border border-[#141414]/20 focus:border-[var(--accent-ink)] text-[#161616] text-xs pl-9 pr-4 py-2 rounded-xs focus:outline-none shadow-xs"
              />
            </div>

            {/* Transcript Lines List */}
            <div className="flex flex-col gap-2.5">
              {filteredTranscript.length === 0 ? (
                <div className="p-8 text-center text-[#555555] font-serif text-xs">
                  No transcript entries match your search query.
                </div>
              ) : (
                filteredTranscript.map((line, idx) => {
                  const isCurrent = Math.abs(currentPlayTime - line.seconds) < 30;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xs border transition-all flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 shadow-xs ${
                        isCurrent
                          ? 'bg-white border-2 border-[var(--accent-ink)] shadow-md'
                          : 'bg-white border-[#141414]/15 hover:border-black/30'
                      }`}
                    >
                      {/* Timestamp button */}
                      <button
                        onClick={() => handleJumpToTimestamp(line.seconds)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-white border border-[#141414]/20 text-[var(--accent-ink)] font-mono text-[11px] hover:border-black/40 font-bold transition-colors w-fit shrink-0 cursor-pointer shadow-xs"
                        title={`Jump audio to ${line.timestamp}`}
                      >
                        <Play size={10} className="fill-current text-[var(--accent-ink)]" />
                        <span>{line.timestamp}</span>
                      </button>

                      {/* Speaker & Spoken Text */}
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-display text-[11px] uppercase tracking-wider font-bold text-[var(--accent-ink)]">
                          {line.speaker}
                        </span>
                        <p className="font-serif text-sm text-[#161616] leading-relaxed">
                          {line.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        )}

      </div>

    </div>
  );
}
