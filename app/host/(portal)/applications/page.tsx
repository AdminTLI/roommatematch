'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { REJECTION_REASON_CODES } from '@/lib/host/types'
import {
  HostApplicationCard,
  type HostApplicationCardData,
} from '@/components/host/host-application-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FitBucket = 'all' | 'strong' | 'ok' | 'weak'
type DimBucket = 'all' | 'high' | 'medium' | 'low'

function fitBucket(score: number | null | undefined): FitBucket {
  const pct = Math.round(Number(score || 0) * 100)
  if (pct >= 75) return 'strong'
  if (pct >= 50) return 'ok'
  return 'weak'
}

function dimBucket(score: number | null | undefined): DimBucket {
  const pct = Math.round(Number(score || 0) * 100)
  if (pct >= 70) return 'high'
  if (pct >= 45) return 'medium'
  return 'low'
}

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

export default function HostApplicationsPage() {
  return (
    <Suspense fallback={<p className="text-ink-500">Loading…</p>}>
      <HostApplicationsContent />
    </Suspense>
  )
}

function HostApplicationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingFromUrl = searchParams.get('listing') || 'all'

  const [apps, setApps] = useState<HostApplicationCardData[]>([])
  const [listings, setListings] = useState<Array<{ id: string; title: string }>>([])
  const [hostType, setHostType] = useState<'private_landlord' | 'agency'>('private_landlord')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState<(typeof REJECTION_REASON_CODES)[number]>('lifestyle_fit')
  const [loading, setLoading] = useState(true)

  const [listingFilter, setListingFilter] = useState(listingFromUrl)
  const [statusFilter, setStatusFilter] = useState('all')
  const [overallFit, setOverallFit] = useState<FitBucket>('all')
  const [budgetFit, setBudgetFit] = useState<DimBucket>('all')
  const [timelineFit, setTimelineFit] = useState<DimBucket>('all')
  const [lifestyleFit, setLifestyleFit] = useState<DimBucket>('all')
  const [gatesOnly, setGatesOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [groupFilter, setGroupFilter] = useState<'all' | 'solo' | 'group'>('all')

  const isAgency = hostType === 'agency'
  const acceptLabel = isAgency ? 'Accept applicant' : 'Accept & chat'
  const rejectLabel = isAgency ? 'Pass' : 'Not a fit'

  const setListingFilterAndUrl = (value: string) => {
    setListingFilter(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('listing')
    } else {
      params.set('listing', value)
    }
    const qs = params.toString()
    router.replace(qs ? `/host/applications?${qs}` : '/host/applications', { scroll: false })
  }

  const load = () =>
    fetch('/api/host/applications')
      .then((r) => r.json())
      .then((j) => {
        setApps(j.applications || [])
        setListings(j.listings || [])
        if (j.host_type) setHostType(j.host_type)
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    setListingFilter(listingFromUrl)
  }, [listingFromUrl])

  const act = async (
    id: string,
    action: 'shortlist' | 'accept' | 'send_offer' | 'reject'
  ) => {
    const body =
      action === 'reject'
        ? { action, rejection_reason_code: reason }
        : { action }
    const res = await fetchWithCSRF(`/api/host/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const j = await res.json().catch(() => ({}))
      setRejectId(null)
      await load()
      if (action === 'accept' && j.chat_id) {
        router.push(`/host/messages?chatId=${j.chat_id}`)
      }
    }
  }

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (listingFilter !== 'all' && app.listing_id !== listingFilter) return false
      if (statusFilter !== 'all' && app.status !== statusFilter) return false
      if (overallFit !== 'all' && fitBucket(app.fit_score) !== overallFit) return false
      if (budgetFit !== 'all' && dimBucket(app.score_breakdown?.budget) !== budgetFit) return false
      if (timelineFit !== 'all' && dimBucket(app.score_breakdown?.timeline) !== timelineFit)
        return false
      if (lifestyleFit !== 'all' && dimBucket(app.score_breakdown?.lifestyle) !== lifestyleFit)
        return false
      if (gatesOnly && !app.hard_gates_passed) return false
      if (
        verifiedOnly &&
        !(app.verification_badges || []).some((b) =>
          ['id_verified', 'university_email'].includes(b)
        )
      )
        return false
      if (groupFilter === 'solo' && app.group_size > 1) return false
      if (groupFilter === 'group' && app.group_size <= 1) return false
      return true
    })
  }, [
    apps,
    listingFilter,
    statusFilter,
    overallFit,
    budgetFit,
    timelineFit,
    lifestyleFit,
    gatesOnly,
    verifiedOnly,
    groupFilter,
  ])

  const activeFilterCount = [
    listingFilter !== 'all',
    statusFilter !== 'all',
    overallFit !== 'all',
    budgetFit !== 'all',
    timelineFit !== 'all',
    lifestyleFit !== 'all',
    gatesOnly,
    verifiedOnly,
    groupFilter !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setListingFilterAndUrl('all')
    setStatusFilter('all')
    setOverallFit('all')
    setBudgetFit('all')
    setTimelineFit('all')
    setLifestyleFit('all')
    setGatesOnly(false)
    setVerifiedOnly(false)
    setGroupFilter('all')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Applications</h1>
        <p className="text-sm text-ink-500">
          {isAgency
            ? 'Filter pipeline by fit. Names stay hidden until you Accept.'
            : 'Find a good fit faster. Names stay hidden until you Accept & chat.'}
        </p>
      </header>

      <div className="space-y-3 rounded-3xl border border-white/60 bg-white/55 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink-800 dark:text-zinc-100">
            {isAgency ? 'Filter pipeline' : 'Find a good fit faster'}
            {activeFilterCount > 0 ? (
              <span className="ml-2 text-ink-400">({activeFilterCount} active)</span>
            ) : null}
          </p>
          {activeFilterCount > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <select
            className={selectClass}
            value={listingFilter}
            onChange={(e) => setListingFilterAndUrl(e.target.value)}
          >
            <option value="all">All listings</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="submitted">New</option>
            <option value="under_review">In review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Chatting</option>
            <option value="offer_pending">Offer sent</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className={selectClass}
            value={overallFit}
            onChange={(e) => setOverallFit(e.target.value as FitBucket)}
          >
            <option value="all">Overall fit</option>
            <option value="strong">Strong</option>
            <option value="ok">OK</option>
            <option value="weak">Weak</option>
          </select>
          <select
            className={selectClass}
            value={budgetFit}
            onChange={(e) => setBudgetFit(e.target.value as DimBucket)}
          >
            <option value="all">Budget alignment</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className={selectClass}
            value={timelineFit}
            onChange={(e) => setTimelineFit(e.target.value as DimBucket)}
          >
            <option value="all">Move-in timing</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className={selectClass}
            value={lifestyleFit}
            onChange={(e) => setLifestyleFit(e.target.value as DimBucket)}
          >
            <option value="all">Lifestyle alignment</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className={selectClass}
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as 'all' | 'solo' | 'group')}
          >
            <option value="all">Solo or group</option>
            <option value="solo">Solo</option>
            <option value="group">Group</option>
          </select>
          <div className="flex flex-wrap items-center gap-3 px-1">
            <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={gatesOnly}
                onChange={(e) => setGatesOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Pass house rules
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Verified
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-500">Loading…</p>
      ) : apps.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/40 p-8 text-center text-ink-500 backdrop-blur-xl">
          No applications yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/40 p-8 text-center text-ink-500 backdrop-blur-xl">
          No applicants match these filters — try widening budget or move-in.
          <button
            type="button"
            onClick={clearFilters}
            className={cn('mt-2 block w-full text-sm font-medium text-indigo-600 hover:underline')}
          >
            Clear filters
          </button>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3 xl:gap-8">
          {filtered.map((app) => (
            <HostApplicationCard
              key={app.id}
              app={app}
              rejectId={rejectId}
              reason={reason}
              reasonOptions={REJECTION_REASON_CODES}
              acceptLabel={acceptLabel}
              rejectLabel={rejectLabel}
              onReasonChange={(value) =>
                setReason(value as (typeof REJECTION_REASON_CODES)[number])
              }
              onShortlist={() => act(app.id, 'shortlist')}
              onAccept={() => act(app.id, 'accept')}
              onSendOffer={() => act(app.id, 'send_offer')}
              onRejectOpen={() => setRejectId(app.id)}
              onRejectConfirm={() => act(app.id, 'reject')}
              onRejectCancel={() => setRejectId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
