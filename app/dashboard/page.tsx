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
  
  console.log('[Dashboard] User auth data:', {
    id: user?.id,
    email: user?.email,
    email_confirmed_at: user?.email_confirmed_at,
    email_confirmed_at_type: typeof user?.email_confirmed_at,
    user_metadata: user?.user_metadata,
    userError
  })

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
    // Fetch match suggestions count - user is in member_ids array
    const now = new Date().toISOString()
    const { count } = await supabase
      .from('match_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .neq('status', 'rejected')
      .gte('expires_at', now) // Only non-expired suggestions
    
    totalMatchesCount = count || 0

    // Get new match suggestions from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: newCount } = await supabase
      .from('match_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .neq('status', 'rejected')
      .gte('created_at', sevenDaysAgo.toISOString())
      .gte('expires_at', now) // Only non-expired suggestions
    
    newMatchesCount = newCount || 0
  } catch (error) {
    console.error('Error fetching match suggestions:', error)
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
      .limit(10) // Get more to deduplicate and find top 3

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
        const topUserIds = topEntries.map(([userId]) => userId)
        
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