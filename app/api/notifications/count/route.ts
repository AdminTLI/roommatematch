import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationType } from '@/lib/notifications/types';

const DEFAULT_NOTIFICATION_PREFS = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
} as const

const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'match_created',
  'match_accepted',
  'match_confirmed',
  'chat_message',
  'group_invitation',
  'profile_updated',
  'questionnaire_completed',
  'verification_status',
  'housing_update',
  'agreement_update',
  'safety_alert',
  'system_announcement',
  'admin_alert',
]

const MATCH_NOTIFICATION_TYPES: NotificationType[] = ['match_created', 'match_accepted', 'match_confirmed']
const MESSAGE_NOTIFICATION_TYPES: NotificationType[] = ['chat_message']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gate in-app notifications based on the user's push toggles.
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('user_id', user.id)
      .maybeSingle()

    const prefs = profile?.notification_preferences
    const mergedPrefs =
      typeof prefs === 'object' && prefs !== null
        ? { ...DEFAULT_NOTIFICATION_PREFS, ...(prefs as Record<string, unknown>) }
        : DEFAULT_NOTIFICATION_PREFS

    const pushMatchesEnabled = (mergedPrefs as any).pushMatches !== false
    const pushMessagesEnabled = (mergedPrefs as any).pushMessages !== false

    let allowedTypes = ALL_NOTIFICATION_TYPES
    if (!pushMatchesEnabled) {
      allowedTypes = allowedTypes.filter((t) => !MATCH_NOTIFICATION_TYPES.includes(t))
    }
    if (!pushMessagesEnabled) {
      allowedTypes = allowedTypes.filter((t) => !MESSAGE_NOTIFICATION_TYPES.includes(t))
    }

    if (allowedTypes.length === 0) {
      return NextResponse.json({
        total: 0,
        unread: 0,
        by_type: {},
      })
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('type', allowedTypes);

    if (totalError) {
      console.error('Failed to fetch total notification count:', totalError);
      return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .in('type', allowedTypes);

    if (unreadError) {
      console.error('Failed to fetch unread notification count:', unreadError);
      return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 });
    }

    // Get counts by type
    const { data: typeCounts, error: typeError } = await supabase
      .from('notifications')
      .select('type, is_read')
      .eq('user_id', user.id)
      .in('type', allowedTypes);

    if (typeError) {
      console.error('Failed to fetch notification type counts:', typeError);
      return NextResponse.json({ error: 'Failed to fetch notification counts' }, { status: 500 });
    }

    // Group by type
    const byType: Record<string, { total: number; unread: number }> = {};
    typeCounts?.forEach(notification => {
      if (!byType[notification.type]) {
        byType[notification.type] = { total: 0, unread: 0 };
      }
      byType[notification.type].total++;
      if (!notification.is_read) {
        byType[notification.type].unread++;
      }
    });

    return NextResponse.json({
      total: totalCount || 0,
      unread: unreadCount || 0,
      by_type: byType
    });

  } catch (error) {
    console.error('Error in notification count API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
