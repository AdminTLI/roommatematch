'use client'

import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type GroupedOption = { group: 'WO' | 'WO (special)' | 'HBO'; options: { value: string; label: string }[] }

interface Props {
  placeholder?: string
  groups: GroupedOption[]
  value?: string
  onChange: (value: string) => void
  allowOther?: boolean
  otherLabel?: string
  onOtherChange?: (text: string) => void
}

const mboRegex = /(\bROC\b|MBO College|\bmbo\b)/i

export function GroupedSearchSelect({ placeholder, groups, value, onChange, allowOther, otherLabel = 'Other', onOtherChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [other, setOther] = useState('')
  const [mboHint, setMboHint] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query) return groups
    const q = query.toLowerCase()
    return groups
      .map((g) => ({
        group: g.group,
        options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0)
  }, [groups, query])

  const handleOtherInput = (text: string) => {
    setOther(text)
    if (mboRegex.test(text)) {
      setMboHint('MBO is not part of Domu Match; select an HBO or WO.')
    } else {
      setMboHint(null)
    }
    onOtherChange?.(text)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value === 'other' ? 
            (other || 'Other (HBO/WO, not listed)') :
            value ?
              groups.flatMap((g) => g.options).find((o) => o.value === value)?.label || value :
              (placeholder || 'Select')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-3">
        <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-3" />
        <div className="max-h-64 overflow-auto space-y-3">
          {filtered.map((g) => (
            <div key={g.group}>
              <div className="text-xs font-medium text-gray-500 mb-1">{g.group}</div>
              <ul className="space-y-1">
                {g.options.map((o) => (
                  <li key={o.value}>
                    <button
                      className="w-full text-left px-2 py-1 rounded hover:bg-gray-50"
                      onClick={() => {
                        onChange(o.value)
                        setOpen(false)
                      }}
                    >
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {allowOther && (
            <div className="mt-2 border-t pt-2">
              <div className="text-xs font-medium text-gray-500 mb-1">{otherLabel}</div>
              <Input value={other} onChange={(e) => handleOtherInput(e.target.value)} placeholder="Type institution name" />
              {mboHint && <div className="text-xs text-rose-600 mt-1">{mboHint}</div>}
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => {
                  onChange('other')
                  setOpen(false)
                }} disabled={!other || !!mboHint}>Use this</Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}


