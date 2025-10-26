import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'
import type { DashboardData } from '@/types/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check questionnaire completion status by counting responses
  const { count: responseCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  const hasCompletedQuestionnaire = (responseCount || 0) >= 30 // threshold for complete responses
  const hasPartialProgress = (responseCount || 0) > 0 && !hasCompletedQuestionnaire
  const progressCount = responseCount || 0

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
  const questionnaireProgress = {
    completedSections: Math.min(Math.floor(progressCount / 4), 9), // Approximate sections based on response count
    totalSections: 9,
    isSubmitted: hasCompletedQuestionnaire
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

  return (
    <AppShell 
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 'User',
        avatar: user.user_metadata?.avatar_url
      }}
      showQuestionnairePrompt={true}
    >
      <DashboardContent 
        hasCompletedQuestionnaire={hasCompletedQuestionnaire}
        hasPartialProgress={hasPartialProgress}
        progressCount={progressCount}
        profileCompletion={profileCompletion}
        questionnaireProgress={questionnaireProgress}
        dashboardData={dashboardData}
        user={{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || 'User',
          avatar: user.user_metadata?.avatar_url
        }}
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
    // Fetch matches count - user can be either a_user or b_user
    const { count: matchesAsA } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('a_user', userId)
    
    const { count: matchesAsB } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('b_user', userId)
    
    totalMatchesCount = (matchesAsA || 0) + (matchesAsB || 0)

    // Get new matches from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: newMatchesAsA } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('a_user', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
    
    const { count: newMatchesAsB } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('b_user', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
    
    newMatchesCount = (newMatchesAsA || 0) + (newMatchesAsB || 0)
  } catch (error) {
    console.error('Error fetching matches:', error)
  }

  try {
    // Get chats where user is a member
    const { data: userChats } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', userId)

    const chatIds = userChats?.map(c => c.chat_id) || []

    if (chatIds.length > 0) {
      // Count unread messages in user's chats
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select(`
          id,
          message_reads!left(user_id)
        `)
        .in('chat_id', chatIds)
        .neq('user_id', userId)

      unreadMessagesCount = unreadMessages?.filter(msg => 
        !msg.message_reads || (Array.isArray(msg.message_reads) && msg.message_reads.length === 0)
      ).length || 0
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
    // Fetch top matches with proper column names
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
      .limit(2)

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
      .limit(2)

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
    ].sort((a, b) => b.score - a.score).slice(0, 3)

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
  } catch (error) {
    console.error('Error fetching top matches:', error)
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