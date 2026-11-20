'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Listing } from '@/types/housing'
import { ListingDetail } from './ListingDetailView'
import {
  readSavedListingIds,
  toggleSavedListingId,
} from '@/lib/housing/saved-listings'

interface ListingDetailClientProps {
  listing: Listing
  showBackButton?: boolean
  plannedUniversityId?: string | null
  plannedUniversityName?: string | null
}

export function ListingDetailClient({
  listing,
  showBackButton = true,
  plannedUniversityId = null,
  plannedUniversityName = null,
}: ListingDetailClientProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(readSavedListingIds().includes(listing.id))
  }, [listing.id])

  const onSave = useCallback(
    (id: string) => {
      const next = toggleSavedListingId(id)
      const isNowSaved = next.includes(id)
      setSaved(isNowSaved)
      if (isNowSaved) {
        toast.success('Saved', {
          action: {
            label: 'View saved',
            onClick: () => router.push('/housing/saved'),
          },
        })
      }
    },
    [router]
  )

  const onShare = useCallback(async (id: string) => {
    const url = `${window.location.origin}/housing/${id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      } catch {
        toast.error('Could not share')
      }
    }
  }, [listing.title])

  const onReport = useCallback((_id: string) => {
    // ListingDetail opens its own report dialog when Flag is clicked;
    // this prop is kept for API compatibility.
  }, [])

  return (
    <ListingDetail
      listing={listing}
      onSave={onSave}
      onShare={onShare}
      onReport={onReport}
      isSaved={saved}
      showBackButton={showBackButton}
      plannedUniversityId={plannedUniversityId}
      plannedUniversityName={plannedUniversityName}
    />
  )
}
