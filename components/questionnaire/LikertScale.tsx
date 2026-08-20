'use client'

import { cn } from '@/lib/utils'
import { choiceButtonClass } from '@/components/questionnaire/ToggleYesNo'

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
  comfort: [
    'Very uncomfortable',
    'Uncomfortable',
    'Neutral',
    'Comfortable',
    'Very comfortable',
  ],
}

export function LikertScale({ id, label, helperText, scaleType, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5" role="group" aria-label={label || id}>
      {helperText && (
        <p id={`${id}-help`} className="text-sm text-slate-600 dark:text-slate-300">
          {helperText}
        </p>
      )}
      {anchors[scaleType].map((a, idx) => {
        const v = (idx + 1) as 1 | 2 | 3 | 4 | 5
        const selected = value === v
        return (
          <button
            key={v}
            type="button"
            aria-describedby={helperText ? `${id}-help` : undefined}
            aria-pressed={selected}
            onClick={() => onChange(v)}
            className={choiceButtonClass(selected)}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                selected
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              )}
            >
              {v}
            </span>
            <span className="leading-snug">{a}</span>
          </button>
        )
      })}
    </div>
  )
}
