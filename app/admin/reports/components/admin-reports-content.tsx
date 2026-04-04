'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, CheckCircle, XCircle, Ban, MessageSquare, Eye, RefreshCw } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { CHAT_REPORT_CATEGORY_LABELS, type ChatReportCategory } from '@/lib/chat/report-categories'

interface ChatContextMessage {
  id: string
  user_id: string
  content: string
  created_at: string
  is_reporter?: boolean
}

interface Report {
  id: string
  reporter_id: string
  target_user_id: string
  message_id?: string
  category: ChatReportCategory | string
  reason: string
  details?: string
  attachments?: any[]
  status: 'open' | 'actioned' | 'dismissed'
  auto_blocked: boolean
  admin_id?: string
  action_taken?: string
  consent_read_recent_messages?: boolean
  consent_read_recent_messages_at?: string | null
  chat_context_snapshot?: ChatContextMessage[] | null
  created_at: string
  updated_at: string
  warning_notification?: {
    id: string
    acknowledged_checkbox?: boolean
    acknowledged_continue?: boolean
    acknowledged_at?: string | null
  } | null
  reporter?: {
    user_id: string
    first_name: string
    last_name: string
    email: string
  }
  target?: {
    user_id: string
    first_name: string
    last_name: string
    email: string
  }
  message?: {
    id: string
    content: string
    created_at: string
  }
}

interface FlaggedMessage {
  id: string
  content: string
  created_at: string
  is_flagged: boolean
  auto_flagged: boolean
  flagged_reason: string[]
  flagged_at: string | null
  user_id: string
  chat_id: string
  profiles?: {
    user_id: string
    first_name: string
    last_name: string
    email: string
  }
  chats?: {
    id: string
    is_group: boolean
  }
}

export function AdminReportsContent() {
  const [activeTab, setActiveTab] = useState<'reports' | 'flagged'>('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFlagged, setIsLoadingFlagged] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'dismiss' | 'warn' | 'ban'>('dismiss')
  const [actionMessage, setActionMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  })
  const [total, setTotal] = useState(0)
  const [flaggedTotal, setFlaggedTotal] = useState(0)

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports()
    } else {
      loadFlaggedMessages()
    }
  }, [filters, activeTab])

  const loadFlaggedMessages = async () => {
    setIsLoadingFlagged(true)
    try {
      const response = await fetch('/api/admin/messages/flagged?limit=100')
      if (response.ok) {
        const data = await response.json()
        setFlaggedMessages(data.messages || [])
        setFlaggedTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load flagged messages:', error)
      showErrorToast('Failed to load flagged messages')
    } finally {
      setIsLoadingFlagged(false)
    }
  }

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      params.append('limit', '100')

      const response = await fetch(`/api/admin/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
      showErrorToast('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (reportId: string, status: string) => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          status
        })
      })

      if (response.ok) {
        showSuccessToast('Report status updated')
        loadReports()
      } else {
        showErrorToast('Failed to update report status')
      }
    } catch (error) {
      console.error('Failed to update report:', error)
      showErrorToast('Failed to update report status')
    }
  }

  const handleAction = async () => {
    if (!selectedReport) return

    setIsProcessing(true)
    try {
      if (actionType === 'dismiss') {
        await handleStatusUpdate(selectedReport.id, 'dismissed')
        setShowActionDialog(false)
        setSelectedReport(null)
        return
      }

      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reportId: selectedReport.id,
          userId: selectedReport.target_user_id,
          message: actionMessage
        })
      })

      if (response.ok) {
        showSuccessToast(`User ${actionType === 'warn' ? 'warned' : 'banned'} successfully`)
        setShowActionDialog(false)
        setSelectedReport(null)
        setActionMessage('')
        loadReports()
      } else {
        showErrorToast(`Failed to ${actionType} user`)
      }
    } catch (error) {
      console.error('Failed to process action:', error)
      showErrorToast('Failed to process action')
    } finally {
      setIsProcessing(false)
    }
  }

  const columns = [
    {
      header: 'Reporter',
      accessor: (row: Report) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.reporter 
              ? `${row.reporter.first_name} ${row.reporter.last_name || ''}`.trim() || row.reporter.email
              : 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">{row.reporter?.email}</span>
        </div>
      )
    },
    {
      header: 'Target',
      accessor: (row: Report) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.target 
              ? `${row.target.first_name} ${row.target.last_name || ''}`.trim() || row.target.email
              : 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">{row.target?.email}</span>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (row: Report) => {
        const colors: Record<string, string> = {
          spam: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
          harassment: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
          inappropriate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
          swearing: 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200',
          account_misuse: 'bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200',
          impersonation: 'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/40 dark:text-fuchsia-200',
          threats: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
          scam_or_fraud: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
          hate_or_discrimination: 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200',
          other: 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200'
        }
        const label =
          CHAT_REPORT_CATEGORY_LABELS[row.category as ChatReportCategory] || row.category
        return (
          <Badge className={colors[row.category] || colors.other}>
            {label}
          </Badge>
        )
      }
    },
    {
      header: 'Recent msgs consent',
      accessor: (row: Report) => {
        if (!row.consent_read_recent_messages) {
          return <span className="text-xs text-gray-400">No</span>
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-green-700 dark:text-green-400">Yes</span>
            {row.consent_read_recent_messages_at && (
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(row.consent_read_recent_messages_at).toLocaleString()}
              </span>
            )}
          </div>
        )
      }
    },
    {
      header: 'Reason',
      accessor: (row: Report) => (
        <span className="text-sm max-w-xs truncate">{row.reason}</span>
      )
    },
    {
      header: 'Status',
      accessor: (row: Report) => {
        const colors: Record<string, string> = {
          open: 'bg-blue-100 text-blue-800',
          actioned: 'bg-green-100 text-green-800',
          dismissed: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={colors[row.status] || colors.open}>
            {row.status}
          </Badge>
        )
      }
    },
    {
      header: 'Warning Acknowledgement',
      accessor: (row: Report) => {
        if (!row.warning_notification) {
          return (
            <span className="text-xs text-gray-400">
              No warning acknowledgement
            </span>
          )
        }

        const checkbox = row.warning_notification.acknowledged_checkbox
        const cont = row.warning_notification.acknowledged_continue

        return (
          <div className="flex flex-col text-xs">
            <span>
              Checkbox:{' '}
              <span className={checkbox ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {checkbox ? 'Yes' : 'No'}
              </span>
            </span>
            <span>
              Continue:{' '}
              <span className={cont ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {cont ? 'Yes' : 'No'}
              </span>
            </span>
          </div>
        )
      }
    },
    {
      header: 'Auto-blocked',
      accessor: (row: Report) => row.auto_blocked ? (
        <Badge variant="destructive">Yes</Badge>
      ) : (
        <span className="text-gray-400">No</span>
      )
    },
    {
      header: 'Created',
      accessor: (row: Report) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: (row: Report) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedReport(row)
              setShowActionDialog(true)
              setActionType('dismiss')
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {row.status === 'open' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReport(row)
                  setShowActionDialog(true)
                  setActionType('warn')
                }}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warn
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedReport(row)
                  setShowActionDialog(true)
                  setActionType('ban')
                }}
              >
                <Ban className="h-3 w-3 mr-1" />
                Ban
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  const handleFlaggedMessageAction = async (messageId: string, action: 'approve' | 'delete') => {
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/admin/messages/flagged', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action })
      })

      if (response.ok) {
        showSuccessToast(`Message ${action === 'approve' ? 'approved' : 'deleted'} successfully`)
        loadFlaggedMessages()
      } else {
        showErrorToast(`Failed to ${action} message`)
      }
    } catch (error) {
      console.error('Failed to process flagged message action:', error)
      showErrorToast(`Failed to ${action} message`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Safety & Moderation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review reports and flagged content
          </p>
        </div>
        <Button 
          onClick={() => activeTab === 'reports' ? loadReports() : loadFlaggedMessages()} 
          variant="outline" 
          disabled={isLoading || isLoadingFlagged}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isLoadingFlagged) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Reports ({total})
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'flagged'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Flagged Messages ({flaggedTotal})
          </button>
        </div>
      </div>

      {activeTab === 'reports' ? (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="actioned">Actioned</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="swearing">Swearing</SelectItem>
                      <SelectItem value="account_misuse">Account misuse</SelectItem>
                      <SelectItem value="impersonation">Impersonation</SelectItem>
                      <SelectItem value="threats">Threats</SelectItem>
                      <SelectItem value="scam_or_fraud">Scam / fraud</SelectItem>
                      <SelectItem value="hate_or_discrimination">Hate / discrimination</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>All abuse reports submitted by users</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Reports Found</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filters.status !== 'all' || filters.category !== 'all'
                      ? 'No reports match your current filters. Try adjusting your filters.'
                      : 'There are currently no reports in the system. Reports will appear here when users submit them.'}
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={reports}
                  searchKey="id"
                  searchPlaceholder="Search by report ID..."
                  pageSize={20}
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Flagged Messages */
        <Card>
          <CardHeader>
            <CardTitle>Flagged Messages</CardTitle>
            <CardDescription>Messages automatically flagged by the system for review</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFlagged ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Loading flagged messages...</p>
              </div>
            ) : flaggedMessages.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Flagged Messages</p>
                <p className="text-gray-500 dark:text-gray-400">
                  There are currently no flagged messages. Messages will appear here when the system detects suspicious content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedMessages.map((message) => (
                  <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {message.profiles 
                              ? `${message.profiles.first_name} ${message.profiles.last_name || ''}`.trim() || message.profiles.email
                              : 'Unknown User'}
                          </span>
                          <Badge variant={message.auto_flagged ? 'default' : 'secondary'}>
                            {message.auto_flagged ? 'Auto-flagged' : 'Manually flagged'}
                          </Badge>
                          {message.flagged_reason && message.flagged_reason.length > 0 && (
                            <Badge className="bg-orange-100 text-orange-800">
                              {message.flagged_reason.join(', ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlaggedMessageAction(message.id, 'approve')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFlaggedMessageAction(message.id, 'delete')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'dismiss' && 'Dismiss Report'}
              {actionType === 'warn' && 'Warn User'}
              {actionType === 'ban' && 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <div className="space-y-4 mt-4">
                  <div>
                    <strong>Report Details:</strong>
                    <div className="mt-2 space-y-3 rounded-xl border border-white/40 bg-white/60 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60">
                      <p>
                        <strong>Category:</strong>{' '}
                        {CHAT_REPORT_CATEGORY_LABELS[selectedReport.category as ChatReportCategory] ||
                          selectedReport.category}
                      </p>
                      <p><strong>Reason:</strong> {selectedReport.reason}</p>
                      {selectedReport.details && (
                        <p><strong>Details:</strong> {selectedReport.details}</p>
                      )}
                      <div className="rounded-lg border border-white/30 bg-white/50 p-2 dark:border-white/10 dark:bg-zinc-950/50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Consent to read recent messages
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Recorded:{' '}
                          {selectedReport.consent_read_recent_messages ? (
                            <>
                              <span className="font-medium text-green-700 dark:text-green-400">Yes</span>
                              {selectedReport.consent_read_recent_messages_at && (
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(selectedReport.consent_read_recent_messages_at).toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-amber-800 dark:text-amber-200">No (legacy report)</span>
                          )}
                        </p>
                      </div>
                      {selectedReport.chat_context_snapshot &&
                        selectedReport.chat_context_snapshot.length > 0 && (
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">
                              Last messages in chat (up to 10, with consent)
                            </strong>
                            <div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-white/30 bg-white/40 p-2 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/40">
                              {selectedReport.chat_context_snapshot.map((m) => (
                                <div
                                  key={m.id}
                                  className="rounded-md border border-gray-200/80 bg-white/70 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900/70"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                      {m.is_reporter ? 'Reporter' : 'Participant'} ·{' '}
                                      {m.user_id.slice(0, 8)}…
                                    </span>
                                    <span>{new Date(m.created_at).toLocaleString()}</span>
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
                                    {m.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {selectedReport.message && (
                        <div className="mt-2">
                          <strong>Flagged message (legacy):</strong>
                          <div className="mt-1 rounded border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-950">
                            <p className="text-sm">{selectedReport.message.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(selectedReport.message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>Target User:</strong> {selectedReport.target 
                      ? `${selectedReport.target.first_name} ${selectedReport.target.last_name || ''}`.trim() || selectedReport.target.email
                      : 'Unknown'}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType !== 'dismiss' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Message to User</label>
                <Textarea
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  placeholder={actionType === 'warn' 
                    ? 'Enter warning message...'
                    : 'Enter ban reason...'}
                  rows={4}
                />
              </div>
            )}
            {actionType === 'dismiss' && (
              <p className="text-sm text-gray-600">
                This will mark the report as dismissed without taking any action against the user.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'ban' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={isProcessing || (actionType !== 'dismiss' && !actionMessage.trim())}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  {actionType === 'dismiss' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {actionType === 'warn' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  {actionType === 'ban' && <Ban className="h-4 w-4 mr-2" />}
                  {actionType === 'dismiss' && 'Dismiss'}
                  {actionType === 'warn' && 'Send Warning'}
                  {actionType === 'ban' && 'Ban User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
