'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Loader2, MapPin, X } from 'lucide-react'
import { DUTCH_CITIES } from '@/lib/constants/dutch-cities'
import type { PdokResolvedAddress } from '@/lib/host/pdok-address'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

type Suggestion = { id: string; label: string }

type MenuPos = { top: number; left: number; width: number; maxHeight: number }

const fieldClass =
  'h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white'

/** Above Filters sheet (z-1300) + floating dock */
const MENU_Z = 2000

function useMenuPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>
) {
  const [pos, setPos] = useState<MenuPos | null>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      setContainer(null)
      return
    }

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const dialog = el.closest('[role="dialog"]') as HTMLElement | null
      setContainer(dialog)
      const anchorRect = el.getBoundingClientRect()
      const gap = 8
      const bottomPad = 16
      if (dialog) {
        const dialogRect = dialog.getBoundingClientRect()
        const top = anchorRect.bottom - dialogRect.top + gap
        setPos({
          top,
          left: anchorRect.left - dialogRect.left,
          width: anchorRect.width,
          maxHeight: Math.max(160, dialogRect.height - top - bottomPad),
        })
      } else {
        const top = anchorRect.bottom + gap
        setPos({
          top,
          left: anchorRect.left,
          width: anchorRect.width,
          maxHeight: Math.max(160, window.innerHeight - top - bottomPad),
        })
      }
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef])

  return { pos, container }
}

function OverlayMenu({
  open,
  anchorRef,
  onClose,
  children,
  id,
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  children: React.ReactNode
  id?: string
}) {
  const { pos, container } = useMenuPosition(open, anchorRef)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open, onClose, anchorRef])

  if (!open || !pos || typeof document === 'undefined') return null

  const mountNode = container || document.body

  return createPortal(
    <div
      ref={menuRef}
      id={id}
      role="presentation"
      style={{
        position: container ? 'absolute' : 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
        zIndex: MENU_Z,
      }}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {children}
    </div>,
    mountNode
  )
}

interface LocationFilterFieldsProps {
  city?: string
  address?: string
  radiusKm?: number
  onCityChange: (city: string | undefined) => void
  onAddressChange: (address: string | undefined) => void
  onAddressResolved?: (resolved: PdokResolvedAddress) => void
  onRadiusChange: (radiusKm: number) => void
}

export function LocationFilterFields({
  city,
  address = '',
  radiusKm = 5,
  onCityChange,
  onAddressChange,
  onAddressResolved,
  onRadiusChange,
}: LocationFilterFieldsProps) {
  const listId = useId()
  const cityBtnRef = useRef<HTMLButtonElement>(null)
  const addressWrapRef = useRef<HTMLDivElement>(null)
  const skipSuggestRef = useRef(false)
  /** Only fetch/open suggestions after the user types — not when hydrating a saved address */
  const addressTypingRef = useRef(false)

  const [cityOpen, setCityOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const filteredCities = DUTCH_CITIES.filter((c) =>
    cityQuery.trim()
      ? c.toLowerCase().includes(cityQuery.trim().toLowerCase())
      : true
  )

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false
      return
    }
    // Pre-filled address on drawer open should not pop the suggestion menu
    if (!addressTypingRef.current) {
      setSuggestOpen(false)
      return
    }

    const q = address.trim()
    if (q.length < 3) {
      setSuggestions([])
      setSuggestOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/housing/address/suggest?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        )
        if (!res.ok) return
        const data = await res.json()
        const next = Array.isArray(data.suggestions) ? data.suggestions : []
        setSuggestions(next)
        setSuggestOpen(next.length > 0)
        setActiveIndex(-1)
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [address])

  const pickSuggestion = async (suggestion: Suggestion) => {
    skipSuggestRef.current = true
    addressTypingRef.current = false
    onAddressChange(suggestion.label)
    setSuggestOpen(false)
    setSuggestions([])
    setResolving(true)
    try {
      const res = await fetch(
        `/api/housing/address/lookup?id=${encodeURIComponent(suggestion.id)}`
      )
      if (!res.ok) return
      const data = await res.json()
      const resolved = data.address as PdokResolvedAddress | undefined
      if (!resolved) return
      if (resolved.city) onCityChange(resolved.city)
      onAddressResolved?.(resolved)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-sm text-ink-500">City</span>
        <button
          ref={cityBtnRef}
          type="button"
          className={cn(
            fieldClass,
            'flex items-center justify-between gap-2 text-left',
            cityOpen && 'border-indigo-300 ring-2 ring-indigo-500/20'
          )}
          aria-expanded={cityOpen}
          aria-haspopup="listbox"
          aria-controls={cityOpen ? `${listId}-cities` : undefined}
          onClick={() => {
            setCityOpen((o) => !o)
            setCityQuery('')
            setSuggestOpen(false)
          }}
        >
          <span className={cn('truncate', !city && 'text-ink-400')}>
            {city || 'Select a city'}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {city ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear city"
                className="inline-flex items-center justify-center rounded-full text-ink-400 hover:bg-zinc-200 hover:text-ink-700 dark:hover:bg-white/10"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCityChange(undefined)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onCityChange(undefined)
                  }
                }}
              >
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-ink-400 transition',
                cityOpen && 'rotate-180'
              )}
            />
          </span>
        </button>

        <OverlayMenu
          open={cityOpen}
          anchorRef={cityBtnRef}
          onClose={() => setCityOpen(false)}
          id={`${listId}-cities`}
        >
          <div className="shrink-0 border-b border-zinc-100 p-2 dark:border-zinc-800">
            <input
              autoFocus
              type="search"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Search cities"
              className={cn(fieldClass, 'h-9')}
            />
          </div>
          <ul
            role="listbox"
            aria-label="Cities"
            className="min-h-0 max-h-full flex-1 overflow-y-auto overscroll-contain p-1.5"
          >
            {filteredCities.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-ink-500">
                No cities found
              </li>
            ) : (
              filteredCities.map((option) => {
                const selected = option === city
                return (
                  <li key={option} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        onCityChange(option)
                        setCityOpen(false)
                        setCityQuery('')
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition',
                        selected
                          ? 'bg-zinc-100 font-medium text-ink-900 dark:bg-white/10 dark:text-white'
                          : 'text-ink-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5'
                      )}
                    >
                      {option}
                      {selected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      ) : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </OverlayMenu>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm text-ink-500">Address</span>
        <div ref={addressWrapRef} className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            role="combobox"
            aria-expanded={suggestOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Street, neighbourhood, or postcode"
            value={address}
            onChange={(e) => {
              addressTypingRef.current = true
              onAddressChange(e.target.value || undefined)
            }}
            onFocus={() => {
              setCityOpen(false)
              // Only reopen if the user was already mid-search this session
              if (addressTypingRef.current && suggestions.length) {
                setSuggestOpen(true)
              }
            }}
            onKeyDown={(e) => {
              if (!suggestOpen || !suggestions.length) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault()
                void pickSuggestion(suggestions[activeIndex])
              } else if (e.key === 'Escape') {
                setSuggestOpen(false)
              }
            }}
            className={cn(fieldClass, 'pl-10 pr-10')}
          />
          {(loading || resolving) && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
            </div>
          )}
        </div>

        <OverlayMenu
          open={suggestOpen && suggestions.length > 0}
          anchorRef={addressWrapRef}
          onClose={() => setSuggestOpen(false)}
          id={listId}
        >
            <ul
              role="listbox"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
            >
              {suggestions.map((s, i) => (
              <li key={s.id} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition',
                    i === activeIndex
                      ? 'bg-zinc-100 text-ink-900 dark:bg-white/10 dark:text-white'
                      : 'text-ink-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5'
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => void pickSuggestion(s)}
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <span className="min-w-0 leading-snug">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </OverlayMenu>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Radius</span>
          <span className="font-medium tabular-nums text-ink-900 dark:text-white">
            {radiusKm} km
          </span>
        </div>
        <Slider
          value={[radiusKm]}
          onValueChange={([value]) => onRadiusChange(value)}
          min={1}
          max={50}
          step={1}
        />
      </div>
    </div>
  )
}
