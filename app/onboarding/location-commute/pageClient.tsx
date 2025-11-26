'use client'

import { useMemo, Suspense, useEffect, useState } from 'react'
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

  // Initialize autosave hook first (before useEffect that uses hasLoaded)
  const { isSaving, showToast, hasLoaded } = useAutosave(sectionKey)
  
  // Track if component is mounted to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-populate university from intro section if not already set
  // This runs after autosave has loaded to ensure we don't overwrite saved data
  useEffect(() => {
    const universityItemId = 'M9_Q0_University'
    const universityValue = answers[universityItemId]?.value?.value
    
    // Only auto-populate if:
    // 1. The field is empty
    // 2. Autosave has finished loading (to avoid race conditions)
    if (!universityValue && hasLoaded) {
      // Load intro section to get institution_slug
      fetch('/api/onboarding/load?section=intro')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load intro section')
          return res.json()
        })
        .then(data => {
          if (data.answers && Array.isArray(data.answers)) {
            // Find institution_slug from intro answers
            const introData = data.answers.reduce((acc: any, answer: any) => {
              acc[answer.itemId] = answer.value
              return acc
            }, {})
            
            const institutionSlug = introData.institution_slug || introData.university_slug
            
            // Double-check the value still hasn't been set (might have been set by autosave in the meantime)
            const currentValue = answers[universityItemId]?.value?.value
            if (!currentValue && institutionSlug && institutionSlug !== 'other') {
              // Set the answer using the institution slug as the value
              // (the GroupedSearchSelect uses the id from nl-institutions.v1.json which matches the slug)
              setAnswer(sectionKey, {
                itemId: universityItemId,
                value: { kind: 'mcq', value: institutionSlug }
              })
              console.log('[Location-Commute] Auto-populated university from intro section:', institutionSlug)
            }
          }
        })
        .catch(err => {
          // Silently fail - user can manually select
          console.debug('[Location-Commute] Could not load intro section for auto-population:', err)
        })
    }
  }, [answers, setAnswer, sectionKey, hasLoaded]) // Re-run when autosave finishes loading

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
        {/* Only render count after mount to avoid hydration mismatch */}
        {isMounted && (
          <div className="text-sm text-gray-600">{answered}/{total} answered</div>
        )}
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


