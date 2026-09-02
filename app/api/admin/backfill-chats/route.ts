import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { ensureDirectChat } from '@/lib/chat/ensure-direct-chat'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin helper (includes audit logging and prevents enumeration)
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()

    // Audit log admin action
    await logAdminAction(user!.id, 'backfill_chats', null, null, {
      action: 'Starting chat backfill for confirmed matches',
      role: adminRecord!.role
    })

    const admin = await createAdminClient()
    
    // Get all confirmed pair suggestions
    const { data: confirmedSuggestions, error: sugError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, status, kind')
      .eq('kind', 'pair')
      .eq('status', 'confirmed')

    if (sugError) {
      throw new Error(`Failed to fetch confirmed suggestions: ${sugError.message}`)
    }

    if (!confirmedSuggestions || confirmedSuggestions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No confirmed suggestions found',
        processed: 0
      })
    }

    safeLogger.info('[Admin] Found confirmed pair suggestions', {
      count: confirmedSuggestions.length
    })

    // Group by pair (sorted memberIds as key)
    const pairMap = new Map<string, any[]>()
    for (const sug of confirmedSuggestions) {
      const memberIds = sug.member_ids as string[]
      if (!memberIds || memberIds.length !== 2) continue
      
      const [userA, userB] = memberIds.sort()
      const pairKey = `${userA}::${userB}`
      
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, [])
      }
      pairMap.get(pairKey)!.push(sug)
    }

    safeLogger.info('[Admin] Grouped into unique confirmed pairs', {
      pairCount: pairMap.size
    })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each pair
    for (const [pairKey, suggestions] of pairMap.entries()) {
      try {
        const [userA, userB] = pairKey.split('::')
        
        safeLogger.debug('[Admin] Processing pair for chat creation')

        const ensured = await ensureDirectChat(admin, userA, userB, { createdBy: userA })
        if (ensured.created) {
          safeLogger.info('[Admin] Successfully created chat for pair')
          processed++
        } else {
          safeLogger.debug('[Admin] Chat already exists for pair')
          skipped++
        }
      } catch (error) {
        const errorMsg = `Error processing pair: ${error instanceof Error ? error.message : 'Unknown error'}`
        safeLogger.error('[Admin] Error processing pair', error)
        errors.push(errorMsg)
      }
    }

    // Audit log completion
    await logAdminAction(user!.id, 'backfill_chats_complete', null, null, {
      processed,
      skipped,
      totalPairs: pairMap.size,
      errorCount: errors.length,
      role: adminRecord!.role
    })

    return NextResponse.json({
      success: true,
      message: `Chat backfill completed`,
      processed,
      skipped,
      totalPairs: pairMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    safeLogger.error('[Admin] Chat backfill failed', error)
    return NextResponse.json(
      { 
        error: 'Chat backfill failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
