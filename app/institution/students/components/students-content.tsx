'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, Circle, Loader2, RefreshCw } from 'lucide-react'
import { InstitutionPageHeader } from '../../components/institution-shell'
import {
  normalizeRegistrationStages,
  type FunnelStage,
} from '@/lib/admin/registration-funnel'
import type { InstitutionMetricsPayload } from '@/lib/institution/metrics'

export function InstitutionStudentsContent() {
  const [data, setData] = useState<InstitutionMetricsPayload | null>(null)
  const [period, setPeriod] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/institution/metrics?period=${period}&limit=1000`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load student journey')
      }
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period])

  useEffect(() => {
    void load()
  }, [load])

  const filteredStudents = useMemo(() => {
    if (!data) return []
    if (stageFilter === 'all') return data.students
    const target = parseInt(stageFilter, 10)
    return data.students.filter((s) => s.furthest_stage === target)
  }, [data, stageFilter])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <InstitutionPageHeader
            title="Student journey"
            description="Pseudonymous view of where each student is in the onboarding and matching workflow."
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            {data && (
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {data.funnel.stages.map((s: FunnelStage) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Stuck at: {s.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {loading || !data ? (
          <div className="py-16 flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading student journey…
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Per-student progress</CardTitle>
                  <CardDescription>
                    Each row is a pseudonymous student ID. No names, emails, or chat content are
                    shown.
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {filteredStudents.length} of {data.students.length} shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left px-3 py-2 sticky left-0 bg-white dark:bg-gray-950">
                        Student ID
                      </th>
                      <th className="text-left px-3 py-2">Signed up</th>
                      <th className="text-left px-3 py-2">Verification</th>
                      {data.funnel.stages.map((s) => (
                        <th key={s.id} className="px-2 py-2 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-[10px] font-medium">
                                {s.shortLabel}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{s.label}</TooltipContent>
                          </Tooltip>
                        </th>
                      ))}
                      <th className="text-right px-3 py-2">Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={data.funnel.stages.length + 4}
                          className="text-center py-8 text-gray-500"
                        >
                          No students match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const stages = normalizeRegistrationStages(student.stages)
                        return (
                          <tr
                            key={student.student_pseudo_id}
                            className="border-b border-gray-100 dark:border-gray-900"
                          >
                            <td className="px-3 py-2 sticky left-0 bg-white dark:bg-gray-950 font-mono text-xs">
                              {student.student_pseudo_id}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                              {new Date(student.signed_up_at).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {student.verification_status || 'unknown'}
                              </Badge>
                            </td>
                            {data.funnel.stages.map((s) => (
                              <td key={s.id} className="px-2 py-2 text-center">
                                {stages[s.id] ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-gray-300 inline" />
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-right font-mono text-xs">
                              {student.furthest_stage}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
