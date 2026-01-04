'use client'

import { useEffect, useMemo, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { QuestionRow } from '@/components/questionnaire/QuestionRow'
import { LikertScale } from '@/components/questionnaire/LikertScale'
import { BipolarScale } from '@/components/questionnaire/BipolarScale'
import { RadioGroupMCQ } from '@/components/questionnaire/RadioGroupMCQ'
import { ToggleYesNo } from '@/components/questionnaire/ToggleYesNo'
import { TimeRange } from '@/components/questionnaire/TimeRange'
import { NumberInput } from '@/components/questionnaire/NumberInput'
import { useOnboardingStore } from '@/store/onboarding'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function SectionClientContent() {
  const sectionKey = 'personality-values' as const
  const items = useMemo(() => (itemsJson as Item[]).filter((i) => i.section === sectionKey), [])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setDealBreaker = useOnboardingStore((s) => s.setDealBreaker)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()
  const sectionStartTime = useRef<number>(Date.now())
  const hasTrackedStart = useRef<boolean>(false)

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'

  // Track section started analytics
  useEffect(() => {
    if (hasTrackedStart.current) return
    hasTrackedStart.current = true
    
    const trackSectionStart = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'questionnaire_section_started',
              props: {
                section: sectionKey,
                is_edit_mode: isEditMode
              },
              user_id: user.id
            })
          }).catch(() => {}) // Silently fail if analytics unavailable
        }
      } catch (error) {
        // Silently fail analytics tracking
      }
    }
    
    trackSectionStart()
  }, [sectionKey, isEditMode])

  const total = items.length
  // Fix hydration error: use state that starts at 0 and updates after mount
  const [answered, setAnswered] = useState(0)
  
  useEffect(() => {
    // Update answered count after mount to avoid hydration mismatch
    // Also updates when answers change (e.g., when user answers a question)
    setAnswered(countAnswered(sectionKey))
  }, [countAnswered, sectionKey, answers])

  const handleChange = (item: Item, value: any) => {
    setAnswer(sectionKey, { itemId: item.id, value })
  }

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
      stepIndex={2}
      totalSteps={11}
      title="Personality & Values"
      subtitle="Reliability, flexibility, and how you prefer the home to ‘feel’."
      onPrev={() => (window.location.href = isEditMode ? '/onboarding/location-commute?mode=edit' : '/onboarding/location-commute')}
      onNext={async () => { await saveSection(); window.location.href = isEditMode ? '/onboarding/sleep-circadian?mode=edit' : '/onboarding/sleep-circadian' }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      {/* Progress counter */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700">
          {answered}/{total} answered
        </div>
      </div>
      <div className="space-y-8 sm:space-y-6">
        {items.map((item) => (
          <QuestionRow
            key={item.id}
            label={item.label}
            showDealBreaker={!!item.dbEligible}
            dealBreaker={answers[item.id]?.dealBreaker}
            onDealBreakerChange={(v) => setDealBreaker(sectionKey, item.id, v)}
          >
            {item.kind === 'likert' && (
              <LikertScale
                id={item.id}
                label=""
                scaleType={item.scale as any}
                value={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'likert', value: v })}
              />
            )}
            {item.kind === 'bipolar' && (
              <BipolarScale
                id={item.id}
                leftLabel={item.bipolarLabels?.left || ''}
                rightLabel={item.bipolarLabels?.right || ''}
                value={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'bipolar', value: v })}
              />
            )}
            {item.kind === 'mcq' && item.options && (
              <RadioGroupMCQ
                id={item.id}
                label=""
                options={item.options}
                value={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'mcq', value: v })}
              />
            )}
            {item.kind === 'toggle' && (
              <ToggleYesNo
                id={item.id}
                label=""
                checked={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'toggle', value: v })}
              />
            )}
            {item.kind === 'timeRange' && (
              <TimeRange
                id={item.id}
                label=""
                start={answers[item.id]?.value?.start}
                end={answers[item.id]?.value?.end}
                onChange={(s, e) => handleChange(item, { kind: 'timeRange', start: s, end: e })}
              />
            )}
            {item.kind === 'number' && (
              <NumberInput
                id={item.id}
                label=""
                value={answers[item.id]?.value?.value}
                min={item.min}
                max={item.max}
                onChange={(v) => handleChange(item, v == null ? v : { kind: 'number', value: v })}
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


