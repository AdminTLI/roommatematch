'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, ImageIcon, Sparkles, Trash2 } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { prepareProfileImage } from '@/lib/utils/prepare-profile-image'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'
import { PRESET_SEEDS } from '@/lib/avatars/preset-seeds'

interface AvatarAndPhotoSettingsProps {
  profile: { avatar_id?: string | null; profile_picture_url?: string | null }
  profilePicturePreviewUrl?: string | null
}

export function AvatarAndPhotoSettings({ profile, profilePicturePreviewUrl }: AvatarAndPhotoSettingsProps) {
  const router = useRouter()
  const initial = (profile?.avatar_id && String(profile.avatar_id).trim()) || PRESET_SEEDS[0]
  const [selectedSeed, setSelectedSeed] = useState<string>(initial)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removingPicture, setRemovingPicture] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [afterRevealPreview, setAfterRevealPreview] = useState<string | null>(
    profilePicturePreviewUrl ?? null
  )

  const matchSeesUrl = programmaticAvatarUrl(selectedSeed)

  useEffect(() => {
    setAfterRevealPreview(profilePicturePreviewUrl ?? null)
  }, [profilePicturePreviewUrl])

  useEffect(() => {
    let cancelled = false
    void fetch('/api/settings/profile/picture')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        if (typeof data.preview_signed_url === 'string' && data.preview_signed_url) {
          setAfterRevealPreview(data.preview_signed_url)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveAvatar = async () => {
    setSavingAvatar(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF('/api/settings/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_id: selectedSeed }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save avatar')
      }
      setSuccess('Avatar updated')
      showSuccessToast('Avatar updated')
      router.refresh()
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save'
      setError(message)
      showErrorToast('Could not save avatar', message)
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      // Compress/convert on-device first. iPhone gallery photos are often HEIC and/or
      // larger than the serverless request body limit, which otherwise looks like a generic failure.
      const prepared = await prepareProfileImage(file)
      const fd = new FormData()
      fd.append('file', prepared)
      const res = await fetchWithCSRF('/api/settings/profile/picture', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        const message =
          typeof j.error === 'string' && j.error
            ? j.error
            : res.status === 413
              ? 'Photo is too large to upload. Try a smaller image.'
              : 'Upload failed. Please try again.'
        throw new Error(message)
      }
      const data = await res.json()
      setAfterRevealPreview(typeof data.preview_signed_url === 'string' ? data.preview_signed_url : null)
      setSuccess('Profile picture saved securely')
      showSuccessToast('Photo uploaded', 'Your profile picture was saved securely.')
      router.refresh()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed. Please try again.'
      setError(message)
      showErrorToast('Upload failed', message)
    } finally {
      setUploading(false)
    }
  }

  const hasProfilePicture =
    Boolean(afterRevealPreview) || Boolean(profile?.profile_picture_url?.trim())

  const handleRemovePicture = async () => {
    setRemovingPicture(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF('/api/settings/profile/picture', {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to remove profile picture')
      }
      setAfterRevealPreview(null)
      setSuccess('Profile picture removed')
      showSuccessToast('Photo removed')
      router.refresh()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to remove profile picture'
      setError(message)
      showErrorToast('Could not remove photo', message)
    } finally {
      setRemovingPicture(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Match identity & photo
        </h3>
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Matches see a neutral programmatic avatar until you both opt in to share more. Your profile picture lives in a private bucket and is only shown after mutual consent.
        </p>
      </header>

      <div className="space-y-8">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">How your match sees you initially</p>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-white shadow-md dark:border-zinc-700">
                <AvatarImage src={matchSeesUrl} alt="" />
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Programmatic avatar — consistent and anonymous until you both choose to reveal profile details.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">After mutual reveal</p>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-white shadow-md dark:border-zinc-700">
                {afterRevealPreview ? (
                  <AvatarImage src={afterRevealPreview} alt="" />
                ) : (
                  <AvatarFallback className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <ImageIcon className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Upload a photo below. In each chat, open the ⋯ menu → Photo sharing preferences when you are ready (both of you must opt in).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Choose your avatar</Label>
          {!PRESET_SEEDS.includes(selectedSeed) && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Your saved avatar uses a legacy seed. Pick any option below to update it.
            </p>
          )}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {PRESET_SEEDS.map((seed) => {
              const active = seed === selectedSeed
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setSelectedSeed(seed)}
                  className={`relative overflow-hidden rounded-xl border-2 p-0 transition-all ${
                    active
                      ? 'border-violet-500 ring-2 ring-violet-400/40'
                      : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                  aria-pressed={active}
                  aria-label={`Avatar option ${seed}`}
                >
                  <img
                    src={programmaticAvatarUrl(seed)}
                    alt=""
                    className="aspect-square w-full bg-zinc-100 object-contain dark:bg-zinc-800"
                    loading="lazy"
                  />
                </button>
              )
            })}
          </div>
          <Button
            type="button"
            onClick={() => void handleSaveAvatar()}
            disabled={savingAvatar}
            className="rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
          >
            {savingAvatar ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save avatar'
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="profile-photo" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Profile picture
            </Label>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Stored privately and only shown after mutual consent.
            </p>
          </div>
          <input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
            className="block w-full max-w-md text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-600 dark:text-zinc-300"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              void handleUpload(f)
              e.target.value = ''
            }}
          />
          {uploading && (
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing and uploading…
            </p>
          )}
          {hasProfilePicture && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRemovePicture()}
              disabled={uploading || removingPicture}
              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              {removingPicture ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove profile picture
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
