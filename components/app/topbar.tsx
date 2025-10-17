'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  Menu,
  Sun,
  Moon
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

export function Topbar({ user }: TopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-surface-0/95 backdrop-blur-sm border-b border-line"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search matches, messages..."
              className="w-full pl-10 pr-4 py-2 bg-surface-1 border border-line rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-line">
            <div className="text-right">
              <p className="text-body-sm font-medium text-ink-900">
                {user.name || 'User'}
              </p>
              <p className="text-body-xs text-ink-500">
                {user.email}
              </p>
            </div>
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-600 font-semibold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
