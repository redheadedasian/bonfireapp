// Event bus for syncing audio playback across timeline, transcript, and player

type SeekCallback = (seconds: number, autoPlay?: boolean) => void;

class AudioBus {
  private listeners: Set<SeekCallback> = new Set();
  private currentTime: number = 0;
  private isPlaying: boolean = false;

  subscribe(callback: SeekCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  seekTo(seconds: number, autoPlay: boolean = true) {
    this.currentTime = seconds;
    this.listeners.forEach((listener) => listener(seconds, autoPlay));
  }

  setCurrentTime(seconds: number) {
    this.currentTime = seconds;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  setPlaying(playing: boolean) {
    this.isPlaying = playing;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioBus = new AudioBus();

export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function parseTimestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const parts = timestamp.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
