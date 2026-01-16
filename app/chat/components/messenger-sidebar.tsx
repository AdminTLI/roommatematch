'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings, MoreVertical, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { queryKeys } from '@/app/providers'
import { cn } from '@/lib/utils'

interface ChatRoom {
  id: string
  name: string
  type: 'individual' | 'group'
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
    isRead: boolean
    created_at?: string
  }
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
  unreadCount: number
  isRecentlyMatched: boolean
  mostRecentMessageTime?: number
}

interface MessengerSidebarProps {
  user: User & { name?: string; email?: string }
  onChatSelect: (chatId: string) => void
  selectedChatId?: string | null
  onNewChat?: () => void
}

const formatMessageTime = (timestamp: string) => {
  const messageDate = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

  if (messageDay.getTime() === today.getTime()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (messageDay.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }

  const daysDiff = Math.floor((today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff >= 2 && daysDiff < 7) {
    const getMonday = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      return new Date(d.setDate(diff))
    }

    const messageMonday = getMonday(messageDate)
    const todayMonday = getMonday(now)

    if (messageMonday.getTime() === todayMonday.getTime() && messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { weekday: 'long' })
    }
  }

  return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export function MessengerSidebar({ user, onChatSelect, selectedChatId, onNewChat }: MessengerSidebarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component only renders DropdownMenu after hydration to avoid ID mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reuse chat fetching logic from ChatList
  const fetchChats = useCallback(async (): Promise<ChatRoom[]> => {
    try {
      const { data: memberships } = await supabase
        .from('chat_members')
        .select('chat_id, user_id, last_read_at')
        .eq('user_id', user.id)

      if (!memberships || memberships.length === 0) return []

      const chatIds = memberships.map(m => m.chat_id)
      const { data: chatRooms } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner(user_id, last_read_at)
        `)
        .in('id', chatIds)
        .order('created_at', { ascending: false })

      if (!chatRooms) return []

      // Fetch latest messages
      const { data: allMessages } = await supabase
        .from('messages')
        .select('chat_id, content, created_at, user_id')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false })
        .limit(chatIds.length * 2)

      const latestMessagesMap = new Map<string, any>()
      if (allMessages) {
        const seenChatIds = new Set<string>()
        allMessages.forEach((msg: any) => {
          if (!seenChatIds.has(msg.chat_id)) {
            latestMessagesMap.set(msg.chat_id, msg)
            seenChatIds.add(msg.chat_id)
          }
        })
      }

      // Fetch profiles
      let profilesMap = new Map<string, any>()
      let rateLimited = false
      try {
        const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatIds })
        })

        if (profilesResponse.ok) {
          const { profiles } = await profilesResponse.json()
          if (Array.isArray(profiles)) {
            profiles.forEach((profile: any) => {
              if (profile?.user_id) {
                profilesMap.set(profile.user_id, profile)
              }
            })
          }
        } else if (profilesResponse.status === 429) {
          rateLimited = true
          // Rate limited - try fallback: fetch profiles directly from Supabase
          // Collect all user IDs from chat members
          const allUserIds = new Set<string>()
          chatRooms.forEach((room: any) => {
            room.chat_members?.forEach((member: any) => {
              if (member.user_id && member.user_id !== user.id) {
                allUserIds.add(member.user_id)
              }
            })
          })

          if (allUserIds.size > 0) {
            try {
              const { data: fallbackProfiles, error: fallbackError } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name')
                .in('user_id', Array.from(allUserIds))

              if (!fallbackError && fallbackProfiles) {
                fallbackProfiles.forEach((profile: any) => {
                  if (profile?.user_id) {
                    profilesMap.set(profile.user_id, profile)
                  }
                })
                console.log(`[MessengerSidebar] Fallback: Loaded ${profilesMap.size} profiles directly from Supabase`)
              } else if (fallbackError) {
                // RLS likely blocking - this is expected, log at debug level
                console.debug('[MessengerSidebar] Fallback profile fetch blocked by RLS (expected):', fallbackError.message)
              }
            } catch (fallbackErr) {
              console.debug('[MessengerSidebar] Fallback profile fetch failed (RLS likely blocking):', fallbackErr)
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch profiles:', err)
      }

      // Fetch unread counts
      let unreadMap = new Map<string, number>()
      try {
        const unreadResponse = await fetch('/api/chat/unread', { credentials: 'include' })
        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json()
          unreadMap = new Map((unreadData.chat_counts || []).map((c: any) => [c.chat_id, c.unread_count]))
        }
      } catch (err) {
        console.warn('Failed to fetch unread counts:', err)
      }

      // Transform to ChatRoom format
      const transformedChats: ChatRoom[] = chatRooms.map((room: any) => {
        const latestMessage = latestMessagesMap.get(room.id)
        const systemGreeting = "You're matched! Start your conversation 👋"
        const hasUserMessages = latestMessage ? latestMessage.content !== systemGreeting : false
        const isRecentlyMatched = !hasUserMessages

        const otherParticipant = room.chat_members?.find((p: any) => p.user_id !== user.id)
        const otherProfile = otherParticipant ? profilesMap.get(otherParticipant.user_id) : null

        let participantName = 'User'
        if (otherProfile) {
          const firstName = otherProfile.first_name?.trim()
          const lastName = otherProfile.last_name?.trim()
          if (firstName && lastName) {
            participantName = `${firstName} ${lastName}`
          } else if (firstName) {
            participantName = firstName
          } else if (lastName) {
            participantName = lastName
          }
          // If profile exists but no names, keep 'User' as fallback
        } else if (otherParticipant) {
          // Profile not found but participant exists - this could be due to:
          // 1. Rate limiting preventing profile fetch
          // 2. Profile doesn't exist in database
          // 3. RLS blocking access
          // Only log at debug level to avoid console spam
          console.debug(`[MessengerSidebar] Profile not found for participant ${otherParticipant.user_id} in chat ${room.id}`, {
            profilesMapSize: profilesMap.size,
            rateLimited
          })
        }

        const lastMessage = latestMessage
        const lastMessageDate = lastMessage?.created_at ? new Date(lastMessage.created_at) : null

        return {
          id: room.id,
          name: room.is_group ? `Group Chat` : participantName,
          type: room.is_group ? 'group' : 'individual',
          lastMessage: lastMessage && lastMessageDate ? {
            content: lastMessage.content,
            sender: lastMessage.user_id === user.id ? 'You' : participantName,
            timestamp: lastMessageDate.toLocaleString(),
            isRead: false,
            created_at: lastMessage.created_at
          } : undefined,
          mostRecentMessageTime: lastMessageDate ? lastMessageDate.getTime() : (room.created_at ? new Date(room.created_at).getTime() : 0),
          participants: room.chat_members?.map((p: any) => {
            const profile = profilesMap.get(p.user_id)
            let fullName = 'User'
            if (profile) {
              const firstName = profile.first_name?.trim()
              const lastName = profile.last_name?.trim()
              if (firstName && lastName) {
                fullName = `${firstName} ${lastName}`
              } else if (firstName) {
                fullName = firstName
              } else if (lastName) {
                fullName = lastName
              }
              // If profile exists but no names, keep 'User' as fallback
            }
            return {
              id: p.user_id,
              name: fullName,
              avatar: undefined,
              isOnline: false
            }
          }) || [],
          unreadCount: unreadMap.get(room.id) || 0,
          isRecentlyMatched
        }
      })

      return transformedChats
    } catch (error) {
      console.error('Failed to load chats:', error)
      return []
    }
  }, [user.id])

  const { data: chats = [], isLoading } = useQuery({
    queryKey: queryKeys.chats(user.id),
    queryFn: fetchChats,
    staleTime: 10_000
  })

  // Extract online users
  const onlineUsers = useMemo(() => {
    const onlineUsersMap = new Map<string, { id: string; name: string; avatar?: string }>()
    chats.forEach(chat => {
      chat.participants.forEach(participant => {
        if (participant.isOnline && participant.id !== user.id) {
          if (!onlineUsersMap.has(participant.id)) {
            onlineUsersMap.set(participant.id, {
              id: participant.id,
              name: participant.name,
              avatar: participant.avatar
            })
          }
        }
      })
    })
    return Array.from(onlineUsersMap.values())
  }, [chats, user.id])

  // Separate chats
  const recentlyMatchedChats = chats
    .filter(chat => chat.isRecentlyMatched)
    .sort((a, b) => (b.mostRecentMessageTime || 0) - (a.mostRecentMessageTime || 0))

  const activeConversations = chats
    .filter(chat => !chat.isRecentlyMatched)
    .sort((a, b) => (b.mostRecentMessageTime || 0) - (a.mostRecentMessageTime || 0))

  const userName = user.name || user.email?.split('@')[0] || 'User'

  return (
    <div
      data-messenger-sidebar
      className="flex flex-col h-full w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      {/* Current User Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-purple-600 text-white">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Online</p>
          </div>
        </div>
        {isMounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
            <MoreVertical className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-visible">
        {/* Online Now Carousel */}
        {onlineUsers.length > 0 && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
              Online Now
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {onlineUsers.slice(0, 10).map((onlineUser) => (
                <div
                  key={onlineUser.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    const chatWithUser = chats.find(chat =>
                      chat.type === 'individual' && chat.participants.some(p => p.id === onlineUser.id)
                    )
                    if (chatWithUser) {
                      onChatSelect(chatWithUser.id)
                    }
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={onlineUser.avatar} />
                      <AvatarFallback className="text-sm font-semibold bg-purple-600 text-white">
                        {onlineUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                  </div>
                  <span className="text-xs text-gray-900 dark:text-gray-100 font-medium max-w-[60px] truncate text-center">
                    {onlineUser.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Matched Section */}
        {recentlyMatchedChats.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Recently Matched
              </h2>
              <Badge variant="secondary" className="text-xs">
                {recentlyMatchedChats.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {recentlyMatchedChats.map((chat) => {
                const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0]
                const isSelected = selectedChatId === chat.id

                return (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {otherParticipant?.name?.charAt(0) || chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {chat.name}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Chats Section */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Active Chats
            </h2>
            <Badge variant="secondary" className="text-xs">
              {activeConversations.length}
            </Badge>
          </div>
          {activeConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No active conversations</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeConversations.map((chat) => {
                const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0]
                const isSelected = selectedChatId === chat.id

                return (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {otherParticipant?.name?.charAt(0) || chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {chat.name}
                        </p>
                        {chat.lastMessage && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatMessageTime(chat.lastMessage.created_at || chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-purple-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      {onNewChat && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={onNewChat}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      )}
    </div>
  )
}
