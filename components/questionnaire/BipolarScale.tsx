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
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
              className={cn(
                'w-full h-14 rounded-xl border-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-3 px-4 transition-colors',
                selected 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900'
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold",
                selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              )}>
                {v}
              </span>
              <span className="text-base font-medium flex-1 break-words">{getOptionLabel(v)}</span>
            </button>
          )
        })}
      </div>
      {/* Desktop layout: horizontal grid with labels on sides */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2 gap-2">
          <Label className="break-words flex-1 text-left">{leftLabel}</Label>
          <Label className="break-words flex-1 text-right">{rightLabel}</Label>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={value === v}
              onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)}
              className={cn(
                'h-10 rounded-xl border text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold',
                value === v ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">1 = strongly prefer left, 3 = no preference, 5 = strongly prefer right</p>
      </div>
    </div>
  )
}


