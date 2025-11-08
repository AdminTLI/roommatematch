'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Users, User } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

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
  const [filters, setFilters] = useState({
    status: '',
    minScore: '',
    maxScore: ''
  })
  const [total, setTotal] = useState(0)

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

  const columns = [
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
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Matches
        </Button>
      </div>

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
    </div>
  )
}
