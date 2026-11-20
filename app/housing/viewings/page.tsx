'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/client'
import {
  ViewingRequestCard,
  type ViewingRow,
} from '@/components/housing/ViewingRequestCard'
import { HousingSectionTabs } from '@/components/housing/HousingNavMenu'

export default function StudentViewingsPage() {
  const [viewings, setViewings] = useState<ViewingRow[]>([])
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return fetch('/api/housing/viewings')
      .then((r) => r.json())
      .then((j) => setViewings(j.viewings || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || 'Student',
          })
        }
      })
    void load()
  }, [load])

  const content = (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 pb-28">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Your viewings</h1>
        <p className="text-sm text-ink-500">
          Propose times, respond to host counter-proposals, and only confirm when you both agree on
          the same slot.
        </p>
        <HousingSectionTabs />
      </header>

      <div className="space-y-3">
        {viewings.map((v) => (
          <ViewingRequestCard key={v.id} viewing={v} role="student" onChanged={load} />
        ))}
        {!loading && !viewings.length && (
          <p className="text-ink-500">
            No viewing requests yet.{' '}
            <Link href="/housing" className="font-medium text-indigo-600 hover:underline">
              Find a listing
            </Link>{' '}
            and propose times that work for you.
          </p>
        )}
        {loading && <p className="text-ink-500">Loading…</p>}
      </div>
    </div>
  )

  if (!user) return content
  return <AppShell user={user}>{content}</AppShell>
}
