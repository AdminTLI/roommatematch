'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Shield, MessageSquare, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, Activity, Lock, BookOpen, UserCheck, Globe, Network, Radio } from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { showErrorToast } from '@/lib/toast'

interface Metrics {
  totalUsers: number
  verifiedUsers: number
  activeChats: number
  totalMatches: number
  reportsPending: number
  signupsLast7Days: number
  signupsLast30Days: number
  verificationRate: number
  matchActivity: number
  universityStats?: Array<{
    university_name: string
    total_users: number
    verified_users: number
  }>
  programStats?: Array<{
    program_name: string
    university_name: string
    total_users: number
  }>
  studyYearDistribution?: Array<{
    study_year: number
    count: number
  }>
}

interface ConversionFunnelData {
  totalMatches: number
  totalAgreements: number
  matchesLast7Days: number
  conversionRate: number
  weeklyConversion: Array<{
    week: string
    matches: number
    agreements: number
    rate: number
  }>
  funnelSteps?: Array<{
    step: string
    count: number
    dropOff: number
    dropOffRate: number
  }>
  overallConversionRate?: number
  totalSignups?: number
}

interface UserLifecycleData {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  engagedUsers: number
  lifecycleStage: Record<string, number>
  engagementScore: number
  averageSessionDuration: number
  averageSessionsPerUser: number
  engagementTrend: Array<{
    date: string
    score: number
  }>
}

interface SecurityData {
  timeSeries: Array<{
    date: string
    failed_login: number
    suspicious_activity: number
    rls_violation: number
    verification_failure: number
    rate_limit_exceeded: number
    total: number
  }>
  totals: {
    failed_login: number
    suspicious_activity: number
    rls_violation: number
    verification_failure: number
    rate_limit_exceeded: number
    total: number
  }
}

interface CoverageData {
  totalInstitutions: number
  completeInstitutions: number
  incompleteInstitutions: number
  missingInstitutions: number
  totalProgrammes: number
  institutions: Array<{
    id: string
    label: string
    status: 'complete' | 'incomplete' | 'missing'
    totalProgrammes: number
  }>
}

interface CohortRetentionData {
  cohorts: Array<{
    cohortDate: string
    cohortSize: number
    day1Retention: number
    day7Retention: number
    day30Retention: number
    day90Retention: number
  }>
  averageRetention: {
    day1: number
    day7: number
    day30: number
    day90: number
  }
}

interface RealtimeData {
  activeUsers: number
  activeSessions: number
  eventsLast5Min: number
}

interface TrafficSourcesData {
  sources: Array<{
    source: string
    count: number
    percentage: number
  }>
  campaigns: Array<{
    campaign: string
    count: number
    percentage: number
  }>
  timeSeries: Array<{
    date: string
    organic: number
    direct: number
    paid: number
    social: number
    email: number
    referral: number
    total: number
  }>
}

interface UserFlowsData {
  topPaths: Array<{
    path: string
    count: number
    percentage: number
  }>
  dropOffs: Array<{
    page: string
    entries: number
    exits: number
    dropOffRate: number
  }>
  totalSessions: number
}

interface GeographicData {
  countries: Array<{
    code: string
    name: string
    userCount: number
  }>
  cities: Array<{
    city: string
    userCount: number
  }>
  regions: Array<{
    region: string
    userCount: number
  }>
  totalUsers: number
}

export function AdminMetricsContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData | null>(null)
  const [userLifecycle, setUserLifecycle] = useState<UserLifecycleData | null>(null)
  const [security, setSecurity] = useState<SecurityData | null>(null)
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [cohortRetention, setCohortRetention] = useState<CohortRetentionData | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [trafficSources, setTrafficSources] = useState<TrafficSourcesData | null>(null)
  const [userFlows, setUserFlows] = useState<UserFlowsData | null>(null)
  const [geographic, setGeographic] = useState<GeographicData | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/admin/analytics/realtime')
        .then(res => res.json())
        .then(data => setRealtime(data))
        .catch(err => console.error('Failed to refresh realtime data:', err))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    try {
      // Load all metrics in parallel
      const [
        metricsResponse,
        conversionFunnelResponse,
        userLifecycleResponse,
        securityResponse,
        coverageResponse,
        cohortRetentionResponse,
        realtimeResponse,
        trafficSourcesResponse,
        userFlowsResponse,
        geographicResponse
      ] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/analytics/conversion-funnel'),
        fetch('/api/admin/analytics/user-lifecycle'),
        fetch('/api/admin/analytics/security'),
        fetch('/api/admin/analytics/coverage'),
        fetch('/api/admin/analytics/cohort-retention'),
        fetch('/api/admin/analytics/realtime'),
        fetch('/api/admin/analytics/traffic-sources'),
        fetch('/api/admin/analytics/user-flows'),
        fetch('/api/admin/analytics/geographic')
      ])

      if (metricsResponse.ok) {
        const data = await metricsResponse.json()
        setMetrics(data)
      } else {
        const errorData = await metricsResponse.json().catch(() => ({}))
        showErrorToast(errorData.error || 'Failed to load metrics')
        setMetrics({
          totalUsers: 0,
          verifiedUsers: 0,
          activeChats: 0,
          totalMatches: 0,
          reportsPending: 0,
          signupsLast7Days: 0,
          signupsLast30Days: 0,
          verificationRate: 0,
          matchActivity: 0
        })
      }

      if (conversionFunnelResponse.ok) {
        const data = await conversionFunnelResponse.json()
        setConversionFunnel(data)
      }

      if (userLifecycleResponse.ok) {
        const data = await userLifecycleResponse.json()
        setUserLifecycle(data)
      }

      if (securityResponse.ok) {
        const data = await securityResponse.json()
        setSecurity(data)
      }

      if (coverageResponse.ok) {
        const data = await coverageResponse.json()
        setCoverage(data)
      }

      if (cohortRetentionResponse.ok) {
        const data = await cohortRetentionResponse.json()
        setCohortRetention(data)
      }

      if (realtimeResponse.ok) {
        const data = await realtimeResponse.json()
        setRealtime(data)
      }

      if (trafficSourcesResponse.ok) {
        const data = await trafficSourcesResponse.json()
        setTrafficSources(data)
      }

      if (userFlowsResponse.ok) {
        const data = await userFlowsResponse.json()
        setUserFlows(data)
      }

      if (geographicResponse.ok) {
        const data = await geographicResponse.json()
        setGeographic(data)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
      showErrorToast('Failed to load metrics')
      setMetrics({
        totalUsers: 0,
        verifiedUsers: 0,
        activeChats: 0,
        totalMatches: 0,
        reportsPending: 0,
        signupsLast7Days: 0,
        signupsLast30Days: 0,
        verificationRate: 0,
        matchActivity: 0
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading metrics...</span>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Failed to load metrics. Please try refreshing.</span>
        </div>
      </div>
    )
  }

  const verificationRate = (metrics.totalUsers ?? 0) > 0 
    ? (((metrics.verifiedUsers ?? 0) / (metrics.totalUsers ?? 1)) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform analytics and performance metrics
          </p>
        </div>
        <Button onClick={() => loadMetrics(true)} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Real-time Activity Card */}
      {realtime && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Real-time Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{realtime.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{realtime.activeSessions}</div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{realtime.eventsLast5Min}</div>
                <p className="text-xs text-muted-foreground">Events (5 min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.totalUsers ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.signupsLast7Days ?? 0)} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.verifiedUsers ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {verificationRate}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.activeChats ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.totalMatches ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.matchActivity ?? 0)} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification & Safety Trust Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification & Safety Trust Stack
          </CardTitle>
          <CardDescription>
            Platform safety metrics combining verification rates with security monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 md:space-y-8">
          <div className="space-y-6 md:space-y-8">
            {/* Verification Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">Verified Users</p>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">{(metrics.verifiedUsers ?? 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">{verificationRate}% verification rate</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Unverified</p>
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">{((metrics.totalUsers ?? 0) - (metrics.verifiedUsers ?? 0)).toLocaleString()}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Pending verification</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">Pending Reports</p>
                </div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300 mb-1">{(metrics.reportsPending ?? 0).toLocaleString()}</p>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Requires review</p>
              </div>
            </div>

            {/* Security Events Summary */}
            {security && security.totals && (
              <div>
                <h4 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Security Events (Last 14 Days)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50 text-center shadow-sm hover:shadow transition-shadow">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">Failed Logins</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{(security.totals.failed_login ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50 text-center shadow-sm hover:shadow transition-shadow">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2">Suspicious Activity</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{(security.totals.suspicious_activity ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-lime-50 dark:from-yellow-900/20 dark:to-lime-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50 text-center shadow-sm hover:shadow transition-shadow">
                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-2">RLS Violations</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{(security.totals.rls_violation ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 text-center shadow-sm hover:shadow transition-shadow">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Verification Failures</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(security.totals.verification_failure ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 text-center shadow-sm hover:shadow transition-shadow">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">Rate Limit Exceeded</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(security.totals.rate_limit_exceeded ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">Insights</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    The verification rate ({verificationRate}%) indicates the percentage of users who have completed 
                    identity verification, establishing trust in the platform. Combined with security event monitoring, 
                    this demonstrates our commitment to maintaining a safe environment for students. Low security event 
                    counts relative to user base indicate effective platform security measures. High verification rates 
                    coupled with low security incidents signal strong trust and safety protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
          <CardDescription>User acquisition and activity trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">New Users (7 days)</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(metrics.signupsLast7Days ?? 0).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">New Users (30 days)</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{(metrics.signupsLast30Days ?? 0).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Match Activity (7 days)</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{(metrics.matchActivity ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      {trafficSources && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              User acquisition by traffic source and marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pie Chart */}
              {trafficSources.sources.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Traffic Distribution</h4>
                  <div className="w-full" style={{ minHeight: '350px' }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={trafficSources.sources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ source, percentage }) => `${source}: ${percentage.toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {trafficSources.sources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Time Series Chart */}
              {trafficSources.timeSeries && trafficSources.timeSeries.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Traffic Trends</h4>
                  <div className="w-full" style={{ minHeight: '350px' }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trafficSources.timeSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis label={{ value: 'Events', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value: number) => value.toLocaleString()}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="organic" stackId="1" stroke="#0088FE" fill="url(#organicGradient)" name="Organic" />
                        <Area type="monotone" dataKey="direct" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} name="Direct" />
                        <Area type="monotone" dataKey="paid" stackId="1" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.3} name="Paid" />
                        <Area type="monotone" dataKey="social" stackId="1" stroke="#FF8042" fill="#FF8042" fillOpacity={0.3} name="Social" />
                        <Area type="monotone" dataKey="email" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Email" />
                        <Area type="monotone" dataKey="referral" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Referral" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Top Campaigns */}
              {trafficSources.campaigns.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Top Campaigns</h4>
                  <div className="space-y-2">
                    {trafficSources.campaigns.slice(0, 5).map((campaign, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium">{campaign.campaign}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{campaign.count.toLocaleString()} events</span>
                          <span className="text-sm font-semibold">{campaign.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Flows */}
      {userFlows && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              User Flows
            </CardTitle>
            <CardDescription>
              Most common navigation paths and drop-off points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Paths */}
              {userFlows.topPaths.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Top Navigation Paths</h4>
                  <div className="space-y-2">
                    {userFlows.topPaths.slice(0, 10).map((path, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-mono">{path.path}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{path.count} sessions</span>
                          <span className="text-sm font-semibold">{path.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop-offs */}
              {userFlows.dropOffs.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Top Drop-off Pages</h4>
                  <div className="space-y-2">
                    {userFlows.dropOffs.slice(0, 10).map((dropOff, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{dropOff.page}</span>
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">{dropOff.dropOffRate}% drop-off</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{dropOff.entries} entries</span>
                          <span>{dropOff.exits} exits</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geographic Distribution */}
      {geographic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>
              User distribution by country, city, and region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Countries Chart */}
              {geographic.countries.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Users by Country</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={geographic.countries.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => value.toLocaleString()} />
                          <Bar dataKey="userCount" fill="#0088FE" name="Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={geographic.countries.slice(0, 10)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, userCount }) => `${name}: ${userCount}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="userCount"
                          >
                            {geographic.countries.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Cities */}
              {geographic.cities.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Top Cities</h4>
                  <div className="space-y-2">
                    {geographic.cities.slice(0, 10).map((city, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium">{city.city}</span>
                        <span className="text-sm font-semibold">{city.userCount.toLocaleString()} users</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programme & University Footprint */}
      {(metrics.universityStats || metrics.programStats || metrics.studyYearDistribution) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Programme & University Footprint
            </CardTitle>
            <CardDescription>
              User distribution across universities, programs, and study years
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* University Distribution */}
              {metrics.universityStats && metrics.universityStats.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Users by University</h4>
                  <div className="w-full" style={{ minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={metrics.universityStats.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="university_name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          tick={{ fontSize: 11 }}
                          width={120}
                        />
                      <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value: number) => value.toLocaleString()}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="total_users" stackId="a" fill="#0088FE" name="Total Users" />
                        <Bar dataKey="verified_users" stackId="a" fill="#00C49F" name="Verified Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Program Distribution */}
              {metrics.programStats && metrics.programStats.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Top Programs by User Count</h4>
                  <div className="w-full" style={{ minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={metrics.programStats.slice(0, 10)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: 'Users', position: 'insideBottom', offset: -5 }} />
                        <YAxis 
                          dataKey="program_name" 
                          type="category" 
                          width={200}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => value.toLocaleString()}
                          labelFormatter={(label) => label}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="total_users" fill="#8884d8" name="Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Study Year Distribution */}
              {metrics.studyYearDistribution && metrics.studyYearDistribution.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Study Year Distribution</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={metrics.studyYearDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="study_year" 
                            label={{ value: 'Study Year', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis label={{ value: 'Students', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="count" fill="#FF8042" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={metrics.studyYearDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ study_year, percent }) => `Year ${study_year}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {metrics.studyYearDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-100">Insights</p>
                    <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                      The platform footprint shows where users come from geographically (universities) and academically 
                      (programs, study years). This distribution is meaningful to universities and municipalities as it 
                      demonstrates platform adoption across different institutions and academic levels. A diverse footprint 
                      indicates broad appeal and successful onboarding across multiple institutions. Concentration in 
                      specific universities or programs may suggest targeted growth opportunities or successful partnership 
                      initiatives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Activity & Growth */}
      {conversionFunnel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Match Activity & Momentum
            </CardTitle>
            <CardDescription>
              Match generation trends and conversion metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Match Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Matches</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(conversionFunnel.totalMatches ?? 0).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Matches (Last 7 Days)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{(conversionFunnel.matchesLast7Days ?? 0).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Agreements</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{(conversionFunnel.totalAgreements ?? 0).toLocaleString()}</p>
                  {conversionFunnel.totalAgreements === 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">Feature coming soon</p>
                  )}
                </div>
              </div>

              {/* Funnel Steps with Drop-offs */}
              {conversionFunnel.funnelSteps && conversionFunnel.funnelSteps.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Conversion Funnel with Drop-offs</h4>
                  <div className="space-y-4">
                    {conversionFunnel.funnelSteps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{step.step}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{step.count.toLocaleString()} users</span>
                            {step.dropOffRate > 0 && (
                              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {step.dropOffRate.toFixed(1)}% drop-off
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(step.count / conversionFunnel.funnelSteps[0].count) * 100}%` }}
                          />
                        </div>
                        {index < conversionFunnel.funnelSteps.length - 1 && (
                          <div className="text-center text-xs text-muted-foreground py-1">
                            ↓ {step.dropOff.toLocaleString()} dropped off
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Match Activity Trend */}
              {conversionFunnel.weeklyConversion && conversionFunnel.weeklyConversion.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Weekly Match Activity Trend</h4>
                  <div className="w-full" style={{ minHeight: '350px' }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={conversionFunnel.weeklyConversion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="matchGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="week" 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          label={{ value: 'Matches', angle: -90, position: 'insideLeft' }}
                          domain={[0, 'dataMax + 5']}
                        />
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Matches']}
                          labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="matches" 
                          stroke="#0088FE" 
                          fill="url(#matchGradient)"
                          strokeWidth={2}
                          name="Matches"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-green-900 dark:text-green-100">Insights</p>
                    <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                      Match activity represents the number of match suggestions generated by the platform's algorithm. 
                      The weekly trend shows whether match generation is increasing, indicating growing user engagement and 
                      platform momentum. Higher match counts suggest more opportunities for users to connect. 
                      {conversionFunnel.totalAgreements === 0 && (
                        <> Agreement tracking will be available once the agreement feature is fully implemented, 
                        allowing us to measure conversion from matches to finalized roommate arrangements.</>
                      )}
                      {conversionFunnel.totalAgreements > 0 && (
                        <> The conversion rate from matches to agreements ({conversionFunnel.conversionRate}%) 
                        indicates how effectively matches translate into committed roommate relationships.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Lifecycle & Engagement */}
      {userLifecycle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Lifecycle & Engagement
            </CardTitle>
            <CardDescription>
              User distribution across lifecycle stages and engagement trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Lifecycle Stages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                {Object.entries(userLifecycle.lifecycleStage).map(([stage, count], index) => {
                  const colors = [
                    { bg: 'from-blue-50 to-cyan-50', darkBg: 'dark:from-blue-900/20 dark:to-cyan-900/20', border: 'border-blue-200/50 dark:border-blue-800/50', text: 'text-blue-600 dark:text-blue-400', label: 'text-blue-700 dark:text-blue-300' },
                    { bg: 'from-green-50 to-emerald-50', darkBg: 'dark:from-green-900/20 dark:to-emerald-900/20', border: 'border-green-200/50 dark:border-green-800/50', text: 'text-green-600 dark:text-green-400', label: 'text-green-700 dark:text-green-300' },
                    { bg: 'from-yellow-50 to-amber-50', darkBg: 'dark:from-yellow-900/20 dark:to-amber-900/20', border: 'border-yellow-200/50 dark:border-yellow-800/50', text: 'text-yellow-600 dark:text-yellow-400', label: 'text-yellow-700 dark:text-yellow-300' },
                    { bg: 'from-orange-50 to-red-50', darkBg: 'dark:from-orange-900/20 dark:to-red-900/20', border: 'border-orange-200/50 dark:border-orange-800/50', text: 'text-orange-600 dark:text-orange-400', label: 'text-orange-700 dark:text-orange-300' },
                    { bg: 'from-purple-50 to-violet-50', darkBg: 'dark:from-purple-900/20 dark:to-violet-900/20', border: 'border-purple-200/50 dark:border-purple-800/50', text: 'text-purple-600 dark:text-purple-400', label: 'text-purple-700 dark:text-purple-300' },
                  ]
                  const color = colors[index % colors.length]
                  return (
                    <div key={stage} className={`p-4 md:p-5 bg-gradient-to-br ${color.bg} ${color.darkBg} rounded-xl border ${color.border} text-center shadow-sm hover:shadow-md transition-shadow`}>
                      <p className={`text-xs md:text-sm font-medium ${color.label} mb-2 capitalize`}>{stage}</p>
                      <p className={`text-2xl md:text-3xl font-bold ${color.text}`}>{count.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>

              {/* Stacked Bar Chart */}
              <div className="mt-6">
                <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Lifecycle Distribution</h4>
                <div className="w-full" style={{ minHeight: '350px' }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={[{ ...userLifecycle.lifecycleStage }]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis hide />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="signup" stackId="a" fill="#0088FE" name="Signup" />
                      <Bar dataKey="onboarding" stackId="a" fill="#00C49F" name="Onboarding" />
                      <Bar dataKey="active" stackId="a" fill="#FFBB28" name="Active" />
                      <Bar dataKey="engaged" stackId="a" fill="#FF8042" name="Engaged" />
                      <Bar dataKey="churned" stackId="a" fill="#8884d8" name="Churned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Engagement Trend */}
              {userLifecycle.engagementTrend && userLifecycle.engagementTrend.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Engagement Score Trend</h4>
                  <div className="w-full" style={{ minHeight: '350px' }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={userLifecycle.engagementTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                          domain={[0, 'dataMax + 10']}
                        />
                        <Tooltip 
                          formatter={(value: number) => [value.toFixed(1), 'Engagement Score']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Engagement Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Engagement Score</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(userLifecycle.engagementScore ?? 0).toFixed(1)}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Avg Session Duration</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.round(userLifecycle.averageSessionDuration ?? 0)}m</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Avg Sessions/User</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{(userLifecycle.averageSessionsPerUser ?? 0).toFixed(1)}</p>
                </div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                    <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-orange-900 dark:text-orange-100">Insights</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                      The lifecycle stages represent user progression: <strong className="font-semibold">Signup</strong> (new registrations), 
                      <strong className="font-semibold"> Onboarding</strong> (completing profile/questionnaire), <strong className="font-semibold">Active</strong> (regular platform usage), 
                      <strong className="font-semibold"> Engaged</strong> (high-frequency interactions), and <strong className="font-semibold">Churned</strong> (inactive users). 
                      The engagement score aggregates user activity levels, session duration, and feature usage. 
                      An upward trend in engagement indicates improving product-market fit and user satisfaction. 
                      High churn relative to active users may signal retention challenges requiring intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security & Safety Pulse */}
      {security && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Safety Pulse
            </CardTitle>
            <CardDescription>
              Security event monitoring and incident tracking (last 14 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Totals */}
              {security.totals && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                  <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm font-medium text-red-700 dark:text-red-300 mb-2">Failed Logins</p>
                    <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">{(security.totals.failed_login ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Suspicious Activity</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{(security.totals.suspicious_activity ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-yellow-50 to-lime-50 dark:from-yellow-900/20 dark:to-lime-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">RLS Violations</p>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{(security.totals.rls_violation ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Verification Failures</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{(security.totals.verification_failure ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Rate Limit Exceeded</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">{(security.totals.rate_limit_exceeded ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Stacked Bar Chart */}
              {security.timeSeries && security.timeSeries.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Security Events Timeline</h4>
                  <div className="w-full" style={{ minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={security.timeSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis label={{ value: 'Events', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = {
                            failed_login: 'Failed Logins',
                            suspicious_activity: 'Suspicious Activity',
                            rls_violation: 'RLS Violations',
                            verification_failure: 'Verification Failures',
                            rate_limit_exceeded: 'Rate Limit Exceeded'
                          }
                          return [value.toLocaleString(), labels[name] || name]
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="failed_login" stackId="a" fill="#ef4444" name="Failed Logins" />
                      <Bar dataKey="suspicious_activity" stackId="a" fill="#f97316" name="Suspicious Activity" />
                      <Bar dataKey="rls_violation" stackId="a" fill="#eab308" name="RLS Violations" />
                      <Bar dataKey="verification_failure" stackId="a" fill="#3b82f6" name="Verification Failures" />
                        <Bar dataKey="rate_limit_exceeded" stackId="a" fill="#a855f7" name="Rate Limit Exceeded" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="mt-6 p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-red-900 dark:text-red-100">Insights</p>
                    <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                      Security events are categorized by severity: <strong className="font-semibold">Failed Logins</strong> may indicate brute-force attempts or forgotten credentials. 
                      <strong className="font-semibold"> Suspicious Activity</strong> includes anomalous user behavior patterns. <strong className="font-semibold">RLS Violations</strong> represent unauthorized 
                      data access attempts. <strong className="font-semibold">Verification Failures</strong> track identity verification issues. 
                      <strong className="font-semibold"> Rate Limit Exceeded</strong> events indicate potential abuse or automated attacks. 
                      Consistent monitoring of these metrics enables proactive threat detection and response. 
                      Spikes in high-severity events (suspicious activity, RLS violations) require immediate investigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programme Coverage Snapshot */}
      {coverage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Programme Coverage Snapshot
            </CardTitle>
            <CardDescription>
              Coverage status across institutions and degree levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Complete</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{(coverage.completeInstitutions ?? 0).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Incomplete</p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{(coverage.incompleteInstitutions ?? 0).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Missing</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">{(coverage.missingInstitutions ?? 0).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Programmes</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{(coverage.totalProgrammes ?? 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Coverage Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Coverage</span>
                  <span className="font-medium">
                    {coverage.totalInstitutions > 0 
                      ? ((coverage.completeInstitutions / coverage.totalInstitutions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ 
                      width: `${coverage.totalInstitutions > 0 
                        ? (coverage.completeInstitutions / coverage.totalInstitutions) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Institution Status Chart */}
              {coverage.institutions && coverage.institutions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Institution Programme Coverage</h4>
                  <div className="w-full" style={{ minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={coverage.institutions.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="label" 
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        tick={{ fontSize: 10 }}
                        interval={0}
                        width={150}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(label) => label}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="totalProgrammes" fill="#8884d8" name="Total Programmes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-indigo-900 dark:text-indigo-100">Insights</p>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                      Programme coverage indicates the completeness of onboarding data across institutions. 
                      <strong className="font-semibold"> Complete</strong> institutions have all required degree levels (bachelor, premaster, master) populated. 
                      <strong className="font-semibold"> Incomplete</strong> institutions are missing some degree levels but have partial coverage. 
                      <strong className="font-semibold"> Missing</strong> institutions lack programme data entirely. Higher coverage percentages indicate 
                      better onboarding completeness, enabling more accurate matching algorithms. Gaps in coverage may limit 
                      match quality for users from affected institutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cohort Retention Snapshot */}
      {cohortRetention && cohortRetention.cohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Retention Snapshot
            </CardTitle>
            <CardDescription>
              User retention rates by cohort over time (Day 1, 7, 30, 90) - demonstrates platform stickiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Average Retention - Sparklines Style */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Day 1 Retention</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">{(cohortRetention.averageRetention.day1 ?? 0)}%</p>
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height={48}>
                      <LineChart data={cohortRetention.cohorts}>
                        <Line 
                          type="monotone" 
                          dataKey="day1Retention" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300 mb-2">Day 7 Retention</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">{(cohortRetention.averageRetention.day7 ?? 0)}%</p>
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height={48}>
                      <LineChart data={cohortRetention.cohorts}>
                        <Line 
                          type="monotone" 
                          dataKey="day7Retention" 
                          stroke="#00C49F" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Day 30 Retention</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-3">{(cohortRetention.averageRetention.day30 ?? 0)}%</p>
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height={48}>
                      <LineChart data={cohortRetention.cohorts}>
                        <Line 
                          type="monotone" 
                          dataKey="day30Retention" 
                          stroke="#FFBB28" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs md:text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Day 90 Retention</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-3">{(cohortRetention.averageRetention.day90 ?? 0)}%</p>
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height={48}>
                      <LineChart data={cohortRetention.cohorts}>
                        <Line 
                          type="monotone" 
                          dataKey="day90Retention" 
                          stroke="#FF8042" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Retention Trend Chart */}
              <div className="mt-6">
                <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">Retention Trends by Cohort</h4>
                <div className="w-full" style={{ minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={cohortRetention.cohorts} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="cohortDate" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        label={{ value: 'Retention (%)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Retention']}
                        labelFormatter={(label) => `Cohort: ${new Date(label).toLocaleDateString()}`}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="day1Retention" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Day 1"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="day7Retention" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Day 7"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="day30Retention" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Day 30"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="day90Retention" 
                        stroke="#FF8042" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Day 90"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cohort Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort Date</th>
                      <th className="text-right p-2">Cohort Size</th>
                      <th className="text-right p-2">Day 1</th>
                      <th className="text-right p-2">Day 7</th>
                      <th className="text-right p-2">Day 30</th>
                      <th className="text-right p-2">Day 90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortRetention.cohorts.map((cohort, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{new Date(cohort.cohortDate).toLocaleDateString()}</td>
                        <td className="text-right p-2">{cohort.cohortSize}</td>
                        <td className="text-right p-2">{cohort.day1Retention}%</td>
                        <td className="text-right p-2">{cohort.day7Retention}%</td>
                        <td className="text-right p-2">{cohort.day30Retention}%</td>
                        <td className="text-right p-2">{cohort.day90Retention}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                    <UserCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2 text-teal-900 dark:text-teal-100">Insights</p>
                    <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
                      Retention metrics prove platform stickiness without requiring housing or agreement data. 
                      <strong className="font-semibold"> Day 1 retention</strong> indicates initial product engagement and onboarding success. 
                      <strong className="font-semibold"> Day 7 retention</strong> reflects early value realization. <strong className="font-semibold">Day 30 retention</strong> 
                      suggests habit formation and platform stickiness. <strong className="font-semibold">Day 90 retention</strong> demonstrates 
                      long-term user commitment. Improving retention trends across cohorts indicate successful onboarding 
                      improvements, feature adoption, or product-market fit enhancements. These metrics are valuable for 
                      investors and universities as they demonstrate user engagement and platform value independent of 
                      transaction completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
