'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
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
  RefreshCw,
  Search,
  X,
  User,
  Building2,
  Settings,
  LayoutDashboard,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardData, Update } from '@/types/dashboard'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { queryKeys, queryClient } from '@/app/providers'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import { monitorQuery } from '@/lib/utils/query-monitor'
import { getCompatibilityCacheKey, getCompatibilityStaleTime } from '@/lib/cache/compatibility-cache'

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


  // Helper function for formatting time ago (defined early for use in callbacks)
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

  // Fetch recent matches with React Query
  const fetchRecentMatches = useCallback(async () => {
    if (!user?.id) {
      logger.log('[loadRecentMatches] No user ID provided')
      return []
    }
    
    return monitorQuery('fetchRecentMatches', async () => {
      try {
        logger.log('[loadRecentMatches] Fetching recent match suggestions for user:', user.id)
        
        // Fetch recent match suggestions from match_suggestions table
        // Get suggestions where user is in member_ids array, ordered by most recent
        const now = new Date().toISOString()
        const { data: suggestions, error: suggestionsError } = await supabase
        .from('match_suggestions')
        .select('id, member_ids, fit_score, fit_index, status, created_at, expires_at')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions
        .order('created_at', { ascending: false }) // Most recent first
        .limit(20) // Get more to deduplicate and find 3 most recent

      if (suggestionsError) {
        logger.error('[loadRecentMatches] Error loading suggestions:', suggestionsError)
        return []
      }

      logger.log('[loadRecentMatches] Raw suggestions data:', {
        suggestionsCount: suggestions?.length || 0,
        suggestionsData: suggestions
      })

      if (!suggestions || suggestions.length === 0) {
        return []
      }

      // Extract other user ID from each suggestion and deduplicate by keeping most recent
      // Map: otherUserId -> { suggestionId, created_at }
      const matchMap = new Map<string, { suggestionId: string; created_at: string }>()
      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return
        
        // Find the other user (not the current user)
        const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        
        // Keep the most recent suggestion for each user
        const existing = matchMap.get(otherUserId)
        if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
          matchMap.set(otherUserId, { suggestionId: s.id, created_at: s.created_at })
        }
      })

      // Get the 3 most recent unique matches (sorted by created_at)
      const recentMatches = Array.from(matchMap.entries())
        .map(([userId, data]) => ({ userId, created_at: data.created_at }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) // Take 3 most recent

      if (recentMatches.length === 0) {
        return []
      }

      const recentUserIds = recentMatches.map(m => m.userId)

      // Compute compatibility scores using batch function when multiple users
      // Falls back to individual calls with caching for single user
      let compatibilityScores: Array<{ userId: string; score: number }>
      
      if (recentUserIds.length > 1) {
        // Use batch function for multiple users (more efficient)
        try {
          const { data, error } = await supabase.rpc('compute_compatibility_scores_batch', {
            user_a_id: user.id,
            user_b_ids: recentUserIds
          })
          
          if (error) {
            logger.error('Error computing batch compatibility scores:', error)
            // Fall back to individual calls
            compatibilityScores = await Promise.all(
              recentUserIds.map(async (otherUserId) => {
                try {
                  const cacheKey = getCompatibilityCacheKey(user.id, otherUserId)
                  const result = await queryClient.fetchQuery({
                    queryKey: cacheKey,
                    queryFn: async () => {
                      const { data, error } = await supabase.rpc('compute_compatibility_score', {
                        user_a_id: user.id,
                        user_b_id: otherUserId
                      })
                      if (error) throw error
                      return Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
                    },
                    staleTime: getCompatibilityStaleTime(),
                  })
                  const score = Number(result?.compatibility_score || 0)
                  // Cache the result
                  queryClient.setQueryData(cacheKey, result)
                  return { userId: otherUserId, score }
                } catch (error) {
                  logger.error(`Error computing compatibility score for ${otherUserId}:`, error)
                  return { userId: otherUserId, score: 0 }
                }
              })
            )
          } else {
            // Process batch results and cache them
            compatibilityScores = await Promise.all(
              (data || []).map(async (result: any) => {
                const otherUserId = result.user_b_id
                const score = Number(result?.compatibility_score || 0)
                
                // Cache each result individually for future use
                const cacheKey = getCompatibilityCacheKey(user.id, otherUserId)
                queryClient.setQueryData(cacheKey, result, {
                  updatedAt: Date.now(),
                })
                
                return { userId: otherUserId, score }
              })
            )
          }
        } catch (error) {
          logger.error('Error in batch compatibility score computation:', error)
          // Fall back to individual calls
          compatibilityScores = await Promise.all(
            recentUserIds.map(async (otherUserId) => {
              try {
                const cacheKey = getCompatibilityCacheKey(user.id, otherUserId)
                const result = await queryClient.fetchQuery({
                  queryKey: cacheKey,
                  queryFn: async () => {
                    const { data, error } = await supabase.rpc('compute_compatibility_score', {
                      user_a_id: user.id,
                      user_b_id: otherUserId
                    })
                    if (error) throw error
                    return Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
                  },
                  staleTime: getCompatibilityStaleTime(),
                })
                const score = Number(result?.compatibility_score || 0)
                return { userId: otherUserId, score }
              } catch (error) {
                logger.error(`Error computing compatibility score for ${otherUserId}:`, error)
                return { userId: otherUserId, score: 0 }
              }
            })
          )
        }
      } else if (recentUserIds.length === 1) {
        // Single user - use cached individual call
        const otherUserId = recentUserIds[0]
        try {
          const cacheKey = getCompatibilityCacheKey(user.id, otherUserId)
          const result = await queryClient.fetchQuery({
            queryKey: cacheKey,
            queryFn: async () => {
              const { data, error } = await supabase.rpc('compute_compatibility_score', {
                user_a_id: user.id,
                user_b_id: otherUserId
              })
              if (error) throw error
              return Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
            },
            staleTime: getCompatibilityStaleTime(),
          })
          const score = Number(result?.compatibility_score || 0)
          compatibilityScores = [{ userId: otherUserId, score }]
        } catch (error) {
          logger.error(`Error computing compatibility score for ${otherUserId}:`, error)
          compatibilityScores = [{ userId: otherUserId, score: 0 }]
        }
      } else {
        compatibilityScores = []
      }

      // Create a map of userId to score for easy lookup
      const scoreMap = new Map(compatibilityScores.map(m => [m.userId, m.score]))

      // Maintain the order from recentMatches (most recent first) and add scores
      const recentMatchEntries = recentMatches.map(({ userId, created_at }) => ({
        userId,
        created_at,
        score: scoreMap.get(userId) || 0
      }))

      const finalUserIds = recentMatchEntries.map(m => m.userId)

      // Add this check before querying profiles
      if (finalUserIds.length === 0) {
        logger.log('No user IDs to fetch profiles for')
        return []
      }

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
        .in('user_id', finalUserIds)

      if (profilesError) {
        logger.error('Error loading profiles:', profilesError)
        return []
      }

      // Fetch program names separately from user_academic
      // Try with explicit foreign key first, fallback to simple join if that fails
      const { data: academicData, error: academicError } = await supabase
        .from('user_academic')
        .select(`
          user_id,
          program_id,
          programs(name)
        `)
        .in('user_id', finalUserIds)
      
      if (academicError) {
        logger.warn('Error loading academic data (non-critical):', academicError)
      }

      // Create a map of user_id to program name
      const programMap = new Map<string, string>()
      academicData?.forEach((academic: any) => {
        if (academic.programs?.name) {
          programMap.set(academic.user_id, academic.programs.name)
        }
      })

      // Create a map of user_id to match score
      const matchScoreMap = new Map(recentMatchEntries.map(m => [m.userId, m.score]))

      // Format matches maintaining the order from recentMatchEntries (most recent first)
      const formattedMatches = recentMatchEntries.map(({ userId, score }) => {
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
        
        // Helper function to check if a string is a UUID
        const isUUID = (str: string): boolean => {
          if (!str || typeof str !== 'string') return false
          // Check for full UUID format
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true
          // Check for UUID-like patterns (without dashes or partial)
          if (/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i.test(str)) return true
          return false
        }
        
        // Remove any UUIDs from strings (even if embedded)
        const removeUUIDs = (str: string): string => {
          if (!str || typeof str !== 'string') return str
          // Remove UUID patterns completely
          return str.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '').trim()
        }
        
        // Clean all fields to ensure no UUIDs are displayed
        let safeName = removeUUIDs(fullName)
        if (isUUID(safeName) || safeName === userId || safeName.includes(userId) || !safeName) {
          safeName = 'User'
        }
        
        let safeUniversity = removeUUIDs(universityName)
        if (isUUID(safeUniversity) || safeUniversity === userId || safeUniversity.includes(userId) || !safeUniversity) {
          safeUniversity = 'University'
        }
        
        let safeProgram = removeUUIDs(programDisplay || '')
        if (isUUID(safeProgram) || safeProgram === userId || safeProgram.includes(userId) || !safeProgram) {
          safeProgram = ''
        }
        
        // Normalize score to 0-1 range if needed
        // fit_score should already be in 0-1 range, but handle edge cases
        let normalizedScore = score
        if (normalizedScore > 1.0) {
          // If score is > 1.0, it might already be in 0-100 range (like 94 instead of 0.94)
          if (normalizedScore > 100) {
            // If > 100, cap at 100 and convert to 0-1 range
            normalizedScore = 100 / 100
          } else {
            // If between 1 and 100, convert to 0-1 range
            normalizedScore = normalizedScore / 100
          }
        }
        // Ensure it's in valid range (0-1)
        normalizedScore = Math.max(0, Math.min(normalizedScore, 1.0))
        
        return {
          id: userId,
          userId: userId,
          name: safeName,
          score: normalizedScore, // Keep as decimal 0-1 for calculations
          program: safeProgram,
          university: safeUniversity,
          avatar: undefined
        }
      }).filter((m): m is NonNullable<typeof m> => m !== null) // Remove null entries

      logger.log('loadRecentMatches: Formatted', formattedMatches.length, 'recent matches from match_suggestions table')

      return formattedMatches
    } catch (error) {
      logger.error('Failed to load recent matches:', error)
      return []
    }
    })
  }, [user?.id, supabase])

  const { data: recentMatches = dashboardData.topMatches, isLoading: isLoadingMatches, refetch: refetchRecentMatches } = useQuery({
    queryKey: queryKeys.matches.top(user?.id),
    queryFn: fetchRecentMatches,
    staleTime: 86_400_000, // 24 hours (once per day)
    enabled: !!user?.id,
    initialData: dashboardData.topMatches,
  })

  // Fetch total matches count with React Query
  const fetchTotalMatchesCount = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      logger.log('loadTotalMatchesCount: No user ID')
      return 0
    }

    return monitorQuery('fetchTotalMatchesCount', async () => {
      try {
      logger.log('loadTotalMatchesCount: Fetching match suggestions for user', user.id)
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
        logger.error('Error fetching match suggestions for count:', error)
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
        logger.log('loadTotalMatchesCount: Unique matched users from suggestions', total)
        return total
      }

      // Fallback: use legacy matches table if there are no suggestions
      logger.log('loadTotalMatchesCount: No active match_suggestions, falling back to matches table')

      const { count: matchesAsA } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('a_user', user.id)

      const { count: matchesAsB } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('b_user', user.id)

      const total = (matchesAsA || 0) + (matchesAsB || 0)
      logger.log('loadTotalMatchesCount: Total matches from legacy table', total)
      return total
    } catch (error) {
      logger.error('Failed to load total matches count:', error)
      return 0
    }
    })
  }, [user?.id, supabase])

  const { data: totalMatches = dashboardData.kpis.totalMatches } = useQuery({
    queryKey: queryKeys.matches.count(user?.id),
    queryFn: fetchTotalMatchesCount,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user?.id,
    initialData: dashboardData.kpis.totalMatches,
  })

  // Fetch average compatibility with React Query
  const fetchAvgCompatibility = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      logger.log('loadAvgCompatibility: No user ID')
      return 0
    }

    return monitorQuery('fetchAvgCompatibility', async () => {
      try {
      logger.log('loadAvgCompatibility: Fetching matches for user', user.id)
      // Fetch active match suggestions (matching server-side logic: limit 20, then deduplicate)
      const now = new Date().toISOString()
      const { data: suggestions, error } = await supabase
        .from('match_suggestions')
        .select('fit_score, member_ids, created_at')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions
        .order('created_at', { ascending: false }) // Most recent first (matching server)
        .limit(20) // Match server-side limit to ensure consistent calculation

      if (error) {
        logger.error('Error fetching match suggestions for avg:', error)
      }

      // Deduplicate by keeping most recent suggestion for each user (matching server logic)
      const matchMap = new Map<string, string>() // Map userId -> created_at
      ;(suggestions || []).forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return

        const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        
        // Keep the most recent suggestion for each user (matching server logic)
        const existing = matchMap.get(otherUserId)
        if (!existing || new Date(s.created_at) > new Date(existing)) {
          matchMap.set(otherUserId, s.created_at)
        }
      })

      // Get unique matched users from deduplicated map
      const uniqueUserIds = Array.from(matchMap.keys())

      // Compute compatibility scores using the new algorithm for all matched users
      const compatibilityScores = await Promise.all(
        uniqueUserIds.map(async (otherUserId) => {
          try {
            const { data, error } = await supabase.rpc('compute_compatibility_score', {
              user_a_id: user.id,
              user_b_id: otherUserId
            })
            
            if (error) {
              logger.error(`Error computing compatibility score for ${otherUserId}:`, error)
              return 0
            }
            
            // The function returns a table (array), get the first row
            const result = Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
            return Number(result.compatibility_score || 0)
          } catch (error) {
            logger.error(`Error computing compatibility score for ${otherUserId}:`, error)
            return 0
          }
        })
      )

      const allScores = compatibilityScores
        .map(score => Math.min(score, 1.0)) // Cap each score at 1.0 (100%)
        .filter(score => score > 0) // Only include valid scores

      logger.log('loadAvgCompatibility: Found', allScores.length, 'matches', 'scores:', allScores)

      if (allScores.length > 0) {
        const average = Math.min(
          Math.round(
            (allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100
          ),
          100 // Cap the final result at 100%
        )
        logger.log('loadAvgCompatibility: Average calculated as', average)
        return average
      } else {
        logger.log('loadAvgCompatibility: No matches found, setting to 0')
        return 0
      }
    } catch (error) {
      logger.error('Failed to load average compatibility:', error)
      return 0
    }
    })
  }, [user?.id, supabase])

  const { data: avgCompatibility = dashboardData.kpis.avgCompatibility } = useQuery({
    queryKey: queryKeys.matches.compatibility(user?.id),
    queryFn: fetchAvgCompatibility,
    staleTime: 5 * 60 * 1000, // 5 minutes - compatibility scores don't change frequently
    enabled: !!user?.id,
    initialData: dashboardData.kpis.avgCompatibility,
    refetchOnMount: false, // Don't refetch immediately on mount since we have initialData
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent visual jumps
  })

  // Fetch recent activity with React Query
  const fetchRecentActivity = useCallback(async (): Promise<any[]> => {
    if (!user?.id) return []
    
    return monitorQuery('fetchRecentActivity', async () => {
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
          // Note: Fetch messages first, then get profile names separately to avoid foreign key issues
          const { data: messages } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              user_id,
              chat_id,
              created_at
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
      
      return allActivity.slice(0, 10)
    } catch (error) {
      logger.error('Failed to load activity:', error)
      return []
    }
    })
  }, [user?.id, supabase])

  const { data: recentActivity = [], isLoading: isLoadingActivity, refetch: refetchRecentActivity } = useQuery({
    queryKey: queryKeys.activity(user?.id),
    queryFn: fetchRecentActivity,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user?.id,
  })

  // Fetch updates with React Query
  const fetchUpdates = useCallback(async (): Promise<Update[]> => {
    return monitorQuery('fetchUpdates', async () => {
      try {
        logger.log('Fetching updates from database...')
        const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('release_date', { ascending: false, nullsFirst: false })
        // No limit - show all updates

      if (error) {
        logger.error('Failed to load updates:', error)
        console.error('Updates query error:', error)
        return []
      }

      logger.log('Updates fetched:', data?.length || 0, 'items')
      console.log('Updates data:', data)

      if (!data || data.length === 0) {
        logger.log('No updates found in database')
        return []
      }

      const mappedUpdates = (data || []).map((update: any) => {
        // Handle changes - could be JSONB array or string
        let changesArray: string[] = []
        if (Array.isArray(update.changes)) {
          changesArray = update.changes
        } else if (typeof update.changes === 'string') {
          try {
            const parsed = JSON.parse(update.changes)
            changesArray = Array.isArray(parsed) ? parsed : []
          } catch {
            changesArray = []
          }
        }

        return {
          id: update.id,
          version: update.version,
          release_date: update.release_date,
          changes: changesArray,
          change_type: update.change_type || 'patch'
        }
      })

      logger.log('Mapped updates:', mappedUpdates.length)
      return mappedUpdates
    } catch (error) {
      logger.error('Failed to load updates:', error)
      console.error('Updates fetch error:', error)
      return []
    }
    })
  }, [supabase])

  const { data: updates = [], isLoading: isLoadingUpdates, refetch: refetchUpdates } = useQuery({
    queryKey: queryKeys.updates,
    queryFn: fetchUpdates,
    staleTime: 3600_000, // 1 hour (updates don't change frequently)
    retry: 1,
    enabled: true, // Always enabled - updates are public to authenticated users
  })

  // Group updates by day
  const groupedUpdatesByDay = useMemo(() => {
    const grouped = new Map<string, Update[]>()
    
    updates.forEach((update) => {
      const dateKey = update.release_date // Use release_date as the key
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(update)
    })
    
    // Convert to array and sort by date (newest first)
    return Array.from(grouped.entries())
      .map(([date, updates]) => ({
        date,
        updates: updates.sort((a, b) => {
          // Sort by version or created_at if available
          return b.version.localeCompare(a.version)
        })
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [updates])

  // State for selected day tab
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Set default selected day to the most recent day
  useEffect(() => {
    if (groupedUpdatesByDay.length > 0 && !selectedDay) {
      setSelectedDay(groupedUpdatesByDay[0].date)
    }
  }, [groupedUpdatesByDay, selectedDay])

  // Get updates for selected day
  const selectedDayUpdates = useMemo(() => {
    if (!selectedDay) return []
    const dayGroup = groupedUpdatesByDay.find(g => g.date === selectedDay)
    return dayGroup?.updates || []
  }, [selectedDay, groupedUpdatesByDay])

  // Debug: Log updates data
  useEffect(() => {
    if (updates.length > 0) {
      console.log('✅ Updates loaded:', updates.length, 'items', updates)
    } else if (!isLoadingUpdates) {
      console.warn('⚠️ No updates found. Check:')
      console.warn('  1. Database has data: SELECT * FROM updates;')
      console.warn('  2. RLS policy allows authenticated users')
      console.warn('  3. User is authenticated:', !!user?.id)
    }
  }, [updates, isLoadingUpdates, user?.id])

  // Set up real-time invalidation for notifications
  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${user?.id}`,
    queryKeys: queryKeys.activity(user?.id),
    enabled: !!user?.id,
  })

  // Set up real-time invalidation for messages
  useRealtimeInvalidation({
    table: 'messages',
    event: 'INSERT',
    queryKeys: queryKeys.activity(user?.id),
    enabled: !!user?.id,
  })

  // Set up real-time invalidation for match_suggestions (multiple query keys)
  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.top(user?.id),
    enabled: !!user?.id,
  })

  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.count(user?.id),
    enabled: !!user?.id,
  })

  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.compatibility(user?.id),
    enabled: !!user?.id,
  })

  // Set up real-time invalidation for updates
  useRealtimeInvalidation({
    table: 'updates',
    event: '*',
    queryKeys: [...queryKeys.updates],
    enabled: true, // Always enabled - updates are public
  })


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
    <div className="space-y-2 lg:space-y-2 flex flex-col pb-24 md:pb-6">
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
            <div className="text-xl sm:text-2xl font-bold text-text-primary text-center">
              {Math.min(Math.round(avgCompatibility || 0), 100)}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 text-center">Avg Compatibility</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="text-xl sm:text-2xl font-bold text-text-primary text-center">{totalMatches}</div>
            <div className="text-xs text-text-secondary mt-0.5 text-center">Total Matches</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="text-xl sm:text-2xl font-bold text-text-primary text-center">{dashboardData.kpis.activeChats}</div>
            <div className="text-xs text-text-secondary mt-0.5 text-center">Active Chats</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Recent Matches and Recent Activity */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2 lg:gap-3"
      >
        {/* Recent Matches - Real Data */}
        <motion.div variants={fadeInUp} className="flex flex-col min-h-0">
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle flex flex-col h-full max-h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm lg:text-base font-bold text-text-primary">Recent Matches</h3>
              <button 
                className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text-primary hover:bg-bg-surface-alt rounded-lg transition-colors" 
                onClick={() => refetchRecentMatches()}
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
            ) : recentMatches.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {recentMatches.map((match) => (
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
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {match.score > 0 && (
                          <div className="text-xl font-bold text-semantic-accent">
                            {(() => {
                              // Handle both 0-1 range and 0-100 range scores
                              let displayScore = match.score
                              if (displayScore <= 1.0) {
                                // Score is in 0-1 range, convert to 0-100
                                displayScore = Math.round(displayScore * 100)
                              } else {
                                // Score is already in 0-100 range
                                displayScore = Math.round(displayScore)
                              }
                              // Cap at 100
                              return Math.min(displayScore, 100)
                            })()}
                          </div>
                        )}
                        <button 
                          onClick={() => handleChatWithMatch(match.userId || match.id)}
                          className="w-10 h-10 flex items-center justify-center bg-semantic-accent text-white rounded-lg hover:bg-semantic-accent-hover transition-colors"
                          aria-label="Chat with match"
                        >
                          <MessageCircle className="w-5 h-5" />
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
                onClick={() => refetchRecentActivity()}
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

      {/* Updates Section - Full width below Recent Matches/Activity */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="mt-2 sm:mt-2 lg:mt-3"
      >
        <motion.div variants={fadeInUp} className="flex flex-col">
          <div className="bg-bg-surface p-3 sm:p-4 rounded-xl shadow-sm border border-border-subtle flex flex-col max-h-[250px] sm:max-h-[300px] lg:max-h-[350px]">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm lg:text-base font-bold text-text-primary">Updates</h3>
              <button 
                className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text-primary hover:bg-bg-surface-alt rounded-lg transition-colors" 
                onClick={() => refetchUpdates()}
                disabled={isLoadingUpdates}
                title="Refresh updates"
              >
                {isLoadingUpdates ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {isLoadingUpdates ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : groupedUpdatesByDay.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Day Tabs */}
                {groupedUpdatesByDay.length > 1 && (
                  <div className="flex gap-1 mb-3 overflow-x-auto pb-2 flex-shrink-0" style={{ scrollbarWidth: 'thin' }}>
                    {groupedUpdatesByDay.map(({ date }) => {
                      const formatDate = (dateString: string) => {
                        const date = new Date(dateString)
                        const today = new Date()
                        const yesterday = new Date(today)
                        yesterday.setDate(yesterday.getDate() - 1)
                        
                        const dateObj = new Date(dateString)
                        const isToday = dateObj.toDateString() === today.toDateString()
                        const isYesterday = dateObj.toDateString() === yesterday.toDateString()
                        
                        if (isToday) return 'Today'
                        if (isYesterday) return 'Yesterday'
                        
                        return date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                        })
                      }
                      
                      const isSelected = selectedDay === date
                      
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDay(date)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                            isSelected
                              ? 'bg-bg-surface-alt text-text-primary border border-border-subtle'
                              : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-alt border border-transparent'
                          }`}
                        >
                          {formatDate(date)}
                        </button>
                      )
                    })}
                  </div>
                )}
                
                {/* Updates for Selected Day */}
                <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {selectedDayUpdates.length > 0 ? (
                    selectedDayUpdates.map((update) => {
                      // Always use grey color regardless of change_type - consistent styling
                      const updateColor = 'text-text-secondary border-border-subtle bg-bg-surface-alt'

                      return (
                        <div
                          key={update.id}
                          className={`p-2 sm:p-3 rounded-lg border flex-shrink-0 ${updateColor}`}
                        >
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h4 className="font-bold text-xs sm:text-sm truncate">{update.version}</h4>
                            <span className="text-xs text-text-muted flex-shrink-0 whitespace-nowrap">{formatTimeAgo(update.release_date + 'T00:00:00')}</span>
                          </div>
                          <ul className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs text-text-secondary">
                            {update.changes.map((change, index) => (
                              <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                                <span className="mt-0.5 flex-shrink-0 text-text-secondary">•</span>
                                <span className="flex-1 break-words text-text-secondary">{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <EmptyState
                        icon={Sparkles}
                        title="No updates for this day"
                        description="Select another day to view updates"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <EmptyState
                  icon={Sparkles}
                  title="No updates yet"
                  description="Platform updates and release notes will appear here"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

    </div>
  )
}
