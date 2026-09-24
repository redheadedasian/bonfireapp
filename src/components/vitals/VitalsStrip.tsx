import React from 'react';
import { CharacterState } from '../../types';
import { InitiativeBadge } from '../character/InitiativeBadge';
import { SpeedBadge } from '../character/SpeedBadge';
import { HitDiceBadge } from '../character/HitDiceBadge';
import { DeathSavesOrbGroup } from '../character/DeathSavesOrbGroup';
import { InspirationWidget } from '../character/InspirationWidget';
import { requestRoll } from '../dice/rollBus';

export interface VitalsStripProps {
  character: CharacterState;
  isEditMode?: boolean;
  onUpdateField: <K extends keyof CharacterState>(field: K, val: CharacterState[K]) => void;
  onToggleDeathSave: (type: 'successes' | 'failures', index: number) => void;
  onRollDeathSave?: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * VitalsStrip (Secondary Combat Badges)
 * Enforces a single true horizontal center axis across all 5 medallions:
 * Initiative, Speed, Hit Dice, Death Saves, and Inspiration.
 */
export function VitalsStrip({
  character,
  isEditMode = false,
  onUpdateField,
  onToggleDeathSave,
  onRollDeathSave,
  className = '',
}: VitalsStripProps) {
  const handleInitiativeRoll = () => {
    requestRoll({
      command: `1d20${character.initiativeBonus >= 0 ? '+' : ''}${character.initiativeBonus}`,
      label: 'Initiative Roll',
    });
  };

  return (
    <div
      className={`w-full flex items-center justify-between gap-1 sm:gap-2 md:gap-3 lg:gap-4 text-[#161616] ${className}`}
    >
      {/* 1. Initiative Badge (Diamond at 47.26% -> Shift down +2.74%) */}
      <div className="flex-1 flex items-center justify-center min-w-0 transition-all transform translate-y-[2.7%]">
        <InitiativeBadge
          bonus={character.initiativeBonus}
          isEditMode={isEditMode}
          onUpdateBonus={(val) => onUpdateField('initiativeBonus', val)}
          onRoll={handleInitiativeRoll}
        />
      </div>

      {/* 2. Speed Badge (Diamond at 55.87% -> Shift up -5.87%) */}
      <div className="flex-1 flex items-center justify-center min-w-0 transition-all transform -translate-y-[5.9%]">
        <SpeedBadge
          speed={character.speed}
          isEditMode={isEditMode}
          onUpdateSpeed={(val) => onUpdateField('speed', val)}
        />
      </div>

      {/* 3. Hit Dice Badge (Diamond at 48.48% -> Shift down +1.52%) */}
      <div className="flex-1 flex items-center justify-center min-w-0 transition-all transform translate-y-[1.5%]">
        <HitDiceBadge
          current={character.hitDice.current}
          total={character.hitDice.total}
          dieType="d8"
          isEditMode={isEditMode}
          onUpdateCurrent={(val) =>
            onUpdateField('hitDice', { ...character.hitDice, current: val })
          }
          onUpdateTotal={(val) =>
            onUpdateField('hitDice', { ...character.hitDice, total: val })
          }
        />
      </div>

      {/* 4. Death Saves Orb Group (Diamond at 54.26% -> Shift up -4.26%) */}
      <div className="flex-1 flex items-center justify-center min-w-0 transition-all transform -translate-y-[4.3%]">
        <DeathSavesOrbGroup
          successes={character.deathSaves.successes}
          failures={character.deathSaves.failures}
          onToggleSuccess={(i) => onToggleDeathSave('successes', i)}
          onToggleFailure={(i) => onToggleDeathSave('failures', i)}
          onRoll={onRollDeathSave}
        />
      </div>

      {/* 5. Inspiration Badge (Diamond at 50.39% -> Shift up -0.39%) */}
      <div className="flex-1 flex items-center justify-center min-w-0 transition-all transform -translate-y-[0.4%]">
        <InspirationWidget
          active={character.inspiration}
          onToggle={() => onUpdateField('inspiration', !character.inspiration)}
        />
      </div>
    </div>
  );
}

export default VitalsStrip;
