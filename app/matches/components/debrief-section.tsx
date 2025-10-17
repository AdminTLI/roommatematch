'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchDebriefCard } from '@/app/(components)/match-debrief-card'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  FileText, 
  MessageCircle, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { 
  MatchDebrief, 
  ConversationNudge, 
  RelationalHealthScore,
  MatchDebriefGenerator 
} from '@/lib/matching/debrief'

interface DebriefSectionProps {
  user: User
  onStartChat: (matchId: string) => void
}

export function DebriefSection({ user, onStartChat }: DebriefSectionProps) {
  const supabase = createClient()
  
  const [debriefs, setDebriefs] = useState<MatchDebrief[]>([])
  const [activeNudges, setActiveNudges] = useState<ConversationNudge[]>([])
  const [healthScores, setHealthScores] = useState<RelationalHealthScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadDebriefData()
  }, [])

  const loadDebriefData = async () => {
    setIsLoading(true)
    
    try {
      // For demo mode, use mock data
      if (user.id === 'demo-user-id') {
        const mockDebriefs = await generateMockDebriefs()
        const mockNudges = await generateMockNudges()
        const mockHealth = await generateMockHealthScores()
        
        setDebriefs(mockDebriefs)
        setActiveNudges(mockNudges)
        setHealthScores(mockHealth)
        setIsLoading(false)
        return
      }

      // Load user's match debriefs
      const { data: debriefData, error: debriefError } = await supabase
        .from('match_debriefs')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (debriefError) throw debriefError

      // Load active conversation nudges
      const { data: nudgeData, error: nudgeError } = await supabase
        .from('conversation_nudges')
        .select('*')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .is('sent_at', null)
        .order('scheduled_for', { ascending: true })

      if (nudgeError) throw nudgeError

      // Load relational health scores
      const { data: healthData, error: healthError } = await supabase
        .from('relational_health_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: false })

      if (healthError) throw healthError

      setDebriefs(debriefData || [])
      setActiveNudges(nudgeData || [])
      setHealthScores(healthData || [])

    } catch (error) {
      console.error('Failed to load debrief data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockDebriefs = async (): Promise<MatchDebrief[]> => {
    return [
      {
        id: 'debrief-1',
        match_id: 'match-1',
        user_a_id: user.id,
        user_b_id: 'user-2',
        compatibility_score: 0.87,
        compatibility_story: {
          overall_score: 0.87,
          breakdown: {
            similarity_score: 0.85,
            schedule_overlap: 0.92,
            cleanliness_align: 0.88,
            guests_noise_align: 0.84,
            penalty: 0.02,
            top_alignment: 'schedule',
            watch_out: 'none',
            house_rules_suggestion: 'Consider setting quiet hours from 10 PM to 8 AM to maintain your compatible sleep schedules.',
            academic_bonus: {
              university_affinity: true,
              program_affinity: false,
              faculty_affinity: false,
              study_year_gap: 1
            }
          },
          top_strength: 'Your daily routines and sleep schedules align perfectly',
          watch_outs: 'No major concerns',
          house_rules: 'Consider setting quiet hours from 10 PM to 8 AM to maintain your compatible sleep schedules.',
          generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          chart_data: {
            personality_overlap: [0.85, 0.92, 0.88, 0.84],
            schedule_compatibility: [22, 8, 23, 9],
            lifestyle_alignment: [0.88, 0.84, 0.92, 0.85],
            social_preferences: [0.7, 0.8, 0.6, 0.7]
          }
        },
        first_questions: {
          ice_breakers: [
            'What are you most excited about for this semester?',
            'Do you have any favorite study spots on campus?',
            'What kind of music do you like to listen to while studying?'
          ],
          logistics: [
            'What time do you usually wake up and go to bed?',
            'How do you prefer to handle cleaning and chores?',
            'Are you comfortable with having guests over?'
          ],
          preferences: [
            'What temperature do you prefer in the room?',
            'How do you like to handle noise levels?',
            'What are your thoughts on shared expenses?'
          ]
        },
        shared_interests: ['Computer Science', 'Early morning workouts', 'Quiet study environment'],
        potential_conflicts: [],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  const generateMockNudges = async (): Promise<ConversationNudge[]> => {
    return [
      {
        id: 'nudge-1',
        debrief_id: 'debrief-1',
        user_id: user.id,
        nudge_type: 'first_meeting',
        message: 'You have a new match! Check out your compatibility story and suggested first questions to start a great conversation.',
        action_suggested: 'View Compatibility Story',
        scheduled_for: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'nudge-2',
        debrief_id: 'debrief-1',
        user_id: user.id,
        nudge_type: 'weekly_checkin',
        message: 'How is your roommate match going? Take a quick moment to share how things are progressing.',
        action_suggested: 'Update Relational Health',
        scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  const generateMockHealthScores = async (): Promise<RelationalHealthScore[]> => {
    return [
      {
        id: 'health-1',
        debrief_id: 'debrief-1',
        user_id: user.id,
        week_number: 1,
        overall_satisfaction: 4,
        communication_quality: 4,
        conflict_level: 1,
        shared_activities: 3,
        notes: 'Great start! We had our first conversation and it went really well. Emma seems very considerate.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  const handleViewQuestions = (debriefId: string) => {
    // Track engagement and show questions
    console.log('Viewing questions for debrief:', debriefId)
  }

  const handleTrackEngagement = async (debriefId: string, eventType: string, eventData?: any) => {
    try {
      if (user.id === 'demo-user-id') {
        console.log('Demo: Tracking engagement', { debriefId, eventType, eventData })
        return
      }

      const { error } = await supabase.rpc('track_match_engagement', {
        p_debrief_id: debriefId,
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_data: eventData || {}
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to track engagement:', error)
    }
  }

  const handleUpdateHealth = async (
    debriefId: string, 
    weekNumber: number, 
    healthData: Partial<RelationalHealthScore>
  ) => {
    try {
      if (user.id === 'demo-user-id') {
        console.log('Demo: Updating health', { debriefId, weekNumber, healthData })
        // Add to mock data
        const newHealthScore: RelationalHealthScore = {
          id: `health-${Date.now()}`,
          debrief_id: debriefId,
          user_id: user.id,
          week_number: weekNumber,
          overall_satisfaction: healthData.overall_satisfaction,
          communication_quality: healthData.communication_quality,
          conflict_level: healthData.conflict_level,
          shared_activities: healthData.shared_activities,
          notes: healthData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setHealthScores(prev => [newHealthScore, ...prev])
        return
      }

      const { error } = await supabase
        .from('relational_health_scores')
        .upsert({
          debrief_id: debriefId,
          user_id: user.id,
          week_number: weekNumber,
          overall_satisfaction: healthData.overall_satisfaction,
          communication_quality: healthData.communication_quality,
          conflict_level: healthData.conflict_level,
          shared_activities: healthData.shared_activities,
          notes: healthData.notes
        })

      if (error) throw error

      // Reload health scores
      loadDebriefData()

    } catch (error) {
      console.error('Failed to update health:', error)
    }
  }

  const handleDismissNudge = async (nudgeId: string) => {
    try {
      if (user.id === 'demo-user-id') {
        console.log('Demo: Dismissing nudge', nudgeId)
        setActiveNudges(prev => prev.filter(n => n.id !== nudgeId))
        return
      }

      const { error } = await supabase
        .from('conversation_nudges')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', nudgeId)

      if (error) throw error

      setActiveNudges(prev => prev.filter(n => n.id !== nudgeId))

    } catch (error) {
      console.error('Failed to dismiss nudge:', error)
    }
  }

  const handleClickNudge = async (nudgeId: string) => {
    try {
      if (user.id === 'demo-user-id') {
        console.log('Demo: Clicking nudge', nudgeId)
        return
      }

      const { error } = await supabase
        .from('conversation_nudges')
        .update({ clicked_at: new Date().toISOString() })
        .eq('id', nudgeId)

      if (error) throw error

    } catch (error) {
      console.error('Failed to click nudge:', error)
    }
  }

  const filteredDebriefs = debriefs.filter(debrief => {
    if (activeTab === 'all') return true
    if (activeTab === 'with_nudges') {
      return activeNudges.some(nudge => nudge.debrief_id === debrief.id)
    }
    if (activeTab === 'with_health') {
      return healthScores.some(health => health.debrief_id === debrief.id)
    }
    return true
  })

  const totalNudges = activeNudges.length
  const pendingNudges = activeNudges.filter(nudge => !nudge.dismissed_at && !nudge.clicked_at)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Compatibility Stories
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Deep insights into your matches with conversation starters and relationship tracking
          </p>
        </div>
        
        {totalNudges > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {pendingNudges.length} new nudges
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{debriefs.length}</div>
                <div className="text-sm text-gray-500">Compatibility Stories</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{pendingNudges.length}</div>
                <div className="text-sm text-gray-500">Pending Nudges</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{healthScores.length}</div>
                <div className="text-sm text-gray-500">Health Checks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {healthScores.length > 0 
                    ? Math.round(healthScores.reduce((sum, h) => sum + (h.overall_satisfaction || 0), 0) / healthScores.length * 10) / 10
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-500">Avg. Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Stories ({debriefs.length})</TabsTrigger>
          <TabsTrigger value="with_nudges">
            With Nudges ({debriefs.filter(d => activeNudges.some(n => n.debrief_id === d.id)).length})
          </TabsTrigger>
          <TabsTrigger value="with_health">
            With Health ({debriefs.filter(d => healthScores.some(h => h.debrief_id === d.id)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredDebriefs.length > 0 ? (
            filteredDebriefs.map(debrief => {
              const debriefNudges = activeNudges.filter(nudge => nudge.debrief_id === debrief.id)
              const debriefHealth = healthScores.filter(health => health.debrief_id === debrief.id)
              
              return (
                <MatchDebriefCard
                  key={debrief.id}
                  debrief={debrief}
                  activeNudges={debriefNudges}
                  healthScores={debriefHealth}
                  onViewQuestions={handleViewQuestions}
                  onStartChat={onStartChat}
                  onTrackEngagement={handleTrackEngagement}
                  onUpdateHealth={handleUpdateHealth}
                  onDismissNudge={handleDismissNudge}
                  onClickNudge={handleClickNudge}
                />
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No compatibility stories yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Compatibility stories are generated when you accept matches. Start matching to see your personalized insights!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
