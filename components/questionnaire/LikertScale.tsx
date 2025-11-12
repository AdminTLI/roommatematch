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

export function LikertScale({ id, label, helperText, scaleType, value, onChange }: Props) {
  return (
    <div>
      {helperText && (
        <p id={`${id}-help`} className="text-sm sm:text-sm text-gray-600 mb-3 sm:mb-2">
          {helperText}
        </p>
      )}
      <div className="grid grid-cols-5 gap-3 sm:gap-2">
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
              className={cn(
                'h-14 sm:h-12 rounded-xl border text-base sm:text-sm px-3 sm:px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center min-w-0',
                selected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
              )}
            >
              <span className="block leading-tight font-semibold">{v}</span>
              <span className={cn(
                "block text-xs sm:text-[11px] mt-1 sm:mt-0.5 leading-tight text-center break-words",
                selected ? "text-white" : "text-gray-600"
              )}>{a}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


