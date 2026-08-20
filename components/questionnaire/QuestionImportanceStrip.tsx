'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Telescope } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Research-only importance tick  -  visually distinct from deal-breaker and sensitive badges. */
export function QuestionImportanceStrip(props: {
  id: string
  checked: boolean
  hasAnswer?: boolean
  disabled?: boolean
  onCheckedChange: (v: boolean) => void
}) {
  const { id, checked, hasAnswer = true, disabled, onCheckedChange } = props
  const inputId = `q-importance-${id}`
  const isBlocked = !hasAnswer
  const [showHint, setShowHint] = useState(false)

  const handleAttempt = () => {
    if (isBlocked) {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 2500)
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border px-3 py-3 sm:px-4 sm:py-3',
          'border-sky-500/20 bg-[linear-gradient(105deg,rgba(14,165,233,0.07)_0%,transparent_52%)]',
          isBlocked && 'opacity-50',
          disabled && 'opacity-60'
        )}
        onClick={handleAttempt}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-400 via-cyan-500 to-teal-500 opacity-70"
          aria-hidden
        />
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-center gap-3 pl-2',
            isBlocked ? 'cursor-not-allowed' : 'cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10">
            <Telescope className="h-4 w-4 text-sky-700 dark:text-sky-300" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
            This topic matters more to me
          </span>
          <Checkbox
            id={inputId}
            checked={checked}
            disabled={disabled || isBlocked}
            onCheckedChange={(v) => onCheckedChange(v === true)}
            onClick={(e) => e.stopPropagation()}
            aria-label="This topic matters more to me"
            className="shrink-0 border-sky-500/45 data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400"
          />
        </label>
      </div>
      {showHint && (
        <p className="pl-2 text-xs text-text-secondary">
          Select an answer first before marking this topic.
        </p>
      )}
    </div>
  )
}
