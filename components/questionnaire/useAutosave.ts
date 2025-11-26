'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SectionKey } from '@/types/questionnaire'
import { useOnboardingStore, type Answer } from '@/store/onboarding'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function toArrayRecord(record: Record<string, Answer>): Answer[] {
  return Object.values(record)
}

export function useAutosave(section: SectionKey) {
  const sectionAnswers = useOnboardingStore((s) => s.sections[section])
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setLastSavedAt = useOnboardingStore((s) => s.setLastSavedAt)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const pendingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing answers on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // First check if user has any onboarding progress
        // Only load answers if user has actually started onboarding
        const progressRes = await fetch('/api/onboarding/progress')
        let shouldLoadAnswers = false
        
        if (progressRes.ok) {
          const progress = await progressRes.json()
          
          // Only load if user has actual progress (hasPartialProgress or isFullySubmitted)
          // This ensures new users start with a clean form
          shouldLoadAnswers = progress.hasPartialProgress || progress.isFullySubmitted || !!progress.submittedAt
        }
        
        // Load the specific section to check if it has answers
        const res = await fetch(`/api/onboarding/load?section=${section}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        const answers: Answer[] = Array.isArray(data.answers) ? data.answers : []
        
        // Only load answers if:
        // 1. User has progress (shouldLoadAnswers is true)
        // 2. AND there are actual answers in the database for this section
        // This prevents loading empty arrays or test data for new users
        if (shouldLoadAnswers && answers.length > 0) {
          // Merge API answers with local store (API takes precedence if newer)
          for (const a of answers) {
            // Validate answer has a valid value before loading
            if (a && a.itemId && a.value) {
              const existing = sectionAnswers[a.itemId]
              if (!existing || !data.lastSavedAt || data.lastSavedAt > (existing as any).savedAt) {
                setAnswer(section, a)
              }
            }
          }
          if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
        } else if (!shouldLoadAnswers && answers.length === 0) {
          // New user with no data - ensure store is clean by not loading anything
          // The store will remain empty (initialized with empty sections)
        }
      } catch {
        // Offline or error - don't load anything to ensure clean start for new users
        // Existing users with localStorage data can still use it, but new users won't
      } finally {
        if (!cancelled) setHasLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [section, setAnswer, setLastSavedAt, sectionAnswers])

  const answersArray = useMemo(() => toArrayRecord(sectionAnswers), [sectionAnswers])

  const flush = useCallback(async () => {
    pendingRef.current = false
    setIsSaving(true)
    try {
      const res = await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, answers: answersArray }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
      setShowToast(true)
    } catch {
      // Ignore transient errors; guard will catch unsaved
    } finally {
      setIsSaving(false)
    }
  }, [section, answersArray, setLastSavedAt])

  // Debounce saves on changes
  useEffect(() => {
    if (!hasLoaded) return
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingRef.current = true
    timerRef.current = setTimeout(flush, 800)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [answersArray, flush, hasLoaded])

  // Removed beforeunload handler to prevent browser popup
  // Zustand persist middleware already saves to localStorage immediately
  // API autosave happens automatically with 800ms debounce

  // Reset toast flag
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 1600)
    return () => clearTimeout(t)
  }, [showToast])

  return { isSaving, showToast, hasLoaded }
}


