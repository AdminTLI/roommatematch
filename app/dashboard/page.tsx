import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'
import type { DashboardData, TopMatch, RecentActivity } from '@/types/dashboard'
import { timeAgo } from '@/lib/utils/time'

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
  
  const hasCompletedQuestionnaire = !!submission

  // Fetch dashboard data
  const dashboardData = await fetchDashboardData(user.id)

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <DashboardContent 
        hasCompletedQuestionnaire={hasCompletedQuestionnaire}
        data={dashboardData}
      />
    </AppShell>
  )
}

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient()

  // Fetch profile for completion calculation
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Calculate profile completion
  const requiredFields = ['first_name', 'program', 'university_id', 'campus', 'degree_level', 'languages']
  const filledFields = requiredFields.filter(field => {
    const value = profile?.[field as keyof typeof profile]
    return value !== null && value !== undefined && value !== ''
  })
  const profileCompletion = profile ? Math.round((filledFields.length / requiredFields.length) * 100) : 0

  // Fetch matches (assuming matches table exists)
  const { data: matches, count: totalMatchesCount } = await supabase
    .from('matches')
    .select(`
      id,
      compatibility_score,
      created_at,
      user_b_id,
      profiles!matches_user_b_id_fkey(
        user_id,
        first_name,
        program,
        degree_level,
        university_id,
        universities(name)
      )
    `, { count: 'exact' })
    .eq('user_a_id', userId)
    .order('compatibility_score', { ascending: false })

  // Get new matches from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: newMatchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('user_a_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())

  // Fetch unread messages count
  const { count: unreadMessagesCount } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .eq('is_read', false)
    .in('room_id', 
      supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', userId)
    )

  // Fetch active chats (chats with messages in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: chatRooms } = await supabase
    .from('chat_rooms')
    .select('id')
    .gte('updated_at', thirtyDaysAgo.toISOString())
    .in('id',
      supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', userId)
    )

  // Fetch tours scheduled (if table exists)
  const { count: toursScheduledCount } = await supabase
    .from('housing_tours')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('scheduled_at', new Date().toISOString())
    .catch(() => ({ count: 0 }))

  // Calculate average compatibility
  const avgCompatibility = matches && matches.length > 0
    ? Math.round(matches.slice(0, 3).reduce((sum, m) => sum + (m.compatibility_score || 0), 0) / Math.min(3, matches.length))
    : 0

  // Transform top matches
  const topMatches: TopMatch[] = (matches || []).slice(0, 3).map(match => {
    const matchedProfile = match.profiles as any
    const university = matchedProfile?.universities as any
    
    return {
      id: match.id,
      userId: match.user_b_id,
      name: matchedProfile?.first_name || 'User',
      score: match.compatibility_score || 0,
      program: matchedProfile?.program || 'Unknown Program',
      university: university?.name || 'Unknown University',
      avatar: undefined
    }
  })

  // Fetch recent activity
  const recentActivity: RecentActivity[] = []

  // Add recent matches to activity
  if (matches && matches.length > 0) {
    matches.slice(0, 2).forEach(match => {
      const matchedProfile = match.profiles as any
      recentActivity.push({
        id: `match-${match.id}`,
        type: 'match',
        action: 'New match found',
        user: matchedProfile?.first_name || 'User',
        userId: match.user_b_id,
        timestamp: match.created_at,
        timeAgo: timeAgo(match.created_at)
      })
    })
  }

  // Fetch recent messages
  const { data: recentMessages } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      sender:profiles!chat_messages_sender_id_fkey(first_name)
    `)
    .neq('sender_id', userId)
    .in('room_id',
      supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', userId)
    )
    .order('created_at', { ascending: false })
    .limit(2)

  // Add messages to activity
  if (recentMessages && recentMessages.length > 0) {
    recentMessages.forEach(msg => {
      const sender = msg.sender as any
      recentActivity.push({
        id: `message-${msg.id}`,
        type: 'message',
        action: 'Message received',
        user: sender?.first_name || 'User',
        userId: msg.sender_id,
        timestamp: msg.created_at,
        timeAgo: timeAgo(msg.created_at)
      })
    })
  }

  // Add profile update if recent
  if (profile?.updated_at) {
    const updatedDate = new Date(profile.updated_at)
    const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 7) {
      recentActivity.push({
        id: 'profile-update',
        type: 'profile',
        action: 'Profile updated',
        user: 'You',
        userId: userId,
        timestamp: profile.updated_at,
        timeAgo: timeAgo(profile.updated_at)
      })
    }
  }

  // Sort activity by timestamp and limit to 4
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const limitedActivity = recentActivity.slice(0, 4)

  return {
    summary: {
      newMatchesCount: newMatchesCount || 0,
      unreadMessagesCount: unreadMessagesCount || 0,
      profileCompletion
    },
    kpis: {
      avgCompatibility,
      totalMatches: totalMatchesCount || 0,
      activeChats: chatRooms?.length || 0,
      toursScheduled: toursScheduledCount || 0
    },
    topMatches,
    recentActivity: limitedActivity
  }
}
