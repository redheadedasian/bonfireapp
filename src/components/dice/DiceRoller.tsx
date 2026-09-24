import { useState, useRef, useCallback, useEffect } from 'react'
import type { CharacterState as Character } from '../../types'
const modifier = (ab: { score: number }) => Math.floor((ab.score - 10) / 2)
const modStr = (m: number) => (m >= 0 ? `+${m}` : `${m}`)

import { rollDie } from './random'
import { DiceEngine, DICE_SKINS, ROLL_EFFECTS, type DiceSkin, type RollEffect } from './dice3d'
import { D20SkinBadge } from './D20SkinBadge'
import { onRollRequest } from './rollBus'

type RollResult = {
  id: number
  label: string
  rolls: number[]
  modifier: number
  total: number
  diceType: number
  advantage?: 'advantage' | 'disadvantage'
  chosenIndex?: number
  timestamp: Date
  critical?: boolean
  critFail?: boolean
}

type Props = { character: Character }

const SKILL_MAP: Record<string, keyof Character['abilities']> = {
  acrobatics: 'dex', 'animal handling': 'wis', animalhandling: 'wis',
  arcana: 'int', athletics: 'str', deception: 'cha',
  history: 'int', insight: 'wis', intimidation: 'cha',
  investigation: 'int', medicine: 'wis', nature: 'int',
  perception: 'wis', performance: 'cha', persuasion: 'cha',
  religion: 'int', 'sleight of hand': 'dex', sleight: 'dex',
  stealth: 'dex', survival: 'wis',
}

const SPELL_DAMAGE: Record<string, { dice: string; label: string }> = {
  'fire bolt': { dice: '2d10', label: 'Fire Bolt' },
  firebolt: { dice: '2d10', label: 'Fire Bolt' },
  fireball: { dice: '8d6', label: 'Fireball' },
  'magic missile': { dice: '1d4+1', label: 'Magic Missile (1 dart)' },
  'lightning bolt': { dice: '8d6', label: 'Lightning Bolt' },
  'ice storm': { dice: '4d8', label: 'Ice Storm' },
  sneak: { dice: '3d6', label: 'Sneak Attack' },
  'sneak attack': { dice: '3d6', label: 'Sneak Attack' },
}

function parseDiceNotation(notation: string) {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i)
  if (!match) return null
  return {
    count: parseInt(match[1] ?? '1'),
    sides: parseInt(match[2]),
    bonus: parseInt(match[3] ?? '0'),
  }
}

function buildRollResult(
  label: string,
  diceNotation: string,
  extraMod: number,
  advantage?: 'advantage' | 'disadvantage',
): Omit<RollResult, 'id' | 'timestamp'> {
  const parsed = parseDiceNotation(diceNotation)
  if (!parsed) return { label, rolls: [0], modifier: extraMod, total: extraMod, diceType: 20 }

  const { count, sides, bonus } = parsed
  const totalBonus = extraMod + bonus

  let rolls: number[]
  let chosenIndex: number | undefined

  if (advantage && sides === 20 && count === 1) {
    const r1 = rollDie(sides)
    const r2 = rollDie(sides)
    rolls = [r1, r2]
    chosenIndex = advantage === 'advantage' ? (r1 >= r2 ? 0 : 1) : r1 <= r2 ? 0 : 1
  } else {
    rolls = Array.from({ length: count }, () => rollDie(sides))
  }

  const rawSum = chosenIndex !== undefined ? rolls[chosenIndex] : rolls.reduce((a, b) => a + b, 0)
  const total = rawSum + totalBonus
  const mainRoll = chosenIndex !== undefined ? rolls[chosenIndex] : count === 1 ? rolls[0] : undefined

  return {
    label,
    rolls,
    modifier: totalBonus,
    total: Math.max(0, total),
    diceType: sides,
    advantage,
    chosenIndex,
    critical: mainRoll === 20 && sides === 20,
    critFail: mainRoll === 1 && sides === 20,
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasWord(text: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(text)
}

function parseCommand(input: string, character: Character): Omit<RollResult, 'id' | 'timestamp'> | null {
  const raw = input.trim().toLowerCase()
  let advantage: 'advantage' | 'disadvantage' | undefined
  if (/\b(adv|advantage)\b/.test(raw)) advantage = 'advantage'
  else if (/\b(dis|disadvantage)\b/.test(raw)) advantage = 'disadvantage'
  const cleaned = raw.replace(/\b(adv|advantage|dis|disadvantage)\b/g, ' ').replace(/\s+/g, ' ').trim()

  const abilityMap: Record<string, 'str'|'dex'|'con'|'int'|'wis'|'cha'> = {
    'str': 'str', 'strength': 'str', 'dex': 'dex', 'dexterity': 'dex',
    'con': 'con', 'constitution': 'con', 'int': 'int', 'intelligence': 'int',
    'wis': 'wis', 'wisdom': 'wis', 'cha': 'cha', 'charisma': 'cha'
  }
  const abilityKeys = Object.keys(abilityMap)
  const profBonus = Math.ceil(character.level / 4) + 1

  if (hasWord(cleaned, 'save') || hasWord(cleaned, 'saving throw')) {
    const abilityKey = abilityKeys.find(key => hasWord(cleaned, key))
    if (abilityKey) {
      const ability = abilityMap[abilityKey]
      const base = modifier(character.abilities[ability])
      const prof = character.abilities[ability].savingThrowProficiency
      let bonus = base
      if (prof === 'proficient') bonus += profBonus
      if (prof === 'expertise') bonus += profBonus * 2
      return buildRollResult(`${ability.toUpperCase()} Save`, '1d20', bonus, advantage)
    }
  }

  for (const key of abilityKeys) {
    if (hasWord(cleaned, key)) {
      const ability = abilityMap[key]
      return buildRollResult(`${ability.toUpperCase()} Check`, '1d20', modifier(character.abilities[ability]), advantage)
    }
  }
  
  const skillKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length)
  for (const skillKey of skillKeys) {
    if (hasWord(cleaned, skillKey)) {
      const ability = SKILL_MAP[skillKey]
      const camSkillName = skillKey.split(' ').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('') as keyof typeof character.skills
      const skillData = character.skills[camSkillName]
      const abilityMod = modifier(character.abilities[ability])
      let bonus = abilityMod
      if (skillData?.proficiency === 'proficient') bonus += profBonus
      if (skillData?.proficiency === 'expertise') bonus += profBonus * 2
      const label = skillKey.charAt(0).toUpperCase() + skillKey.slice(1)
      return buildRollResult(`${label} Check`, '1d20', bonus, advantage)
    }
  }

  const spellKeys = Object.keys(SPELL_DAMAGE).sort((a, b) => b.length - a.length)
  for (const key of spellKeys) {
    if (hasWord(cleaned, key)) return buildRollResult(SPELL_DAMAGE[key].label, SPELL_DAMAGE[key].dice, 0)
  }

  if (hasWord(cleaned, 'attack') || hasWord(cleaned, 'atk')) {
    const strMod = modifier(character.abilities.str)
    const dexMod = modifier(character.abilities.dex)
    const attackMod = Math.max(strMod, dexMod) + profBonus
    return buildRollResult('Attack Roll', '1d20', attackMod, advantage)
  }

  if (hasWord(cleaned, 'initiative') || hasWord(cleaned, 'init')) {
    return buildRollResult('Initiative', '1d20', character.initiativeBonus, advantage)
  }

  const match = cleaned.match(/(?:roll\s+)?(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?/i)
  if (match) {
    let raw = match[0].replace('roll', '').trim()
    if (raw.startsWith('d')) raw = '1' + raw
    let mod = 0
    if (match[3] && match[4]) {
      mod = parseInt(match[4], 10)
      if (match[3] === '-') mod = -mod
    }
    const cleanFormula = raw.replace(/\s+/g, '')
    return buildRollResult(cleanFormula, cleanFormula, mod, advantage)
  }

  return null
}

const ACTION_ROLLS = [
  { label: 'Attack', cmd: 'attack' },
  { label: 'Initiative', cmd: 'initiative' },
]
const DIE_ROLLS = [
  { label: 'd20', cmd: 'd20' }, { label: 'd4', cmd: 'd4' },
  { label: 'd6', cmd: 'd6' }, { label: 'd8', cmd: 'd8' },
  { label: 'd10', cmd: 'd10' }, { label: 'd12', cmd: 'd12' },
  { label: 'd100', cmd: 'd100' },
]

export default function DiceRoller({ character }: Props) {
  const [command, setCommand] = useState('')
  const [results, setResults] = useState<RollResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showCommands, setShowCommands] = useState(false)
  const idRef = useRef(0)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DiceEngine | null>(null)
  const [latest, setLatest] = useState<RollResult | null>(null)

  // Dice appearance & roll effects — persisted so they survive reloads
  const [skinId, setSkinId] = useState<string>(() => {
    try { return localStorage.getItem('bonfire.diceSkin') || DICE_SKINS[0].id } catch { return DICE_SKINS[0].id }
  })
  const [effectId, setEffectId] = useState<string>(() => {
    try { return localStorage.getItem('bonfire.diceEffect') || ROLL_EFFECTS[0].id } catch { return ROLL_EFFECTS[0].id }
  })

  // Dropdown states
  const [skinMenuOpen, setSkinMenuOpen] = useState(false)
  const [effectMenuOpen, setEffectMenuOpen] = useState(false)

  const skinSelectorRef = useRef<HTMLDivElement>(null)
  const effectSelectorRef = useRef<HTMLDivElement>(null)

  const skin = DICE_SKINS.find(s => s.id === skinId) ?? DICE_SKINS[0]
  const effect = ROLL_EFFECTS.find(e => e.id === effectId) ?? ROLL_EFFECTS[0]

  // Outside click & Escape key listeners for dropdown menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (skinSelectorRef.current && !skinSelectorRef.current.contains(target)) {
        setSkinMenuOpen(false)
      }
      if (effectSelectorRef.current && !effectSelectorRef.current.contains(target)) {
        setEffectMenuOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSkinMenuOpen(false)
        setEffectMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Init 3D engine with ResizeObserver attached to the canvas container element
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!canvas || !container) return

    let engine: DiceEngine
    try {
      engine = new DiceEngine(canvas, skin, effect)
    } catch (err) {
      console.warn('WebGL / 3D Dice initialization failed. Falling back to standard roll resolution.', err)
      return
    }

    engineRef.current = engine

    const resizeObserver = new ResizeObserver(() => {
      engine.resize()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      engine.dispose()
      if (engineRef.current === engine) {
        engineRef.current = null
      }
    }
  }, [])

  // Apply skin/effect changes to the running engine and remember them
  useEffect(() => {
    engineRef.current?.setSkin(skin)
    try { localStorage.setItem('bonfire.diceSkin', skin.id) } catch { /* storage unavailable */ }
  }, [skin])

  useEffect(() => {
    engineRef.current?.setEffect(effect)
    try { localStorage.setItem('bonfire.diceEffect', effect.id) } catch { /* storage unavailable */ }
  }, [effect])

  const handleSelectSkin = (selectedSkin: DiceSkin) => {
    setSkinId(selectedSkin.id)
    setSkinMenuOpen(false)
    try { localStorage.setItem('bonfire.diceSkin', selectedSkin.id) } catch { /* storage unavailable */ }
    engineRef.current?.previewRoll(selectedSkin)
  }

  const handleSelectEffect = (selectedEffect: RollEffect) => {
    setEffectId(selectedEffect.id)
    setEffectMenuOpen(false)
    try { localStorage.setItem('bonfire.diceEffect', selectedEffect.id) } catch { /* storage unavailable */ }
    engineRef.current?.triggerEffectPreview(selectedEffect)
  }

  const performRoll = useCallback((cmd: string, overrideLabel?: string) => {
    const result = parseCommand(cmd, character)
    if (!result) {
      setError(`Didn't recognize "${cmd}" — try mentioning a die (d20), an ability/skill (perception, strength save), or an action (attack, initiative)`)
      return
    }
    setError(null)
    const id = ++idRef.current
    const newResult: RollResult = { ...result, id, timestamp: new Date() }
    if (overrideLabel) newResult.label = overrideLabel

    const faceValue =
      result.chosenIndex !== undefined
        ? result.rolls[result.chosenIndex]
        : result.rolls.length === 1
        ? result.rolls[0]
        : result.total

    if (engineRef.current) {
      engineRef.current.throw({
        sides: result.diceType,
        displayValue: faceValue,
        onDone: () => setLatest(newResult),
      })
    } else {
      setLatest(newResult)
    }

    setResults(prev => [newResult, ...prev.slice(0, 49)])
  }, [character])

  useEffect(() => {
    return onRollRequest(req => performRoll(req.command, req.label))
  }, [performRoll])

  const handleSubmit = (e: import("react").FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    performRoll(command)
    setCommand('')
  }

  const clearHistory = () => {
    setResults([])
    setLatest(null)
  }

  const diceColor = (r: RollResult) =>
    r.critical ? '#c9963d' : r.critFail ? '#b03232' : '#7b3f6e'

  return (
    <div className="flex flex-col gap-3.5 h-full min-h-0">
      {/* ── 3D dice box (full width, clear view, container observed by ResizeObserver) ── */}
      <div
        ref={canvasContainerRef}
        className="arcane-border rounded-xl bg-[#0f0d18] relative overflow-hidden flex-shrink-0"
        style={{ height: 215 }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* ── Dice Customization Bar: Side-by-Side Dropdowns with 2D D20 Icon Badges ── */}
      <div className="grid grid-cols-2 gap-2 flex-shrink-0 relative z-30">
        {/* Dice Skin Selector */}
        <div ref={skinSelectorRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setSkinMenuOpen(v => !v)
              setEffectMenuOpen(false)
            }}
            title="Choose 3D Dice Skin"
            aria-haspopup="listbox"
            aria-expanded={skinMenuOpen}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-black/5 border border-black/20 text-left transition-all duration-150 shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <D20SkinBadge skin={skin} size={24} className="group-hover:scale-105 transition-transform" />
              <div className="truncate">
                <div className="text-[9px] font-display uppercase tracking-widest text-[#777777] font-bold">Dice Skin</div>
                <div className="text-xs font-serif font-bold text-[#161616] truncate">{skin.name}</div>
              </div>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-[#161616] flex-shrink-0 transition-transform duration-200 ${skinMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Skin Dropdown Menu */}
          {skinMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl p-1.5 max-h-72 overflow-y-auto z-50 transition-all duration-200 ease-out origin-top backdrop-blur-md text-[#161616]">
              <div className="px-2 py-1 text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold border-b border-black/10 mb-1">
                Select Dice Skin
              </div>
              <div className="space-y-0.5">
                {DICE_SKINS.map(sk => {
                  const isSelected = sk.id === skinId
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => handleSelectSkin(sk)}
                      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-ink)] text-white font-semibold shadow-xs'
                          : 'text-[#161616] hover:bg-black/5'
                      }`}
                    >
                      <D20SkinBadge skin={sk} size={24} />
                      <div className="truncate flex-1">
                        <div className="truncate font-serif font-medium">{sk.name}</div>
                      </div>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Roll Effect Selector */}
        <div ref={effectSelectorRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setEffectMenuOpen(v => !v)
              setSkinMenuOpen(false)
            }}
            title="Choose Roll Particle Effect"
            aria-haspopup="listbox"
            aria-expanded={effectMenuOpen}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-black/5 border border-black/20 text-left transition-all duration-150 shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center border border-black/20 flex-shrink-0 group-hover:scale-105 transition-transform bg-white"
              >
                <span className="text-[10px]">✨</span>
              </div>
              <div className="truncate">
                <div className="text-[9px] font-display uppercase tracking-widest text-[#777777] font-bold">Roll Effect</div>
                <div className="text-xs font-serif font-bold text-[#161616] truncate">{effect.name}</div>
              </div>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-[#161616] flex-shrink-0 transition-transform duration-200 ${effectMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Effect Dropdown Menu */}
          {effectMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl p-1.5 max-h-72 overflow-y-auto z-50 transition-all duration-200 ease-out origin-top backdrop-blur-md text-[#161616]">
              <div className="px-2 py-1 text-[9px] font-display uppercase tracking-widest text-[#555555] font-bold border-b border-black/10 mb-1">
                Select Roll Effect
              </div>
              <div className="space-y-0.5">
                {ROLL_EFFECTS.map(fx => {
                  const isSelected = fx.id === effectId
                  return (
                    <button
                      key={fx.id}
                      type="button"
                      onClick={() => handleSelectEffect(fx)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-ink)] text-white font-semibold shadow-xs'
                          : 'text-[#161616] hover:bg-black/5'
                      }`}
                    >
                      <span className="font-serif font-medium">{fx.name}</span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Result & Math Breakdown Card (Placed BELOW the customization bar) ── */}
      {latest && (
        <div className="bg-white border border-[#141414]/20 rounded-xl p-3 shadow-md flex flex-col gap-1.5 flex-shrink-0 animate-in fade-in slide-in-from-top-1 duration-200 text-[#161616]">
          <div className="flex justify-between items-center">
            <div className={`font-display text-[10px] tracking-[0.2em] uppercase font-bold flex items-center gap-1.5 ${latest.critical ? 'text-[var(--accent-ink)]' : latest.critFail ? 'text-red-700' : 'text-[#161616]'}`}>
              <span className={`w-2 h-2 rounded-full ${latest.critical ? 'bg-[var(--accent-ink)]' : latest.critFail ? 'bg-red-600' : 'bg-emerald-600'}`} />
              <span>{latest.label}</span>
              {latest.critical && <span className="text-white bg-[var(--accent-ink)] px-1.5 py-0.5 rounded text-[9px] font-bold">CRITICAL HIT!</span>}
              {latest.critFail && <span className="text-white bg-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold">CRITICAL FAIL</span>}
              {latest.advantage && <span className="text-[#555555] text-[9px]">({latest.advantage.toUpperCase()})</span>}
            </div>
            <span className="text-[10px] font-mono text-[#555555] px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-bold">
              d{latest.diceType}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black leading-none" style={{ fontSize: 36, color: 'var(--accent-ink, #1c1c1c)' }}>
                {latest.total}
              </span>
              <span className="text-[10px] font-display text-[#777777] uppercase tracking-wider font-bold">Total</span>
            </div>

            {/* Math Breakdown */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#161616] bg-black/5 px-2.5 py-1.5 rounded border border-black/10 font-semibold">
              {latest.advantage && latest.rolls.length === 2 ? (
                <>
                  <span className="text-[#777777]">Dice:</span>
                  <span>[</span>
                  {latest.rolls.map((r, i) => (
                    <span key={i} className={i === latest.chosenIndex ? 'text-[var(--accent-ink)] font-bold underline' : 'text-[#888888] line-through'}>
                      {i > 0 ? ', ' : ''}{r}
                    </span>
                  ))}
                  <span>]</span>
                  {latest.modifier !== 0 && (
                    <>
                      <span className="text-[#777777]">+ Mod:</span>
                      <span className="text-[var(--accent-ink)] font-bold">{modStr(latest.modifier)}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[#777777]">Dice:</span>
                  <span className="text-[#161616] font-bold">{latest.rolls.join(' + ')}</span>
                  {latest.modifier !== 0 && (
                    <>
                      <span className="text-[#777777]">+ Mod:</span>
                      <span className="text-[var(--accent-ink)] font-bold">{modStr(latest.modifier)}</span>
                    </>
                  )}
                </>
              )}
              <span className="text-[#777777]">=</span>
              <span className="text-[#161616] font-bold">{latest.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Command input (full width) ── */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 flex-shrink-0">
        <input
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="roll d20 · attack · perception check · str save…"
          className="flex-1 min-w-0 basis-full bg-white border border-black/20 rounded-lg px-4 py-2.5 font-serif text-sm text-[#161616] placeholder-[#888888] focus:outline-none focus:border-[var(--accent-ink)] shadow-xs transition-colors"
        />
        <button type="submit" className="sumie-btn-primary flex-1 py-2.5">
          Roll
        </button>
        <button
          type="button"
          onClick={() => setShowCommands(v => !v)}
          className={`sumie-btn-secondary flex-1 py-2.5 ${showCommands ? 'bg-black/10 border-black text-[#161616]' : ''}`}
        >
          Commands
        </button>
      </form>

      {error && <p className="font-mono text-xs text-red-600 px-1 flex-shrink-0 font-semibold">{error}</p>}

      {/* ── Quick rolls: actions first, then raw dice ── */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <div className="flex gap-2">
          {ACTION_ROLLS.map(q => (
            <button
              key={q.cmd}
              onClick={() => performRoll(q.cmd)}
              className="flex-1 sumie-btn-primary py-2 text-[11px]"
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {DIE_ROLLS.map(q => (
            <button
              key={q.cmd}
              onClick={() => performRoll(q.cmd)}
              className="sumie-btn-secondary py-1.5 px-3 text-[11px]"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Commands reference (toggle) ── */}
      {showCommands && (
        <div className="rounded-lg p-3 bg-white border border-black/15 shadow-xs flex-shrink-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-[#555555]">
            <span><span className="text-[#161616] font-bold">d20 · 2d6+3</span> · dice notation</span>
            <span><span className="text-[#161616] font-bold">attack</span> · weapon attack</span>
            <span><span className="text-[#161616] font-bold">str / dex / wis…</span> · ability check</span>
            <span><span className="text-[#161616] font-bold">perception</span> · any skill by name</span>
            <span><span className="text-[#161616] font-bold">str save</span> · saving throw</span>
            <span><span className="text-[#161616] font-bold">init</span> · initiative</span>
            <span><span className="text-[#161616] font-bold">adv d20 · dis str</span> · advantage/disadv.</span>
            <span><span className="text-[#161616] font-bold">fireball · sneak</span> · damage</span>
          </div>
        </div>
      )}

      {/* ── Roll history (header ALWAYS visible + Clear) ── */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="font-display text-[10px] tracking-widest text-[#161616] uppercase font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Roll History
          </div>
          <button
            onClick={clearHistory}
            disabled={results.length === 0}
            className="font-display text-[10px] tracking-widest uppercase px-2 py-1 rounded border border-black/20 text-[#555555] hover:border-red-500 hover:text-red-600 disabled:opacity-30 transition-all cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1" style={{ minHeight: 60 }}>
          {results.length === 0 ? (
            <p className="font-serif text-sm text-[#777777] italic py-4 text-center">
              Your rolls will appear here…
            </p>
          ) : (
            <div className="space-y-1">
              {results.map(r => (
                <div key={r.id} className="flex items-center gap-3 py-1.5 border-b border-[#141414]/10">
                  <span className="font-display text-lg font-bold w-10 text-right flex-shrink-0 text-[#161616]">
                    {r.total}
                  </span>
                  <span className="font-serif text-sm text-[#161616] flex-1 truncate font-medium">{r.label}</span>
                  <span className="font-mono text-xs text-[#777777]">
                    [{r.rolls.join('+')}]{r.modifier !== 0 ? modStr(r.modifier) : ''}
                  </span>
                  <span className="font-mono text-[10px] text-[#777777] flex-shrink-0">
                    {r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
