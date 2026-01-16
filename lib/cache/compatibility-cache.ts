/**
 * Compatibility Score Cache Utility
 * 
 * Provides helper functions for caching compatibility scores with React Query.
 * Compatibility scores are cached for 5 minutes to reduce database load.
 */

import { queryClient } from '@/app/providers'
import { queryKeys } from '@/app/providers'

const COMPATIBILITY_CACHE_STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Gets the cache key for a compatibility score query
 */
export function getCompatibilityCacheKey(userAId: string, userBId: string) {
  // Normalize IDs to ensure consistent caching (always use lexicographically smaller ID first)
  const [id1, id2] = userAId < userBId ? [userAId, userBId] : [userBId, userAId]
  return queryKeys.compatibility(id1, id2)
}

/**
 * Gets cached compatibility score if available
 */
export function getCachedCompatibilityScore(userAId: string, userBId: string): any | null {
  const cacheKey = getCompatibilityCacheKey(userAId, userBId)
  const cached = queryClient.getQueryData(cacheKey)
  return cached || null
}

/**
 * Sets compatibility score in cache
 */
export function setCachedCompatibilityScore(
  userAId: string,
  userBId: string,
  score: any
) {
  const cacheKey = getCompatibilityCacheKey(userAId, userBId)
  queryClient.setQueryData(cacheKey, score, {
    updatedAt: Date.now(),
  })
}

/**
 * Invalidates compatibility score cache for a user pair
 */
export function invalidateCompatibilityScore(userAId: string, userBId: string) {
  const cacheKey = getCompatibilityCacheKey(userAId, userBId)
  queryClient.invalidateQueries({ queryKey: cacheKey })
}

/**
 * Gets the stale time for compatibility scores
 */
export function getCompatibilityStaleTime() {
  return COMPATIBILITY_CACHE_STALE_TIME
}






