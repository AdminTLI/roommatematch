// Admin Dashboard - Community Pulse Dashboard for Admins

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminMetricsGrid, AdminMetricsSummary, AdminMetricFilter } from '@/app/(components)/admin-metrics-card'
import { AdminAnomalyList, AdminAnomalyStats } from '@/app/(components)/admin-anomaly-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Heart,
  Shield,
  Home,
  Star,
  Activity,
  Eye,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Calendar
} from 'lucide-react'
import { 
  getDemoAnalyticsMetrics, 
  getDemoAnalyticsAnomalies, 
  getDemoConflictHotspots 
} from '@/lib/admin/utils'
import type { 
  DashboardData,
  DashboardMetric,
  AnalyticsAnomaly,
  ConflictHotspot
} from '@/lib/admin/types'
import { User } from '@supabase/supabase-js'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [anomalies, setAnomalies] = useState<AnalyticsAnomaly[]>([])
  const [hotspots, setHotspots] = useState<ConflictHotspot[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [periodDays, setPeriodDays] = useState(30)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        // Check if user is admin
        // TODO: Implement proper admin check
        if (user.id !== 'demo-admin-id') {
          router.push('/')
          return
        }

        setUser(user)

        // For demo purposes, use demo data
        if (user.id === 'demo-admin-id') {
          const demoMetrics = getDemoAnalyticsMetrics()
          const demoAnomalies = getDemoAnalyticsAnomalies()
          const demoHotspots = getDemoConflictHotspots()
          
          setMetrics(demoMetrics.map(metric => ({
            id: metric.id,
            name: metric.metric_name,
            value: metric.metric_value,
            previous_value: metric.previous_value,
            target_value: metric.target_value,
            unit: metric.unit,
            change_percentage: metric.previous_value 
              ? ((metric.metric_value - metric.previous_value) / metric.previous_value) * 100
              : 0,
            trend: metric.metric_value > (metric.previous_value || 0) ? 'up' : 'down',
            status: metric.metric_value > (metric.target_value || 0) * 0.9 ? 'good' : 'warning',
            category: metric.metric_category
          })))
          
          setAnomalies(demoAnomalies)
          setHotspots(demoHotspots)
          
          // Create mock dashboard data
          const mockDashboardData: DashboardData = {
            metrics: [],
            charts: [],
            alerts: demoAnomalies,
            trends: [],
            summary: {
              total_users: 1250,
              active_users: 890,
              new_signups: 45,
              total_matches: 234,
              successful_matches: 189,
              safety_incidents: 12,
              housing_listings: 156,
              average_satisfaction: 4.2,
              key_insights: [
                'User engagement increased by 15% this month',
                'Matching success rate is 87%',
                '3 critical safety hotspots identified'
              ],
              critical_alerts: 3
            }
          }
          setDashboardData(mockDashboardData)
        } else {
          // TODO: Load real data from Supabase
          // const realDashboardData = await getDashboardData(undefined, periodDays)
          // setDashboardData(realDashboardData)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, periodDays])

  const handleAcknowledgeAnomaly = (id: string) => {
    // TODO: Implement acknowledge anomaly
    console.log('Acknowledge anomaly:', id)
  }

  const handleResolveAnomaly = (id: string) => {
    // TODO: Implement resolve anomaly
    console.log('Resolve anomaly:', id)
  }

  const handleInvestigateAnomaly = (id: string) => {
    // TODO: Implement investigate anomaly
    console.log('Investigate anomaly:', id)
  }

  const handleRefreshData = () => {
    // TODO: Implement data refresh
    console.log('Refreshing dashboard data...')
  }

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting dashboard data...')
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Admin access required.
          </p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard">
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1 text-ink-900 mb-2">
                Community Pulse Dashboard
              </h1>
              <p className="text-h4 text-ink-700">
                Advanced analytics and insights for university administrators.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => router.push('/admin/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Key Insights Alert */}
        {dashboardData?.summary.critical_alerts && dashboardData.summary.critical_alerts > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Critical Alerts Require Attention
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {dashboardData.summary.critical_alerts} critical anomalies detected that need immediate review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            {dashboardData?.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {dashboardData.summary.total_users.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Users
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {dashboardData.summary.successful_matches}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Successful Matches
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {dashboardData.summary.safety_incidents}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Safety Incidents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {dashboardData.summary.average_satisfaction.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Avg Satisfaction
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Key Insights */}
            {dashboardData?.summary.key_insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.summary.key_insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {insight}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Anomalies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Recent Anomalies
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('anomalies')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {anomalies.length > 0 ? (
                    <div className="space-y-3">
                      {anomalies.slice(0, 3).map((anomaly) => (
                        <div key={anomaly.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {anomaly.anomaly_type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {anomaly.severity} • {anomaly.status}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(anomaly.detected_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No recent anomalies
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Conflict Hotspots */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Safety Hotspots
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('hotspots')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {hotspots.length > 0 ? (
                    <div className="space-y-3">
                      {hotspots.slice(0, 3).map((hotspot) => (
                        <div key={hotspot.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <Shield className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {hotspot.location_name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {hotspot.total_incidents} incidents • {hotspot.risk_level} risk
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Score: {hotspot.safety_score.toFixed(1)}/10
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No safety hotspots
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AdminMetricFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={periodDays === 7 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodDays(7)}
                >
                  7 Days
                </Button>
                <Button
                  variant={periodDays === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodDays(30)}
                >
                  30 Days
                </Button>
                <Button
                  variant={periodDays === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodDays(90)}
                >
                  90 Days
                </Button>
              </div>
            </div>

            <AdminMetricsSummary metrics={filteredMetrics} />
            <AdminMetricsGrid metrics={filteredMetrics} />
          </TabsContent>
          
          <TabsContent value="anomalies" className="space-y-6">
            <AdminAnomalyStats anomalies={anomalies} />
            <AdminAnomalyList
              anomalies={anomalies}
              onAcknowledge={handleAcknowledgeAnomaly}
              onResolve={handleResolveAnomaly}
              onInvestigate={handleInvestigateAnomaly}
            />
          </TabsContent>
          
          <TabsContent value="hotspots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Conflict & Safety Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hotspots.length > 0 ? (
                  <div className="space-y-4">
                    {hotspots.map((hotspot) => (
                      <div key={hotspot.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {hotspot.location_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {hotspot.location_type.replace('_', ' ')} • {hotspot.total_incidents} incidents
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              'text-lg font-bold',
                              hotspot.risk_level === 'critical' ? 'text-red-600' :
                              hotspot.risk_level === 'high' ? 'text-orange-600' :
                              hotspot.risk_level === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            )}>
                              {hotspot.safety_score.toFixed(1)}/10
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {hotspot.risk_level} risk
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Safety Hotspots
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No conflict or safety hotspots identified.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Reports
                  </CardTitle>
                  <Button onClick={() => router.push('/admin/reports/new')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Reports Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create custom analytics reports for detailed insights.
                  </p>
                  <Button onClick={() => router.push('/admin/reports/new')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}