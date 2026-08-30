'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, AlertTriangle, Lock } from 'lucide-react'
import { useIsSuperAdmin } from '@/lib/auth/roles-client'
import { cn } from '@/lib/utils'

type AnswerEntry = { key: string; label: string; count: number; pct: number }
type ItemData = {
  itemId: string
  questionLabel: string
  module: string
  kind?: string
  totalResponses?: number
  maxPct?: number
  answers: AnswerEntry[]
}

const V2_MODULES = [
  'Logistics and Context',
  'Environment and Rhythms',
  'Cleanliness and Operations',
  'Communication and Resolution',
  'Social Life and Spaces',
]

/** High = answers cluster on one option (candidate for deletion). */
function concentrationLabel(maxPct: number): { label: string; className: string } {
  if (maxPct >= 80) {
    return {
      label: 'Very similar',
      className: 'bg-amber-100 text-amber-900 border-amber-200',
    }
  }
  if (maxPct >= 65) {
    return {
      label: 'Mostly similar',
      className: 'bg-orange-50 text-orange-800 border-orange-200',
    }
  }
  return {
    label: 'Varied',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }
}

function QuestionBlock({ item }: { item: ItemData }) {
  const total = item.totalResponses ?? item.answers.reduce((s, a) => s + a.count, 0)
  const maxPct = item.maxPct ?? item.answers.reduce((m, a) => Math.max(m, a.pct), 0)
  const concentration = concentrationLabel(maxPct)

  const chartData = item.answers.map((a) => ({
    name: a.label.length > 28 ? a.label.slice(0, 28) + '…' : a.label,
    count: a.count,
    pct: a.pct,
    fullLabel: a.label,
  }))

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground leading-snug">
            {item.questionLabel}
          </p>
          <p className="text-xs text-muted-foreground font-mono">{item.itemId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {total.toLocaleString()} responses
          </span>
          {total > 0 && (
            <span
              className={cn(
                'text-[11px] font-medium px-2 py-0.5 rounded-md border',
                concentration.className
              )}
              title={`Top answer has ${maxPct}% of responses`}
            >
              {concentration.label} ({maxPct}%)
            </span>
          )}
        </div>
      </div>

      {total === 0 ? (
        <p className="text-xs text-muted-foreground">No answers recorded yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-3 font-medium">Answer</th>
                  <th className="py-1.5 pr-3 font-medium text-right w-20">Count</th>
                  <th className="py-1.5 font-medium text-right w-20">%</th>
                </tr>
              </thead>
              <tbody>
                {item.answers.map((a) => (
                  <tr key={a.key} className="border-b border-border/40 last:border-0">
                    <td className="py-1.5 pr-3 text-foreground">{a.label}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums text-foreground">
                      {a.count.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                      {a.pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={Math.max(72, chartData.length * 32)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, _name, props) => [
                  `${value} (${props.payload.pct}%)`,
                  props.payload.fullLabel,
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={`${entry.name}-${i}`}
                    fill={entry.pct === maxPct && maxPct >= 65 ? '#d97706' : '#4f46e5'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}

export function AnswerDistributionClient() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin()
  const [data, setData] = useState<ItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importanceData, setImportanceData] = useState<
    { itemId: string; label: string; ticks: number }[]
  >([])
  const [sortMode, setSortMode] = useState<'module' | 'concentration'>('concentration')

  useEffect(() => {
    if (roleLoading) return
    if (!isSuperAdmin) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch('/api/admin/analytics/answer-distribution')
      .then(async (r) => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || 'Failed to load answer distribution')
        return body
      })
      .then((distRes) => {
        if (cancelled) return
        setData(distRes.data ?? [])
        setImportanceData(distRes.questionImportanceTicks ?? [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, roleLoading])

  const handleExportCSV = () => {
    window.open('/api/admin/analytics/answer-distribution?format=csv', '_blank')
  }

  const byModule = useMemo(() => {
    const map = new Map<string, ItemData[]>()
    for (const item of data) {
      const mod = item.module || 'Unknown'
      if (!map.has(mod)) map.set(mod, [])
      map.get(mod)!.push(item)
    }
    return map
  }, [data])

  const byConcentration = useMemo(() => {
    return [...data]
      .filter((d) => (d.totalResponses ?? 0) > 0)
      .sort((a, b) => (b.maxPct ?? 0) - (a.maxPct ?? 0))
  }, [data])

  if (roleLoading || loading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Loading answer distribution data...
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-3">
        <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
        <h2 className="text-lg font-semibold">Super admin only</h2>
        <p className="text-sm text-muted-foreground">
          Anonymized questionnaire answer distributions are restricted to platform super
          admins.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-600" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Answer Distribution</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Anonymous aggregate counts and percentages per answer. Use high concentration
            (“Very similar”) to spot questions that add little signal and may be removable.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">Answer Distribution</TabsTrigger>
          <TabsTrigger value="importance">Question Importance</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={sortMode === 'concentration' ? 'primary' : 'outline'}
              onClick={() => setSortMode('concentration')}
            >
              Sort by similarity
            </Button>
            <Button
              size="sm"
              variant={sortMode === 'module' ? 'primary' : 'outline'}
              onClick={() => setSortMode('module')}
            >
              Group by module
            </Button>
          </div>

          {sortMode === 'concentration' ? (
            <div className="space-y-4">
              {byConcentration.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No answer data yet. Counts appear as participants save onboarding answers.
                </p>
              ) : (
                byConcentration.map((item) => <QuestionBlock key={item.itemId} item={item} />)
              )}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={[V2_MODULES[0]]}>
              {V2_MODULES.map((mod) => {
                const items = byModule.get(mod) ?? []
                return (
                  <AccordionItem key={mod} value={mod}>
                    <AccordionTrigger className="text-sm font-semibold">
                      {mod}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({items.length} questions)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {items.map((item) => (
                          <QuestionBlock key={item.itemId} item={item} />
                        ))}
                        {items.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            No data yet for this module.
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="importance" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Questions users marked as &quot;This matters to me&quot;, sorted by importance tick
              count.
            </p>
            {importanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(300, importanceData.length * 28)}>
                <BarChart
                  data={importanceData.map((d) => ({
                    name: d.itemId,
                    ticks: d.ticks,
                    label: d.label,
                  }))
                  }
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, _name, props) => [`${value} ticks`, props.payload.label]}
                  />
                  <Bar dataKey="ticks" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">No importance data available yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
