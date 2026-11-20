'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Heart,
  Share2,
  Flag,
  Shield,
  ShieldAlert,
  Home,
  ArrowRight,
} from 'lucide-react'
import { Listing } from '@/types/housing'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatNlEuroCompact, formatNlNumber } from '@/lib/housing/format'

interface DiscoverListingCardProps {
  listing: Listing
  onHover: (id: string | null) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  onReport: (id: string) => void
  isSaved?: boolean
  isHighlighted?: boolean
  imagePriority?: boolean
  /** Taller cover image for full list / showcase layout */
  imageShowcase?: boolean
}

function FitRow({ label, value }: { label: string; value?: number }) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-ink-500">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${value != null ? pct : 0}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] font-medium text-ink-600 dark:text-ink-300">
        {value != null ? `${pct}%` : '-'}
      </span>
    </div>
  )
}

export function DiscoverListingCard({
  listing,
  onHover,
  onSave,
  onShare,
  onReport,
  isSaved = false,
  isHighlighted = false,
  imagePriority = false,
  imageShowcase = false,
}: DiscoverListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const hostVerified = Boolean(listing.hostVerified)
  const photos = Array.isArray(listing.photos) ? listing.photos : []

  const formatPrice = () => {
    const raw =
      listing.priceMonthly ??
      (listing as { rent_monthly?: number }).rent_monthly
    const base = typeof raw === 'number' && Number.isFinite(raw) ? raw : null
    if (base == null) return 'Price TBD'
    const utilities =
      typeof listing.utilitiesCost === 'number' ? listing.utilitiesCost : 0
    if (listing.utilitiesIncluded) return `${formatNlEuroCompact(base)}/mo`
    if (utilities > 0)
      return `${formatNlEuroCompact(base)} + €${formatNlNumber(utilities)}`
    return `${formatNlEuroCompact(base)}/mo`
  }

  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white transition-[box-shadow,border-color] duration-200 dark:border-zinc-800 dark:bg-zinc-900',
        isHighlighted
          ? 'border-indigo-400 shadow-[0_0_0_2px_rgba(129,140,248,0.45)]'
          : 'hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-600'
      )}
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-800',
          imageShowcase
            ? 'aspect-[4/3] w-full sm:aspect-[5/4]'
            : 'h-40 sm:h-44'
        )}
      >
        {photos.length > 0 ? (
          // Plain img: seed (example.com) + signed Supabase URLs bypass next/image host allowlist
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[imageIndex] ?? photos[0]}
            alt={listing.title}
            loading={imagePriority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full min-h-[10rem] items-center justify-center text-zinc-300">
            <Home className="h-12 w-12" />
          </div>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              type="button"
              aria-label="Previous photo"
              className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
              onClick={(e) => {
                e.stopPropagation()
                setImageIndex((i) => (i - 1 + photos.length) % photos.length)
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
              onClick={(e) => {
                e.stopPropagation()
                setImageIndex((i) => (i + 1) % photos.length)
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Fixed chip row height so 1 vs 2 wrap lines don't shift neighbors as much */}
        <div className="flex min-h-[1.5rem] flex-wrap gap-1.5">
          {listing.compatibilityScore != null && (
            <Badge className="border-0 bg-indigo-600 text-xs font-semibold text-white">
              {listing.compatibilityScore}% fit
            </Badge>
          )}
          {listing.isNew && (
            <Badge className="border-0 bg-emerald-600 text-xs text-white">New</Badge>
          )}
          {hostVerified ? (
            <Badge className="gap-1 border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Shield className="h-3 w-3" />
              Verified host
            </Badge>
          ) : (
            <Badge className="gap-1 border-0 bg-rose-600 text-xs font-medium text-white">
              <ShieldAlert className="h-3 w-3" />
              Unverified host
            </Badge>
          )}
        </div>

        {/* Always reserve 2 title lines so price / fit bars align across the grid */}
        <div className="min-h-[3.75rem]">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug tracking-tight text-ink-900 dark:text-white">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[listing.city, listing.postalCode].filter(Boolean).join(' ')}
              {listing.distanceKmToCampus != null
                ? ` · ${listing.distanceKmToCampus.toFixed(1)} km to campus`
                : ''}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-ink-900 dark:text-white">{formatPrice()}</p>
          <p className="text-xs capitalize text-ink-500">{listing.roomType}</p>
        </div>

        <div className="min-h-[3.25rem] space-y-1.5">
          <FitRow label="Lifestyle" value={listing.scoreBreakdown?.lifestyle} />
          <FitRow label="Budget" value={listing.scoreBreakdown?.budget} />
          <FitRow label="Timeline" value={listing.scoreBreakdown?.timeline} />
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/housing/${listing.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 sm:text-sm"
            >
              View
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700',
                isSaved && 'border-rose-200 text-rose-600'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onSave(listing.id)
              }}
            >
              <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
            </button>
          </div>

          <div className="flex min-h-[2rem] items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
            <div className="flex gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-ink-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(listing.id)
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-rose-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onReport(listing.id)
                }}
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
            {!hostVerified && (
              <p className="max-w-[55%] text-right text-[10px] leading-snug text-rose-600/90">
                View-only until host verifies email
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
