'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { CardSwipeFlow } from '@/components/questionnaire/CardSwipeFlow'

export default function EnvironmentRhythmsClient() {
  const items = useMemo(
    () => (itemsJson as Item[]).filter((i) => i.section === 'environment-rhythms'),
    [],
  )

  return (
    <CardSwipeFlow
      sectionKey="environment-rhythms"
      items={items}
      moduleIndex={1}
      moduleLabel="Environment and Rhythms"
      nextUrl="/onboarding/cleanliness-operations"
    />
  )
}
