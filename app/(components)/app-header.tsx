'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
// Removed useApp import - using default locale
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  Home,
  Award,
  FileText,
  Calendar,
  Shield,
  BarChart3,
  Video
} from 'lucide-react'
import { NotificationBell } from './notifications/notification-bell'
import { useState } from 'react'

interface AppHeaderProps {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
  }
}

export function AppHeader({ user }: AppHeaderProps) {
  // Using default English text instead of i18n
  const t = (key: string) => key // Simple fallback for translation keys
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // MVP hidden features - kept in code but hidden from UI
  const MVP_HIDDEN_ITEMS = ['Agreements', 'Reputation', 'Video Intros']
  
  // Super admin email - only this account can see Admin button
  const SUPER_ADMIN_EMAIL = 'demo@account.com'
  
  // Check if current user is super admin
  const isSuperAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  
  const allNavigationItems = [
    { name: 'Matches', href: '/matches', icon: Users },
    { name: 'Housing', href: '/housing', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Agreements', href: '/agreements', icon: FileText },
    { name: 'Move-in', href: '/move-in', icon: Calendar },
    { name: 'Safety', href: '/safety', icon: Shield },
    { name: 'Reputation', href: '/reputation', icon: Award },
    { name: 'Video Intros', href: '/video-intros', icon: Video },
    { name: 'Admin', href: '/admin', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings }
  ]
  
  // Filter navigation to hide MVP features and restrict Admin access
  const navigation = allNavigationItems.filter(item => {
    // Filter out MVP hidden items
    if (MVP_HIDDEN_ITEMS.includes(item.name)) {
      return false
    }
    
    // Filter out Admin unless user is super admin
    if (item.name === 'Admin' && !isSuperAdmin) {
      return false
    }
    
    return true
  })

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-4" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/matches" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image 
                src="/images/logo.png" 
                alt="Domu Match" 
                fill
                className="object-contain"
                priority
                sizes="32px"
                onError={(e) => {
                  // Hide image container if logo fails to load
                  const target = e.target as HTMLElement;
                  const container = target.closest('.relative');
                  if (container) {
                    container.style.display = 'none';
                  }
                }}
              />
            </div>
            <span className="text-2xl font-bold text-primary">Domu Match</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher variant="minimal" />
            
            {/* Notifications */}
            <NotificationBell userId={user.id} />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                {user.name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="minimal" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4"
          >
            <div className="flex flex-col space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.name || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}

              {/* Notifications */}
              <div className="flex items-center gap-3 py-2">
                <NotificationBell userId={user.id} />
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Notifications
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors font-medium py-2 text-left"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
