'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

type WfhStatus = 'fully_remote' | 'hybrid' | 'fully_office'

export default function ProfessionalContextClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isEditMode = searchParams.get('mode') === 'edit'

  const nextRoute = useMemo(() => {
    return isEditMode
      ? '/onboarding-professional/personality-values?mode=edit'
      : '/onboarding-professional/personality-values'
  }, [isEditMode])

  const [wfhStatus, setWfhStatus] = useState<WfhStatus | ''>('')
  const [age, setAge] = useState<number | ''>('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/onboarding/load?section=professional-context')
        if (!res.ok) return
        const payload = await res.json()
        const answers: Array<{ itemId: string; value: any }> = payload?.answers ?? []

        const byId = answers.reduce<Record<string, any>>((acc, a) => {
          acc[a.itemId] = a.value
          return acc
        }, {})

        const loadedWfh = byId['wfh_status']
        if (loadedWfh === 'fully_remote' || loadedWfh === 'hybrid' || loadedWfh === 'fully_office') {
          setWfhStatus(loadedWfh)
        }

        const loadedAge = byId['age']
        if (typeof loadedAge === 'number' && Number.isFinite(loadedAge)) {
          setAge(loadedAge)
        } else if (typeof loadedAge === 'string' && loadedAge.trim() !== '') {
          const parsed = Number(loadedAge)
          if (Number.isFinite(parsed)) setAge(parsed)
        }
      } catch {
        // Best-effort: if loading fails, keep defaults.
      }
    }

    load()
  }, [])

  const validate = (): string | null => {
    if (!wfhStatus) return 'Please select your work arrangement.'
    if (age === '' || age == null) return 'Please enter your age.'
    if (!Number.isFinite(age)) return 'Age must be a number.'
    if (age < 18 || age > 99) return 'Age must be between 18 and 99.'
    return null
  }

  const handleSubmit = async () => {
    setFormError(null)
    const err = validate()
    if (err) {
      setFormError(err)
      return
    }

    setIsSaving(true)
    try {
      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'professional-context',
          answers: [
            { itemId: 'wfh_status', value: wfhStatus },
            { itemId: 'age', value: age },
          ],
        }),
      })

      router.push(nextRoute)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Work arrangement & age</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us match you with roommates that fit your routines and living context.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Work arrangement (WFH)</legend>
            <RadioGroup value={wfhStatus} onValueChange={(v) => setWfhStatus(v as WfhStatus | '')}>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="fully_remote" id="wfh-fully-remote" />
              <Label htmlFor="wfh-fully-remote" className="font-normal cursor-pointer">
                Fully Remote
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 mt-2">
              <RadioGroupItem value="hybrid" id="wfh-hybrid" />
              <Label htmlFor="wfh-hybrid" className="font-normal cursor-pointer">
                Hybrid (1-3 days WFH)
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 mt-2">
              <RadioGroupItem value="fully_office" id="wfh-fully-office" />
              <Label htmlFor="wfh-fully-office" className="font-normal cursor-pointer">
                Fully in Office
              </Label>
            </div>
            </RadioGroup>
          </fieldset>
        </section>

        <section className="space-y-3">
          <Label htmlFor="age" className="text-base font-medium">
            Age
          </Label>
          <Input
            id="age"
            inputMode="numeric"
            type="number"
            min={18}
            max={99}
            value={age}
            onChange={(e) => {
              const v = e.target.value
              if (v === '') return setAge('')
              const n = Number(v)
              if (Number.isFinite(n)) setAge(n)
            }}
            aria-describedby="age-help"
          />
          <p id="age-help" className="text-xs text-muted-foreground">
            Enter a number between 18 and 99.
          </p>
        </section>

        {formError && (
          <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button type="button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </main>
  )
}

