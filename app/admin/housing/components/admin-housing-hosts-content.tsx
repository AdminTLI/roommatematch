'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
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
import { HOST_TYPE_LABELS, type HostType } from '@/lib/host/types'
import { showErrorToast } from '@/lib/toast'
import { useDebounce } from '@/hooks/use-debounce'
import { Building2, RefreshCw, Search } from 'lucide-react'

type HostRow = {
  id: string
  host_type: HostType
  display_name: string
  company_name: string | null
  kvk_number: string | null
  email: string | null
  onboarding_completed: boolean
  identity_review_status?: 'none' | 'pending' | 'approved' | 'rejected' | null
  identity_review_matched_org?: string | null
  created_at: string
  listings: { active: number; pending: number; rejected: number; total: number }
  applications: {
    received: number
    shortlisted: number
    offered: number
    rejected: number
    shortlist_rate: number | null
    offer_rate: number | null
    reject_rate: number | null
    top_rejection_reason: string | null
  }
}

function pct(n: number | null): string {
  if (n == null) return '—'
  return `${(n * 100).toFixed(0)}%`
}

export function AdminHousingHostsContent() {
  const [hosts, setHosts] = useState<HostRow[]>([])
  const [stats, setStats] = useState({ total: 0, landlords: 0, agencies: 0 })
  const [hostType, setHostType] = useState('all')
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
        if (hostType !== 'all') params.set('host_type', hostType)
        if (debouncedSearch) params.set('q', debouncedSearch)
        const res = await fetch(`/api/admin/housing/hosts?${params.toString()}`, {
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load hosts')
        setHosts(json.hosts || [])
        if (json.stats) setStats(json.stats)
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : 'Failed to load hosts')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [hostType, debouncedSearch]
  )

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Hosts</p>
            <p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Landlords</p>
            <p className="text-2xl font-semibold tabular-nums">{stats.landlords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Agencies</p>
            <p className="text-2xl font-semibold tabular-nums">{stats.agencies}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search name, company, KvK…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={hostType} onValueChange={setHostType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="private_landlord">Landlord</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading hosts…</p>
      ) : !hosts.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No hosts found.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Listings</th>
                <th className="px-4 py-3 font-medium">Apps</th>
                <th className="px-4 py-3 font-medium">Shortlist</th>
                <th className="px-4 py-3 font-medium">Offer</th>
                <th className="px-4 py-3 font-medium">Reject</th>
                <th className="px-4 py-3 font-medium">Top reject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {hosts.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/housing/hosts/${h.id}`}
                      className="font-medium text-slate-900 hover:underline dark:text-white"
                    >
                      {h.display_name || h.company_name || 'Unnamed host'}
                    </Link>
                    <p className={ADMIN_HELPER_TEXT}>
                      {h.email || '—'}
                      {h.kvk_number ? ` · KvK ${h.kvk_number}` : ''}
                    </p>
                    {h.identity_review_status === 'pending' ? (
                      <Badge className="mt-1 border-0 bg-amber-100 text-amber-900">
                        Name review
                        {h.identity_review_matched_org
                          ? `: ${h.identity_review_matched_org}`
                          : ''}
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{HOST_TYPE_LABELS[h.host_type]}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {h.listings.active}/{h.listings.total}
                    </span>
                    {h.listings.pending > 0 && (
                      <span className="ml-1 text-xs text-amber-600">
                        ({h.listings.pending} pending)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{h.applications.received}</td>
                  <td className="px-4 py-3 tabular-nums">{pct(h.applications.shortlist_rate)}</td>
                  <td className="px-4 py-3 tabular-nums">{pct(h.applications.offer_rate)}</td>
                  <td
                    className={`px-4 py-3 tabular-nums ${
                      (h.applications.reject_rate || 0) >= 0.6 ? 'text-rose-600' : ''
                    }`}
                  >
                    {pct(h.applications.reject_rate)}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-500">
                    {h.applications.top_rejection_reason?.replace(/_/g, ' ') || '—'}
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
