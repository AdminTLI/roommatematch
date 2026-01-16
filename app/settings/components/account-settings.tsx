'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Key,
  Bell,
  Mail,
  Shield,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import { EmailVerification } from './email-verification'

interface AccountSettingsProps {
  user: any
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    emailMatches: true,
    emailMessages: true,
    emailUpdates: false,
    pushMatches: true,
    pushMessages: false
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      // In a real app, this would save to a user preferences table
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

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

      {/* Email Verification Group - Always visible */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Verification</h3>
        <EmailVerification user={user} />
      </div>

      {/* Security Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Security</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl">
          {/* Email Address */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3 sm:w-1/3">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <Label className="text-zinc-600 dark:text-zinc-400 font-medium">Email Address</Label>
            </div>
            <div className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 px-0 sm:px-3">
              {user.email}
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-tighter font-semibold">Contact support to change</p>
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
    </div>
  )
}
