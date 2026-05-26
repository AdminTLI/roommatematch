'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Building2,
  Heart,
  LayoutDashboard,
  Settings,
  Users2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', href: '/institution/dashboard', icon: LayoutDashboard },
  { name: 'Student journey', href: '/institution/students', icon: Users2 },
  { name: 'Matches', href: '/institution/matches', icon: Heart },
  { name: 'Settings', href: '/institution/settings', icon: Settings },
]

interface InstitutionShellProps {
  children: React.ReactNode
  user: { id: string; email: string; name: string; avatar?: string }
  institutionName: string
}

export function InstitutionShell({ children, user, institutionName }: InstitutionShellProps) {
  const pathname = usePathname()
  const isOnboarding = pathname?.startsWith('/institution/onboarding')

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950">
        <div className="mx-auto max-w-2xl px-4 py-10">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
              <Building2 className="h-5 w-5 text-teal-700 dark:text-teal-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-gray-500">Institution portal</div>
              <div className="truncate font-semibold text-gray-900 dark:text-gray-100">
                {institutionName}
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-right text-sm text-gray-500 truncate max-w-[220px]">
            {user.name}
            <div className="text-xs truncate">{user.email}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-xs text-gray-500">
            <Activity className="h-4 w-4 mb-2 text-teal-600" />
            Student data in this portal is anonymised. Contact your platform administrator for
            operational support.
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-6">{children}</main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full flex flex-col h-auto py-2 gap-1 text-[10px]',
                    active && 'text-teal-600 dark:text-teal-400'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name.split(' ')[0]}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function InstitutionPageHeader({
  title,
  description,
  icon: Icon = BarChart3,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wider">Institution insights</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
      )}
    </div>
  )
}
