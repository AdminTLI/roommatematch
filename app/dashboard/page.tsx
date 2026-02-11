import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'
import { DomuChatWidget } from './components/domu-chat-widget'
import type { DashboardData } from '@/types/dashboard'
import { checkQuestionnaireCompletion, questionSchemas } from '@/lib/onboarding/validation'
import { calculateSectionProgress } from '@/lib/onboarding/sections'
import { getUserProfile } from '@/lib/auth/user-profile'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'
import matchModeConfig from '@/config/match-mode.json'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Force refresh the user session to get latest auth state
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Dashboard] User auth data:', {
      id: user?.id,
      email: user?.email,
      email_confirmed_at: user?.email_confirmed_at,
      email_confirmed_at_type: typeof user?.email_confirmed_at,
      user_metadata: user?.user_metadata,
      userError
    })
  }

  // Redirect to sign-in if user is not authenticated
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check verification status (backup check - middleware also enforces this)
  const verificationStatus = await checkUserVerificationStatus(user)
  const redirectUrl = getVerificationRedirectUrl(verificationStatus)
  if (redirectUrl) {
    if (redirectUrl === '/auth/verify-email' && user.email) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}&auto=1`)
    } else {
      redirect(redirectUrl)
    }
  }

  // Check questionnaire completion status using the helper
  const completionStatus = await checkQuestionnaireCompletion(user.id)
  const hasCompletedQuestionnaire = completionStatus.isComplete
  const hasPartialProgress = completionStatus.responseCount > 0 && !hasCompletedQuestionnaire
  const progressCount = completionStatus.responseCount

  // Calculate profile completion
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  let profileCompletion = 0
  if (profile) {
    const requiredFields = ['first_name', 'last_name', 'phone', 'bio']
    const filledFields = requiredFields.filter(field => {
      const value = profile[field]
      return value !== null && value !== undefined && value !== ''
    })
    profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100)
  }

  // Questionnaire progress data
  const sectionProgress = calculateSectionProgress(completionStatus.missingKeys)
  const totalRequired = Object.keys(questionSchemas).length
  const completedCount = totalRequired - completionStatus.missingKeys.length
  const questionnaireProgress = {
    completedSections: sectionProgress.completedSections,
    totalSections: sectionProgress.totalSections,
    isSubmitted: hasCompletedQuestionnaire,
    completionPercentage: Math.round((completedCount / totalRequired) * 100)
  }

  // Fetch dashboard data with error handling
  let dashboardData: DashboardData
  try {
    dashboardData = await fetchDashboardData(user.id)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Return empty data structure on error
    dashboardData = {
      summary: {
        newMatchesCount: 0,
        unreadMessagesCount: 0,
        profileCompletion: 0
      },
      kpis: {
        avgCompatibility: 0,
        totalMatches: 0,
        activeChats: 0,
        toursScheduled: 0
      },
      topMatches: [],
      recentActivity: []
    }
  }

  // Get user profile with proper name
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  return (
    <>
      <AppShell 
        user={userProfile}
        showQuestionnairePrompt={true}
      >
        <DashboardContent 
          hasCompletedQuestionnaire={hasCompletedQuestionnaire}
          hasPartialProgress={hasPartialProgress}
          progressCount={progressCount}
          profileCompletion={profileCompletion}
          questionnaireProgress={questionnaireProgress}
          dashboardData={dashboardData}
          user={userProfile}
          firstName={profile?.first_name || ''}
        />
      </AppShell>
      <DomuChatWidget />
    </>
  )
}

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient()

  // Initialize with default values
  let profileCompletion = 0
  let newMatchesCount = 0
  let unreadMessagesCount = 0
  let totalMatchesCount = 0
  let activeChatsCount = 0
  let toursScheduledCount = 0
  let topMatches: any[] = []
  let recentActivity: any[] = []
  let avgCompatibility = 0

  try {
    // Fetch profile for completion calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profile) {
      const requiredFields = ['first_name', 'program', 'university_id', 'campus', 'degree_level']
      const filledFields = requiredFields.filter(field => {
        const value = profile[field as keyof typeof profile]
        return value !== null && value !== undefined && value !== ''
      })
      profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100)
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }

  try {
    // Fetch non-expired confirmed pair matches where user is a member.
    // We deduplicate by other user ID so repeated suggestions
    // for the same pair do not inflate the match count.
    // Only includes matches where both users have accepted (status = 'confirmed').
    const now = new Date().toISOString()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: suggestions, error } = await supabase
      .from('match_suggestions')
      .select('id, member_ids, fit_score, created_at, status, expires_at')
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .eq('status', 'confirmed') // Only show confirmed matches where both users have accepted
      .gte('expires_at', now)

    if (error) {
      console.error('Error fetching match suggestions:', error)
    } else if (suggestions && suggestions.length > 0) {
      // Track unique matched users and their first creation date
      const matchMap = new Map<string, Date>()

      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return

        const otherUserId = memberIds[0] === userId ? memberIds[1] : memberIds[0]
        const createdAt = new Date(s.created_at)

        const existing = matchMap.get(otherUserId)
        if (!existing || createdAt < existing) {
          matchMap.set(otherUserId, createdAt)
        }
      })

      totalMatchesCount = matchMap.size
      newMatchesCount = Array.from(matchMap.values()).filter(
        (createdAt) => createdAt >= sevenDaysAgo
      ).length
    } else {
      // Fallback for legacy data: use matches table if there are no suggestions.
      console.log('[Dashboard] No active match_suggestions, falling back to matches table')

      const { count: matchesAsA } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('a_user', userId)

      const { count: matchesAsB } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('b_user', userId)

      totalMatchesCount = (matchesAsA || 0) + (matchesAsB || 0)

      const sevenDaysAgoLegacy = new Date()
      sevenDaysAgoLegacy.setDate(sevenDaysAgoLegacy.getDate() - 7)

      const { count: newMatchesAsA } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('a_user', userId)
        .gte('created_at', sevenDaysAgoLegacy.toISOString())

      const { count: newMatchesAsB } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('b_user', userId)
        .gte('created_at', sevenDaysAgoLegacy.toISOString())

      newMatchesCount = (newMatchesAsA || 0) + (newMatchesAsB || 0)
    }
  } catch (error) {
    console.error('Error fetching match counts:', error)
  }

  try {
    // Get chats where user is a member
    const { data: userChats } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', userId)

    const chatIds = userChats?.map(c => c.chat_id) || []

    if (chatIds.length > 0) {
      // Fetch all messages in user's chats
      const { data: allMessages } = await supabase
        .from('messages')
        .select('id')
        .in('chat_id', chatIds)
        .neq('user_id', userId)

      // Fetch user's read messages
      const { data: readMessages } = await supabase
        .from('message_reads')
        .select('message_id')
        .eq('user_id', userId)

      const readMessageIds = new Set(readMessages?.map(r => r.message_id) || [])
      const unreadCount = allMessages?.filter(m => !readMessageIds.has(m.id)).length || 0
      unreadMessagesCount = unreadCount
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  }

  try {
    // Fetch active chats count using chats and chat_members tables
    const { count } = await supabase
      .from('chat_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    activeChatsCount = count || 0
  } catch (error) {
    console.error('Error fetching chats:', error)
  }

  try {
    // Housing tours table doesn't exist yet - return 0
    toursScheduledCount = 0
  } catch (error) {
    console.error('Error fetching tours:', error)
  }

  try {
    // Fetch recent pending match suggestions (ordered by created_at, most recent first)
    // Only show pending suggestions (not yet responded to)
    // IMPORTANT: We must filter out matches where the user has already accepted
    // These should appear in the "pending" tab (waiting for other user), not on the dashboard
    // Also filter by minFitIndex to match the API endpoint behavior (config/match-mode.json)
    const now = new Date().toISOString()
    const minFitIndex = matchModeConfig.minFitIndex || 0
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('match_suggestions')
      .select(`
        id,
        member_ids,
        fit_score,
        fit_index,
        created_at,
        accepted_by,
        status,
        expires_at
      `)
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .eq('status', 'pending') // Only show pending suggestions (not yet responded to)
      .gte('expires_at', now) // Only non-expired suggestions
      .gte('fit_index', minFitIndex) // Filter by minFitIndex to match API endpoint behavior
      .order('created_at', { ascending: false }) // Most recent first
      .limit(20) // Get enough records to deduplicate and find 3 most recent

    if (suggestionsError) {
      console.error('[Dashboard] Error fetching match suggestions:', suggestionsError)
    }

    if (suggestions && suggestions.length > 0) {
      // Extract other user IDs and deduplicate by keeping most recent
      // Map: otherUserId -> { created_at }
      // Also filter out suggestions where user has already accepted (they should go to pending tab, not suggested)
      const matchMap = new Map<string, string>() // Map userId -> created_at
      let filteredCount = 0
      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) {
          console.warn('[Dashboard] Invalid member_ids in suggestion:', s.id, memberIds)
          return
        }
        
        // CRITICAL FILTER: Skip if user has already accepted this suggestion
        // These matches should appear in the "pending" tab (waiting for other user's response),
        // NOT in the dashboard or "suggested" tab
        const acceptedBy = s.accepted_by || []
        if (Array.isArray(acceptedBy) && acceptedBy.includes(userId)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Dashboard] Filtering out accepted suggestion:', {
              suggestionId: s.id,
              userId,
              acceptedBy,
              status: s.status
            })
          }
          filteredCount++
          return
        }
        
        // Additional safety check: if status is not pending, skip it
        if (s.status !== 'pending') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Dashboard] Unexpected non-pending status in query results:', {
              suggestionId: s.id,
              status: s.status,
              userId
            })
          }
          return
        }
        
        const otherUserId = memberIds[0] === userId ? memberIds[1] : memberIds[0]
        
        // Keep the most recent suggestion for each user
        const existing = matchMap.get(otherUserId)
        if (!existing || new Date(s.created_at) > new Date(existing)) {
          matchMap.set(otherUserId, s.created_at)
        }
      })

      if (process.env.NODE_ENV === 'development' && filteredCount > 0) {
        console.log('[Dashboard] Filtered out accepted suggestions:', filteredCount)
      }

      // Get the 3 most recent unique matches (sorted by created_at)
      const recentMatches = Array.from(matchMap.entries())
        .map(([userId, created_at]) => ({ userId, created_at }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) // Take 3 most recent

      if (recentMatches.length > 0) {
        const recentUserIds = recentMatches.map(m => m.userId)

        // Compute compatibility scores using the new algorithm for each matched user
        const compatibilityScores = await Promise.all(
          recentUserIds.map(async (otherUserId) => {
            try {
              const { data, error } = await supabase.rpc('compute_compatibility_score', {
                user_a_id: userId,
                user_b_id: otherUserId
              })
              
              if (error) {
                console.error(`Error computing compatibility score for ${otherUserId}:`, error)
                return { userId: otherUserId, score: 0 }
              }
              
              // The function returns a table (array), get the first row
              const result = Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
              const compatibilityScore = Number(result.compatibility_score || 0)
              const harmonyScore = result?.harmony_score != null && result?.harmony_score !== undefined
                ? Number(result.harmony_score)
                : 0
              const contextScore = result?.context_score != null && result?.context_score !== undefined
                ? Number(result.context_score)
                : 0
              
              // Extract dimension_scores_json - handle JSONB from PostgreSQL
              let dimensionScores: { [key: string]: number } | null = null
              if (result?.dimension_scores_json) {
                if (typeof result.dimension_scores_json === 'object' && result.dimension_scores_json !== null) {
                  const keys = Object.keys(result.dimension_scores_json)
                  if (keys.length > 0) {
                    dimensionScores = result.dimension_scores_json as { [key: string]: number }
                  }
                } else if (typeof result.dimension_scores_json === 'string') {
                  try {
                    const parsed = JSON.parse(result.dimension_scores_json)
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                      dimensionScores = parsed as { [key: string]: number }
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
              
              return { userId: otherUserId, score: compatibilityScore, harmonyScore, contextScore, dimensionScores }
            } catch (error) {
              console.error(`Error computing compatibility score for ${otherUserId}:`, error)
              return { userId: otherUserId, score: 0, harmonyScore: 0, contextScore: 0, dimensionScores: null }
            }
          })
        )

        // Create maps for easy lookup
        const scoreMap = new Map(compatibilityScores.map(m => [m.userId, m.score]))
        const harmonyScoreMap = new Map(compatibilityScores.map(m => [m.userId, (m as any).harmonyScore]))
        const contextScoreMap = new Map(compatibilityScores.map(m => [m.userId, (m as any).contextScore]))
        const dimensionScoresMap = new Map(compatibilityScores.map(m => [m.userId, (m as any).dimensionScores]))

        // Maintain the order from recentMatches (most recent first) and add scores
        const recentEntries = recentMatches.map(({ userId, created_at }) => ({
          userId,
          created_at,
          score: scoreMap.get(userId) || 0,
          harmonyScore: harmonyScoreMap.get(userId),
          contextScore: contextScoreMap.get(userId),
          dimensionScores: dimensionScoresMap.get(userId) || null
        }))

        if (recentEntries.length > 0) {
          const finalUserIds = recentEntries.map(m => m.userId)
        
          // Fetch profiles for matched users
          const { data: profiles } = await supabase
            .from('profiles')
            .select(`
              user_id,
              first_name,
              program,
              university_id,
              universities(name)
            `)
            .in('user_id', finalUserIds)

          // Fetch program names
          const { data: academicData } = await supabase
            .from('user_academic')
            .select(`
              user_id,
              program_id,
              programs!user_academic_program_id_fkey(name)
            `)
            .in('user_id', finalUserIds)

          const programMap = new Map<string, string>()
          academicData?.forEach((academic: any) => {
            if (academic.programs?.name) {
              programMap.set(academic.user_id, academic.programs.name)
            }
          })

          // Build recent matches array
          // Helper function to check if a string is a UUID
          const isUUID = (str: string): boolean => {
            if (!str || typeof str !== 'string') return false
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true
            if (/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i.test(str)) return true
            return false
          }
          
          // Remove UUIDs from strings
          const removeUUIDs = (str: string): string => {
            if (!str || typeof str !== 'string') return str
            return str.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '').trim()
          }
          
          topMatches = recentEntries.map(({ userId: otherUserId, score: compatibilityScore, harmonyScore, contextScore, dimensionScores }) => {
          const profile = profiles?.find((p: any) => p.user_id === otherUserId)
          const programName = programMap.get(otherUserId)
          
          // Clean name
          let safeName = profile?.first_name || 'User'
          safeName = removeUUIDs(safeName)
          if (isUUID(safeName) || safeName === otherUserId || !safeName) {
            safeName = 'User'
          }
          
          // Clean program
          let safeProgram = programName || profile?.program || ''
          safeProgram = removeUUIDs(safeProgram)
          if (isUUID(safeProgram) || safeProgram === otherUserId || !safeProgram) {
            safeProgram = ''
          }
          
          // Clean university
          const universityName = (profile?.universities as any)?.name || ''
          let safeUniversity = removeUUIDs(universityName)
          if (isUUID(safeUniversity) || safeUniversity === otherUserId || !safeUniversity) {
            safeUniversity = ''
          }
          
          return {
            id: otherUserId, // Use userId as id since we don't have suggestion id anymore
            userId: otherUserId, // Also include as userId for client-side compatibility
            name: safeName,
            score: compatibilityScore, // Use new algorithm's compatibility_score (0-1 range)
            harmonyScore: harmonyScore != null && harmonyScore !== undefined ? Number(harmonyScore) : 0,
            contextScore: contextScore != null && contextScore !== undefined ? Number(contextScore) : 0,
            dimensionScores: dimensionScores || null,
            program: safeProgram,
            university: safeUniversity,
            avatar: undefined
          }
          })
        }

        // Override total matches count with unique matched users
        totalMatchesCount = matchMap.size
      
          // Calculate average compatibility from ALL matches using new algorithm
          // Compute compatibility scores for all matched users
          const allCompatibilityScores = await Promise.all(
            Array.from(matchMap.keys()).map(async (otherUserId) => {
          try {
            const { data, error } = await supabase.rpc('compute_compatibility_score', {
              user_a_id: userId,
              user_b_id: otherUserId
            })
            
            if (error) {
              console.error(`Error computing compatibility score for ${otherUserId}:`, error)
              return 0
            }
            
            // The function returns a table (array), get the first row
            const result = Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
            return Number(result.compatibility_score || 0)
          } catch (error) {
            console.error(`Error computing compatibility score for ${otherUserId}:`, error)
            return 0
          }
        })
      )
      
      const allScores = allCompatibilityScores
        .map(score => Math.min(score, 1.0)) // Cap each score at 1.0 (100%)
        .filter(score => score > 0) // Only include valid scores
      
      if (allScores.length > 0) {
        const avgCompatibilityFromAll = Math.min(
          Math.round(
            (allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100
          ),
          100 // Cap the final result at 100%
        )
          // Store for use later (will override the topMatches-based calculation)
          avgCompatibility = avgCompatibilityFromAll
        }
      }
    } else {
      // Fallback to legacy matches table if no suggestions exist
      console.log('[Dashboard] No match_suggestions for top matches, falling back to matches table')

      const { data: matchesAsA } = await supabase
        .from('matches')
        .select(`
          id, 
          score, 
          created_at, 
          b_user,
          profiles!matches_b_user_fkey(
            first_name,
            program,
            university_id,
            universities!profiles_university_id_fkey(name)
          )
        `)
        .eq('a_user', userId)
        .order('score', { ascending: false })
        .limit(3)

      const { data: matchesAsB } = await supabase
        .from('matches')
        .select(`
          id, 
          score, 
          created_at, 
          a_user,
          profiles!matches_a_user_fkey(
            first_name,
            program,
            university_id,
            universities!profiles_university_id_fkey(name)
          )
        `)
        .eq('b_user', userId)
        .order('score', { ascending: false })
        .limit(3)

      const allMatches = [
        ...(matchesAsA || []).map(match => ({
          ...match,
          otherUserId: match.b_user,
          otherProfile: match.profiles
        })),
        ...(matchesAsB || []).map(match => ({
          ...match,
          otherUserId: match.a_user,
          otherProfile: match.profiles
        }))
      ].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)

      if (allMatches.length > 0) {
        // Helper function to check if a string is a UUID
        const isUUID = (str: string): boolean => {
          if (!str || typeof str !== 'string') return false
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true
          if (/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i.test(str)) return true
          return false
        }
        
        // Remove UUIDs from strings
        const removeUUIDs = (str: string): string => {
          if (!str || typeof str !== 'string') return str
          return str.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '').trim()
        }
        
        topMatches = allMatches.map(match => {
          const otherUserId = (match as any).otherUserId
          
          // Clean name
          let safeName = (match.otherProfile as any)?.first_name || 'User'
          safeName = removeUUIDs(safeName)
          if (isUUID(safeName) || safeName === otherUserId || !safeName) {
            safeName = 'User'
          }
          
          // Clean program
          let safeProgram = (match.otherProfile as any)?.program || ''
          safeProgram = removeUUIDs(safeProgram)
          if (isUUID(safeProgram) || safeProgram === otherUserId || !safeProgram) {
            safeProgram = ''
          }
          
          // Clean university
          let safeUniversity = (match.otherProfile as any)?.universities?.name || ''
          safeUniversity = removeUUIDs(safeUniversity)
          if (isUUID(safeUniversity) || safeUniversity === otherUserId || !safeUniversity) {
            safeUniversity = ''
          }
          
          return {
            id: match.id,
            name: safeName,
            score: (match.score || 0), // Keep as 0-1 range for consistency
            program: safeProgram,
            university: safeUniversity,
            avatar: undefined
          }
        })
      }
    }
  } catch (error) {
    console.error('Error fetching top match suggestions:', error)
  }

  try {
    // Fetch recent activity using messages table
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id, 
        created_at, 
        content,
        user_id,
        profiles!messages_user_id_fkey(first_name)
      `)
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2)

    if (messages) {
      recentActivity = messages.map(msg => ({
        id: `message-${msg.id}`,
        type: 'message',
        action: 'Message received',
        user: (msg.profiles as any)?.first_name || 'User',
        timestamp: msg.created_at
      }))
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
  }

  // Calculate average compatibility
  // If not already calculated from all matches, fall back to topMatches (for legacy matches table case)
  if (avgCompatibility === 0 && topMatches.length > 0) {
    const topScores = topMatches
      .map(m => Math.min(m.score, 1.0)) // Cap at 1.0
      .filter(score => score > 0) // Only valid scores
    if (topScores.length > 0) {
      avgCompatibility = Math.min(
        Math.round(
          (topScores.reduce((sum, score) => sum + score, 0) / topScores.length) * 100
        ),
        100
      )
    }
  }

  return {
    summary: {
      newMatchesCount,
      unreadMessagesCount,
      profileCompletion
    },
    kpis: {
      avgCompatibility,
      totalMatches: totalMatchesCount,
      activeChats: activeChatsCount,
      toursScheduled: toursScheduledCount
    },
    topMatches,
    recentActivity
  }
}
