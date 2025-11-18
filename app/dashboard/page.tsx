import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'
import type { DashboardData } from '@/types/dashboard'
import { checkQuestionnaireCompletion, questionSchemas } from '@/lib/onboarding/validation'
import { calculateSectionProgress } from '@/lib/onboarding/sections'
import { getUserProfile } from '@/lib/auth/user-profile'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'

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
    // Fetch non-expired pair suggestions where user is a member.
    // We deduplicate by other user ID so repeated suggestions
    // for the same pair do not inflate the match count.
    const now = new Date().toISOString()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: suggestions, error } = await supabase
      .from('match_suggestions')
      .select('id, member_ids, fit_score, created_at, status, expires_at')
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .neq('status', 'rejected')
      .gte('expires_at', now)

    if (error) {
      console.error('Error fetching match suggestions:', error)
    } else if (suggestions && suggestions.length > 0) {
      const matchMap = new Map<
        string,
        { firstCreatedAt: Date; bestFitScore: number }
      >()

      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return

        const otherUserId = memberIds[0] === userId ? memberIds[1] : memberIds[0]
        const fitScore = Number(s.fit_score || 0)
        const createdAt = new Date(s.created_at)

        const existing = matchMap.get(otherUserId)
        if (!existing) {
          matchMap.set(otherUserId, {
            firstCreatedAt: createdAt,
            bestFitScore: fitScore
          })
        } else {
          if (createdAt < existing.firstCreatedAt) {
            existing.firstCreatedAt = createdAt
          }
          if (fitScore > existing.bestFitScore) {
            existing.bestFitScore = fitScore
          }
        }
      })

      totalMatchesCount = matchMap.size
      newMatchesCount = Array.from(matchMap.values()).filter(
        (m) => m.firstCreatedAt >= sevenDaysAgo
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
    // Fetch top match suggestions
    const now = new Date().toISOString()
    const { data: suggestions } = await supabase
      .from('match_suggestions')
      .select(`
        id,
        member_ids,
        fit_score,
        fit_index,
        created_at
      `)
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .neq('status', 'rejected')
      .gte('expires_at', now) // Only non-expired suggestions
      .order('fit_index', { ascending: false })
      .limit(50) // Get enough records to deduplicate

    if (suggestions && suggestions.length > 0) {
      // Extract other user IDs and deduplicate by keeping highest fit_score
      const matchMap = new Map<string, { id: string; fit_score: number }>()
      suggestions.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return
        
        const otherUserId = memberIds[0] === userId ? memberIds[1] : memberIds[0]
        const fitScore = Number(s.fit_score || 0)
        
        const existing = matchMap.get(otherUserId)
        if (!existing || fitScore > existing.fit_score) {
          matchMap.set(otherUserId, { id: s.id, fit_score: fitScore })
        }
      })

      // Get top 3 by fit_score
      const topEntries = Array.from(matchMap.entries())
        .sort((a, b) => b[1].fit_score - a[1].fit_score)
        .slice(0, 3)

      if (topEntries.length > 0) {
        const topUserIds = topEntries.map(([otherUserId]) => otherUserId)
        
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
          .in('user_id', topUserIds)

        // Fetch program names
        const { data: academicData } = await supabase
          .from('user_academic')
          .select(`
            user_id,
            program_id,
            programs!user_academic_program_id_fkey(name)
          `)
          .in('user_id', topUserIds)

        const programMap = new Map<string, string>()
        academicData?.forEach((academic: any) => {
          if (academic.programs?.name) {
            programMap.set(academic.user_id, academic.programs.name)
          }
        })

        // Build top matches array
        topMatches = topEntries.map(([otherUserId, matchData]) => {
          const profile = profiles?.find((p: any) => p.user_id === otherUserId)
          const programName = programMap.get(otherUserId)
          
          return {
            id: matchData.id,
            name: profile?.first_name || 'User',
            score: Math.round(matchData.fit_score * 100),
            program: programName || profile?.program || 'Program',
            university: (profile?.universities as any)?.name || 'University',
            avatar: undefined
          }
        })
      }

      // Override total matches count with unique matched users
      totalMatchesCount = matchMap.size
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
        topMatches = allMatches.map(match => ({
          id: match.id,
          name: (match.otherProfile as any)?.first_name || 'User',
          score: Math.round((match.score || 0) * 100),
          program: (match.otherProfile as any)?.program || 'Program',
          university: (match.otherProfile as any)?.universities?.name || 'University',
          avatar: undefined
        }))
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
  const avgCompatibility = topMatches.length > 0 
    ? Math.round(topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length)
    : 0

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
