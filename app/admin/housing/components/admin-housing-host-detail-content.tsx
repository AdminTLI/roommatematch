'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_HELPER_TEXT, ADMIN_SECTION_TITLE } from '@/lib/admin/ui'
import { HOST_TYPE_LABELS, type HostType } from '@/lib/host/types'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { ArrowLeft, RefreshCw } from 'lucide-react'

type Props = { hostId: string }

export function AdminHousingHostDetailContent({ hostId }: Props) {
  const [data, setData] = useState<{
    host: Record<string, unknown>
    listings: any[]
    applications: any[]
    rejection_distribution: { code: string; count: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/housing/hosts/${hostId}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load host')
      setData(json)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to load host')
    } finally {
      setLoading(false)
    }
  }, [hostId])

  useEffect(() => {
    void load()
  }, [load])

  const reviewIdentity = async (action: 'approve' | 'reject') => {
    setActing(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/housing/hosts/${hostId}/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Review failed')
      showSuccessToast(action === 'approve' ? 'Organisation name approved' : 'Name claim rejected')
      setReviewNotes('')
      await load()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Review failed')
    } finally {
      setActing(false)
    }
  }

  if (loading && !data) {
    return <p className="text-sm text-slate-500">Loading host…</p>
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Host not found.
          <div className="mt-3">
            <Link href="/admin/housing/hosts">
              <Button variant="outline">Back to hosts</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const host = data.host
  const hostType = (host.host_type as HostType) || 'private_landlord'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/housing/hosts"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          All hosts
        </Link>
        <Button variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{String(host.display_name || host.company_name || 'Host')}</CardTitle>
            <Badge variant="secondary">{HOST_TYPE_LABELS[hostType]}</Badge>
            {host.onboarding_completed ? (
              <Badge>Onboarded</Badge>
            ) : (
              <Badge variant="outline">Incomplete onboarding</Badge>
            )}
            {host.identity_review_status === 'pending' ? (
              <Badge className="border-0 bg-amber-100 text-amber-900">Name review pending</Badge>
            ) : null}
            {host.identity_review_status === 'approved' ? (
              <Badge className="border-0 bg-emerald-100 text-emerald-900">Name approved</Badge>
            ) : null}
            {host.identity_review_status === 'rejected' ? (
              <Badge variant="destructive">Name rejected</Badge>
            ) : null}
          </div>
          <p className={ADMIN_HELPER_TEXT}>
            {String(host.email || '—')}
            {host.kvk_number ? ` · KvK ${host.kvk_number}` : ''}
            {host.phone ? ` · ${host.phone}` : ''}
            {' · '}
            joined {new Date(String(host.created_at)).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>

      {host.identity_review_status === 'pending' ? (
        <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="text-base">Organisation name claim</CardTitle>
            <p className={ADMIN_HELPER_TEXT}>
              This host asked to use a known housing organisation name. Approve only if they are
              authorised to represent that brand.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Matched organisation</p>
                <p className="font-medium">{String(host.identity_review_matched_org || '—')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Requested display name</p>
                <p className="font-medium">
                  {String(host.identity_review_display_name || '—')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Requested company name</p>
                <p className="font-medium">
                  {String(host.identity_review_company_name || '—')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Live name (students see now)</p>
                <p className="font-medium">{String(host.display_name || '—')}</p>
              </div>
            </div>
            {host.identity_review_message ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {String(host.identity_review_message)}
              </p>
            ) : null}
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Optional review notes"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={acting}
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => void reviewIdentity('approve')}
              >
                Approve name
              </Button>
              <Button
                disabled={acting}
                variant="ghost"
                className="text-rose-600"
                onClick={() => void reviewIdentity('reject')}
              >
                Reject claim
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Listings ({data.listings.length})</h2>
        {!data.listings.length ? (
          <p className={ADMIN_HELPER_TEXT}>No listings yet.</p>
        ) : (
          <div className="space-y-2">
            {data.listings.map((l) => (
              <Card key={l.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className={ADMIN_HELPER_TEXT}>
                      {l.city} · €{Number(l.rent_monthly).toLocaleString()}/mo · seeking{' '}
                      {l.seeking_people}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{l.status}</Badge>
                    <Badge
                      variant={
                        l.moderation_status === 'approved'
                          ? 'default'
                          : l.moderation_status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {l.moderation_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <h2 className={ADMIN_SECTION_TITLE}>Rejection mix</h2>
          <Card>
            <CardContent className="space-y-2 p-4">
              {!data.rejection_distribution.length ? (
                <p className={ADMIN_HELPER_TEXT}>No rejections.</p>
              ) : (
                data.rejection_distribution.map((r) => (
                  <div key={r.code} className="flex justify-between text-sm">
                    <span className="capitalize">{r.code.replace(/_/g, ' ')}</span>
                    <span className="tabular-nums">{r.count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-2">
          <h2 className={ADMIN_SECTION_TITLE}>
            Recent decisions ({data.applications.length})
          </h2>
          {!data.applications.length ? (
            <p className={ADMIN_HELPER_TEXT}>No applications yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-3 py-2">Applicant</th>
                    <th className="px-3 py-2">Listing</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Fit</th>
                    <th className="px-3 py-2">Reject reason</th>
                    <th className="px-3 py-2">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.applications.map((a) => (
                    <tr key={a.id}>
                      <td className="px-3 py-2">
                        {a.anonymous_label || 'Applicant'}
                        {a.identity_revealed && a.applicant_user_ids ? (
                          <p className="font-mono text-[10px] text-slate-400">
                            {(a.applicant_user_ids as string[]).slice(0, 2).join(', ')}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{a.listing_title || '—'}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{a.status}</Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {a.fit_score != null ? Number(a.fit_score).toFixed(1) : '—'}
                      </td>
                      <td className="px-3 py-2 capitalize text-slate-500">
                        {a.rejection_reason_code?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
