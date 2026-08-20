'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type GroupedOption = {
  group: 'WO' | 'WO (special)' | 'HBO'
  options: { value: string; label: string }[]
}

interface Props {
  placeholder?: string
  groups: GroupedOption[]
  value?: string
  onChange: (value: string) => void
  allowOther?: boolean
  otherLabel?: string
  onOtherChange?: (text: string) => void
  className?: string
}

const mboRegex = /(\bROC\b|MBO College|\bmbo\b)/i

function formatGroupLabel(group: GroupedOption['group']) {
  switch (group) {
    case 'WO':
      return 'WO: Research University'
    case 'WO (special)':
      return 'WO (special): Research University'
    case 'HBO':
      return 'HBO: University of Applied Sciences'
    default:
      return group
  }
}

export function GroupedSearchSelect({
  placeholder,
  groups,
  value,
  onChange,
  allowOther,
  otherLabel = 'Other',
  onOtherChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [other, setOther] = useState('')
  const [mboHint, setMboHint] = useState<string | null>(null)

  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups])
  const selectedLabel = allOptions.find((o) => o.value === value)?.label

  const filtered = useMemo(() => {
    if (!query) return groups
    const q = query.toLowerCase()
    return groups
      .map((g) => ({
        group: g.group,
        options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0)
  }, [groups, query])

  const handleOtherInput = (text: string) => {
    setOther(text)
    if (mboRegex.test(text)) {
      setMboHint('MBO is not part of Domu Match; select an HBO or WO.')
    } else {
      setMboHint(null)
    }
    onOtherChange?.(text)
  }

  const triggerText =
    value === 'other'
      ? other || 'Other (HBO/WO, not listed)'
      : selectedLabel || value || placeholder || 'Select'

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white pl-3.5 pr-3 text-left text-sm transition',
            'hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30',
            'dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:focus-visible:ring-indigo-400/30',
            value
              ? 'font-medium text-[#0F172A] dark:text-slate-50'
              : 'font-normal text-slate-500 dark:text-slate-400',
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{triggerText}</span>
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 opacity-70 dark:text-slate-400" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] rounded-2xl border-0 bg-white p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/80 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700"
      >
        <div className="mb-2.5">
          <Input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 rounded-xl border-0 bg-slate-50 px-3 text-sm shadow-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/40"
            autoFocus
          />
        </div>
        <div className="max-h-64 space-y-3 overflow-y-auto overscroll-contain">
          {filtered.map((g) => (
            <div key={g.group}>
              <div className="mb-1 px-1 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                {formatGroupLabel(g.group)}
              </div>
              <ul className="space-y-0.5">
                {g.options.map((o) => {
                  const active = o.value === value
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition',
                          active
                            ? 'bg-indigo-50 font-medium text-[#4F46E5] dark:bg-indigo-500/15 dark:text-indigo-300'
                            : 'text-[#0F172A] hover:bg-slate-50 dark:text-slate-50 dark:hover:bg-slate-700'
                        )}
                        onClick={() => {
                          onChange(o.value)
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate">{o.label}</span>
                        {active && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {allowOther && (
            <div className="border-t border-slate-100 pt-2.5 dark:border-slate-700">
              <div className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                {otherLabel}
              </div>
              <Input
                value={other}
                onChange={(e) => handleOtherInput(e.target.value)}
                placeholder="Type institution name"
                className="h-10 rounded-xl border-0 bg-slate-50 px-3 text-sm shadow-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/40"
              />
              {mboHint && <p className="mt-1.5 px-1 text-xs text-rose-600 dark:text-rose-400">{mboHint}</p>}
              <button
                type="button"
                disabled={!other || !!mboHint}
                onClick={() => {
                  onChange('other')
                  setOpen(false)
                }}
                className="mt-2 w-full rounded-xl bg-[#4F46E5] px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Use this
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
