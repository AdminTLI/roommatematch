'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Tight icon trigger + keyboard-only ring (avoids sticky focus box on mobile after dismiss). */
export const scoreInfoIconTriggerBaseClass = cn(
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md p-0',
  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
)

/** Same hit target, but icon is left-aligned inside the box so it lines up with full-width progress bars. */
export const scoreInfoIconTriggerBarAlignClass = cn(
  scoreInfoIconTriggerBaseClass,
  'justify-start pl-0 pr-0.5',
)

/**
 * Narrower width than `size-8` so the label can sit closer to the glyph while keeping full bar alignment
 * (icon’s left edge still matches the bar). Use on tight cards e.g. harmony / context in a 2-col grid.
 */
export const scoreInfoIconTriggerBarAlignCompactClass = cn(
  'inline-flex h-8 w-6 shrink-0 items-center justify-start rounded-md p-0 pl-0 pr-0.5',
  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
)

interface ScoreInfoPopoverProps {
  title?: string
  description: string
  /** Optional custom trigger (must be a single element for asChild) */
  children?: React.ReactNode
  triggerClassName?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * Modal popover uses a dismiss layer so taps outside close reliably on touch devices.
   * Non-modal popovers often flash closed on mobile when the same gesture is treated as an outside click.
   */
  modal?: boolean
}

/**
 * Tap/click-friendly explanation for compatibility scores (tooltips do not work on touch).
 */
export function ScoreInfoPopover({
  title,
  description,
  children,
  triggerClassName,
  side = 'bottom',
  modal = true,
}: ScoreInfoPopoverProps) {
  return (
    <Popover modal={modal}>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            className={cn(
              scoreInfoIconTriggerBaseClass,
              'text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200',
              triggerClassName,
            )}
            aria-label={title || 'More information'}
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={8}
        align="center"
        className="z-[400] w-[min(100vw-2rem,18rem)] border-slate-700 bg-slate-900 p-3 text-slate-100 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {title ? <p className="mb-1.5 text-sm font-semibold text-white">{title}</p> : null}
        <p className="text-xs leading-relaxed text-slate-200">{description}</p>
      </PopoverContent>
    </Popover>
  )
}
