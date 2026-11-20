'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ADMIN_HELPER_TEXT } from '@/lib/admin/ui'
import { REJECTION_REASON_CODES } from '@/lib/host/types'
import { showErrorToast } from '@/lib/toast'
import { useDebounce } from '@/hooks/use-debounce'
import { RefreshCw, Search, Shield } from 'lucide-react'

type AppRow = {
  id: string
  listing_id: string
  listing_title: string | null
  listing_city: string | null
  host_id: string | null
  host_name: string | null
  host_type: string | null
  application_type: string
  status: string
  anonymous_label: string | null
  fit_score: number | null
  cohesion_score: number | null
  group_size: number | null
  verification_badges: string[] | null
  hard_gates_passed: boolean | null
  rejection_reason_code: string | null
  identity_revealed: boolean
  created_at: string
  aging_days: number
  applicant_user_ids?: string[]
}

const STATUSES = [
  'all',
  'submitted',
  'under_review',
  'shortlisted',
  'offer_pending',
  'offer_accepted',
  'offer_declined',
  'rejected',
  'withdrawn',
  'approved',
]

export function AdminHousingApplicationsContent() {
  const searchParams = useSearchParams()
  const initialAging = searchParams.get('aging') === '1'

  const [apps, setApps] = useState<AppRow[]>([])
  const [status, setStatus] = useState('all')
  const [rejection, setRejection] = useState('all')
  const [aging, setAging] = useState(initialAging)
  const [showIds, setShowIds] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      try {
        const params = new URLSearchParams()
        if (status !== 'all') params.set('status', status)
        if (rejection !== 'all') params.set('rejection_reason', rejection)
        if (aging) params.set('aging', '1')
        if (showIds) params.set('show_ids', '1')
        if (debouncedSearch) params.set('q', debouncedSearch)
        const res = await fetch(`/api/admin/housing/applications?${params.toString()}`, {
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load applications')
        setApps(json.applications || [])
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : 'Failed to load applications')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [status, rejection, aging, showIds, debouncedSearch]
  )

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search label, listing, host, city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rejection} onValueChange={setRejection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rejection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            {REJECTION_REASON_CODES.map((c) => (
              <SelectItem key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </SelectItem>
            ))}
            <SelectItem value="unspecified">Unspecified</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={aging ? 'primary' : 'outline'}
          onClick={() => setAging((v) => !v)}
        >
          Aging only
        </Button>
        <Button
          variant={showIds ? 'primary' : 'outline'}
          onClick={() => setShowIds((v) => !v)}
          title="Reveal applicant user IDs for support cases"
        >
          <Shield className="mr-2 h-4 w-4" />
          Show IDs
        </Button>
        <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {aging && (
        <p className={ADMIN_HELPER_TEXT}>
          Showing open applications older than 7 days (pipeline lag).
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading applications…</p>
      ) : !apps.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No applications match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-3 py-3 font-medium">Applicant</th>
                <th className="px-3 py-3 font-medium">Listing</th>
                <th className="px-3 py-3 font-medium">Host</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Fit / cohesion</th>
                <th className="px-3 py-3 font-medium">Group</th>
                <th className="px-3 py-3 font-medium">Badges</th>
                <th className="px-3 py-3 font-medium">Reject</th>
                <th className="px-3 py-3 font-medium">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                  <td className="px-3 py-3">
                    <p className="font-medium">{a.anonymous_label || 'Applicant'}</p>
                    <p className="text-xs capitalize text-slate-500">{a.application_type}</p>
                    {(showIds || a.identity_revealed) && a.applicant_user_ids?.length ? (
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                        {a.applicant_user_ids.slice(0, 3).join(', ')}
                        {a.applicant_user_ids.length > 3 ? '…' : ''}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-[180px] truncate">{a.listing_title || '—'}</p>
                    <p className={ADMIN_HELPER_TEXT}>{a.listing_city || '—'}</p>
                  </td>
                  <td className="px-3 py-3">
                    {a.host_id ? (
                      <Link
                        href={`/admin/housing/hosts/${a.host_id}`}
                        className="hover:underline"
                      >
                        {a.host_name || 'Host'}
                      </Link>
                    ) : (
                      a.host_name || '—'
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        a.status === 'rejected'
                          ? 'destructive'
                          : a.status === 'offer_accepted' || a.status === 'approved'
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {a.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {a.fit_score != null ? Number(a.fit_score).toFixed(1) : '—'}
                    {a.cohesion_score != null
                      ? ` / ${Number(a.cohesion_score).toFixed(1)}`
                      : ''}
                    {a.hard_gates_passed === false && (
                      <span className="ml-1 text-xs text-rose-600">gates</span>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{a.group_size ?? 1}</td>
                  <td className="px-3 py-3">
                    {(a.verification_badges || []).length ? (
                      <div className="flex flex-wrap gap-1">
                        {(a.verification_badges || []).slice(0, 3).map((b) => (
                          <Badge key={b} variant="secondary" className="text-[10px]">
                            {b.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 capitalize text-slate-500">
                    {a.rejection_reason_code?.replace(/_/g, ' ') || '—'}
                  </td>
                  <td
                    className={`px-3 py-3 tabular-nums ${
                      a.aging_days >= 7 &&
                      ['submitted', 'under_review', 'shortlisted', 'offer_pending'].includes(
                        a.status
                      )
                        ? 'text-orange-600'
                        : ''
                    }`}
                  >
                    {a.aging_days}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
