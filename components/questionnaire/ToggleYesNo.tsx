'use client'

import { Switch } from '@radix-ui/react-switch'
import { Label } from '@/components/ui/label'

interface Props {
  id: string
  label: string
  helperText?: string
  checked?: boolean
  onChange: (v: boolean) => void
}

export function ToggleYesNo({ id, label, helperText, checked, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">{label}</legend>
      {helperText && <p className="text-sm text-gray-600 mb-3">{helperText}</p>}
      <div className="flex items-center gap-3">
        <Switch id={id} checked={!!checked} onCheckedChange={onChange} />
        <Label htmlFor={id}>{checked ? 'Yes' : 'No'}</Label>
      </div>
    </fieldset>
  )
}


