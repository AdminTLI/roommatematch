// Admin Dashboard - University Admin Console

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  UserCheck,
  Shield,
  BarChart3,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { User } from '@supabase/supabase-js'

// Mock data for demo purposes
const mockStats = {
  total_users: 1247,
  active_users: 892,
  verified_users: 1201,
  pending_verifications: 46,
  total_matches: 2341,
  active_chats: 567,
  reports_received: 23,
  reports_resolved: 19,
  housing_listings: 89,
  university_partners: 14
}

const mockReports = [
  {
    id: '1',
    reporter_id: 'user-123',
    reported_user_id: 'user-456',
    report_type: 'inappropriate_behavior',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    description: 'User sent inappropriate messages in chat',
    reporter_name: 'Sarah M.',
    reported_user_name: 'John D.',
    reporter_university: 'University of Amsterdam',
    reported_user_university: 'University of Amsterdam'
  },
  {
    id: '2',
    reporter_id: 'user-789',
    reported_user_id: 'user-101',
    report_type: 'fake_profile',
    status: 'resolved',
    created_at: '2024-01-14T15:45:00Z',
    description: 'Profile photos appear to be fake or stock images',
    reporter_name: 'Alex K.',
    reported_user_name: 'Mike R.',
    reporter_university: 'Delft University of Technology',
    reported_user_university: 'Delft University of Technology'
  },
  {
    id: '3',
    reporter_id: 'user-202',
    reported_user_id: 'user-303',
    report_type: 'spam',
    status: 'pending',
    created_at: '2024-01-13T09:15:00Z',
    description: 'User is sending spam messages to multiple people',
    reporter_name: 'Emma L.',
    reported_user_name: 'David S.',
    reporter_university: 'Erasmus University Rotterdam',
    reported_user_university: 'Erasmus University Rotterdam'
  }
]

const mockUsers = [
  {
    id: 'user-123',
    email: 'sarah.m@student.uva.nl',
    first_name: 'Sarah',
    last_name: 'Miller',
    university: 'University of Amsterdam',
    verification_status: 'verified',
    created_at: '2024-01-10T08:30:00Z',
    last_active: '2024-01-15T14:20:00Z',
    profile_completeness: 95,
    total_matches: 12,
    is_active: true
  },
  {
    id: 'user-456',
    email: 'john.d@student.uva.nl',
    first_name: 'John',
    last_name: 'Doe',
    university: 'University of Amsterdam',
    verification_status: 'pending',
    created_at: '2024-01-12T16:45:00Z',
    last_active: '2024-01-15T12:10:00Z',
    profile_completeness: 78,
    total_matches: 5,
    is_active: true
  },
  {
    id: 'user-789',
    email: 'alex.k@student.tudelft.nl',
    first_name: 'Alex',
    last_name: 'Kowalski',
    university: 'Delft University of Technology',
    verification_status: 'verified',
    created_at: '2024-01-08T11:20:00Z',
    last_active: '2024-01-15T16:30:00Z',
    profile_completeness: 88,
    total_matches: 18,
    is_active: true
  }
]

const mockAnnouncements = [
  {
    id: '1',
    title: 'New Housing Partnership',
    content: 'We\'ve partnered with 5 new housing providers in Amsterdam!',
    type: 'info',
    created_at: '2024-01-15T09:00:00Z',
    is_active: true
  },
  {
    id: '2',
    title: 'Maintenance Window',
    content: 'Scheduled maintenance on Sunday 2-4 AM',
    type: 'warning',
    created_at: '2024-01-14T15:30:00Z',
    is_active: true
  },
  {
    id: '3',
    title: 'New Features Available',
    content: 'Video introductions and enhanced matching are now live!',
    type: 'success',
    created_at: '2024-01-13T12:00:00Z',
    is_active: true
  }
]

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(mockStats)
  const [reports, setReports] = useState(mockReports)
  const [users, setUsers] = useState(mockUsers)
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        // TODO: Check if user has admin role
        // For demo purposes, allow access
        setUser(user)

        // TODO: Load real admin data from Supabase
        // const adminStats = await getAdminStats()
        // const adminReports = await getAdminReports()
        // const adminUsers = await getAdminUsers()
        // const adminAnnouncements = await getAdminAnnouncements()
        // setStats(adminStats)
        // setReports(adminReports)
        // setUsers(adminUsers)
        // setAnnouncements(adminAnnouncements)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleResolveReport = (reportId: string) => {
    // TODO: Implement report resolution
    console.log('Resolve report:', reportId)
  }

  const handleDismissReport = (reportId: string) => {
    // TODO: Implement report dismissal
    console.log('Dismiss report:', reportId)
  }

  const handleVerifyUser = (userId: string) => {
    // TODO: Implement user verification
    console.log('Verify user:', userId)
  }

  const handleSuspendUser = (userId: string) => {
    // TODO: Implement user suspension
    console.log('Suspend user:', userId)
  }

  const handleCreateAnnouncement = () => {
    router.push('/admin/announcements/new')
  }

  const handleEditAnnouncement = (announcementId: string) => {
    router.push(`/admin/announcements/${announcementId}/edit`)
  }

  const handleDeleteAnnouncement = (announcementId: string) => {
    // TODO: Implement announcement deletion
    console.log('Delete announcement:', announcementId)
  }

  const handleRefreshData = () => {
    // TODO: Implement data refresh
    console.log('Refresh admin data')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h1 text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-body-lg text-gray-600 mb-6">
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
    <div className="min-h-screen bg-surface-0">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-body text-gray-600 mt-2">
              Manage your university's roommate matching platform
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/admin/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600">Total Users</p>
                  <p className="text-h2 text-gray-900">{stats.total_users.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-body-xs text-green-600">+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600">Verified Users</p>
                  <p className="text-h2 text-gray-900">{stats.verified_users.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-body-xs text-gray-500">
                  {Math.round((stats.verified_users / stats.total_users) * 100)}% verified
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600">Active Matches</p>
                  <p className="text-h2 text-gray-900">{stats.total_matches.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-body-xs text-green-600">+8% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600">Pending Reports</p>
                  <p className="text-h2 text-gray-900">{stats.reports_received - stats.reports_resolved}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-body-xs text-gray-500">
                  {stats.reports_resolved} resolved
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-gray-900">New user registered</p>
                          <p className="text-body-xs text-gray-500">Sarah Miller from UvA</p>
                        </div>
                      </div>
                      <span className="text-body-xs text-gray-500">2 min ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-gray-900">User verified</p>
                          <p className="text-body-xs text-gray-500">John Doe completed verification</p>
                        </div>
                      </div>
                      <span className="text-body-xs text-gray-500">5 min ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-gray-900">New match created</p>
                          <p className="text-body-xs text-gray-500">Alex & Emma matched</p>
                        </div>
                      </div>
                      <span className="text-body-xs text-gray-500">10 min ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reports')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Review Reports ({stats.reports_received - stats.reports_resolved})
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('users')}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateAnnouncement}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-body-sm font-medium text-gray-700">
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-body-xs text-gray-500">{user.email}</p>
                          <p className="text-body-xs text-gray-500">{user.university}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={user.verification_status === 'verified' ? 'default' : 'secondary'}>
                            {user.verification_status}
                          </Badge>
                          <p className="text-body-xs text-gray-500 mt-1">
                            {user.profile_completeness}% complete
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {user.verification_status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleVerifyUser(user.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => router.push(`/admin/users/${user.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSuspendUser(user.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    User Reports
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline">
                              {report.report_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-body-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-body-sm text-gray-900 mb-2">
                            {report.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-xs text-gray-500">
                            <div>
                              <p><strong>Reporter:</strong> {report.reporter_name} ({report.reporter_university})</p>
                              <p><strong>Reported:</strong> {report.reported_user_name} ({report.reported_user_university})</p>
                            </div>
                          </div>
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" onClick={() => handleResolveReport(report.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDismissReport(report.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Announcements
                  </CardTitle>
                  <Button onClick={handleCreateAnnouncement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={announcement.type === 'success' ? 'default' : announcement.type === 'warning' ? 'destructive' : 'secondary'}>
                              {announcement.type}
                            </Badge>
                            <Badge variant={announcement.is_active ? 'default' : 'outline'}>
                              {announcement.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-body-xs text-gray-500">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 className="text-body-sm font-medium text-gray-900 mb-1">
                            {announcement.title}
                          </h3>
                          <p className="text-body-xs text-gray-600">
                            {announcement.content}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEditAnnouncement(announcement.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}