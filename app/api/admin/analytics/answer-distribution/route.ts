import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import v2ItemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'

const MODULE_LABELS: Record<string, string> = {
  'logistics-context': 'Logistics and Context',
  'environment-rhythms': 'Environment and Rhythms',
  'cleanliness-operations': 'Cleanliness and Operations',
  'communication-resolution': 'Communication and Resolution',
  'social-spaces': 'Social Life and Spaces',
}

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

/** Expected answer keys for a question (so empty buckets still show). */
function expectedAnswerKeys(item: Item | undefined): string[] {
  if (!item) return []
  if (item.kind === 'mcq' && item.options) {
    return item.options.map((o) => o.value)
  }
  if (item.kind === 'toggle') return ['true', 'false']
  if (item.kind === 'likert' || item.kind === 'bipolar') {
    return ['1', '2', '3', '4', '5']
  }
  return []
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request, false)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const moduleFilter = searchParams.get('module')
    const format = searchParams.get('format')

    let query = admin
      .from('answer_distribution_counts')
      .select('item_id, answer_key, count, updated_at')
      .order('item_id')
      .order('count', { ascending: false })

    if (moduleFilter) {
      const moduleItems = (v2ItemsJson as Item[])
        .filter((i) => i.section === moduleFilter)
        .map((i) => i.id)
      query = query.in('item_id', moduleItems)
    }

    const { data, error } = await query
    if (error) throw error

    const byItem = new Map<string, NonNullable<typeof data>>()
    for (const row of data ?? []) {
      if (!byItem.has(row.item_id)) byItem.set(row.item_id, [])
      byItem.get(row.item_id)!.push(row)
    }

    // Ensure every v2 bank item appears (even with zero answers)
    const itemsToShow = (v2ItemsJson as Item[]).filter((item) => {
      if (!moduleFilter) return true
      return item.section === moduleFilter
    })

    type AnswerRow = { key: string; label: string; count: number; pct: number }
    type ResultItem = {
      itemId: string
      questionLabel: string
      module: string
      kind: string
      totalResponses: number
      /** Highest share any single answer has (0–100). High = low variance. */
      maxPct: number
      answers: AnswerRow[]
    }

    const result: ResultItem[] = []

    for (const item of itemsToShow) {
      const rows = byItem.get(item.id) ?? []
      const countByKey = new Map<string, number>()
      for (const r of rows) {
        countByKey.set(r.answer_key, Number(r.count))
      }

      const keys = new Set([...expectedAnswerKeys(item), ...countByKey.keys()])
      const total = [...countByKey.values()].reduce((s, n) => s + n, 0)

      const answers: AnswerRow[] = [...keys]
        .map((key) => {
          const count = countByKey.get(key) ?? 0
          return {
            key,
            label: getAnswerLabel(item, key),
            count,
            pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
          }
        })
        .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))

      const maxPct = answers.reduce((m, a) => Math.max(m, a.pct), 0)

      result.push({
        itemId: item.id,
        questionLabel: item.label ?? item.id,
        module: MODULE_LABELS[item.section ?? ''] ?? (item.section ?? ''),
        kind: item.kind,
        totalResponses: total,
        maxPct,
        answers,
      })

      byItem.delete(item.id)
    }

    // Any orphan counts for unknown item ids
    byItem.forEach((rows, itemId) => {
      const total = rows.reduce((s, r) => s + Number(r.count), 0)
      const answers = rows.map((r) => ({
        key: r.answer_key,
        label: getAnswerLabel(undefined, r.answer_key),
        count: Number(r.count),
        pct: total > 0 ? Math.round((Number(r.count) / total) * 1000) / 10 : 0,
      }))
      const maxPct = answers.reduce((m, a) => Math.max(m, a.pct), 0)
      result.push({
        itemId,
        questionLabel: itemId,
        module: 'Unknown',
        kind: 'unknown',
        totalResponses: total,
        maxPct,
        answers,
      })
    })

    const { data: importanceRows } = await admin
      .from('question_importance_counts')
      .select('item_id, tick_count')
      .order('tick_count', { ascending: false })

    const questionImportanceTicks = (importanceRows ?? []).map((row) => {
      const item = ITEM_MAP.get(row.item_id)
      return {
        itemId: row.item_id as string,
        label: item?.label ?? (row.item_id as string),
        ticks: Number(row.tick_count),
      }
    })

    if (format === 'csv') {
      const header =
        'item_id,question_label,module,kind,total_responses,max_pct,answer_key,answer_label,count,pct_of_answers'
      const rows: string[] = []
      for (const entry of result) {
        for (const ans of entry.answers) {
          rows.push(
            [
              entry.itemId,
              `"${entry.questionLabel.replace(/"/g, '""')}"`,
              `"${entry.module}"`,
              entry.kind,
              entry.totalResponses,
              entry.maxPct,
              ans.key,
              `"${ans.label.replace(/"/g, '""')}"`,
              ans.count,
              ans.pct,
            ].join(',')
          )
        }
      }
      const csv = [header, ...rows].join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="answer-distribution.csv"',
        },
      })
    }

    return NextResponse.json({ data: result, questionImportanceTicks })
  } catch (err) {
    console.error('[answer-distribution]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
