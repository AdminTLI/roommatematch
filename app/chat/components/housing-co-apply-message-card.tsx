'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { House, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HousingCoApplyMessageMetadata } from '@/lib/chat/housing-co-apply-metadata'
import { cn } from '@/lib/utils'

function formatRent(rent: number | null): string | null {
  if (rent == null || !Number.isFinite(rent)) return null
  return `€${Math.round(rent)}/mo`
}

function isUsableImageUrl(src: string | null | undefined): src is string {
  if (!src || typeof src !== 'string') return false
  const trimmed = src.trim()
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/storage/') ||
    trimmed.startsWith('data:')
  )
}

interface HousingCoApplyMessageCardProps {
  metadata: HousingCoApplyMessageMetadata
  /** True when the current user is viewing their own sent card */
  isOwn: boolean
  className?: string
}

export function HousingCoApplyMessageCard({
  metadata,
  isOwn,
  className,
}: HousingCoApplyMessageCardProps) {
  const title = metadata.listing_title?.trim() || 'Housing listing'
  const who = metadata.applicant_name?.trim() || 'A roommate'
  const rent = formatRent(metadata.listing_rent_monthly)
  const city = metadata.listing_city?.trim() || null
  const href = `/housing/${metadata.listing_id}`
  const party =
    metadata.group_size > 1
      ? `Party of ${metadata.group_size}`
      : null

  const initialPhoto = isUsableImageUrl(metadata.listing_photo)
    ? metadata.listing_photo.trim()
    : null
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto)
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => {
    setPhotoUrl(initialPhoto)
    setPhotoFailed(false)
  }, [initialPhoto, metadata.listing_id])

  useEffect(() => {
    if (photoUrl || !metadata.listing_id) return
    let cancelled = false
    fetch(
      `/api/housing/listings/batch?ids=${encodeURIComponent(metadata.listing_id)}`
    )
      .then(async (r) => {
        if (!r.ok) return null
        const body = (await r.json()) as {
          listings?: Array<{ id: string; photos?: string[] }>
        }
        const listing = body.listings?.find((l) => l.id === metadata.listing_id)
        const next = listing?.photos?.[0]
        return isUsableImageUrl(next) ? next.trim() : null
      })
      .then((url) => {
        if (!cancelled && url) setPhotoUrl(url)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [photoUrl, metadata.listing_id])

  const showPhoto = Boolean(photoUrl) && !photoFailed

  return (
    <div
      className={cn(
        'box-border w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-left shadow-sm dark:border-white/10 dark:bg-zinc-900',
        className
      )}
    >
      {showPhoto ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10">
          <House className="h-8 w-8 text-indigo-400" />
        </div>
      )}

      <div className="border-b border-zinc-100 px-4 py-3 dark:border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Housing application
        </p>
        <p className="mt-1 text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {isOwn
            ? `You applied with them for this place`
            : `${who} applied on your behalf`}
          {party ? ` · ${party}` : ''}
        </p>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          {city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {city}
            </span>
          )}
          {rent && <span className="font-medium">{rent}</span>}
        </div>
        {!isOwn && (
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            You’re included in this application. Open the listing to review the
            place and track it under Applications.
          </p>
        )}
      </div>

      <div className="px-4 pb-3">
        <Button
          asChild
          type="button"
          className="h-9 w-full rounded-xl bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
        >
          <Link href={href}>Check it out</Link>
        </Button>
      </div>
    </div>
  )
}
