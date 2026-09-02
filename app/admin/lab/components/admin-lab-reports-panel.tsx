'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { RefreshCw, Trash2, Eye } from 'lucide-react'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { LAB_STATUS_LABELS } from '@/lib/lab/constants'
import { ADMIN_PAGE_STACK } from '@/lib/admin/ui'

export interface LabWishReportRow {
  id: string
  wish_id: string
  reason: string
  created_at: string
  wish_title: string
  wish_body: string
  wish_status: string | null
  reporter_name: string
  reporter_email: string | null
}

interface AdminLabReportsPanelProps {
  wishId?: string | null
  onOpenWish?: (wishId: string) => void
  onWishDeleted?: (wishId: string) => void
  compact?: boolean
}

export function AdminLabReportsPanel({
  wishId,
  onOpenWish,
  onWishDeleted,
  compact = false,
}: AdminLabReportsPanelProps) {
  const router = useRouter()
  const [reports, setReports] = useState<LabWishReportRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LabWishReportRow | null>(null)

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (wishId) params.set('wish_id', wishId)
      const res = await fetch(`/api/admin/lab/reports?${params}`)
      if (res.status === 403) {
        throw new Error('Super admin access required')
      }
      if (!res.ok) throw new Error('Failed to load reports')
      const data = await res.json()
      setReports(data.reports ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      showErrorToast(
        e instanceof Error ? e.message : 'Could not load Lab reports'
      )
    } finally {
      setIsLoading(false)
    }
  }, [wishId])

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  const dismissReport = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetchWithCSRF(`/api/admin/lab/reports/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Dismiss failed')
      }
      showSuccessToast('Report dismissed')
      void loadReports()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Could not dismiss report')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDeleteWish = async () => {
    if (!deleteTarget) return
    const wishIdToDelete = deleteTarget.wish_id
    setBusyId(wishIdToDelete)
    try {
      const res = await fetchWithCSRF(`/api/admin/lab/wishes/${wishIdToDelete}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      showSuccessToast('Wish deleted')
      setDeleteTarget(null)
      void loadReports()
      onWishDeleted?.(wishIdToDelete)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Could not delete wish')
    } finally {
      setBusyId(null)
    }
  }

  const openWish = (id: string) => {
    if (onOpenWish) {
      onOpenWish(id)
      return
    }
    router.push(`/admin/lab?wish=${id}`)
  }

  return (
    <div className={compact ? 'space-y-4' : ADMIN_PAGE_STACK}>
      {!compact && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => void loadReports()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}

      <Card>
        {!compact && (
          <CardHeader>
            <CardTitle className="text-lg">Lab reports ({total})</CardTitle>
            <CardDescription>
              Reports submitted against Domu Lab wishes on the forum.
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-0' : undefined}>
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 py-4">
              Loading reports…
            </p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 py-6 text-center">
              No reports on forum wishes yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {!compact && <TableHead>Wish</TableHead>}
                  <TableHead>Reason</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(row => (
                  <TableRow key={row.id}>
                    {!compact && (
                      <TableCell className="max-w-[220px]">
                        <p className="font-medium text-text-primary">{row.wish_title}</p>
                        {row.wish_status && (
                          <Badge variant="secondary" className="mt-1">
                            {LAB_STATUS_LABELS[row.wish_status] ?? row.wish_status}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="max-w-[280px] whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                      {row.reason}
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="text-text-primary">{row.reporter_name}</p>
                      {row.reporter_email && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {row.reporter_email}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {!compact && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openWish(row.wish_id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Wish
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId === row.id}
                          onClick={() => void dismissReport(row.id)}
                        >
                          Dismiss
                        </Button>
                        {!compact && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 dark:text-red-400"
                            disabled={busyId === row.wish_id}
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete wish
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && busyId === null) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this wish?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.wish_title}” will be removed from Domu Lab, including its votes and reports. This cannot be undone.`
                : 'This wish will be removed from Domu Lab. This cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={busyId !== null}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDeleteWish()}
              disabled={busyId !== null}
            >
              {busyId ? 'Deleting…' : 'Delete wish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
