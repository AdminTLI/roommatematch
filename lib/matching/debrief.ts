// Match Debrief & Conversation Nudges System
// This module handles generating compatibility stories, conversation nudges, and engagement tracking

import { MatchExplanation } from './scoring'

export interface CompatibilityStory {
  overall_score: number
  breakdown: MatchExplanation
  top_strength: string
  watch_outs: string
  house_rules?: string
  generated_at: string
  chart_data?: {
    personality_overlap: number[]
    schedule_compatibility: number[]
    lifestyle_alignment: number[]
    social_preferences: number[]
  }
}

export interface FirstQuestions {
  ice_breakers: string[]
  logistics: string[]
  preferences: string[]
}

export interface MatchDebrief {
  id: string
  match_id: string
  user_a_id: string
  user_b_id: string
  compatibility_score: number
  compatibility_story: CompatibilityStory
  first_questions: FirstQuestions
  shared_interests: string[]
  potential_conflicts: string[]
  created_at: string
  updated_at: string
}

export interface ConversationNudge {
  id: string
  debrief_id: string
  user_id: string
  nudge_type: 'first_meeting' | 'weekly_checkin' | 'conflict_resolution' | 'move_planning' | 'agreement_setup'
  message: string
  action_suggested?: string
  scheduled_for: string
  sent_at?: string
  clicked_at?: string
  dismissed_at?: string
  created_at: string
}

export interface EngagementEvent {
  id: string
  debrief_id: string
  user_id: string
  event_type: 'debrief_viewed' | 'questions_used' | 'nudge_clicked' | 'nudge_dismissed' | 'chat_started' | 'conflict_reported' | 'agreement_signed'
  event_data: Record<string, any>
  created_at: string
}

export interface RelationalHealthScore {
  id: string
  debrief_id: string
  user_id: string
  week_number: number
  overall_satisfaction?: number
  communication_quality?: number
  conflict_level?: number
  shared_activities?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface NudgeInsights {
  nudge_type: string
  total_sent: number
  total_clicked: number
  click_rate: number
  total_dismissed: number
  dismiss_rate: number
}

export class MatchDebriefGenerator {
  /**
   * Generate a comprehensive compatibility story from match explanation
   */
  static generateCompatibilityStory(
    compatibilityScore: number,
    explanation: MatchExplanation,
    userAProfile: any,
    userBProfile: any
  ): CompatibilityStory {
    const chartData = this.generateChartData(explanation, userAProfile, userBProfile)
    
    return {
      overall_score: compatibilityScore,
      breakdown: explanation,
      top_strength: this.getTopStrengthDescription(explanation.top_alignment),
      watch_outs: this.getWatchOutDescription(explanation.watch_out),
      house_rules: explanation.house_rules_suggestion,
      generated_at: new Date().toISOString(),
      chart_data: chartData
    }
  }

  /**
   * Generate first conversation questions based on compatibility
   */
  static generateFirstQuestions(explanation: MatchExplanation): FirstQuestions {
    const baseQuestions = {
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
    }

    // Customize questions based on potential conflicts
    if (explanation.watch_out === 'schedule_conflicts') {
      baseQuestions.logistics.unshift('What does your typical daily schedule look like?')
    }
    
    if (explanation.watch_out === 'cleanliness_differences') {
      baseQuestions.logistics.push('How often do you like to clean your space?')
    }

    if (explanation.academic_bonus?.study_year_gap && explanation.academic_bonus.study_year_gap > 2) {
      baseQuestions.ice_breakers.push('What year are you in and what has been your favorite course so far?')
    }

    return baseQuestions
  }

  /**
   * Generate conversation nudges based on match timeline
   */
  static generateConversationNudges(
    debriefId: string,
    userAId: string,
    userBId: string,
    explanation: MatchExplanation
  ): Partial<ConversationNudge>[] {
    const now = new Date()
    const nudges: Partial<ConversationNudge>[] = []

    // Initial meeting nudge
    nudges.push({
      debrief_id: debriefId,
      user_id: userAId,
      nudge_type: 'first_meeting',
      message: 'You have a new match! Check out your compatibility story and suggested first questions to start a great conversation.',
      action_suggested: 'View Compatibility Story',
      scheduled_for: new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1 hour later
    })

    nudges.push({
      debrief_id: debriefId,
      user_id: userBId,
      nudge_type: 'first_meeting',
      message: 'You have a new match! Check out your compatibility story and suggested first questions to start a great conversation.',
      action_suggested: 'View Compatibility Story',
      scheduled_for: new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1 hour later
    })

    // Weekly check-in nudges
    nudges.push({
      debrief_id: debriefId,
      user_id: userAId,
      nudge_type: 'weekly_checkin',
      message: 'How is your roommate match going? Take a quick moment to share how things are progressing.',
      action_suggested: 'Update Relational Health',
      scheduled_for: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week later
    })

    nudges.push({
      debrief_id: debriefId,
      user_id: userBId,
      nudge_type: 'weekly_checkin',
      message: 'How is your roommate match going? Take a quick moment to share how things are progressing.',
      action_suggested: 'Update Relational Health',
      scheduled_for: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week later
    })

    // Conflict resolution nudge if there are potential issues
    if (explanation.watch_out !== 'none') {
      nudges.push({
        debrief_id: debriefId,
        user_id: userAId,
        nudge_type: 'conflict_resolution',
        message: `We noticed a potential ${explanation.watch_out.replace('_', ' ')}. Here are some tips for addressing this early.`,
        action_suggested: 'View Conflict Resolution Tips',
        scheduled_for: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days later
      })
    }

    return nudges
  }

  /**
   * Generate chart data for visual compatibility representation
   */
  private static generateChartData(explanation: MatchExplanation, userAProfile: any, userBProfile: any) {
    return {
      personality_overlap: [
        explanation.similarity_score,
        explanation.schedule_overlap,
        explanation.cleanliness_align,
        explanation.guests_noise_align
      ],
      schedule_compatibility: [
        userAProfile.sleepStart || 0,
        userAProfile.sleepEnd || 0,
        userBProfile.sleepStart || 0,
        userBProfile.sleepEnd || 0
      ],
      lifestyle_alignment: [
        explanation.cleanliness_align,
        explanation.guests_noise_align,
        explanation.schedule_overlap,
        explanation.similarity_score
      ],
      social_preferences: [
        userAProfile.socialLevel || 0,
        userBProfile.socialLevel || 0,
        userAProfile.guestsFrequency || 0,
        userBProfile.guestsFrequency || 0
      ]
    }
  }

  /**
   * Get human-readable description of top alignment
   */
  private static getTopStrengthDescription(alignment: string): string {
    const descriptions: Record<string, string> = {
      personality: 'You have very similar personalities and communication styles',
      schedule: 'Your daily routines and sleep schedules align perfectly',
      lifestyle: 'Your lifestyle preferences and habits are well-matched',
      social: 'You share similar social preferences and guest policies',
      academic: 'You have strong academic connections and shared goals'
    }
    return descriptions[alignment] || 'You have great overall compatibility'
  }

  /**
   * Get human-readable description of potential watch-outs
   */
  private static getWatchOutDescription(watchOut: string): string {
    const descriptions: Record<string, string> = {
      different_preferences: 'You have some different preferences that could lead to minor conflicts',
      cleanliness_differences: 'Your cleanliness standards differ, which might need discussion',
      schedule_conflicts: 'Your schedules might conflict, requiring coordination',
      academic_stage: 'Being at different academic stages might affect your priorities',
      none: 'No major compatibility concerns detected'
    }
    return descriptions[watchOut] || 'No major concerns'
  }

  /**
   * Calculate relational health score from weekly feedback
   */
  static calculateRelationalHealth(healthScore: RelationalHealthScore): number {
    const scores = [
      healthScore.overall_satisfaction,
      healthScore.communication_quality,
      healthScore.conflict_level ? 6 - healthScore.conflict_level : undefined, // Invert conflict score
      healthScore.shared_activities
    ].filter(score => score !== undefined && score !== null) as number[]

    if (scores.length === 0) return 0
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  /**
   * Generate engagement insights for admins
   */
  static generateEngagementInsights(events: EngagementEvent[]): {
    total_events: number
    most_common_event: string
    engagement_trend: 'increasing' | 'decreasing' | 'stable'
    top_engagement_drivers: string[]
  } {
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonEvent = Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'

    // Simple trend calculation based on recent vs older events
    const recentEvents = events.filter(e => 
      new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    const olderEvents = events.filter(e => 
      new Date(e.created_at) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      new Date(e.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    )

    let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (recentEvents.length > olderEvents.length * 1.2) engagementTrend = 'increasing'
    else if (recentEvents.length < olderEvents.length * 0.8) engagementTrend = 'decreasing'

    return {
      total_events: events.length,
      most_common_event: mostCommonEvent,
      engagement_trend: engagementTrend,
      top_engagement_drivers: Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([event]) => event)
    }
  }
}
