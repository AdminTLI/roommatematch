'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  id: string
  label: string
  start?: string
  end?: string
  onChange: (start: string, end: string) => void
}

const times = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

export function TimeRange({ id, label, start, end, onChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-2">
        <div>
          <Label htmlFor={`${id}-start`} className="text-base sm:text-sm mb-2 sm:mb-1 block">Start</Label>
          <Select value={start || ''} onValueChange={(v) => onChange(v, end || '')}>
            <SelectTrigger id={`${id}-start`} className="h-12 sm:h-11 text-base sm:text-sm">
              <SelectValue placeholder="HH:mm" />
            </SelectTrigger>
            <SelectContent>
              {times.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-end`} className="text-base sm:text-sm mb-2 sm:mb-1 block">End</Label>
          <Select value={end || ''} onValueChange={(v) => onChange(start || '', v)}>
            <SelectTrigger id={`${id}-end`} className="h-12 sm:h-11 text-base sm:text-sm">
              <SelectValue placeholder="HH:mm" />
            </SelectTrigger>
            <SelectContent>
              {times.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs sm:text-xs text-gray-500 mt-3 sm:mt-2">End should be after start.</p>
    </div>
  )
}


