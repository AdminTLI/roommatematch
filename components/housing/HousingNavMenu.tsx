'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, ChevronDown, FileText, Heart, House, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const HOUSING_NAV_ITEMS = [
  { href: '/housing', label: 'Browse', icon: Search, exact: true },
  { href: '/housing/saved', label: 'Saved', icon: Heart },
  { href: '/housing/viewings', label: 'Viewings', icon: CalendarDays },
  { href: '/housing/applications', label: 'Applications', icon: FileText },
] as const

function isHousingNavActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Topbar control: one Housing entry that opens browse + activity destinations. */
export function HousingNavMenu({ className }: { className?: string }) {
  const pathname = usePathname()
  const inHousing = Boolean(pathname?.startsWith('/housing'))
  // Radix useId mismatches under React 19.2 / Next 16 SSR — mount menu after hydration.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const trigger = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition',
        inHousing
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25',
        className
      )}
      aria-label="Housing menu"
    >
      <House className="h-4 w-4" />
      <span className="hidden sm:inline">Housing</span>
      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
    </button>
  )

  if (!mounted) return trigger

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {HOUSING_NAV_ITEMS.map((item, index) => {
          const Icon = item.icon
          const active = isHousingNavActive(
            pathname,
            item.href,
            'exact' in item ? item.exact : false
          )
          return (
            <div key={item.href}>
              {index === 1 && <DropdownMenuSeparator />}
              <DropdownMenuItem asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex cursor-pointer items-center gap-2',
                    active && 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && item.href === '/housing/saved' && 'fill-current')} />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Minimal in-page tabs for Saved / Viewings / Applications only. */
export function HousingSectionTabs({ className }: { className?: string }) {
  const pathname = usePathname()
  const tabs = HOUSING_NAV_ITEMS.filter((item) => item.href !== '/housing')

  return (
    <nav
      aria-label="Your housing activity"
      className={cn(
        'flex gap-1 border-b border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      {tabs.map(({ href, label }) => {
        const active = isHousingNavActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              '-mb-px border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition sm:px-4',
              active
                ? 'border-indigo-600 text-ink-900 dark:border-indigo-400 dark:text-white'
                : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
