import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { isSuperAdmin } from '@/lib/auth/roles'
import { logAdminAction } from '@/lib/admin/audit'
import { isValidLabWishStatus } from '@/lib/lab/validation'
import { handleLabWishShipped } from '@/lib/lab/shipped'
import {
  toLabWishAdminRow,
  withLabWishAuthor,
} from '@/lib/lab/admin-serialization'
import { safeLogger } from '@/lib/utils/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const universityId = adminCheck.adminRecord?.university_id

    const { data: existing, error: fetchError } = await admin
      .from('lab_wishes')
      .select(
        'id, user_id, title, status, university_id, shipped_notified_at, merged_into_id'
      )
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
    }

    if (universityId && existing.university_id !== universityId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}

    if (typeof body.status === 'string') {
      if (!isValidLabWishStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (typeof body.merged_into_id === 'string') {
      const targetId = body.merged_into_id
      if (targetId === id) {
        return NextResponse.json(
          { error: 'Cannot merge into self' },
          { status: 400 }
        )
      }

      const { data: target } = await admin
        .from('lab_wishes')
        .select('id, university_id, merged_into_id')
        .eq('id', targetId)
        .maybeSingle()

      if (!target || target.merged_into_id) {
        return NextResponse.json(
          { error: 'Merge target not found' },
          { status: 404 }
        )
      }

      if (target.university_id !== existing.university_id) {
        return NextResponse.json(
          { error: 'Cannot merge across universities' },
          { status: 400 }
        )
      }

      const { data: sourceVotes } = await admin
        .from('lab_wish_votes')
        .select('user_id, intensity')
        .eq('wish_id', id)

      for (const vote of sourceVotes ?? []) {
        await admin.from('lab_wish_votes').upsert(
          {
            wish_id: targetId,
            user_id: vote.user_id,
            intensity: vote.intensity,
          },
          { onConflict: 'wish_id,user_id', ignoreDuplicates: true }
        )
      }

      await admin.rpc('refresh_lab_wish_vote_counts', { p_wish_id: targetId })
      updates.merged_into_id = targetId
      updates.status = 'wont_do'
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await admin
      .from('lab_wishes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !updated) {
      safeLogger.error('[Admin DomuLab] PATCH failed', { updateError })
      return NextResponse.json(
        { error: 'Failed to update wish' },
        { status: 500 }
      )
    }

    if (
      updates.status === 'shipped' &&
      existing.status !== 'shipped' &&
      !existing.merged_into_id
    ) {
      await handleLabWishShipped({
        id: updated.id,
        user_id: updated.user_id,
        title: updated.title,
        shipped_notified_at: updated.shipped_notified_at,
      })
    }

    const canViewAuthors = adminCheck.user
      ? await isSuperAdmin(adminCheck.user.id)
      : false

    const base = toLabWishAdminRow(updated)
    if (!canViewAuthors) {
      return NextResponse.json({ wish: base })
    }

    const { data: authorUser } = await admin
      .from('users')
      .select('email')
      .eq('id', updated.user_id)
      .maybeSingle()
    const { data: authorProfile } = await admin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', updated.user_id)
      .maybeSingle()

    const authorName =
      [authorProfile?.first_name, authorProfile?.last_name]
        .filter(Boolean)
        .join(' ') || 'Student'

    return NextResponse.json({
      wish: withLabWishAuthor(base, updated, {
        email: authorUser?.email ?? '',
        name: authorName,
      }),
    })
  } catch (error) {
    safeLogger.error('[Admin DomuLab] PATCH error', { error })
    return NextResponse.json(
      { error: 'Failed to update wish' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { id } = await context.params
    const admin = createAdminClient()
    const universityId = adminCheck.adminRecord?.university_id

    const { data: existing, error: fetchError } = await admin
      .from('lab_wishes')
      .select('id, title, university_id, user_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
    }

    if (universityId && existing.university_id !== universityId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await admin
      .from('lab_wishes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      safeLogger.error('[Admin DomuLab] DELETE failed', { deleteError })
      return NextResponse.json(
        { error: 'Failed to delete wish' },
        { status: 500 }
      )
    }

    if (adminCheck.user?.id) {
      await logAdminAction(
        adminCheck.user.id,
        'delete_lab_wish',
        'lab_wish',
        id,
        { title: existing.title, author_id: existing.user_id }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[Admin DomuLab] DELETE error', { error })
    return NextResponse.json(
      { error: 'Failed to delete wish' },
      { status: 500 }
    )
  }
}
