'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bug, Eye, RefreshCw } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { cn } from '@/lib/utils'
import {
  BUG_REPORT_CATEGORIES,
  BUG_REPORT_CATEGORY_LABELS,
  BUG_REPORT_STATUS_VALUES,
  type BugReportCategory,
  type BugReportStatus,
} from '@/lib/bugs/categories'

interface BugReportRow {
  id: string
  user_id: string
  category: BugReportCategory | string
  description: string
  status: BugReportStatus
  admin_notes?: string | null
  admin_id?: string | null
  consent_at: string
  created_at: string
  updated_at: string
  diagnostics?: Record<string, unknown>
  user?: {
    user_id: string
    first_name: string
    last_name: string
    email: string
  }
}

const STATUS_COLORS: Record<BugReportStatus, string> = {
  open: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
  triaged: 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
  resolved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
  dismissed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

export function AdminBugReportsContent() {
  const [reports, setReports] = useState<BugReportRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all', category: 'all' })
  const [selected, setSelected] = useState<BugReportRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusDraft, setStatusDraft] = useState<BugReportStatus>('open')
  const [notesDraft, setNotesDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.category !== 'all') params.append('category', filters.category)
      params.append('limit', '100')

      const response = await fetch(`/api/admin/bug-reports?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load')
      }
      const data = await response.json()
      setReports(data.reports || [])
      setTotal(data.total || 0)
    } catch {
      showErrorToast('Failed to load bug reports')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const openDetail = async (row: BugReportRow) => {
    setSelected(row)
    setStatusDraft(row.status)
    setNotesDraft(row.admin_notes || '')
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/admin/bug-reports/${row.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.report) {
          setSelected(data.report)
          setStatusDraft(data.report.status)
          setNotesDraft(data.report.admin_notes || '')
        }
      }
    } catch {
      // keep list row data
    } finally {
      setDetailLoading(false)
    }
  }

  const saveDetail = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      const response = await fetchWithCSRF(`/api/admin/bug-reports/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusDraft,
          admin_notes: notesDraft.trim() || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }
      showSuccessToast('Bug report updated')
      setDetailOpen(false)
      await loadReports()
    } catch (e: unknown) {
      const err = e as { message?: string }
      showErrorToast('Could not update', err.message || 'Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const columns = [
    {
      header: 'Created',
      accessor: (row: BugReportRow) => new Date(row.created_at).toLocaleString(),
    },
    {
      header: 'User',
      accessor: (row: BugReportRow) => {
        const name = [row.user?.first_name, row.user?.last_name].filter(Boolean).join(' ')
        return name || row.user?.email || row.user_id.slice(0, 8)
      },
    },
    {
      header: 'Category',
      accessor: (row: BugReportRow) =>
        BUG_REPORT_CATEGORY_LABELS[row.category as BugReportCategory] || row.category,
    },
    {
      header: 'Status',
      accessor: (row: BugReportRow) => (
        <Badge className={STATUS_COLORS[row.status] || ''} variant="secondary">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Description',
      accessor: (row: BugReportRow) => (
        <span className="line-clamp-2 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
          {row.description}
        </span>
      ),
    },
    {
      header: '',
      accessor: (row: BugReportRow) => (
        <Button type="button" variant="outline" size="sm" onClick={() => openDetail(row)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bug className="h-6 w-6 text-amber-600" />
            Bug Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Product and error reports from users ({total} total)
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadReports} disabled={isLoading}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter by status or category</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BUG_REPORT_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {BUG_REPORT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <DataTable
              columns={columns}
              data={reports}
              searchKey="description"
              searchPlaceholder="Search descriptions…"
              pageSize={15}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className={cn(
            'flex w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0',
            'max-h-[min(90dvh,720px)] sm:max-h-[min(85dvh,720px)]',
          )}
        >
          <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 pb-3 pt-5 pr-12 text-left sm:px-6">
            <DialogTitle>Bug report detail</DialogTitle>
            <DialogDescription>
              {selected
                ? `Submitted ${new Date(selected.created_at).toLocaleString()}`
                : 'Report details'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {detailLoading && !selected?.diagnostics ? (
              <p className="text-sm text-muted-foreground">Loading diagnostics…</p>
            ) : selected ? (
              <div className="space-y-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">User</p>
                    <p className="truncate font-medium">
                      {[selected.user?.first_name, selected.user?.last_name]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{selected.user?.email}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {BUG_REPORT_CATEGORY_LABELS[selected.category as BugReportCategory] ||
                        selected.category}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap break-words rounded-lg border bg-muted/40 p-3 text-sm">
                    {selected.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={statusDraft}
                    onValueChange={(v) => setStatusDraft(v as BugReportStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {BUG_REPORT_STATUS_VALUES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-notes">Admin notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={3}
                    placeholder="Internal notes…"
                    className="resize-y"
                  />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Diagnostics</p>
                  <pre className="max-h-[min(28vh,240px)] overflow-auto rounded-lg border bg-zinc-950 p-3 text-[11px] leading-relaxed text-zinc-100 break-all whitespace-pre-wrap">
                    {JSON.stringify(selected.diagnostics ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 border-t border-border bg-background px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={saveDetail} disabled={isSaving || !selected}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
