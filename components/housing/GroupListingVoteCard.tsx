'use client'

import { useEffect, useState } from 'react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Button } from '@/components/ui/button'

/**
 * Glass card for housing-intent groups: pin status, votes, fit preview, apply gate.
 */
export function GroupListingVoteCard({
  chatId,
  listingId,
  listingTitle,
}: {
  chatId: string
  listingId: string
  listingTitle?: string
}) {
  const [unanimous, setUnanimous] = useState(false)
  const [preview, setPreview] = useState<{ overall: number; cohesion: number } | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const refresh = () =>
    fetch(`/api/chat/groups/${chatId}/votes?listing_id=${listingId}`)
      .then((r) => r.json())
      .then((j) => {
        setUnanimous(Boolean(j.unanimous))
        if (j.preview) {
          setPreview({ overall: j.preview.overall, cohesion: j.preview.cohesion })
        }
      })

  useEffect(() => {
    refresh()
  }, [chatId, listingId])

  const vote = async (v: 'approve' | 'reject' | 'abstain') => {
    await fetchWithCSRF(`/api/chat/groups/${chatId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, vote: v }),
    })
    await refresh()
  }

  const apply = async () => {
    setMessage(null)
    const res = await fetchWithCSRF('/api/housing/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: listingId,
        application_type: 'group',
        chat_id: chatId,
      }),
    })
    const j = await res.json()
    setMessage(res.ok ? 'Group application submitted.' : j.error || 'Failed')
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50">
      <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Group housing vote</p>
      <h3 className="mt-1 font-semibold text-ink-900 dark:text-white">
        {listingTitle || 'Pinned listing'}
      </h3>
      {preview && (
        <p className="mt-1 text-sm text-ink-500">
          {Math.round(preview.overall * 100)}% house fit · {Math.round(preview.cohesion * 100)}%
          cohesion
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={() => vote('approve')}>
          Approve
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => vote('abstain')}>
          Abstain
        </Button>
        <Button size="sm" variant="ghost" className="rounded-xl text-rose-600" onClick={() => vote('reject')}>
          Reject
        </Button>
      </div>
      {unanimous ? (
        <Button
          className="mt-3 w-full rounded-2xl bg-rose-600 hover:bg-rose-700"
          onClick={apply}
        >
          Everyone approved - apply as group
        </Button>
      ) : (
        <p className="mt-3 text-xs text-ink-400">Everyone must approve before you can apply.</p>
      )}
      {message && <p className="mt-2 text-sm text-ink-600">{message}</p>}
    </div>
  )
}
