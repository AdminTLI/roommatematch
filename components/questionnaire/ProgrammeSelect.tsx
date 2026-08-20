'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Programme, DegreeLevel } from '@/types/programme'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ProgrammeSelectProps {
  institutionId?: string
  level?: DegreeLevel
  value?: string
  onChange: (programmeId: string, programmeName?: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

/**
 * Searchable programme picker. Enabled only when institution + degree level are set.
 */
export function ProgrammeSelect({
  institutionId,
  level,
  value,
  onChange,
  disabled,
  placeholder = 'Search programme (e.g. International Business)…',
  className,
}: ProgrammeSelectProps) {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const isEnabled = Boolean(institutionId && level) && !disabled

  useEffect(() => {
    if (!isEnabled) {
      setProgrammes([])
      setError(null)
      return
    }

    const fetchProgrammes = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/programmes?inst=${institutionId}&level=${level}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch programmes: ${response.status}`)
        }

        const data = await response.json()
        const rawProgrammes = data.programmes || []
        setProgrammes(deduplicateProgrammes(rawProgrammes))
      } catch (err) {
        console.error('Error fetching programmes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programmes')
        setProgrammes([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchProgrammes, 100)
    return () => clearTimeout(timeoutId)
  }, [institutionId, level, isEnabled])

  const selected = programmes.find((p) => p.id === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return programmes
    const q = query.toLowerCase()
    return programmes.filter((p) => p.name.toLowerCase().includes(q))
  }, [programmes, query])

  const triggerLabel = !isEnabled
    ? 'Select university and degree level first'
    : loading
      ? 'Loading programmes…'
      : error
        ? 'Error loading programmes'
        : selected?.name || placeholder

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!isEnabled || loading || Boolean(error)) return
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={!isEnabled || loading || Boolean(error)}
          className={cn(
            'flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white pl-3.5 pr-3 text-left text-sm transition',
            'hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-80',
            selected ? 'font-medium text-[#0F172A]' : 'font-normal text-slate-500',
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 opacity-70" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] rounded-2xl border-0 bg-white p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/80"
      >
        <div className="mb-2.5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search…"
            className="h-10 rounded-xl border-0 bg-slate-50 px-3 text-sm shadow-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
            autoFocus
          />
        </div>
        <ul className="max-h-56 space-y-0.5 overflow-y-auto overscroll-contain">
          {filtered.length === 0 && (
            <li className="px-2 py-3 text-center text-xs text-slate-500">No programmes found</li>
          )}
          {filtered.map((programme) => {
            const active = programme.id === value
            return (
              <li key={getUniqueProgrammeKey(programme)}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(programme.id, programme.name)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition',
                    active
                      ? 'bg-indigo-50 font-medium text-[#4F46E5]'
                      : 'text-[#0F172A] hover:bg-slate-50'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{programme.name}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function deduplicateProgrammes(programmes: Programme[]): Programme[] {
  if (programmes.length === 0) return []

  const byRioCode = new Map<string, Programme>()

  for (const prog of programmes) {
    const rioCode = prog.externalRefs?.rioCode
    if (rioCode) {
      if (!byRioCode.has(rioCode)) {
        byRioCode.set(rioCode, prog)
      } else {
        const existing = byRioCode.get(rioCode)!
        if (prog.id && prog.id !== rioCode && (existing.id === rioCode || !existing.id)) {
          byRioCode.set(rioCode, prog)
        }
      }
    }
  }

  const uniqueProgrammes = new Map<string, Programme>()

  for (const prog of byRioCode.values()) {
    const key = prog.externalRefs?.rioCode || prog.id || `${prog.name}-${prog.level}`
    uniqueProgrammes.set(key, prog)
  }

  for (const prog of programmes) {
    const rioCode = prog.externalRefs?.rioCode
    if (rioCode && byRioCode.has(rioCode)) continue

    if (prog.id && !uniqueProgrammes.has(prog.id)) {
      uniqueProgrammes.set(prog.id, prog)
    } else if (!prog.id) {
      const fallbackKey = `${prog.name.toLowerCase().trim()}-${prog.level}`
      if (!uniqueProgrammes.has(fallbackKey)) {
        uniqueProgrammes.set(fallbackKey, prog)
      }
    }
  }

  const byNameAndLevel = new Map<string, Programme[]>()

  for (const prog of uniqueProgrammes.values()) {
    const nameKey = `${prog.name.toLowerCase().trim()}-${prog.level}`
    if (!byNameAndLevel.has(nameKey)) {
      byNameAndLevel.set(nameKey, [])
    }
    byNameAndLevel.get(nameKey)!.push(prog)
  }

  const final: Programme[] = []

  for (const [, progs] of byNameAndLevel.entries()) {
    if (progs.length === 1) {
      final.push(progs[0])
    } else {
      const best = progs.reduce((bestSoFar, current) => {
        const bestRio = bestSoFar.externalRefs?.rioCode
        const currentRio = current.externalRefs?.rioCode

        if (currentRio && !bestRio) return current
        if (bestRio && !currentRio) return bestSoFar

        const bestId = bestSoFar.id && bestSoFar.id !== bestRio ? bestSoFar.id : null
        const currentId = current.id && current.id !== currentRio ? current.id : null

        if (currentId && !bestId) return current
        if (bestId && !currentId) return bestSoFar

        return bestSoFar
      })

      final.push(best)
    }
  }

  return final.sort((a, b) => a.name.localeCompare(b.name))
}

function getUniqueProgrammeKey(programme: Programme): string {
  if (programme.externalRefs?.rioCode) return programme.externalRefs.rioCode
  if (programme.id) return programme.id
  return `${programme.name}-${programme.level}`
}
