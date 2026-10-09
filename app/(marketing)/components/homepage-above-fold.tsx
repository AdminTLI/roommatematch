import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { SocialHero } from '@/components/site/social-hero'
import { SocialHeroCopy } from '@/components/site/social-hero-copy'
import { MarketingLayoutFixLight } from './marketing-layout-fix-light'

/**
 * Above-the-fold composition: server-rendered English hero copy (LCP text)
 * plus client islands for nav, locale swap, and deferred preview card.
 */
export function HomepageAboveFold() {
  return (
    <>
      <MarketingLayoutFixLight />
      <MarketingNavbarLight />
      <SocialHero englishCopy={<SocialHeroCopy locale="en" />} />
    </>
  )
}
