import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark all user's notifications as read
    safeLogger.debug('[mark-all-read] Marking all notifications as read for user:', user.id);
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id');

    if (error) {
      console.error('[mark-all-read] Failed to mark all notifications as read:', error);
      return NextResponse.json({ 
        error: 'Failed to mark all notifications as read',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    safeLogger.debug('[mark-all-read] Successfully marked', data?.length || 0, 'notifications as read');
    return NextResponse.json({ 
      success: true, 
      updated_count: data?.length || 0 
    });

  } catch (error) {
    console.error('Error in mark-all-read API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
