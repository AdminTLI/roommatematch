'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, ImageIcon, Sparkles } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

const PRESET_SEEDS = [
  'river',
  'nova',
  'mesa',
  'iris',
  'orbit',
  'pixel',
  'ember',
  'mist',
  'cedar',
  'lotus',
  'falcon',
  'harbor',
  'maple',
  'solstice',
  'quartz',
  'willow',
] as const

interface AvatarAndPhotoSettingsProps {
  profile: { avatar_id?: string | null; profile_picture_url?: string | null }
}

export function AvatarAndPhotoSettings({ profile }: AvatarAndPhotoSettingsProps) {
  const initial = (profile?.avatar_id && String(profile.avatar_id).trim()) || PRESET_SEEDS[0]
  const [selectedSeed, setSelectedSeed] = useState<string>(initial)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [afterRevealPreview, setAfterRevealPreview] = useState<string | null>(null)

  const matchSeesUrl = programmaticAvatarUrl(selectedSeed)

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
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
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
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetchWithCSRF('/api/settings/profile/picture', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Upload failed')
      }
      const data = await res.json()
      setAfterRevealPreview(typeof data.preview_signed_url === 'string' ? data.preview_signed_url : null)
      setSuccess('Profile picture saved securely')
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border-zinc-200 dark:border-white/10 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Match identity & photo
        </CardTitle>
        <CardDescription>
          Matches see a neutral programmatic avatar until you both opt in to share more. Your profile picture lives in a private bucket and is only shown after mutual consent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">How your match sees you initially</p>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-white shadow-md dark:border-zinc-700">
                <AvatarImage src={matchSeesUrl} alt="" />
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Programmatic avatar - consistent and anonymous until you both choose to reveal profile details.
              </p>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">After mutual reveal (profile picture)</p>
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
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Upload a photo below. It is only shown to a match when you both enable profile details and profile picture sharing in chat.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Choose your avatar seed</Label>
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
                    className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800"
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
            className="rounded-xl bg-violet-600 text-white hover:bg-violet-700"
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
          <Label htmlFor="profile-photo" className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Profile picture (private storage)
          </Label>
          <input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full max-w-md text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-700 dark:text-zinc-300"
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
              Uploading…
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
