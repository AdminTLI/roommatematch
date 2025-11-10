'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Users,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3,
  FileText,
  Database,
  Activity
} from 'lucide-react'

interface AdminSidebarProps {
  user: {
    id: string
    email?: string
  }
  adminRole: string
}

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Matches', href: '/admin/matches', icon: TrendingUp },
  { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  { name: 'Verifications', href: '/admin/verifications', icon: Shield },
  { name: 'Metrics', href: '/admin/metrics', icon: Activity },
  { name: 'Logs', href: '/admin/logs', icon: Database },
]

export function AdminSidebar({ user, adminRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {adminRole.replace('_', ' ')}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Back to App
          </Button>
        </Link>
      </div>
    </div>
  )
}


