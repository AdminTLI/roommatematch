'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { CardSwipeFlow } from '@/components/questionnaire/CardSwipeFlow'

export default function CommunicationResolutionClient() {
  const items = useMemo(
    () => (itemsJson as Item[]).filter((i) => i.section === 'communication-resolution'),
    [],
  )

  return (
    <CardSwipeFlow
      sectionKey="communication-resolution"
      items={items}
      moduleIndex={3}
      moduleLabel="Communication and Resolution"
      nextUrl="/onboarding/social-spaces"
    />
  )
}
