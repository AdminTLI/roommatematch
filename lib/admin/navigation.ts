import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Shield,
  Layers,
  BarChart3,
  Settings,
} from 'lucide-react'

export type AdminHubId =
  | 'overview'
  | 'people'
  | 'safety'
  | 'platform'
  | 'insights'
  | 'system'

export interface AdminHubDefinition {
  id: AdminHubId
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export interface AdminSectionTab {
  id: string
  label: string
  href: string
  /** Hide tab unless user is super admin */
  superAdminOnly?: boolean
}

export const ADMIN_HUBS: AdminHubDefinition[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Command center — queues, KPIs, and system health',
  },
  {
    id: 'people',
    label: 'People',
    href: '/admin/people',
    icon: Users,
    description: 'Users, registration funnel, roles, and identity verification',
  },
  {
    id: 'safety',
    label: 'Safety',
    href: '/admin/safety',
    icon: Shield,
    description: 'User reports and flagged messages',
  },
  {
    id: 'platform',
    label: 'Platform',
    href: '/admin/platform',
    icon: Layers,
    description: 'Matches, matching controls, and chat moderation',
  },
  {
    id: 'insights',
    label: 'Insights',
    href: '/admin/insights',
    icon: BarChart3,
    description: 'Institutional metrics and questionnaire analytics',
  },
  {
    id: 'system',
    label: 'System',
    href: '/admin/system',
    icon: Settings,
    description: 'Settings, logs, security, privacy, and support',
  },
]

/** All routes belonging to each hub (for active-state matching). */
export const ADMIN_HUB_ROUTE_MAP: Record<AdminHubId, string[]> = {
  overview: ['/admin'],
  people: [
    '/admin/people',
    '/admin/users',
    '/admin/verifications',
  ],
  safety: ['/admin/safety', '/admin/reports'],
  platform: ['/admin/platform', '/admin/matches', '/admin/matching', '/admin/chats'],
  insights: ['/admin/insights', '/admin/metrics', '/admin/analytics'],
  system: [
    '/admin/system',
    '/admin/settings',
    '/admin/logs',
    '/admin/security',
    '/admin/dsar',
    '/admin/support',
    '/admin/bug-reports',
    '/admin/audit',
    '/admin/retention',
  ],
}

export const ADMIN_SECTION_TABS: Record<Exclude<AdminHubId, 'overview'>, AdminSectionTab[]> = {
  people: [
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'workflow', label: 'Registration', href: '/admin/users?tab=workflow' },
    { id: 'roles', label: 'Roles', href: '/admin/users?tab=roles', superAdminOnly: true },
    { id: 'verifications', label: 'Verifications', href: '/admin/verifications' },
  ],
  safety: [
    { id: 'reports', label: 'Reports', href: '/admin/reports' },
    { id: 'flagged', label: 'Flagged', href: '/admin/reports?tab=flagged' },
  ],
  platform: [
    { id: 'matches', label: 'Matches', href: '/admin/matches' },
    { id: 'matching', label: 'Matching', href: '/admin/matching', superAdminOnly: true },
    { id: 'chats', label: 'Chats', href: '/admin/chats' },
  ],
  insights: [
    { id: 'metrics', label: 'Metrics', href: '/admin/metrics' },
    { id: 'executive', label: 'Executive', href: '/admin/metrics?tab=executive' },
    { id: 'engagement', label: 'Engagement', href: '/admin/metrics?tab=engagement' },
    { id: 'marketplace', label: 'Marketplace', href: '/admin/metrics?tab=marketplace' },
    { id: 'retention', label: 'Retention', href: '/admin/metrics?tab=retention' },
    { id: 'footprint', label: 'Footprint', href: '/admin/metrics?tab=footprint' },
    { id: 'questionnaire', label: 'Questionnaire', href: '/admin/metrics?tab=questionnaire' },
  ],
  system: [
    { id: 'settings', label: 'Settings', href: '/admin/settings', superAdminOnly: true },
    { id: 'logs', label: 'Ops Logs', href: '/admin/logs' },
    { id: 'audit', label: 'Audit Log', href: '/admin/audit' },
    { id: 'security', label: 'Security', href: '/admin/security' },
    { id: 'dsar', label: 'Privacy & DSAR', href: '/admin/dsar' },
    { id: 'support', label: 'Support', href: '/admin/support' },
    { id: 'bugs', label: 'Bug Reports', href: '/admin/bug-reports' },
    { id: 'retention', label: 'Retention', href: '/admin/retention' },
  ],
}

export function resolveAdminHub(pathname: string | null): AdminHubId {
  if (!pathname?.startsWith('/admin')) return 'overview'

  let bestHub: AdminHubId = 'overview'
  let bestLen = 0

  for (const hub of ADMIN_HUBS) {
    for (const route of ADMIN_HUB_ROUTE_MAP[hub.id]) {
      const base = route.split('?')[0]
      const matches =
        pathname === base ||
        (base !== '/admin' && pathname.startsWith(`${base}/`)) ||
        pathname.startsWith(`${base}?`)

      if (matches && base.length >= bestLen) {
        bestLen = base.length
        bestHub = hub.id
      }
    }
  }

  return bestHub
}

export function isAdminRouteActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  const base = href.split('?')[0]
  if (pathname === base) return true
  if (base !== '/admin' && pathname.startsWith(`${base}/`)) return true
  if (href.includes('?')) {
    return pathname === href || pathname.startsWith(`${base}?`)
  }
  return false
}

export function isSectionTabActive(pathname: string | null, searchParams: URLSearchParams | null, tab: AdminSectionTab): boolean {
  if (!pathname) return false
  const [base, query] = tab.href.split('?')
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return false
  if (!query) {
    if (tab.id === 'users' && pathname === '/admin/users' && !searchParams?.get('tab')) return true
    if (tab.id === 'reports' && pathname === '/admin/reports' && !searchParams?.get('tab')) return true
    if (tab.id === 'metrics' && pathname === '/admin/metrics' && !searchParams?.get('tab')) return true
    if (tab.id === 'matches' && pathname === '/admin/matches') return true
    return pathname === base && !searchParams?.get('tab')
  }
  const tabParams = new URLSearchParams(query)
  for (const [key, value] of tabParams.entries()) {
    if (searchParams?.get(key) !== value) return false
  }
  return true
}
