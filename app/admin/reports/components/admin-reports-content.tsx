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
import { AlertTriangle, CheckCircle, XCircle, Ban, MessageSquare, Eye } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface Report {
  id: string
  reporter_id: string
  target_user_id: string
  message_id?: string
  category: 'spam' | 'harassment' | 'inappropriate' | 'other'
  reason: string
  details?: string
  attachments?: any[]
  status: 'open' | 'actioned' | 'dismissed'
  auto_blocked: boolean
  admin_id?: string
  action_taken?: string
  created_at: string
  updated_at: string
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

export function AdminReportsContent() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    loadReports()
  }, [filters])

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
      const response = await fetch('/api/admin/reports', {
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

      const response = await fetch('/api/admin/reports', {
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
          spam: 'bg-yellow-100 text-yellow-800',
          harassment: 'bg-red-100 text-red-800',
          inappropriate: 'bg-orange-100 text-orange-800',
          other: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={colors[row.category] || colors.other}>
            {row.category}
          </Badge>
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports Queue</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and triage abuse reports ({total} total)
        </p>
      </div>

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
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
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
          <DataTable
            columns={columns}
            data={reports}
            searchKey="id"
            searchPlaceholder="Search by report ID..."
            pageSize={20}
          />
        </CardContent>
      </Card>

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
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p><strong>Category:</strong> {selectedReport.category}</p>
                      <p><strong>Reason:</strong> {selectedReport.reason}</p>
                      {selectedReport.details && (
                        <p><strong>Details:</strong> {selectedReport.details}</p>
                      )}
                      {selectedReport.message && (
                        <div className="mt-2">
                          <strong>Message Context:</strong>
                          <div className="p-2 bg-white rounded border mt-1">
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
