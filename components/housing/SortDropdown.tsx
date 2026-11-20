'use client'

import { useState } from 'react'
import type { SortOption } from '@/types/housing'
import { getSortOptions } from '@/lib/housing/sorting'
import { ArrowUpDown, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SortDropdownProps {
  value: SortOption
  onChange: (sort: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const options = getSortOptions()
  const current = value || 'best'
  const currentLabel =
    options.find((option) => option.value === current)?.label || 'Best match'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Sort listings"
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-ink-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10',
            open && 'border-zinc-300 bg-zinc-50 dark:border-white/20 dark:bg-white/10'
          )}
        >
          <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
          <span className="hidden sm:inline">{currentLabel}</span>
          <span className="sm:hidden">Sort</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-0.5" role="listbox" aria-label="Sort options">
          {options.map((option) => {
            const selected = option.value === current
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                  selected
                    ? 'bg-zinc-100 font-medium text-ink-900 dark:bg-white/10 dark:text-white'
                    : 'text-ink-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5'
                )}
              >
                <span>{option.label}</span>
                {selected ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                ) : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
