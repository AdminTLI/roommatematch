'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type AnswerEntry = { key: string; label: string; count: number; pct: number }
type ItemData = {
  itemId: string
  questionLabel: string
  module: string
  answers: AnswerEntry[]
}

const V2_MODULES = [
  'Logistics and Context',
  'Environment and Rhythms',
  'Cleanliness and Operations',
  'Communication and Resolution',
  'Social Life and Spaces',
]

export function AnswerDistributionClient() {
  const [data, setData]         = useState<ItemData[]>([])
  const [loading, setLoading]   = useState(true)
  const [importanceData, setImportanceData] = useState<{ itemId: string; label: string; ticks: number }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics/answer-distribution').then((r) => r.json()),
      fetch('/api/admin/analytics/trust-and-algorithm').then((r) => r.json()),
    ]).then(([distRes, trustRes]) => {
      setData(distRes.data ?? [])
      // Extract question importance data from trust-and-algorithm
      const ticks = trustRes?.questionImportanceTicks ?? []
      setImportanceData(ticks)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleExportCSV = () => {
    window.open('/api/admin/analytics/answer-distribution?format=csv', '_blank')
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Loading answer distribution data...
      </div>
    )
  }

  // Group by module
  const byModule = new Map<string, ItemData[]>()
  for (const item of data) {
    const mod = item.module || 'Unknown'
    if (!byModule.has(mod)) byModule.set(mod, [])
    byModule.get(mod)!.push(item)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Answer Distribution</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymized aggregate answer counts per question (v2 questionnaire)
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

        <TabsContent value="distribution" className="mt-4">
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
                    <div className="space-y-6 pt-2">
                      {items.map((item) => {
                        const chartData = item.answers.map((a) => ({
                          name: a.label.length > 24 ? a.label.slice(0, 24) + '...' : a.label,
                          count: a.count,
                          pct: a.pct,
                          fullLabel: a.label,
                        }))
                        return (
                          <div key={item.itemId} className="space-y-2">
                            <p className="text-xs font-medium text-foreground line-clamp-2">
                              <span className="text-muted-foreground mr-1">{item.itemId}</span>
                              {item.questionLabel}
                            </p>
                            <ResponsiveContainer width="100%" height={Math.max(80, chartData.length * 36)}>
                              <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  width={160}
                                  tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                  formatter={(value, name, props) => [
                                    `${value} (${props.payload.pct}%)`,
                                    props.payload.fullLabel,
                                  ]}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )
                      })}
                      {items.length === 0 && (
                        <p className="text-xs text-muted-foreground">No data yet for this module.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </TabsContent>

        <TabsContent value="importance" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Questions users marked as "This matters to me", sorted by importance tick count.
            </p>
            {importanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(300, importanceData.length * 28)}>
                <BarChart
                  data={importanceData.map((d) => ({
                    name: d.itemId,
                    ticks: d.ticks,
                    label: d.label,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => [`${value} ticks`, props.payload.label]}
                  />
                  <Bar dataKey="ticks" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
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
