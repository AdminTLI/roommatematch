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
  Building2,
  ArrowUpRight
} from 'lucide-react'
import { NotificationBell } from '@/app/(components)/notifications/notification-bell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserDropdown } from './user-dropdown'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobileChatChrome } from '@/components/app/mobile-chat-chrome-context'
import { cn } from '@/lib/utils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TopbarProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  context?: 'user' | 'admin' | 'partner' | 'university'
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

export function Topbar({ user, context = 'user' }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { activeMobileConversation } = useMobileChatChrome()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  const isAdminContext = context === 'admin' || context === 'partner' || context === 'university'

  const isChatThreadRoute =
    pathname === '/chat' || (pathname?.startsWith('/chat/') ?? false)
  const hideTopBarOnMobileForChat =
    !isAdminContext && activeMobileConversation && isChatThreadRoute

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
      const params = new URLSearchParams({ q: query })
      if (isAdminContext) {
        params.append('context', 'admin')
      }

      const response = await fetch(`/api/search?${params.toString()}`)
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
      className={cn(
        'sticky top-0 z-40 bg-white/70 pt-safe-top backdrop-blur-xl dark:bg-bg-body',
        hideTopBarOnMobileForChat && 'max-lg:hidden',
      )}
    >
      <div className="flex flex-wrap items-center w-full px-3 sm:px-4 lg:px-6 py-3 gap-3 md:gap-4 max-w-7xl mx-auto">
        {/* Logo - Visible on all screens now that sidebar is gone */}
        <Link
          href={isAdminContext ? '/admin' : '/dashboard'}
          className="order-1 flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
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
        <div
          className={cn(
            'order-3 w-full relative',
            'sm:order-2 sm:flex-1 sm:max-w-2xl sm:mx-auto',
            'px-0 sm:px-4',
          )}
          ref={searchRef}
        >
          <div className="relative w-full group">
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder={isAdminContext ? 'Search admin tools...' : 'Search...'}
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
        <div className="order-2 sm:order-3 ml-auto flex items-center gap-1.5 sm:gap-3 md:gap-4 flex-shrink-0">
          <div className="text-zinc-400 hover:text-white transition-colors">
            <NotificationBell userId={user.id} />
          </div>

          <div className="hidden sm:block">
            <ThemeToggle size="sm" />
          </div>

          {context === 'user' && (
            <>
              {(() => {
                const pillClassName = cn(
                  'inline-flex max-w-[100%] flex-shrink-0 items-center rounded-full border-2 border-indigo-500/45 bg-gradient-to-r from-indigo-500/[0.18] via-purple-500/[0.14] to-indigo-500/[0.18] px-2.5 py-1 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/15 transition hover:scale-[1.03] hover:border-indigo-500/70 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-indigo-400/50 dark:from-indigo-400/[0.22] dark:via-purple-400/[0.18] dark:to-indigo-400/[0.22] dark:shadow-indigo-950/40 dark:ring-indigo-400/20 dark:hover:border-indigo-300/70 dark:focus-visible:ring-offset-bg-body sm:px-3 sm:py-1.5',
                )

                const content = (
                  <>
                    <div className="px-4 pt-4">
                      <h3 className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                        Thank you for being here with us
                      </h3>
                      <div className="mt-3 space-y-2.5 text-sm font-normal leading-relaxed text-zinc-600 dark:text-zinc-300">
                        <p>
                          We don&apos;t take your time lightly. As one of our beta members, you&apos;re helping shape Domu
                          Match with every click, honest note, and idea you share. That effort genuinely moves the product
                          forward, and we&apos;re grateful you chose to show up.
                        </p>
                        <p>
                          If you haven&apos;t already, come hang out in our WhatsApp community. You&apos;ll meet other
                          students on the same journey, hear what we&apos;re working on sooner, and you can always reach
                          the team there when something&apos;s on your mind - you&apos;re not just a user to us.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-white/45 bg-white/40 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.07]">
                      <a
                        href="https://chat.whatsapp.com/LUKdaP84dszJAO0PKswOXM"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center justify-between gap-2 text-sm font-medium text-indigo-700 transition hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <span className="min-w-0 text-left leading-snug">Join our WhatsApp community</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 opacity-70 transition group-hover:opacity-100" aria-hidden />
                      </a>
                    </div>
                  </>
                )

                return (
                  <>
                    {/* Desktop: hover affordance */}
                    <div className="hidden sm:block">
                      <HoverCard openDelay={180} closeDelay={120}>
                        <HoverCardTrigger asChild>
                          <button type="button" className={pillClassName} aria-label="Beta program - hover for details">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 sm:text-xs">
                              Beta
                            </span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="bottom"
                          align="end"
                          className={cn(
                            'w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl p-0',
                            'border border-white/55 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150',
                            'ring-1 ring-inset ring-white/40 dark:border-white/12 dark:bg-zinc-950/55 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]',
                          )}
                        >
                          {content}
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    {/* Mobile: click/tap popover so it doesn't get trapped behind scroll containers */}
                    <div className="sm:hidden">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className={pillClassName} aria-label="Beta program - tap for details">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 sm:text-xs">
                              Beta
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="bottom"
                          align="end"
                          sideOffset={8}
                          className={cn(
                            'z-[10000] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl p-0',
                            'border border-white/55 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150',
                            'ring-1 ring-inset ring-white/40 dark:border-white/12 dark:bg-zinc-950/70 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]',
                          )}
                        >
                          {content}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )
              })()}
            </>
          )}

          <UserDropdown user={user} />
        </div>
      </div>
    </motion.header>
  )
}
