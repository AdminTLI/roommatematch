'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SectionKey } from '@/types/questionnaire'
import { useOnboardingStore, type Answer } from '@/store/onboarding'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

function toArrayRecord(record: Record<string, Answer>): Answer[] {
  return Object.values(record)
}

// Deep comparison of answers arrays to detect actual changes
function answersEqual(a1: Answer[], a2: Answer[]): boolean {
  if (a1.length !== a2.length) return false
  const sorted1 = [...a1].sort((x, y) => (x.itemId || '').localeCompare(y.itemId || ''))
  const sorted2 = [...a2].sort((x, y) => (x.itemId || '').localeCompare(y.itemId || ''))
  
  for (let i = 0; i < sorted1.length; i++) {
    const ans1 = sorted1[i]
    const ans2 = sorted2[i]
    if (ans1.itemId !== ans2.itemId) return false
    if (JSON.stringify(ans1.value) !== JSON.stringify(ans2.value)) return false
    if (ans1.dealBreaker !== ans2.dealBreaker) return false
  }
  return true
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedAnswersRef = useRef<Answer[]>([])
  const isInitialLoadRef = useRef(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing answers on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // First check overall progress to see if user has any onboarding data
        const progressRes = await fetch('/api/onboarding/progress')
        let hasAnyProgress = false
        
        if (progressRes.ok) {
          const progress = await progressRes.json()
          // Check if user has any progress (submitted or has partial progress)
          // We check completionPercentage > 0 to catch users with data in onboarding_sections
          hasAnyProgress = progress.isFullySubmitted || progress.hasPartialProgress || progress.completionPercentage > 0 || !!progress.submittedAt
        }
        
        // Load the specific section to check if it has answers
        const res = await fetch(`/api/onboarding/load?section=${section}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        const answers: Answer[] = Array.isArray(data.answers) ? data.answers : []
        const hasSectionAnswers = answers.length > 0 && answers.some(a => a && a.itemId && a.value)
        
        // If user has no progress at all (no answers in database), clear localStorage
        // to prevent pre-filled answers from previous users or sessions
        if (!hasAnyProgress && !hasSectionAnswers) {
          clearSections()
          // Clear localStorage explicitly to ensure clean state for new users
          if (typeof window !== 'undefined') {
            localStorage.removeItem('onboarding-storage')
          }
        } else if (hasSectionAnswers) {
          // User has answers in database - load them into the store
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
          // Store loaded answers as the last saved state
          lastSavedAnswersRef.current = answers
        }
      } catch {
        // Offline or error - don't load anything to ensure clean start for new users
        // Existing users with localStorage data can still use it, but new users won't
      } finally {
        if (!cancelled) {
          setHasLoaded(true)
          // Wait a bit after load to prevent saves from initial render
          setTimeout(() => {
            isInitialLoadRef.current = false
          }, 1000)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [section, setAnswer, setLastSavedAt, sectionAnswers, clearSections])

  const answersArray = useMemo(() => toArrayRecord(sectionAnswers), [sectionAnswers])

  const flush = useCallback(async (retryAfter?: number) => {
    // Cancel any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Capture current answers at the start
    const currentAnswers = [...answersArray]

    // Check if answers actually changed
    if (answersEqual(currentAnswers, lastSavedAnswersRef.current)) {
      pendingRef.current = false
      return
    }

    // If we're still in initial load phase, skip save
    if (isInitialLoadRef.current) {
      pendingRef.current = false
      return
    }

    pendingRef.current = false
    
    // If retryAfter is provided (from 429 error), wait before retrying
    if (retryAfter && retryAfter > 0) {
      const waitMs = Math.min(retryAfter * 1000, 60000) // Cap at 60 seconds
      retryTimeoutRef.current = setTimeout(() => {
        flush()
      }, waitMs)
      return
    }

    setIsSaving(true)
    try {
      const res = await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, answers: currentAnswers }),
      })
      
      if (res.status === 429) {
        // Handle rate limit - get retry-after header
        const retryAfterHeader = res.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60
        // Retry after the specified time
        setIsSaving(false)
        flush(retryAfterSeconds)
        return
      }
      
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
      // Update last saved answers to the answers we just saved
      lastSavedAnswersRef.current = currentAnswers
      setShowToast(true)
      
      // After save completes, check if answers changed during the save
      // If they did, schedule another save (we'll use the latest answersArray from closure)
      // This will be checked on the next render via the useEffect
    } catch (error) {
      // Ignore transient errors; guard will catch unsaved
      // On error, don't update lastSavedAnswersRef so we can retry
    } finally {
      setIsSaving(false)
    }
  }, [section, answersArray, setLastSavedAt])

  // Debounce saves on changes
  useEffect(() => {
    if (!hasLoaded || isInitialLoadRef.current) return
    
    // Check if answers actually changed
    if (answersEqual(answersArray, lastSavedAnswersRef.current)) {
      return
    }
    
    // Don't queue a new save if one is already in progress
    if (isSaving) {
      // Wait for current save to complete, then schedule next
      return
    }
    
    // Cancel any pending flush
    if (timerRef.current) clearTimeout(timerRef.current)
    
    pendingRef.current = true
    timerRef.current = setTimeout(flush, 800)
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [answersArray, flush, hasLoaded, isSaving])

  // Removed beforeunload handler to prevent browser popup
  // Zustand persist middleware already saves to localStorage immediately
  // API autosave happens automatically with 800ms debounce

  // Reset toast flag
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 1600)
    return () => clearTimeout(t)
  }, [showToast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  return { isSaving, showToast, hasLoaded }
}


