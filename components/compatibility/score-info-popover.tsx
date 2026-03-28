'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ScoreInfoPopoverProps {
  title?: string
  description: string
  /** Optional custom trigger (must be a single element for asChild) */
  children?: React.ReactNode
  triggerClassName?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Tap/click-friendly explanation for compatibility scores (tooltips do not work on touch).
 */
export function ScoreInfoPopover({
  title,
  description,
  children,
  triggerClassName,
  side = 'top',
}: ScoreInfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            className={cn(
              'flex-shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
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
        align="start"
        className="z-[400] w-[min(100vw-2rem,18rem)] border-slate-700 bg-slate-900 p-3 text-slate-100 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {title ? <p className="mb-1.5 text-sm font-semibold text-white">{title}</p> : null}
        <p className="text-xs leading-relaxed text-slate-200">{description}</p>
      </PopoverContent>
    </Popover>
  )
}
