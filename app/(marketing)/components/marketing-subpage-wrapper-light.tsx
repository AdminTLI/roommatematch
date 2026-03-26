'use client'

import Footer from '@/components/site/footer'
import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { PastelMeshBackground } from '@/components/site/pastel-mesh-background'
import { MarketingLayoutFixLight } from './marketing-layout-fix-light'

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
        className={`relative pt-16 md:pt-20 overflow-hidden ${className}`}
      >
        <PastelMeshBackground />
        <div className="relative z-10">
          <MarketingNavbarLight />
          {children}
          {footer ? <Footer /> : null}
        </div>
      </main>
    </>
  )
}

