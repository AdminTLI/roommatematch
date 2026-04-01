'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Option { value: string; label: string }

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
    <div>
      {helperText && <p className="text-base sm:text-sm text-text-secondary mb-3 sm:mb-2">{helperText}</p>}
      <RadioGroup value={value} onValueChange={onChange} aria-labelledby={`${id}-legend`}>
        <div className="grid gap-3 sm:gap-2">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-start gap-3 sm:gap-2">
              <RadioGroupItem id={`${id}-${opt.value}`} value={opt.value} className="mt-0.5 shrink-0" />
              <Label htmlFor={`${id}-${opt.value}`} className="min-w-0 flex-1 text-base sm:text-sm break-words cursor-pointer text-text-primary leading-snug">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}


