'use client'

import { UniversityCityHero } from './hero-section'
import { UniversityCityStats } from './stats-section'
import { UniversityCityHousing } from './housing-section'
import { UniversityCityUniversities } from './universities-section'
import { UniversityCityWhyChoose } from './why-choose-section'
import { UniversityCityFAQ } from './faq-section'
import { FinalCTA } from '@/components/site/final-cta'
import { cityContent, type CityKey } from './content'

interface UniversityCityPageProps {
  cityKey: CityKey
}

export function UniversityCityPage({ cityKey }: UniversityCityPageProps) {
  const city = cityContent[cityKey]
  if (!city) return null

  return (
    <>
      <UniversityCityHero city={city} />
      <UniversityCityStats city={city} />
      <UniversityCityHousing city={city} />
      <UniversityCityUniversities city={city} />
      <UniversityCityWhyChoose city={city} />
      <UniversityCityFAQ city={city} />
      <FinalCTA variant="dark" />
    </>
  )
}

export { cityContent } from './content'
export type { CityKey, CityContent } from './content'
