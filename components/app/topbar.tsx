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
      className="sticky top-0 z-40 bg-surface-0/95 backdrop-blur-sm border-b border-line"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left side - Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar user={user} />
              </SheetContent>
            </Sheet>
          </div>

        </div>

        {/* Right side - Search, Actions, User */}
        <div className="flex items-center gap-3">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
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
                className="w-96 max-w-md pl-10 pr-10 py-2 bg-surface-1 border border-line rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowResults(false)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-ink-600"
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
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          {result.type === 'match' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {result.name}
                                </p>
                                {(result.program || result.university) && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {[result.program, result.university].filter(Boolean).join(' • ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">
                                  {result.senderName}
                                </p>
                                <p className="text-xs text-gray-600 truncate mt-1">
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
