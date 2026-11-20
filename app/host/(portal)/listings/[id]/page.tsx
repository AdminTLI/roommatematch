'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatNlDate, formatNlEuroCompact } from '@/lib/housing/format'
import { cn } from '@/lib/utils'

type ApplicationCounts = {
  total: number
  new: number
  shortlisted: number
  offers: number
}

type ListingDetail = {
  id: string
  title: string
  description?: string | null
  city?: string | null
  rent_monthly?: number | null
  deposit_amount?: number | null
  available_from?: string | null
  seeking_people?: number | null
  available_rooms?: number | null
  status: string
  moderation_status?: string | null
  photos?: string[] | null
  property_type?: string | null
  room_type?: string | null
}

function listingVisibility(listing: ListingDetail): { label: string; tone: 'live' | 'review' | 'paused' | 'done' } {
  if (listing.status === 'rented') return { label: 'Rented', tone: 'done' }
  if (listing.status === 'expired') return { label: 'Expired', tone: 'done' }
  if (listing.status === 'suspended') return { label: 'Paused', tone: 'paused' }
  if (listing.status === 'pending' || listing.moderation_status === 'pending') {
    return { label: 'In review', tone: 'review' }
  }
  if (listing.moderation_status === 'rejected') return { label: 'Needs changes', tone: 'paused' }
  if (listing.status === 'active' && listing.moderation_status === 'approved') {
    return { label: 'Live', tone: 'live' }
  }
  return { label: listing.status.replace(/_/g, ' '), tone: 'review' }
}

function applicationsSummary(counts: ApplicationCounts) {
  if (counts.total === 0) return 'No applications yet'
  const parts: string[] = []
  if (counts.new > 0) parts.push(`${counts.new} new`)
  if (counts.shortlisted > 0) parts.push(`${counts.shortlisted} shortlisted`)
  if (counts.offers > 0) parts.push(`${counts.offers} offer${counts.offers === 1 ? '' : 's'}`)
  return parts.length > 0 ? parts.join(' · ') : `${counts.total} total`
}

export default function HostListingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [counts, setCounts] = useState<ApplicationCounts>({
    total: 0,
    new: 0,
    shortlisted: 0,
    offers: 0,
  })

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/host/listings/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        setListing(j.listing || null)
        if (j.application_counts) setCounts(j.application_counts)
      })
  }, [params.id])

  useEffect(() => {
    if (listing?.status === 'draft' && listing.id) {
      router.replace(`/host/listings/wizard?id=${listing.id}`)
    }
  }, [listing, router])

  if (!listing || listing.status === 'draft') {
    return <p className="text-ink-500">Loading…</p>
  }

  const visibility = listingVisibility(listing)
  const availableFrom = formatNlDate(listing.available_from)
  const photo = listing.photos?.[0]
  const rent =
    listing.rent_monthly != null && Number.isFinite(Number(listing.rent_monthly))
      ? formatNlEuroCompact(Number(listing.rent_monthly))
      : null
  const seeking = listing.seeking_people || listing.available_rooms || 1
  const description = (listing.description || '').trim()

  return (
    <div className="space-y-5">
      <Link
        href="/host/listings"
        className="inline-flex text-sm font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300"
      >
        ← Back to listings
      </Link>

      <article className="overflow-hidden rounded-3xl border border-white/60 bg-white/55 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/10] w-full shrink-0 bg-indigo-100/50 sm:aspect-auto sm:w-56 sm:self-stretch dark:bg-indigo-950/30">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[9rem] items-center justify-center text-sm text-ink-400">
                No photo
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-2xl">
                  {listing.title}
                </h1>
                <p className="text-sm text-ink-500">
                  {listing.city || 'City not set'}
                  {availableFrom ? (
                    <>
                      <span className="text-ink-300 dark:text-ink-600"> · </span>
                      Available {availableFrom}
                    </>
                  ) : null}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                  visibility.tone === 'live' &&
                    'bg-emerald-500/12 text-emerald-800 dark:text-emerald-200',
                  visibility.tone === 'review' &&
                    'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                  visibility.tone === 'paused' &&
                    'bg-rose-500/12 text-rose-800 dark:text-rose-200',
                  visibility.tone === 'done' &&
                    'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
                )}
              >
                {visibility.label}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-200/70 pt-5 dark:border-white/10">
              <div>
                <dt className="text-xs text-ink-400">Rent</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink-900 dark:text-white">
                  {rent ? `${rent}/mo` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Seeking</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink-900 dark:text-white">
                  {seeking}
                  <span className="font-normal text-ink-500">
                    {' '}
                    {seeking === 1 ? 'person' : 'people'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Applications</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink-900 dark:text-white">
                  {counts.total}
                </dd>
                <p className="mt-0.5 text-xs text-ink-400">{applicationsSummary(counts)}</p>
              </div>
            </dl>

            {description ? (
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2 pt-1">
              <Link
                href={`/host/applications?listing=${listing.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                {counts.total > 0 ? 'View applications' : 'Applications'}
              </Link>
              <Link
                href={`/host/listings/wizard?id=${listing.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-ink-700 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-transparent dark:text-ink-200 dark:hover:bg-white/5"
              >
                Edit listing
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
