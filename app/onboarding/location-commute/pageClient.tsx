'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getDefaultPreferredCitiesFromInstitution, mapInstitutionToCity } from '@/lib/utils/location-mapper'

const MAX_CITIES = 5
const COMMON_CITIES = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Leiden', 'Nijmegen']

function SectionClientContent() {
  const sectionKey = 'location-commute' as const
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const countAnswered = useOnboardingStore((s) => s.countAnsweredInSection)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'

  const total = 1
  const answered = countAnswered(sectionKey)

  // Initialize autosave hook first (before effects that depend on hasLoaded)
  const { isSaving, showToast, hasLoaded } = useAutosave(sectionKey)

  const [isMounted, setIsMounted] = useState(false)
  const [preferredCities, setPreferredCities] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Helper to extract cities from existing answer (handles legacy shapes defensively)
  const extractCitiesFromAnswer = () => {
    const a = answers['preferred_cities'] as any
    if (!a || !a.value) return []
    const v = a.value
    if (Array.isArray(v)) {
      return v.filter((c) => typeof c === 'string' && c.trim().length > 0)
    }
    if (Array.isArray(v.value)) {
      return v.value.filter((c: unknown) => typeof c === 'string' && c.trim().length > 0)
    }
    return []
  }

  // Initialize preferred cities from store or intro -> institution mapping
  useEffect(() => {
    if (!hasLoaded || initialized) return

    // 1) Prefer any previously saved preferred_cities
    const existing = extractCitiesFromAnswer()
    if (existing.length > 0) {
      setPreferredCities(existing)
      setInitialized(true)
      return
    }

    // 2) Otherwise, derive first city from intro section's institution_slug
    ;(async () => {
      try {
        const res = await fetch('/api/onboarding/load?section=intro')
        if (!res.ok) throw new Error('Failed to load intro section')
        const data = await res.json()
        if (!data.answers || !Array.isArray(data.answers)) {
          setInitialized(true)
          return
        }

        const introData = data.answers.reduce((acc: any, answer: any) => {
          acc[answer.itemId] = answer.value
          return acc
        }, {})

        const institutionSlug = introData.institution_slug || introData.university_slug
        if (institutionSlug && institutionSlug !== 'other') {
          const mappedCity = mapInstitutionToCity(institutionSlug)
          if (mappedCity) {
            setPreferredCities(getDefaultPreferredCitiesFromInstitution(institutionSlug))
          }
        }
      } catch {
        // Silent failure – user can enter cities manually
      } finally {
        setInitialized(true)
      }
    })()
  }, [answers, hasLoaded, initialized])

  // Keep onboarding store in sync with local preferredCities so autosave works
  useEffect(() => {
    if (!hasLoaded) return
    setAnswer(sectionKey, {
      itemId: 'preferred_cities',
      value: { kind: 'stringArray', value: preferredCities },
    } as any)
  }, [preferredCities, hasLoaded, sectionKey, setAnswer])

  const handleAddCity = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    if (preferredCities.length >= MAX_CITIES) {
      setError(`You can select up to ${MAX_CITIES} cities.`)
      return
    }

    const normalized = trimmed.replace(/\s+/g, ' ')
    const exists = preferredCities.some((c) => c.toLowerCase() === normalized.toLowerCase())
    if (exists) {
      setInputValue('')
      setError(null)
      return
    }

    setPreferredCities([...preferredCities, normalized])
    setInputValue('')
    setError(null)
  }

  const handleRemoveCity = (city: string) => {
    setPreferredCities(preferredCities.filter((c) => c !== city))
    setError(null)
  }

  const nextDisabled = preferredCities.length === 0 || isSaving

  const saveSection = async () => {
    try {
      const answersArray = Object.values(useOnboardingStore.getState().sections[sectionKey])
      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey, answers: answersArray }),
      })
    } catch (e) {
      console.error('Failed to save section', e)
    }
  }

  return (
    <QuestionnaireLayout
      stepIndex={1}
      totalSteps={11}
      title="Preferred Cities"
      subtitle="Tell us where you’d be happy to live or commute. Location is a soft preference – it boosts matches but never blocks great fits."
      onPrev={() =>
        (window.location.href = isEditMode ? '/onboarding/intro?mode=edit' : '/onboarding/intro')
      }
      onNext={async () => {
        await saveSection()
        window.location.href = isEditMode
          ? '/onboarding/personality-values?mode=edit'
          : '/onboarding/personality-values'
      }}
      nextDisabled={nextDisabled}
    >
      <AutosaveToaster show={showToast} />
      {/* Progress counter - only render after mount to avoid hydration mismatch */}
      {isMounted && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700">
            {answered}/{total} answered
          </div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-5">
        <div className="space-y-2">
          <p className="text-sm text-zinc-700">
            Start with your university city (we’ll pre-fill it when we can), then optionally add up
            to {MAX_CITIES - 1} nearby or alternative cities you’d happily live in.
          </p>
          <p className="text-xs text-zinc-500">
            We treat location as a soft preference. Sharing at least one city gives a strong boost,
            but great harmony matches can still connect even without overlap.
          </p>
        </div>

        {/* Chips */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {preferredCities.length === 0 && (
              <span className="text-xs text-zinc-500">No cities selected yet.</span>
            )}
            {preferredCities.map((city) => (
              <Badge
                key={city}
                variant="secondary"
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border-indigo-200"
              >
                <span>{city}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city)}
                  className="ml-1 text-xs text-indigo-700 hover:text-indigo-900"
                  aria-label={`Remove ${city}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Type a city (e.g. Amsterdam, Leiden) and press Enter"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCity(inputValue)
                }
              }}
              className="sm:flex-1"
            />
            <button
              type="button"
              onClick={() => handleAddCity(inputValue)}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!inputValue.trim() || preferredCities.length >= MAX_CITIES}
            >
              Add city
            </button>
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>

        {/* Common quick-add cities */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-600">Quick add common student cities</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleAddCity(city)}
                disabled={
                  preferredCities.length >= MAX_CITIES ||
                  preferredCities.some((c) => c.toLowerCase() === city.toLowerCase())
                }
                className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
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

