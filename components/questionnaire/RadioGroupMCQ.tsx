'use client'

import { cn } from '@/lib/utils'
import { choiceButtonClass } from '@/components/questionnaire/ToggleYesNo'

interface Option {
  value: string
  label: string
}

interface Props {
  id: string
  label: string
  helperText?: string
  options: Option[]
  value?: string
  onChange: (v: string) => void
}

export function RadioGroupMCQ({ id, label, helperText, options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={label || id}>
      {helperText && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{helperText}</p>
      )}
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(choiceButtonClass(selected), 'h-auto min-h-[54px] py-3.5')}
          >
            <span className="leading-snug">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
