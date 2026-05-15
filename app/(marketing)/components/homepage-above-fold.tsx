'use client'

import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { SocialHero } from '@/components/site/social-hero'
import { MarketingLayoutFixLight } from './marketing-layout-fix-light'

/** Above-the-fold client island: nav + interactive hero (card flip loads async). */
export function HomepageAboveFold() {
  return (
    <>
      <MarketingLayoutFixLight />
      <MarketingNavbarLight />
      <SocialHero />
    </>
  )
}
