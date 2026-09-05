'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { AdminStatCard } from '@/components/admin/stat-card'
import { ADMIN_HELPER_TEXT, ADMIN_SECTION_TITLE } from '@/lib/admin/ui'
import {
  Activity,
  BarChart3,
  Globe,
  LayoutDashboard,
  LineChart,
  Store,
} from 'lucide-react'
import type { MetricsSnapshot } from './metrics-types'

const DETAIL_LINKS = [
  {
    href: '/admin/metrics?tab=executive',
    title: 'Executive',
    description: 'Liquidity, time-to-match, match quality, onboarding, and at-risk students.',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/metrics?tab=engagement',
    title: 'Engagement',
    description: 'Live usage, traffic, journeys, geography, lifecycle, and security signals.',
    icon: Activity,
  },
  {
    href: '/admin/metrics?tab=marketplace',
    title: 'Marketplace',
    description: 'Supply and demand, conversion funnel, trust, and placement NPS.',
    icon: Store,
  },
  {
    href: '/admin/metrics?tab=retention',
    title: 'Retention',
    description: 'Cohort stickiness and programme coverage over time.',
    icon: LineChart,
  },
  {
    href: '/admin/metrics?tab=footprint',
    title: 'Footprint',
    description: 'Distribution across universities, programmes, and study years.',
    icon: Globe,
  },
]

type Props = {
  metrics: MetricsSnapshot
}

export function MetricsOverviewPanel({ metrics }: Props) {
  const totalUsers = metrics.totalUsers ?? 0
  const verifiedUsers = metrics.verifiedUsers ?? 0
  const verificationRate =
    totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Snapshot</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard
            label="Total users"
            value={totalUsers.toLocaleString()}
            hint={`${(metrics.signupsLast7Days ?? 0).toLocaleString()} new in the last 7 days`}
          />
          <AdminStatCard
            label="Verified users"
            value={verifiedUsers.toLocaleString()}
            hint={`${verificationRate}% verification rate`}
          />
          <AdminStatCard
            label="Total matches"
            value={(metrics.totalMatches ?? 0).toLocaleString()}
            hint={`${(metrics.matchActivity ?? 0).toLocaleString()} this week`}
          />
          <AdminStatCard
            label="Active chats"
            value={(metrics.activeChats ?? 0).toLocaleString()}
            hint="Open conversations"
          />
          <AdminStatCard
            label="New users (30 days)"
            value={(metrics.signupsLast30Days ?? 0).toLocaleString()}
            hint={`${(metrics.signupsLast7Days ?? 0).toLocaleString()} in the last 7 days`}
          />
          <AdminStatCard
            label="Pending reports"
            value={(metrics.reportsPending ?? 0).toLocaleString()}
            hint="Open safety reports"
          />
        </div>
      </section>

      <section>
        <h2 className={ADMIN_SECTION_TITLE}>Explore in detail</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DETAIL_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="min-w-0">
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500" aria-hidden />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {item.title}
                      </p>
                    </div>
                    <p className={`leading-relaxed ${ADMIN_HELPER_TEXT}`}>{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          <Link href="/admin/lab" className="min-w-0">
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" aria-hidden />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Domu Lab</p>
                </div>
                <p className={`leading-relaxed ${ADMIN_HELPER_TEXT}`}>
                  Ranked feature wishes and the focus-group pipeline.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
