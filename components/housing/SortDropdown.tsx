// Sort Dropdown Component
// Dropdown for sorting listings by various criteria

'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SortOption } from '@/types/housing'
import { getSortLabel, getSortOptions } from '@/lib/housing/sorting'

interface SortDropdownProps {
  value: SortOption
  onChange: (sort: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const options = getSortOptions()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
