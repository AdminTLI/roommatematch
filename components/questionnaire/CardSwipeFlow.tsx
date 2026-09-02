'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { Item, SectionKey } from '@/types/questionnaire'
import { useOnboardingStore, type Answer, type AnswerValue } from '@/store/onboarding'
import { LikertScale } from '@/components/questionnaire/LikertScale'
import { BipolarScale } from '@/components/questionnaire/BipolarScale'
import { RadioGroupMCQ } from '@/components/questionnaire/RadioGroupMCQ'
import { ToggleYesNo } from '@/components/questionnaire/ToggleYesNo'
import { TimeRange } from '@/components/questionnaire/TimeRange'
import { ModuleCompletionScreen } from '@/components/questionnaire/ModuleCompletionScreen'
import { ModuleTracker, isV2QuestionnaireComplete } from '@/components/questionnaire/ModuleTracker'
import { OnboardingChromeHeader } from '@/components/questionnaire/OnboardingChromeHeader'
import {
  DealbreakerBadge,
  DealbreakerMatchToggle,
} from '@/components/questionnaire/DealbreakerBadge'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'

interface CardSwipeFlowProps {
  sectionKey: SectionKey
  items: Item[]
  moduleIndex: number // 0-based (0 = M1 … 4 = M5)
  moduleLabel: string
  nextUrl: string
}

const SHORT_MODULE_LABELS = [
  'Logistics',
  'Environment',
  'Cleanliness',
  'Communication',
  'Social Life',
] as const

const CARD_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 72 : -72, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -72 : 72, opacity: 0 }),
}
const CARD_TRANSITION = { duration: 0.22, ease: 'easeInOut' as const }
const AUTO_ADVANCE_MS = 250

function initialQuestionIndex(
  items: Item[],
  answers: Record<string, unknown>,
  deepLinkId: string | null
): number {
  if (deepLinkId) {
    const deepIdx = items.findIndex((it) => it.id === deepLinkId)
    if (deepIdx >= 0) return deepIdx
  }
  const first = items.findIndex((it) => !answers[it.id])
  return first === -1 ? 0 : first
}

export function CardSwipeFlow(props: CardSwipeFlowProps) {
  return (
    <SuspenseWrapper>
      <CardSwipeFlowInner {...props} />
    </SuspenseWrapper>
  )
}

function CardSwipeFlowInner({
  sectionKey,
  items,
  moduleIndex,
  moduleLabel,
  nextUrl,
}: CardSwipeFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const answers = useOnboardingStore((s) => s.sections[sectionKey]) ?? {}
  const allSections = useOnboardingStore((s) => s.sections)

  const deepLinkQ = searchParams.get('q')
  const fromReview = searchParams.get('from') === 'review'
  const returnEditMode = searchParams.get('mode') === 'edit'

  const [currentIndex, setCurrentIndex] = useState(() =>
    initialQuestionIndex(items, answers, deepLinkQ)
  )
  const deepLinkAppliedRef = useRef(false)

  // useSearchParams is reliable on the client; re-apply once after mount so SSR
  // fallback (first unanswered / 0) does not stick when editing from review.
  useEffect(() => {
    if (deepLinkAppliedRef.current) return
    if (!deepLinkQ) {
      deepLinkAppliedRef.current = true
      return
    }
    const deepIdx = items.findIndex((it) => it.id === deepLinkQ)
    if (deepIdx >= 0) {
      setCurrentIndex(deepIdx)
      deepLinkAppliedRef.current = true
    }
  }, [deepLinkQ, items])

  const [direction, setDirection] = useState(1)
  const [showCompletion, setShowCompletion] = useState(false)
  const [savedVisible, setSavedVisible] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [gateOverrides, setGateOverrides] = useState<Record<string, boolean>>({})

  const { showToast: autosaveToast } = useAutosave(sectionKey)

  const item = items[currentIndex]
  const currentAnswer = item ? answers[item.id] : undefined
  const answeredCount = items.filter((i) => answers[i.id]).length
  const headerModuleIndex = moduleIndex + 1 // Module 1–5 (intro is 0)
  const headerLabel = SHORT_MODULE_LABELS[moduleIndex] ?? moduleLabel

  const questionnaireComplete = isV2QuestionnaireComplete(allSections, {
    currentSectionKey: sectionKey,
    answeredInCurrent: answeredCount,
    totalInCurrent: items.length,
  })
  const canJumpToReview = fromReview || questionnaireComplete

  const showSavedToast = useCallback(() => {
    // Local acknowledgment only — header "Autosaved" time comes from a real API save
    setSavedVisible(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSavedVisible(false), 1500)
  }, [])

  useEffect(() => {
    if (autosaveToast) showSavedToast()
  }, [autosaveToast, showSavedToast])

  const returnToReview = useCallback(() => {
    router.push(returnEditMode ? '/onboarding/review?mode=edit' : '/onboarding/review')
  }, [router, returnEditMode])

  const goNext = useCallback(() => {
    // Edits opened from review should return there after saving an answer.
    if (fromReview) {
      returnToReview()
      return
    }
    if (currentIndex < items.length - 1) {
      setDirection(1)
      setCurrentIndex((i) => i + 1)
    } else if (questionnaireComplete) {
      // Full questionnaire already done - skip interstitials and open review.
      returnToReview()
    } else {
      setShowCompletion(true)
    }
  }, [
    currentIndex,
    items.length,
    fromReview,
    questionnaireComplete,
    returnToReview,
  ])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((i) => i - 1)
    } else if (canJumpToReview) {
      returnToReview()
    }
  }, [currentIndex, canJumpToReview, returnToReview])

  const hardGateItems = items.filter((i) => i.hardGate)
  const hardGateIndex = item?.hardGate
    ? hardGateItems.findIndex((g) => g.id === item.id)
    : -1
  const gateEnabled = item
    ? (gateOverrides[item.id] ?? currentAnswer?.userSetGate ?? false)
    : false

  const commitAnswer = useCallback(
    (value: AnswerValue, userSetGate: boolean | undefined, autoAdvance: boolean) => {
      if (!item) return
      setAnswer(sectionKey, {
        itemId: item.id,
        value,
        ...(userSetGate !== undefined ? { userSetGate } : {}),
      } as Answer)
      showSavedToast()
      if (autoAdvance) setTimeout(goNext, AUTO_ADVANCE_MS)
    },
    [item, sectionKey, setAnswer, goNext, showSavedToast]
  )

  const handleAnswer = useCallback(
    (value: AnswerValue, autoAdvance = false) => {
      if (!item) return
      commitAnswer(value, item.hardGate ? gateEnabled : undefined, autoAdvance)
    },
    [item, commitAnswer, gateEnabled]
  )

  const handleGateToggle = useCallback(
    (next: boolean) => {
      if (!item) return
      setGateOverrides((prev) => ({ ...prev, [item.id]: next }))
      if (currentAnswer?.value) {
        commitAnswer(currentAnswer.value, next, false)
      }
    },
    [item, currentAnswer, commitAnswer]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev])

  if (showCompletion) {
    return (
      <ModuleCompletionScreen
        moduleIndex={moduleIndex}
        moduleLabel={moduleLabel}
        nextUrl={nextUrl}
        answeredCount={answeredCount}
        totalCount={items.length}
      />
    )
  }
  if (!item) return null

  const likertVal = (currentAnswer?.value as { kind: 'likert'; value: 1 | 2 | 3 | 4 | 5 } | undefined)
    ?.value
  const bipolarVal = (
    currentAnswer?.value as { kind: 'bipolar'; value: 1 | 2 | 3 | 4 | 5 } | undefined
  )?.value
  const mcqVal = (currentAnswer?.value as { kind: 'mcq'; value: string } | undefined)?.value
  const toggleVal = (currentAnswer?.value as { kind: 'toggle'; value: boolean } | undefined)?.value
  const timeVal = currentAnswer?.value as
    | { kind: 'timeRange'; start: string; end: string }
    | undefined

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingChromeHeader
          moduleIndex={headerModuleIndex}
          moduleTotal={5}
          moduleLabel={headerLabel}
          belowProgress={
            <ModuleTracker
              currentModuleIndex={moduleIndex}
              answeredInCurrent={answeredCount}
              totalInCurrent={items.length}
            />
          }
        />

        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-8">
          <div className="flex w-full max-w-[560px] flex-col gap-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={item.id}
                custom={direction}
                variants={CARD_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={CARD_TRANSITION}
                className="h-fit w-full rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80 sm:p-8"
              >
                <div className="mb-5 flex items-center justify-between gap-2 sm:gap-3">
                  <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.12em]">
                    {moduleLabel}
                  </p>
                  <p className="whitespace-nowrap text-[11px] font-semibold text-slate-600 dark:text-slate-300 sm:text-xs">
                    Question {currentIndex + 1} of {items.length}
                  </p>
                </div>

                {item.hardGate && hardGateIndex >= 0 ? (
                  <DealbreakerBadge
                    index={hardGateIndex + 1}
                    total={hardGateItems.length}
                    showExplanation={hardGateIndex === 0}
                  />
                ) : null}

                <h2 className="mb-6 text-lg font-bold leading-snug tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-xl">
                  {item.label}
                </h2>

                <div className="w-full">
                  {item.kind === 'likert' && (
                    <LikertScale
                      id={item.id}
                      label=""
                      scaleType={item.scale ?? 'agreement'}
                      value={likertVal}
                      onChange={(v) => handleAnswer({ kind: 'likert', value: v }, true)}
                    />
                  )}
                  {item.kind === 'bipolar' && item.bipolarLabels && (
                    <BipolarScale
                      id={item.id}
                      leftLabel={item.bipolarLabels.left}
                      rightLabel={item.bipolarLabels.right}
                      softLeftLabel={item.bipolarLabels.softLeft}
                      softRightLabel={item.bipolarLabels.softRight}
                      value={bipolarVal}
                      onChange={(v) => handleAnswer({ kind: 'bipolar', value: v }, true)}
                    />
                  )}
                  {item.kind === 'mcq' && item.options && (
                    <RadioGroupMCQ
                      id={item.id}
                      label=""
                      options={item.options}
                      value={mcqVal}
                      onChange={(v) => handleAnswer({ kind: 'mcq', value: v }, true)}
                    />
                  )}
                  {item.kind === 'toggle' && (
                    <ToggleYesNo
                      id={item.id}
                      label=""
                      checked={toggleVal}
                      yesLabel="Yes, I agree"
                      noLabel="No, I don't agree"
                      onChange={(v) => handleAnswer({ kind: 'toggle', value: v }, true)}
                    />
                  )}
                  {item.kind === 'timeRange' && (
                    <TimeRange
                      id={item.id}
                      label=""
                      start={timeVal?.start}
                      end={timeVal?.end}
                      startFrom={item.timeRangeBounds?.startFrom}
                      startTo={item.timeRangeBounds?.startTo}
                      endFrom={item.timeRangeBounds?.endFrom}
                      endTo={item.timeRangeBounds?.endTo}
                      overnight={item.timeRangeBounds?.overnight}
                      onChange={(start, end) => {
                        const complete = Boolean(start && end)
                        handleAnswer({ kind: 'timeRange', start, end }, complete)
                      }}
                    />
                  )}
                </div>

                {item.hardGate && hardGateIndex >= 0 ? (
                  <DealbreakerMatchToggle
                    itemId={item.id}
                    enabled={gateEnabled}
                    onEnabledChange={handleGateToggle}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="relative flex flex-col items-center gap-2 px-1">
              <div className="relative flex w-full items-center justify-center">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!canJumpToReview && currentIndex === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-600 dark:text-slate-300 dark:hover:text-indigo-300 dark:disabled:hover:text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                  {canJumpToReview && currentIndex === 0
                    ? 'Back to review'
                    : 'Previous Question'}
                </button>

                <AnimatePresence>
                  {savedVisible && (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {canJumpToReview && currentIndex > 0 ? (
                <button
                  type="button"
                  onClick={returnToReview}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Back to review
                </button>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
