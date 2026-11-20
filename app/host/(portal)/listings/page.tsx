'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart3, ClipboardList, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HOST_TYPE_LABELS, type HostType } from '@/lib/host/types'

type Listing = {
  id: string
  title: string
  city: string
  rent_monthly: number
  status: string
  moderation_status: string
  host_type?: HostType
  photos?: string[]
  seeking_people?: number
  updated_at?: string
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function statusTone(kind: 'listing' | 'moderation', value: string) {
  if (kind === 'listing') {
    if (value === 'active') return 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-200'
    if (value === 'draft') return 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
    if (value === 'pending') return 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
    if (value === 'suspended' || value === 'archived')
      return 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
    if (value === 'rented' || value === 'expired')
      return 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
  }
  if (value === 'approved') return 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-200'
  if (value === 'pending') return 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
  if (value === 'rejected') return 'bg-rose-500/12 text-rose-800 dark:text-rose-200'
  return 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
}

export default function HostListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/host/listings')
      .then((r) => r.json())
      .then((j) => setListings(j.listings || []))
      .finally(() => setLoading(false))
  }, [])

  const { drafts, published } = useMemo(() => {
    const draftsList = listings.filter((l) => l.status === 'draft')
    const rest = listings.filter((l) => l.status !== 'draft')
    return { drafts: draftsList, published: rest }
  }, [listings])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Your listings</h1>
          <p className="text-sm text-ink-500">
            Drafts save automatically as you go. Submit when you&apos;re ready for moderation.
          </p>
        </div>
        <Button asChild className="rounded-2xl bg-indigo-600 hover:bg-indigo-700">
          <Link href="/host/listings/wizard">New listing</Link>
        </Button>
      </div>

      {loading && <p className="text-ink-500">Loading…</p>}

      {!loading && drafts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Drafts</h2>
          <div className="space-y-3">
            {drafts.map((l) => (
              <ListingRow key={l.id} listing={l} href={`/host/listings/wizard?id=${l.id}`} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {drafts.length > 0 ? (
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Listings</h2>
        ) : null}
        <div className="space-y-3">
          {published.map((l) => (
            <ListingRow key={l.id} listing={l} href={`/host/listings/${l.id}`} />
          ))}
          {!loading && !listings.length ? (
            <p className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/40 p-8 text-center text-ink-500 backdrop-blur-xl">
              No listings yet. Create your first one.
            </p>
          ) : null}
          {!loading && listings.length > 0 && published.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/40 p-6 text-center text-sm text-ink-500 backdrop-blur-xl">
              No submitted listings yet — continue a draft above when you&apos;re ready.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function ListingRow({ listing: l, href }: { listing: Listing; href: string }) {
  const isDraft = l.status === 'draft'
  const editHref = `/host/listings/wizard?id=${l.id}`
  const insightsHref = `/host/listings/${l.id}`

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200/90 bg-white/80 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:border-zinc-300 hover:bg-white/95 dark:border-white/15 dark:bg-zinc-900/50 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)] dark:hover:border-white/25 dark:hover:bg-zinc-900/70 sm:flex-row sm:items-stretch sm:gap-5">
      <Link
        href={href}
        className="flex min-w-0 flex-1 gap-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:gap-5"
      >
        <div className="h-28 w-40 shrink-0 overflow-hidden rounded-2xl bg-indigo-100/60 sm:h-32 sm:w-48 dark:bg-indigo-950/40">
          {l.photos?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={l.photos[0]}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-ink-900 dark:text-white sm:text-lg">
              {l.title || 'Untitled draft'}
            </h2>
            <span
              className={
                isDraft
                  ? 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200'
                  : 'rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-200'
              }
            >
              {isDraft
                ? 'Draft'
                : HOST_TYPE_LABELS[(l.host_type || 'private_landlord') as HostType]}
            </span>
          </div>
          <p className="text-sm text-ink-500">
            {l.city && l.city !== 'City TBD' ? l.city : 'City not set'}
            {l.rent_monthly > 0 ? ` · €${l.rent_monthly}/mo` : ''}
            {l.seeking_people ? ` · Seeking ${l.seeking_people}` : ''}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {isDraft ? (
              <>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone('listing', 'draft')}`}
                >
                  Draft
                </span>
                {l.updated_at ? (
                  <span className="text-xs text-ink-400">
                    Updated{' '}
                    {new Date(l.updated_at).toLocaleString('nl-NL', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone('listing', l.status)}`}
                >
                  {titleCase(l.status)}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone('moderation', l.moderation_status)}`}
                >
                  {titleCase(l.moderation_status)}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:items-center sm:justify-end sm:self-center">
        {isDraft ? (
          <Link
            href={editHref}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            Continue
          </Link>
        ) : (
          <>
            <Link
              href={editHref}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-ink-700 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-transparent dark:text-ink-200 dark:hover:bg-white/5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <Link
              href={insightsHref}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-ink-700 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-transparent dark:text-ink-200 dark:hover:bg-white/5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Insights
            </Link>
            <Link
              href={`/host/applications?listing=${l.id}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Applications
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
