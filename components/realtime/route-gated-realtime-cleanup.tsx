'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { isMarketingRoute } from '@/lib/marketing/routes'

const GlobalRealtimeCleanupHandler = dynamic(
  () =>
    import('@/components/realtime/global-cleanup-handler').then((m) => ({
      default: m.GlobalRealtimeCleanupHandler,
    })),
  { ssr: false }
)

/**
 * Avoids pulling the realtime channel manager (and Supabase client weight)
 * into public marketing pages where subscriptions are unused.
 */
export function RouteGatedRealtimeCleanup() {
  const pathname = usePathname() ?? '/'
  if (isMarketingRoute(pathname)) return null
  return <GlobalRealtimeCleanupHandler />
}
