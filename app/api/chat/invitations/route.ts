import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { recalculateGroupCompatibility } from '@/lib/group-compatibility/calculator'

// GET /api/chat/invitations/pending - Get pending invitations for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (chatId) {
      // Get specific invitation details
      const { data: invitation, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          chats (
            id,
            name,
            group_intent,
            invitation_status,
            created_by
          )
        `)
        .eq('chat_id', chatId)
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .maybeSingle()
      
      // Fetch inviter profile separately (inviter_id references users(id), not profiles)
      let inviterProfile = null
      if (invitation?.inviter_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', invitation.inviter_id)
          .maybeSingle()
        inviterProfile = profile
      }

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch invitation: ${error.message}` },
          { status: 500 }
        )
      }

      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
      }

      // Get compatibility scores
      const { data: compatibility } = await supabase
        .from('group_compatibility_scores')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle()

      // Get other members (for preview)
      const { data: members } = await supabase
        .from('chat_members')
        .select(`
          user_id,
          status,
          profiles!chat_members_user_id_fkey (
            first_name,
            last_name,
            program,
            universities!profiles_university_id_fkey (
              name
            )
          )
        `)
        .eq('chat_id', chatId)
        .neq('user_id', user.id)

      return NextResponse.json({
        invitation: {
          ...invitation,
          inviter: inviterProfile,
          compatibility,
          other_members: members?.map(m => ({
            user_id: m.user_id,
            status: m.status,
            name: [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || 'User',
            program: m.profiles?.program || 'Program',
            university: m.profiles?.universities?.name || 'University'
          }))
        }
      })
    } else {
      // Get all pending invitations for user
      const { data: invitations, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          chats (
            id,
            name,
            group_intent,
            invitation_status,
            created_at
          )
        `)
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })
      
      // Fetch inviter profiles separately
      const inviterIds = invitations?.map(inv => inv.inviter_id).filter(Boolean) || []
      const inviterProfilesMap = new Map()
      if (inviterIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', inviterIds)
        
        profiles?.forEach(p => {
          inviterProfilesMap.set(p.user_id, { first_name: p.first_name, last_name: p.last_name })
        })
      }

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch invitations: ${error.message}` },
          { status: 500 }
        )
      }

      // Get compatibility scores for each chat
      const chatIds = invitations?.map(inv => inv.chat_id) || []
      const { data: compatibilities } = await supabase
        .from('group_compatibility_scores')
        .select('*')
        .in('chat_id', chatIds)

      const compatibilityMap = new Map(
        compatibilities?.map(c => [c.chat_id, c]) || []
      )

      return NextResponse.json({
        invitations: invitations?.map(inv => ({
          ...inv,
          inviter: inviterProfilesMap.get(inv.inviter_id) || null,
          compatibility: compatibilityMap.get(inv.chat_id)
        })) || []
      })
    }
  } catch (error) {
    safeLogger.error('Error fetching invitations', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

// POST /api/chat/invitations/accept - Accept an invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id, action } = await request.json()
    
    if (!chat_id || !action) {
      return NextResponse.json(
        { error: 'chat_id and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Find the invitation
    const { data: invitation, error: inviteError } = await admin
      .from('group_invitations')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already responded to' },
        { status: 404 }
      )
    }

    if (action === 'accept') {
      // Update invitation status
      const { error: updateError } = await admin
        .from('group_invitations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to accept invitation: ${updateError.message}` },
          { status: 500 }
        )
      }

      // Update chat member status to active
      const { error: memberError } = await admin
        .from('chat_members')
        .update({
          status: 'active'
        })
        .eq('chat_id', chat_id)
        .eq('user_id', user.id)

      if (memberError) {
        safeLogger.warn('Failed to update member status', { error: memberError })
      }

      // Note: Compatibility is calculated once at creation and stays fixed
      // We don't recalculate here

      // Check if all invitations are accepted (but chat may still be locked due to pairwise matches)
      const { data: pendingInvitations } = await admin
        .from('group_invitations')
        .select('id')
        .eq('chat_id', chat_id)
        .eq('status', 'pending')

      // Update invitation_status to 'active' if all invitations accepted
      // But chat may still be locked if pairwise matches are pending
      if (!pendingInvitations || pendingInvitations.length === 0) {
        await admin
          .from('chats')
          .update({ invitation_status: 'active' })
          .eq('id', chat_id)
      }

      // Get chat lock status
      const { data: chat } = await admin
        .from('chats')
        .select('is_locked, lock_reason')
        .eq('id', chat_id)
        .single()

      return NextResponse.json({ 
        success: true,
        chat_id,
        is_locked: chat?.is_locked || false,
        lock_reason: chat?.lock_reason || null,
        message: 'Invitation accepted'
      })
    } else {
      // Reject invitation
      const { error: updateError } = await admin
        .from('group_invitations')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to reject invitation: ${updateError.message}` },
          { status: 500 }
        )
      }

      // Remove from chat members
      await admin
        .from('chat_members')
        .delete()
        .eq('chat_id', chat_id)
        .eq('user_id', user.id)

      return NextResponse.json({ 
        success: true,
        message: 'Invitation rejected'
      })
    }
  } catch (error) {
    safeLogger.error('Error processing invitation', error)
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}

