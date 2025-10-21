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

export function BipolarScale({ id, leftLabel, rightLabel, value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">{leftLabel} to {rightLabel}</legend>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <Label>{leftLabel}</Label>
        <Label>{rightLabel}</Label>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
            className={cn(
              'h-10 rounded-xl border text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              value === v ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">1 = strongly prefer left, 3 = no preference, 5 = strongly prefer right</p>
    </fieldset>
  )
}


