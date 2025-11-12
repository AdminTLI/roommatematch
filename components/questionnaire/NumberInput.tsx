'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  id: string
  label: string
  value?: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number | undefined) => void
}

export function NumberInput({ id, label, value, min, max, step = 1, onChange }: Props) {
  return (
    <div>
      <div>
        <Label htmlFor={id} className="sr-only">{label}</Label>
        <Input
          id={id}
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="h-12 sm:h-11 text-base sm:text-sm px-4 sm:px-3"
        />
      </div>
    </div>
  )
}


