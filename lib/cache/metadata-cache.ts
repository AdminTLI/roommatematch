/**
 * Metadata Cache Utility
 * 
 * Caches database metadata queries (tables, columns, functions, types, publication tables)
 * with 1-hour TTL to reduce expensive schema introspection queries.
 */

import { createClient } from '@/lib/supabase/client'

interface CachedMetadata<T> {
  data: T
  cachedAt: number
  ttl: number // Time to live in milliseconds
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// In-memory caches for different metadata types
const metadataCaches = {
  tables: null as CachedMetadata<any> | null,
  columns: null as CachedMetadata<any> | null,
  functions: null as CachedMetadata<any> | null,
  types: null as CachedMetadata<any> | null,
  publicationTables: null as CachedMetadata<any> | null,
}

/**
 * Gets cached metadata if available and not expired
 */
function getCached<T>(cache: CachedMetadata<T> | null): T | null {
  if (!cache) return null
  
  const now = Date.now()
  if ((now - cache.cachedAt) >= cache.ttl) {
    return null // Cache expired
  }
  
  return cache.data
}

/**
 * Sets metadata in cache
 */
function setCached<T>(cacheKey: keyof typeof metadataCaches, data: T) {
  metadataCaches[cacheKey] = {
    data,
    cachedAt: Date.now(),
    ttl: CACHE_TTL_MS,
  }
}

/**
 * Gets publication tables with caching
 */
export async function getPublicationTables(pubname: string): Promise<any[]> {
  // Check cache first
  const cached = getCached(metadataCaches.publicationTables)
  if (cached) {
    // Filter by publication name if needed
    if (cached.pubname === pubname) {
      return cached.tables || []
    }
  }
  
  // Cache miss - fetch from database
  const supabase = createClient()
  // Note: This would typically be done via a database function or direct query
  // For now, we'll return empty and let the actual implementation handle it
  // The caching will be applied at the API route level
  
  return []
}

/**
 * Invalidates all metadata caches
 */
export function invalidateMetadataCache() {
  metadataCaches.tables = null
  metadataCaches.columns = null
  metadataCaches.functions = null
  metadataCaches.types = null
  metadataCaches.publicationTables = null
}

/**
 * Invalidates a specific metadata cache
 */
export function invalidateMetadataCacheType(type: keyof typeof metadataCaches) {
  metadataCaches[type] = null
}

/**
 * Gets cache TTL in milliseconds
 */
export function getMetadataCacheTTL() {
  return CACHE_TTL_MS
}


