'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ViewingRequestCard,
  type ViewingRow,
} from '@/components/housing/ViewingRequestCard'

export default function HostViewingsPage() {
  const [viewings, setViewings] = useState<ViewingRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return fetch('/api/housing/viewings?as=host')
      .then((r) => r.json())
      .then((j) => setViewings(j.viewings || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const needsYou = viewings.filter(
    (v) => v.status === 'scheduled' && v.proposed_by !== 'host'
  )
  const waiting = viewings.filter(
    (v) => v.status === 'scheduled' && v.proposed_by === 'host'
  )
  const rest = viewings.filter((v) => v.status !== 'scheduled')

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Viewings</h1>
        <p className="text-sm text-ink-500">
          Applicants stay anonymous in-app. Accept one of their proposed times, or send times that
          work for you — the viewing only locks when you both agree.
        </p>
        <Link href="/host/applications" className="text-sm font-medium text-indigo-600 hover:underline">
          Applications
        </Link>
      </header>

      {loading && <p className="text-ink-500">Loading…</p>}

      {!loading && !viewings.length && (
        <p className="text-ink-500">No viewing requests yet.</p>
      )}

      {needsYou.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Needs your response
          </h2>
          {needsYou.map((v) => (
            <ViewingRequestCard key={v.id} viewing={v} role="host" onChanged={load} />
          ))}
        </section>
      )}

      {waiting.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Awaiting applicant
          </h2>
          {waiting.map((v) => (
            <ViewingRequestCard key={v.id} viewing={v} role="host" onChanged={load} />
          ))}
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Confirmed & past
          </h2>
          {rest.map((v) => (
            <ViewingRequestCard key={v.id} viewing={v} role="host" onChanged={load} />
          ))}
        </section>
      )}
    </div>
  )
}
