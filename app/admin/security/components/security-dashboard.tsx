'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock, 
  Eye,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SecurityMetrics {
  failedLoginAttempts: number
  suspiciousActivities: number
  rlsViolations: number
  verificationFailures: number
  rateLimitExceeded: number
  period: {
    start: string
    end: string
  }
}

interface SecurityEvent {
  id: string
  event_type: string
  user_id?: string
  ip_address?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

interface SecurityDashboardProps {
  admin: {
    id: string
    university_id: string
    role: string
  }
}

export default function SecurityDashboard({ admin }: SecurityDashboardProps) {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    setIsLoading(true)

    try {
      // Load security metrics
      const metricsResponse = await fetch('/api/admin/security/metrics')
      const metricsData = metricsResponse.ok ? await metricsResponse.json() : null

      // Load recent security events
      const eventsResponse = await fetch('/api/admin/security/events?limit=50')
      const eventsData = eventsResponse.ok ? await eventsResponse.json() : null

      setMetrics(metricsData?.data || null)
      setRecentEvents(eventsData?.data || [])
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>
      case 'high': return <Badge className="bg-orange-500">High</Badge>
      case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>
      default: return <Badge variant="outline">Low</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-500" />
          Security Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Monitor security events, track suspicious activity, and manage security controls
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.failedLoginAttempts || 0}</div>
                <div className="text-sm text-gray-500">Failed Logins</div>
                <div className="text-xs text-gray-400">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.suspiciousActivities || 0}</div>
                <div className="text-sm text-gray-500">Suspicious Activity</div>
                <div className="text-xs text-gray-400">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.rlsViolations || 0}</div>
                <div className="text-sm text-gray-500">RLS Violations</div>
                <div className="text-xs text-gray-400">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.verificationFailures || 0}</div>
                <div className="text-sm text-gray-500">Verification Failures</div>
                <div className="text-xs text-gray-400">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.rateLimitExceeded || 0}</div>
                <div className="text-sm text-gray-500">Rate Limit Exceeded</div>
                <div className="text-xs text-gray-400">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Security events detected in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No security events detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(event.severity)}
                      <span className="font-medium">{event.event_type.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {event.user_id && <div>User ID: {event.user_id}</div>}
                    {event.ip_address && <div>IP Address: {event.ip_address}</div>}
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-2">
                        <pre className="text-xs bg-white dark:bg-gray-800 dark:text-gray-200 p-2 rounded">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

