import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/events'

export interface ActivityEvent {
  type: 'profile_updated' | 'questionnaire_submitted' | 'match_created' | 'message_received' | 'match_accepted' | 'match_rejected'
  userId: string
  description: string
  metadata?: Record<string, any>
}

export class ActivityTracker {
  private supabase = createClient()

  async trackActivity(event: ActivityEvent): Promise<void> {
    try {
      // Track the event using the existing event system
      await trackEvent(event.type, {
        description: event.description,
        ...event.metadata
      }, event.userId)

      // Create a notification entry
      await this.createNotification(event)
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }

  private async createNotification(event: ActivityEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: event.userId,
          type: event.type,
          title: this.getNotificationTitle(event.type),
          message: event.description,
          metadata: event.metadata || {},
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to create notification:', error)
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  private getNotificationTitle(type: ActivityEvent['type']): string {
    const titles: Record<ActivityEvent['type'], string> = {
      profile_updated: 'Profile Updated',
      questionnaire_submitted: 'Questionnaire Submitted',
      match_created: 'New Match Found',
      message_received: 'New Message',
      match_accepted: 'Match Accepted',
      match_rejected: 'Match Declined'
    }
    return titles[type]
  }
}

// Global activity tracker instance
let globalActivityTracker: ActivityTracker | null = null

export function getActivityTracker(): ActivityTracker {
  if (!globalActivityTracker) {
    globalActivityTracker = new ActivityTracker()
  }
  return globalActivityTracker
}

// Convenience functions for common activities
export async function trackProfileUpdate(userId: string, changes: string[]): Promise<void> {
  const tracker = getActivityTracker()
  await tracker.trackActivity({
    type: 'profile_updated',
    userId,
    description: `Updated profile: ${changes.join(', ')}`,
    metadata: { changes }
  })
}

export async function trackQuestionnaireSubmission(userId: string): Promise<void> {
  const tracker = getActivityTracker()
  await tracker.trackActivity({
    type: 'questionnaire_submitted',
    userId,
    description: 'Completed compatibility questionnaire'
  })
}

export async function trackNewMatch(userId: string, matchId: string, matchName: string): Promise<void> {
  const tracker = getActivityTracker()
  await tracker.trackActivity({
    type: 'match_created',
    userId,
    description: `New match found with ${matchName}`,
    metadata: { matchId, matchName }
  })
}

export async function trackMessageReceived(userId: string, senderName: string, chatId: string): Promise<void> {
  const tracker = getActivityTracker()
  await tracker.trackActivity({
    type: 'message_received',
    userId,
    description: `New message from ${senderName}`,
    metadata: { senderName, chatId }
  })
}
