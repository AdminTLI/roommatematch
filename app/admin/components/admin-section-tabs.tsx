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

/**
 * Underline section tabs for admin hubs.
 * Uses role="navigation" on a div (not <nav>) so global `nav { overflow-x: hidden }`
 * cannot coerce overflow-y to auto and show a 1px scrollbar.
 */
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
    <div
      role="navigation"
      aria-label="Section navigation"
      className="flex flex-wrap items-end gap-x-6 gap-y-1 overflow-visible border-b border-gray-200 dark:border-slate-700"
    >
      {visibleTabs.map((tab) => {
        const active = isSectionTabActive(pathname, searchParams, tab)
        const count = badgeCounts?.[tab.id]

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
              active
                ? 'mb-[-1px] border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-50'
                : 'mb-[-1px] border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200'
            )}
          >
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'h-5 min-w-[1.25rem] px-1.5 text-[10px] font-semibold',
                  active
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                )}
              >
                {count > 99 ? '99+' : count}
              </Badge>
            )}
          </Link>
        )
      })}
    </div>
  )
}
