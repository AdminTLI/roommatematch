import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    // Validate UUID format (same pattern as mark-read endpoint)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID format' }, { status: 400 });
    }

    // Load the notification and ensure it belongs to the current user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, message, metadata, is_read, created_at, updated_at')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      console.error('[acknowledge-warning] Failed to load notification:', fetchError);
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow acknowledgement for admin warning notifications
    if (
      notification.type !== 'safety_alert' ||
      !notification.metadata ||
      notification.metadata.action !== 'warn'
    ) {
      return NextResponse.json(
        { error: 'Only admin warning notifications can be acknowledged' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const currentMetadata = notification.metadata || {};

    const updatedMetadata = {
      ...currentMetadata,
      // Track acknowledgement state explicitly so admins can see it
      acknowledged_checkbox: true,
      acknowledged_continue: true,
      acknowledged_at: currentMetadata.acknowledged_at || now,
    };

    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({
        metadata: updatedMetadata,
        is_read: true,
        updated_at: now,
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select('id, user_id, type, title, message, metadata, is_read, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('[acknowledge-warning] Failed to update notification:', updateError);
      return NextResponse.json(
        { error: 'Failed to acknowledge warning' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('[acknowledge-warning] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

