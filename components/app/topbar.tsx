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
      className="sticky top-0 z-40 bg-bg-body/95 dark:bg-bg-body/95 backdrop-blur-sm pt-safe-top"
    >
      <div className="flex items-center px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 gap-2 sm:gap-3 md:gap-4">
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
              <span className="text-base font-bold text-text-primary truncate">Domu Match</span>
            </div>
          </Link>
        </div>

        {/* Center - Search (centered, takes more space) */}
        <div className="flex-1 min-w-0 max-w-3xl relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 text-text-muted z-10 pointer-events-none" />
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
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-2.5 h-[42px] sm:h-[44px] bg-bg-surface-alt dark:bg-bg-surface-alt border-0 rounded-xl text-sm sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-semantic-accent focus:bg-bg-surface dark:focus:bg-bg-surface transition-colors"
              />
              {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowResults(false)
                  inputRef.current?.focus()
                }}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-md hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
              <Card className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-full sm:max-w-md max-h-[calc(100vh-16rem)] sm:max-h-96 overflow-y-auto shadow-lg border border-subtle bg-bg-surface dark:bg-bg-surface z-[100] scrollbar-hide">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="p-4 text-center text-text-muted">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">
                      No results found
                    </div>
                  ) : (
                    <div className="divide-y divide-border-subtle">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt text-left transition-colors min-h-[44px]"
                        >
                          {result.type === 'match' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-semantic-accent-soft dark:bg-semantic-accent-soft flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-semantic-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-text-primary truncate">
                                  {result.name}
                                </p>
                                {(result.program || result.university) && (
                                  <p className="text-xs text-text-muted truncate">
                                    {[result.program, result.university].filter(Boolean).join(' • ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-semantic-success/20 dark:bg-semantic-success/20 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-5 h-5 text-semantic-success" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-text-primary">
                                  {result.senderName}
                                </p>
                                <p className="text-xs text-text-secondary truncate mt-1">
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
        <div className="flex items-center gap-1 sm:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Notifications */}
          <div className="flex-shrink-0">
            <NotificationBell userId={user.id} />
          </div>

          {/* Theme Toggle - Always visible on mobile */}
          <div className="flex-shrink-0">
            <ThemeToggle size="sm" />
          </div>

          {/* User Dropdown */}
          <div className="flex-shrink-0">
            <UserDropdown user={user} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
