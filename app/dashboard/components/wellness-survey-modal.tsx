'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { HeartPulse, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-onboarding',
  display: 'swap',
})

type TriggerType = 'day_14' | 'day_30' | null

const COMPLETED_STORAGE_PREFIX = 'wellness_survey_completed_'
const SNOOZE_STORAGE_PREFIX = 'wellness_survey_snooze_until_'
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

function isSnoozed(trigger: Exclude<TriggerType, null>): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(`${SNOOZE_STORAGE_PREFIX}${trigger}`)
    if (!raw) return false
    const until = Number.parseInt(raw, 10)
    if (!Number.isFinite(until)) return false
    return Date.now() < until
  } catch {
    return false
  }
}

function snoozeSurvey(trigger: Exclude<TriggerType, null>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${SNOOZE_STORAGE_PREFIX}${trigger}`, String(Date.now() + SNOOZE_MS))
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
}

function clearSurveySnooze(trigger: TriggerType) {
  if (!trigger || typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${SNOOZE_STORAGE_PREFIX}${trigger}`)
  } catch {
    // Ignore
  }
}

function hasCompletedSurveyLocally(trigger: TriggerType): boolean {
  if (!trigger || typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${COMPLETED_STORAGE_PREFIX}${trigger}`) === 'true'
  } catch {
    return false
  }
}

function markSurveyCompletedLocally(trigger: TriggerType) {
  if (!trigger || typeof window === 'undefined') return
  try {
    localStorage.setItem(`${COMPLETED_STORAGE_PREFIX}${trigger}`, 'true')
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
}

const radioItemClass =
  'size-[18px] border-slate-300 text-[#4F46E5] focus-visible:ring-[#4F46E5]/30 dark:border-slate-500 dark:text-indigo-400 dark:focus-visible:ring-indigo-400/30'

const questionBlockClass =
  'space-y-3 rounded-2xl bg-slate-50 px-3.5 py-3.5 ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80'

const questionLabelClass =
  'text-xs font-semibold leading-snug text-[#334155] dark:text-slate-300'

const optionLabelClass =
  'cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300'

export function WellnessSurveyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [trigger, setTrigger] = useState<TriggerType>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const skipSnoozeOnNextClose = useRef(false)
  const triggerRef = useRef<TriggerType>(null)
  triggerRef.current = trigger

  const [foundHousing, setFoundHousing] = useState<'yes' | 'no' | undefined>(undefined)
  const [foundWithMatch, setFoundWithMatch] = useState<'yes' | 'no' | undefined>(undefined)
  const [reducedStress, setReducedStress] = useState<'yes' | 'no' | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch('/api/surveys/wellness')
        if (cancelled) return
        if (!res.ok) {
          setTrigger(null)
          return
        }
        const data = await res.json()
        const t = data.trigger ?? null
        if (t && !hasCompletedSurveyLocally(t) && !isSnoozed(t)) {
          skipSnoozeOnNextClose.current = false
          setTrigger(t)
          setIsOpen(true)
        } else {
          setTrigger(null)
        }
      } catch {
        if (!cancelled) setTrigger(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      skipSnoozeOnNextClose.current = false
      setIsOpen(true)
      return
    }
    const current = triggerRef.current
    if (!skipSnoozeOnNextClose.current && current) {
      snoozeSurvey(current)
    }
    skipSnoozeOnNextClose.current = false
    setTrigger(null)
    setFoundHousing(undefined)
    setFoundWithMatch(undefined)
    setReducedStress(undefined)
    setIsOpen(false)
  }, [])

  const canSubmit =
    trigger &&
    foundHousing !== undefined &&
    reducedStress !== undefined &&
    (foundHousing === 'no' || foundWithMatch !== undefined)

  const handleSubmit = async () => {
    if (!trigger || !canSubmit || submitting) return
    setSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/surveys/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_type: trigger,
          found_housing: foundHousing === 'yes',
          found_with_match: foundHousing === 'yes' ? foundWithMatch === 'yes' : null,
          reduced_stress: reducedStress === 'yes',
        }),
      })

      if (!res.ok && res.status === 409) {
        skipSnoozeOnNextClose.current = true
        markSurveyCompletedLocally(trigger)
        clearSurveySnooze(trigger)
        setIsOpen(false)
        setTrigger(null)
        setFoundHousing(undefined)
        setFoundWithMatch(undefined)
        setReducedStress(undefined)
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit')
      }
      skipSnoozeOnNextClose.current = true
      markSurveyCompletedLocally(trigger)
      clearSurveySnooze(trigger)
      setIsOpen(false)
      setTrigger(null)
      setFoundHousing(undefined)
      setFoundWithMatch(undefined)
      setReducedStress(undefined)
    } catch (e) {
      console.error('[WellnessSurvey] Submit error', e)
      setSubmitting(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          plusJakarta.variable,
          'font-[family-name:var(--font-onboarding)] antialiased',
          'max-w-md gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0',
          'shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80',
          'dark:bg-slate-800 dark:shadow-black/50 dark:ring-slate-700',
          '[&>button]:hidden',
        )}
        aria-describedby="wellness-description"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/15" />
          <div className="absolute -bottom-14 -right-12 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-400/10" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] ring-1 ring-indigo-200/80 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800/80">
                <HeartPulse className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Quick check-in
                </p>
                <DialogTitle className="text-base font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50">
                  Quick wellness check
                </DialogTitle>
              </div>
              <DialogClose
                type="button"
                aria-label="Close wellness check"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50 dark:focus-visible:ring-indigo-400/30"
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <DialogDescription
              id="wellness-description"
              className="text-left text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Help us understand how Domu Match is working for you. This takes a few seconds.
            </DialogDescription>

            <div className={questionBlockClass}>
              <Label htmlFor="housing-q" className={cn(questionLabelClass, 'block')}>
                Have you found housing yet?
              </Label>
              <RadioGroup
                id="housing-q"
                value={foundHousing ?? ''}
                onValueChange={(v) => {
                  setFoundHousing(v as 'yes' | 'no')
                  if (v === 'no') setFoundWithMatch(undefined)
                }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="yes" id="housing-yes" className={radioItemClass} />
                  <Label htmlFor="housing-yes" className={optionLabelClass}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="no" id="housing-no" className={radioItemClass} />
                  <Label htmlFor="housing-no" className={optionLabelClass}>
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {foundHousing === 'yes' && (
              <div className={questionBlockClass}>
                <Label htmlFor="match-q" className={cn(questionLabelClass, 'block')}>
                  Did you find housing with someone you matched with on Domu Match?
                </Label>
                <RadioGroup
                  id="match-q"
                  value={foundWithMatch ?? ''}
                  onValueChange={(v) => setFoundWithMatch(v as 'yes' | 'no')}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="yes" id="match-yes" className={radioItemClass} />
                    <Label htmlFor="match-yes" className={optionLabelClass}>
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="no" id="match-no" className={radioItemClass} />
                    <Label htmlFor="match-no" className={optionLabelClass}>
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className={questionBlockClass}>
              <Label htmlFor="stress-q" className={cn(questionLabelClass, 'block')}>
                Did using Domu Match help reduce your stress during the housing search process?
              </Label>
              <RadioGroup
                id="stress-q"
                value={reducedStress ?? ''}
                onValueChange={(v) => setReducedStress(v as 'yes' | 'no')}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="yes" id="stress-yes" className={radioItemClass} />
                  <Label htmlFor="stress-yes" className={optionLabelClass}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="no" id="stress-no" className={radioItemClass} />
                  <Label htmlFor="stress-no" className={optionLabelClass}>
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={cn(
                'inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                canSubmit && !submitting
                  ? 'bg-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.45)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  : 'cursor-not-allowed bg-[#4F46E5]/40 dark:bg-indigo-500/40',
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
