'use client'

import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function humanize(item: Item, value: any): string {
  if (!value) return ''
  switch (item.kind) {
    case 'likert':
    case 'bipolar':
      return String(value.value)
    case 'mcq':
      return item.options?.find((o) => o.value === value.value)?.label || value.value
    case 'toggle':
      return value.value ? 'Yes' : 'No'
    case 'timeRange':
      return `${value.start} – ${value.end}`
    case 'number':
      return String(value.value)
  }
}

export default function ReviewClient() {
  const sections = useOnboardingStore((s) => s.sections)
  const allItems = itemsJson as Item[]
  const grouped = useMemo(() => {
    const bySection: Record<string, Item[]> = {}
    for (const it of allItems) {
      bySection[it.section] ??= []
      bySection[it.section].push(it)
    }
    return bySection
  }, [allItems])

  const downloadPreview = () => {
    const lines: string[] = ['Roommate Agreement Preview', '']
    for (const [section, items] of Object.entries(grouped)) {
      lines.push(`# ${section}`)
      for (const it of items) {
        const ans = sections[section as keyof typeof sections]?.[it.id]
        if (!ans) continue
        const text = humanize(it, ans.value)
        const db = ans.dealBreaker ? ' [DB]' : ''
        lines.push(`- ${it.label}: ${text}${db}`)
      }
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roommate-agreement-preview.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const submit = async () => {
    await fetch('/api/onboarding/submit', { method: 'POST' })
    window.location.href = '/onboarding/complete'
  }

  return (
    <QuestionnaireLayout
      stepIndex={10}
      totalSteps={11}
      title="Review your answers"
      subtitle="Read-only summary. Submit to finish."
      onPrev={() => (window.location.href = '/onboarding/reliability-logistics')}
      onNext={submit}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Preview your responses. Deal-breakers are marked.</div>
          <Button onClick={downloadPreview} variant="outline">Download Roommate Agreement Preview</Button>
        </div>
        {Object.entries(grouped).map(([section, items]) => (
          <details key={section} className="rounded-xl border p-4">
            <summary className="cursor-pointer font-medium capitalize">{section.replace(/-/g, ' ')}</summary>
            <div className="mt-3 space-y-2">
              {items.map((it) => {
                const ans = sections[section as keyof typeof sections]?.[it.id]
                if (!ans) return null
                return (
                  <div key={it.id} className="flex items-start justify-between gap-4">
                    <div className="text-sm">{it.label}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{humanize(it, ans.value)}</span>
                      {ans.dealBreaker && <Badge variant="destructive">DB</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        ))}
      </div>
    </QuestionnaireLayout>
  )
}


