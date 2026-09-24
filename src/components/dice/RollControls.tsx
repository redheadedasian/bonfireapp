import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { requestRoll } from './rollBus'

// ── Inline roll button ──
export function RollButton({ command, label, title }: { command: string; label: string; title?: string }) {
  return (
    <button
      type="button"
      onClick={() => requestRoll({ command, label })}
      title={title ?? `Roll ${label}`}
      className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-[var(--accent-ink)] border border-black/20 hover:bg-black/5 hover:border-[var(--accent-ink)] transition-all text-sm leading-none cursor-pointer bg-white shadow-xs"
    >
      &#9860;
    </button>
  )
}

// ── Smart lookup input ──
//
// IMPORTANT: this is a plain text input FIRST, autocomplete second.
// Free-form/homebrew text is always allowed. The dropdown only OFFERS to
// auto-fill; it never forces a selection and never rewrites typed text on blur.
//
// The menu renders in a PORTAL with fixed positioning so it escapes any
// `overflow` container instead of being clipped / spawning a scrollbar.

type LookupProps<T extends { name: string }> = {
  value: string
  onChange: (v: string) => void
  onSelect: (item: T) => void
  search: (q: string) => T[]
  placeholder?: string
  className?: string
  renderRow?: (item: T) => ReactNode
  headers?: ReactNode
  menuWidth?: number
}

export function SmartLookup<T extends { name: string }>({
  value, onChange, onSelect, search, placeholder, className, renderRow, headers, menuWidth = 620,
}: LookupProps<T>) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<T[]>([])
  const [highlight, setHighlight] = useState(0)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const reposition = () => {
    const el = inputRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const menuH = Math.min(340, Math.max(120, results.length * 56 + 60))
    const openUp = spaceBelow < menuH && r.top > spaceBelow
    const width = Math.min(menuWidth, window.innerWidth - 24)
    let left = r.left
    if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12)
    setRect({ top: openUp ? Math.max(8, r.top - menuH - 4) : r.bottom + 4, left, width })
  }

  useLayoutEffect(() => {
    if (open) reposition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results.length])

  useEffect(() => {
    if (!open) return
    const onScrollOrResize = () => reposition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results.length])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (inputRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const runSearch = (q: string) => {
    const r = search(q)
    setResults(r)
    setOpen(r.length > 0)
    setHighlight(0)
  }

  // ONE write: the caller owns the full update (fixes the name-clobber bug).
  const pick = (item: T) => {
    onSelect(item)
    setOpen(false)
  }

  return (
    <>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); runSearch(e.target.value) }}
        onFocus={() => { if (value) runSearch(value) }}
        onKeyDown={e => {
          if (!open) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
          else if (e.key === 'Enter') { if (results[highlight]) { e.preventDefault(); pick(results[highlight]) } }
          else if (e.key === 'Escape') setOpen(false)
          else if (e.key === 'Tab') setOpen(false)
        }}
        className={className}
      />
      {open && rect && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="lookup-menu"
        >
          {headers && <div className="lookup-menu-head">{headers}</div>}
          <div className="lookup-menu-list">
            {results.map((item, i) => (
              <button
                key={item.name}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(item)}
                className={`lookup-menu-row ${i === highlight ? 'active' : ''}`}
              >
                {renderRow ? renderRow(item) : (
                  <span className="lookup-menu-name">{item.name}</span>
                )}
              </button>
            ))}
          </div>
          <div className="lookup-menu-foot">
            <span className="lookup-menu-hint">
              &#8593;&#8595; navigate &middot; Enter to fill &middot; Esc keeps your own text
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
