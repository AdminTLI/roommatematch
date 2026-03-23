'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDefaultPreferredCitiesFromInstitution, mapInstitutionToCity } from '@/lib/utils/location-mapper'

const MAX_CITIES = 5

// Canonical list of supported cities (must include all outputs of mapInstitutionToCity)
const CITY_OPTIONS = [
  'Amsterdam',
  'Rotterdam',
  'Utrecht',
  'Leiden',
  'Groningen',
  'Delft',
  'Eindhoven',
  'Enschede',
  'Heerlen',
  'Wageningen',
  'Nijmegen',
  'Tilburg',
  'Maastricht',
  'Arnhem',
  'Breda',
  'Ede',
  'Den Haag',
  'Helmond',
  'Gouda',
  "'s-Hertogenbosch",
  'Leeuwarden',
  'Zwolle',
  'Vlissingen',
  'Doetinchem',
  'Apeldoorn',
].sort((a, b) => a.localeCompare(b))

function normalizeCities(cities: string[]): string[] {
  return Array.from(
    new Set(
      cities
        .map((c) => c.trim())
        .filter((c) => c && CITY_OPTIONS.includes(c))
    )
  ).slice(0, MAX_CITIES)
}

function SectionClientContent() {
  const sectionKey = 'location-commute' as const
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const answers = useOnboardingStore((s) => s.sections[sectionKey])
  const searchParams = useSearchParams()

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('edit') === '1' || searchParams.get('mode') === 'edit'

  // Initialize autosave hook first (before effects that depend on hasLoaded)
  const { isSaving, showToast, hasLoaded } = useAutosave(sectionKey)

  const [rows, setRows] = useState<string[]>([''])
  const [initialized, setInitialized] = useState(false)

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
    const existing = normalizeCities(extractCitiesFromAnswer())
    if (existing.length > 0) {
      setRows(existing.length < MAX_CITIES ? [...existing, ''] : existing)
      setInitialized(true)
      return
    }

    // 2) Otherwise, derive first city from intro section's institution_slug / university_id
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

        let institutionSlug = introData.institution_slug || introData.university_slug
        let preferredCity = institutionSlug ? mapInstitutionToCity(institutionSlug) : null

        // Resolve via server-side endpoint to avoid client-side RLS failures.
        if (!preferredCity && typeof introData.university_id === 'string' && introData.university_id.trim()) {
          const uniRes = await fetch(
            `/api/onboarding/university-city?universityId=${encodeURIComponent(introData.university_id)}`
          )
          if (uniRes.ok) {
            const uniData = await uniRes.json()
            institutionSlug = institutionSlug || uniData.slug || null
            preferredCity = (typeof uniData.city === 'string' && uniData.city.trim()) || null
          }
        }

        if (!preferredCity && institutionSlug && institutionSlug !== 'other') {
          const uniRes = await fetch(
            `/api/onboarding/university-city?slug=${encodeURIComponent(institutionSlug)}`
          )
          if (uniRes.ok) {
            const uniData = await uniRes.json()
            preferredCity = (typeof uniData.city === 'string' && uniData.city.trim()) || null
          }
        }

        if (institutionSlug && institutionSlug !== 'other') {
          const initialFromSlug = getDefaultPreferredCitiesFromInstitution(institutionSlug)
          const initial = normalizeCities(
            preferredCity ? [preferredCity, ...initialFromSlug] : initialFromSlug
          )
          if (initial.length > 0) {
            setRows(initial.length < MAX_CITIES ? [...initial, ''] : initial)
          }
        }
      } catch {
        // Silent failure – user can select cities manually
      } finally {
        setInitialized(true)
      }
    })()
  }, [answers, hasLoaded, initialized])

  // Keep onboarding store in sync with current selection so autosave works
  useEffect(() => {
    if (!hasLoaded) return
    const selected = normalizeCities(rows)
    setAnswer(sectionKey, {
      itemId: 'preferred_cities',
      value: { kind: 'stringArray', value: selected },
    } as any)
  }, [rows, hasLoaded, sectionKey, setAnswer])

  const handleRowChange = (index: number, city: string) => {
    const next = [...rows]
    next[index] = city
    setRows(next)
  }

  const handleAddRow = () => {
    if (rows.length >= MAX_CITIES) return
    setRows([...rows, ''])
  }

  const handleRemoveRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index)
    setRows(next.length > 0 ? next : [''])
  }

  const selectedCities = normalizeCities(rows)
  const nextDisabled = selectedCities.length === 0 || isSaving

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

      <div className="space-y-6 sm:space-y-5">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">
            Start with your university city (we’ll pre-fill it when we can), then optionally add up
            to {MAX_CITIES - 1} nearby or alternative cities you’d happily live in.
          </p>
          <p className="text-xs text-text-muted">
            We treat location as a soft preference. Sharing at least one city gives a strong boost,
            but great harmony matches can still connect even without overlap.
          </p>
        </div>

        {/* City rows */}
        <div className="space-y-3">
          {rows.map((value, index) => {
            const selectedOther = normalizeCities(rows.filter((_, i) => i !== index))
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Select
                    value={value || ''}
                    onValueChange={(city) => handleRowChange(index, city)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITY_OPTIONS.map((city) => (
                        <SelectItem
                          key={city}
                          value={city}
                          disabled={selectedOther.includes(city)}
                        >
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="text-xs text-text-muted hover:text-text-primary"
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={handleAddRow}
            disabled={rows.length >= MAX_CITIES || selectedCities.length >= MAX_CITIES}
            className="inline-flex items-center rounded-lg border border-border-subtle/50 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-surface-alt/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add city
          </button>
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

