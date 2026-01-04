'use client'

import { useMemo, Suspense, useState, useEffect } from 'react'
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
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function SectionClientContent() {
  const sectionKey = 'noise-sensory' as const
  const items = useMemo(() => (itemsJson as Item[]).filter((i) => i.section === sectionKey), [])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setDealBreaker = useOnboardingStore((s) => s.setDealBreaker)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'

  const total = items.length
  
  // Track if component is mounted to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const answered = countAnswered(sectionKey)

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
  const { showToast } = useAutosave(sectionKey)

  return (
    <QuestionnaireLayout
      stepIndex={4}
      totalSteps={11}
      title="Noise & Sensory"
      subtitle="Sound, light, air, and thermal comfort in shared spaces."
      onPrev={() => (window.location.href = isEditMode ? '/onboarding/sleep-circadian?mode=edit' : '/onboarding/sleep-circadian')}
      onNext={async () => { await saveSection(); window.location.href = isEditMode ? '/onboarding/home-operations?mode=edit' : '/onboarding/home-operations' }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      {/* Progress counter - only render after mount to avoid hydration mismatch */}
      {isMounted && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700">
            {answered}/{total} answered
          </div>
        </div>
      )}
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
                label={item.label}
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
                label={item.label}
                options={item.options}
                value={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'mcq', value: v })}
              />
            )}
            {item.kind === 'toggle' && (
              <ToggleYesNo
                id={item.id}
                label={item.label}
                checked={answers[item.id]?.value?.value}
                onChange={(v) => handleChange(item, { kind: 'toggle', value: v })}
              />
            )}
            {item.kind === 'timeRange' && (
              <TimeRange
                id={item.id}
                label={item.label}
                start={answers[item.id]?.value?.start}
                end={answers[item.id]?.value?.end}
                onChange={(s, e) => handleChange(item, { kind: 'timeRange', start: s, end: e })}
              />
            )}
            {item.kind === 'number' && (
              <NumberInput
                id={item.id}
                label={item.label}
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
