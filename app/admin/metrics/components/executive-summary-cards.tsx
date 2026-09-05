'use client'

import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ADMIN_CARD_TITLE, ADMIN_HELPER_TEXT } from '@/lib/admin/ui'

export type ExecutiveSummaryData = {
  liquidity: {
    topUniversities: Array<{
      university_id: string | null
      university_name: string
      active_users: number
    }>
    totalActiveUsers: number
  }
  velocity: {
    averageTimeToFirstMatchDays: number
    sampleSize: number
  }
  matchQuality: {
    activeMatches: number
    matchesWith5PlusMessages: number
    conversationRate: number
  }
  onboarding: {
    totalUsers: number
    completedOnboarding: number
    completionRate: number
  }
}

type Props = {
  data: ExecutiveSummaryData | undefined
  isPending: boolean
}

export const ExecutiveSummaryCards = memo(function ExecutiveSummaryCards({ data, isPending }: Props) {
  if (isPending && !data) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-24 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { liquidity, velocity, matchQuality, onboarding } = data

  const averageDays =
    typeof velocity.averageTimeToFirstMatchDays === 'number' ? velocity.averageTimeToFirstMatchDays : 0

  const conversationRate =
    typeof matchQuality.conversationRate === 'number' ? matchQuality.conversationRate : 0

  const onboardingRate = typeof onboarding.completionRate === 'number' ? onboarding.completionRate : 0

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={ADMIN_CARD_TITLE}>Marketplace liquidity</CardTitle>
          <CardDescription>Students currently looking for a roommate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {liquidity.totalActiveUsers.toLocaleString()}
          </div>
          <p className={ADMIN_HELPER_TEXT}>
            Across {liquidity.topUniversities.length || 0} universities
          </p>
          {liquidity.topUniversities.length > 0 ? (
            <div className="space-y-1.5">
              {liquidity.topUniversities.map((u) => (
                <div key={u.university_id ?? u.university_name} className="flex justify-between text-sm">
                  <span className="mr-2 truncate text-gray-700 dark:text-gray-300">{u.university_name}</span>
                  <span className="font-medium tabular-nums">{u.active_users.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={ADMIN_CARD_TITLE}>Time to first match</CardTitle>
          <CardDescription>Average days from signup to a confirmed match</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {averageDays.toFixed(1)}{' '}
            <span className={`text-sm font-normal ${ADMIN_HELPER_TEXT}`}>days</span>
          </div>
          <p className={ADMIN_HELPER_TEXT}>
            Based on {velocity.sampleSize.toLocaleString()} matched students
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={ADMIN_CARD_TITLE}>Match quality</CardTitle>
          <CardDescription>Matches that become real conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {conversationRate.toFixed(1)}%
          </div>
          <Progress value={conversationRate} />
          <p className={ADMIN_HELPER_TEXT}>
            {matchQuality.matchesWith5PlusMessages.toLocaleString()} of{' '}
            {matchQuality.activeMatches.toLocaleString()} active matches reached 5+ messages
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={ADMIN_CARD_TITLE}>Onboarding</CardTitle>
          <CardDescription>Students who finished the questionnaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {onboardingRate.toFixed(1)}%
          </div>
          <Progress value={onboardingRate} />
          <p className={ADMIN_HELPER_TEXT}>
            {onboarding.completedOnboarding.toLocaleString()} of {onboarding.totalUsers.toLocaleString()}{' '}
            active users
          </p>
        </CardContent>
      </Card>
    </div>
  )
})
