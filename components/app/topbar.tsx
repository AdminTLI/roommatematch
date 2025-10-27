'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Users,
  Menu,
  Sun,
  Moon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/app/(components)/notifications/notification-bell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserDropdown } from './user-dropdown'

interface TopbarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}


export function Topbar({ user }: TopbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-surface-0/95 backdrop-blur-sm border-b border-line"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left side - Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-ink-900">Roommate Match</h1>
              <p className="text-xs text-ink-500">Find your perfect match</p>
            </div>
          </Link>
        </div>

        {/* Right side - Search, Actions, User */}
        <div className="flex items-center gap-3">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search matches, messages..."
                className="w-64 pl-10 pr-4 py-2 bg-surface-1 border border-line rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <NotificationBell userId={user.id} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>
    </motion.header>
  )
}
