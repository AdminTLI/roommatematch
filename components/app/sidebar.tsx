'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  MessageCircle, 
  Home,
  Award,
  FileText,
  Calendar,
  Shield,
  BarChart3,
  Video,
  Settings,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  onClose?: () => void
}

const allNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, featureFlag: null as string | null },
  { name: 'Matches', href: '/matches', icon: Users, featureFlag: null },
  { name: 'Housing', href: '/housing', icon: Home, featureFlag: 'housing' },
  { name: 'Chat', href: '/chat', icon: MessageCircle, featureFlag: null },
  { name: 'Agreements', href: '/agreements', icon: FileText, featureFlag: null },
  { name: 'Move-in', href: '/move-in', icon: Calendar, featureFlag: 'move_in' },
  { name: 'Safety', href: '/safety', icon: Shield, featureFlag: null },
  { name: 'Reputation', href: '/reputation', icon: Award, featureFlag: null },
  { name: 'Video Intros', href: '/video-intros', icon: Video, featureFlag: null },
  { name: 'Admin', href: '/admin', icon: BarChart3, featureFlag: null },
]

const adminNavigationItems = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Matches', href: '/admin/matches', icon: BarChart3 },
  { name: 'Chats', href: '/admin/chats', icon: MessageCircle },
  { name: 'Reports', href: '/admin/reports', icon: Shield },
  { name: 'Verifications', href: '/admin/verifications', icon: Shield },
  { name: 'Metrics', href: '/admin/metrics', icon: BarChart3 },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
]

// MVP hidden features - kept in code but hidden from UI
const MVP_HIDDEN_ITEMS = ['Agreements', 'Reputation', 'Video Intros']

// Super admin email - only this account can see Admin button
const SUPER_ADMIN_EMAIL = 'demo@account.com'

// Filter navigation based on feature flags, MVP hidden items, and admin access
const getNavigation = (userEmail: string) => {
  const isSuperAdmin = userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  
  return allNavigationItems.filter(item => {
    // Filter out MVP hidden items
    if (MVP_HIDDEN_ITEMS.includes(item.name)) {
      return false
    }
    
    // Filter out Admin unless user is super admin
    if (item.name === 'Admin' && !isSuperAdmin) {
      return false
    }
    
    // Filter based on feature flags
    if (item.featureFlag === null) return true
    return isFeatureEnabled(item.featureFlag as 'housing' | 'move_in')
  })
}

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [totalMatchesCount, setTotalMatchesCount] = useState(0)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [questionnaireProgress, setQuestionnaireProgress] = useState(0)
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    const supabase = createClient()

    // Debounce timer for unread count refetch - using object to ensure cleanup can access it
    const timerRef: { current: NodeJS.Timeout | null } = { current: null }

    // Fetch initial unread message count using optimized API endpoint
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/chat/unread')
        if (response.ok) {
          const data = await response.json()
          setUnreadChatCount(data.total_unread || 0)
        } else {
          // Fallback to 0 if API fails
          setUnreadChatCount(0)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
        setUnreadChatCount(0)
      }
    }

    // Debounced version for real-time updates
    const debouncedFetchUnreadCount = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        fetchUnreadCount()
      }, 500) // Wait 500ms after last event before refetching
    }

    // Fetch match suggestions count
    const fetchMatchesCount = async () => {
      try {
        const now = new Date().toISOString()
        const { count } = await supabase
          .from('match_suggestions')
          .select('*', { count: 'exact', head: true })
          .eq('kind', 'pair')
          .contains('member_ids', [user.id])
          .neq('status', 'rejected')
          .gte('expires_at', now) // Only non-expired suggestions
        
        setTotalMatchesCount(count || 0)
      } catch (error) {
        console.error('Error fetching match suggestions count:', error)
      }
    }

    // Fetch profile completion
    const fetchProfileCompletion = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile) {
          const requiredFields = ['first_name', 'last_name', 'phone', 'bio']
          const filledFields = requiredFields.filter(field => {
            const value = profile[field]
            return value !== null && value !== undefined && value !== ''
          })
          setProfileCompletion(Math.round((filledFields.length / requiredFields.length) * 100))
        }
      } catch (error) {
        console.error('Error fetching profile completion:', error)
      }
    }

    // Fetch questionnaire progress
    const fetchQuestionnaireProgress = async () => {
      try {
        const response = await fetch('/api/onboarding/progress')
        if (response.ok) {
          const data = await response.json()
          // Use completionPercentage which is based on actual items answered
          // This should show 100% if all questions are answered
          const progress = data.completionPercentage ?? 0
          setQuestionnaireProgress(progress)
        }
      } catch (error) {
        console.error('Error fetching questionnaire progress:', error)
      }
    }

    fetchUnreadCount()
    fetchMatchesCount()
    fetchProfileCompletion()
    fetchQuestionnaireProgress()

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('sidebar-chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Use debounced version to avoid excessive API calls
          debouncedFetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [user.id])

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface dark:bg-bg-surface border-r border-border-subtle">
      {/* Branding Header */}
      <div className="px-4 lg:px-6 py-4">
        <Link href={isAdminRoute ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              {isAdminRoute ? 'Admin Panel' : 'Domu Match'}
            </h1>
            <p className="text-xs text-text-muted">
              {isAdminRoute ? 'Manage the platform' : 'From strangers to roommates'}
            </p>
          </div>
        </Link>
      </div>
      {/* Navigation - starts at top */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col">
        {/* Admin Section (only on admin routes) */}
        {isAdminRoute && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-ink-500">Admin</span>
              <Link href="/dashboard" className="text-xs text-semantic-accent hover:text-semantic-accent-hover" onClick={onClose}>
                Back to App
              </Link>
            </div>
            <div className="space-y-2">
              {adminNavigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 px-3 transition-colors",
                        isActive 
                          ? "bg-semantic-accent-soft text-semantic-accent dark:bg-semantic-accent-soft dark:text-semantic-accent border-l-4 border-semantic-accent rounded-l-none hover:bg-semantic-accent-soft/80 hover:text-semantic-accent" 
                          : "text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
            <div className="my-3">
              <Separator />
            </div>
          </div>
        )}

        {/* App Section */}
        <div>
          <span className="text-xs uppercase tracking-wide text-ink-500">App</span>
          <div className="mt-2 space-y-2">
        {getNavigation(user.email).map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? "ghost" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 transition-colors",
                    isActive 
                      ? "bg-semantic-accent-soft text-semantic-accent dark:bg-semantic-accent-soft dark:text-semantic-accent border-l-4 border-semantic-accent rounded-l-none hover:bg-semantic-accent-soft/80 hover:text-semantic-accent" 
                      : "text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Chat' && unreadChatCount > 0 && (
                    <Badge variant="destructive" size="sm" className="ml-auto bg-red-600 text-white font-semibold">
                      {unreadChatCount > 99 ? '99+' : unreadChatCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
          </div>
        </div>

        {/* Enhanced Sidebar Features - Only show on non-admin routes */}
        {!isAdminRoute && (
          <div className="mt-auto pt-4 space-y-3">
            <Separator />
            
            {/* Complete Your Profile */}
            {(profileCompletion < 100 || questionnaireProgress < 100) && (
            <Card className="border-semantic-warning/30 dark:border-semantic-warning/30 bg-semantic-warning/10 dark:bg-semantic-warning/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-semantic-warning" />
                  <span className="text-xs font-semibold text-semantic-warning">Complete Your Profile</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary">Profile</span>
                      <span className="font-medium text-text-primary">{profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-bg-surface-alt rounded-full h-1.5">
                      <div 
                        className="bg-semantic-accent h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                    {questionnaireProgress < 100 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-secondary">Questionnaire</span>
                          <span className="font-medium text-text-primary">{questionnaireProgress}%</span>
                        </div>
                        <div className="w-full bg-bg-surface-alt rounded-full h-1.5">
                          <div 
                            className="bg-semantic-accent h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${questionnaireProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Profile Card */}
            <Card className="bg-bg-surface-alt dark:bg-bg-surface-alt border-border-subtle">
              <CardContent className="p-3">
                <Link href="/settings" onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-semantic-accent text-white text-xs">
                      {user.name?.[0]?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.email}
                    </p>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-text-muted" />
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </nav>
    </div>
  )
}
