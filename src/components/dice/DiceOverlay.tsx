import React, { useEffect, useRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';
import { Button, Card } from '../ui';
import { cn } from '../../utils';

// We create a singleton for the dice box so it can be called from anywhere
let diceBoxInstance: any = null;

export const initDiceBox = async (containerId: string) => {
  if (diceBoxInstance) return diceBoxInstance;
  
  diceBoxInstance = new DiceBox(`#${containerId}`, {
    assetPath: '/assets/dice-box/', // Requires assets to be served, we might need a CDN or local fallback
    theme: 'default',
    themeColor: '#C99742',
    scale: 6,
    spinForce: 5,
    throwForce: 5,
    gravity: 1,
    mass: 1,
    friction: 0.8,
    restitution: 0.1,
    linearDamping: 0.5,
    angularDamping: 0.4,
    settleTimeout: 5000
  });

  try {
    await diceBoxInstance.init();
  } catch (e) {
    console.warn("Dice box initialization failed, likely due to missing assets path.", e);
  }
  return diceBoxInstance;
};

export const rollDice = async (notation: string) => {
  if (!diceBoxInstance) return null;
  return await diceBoxInstance.roll(notation);
};

export function DiceOverlay() {
  const [lastRoll, setLastRoll] = useState<any>(null);

  useEffect(() => {
    initDiceBox('dice-canvas').then(box => {
      box.onRollComplete = (results: any) => {
        setLastRoll(results);
      };
    });
  }, []);

  return (
    <>
      <div id="dice-canvas" className="fixed inset-0 pointer-events-none z-50" />
      {lastRoll && (
         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <Card className="flex items-center gap-4 bg-[#181614]/90 backdrop-blur-sm shadow-2xl border-[#C99742]">
               <div className="flex flex-col">
                 <span className="text-[#9E9282] text-xs uppercase tracking-wider">Result</span>
                 <span className="text-3xl text-[#FFFFFF] font-serif">
                   {lastRoll.reduce((acc: number, group: any) => acc + group.value, 0)}
                 </span>
               </div>
               <Button variant="ghost" onClick={() => setLastRoll(null)}>Dismiss</Button>
            </Card>
         </div>
      )}
    </>
  );
}
