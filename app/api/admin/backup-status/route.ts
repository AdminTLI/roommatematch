import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const adminClient = createAdminClient()

    // Check for backup events in admin_actions table
    const { data: backupActions, error } = await adminClient
      .from('admin_actions')
      .select('created_at, metadata, action')
      .eq('action', 'system_backup')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      safeLogger.error('[Admin] Backup status query error', error)
    }

    const lastBackup = backupActions?.[0]
    const lastBackupDate = lastBackup?.created_at ? new Date(lastBackup.created_at) : null

    // Determine if backup is recent (within last 24 hours)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const isRecent = lastBackupDate ? lastBackupDate >= twentyFourHoursAgo : false

    // Calculate time since last backup
    let timeSinceLastBackup: string | null = null
    if (lastBackupDate) {
      const diffMs = now.getTime() - lastBackupDate.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        timeSinceLastBackup = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        timeSinceLastBackup = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        timeSinceLastBackup = diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago` : 'Just now'
      }
    }

    return NextResponse.json({
      status: isRecent ? 'recent' : lastBackupDate ? 'outdated' : 'none',
      lastBackup: lastBackupDate?.toISOString() || null,
      timeSinceLastBackup,
      isRecent,
      metadata: lastBackup?.metadata || null,
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Admin] Backup status error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

