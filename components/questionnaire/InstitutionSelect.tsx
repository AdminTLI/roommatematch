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
  const supabase = createClient()

  const handleInstitutionChange = async (v: string) => {
    if (v === 'other') {
      onChange({ institutionId: 'other', institutionOther: other })
    } else {
      // Look up university_id from slug
      try {
        const { data: uniData, error } = await supabase
          .from('universities')
          .select('id, slug')
          .eq('slug', v)
          .maybeSingle()
        
        if (!error && uniData) {
          onChange({ institutionId: v, universityDbId: uniData.id })
        } else {
          // If lookup fails, still pass the slug (submit route will handle it)
          onChange({ institutionId: v })
        }
      } catch (error) {
        console.error('Error looking up university:', error)
        // If lookup fails, still pass the slug (submit route will handle it)
        onChange({ institutionId: v })
      }
    }
  }

  return (
    <div className="space-y-2">
      <GroupedSearchSelect
        placeholder="Select your HBO/WO institution"
        groups={groups}
        value={value}
        onChange={handleInstitutionChange}
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


