'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

const DEFAULT_PRIVACY = {
  profileVisible: true,
  showInMatches: true,
  allowMessages: true,
  dataSharing: true,
}

interface PrivacySettingsProps {
  user: any
  profile?: { is_visible?: boolean; privacy_settings?: Record<string, boolean> } | null
}

interface DSARRequest {
  id: string
  request_type: string
  status: string
  requested_at: string
  sla_deadline: string
  completed_at?: string
}

export function PrivacySettings({ user, profile }: PrivacySettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<DSARRequest[]>([])
  const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null)

  const [privacySettings, setPrivacySettings] = useState(DEFAULT_PRIVACY)

  // Sync from profile when loaded or after save (router.refresh)
  useEffect(() => {
    if (profile == null) return
    const ps = profile.privacy_settings
    const visible = profile.is_visible !== false
    setPrivacySettings(prev => ({
      ...DEFAULT_PRIVACY,
      ...prev,
      ...(typeof ps === 'object' && ps !== null ? ps : {}),
      profileVisible: visible,
    }))
  }, [profile?.is_visible, profile?.privacy_settings])

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePrivacy = async () => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const { getCSRFHeaders } = await import('@/lib/utils/csrf-client')
      const headers = await getCSRFHeaders()
      const res = await fetch('/api/settings/privacy', {
        method: 'POST',
        headers,
        body: JSON.stringify(privacySettings),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Failed to save')
      }
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save privacy settings')
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

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'GET',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 429) {
          setError(
            data.message ||
            'You can only generate a few PDFs per hour. Please try again later.'
          )
          return
        }
        throw new Error(data.error || data.details || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `domu-match-profile-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setPdfLoading(false)
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
            <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 pr-0 sm:pr-2">
                <Label className="mb-0.5 block font-medium text-zinc-900 dark:text-zinc-100">{item.label}</Label>
                <p className="text-pretty text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 break-words">
                  {item.desc}
                </p>
              </div>
              <Switch
                checked={privacySettings[item.id as keyof typeof privacySettings]}
                onCheckedChange={(checked) => handlePrivacyChange(item.id, checked)}
                className="shrink-0 self-start data-[state=checked]:bg-blue-500 sm:self-center"
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

          <div className="flex flex-col gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-white/5">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Download Your Data</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                Get a copy of all your data in a portable JSON format (GDPR Article 15 - Right of Access), or a human-readable PDF summary of your profile and compatibility report.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadData}
                disabled={exportLoading || isLoading || !!getPendingExportRequest()}
                className="w-full sm:w-auto min-w-[160px] h-11 text-sm border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-xl"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting JSON...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={pdfLoading || isLoading}
                className="w-full sm:w-auto min-w-[160px] h-11 text-sm border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-xl"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
