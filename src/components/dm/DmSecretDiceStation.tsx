import React from 'react';
import { 
  Dices, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { DmSecretRoll } from '../../types/dm';
import { CharacterState } from '../../types';
import DiceRoller from '../dice/DiceRoller';

interface DmSecretDiceStationProps {
  character: CharacterState;
  secretRolls: DmSecretRoll[];
  toggleRevealRoll: (rollId: string) => void;
  setConfirmClearRolls: (confirm: boolean) => void;
}

export function DmSecretDiceStation({
  character,
  secretRolls,
  toggleRevealRoll,
  setConfirmClearRolls
}: DmSecretDiceStationProps) {
  return (
    <div className="w-full h-full overflow-y-auto hide-scrollbar p-6 max-w-6xl mx-auto flex flex-col gap-6 text-[#161616]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#141414]/15 pb-3">
        <div>
          <h3 className="font-display text-base uppercase tracking-wider text-[#1a1a1a] font-bold flex items-center gap-2">
            <Dices size={18} className="text-[var(--accent-ink)]" />
            <span>Dungeon Master Secret Dice Station</span>
          </h3>
          <p className="font-serif text-xs text-[#555555]">
            Roll blind checks with 3D physics. Shrouded rolls stay private to the DM screen until clicked to reveal to the player HUD.
          </p>
        </div>
        {secretRolls.length > 0 && (
          <button
            onClick={() => setConfirmClearRolls(true)}
            className="text-xs font-serif text-[#777777] hover:text-[#c53030] cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {/* TWO-COLUMN LAYOUT: Left = Front & Center 3D DiceRoller, Right = Shrouded Whisper Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FRONT & CENTER 3D D20 ROLLER */}
        <div className="lg:col-span-7 p-4 bg-[#fcfbf9] border-2 border-black/30 rounded-xl relative overflow-hidden shadow-xl min-h-[540px] flex flex-col">
          <div className="relative z-10 flex-1 min-h-[480px]">
            <DiceRoller character={character} />
          </div>
        </div>

        {/* SHROUDED ROLLS LOG & REVEAL MECHANIC */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 p-4 bg-white border border-[#141414]/15 rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-[var(--accent-ink)]" />
              <h4 className="font-display text-xs uppercase tracking-wider text-[#1a1a1a] font-bold">
                Secret Rolls & Blind Checks
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#555555]">{secretRolls.length} rolls</span>
          </div>

          <p className="text-[11px] font-serif text-[#555555] leading-relaxed">
            <strong>How Shrouded Works:</strong> Rolls marked as <span className="text-[#c53030] font-bold">Shrouded</span> are concealed behind the DM screen. Clicking <span className="text-[#1EB253] font-bold">"Revealed"</span> broadcasts the result to player character HUDs.
          </p>

          {/* Secret Rolls Log */}
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto hide-scrollbar pr-1">
            {secretRolls.length > 0 ? (
              secretRolls.map(roll => (
                <div
                  key={roll.id}
                  className={`p-3 rounded border flex items-center justify-between gap-3 ${
                    roll.isRevealed ? 'bg-white border-[#141414]/15' : 'bg-[var(--accent-ink)]/5 border-[var(--accent-ink)]/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-[#1c1c1c] text-white flex items-center justify-center font-mono text-base font-bold shrink-0">
                      {roll.result}
                    </div>
                    <div className="min-w-0">
                      <strong className="font-display text-xs text-[#161616] uppercase truncate block">
                        {roll.label}
                      </strong>
                      <span className="text-[10px] font-mono text-[#777777] truncate block">
                        {roll.command} ({roll.breakdown}) • {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleRevealRoll(roll.id)}
                    className={`px-2.5 py-1 text-[10px] font-display uppercase tracking-wider rounded border flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                      roll.isRevealed
                        ? 'bg-[#1EB253]/15 border-[#1EB253]/40 text-[#1EB253]'
                        : 'bg-[#E33526]/15 border-[#E33526]/40 text-[#c53030]'
                    }`}
                  >
                    {roll.isRevealed ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{roll.isRevealed ? 'Revealed' : 'Shrouded'}</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs font-serif text-[#777777]">
                No secret rolls logged yet. Use the 3D dice station to make rolls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
