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
  Home,
  RefreshCw
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
  firstName?: string
}

export function DashboardContent({ hasCompletedQuestionnaire = false, hasPartialProgress = false, progressCount = 0, profileCompletion = 0, questionnaireProgress, dashboardData, user, firstName = '' }: DashboardContentProps) {
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
      loadAvgCompatibility()
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
    if (!user?.id) {
      console.log('[loadTopMatches] No user ID provided')
      return
    }
    
    setIsLoadingMatches(true)
    try {
      console.log('[loadTopMatches] Fetching match suggestions for user:', user.id)
      
      // Fetch top match suggestions from match_suggestions table
      // Get suggestions where user is in member_ids array
      const now = new Date().toISOString()
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('match_suggestions')
        .select('id, member_ids, fit_score, fit_index, status, created_at, expires_at')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions
        .order('fit_index', { ascending: false })
        .limit(10) // Get more to deduplicate and find top 3

      if (suggestionsError) {
        console.error('[loadTopMatches] Error loading suggestions:', suggestionsError)
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      console.log('[loadTopMatches] Raw suggestions data:', {
        suggestionsCount: suggestions?.length || 0,
        suggestionsData: suggestions
      })

      if (!suggestions || suggestions.length === 0) {
        setTopMatches([])
        setIsLoadingMatches(false)
        loadTotalMatchesCount()
        loadAvgCompatibility()
        return
      }

      // Extract other user ID from each suggestion and map to score
      // Deduplicate by otherUserId, keeping highest fit_score
      const matchMap = new Map<string, number>()
      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return
        
        // Find the other user (not the current user)
        const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        const fitScore = Number(s.fit_score || 0)
        
        const currentScore = matchMap.get(otherUserId) || 0
        if (fitScore > currentScore) {
          matchMap.set(otherUserId, fitScore)
        }
      })

      // Sort by score and take top 3
      const topMatchEntries = Array.from(matchMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

      if (topMatchEntries.length === 0) {
        setTopMatches([])
        setIsLoadingMatches(false)
        // Still fetch total count and avg compatibility
        loadTotalMatchesCount()
        loadAvgCompatibility()
        return
      }

      const topUserIds = topMatchEntries.map(([userId]) => userId)

      // Fetch profiles for matched users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id, 
          first_name, 
          last_name, 
          university_id, 
          universities(name)
        `)
        .in('user_id', topUserIds)

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        setTopMatches([])
        setIsLoadingMatches(false)
        return
      }

      // Fetch program names separately from user_academic
      const { data: academicData } = await supabase
        .from('user_academic')
        .select(`
          user_id,
          program_id,
          programs!user_academic_program_id_fkey(name)
        `)
        .in('user_id', topUserIds)

      // Create a map of user_id to program name
      const programMap = new Map<string, string>()
      academicData?.forEach((academic: any) => {
        if (academic.programs?.name) {
          programMap.set(academic.user_id, academic.programs.name)
        }
      })

      // Create a map of user_id to match score
      const matchScoreMap = new Map(topMatchEntries)

      // Format matches maintaining the order from topMatchEntries
      const formattedMatches = topMatchEntries.map(([userId, score]) => {
        const profile = profiles?.find((p: any) => p.user_id === userId)
        if (!profile) {
          return null
        }

        const fullName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        const programDisplay = programMap.get(userId) || null
        
        // Handle universities as either object or array (Supabase type inference issue)
        const universityData = Array.isArray(profile.universities) 
          ? profile.universities[0] 
          : profile.universities
        const universityName = universityData?.name || 'University'
        
        return {
          id: userId,
          userId: userId,
          name: fullName,
          score: score, // Keep as decimal 0-1 for display
          program: programDisplay || '',
          university: universityName,
          avatar: undefined
        }
      }).filter((m): m is NonNullable<typeof m> => m !== null) // Remove null entries

      console.log('loadTopMatches: Formatted', formattedMatches.length, 'matches from match_suggestions table')

      setTopMatches(formattedMatches)

      // Always fetch total count and avg compatibility separately for accuracy
      loadTotalMatchesCount()
      loadAvgCompatibility()
    } catch (error) {
      console.error('Failed to load matches:', error)
      setTopMatches([])
    } finally {
      setIsLoadingMatches(false)
    }
  }

  const loadTotalMatchesCount = async () => {
    if (!user?.id) {
      console.log('loadTotalMatchesCount: No user ID')
      return
    }

    try {
      console.log('loadTotalMatchesCount: Fetching match suggestions for user', user.id)
      const now = new Date().toISOString()

      // Fetch active pair suggestions and count unique matched users,
      // so repeated suggestions for the same pair don't inflate totals.
      const { data: suggestions, error } = await supabase
        .from('match_suggestions')
        .select('member_ids, fit_score')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions

      if (error) {
        console.error('Error fetching match suggestions for count:', error)
      } else if (suggestions && suggestions.length > 0) {
        const matchMap = new Map<string, number>()

        suggestions.forEach((s: any) => {
          const memberIds = s.member_ids as string[]
          if (!memberIds || memberIds.length !== 2) return

          const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
          const fitScore = Number(s.fit_score || 0)

          const currentBest = matchMap.get(otherUserId) ?? 0
          if (fitScore > currentBest) {
            matchMap.set(otherUserId, fitScore)
          }
        })

        const total = matchMap.size
        console.log('loadTotalMatchesCount: Unique matched users from suggestions', total)
        setTotalMatches(total)
        return
      }

      // Fallback: use legacy matches table if there are no suggestions
      console.log('loadTotalMatchesCount: No active match_suggestions, falling back to matches table')

      const { count: matchesAsA } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('a_user', user.id)

      const { count: matchesAsB } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('b_user', user.id)

      const total = (matchesAsA || 0) + (matchesAsB || 0)
      console.log('loadTotalMatchesCount: Total matches from legacy table', total)
      setTotalMatches(total)
    } catch (error) {
      console.error('Failed to load total matches count:', error)
      setTotalMatches(0)
    }
  }

  const loadAvgCompatibility = async () => {
    if (!user?.id) {
      console.log('loadAvgCompatibility: No user ID')
      return
    }

    try {
      console.log('loadAvgCompatibility: Fetching matches for user', user.id)
      // Fetch ALL active match suggestions (not just chat members)
      const now = new Date().toISOString()
      const { data: suggestions, error } = await supabase
        .from('match_suggestions')
        .select('fit_score, member_ids')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions

      if (error) {
        console.error('Error fetching match suggestions for avg:', error)
      }

      // Compute average based on unique matched users to avoid
      // double-counting the same pair across multiple suggestions.
      const scoreByUser = new Map<string, number>()
      ;(suggestions || []).forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return

        const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        const fitScore = Number(s.fit_score || 0)

        const currentBest = scoreByUser.get(otherUserId) ?? 0
        if (fitScore > currentBest) {
          scoreByUser.set(otherUserId, fitScore)
        }
      })

      const allScores = Array.from(scoreByUser.values())

      console.log('loadAvgCompatibility: Found', allScores.length, 'matches', 'scores:', allScores)

      if (allScores.length > 0) {
        const average = Math.round(
          (allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100
        )
        console.log('loadAvgCompatibility: Average calculated as', average)
        setAvgCompatibility(average)
      } else {
        console.log('loadAvgCompatibility: No matches found, setting to 0')
        setAvgCompatibility(0)
      }
    } catch (error) {
      console.error('Failed to load average compatibility:', error)
      setAvgCompatibility(0)
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
        return 'bg-semantic-success/20 text-semantic-success'
      case 'chat_message':
        return 'bg-semantic-accent-soft text-semantic-accent'
      case 'profile_updated':
      case 'questionnaire_completed':
        return 'bg-semantic-accent-soft text-semantic-accent'
      case 'housing_update':
        return 'bg-semantic-warning/20 text-semantic-warning'
      default:
        return 'bg-bg-surface-alt text-text-secondary'
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
    <div className="space-y-2 lg:space-y-2 flex flex-col lg:h-[calc(100vh-14rem)] lg:overflow-hidden pb-24 md:pb-6">
      {/* Email verification warning */}
      {user && !user.email_confirmed_at && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border rounded-lg p-4 bg-semantic-danger/10 border-semantic-danger/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 text-semantic-danger" />
            <div className="flex-1">
              <h3 className="font-semibold text-semantic-danger">
                Email Verification Required
              </h3>
              <p className="text-sm mt-1 text-semantic-danger">
                Please verify your email address to submit the questionnaire and access all features.
              </p>
              <Button 
                asChild
                className="mt-3 min-h-[44px] w-full sm:w-auto"
                variant="primary"
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
              ? 'bg-semantic-accent-soft border-semantic-accent/30' 
              : 'bg-semantic-warning/20 border-semantic-warning/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${
              hasPartialProgress ? 'text-semantic-accent' : 'text-semantic-warning'
            }`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${
                hasPartialProgress ? 'text-semantic-accent' : 'text-semantic-warning'
              }`}>
                {hasPartialProgress ? 'Update Your Compatibility Profile' : 'Complete Your Compatibility Test'}
              </h3>
              <p className={`text-sm mt-1 ${
                hasPartialProgress ? 'text-semantic-accent' : 'text-semantic-warning'
              }`}>
                {hasPartialProgress 
                  ? `Your profile is missing some information. Update your questionnaire to ensure accurate matching.`
                  : 'To find the best roommate matches, please complete our compatibility questionnaire.'
                }
              </p>
              <Button 
                asChild
                className="mt-3 min-h-[44px] w-full sm:w-auto"
                variant="primary"
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
        className="space-y-2 flex-shrink-0"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-text-primary">Welcome back{firstName ? ` ${firstName}` : ''}!</h1>
            <p className="text-xs lg:text-sm text-text-secondary mt-0.5">Here's what's happening with your matches today.</p>
          </div>
        </motion.div>
        
        {/* Summary Badges - Real Data */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-1.5 sm:gap-2">
          {dashboardData.summary.newMatchesCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-semantic-success/20 text-semantic-success text-xs font-medium rounded-full">
              <Star className="w-2.5 h-2.5" />
              {dashboardData.summary.newMatchesCount} new {dashboardData.summary.newMatchesCount === 1 ? 'match' : 'matches'}
            </div>
          )}
          {dashboardData.summary.unreadMessagesCount > 0 && (
            <button
              onClick={() => router.push('/chat')}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-semantic-accent-soft text-semantic-accent text-xs font-medium rounded-full hover:bg-semantic-accent-soft/80 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-2.5 h-2.5" />
              {dashboardData.summary.unreadMessagesCount} unread {dashboardData.summary.unreadMessagesCount === 1 ? 'message' : 'messages'}
            </button>
          )}
          {/* Profile Completion Badge */}
          {profileCompletion < 100 && (
            <button
              onClick={() => router.push('/settings')}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-semantic-accent-soft text-semantic-accent text-xs font-medium rounded-full hover:bg-semantic-accent-soft/80 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-2.5 h-2.5" />
              Profile {profileCompletion}% complete
            </button>
          )}
          {/* Questionnaire Progress Badge */}
          {questionnaireProgress && !questionnaireProgress.isSubmitted && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-semantic-accent-soft text-semantic-accent text-xs font-medium rounded-full">
              <FileText className="w-2.5 h-2.5" />
              Questionnaire {questionnaireProgress.completedSections}/{questionnaireProgress.totalSections} sections
            </div>
          )}
          {dashboardData.summary.newMatchesCount === 0 && dashboardData.summary.unreadMessagesCount === 0 && profileCompletion === 100 && (!questionnaireProgress || questionnaireProgress.isSubmitted) && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-semantic-success/20 text-semantic-success text-xs font-medium rounded-full">
              <Star className="w-2.5 h-2.5" />
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 flex-shrink-0"
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">
              {avgCompatibility > 0 ? `${avgCompatibility}%` : '0%'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">Avg Compatibility</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{totalMatches}</div>
            <div className="text-xs text-text-secondary mt-0.5">Total Matches</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{dashboardData.kpis.activeChats}</div>
            <div className="text-xs text-text-secondary mt-0.5">Active Chats</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Top Matches and Recent Activity */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2 lg:gap-3 flex-1 min-h-0"
      >
        {/* Top Matches - Real Data */}
        <motion.div variants={fadeInUp} className="flex flex-col min-h-0">
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle flex flex-col h-full max-h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm lg:text-base font-bold text-text-primary">Your Top Matches</h3>
              <button 
                className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text-primary hover:bg-bg-surface-alt rounded-lg transition-colors" 
                onClick={loadTopMatches}
                disabled={isLoadingMatches}
                title="Refresh matches"
              >
                {isLoadingMatches ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {isLoadingMatches ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : topMatches.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {topMatches.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 p-3 bg-bg-surface-alt border border-border-subtle rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-semantic-accent to-semantic-accent-hover rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {match.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-text-primary truncate">{match.name}</h4>
                        <div className="text-xs text-text-secondary mt-0.5">
                          {match.program && (
                            <div className="truncate">{match.program}</div>
                          )}
                          {match.university && (
                            <div className="truncate">{match.university}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {match.score > 0 && (
                          <div className="text-base font-bold text-semantic-accent">
                            {Math.round(match.score * 100)}%
                          </div>
                        )}
                        <button 
                          onClick={() => handleChatWithMatch(match.userId || match.id)}
                          className="px-3 py-1.5 bg-semantic-accent text-white text-xs font-medium rounded-lg hover:bg-semantic-accent-hover transition-colors min-h-[44px] min-w-[60px]"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border-subtle mt-2 flex-shrink-0">
                  <button 
                    className="w-full flex items-center justify-center gap-1 text-xs text-semantic-accent hover:text-semantic-accent-hover font-medium py-1.5" 
                    onClick={handleBrowseMatches}
                  >
                    View all
                    <ArrowRight className="w-3 h-3" />
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
        <motion.div variants={fadeInUp} className="flex flex-col min-h-0">
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle flex flex-col h-full max-h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm lg:text-base font-bold text-text-primary">Recent Activity</h3>
              <button 
                className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text-primary hover:bg-bg-surface-alt rounded-lg transition-colors" 
                onClick={loadRecentActivity}
                disabled={isLoadingActivity}
                title="Refresh activity"
              >
                {isLoadingActivity ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {isLoadingActivity ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-1.5 overflow-y-auto flex-1 pr-2">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={`w-full flex items-start gap-2 p-2 rounded-lg transition-colors text-left ${
                        activity.isRead 
                          ? 'bg-bg-surface-alt hover:bg-bg-surface-alt/80' 
                          : 'bg-semantic-accent-soft hover:bg-semantic-accent-soft/80 border border-semantic-accent/30'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        activity.isRead ? 'bg-bg-surface-alt' : getActivityColor(activity.type)
                      }`}>
                        <div className={activity.isRead ? 'text-text-muted' : ''}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-xs ${
                          activity.isRead ? 'text-text-secondary' : 'text-text-primary'
                        }`}>
                          {activity.title}
                        </p>
                        {activity.message && (
                          <p className={`text-xs mt-0.5 ${
                            activity.isRead ? 'text-text-muted' : 'text-text-secondary'
                          }`}>
                            {activity.message}
                          </p>
                        )}
                        <p className="text-xs text-text-muted mt-0.5">
                          {activity.timeAgo}
                        </p>
                      </div>
                      {!activity.isRead && (
                        <div className="flex-shrink-0 w-1.5 h-1.5 bg-semantic-accent rounded-full mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
                {recentActivity.length > 3 && (
                  <div className="pt-2 border-t border-border-subtle mt-2 flex-shrink-0 mb-4">
                    <button 
                      className="w-full flex items-center justify-center gap-1 text-xs text-semantic-accent hover:text-semantic-accent-hover font-medium py-2" 
                      onClick={handleViewAllActivity}
                    >
                      View more
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
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

    </div>
  )
}
