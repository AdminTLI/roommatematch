'use client'

import { cn } from '@/lib/utils'
import { choiceButtonClass } from '@/components/questionnaire/ToggleYesNo'

interface Props {
  id: string
  leftLabel: string
  rightLabel: string
  softLeftLabel?: string
  softRightLabel?: string
  value?: 1 | 2 | 3 | 4 | 5
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void
}

function optionLabels(
  left: string,
  right: string,
  softLeft?: string,
  softRight?: string
): Record<number, string> {
  return {
    1: left,
    2: softLeft ?? `Somewhat toward: ${left}`,
    3: 'Neutral',
    4: softRight ?? `Somewhat toward: ${right}`,
    5: right,
  }
}

export function BipolarScale({
  id,
  leftLabel,
  rightLabel,
  softLeftLabel,
  softRightLabel,
  value,
  onChange,
}: Props) {
  const labels = optionLabels(leftLabel, rightLabel, softLeftLabel, softRightLabel)

  return (
    <div className="flex flex-col gap-2.5" role="group" aria-label={id}>
      {([1, 2, 3, 4, 5] as const).map((v) => {
        const selected = value === v
        return (
          <button
            key={v}
            type="button"
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
            <span className="leading-snug">{labels[v]}</span>
          </button>
        )
      })}
    </div>
  )
}
