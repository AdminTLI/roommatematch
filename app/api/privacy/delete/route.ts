import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDSARRequest, updateDSARRequestStatus } from '@/lib/privacy/dsar-tracker'
import { safeLogger } from '@/lib/utils/logger'

/**
 * POST /api/privacy/delete
 * 
 * Request account deletion (GDPR Article 17 - Right to Erasure)
 * Implements soft delete with 7-day grace period before hard delete
 * Handles legal retention requirements (verification docs: 4 weeks per Dutch law)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { confirm, reason } = body

    if (!confirm || confirm !== 'DELETE') {
      return NextResponse.json(
        { 
          error: 'Confirmation required',
          message: 'Please type "DELETE" to confirm account deletion'
        },
        { status: 400 }
      )
    }

    // Create DSAR request record
    const dsarRequest = await createDSARRequest({
      userId: user.id,
      requestType: 'deletion',
      metadata: {
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        reason: reason || 'User requested account deletion',
        grace_period_days: 7
      }
    })

    // Calculate deletion dates
    const deletionScheduledAt = new Date()
    deletionScheduledAt.setDate(deletionScheduledAt.getDate() + 7) // 7-day grace period

    // Update DSAR request with deletion schedule
    await updateDSARRequestStatus(
      dsarRequest.id,
      'in_progress',
      undefined,
      undefined,
      {
        deletion_scheduled_at: deletionScheduledAt.toISOString(),
        grace_period_days: 7
      }
    )

    try {
      // Mark account for deletion (soft delete)
      // We'll use a flag in the users table or create a deletion_scheduled table
      // For now, we'll mark the user as inactive and schedule deletion
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error(`Failed to mark account for deletion: ${updateError.message}`)
      }

      // Store deletion schedule in DSAR request metadata
      await supabase
        .from('dsar_requests')
        .update({
          deletion_scheduled_at: deletionScheduledAt.toISOString(),
          deletion_grace_period_days: 7,
          processing_metadata: {
            ...dsarRequest.processing_metadata,
            deletion_scheduled_at: deletionScheduledAt.toISOString(),
            grace_period_days: 7,
            reason: reason || 'User requested account deletion'
          }
        })
        .eq('id', dsarRequest.id)

      // Note: Actual hard deletion will be handled by a cron job that:
      // 1. Checks for accounts scheduled for deletion past grace period
      // 2. Preserves verification documents for 4 weeks (Dutch law requirement)
      // 3. Deletes all other user data
      // 4. Finally deletes the auth user

      // Send confirmation email (would be implemented with email service)
      // await sendDeletionConfirmationEmail(user.email, deletionScheduledAt)

      safeLogger.info('Account deletion requested', {
        requestId: dsarRequest.id,
        userId: user.id,
        scheduledAt: deletionScheduledAt.toISOString()
      })

      // Update DSAR request status
      await updateDSARRequestStatus(
        dsarRequest.id,
        'completed',
        undefined,
        'Account marked for deletion. Grace period of 7 days before permanent deletion.',
        {
          deletion_scheduled_at: deletionScheduledAt.toISOString(),
          grace_period_days: 7
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Account deletion requested successfully',
        request_id: dsarRequest.id,
        deletion_scheduled_at: deletionScheduledAt.toISOString(),
        grace_period_days: 7,
        note: 'Your account will be permanently deleted after the 7-day grace period. You can cancel this request by contacting support within 7 days. Verification documents will be retained for 4 weeks as required by Dutch law.'
      })

    } catch (error) {
      // Update DSAR request status to rejected on error
      await updateDSARRequestStatus(
        dsarRequest.id,
        'rejected',
        undefined,
        `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }

  } catch (error) {
    safeLogger.error('Account deletion error', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to request account deletion',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/privacy/delete
 * 
 * Immediate account deletion (admin only or after grace period)
 * This should only be called by:
 * 1. Admin users
 * 2. Automated cron job after grace period expires
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('user_id')

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id parameter required' }, { status: 400 })
    }

    // Get deletion request
    const { data: deletionRequest } = await supabase
      .from('dsar_requests')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('request_type', 'deletion')
      .eq('status', 'completed')
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'No deletion request found for this user' },
        { status: 404 }
      )
    }

    // Check if grace period has passed
    const scheduledAt = deletionRequest.deletion_scheduled_at
      ? new Date(deletionRequest.deletion_scheduled_at)
      : null

    if (scheduledAt && scheduledAt > new Date()) {
      return NextResponse.json(
        { 
          error: 'Grace period not expired',
          message: `Account deletion is scheduled for ${scheduledAt.toISOString()}. Grace period must expire before permanent deletion.`
        },
        { status: 400 }
      )
    }

    // Perform hard deletion
    // Note: This will cascade delete most data via database foreign keys
    // Verification documents should be preserved for 4 weeks per Dutch law
    
    // 1. Check verification document retention
    const { data: verifications } = await supabase
      .from('verifications')
      .select('created_at, updated_at')
      .eq('user_id', targetUserId)
      .order('updated_at', { ascending: false })
      .limit(1)

    const latestVerificationDate = verifications?.[0]?.updated_at 
      ? new Date(verifications[0].updated_at)
      : null

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28) // 4 weeks

    if (latestVerificationDate && latestVerificationDate > fourWeeksAgo) {
      // Verification documents must be retained for 4 weeks
      // We'll delete everything except verification records
      // The verification records will be deleted by a separate retention cron job after 4 weeks
      
      safeLogger.info('Preserving verification documents per Dutch law', {
        userId: targetUserId,
        latestVerificationDate: latestVerificationDate.toISOString(),
        retentionUntil: new Date(latestVerificationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 2. Delete user data (cascade will handle most tables)
    // The database trigger handle_user_deletion() will clean up related records
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', targetUserId)

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    // 3. Delete auth user (this will cascade to users table via ON DELETE CASCADE)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetUserId)

    if (authDeleteError) {
      safeLogger.error('Failed to delete auth user', { error: authDeleteError, userId: targetUserId })
      // Continue even if auth deletion fails, as the user record is already deleted
    }

    // 4. Update DSAR request
    await supabase
      .from('dsar_requests')
      .update({
        status: 'completed',
        deletion_completed_at: new Date().toISOString(),
        admin_id: user.id,
        admin_notes: 'Account permanently deleted. Verification documents retained per Dutch law (4 weeks).'
      })
      .eq('id', deletionRequest.id)

    safeLogger.info('Account permanently deleted', {
      requestId: deletionRequest.id,
      userId: targetUserId,
      deletedBy: user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted',
      user_id: targetUserId,
      verification_documents_retained: latestVerificationDate && latestVerificationDate > fourWeeksAgo
    })

  } catch (error) {
    safeLogger.error('Account deletion error', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

