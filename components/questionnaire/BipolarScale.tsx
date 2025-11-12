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
    <div>
      <div className="flex items-center justify-between text-base sm:text-sm text-gray-600 mb-3 sm:mb-2 gap-2">
        <Label className="break-words flex-1 text-left">{leftLabel}</Label>
        <Label className="break-words flex-1 text-right">{rightLabel}</Label>
      </div>
      <div className="grid grid-cols-5 gap-3 sm:gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
            className={cn(
              'h-12 sm:h-10 rounded-xl border text-base sm:text-sm px-3 sm:px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold',
              value === v ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="text-xs sm:text-xs text-gray-500 mt-3 sm:mt-2 text-center">1 = strongly prefer left, 3 = no preference, 5 = strongly prefer right</p>
    </div>
  )
}


