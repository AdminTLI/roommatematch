'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SectionKey } from '@/types/questionnaire'
import { useOnboardingStore, type Answer } from '@/store/onboarding'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function toArrayRecord(record: Record<string, Answer>): Answer[] {
  return Object.values(record)
}

function answersEqual(a1: Answer[], a2: Answer[]): boolean {
  if (a1.length !== a2.length) return false
  const sorted1 = [...a1].sort((x, y) => (x.itemId || '').localeCompare(y.itemId || ''))
  const sorted2 = [...a2].sort((x, y) => (x.itemId || '').localeCompare(y.itemId || ''))

  for (let i = 0; i < sorted1.length; i++) {
    const ans1 = sorted1[i]
    const ans2 = sorted2[i]
    if (ans1.itemId !== ans2.itemId) return false
    if (JSON.stringify(ans1.value) !== JSON.stringify(ans2.value)) return false
    if (ans1.userSetGate !== ans2.userSetGate) return false
    if (ans1.marksImportant !== ans2.marksImportant) return false
  }
  return true
}

function countLocalAnswers(): number {
  const sections = useOnboardingStore.getState().sections
  return Object.values(sections).reduce((n, sec) => n + Object.keys(sec ?? {}).length, 0)
}

async function persistSection(section: SectionKey, answers: Answer[]): Promise<string | undefined> {
  const res = await fetchWithCSRF('/api/onboarding/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, answers }),
  })

  if (res.status === 429) {
    const err = new Error('rate_limited') as Error & { retryAfter?: number }
    const retryAfterHeader = res.headers.get('Retry-After')
    err.retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60
    throw err
  }

  if (!res.ok) throw new Error('Save failed')
  const data = (await res.json()) as { lastSavedAt?: string }
  return data.lastSavedAt
}

export function useAutosave(section: SectionKey) {
  const sectionAnswers = useOnboardingStore((s) => s.sections[section])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setLastSavedAt = useOnboardingStore((s) => s.setLastSavedAt)
  const clearSections = useOnboardingStore((s) => s.clearSections)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const pendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedAnswersRef = useRef<Answer[]>([])
  const isInitialLoadRef = useRef(true)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedSectionRef = useRef<SectionKey | null>(null)
  const answersArrayRef = useRef<Answer[]>([])
  const sectionRef = useRef(section)
  sectionRef.current = section

  // Load existing answers on mount / section change
  useEffect(() => {
    if (loadedSectionRef.current === section) return
    loadedSectionRef.current = section
    isInitialLoadRef.current = true
    setHasLoaded(false)

    let cancelled = false
    ;(async () => {
      try {
        const progressRes = await fetch('/api/onboarding/progress')
        let hasAnyProgress = false

        if (progressRes.ok) {
          const progress = await progressRes.json()
          hasAnyProgress =
            progress.isFullySubmitted ||
            progress.hasPartialProgress ||
            progress.completionPercentage > 0 ||
            !!progress.submittedAt
        }

        const res = await fetch(`/api/onboarding/load?section=${section}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        const answers: Answer[] = Array.isArray(data.answers) ? data.answers : []
        const hasSectionAnswers =
          answers.length > 0 && answers.some((a) => a && a.itemId && a.value)

        if (!hasAnyProgress && !hasSectionAnswers) {
          // Only wipe when local store is also empty. Otherwise we destroy
          // sibling-module answers that haven't reached the DB yet.
          if (countLocalAnswers() === 0) {
            clearSections()
            if (typeof window !== 'undefined') {
              localStorage.removeItem('onboarding-storage')
            }
          }
        } else if (hasSectionAnswers) {
          for (const a of answers) {
            if (a && a.itemId && a.value) {
              const existing = useOnboardingStore.getState().sections[section]?.[a.itemId]
              if (!existing || !data.lastSavedAt || data.lastSavedAt > (existing as any).savedAt) {
                setAnswer(section, a)
              }
            }
          }
          if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
          lastSavedAnswersRef.current = answers
        }
      } catch {
        // Offline or error — keep any local answers
      } finally {
        if (!cancelled) {
          setHasLoaded(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [section, setAnswer, setLastSavedAt, clearSections])

  const answersArray = useMemo(
    () => (sectionAnswers ? toArrayRecord(sectionAnswers) : []),
    [sectionAnswers]
  )
  answersArrayRef.current = answersArray

  const flush = useCallback(
    async (retryAfter?: number) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      const currentAnswers = [...answersArrayRef.current]
      if (answersEqual(currentAnswers, lastSavedAnswersRef.current)) {
        pendingRef.current = false
        return
      }

      // Still hydrating — remember to flush once the gate opens
      if (isInitialLoadRef.current) {
        pendingRef.current = true
        return
      }

      if (currentAnswers.length === 0) {
        pendingRef.current = false
        return
      }

      pendingRef.current = false

      if (retryAfter && retryAfter > 0) {
        const waitMs = Math.min(retryAfter * 1000, 60000)
        retryTimeoutRef.current = setTimeout(() => {
          void flush()
        }, waitMs)
        return
      }

      setIsSaving(true)
      try {
        const lastSavedAt = await persistSection(sectionRef.current, currentAnswers)
        if (lastSavedAt) setLastSavedAt(lastSavedAt)
        lastSavedAnswersRef.current = currentAnswers
        setShowToast(true)

        // If answers changed while the request was in flight, save again
        if (!answersEqual(answersArrayRef.current, currentAnswers)) {
          pendingRef.current = true
        }
      } catch (error) {
        const err = error as Error & { retryAfter?: number }
        if (err?.message === 'rate_limited' && err.retryAfter) {
          setIsSaving(false)
          void flush(err.retryAfter)
          return
        }
        pendingRef.current = true
        console.error('[useAutosave] Save failed', { section: sectionRef.current, error })
      } finally {
        setIsSaving(false)
      }
    },
    [setLastSavedAt]
  )

  // Open the initial-load gate, then flush anything answered during hydration
  useEffect(() => {
    if (!hasLoaded) return
    const t = setTimeout(() => {
      isInitialLoadRef.current = false
      const current = answersArrayRef.current
      if (
        pendingRef.current ||
        (current.length > 0 && !answersEqual(current, lastSavedAnswersRef.current))
      ) {
        void flush()
      }
    }, 400)
    return () => clearTimeout(t)
  }, [hasLoaded, flush])

  // Debounced saves on changes
  useEffect(() => {
    if (!hasLoaded) return
    if (isInitialLoadRef.current) {
      pendingRef.current = true
      return
    }
    if (answersEqual(answersArray, lastSavedAnswersRef.current)) return
    if (isSaving) {
      pendingRef.current = true
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    pendingRef.current = true
    timerRef.current = setTimeout(() => {
      void flush()
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [answersArray, flush, hasLoaded, isSaving])

  // Flush when a save finishes if more changes piled up
  useEffect(() => {
    if (!hasLoaded || isSaving || isInitialLoadRef.current) return
    if (!pendingRef.current) return
    if (answersEqual(answersArray, lastSavedAnswersRef.current)) {
      pendingRef.current = false
      return
    }
    void flush()
  }, [isSaving, hasLoaded, answersArray, flush])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 1600)
    return () => clearTimeout(t)
  }, [showToast])

  // Flush pending answers on unmount / section change so navigation cannot drop them
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)

      const currentAnswers = [...answersArrayRef.current]
      if (
        currentAnswers.length === 0 ||
        answersEqual(currentAnswers, lastSavedAnswersRef.current)
      ) {
        return
      }

      // Fire-and-forget; keepalive helps during client navigations
      void fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionRef.current, answers: currentAnswers }),
        keepalive: true,
      })
        .then(async (res) => {
          if (!res.ok) return
          const data = (await res.json().catch(() => ({}))) as { lastSavedAt?: string }
          if (data.lastSavedAt) {
            useOnboardingStore.getState().setLastSavedAt(data.lastSavedAt)
          }
          lastSavedAnswersRef.current = currentAnswers
        })
        .catch((error) => {
          console.error('[useAutosave] Unmount save failed', {
            section: sectionRef.current,
            error,
          })
        })
    }
  }, [section])

  return { isSaving, showToast, hasLoaded }
}
