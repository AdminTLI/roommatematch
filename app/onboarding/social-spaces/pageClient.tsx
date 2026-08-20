'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { CardSwipeFlow } from '@/components/questionnaire/CardSwipeFlow'

export default function SocialSpacesClient() {
  const items = useMemo(
    () => (itemsJson as Item[]).filter((i) => i.section === 'social-spaces'),
    [],
  )

  return (
    <CardSwipeFlow
      sectionKey="social-spaces"
      items={items}
      moduleIndex={4}
      moduleLabel="Social Life and Spaces"
      nextUrl="/onboarding/review"
    />
  )
}
