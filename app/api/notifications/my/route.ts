import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationFilters, NotificationType } from '@/lib/notifications/types';

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

    const { searchParams } = new URL(request.url);
    const filters: NotificationFilters = {
      is_read: searchParams.get('is_read') ? searchParams.get('is_read') === 'true' : undefined,
      type: searchParams.get('type') as any,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Gate in-app notifications based on the user's push toggles.
    // The DB still records notifications; we simply hide categories the user disabled.
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
        notifications: [],
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          has_more: false,
        },
      })
    }

    query = query.in('type', allowedTypes)

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      notifications: notifications || [],
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        has_more: (notifications?.length || 0) === (filters.limit || 20)
      }
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
