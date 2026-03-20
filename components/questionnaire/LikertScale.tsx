'use client'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

type ScaleType = 'agreement' | 'frequency' | 'comfort'

interface Props {
  id: string
  label: string
  helperText?: string
  scaleType: ScaleType
  value?: 1 | 2 | 3 | 4 | 5
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void
}

const anchors: Record<ScaleType, [string, string, string, string, string]> = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
}

const valueAccent = (v: 1 | 2 | 3 | 4 | 5) => {
  switch (v) {
    case 1:
      return { text: 'text-rose-500', bg: 'bg-rose-500/15' }
    case 2:
      return { text: 'text-orange-500/95', bg: 'bg-orange-500/15' }
    case 3:
      return { text: 'text-amber-400/90', bg: 'bg-amber-400/15' }
    case 4:
      return { text: 'text-emerald-400/95', bg: 'bg-emerald-400/15' }
    case 5:
      return { text: 'text-emerald-500', bg: 'bg-emerald-500/15' }
    default:
      return { text: 'text-text-primary', bg: 'bg-bg-surface-alt/60' }
  }
}

export function LikertScale({ id, label, helperText, scaleType, value, onChange }: Props) {
  return (
    <div>
      {helperText && (
        <p id={`${id}-help`} className="text-sm sm:text-sm text-text-secondary mb-3 sm:mb-2">
          {helperText}
        </p>
      )}
      {/* Mobile layout: vertical list with full-width buttons */}
      <div className="sm:hidden space-y-2">
        {anchors[scaleType].map((a, idx) => {
          const v = (idx + 1) as 1 | 2 | 3 | 4 | 5
          const accent = valueAccent(v)
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              aria-describedby={helperText ? `${id}-help` : undefined}
              aria-pressed={selected}
              onClick={() => onChange(v)}
              className={cn(
                'w-full h-14 rounded-xl border text-left focus:outline-none focus:ring-0 flex items-center gap-3 px-4 transition-colors',
                selected 
                  ? `${accent.bg} border-border-subtle/70`
                  : 'bg-bg-surface-alt/40 hover:bg-bg-surface-alt/60 border-border-subtle/70 text-text-primary'
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold",
                selected ? `bg-white/5 ${accent.text}` : `bg-bg-surface-alt/60 ${accent.text}`
              )}>
                {v}
              </span>
              <span className={cn("text-base font-medium flex-1 break-words", accent.text)}>{a}</span>
            </button>
          )
        })}
      </div>
      {/* Desktop layout: buttons with labels inside */}
      <div className="hidden sm:grid sm:grid-cols-5 sm:gap-2">
        {anchors[scaleType].map((a, idx) => {
          const v = (idx + 1) as 1 | 2 | 3 | 4 | 5
          const accent = valueAccent(v)
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              aria-describedby={helperText ? `${id}-help` : undefined}
              aria-pressed={selected}
              onClick={() => onChange(v)}
              className={cn(
                'h-12 rounded-xl border text-sm px-2 focus:outline-none focus:ring-0 flex flex-col items-center justify-center min-w-0',
                selected
                  ? `${accent.bg} border-border-subtle/70`
                  : 'bg-bg-surface-alt/35 hover:bg-bg-surface-alt/60 border-border-subtle/70 text-text-primary'
              )}
            >
              <span className={cn("block leading-tight font-semibold", accent.text)}>{v}</span>
              <span className={cn(
                "block text-[11px] mt-0.5 leading-tight text-center break-words",
                accent.text
              )}>{a}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


