'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar,
  ArrowRight,
  Plus,
  Star,
  Heart,
  Bell,
  AlertCircle,
  FileText,
  Loader2,
  CheckCircle,
  UserPlus,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { DashboardData } from '@/types/dashboard'
import { createClient } from '@/lib/supabase/client'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface DashboardContentProps {
  hasCompletedQuestionnaire?: boolean
  hasPartialProgress?: boolean
  progressCount?: number
  profileCompletion?: number
  questionnaireProgress?: {
    completedSections: number
    totalSections: number
    isSubmitted: boolean
  }
  dashboardData: DashboardData
  user?: {
    id: string
    email: string
    email_confirmed_at?: string
    name?: string
    avatar?: string
  }
}

export function DashboardContent({ hasCompletedQuestionnaire = false, hasPartialProgress = false, progressCount = 0, profileCompletion = 0, questionnaireProgress, dashboardData, user }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [topMatches, setTopMatches] = useState(dashboardData.topMatches)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [avgCompatibility, setAvgCompatibility] = useState(dashboardData.kpis.avgCompatibility)
  const [totalMatches, setTotalMatches] = useState(dashboardData.kpis.totalMatches)

  // Fetch matches on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadTopMatches()
      loadRecentActivity()
      loadTotalMatchesCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Set up real-time subscription for notifications and messages
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('dashboard-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadRecentActivity()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadRecentActivity()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase])

  // Set up real-time subscription for matches
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('dashboard-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `a_user=eq.${user.id}`
        },
        () => {
          loadTopMatches()
          loadTotalMatchesCount()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `b_user=eq.${user.id}`
        },
        () => {
          loadTopMatches()
          loadTotalMatchesCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase])

  const loadTopMatches = async () => {
    if (!user?.id) return
    
    setIsLoadingMatches(true)
    try {
      // Fetch matches from chat_members table (same logic as chat page)
      // Get chat memberships for this user
      const { data: memberships, error: membershipsError } = await supabase
        .from('chat_members')
        .select('chat_id, user_id')
        .eq('user_id', user.id)

      if (membershipsError) {
        console.error('Error loading chat memberships:', membershipsError)
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      if (!memberships || memberships.length === 0) {
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      const chatIds = memberships.map(m => m.chat_id)

      // Fetch chats to get other participants
      const { data: chatRooms, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          is_group,
          chat_members!inner(user_id)
        `)
        .in('id', chatIds)
        .eq('is_group', false) // Only individual chats for top matches
        .order('created_at', { ascending: false })
        .limit(3)

      if (chatsError) {
        console.error('Error loading chats:', chatsError)
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      // Get other user IDs from chat members
      const otherUserIds = new Set<string>()
      chatRooms?.forEach((room: any) => {
        room.chat_members?.forEach((member: any) => {
          if (member.user_id !== user.id) {
            otherUserIds.add(member.user_id)
          }
        })
      })

      if (otherUserIds.size === 0) {
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      // Fetch profiles for other users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, program, university_id, universities(name)')
        .in('user_id', Array.from(otherUserIds))

      // Fetch match data for compatibility scores
      const userIdsArray = Array.from(otherUserIds)
      const { data: matchesAsA } = await supabase
        .from('matches')
        .select('b_user, score')
        .eq('a_user', user.id)
        .in('b_user', userIdsArray)

      const { data: matchesAsB } = await supabase
        .from('matches')
        .select('a_user, score')
        .eq('b_user', user.id)
        .in('a_user', userIdsArray)

      // Create a map of user_id to match score
      const matchScoreMap = new Map<string, number>()
      matchesAsA?.forEach((m: any) => matchScoreMap.set(m.b_user, m.score || 0))
      matchesAsB?.forEach((m: any) => matchScoreMap.set(m.a_user, m.score || 0))

      // Format matches
      const formattedMatches = (profiles || []).slice(0, 3).map((profile: any) => {
        const fullName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        const score = matchScoreMap.get(profile.user_id) || 0
        
        return {
          id: profile.user_id,
          userId: profile.user_id,
          name: fullName,
          score: Math.round(score * 100),
          program: profile.program || 'Program',
          university: profile.universities?.name || 'University',
          avatar: undefined
        }
      }).sort((a, b) => b.score - a.score) // Sort by score descending

      setTopMatches(formattedMatches)

      // Calculate average compatibility from all matches
      const allMatchScores = Array.from(matchScoreMap.values())
      if (allMatchScores.length > 0) {
        const average = Math.round(
          (allMatchScores.reduce((sum, score) => sum + score, 0) / allMatchScores.length) * 100
        )
        setAvgCompatibility(average)
      } else {
        setAvgCompatibility(0)
      }
      
      // Always fetch total count separately for accuracy
      loadTotalMatchesCount()
    } catch (error) {
      console.error('Failed to load matches:', error)
      setTopMatches([])
    } finally {
      setIsLoadingMatches(false)
    }
  }

  const loadTotalMatchesCount = async () => {
    if (!user?.id) return

    try {
      // Count matches where user is a_user
      const { count: countAsA } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('a_user', user.id)

      // Count matches where user is b_user
      const { count: countAsB } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('b_user', user.id)

      const total = (countAsA || 0) + (countAsB || 0)
      setTotalMatches(total)
    } catch (error) {
      console.error('Failed to load total matches count:', error)
    }
  }

  const loadRecentActivity = async () => {
    if (!user?.id) return

    setIsLoadingActivity(true)
    try {
      // Fetch notifications
      const response = await fetch('/api/notifications/my?limit=10')
      const notificationsData = response.ok ? await response.json() : { notifications: [] }
      const notifications = notificationsData.notifications || []
      
      // Fetch recent chat messages
      const { data: chatMembers } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id)

      let chatMessages: any[] = []
      if (chatMembers && chatMembers.length > 0) {
        const chatIds = chatMembers.map(cm => cm.chat_id)
        
        // Get last_read_at for each chat
        const { data: memberships } = await supabase
          .from('chat_members')
          .select('chat_id, last_read_at')
          .eq('user_id', user.id)
          .in('chat_id', chatIds)

        if (memberships) {
          // Get recent messages from user's chats
          const { data: messages } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              user_id,
              chat_id,
              created_at,
              profiles!messages_user_id_fkey(first_name)
            `)
            .in('chat_id', chatIds)
            .neq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

          if (messages) {
            // Get profile names for messages
            const userIds = new Set(messages.map(m => m.user_id))
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, first_name')
              .in('user_id', Array.from(userIds))

            const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
            
            chatMessages = messages.map((msg: any) => {
              const profile = profilesMap.get(msg.user_id)
              const senderName = profile?.first_name || 'User'
              const timeAgo = formatTimeAgo(msg.created_at)
              return {
                id: `message-${msg.id}`,
                type: 'chat_message',
                title: `${senderName} has sent you a message`,
                message: '', // Don't show content
                timeAgo,
                isRead: false, // We'll check this based on last_read_at
                metadata: { chat_id: msg.chat_id, message_id: msg.id }
              }
            })
          }
        }
      }
      
      // Combine notifications and chat messages, sort by time
      const allActivity = [...notifications.map((notif: any) => {
        const timeAgo = formatTimeAgo(notif.created_at)
        return {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          timeAgo,
          isRead: notif.is_read,
          metadata: notif.metadata || {}
        }
      }), ...chatMessages]
      
      // Sort by created_at (newest first) - approximate sort by timeAgo
      allActivity.sort((a, b) => {
        // Simple sort - items with "Just now" come first, then minutes, hours, days
        if (a.timeAgo === 'Just now') return -1
        if (b.timeAgo === 'Just now') return 1
        return 0
      })
      
      setRecentActivity(allActivity.slice(0, 10))
    } catch (error) {
      console.error('Failed to load activity:', error)
    } finally {
      setIsLoadingActivity(false)
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        return <Heart className="w-4 h-4" />
      case 'chat_message':
        return <MessageCircle className="w-4 h-4" />
      case 'profile_updated':
      case 'questionnaire_completed':
        return <CheckCircle className="w-4 h-4" />
      case 'housing_update':
        return <Home className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        return 'bg-green-100 text-green-800'
      case 'chat_message':
        return 'bg-blue-100 text-blue-800'
      case 'profile_updated':
      case 'questionnaire_completed':
        return 'bg-purple-100 text-purple-800'
      case 'housing_update':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleActivityClick = (activity: any) => {
    const { metadata, type } = activity
    
    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        } else {
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
      case 'housing_update':
        router.push('/housing')
        break
      default:
        router.push('/notifications')
    }
  }

  const handleBrowseMatches = () => {
    router.push('/matches')
  }

  const handleStartChat = () => {
    router.push('/chat')
  }


  const handleUpdateProfile = () => {
    router.push('/settings')
  }

  const handleViewAllActivity = () => {
    router.push('/matches')
  }

  const handleChatWithMatch = (userId: string) => {
    // Navigate to chat with this user
    router.push(`/chat?user=${userId}`)
  }

  return (
    <div className="space-y-8">
      {/* Email verification warning */}
      {user && !user.email_confirmed_at && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border rounded-lg p-4 bg-red-50 border-red-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                Email Verification Required
              </h3>
              <p className="text-sm mt-1 text-red-800">
                Please verify your email address to submit the questionnaire and access all features.
              </p>
              <Button 
                asChild
                className="mt-3"
                variant="default"
              >
                <a href="/settings">
                  Go to Settings to Verify Email
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Show prompt if questionnaire not completed */}
      {!hasCompletedQuestionnaire && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`border rounded-lg p-4 ${
            hasPartialProgress 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${
              hasPartialProgress ? 'text-blue-600' : 'text-yellow-600'
            }`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${
                hasPartialProgress ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                {hasPartialProgress ? 'Update Your Compatibility Profile' : 'Complete Your Compatibility Test'}
              </h3>
              <p className={`text-sm mt-1 ${
                hasPartialProgress ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {hasPartialProgress 
                  ? `Your profile is missing some information. Update your questionnaire to ensure accurate matching.`
                  : 'To find the best roommate matches, please complete our compatibility questionnaire.'
                }
              </p>
              <Button 
                asChild
                className="mt-3"
                variant="default"
              >
                <a href={hasPartialProgress ? "/onboarding?mode=edit" : "/onboarding"}>
                  {hasPartialProgress ? 'Update Profile' : 'Start Questionnaire'}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1">Here's what's happening with your matches today.</p>
          </div>
        </motion.div>
        
        {/* Summary Badges - Real Data */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 sm:gap-3">
          {dashboardData.summary.newMatchesCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <Star className="w-3 h-3" />
              {dashboardData.summary.newMatchesCount} new {dashboardData.summary.newMatchesCount === 1 ? 'match' : 'matches'} found
            </div>
          )}
          {dashboardData.summary.unreadMessagesCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <MessageCircle className="w-3 h-3" />
              {dashboardData.summary.unreadMessagesCount} unread {dashboardData.summary.unreadMessagesCount === 1 ? 'message' : 'messages'}
            </div>
          )}
          {/* Profile Completion Badge */}
          {profileCompletion < 100 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              <TrendingUp className="w-3 h-3" />
              Profile {profileCompletion}% complete
            </div>
          )}
          {/* Questionnaire Progress Badge */}
          {questionnaireProgress && !questionnaireProgress.isSubmitted && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <FileText className="w-3 h-3" />
              Questionnaire {questionnaireProgress.completedSections}/{questionnaireProgress.totalSections} sections
            </div>
          )}
          {dashboardData.summary.newMatchesCount === 0 && dashboardData.summary.unreadMessagesCount === 0 && profileCompletion === 100 && (!questionnaireProgress || questionnaireProgress.isSubmitted) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <Star className="w-3 h-3" />
              All caught up!
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Stats Cards - Real Data */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {avgCompatibility > 0 ? `${avgCompatibility}%` : '-'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Avg Compatibility</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMatches}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Matches</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardData.kpis.activeChats}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Active Chats</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
      >
        {/* Top Matches - Real Data */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Top Matches</h3>
              <button 
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 font-medium" 
                onClick={loadTopMatches}
                disabled={isLoadingMatches}
              >
                {isLoadingMatches ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Refresh
                  </>
                )}
              </button>
            </div>
            
            {isLoadingMatches ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : topMatches.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2">
                  {topMatches.map((match) => (
                    <div key={match.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{match.score}%</div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          {match.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">{match.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            <span>{match.program}</span>
                            <span className="mx-1 sm:mx-2">•</span>
                            <span>{match.university}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0" />
                        <button 
                          onClick={() => handleChatWithMatch(match.userId || match.id)}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-200 mt-4">
                  <button 
                    className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium py-2" 
                    onClick={handleBrowseMatches}
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={Users}
                  title="No matches yet"
                  description="Complete your profile and questionnaire to find compatible roommates"
                  action={{
                    label: "Browse Matches",
                    onClick: handleBrowseMatches
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity - Live Notifications */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h3>
              <button 
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 font-medium" 
                onClick={loadRecentActivity}
                disabled={isLoadingActivity}
              >
                {isLoadingActivity ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Refresh
                  </>
                )}
              </button>
            </div>
            
            {isLoadingActivity ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {recentActivity.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                        activity.isRead 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.isRead ? 'bg-gray-200' : getActivityColor(activity.type)
                      }`}>
                        <div className={activity.isRead ? 'text-gray-600' : ''}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          activity.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {activity.title}
                        </p>
                        {activity.message && (
                          <p className={`text-xs mt-0.5 ${
                            activity.isRead ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {activity.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timeAgo}
                        </p>
                      </div>
                      {!activity.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <button 
                    className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium py-2" 
                    onClick={handleViewAllActivity}
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={Bell}
                  title="No recent activity"
                  description="Your activity feed will appear here once you start matching and chatting"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
                onClick={handleBrowseMatches}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Browse Matches</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                onClick={handleStartChat}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Start Chat</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                onClick={handleUpdateProfile}
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Update Profile</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
