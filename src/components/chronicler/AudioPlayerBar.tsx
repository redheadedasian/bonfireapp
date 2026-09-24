import React, { useState, useEffect, useRef } from 'react';
import { ChroniclerSession } from '../../types/session';
import { audioBus, formatAudioTime } from '../../services/audioBus';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Volume1,
  Headphones, 
  Sparkles 
} from 'lucide-react';

interface AudioPlayerBarProps {
  session: ChroniclerSession;
}

export function AudioPlayerBar({ session }: AudioPlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.durationSeconds || 13320);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  // Load audio source from blob or synthesize simulation
  useEffect(() => {
    let url: string | null = null;
    if (session.audioBlob) {
      url = URL.createObjectURL(session.audioBlob);
      setAudioSrc(url);
    } else if (session.audioUrl) {
      setAudioSrc(session.audioUrl);
    } else {
      setAudioSrc(null);
    }

    setDuration(session.durationSeconds || 13320);
    setCurrentTime(0);
    setIsPlaying(false);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, [session.id]);

  // Subscribe to audio bus seek events
  useEffect(() => {
    const unsubscribe = audioBus.subscribe((seconds, autoPlay) => {
      setCurrentTime(seconds);
      if (audioRef.current && audioSrc) {
        audioRef.current.currentTime = seconds;
        if (autoPlay) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      } else if (autoPlay) {
        setIsPlaying(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [audioSrc]);

  // Synthetic player clock when no real audio stream is loaded
  useEffect(() => {
    if (!audioSrc && isPlaying) {
      synthTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          audioBus.setCurrentTime(next);
          return next;
        });
      }, 1000);
    } else {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    }

    return () => {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, [audioSrc, isPlaying, playbackRate, duration]);

  const togglePlayPause = () => {
    if (audioRef.current && audioSrc) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const skipSeconds = (delta: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    setCurrentTime(newTime);
    audioBus.seekTo(newTime, isPlaying);
    if (audioRef.current && audioSrc) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioBus.seekTo(newTime, isPlaying);
    if (audioRef.current && audioSrc) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-[#fcfbf9] border-b border-[#141414]/15 px-4 py-3 select-none flex flex-col gap-2.5 shadow-sm text-[#161616]">
      
      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const cur = audioRef.current.currentTime;
              setCurrentTime(cur);
              audioBus.setCurrentTime(cur);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Scrubber Progress Bar */}
      <div className="flex flex-col gap-1">
        <div className="relative flex items-center group">
          <input
            type="range"
            min="0"
            max={duration}
            step="1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-black/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-ink)] focus:outline-none"
            style={{
              background: `linear-gradient(to right, var(--accent-ink) 0%, var(--accent-ink) ${progressPercent}%, rgba(0,0,0,0.1) ${progressPercent}%, rgba(0,0,0,0.1) 100%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
          <span className="text-[#161616] font-bold">{formatAudioTime(currentTime)}</span>
          <div className="flex items-center gap-1.5 text-[10px] font-serif text-[var(--accent-ink)] font-bold">
            <Headphones size={11} />
            <span>Master Tabletop Recording</span>
          </div>
          <span className="font-bold">{formatAudioTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        
        {/* Left: Speed Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-[#141414]/15 shadow-xs">
          {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-0.5 rounded text-[10px] font-display font-bold transition-colors cursor-pointer ${
                playbackRate === speed
                  ? 'bg-[#1c1c1c] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#161616]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Center: Play / Pause & Skips */}
        <div className="flex items-center gap-3">
          {/* Skip -15s */}
          <button
            onClick={() => skipSeconds(-15)}
            className="p-2 rounded-full text-[#555555] hover:text-[#161616] hover:bg-black/5 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            title="Rewind 15 seconds"
          >
            <RotateCcw size={16} />
            <span className="text-[9px] font-mono font-bold ml-1">15</span>
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause Recording' : 'Play Recording'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          {/* Skip +15s */}
          <button
            onClick={() => skipSeconds(15)}
            className="p-2 rounded-full text-[#555555] hover:text-[#161616] hover:bg-black/5 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            title="Fast forward 15 seconds"
          >
            <span className="text-[9px] font-mono font-bold mr-1">15</span>
            <RotateCw size={16} />
          </button>
        </div>

        {/* Right: Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-[#777777] hover:text-[#161616] transition-colors p-1 cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} />
            ) : volume < 0.5 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1 bg-black/15 rounded-full appearance-none accent-[var(--accent-ink)] cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
