import { NextRequest, NextResponse } from 'next/server'
import { openScopedAnalyticsSession } from '@/lib/admin/analytics-scope'
import v2ItemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'

const MODULE_LABELS: Record<string, string> = {
  'logistics-context':        'Logistics and Context',
  'environment-rhythms':      'Environment and Rhythms',
  'cleanliness-operations':   'Cleanliness and Operations',
  'communication-resolution': 'Communication and Resolution',
  'social-spaces':            'Social Life and Spaces',
}

// Build a lookup map: itemId -> Item metadata
const ITEM_MAP = new Map<string, Item>(
  (v2ItemsJson as Item[]).map((item) => [item.id, item]),
)

function getAnswerLabel(item: Item | undefined, answerKey: string): string {
  if (!item) return answerKey
  if (item.kind === 'mcq' && item.options) {
    return item.options.find((o) => o.value === answerKey)?.label ?? answerKey
  }
  if (item.kind === 'toggle') return answerKey === 'true' ? 'Yes' : 'No'
  if (item.kind === 'likert' || item.kind === 'bipolar') {
    const n = Number(answerKey)
    if (!isNaN(n)) return `${n}/5`
  }
  return answerKey
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await openScopedAnalyticsSession(request)
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }
    const { admin } = ctx

    const { searchParams } = new URL(request.url)
    const moduleFilter = searchParams.get('module') // e.g. 'cleanliness-operations'
    const format       = searchParams.get('format')  // 'csv' | null

    // Fetch raw counts
    let query = admin
      .from('answer_distribution_counts')
      .select('item_id, answer_key, count, updated_at')
      .order('item_id')
      .order('count', { ascending: false })

    if (moduleFilter) {
      // Filter to item_ids belonging to the requested module section
      const moduleItems = (v2ItemsJson as Item[])
        .filter((i) => i.section === moduleFilter)
        .map((i) => i.id)
      query = query.in('item_id', moduleItems)
    }

    const { data, error } = await query
    if (error) throw error

    // Enrich rows with metadata
    type EnrichedRow = {
      itemId: string
      questionLabel: string
      module: string
      answerKey: string
      answerLabel: string
      count: number
    }

    // Group by item_id first to compute percentages per question
    const byItem = new Map<string, typeof data>()
    for (const row of (data ?? [])) {
      if (!byItem.has(row.item_id)) byItem.set(row.item_id, [])
      byItem.get(row.item_id)!.push(row)
    }

    const result: {
      itemId: string
      questionLabel: string
      module: string
      answers: { key: string; label: string; count: number; pct: number }[]
    }[] = []

    byItem.forEach((rows, itemId) => {
      const item   = ITEM_MAP.get(itemId)
      const total  = rows.reduce((s, r) => s + Number(r.count), 0)
      result.push({
        itemId,
        questionLabel: item?.label ?? itemId,
        module: MODULE_LABELS[item?.section ?? ''] ?? (item?.section ?? ''),
        answers: rows.map((r) => ({
          key:   r.answer_key,
          label: getAnswerLabel(item, r.answer_key),
          count: Number(r.count),
          pct:   total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
        })),
      })
    })

    // CSV export
    if (format === 'csv') {
      const flatRows: EnrichedRow[] = []
      for (const entry of result) {
        for (const ans of entry.answers) {
          flatRows.push({
            itemId:        entry.itemId,
            questionLabel: entry.questionLabel,
            module:        entry.module,
            answerKey:     ans.key,
            answerLabel:   ans.label,
            count:         ans.count,
          })
        }
      }
      const header = 'item_id,question_label,module,answer_key,answer_label,count,pct_of_answers'
      const rows = flatRows.map((r) => {
        const pct = result.find((e) => e.itemId === r.itemId)
          ?.answers.find((a) => a.key === r.answerKey)?.pct ?? 0
        return [
          r.itemId,
          `"${r.questionLabel.replace(/"/g, '""')}"`,
          `"${r.module}"`,
          r.answerKey,
          `"${r.answerLabel.replace(/"/g, '""')}"`,
          r.count,
          pct,
        ].join(',')
      })
      const csv = [header, ...rows].join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="answer-distribution.csv"',
        },
      })
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('[answer-distribution]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
