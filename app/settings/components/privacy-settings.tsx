'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Check
} from 'lucide-react'

interface PrivacySettingsProps {
  user: any
}

export function PrivacySettings({ user }: PrivacySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showInMatches: true,
    allowMessages: true,
    dataSharing: false
  })

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePrivacy = async () => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      // In a real app, this would save to a user preferences table
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadData = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would generate and download a data export
      alert('Data export functionality would be implemented here')
    } catch (err) {
      setError('Failed to download data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      // In a real app, this would delete the user account
      alert('Account deletion functionality would be implemented here')
    } catch (err) {
      setError('Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Privacy settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Control who can see your profile and contact you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Make Profile Visible</Label>
                <p className="text-sm text-gray-500">Allow other users to see your profile in search results</p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show in Matches</Label>
                <p className="text-sm text-gray-500">Include your profile in roommate matching algorithm</p>
              </div>
              <Switch
                checked={privacySettings.showInMatches}
                onCheckedChange={(checked) => handlePrivacyChange('showInMatches', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Messages</Label>
                <p className="text-sm text-gray-500">Let other users send you messages</p>
              </div>
              <Switch
                checked={privacySettings.allowMessages}
                onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-sm text-gray-500">Allow anonymized data to be used for research and improvements</p>
              </div>
              <Switch
                checked={privacySettings.dataSharing}
                onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSavePrivacy}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Download your data or manage your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Download Your Data</h4>
              <p className="text-sm text-gray-500">Get a copy of all your data in a portable format</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadData}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account, 
              profile, questionnaire responses, matches, and all other data.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Are you absolutely sure? Type "DELETE" to confirm.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Yes, Delete My Account
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
