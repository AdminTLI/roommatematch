'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Shared visual system for Match Insights + Meet panels (flat, no nested cards). */

export const paneShellClass =
  'flex h-full min-h-0 min-w-0 w-full flex-1 flex-col bg-[hsl(var(--chat-bg-primary))] text-slate-900 dark:text-slate-100'

export const paneScrollClass =
  'scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-manipulation'

export const paneFlatContentClass =
  'mx-auto w-full max-w-lg space-y-10 px-5 pb-[max(8rem,calc(env(safe-area-inset-bottom,0px)+5rem))] pt-1'

export const paneSectionTitleClass =
  'text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100'

export const paneBodyClass = 'text-sm leading-relaxed text-slate-700 dark:text-slate-300'

export const paneMutedClass = 'text-sm text-slate-500 dark:text-slate-400'

export const paneCloseButtonClass =
  'hidden h-10 w-10 shrink-0 touch-manipulation rounded-full p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:inline-flex'

export const paneNudgeButtonClass =
  'rounded-full border-slate-200 text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'

export function MessengerPaneHeader({
  title,
  subtitle,
  trailing,
  onClose,
  closeLabel,
}: {
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClose?: () => void
  closeLabel: string
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {trailing}
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {onClose ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className={paneCloseButtonClass}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">{closeLabel}</span>
        </Button>
      ) : null}
    </div>
  )
}

export function MessengerPaneSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn('space-y-2.5', className)}>{children}</section>
}

export function MessengerPaneSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className={paneSectionTitleClass}>{children}</h3>
}

export function MessengerPaneFactRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  )
}

export function MessengerPaneInsightList({
  title,
  items,
  tone = 'strength',
}: {
  title: string
  items: string[]
  tone?: 'strength' | 'watch'
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className={paneSectionTitleClass}>{title}</h4>
      <ul className="space-y-3">
        {items.map((text, i) => (
          <li key={`${tone}-${i}`} className="grid grid-cols-[1rem_1fr] gap-x-2.5">
            <span
              className={cn(
                'pt-0.5 text-center text-sm leading-5',
                tone === 'strength'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-500 dark:text-amber-400',
              )}
              aria-hidden
            >
              {tone === 'strength' ? '✓' : '•'}
            </span>
            <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
