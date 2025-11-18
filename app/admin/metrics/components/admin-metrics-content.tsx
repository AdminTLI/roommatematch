'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Shield, MessageSquare, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, Activity, Lock, BookOpen, UserCheck } from 'lucide-react'
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

export function AdminMetricsContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData | null>(null)
  const [userLifecycle, setUserLifecycle] = useState<UserLifecycleData | null>(null)
  const [security, setSecurity] = useState<SecurityData | null>(null)
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [cohortRetention, setCohortRetention] = useState<CohortRetentionData | null>(null)

  useEffect(() => {
    loadMetrics()
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
        cohortRetentionResponse
      ] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/analytics/conversion-funnel'),
        fetch('/api/admin/analytics/user-lifecycle'),
        fetch('/api/admin/analytics/security'),
        fetch('/api/admin/analytics/coverage'),
        fetch('/api/admin/analytics/cohort-retention')
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
    return <div className="p-6">Loading metrics...</div>
  }

  if (!metrics) {
    return <div className="p-6">Failed to load metrics</div>
  }

  const verificationRate = metrics.totalUsers > 0 
    ? ((metrics.verifiedUsers / metrics.totalUsers) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.signupsLast7Days} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.verifiedUsers.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{metrics.activeChats.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{metrics.totalMatches.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.matchActivity} this week
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
        <CardContent>
          <div className="space-y-6">
            {/* Verification Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">Verified Users</p>
                </div>
                <p className="text-2xl font-bold">{metrics.verifiedUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{verificationRate}% verification rate</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium">Unverified</p>
                </div>
                <p className="text-2xl font-bold">{(metrics.totalUsers - metrics.verifiedUsers).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium">Pending Reports</p>
                </div>
                <p className="text-2xl font-bold">{metrics.reportsPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires review</p>
              </div>
            </div>

            {/* Security Events Summary */}
            {security && (
              <div>
                <h4 className="text-sm font-medium mb-3">Security Events (Last 14 Days)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Failed Logins</p>
                    <p className="text-xl font-bold">{security.totals.failed_login}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Suspicious Activity</p>
                    <p className="text-xl font-bold">{security.totals.suspicious_activity}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">RLS Violations</p>
                    <p className="text-xl font-bold">{security.totals.rls_violation}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Verification Failures</p>
                    <p className="text-xl font-bold">{security.totals.verification_failure}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Rate Limit Exceeded</p>
                    <p className="text-xl font-bold">{security.totals.rate_limit_exceeded}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium mb-2">Interpretation:</p>
              <p className="text-sm text-muted-foreground">
                The verification rate ({verificationRate}%) indicates the percentage of users who have completed 
                identity verification, establishing trust in the platform. Combined with security event monitoring, 
                this demonstrates our commitment to maintaining a safe environment for students. Low security event 
                counts relative to user base indicate effective platform security measures. High verification rates 
                coupled with low security incidents signal strong trust and safety protocols.
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">New Users (7 days)</p>
              <p className="text-2xl font-bold">{metrics.signupsLast7Days}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Users (30 days)</p>
              <p className="text-2xl font-bold">{metrics.signupsLast30Days}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Match Activity (7 days)</p>
              <p className="text-2xl font-bold">{metrics.matchActivity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <div>
                  <h4 className="text-sm font-medium mb-3">Users by University</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.universityStats.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="university_name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar dataKey="total_users" stackId="a" fill="#0088FE" name="Total Users" />
                      <Bar dataKey="verified_users" stackId="a" fill="#00C49F" name="Verified Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Program Distribution */}
              {metrics.programStats && metrics.programStats.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Programs by User Count</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.programStats.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" label={{ value: 'Users', position: 'insideBottom', offset: -5 }} />
                      <YAxis 
                        dataKey="program_name" 
                        type="category" 
                        width={180}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(label) => label}
                      />
                      <Legend />
                      <Bar dataKey="total_users" fill="#8884d8" name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Study Year Distribution */}
              {metrics.studyYearDistribution && metrics.studyYearDistribution.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Study Year Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metrics.studyYearDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="study_year" 
                          label={{ value: 'Study Year', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Students', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="count" fill="#FF8042" name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={metrics.studyYearDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ study_year, percent }) => `Year ${study_year}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {metrics.studyYearDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
                  The platform footprint shows where users come from geographically (universities) and academically 
                  (programs, study years). This distribution is meaningful to universities and municipalities as it 
                  demonstrates platform adoption across different institutions and academic levels. A diverse footprint 
                  indicates broad appeal and successful onboarding across multiple institutions. Concentration in 
                  specific universities or programs may suggest targeted growth opportunities or successful partnership 
                  initiatives.
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Matches</p>
                  <p className="text-3xl font-bold">{conversionFunnel.totalMatches.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Matches (Last 7 Days)</p>
                  <p className="text-3xl font-bold">{conversionFunnel.matchesLast7Days.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Agreements</p>
                  <p className="text-3xl font-bold">{conversionFunnel.totalAgreements.toLocaleString()}</p>
                  {conversionFunnel.totalAgreements === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Feature coming soon</p>
                  )}
                </div>
              </div>

              {/* Weekly Match Activity Trend */}
              {conversionFunnel.weeklyConversion && conversionFunnel.weeklyConversion.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Weekly Match Activity Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={conversionFunnel.weeklyConversion}>
                      <defs>
                        <linearGradient id="matchGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        label={{ value: 'Matches', angle: -90, position: 'insideLeft' }}
                        domain={[0, 'dataMax + 5']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Matches']}
                        labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
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
              )}

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(userLifecycle.lifecycleStage).map(([stage, count]) => (
                  <div key={stage} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{stage}</p>
                    <p className="text-2xl font-bold">{count.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Stacked Bar Chart */}
              <div>
                <h4 className="text-sm font-medium mb-3">Lifecycle Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[{ ...userLifecycle.lifecycleStage }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis hide />
                    <YAxis />
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="signup" stackId="a" fill="#0088FE" name="Signup" />
                    <Bar dataKey="onboarding" stackId="a" fill="#00C49F" name="Onboarding" />
                    <Bar dataKey="active" stackId="a" fill="#FFBB28" name="Active" />
                    <Bar dataKey="engaged" stackId="a" fill="#FF8042" name="Engaged" />
                    <Bar dataKey="churned" stackId="a" fill="#8884d8" name="Churned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Trend */}
              {userLifecycle.engagementTrend && userLifecycle.engagementTrend.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Engagement Score Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={userLifecycle.engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                        domain={[0, 'dataMax + 10']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(1), 'Engagement Score']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Engagement Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Engagement Score</p>
                  <p className="text-2xl font-bold">{userLifecycle.engagementScore.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Session Duration</p>
                  <p className="text-2xl font-bold">{Math.round(userLifecycle.averageSessionDuration)}m</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Sessions/User</p>
                  <p className="text-2xl font-bold">{userLifecycle.averageSessionsPerUser.toFixed(1)}</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
                  The lifecycle stages represent user progression: <strong>Signup</strong> (new registrations), 
                  <strong>Onboarding</strong> (completing profile/questionnaire), <strong>Active</strong> (regular platform usage), 
                  <strong>Engaged</strong> (high-frequency interactions), and <strong>Churned</strong> (inactive users). 
                  The engagement score aggregates user activity levels, session duration, and feature usage. 
                  An upward trend in engagement indicates improving product-market fit and user satisfaction. 
                  High churn relative to active users may signal retention challenges requiring intervention.
                </p>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Failed Logins</p>
                  <p className="text-2xl font-bold">{security.totals.failed_login.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Suspicious Activity</p>
                  <p className="text-2xl font-bold">{security.totals.suspicious_activity.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">RLS Violations</p>
                  <p className="text-2xl font-bold">{security.totals.rls_violation.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Verification Failures</p>
                  <p className="text-2xl font-bold">{security.totals.verification_failure.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Rate Limit Exceeded</p>
                  <p className="text-2xl font-bold">{security.totals.rate_limit_exceeded.toLocaleString()}</p>
                </div>
              </div>

              {/* Stacked Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={security.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
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
                  />
                  <Legend />
                  <Bar dataKey="failed_login" stackId="a" fill="#ef4444" name="Failed Logins" />
                  <Bar dataKey="suspicious_activity" stackId="a" fill="#f97316" name="Suspicious Activity" />
                  <Bar dataKey="rls_violation" stackId="a" fill="#eab308" name="RLS Violations" />
                  <Bar dataKey="verification_failure" stackId="a" fill="#3b82f6" name="Verification Failures" />
                  <Bar dataKey="rate_limit_exceeded" stackId="a" fill="#a855f7" name="Rate Limit Exceeded" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
                  Security events are categorized by severity: <strong>Failed Logins</strong> may indicate brute-force attempts or forgotten credentials. 
                  <strong>Suspicious Activity</strong> includes anomalous user behavior patterns. <strong>RLS Violations</strong> represent unauthorized 
                  data access attempts. <strong>Verification Failures</strong> track identity verification issues. 
                  <strong>Rate Limit Exceeded</strong> events indicate potential abuse or automated attacks. 
                  Consistent monitoring of these metrics enables proactive threat detection and response. 
                  Spikes in high-severity events (suspicious activity, RLS violations) require immediate investigation.
                </p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Complete</p>
                  <p className="text-2xl font-bold">{coverage.completeInstitutions}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Incomplete</p>
                  <p className="text-2xl font-bold">{coverage.incompleteInstitutions}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Missing</p>
                  <p className="text-2xl font-bold">{coverage.missingInstitutions}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Programmes</p>
                  <p className="text-2xl font-bold">{coverage.totalProgrammes.toLocaleString()}</p>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coverage.institutions.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => value.toLocaleString()}
                    labelFormatter={(label) => label}
                  />
                  <Legend />
                  <Bar dataKey="totalProgrammes" fill="#8884d8" name="Total Programmes" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
                  Programme coverage indicates the completeness of onboarding data across institutions. 
                  <strong>Complete</strong> institutions have all required degree levels (bachelor, premaster, master) populated. 
                  <strong>Incomplete</strong> institutions are missing some degree levels but have partial coverage. 
                  <strong>Missing</strong> institutions lack programme data entirely. Higher coverage percentages indicate 
                  better onboarding completeness, enabling more accurate matching algorithms. Gaps in coverage may limit 
                  match quality for users from affected institutions.
                </p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Day 1 Retention</p>
                  <p className="text-3xl font-bold mb-2">{cohortRetention.averageRetention.day1}%</p>
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
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Day 7 Retention</p>
                  <p className="text-3xl font-bold mb-2">{cohortRetention.averageRetention.day7}%</p>
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
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Day 30 Retention</p>
                  <p className="text-3xl font-bold mb-2">{cohortRetention.averageRetention.day30}%</p>
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
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Day 90 Retention</p>
                  <p className="text-3xl font-bold mb-2">{cohortRetention.averageRetention.day90}%</p>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cohortRetention.cohorts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="cohortDate" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Retention (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Retention']}
                    labelFormatter={(label) => `Cohort: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Legend />
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

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm text-muted-foreground">
                  Retention metrics prove platform stickiness without requiring housing or agreement data. 
                  <strong>Day 1 retention</strong> indicates initial product engagement and onboarding success. 
                  <strong>Day 7 retention</strong> reflects early value realization. <strong>Day 30 retention</strong> 
                  suggests habit formation and platform stickiness. <strong>Day 90 retention</strong> demonstrates 
                  long-term user commitment. Improving retention trends across cohorts indicate successful onboarding 
                  improvements, feature adoption, or product-market fit enhancements. These metrics are valuable for 
                  investors and universities as they demonstrate user engagement and platform value independent of 
                  transaction completion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
