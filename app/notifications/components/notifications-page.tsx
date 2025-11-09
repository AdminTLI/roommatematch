'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// ScrollArea not available, using div with overflow styling
import { NotificationItem } from '@/app/(components)/notifications/notification-item'
import { Notification, NotificationType, NotificationCounts } from '@/lib/notifications/types'
import { createClient } from '@/lib/supabase/client'
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react'

interface NotificationsPageProps {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
  }
}

export function NotificationsPage({ user }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<NotificationCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all')
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const limit = 20

  // Fetch notifications
  const fetchNotifications = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true)
        setPage(0)
      }

      const offset = reset ? 0 : page * limit
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (selectedTab === 'unread') {
        params.append('is_read', 'false')
      }

      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/notifications/my?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (reset) {
          setNotifications(data.notifications || [])
        } else {
          setNotifications(prev => [...prev, ...(data.notifications || [])])
        }
        
        setHasMore(data.pagination?.has_more || false)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch counts
  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/notifications/count')
      if (response.ok) {
        const data = await response.json()
        setCounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch notification counts:', error)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications(true)
    fetchCounts()

    // Subscribe to notifications changes
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications(true)
          fetchCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  // Refetch when filters change
  useEffect(() => {
    fetchNotifications(true)
  }, [selectedType, selectedTab])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        
        // Update counts
        if (counts) {
          setCounts(prev => prev ? {
            ...prev,
            unread: Math.max(0, prev.unread - 1)
          } : null)
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        
        // Update counts
        if (counts) {
          setCounts(prev => prev ? {
            ...prev,
            unread: 0
          } : null)
        }
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on notification type and metadata
    const { metadata } = notification
    
    switch (notification.type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        } else if (metadata.match_id) {
          router.push('/matches')
        }
        break
      case 'chat_message':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        }
        break
      case 'profile_updated':
        router.push('/settings')
        break
      case 'questionnaire_completed':
        router.push('/matches')
        break
      case 'verification_status':
        router.push('/verify')
        break
      case 'housing_update':
        router.push('/housing')
        break
      case 'agreement_update':
        router.push('/agreements')
        break
      case 'safety_alert':
        router.push('/safety')
        break
      case 'system_announcement':
        // Could navigate to a specific announcement page
        break
      default:
        break
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }

  // Filter notifications by search query
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = counts?.unread || 0
  const totalCount = counts?.total || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Stay updated with your matches, messages, and platform updates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => fetchNotifications(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-sm text-gray-500">Total Notifications</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-gray-500">Unread</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCount - unreadCount}</div>
                <div className="text-sm text-gray-500">Read</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as NotificationType | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="match_created">New Matches</SelectItem>
                <SelectItem value="match_accepted">Match Accepted</SelectItem>
                <SelectItem value="match_confirmed">Match Confirmed</SelectItem>
                <SelectItem value="chat_message">Messages</SelectItem>
                <SelectItem value="profile_updated">Profile Updates</SelectItem>
                <SelectItem value="questionnaire_completed">Questionnaire</SelectItem>
                <SelectItem value="verification_status">Verification</SelectItem>
                <SelectItem value="housing_update">Housing</SelectItem>
                <SelectItem value="agreement_update">Agreements</SelectItem>
                <SelectItem value="safety_alert">Safety</SelectItem>
                <SelectItem value="system_announcement">Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all' | 'unread')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Notifications
            <Badge variant="secondary">{totalCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread
            <Badge variant="destructive">{unreadCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No notifications found' : 'No notifications yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'We\'ll notify you about matches, messages, and updates'
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNotificationClick}
                />
              ))}
              
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.filter(n => !n.is_read).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">
                  You have no unread notifications
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications
                .filter(n => !n.is_read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigate={handleNotificationClick}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
