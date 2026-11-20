'use client'

import { List, Map, LayoutGrid } from 'lucide-react'
import { ViewMode } from '@/types/housing'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  const views = [
    { value: 'list' as const, label: 'List', icon: List },
    { value: 'map' as const, label: 'Map', icon: Map },
    { value: 'split' as const, label: 'Split', icon: LayoutGrid },
  ]

  return (
    <div
      className={cn(
        'hidden h-11 items-center gap-0.5 rounded-2xl border border-zinc-200 bg-white p-1 sm:inline-flex dark:border-white/10 dark:bg-white/5',
        className
      )}
      role="group"
      aria-label="View mode"
    >
      {views.map((view) => {
        const Icon = view.icon
        const isActive = value === view.value
        return (
          <button
            key={view.value}
            type="button"
            title={view.label}
            aria-label={view.label}
            aria-pressed={isActive}
            onClick={() => {
              if (view.value !== value) onChange(view.value)
            }}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-xl transition',
              isActive
                ? 'bg-indigo-500 text-white'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        )
      })}
    </div>
  )
}
