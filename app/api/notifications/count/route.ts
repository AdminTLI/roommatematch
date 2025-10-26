import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (totalError) {
      console.error('Failed to fetch total notification count:', totalError);
      return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (unreadError) {
      console.error('Failed to fetch unread notification count:', unreadError);
      return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 });
    }

    // Get counts by type
    const { data: typeCounts, error: typeError } = await supabase
      .from('notifications')
      .select('type, is_read')
      .eq('user_id', user.id);

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
