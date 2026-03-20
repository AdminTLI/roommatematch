'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  leftLabel: string
  rightLabel: string
  value?: 1 | 2 | 3 | 4 | 5
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void
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

export function BipolarScale({ id, leftLabel, rightLabel, value, onChange }: Props) {
  // Generate descriptive labels for each option
  const getOptionLabel = (v: number): string => {
    switch (v) {
      case 1:
        return `Strongly prefer ${leftLabel}`
      case 2:
        return `Prefer ${leftLabel}`
      case 3:
        return 'No preference'
      case 4:
        return `Prefer ${rightLabel}`
      case 5:
        return `Strongly prefer ${rightLabel}`
      default:
        return String(v)
    }
  }

  return (
    <div>
      {/* Mobile layout: vertical list with full-width buttons */}
      <div className="sm:hidden space-y-2">
        {[1, 2, 3, 4, 5].map((v) => {
          const accent = valueAccent(v as 1 | 2 | 3 | 4 | 5)
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
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
              <span className={cn("text-base font-medium flex-1 break-words", accent.text)}>{getOptionLabel(v)}</span>
            </button>
          )
        })}
      </div>
      {/* Desktop layout: horizontal grid with labels on sides */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2 gap-2">
          <Label className={cn("break-words flex-1 text-left", valueAccent(1).text)}>{leftLabel}</Label>
          <Label className={cn("break-words flex-1 text-right", valueAccent(5).text)}>{rightLabel}</Label>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={value === v}
              onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
              className={cn(
                'h-10 rounded-xl border text-sm px-2 focus:outline-none focus:ring-0 font-semibold',
                value === v
                  ? `${valueAccent(v as 1 | 2 | 3 | 4 | 5).bg} border-border-subtle/70`
                  : 'bg-bg-surface-alt/35 hover:bg-bg-surface-alt/60 border-border-subtle/70'
              )}
            >
              <span className={valueAccent(v as 1 | 2 | 3 | 4 | 5).text}>{v}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2 text-center">
          <span className={valueAccent(1).text}>1</span> = strongly prefer <span className={valueAccent(1).text}>left</span>,{' '}
          <span className={valueAccent(3).text}>3</span> = no preference,{' '}
          <span className={valueAccent(5).text}>5</span> = strongly prefer <span className={valueAccent(5).text}>right</span>
        </p>
      </div>
    </div>
  )
}


