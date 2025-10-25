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

  // Check questionnaire completion status
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  
  // Check for partial progress
  const { data: sections } = await supabase
    .from('onboarding_sections')
    .select('section')
    .eq('user_id', user.id)
  
  const hasCompletedQuestionnaire = !!submission
  const hasPartialProgress = sections && sections.length > 0 && !hasCompletedQuestionnaire
  const progressCount = sections?.length || 0

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
    completedSections: sections?.length || 0,
    totalSections: 9,
    isSubmitted: !!submission
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
        user={user}
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
      const requiredFields = ['first_name', 'program', 'university_id', 'campus', 'degree_level', 'languages']
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
    // Fetch matches count
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_a_id', userId)
    
    totalMatchesCount = count || 0

    // Get new matches from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: newMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_a_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
    
    newMatchesCount = newMatches || 0
  } catch (error) {
    console.error('Error fetching matches:', error)
  }

  try {
    // Fetch unread messages count
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
    
    unreadMessagesCount = count || 0
  } catch (error) {
    console.error('Error fetching messages:', error)
  }

  try {
    // Fetch active chats count
    const { count } = await supabase
      .from('chat_rooms')
      .select('*', { count: 'exact', head: true })
    
    activeChatsCount = count || 0
  } catch (error) {
    console.error('Error fetching chats:', error)
  }

  try {
    // Fetch tours scheduled count
    const { count } = await supabase
      .from('housing_tours')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    toursScheduledCount = count || 0
  } catch (error) {
    console.error('Error fetching tours:', error)
  }

  try {
    // Fetch top matches (simplified)
    const { data: matches } = await supabase
      .from('matches')
      .select('id, compatibility_score, created_at, user_b_id')
      .eq('user_a_id', userId)
      .order('compatibility_score', { ascending: false })
      .limit(3)

    if (matches) {
      topMatches = matches.map(match => ({
        id: match.id,
        name: 'User', // Simplified for now
        score: match.compatibility_score || 0,
        program: 'Program',
        university: 'University',
        avatar: undefined
      }))
    }
  } catch (error) {
    console.error('Error fetching top matches:', error)
  }

  try {
    // Fetch recent activity (simplified)
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id, created_at, content')
      .neq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(2)

    if (messages) {
      recentActivity = messages.map(msg => ({
        id: `message-${msg.id}`,
        type: 'message',
        action: 'Message received',
        user: 'User',
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