'use client'

import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEffect, useId, useRef, useState } from 'react'

interface Props {
  isDealBreaker?: boolean
  onChange: (v: boolean) => void
}

export function DealBreakerToggle({ isDealBreaker, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [suppressBadgeHover, setSuppressBadgeHover] = useState(false)
  const popoverId = useId()
  const suppressTimerRef = useRef<number | null>(null)

  const handleSwitchChange = (next: boolean) => {
    // Close any DB popover so focus/scroll doesn't snap back to this control.
    setPinned(false)
    setOpen(false)

    // If the cursor is still near the badge, hover/focus handlers can immediately re-open the popover
    // after toggling. Suppress that briefly so the user can scroll naturally.
    setSuppressBadgeHover(true)
    if (suppressTimerRef.current) window.clearTimeout(suppressTimerRef.current)
    suppressTimerRef.current = window.setTimeout(() => {
      setSuppressBadgeHover(false)
    }, 250)

    onChange(next)
  }

  useEffect(() => {
    return () => {
      if (suppressTimerRef.current) window.clearTimeout(suppressTimerRef.current)
    }
  }, [])

  const setPopover = (next: boolean) => {
    setOpen(next)
    if (!next) setPinned(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setPopover}>
        <PopoverTrigger asChild>
          <Badge
            variant="secondary"
            role="button"
            tabIndex={0}
            aria-label="What does DB mean?"
            aria-haspopup="dialog"
            aria-controls={popoverId}
            className={[
              'cursor-pointer',
              'flex items-center justify-center',
              'leading-none',
              // Keep "off" very light and "on" meaningfully darker for quick visual distinction.
              isDealBreaker
                ? 'bg-rose-300 text-rose-900 border-rose-400 hover:bg-rose-400'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
            ].join(' ')}
            onMouseEnter={() => {
              if (!pinned && !suppressBadgeHover) setOpen(true)
            }}
            onMouseLeave={() => {
              if (!pinned) setOpen(false)
            }}
            onFocus={() => {
              if (!pinned && !suppressBadgeHover) setOpen(true)
            }}
            onBlur={() => {
              if (!pinned) setOpen(false)
            }}
            onClick={(e) => {
              // Pin the popover open on click (so it doesn't immediately disappear on mouse-out).
              e.preventDefault()
              e.stopPropagation()
              const nextPinned = !pinned
              setPinned(nextPinned)
              setOpen(nextPinned)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setPinned(true)
                setOpen(true)
              }
              if (e.key === 'Escape') {
                setPopover(false)
              }
            }}
          >
            DB
          </Badge>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          id={popoverId}
          className="max-w-xs text-xs"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <div className="font-semibold text-text-primary">Deal-breakers (DB)</div>
            <p className="text-text-secondary">
              When something is a deal-breaker, we only match you with people who meet it.
              This helps keep matches aligned with your non-negotiables, but it may reduce your match
              options.
            </p>
            <p className="text-text-secondary/90">
              If this isn’t a big deal for you, feel free to leave DB off - it can help you match with
              more people.
            </p>
            <p className="text-text-secondary/90">
              You can change your answers later - your matches will update accordingly.
            </p>
          </div>
        </PopoverContent>
      </Popover>
      <Switch
        checked={!!isDealBreaker}
        onCheckedChange={handleSwitchChange}
        aria-label="Deal-breaker"
      />
      <span className="text-sm text-text-secondary sm:hidden">Deal-breaker</span>
    </div>
  )
}


