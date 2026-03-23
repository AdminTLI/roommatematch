'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import itemsJson from '@/data/item-bank.yp.m1.v1.json'
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
  const hasTrackedStart = useRef<boolean>(false)

  const isEditMode = searchParams.get('mode') === 'edit'

  useEffect(() => {
    if (hasTrackedStart.current) return
    hasTrackedStart.current = true

    const trackSectionStart = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'questionnaire_section_started',
              props: {
                section: sectionKey,
                is_edit_mode: isEditMode,
              },
              user_id: user.id,
            }),
          }).catch(() => {})
        }
      } catch {
        // Ignore analytics failures.
      }
    }

    trackSectionStart()
  }, [sectionKey, isEditMode])

  const total = items.length
  const [answered, setAnswered] = useState(0)

  useEffect(() => {
    setAnswered(countAnswered(sectionKey))
  }, [countAnswered, sectionKey, answers])

  const handleChange = (item: Item, value: unknown) => {
    setAnswer(sectionKey, { itemId: item.id, value: value as any })
  }

  const nextDisabled = items.some((it) => !(answers[it.id]?.value))

  const saveSection = async () => {
    try {
      const answersArray = Object.values(answers)
      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey, answers: answersArray }),
      })
    } catch (e) {
      console.error('Failed to save section', e)
    }
  }

  const { showToast } = useAutosave(sectionKey)

  return (
    <QuestionnaireLayout
      stepIndex={2}
      totalSteps={11}
      title="Personality & Values"
      subtitle="Reliability, flexibility, and how you prefer the home to 'feel'."
      onPrev={() => {
        window.location.href = isEditMode
          ? '/onboarding-professional/professional-context?mode=edit'
          : '/onboarding-professional/professional-context'
      }}
      onNext={async () => {
        await saveSection()
        window.location.href = isEditMode
          ? '/onboarding-professional/sleep-circadian?mode=edit'
          : '/onboarding-professional/sleep-circadian'
      }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
          {answered}/{total} answered
        </div>
      </div>

      <div className="space-y-8 sm:space-y-6">
        {items.map((item) => (
          <QuestionRow
            key={item.id}
            label={item.label}
            specialCategory={!!item.specialCategory}
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

