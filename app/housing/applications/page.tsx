'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app/shell'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { HousingSectionTabs } from '@/components/housing/HousingNavMenu'

type AppRow = {
  id: string
  status: string
  fit_score?: number
  identity_revealed?: boolean
  host_chat_id?: string | null
  housing_listings?: { title?: string; city?: string; rent_monthly?: number }
}

export default function StudentApplicationsPage() {
  const [apps, setApps] = useState<AppRow[]>([])
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)

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
    fetch('/api/housing/applications')
      .then((r) => r.json())
      .then((j) => setApps(j.applications || []))
  }, [])

  const respond = async (id: string, action: 'accept_offer' | 'decline_offer') => {
    await fetchWithCSRF(`/api/host/applications/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const j = await fetch('/api/housing/applications').then((r) => r.json())
    setApps(j.applications || [])
  }

  const content = (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 pb-28">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Your applications</h1>
        <p className="text-sm text-ink-500">
          Hosts see compatibility only until they Accept you. Then you can chat about details before
          any formal offer.
        </p>
        <HousingSectionTabs />
      </header>
      <div className="space-y-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="rounded-3xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40"
          >
            <h2 className="font-semibold text-ink-900 dark:text-white">
              {app.housing_listings?.title || 'Listing'}
            </h2>
            <p className="text-sm text-ink-500">
              {app.housing_listings?.city} · €{app.housing_listings?.rent_monthly}/mo · {app.status}
              {app.fit_score != null ? ` · ${Math.round(Number(app.fit_score) * 100)}% fit` : ''}
            </p>
            {(app.status === 'accepted' || app.host_chat_id) && app.host_chat_id ? (
              <div className="mt-3">
                <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700" asChild>
                  <a href={`/chat?chatId=${app.host_chat_id}`}>Host accepted — open chat</a>
                </Button>
              </div>
            ) : null}
            {app.status === 'offer_pending' && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => respond(app.id, 'accept_offer')}
                >
                  Accept offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => respond(app.id, 'decline_offer')}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        ))}
        {!apps.length && <p className="text-ink-500">No applications yet.</p>}
      </div>
    </div>
  )

  if (!user) return content
  return <AppShell user={user}>{content}</AppShell>
}
