'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { getDaysUntilDeadline, isRequestOverdue } from '@/lib/privacy/dsar-utils'

interface DSARRequest {
  id: string
  user_id: string
  request_type: string
  status: string
  requested_at: string
  sla_deadline: string
  completed_at?: string
  admin_notes?: string
  processing_metadata?: any
}

export function AdminDSARContent() {
  const [requests, setRequests] = useState<DSARRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<DSARRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    approaching: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  })

  useEffect(() => {
    fetchRequests()
    fetchStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [requests, filters])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/dsar')
      if (!response.ok) {
        throw new Error('Failed to fetch DSAR requests')
      }
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dsar/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...requests]

    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(r => r.request_type === filters.type)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(r => 
        r.user_id.toLowerCase().includes(searchLower) ||
        r.id.toLowerCase().includes(searchLower)
      )
    }

    // Sort by SLA deadline (most urgent first)
    filtered.sort((a, b) => {
      const aOverdue = isRequestOverdue(a.sla_deadline)
      const bOverdue = isRequestOverdue(b.sla_deadline)
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime()
    })

    setFilteredRequests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      cancelled: { variant: 'secondary', label: 'Cancelled' }
    }
    const config = variants[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      export: 'Data Export',
      deletion: 'Account Deletion',
      rectification: 'Data Rectification',
      portability: 'Data Portability',
      restriction: 'Processing Restriction',
      objection: 'Objection to Processing'
    }
    return labels[type] || type
  }

  const getSLAStatus = (deadline: string) => {
    if (isRequestOverdue(deadline)) {
      const daysOverdue = Math.abs(getDaysUntilDeadline(deadline))
      return {
        status: 'overdue',
        label: `${daysOverdue} days overdue`,
        color: 'text-red-600',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    const daysRemaining = getDaysUntilDeadline(deadline)
    if (daysRemaining <= 3) {
      return {
        status: 'urgent',
        label: `${daysRemaining} days remaining`,
        color: 'text-orange-600',
        icon: <Clock className="h-4 w-4" />
      }
    }
    return {
      status: 'ok',
      label: `${daysRemaining} days remaining`,
      color: 'text-green-600',
      icon: <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DSAR Management</h1>
          <p className="text-gray-600 mt-1">Manage Data Subject Access Requests (GDPR Articles 15-20)</p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approaching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.approaching}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="export">Export</option>
                <option value="deletion">Deletion</option>
                <option value="rectification">Rectification</option>
                <option value="portability">Portability</option>
              </select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="User ID or Request ID"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>SLA deadline: 30 days from request</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No requests found</div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const slaStatus = getSLAStatus(request.sla_deadline)
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">{getTypeLabel(request.request_type)}</Badge>
                          <div className={`flex items-center gap-1 ${slaStatus.color}`}>
                            {slaStatus.icon}
                            <span className="text-sm">{slaStatus.label}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Request ID:</strong> {request.id.slice(0, 8)}...</p>
                          <p><strong>User ID:</strong> {request.user_id.slice(0, 8)}...</p>
                          <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}</p>
                          <p><strong>SLA Deadline:</strong> {new Date(request.sla_deadline).toLocaleString()}</p>
                          {request.completed_at && (
                            <p><strong>Completed:</strong> {new Date(request.completed_at).toLocaleString()}</p>
                          )}
                          {request.admin_notes && (
                            <p><strong>Notes:</strong> {request.admin_notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View request details
                            window.location.href = `/admin/dsar/${request.id}`
                          }}
                        >
                          View Details
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              // Mark as in progress
                              const response = await fetch(`/api/admin/dsar/${request.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'in_progress' })
                              })
                              if (response.ok) {
                                fetchRequests()
                                fetchStats()
                              }
                            }}
                          >
                            Start Processing
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

