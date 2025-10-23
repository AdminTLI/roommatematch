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
        />
      </div>
    </div>
  )
}


