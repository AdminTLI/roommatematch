export interface PlatformSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  defaultUniversity: string
  allowMultipleUniversities: boolean
  maxUsersPerMatch: number
  matchExpirationDays: number
  autoBackupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  emailNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  adminAlertsEnabled: boolean
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: 'Domu Match',
  siteDescription:
    'Find compatible roommates in the Netherlands with science-backed matching. Verified students and young professionals, safe platform, perfect for shared living.',
  maintenanceMode: false,
  registrationEnabled: true,
  defaultUniversity: '',
  allowMultipleUniversities: false,
  maxUsersPerMatch: 4,
  matchExpirationDays: 7,
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  adminAlertsEnabled: true,
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function mergePlatformSettings(raw: unknown): PlatformSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PLATFORM_SETTINGS }
  }
  const partial = raw as Partial<PlatformSettings>
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...partial,
    maxUsersPerMatch: clampInt(partial.maxUsersPerMatch, 2, 10, DEFAULT_PLATFORM_SETTINGS.maxUsersPerMatch),
    matchExpirationDays: clampInt(
      partial.matchExpirationDays,
      1,
      90,
      DEFAULT_PLATFORM_SETTINGS.matchExpirationDays
    ),
    backupFrequency:
      partial.backupFrequency === 'weekly' || partial.backupFrequency === 'monthly'
        ? partial.backupFrequency
        : 'daily',
  }
}

/** Fields safe to expose without authentication (maintenance / registration gates). */
export type PublicPlatformSettings = Pick<
  PlatformSettings,
  'maintenanceMode' | 'registrationEnabled' | 'siteName' | 'siteDescription'
>

export function toPublicPlatformSettings(settings: PlatformSettings): PublicPlatformSettings {
  return {
    maintenanceMode: settings.maintenanceMode,
    registrationEnabled: settings.registrationEnabled,
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
  }
}

export function getMatchSuggestionExpiresAt(days: number): string {
  const safeDays = clampInt(days, 1, 90, DEFAULT_PLATFORM_SETTINGS.matchExpirationDays)
  return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString()
}

export function getMaxGroupMembers(settings?: PlatformSettings): number {
  const max = settings?.maxUsersPerMatch ?? DEFAULT_PLATFORM_SETTINGS.maxUsersPerMatch
  return clampInt(max, 2, 10, DEFAULT_PLATFORM_SETTINGS.maxUsersPerMatch)
}
