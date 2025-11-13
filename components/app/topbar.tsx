'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Menu,
  Sun,
  Moon,
  MessageCircle,
  User,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/app/(components)/notifications/notification-bell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserDropdown } from './user-dropdown'
import { Sidebar } from './sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

interface TopbarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

interface SearchResult {
  id: string
  type: 'match' | 'message'
  name?: string
  program?: string
  university?: string
  chatId?: string
  content?: string
  senderName?: string
  createdAt?: string
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        const allResults = [
          ...data.matches.map((m: any) => ({ ...m, type: 'match' as const })),
          ...data.messages.map((m: any) => ({ ...m, type: 'message' as const }))
        ]
        setSearchResults(allResults.slice(0, 8))
        setShowResults(allResults.length > 0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'match' && result.chatId) {
      router.push(`/chat/${result.chatId}`)
    } else if (result.type === 'message' && result.chatId) {
      router.push(`/chat/${result.chatId}`)
    }
    setSearchQuery('')
    setShowResults(false)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
    >
      <div className="flex items-center px-4 lg:px-8 py-3 gap-4">
        {/* Left side - Mobile Menu only (no logo/text on desktop) */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {/* Mobile Menu Button (only show on mobile/tablet, not on laptop) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar user={user} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo/Name - Only show on mobile, hidden on desktop since sidebar shows it */}
          <Link href="/matches" className="lg:hidden flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
            <div className="relative h-7 w-7 flex-shrink-0">
              <Image 
                src="/images/logo.png" 
                alt="Domu Match" 
                fill
                className="object-contain"
                priority
                sizes="32px"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  const container = target.closest('.relative');
                  if (container) {
                    container.style.display = 'none';
                  }
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-base font-bold text-gray-900 dark:text-white truncate">Domu Match</span>
            </div>
          </Link>
        </div>

        {/* Center - Search (centered, takes more space) */}
        <div className="flex-1 max-w-3xl relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search matches, messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length >= 2) {
                    setShowResults(true)
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 min-h-[44px] transition-colors"
              />
              {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowResults(false)
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 dark:text-gray-400 hover:text-ink-600 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
              <Card className="absolute top-full mt-2 w-full max-w-md max-h-96 overflow-y-auto shadow-lg border z-50">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors min-h-[44px]"
                        >
                          {result.type === 'match' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {result.name}
                                </p>
                                {(result.program || result.university) && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {[result.program, result.university].filter(Boolean).join(' • ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {result.senderName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                  {result.content}
                                </p>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right side - Actions, User */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Notifications */}
          <NotificationBell userId={user.id} />

          {/* Theme Toggle - Always visible on mobile */}
          <div className="flex-shrink-0">
            <ThemeToggle size="sm" />
          </div>

          {/* User Dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>
    </motion.header>
  )
}
