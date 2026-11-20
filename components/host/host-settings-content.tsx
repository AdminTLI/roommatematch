'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Home, Trash2 } from 'lucide-react'
import type { HostProfile } from '@/lib/host/types'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HostVerificationBanner } from '@/components/host/VerificationBanner'

type Tab = 'profile' | 'verification' | 'notifications' | 'account'

export function HostSettingsContent({
  host,
  userEmail,
  emailVerified,
  avatarUrl: initialAvatarUrl = null,
}: {
  host: HostProfile
  userEmail: string
  emailVerified: boolean
  avatarUrl?: string | null
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAgency = host.host_type === 'agency'
  const [tab, setTab] = useState<Tab>('profile')
  const [displayName, setDisplayName] = useState(host.display_name || '')
  const [companyName, setCompanyName] = useState(host.company_name || '')
  const [kvk, setKvk] = useState(host.kvk_number || '')
  const [license, setLicense] = useState(host.agency_license || '')
  const [phone, setPhone] = useState(host.phone || '')
  const [bio, setBio] = useState(host.bio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'verification', label: 'Verification' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account', label: 'Account' },
  ]

  const saveProfile = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetchWithCSRF('/api/host/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_type: host.host_type,
          display_name: displayName,
          company_name: companyName || null,
          kvk_number: kvk || null,
          agency_license: license || null,
          phone: phone || null,
          bio: bio || null,
          onboarding_completed: true,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(j.error || 'Failed to save')
      }
      if (j?.identity_review?.status === 'pending') {
        setMessage(
          j.identity_review.message ||
            'Saved. Your organisation name is pending Domu Match admin approval.'
        )
      } else {
        setMessage('Saved')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    setError(null)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetchWithCSRF('/api/host/avatar', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      setAvatarUrl(json.url || null)
      setMessage('Photo updated — students will see this on your listings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setUploadingAvatar(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetchWithCSRF('/api/host/avatar', { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Could not remove photo')
      setAvatarUrl(null)
      setMessage('Photo removed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Settings</h1>
        <p className="text-sm text-ink-500">
          {isAgency
            ? 'Manage agency profile, verification, and notifications.'
            : 'Manage your landlord profile, verification, and notifications.'}
        </p>
        {host.identity_review_status === 'pending' ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
            Organisation name claim pending review
            {host.identity_review_matched_org
              ? ` (${host.identity_review_matched_org})`
              : ''}
            . Students keep seeing your current display name until an admin approves.
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              tab === t.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white/60 text-ink-600 hover:bg-white dark:bg-zinc-900/50 dark:text-zinc-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="space-y-3">
            <Label>Profile photo</Label>
            <div className="flex flex-wrap items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800">
                  <Home className="h-8 w-8" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-ink-500">
                  A clear photo of you builds trust with students on the listing page.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {uploadingAvatar ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </Button>
                  {avatarUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => void removeAvatar()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) void uploadAvatar(file)
                  }}
                />
              </div>
            </div>
          </div>

          {isAgency ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kvk">KvK number</Label>
                <Input id="kvk" value={kvk} onChange={(e) => setKvk(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Agency license</Label>
                <Input id="license" value={license} onChange={(e) => setLicense(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Contact display name</Label>
                <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="display">Display name</Label>
                <Input id="display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kvk">KvK / registration</Label>
                <Input id="kvk" value={kvk} onChange={(e) => setKvk(e.target.value)} />
              </div>
            </>
          )}

          {isAgency && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      )}

      {tab === 'verification' && (
        <div className="space-y-4">
          <HostVerificationBanner
            emailVerified={emailVerified}
            verificationDeadlineAt={host.verification_deadline_at}
            createdAt={host.created_at}
          />
          <div className="rounded-3xl border border-white/60 bg-white/55 p-6 text-sm text-ink-600 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-300">
            <p>
              Signed in as <strong>{userEmail}</strong>.
            </p>
            <p className="mt-2">
              Email verification unlocks applications and viewing requests on your listings.
            </p>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="rounded-3xl border border-white/60 bg-white/55 p-6 text-sm text-ink-600 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-300">
          <p className="font-medium text-ink-900 dark:text-white">You currently receive alerts for:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>New applications</li>
            <li>Viewing requests</li>
            <li>Applicant chat messages (after Accept)</li>
            <li>Offer responses</li>
          </ul>
          <p className="mt-4 text-ink-500">
            Granular notification toggles can be added here later. For now these use your account
            notification preferences.
          </p>
        </div>
      )}

      {tab === 'account' && (
        <div className="rounded-3xl border border-white/60 bg-white/55 p-6 text-sm text-ink-600 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-300">
          <p>
            For password changes, data export, or account deletion, use the main account tools in{' '}
            <a href="/settings?tab=account" className="font-medium text-indigo-600 hover:underline">
              account settings
            </a>
            .
          </p>
        </div>
      )}
    </div>
  )
}
