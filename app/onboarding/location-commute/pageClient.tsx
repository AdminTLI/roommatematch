'use client'

import { useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import locItems from '@/data/item-bank.location.v1.json'
import type { Item } from '@/types/questionnaire'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { SectionIntro } from '@/components/questionnaire/SectionIntro'
import { QuestionRow } from '@/components/questionnaire/QuestionRow'
import { useOnboardingStore } from '@/store/onboarding'
import { GroupedSearchSelect } from '@/components/questionnaire/GroupedSearchSelect'
import { toGroupedOptions } from '@/lib/loadInstitutions'
import { loadCampuses } from '@/lib/loadCampuses'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function SectionClientContent() {
  const sectionKey = 'location-commute' as const
  const items = useMemo(() => (locItems as Item[]), [])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'

  const total = items.length
  const answered = countAnswered(sectionKey)

  const groupedInstitutions = toGroupedOptions()
  const campusOptions = loadCampuses()

  const nextDisabled = items.some((it) => !(answers[it.id]?.value))

  const saveSection = async () => {
    try {
      const answersArray = Object.values(answers)
      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey, answers: answersArray })
      })
    } catch (e) {
      console.error('Failed to save section', e)
    }
  }

  const { isSaving, showToast } = useAutosave(sectionKey)

  return (
    <QuestionnaireLayout
      stepIndex={1}
      totalSteps={11}
      title="Location & Commute"
      subtitle="Institution and campus help scope location & travel."
      onPrev={() => (window.location.href = isEditMode ? '/onboarding/intro?mode=edit' : '/onboarding/intro')}
      onNext={async () => { 
        await saveSection(); 
        window.location.href = isEditMode ? '/onboarding/personality-values?mode=edit' : '/onboarding/personality-values'
      }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      <div className="flex items-center justify-between">
        <SectionIntro title="Location & Commute" purpose="Set your institution and campus to tune location pairing." />
        <div className="text-sm text-gray-600">{answered}/{total} answered</div>
      </div>

      <div className="space-y-8 sm:space-y-6">
        {items.map((item) => (
          <QuestionRow key={item.id} label={item.label}>
            {item.optionsFrom === 'nl-institutions' && (
              <GroupedSearchSelect
                groups={groupedInstitutions}
                value={answers[item.id]?.value?.value}
                onChange={(v) => setAnswer(sectionKey, { itemId: item.id, value: { kind: 'mcq', value: v } })}
                allowOther
                otherLabel="Other (HBO/WO, not listed)"
              />
            )}
            {item.optionsFrom === 'nl-campuses' && (
              <GroupedSearchSelect
                groups={[
                  { group: 'WO', options: campusOptions.filter(c => c.group === 'WO').map((c) => ({ value: c.value, label: c.label })) },
                  { group: 'HBO', options: campusOptions.filter(c => c.group === 'HBO').map((c) => ({ value: c.value, label: c.label })) },
                ]}
                value={answers[item.id]?.value?.value}
                onChange={(v) => setAnswer(sectionKey, { itemId: item.id, value: { kind: 'mcq', value: v } })}
                allowOther
                otherLabel="Other campus/city"
              />
            )}
          </QuestionRow>
        ))}
      </div>
    </QuestionnaireLayout>
  )
}

export default function SectionClient() {
  return (
    <SuspenseWrapper>
      <SectionClientContent />
    </SuspenseWrapper>
  )
}


