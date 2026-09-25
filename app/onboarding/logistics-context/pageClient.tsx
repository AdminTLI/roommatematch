'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v2.json'
import type { Item } from '@/types/questionnaire'
import { CardSwipeFlow } from '@/components/questionnaire/CardSwipeFlow'

export default function LogisticsContextClient() {
  const items = useMemo(
    () => (itemsJson as Item[]).filter((i) => i.section === 'logistics-context'),
    [],
  )

  return (
    <CardSwipeFlow
      sectionKey="logistics-context"
      items={items}
      moduleIndex={0}
      moduleLabel="Logistics and Context"
      nextUrl="/dashboard"
      contextSubmit={{ userType: 'student' }}
      chrome={{
        titleOverride: 'Step 2 of 2',
        moduleIndex: 2,
        moduleTotal: 2,
        hideModuleTracker: true,
        showExit: false,
      }}
    />
  )
}
