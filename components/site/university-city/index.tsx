'use client'

import { UniversityCityHero } from './hero-section'
import { UniversityCityStats } from './stats-section'
import { UniversityCityHousing } from './housing-section'
import { UniversityCityUniversities } from './universities-section'
import { UniversityCityWhyChoose } from './why-choose-section'
import { UniversityCityFAQ } from './faq-section'
import { FinalCTA } from '@/components/site/final-cta'
import { cityContent, type CityKey } from './content'
import { cityContentNl } from './city-content-nl'
import { useApp } from '@/app/providers'

interface UniversityCityPageProps {
  cityKey: CityKey
}

export function UniversityCityPage({ cityKey }: UniversityCityPageProps) {
  const { locale } = useApp()
  const city = locale === 'nl' ? cityContentNl[cityKey] : cityContent[cityKey]
  if (!city) return null

  return (
    <>
      <UniversityCityHero city={city} />
      <UniversityCityStats city={city} />
      <UniversityCityHousing city={city} />
      <UniversityCityUniversities city={city} />
      <UniversityCityWhyChoose city={city} />
      <UniversityCityFAQ city={city} />
      <FinalCTA />
    </>
  )
}

export { cityContent } from './content'
export type { CityKey, CityContent } from './content'
