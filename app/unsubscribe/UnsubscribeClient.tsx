'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Check, AlertCircle, Heart } from 'lucide-react'
import { PillToggle } from './PillToggle'
import { DEV_UNSUBSCRIBE_MOCK_TOKEN } from '@/lib/email/dev-unsubscribe-mock'

interface Preferences {
  emailMatches: boolean
  emailMessages: boolean
  emailUpdates: boolean
  pushMatches: boolean
  pushMessages: boolean
}

interface LoadResponse {
  email: string | null
  firstName: string | null
  preferences: Preferences
}

const EMAIL_ITEMS: { id: keyof Preferences; label: string; desc: string }[] = [
  { id: 'emailMatches', label: 'New matches', desc: 'Get an email when we find new compatible roommates for you.' },
  { id: 'emailMessages', label: 'New messages', desc: 'Get an email when someone messages you on Domu Match.' },
  { id: 'emailUpdates', label: 'Platform updates', desc: 'Occasional emails about new features and product news.' },
]

const PUSH_ITEMS: { id: keyof Preferences; label: string; desc: string }[] = [
  { id: 'pushMatches', label: 'New matches', desc: 'Push notifications for new compatible roommates.' },
  { id: 'pushMessages', label: 'New messages', desc: 'Push notifications when someone messages you.' },
]

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'error' | 'invalid'

export function UnsubscribeClient({ initialToken = '' }: { initialToken?: string }) {
  const searchParams = useSearchParams()
  const token = useMemo(() => {
    const fromUrl = searchParams.get('token')?.trim()
    return fromUrl || initialToken.trim()
  }, [searchParams, initialToken])

  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setError('This unsubscribe link is missing its token. Please use the link from your email.')
      return
    }
    let cancelled = false
    setStatus('loading')
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `Request failed (${r.status})`)
        }
        return r.json() as Promise<LoadResponse & { preview?: boolean }>
      })
      .then((data) => {
        if (cancelled) return
        setEmail(data.email)
        setFirstName(data.firstName)
        setPreferences(data.preferences)
        setIsPreviewMode(Boolean(data.preview) || token === DEV_UNSUBSCRIBE_MOCK_TOKEN)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('invalid')
        setError(err instanceof Error ? err.message : 'Failed to load preferences')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const persist = useCallback(
    async (next: Preferences) => {
      setStatus('saving')
      setError(null)
      try {
        const r = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: next }),
        })
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `Save failed (${r.status})`)
        }
        const body = (await r.json()) as { preferences: Preferences }
        setPreferences(body.preferences)
        setLastSavedAt(Date.now())
        setStatus('saved')
        setTimeout(() => setStatus((s) => (s === 'saved' ? 'ready' : s)), 1600)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to save')
      }
    },
    [token]
  )

  const handleToggle = useCallback(
    (key: keyof Preferences, value: boolean) => {
      if (!preferences) return
      const next: Preferences = { ...preferences, [key]: value }
      setPreferences(next)
      void persist(next)
    },
    [preferences, persist]
  )

  const handleUnsubAll = () => {
    if (!preferences) return
    const next: Preferences = {
      ...preferences,
      emailMatches: false,
      emailMessages: false,
      emailUpdates: false,
    }
    setPreferences(next)
    void persist(next)
  }

  const handleResubAll = () => {
    if (!preferences) return
    const next: Preferences = {
      ...preferences,
      emailMatches: true,
      emailMessages: true,
      emailUpdates: true,
    }
    setPreferences(next)
    void persist(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        {isPreviewMode && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            <strong>Preview mode</strong> — toggles work in the UI but are not saved to your account.
            Sign in and use <a href="/dev/unsubscribe-preview" className="font-semibold underline">dev unsubscribe preview</a> for a live test.
          </div>
        )}
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100">
            <Heart className="h-6 w-6 text-violet-600" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your email preferences
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {firstName ? `Hey ${firstName} — ` : ''}choose what Domu Match sends you. Changes save instantly.
          </p>
          {email && (
            <p className="mt-1 text-xs text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{email}</span>
            </p>
          )}
        </header>

        {/* Status / Errors */}
        <div className="mb-4 h-6">
          {status === 'saving' && (
            <div className="flex items-center justify-center gap-2 text-xs text-violet-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </div>
          )}
          {status === 'saved' && lastSavedAt && (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              Preferences saved
            </div>
          )}
          {status === 'error' && error && (
            <div className="flex items-center justify-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-600" />
            <p className="mt-3 text-sm text-slate-600">Loading your preferences…</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">We couldn’t open this link</h2>
            <p className="mt-2 text-sm text-slate-600">
              {error ||
                'The link may be invalid or out of date. Please use the most recent unsubscribe link from one of our emails.'}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Still stuck? Email <a href="mailto:domumatch@gmail.com" className="font-medium text-violet-700 underline">domumatch@gmail.com</a> and we’ll fix it.
            </p>
          </div>
        )}

        {preferences && status !== 'invalid' && (
          <div className="space-y-8">
            {/* Email section */}
            <section className="space-y-3">
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Email
              </h2>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {EMAIL_ITEMS.map((item) => (
                  <PreferenceRow
                    key={item.id}
                    label={item.label}
                    description={item.desc}
                    value={preferences[item.id]}
                    onChange={(v) => handleToggle(item.id, v)}
                  />
                ))}
              </div>
            </section>

            {/* Push section */}
            <section className="space-y-3">
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Push notifications
              </h2>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {PUSH_ITEMS.map((item) => (
                  <PreferenceRow
                    key={item.id}
                    label={item.label}
                    description={item.desc}
                    value={preferences[item.id]}
                    onChange={(v) => handleToggle(item.id, v)}
                  />
                ))}
              </div>
            </section>

            {/* Bulk actions */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">Bulk actions</h2>
              <p className="mt-1 text-xs text-slate-600">Quick toggles for all email categories above.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleUnsubAll}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Unsubscribe from all emails
                </button>
                <button
                  type="button"
                  onClick={handleResubAll}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Resubscribe to all
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                You’ll still receive essential account emails (verification, password resets, security alerts) regardless of these settings.
              </p>
            </section>

            <footer className="pt-4 text-center text-xs text-slate-500">
              Looking for more options? Sign in and visit your <a href="https://domumatch.com/settings" className="font-medium text-violet-700 underline">account settings</a>.
              <br />
              Need help? Email <a href="mailto:domumatch@gmail.com" className="font-medium text-violet-700 underline">domumatch@gmail.com</a>.
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}

function PreferenceRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 sm:text-base">{label}</div>
        <div className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</div>
      </div>
      <PillToggle value={value} onChange={onChange} ariaLabel={label} />
    </div>
  )
}
