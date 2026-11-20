'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminStatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ADMIN_HELPER_TEXT, ADMIN_SECTION_TITLE } from '@/lib/admin/ui'
import { showErrorToast } from '@/lib/toast'
import {
  AlertTriangle,
  Building2,
  Clock,
  RefreshCw,
  Users,
} from 'lucide-react'

type Period = '7d' | '30d' | 'all'

type MetricsPayload = {
  period: Period
  supply: {
    total_hosts: number
    hosts_with_listings: number
    new_hosts_in_period: number
    landlord_hosts: number
    agency_hosts: number
    active_listings: number
    pending_moderation: number
    new_listings_in_period: number
    cities_with_supply: { city: string; count: number }[]
  }
  demand: {
    applications_in_period: number
    group_applications: number
    individual_applications: number
    group_share: number | null
    unique_applicants: number
  }
  matching_health: {
    median_fit_score: number | null
    hard_gate_fail_count: number
    hard_gate_fail_rate: number | null
  }
  funnel: {
    submitted: number
    shortlisted: number
    viewingsBooked: number
    offers: number
    accepted: number
    rejected: number
    shortlist_rate: number | null
    offer_rate: number | null
    accept_rate: number | null
    reject_rate: number | null
    viewing_rate: number | null
  }
  fairness: {
    rejection_distribution: { code: string; count: number }[]
    high_reject_hosts: {
      host_id: string
      host_type: string | null
      applications: number
      rejected: number
      reject_rate: number
      top_rejection_reason: string | null
    }[]
    reject_rate_threshold: number
    avg_hours_to_first_decision: number | null
    avg_hours_to_offer: number | null
  }
  trust: {
    apps_with_verification_badges: number
    verified_application_share: number | null
    offers_to_id_verified: number
    verified_offer_share: number | null
  }
  liquidity: {
    median_days_to_fill: number | null
    aging_open_applications: number
    aging_days: number
  }
  queues: {
    pending_listings: number
    aging_applications: number
    high_reject_hosts: number
  }
}

function pct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(0)}%`
}

function fmt(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

function reasonLabel(code: string): string {
  return code.replace(/_/g, ' ')
}

export function AdminHousingOverviewContent() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<MetricsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      try {
        const res = await fetch(`/api/admin/housing/metrics?period=${period}`, {
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load metrics')
        setData(json)
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [period]
  )

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !data) {
    return <p className="text-sm text-slate-500">Loading housing overview…</p>
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Could not load housing metrics.
          <div className="mt-3">
            <Button variant="outline" onClick={() => load()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxReject = Math.max(
    1,
    ...data.fairness.rejection_distribution.map((r) => r.count)
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/housing/listings?moderation_status=pending">
            <Card className="min-w-[160px] transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <Building2 className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-500">Pending listings</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {data.queues.pending_listings}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/housing/applications?aging=1">
            <Card className="min-w-[160px] transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-slate-500">
                    Aging apps (&gt;{data.liquidity.aging_days}d)
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {data.queues.aging_applications}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/housing/hosts">
            <Card className="min-w-[160px] transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <div>
                  <p className="text-xs text-slate-500">High-reject hosts</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {data.queues.high_reject_hosts}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Supply</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Active hosts"
            value={data.supply.hosts_with_listings.toLocaleString()}
            hint={`${data.supply.total_hosts} total · ${data.supply.new_hosts_in_period} new`}
          />
          <AdminStatCard
            label="Active listings"
            value={data.supply.active_listings.toLocaleString()}
            hint={`${data.supply.pending_moderation} pending moderation`}
          />
          <AdminStatCard
            label="Landlord / agency"
            value={`${data.supply.landlord_hosts} / ${data.supply.agency_hosts}`}
            hint="Host type split"
          />
          <AdminStatCard
            label="Cities with supply"
            value={data.supply.cities_with_supply.length.toLocaleString()}
            hint={
              data.supply.cities_with_supply[0]
                ? `Top: ${data.supply.cities_with_supply[0].city} (${data.supply.cities_with_supply[0].count})`
                : 'No active listings'
            }
          />
        </div>
      </section>

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Demand & matching</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Applications"
            value={data.demand.applications_in_period.toLocaleString()}
            hint={`${data.demand.unique_applicants} unique applicants`}
          />
          <AdminStatCard
            label="Group share"
            value={pct(data.demand.group_share)}
            hint={`${data.demand.group_applications} group · ${data.demand.individual_applications} individual`}
          />
          <AdminStatCard
            label="Median fit score"
            value={fmt(data.matching_health.median_fit_score, 1)}
            hint="Submitted applications"
          />
          <AdminStatCard
            label="Hard-gate fails"
            value={pct(data.matching_health.hard_gate_fail_rate)}
            hint={`${data.matching_health.hard_gate_fail_count} applications`}
          />
        </div>
      </section>

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Funnel</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <AdminStatCard label="Submitted" value={data.funnel.submitted} />
          <AdminStatCard
            label="Shortlisted"
            value={data.funnel.shortlisted}
            hint={pct(data.funnel.shortlist_rate)}
          />
          <AdminStatCard
            label="Viewings"
            value={data.funnel.viewingsBooked}
            hint={pct(data.funnel.viewing_rate)}
          />
          <AdminStatCard
            label="Offers"
            value={data.funnel.offers}
            hint={pct(data.funnel.offer_rate)}
          />
          <AdminStatCard
            label="Accepted"
            value={data.funnel.accepted}
            hint={pct(data.funnel.accept_rate)}
          />
          <AdminStatCard
            label="Rejected"
            value={data.funnel.rejected}
            hint={pct(data.funnel.reject_rate)}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className={ADMIN_SECTION_TITLE}>Rejection reasons</h2>
          <Card>
            <CardContent className="space-y-3 p-6">
              {!data.fairness.rejection_distribution.length ? (
                <p className={ADMIN_HELPER_TEXT}>No rejections in this period.</p>
              ) : (
                data.fairness.rejection_distribution.map((row) => (
                  <div key={row.code} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-slate-700 dark:text-slate-200">
                        {reasonLabel(row.code)}
                      </span>
                      <span className="tabular-nums text-slate-500">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-slate-700 dark:bg-slate-300"
                        style={{ width: `${(row.count / maxReject) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className={ADMIN_SECTION_TITLE}>Decision fairness</h2>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <AdminStatCard
              label="Avg hours to decision"
              value={fmt(data.fairness.avg_hours_to_first_decision, 1)}
            />
            <AdminStatCard
              label="Avg hours to offer"
              value={fmt(data.fairness.avg_hours_to_offer, 1)}
            />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Hosts with reject rate ≥ {pct(data.fairness.reject_rate_threshold)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!data.fairness.high_reject_hosts.length ? (
                <p className={ADMIN_HELPER_TEXT}>None above threshold (≥3 apps).</p>
              ) : (
                data.fairness.high_reject_hosts.map((h) => (
                  <Link
                    key={h.host_id}
                    href={`/admin/housing/hosts/${h.host_id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-xs">{h.host_id.slice(0, 8)}…</span>
                      <span className="text-slate-500">{h.host_type || '—'}</span>
                    </span>
                    <span className="tabular-nums text-rose-600">
                      {pct(h.reject_rate)} ({h.rejected}/{h.applications})
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Trust & liquidity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Apps with verification"
            value={pct(data.trust.verified_application_share)}
            hint={`${data.trust.apps_with_verification_badges} applications`}
          />
          <AdminStatCard
            label="Offers to ID-verified"
            value={pct(data.trust.verified_offer_share)}
            hint={`${data.trust.offers_to_id_verified} offers`}
          />
          <AdminStatCard
            label="Median days to fill"
            value={fmt(data.liquidity.median_days_to_fill, 1)}
            hint="Listing live → offer accepted"
          />
          <AdminStatCard
            label="Aging open apps"
            value={data.liquidity.aging_open_applications}
            hint={`Open longer than ${data.liquidity.aging_days} days`}
          />
        </div>
      </section>
    </div>
  )
}
