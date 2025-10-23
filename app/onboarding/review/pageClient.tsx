'use client'

import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
}

function humanize(item: Item, value: any): string {
  if (!value) return ''
  switch (item.kind) {
    case 'likert':
      const likertScale = item.scale as 'agreement' | 'frequency' | 'comfort'
      return scaleAnchors[likertScale][value.value - 1] || String(value.value)
    case 'bipolar':
      return `${value.value}/5 (${item.bipolarLabels?.left} ↔ ${item.bipolarLabels?.right})`
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
    const doc = new jsPDF()
    
    // Header with branding
    doc.setFillColor(99, 102, 241) // Indigo
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('Roommate Agreement', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Preview', 105, 30, { align: 'center' })
    
    let yPos = 50
    
    for (const [section, items] of Object.entries(grouped)) {
      // Section header
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text(section.replace(/-/g, ' ').toUpperCase(), 14, yPos)
      yPos += 10
      
      // Table data
      const tableData = items
        .map((it) => {
          const ans = sections[section as keyof typeof sections]?.[it.id]
          if (!ans) return null
          const text = humanize(it, ans.value)
          const db = ans.dealBreaker ? ' [DEAL BREAKER]' : ''
          return [it.label, text + db]
        })
        .filter(Boolean)
      
      if (tableData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Question', 'Answer']],
          body: tableData,
          headStyles: { fillColor: [99, 102, 241] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        })
        yPos = (doc as any).lastAutoTable.finalY + 15
      }
      
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
    }
    
    doc.save('roommate-agreement-preview.pdf')
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


