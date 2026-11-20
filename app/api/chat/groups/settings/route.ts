import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * PATCH /api/chat/groups/settings
 * Update the caller's per-chat group settings (mute, share picture in this chat).
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
      chat_id?: string
      muted?: boolean
      share_picture?: boolean
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const chatId = body.chat_id
    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    const hasMuted = typeof body.muted === 'boolean'
    const hasSharePicture = typeof body.share_picture === 'boolean'
    if (!hasMuted && !hasSharePicture) {
      return NextResponse.json(
        { error: 'muted or share_picture is required' },
        { status: 400 },
      )
    }

    const admin = await createAdminClient()

    const { data: chat } = await admin
      .from('chats')
      .select('id, is_group')
      .eq('id', chatId)
      .maybeSingle()

    if (!chat?.is_group) {
      return NextResponse.json({ error: 'Not a group chat' }, { status: 400 })
    }

    const { data: membership } = await admin
      .from('chat_members')
      .select('id, muted, share_picture')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not an active member of this chat' }, { status: 403 })
    }

    if (hasSharePicture && body.share_picture === true) {
      const { data: profile } = await admin
        .from('profiles')
        .select('profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!profile?.profile_picture_url?.trim()) {
        return NextResponse.json(
          {
            error:
              'Upload a profile photo in Settings before sharing it in this group chat.',
          },
          { status: 400 },
        )
      }
    }

    const updatePayload: { muted?: boolean; share_picture?: boolean } = {}
    if (hasMuted) updatePayload.muted = body.muted
    if (hasSharePicture) updatePayload.share_picture = body.share_picture

    const { data: updated, error: updateError } = await admin
      .from('chat_members')
      .update(updatePayload)
      .eq('id', membership.id)
      .select('muted, share_picture')
      .single()

    if (updateError) {
      safeLogger.warn('Failed to update group chat settings', {
        error: updateError,
        chatId,
        userId: user.id,
      })
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      viewer_settings: {
        muted: Boolean(updated?.muted),
        share_picture: Boolean(updated?.share_picture),
      },
    })
  } catch (error) {
    safeLogger.error('Error updating group chat settings', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
