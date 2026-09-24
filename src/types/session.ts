// Session Chronicler Types for Bonfire D&D 5e

export interface TimelineEvent {
  timestamp: string; // e.g. "00:14:32"
  seconds: number;
  event: string;
}

export interface NpcInteraction {
  name: string;
  description: string;
  loreRevealed: string;
}

export interface CombatEncounter {
  encounter: string;
  enemies: string;
  outcome: string;
  casualties: string;
}

export interface MagicItemReward {
  name: string;
  recipient: string;
  properties: string;
}

export interface LootAndRewards {
  goldAcquired: string;
  magicItems: MagicItemReward[];
  mundaneLoot: string[];
}

export interface OverallSummary {
  highLevelNarrative: string;
  timeline: TimelineEvent[];
  npcInteractions: NpcInteraction[];
  combatEncounters: CombatEncounter[];
  lootAndRewards: LootAndRewards;
  unresolvedHooks: string[];
}

export interface CharacterBreakdown {
  roleSummary: string;
  keyMoments: string[];
  combatPerformance: string;
  socialAndRoleplay: string;
}

export interface TranscriptLine {
  timestamp: string; // e.g. "00:02:15"
  seconds: number;
  speaker: string;
  text: string;
}

export interface SessionChroniclerData {
  sessionTitle: string;
  sessionNumber: number;
  sessionDuration: string;
  overallSummary: OverallSummary;
  characterBreakdowns: Record<string, CharacterBreakdown>;
  fullTranscript: TranscriptLine[];
}

export type ProcessingStatus = 'ready' | 'analyzing' | 'transcribed' | 'failed' | 'uploaded';

export interface ChroniclerSession {
  id: string;
  sessionNumber: number;
  sessionTitle: string;
  date: string;
  durationSeconds: number;
  formattedDuration: string;
  status: ProcessingStatus;
  audioBlob?: Blob;
  audioUrl?: string;
  audioFileName?: string;
  audioFileSize?: number;
  data: SessionChroniclerData;
  partyMembers: string[];
  createdAt: number;
}
