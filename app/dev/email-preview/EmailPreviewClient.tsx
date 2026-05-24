'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { PreviewKind } from '@/app/api/dev/email-preview/route'

interface Props {
  kinds: PreviewKind[]
}

type ViewportSize = 'mobile' | 'desktop'

export function EmailPreviewClient({ kinds }: Props) {
  const [selectedId, setSelectedId] = useState<string>(kinds[0]?.id ?? '')
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [rawHtml, setRawHtml] = useState<string>('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const selected = kinds.find((k) => k.id === selectedId)
  const supabaseKinds = kinds.filter((k) => k.category === 'supabase')
  const appKinds = kinds.filter((k) => k.category === 'app')

  const previewUrl = useMemo(
    () => `/api/dev/email-preview?kind=${encodeURIComponent(selectedId)}&format=json`,
    [selectedId]
  )

  const rawUrl = useMemo(() => {
    if (selected?.category !== 'supabase') return null
    return `/api/dev/email-preview?kind=${encodeURIComponent(selectedId)}&format=json&raw=1`
  }, [selectedId, selected?.category])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    setPreviewHtml('')
    setRawHtml('')
    setCopyStatus('idle')

    const loadPreview = fetch(previewUrl, { cache: 'no-store' }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.details || body.error || `Preview failed (${r.status})`)
      }
      return r.json() as Promise<{ html?: string; subject?: string }>
    })

    const loadRaw =
      rawUrl != null
        ? fetch(rawUrl, { cache: 'no-store' }).then(async (r) => {
            if (!r.ok) throw new Error('Failed to load raw template')
            return r.json() as Promise<{ html?: string }>
          })
        : loadPreview

    Promise.all([loadPreview, loadRaw])
      .then(([previewData, rawData]) => {
        if (cancelled) return
        if (typeof previewData.html !== 'string' || !previewData.html) {
          throw new Error('Preview returned empty HTML')
        }
        setPreviewHtml(previewData.html)
        setRawHtml(typeof rawData.html === 'string' ? rawData.html : previewData.html)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load preview')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedId, previewUrl, rawUrl])

  const handleCopy = async () => {
    const toCopy = rawHtml || previewHtml
    if (!toCopy) return
    try {
      await navigator.clipboard.writeText(toCopy)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 1800)
    } catch {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 1800)
    }
  }

  const iframeWidth = viewport === 'mobile' ? 360 : 640
  const openInTabUrl = `/api/dev/email-preview?kind=${encodeURIComponent(selectedId)}`

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Visual check for every email Domu Match sends. Supabase templates: copy raw HTML and paste into the Supabase dashboard.
            </p>
          </div>
          <Link
            href="/dev/unsubscribe-preview"
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100"
          >
            Preview unsubscribe page →
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
          <aside className="space-y-6">
            <Section title="Supabase Auth">
              {supabaseKinds.map((k) => (
                <NavItem key={k.id} k={k} active={k.id === selectedId} onSelect={() => setSelectedId(k.id)} />
              ))}
            </Section>
            <Section title="App-sent (Mailjet)">
              {appKinds.map((k) => (
                <NavItem key={k.id} k={k} active={k.id === selectedId} onSelect={() => setSelectedId(k.id)} />
              ))}
            </Section>
          </aside>

          <main className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{selected?.label}</h2>
                  <p className="text-xs text-slate-500">{selected?.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ViewportToggle value={viewport} onChange={setViewport} />
                  {selected?.category === 'supabase' && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!rawHtml && !previewHtml}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                    >
                      {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy raw HTML'}
                    </button>
                  )}
                  <a
                    href={openInTabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open in tab
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-6">
              <div className="mx-auto" style={{ width: iframeWidth }}>
                {isLoading && (
                  <div className="flex h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
                    Loading preview…
                  </div>
                )}
                {loadError && !isLoading && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                    <p className="font-semibold">Could not load preview</p>
                    <p className="mt-1">{loadError}</p>
                    <p className="mt-3 text-xs text-red-600">
                      Check the terminal for API errors. Ensure <code className="rounded bg-red-100 px-1">EMAIL_UNSUBSCRIBE_SECRET</code> or{' '}
                      <code className="rounded bg-red-100 px-1">CRON_SECRET</code> is set if app-sent templates fail.
                    </p>
                  </div>
                )}
                {!isLoading && !loadError && previewHtml && (
                  <iframe
                    key={`${selectedId}-${viewport}-${previewHtml.length}`}
                    title={selected?.label || selectedId}
                    srcDoc={previewHtml}
                    className="block w-full bg-white shadow-sm"
                    style={{ width: '100%', height: '900px', border: '1px solid #e2e8f0', borderRadius: 12 }}
                  />
                )}
              </div>
            </div>

            {selected?.category === 'supabase' && rawHtml && (
              <details className="rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                  View raw HTML (with {'{{ .Token }}'} etc. for Supabase paste)
                </summary>
                <pre className="mt-3 max-h-[500px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100">
                  <code>{rawHtml}</code>
                </pre>
              </details>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <ul className="space-y-1">{children}</ul>
    </div>
  )
}

function NavItem({
  k,
  active,
  onSelect,
}: {
  k: PreviewKind
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          active
            ? 'bg-violet-100 font-semibold text-violet-900 ring-1 ring-violet-200'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        {k.label}
      </button>
    </li>
  )
}

function ViewportToggle({ value, onChange }: { value: ViewportSize; onChange: (v: ViewportSize) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
      {(['mobile', 'desktop'] as ViewportSize[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            value === v ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {v === 'mobile' ? 'Mobile' : 'Desktop'}
        </button>
      ))}
    </div>
  )
}
