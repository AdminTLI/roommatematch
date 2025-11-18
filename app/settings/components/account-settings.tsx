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
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 mb-2">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Email Verification Section - Always visible */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Email Verification</h3>
        <EmailVerification user={user} />
      </div>

      {/* Security Settings */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Shield className="w-5 h-5 text-gray-600" />
            Security
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Email Address</Label>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input value={user.email} disabled className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" />
            </div>
            <p className="text-sm text-gray-500 ml-8">
              Contact support to change your email address.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <Label className="text-sm font-medium">Password</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Key className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <Input type="password" value="••••••••" disabled className="bg-gray-50 dark:bg-bg-surface-alt h-11 flex-1 text-text-primary dark:text-text-primary" />
              </div>
              <Button variant="outline" onClick={handleChangePassword} className="w-full sm:w-auto min-w-[120px] h-11 text-base">
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Bell className="w-5 h-5 text-gray-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Choose how you want to be notified about matches and messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="space-y-6">
            <div className="space-y-4 pt-2">
              <h4 className="font-semibold text-base text-gray-900">Email Notifications</h4>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="space-y-1 flex-1 pr-4">
                  <Label className="text-sm font-medium">New Matches</Label>
                  <p className="text-sm text-gray-600">Get notified when you have new compatible matches</p>
                </div>
                <Switch
                  checked={notifications.emailMatches}
                  onCheckedChange={(checked) => handleNotificationChange('emailMatches', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="space-y-1 flex-1 pr-4">
                  <Label className="text-sm font-medium">New Messages</Label>
                  <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                </div>
                <Switch
                  checked={notifications.emailMessages}
                  onCheckedChange={(checked) => handleNotificationChange('emailMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-1 flex-1 pr-4">
                  <Label className="text-sm font-medium">Platform Updates</Label>
                  <p className="text-sm text-gray-600">Get notified about new features and updates</p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-base text-gray-900">Push Notifications</h4>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="space-y-1 flex-1 pr-4">
                  <Label className="text-sm font-medium">New Matches</Label>
                  <p className="text-sm text-gray-600">Receive push notifications for new matches</p>
                </div>
                <Switch
                  checked={notifications.pushMatches}
                  onCheckedChange={(checked) => handleNotificationChange('pushMatches', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-1 flex-1 pr-4">
                  <Label className="text-sm font-medium">New Messages</Label>
                  <p className="text-sm text-gray-600">Receive push notifications for new messages</p>
                </div>
                <Switch
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) => handleNotificationChange('pushMessages', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button 
              onClick={handleSaveNotifications}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[160px] h-11 text-base"
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
        </CardContent>
      </Card>
    </div>
  )
}
