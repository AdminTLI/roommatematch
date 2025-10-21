'use client'

import { useMemo } from 'react'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { SectionIntro } from '@/components/questionnaire/SectionIntro'
import { QuestionRow } from '@/components/questionnaire/QuestionRow'
import { LikertScale } from '@/components/questionnaire/LikertScale'
import { BipolarScale } from '@/components/questionnaire/BipolarScale'
import { RadioGroupMCQ } from '@/components/questionnaire/RadioGroupMCQ'
import { ToggleYesNo } from '@/components/questionnaire/ToggleYesNo'
import { TimeRange } from '@/components/questionnaire/TimeRange'
import { NumberInput } from '@/components/questionnaire/NumberInput'
import { useOnboardingStore } from '@/store/onboarding'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'

export default function SectionClient() {
  const sectionKey = 'privacy-territoriality' as const
  const items = useMemo(() => (itemsJson as Item[]).filter((i) => i.section === sectionKey), [])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setDealBreaker = useOnboardingStore((s) => s.setDealBreaker)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])

  const total = items.length
  const answered = countAnswered(sectionKey)

  const handleChange = (item: Item, value: any) => {
    setAnswer(sectionKey, { itemId: item.id, value })
  }

  const nextDisabled = items.some((it) => !(answers[it.id]?.value))
  const { showToast } = useAutosave(sectionKey)

  return (
    <QuestionnaireLayout
      stepIndex={8}
      totalSteps={11}
      title="Privacy & Territoriality"
      subtitle="Borrowing, door etiquette, photos, and personal zones."
      onPrev={() => (window.location.href = '/onboarding/communication-conflict')}
      onNext={() => (window.location.href = '/onboarding/reliability-logistics')}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      <div className="flex items-center justify-between">
        <SectionIntro title="Privacy & Territoriality" purpose="Borrowing, door etiquette, photos, and personal zones." />
        <div className="text-sm text-gray-600">{answered}/{total} answered</div>
      </div>
      <div className="space-y-6">
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


