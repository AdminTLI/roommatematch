'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Search,
  User,
  Calendar,
  Building2,
  Mail
} from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { useDebounce } from '@/hooks/use-debounce'

interface Verification {
  id: string
  user_id: string
  provider: 'persona'
  provider_session_id: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  review_reason?: string
  provider_data?: any
  created_at: string
  updated_at: string
  profile?: {
    first_name: string
    last_name: string
    email: string
    university_name?: string
  }
  user?: {
    email: string
  }
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  expired: number
}

export function AdminVerificationsContent() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0
  })
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideStatus, setOverrideStatus] = useState<'approved' | 'rejected'>('approved')
  const [isOverriding, setIsOverriding] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadVerifications()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      loadVerifications(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearchQuery])

  const loadVerifications = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim())
      }

      const response = await fetch(`/api/admin/verifications?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVerifications(data.verifications || [])
        setStats(data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          expired: 0
        })
      } else {
        showErrorToast('Failed to load verifications')
      }
    } catch (error) {
      console.error('Failed to load verifications:', error)
      showErrorToast('Failed to load verifications')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleViewDetails = (verification: Verification) => {
    setSelectedVerification(verification)
    setShowDetailDialog(true)
  }

  const handleOverride = async () => {
    if (!selectedVerification) return

    setIsOverriding(true)
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'override',
          verificationId: selectedVerification.id,
          userId: selectedVerification.user_id,
          status: overrideStatus
        })
      })

      if (response.ok) {
        showSuccessToast(`Verification ${overrideStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
        setShowOverrideDialog(false)
        setSelectedVerification(null)
        loadVerifications()
      } else {
        const errorData = await response.json().catch(() => ({}))
        showErrorToast(errorData.error || 'Failed to override verification')
      }
    } catch (error) {
      console.error('Failed to override verification:', error)
      showErrorToast('Failed to override verification')
    } finally {
      setIsOverriding(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      approved: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Approved' },
      pending: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Pending' },
      rejected: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejected' },
      expired: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Expired' }
    }
    
    const variant = variants[status] || variants.pending
    return (
      <Badge className={variant.className}>
        <div className="flex items-center gap-1.5">
          {getStatusIcon(status)}
          <span>{variant.label}</span>
        </div>
      </Badge>
    )
  }

  const getProviderBadge = (provider: string) => {
    return (
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        Persona
      </Badge>
    )
  }

  const columns = [
    {
      header: 'User',
      accessor: (row: Verification) => {
        const name = row.profile 
          ? `${row.profile.first_name || ''} ${row.profile.last_name || ''}`.trim()
          : null
        const email = row.profile?.email || row.user?.email || 'Unknown'
        
        return (
          <div className="flex flex-col gap-1">
            {name ? (
              <span className="font-medium">{name}</span>
            ) : null}
            <span className="text-sm text-gray-500">{email}</span>
          </div>
        )
      },
      tooltip: 'User who submitted the verification request. Shows name and email address.'
    },
    {
      header: 'Provider',
      accessor: (row: Verification) => getProviderBadge(row.provider),
      tooltip: 'Identity verification provider used (Persona)'
    },
    {
      header: 'Status',
      accessor: (row: Verification) => getStatusBadge(row.status),
      tooltip: 'Current verification status: Pending (under review), Approved (verified), Rejected (failed), or Expired (time limit exceeded)'
    },
    {
      header: 'Session ID',
      accessor: (row: Verification) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {row.provider_session_id.slice(0, 12)}...
        </span>
      ),
      tooltip: 'Provider session ID for tracking the verification in the provider system'
    },
    {
      header: 'Created',
      accessor: (row: Verification) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{new Date(row.created_at).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{new Date(row.created_at).toLocaleTimeString()}</span>
        </div>
      ),
      tooltip: 'Date and time when the verification was submitted'
    },
    {
      header: 'Updated',
      accessor: (row: Verification) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{new Date(row.updated_at).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{new Date(row.updated_at).toLocaleTimeString()}</span>
        </div>
      ),
      tooltip: 'Date and time when the verification status was last updated'
    },
    {
      header: 'Actions',
      accessor: (row: Verification) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700"
                onClick={() => {
                  setSelectedVerification(row)
                  setOverrideStatus('approved')
                  setShowOverrideDialog(true)
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setSelectedVerification(row)
                  setOverrideStatus('rejected')
                  setShowOverrideDialog(true)
                }}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
      tooltip: 'Available actions: View details, Approve (for pending verifications), or Reject (for pending verifications)'
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage identity verifications ({stats.total} total)
          </p>
        </div>
        <Button onClick={() => loadVerifications(true)} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter verifications by status or search by user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verifications</CardTitle>
          <CardDescription>
            All identity verification requests. Click "View" to see detailed information including provider data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={verifications}
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Complete information about this verification request
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      {selectedVerification.profile ? (
                        <>
                          <div className="font-medium">
                            {selectedVerification.profile.first_name} {selectedVerification.profile.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{selectedVerification.profile.email}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {selectedVerification.user?.email || 'Unknown'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {selectedVerification.profile?.university_name || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider</label>
                  <div className="mt-1">{getProviderBadge(selectedVerification.provider)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Session ID</label>
                  <div className="mt-1 font-mono text-sm">{selectedVerification.provider_session_id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verification ID</label>
                  <div className="mt-1 font-mono text-sm">{selectedVerification.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(selectedVerification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(selectedVerification.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedVerification.review_reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Review Reason</label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <p className="text-sm">{selectedVerification.review_reason}</p>
                  </div>
                </div>
              )}

              {selectedVerification.provider_data && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider Data</label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedVerification.provider_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            {selectedVerification?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => {
                    setShowDetailDialog(false)
                    setOverrideStatus('approved')
                    setShowOverrideDialog(true)
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setShowDetailDialog(false)
                    setOverrideStatus('rejected')
                    setShowOverrideDialog(true)
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {overrideStatus === 'approved' ? 'Approve' : 'Reject'} Verification?
            </DialogTitle>
            <DialogDescription>
              {overrideStatus === 'approved' 
                ? 'This will manually approve the verification and mark the user as verified. This action will update the user profile and allow them to access all features.'
                : 'This will manually reject the verification. The user will need to submit a new verification request to try again.'}
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-2">
              <p className="text-sm">
                <strong>User:</strong> {selectedVerification.profile?.email || selectedVerification.user?.email || 'Unknown'}
              </p>
              <p className="text-sm">
                <strong>Provider:</strong> {selectedVerification.provider}
              </p>
              <p className="text-sm">
                <strong>Session ID:</strong> {selectedVerification.provider_session_id}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={overrideStatus === 'approved' ? 'default' : 'destructive'}
              onClick={handleOverride}
              disabled={isOverriding}
            >
              {isOverriding ? 'Processing...' : `${overrideStatus === 'approved' ? 'Approve' : 'Reject'} Verification`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
