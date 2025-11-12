'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  FileText,
  Bell
} from 'lucide-react'

interface AdminDashboardProps {
  admin: {
    id: string
    university_id: string
    role: string
    permissions: string[]
  }
}

interface AnalyticsData {
  totalUsers: number
  verifiedUsers: number
  activeChats: number
  totalMatches: number
  reportsPending: number
  coveragePercentage: number
  completeInstitutions: number
  incompleteInstitutions: number
  studyMonthCompleteness: number
  usersWithMissingMonths: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

interface Report {
  id: string
  reporter_name: string
  reported_user_name: string
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    totalUsers: 1247,
    verifiedUsers: 1198,
    activeChats: 89,
    totalMatches: 423,
    reportsPending: 3,
    coveragePercentage: 95,
    completeInstitutions: 19,
    incompleteInstitutions: 1,
    studyMonthCompleteness: 92,
    usersWithMissingMonths: 100,
    recentActivity: [
      {
        id: '1',
        type: 'user_verified',
        description: 'New user completed ID verification',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '2',
        type: 'match_created',
        description: 'New compatibility match created',
        timestamp: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: '3',
        type: 'report_submitted',
        description: 'New report submitted for review',
        timestamp: new Date(Date.now() - 900000).toISOString()
      }
    ]
  }

  // Reports will be loaded from database
  const mockReports: Report[] = []

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Load analytics using RPC
      const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_admin_analytics', {
        p_admin_university_id: admin.university_id
      })

      if (analyticsError) throw analyticsError

      // Load coverage metrics
      const coverageResponse = await fetch('/api/admin/coverage')
      const coverageData = coverageResponse.ok ? await coverageResponse.json() : null

      // Load study month completeness (from API or calculate)
      const studyMonthsResponse = await fetch('/api/admin/metrics/study-months')
      const studyMonthsData = studyMonthsResponse.ok ? await studyMonthsResponse.json() : null

      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          reporter_name,
          reported_user_name,
          reason,
          description,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (reportsError) throw reportsError

      // Transform analytics data
      const transformedAnalytics: AnalyticsData = {
        totalUsers: analyticsData?.[0]?.total_users || 0,
        verifiedUsers: analyticsData?.[0]?.verified_users || 0,
        activeChats: analyticsData?.[0]?.active_chats || 0,
        totalMatches: analyticsData?.[0]?.total_matches || 0,
        reportsPending: analyticsData?.[0]?.reports_pending || 0,
        coveragePercentage: coverageData?.data ? 
          (coverageData.data.completeInstitutions / coverageData.data.totalInstitutions) * 100 : 100,
        completeInstitutions: coverageData?.data?.completeInstitutions || 0,
        incompleteInstitutions: coverageData?.data?.incompleteInstitutions || 0,
        studyMonthCompleteness: studyMonthsData?.data?.percentage || 100,
        usersWithMissingMonths: studyMonthsData?.data?.usersWithMissingMonths || 0,
        recentActivity: [
          {
            id: '1',
            type: 'user_verified',
            description: 'New user completed ID verification',
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: '2',
            type: 'match_created',
            description: 'New compatibility match created',
            timestamp: new Date(Date.now() - 600000).toISOString()
          },
          {
            id: '3',
            type: 'report_submitted',
            description: 'New report submitted for review',
            timestamp: new Date(Date.now() - 900000).toISOString()
          }
        ]
      }

      setAnalytics(transformedAnalytics)
      setReports(reportsData || [])
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Fallback to mock data on error
      setAnalytics(mockAnalytics)
      setReports(mockReports)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: action === 'resolve' ? 'resolved' : 'reviewed',
          resolved_at: new Date().toISOString(),
          resolved_by: admin.user_id
        })
        .eq('id', reportId)

      if (error) throw error
      
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'resolve' ? 'resolved' : 'reviewed' }
            : report
        )
      )
      
    } catch (error) {
      console.error('Failed to update report:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
          Manage your university's roommate matching platform
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{analytics?.verifiedUsers || 0}</div>
                <div className="text-sm text-gray-500">Verified Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{analytics?.activeChats || 0}</div>
                <div className="text-sm text-gray-500">Active Chats</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{analytics?.totalMatches || 0}</div>
                <div className="text-sm text-gray-500">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className={analytics?.coveragePercentage && analytics.coveragePercentage < 90 ? 'border-red-300' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Programme Coverage
              {analytics?.coveragePercentage && analytics.coveragePercentage < 90 && (
                <Badge variant="destructive" className="ml-2">Alert</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coverage Percentage</span>
                <span className={`text-2xl font-bold ${analytics?.coveragePercentage && analytics.coveragePercentage < 90 ? 'text-red-600' : 'text-green-600'}`}>
                  {analytics?.coveragePercentage?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <div>Complete: {analytics?.completeInstitutions || 0}</div>
                <div>Incomplete: {analytics?.incompleteInstitutions || 0}</div>
              </div>
              {analytics?.coveragePercentage && analytics.coveragePercentage < 90 && (
                <p className="text-xs text-red-600 mt-2">
                  Programme coverage is below 90% threshold. Review incomplete institutions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={analytics?.studyMonthCompleteness && analytics.studyMonthCompleteness < 90 ? 'border-red-300' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Study Month Completeness
              {analytics?.studyMonthCompleteness && analytics.studyMonthCompleteness < 90 && (
                <Badge variant="destructive" className="ml-2">Alert</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completeness</span>
                <span className={`text-2xl font-bold ${analytics?.studyMonthCompleteness && analytics.studyMonthCompleteness < 90 ? 'text-red-600' : 'text-green-600'}`}>
                  {(100 - (analytics?.studyMonthCompleteness || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Users with missing months: {analytics?.usersWithMissingMonths || 0}
              </div>
              {analytics?.studyMonthCompleteness && analytics.studyMonthCompleteness < 90 && (
                <p className="text-xs text-red-600 mt-2">
                  {analytics.usersWithMissingMonths} users have missing study month data. Run backfill script.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full md:grid md:grid-cols-4 flex overflow-x-auto gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-shrink-0">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="h-4 w-4" />
            Moderation
            {analytics?.reportsPending && analytics.reportsPending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {analytics.reportsPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 flex-shrink-0">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest activities on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Send Announcement</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">View All Users</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Moderation Queue</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Platform Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Reports for Review
              </CardTitle>
              <CardDescription>
                User reports that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending reports</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.filter(r => r.status === 'pending').map((report) => (
                    <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Report #{report.id}</h4>
                          <p className="text-sm text-gray-500">
                            {report.reporter_name} reported {report.reported_user_name}
                          </p>
                        </div>
                        <Badge variant="destructive">Pending</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm"><strong>Reason:</strong> {report.reason}</p>
                        <p className="text-sm mt-1"><strong>Description:</strong> {report.description}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReportAction(report.id, 'resolve')}
                        >
                          Take Action
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Insights into platform usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics dashboard coming soon</p>
                <p className="text-sm text-gray-400">
                  Detailed charts and metrics will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>University Settings</CardTitle>
              <CardDescription>
                Configure platform settings for your university
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Settings panel coming soon</p>
                <p className="text-sm text-gray-400">
                  Branding, eligibility rules, and announcements will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
