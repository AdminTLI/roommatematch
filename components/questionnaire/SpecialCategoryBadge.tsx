'use client'

import { useId, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CircleAlert } from 'lucide-react'

export function SpecialCategoryBadge() {
  const [open, setOpen] = useState(false)
  const popoverId = useId()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          role="button"
          tabIndex={0}
          aria-label="What this special category icon means"
          aria-haspopup="dialog"
          aria-controls={popoverId}
          className="cursor-help border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <CircleAlert className="mr-1 h-3.5 w-3.5" />
          Sensitive
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        id={popoverId}
        className="max-w-xs text-xs"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <div className="font-semibold text-text-primary">Special category data</div>
          <p className="text-text-secondary">
            This question covers personal information that can be sensitive for some people.
          </p>
          <p className="text-text-secondary/90">
            We use these answers only to improve roommate compatibility and matching quality.
            They are not used for advertising and are not shown publicly.
          </p>
          <p className="text-text-secondary/90">
            You stay in control and can update your answers later.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
