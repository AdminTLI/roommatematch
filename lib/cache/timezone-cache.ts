/**
 * Timezone Cache Utility
 * 
 * Caches timezone names from PostgreSQL to avoid repeated queries.
 * Timezones rarely change, so we can cache them with a long TTL (24 hours).
 */

import { createClient } from '@/lib/supabase/client'

interface CachedTimezones {
  timezones: string[]
  cachedAt: number
  ttl: number // Time to live in milliseconds
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
let timezoneCache: CachedTimezones | null = null

/**
 * Fetches timezone names from the database
 */
async function fetchTimezonesFromDB(): Promise<string[]> {
  const supabase = createClient()
  
  // Use RPC call to get timezone names
  // Note: This queries pg_timezone_names which is a PostgreSQL system view
  const { data, error } = await supabase.rpc('get_timezone_names')
  
  if (error) {
    // Fallback: if RPC doesn't exist, we'll need to create it or use a different approach
    // For now, return empty array and log error
    console.error('[TimezoneCache] Error fetching timezones:', error)
    return []
  }
  
  return data || []
}

/**
 * Gets timezone names, using cache if available and not expired
 */
export async function getTimezones(): Promise<string[]> {
  const now = Date.now()
  
  // Check if cache is valid
  if (timezoneCache && (now - timezoneCache.cachedAt) < timezoneCache.ttl) {
    return timezoneCache.timezones
  }
  
  // Cache expired or doesn't exist, fetch from database
  const timezones = await fetchTimezonesFromDB()
  
  // Update cache
  timezoneCache = {
    timezones,
    cachedAt: now,
    ttl: CACHE_TTL_MS,
  }
  
  return timezones
}

/**
 * Invalidates the timezone cache (useful for testing or forced refresh)
 */
export function invalidateTimezoneCache() {
  timezoneCache = null
}

/**
 * Gets timezone names synchronously from cache (returns null if not cached)
 */
export function getTimezonesSync(): string[] | null {
  if (!timezoneCache) return null
  
  const now = Date.now()
  if ((now - timezoneCache.cachedAt) >= timezoneCache.ttl) {
    return null // Cache expired
  }
  
  return timezoneCache.timezones
}


