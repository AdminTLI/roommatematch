'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  House,
  Settings,
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileChatChrome } from '@/components/app/mobile-chat-chrome-context'
import { ADMIN_HUBS, ADMIN_HUB_ROUTE_MAP, type AdminHubId } from '@/lib/admin/navigation'

interface DockBadgeCounts {
  safety?: number
  people?: number
  system?: number
  overview?: boolean
  home?: number
  chats?: number
  applications?: number
}

const HOST_TABS = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/host' },
  { id: 'applications', label: 'Applications', icon: Users, href: '/host/applications' },
  { id: 'viewings', label: 'Viewings', icon: CalendarDays, href: '/host/viewings' },
  { id: 'chats', label: 'Chats', icon: MessageCircle, href: '/host/messages' },
  { id: 'housing', label: 'Housing', icon: House, href: '/host/listings' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/host/settings' },
] as const

const STUDENT_TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'matches', label: 'Connect', icon: Users, href: '/matches' },
  { id: 'chats', label: 'Chats', icon: MessageCircle, href: '/chat' },
  { id: 'housing', label: 'Housing', icon: House, href: '/housing' },
  { id: 'safety', label: 'Safety', icon: Shield, href: '/safety' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
] as const

type DockContext = 'user' | 'admin' | 'partner' | 'university' | 'host'

function resolveActiveHub(pathname: string): AdminHubId {
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

function isHostTabActive(pathname: string, href: string, id: string) {
  if (id === 'home') return pathname === '/host'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function useOpenDialogPresent() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      setOpen(
        Boolean(
          document.querySelector(
            '[role="dialog"][data-state="open"], [data-radix-dialog-overlay][data-state="open"]'
          )
        )
      )
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    })
    return () => observer.disconnect()
  }, [])

  return open
}

export function FloatingDock({ context = 'user' }: { context?: DockContext }) {
  const pathname = usePathname() ?? ''
  const { activeMobileConversation } = useMobileChatChrome()
  const dialogOpen = useOpenDialogPresent()
  const [badges, setBadges] = useState<DockBadgeCounts>({})

  const isAdminRoute =
    context === 'admin' ||
    context === 'partner' ||
    context === 'university' ||
    pathname.startsWith('/admin')
  const isHostRoute = context === 'host' || pathname.startsWith('/host')

  useEffect(() => {
    if (!pathname.startsWith('/admin')) return

    const loadBadges = async () => {
      try {
        const [metricsRes, opsRes, dsarRes, verificationsRes, flaggedRes] = await Promise.all([
          fetch('/api/admin/dashboard-metrics?period=all'),
          fetch('/api/admin/ops-log/summary'),
          fetch('/api/admin/dsar/stats'),
          fetch('/api/admin/verifications?status=pending'),
          fetch('/api/admin/messages/flagged?limit=1'),
        ])

        const next: DockBadgeCounts = {}

        if (opsRes.ok) {
          const ops = await opsRes.json()
          next.overview = ops.overallHealth !== 'online'
          next.system = (next.system ?? 0) + (ops.overallHealth !== 'online' ? 1 : 0)
        }

        let pendingReports = 0
        let openBugs = 0
        if (metricsRes.ok) {
          const m = await metricsRes.json()
          pendingReports = m.pendingReports ?? 0
          openBugs = m.openBugReports ?? 0
          pendingReports += m.pendingLabReports ?? 0
        }

        let flagged = 0
        if (flaggedRes.ok) {
          const f = await flaggedRes.json()
          flagged = f.total ?? 0
        }
        next.safety = pendingReports + flagged

        if (dsarRes.ok) {
          const d = await dsarRes.json()
          next.system = (next.system ?? 0) + (d.overdue ?? 0) + (d.approaching ?? 0)
        }

        if (verificationsRes.ok) {
          const v = await verificationsRes.json()
          next.people = v.stats?.pending ?? 0
        }

        void openBugs
        setBadges(next)
      } catch {
        // ignore badge load failures
      }
    }

    loadBadges()
    const interval = setInterval(loadBadges, 60000)
    return () => clearInterval(interval)
  }, [pathname])

  useEffect(() => {
    if (!isHostRoute) return

    const loadHostBadges = async () => {
      try {
        const res = await fetch('/api/host/overview?badges=1')
        if (!res.ok) return
        const data = await res.json()
        setBadges({
          home: data.needsAttention ?? 0,
          chats: data.unreadMessages ?? 0,
          applications: data.newApplications ?? 0,
        })
      } catch {
        // ignore badge load failures
      }
    }

    loadHostBadges()
    const interval = setInterval(loadHostBadges, 60000)
    return () => clearInterval(interval)
  }, [isHostRoute, pathname])

  // Hide under sheets/dialogs so primary actions (e.g. Filters → Show places) stay tappable
  if (activeMobileConversation || dialogOpen) {
    return null
  }

  const tabs = isAdminRoute
    ? ADMIN_HUBS.map((hub) => ({
        id: hub.id,
        label: hub.label,
        icon: hub.icon,
        href: hub.href,
      }))
    : isHostRoute
      ? HOST_TABS.map((tab) => ({ ...tab }))
      : STUDENT_TABS.map((tab) => ({ ...tab }))

  const activeHub = isAdminRoute ? resolveActiveHub(pathname) : null

  const getBadge = (hubId: string): number | boolean | undefined => {
    if (isAdminRoute) {
      if (hubId === 'overview') return badges.overview
      if (hubId === 'safety') return badges.safety
      if (hubId === 'people') return badges.people
      if (hubId === 'system') return badges.system
      return undefined
    }
    if (isHostRoute) {
      if (hubId === 'home') return badges.home
      if (hubId === 'chats') return badges.chats
      if (hubId === 'applications') return badges.applications
    }
    return undefined
  }

  return (
    <div className="fixed bottom-4 inset-x-0 z-[1100] flex w-full justify-center px-2 sm:px-4 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pointer-events-auto bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-white/20 rounded-full p-2 sm:p-2.5 flex items-center justify-center shadow-[0_0_28px_rgba(15,23,42,0.08)] dark:shadow-[0_0_32px_rgba(0,0,0,0.4)] max-w-full"
      >
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[min(100vw-2rem,640px)] scrollbar-none">
          {tabs.map((tab) => {
            const isActive = isAdminRoute
              ? activeHub === tab.id
              : isHostRoute
                ? isHostTabActive(pathname, tab.href, tab.id)
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            const Icon = tab.icon
            const badge = getBadge(tab.id)
            const showDot = badge === true
            const showCount = typeof badge === 'number' && badge > 0

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative group shrink-0"
                title={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div
                  className={cn(
                    'relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-colors duration-200 z-10',
                    !isActive &&
                      'text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                    )}
                  />
                  {(showDot || showCount) && (
                    <span
                      className={cn(
                        'absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-red-500 text-white font-bold',
                        showCount ? 'min-w-[1rem] h-4 px-1 text-[9px]' : 'h-2.5 w-2.5'
                      )}
                    >
                      {showCount ? (badge > 99 ? '99+' : badge) : null}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
