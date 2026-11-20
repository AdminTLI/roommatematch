/**
 * Feature Flags Utility
 * Centralized feature flag management based on environment variables
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_* vars that are referenced with
 * static property access (process.env.NEXT_PUBLIC_FOO). Dynamic keys like
 * process.env[`NEXT_PUBLIC_${x}`] are always undefined in client bundles.
 */

export type FeatureFlag = 'housing' | 'move_in' | 'demo_chat' | 'domu_lab'

function parseTruthyFlag(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined
  return ['true', '1', 'yes'].includes(value.toLowerCase())
}

/**
 * Check if a feature is enabled.
 * Reads FEATURE_* (server) and NEXT_PUBLIC_FEATURE_* (client bundles).
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  // Static access required for client-side NEXT_PUBLIC_* inlining.
  // Prefer NEXT_PUBLIC_* first so client bundles get a concrete compile-time value.
  switch (feature) {
    case 'housing':
      return (
        parseTruthyFlag(process.env.NEXT_PUBLIC_FEATURE_HOUSING) === true ||
        parseTruthyFlag(process.env.FEATURE_HOUSING) === true
      )
    case 'move_in':
      return (
        parseTruthyFlag(process.env.NEXT_PUBLIC_FEATURE_MOVE_IN) === true ||
        parseTruthyFlag(process.env.FEATURE_MOVE_IN) === true
      )
    case 'demo_chat':
      return parseTruthyFlag(process.env.ALLOW_DEMO_CHAT) === true
    case 'domu_lab':
      return isDomuLabEnabled()
    default:
      return false
  }
}

/**
 * Check if demo chat is allowed
 */
export function isDemoChatAllowed(): boolean {
  return parseTruthyFlag(process.env.ALLOW_DEMO_CHAT) === true
}

/**
 * Get all feature flags (useful for admin/debugging)
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return {
    housing: isFeatureEnabled('housing'),
    move_in: isFeatureEnabled('move_in'),
    demo_chat: isDemoChatAllowed(),
    domu_lab: isDomuLabEnabled(),
  }
}

/**
 * Domu Lab wish board — enabled by default unless explicitly disabled.
 */
export function isDomuLabEnabled(): boolean {
  const value = process.env.FEATURE_DOMU_LAB
  if (value === undefined) return true
  if (['false', '0', 'no'].includes(value.toLowerCase())) return false
  return parseTruthyFlag(value) === true
}
