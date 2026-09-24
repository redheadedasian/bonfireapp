import { GoogleGenAI, Type } from '@google/genai';
import { SessionChroniclerData } from '../types/session';

const API_KEY_STORAGE_KEY = 'bonfire_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function hasConfiguredApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

/**
 * Converts a File or Blob into base64 string
 */
function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data url prefix (e.g. data:audio/mp3;base64,...)
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Analyzes audio recording using Google Gemini API
 */
export async function analyzeSessionAudio(
  audioFile: File | Blob,
  meta: {
    sessionNumber: number;
    sessionTitle: string;
    partyMembers: string[];
  },
  onProgress?: (status: string) => void
): Promise<SessionChroniclerData> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please configure your API key in Settings.');
  }

  onProgress?.('Initializing Google Gemini client...');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  onProgress?.('Preparing audio payload for analysis...');
  const base64Audio = await fileToBase64(audioFile);
  const mimeType = (audioFile as File).type || 'audio/mp3';

  const systemInstruction = `You are the master Campaign Chronicler and Scribe for a Dungeons & Dragons 5th Edition campaign.
Analyze the recorded tabletop session audio meticulously. Listen to all player dialogue, DM descriptions, combat encounters, rolls, and NPC interactions.
Return a structured JSON object strictly adhering to the specified schema.
Ensure high narrative fidelity with precise timestamps formatted as "HH:MM:SS" or "MM:SS".
Do not include any emojis in titles, text, or outputs. Use clean, immersive fantasy and tactical terminology.`;

  const prompt = `Session Number: ${meta.sessionNumber}
Session Title: ${meta.sessionTitle}
Active Party Members: ${meta.partyMembers.join(', ')}

Please transcribe the session, compile a chronological story timeline with audio timestamps, identify all NPC interactions, summarize combat encounters with casualties, construct the loot & spoils ledger, delineate unresolved quest hooks, and build dedicated character spotlight breakdowns for each party member: ${meta.partyMembers.join(', ')}.`;

  onProgress?.('Transcribing session dialogue & analyzing campaign events with Gemini...');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sessionTitle: { type: Type.STRING },
            sessionNumber: { type: Type.NUMBER },
            sessionDuration: { type: Type.STRING },
            overallSummary: {
              type: Type.OBJECT,
              properties: {
                highLevelNarrative: { type: Type.STRING },
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timestamp: { type: Type.STRING },
                      seconds: { type: Type.NUMBER },
                      event: { type: Type.STRING }
                    },
                    required: ['timestamp', 'event']
                  }
                },
                npcInteractions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      loreRevealed: { type: Type.STRING }
                    },
                    required: ['name', 'description', 'loreRevealed']
                  }
                },
                combatEncounters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      encounter: { type: Type.STRING },
                      enemies: { type: Type.STRING },
                      outcome: { type: Type.STRING },
                      casualties: { type: Type.STRING }
                    },
                    required: ['encounter', 'enemies', 'outcome', 'casualties']
                  }
                },
                lootAndRewards: {
                  type: Type.OBJECT,
                  properties: {
                    goldAcquired: { type: Type.STRING },
                    magicItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          recipient: { type: Type.STRING },
                          properties: { type: Type.STRING }
                        },
                        required: ['name', 'recipient', 'properties']
                      }
                    },
                    mundaneLoot: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['goldAcquired', 'magicItems', 'mundaneLoot']
                },
                unresolvedHooks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['highLevelNarrative', 'timeline', 'npcInteractions', 'combatEncounters', 'lootAndRewards', 'unresolvedHooks']
            },
            characterBreakdowns: {
              type: Type.OBJECT,
              description: 'Character name as key, with spotlight object'
            },
            fullTranscript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  seconds: { type: Type.NUMBER },
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ['timestamp', 'speaker', 'text']
              }
            }
          },
          required: ['sessionTitle', 'sessionNumber', 'sessionDuration', 'overallSummary', 'characterBreakdowns', 'fullTranscript']
        }
      }
    });

    onProgress?.('Formatting structured chronicler report...');
    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parsed: SessionChroniclerData = JSON.parse(textOutput);
    return parsed;
  } catch (err: any) {
    console.error('Gemini Audio Analysis Error:', err);
    throw new Error(err?.message || 'Failed to process audio session with Gemini.');
  }
}
