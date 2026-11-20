'use client'

import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FilterPillProps {
  label: string
  summary?: string
  active?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
}

export function FilterPill({
  label,
  summary,
  active = false,
  open,
  onOpenChange,
  children,
  className,
  contentClassName,
  align = 'start',
}: FilterPillProps) {
  const display = summary || label

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition',
            active
              ? 'border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900'
              : 'border-zinc-200 bg-white text-ink-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10',
            open &&
              !active &&
              'border-zinc-300 bg-zinc-50 dark:border-white/20 dark:bg-white/10',
            className
          )}
        >
          <span className="max-w-[10rem] truncate font-medium">{display}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 opacity-60 transition',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={8}
        className={cn(
          'w-80 rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-900',
          contentClassName
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface FilterPopoverFooterProps {
  onClear?: () => void
  onApply?: () => void
  clearLabel?: string
  applyLabel?: string
  canClear?: boolean
}

export function FilterPopoverFooter({
  onClear,
  onApply,
  clearLabel = 'Clear',
  applyLabel = 'Apply',
  canClear = true,
}: FilterPopoverFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <button
        type="button"
        onClick={onClear}
        disabled={!canClear}
        className="text-sm font-medium text-ink-500 underline-offset-2 transition hover:text-ink-900 hover:underline disabled:pointer-events-none disabled:opacity-40 dark:hover:text-white"
      >
        {clearLabel}
      </button>
      {onApply ? (
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-9 items-center rounded-full bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          {applyLabel}
        </button>
      ) : null}
    </div>
  )
}

interface OptionChipProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function OptionChip({
  selected,
  onClick,
  children,
  className,
}: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition',
        selected
          ? 'border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900'
          : 'border-zinc-200 bg-white text-ink-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:border-zinc-500',
        className
      )}
    >
      {children}
    </button>
  )
}
