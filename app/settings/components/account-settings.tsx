'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Key,
  Mail,
  Loader2,
  Check,
  AlertCircle,
  EyeOff,
  Eye,
  AlertTriangle,
  Trash2,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { EmailVerification } from './email-verification'
import { getCSRFHeaders } from '@/lib/utils/csrf-client'
import Link from 'next/link'
import {
  SettingsSection,
  settingsCaptionClass,
  settingsEditableLabelClass,
  settingsFieldLabelClass,
  settingsFieldValueClass,
  settingsToggleDescClass,
  settingsToggleLabelClass,
} from '@/components/settings/settings-section'

const DEFAULT_NOTIFICATIONS = {
  emailMatches: true,
  emailMessages: true,
  emailUpdates: true,
  pushMatches: true,
  pushMessages: true,
}

interface AccountSettingsProps {
  user: any
  profile?: { is_visible?: boolean; notification_preferences?: Record<string, boolean> } | null
  onVisibilityChange?: () => void
}

interface DSARRequest {
  request_type: string
  status: string
  processing_metadata?: {
    deletion_scheduled_at?: string
  }
}

export function AccountSettings({ user, profile, onVisibilityChange }: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const isProfileHidden = profile?.is_visible === false

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null)

  // Sync from profile when loaded or after save (router.refresh)
  useEffect(() => {
    const prefs = profile?.notification_preferences
    if (typeof prefs === 'object' && prefs !== null) {
      setNotifications(prev => ({
        ...DEFAULT_NOTIFICATIONS,
        ...prev,
        ...prefs,
      }))
    }
  }, [profile?.notification_preferences])

  const handleMakeVisible = async () => {
    setVisibilityLoading(true)
    try {
      const headers = await getCSRFHeaders()
      const res = await fetch('/api/settings/hide-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ hidden: false }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Failed to make profile visible')
      }
      onVisibilityChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make profile visible')
    } finally {
      setVisibilityLoading(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const router = useRouter()

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const headers = await getCSRFHeaders()
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify(notifications),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Failed to save')
      }
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
      onVisibilityChange?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchDeletionStatus = async () => {
      try {
        const response = await fetch('/api/privacy/requests')
        if (!response.ok) return

        const data = await response.json()
        const deletionRequest = data.requests?.find(
          (r: DSARRequest) => r.request_type === 'deletion' && r.status === 'completed'
        )

        if (deletionRequest) {
          setDeletionScheduled(deletionRequest.processing_metadata?.deletion_scheduled_at || null)
        }
      } catch {
        // Non-critical, so ignore errors
      }
    }

    fetchDeletionStatus()
  }, [])

  const handleChangePassword = () => {
    // In a real app, this would open a password change modal or redirect
    alert('Password change functionality would be implemented here')
  }

  return (
    <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.06]">
      {(error || isSuccess) && (
        <div className="space-y-3 py-6">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              <AlertDescription>
                Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {profile != null && (
        <SettingsSection
          title="Profile visibility"
          description="Control whether you appear in search and match notifications."
        >
          <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              {isProfileHidden ? (
                <EyeOff className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              ) : (
                <Eye className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              )}
              <Label className={settingsToggleLabelClass}>
                Search &amp; matches
              </Label>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <p className={settingsCaptionClass}>
                {isProfileHidden
                  ? 'Your profile is hidden. You won\'t appear in search or receive match notifications.'
                  : 'Your profile is visible. You appear in search and can receive match notifications.'}
              </p>
              {isProfileHidden && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMakeVisible}
                  disabled={visibilityLoading}
                  className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-500/10"
                >
                  {visibilityLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Eye className="mr-1.5 h-4 w-4" />
                      Make visible again
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </SettingsSection>
      )}

      <SettingsSection
        title="Verification"
        description="Confirm your email and identity to unlock the full platform."
      >
        <EmailVerification user={user} />
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Manage how you sign in to Domu."
      >
        <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
          <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0 sm:pt-0.5">
              <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsFieldLabelClass}>Email address</Label>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className={`${settingsFieldValueClass} break-all`}>{user.email}</div>
              <p className={settingsCaptionClass}>
                Your sign-in email cannot be changed in the app. To update it for safety or account reasons,{' '}
                <a
                  href="mailto:domumatch@gmail.com?subject=Request%20to%20change%20account%20email"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  contact us by email
                </a>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              <Key className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsEditableLabelClass}>Password</Label>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4">
              <span className={`${settingsFieldValueClass} tracking-widest`}>••••••••</span>
              <Button
                variant="ghost"
                onClick={handleChangePassword}
                className="h-8 px-3 text-sm font-medium text-indigo-600 hover:bg-zinc-100 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-white/5 dark:hover:text-indigo-300"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Email notifications"
        description="Choose which emails Domu can send you."
      >
        <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
          {[
            { id: 'emailMatches', label: 'New matches', desc: 'Get notified when you have new compatible matches' },
            { id: 'emailMessages', label: 'New messages', desc: 'Get notified when you receive new messages' },
            { id: 'emailUpdates', label: 'Platform updates', desc: 'Get notified about new features and updates' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1 space-y-0.5">
                <Label className={settingsToggleLabelClass}>{item.label}</Label>
                <p className={settingsToggleDescClass}>{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.id as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(item.id, checked)}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Push notifications"
        description="Alerts delivered to your device when you allow them."
      >
        <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
          {[
            { id: 'pushMatches', label: 'New matches', desc: 'Receive push notifications for new matches' },
            { id: 'pushMessages', label: 'New messages', desc: 'Receive push notifications for new messages' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1 space-y-0.5">
                <Label className={settingsToggleLabelClass}>{item.label}</Label>
                <p className={settingsToggleDescClass}>{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.id as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(item.id, checked)}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveNotifications}
            disabled={isLoading}
            className="h-11 w-full min-w-[160px] rounded-xl bg-indigo-500 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save preferences'
            )}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Domu Lab"
        description="Help us build Domu — share what is missing and upvote ideas from other students."
      >
        <Link
          href="/forum"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Open Domu Lab
        </Link>
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="Irreversible account actions."
        tone="danger"
      >
        <div className="space-y-5 rounded-2xl border border-red-200 bg-red-50/80 p-5 dark:border-red-500/20 dark:bg-red-500/5">
          {deletionScheduled && (
            <Alert className="border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Deletion scheduled:</strong> Your account is scheduled for deletion on{' '}
                {new Date(deletionScheduled).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Delete account</h4>
              <p className={settingsCaptionClass}>
                Permanently delete your profile and all data. You will be asked to confirm and can choose to hide your profile instead.
              </p>
            </div>
          </div>

          <Link href="/settings/delete-account">
            <Button
              variant="destructive"
              disabled={!!deletionScheduled}
              className="h-11 w-full min-w-[160px] rounded-xl bg-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletionScheduled ? 'Deletion scheduled' : 'Delete my account'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SettingsSection>
    </div>
  )
}
