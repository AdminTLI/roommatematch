'use client'

import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, MessageSquare, CheckCircle2 } from 'lucide-react'

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Marketplace Liquidity
          </CardTitle>
          <CardDescription>Active students currently looking for a roommate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold">{liquidity.totalActiveUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across top {liquidity.topUniversities.length || 0} universities
          </p>
          {liquidity.topUniversities.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {liquidity.topUniversities.map((u) => (
                <div key={u.university_id ?? u.university_name} className="flex justify-between text-xs">
                  <span className="truncate mr-2">{u.university_name}</span>
                  <span className="font-semibold">{u.active_users.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Time-to-Value Velocity
          </CardTitle>
          <CardDescription>Average time from signup to first confirmed match</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold">
            {averageDays.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {velocity.sampleSize.toLocaleString()} matched students
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Match Quality
          </CardTitle>
          <CardDescription>Share of matches that turn into real conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{conversationRate.toFixed(1)}%</span>
          </div>
          <Progress value={conversationRate} />
          <p className="text-xs text-muted-foreground">
            {matchQuality.matchesWith5PlusMessages.toLocaleString()} of{' '}
            {matchQuality.activeMatches.toLocaleString()} active matches reached 5+ messages
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Onboarding Completion
          </CardTitle>
          <CardDescription>Students who finished the full questionnaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{onboardingRate.toFixed(1)}%</span>
          </div>
          <Progress value={onboardingRate} />
          <p className="text-xs text-muted-foreground">
            {onboarding.completedOnboarding.toLocaleString()} of {onboarding.totalUsers.toLocaleString()} active users
          </p>
        </CardContent>
      </Card>
    </div>
  )
})
