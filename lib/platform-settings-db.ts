import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import {
  DEFAULT_PLATFORM_SETTINGS,
  mergePlatformSettings,
  type PlatformSettings,
} from '@/lib/platform-settings-shared'

export async function fetchPlatformSettingsFromDb(): Promise<PlatformSettings> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('platform_settings')
      .select('settings')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      safeLogger.warn('[PlatformSettings] Failed to load settings', { error: error.message })
      return { ...DEFAULT_PLATFORM_SETTINGS }
    }

    return mergePlatformSettings(data?.settings)
  } catch (error) {
    safeLogger.warn('[PlatformSettings] Load error', { error: String(error) })
    return { ...DEFAULT_PLATFORM_SETTINGS }
  }
}

/** Uncached read for middleware (uses its own short TTL cache). */
export async function getPlatformSettingsUncached(): Promise<PlatformSettings> {
  return fetchPlatformSettingsFromDb()
}

export async function persistPlatformSettings(
  settings: PlatformSettings,
  updatedBy: string
): Promise<PlatformSettings> {
  const merged = mergePlatformSettings(settings)
  const admin = createAdminClient()
  const { error } = await admin.from('platform_settings').upsert({
    id: 1,
    settings: merged,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error(error.message)
  }

  return merged
}
