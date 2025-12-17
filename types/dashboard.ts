/**
 * Dashboard Data Types
 * 
 * Type definitions for dashboard data structures
 */

export interface DashboardSummary {
  newMatchesCount: number
  unreadMessagesCount: number
  profileCompletion: number
}

export interface DashboardKPIs {
  avgCompatibility: number
  totalMatches: number
  activeChats: number
  toursScheduled: number
}

export interface TopMatch {
  id: string
  userId: string
  name: string
  score: number
  program: string
  university: string
  avatar?: string
}

export interface RecentActivity {
  id: string
  type: 'match' | 'message' | 'profile' | 'housing'
  action: string
  user: string
  userId?: string
  timestamp: string
  timeAgo: string
}

export interface Update {
  id: string
  version: string
  release_date: string
  changes: string[]
  change_type: 'major' | 'minor' | 'patch'
}

export interface DashboardData {
  summary: DashboardSummary
  kpis: DashboardKPIs
  topMatches: TopMatch[]
  recentActivity: RecentActivity[]
}

