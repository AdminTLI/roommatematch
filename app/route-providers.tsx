'use client'

import { usePathname } from 'next/navigation'
import { CoreProviders } from '@/app/core-providers'
import { AppProvidersAddon } from '@/app/app-providers-addon'
import { isMarketingRoute } from '@/lib/marketing/routes'

export function RouteProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const marketing = isMarketingRoute(pathname)

  return (
    <CoreProviders>
      {marketing ? children : <AppProvidersAddon>{children}</AppProvidersAddon>}
    </CoreProviders>
  )
}
