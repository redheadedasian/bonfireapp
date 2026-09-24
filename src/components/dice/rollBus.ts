// A tiny event bus so inline roll buttons (on weapons, spells, skills, etc.)
// can trigger a roll in the DiceRoller panel, wherever it lives.
// The DiceRoller subscribes; anything can publish a roll request.

export type RollRequest = {
  // A dice command string the DiceRoller already understands,
  // e.g. "1d20+8", "2d6+4", "8d6", or a keyword like "attack".
  command: string
  // Human label shown in the result + history, e.g. "Battleaxe Attack".
  label?: string
}

type Listener = (req: RollRequest) => void

const listeners = new Set<Listener>()

export function onRollRequest(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function requestRoll(req: RollRequest): void {
  listeners.forEach(fn => fn(req))
}
