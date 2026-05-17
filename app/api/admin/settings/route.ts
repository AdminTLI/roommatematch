import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  DEFAULT_PLATFORM_SETTINGS,
  getPlatformSettings,
  updatePlatformSettings,
  type PlatformSettings,
} from '@/lib/platform-settings'
import { logOpsEvent } from '@/lib/monitoring/ops-log'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const settings = await getPlatformSettings()
    return NextResponse.json(settings)
  } catch (error) {
    safeLogger.error('[Admin] Failed to load platform settings', { error })
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok || !adminCheck.user) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const body = (await request.json()) as Partial<PlatformSettings>
    const previous = await getPlatformSettings()
    const next: PlatformSettings = {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...previous,
      ...body,
    }

    const saved = await updatePlatformSettings(next, adminCheck.user.id)

    const changedKeys = (Object.keys(saved) as (keyof PlatformSettings)[]).filter(
      (key) => previous[key] !== saved[key]
    )

    if (changedKeys.length > 0) {
      await logOpsEvent({
        source: 'admin_api',
        severity: 'info',
        title: 'Platform settings updated',
        message: `Updated: ${changedKeys.join(', ')}`,
        metadata: {
          changedKeys,
          maintenanceMode: saved.maintenanceMode,
          registrationEnabled: saved.registrationEnabled,
        },
      })
    }

    return NextResponse.json(saved)
  } catch (error) {
    safeLogger.error('[Admin] Failed to save platform settings', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    )
  }
}
