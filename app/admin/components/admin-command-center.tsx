'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SystemStatusPanel,
  type SystemHealthData,
} from '@/app/admin/components/system-status-panel'
import { AdminHubShell } from '@/app/admin/components/admin-hub-shell'
import {
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  RefreshCw,
  Activity,
  BarChart3,
  Database,
  GraduationCap,
  Bug,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react'

type TimePeriod = '24h' | '7d' | '1m' | '3m' | '6m' | '1y' | 'all'

interface DashboardMetrics {
  totalUsers: number
  activeMatches: number
  verifiedUsers: number
  pendingReports: number
  pendingLabReports?: number
  openUniversityEmailFlags?: number
  openBugReports: number
  period: string
  lastUpdated: string
}

interface ActivityItem {
  id: string
  type: string
  description: string
  count: number
  timestamp: string
  icon: string
  status?: string
}

interface QueueCounts {
  pendingReports: number
  pendingLabReports: number
  openUniversityEmailFlags: number
  flaggedMessages: number
  openBugReports: number
  dsarOverdue: number
  dsarApproaching: number
  pendingVerifications: number
}

export function AdminCommandCenter() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isHealthLoading, setIsHealthLoading] = useState(true)
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeMatches: 0,
    verifiedUsers: 0,
    pendingReports: 0,
    pendingLabReports: 0,
    openUniversityEmailFlags: 0,
    openBugReports: 0,
    period: 'all',
    lastUpdated: '',
  })
  const [queues, setQueues] = useState<QueueCounts>({
    pendingReports: 0,
    pendingLabReports: 0,
    openUniversityEmailFlags: 0,
    flaggedMessages: 0,
    openBugReports: 0,
    dsarOverdue: 0,
    dsarApproaching: 0,
    pendingVerifications: 0,
  })
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    loadMetrics()
    loadQueues()
    loadSystemHealth()
    loadActivityFeed()

    const healthInterval = setInterval(loadSystemHealth, 60000)
    return () => clearInterval(healthInterval)
  }, [timePeriod])

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/dashboard-metrics?period=${timePeriod}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadQueues = async () => {
    try {
      const [flaggedRes, dsarRes, verificationsRes] = await Promise.all([
        fetch('/api/admin/messages/flagged?limit=1'),
        fetch('/api/admin/dsar/stats'),
        fetch('/api/admin/verifications?status=pending'),
      ])

      let flaggedTotal = 0
      if (flaggedRes.ok) {
        const data = await flaggedRes.json()
        flaggedTotal = data.total ?? 0
      }

      let dsarOverdue = 0
      let dsarApproaching = 0
      if (dsarRes.ok) {
        const data = await dsarRes.json()
        dsarOverdue = data.overdue ?? 0
        dsarApproaching = data.approaching ?? 0
      }

      let pendingVerifications = 0
      if (verificationsRes.ok) {
        const data = await verificationsRes.json()
        pendingVerifications = data.stats?.pending ?? 0
      }

      setQueues((prev) => ({
        ...prev,
        pendingReports: metrics.pendingReports,
        pendingLabReports: metrics.pendingLabReports ?? 0,
        openUniversityEmailFlags: metrics.openUniversityEmailFlags ?? 0,
        openBugReports: metrics.openBugReports,
        flaggedMessages: flaggedTotal,
        dsarOverdue,
        dsarApproaching,
        pendingVerifications,
      }))
    } catch (error) {
      console.error('Failed to load queue counts:', error)
    }
  }

  useEffect(() => {
    setQueues((prev) => ({
      ...prev,
      pendingReports: metrics.pendingReports,
      pendingLabReports: metrics.pendingLabReports ?? 0,
      openUniversityEmailFlags: metrics.openUniversityEmailFlags ?? 0,
      openBugReports: metrics.openBugReports,
    }))
  }, [metrics.pendingReports, metrics.pendingLabReports, metrics.openUniversityEmailFlags, metrics.openBugReports])

  const loadSystemHealth = async () => {
    setIsHealthLoading(true)
    try {
      const response = await fetch('/api/admin/system-health')
      if (response.ok) {
        setSystemHealth(await response.json())
      }
    } catch (error) {
      console.error('Failed to load system health:', error)
    } finally {
      setIsHealthLoading(false)
    }
  }

  const loadActivityFeed = async () => {
    setIsActivityLoading(true)
    try {
      const response = await fetch('/api/admin/activity-feed')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load activity feed:', error)
    } finally {
      setIsActivityLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMetrics()
    loadQueues()
    loadSystemHealth()
    loadActivityFeed()
  }

  const timePeriodLabels: Record<TimePeriod, string> = {
    '24h': '24 Hours',
    '7d': '7 Days',
    '1m': '1 Month',
    '3m': '3 Months',
    '6m': '6 Months',
    '1y': '1 Year',
    all: 'All Time',
  }

  const queueItems = [
    {
      label: 'Pending reports',
      count: queues.pendingReports,
      href: '/admin/reports',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Lab reports',
      count: queues.pendingLabReports,
      href: '/admin/reports?tab=lab',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'University email flags',
      count: queues.openUniversityEmailFlags,
      href: '/admin/reports?tab=university-email',
      icon: GraduationCap,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      label: 'Flagged messages',
      count: queues.flaggedMessages,
      href: '/admin/reports?tab=flagged',
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: 'Open bug reports',
      count: queues.openBugReports,
      href: '/admin/bug-reports',
      icon: Bug,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'DSAR overdue',
      count: queues.dsarOverdue,
      href: '/admin/dsar',
      icon: Clock,
      color: 'text-red-700',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: 'DSAR approaching SLA',
      count: queues.dsarApproaching,
      href: '/admin/dsar',
      icon: FileText,
      color: 'text-orange-700',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Pending verifications',
      count: queues.pendingVerifications,
      href: '/admin/verifications',
      icon: UserCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
  ].filter(
    (item) =>
      (item.label !== 'Lab reports' && item.label !== 'University email flags') ||
      item.count > 0
  )

  return (
    <AdminHubShell
      hub="overview"
      hideTabs
      title="Command Center"
      description="Operational queues, platform KPIs, and system health at a glance."
      actions={
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isHealthLoading || isActivityLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading || isHealthLoading || isActivityLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      }
    >
      {/* Action queues */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Action queues
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {queueItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href}>
                <Card
                  className={`cursor-pointer transition hover:ring-2 hover:ring-violet-300/50 ${item.count > 0 ? 'border-amber-200/80' : ''}`}
                >
                  <CardContent className={`p-4 ${item.bg} rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      {item.count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{item.count}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.label}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Time period */}
      <Card>
        <CardContent className="p-4">
          <div className="-mx-2 overflow-x-auto">
            <div className="px-2 inline-flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground mr-2">KPI period:</span>
              {(Object.keys(timePeriodLabels) as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                  className="text-xs"
                >
                  {timePeriodLabels[period]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600' },
          { label: 'Active Matches', value: metrics.activeMatches, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Verified Users', value: metrics.verifiedUsers, icon: Shield, color: 'text-purple-600' },
          {
            label: 'Pending Reports',
            value: metrics.pendingReports,
            icon: AlertTriangle,
            color: 'text-orange-600',
            onClick: () => router.push('/admin/reports'),
          },
          {
            label: 'Open Bugs',
            value: metrics.openBugReports,
            icon: Bug,
            color: 'text-amber-700',
            onClick: () => router.push('/admin/bug-reports'),
          },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card
              key={kpi.label}
              className={kpi.onClick ? 'cursor-pointer hover:ring-2 hover:ring-violet-300/50' : ''}
              onClick={kpi.onClick}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    {isLoading ? (
                      <div className="h-8 w-16 bg-muted rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{kpi.value.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* System status + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-green-600" />
              System Status
              {systemHealth && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {systemHealth.overall.status === 'online'
                    ? 'All Systems Operational'
                    : systemHealth.overall.status === 'degraded'
                      ? 'Some Issues Detected'
                      : 'System Offline'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemStatusPanel systemHealth={systemHealth} isLoading={isHealthLoading} showLogsLink />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Today&apos;s Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isActivityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-48 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const iconColors: Record<string, string> = {
                  users: 'bg-blue-500',
                  'trending-up': 'bg-green-500',
                  shield: 'bg-purple-500',
                  database: activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500',
                }
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${iconColors[activity.icon] || 'bg-gray-500'}`}
                    />
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick hub links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'People', href: '/admin/people', icon: Users },
              { label: 'Safety', href: '/admin/safety', icon: Shield },
              { label: 'Platform', href: '/admin/platform', icon: TrendingUp },
              { label: 'Insights', href: '/admin/insights', icon: BarChart3 },
              { label: 'System', href: '/admin/system', icon: Database },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </AdminHubShell>
  )
}
