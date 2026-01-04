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
      {/* Mobile layout: vertical list with full-width buttons */}
      <div className="sm:hidden space-y-2">
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
              <span className="text-base font-medium flex-1 break-words">{a}</span>
            </button>
          )
        })}
      </div>
      {/* Desktop layout: buttons with labels inside */}
      <div className="hidden sm:grid sm:grid-cols-5 sm:gap-2">
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
                'h-12 rounded-xl border text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center min-w-0',
                selected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
              )}
            >
              <span className="block leading-tight font-semibold">{v}</span>
              <span className={cn(
                "block text-[11px] mt-0.5 leading-tight text-center break-words",
                selected ? "text-white" : "text-gray-600"
              )}>{a}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


