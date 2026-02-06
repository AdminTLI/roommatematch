'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Search,
  MessageCircle,
  User,
  X,
  Home,
  Users,
  Settings,
  LayoutDashboard,
  Building2
} from 'lucide-react'
import { NotificationBell } from '@/app/(components)/notifications/notification-bell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserDropdown } from './user-dropdown'
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
  senderName?: string
  createdAt?: string
  address?: string
  city?: string
  rent?: number
  href?: string
  icon?: string
  isGroupChat?: boolean
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
        const allResults = [
          ...(data.matches || []).map((m: any) => ({ ...m, type: 'match' as const, priority: 1 })),
          ...(data.messages || []).map((m: any) => ({ ...m, type: 'message' as const, priority: 2 })),
          ...(data.users || []).map((u: any) => ({ ...u, type: 'user' as const, priority: 3 })),
          ...(data.housing || []).map((h: any) => ({ ...h, type: 'housing' as const, priority: 4 })),
          ...(data.pages || []).map((p: any) => ({ ...p, type: 'page' as const, priority: 5 }))
        ]

        const seenIds = new Map<string, SearchResult & { priority: number }>()
        allResults.forEach((result) => {
          if (result.type === 'match' || result.type === 'user') {
            const existing = seenIds.get(result.id)
            if (!existing || result.priority < existing.priority) {
              seenIds.set(result.id, result)
            }
          } else {
            const key = `${result.type}-${result.id}`
            if (!seenIds.has(key)) {
              seenIds.set(key, result)
            }
          }
        })

        const sortedResults = Array.from(seenIds.values())
          .sort((a, b) => (a.priority || 99) - (b.priority || 99))
          .slice(0, 12)
          .map(({ priority, ...rest }) => rest)

        setSearchResults(sortedResults)
        setShowResults(sortedResults.length > 0)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('[Topbar Search] Search error:', error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'match') {
      if (result.chatId) {
        router.push(`/chat?chatId=${result.chatId}`)
      } else {
        router.push(`/matches?user=${result.id}`)
      }
    } else if (result.type === 'message' && result.chatId) {
      router.push(`/chat?chatId=${result.chatId}`)
    } else if (result.type === 'user') {
      if (result.chatId) {
        router.push(`/chat?chatId=${result.chatId}`)
      } else {
        router.push(`/matches?user=${result.id}`)
      }
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
      className="sticky top-0 z-40 bg-white/70 dark:bg-bg-body backdrop-blur-xl pt-safe-top"
    >
      <div className="flex items-center w-full px-3 sm:px-4 lg:px-6 py-3 gap-3 md:gap-4 max-w-7xl mx-auto">
        {/* Logo - Visible on all screens now that sidebar is gone */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Domu Match"
              fill
              className="object-contain rounded-lg"
              priority
              sizes="32px"
            />
          </div>
          <span className="hidden sm:block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:to-white/60">
            Domu Match
          </span>
        </Link>

        {/* Search - Glassmorphism style */}
        <div className="flex-1 max-w-2xl mx-auto relative px-2 sm:px-4" ref={searchRef}>
          <div className="relative w-full group">
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
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
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 h-[44px] bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:bg-white/80 dark:focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner shadow-black/5 dark:shadow-black/20"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowResults(false)
                  inputRef.current?.focus()
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length >= 2 && dropdownPosition && typeof window !== 'undefined' && createPortal(
            <Card
              data-search-dropdown
              className="fixed max-h-[calc(100vh-16rem)] sm:max-h-96 overflow-y-auto shadow-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl z-[9999] scrollbar-hide rounded-2xl"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxWidth: '90vw'
              }}
            >
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    No results found
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((result) => {
                      const Icon = getIconForResult(result)
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 hover:bg-white/5 text-left transition-colors min-h-[50px] flex items-center gap-3 group"
                        >
                          {result.type === 'match' || result.type === 'user' ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-colors">
                              <Icon className="w-5 h-5 text-indigo-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors">
                              <Icon className="w-5 h-5 text-zinc-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-zinc-200 group-hover:text-white truncate">
                              {result.name || result.senderName || result.title}
                            </p>
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate">
                              {result.type === 'message' ? result.content :
                                result.type === 'housing' ? [result.address, result.city].filter(Boolean).join(', ') :
                                  result.type === 'page' ? 'Navigate to page' : 'User'}
                            </p>
                          </div>
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

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-zinc-400 hover:text-white transition-colors">
            <NotificationBell userId={user.id} />
          </div>

          <div className="hidden sm:block">
            <ThemeToggle size="sm" />
          </div>

          <UserDropdown user={user} />
        </div>
      </div>
    </motion.header>
  )
}
