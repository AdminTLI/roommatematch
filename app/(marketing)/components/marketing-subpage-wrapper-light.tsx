'use client'

import Footer from '@/components/site/footer'
import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { PastelMeshBackground } from '@/components/site/pastel-mesh-background'
import { MarketingLayoutFixLight } from './marketing-layout-fix-light'
import { cn } from '@/lib/utils'

interface MarketingSubpageWrapperLightProps {
  children: React.ReactNode
  /** Additional className for the main element */
  className?: string
  /** Render the standard marketing footer */
  footer?: boolean
}

/**
 * Consistent wrapper for light marketing pages (matches the redesigned home page).
 * Provides: MarketingLayoutFixLight, PastelMeshBackground, MarketingNavbarLight, Footer.
 */
export function MarketingSubpageWrapperLight({
  children,
  className = '',
  footer = true,
}: MarketingSubpageWrapperLightProps) {
  return (
    <>
      <MarketingLayoutFixLight />
      <main
        id="main-content"
        className={cn(
          'relative flex min-h-screen flex-col pt-16 md:pt-20 overflow-hidden',
          className
        )}
      >
        <PastelMeshBackground />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <MarketingNavbarLight />
          <div className="flex-1">{children}</div>
          {footer ? <Footer /> : null}
        </div>
      </main>
    </>
  )
}
