'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Home,
  Award,
  FileText,
  Calendar,
  Shield,
  BarChart3,
  Video,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Matches', href: '/matches', icon: Users },
  { name: 'Housing', href: '/housing', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Agreements', href: '/agreements', icon: FileText },
  { name: 'Move-in', href: '/move-in', icon: Calendar },
  { name: 'Safety', href: '/safety', icon: Shield },
  { name: 'Reputation', href: '/reputation', icon: Award },
  { name: 'Video Intros', href: '/video-intros', icon: Video },
  { name: 'Admin', href: '/admin', icon: BarChart3 },
]

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-surface-0 border-r border-line">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 border-b border-line"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-h4 font-bold text-ink-900">Roommate Match</h1>
            <p className="text-body-xs text-ink-500">Find your perfect match</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3",
                    isActive && "bg-brand-600 text-white hover:bg-brand-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Chat' && (
                    <Badge variant="destructive" size="sm" className="ml-auto">
                      3
                    </Badge>
                  )}
                  {item.name === 'Matches' && (
                    <Badge variant="mint" size="sm" className="ml-auto">
                      New
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4 border-t border-line"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-1">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-brand-600 font-semibold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-ink-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-body-xs text-ink-500 truncate">
              {user.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-3 space-y-1">
          <Link href="/settings" onClick={onClose}>
            <Button variant="ghost" className="w-full justify-start gap-3 h-10">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </Link>
          
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
