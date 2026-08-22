'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Shield } from 'lucide-react'

interface AuditAction {
  id: string
  admin_user_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export function AdminAuditLogContent() {
  const [actions, setActions] = useState<AuditAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    search: '',
  })
  const [pagination, setPagination] = useState({ total: 0, hasMore: false, offset: 0 })

  const fetchActions = useCallback(async (offset = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '50', offset: String(offset) })
      if (filters.action) params.set('action', filters.action)
      if (filters.entityType) params.set('entity_type', filters.entityType)
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/audit-log?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit log')

      const data = await response.json()
      setActions(data.actions || [])
      setPagination({
        total: data.pagination?.total ?? 0,
        hasMore: data.pagination?.hasMore ?? false,
        offset,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchActions(0)
  }, [fetchActions])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            GDPR Art. 30 accountability — who accessed or changed personal data and when.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="action-filter">Action</Label>
              <Input
                id="action-filter"
                placeholder="e.g. view_chat_messages"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="entity-filter">Entity type</Label>
              <Input
                id="entity-filter"
                placeholder="e.g. user, chat"
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="search-filter">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-filter"
                  className="pl-9"
                  placeholder="Action or entity ID"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => fetchActions(0)} className="flex-1">
                Apply
              </Button>
              <Button variant="outline" onClick={() => fetchActions(pagination.offset)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin actions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">{error}</div>
          ) : actions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No audit entries found</div>
          ) : (
            <div className="space-y-3">
              {actions.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border p-4 text-sm space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{entry.action}</Badge>
                    {entry.entity_type && (
                      <Badge variant="secondary">{entry.entity_type}</Badge>
                    )}
                    <span className="text-muted-foreground ml-auto">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p>
                    <span className="text-muted-foreground">Admin:</span>{' '}
                    {entry.admin_user_id.slice(0, 8)}…
                    {entry.entity_id && (
                      <>
                        {' · '}
                        <span className="text-muted-foreground">Entity:</span>{' '}
                        {entry.entity_id.slice(0, 12)}…
                      </>
                    )}
                  </p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
