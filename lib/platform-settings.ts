import { unstable_cache, revalidateTag } from 'next/cache'
import { fetchPlatformSettingsFromDb, persistPlatformSettings } from '@/lib/platform-settings-db'
import type { PlatformSettings } from '@/lib/platform-settings-shared'

export type {
  PlatformSettings,
  PublicPlatformSettings,
} from '@/lib/platform-settings-shared'

export {
  DEFAULT_PLATFORM_SETTINGS,
  getMatchSuggestionExpiresAt,
  getMaxGroupMembers,
  mergePlatformSettings,
  toPublicPlatformSettings,
} from '@/lib/platform-settings-shared'

export { getPlatformSettingsUncached } from '@/lib/platform-settings-db'

const PLATFORM_SETTINGS_CACHE_TAG = 'platform-settings'

/** Cached read for server components, metadata, and API routes. */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  return unstable_cache(fetchPlatformSettingsFromDb, ['platform-settings-v1'], {
    revalidate: 60,
    tags: [PLATFORM_SETTINGS_CACHE_TAG],
  })()
}

export async function updatePlatformSettings(
  settings: PlatformSettings,
  updatedBy: string
): Promise<PlatformSettings> {
  const merged = await persistPlatformSettings(settings, updatedBy)
  revalidateTag(PLATFORM_SETTINGS_CACHE_TAG)
  return merged
}
