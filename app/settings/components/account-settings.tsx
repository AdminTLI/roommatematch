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
    <div className="space-y-10">
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

      {/* Profile visibility - show when profile exists */}
      {profile != null && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Profile visibility</h3>
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 sm:w-1/3">
                {isProfileHidden ? (
                  <EyeOff className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                )}
                <Label className="text-zinc-900 dark:text-zinc-100 font-medium">
                  Search &amp; matches
                </Label>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
                    className="shrink-0 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  >
                    {visibilityLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1.5" />
                        Make visible again
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Group - Always visible */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Verification</h3>
        <EmailVerification user={user} />
      </div>

      {/* Security Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Security</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl">
          {/* Email Address — read-only; changes via support only */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3 sm:w-1/3">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <Label className="text-zinc-600 dark:text-zinc-400 font-medium">Email Address</Label>
            </div>
            <div className="flex-1 px-0 sm:px-3 space-y-2">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 break-all">{user.email}</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your sign-in email cannot be changed in the app. To update it for safety or account reasons,{' '}
                <a
                  href="mailto:domumatch@gmail.com?subject=Request%20to%20change%20account%20email"
                  className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  contact us by email
                </a>
                .
              </p>
            </div>
          </div>

          {/* Password */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:w-1/3">
              <Key className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <Label className="text-zinc-900 dark:text-zinc-100 font-medium">Password</Label>
            </div>
            <div className="flex-1 flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 px-0 sm:px-3 tracking-widest">••••••••</span>
              <Button
                variant="ghost"
                onClick={handleChangePassword}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-zinc-100 dark:hover:bg-white/5 h-8 px-3 text-xs font-medium"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Email Notifications</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 px-4 backdrop-blur-xl">
          {[
            { id: 'emailMatches', label: 'New Matches', desc: 'Get notified when you have new compatible matches' },
            { id: 'emailMessages', label: 'New Messages', desc: 'Get notified when you receive new messages' },
            { id: 'emailUpdates', label: 'Platform Updates', desc: 'Get notified about new features and updates' },
          ].map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-zinc-900 dark:text-zinc-100 block mb-0.5 font-medium">{item.label}</Label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.id as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(item.id, checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Push Notifications</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 px-4 backdrop-blur-xl">
          {[
            { id: 'pushMatches', label: 'New Matches', desc: 'Receive push notifications for new matches' },
            { id: 'pushMessages', label: 'New Messages', desc: 'Receive push notifications for new messages' },
          ].map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-zinc-900 dark:text-zinc-100 block mb-0.5 font-medium">{item.label}</Label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.id as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(item.id, checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSaveNotifications}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[160px] h-11 text-base bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>

      {/* Danger Zone Group */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-medium text-red-600 dark:text-red-500 uppercase tracking-wider px-1">Danger Zone</h3>
        <div className="bg-red-50/80 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl overflow-hidden p-6 space-y-6 backdrop-blur-xl">
          {deletionScheduled && (
            <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Deletion scheduled:</strong> Your account is scheduled for deletion on{' '}
                {new Date(deletionScheduled).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Delete Account</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Permanently delete your profile and all data. You will be asked to confirm and can choose to hide your profile instead.
              </p>
            </div>
          </div>

          <Link href="/settings/delete-account">
            <Button
              variant="destructive"
              disabled={!!deletionScheduled}
              className="w-full sm:w-auto min-w-[160px] h-11 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deletionScheduled ? 'Deletion Scheduled' : 'Delete My Account'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
