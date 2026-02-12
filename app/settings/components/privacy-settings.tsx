'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Clock,
  FileText,
  ChevronRight
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
  const [exportLoading, setExportLoading] = useState(false)
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
    <div className="space-y-10">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Privacy settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Privacy Controls Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Privacy Controls</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 px-4 backdrop-blur-xl">
          {[
            { id: 'profileVisible', label: 'Make Profile Visible', desc: 'Allow other users to see your profile in search results' },
            { id: 'showInMatches', label: 'Show in Matches', desc: 'Include your profile in roommate matching algorithm' },
            { id: 'allowMessages', label: 'Allow Messages', desc: 'Let other users send you messages' },
            { id: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymized data to be used for research' },
          ].map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-zinc-900 dark:text-zinc-100 block mb-0.5 font-medium">{item.label}</Label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{item.desc}</p>
              </div>
              <Switch
                checked={privacySettings[item.id as keyof typeof privacySettings]}
                onCheckedChange={(checked) => handlePrivacyChange(item.id, checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSavePrivacy}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[140px] h-11 text-base bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
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

      {/* Data Management Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Data Management</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden p-6 space-y-6 backdrop-blur-xl">
          {getPendingExportRequest() && (
            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Export in progress:</strong> Your data export request is being processed.
                Estimated completion: {getDaysUntilDeadline(getPendingExportRequest()!.sla_deadline)} days.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-white/5">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Download Your Data</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                Get a copy of all your data in a portable JSON format (GDPR Article 15 - Right of Access).
                You can request one export per 24 hours.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadData}
              disabled={exportLoading || isLoading || !!getPendingExportRequest()}
              className="w-full sm:w-auto min-w-[160px] h-11 text-sm border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-xl"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone Group */}
      <div className="space-y-4">
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
