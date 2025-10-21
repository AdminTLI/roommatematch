'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'

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
    <fieldset>
      <legend className="mb-2 font-medium">{label}</legend>
      {helperText && <p className="text-sm text-gray-600 mb-3">{helperText}</p>}
      <RadioGroup value={value} onValueChange={onChange} aria-labelledby={`${id}-legend`}>
        <div className="grid gap-2">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-3">
              <RadioGroupItem id={`${id}-${opt.value}`} value={opt.value} />
              <Label htmlFor={`${id}-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </fieldset>
  )
}


