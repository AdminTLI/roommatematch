import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getHostProfileForUser } from '@/lib/host/auth'
import { HostVerificationBanner } from '@/components/host/VerificationBanner'
import {
  Building2,
  ClipboardList,
  CalendarClock,
  MessageCircle,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

export default async function HostHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  const emailVerified = Boolean(user.email_confirmed_at) || host.email_verified
  const isAgency = host.host_type === 'agency'

  const admin = await createAdminClient()
  const { data: listings } = await admin
    .from('housing_listings')
    .select('id, title, status')
    .eq('host_id', host.id)

  const listingRows = listings || []
  const listingIds = listingRows.map((l) => l.id)
  const draftCount = listingRows.filter((l) => l.status === 'draft').length
  const publishedCount = listingRows.filter((l) =>
    ['published', 'active', 'approved', 'pending'].includes(String(l.status))
  ).length

  let recentApps: Array<{
    id: string
    anonymous_label: string | null
    fit_score: number | null
    status: string
    listing_title: string
  }> = []
  let newAppCount = 0
  let viewings: Array<{
    id: string
    scheduled_for: string
    status: string
    anonymous_label?: string | null
    listing_title: string
  }> = []
  let pendingViewings = 0
  let recentChats: Array<{
    chat_id: string
    listing_title: string
    label: string
  }> = []

  if (listingIds.length) {
    const { data: apps } = await admin
      .from('housing_applications')
      .select('id, listing_id, status, anonymous_label, fit_score, host_chat_id, created_at')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(40)

    const allApps = apps || []
    newAppCount = allApps.filter((a) =>
      ['submitted', 'under_review'].includes(a.status)
    ).length
    recentApps = allApps.slice(0, 4).map((a) => ({
      id: a.id,
      anonymous_label: a.anonymous_label,
      fit_score: a.fit_score,
      status: a.status,
      listing_title: listingRows.find((l) => l.id === a.listing_id)?.title || 'Listing',
    }))

    const { data: viewingRows } = await admin
      .from('tour_bookings')
      .select('id, listing_id, status, scheduled_for, anonymous_label')
      .in('listing_id', listingIds)
      .order('scheduled_for', { ascending: true })
      .limit(10)

    const vrows = viewingRows || []
    pendingViewings = vrows.filter((v) => v.status === 'scheduled').length
    viewings = vrows.slice(0, 4).map((v) => ({
      id: v.id,
      scheduled_for: v.scheduled_for,
      status: v.status,
      anonymous_label: v.anonymous_label,
      listing_title: listingRows.find((l) => l.id === v.listing_id)?.title || 'Listing',
    }))

    const chatApps = allApps.filter((a) => a.host_chat_id).slice(0, 4)
    recentChats = chatApps.map((a) => ({
      chat_id: a.host_chat_id as string,
      listing_title: listingRows.find((l) => l.id === a.listing_id)?.title || 'Listing',
      label: a.anonymous_label || 'Applicant',
    }))
  }

  const attentionItems = [
    {
      href: '/host/applications',
      label: isAgency ? 'New applications' : 'People who applied',
      count: newAppCount,
      icon: ClipboardList,
    },
    {
      href: '/host/viewings',
      label: isAgency ? 'Tours to confirm' : 'Viewings to confirm',
      count: pendingViewings,
      icon: CalendarClock,
    },
    {
      href: '/host/messages',
      label: 'Messages',
      count: recentChats.length ? undefined : 0,
      icon: MessageCircle,
      hint: recentChats.length ? `${recentChats.length} open` : 'None yet',
    },
    {
      href: '/host/listings',
      label: 'Draft listings',
      count: draftCount,
      icon: Building2,
    },
  ]

  return (
    <div className="space-y-8">
      <HostVerificationBanner
        emailVerified={emailVerified}
        verificationDeadlineAt={host.verification_deadline_at}
        createdAt={host.created_at}
      />

      <header className="space-y-2">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
          {isAgency ? 'Agency overview' : 'Host dashboard'}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Welcome, {host.display_name}
        </h1>
        <p className="max-w-xl text-ink-500">
          {isAgency
            ? 'See what needs attention across your listings, applicants, and tours.'
            : 'See who applied, confirm viewings, and chat after you Accept someone.'}
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-indigo-500" />
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Needs attention</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {attentionItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <item.icon className="mb-2 h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              <p className="text-sm text-ink-500">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink-900 dark:text-white">
                {typeof item.count === 'number' ? item.count : item.hint}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
              {isAgency ? 'Applicant inbox' : 'People who applied'}
            </h2>
            <Link
              href="/host/applications"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
            >
              Review all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <p className="text-sm text-ink-500">
              When students apply, they show up here ranked by house fit. Accept someone to unlock
              chat.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentApps.map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 dark:border-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-white">
                      {app.anonymous_label || 'Applicant'}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {app.listing_title} · {app.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-indigo-600">
                    {Math.round(Number(app.fit_score || 0) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
              {isAgency ? 'Tours' : 'Viewings'}
            </h2>
            <Link
              href="/host/viewings"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
            >
              Open viewings <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {viewings.length === 0 ? (
            <p className="text-sm text-ink-500">
              Viewing requests appear here. Confirm them so applicants know when to show up.
            </p>
          ) : (
            <ul className="space-y-2">
              {viewings.map((v) => (
                <li
                  key={v.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900 dark:text-white">
                      {v.listing_title}
                    </p>
                    <span
                      className={
                        v.status === 'confirmed'
                          ? 'rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200'
                          : v.status === 'scheduled' || v.status === 'requested'
                            ? 'rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200'
                            : 'rounded-full bg-zinc-500/12 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300'
                      }
                    >
                      {v.status === 'scheduled'
                        ? 'Needs confirmation'
                        : v.status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {v.anonymous_label || 'Applicant'} ·{' '}
                    {new Date(v.scheduled_for).toLocaleString('nl-NL', {
                      timeZone: 'Europe/Amsterdam',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Messages</h2>
            <Link
              href="/host/messages"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
            >
              Open chats <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentChats.length === 0 ? (
            <p className="text-sm text-ink-500">
              After you Accept an applicant, your conversation appears here.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentChats.map((c) => (
                <li key={c.chat_id}>
                  <Link
                    href={`/host/messages?chatId=${c.chat_id}`}
                    className="block rounded-xl border border-slate-100 px-3 py-2 hover:bg-white/70 dark:border-white/10"
                  >
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-white">
                      {c.label}
                    </p>
                    <p className="truncate text-xs text-ink-500">{c.listing_title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Listings</h2>
            <Link
              href="/host/listings/wizard"
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> New listing
            </Link>
          </div>
          <p className="text-sm text-ink-500">
            {publishedCount} published · {draftCount} draft · {listingRows.length} total
          </p>
          <Link
            href="/host/listings"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
          >
            Manage listings <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
