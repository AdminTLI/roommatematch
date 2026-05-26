'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  ActivitySquare,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Download,
  Flame,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  Users2,
} from 'lucide-react'
import {
  normalizeRegistrationStages,
  type FunnelStage,
} from '@/lib/admin/registration-funnel'

interface JourneyUser {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  signed_up_at: string
  email_confirmed_at: string | null
  is_active: boolean
  stages: Record<number, boolean>
  furthest_stage: number
  last_activity_at: string | null
}

interface FunnelResponse {
  stages: FunnelStage[]
  total_users: number
  users: JourneyUser[]
  stats: {
    stageCounts: Record<number, number>
    stageRates: Record<number, number>
    dropOffs: { from: number; to: number; lost: number; dropOffRate: number }[]
    biggestBottleneck: { stageId: number; dropOffRate: number; lost: number } | null
  }
}

export function RegistrationWorkflowPanel() {
  const [data, setData] = useState<FunnelResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [days, setDays] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')

  const load = useCallback(
    async (showRefreshing = false, opts?: { search?: string; days?: string }) => {
      if (showRefreshing) setIsRefreshing(true)
      else setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('limit', '1000')
        if (opts?.search) params.set('search', opts.search)
        if (opts?.days && opts.days !== 'all') params.set('days', opts.days)

        const res = await fetch(`/api/admin/registration-journey?${params.toString()}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Failed to load registration journey')
        }
        const json = (await res.json()) as FunnelResponse
        setData(json)
      } catch (e: any) {
        setError(e?.message || 'Failed to load registration journey')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    []
  )

  // Initial fetch + when window / search changes
  useEffect(() => {
    load(false, { search, days })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      load(false, { search, days })
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const filteredUsers = useMemo(() => {
    if (!data) return []
    if (stageFilter === 'all') return data.users
    const target = parseInt(stageFilter, 10)
    if (Number.isNaN(target)) return data.users
    return data.users.filter((u) => u.furthest_stage === target)
  }, [data, stageFilter])

  const handleExportCSV = () => {
    if (!data) return
    const header = [
      'email',
      'first_name',
      'last_name',
      'signed_up_at',
      'furthest_stage',
      ...data.stages.map((s) => `stage_${s.id}_${s.key}`),
    ]
    const rows = data.users.map((u) => [
      u.email,
      u.first_name || '',
      u.last_name || '',
      u.signed_up_at,
      String(u.furthest_stage),
      ...data.stages.map((s) => (u.stages[s.id] ? '1' : '0')),
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registration-journey-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            {data && (
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Filter by furthest stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {data.stages.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Stuck at: {s.id}. {s.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(true, { search, days })}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data || data.users.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="p-4 text-sm text-red-700 dark:text-red-300">
              {error}
            </CardContent>
          </Card>
        )}

        {isLoading || !data ? (
          <div className="py-20 flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading registration data…
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Users in window"
                value={data.total_users}
                icon={<Users2 className="h-4 w-4" />}
                tint="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              />
              <StatCard
                label="Completed journey"
                value={data.stats.stageCounts[11] || 0}
                hint={`${formatPct(data.stats.stageRates[11] || 0)} of users`}
                icon={<CheckCircle2 className="h-4 w-4" />}
                tint="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              />
              <StatCard
                label="Email-verified"
                value={data.stats.stageCounts[1] || 0}
                hint={`${formatPct(data.stats.stageRates[1] || 0)} of users`}
                icon={<ActivitySquare className="h-4 w-4" />}
                tint="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
              />
              <StatCard
                label="Biggest bottleneck"
                value={
                  data.stats.biggestBottleneck
                    ? `${data.stats.biggestBottleneck.dropOffRate.toFixed(1)}%`
                    : '-'
                }
                hint={
                  data.stats.biggestBottleneck
                    ? `${data.stages.find((s) => s.id === data.stats.biggestBottleneck!.stageId)?.shortLabel ?? '?'} → next (${data.stats.biggestBottleneck.lost} lost)`
                    : 'No drop-offs detected'
                }
                icon={<Flame className="h-4 w-4" />}
                tint="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              />
            </div>

            {/* Funnel visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivitySquare className="h-5 w-5" />
                  Funnel overview
                </CardTitle>
                <CardDescription>
                  Each bar is the number of users who reached that stage at least once. The red
                  number below shows how many users dropped off before reaching the next stage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.stages.map((stage, idx) => {
                    const count = data.stats.stageCounts[stage.id] || 0
                    const rate = data.stats.stageRates[stage.id] || 0
                    const drop = idx < data.stats.dropOffs.length ? data.stats.dropOffs[idx] : null
                    const isWorst =
                      data.stats.biggestBottleneck &&
                      drop &&
                      drop.from === data.stats.biggestBottleneck.stageId &&
                      drop.lost > 0
                    return (
                      <div key={stage.id} className="group">
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold">
                              {stage.id}
                            </span>
                            <span className="font-medium">{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{count} users</span>
                            <span className="font-mono">{formatPct(rate)}</span>
                          </div>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
                            style={{ width: `${Math.max(rate, 1)}%` }}
                          />
                        </div>
                        {drop && drop.lost > 0 && (
                          <div
                            className={`mt-1 flex items-center gap-1 text-xs ${
                              isWorst
                                ? 'text-red-700 dark:text-red-300 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            <TrendingDown className="h-3 w-3" />
                            {drop.lost} users dropped before next step ({drop.dropOffRate.toFixed(1)}%)
                            {isWorst && (
                              <Badge className="ml-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Biggest bottleneck
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Per-user heatmap */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Per-user journey</CardTitle>
                    <CardDescription>
                      One row per user. Each column is a stage - green = reached, gray = not yet.
                      Hover a cell for details.
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {filteredUsers.length} of {data.users.length} shown
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left px-3 py-2 sticky left-0 bg-white dark:bg-gray-950 z-10 min-w-[220px]">
                          User
                        </th>
                        <th className="text-left px-3 py-2 whitespace-nowrap">Signed up</th>
                        {data.stages.map((s) => (
                          <th key={s.id} className="px-2 py-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-1 cursor-help">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold">
                                    {s.id}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {s.shortLabel}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <div className="font-semibold mb-1">
                                  {s.id}. {s.label}
                                </div>
                                <div className="text-xs opacity-80">{s.description}</div>
                              </TooltipContent>
                            </Tooltip>
                          </th>
                        ))}
                        <th className="text-right px-3 py-2 whitespace-nowrap">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={data.stages.length + 3}
                            className="text-center py-8 text-sm text-gray-500"
                          >
                            No users match the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const stages = normalizeRegistrationStages(u.stages)
                          const completedCount = data.stages.filter((s) => stages[s.id]).length
                          const progressPct = (completedCount / data.stages.length) * 100
                          const stuckBadge = u.furthest_stage < data.stages.length - 1
                          return (
                            <tr
                              key={u.user_id}
                              className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                            >
                              <td className="px-3 py-2 sticky left-0 bg-white dark:bg-gray-950 z-10">
                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[210px]">
                                  {[u.first_name, u.last_name].filter(Boolean).join(' ') ||
                                    u.email.split('@')[0]}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[210px]">
                                  {u.email}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                                {new Date(u.signed_up_at).toLocaleDateString()}
                              </td>
                              {data.stages.map((s) => {
                                const reached = stages[s.id]
                                return (
                                  <td key={s.id} className="px-2 py-2 text-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="inline-flex items-center justify-center cursor-help">
                                          {reached ? (
                                            <div className="h-7 w-7 rounded-md bg-green-500/15 ring-1 ring-green-500/30 flex items-center justify-center">
                                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                          ) : (
                                            <div className="h-7 w-7 rounded-md bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                                              <Circle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <div className="text-xs">
                                          <span className="font-semibold">{s.label}</span>
                                          <br />
                                          {reached ? '✓ Reached' : '⏳ Not yet'}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </td>
                                )
                              })}
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                                    {completedCount}/{data.stages.length}
                                  </span>
                                  <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        progressPct === 100
                                          ? 'bg-green-500'
                                          : progressPct >= 50
                                            ? 'bg-indigo-500'
                                            : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                  {stuckBadge && progressPct < 100 && u.furthest_stage <= 2 && (
                                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                  )}
                                </div>
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

            <p className="text-xs text-gray-500">
              Showing the first {data.users.length} of {data.total_users} users in the selected
              window. Use the search and time filters above, or export to CSV for a full audit.
            </p>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tint,
}: {
  label: string
  value: number | string
  hint?: string
  icon: React.ReactNode
  tint: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
            <div className="text-2xl font-bold mt-1 truncate">{value}</div>
            {hint && <div className="text-xs text-gray-500 mt-1 truncate">{hint}</div>}
          </div>
          <div className={`h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 ${tint}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`
}
