import { createAdminClient } from '@/lib/supabase/server'

/**
 * Coerce listing.photos from jsonb / mixed shapes into URL or storage-path strings.
 */
export function normalizeListingPhotos(input: unknown): string[] {
  let values: unknown[] = []

  if (Array.isArray(input)) {
    values = input
  } else if (typeof input === 'string' && input.trim()) {
    try {
      const parsed = JSON.parse(input)
      values = Array.isArray(parsed) ? parsed : [input]
    } catch {
      values = [input]
    }
  }

  const urls: string[] = []
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      urls.push(value.trim())
      continue
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      const candidate = record.url ?? record.src ?? record.path
      if (typeof candidate === 'string' && candidate.trim()) {
        urls.push(candidate.trim())
      }
    }
  }

  return [...new Set(urls)]
}

function extractListingPhotoPath(src: string): string | null {
  // Already a storage object path (as stored by some hosts/tools)
  if (!src.includes('://') && !src.startsWith('/') && src.includes('/')) {
    return src.replace(/^listing-photos\//, '')
  }

  const markers = [
    '/storage/v1/object/sign/listing-photos/',
    '/storage/v1/object/public/listing-photos/',
    '/storage/v1/object/authenticated/listing-photos/',
  ]

  for (const marker of markers) {
    const index = src.indexOf(marker)
    if (index >= 0) {
      const rest = src.slice(index + marker.length)
      return decodeURIComponent(rest.split('?')[0] || '')
    }
  }

  return null
}

/**
 * Resolve a signed URL for a host avatar stored in listing-photos
 * (paths like host-avatars/{userId}/….jpg).
 */
export async function resolveHostAvatarUrl(
  pathOrUrl: string | null | undefined
): Promise<string | null> {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null
  const raw = pathOrUrl.trim()
  if (!raw) return null

  try {
    const admin = createAdminClient()
    const path = extractListingPhotoPath(raw) || (!raw.includes('://') ? raw : null)
    if (!path) return raw.startsWith('http') ? raw : null

    const { data, error } = await admin.storage
      .from('listing-photos')
      .createSignedUrl(path, 60 * 60 * 24 * 7)

    if (error || !data?.signedUrl) return raw.startsWith('http') ? raw : null
    return data.signedUrl
  } catch {
    return raw.startsWith('http') ? raw : null
  }
}

/**
 * Refresh signed URLs for private listing-photos so detail pages don't show broken images.
 */
export async function resolveListingPhotoUrls(input: unknown): Promise<string[]> {
  const raw = normalizeListingPhotos(input)
  if (raw.length === 0) return []

  try {
    const admin = createAdminClient()
    const resolved = await Promise.all(
      raw.map(async (src) => {
        const path = extractListingPhotoPath(src)
        if (!path) return src

        const { data, error } = await admin.storage
          .from('listing-photos')
          .createSignedUrl(path, 60 * 60 * 24 * 7)

        if (error || !data?.signedUrl) return src
        return data.signedUrl
      })
    )
    return resolved.filter((url) => typeof url === 'string' && url.length > 0)
  } catch {
    return raw
  }
}
