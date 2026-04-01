'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import itemsJson from '@/data/item-bank.yp.m2.v1.json'
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
import { isAnswerValueComplete, typedAnswer } from '@/lib/questionnaire/is-answer-complete'

function SectionClientContent() {
  const sectionKey = 'sleep-circadian' as const
  const items = useMemo(() => (itemsJson as Item[]).filter((i) => i.section === sectionKey), [])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setDealBreaker = useOnboardingStore((s) => s.setDealBreaker)
  const setMarksImportant = useOnboardingStore((s) => s.setMarksImportant)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const total = items.length
  const answered = countAnswered(sectionKey)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
        body: JSON.stringify({ section: sectionKey, answers: answersArray }),
      })
    } catch (e) {
      console.error('Failed to save section', e)
    }
  }

  const { showToast } = useAutosave(sectionKey)

  return (
    <QuestionnaireLayout
      stepIndex={3}
      totalSteps={11}
      title="Sleep & Circadian"
      subtitle="Daily rhythms and quiet-hour expectations."
      onPrev={() => {
        window.location.href = isEditMode
          ? '/onboarding-professional/personality-values?mode=edit'
          : '/onboarding-professional/personality-values'
      }}
      onNext={async () => {
        await saveSection()
        window.location.href = isEditMode
          ? '/onboarding-professional/noise-sensory?mode=edit'
          : '/onboarding-professional/noise-sensory'
      }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      {isMounted && (
        <div className="mb-4 flex justify-end">
          <div className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
            {answered}/{total} answered
          </div>
        </div>
      )}
      <div className="space-y-8 sm:space-y-6">
        {items.map((item) => (
          <QuestionRow
            key={item.id}
            itemId={item.id}
            label={item.label}
            specialCategory={!!item.specialCategory}
            showDealBreaker={!!item.dbEligible}
            dealBreaker={answers[item.id]?.dealBreaker}
            onDealBreakerChange={(v) => setDealBreaker(sectionKey, item.id, v)}
            marksImportant={!!answers[item.id]?.marksImportant}
            importanceDisabled={!isAnswerValueComplete(answers[item.id]?.value)}
            onMarksImportantChange={(v) => setMarksImportant(sectionKey, item.id, v)}
          >
            {item.kind === 'likert' && (
              <LikertScale
                id={item.id}
                label={item.label}
                scaleType={item.scale as any}
                value={typedAnswer(answers[item.id], 'likert')?.value}
                onChange={(v) => handleChange(item, { kind: 'likert', value: v })}
              />
            )}
            {item.kind === 'bipolar' && (
              <BipolarScale
                id={item.id}
                leftLabel={item.bipolarLabels?.left || ''}
                rightLabel={item.bipolarLabels?.right || ''}
                value={typedAnswer(answers[item.id], 'bipolar')?.value}
                onChange={(v) => handleChange(item, { kind: 'bipolar', value: v })}
              />
            )}
            {item.kind === 'mcq' && item.options && (
              <RadioGroupMCQ
                id={item.id}
                label={item.label}
                options={item.options}
                value={typedAnswer(answers[item.id], 'mcq')?.value}
                onChange={(v) => handleChange(item, { kind: 'mcq', value: v })}
              />
            )}
            {item.kind === 'toggle' && (
              <ToggleYesNo
                id={item.id}
                label={item.label}
                checked={typedAnswer(answers[item.id], 'toggle')?.value}
                onChange={(v) => handleChange(item, { kind: 'toggle', value: v })}
              />
            )}
            {item.kind === 'timeRange' && (
              <TimeRange
                id={item.id}
                label={item.label}
                start={typedAnswer(answers[item.id], 'timeRange')?.start}
                end={typedAnswer(answers[item.id], 'timeRange')?.end}
                onChange={(s, e) => handleChange(item, { kind: 'timeRange', start: s, end: e })}
              />
            )}
            {item.kind === 'number' && (
              <NumberInput
                id={item.id}
                label={item.label}
                value={typedAnswer(answers[item.id], 'number')?.value}
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

