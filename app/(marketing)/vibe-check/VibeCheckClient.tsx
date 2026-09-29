'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Loader2,
  Mail,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { openBlobInNewTab } from '@/lib/pdf/download-blob'
import {
  VIBE_CHECK_QUESTIONS,
  VIBE_MODULE_LABELS,
  type VibeModule,
} from '@/lib/vibe-check/questions'
import { calculateArchetype, type ArchetypeResult } from '@/lib/vibe-check/archetype'
import {
  cityForUniversity,
  saveVibeCheckSession,
  universityDisplayName,
  type VibeUniversityChoice,
} from '@/lib/vibe-check/session'
import { buildVibeShareSubject, buildVibeShareText } from '@/lib/vibe-check/share-copy'
import { getOrCreateSessionId } from '@/lib/analytics/session-tracker'

type Step = 'university' | 'quiz' | 'results' | 'beta' | 'done'

type CohortAverages = {
  environment: number
  cleanliness: number
  communication: number
  social: number
}

const MODULE_BAR_CLASS: Record<VibeModule, string> = {
  environment: 'bg-indigo-500',
  cleanliness: 'bg-emerald-500',
  communication: 'bg-amber-500',
  social: 'bg-pink-500',
}

/** Spectrum labels for preference position. */
const PROFILE_AXIS: Record<
  VibeModule,
  { low: string; mid: string; high: string }
> = {
  environment: {
    low: 'Early & quiet',
    mid: 'Flexible rhythm',
    high: 'Later & flexible',
  },
  cleanliness: {
    low: 'More relaxed',
    mid: 'Lived-in tidy',
    high: 'Very tidy',
  },
  communication: {
    low: 'Holds back',
    mid: 'Balanced',
    high: 'Speaks up early',
  },
  social: {
    low: 'Quiet home',
    mid: 'Occasional guests',
    high: 'Social hub',
  },
}

const MODULE_ORDER: VibeModule[] = [
  'environment',
  'cleanliness',
  'communication',
  'social',
]

export function VibeCheckClient() {
  const [step, setStep] = useState<Step>('university')
  const [university, setUniversity] = useState<VibeUniversityChoice | null>(null)
  const [universityOther, setUniversityOther] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null)
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [lifestyleFitPercent, setLifestyleFitPercent] = useState<number | null>(null)
  const [cohortAverages, setCohortAverages] = useState<CohortAverages | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [fitLoading, setFitLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [skipVisible, setSkipVisible] = useState(false)
  const [betaSubmitting, setBetaSubmitting] = useState(false)

  const city = useMemo(
    () => (university ? cityForUniversity(university, universityOther) : 'Breda'),
    [university, universityOther]
  )

  const universityLabel = useMemo(
    () =>
      university
        ? universityDisplayName(university, universityOther)
        : 'Your university',
    [university, universityOther]
  )

  const currentQuestion = VIBE_CHECK_QUESTIONS[quizIndex]
  const quizProgress = ((quizIndex + (answers[currentQuestion?.id] ? 1 : 0)) / VIBE_CHECK_QUESTIONS.length) * 100

  useEffect(() => {
    if (step !== 'beta') {
      setSkipVisible(false)
      return
    }
    const t = window.setTimeout(() => setSkipVisible(true), 1500)
    return () => window.clearTimeout(t)
  }, [step])

  const trackVibeEvent = useCallback(
    async (
      eventName: 'vibe_check_meet_cta' | 'vibe_check_share' | 'vibe_check_download',
      properties?: Record<string, string | number | boolean | null>
    ) => {
      try {
        const sessionId = getOrCreateSessionId()
        await fetch('/api/vibe-check/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            sessionId,
            responseId,
            properties: properties ?? {},
          }),
        })
      } catch {
        // non-blocking
      }
    },
    [responseId]
  )

  const persistAnswers = useCallback(
    async (
      nextAnswers: Record<string, number>,
      meta?: {
        lifestyleFitPercent?: number | null
        matchCount?: number | null
        responseId?: string | null
      }
    ) => {
      try {
        const sessionId = getOrCreateSessionId()
        const res = await fetch('/api/vibe-check/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            responseId: meta?.responseId ?? responseId,
            university: universityLabel,
            universityOther: university === 'other' ? universityOther.trim() : null,
            city,
            answers: nextAnswers,
            lifestyleFitPercent: meta?.lifestyleFitPercent ?? null,
            matchCount: meta?.matchCount ?? null,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { responseId?: string }
        if (data.responseId) setResponseId(data.responseId)
        return data.responseId ?? null
      } catch {
        return null
      }
    },
    [city, responseId, university, universityLabel, universityOther]
  )

  const fetchLifestyleFit = useCallback(async (nextAnswers: Record<string, number>) => {
    setFitLoading(true)
    try {
      const res = await fetch('/api/vibe-check/lifestyle-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: nextAnswers }),
      })
      const data = (await res.json()) as {
        matchCount?: number
        lifestyleFitPercent?: number
        cohortAverages?: CohortAverages | null
      }
      const nextMatch = typeof data.matchCount === 'number' ? data.matchCount : 10
      const nextFit =
        typeof data.lifestyleFitPercent === 'number' ? data.lifestyleFitPercent : 60
      setMatchCount(nextMatch)
      setLifestyleFitPercent(nextFit)
      setCohortAverages(data.cohortAverages ?? null)
      return { matchCount: nextMatch, lifestyleFitPercent: nextFit }
    } catch {
      setMatchCount(10)
      setLifestyleFitPercent(60)
      setCohortAverages(null)
      return { matchCount: 10, lifestyleFitPercent: 60 }
    } finally {
      setFitLoading(false)
    }
  }, [])

  const canContinueUniversity =
    acceptedTerms &&
    (university === 'avans' ||
      university === 'buas' ||
      (university === 'other' && universityOther.trim().length >= 2))

  const finishQuiz = useCallback(
    (nextAnswers: Record<string, number>) => {
      const result = calculateArchetype(nextAnswers)
      setArchetype(result)
      setStep('results')
      void (async () => {
        const id = await persistAnswers(nextAnswers)
        const fit = await fetchLifestyleFit(nextAnswers)
        await persistAnswers(nextAnswers, { ...fit, responseId: id })
      })()
    },
    [fetchLifestyleFit, persistAnswers]
  )

  const selectAnswer = (value: number) => {
    if (!currentQuestion) return
    const next = { ...answers, [currentQuestion.id]: value }
    setAnswers(next)
    window.setTimeout(() => {
      if (quizIndex < VIBE_CHECK_QUESTIONS.length - 1) {
        setQuizIndex((i) => i + 1)
      } else {
        finishQuiz(next)
      }
    }, 180)
  }

  const persistSession = (emailValue?: string) => {
    if (!archetype || !university) return
    saveVibeCheckSession({
      university,
      universityOther: university === 'other' ? universityOther.trim() : undefined,
      city,
      answers,
      archetype,
      matchCount: matchCount ?? 10,
      lifestyleFitPercent: lifestyleFitPercent ?? 60,
      email: emailValue,
      completedAt: new Date().toISOString(),
    })
  }

  const handleDownloadPdf = async () => {
    if (!archetype) return
    setPdfLoading(true)
    void trackVibeEvent('vibe_check_download')
    try {
      const res = await fetch('/api/pdf/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: universityLabel,
          city,
          answers,
          matchCount: matchCount ?? 10,
          lifestyleFitPercent: lifestyleFitPercent ?? 60,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'PDF generation failed')
      }
      const blob = await res.blob()
      openBlobInNewTab(blob)
      showSuccessToast('Passport ready', 'Opened your PDF in a new tab.')
    } catch (err) {
      showErrorToast(
        'Download failed',
        err instanceof Error ? err.message : 'Could not open your PDF.'
      )
    } finally {
      setPdfLoading(false)
    }
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/vibe-check`
      : 'https://www.domumatch.com/vibe-check'

  const shareText = archetype
    ? buildVibeShareText(archetype, shareUrl)
    : `Let's see if we'd actually survive living together. Take the Domu Match vibe check with me!\n${shareUrl}`

  const shareSubject = archetype
    ? buildVibeShareSubject(archetype)
    : `Take the Domu Match vibe check with me`

  const handleShareChannel = (channel: string) => {
    void trackVibeEvent('vibe_check_share', { channel })
  }

  const handleNativeShare = async () => {
    handleShareChannel('native')
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareSubject,
          text: shareText,
        })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(shareText)
      showSuccessToast('Copied', 'Paste it wherever you want.')
    } catch {
      showErrorToast('Share failed', 'Could not copy the message.')
    }
  }

  const copyShareLink = async () => {
    handleShareChannel('copy')
    try {
      await navigator.clipboard.writeText(shareText)
      showSuccessToast('Copied', 'Share text is on your clipboard.')
    } catch {
      showErrorToast('Copy failed', 'Could not copy to clipboard.')
    }
  }

  const goToMeetCta = () => {
    void trackVibeEvent('vibe_check_meet_cta')
    setStep('beta')
  }

  const completeBeta = (emailValue?: string) => {
    persistSession(emailValue)
    setStep('done')
  }

  const handleBetaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed.includes('@') || trimmed.length < 5) {
      showErrorToast('Email needed', 'Enter an email address that includes @.')
      return
    }
    setBetaSubmitting(true)
    window.setTimeout(() => {
      setBetaSubmitting(false)
      completeBeta(trimmed)
      showSuccessToast('You are in', 'Finish signing up to meet roommate matches.')
    }, 400)
  }

  const signUpHref = `/auth/sign-up?type=student&from=vibe-check&next=${encodeURIComponent('/vibe-check')}`

  return (
    <Section className="py-8 sm:py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-lg">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find your roommate archetype
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Answer a few lifestyle questions, see who matches your vibe, and meet students in{' '}
              {city} looking for roommates.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'university' && (
              <motion.div
                key="university"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7"
              >
                <h2 className="text-lg font-semibold text-slate-900">Where do you study?</h2>
                <p className="mt-1 text-sm text-slate-600">
                  We use this for your passport badge and local match cohort.
                </p>
                <div className="mt-5 grid gap-3">
                  {(
                    [
                      { id: 'avans' as const, label: 'Avans University of Applied Sciences' },
                      { id: 'buas' as const, label: 'Breda University of Applied Sciences (BUas)' },
                      { id: 'other' as const, label: 'Other university' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUniversity(opt.id)}
                      className={cn(
                        'flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                        university === opt.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                      )}
                    >
                      {opt.label}
                      {university === opt.id ? <Check className="h-4 w-4 text-indigo-600" /> : null}
                    </button>
                  ))}
                </div>
                {university === 'other' ? (
                  <input
                    type="text"
                    value={universityOther}
                    onChange={(e) => setUniversityOther(e.target.value)}
                    placeholder="e.g. Tilburg University"
                    className="mt-4 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  />
                ) : null}
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm leading-snug text-slate-700">
                    I agree to share my answers anonymously so Domu Match can show lifestyle fits.
                    Your responses are used safely for matching insights only.{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms &amp; Conditions
                    </Link>
                    .
                  </span>
                </label>
                <Button
                  className="mt-6 w-full"
                  disabled={!canContinueUniversity}
                  onClick={() => {
                    setQuizIndex(0)
                    setStep('quiz')
                  }}
                >
                  Start vibe check
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 'quiz' && currentQuestion && (
              <motion.div
                key={`quiz-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7"
              >
                <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                    onClick={() => {
                      if (quizIndex === 0) setStep('university')
                      else setQuizIndex((i) => i - 1)
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <span>
                    Question {quizIndex + 1} of {VIBE_CHECK_QUESTIONS.length}
                  </span>
                </div>
                <Progress value={Math.max(8, quizProgress)} className="mb-5 h-2" />
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                  {VIBE_MODULE_LABELS[currentQuestion.module].title}
                </p>
                <h2 className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
                  {currentQuestion.question}
                </h2>
                <div className="mt-5 grid gap-2.5">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.id] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectAnswer(opt.value)}
                        className={cn(
                          'min-h-12 rounded-2xl border px-4 py-3 text-left text-sm transition',
                          selected
                            ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-900 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-slate-50'
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 'results' && archetype && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Match reveal + primary CTA first */}
                <div className="rounded-3xl border border-indigo-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
                  <p className="text-center text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                    You share a{' '}
                    <span className="tabular-nums text-indigo-600">
                      {fitLoading || lifestyleFitPercent == null ? '…' : `${lifestyleFitPercent}%+`}
                    </span>{' '}
                    lifestyle fit with{' '}
                    <span className="tabular-nums text-indigo-600">
                      {fitLoading || matchCount == null ? '…' : matchCount}
                    </span>{' '}
                    students in {city}!
                  </p>
                  <p className="mt-2 text-center text-sm text-slate-600">
                    Based on how similarly you approach day-to-day living - sleep, cleanliness,
                    communication, and guests.
                  </p>
                  <Button className="mt-5 w-full" size="lg" onClick={goToMeetCta}>
                    Meet your next roommate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-6 text-white shadow-[0_18px_50px_rgba(79,70,229,0.35)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">
                    Your archetype
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {archetype.title}
                  </h2>
                  <p className="mt-1 text-sm text-indigo-100">{archetype.subtitle}</p>
                  <p className="mt-3 text-sm italic text-white/90">&ldquo;{archetype.tagline}&rdquo;</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {archetype.traits.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/90">{archetype.description}</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
                  <div className="mb-5 border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900">Your living style</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      See where you land on each area - the little mark shows where others tend to sit
                      on average.
                    </p>
                  </div>

                  <ul className="space-y-5">
                    {MODULE_ORDER.map((mod) => {
                      const pct = Math.round(archetype.scores[mod])
                      const avg = cohortAverages
                        ? Math.round(cohortAverages[mod])
                        : null
                      const meta = VIBE_MODULE_LABELS[mod]
                      const axis = PROFILE_AXIS[mod]
                      const band =
                        pct <= 33 ? axis.low : pct <= 66 ? axis.mid : axis.high
                      return (
                        <li key={mod}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">{meta.title}</p>
                            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                              {band}
                            </span>
                          </div>
                          <div className="relative h-2.5 rounded-full bg-slate-100">
                            <div
                              className={cn('h-full rounded-full transition-all', MODULE_BAR_CLASS[mod])}
                              style={{ width: `${Math.max(6, pct)}%` }}
                            />
                            {avg != null ? (
                              <span
                                aria-label={`Average ${avg}`}
                                className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-slate-800"
                                style={{ left: `calc(${Math.min(98, Math.max(2, avg))}% - 1px)` }}
                              />
                            ) : null}
                          </div>
                          <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400">
                            <span>{axis.low}</span>
                            <span>{axis.high}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                        Ideal match
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{archetype.idealMatch}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                        Dealbreaker watch
                      </p>
                      <p className="mt-1 text-sm text-rose-900">{archetype.dealbreakerWarning}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Share your results
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleShareChannel('whatsapp')}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleShareChannel('x')}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      X
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText)}`}
                      onClick={() => handleShareChannel('email')}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    Instagram / TikTok: copy the text and paste into your Story.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={pdfLoading}
                    onClick={handleDownloadPdf}
                  >
                    {pdfLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download Vibe Passport PDF
                  </Button>
                </div>

                <Button
                  className="w-full bg-violet-600 text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.55)] hover:bg-violet-700"
                  size="lg"
                  onClick={goToMeetCta}
                >
                  Meet your next roommate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 'beta' && (
              <motion.div
                key="beta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7"
              >
                <h2 className="text-xl font-bold text-slate-900">Join the Domu Match beta</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Connect with students in {city} who are also looking for roommates - not
                  random listings, lifestyle-compatible matches.
                </p>
                <form onSubmit={handleBetaSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="vibe-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Email
                    </label>
                    <input
                      id="vibe-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@student.avans.nl"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Must include @. University email preferred.</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={betaSubmitting}>
                    {betaSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue to join beta
                  </Button>
                </form>
                {skipVisible ? (
                  <button
                    type="button"
                    className="mt-4 w-full text-center text-sm font-semibold text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline"
                    onClick={() => completeBeta()}
                  >
                    Skip for now
                  </button>
                ) : (
                  <p className="mt-4 text-center text-xs text-slate-400">Skip available in a moment…</p>
                )}
                <button
                  type="button"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1 text-sm text-slate-600 hover:text-indigo-600"
                  onClick={() => setStep('results')}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to results
                </button>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-white/60 bg-white/55 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">You are on the beta list</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Create your Domu Match account to connect with students in {city} who share your
                  living style{archetype ? ` (${archetype.title})` : ''}.
                </p>
                <Button asChild className="mt-6 w-full">
                  <Link href={signUpHref}>
                    Create free beta account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  disabled={pdfLoading}
                  onClick={handleDownloadPdf}
                >
                  {pdfLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download your passport again
                </Button>
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-slate-500 hover:text-indigo-600"
                  onClick={() => setStep('results')}
                >
                  View results again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  )
}
