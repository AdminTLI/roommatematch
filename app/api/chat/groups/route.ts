import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { recalculateGroupCompatibility } from '@/lib/group-compatibility/calculator'

// GET /api/chat/groups/:chatId/compatibility - Get compatibility scores
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const action = searchParams.get('action')

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      )
    }

    // Verify user is a member of the chat
    const { data: membership } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Default to compatibility if no action specified
    const effectiveAction = action || 'compatibility'

    if (effectiveAction === 'compatibility') {
      // Get compatibility scores
      const { data: compatibility, error } = await supabase
        .from('group_compatibility_scores')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle()

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch compatibility: ${error.message}` },
          { status: 500 }
        )
      }

      // Extract explanation from member_deviations if present
      const explanation = compatibility?.member_deviations?.explanation || null
      const compatibilityWithExplanation = compatibility ? {
        ...compatibility,
        explanation,
        member_deviations: compatibility.member_deviations?.deviations || compatibility.member_deviations
      } : null

      return NextResponse.json({ compatibility: compatibilityWithExplanation })
    } else if (effectiveAction === 'members-preview') {
      // Get member previews (for invitation acceptance)
      const { data: members, error } = await supabase
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
        .in('status', ['active', 'invited'])

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch members: ${error.message}` },
          { status: 500 }
        )
      }

      // Get pairwise compatibility scores
      const admin = await createAdminClient()
      const memberIds = members?.map(m => m.user_id) || []
      const pairwiseScores: Record<string, any> = {}

      for (const memberId of memberIds) {
        try {
          const { data: score } = await admin.rpc('compute_compatibility_score', {
            user_a_id: user.id,
            user_b_id: memberId
          })
          if (score && score.length > 0) {
            pairwiseScores[memberId] = score[0]
          }
        } catch (err) {
          safeLogger.warn('Failed to compute pairwise score', { userId: memberId, error: err })
        }
      }

      return NextResponse.json({
        members: members?.map(m => ({
          user_id: m.user_id,
          status: m.status,
          name: [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || 'User',
          program: m.profiles?.program || 'Program',
          university: m.profiles?.universities?.name || 'University',
          compatibility: pairwiseScores[m.user_id] || null
        })) || []
      })
    }

    // If action is provided but invalid, return error
    if (action && action !== 'compatibility' && action !== 'members-preview') {
      return NextResponse.json({ error: 'Invalid action. Must be "compatibility" or "members-preview"' }, { status: 400 })
    }

    // This should not be reached, but provide fallback
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    safeLogger.error('Error in group API', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST /api/chat/groups/:chatId/leave - Leave group with feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id, feedback_type, reason, category_issues } = await request.json()
    
    if (!chat_id || !feedback_type) {
      return NextResponse.json(
        { error: 'chat_id and feedback_type are required' },
        { status: 400 }
      )
    }

    if (!['left', 'reassigned', 'discomfort'].includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Invalid feedback_type' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Verify user is a member
    const { data: membership } = await admin
      .from('chat_members')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Update member status to left
    const { error: updateError } = await admin
      .from('chat_members')
      .update({
        status: 'left',
        left_at: new Date().toISOString()
      })
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to leave group: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Save feedback
    const { error: feedbackError } = await admin
      .from('group_feedback')
      .upsert({
        chat_id,
        user_id: user.id,
        feedback_type,
        reason: reason || null,
        category_issues: category_issues || null
      }, {
        onConflict: 'chat_id,user_id,feedback_type'
      })

    if (feedbackError) {
      safeLogger.warn('Failed to save feedback', { error: feedbackError })
    }

    // Recalculate compatibility without this member
    try {
      await recalculateGroupCompatibility(chat_id)
    } catch (compatError) {
      safeLogger.warn('Failed to recalculate compatibility', { error: compatError })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Left group successfully'
    })
  } catch (error) {
    safeLogger.error('Error leaving group', error)
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    )
  }
}

