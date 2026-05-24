'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ExternalLink } from 'lucide-react'
import { UnsubscribeClient } from '@/app/unsubscribe/UnsubscribeClient'

type PreviewPayload = {
  mock: boolean
  userId: string
  email: string
  firstName: string | null
  token: string
  url: string
  note?: string
}

export function UnsubscribePreviewClient({ startMock }: { startMock: boolean }) {
  const [userIdInput, setUserIdInput] = useState('')
  const [payload, setPayload] = useState<PreviewPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'mock' | 'live'>('mock')

  const loadPreview = useCallback(async (opts: { mock?: boolean; userId?: string }) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (opts.mock) qs.set('mock', '1')
      else if (opts.userId) qs.set('userId', opts.userId)
      const r = await fetch(`/api/dev/unsubscribe-preview?${qs.toString()}`, { cache: 'no-store' })
      const data = await r.json()
      if (!r.ok) throw new Error(data.details || data.error || `Failed (${r.status})`)
      setPayload(data as PreviewPayload)
      setMode(data.mock ? 'mock' : 'live')
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preview')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (startMock) {
        await loadPreview({ mock: true })
        return
      }
      // Default: try live (signed-in user), then fall back to mock so the page is never empty.
      const liveOk = await loadPreview({})
      if (cancelled) return
      if (!liveOk) {
        await loadPreview({ mock: true })
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [startMock, loadPreview])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-6">
          <Link href="/dev/email-preview" className="text-sm font-medium text-violet-700 hover:underline">
            ← Email preview
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Unsubscribe page preview</h1>
          <p className="mt-2 text-sm text-slate-600">
            The full unsubscribe UI loads below automatically. Use mock mode without signing in, or sign in for a real
            Supabase save test.
          </p>
        </header>

        <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => loadPreview({ mock: true })}
              className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                mode === 'mock'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Mock preview (no sign-in)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => loadPreview({})}
              className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                mode === 'live'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Live preview (sign-in required)
            </button>
            <Link
              href="/auth/sign-in?redirect=/dev/unsubscribe-preview"
              className="inline-flex items-center rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[200px] flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-500">User ID (dev)</span>
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="paste a user uuid"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={loading || !userIdInput.trim()}
              onClick={() => loadPreview({ userId: userIdInput.trim() })}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Preview user
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
              {mode === 'mock' && (
                <span className="block mt-1 text-slate-600">
                  Mock preview should still be visible below. For live saves,{' '}
                  <Link href="/auth/sign-in?redirect=/dev/unsubscribe-preview" className="underline">
                    sign in
                  </Link>
                  .
                </span>
              )}
            </p>
          )}

          {payload && !payload.mock && (
            <div className="rounded-xl bg-violet-50 p-4 text-sm text-violet-900 ring-1 ring-violet-100">
              <p>
                <strong>Live mode</strong> — toggles save to Supabase for {payload.email}
              </p>
              <p className="mt-2 break-all">
                <strong>Production link shape:</strong>{' '}
                <a href={payload.url} className="underline" target="_blank" rel="noopener noreferrer">
                  {payload.url}
                </a>
              </p>
              <a
                href={payload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
              >
                Open /unsubscribe in new tab <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {payload?.mock && payload.note && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-100">{payload.note}</p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        )}

        {!loading && payload?.token && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <UnsubscribeClient initialToken={payload.token} />
          </div>
        )}

        {!loading && !payload?.token && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
            Could not load preview. Click <strong>Mock preview</strong> to try again.
          </div>
        )}
      </div>
    </div>
  )
}
