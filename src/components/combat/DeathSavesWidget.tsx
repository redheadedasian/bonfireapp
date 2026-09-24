import React, { useState } from 'react';
import { useStore } from '../../store';
import { requestRoll } from '../dice/rollBus';
import { rollDie } from '../dice/random';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { GameAssetImg } from '../common/GameAssetImg';

interface DeathSavesWidgetProps {
  compact?: boolean;
}

export function DeathSavesWidget({ compact = false }: DeathSavesWidgetProps) {
  const { character, rollDeathSave, updateCharacterField } = useStore();
  const [lastOutcomeMessage, setLastOutcomeMessage] = useState<string>('');

  const { successes, failures } = character.deathSaves;
  const isUnconscious = character.hp.current === 0;
  const isStable = successes >= 3;
  const isDead = failures >= 3;

  const handleRollDeathSave = () => {
    const roll = rollDie(20);
    
    requestRoll({
      command: `1d20`,
      label: `Death Saving Throw (Result: ${roll})`
    });

    const { outcome } = rollDeathSave(roll);

    if (outcome === 'crit_success') {
      setLastOutcomeMessage('NAT 20! You regain 1 HP and awaken!');
    } else if (outcome === 'crit_failure') {
      setLastOutcomeMessage('NAT 1! Suffered 2 Death Save Failures!');
    } else if (outcome === 'success') {
      setLastOutcomeMessage(`Success (${roll} >= 10)`);
    } else {
      setLastOutcomeMessage(`Failure (${roll} < 10)`);
    }

    setTimeout(() => {
      setLastOutcomeMessage('');
    }, 4000);
  };

  const togglePip = (type: 'successes' | 'failures', index: number) => {
    const current = character.deathSaves[type];
    const next = current === index ? index - 1 : index;
    updateCharacterField('deathSaves', {
      ...character.deathSaves,
      [type]: next
    });
  };

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border transition-all ${
        isDead
          ? 'bg-red-50/90 border-red-400 shadow-md text-red-900'
          : isStable
          ? 'bg-emerald-50/90 border-emerald-400 shadow-md text-emerald-900'
          : isUnconscious
          ? 'bg-amber-50/90 border-amber-400 shadow-md text-amber-900'
          : 'bg-white/90 border-[#141414]/20 shadow-sm text-[#161616]'
      } ${compact ? 'p-2' : 'p-3 sm:p-4'}`}
    >
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={14} className={isDead ? 'text-red-600' : isStable ? 'text-emerald-600' : 'text-[var(--accent-ink)]'} />
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#161616] font-bold">
            Death Saving Throws
          </span>
        </div>

        {isDead ? (
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-red-600 animate-pulse">
            Character Deceased
          </span>
        ) : isStable ? (
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-600 font-bold">
            Stabilized
          </span>
        ) : isUnconscious ? (
          <span className="text-[10px] font-display uppercase tracking-wider text-amber-700 font-bold">
            Unconscious (0 HP)
          </span>
        ) : null}
      </div>

      {/* Interactive Orbs: Successes & Failures */}
      <div className="grid grid-cols-2 gap-3 py-1">
        {/* Successes */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[9px] font-display text-emerald-800 uppercase tracking-wider font-bold">
            <span>Successes</span>
            <span>{successes}/3</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((index) => {
              const isFilled = successes >= index;
              return (
                <div
                  key={`succ-${index}`}
                  onClick={() => togglePip('successes', index)}
                  className="relative w-6 h-6 sm:w-7 sm:h-7 cursor-pointer group flex items-center justify-center"
                  title={`Mark Success ${index}`}
                >
                  <div
                    className={`absolute inset-0 rounded-full border transition-all duration-200 ${
                      isFilled
                        ? 'border-emerald-600 bg-emerald-100/60'
                        : 'border-black/20 bg-white group-hover:border-black/40'
                    }`}
                  />
                  {isFilled ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-200">
                      <div className="absolute inset-[-2px] bg-emerald-400 blur-[2px] opacity-30 rounded-full animate-pulse pointer-events-none" />
                      <GameAssetImg
                        src="/panel/save.svg"
                        fallbackSrc="/panel/save.png"
                        alt="Success Orb"
                        className="w-full h-full object-contain filter brightness-105 relative z-10"
                      />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Failures */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[9px] font-display text-red-800 uppercase tracking-wider font-bold">
            <span>Failures</span>
            <span>{failures}/3</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((index) => {
              const isFilled = failures >= index;
              return (
                <div
                  key={`fail-${index}`}
                  onClick={() => togglePip('failures', index)}
                  className="relative w-6 h-6 sm:w-7 sm:h-7 cursor-pointer group flex items-center justify-center"
                  title={`Mark Failure ${index}`}
                >
                  <div
                    className={`absolute inset-0 rounded-full border transition-all duration-200 ${
                      isFilled
                        ? 'border-red-600 bg-red-100/60'
                        : 'border-black/20 bg-white group-hover:border-black/40'
                    }`}
                  />
                  {isFilled ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-200">
                      <div className="absolute inset-[-2px] bg-red-400 blur-[2px] opacity-35 rounded-full animate-pulse pointer-events-none" />
                      <GameAssetImg
                        src="/panel/fail.svg"
                        fallbackSrc="/panel/fail.png"
                        alt="Failure Orb"
                        className="w-full h-full object-contain filter brightness-105 relative z-10"
                      />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1-Click Roll Death Save Button */}
      {!isDead && !isStable && (
        <button
          onClick={handleRollDeathSave}
          className="sumie-btn-primary w-full mt-1"
        >
          <RefreshCw size={12} />
          <span>Roll Death Save (d20)</span>
        </button>
      )}

      {/* Outcome Toast notification */}
      {lastOutcomeMessage && (
        <div className="text-[10px] font-display text-center text-[#161616] animate-fade-in bg-white/95 py-0.5 rounded border border-black/20 font-bold shadow-xs">
          {lastOutcomeMessage}
        </div>
      )}
    </div>
  );
}
