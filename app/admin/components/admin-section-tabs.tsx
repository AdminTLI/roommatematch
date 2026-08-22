'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useIsSuperAdmin } from '@/lib/auth/roles-client'
import {
  ADMIN_SECTION_TABS,
  isSectionTabActive,
  type AdminHubId,
} from '@/lib/admin/navigation'

export interface TabBadgeCounts {
  [tabId: string]: number
}

interface AdminSectionTabsProps {
  hub: Exclude<AdminHubId, 'overview'>
  badgeCounts?: TabBadgeCounts
}

export function AdminSectionTabs({ hub, badgeCounts }: AdminSectionTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isSuperAdmin, isLoading } = useIsSuperAdmin()
  const tabs = ADMIN_SECTION_TABS[hub]

  const visibleTabs = tabs.filter((tab) => {
    if (tab.superAdminOnly && !isLoading && !isSuperAdmin) return false
    return true
  })

  if (visibleTabs.length === 0) return null

  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
      <nav
        className="inline-flex min-w-full items-center gap-1 rounded-full border border-border-subtle/60 bg-bg-surface-alt/80 p-1"
        aria-label="Section navigation"
      >
        {visibleTabs.map((tab) => {
          const active = isSectionTabActive(pathname, searchParams, tab)
          const count = badgeCounts?.[tab.id]

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              )}
            >
              {tab.label}
              {typeof count === 'number' && count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 min-w-[1.25rem] px-1 text-[10px] font-semibold',
                    active
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                  )}
                >
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
