export type MetricsSnapshot = {
  totalUsers: number
  verifiedUsers: number
  activeChats: number
  totalMatches: number
  reportsPending: number
  signupsLast7Days: number
  signupsLast30Days: number
  verificationRate: number
  matchActivity: number
  universityStats?: Array<{
    university_name: string
    total_users: number
    verified_users: number
  }>
  programStats?: Array<{
    program_name: string
    university_name: string
    total_users: number
  }>
  studyYearDistribution?: Array<{
    study_year: number
    count: number
  }>
}

export type ConversionFunnelData = {
  totalMatches: number
  totalAgreements: number
  matchesLast7Days: number
  conversionRate: number
  weeklyConversion: Array<{
    week: string
    matches: number
    agreements: number
    rate: number
  }>
  funnelSteps?: Array<{
    step: string
    count: number
    dropOff: number
    dropOffRate: number
  }>
  overallConversionRate?: number
  totalSignups?: number
}

export type UserLifecycleData = {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  engagedUsers: number
  lifecycleStage: Record<string, number>
  engagementScore: number
  averageSessionDuration: number
  averageSessionsPerUser: number
  engagementTrend: Array<{
    date: string
    score: number
  }>
}

export type SecurityData = {
  timeSeries: Array<{
    date: string
    failed_login: number
    suspicious_activity: number
    rls_violation: number
    verification_failure: number
    rate_limit_exceeded: number
    total: number
  }>
  totals: {
    failed_login: number
    suspicious_activity: number
    rls_violation: number
    verification_failure: number
    rate_limit_exceeded: number
    total: number
  }
}

export type CoverageData = {
  totalInstitutions: number
  completeInstitutions: number
  incompleteInstitutions: number
  missingInstitutions: number
  totalProgrammes: number
  institutions: Array<{
    id: string
    label: string
    status: 'complete' | 'incomplete' | 'missing'
    totalProgrammes: number
  }>
}

export type CohortRetentionData = {
  cohorts: Array<{
    cohortDate: string
    cohortSize: number
    day1Retention: number
    day7Retention: number
    day30Retention: number
    day90Retention: number
  }>
  averageRetention: {
    day1: number
    day7: number
    day30: number
    day90: number
  }
}

export type RealtimeData = {
  activeUsers: number
  activeSessions: number
  eventsLast5Min: number
}

export type TrafficSourcesData = {
  sources: Array<{
    source: string
    count: number
    percentage: number
  }>
  campaigns: Array<{
    campaign: string
    count: number
    percentage: number
  }>
  timeSeries: Array<{
    date: string
    organic: number
    direct: number
    paid: number
    social: number
    email: number
    referral: number
    total: number
  }>
}

export type UserFlowsData = {
  topPaths: Array<{
    path: string
    count: number
    percentage: number
  }>
  dropOffs: Array<{
    page: string
    entries: number
    exits: number
    dropOffRate: number
  }>
  totalSessions: number
}

export type GeographicData = {
  countries: Array<{
    code: string
    name: string
    userCount: number
  }>
  cities: Array<{
    city: string
    userCount: number
  }>
  regions: Array<{
    region: string
    userCount: number
  }>
  totalUsers: number
}

export type WellnessAnalyticsData = {
  overall: {
    totalResponses: number
    day14Responses: number
    day30Responses: number
    foundHousingRate: number
    foundWithMatchRate: number
    reducedStressRate: number
  }
  bySurveyType: Array<{
    surveyType: 'day_14' | 'day_30'
    label: string
    totalResponses: number
    foundHousingRate: number
    foundWithMatchRate: number | null
    reducedStressRate: number
  }>
  timeSeries: Array<{
    date: string
    surveyType: 'day_14' | 'day_30'
    totalResponses: number
    foundHousing: number
    foundWithMatch: number
    reducedStress: number
  }>
}
