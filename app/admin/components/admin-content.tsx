'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  BarChart3,
  Settings,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react'

type TimePeriod = '24h' | '7d' | '1m' | '3m' | '6m' | '1y' | 'all'

interface DashboardMetrics {
  totalUsers: number
  activeMatches: number
  verifiedUsers: number
  pendingReports: number
  period: string
  lastUpdated: string
}

interface SystemHealth {
  overall: {
    status: 'online' | 'degraded' | 'offline'
    lastCheck: string
    summary: {
      online: number
      degraded: number
      offline: number
      total: number
    }
  }
  services: {
    database: {
      status: 'online' | 'degraded' | 'offline'
      responseTime: number
      lastCheck: string
      error?: string
    }
    authentication: {
      status: 'online' | 'degraded' | 'offline'
      responseTime: number
      lastCheck: string
      error?: string
    }
    matchingEngine: {
      status: 'online' | 'degraded' | 'offline'
      responseTime: number
      lastCheck: string
      error?: string
    }
    fileStorage: {
      status: 'online' | 'degraded' | 'offline'
      responseTime: number
      lastCheck: string
      error?: string
    }
  }
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

export function AdminContent() {
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
    period: 'all',
    lastUpdated: ''
  })
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    loadMetrics()
    loadSystemHealth()
    loadActivityFeed()
    
    // Set up auto-refresh for health checks every 60 seconds
    const healthInterval = setInterval(() => {
      loadSystemHealth()
    }, 60000)

    // Set up auto-refresh for activity feed at midnight
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()
    
    const activityTimeout = setTimeout(() => {
      loadActivityFeed()
      // Then refresh every 24 hours
      setInterval(() => {
        loadActivityFeed()
      }, 24 * 60 * 60 * 1000)
    }, msUntilMidnight)

    return () => {
      clearInterval(healthInterval)
      clearTimeout(activityTimeout)
    }
  }, [timePeriod])

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/dashboard-metrics?period=${timePeriod}`)
      if (!response.ok) throw new Error('Failed to load metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSystemHealth = async () => {
    setIsHealthLoading(true)
    try {
      const response = await fetch('/api/admin/system-health')
      if (!response.ok) throw new Error('Failed to load system health')
      const data = await response.json()
      setSystemHealth(data)
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
      if (!response.ok) throw new Error('Failed to load activity feed')
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Failed to load activity feed:', error)
    } finally {
      setIsActivityLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMetrics()
    loadSystemHealth()
    loadActivityFeed()
  }

  const getStatusBadge = (status: 'online' | 'degraded' | 'offline') => {
    const variants = {
      online: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      degraded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      offline: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    }
    return (
      <Badge variant="default" className={variants[status]}>
        {status === 'online' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Offline'}
      </Badge>
    )
  }

  const timePeriodLabels: Record<TimePeriod, string> = {
    '24h': '24 Hours',
    '7d': '7 Days',
    '1m': '1 Month',
    '3m': '3 Months',
    '6m': '6 Months',
    '1y': '1 Year',
    'all': 'All Time'
  }
  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">Admin Dashboard</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-muted-foreground mt-1">Monitor and manage the platform</p>
        </div>
        <div className="w-full sm:w-auto">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || isHealthLoading || isActivityLoading}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || isHealthLoading || isActivityLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Period Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="-mx-2 overflow-x-auto">
            <div className="px-2 inline-flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-gray-600 dark:text-muted-foreground mr-2">Time Period:</span>
              {(Object.keys(timePeriodLabels) as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'outline'}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Total Users</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{metrics.totalUsers.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Active Matches</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{metrics.activeMatches.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Verified Users</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{metrics.verifiedUsers.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Pending Reports</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{metrics.pendingReports.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Status
              {systemHealth && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {systemHealth.overall.status === 'online' ? 'All Systems Operational' : 
                   systemHealth.overall.status === 'degraded' ? 'Some Issues Detected' : 
                   'System Offline'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isHealthLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : systemHealth ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">Database</span>
                    {systemHealth.services.database.responseTime > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({systemHealth.services.database.responseTime}ms)
                      </span>
                    )}
                  </div>
                  {getStatusBadge(systemHealth.services.database.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">Authentication</span>
                    {systemHealth.services.authentication.responseTime > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({systemHealth.services.authentication.responseTime}ms)
                      </span>
                    )}
                  </div>
                  {getStatusBadge(systemHealth.services.authentication.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">Matching Engine</span>
                    {systemHealth.services.matchingEngine.responseTime > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({systemHealth.services.matchingEngine.responseTime}ms)
                      </span>
                    )}
                  </div>
                  {getStatusBadge(systemHealth.services.matchingEngine.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">File Storage</span>
                    {systemHealth.services.fileStorage.responseTime > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({systemHealth.services.fileStorage.responseTime}ms)
                      </span>
                    )}
                  </div>
                  {getStatusBadge(systemHealth.services.fileStorage.status)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t dark:border-gray-700">
                  Last checked: {new Date(systemHealth.overall.lastCheck).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Unable to load system status</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isActivityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const iconColors: Record<string, string> = {
                    users: 'bg-blue-500',
                    'trending-up': 'bg-green-500',
                    shield: 'bg-purple-500',
                    database: activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                  }
                  return (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${iconColors[activity.icon] || 'bg-gray-500'} rounded-full`}></div>
                      <span className="text-sm text-gray-600 dark:text-muted-foreground">{activity.description}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/admin/reports')}
            >
              <Shield className="w-6 h-6" />
              <span>Review Reports</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/admin/logs')}
            >
              <Database className="w-6 h-6" />
              <span>System Logs</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/admin/settings')}
            >
              <Settings className="w-6 h-6" />
              <span>Platform Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
