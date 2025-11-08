import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin helper (includes audit logging and prevents enumeration)
    const adminCheck = await requireAdmin(request)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()

    // Audit log admin action
    await logAdminAction(user!.id, 'backfill_vectors', null, null, {
      action: 'Starting vector backfill for all users with responses',
      role: adminRecord!.role
    })

    // Get all users with responses
    const { data: usersWithResponses, error: usersError } = await supabase
      .from('responses')
      .select('user_id')
      .order('user_id')

    if (usersError) {
      throw new Error(`Failed to fetch users with responses: ${usersError.message}`)
    }

    if (!usersWithResponses || usersWithResponses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users with responses found',
        processed: 0 
      })
    }

    // Get unique user IDs
    const uniqueUserIds = Array.from(new Set(usersWithResponses.map(r => r.user_id)))
    safeLogger.info('[Admin] Found unique users with responses', {
      count: uniqueUserIds.length
    })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Check if vector already exists and is non-zero
        const { data: existingVector } = await supabase
          .from('user_vectors')
          .select('vector')
          .eq('user_id', userId)
          .single()

        if (existingVector?.vector && Array.isArray(existingVector.vector)) {
          const magnitude = Math.sqrt(existingVector.vector.reduce((sum: number, v: number) => sum + v * v, 0))
          if (magnitude > 0) {
            skipped++
            continue
          }
        }

        // Generate vector
        const { error: vectorError } = await supabase.rpc('compute_user_vector_and_store', { 
          p_user_id: userId 
        })
        
        if (vectorError) {
          const errorMsg = `Failed to generate vector: ${vectorError.message}`
          safeLogger.error('[Admin] Vector generation failed', vectorError)
          errors.push(errorMsg)
        } else {
          processed++
          if (processed % 10 === 0) {
            safeLogger.debug('[Admin] Processing progress', {
              processed,
              total: uniqueUserIds.length
            })
          }
        }
      } catch (error) {
        const errorMsg = `Error processing user: ${error instanceof Error ? error.message : 'Unknown error'}`
        safeLogger.error('[Admin] Error processing user', error)
        errors.push(errorMsg)
      }
    }

    // Audit log completion
    await logAdminAction(user!.id, 'backfill_vectors_complete', null, null, {
      processed,
      skipped,
      total: uniqueUserIds.length,
      errorCount: errors.length,
      role: adminRecord!.role
    })

    return NextResponse.json({
      success: true,
      message: `Vector backfill completed`,
      processed,
      skipped,
      total: uniqueUserIds.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit error output
    })

  } catch (error) {
    safeLogger.error('[Admin] Vector backfill failed', error)
    return NextResponse.json(
      { 
        error: 'Vector backfill failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

