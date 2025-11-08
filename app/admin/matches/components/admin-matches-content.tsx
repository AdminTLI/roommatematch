'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Users, User, Eye, Archive, Clock, Download, CheckCircle2, XCircle } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

interface Match {
  id: string
  run_id: string
  kind: 'pair' | 'group'
  member_ids: string[]
  fit_score: number
  fit_index: number
  section_scores?: Record<string, number>
  reasons?: string[]
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'confirmed'
  accepted_by: string[]
  expires_at: string
  created_at: string
  members: Array<{
    id: string
    name: string
    email: string
  }>
}

export function AdminMatchesContent() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isProcessingBulk, setIsProcessingBulk] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    minScore: '',
    maxScore: ''
  })
  const [total, setTotal] = useState(0)
  const [statistics, setStatistics] = useState<{
    total: number
    pending: number
    accepted: number
    declined: number
    expired: number
    confirmed: number
    avgScore: number
  } | null>(null)

  useEffect(() => {
    loadMatches()
  }, [filters])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.minScore) params.append('minScore', filters.minScore)
      if (filters.maxScore) params.append('maxScore', filters.maxScore)
      params.append('limit', '100')

      const response = await fetch(`/api/admin/matches?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
        setTotal(data.total || 0)
        setStatistics(data.statistics || null)
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
      showErrorToast('Failed to load matches')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' })
      })

      if (response.ok) {
        showSuccessToast('Matches refreshed successfully')
        loadMatches()
      } else {
        showErrorToast('Failed to refresh matches')
      }
    } catch (error) {
      console.error('Failed to refresh matches:', error)
      showErrorToast('Failed to refresh matches')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleBulkAction = async (action: 'expire' | 'archive') => {
    if (selectedMatches.size === 0) {
      showErrorToast('Please select at least one match')
      return
    }

    setIsProcessingBulk(true)
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          matchIds: Array.from(selectedMatches)
        })
      })

      if (response.ok) {
        showSuccessToast(`${action === 'expire' ? 'Expired' : 'Archived'} ${selectedMatches.size} match(es)`)
        setSelectedMatches(new Set())
        loadMatches()
      } else {
        showErrorToast(`Failed to ${action} matches`)
      }
    } catch (error) {
      console.error(`Failed to ${action} matches:`, error)
      showErrorToast(`Failed to ${action} matches`)
    } finally {
      setIsProcessingBulk(false)
    }
  }

  const handleViewDetails = (match: Match) => {
    setSelectedMatch(match)
    setShowDetailModal(true)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.minScore) params.append('minScore', filters.minScore)
      if (filters.maxScore) params.append('maxScore', filters.maxScore)
      params.append('format', 'csv')

      const response = await fetch(`/api/admin/matches/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `matches-export-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showSuccessToast('Matches exported successfully')
      } else {
        showErrorToast('Failed to export matches')
      }
    } catch (error) {
      console.error('Failed to export matches:', error)
      showErrorToast('Failed to export matches')
    }
  }

  const toggleSelectMatch = (matchId: string) => {
    setSelectedMatches(prev => {
      const updated = new Set(prev)
      if (updated.has(matchId)) {
        updated.delete(matchId)
      } else {
        updated.add(matchId)
      }
      return updated
    })
  }

  const toggleSelectAll = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set())
    } else {
      setSelectedMatches(new Set(matches.map(m => m.id)))
    }
  }

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedMatches.size === matches.length && matches.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span>Select</span>
        </div>
      ),
      accessor: (row: Match) => (
        <Checkbox
          checked={selectedMatches.has(row.id)}
          onCheckedChange={() => toggleSelectMatch(row.id)}
        />
      )
    },
    {
      header: 'Members',
      accessor: (row: Match) => (
        <div className="flex items-center gap-2">
          {row.kind === 'pair' ? (
            <User className="h-4 w-4 text-gray-500" />
          ) : (
            <Users className="h-4 w-4 text-gray-500" />
          )}
          <div className="flex flex-col">
            {row.members.map((m, idx) => (
              <span key={m.id} className="text-sm">
                {m.name || m.email}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      header: 'Score',
      accessor: (row: Match) => (
        <div className="flex flex-col">
          <span className="font-medium">{(row.fit_score * 100).toFixed(1)}%</span>
          <span className="text-xs text-gray-500">Index: {row.fit_index}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: Match) => {
        const colors: Record<string, string> = {
          pending: 'bg-blue-100 text-blue-800',
          accepted: 'bg-yellow-100 text-yellow-800',
          declined: 'bg-red-100 text-red-800',
          expired: 'bg-gray-100 text-gray-800',
          confirmed: 'bg-green-100 text-green-800'
        }
        return (
          <Badge className={colors[row.status] || colors.pending}>
            {row.status}
          </Badge>
        )
      }
    },
    {
      header: 'Kind',
      accessor: (row: Match) => (
        <Badge variant="outline">{row.kind}</Badge>
      )
    },
    {
      header: 'Accepted By',
      accessor: (row: Match) => (
        <span className="text-sm">{row.accepted_by?.length || 0} / {row.member_ids.length}</span>
      )
    },
    {
      header: 'Created',
      accessor: (row: Match) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Expires',
      accessor: (row: Match) => {
        const expires = new Date(row.expires_at)
        const isExpired = expires < new Date()
        return (
          <span className={isExpired ? 'text-red-600' : ''}>
            {expires.toLocaleDateString()}
          </span>
        )
      }
    },
    {
      header: 'Actions',
      accessor: (row: Match) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetails(row)}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      )
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Match Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage match suggestions ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Matches
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Accepted</div>
              <div className="text-2xl font-bold text-yellow-600">{statistics.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Declined</div>
              <div className="text-2xl font-bold text-red-600">{statistics.declined}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Expired</div>
              <div className="text-2xl font-bold text-gray-600">{statistics.expired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Confirmed</div>
              <div className="text-2xl font-bold text-green-600">{statistics.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Avg Score</div>
              <div className="text-2xl font-bold">{(statistics.avgScore * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedMatches.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedMatches.size} match(es) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('expire')}
                  disabled={isProcessingBulk}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Expire
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                  disabled={isProcessingBulk}
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Min Score</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.0"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Score</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="1.0"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
          <CardDescription>All match suggestions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={matches}
            searchKey="id"
            searchPlaceholder="Search by match ID..."
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Match Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
            <DialogDescription>
              Detailed information about this match suggestion
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Match ID</label>
                  <p className="text-sm font-mono">{selectedMatch.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Run ID</label>
                  <p className="text-sm font-mono">{selectedMatch.run_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge>{selectedMatch.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kind</label>
                  <Badge variant="outline">{selectedMatch.kind}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fit Score</label>
                  <p className="text-sm font-bold">{(selectedMatch.fit_score * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fit Index</label>
                  <p className="text-sm">{selectedMatch.fit_index}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{new Date(selectedMatch.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expires</label>
                  <p className="text-sm">{new Date(selectedMatch.expires_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Members</label>
                <div className="space-y-2">
                  {selectedMatch.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      {selectedMatch.accepted_by?.includes(member.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedMatch.section_scores && Object.keys(selectedMatch.section_scores).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Section Scores</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedMatch.section_scores).map(([section, score]) => (
                      <div key={section} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs capitalize">{section.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-medium">{(score as number * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMatch.reasons && selectedMatch.reasons.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Match Reasons</label>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMatch.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm">{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
