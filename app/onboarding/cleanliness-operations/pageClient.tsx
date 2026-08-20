'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { CardSwipeFlow } from '@/components/questionnaire/CardSwipeFlow'

export default function CleanlinessOperationsClient() {
  const items = useMemo(
    () => (itemsJson as Item[]).filter((i) => i.section === 'cleanliness-operations'),
    [],
  )

  return (
    <CardSwipeFlow
      sectionKey="cleanliness-operations"
      items={items}
      moduleIndex={2}
      moduleLabel="Cleanliness and Operations"
      nextUrl="/onboarding/communication-resolution"
    />
  )
}
