'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { cn } from '@/lib/utils'

type WfhStatus = 'fully_remote' | 'hybrid' | 'fully_office'

const WFH_OPTIONS: { value: WfhStatus; label: string; description: string }[] = [
  { value: 'fully_remote', label: 'Fully Remote', description: 'Mostly or fully from home.' },
  { value: 'hybrid', label: 'Hybrid', description: 'About 1 - 3 days working from home.' },
  { value: 'fully_office', label: 'Fully On-site', description: 'Primarily at an office or site.' },
]

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
  const [preservedAnswers, setPreservedAnswers] = useState<Array<{ itemId: string; value: unknown }>>([])
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/onboarding/load?section=professional-context')
        if (!res.ok) return
        const payload = await res.json()
        const answers: Array<{ itemId: string; value: unknown }> = payload?.answers ?? []

        const byId = answers.reduce<Record<string, unknown>>((acc, a) => {
          acc[a.itemId] = a.value
          return acc
        }, {})

        setPreservedAnswers(
          answers.filter((a) => a.itemId !== 'wfh_status' && a.itemId !== 'age')
        )

        const loadedWfh =
          (byId['wfh_status'] as string | undefined) ||
          (byId['work_model'] as string | undefined)
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
      const merged = [
        ...preservedAnswers.filter((a) => a.itemId !== 'wfh_status' && a.itemId !== 'age'),
        { itemId: 'wfh_status', value: wfhStatus },
        { itemId: 'age', value: age },
      ]

      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'professional-context',
          answers: merged,
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
    <div className="relative min-h-screen overflow-hidden bg-bg-body text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_55%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-transparent bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 text-center sm:px-8 sm:py-6 lg:px-12">
            <p className="text-xs font-medium text-text-secondary sm:text-sm">
              Step 1 of 8 · Work arrangement &amp; age
            </p>
          </div>
        </header>

        <main className="flex-1 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:gap-12">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                Work arrangement &amp; age
              </h1>
              <p className="text-base leading-relaxed text-text-primary/95 sm:text-lg">
                This helps us match you with roommates that fit your routines and living context.
              </p>
            </div>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-text-primary sm:text-xl">Work arrangement (WFH)</h2>
                  <p className="text-sm text-text-secondary">Choose the option that best matches your main setup.</p>
                </div>

                <RadioGroup value={wfhStatus} onValueChange={(v) => setWfhStatus(v as WfhStatus | '')}>
                  <div className="grid gap-3 sm:grid-cols-1">
                    {WFH_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`wfh-${opt.value}`}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                          'hover:border-sky-400/80 hover:bg-bg-surface-alt/60',
                          wfhStatus === opt.value
                            ? 'border-sky-400 bg-bg-surface-alt/80 shadow-lg shadow-sky-500/30'
                            : 'border-border-subtle/30 bg-bg-surface-alt/50'
                        )}
                      >
                        <RadioGroupItem value={opt.value} id={`wfh-${opt.value}`} className="mt-0.5 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-text-primary">{opt.label}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-text-primary/95">{opt.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-4 p-5 sm:p-6 lg:p-7">
                <div className="space-y-1">
                  <Label htmlFor="age" className="text-lg font-semibold text-text-primary sm:text-xl">
                    Age
                  </Label>
                  <p className="text-sm text-text-secondary">We use this only for matching context.</p>
                </div>
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
                  className="max-w-xs border-border-subtle/30 bg-bg-surface-alt/80 text-text-primary shadow-none backdrop-blur-xl"
                />
                <p id="age-help" className="text-xs text-text-secondary">
                  Enter a number between 18 and 99.
                </p>
              </CardContent>
            </Card>

            {formError && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle/25 bg-bg-surface-alt/50 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-8 lg:p-10">
              <p className="max-w-3xl text-sm leading-relaxed text-text-primary/95 sm:text-base">
                Next up: personality and values. You can always come back and edit this section later.
              </p>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className={cn(
                  'inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl px-8 text-sm font-semibold tracking-tight sm:min-w-[11rem]',
                  'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white',
                  isSaving ? 'cursor-not-allowed opacity-50' : 'hover:brightness-110'
                )}
              >
                {isSaving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
