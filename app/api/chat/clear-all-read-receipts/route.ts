import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all read receipts for this user
    const admin = await createAdminClient()
    const { data: readReceipts, error: receiptsError } = await admin
      .from('message_reads')
      .select('id')
      .eq('user_id', user.id)

    if (receiptsError) {
      safeLogger.error('[ClearAllReadReceipts] Failed to fetch read receipts', receiptsError)
      return NextResponse.json({ error: 'Failed to fetch read receipts' }, { status: 500 })
    }

    if (!readReceipts || readReceipts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        deleted_count: 0,
        message: 'No read receipts to clear'
      })
    }

    // Delete all read receipts in batches
    const batchSize = 100
    let totalDeleted = 0
    
    for (let i = 0; i < readReceipts.length; i += batchSize) {
      const batch = readReceipts.slice(i, i + batchSize)
      const receiptIds = batch.map(r => r.id)
      
      const { error: deleteError } = await admin
        .from('message_reads')
        .delete()
        .in('id', receiptIds)

      if (deleteError) {
        safeLogger.error('[ClearAllReadReceipts] Failed to delete batch', deleteError)
        // Continue with other batches
      } else {
        totalDeleted += batch.length
      }
    }

    // Also reset last_read_at for all chat memberships
    await admin
      .from('chat_members')
      .update({ last_read_at: null })
      .eq('user_id', user.id)

    safeLogger.info('[ClearAllReadReceipts] Cleared all read receipts', {
      userId: user.id,
      deletedCount: totalDeleted
    })

    return NextResponse.json({ 
      success: true, 
      deleted_count: totalDeleted
    })

  } catch (error) {
    safeLogger.error('[ClearAllReadReceipts] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
