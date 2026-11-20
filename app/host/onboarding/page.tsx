'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingHeader } from '@/components/questionnaire/OnboardingHeader'
import { cn } from '@/lib/utils'

const fieldClassName =
  'h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0F172A] shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/30'

const textareaClassName =
  'min-h-[104px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#0F172A] shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/30'

export default function HostOnboardingPage() {
  const router = useRouter()
  const [hostType, setHostType] = useState<'private_landlord' | 'agency'>('private_landlord')
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [kvk, setKvk] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithCSRF('/api/host/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_type: hostType,
          display_name: displayName,
          company_name: companyName || null,
          kvk_number: kvk || null,
          phone: phone || null,
          bio: bio || null,
          onboarding_completed: true,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(
          typeof j.error === 'string' ? j.error : 'Failed to save'
        )
      }
      router.push('/host')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingHeader statusMode="welcome" chipLabel="Host setup" showExit={false} />

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
          <form
            onSubmit={submit}
            className={cn(
              'flex w-full max-w-[540px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 sm:gap-6 sm:p-8',
              'dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80'
            )}
          >
            <header className="space-y-2.5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500 dark:text-indigo-300">
                Become a host
              </p>
              <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[2rem]">
                List with Domu Match
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                Private landlords and agencies can publish student housing. Applicants stay anonymous
                until you make an offer.
              </p>
            </header>

            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
              role="radiogroup"
              aria-label="Host type"
            >
              {(
                [
                  ['private_landlord', 'Private landlord'],
                  ['agency', 'Agency'],
                ] as const
              ).map(([value, label]) => {
                const selected = hostType === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setHostType(value)}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                      selected
                        ? 'bg-white text-[#6366F1] shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="display_name"
                  className="text-sm font-bold text-[#1E293B] dark:text-slate-200"
                >
                  Display name
                </Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  className={fieldClassName}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Do not use “Domu Match” or another housing platform’s brand. Known agency names
                  need Domu Match admin approval before they go live.
                </p>
              </div>

              {hostType === 'agency' && (
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-sm font-bold text-[#1E293B] dark:text-slate-200"
                  >
                    Company name
                  </Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={fieldClassName}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="kvk"
                  className="text-sm font-bold text-[#1E293B] dark:text-slate-200"
                >
                  KvK / registration number
                </Label>
                <Input
                  id="kvk"
                  value={kvk}
                  onChange={(e) => setKvk(e.target.value)}
                  required
                  className={fieldClassName}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Helps students and Domu trust your listing. Self-reported until registry check is
                  available.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-bold text-[#1E293B] dark:text-slate-200"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClassName}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-sm font-bold text-[#1E293B] dark:text-slate-200"
                >
                  About your homes
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className={textareaClassName}
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all',
                loading
                  ? 'cursor-not-allowed bg-indigo-500/40 dark:bg-indigo-500/40'
                  : 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
              )}
            >
              {loading ? 'Saving…' : 'Continue to dashboard'}
              {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
