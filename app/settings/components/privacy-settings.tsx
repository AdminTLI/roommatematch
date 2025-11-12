'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Check,
  Clock,
  FileText
} from 'lucide-react'

interface PrivacySettingsProps {
  user: any
}

interface DSARRequest {
  id: string
  request_type: string
  status: string
  requested_at: string
  sla_deadline: string
  completed_at?: string
}

export function PrivacySettings({ user }: PrivacySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<DSARRequest[]>([])
  const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null)
  
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

  // Fetch pending DSAR requests on mount
  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/privacy/requests')
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
        
        // Check for scheduled deletion
        const deletionRequest = data.requests?.find((r: DSARRequest) => 
          r.request_type === 'deletion' && r.status === 'completed'
        )
        if (deletionRequest) {
          setDeletionScheduled(deletionRequest.processing_metadata?.deletion_scheduled_at || null)
        }
      }
    } catch (err) {
      // Silently fail - not critical
      console.error('Failed to fetch DSAR requests', err)
    }
  }

  const handleDownloadData = async () => {
    setExportLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'GET',
      })

      if (response.status === 429) {
        const data = await response.json()
        setError(data.message || 'You can only request one data export per 24 hours. Please try again later.')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to export data')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `domu-match-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 5000)
      
      // Refresh pending requests
      await fetchPendingRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download data')
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" exactly to confirm')
      return
    }

    setDeleteLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: deleteConfirmText,
          reason: 'User requested account deletion via settings'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to request account deletion')
      }

      const data = await response.json()
      setDeletionScheduled(data.deletion_scheduled_at)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
      
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 10000)
      
      // Refresh pending requests
      await fetchPendingRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getPendingExportRequest = () => {
    return pendingRequests.find(r => r.request_type === 'export' && ['pending', 'in_progress'].includes(r.status))
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 mb-2">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Privacy settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Privacy Controls */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Eye className="w-5 h-5 text-gray-600" />
            Privacy Controls
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Control who can see your profile and contact you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="space-y-1 flex-1 pr-4">
                <Label className="text-sm font-medium">Make Profile Visible</Label>
                <p className="text-sm text-gray-600">Allow other users to see your profile in search results</p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="space-y-1 flex-1 pr-4">
                <Label className="text-sm font-medium">Show in Matches</Label>
                <p className="text-sm text-gray-600">Include your profile in roommate matching algorithm</p>
              </div>
              <Switch
                checked={privacySettings.showInMatches}
                onCheckedChange={(checked) => handlePrivacyChange('showInMatches', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="space-y-1 flex-1 pr-4">
                <Label className="text-sm font-medium">Allow Messages</Label>
                <p className="text-sm text-gray-600">Let other users send you messages</p>
              </div>
              <Switch
                checked={privacySettings.allowMessages}
                onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="space-y-1 flex-1 pr-4">
                <Label className="text-sm font-medium">Data Sharing</Label>
                <p className="text-sm text-gray-600">Allow anonymized data to be used for research and improvements</p>
              </div>
              <Switch
                checked={privacySettings.dataSharing}
                onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button 
              onClick={handleSavePrivacy}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[140px] h-11 text-base"
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
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Download className="w-5 h-5 text-gray-600" />
            Data Management
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Download your data or manage your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {getPendingExportRequest() && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Export in progress:</strong> Your data export request is being processed. 
                Estimated completion: {getDaysUntilDeadline(getPendingExportRequest()!.sla_deadline)} days.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-1">
              <h4 className="font-semibold text-base mb-2">Download Your Data</h4>
              <p className="text-sm text-gray-600">
                Get a copy of all your data in a portable JSON format (GDPR Article 15 - Right of Access).
                You can request one export per 24 hours.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadData}
              disabled={exportLoading || isLoading || !!getPendingExportRequest()}
              className="w-full sm:w-auto min-w-[140px] h-11 text-base whitespace-nowrap"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-red-600">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {deletionScheduled && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Deletion scheduled:</strong> Your account is scheduled for deletion on{' '}
                {new Date(deletionScheduled).toLocaleDateString()}. 
                You can cancel this request by contacting support within 7 days.
                Verification documents will be retained for 4 weeks as required by Dutch law.
              </AlertDescription>
            </Alert>
          )}

          <Alert variant="destructive" className="py-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account, 
              profile, questionnaire responses, matches, and all other data after a 7-day grace period.
              Verification documents will be retained for 4 weeks as required by Dutch law.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !!deletionScheduled}
              className="w-full sm:w-auto min-w-[160px] h-11 text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deletionScheduled ? 'Deletion Already Scheduled' : 'Delete Account'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-confirm" className="text-base text-gray-700 font-medium mb-2 block">
                  Are you absolutely sure? Type "DELETE" to confirm.
                </Label>
                <Input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="max-w-md"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                  className="flex-1 sm:flex-initial min-w-[200px] h-11 text-base"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
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
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                    setError(null)
                  }}
                  disabled={deleteLoading}
                  className="flex-1 sm:flex-initial min-w-[120px] h-11 text-base"
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
