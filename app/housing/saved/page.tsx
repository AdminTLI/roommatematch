'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, MapPin } from 'lucide-react'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/client'
import {
  readSavedListingIds,
  toggleSavedListingId,
} from '@/lib/housing/saved-listings'
import { formatNlEuroCompact } from '@/lib/housing/format'
import { HousingSectionTabs } from '@/components/housing/HousingNavMenu'

type SavedListing = {
  id: string
  title: string
  city?: string | null
  address?: string | null
  rent_monthly?: number | null
  room_type?: string | null
  photos?: string[]
  host_name?: string
}

export default function SavedListingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [ids, setIds] = useState<string[]>([])
  const [listings, setListings] = useState<SavedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const savedIds = readSavedListingIds()
    setIds(savedIds)
    if (!savedIds.length) {
      setListings([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/housing/listings/batch?ids=${encodeURIComponent(savedIds.join(','))}`
      )
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof j.error === 'string' ? j.error : 'Could not load saved listings')
      }
      setListings(j.listings || [])
    } catch (e) {
      setListings([])
      setError(e instanceof Error ? e.message : 'Could not load saved listings')
    } finally {
      setLoading(false)
    }
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
    void refresh()
  }, [refresh])

  const unsave = (id: string) => {
    const next = toggleSavedListingId(id)
    setIds(next)
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const content = (
    <div className="mx-auto max-w-6xl space-y-6 pb-28">
      <header className="space-y-4">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Your housing</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Saved listings
          </h1>
          <p className="mt-1 max-w-xl text-ink-500">
            Places you want to revisit. Saved on this device.
          </p>
        </div>
        <HousingSectionTabs />
      </header>

      {error && (
        <p className="text-sm text-rose-600">
          {error}{' '}
          <button type="button" className="font-medium underline" onClick={() => void refresh()}>
            Retry
          </button>
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-3xl border border-zinc-200/90 bg-white/80 p-4 dark:border-white/15 dark:bg-zinc-900/50"
            >
              <div className="h-28 w-40 shrink-0 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800 sm:h-32 sm:w-48" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !ids.length && (
        <div className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/40 px-6 py-14 text-center backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Heart className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-ink-900 dark:text-white">No saved listings yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
            Tap Save on a listing while browsing to keep it here.
          </p>
          <Link
            href="/housing"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
          >
            Browse housing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && !error && ids.length > 0 && !listings.length && (
        <p className="rounded-3xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-ink-500 dark:border-zinc-800">
          Saved listings are no longer available or were taken down.
        </p>
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((listing) => {
            const photo = listing.photos?.[0]
            const price =
              listing.rent_monthly != null
                ? `${formatNlEuroCompact(listing.rent_monthly)}/mo`
                : null
            const location = [listing.city, listing.address].filter(Boolean).join(' · ')

            return (
              <div
                key={listing.id}
                className="flex flex-col gap-3 rounded-3xl border border-zinc-200/90 bg-white/80 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:border-zinc-300 hover:bg-white/95 dark:border-white/15 dark:bg-zinc-900/50 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)] dark:hover:border-white/25 dark:hover:bg-zinc-900/70 sm:flex-row sm:items-stretch sm:gap-5"
              >
                <Link
                  href={`/housing/${listing.id}`}
                  className="flex min-w-0 flex-1 gap-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:gap-5"
                >
                  <div className="h-28 w-40 shrink-0 overflow-hidden rounded-2xl bg-indigo-100/60 sm:h-32 sm:w-48 dark:bg-indigo-950/40">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
                    <h2 className="truncate text-base font-semibold text-ink-900 dark:text-white sm:text-lg">
                      {listing.title}
                    </h2>
                    {location ? (
                      <p className="flex items-center gap-1 text-sm text-ink-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{location}</span>
                      </p>
                    ) : null}
                    <p className="text-sm text-ink-500">
                      {price ? <span className="font-medium text-ink-800 dark:text-ink-200">{price}</span> : null}
                      {price && listing.room_type ? ' · ' : null}
                      {listing.room_type ? (
                        <span className="capitalize">{listing.room_type}</span>
                      ) : null}
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:items-center sm:justify-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => unsave(listing.id)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-ink-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-ink-200 dark:hover:bg-zinc-800"
                    aria-label="Remove from saved"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current text-rose-500" />
                    Saved
                  </button>
                  <Link
                    href={`/housing/${listing.id}`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  if (!user) return content
  return <AppShell user={user}>{content}</AppShell>
}
