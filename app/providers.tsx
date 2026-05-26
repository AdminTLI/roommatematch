'use client'

/**
 * Backward-compatible re-exports. Import from leaf modules when possible:
 * - useApp → @/app/app-context
 * - queryClient → @/app/query-client
 * - queryKeys → @/app/query-keys
 *
 * Do not re-export RouteProviders here — that couples this barrel to the full
 * provider tree and can pull app-shell modules into marketing page bundles.
 */
export { useApp } from '@/app/app-context'
export { queryClient } from '@/app/query-client'
export { queryKeys } from '@/app/query-keys'
