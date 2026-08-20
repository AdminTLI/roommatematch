'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  label: string
  start?: string
  end?: string
  onChange: (start: string, end: string) => void
  startFrom?: string
  startTo?: string
  endFrom?: string
  endTo?: string
  overnight?: boolean
}

function parseMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function formatMinutes(total: number): string {
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/** Inclusive 30-minute steps. If `to` is earlier than or equal to `from` on the clock, the range wraps past midnight. */
export function timesInRange(from: string, to: string, stepMinutes = 30): string[] {
  const start = parseMinutes(from)
  const end = parseMinutes(to)
  const wraps = end <= start
  const endAbs = wraps ? end + 24 * 60 : end
  const times: string[] = []
  for (let m = start; m <= endAbs; m += stepMinutes) {
    times.push(formatMinutes(m))
  }
  return times
}

const ALL_TIMES = timesInRange('00:00', '23:30')

const triggerClass =
  'h-14 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-3 text-sm shadow-none focus:ring-2 focus:ring-[#4F46E5]/30 data-[placeholder]:text-slate-500 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-slate-500 [&_svg]:opacity-70'

const contentClass =
  'rounded-2xl border border-slate-200 bg-white text-[#0F172A] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)]'

export function TimeRange({
  id,
  label,
  start,
  end,
  onChange,
  startFrom,
  startTo,
  endFrom,
  endTo,
  overnight = false,
}: Props) {
  const startTimes = startFrom && startTo ? timesInRange(startFrom, startTo) : ALL_TIMES
  const endTimes = endFrom && endTo ? timesInRange(endFrom, endTo) : ALL_TIMES
  const hint = overnight
    ? start && end
      ? `Quiet hours run from ${start} tonight until ${end} the next morning.`
      : 'Quiet hours start tonight and end the next morning.'
    : 'End should be after start.'

  return (
    <div className="space-y-3">
      {label ? (
        <p className="text-base font-semibold leading-snug text-[#0F172A]">{label}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-start`} className="text-xs font-semibold text-[#334155]">
            {overnight ? 'Tonight' : 'Start'}
          </Label>
          <Select value={start || ''} onValueChange={(v) => onChange(v, end || '')}>
            <SelectTrigger
              id={`${id}-start`}
              className={cn(triggerClass, start ? 'font-medium text-[#0F172A]' : '')}
            >
              <SelectValue placeholder="HH:mm" />
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {startTimes.map((t) => (
                <SelectItem key={t} value={t} className="focus:bg-slate-50 focus:text-[#0F172A]">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-end`} className="text-xs font-semibold text-[#334155]">
            {overnight ? 'Next morning' : 'End'}
          </Label>
          <Select value={end || ''} onValueChange={(v) => onChange(start || '', v)}>
            <SelectTrigger
              id={`${id}-end`}
              className={cn(triggerClass, end ? 'font-medium text-[#0F172A]' : '')}
            >
              <SelectValue placeholder="HH:mm" />
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {endTimes.map((t) => (
                <SelectItem key={t} value={t} className="focus:bg-slate-50 focus:text-[#0F172A]">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{hint}</p>
    </div>
  )
}
