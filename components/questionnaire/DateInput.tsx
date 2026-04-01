'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  id: string
  label: string
  value?: string
  min?: string
  onChange: (v: string) => void
}

export function DateInput({ id, label, value, min, onChange }: Props) {
  return (
    <div>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value ?? ''}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 sm:h-11 text-base sm:text-sm px-4 sm:px-3"
      />
    </div>
  )
}
