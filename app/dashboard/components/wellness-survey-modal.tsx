'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

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

      // If the backend reports this survey was already submitted, treat it as completed
      // so the modal does not keep reappearing.
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
        className="max-w-lg sm:max-w-xl p-6 sm:p-7 md:p-8 rounded-3xl gap-0"
        aria-describedby="wellness-description"
      >
        <DialogHeader className="space-y-2 text-left pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
            Quick wellness check
          </DialogTitle>
          <DialogDescription
            id="wellness-description"
            className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed"
          >
            Help us understand how Domu Match is working for you. This takes a few seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-7">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4">
            <Label
              htmlFor="housing-q"
              className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug block"
            >
              Have you found housing yet?
            </Label>
            <RadioGroup
              id="housing-q"
              value={foundHousing ?? ''}
              onValueChange={(v) => {
                setFoundHousing(v as 'yes' | 'no')
                if (v === 'no') setFoundWithMatch(undefined)
              }}
              className="flex flex-wrap gap-3 sm:gap-6"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="yes" id="housing-yes" />
                <Label htmlFor="housing-yes" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="no" id="housing-no" />
                <Label htmlFor="housing-no" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {foundHousing === 'yes' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4">
              <Label
                htmlFor="match-q"
                className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug block"
              >
                Did you find housing with someone you matched with on Domu Match?
              </Label>
              <RadioGroup
                id="match-q"
                value={foundWithMatch ?? ''}
                onValueChange={(v) => setFoundWithMatch(v as 'yes' | 'no')}
                className="flex flex-wrap gap-3 sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="yes" id="match-yes" />
                  <Label htmlFor="match-yes" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="no" id="match-no" />
                  <Label htmlFor="match-no" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4">
            <Label
              htmlFor="stress-q"
              className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug block"
            >
              Did using Domu Match help reduce your stress during the housing search process?
            </Label>
            <RadioGroup
              id="stress-q"
              value={reducedStress ?? ''}
              onValueChange={(v) => setReducedStress(v as 'yes' | 'no')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="yes" id="stress-yes" />
                <Label htmlFor="stress-yes" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="no" id="stress-no" />
                <Label htmlFor="stress-no" className="text-sm text-zinc-600 dark:text-zinc-300 font-normal cursor-pointer leading-tight">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-8 mt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
            className="rounded-xl"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="rounded-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
