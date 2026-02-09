import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { MarketingLayoutFix } from './marketing-layout-fix'

interface MarketingSubpageWrapperProps {
  children: React.ReactNode
  /** Additional className for the main element */
  className?: string
}

/**
 * Consistent wrapper for all marketing subpages.
 * Provides: MarketingLayoutFix, Navbar, dark slate background, Footer.
 * Use for legal, support, company, and content pages that should match
 * the home/students/universities/about aesthetic.
 */
export function MarketingSubpageWrapper({
  children,
  className = '',
}: MarketingSubpageWrapperProps) {
  return (
    <>
      <MarketingLayoutFix />
      <main
        id="main-content"
        className={`min-h-screen bg-slate-950 pt-16 md:pt-20 pb-24 ${className}`}
      >
        <Navbar />
        {children}
        <Footer />
      </main>
    </>
  )
}
