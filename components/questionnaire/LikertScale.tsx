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
    <fieldset>
      {label && <legend className="mb-2 font-medium">{label}</legend>}
      {helperText && (
        <p id={`${id}-help`} className="text-sm text-gray-600 mb-3">
          {helperText}
        </p>
      )}
      <div className="grid grid-cols-5 gap-2">
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
                'h-11 rounded-xl border text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                selected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
              )}
            >
              <span className="block leading-none">{v}</span>
              <span className={cn(
                "block text-[11px] mt-1",
                selected ? "text-white" : "text-gray-600"
              )}>{a}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}


