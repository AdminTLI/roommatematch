/**
 * Feature Flags Utility
 * Centralized feature flag management based on environment variables
 */

export type FeatureFlag = 'housing' | 'move_in' | 'demo_chat'

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const envKey = `FEATURE_${feature.toUpperCase().replace('_', '_')}`
  const value = process.env[envKey]
  
  // Default to false if not set (safer for production)
  if (value === undefined) {
    return false
  }
  
  // Accept 'true', '1', 'yes' as truthy values
  return ['true', '1', 'yes'].includes(value.toLowerCase())
}

/**
 * Check if demo chat is allowed
 */
export function isDemoChatAllowed(): boolean {
  const value = process.env.ALLOW_DEMO_CHAT
  return value === 'true' || value === '1'
}

/**
 * Get all feature flags (useful for admin/debugging)
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return {
    housing: isFeatureEnabled('housing'),
    move_in: isFeatureEnabled('move_in'),
    demo_chat: isDemoChatAllowed()
  }
}



