'use client'

import { useEffect, useMemo, useState } from 'react'
import { toGroupedOptions } from '@/lib/loadInstitutions'
import { GroupedSearchSelect } from './GroupedSearchSelect'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value?: string
  onChange: (slugOrOther: { institutionId: string; institutionOther?: string; universityDbId?: string }) => void
}

export function InstitutionSelect({ value, onChange }: Props) {
  const groups = useMemo(() => toGroupedOptions(), [])
  const [other, setOther] = useState<string | undefined>(undefined)

  return (
    <div className="space-y-2">
      <GroupedSearchSelect
        placeholder="Select your HBO/WO institution"
        groups={groups}
        value={value}
        onChange={(v) => {
          if (v === 'other') {
            onChange({ institutionId: 'other', institutionOther: other })
          } else {
            onChange({ institutionId: v })
          }
        }}
        allowOther
        otherLabel="Other (HBO/WO, not listed)"
        onOtherChange={(t) => {
          setOther(t)
          if (t) {
            onChange({ institutionId: 'other', institutionOther: t })
          }
        }}
      />
      {other && (
        <div className="text-xs text-gray-600">We'll review this institution. For now, your selection will be stored as "Other".</div>
      )}
    </div>
  )
}


