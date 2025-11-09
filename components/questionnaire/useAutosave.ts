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
        const res = await fetch(`/api/onboarding/load?section=${section}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        const answers: Answer[] = Array.isArray(data.answers) ? data.answers : []
        
        // Merge API answers with local store (API takes precedence if newer)
        for (const a of answers) {
          const existing = sectionAnswers[a.itemId]
          if (!existing || !data.lastSavedAt || data.lastSavedAt > (existing as any).savedAt) {
            setAnswer(section, a)
          }
        }
        if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
      } catch {
        // Offline or first time; use localStorage data from persist middleware
      } finally {
        if (!cancelled) setHasLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [section, setAnswer, setLastSavedAt])

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

  return { isSaving, showToast }
}


