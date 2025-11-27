import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, true)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()

    // Audit log admin action
    await logAdminAction(user!.id, 'trigger_matches', null, null, {
      action: 'Manually triggering match computation for all users',
      role: adminRecord!.role
    })
    
    // Get all active users with profiles and vectors
    const { data: users } = await supabase
      .from('users')
      .select(`
        id,
        profiles!inner(user_id, university_id),
        user_vectors!inner(user_id, vector)
      `)
      .eq('is_active', true)

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users found for matching',
        processed: 0 
      })
    }

    let processed = 0
    const errors: string[] = []

    // Process each user
    for (const userRecord of users) {
      try {
        await supabase.rpc('compute_matches', {
          target_user_id: userRecord.id
        })
        processed++
      } catch (error) {
        const errorMsg = `Failed to compute matches for user: ${error instanceof Error ? error.message : String(error)}`
        safeLogger.error('[Admin] Match computation failed for user', {
          error: errorMsg,
          adminUserId: user!.id
        })
        errors.push(errorMsg)
      }
    }

    // Audit log completion
    await logAdminAction(user!.id, 'trigger_matches_complete', null, null, {
      processed,
      total: users.length,
      errorCount: errors.length,
      role: adminRecord!.role
    })

    return NextResponse.json({
      success: true,
      message: `Match computation completed`,
      processed,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    safeLogger.error('[Admin] Manual match trigger failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json(
      { 
        error: 'Match computation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
