'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PdokResolvedAddress } from '@/lib/host/pdok-address'

type Suggestion = { id: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  onResolved: (address: PdokResolvedAddress) => void
  inputClassName?: string
  placeholder?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onResolved,
  inputClassName,
  placeholder = 'Start typing a Dutch street address…',
}: Props) {
  const listId = useId()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [resolving, setResolving] = useState(false)
  const skipSuggestRef = useRef(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false
      return
    }
    const q = value.trim()
    if (q.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/host/address/suggest?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        const next = Array.isArray(data.suggestions) ? data.suggestions : []
        setSuggestions(next)
        setOpen(next.length > 0)
        setActiveIndex(-1)
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          setSuggestions([])
        }
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = async (suggestion: Suggestion) => {
    skipSuggestRef.current = true
    onChange(suggestion.label)
    setOpen(false)
    setSuggestions([])
    setResolving(true)
    try {
      const res = await fetch(`/api/host/address/lookup?id=${encodeURIComponent(suggestion.id)}`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.address) onResolved(data.address as PdokResolvedAddress)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative w-full">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length) setOpen(true)
          }}
          onKeyDown={(e) => {
            if (!open || !suggestions.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault()
              void pick(suggestions[activeIndex])
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={placeholder}
          className={cn(inputClassName, 'pl-10 pr-10')}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center">
          <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
        </div>
        {(loading || resolving) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl bg-white p-1 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition',
                  i === activeIndex
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50'
                )}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => void pick(s)}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="min-w-0 leading-snug">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        Suggestions from the Dutch BAG address register. Pick one to fill city and postcode.
      </p>
    </div>
  )
}
