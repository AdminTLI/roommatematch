'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
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
  X,
  Home,
  Users,
  Settings,
  LayoutDashboard,
  Building2
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
  type: 'match' | 'message' | 'user' | 'housing' | 'page'
  name?: string
  title?: string
  program?: string
  university?: string
  chatId?: string
  content?: string
  highlightedContent?: string
  senderName?: string
  createdAt?: string
  address?: string
  city?: string
  rent?: number
  href?: string
  icon?: string
  isGroupChat?: boolean
  otherParticipantsCount?: number
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        searchRef.current && 
        !searchRef.current.contains(target) &&
        !(target instanceof Element && target.closest('[data-search-dropdown]'))
      ) {
        setShowResults(false)
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])

  // Update dropdown position when search input is focused or results change
  useEffect(() => {
    const updatePosition = () => {
      if (showResults && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }

    updatePosition()

    // Update on scroll and resize
    if (showResults) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [showResults, searchResults])

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
      const data = await response.json()
      
      if (response.ok) {
        // Prioritize: matches first, then messages, then users, then housing, then pages
        const allResults = [
          ...(data.matches || []).map((m: any) => ({ ...m, type: 'match' as const, priority: 1 })),
          ...(data.messages || []).map((m: any) => ({ ...m, type: 'message' as const, priority: 2 })),
          ...(data.users || []).map((u: any) => ({ ...u, type: 'user' as const, priority: 3 })),
          ...(data.housing || []).map((h: any) => ({ ...h, type: 'housing' as const, priority: 4 })),
          ...(data.pages || []).map((p: any) => ({ ...p, type: 'page' as const, priority: 5 }))
        ]
        
        // Deduplicate by user ID - keep match type over user type (higher priority)
        const seenIds = new Map<string, SearchResult & { priority: number }>()
        allResults.forEach((result) => {
          // For user/match types, deduplicate by ID
          if (result.type === 'match' || result.type === 'user') {
            const existing = seenIds.get(result.id)
            if (!existing || result.priority < existing.priority) {
              seenIds.set(result.id, result)
            }
          } else {
            // For other types, use type-id as key
            const key = `${result.type}-${result.id}`
            if (!seenIds.has(key)) {
              seenIds.set(key, result)
            }
          }
        })
        
        // Sort by priority, then limit results
        const sortedResults = Array.from(seenIds.values())
          .sort((a, b) => (a.priority || 99) - (b.priority || 99))
          .slice(0, 12)
          .map(({ priority, ...rest }) => rest) // Remove priority before setting state
        
        setSearchResults(sortedResults)
        setShowResults(sortedResults.length > 0)
      } else {
        console.error('Search API error:', data)
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'match' && result.chatId) {
      router.push(`/chat/${result.chatId}`)
    } else if (result.type === 'message' && result.chatId) {
      router.push(`/chat/${result.chatId}`)
    } else if (result.type === 'user') {
      router.push(`/matches?user=${result.id}`)
    } else if (result.type === 'housing') {
      router.push(`/housing/${result.id}`)
    } else if (result.type === 'page' && result.href) {
      router.push(result.href)
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const getIconForResult = (result: SearchResult) => {
    if (result.type === 'page' && result.icon) {
      const iconMap: Record<string, any> = {
        'Users': Users,
        'MessageCircle': MessageCircle,
        'Home': Home,
        'LayoutDashboard': LayoutDashboard,
        'User': User,
        'Settings': Settings,
        'Bell': Bell
      }
      return iconMap[result.icon] || Search
    }
    if (result.type === 'match' || result.type === 'user') return User
    if (result.type === 'message') return MessageCircle
    if (result.type === 'housing') return Building2
    return Search
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-bg-body/95 dark:bg-bg-body/95 backdrop-blur-sm pt-safe-top"
    >
      <div className="flex items-center w-full px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 gap-2 sm:gap-3 md:gap-4">
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

        {/* Center - Search (centered, aligned with chat messages max-w-4xl) */}
        <div className="flex-1 min-w-0 max-w-4xl relative mx-auto" ref={searchRef}>
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

            {/* Search Results Dropdown - Using Portal to fix z-index */}
            {showResults && searchQuery.length >= 2 && dropdownPosition && typeof window !== 'undefined' && createPortal(
              <Card 
                data-search-dropdown
                className="fixed max-h-[calc(100vh-16rem)] sm:max-h-96 overflow-y-auto shadow-lg border border-border-subtle bg-bg-surface dark:bg-bg-surface z-[9999] scrollbar-hide"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxWidth: '90vw'
                }}
              >
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
                      {searchResults.map((result) => {
                        const Icon = getIconForResult(result)
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full p-3 hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt text-left transition-colors min-h-[44px]"
                          >
                            {result.type === 'match' || result.type === 'user' ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-semantic-accent-soft dark:bg-semantic-accent-soft flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-semantic-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-text-primary truncate">
                                    {/* Ensure we never display the ID - only show name if it exists and is not an ID */}
                                    {result.name && result.name !== result.id ? result.name : 'User'}
                                    {result.type === 'user' && (
                                      <span className="ml-2 text-xs text-text-muted font-normal">(User)</span>
                                    )}
                                  </p>
                                  {/* Only show program/university if they exist and are not IDs */}
                                  {(result.program || result.university) && 
                                   result.program !== result.id && 
                                   result.university !== result.id && (
                                    <p className="text-xs text-text-muted truncate">
                                      {[result.program, result.university].filter(Boolean).join(' • ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : result.type === 'message' ? (
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-semantic-success/20 dark:bg-semantic-success/20 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-semantic-success" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-text-primary">
                                      {result.senderName}
                                    </p>
                                    {result.isGroupChat && (
                                      <span className="text-xs text-text-muted bg-bg-surface-alt dark:bg-bg-surface-alt px-1.5 py-0.5 rounded">
                                        Group
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-secondary truncate mt-1">
                                    {result.content}
                                  </p>
                                  {result.createdAt && (
                                    <p className="text-xs text-text-muted mt-0.5">
                                      {new Date(result.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : result.type === 'housing' ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-semantic-warning/20 dark:bg-semantic-warning/20 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-semantic-warning" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-text-primary truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-text-muted truncate">
                                    {[result.address, result.city].filter(Boolean).join(', ')}
                                    {result.rent && ` • €${result.rent}/mo`}
                                  </p>
                                </div>
                              </div>
                            ) : result.type === 'page' ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-semantic-info/20 dark:bg-semantic-info/20 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-semantic-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-text-primary">
                                    {result.name}
                                  </p>
                                  <p className="text-xs text-text-muted">
                                    Navigate to page
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>,
              document.body
            )}
        </div>

        {/* Right side - Actions, User */}
        <div className="flex items-center gap-1 sm:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 ml-auto">
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
