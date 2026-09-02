'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Lightbulb, RefreshCw, Download, Trash2 } from 'lucide-react'
import { AdminLabReportsPanel } from './admin-lab-reports-panel'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { LAB_WISH_STATUSES, LAB_STATUS_LABELS } from '@/lib/lab/constants'
import type {
  LabWishAdminRow,
  LabWishAdminAuthorFields,
} from '@/lib/lab/admin-serialization'
import type { LabWishStatus } from '@/lib/lab/types'
import { useIsSuperAdmin } from '@/lib/auth/roles-client'
import { ADMIN_FIELD_CLASS } from '@/lib/admin/ui'

type AdminWishRow = LabWishAdminRow & Partial<LabWishAdminAuthorFields>

export function AdminLabContent() {
  const searchParams = useSearchParams()
  const wishParam = searchParams.get('wish')
  const openedWishRef = useRef<string | null>(null)
  const { isSuperAdmin, isLoading: isRoleLoading } = useIsSuperAdmin()
  const [wishes, setWishes] = useState<AdminWishRow[]>([])
  const [canViewAuthors, setCanViewAuthors] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [focusOnly, setFocusOnly] = useState(false)
  const [selected, setSelected] = useState<AdminWishRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusDraft, setStatusDraft] = useState<LabWishStatus>('open')
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminWishRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadWishes = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (focusOnly) params.set('focus_group', 'true')
      params.set('limit', '200')

      const res = await fetch(`/api/admin/lab/wishes?${params}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setWishes(data.wishes ?? [])
      setCanViewAuthors(!!data.can_view_authors)
    } catch {
      showErrorToast('Could not load Domu Lab wishes')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, focusOnly])

  useEffect(() => {
    loadWishes()
  }, [loadWishes])

  const openDetail = (row: AdminWishRow) => {
    setSelected(row)
    setStatusDraft(row.status)
    setMergeTargetId('')
    setDetailOpen(true)
  }

  useEffect(() => {
    if (!wishParam || wishes.length === 0) return
    if (openedWishRef.current === wishParam) return
    const row = wishes.find(w => w.id === wishParam)
    if (row) {
      openedWishRef.current = wishParam
      openDetail(row)
    }
  }, [wishParam, wishes])

  const saveStatus = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/lab/wishes/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusDraft }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      showSuccessToast('Wish updated')
      setDetailOpen(false)
      loadWishes()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  const mergeInto = async () => {
    if (!selected || !mergeTargetId.trim()) return
    setIsSaving(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/lab/wishes/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merged_into_id: mergeTargetId.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Merge failed')
      }
      showSuccessToast('Wishes merged')
      setDetailOpen(false)
      loadWishes()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Merge failed')
    } finally {
      setIsSaving(false)
    }
  }

  const requestDelete = (row: AdminWishRow) => {
    setDetailOpen(false)
    setDeleteTarget(row)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/lab/wishes/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      showSuccessToast('Wish deleted')
      setDeleteTarget(null)
      setSelected(null)
      loadWishes()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Could not delete wish')
    } finally {
      setIsDeleting(false)
    }
  }

  const exportFocusGroup = () => {
    const rows = wishes.filter(w => w.focus_group_opt_in)
    const headers = canViewAuthors
      ? 'title,author_email,author_name,votes,use_this,created_at'
      : 'title,votes,use_this,created_at'
    const csv = [
      headers,
      ...rows.map(w =>
        canViewAuthors
          ? `"${w.title.replace(/"/g, '""')}",${w.author_email ?? ''},${w.author_name ?? ''},${w.vote_count},${w.use_this_count},${w.created_at}`
          : `"${w.title.replace(/"/g, '""')}",${w.vote_count},${w.use_this_count},${w.created_at}`
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'domu-lab-focus-group.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              Domu Lab
            </CardTitle>
            <CardDescription>
              Ranked feature wishes from verified students
              {!isRoleLoading && isSuperAdmin && (
                <span className="block text-xs text-zinc-500 mt-1">
                  Super admin: author identity is visible for moderation.
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportFocusGroup}>
              <Download className="h-4 w-4 mr-1" />
              Focus group CSV
            </Button>
            <Button variant="outline" size="sm" onClick={loadWishes}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={`w-[180px] ${ADMIN_FIELD_CLASS}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LAB_WISH_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {LAB_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={focusOnly ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFocusOnly(v => !v)}
            >
              Focus group opt-in only
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Loading…</p>
          ) : wishes.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">No wishes yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wish</TableHead>
                  {canViewAuthors && <TableHead>Author</TableHead>}
                  <TableHead>Votes</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishes.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    onClick={() => openDetail(row)}
                  >
                    <TableCell className="font-medium">{row.title}</TableCell>
                    {canViewAuthors && (
                      <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                        {row.author_name ?? 'Unknown'}
                        {row.author_email ? (
                          <span className="block text-xs text-slate-600 dark:text-slate-300">
                            {row.author_email}
                          </span>
                        ) : null}
                      </TableCell>
                    )}
                    <TableCell>
                      {row.use_this_count} use / {row.vote_count} total
                    </TableCell>
                    <TableCell>
                      {(row.report_count ?? 0) > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-200">
                          {row.report_count}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {LAB_STATUS_LABELS[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.focus_group_opt_in ? (
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200">
                          Opt-in
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={e => {
                          e.stopPropagation()
                          requestDelete(row)
                        }}
                        aria-label={`Delete ${row.title}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {canViewAuthors && selected?.author_name
                ? `${selected.author_name}${selected.author_email ? ` (${selected.author_email})` : ''} · `
                : ''}
              {selected?.vote_count ?? 0} votes
              {(selected?.report_count ?? 0) > 0
                ? ` · ${selected?.report_count} report${selected?.report_count === 1 ? '' : 's'}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {selected.body}
              </p>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusDraft}
                  onValueChange={v => setStatusDraft(v as LabWishStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_WISH_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {LAB_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Merge into wish ID (duplicate)</Label>
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-zinc-900 dark:border-zinc-700"
                  placeholder="Target wish UUID"
                  value={mergeTargetId}
                  onChange={e => setMergeTargetId(e.target.value)}
                />
              </div>
              {isSuperAdmin && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Label>Reports</Label>
                  <AdminLabReportsPanel
                    wishId={selected.id}
                    compact
                    onWishDeleted={() => {
                      setDetailOpen(false)
                      loadWishes()
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-4 sm:gap-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={() => selected && requestDelete(selected)}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-3">
              {mergeTargetId.trim() && (
                <Button
                  variant="secondary"
                  onClick={mergeInto}
                  disabled={isSaving}
                >
                  Merge
                </Button>
              )}
              <Button onClick={saveStatus} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save status'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this wish?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be removed from Domu Lab. Votes and reports on it are deleted too. This cannot be undone.`
                : 'This wish will be removed from Domu Lab. This cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete wish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
