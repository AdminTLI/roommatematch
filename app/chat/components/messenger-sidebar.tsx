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
import { Settings, MoreVertical, Plus, Archive, ArchiveRestore, Bell, BellOff, CheckCheck, RotateCcw, Eye, EyeOff, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { queryKeys, queryClient } from '@/app/providers'
import { cn } from '@/lib/utils'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

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
  const [showArchived, setShowArchived] = useState(false)
  const [showMuted, setShowMuted] = useState(false)
  const [archivedChats, setArchivedChats] = useState<string[]>([])
  const [mutedChats, setMutedChats] = useState<string[]>([])
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [isClearingReadReceipts, setIsClearingReadReceipts] = useState(false)

  // Ensure component only renders DropdownMenu after hydration to avoid ID mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load archived chats from localStorage and listen for changes
  useEffect(() => {
    const loadArchived = () => {
      try {
        const archived = JSON.parse(localStorage.getItem('archived_chats') || '[]')
        setArchivedChats(archived)
      } catch {
        setArchivedChats([])
      }
    }

    // Load initially
    loadArchived()

    // Listen for storage changes (when archiving from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'archived_chats') {
        loadArchived()
      }
    }

    // Listen for custom events (when archiving from same tab)
    const handleArchiveChange = () => {
      loadArchived()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('archivedChatsChanged', handleArchiveChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('archivedChatsChanged', handleArchiveChange)
    }
  }, [])

  // Load muted chats from localStorage
  useEffect(() => {
    const loadMuted = () => {
      try {
        const muted = JSON.parse(localStorage.getItem('muted_chats') || '[]')
        setMutedChats(muted)
      } catch {
        setMutedChats([])
      }
    }

    loadMuted()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'muted_chats') {
        loadMuted()
      }
    }

    const handleMuteChange = () => {
      loadMuted()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('mutedChatsChanged', handleMuteChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('mutedChatsChanged', handleMuteChange)
    }
  }, [])

  // Handle view archived chats
  const handleViewArchived = () => {
    setShowArchived(true)
    setShowMuted(false)
  }

  // Handle view muted chats
  const handleViewMuted = () => {
    setShowMuted(true)
    setShowArchived(false)
  }

  // Handle mark all chats as read
  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true)
    try {
      // Use API endpoint to mark all chats as read
      // This is more reliable than direct database access
      const response = await fetchWithCSRF('/api/chat/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Invalidate chat queries to refresh UI
        queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
        showSuccessToast('All chats marked as read', 'All messages have been marked as read.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark all as read')
      }
    } catch (error: any) {
      console.error('Failed to mark all as read:', error)
      showErrorToast('Failed to mark all as read', error.message || 'Please try again.')
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  // Handle clear all read receipts
  const handleClearAllReadReceipts = async () => {
    setIsClearingReadReceipts(true)
    try {
      // Use API endpoint to clear all read receipts
      const response = await fetchWithCSRF('/api/chat/clear-all-read-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Invalidate chat queries to refresh UI
        queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
        showSuccessToast('Read receipts cleared', 'All read receipts have been removed. All chats will appear as unread.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear read receipts')
      }
    } catch (error: any) {
      console.error('Failed to clear read receipts:', error)
      showErrorToast('Failed to clear read receipts', error.message || 'Please try again.')
    } finally {
      setIsClearingReadReceipts(false)
    }
  }

  // Handle mute all notifications
  const handleMuteAllNotifications = () => {
    try {
      // Get all chat IDs
      const allChatIds = chats.map(chat => chat.id)
      const muted = JSON.parse(localStorage.getItem('muted_chats') || '[]')
      
      // Add all chats that aren't already muted
      const newMuted = [...new Set([...muted, ...allChatIds])]
      localStorage.setItem('muted_chats', JSON.stringify(newMuted))
      setMutedChats(newMuted)
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('mutedChatsChanged'))
      
      showSuccessToast('All chats muted', 'Notifications for all chats have been muted.')
    } catch (error: any) {
      console.error('Failed to mute all:', error)
      showErrorToast('Failed to mute all chats', error.message || 'Please try again.')
    }
  }

  // Handle unmute all notifications
  const handleUnmuteAllNotifications = () => {
    try {
      localStorage.setItem('muted_chats', JSON.stringify([]))
      setMutedChats([])
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('mutedChatsChanged'))
      
      showSuccessToast('All chats unmuted', 'Notifications for all chats have been enabled.')
    } catch (error: any) {
      console.error('Failed to unmute all:', error)
      showErrorToast('Failed to unmute all chats', error.message || 'Please try again.')
    }
  }

  // Handle unarchive chat
  const handleUnarchive = (chatId: string) => {
    try {
      const archived = JSON.parse(localStorage.getItem('archived_chats') || '[]')
      const updated = archived.filter((id: string) => id !== chatId)
      localStorage.setItem('archived_chats', JSON.stringify(updated))
      setArchivedChats(updated)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('archivedChatsChanged'))
      
      // If we're viewing archived chats and this was the last one, go back
      if (showArchived && updated.length === 0) {
        setShowArchived(false)
      }
    } catch (error) {
      console.error('Failed to unarchive:', error)
    }
  }

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
      const systemGreeting = "You're matched! Start your conversation 👋"
      const latestMessagesMap = new Map<string, any>()
      const allMessagesMap = new Map<string, any[]>() // Store all messages per chat for active chat detection
      
      if (chatIds.length > 0) {
        // First, fetch latest messages for display
        const { data: allMessages } = await supabase
          .from('messages')
          .select('chat_id, content, created_at, user_id')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })
          .limit(chatIds.length * 10) // Increased limit to get more messages per chat

        if (allMessages) {
          const seenChatIds = new Set<string>()
          allMessages.forEach((msg: any) => {
            const chatId = msg.chat_id
            // Store latest message
            if (!seenChatIds.has(chatId)) {
              latestMessagesMap.set(chatId, msg)
              seenChatIds.add(chatId)
            }
            // Store all messages for active chat detection
            if (!allMessagesMap.has(chatId)) {
              allMessagesMap.set(chatId, [])
            }
            allMessagesMap.get(chatId)!.push(msg)
          })
        }

        // Second, use a more reliable method: check for ANY non-system messages per chat
        // This ensures we catch all chats with user messages, even if the limit above missed them
        try {
          const { data: nonSystemMessages } = await supabase
            .from('messages')
            .select('chat_id')
            .in('chat_id', chatIds)
            .neq('content', systemGreeting) // Get any message that is NOT the system greeting
            .limit(1000) // High limit to ensure we check all chats

          let chatsWithUserMessages: Set<string> = new Set<string>()
          
          if (nonSystemMessages && Array.isArray(nonSystemMessages) && nonSystemMessages.length > 0) {
            try {
              // Create a set of chat IDs that have non-system messages
              const chatIds = nonSystemMessages
                .map((msg: any) => msg?.chat_id)
                .filter((id: any): id is string => typeof id === 'string' && id.length > 0)
              
              if (chatIds.length > 0) {
                chatsWithUserMessages = new Set(chatIds)
                
                // Update allMessagesMap to mark chats with user messages
                chatsWithUserMessages.forEach((chatId) => {
                  // If we don't have messages in allMessagesMap for this chat, add an empty array
                  // so that hasUserMessages will be true
                  if (!allMessagesMap.has(chatId)) {
                    allMessagesMap.set(chatId, [])
                  }
                })
              }
            } catch (setError) {
              // If Set creation fails, just use empty set
              chatsWithUserMessages = new Set<string>()
            }
          }
          
          // Store the set for later use (always ensure it's a Set)
          (allMessagesMap as any).chatsWithUserMessages = chatsWithUserMessages instanceof Set 
            ? chatsWithUserMessages 
            : new Set<string>()
        } catch (nonSystemError) {
          // Initialize empty set on error - use console.error if console.warn fails
          try {
            if (typeof console !== 'undefined' && typeof console.warn === 'function') {
              console.warn('[MessengerSidebar] Exception checking for non-system messages (non-fatal):', nonSystemError)
            } else {
              console.error('[MessengerSidebar] Exception checking for non-system messages (non-fatal):', nonSystemError)
            }
          } catch {
            // Fallback if console methods fail
            console.error('[MessengerSidebar] Error in non-system messages check:', nonSystemError)
          }
          // Initialize empty set on error
          (allMessagesMap as any).chatsWithUserMessages = new Set<string>()
          // Continue - we'll rely on the messages we already fetched
        }
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
      // Ensure chatsWithUserMessages is always a Set
      const chatsWithUserMessagesRaw = (allMessagesMap as any).chatsWithUserMessages
      const chatsWithUserMessages = chatsWithUserMessagesRaw instanceof Set 
        ? chatsWithUserMessagesRaw 
        : new Set<string>()
      
      const transformedChats: ChatRoom[] = chatRooms.map((room: any) => {
        const latestMessage = latestMessagesMap.get(room.id)
        // Get all messages for this chat to check if there are any user messages
        const allChatMessages = allMessagesMap.get(room.id) || []
        // Use the reliable check from the non-system messages query first, then fall back to checking fetched messages
        const hasUserMessages = chatsWithUserMessages.has(room.id) || 
                                allChatMessages.some((msg: any) => msg.content !== systemGreeting)
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
      // Safely log error - handle case where console methods might not be available
      try {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error('Failed to load chats:', error)
        }
      } catch {
        // Fallback if console methods fail
      }
      return []
    }
  }, [user.id])

  const { data: chats = [], isLoading } = useQuery({
    queryKey: queryKeys.chats(user.id),
    queryFn: fetchChats,
    staleTime: 10_000
  })

  // Extract online users from chats (legacy - for "Online Now" carousel)
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

  // Fetch online users (active in last 15 minutes)
  const { data: onlineUsersData = { users: [] }, isLoading: isLoadingOnlineUsers } = useQuery({
    queryKey: ['online-users', user.id],
    queryFn: async () => {
      const response = await fetch('/api/chat/online-users', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch online users')
      }
      return response.json()
    },
    staleTime: 30_000, // Refresh every 30 seconds
    refetchInterval: 30_000,
    enabled: !showArchived && !showMuted
  })

  const onlineUsersList = onlineUsersData.users || []

  // Handle clicking on an online user avatar
  const handleOnlineUserClick = useCallback(async (userId: string) => {
    try {
      // First, check if we already have a chat with this user
      const existingChat = chats.find(chat =>
        chat.type === 'individual' && chat.participants.some(p => p.id === userId)
      )

      if (existingChat) {
        onChatSelect(existingChat.id)
        return
      }

      // Otherwise, get or create a chat
      const response = await fetchWithCSRF('/api/chat/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ other_user_id: userId })
      })

      if (response.ok) {
        const { chat_id } = await response.json()
        // Invalidate chats to refresh the list
        queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
        onChatSelect(chat_id)
      } else {
        const errorData = await response.json()
        showErrorToast('Failed to open chat', errorData.error || 'Please try again.')
      }
    } catch (error: any) {
      console.error('Failed to open chat with user:', error)
      showErrorToast('Failed to open chat', error.message || 'Please try again.')
    }
  }, [chats, user.id, onChatSelect])

  // Separate chats - filter based on view mode
  let filteredChats = chats
  if (showArchived) {
    filteredChats = chats.filter(chat => archivedChats.includes(chat.id))
  } else if (showMuted) {
    filteredChats = chats.filter(chat => mutedChats.includes(chat.id))
  } else {
    // Show active chats (not archived, optionally filter muted)
    filteredChats = chats.filter(chat => !archivedChats.includes(chat.id))
  }

  const recentlyMatchedChats = filteredChats
    .filter(chat => chat.isRecentlyMatched)
    .sort((a, b) => (b.mostRecentMessageTime || 0) - (a.mostRecentMessageTime || 0))

  const activeConversations = filteredChats
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Archive */}
              <DropdownMenuItem onClick={handleViewArchived}>
                <Archive className="mr-2 h-4 w-4" />
                Archived Chats
                {archivedChats.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500">({archivedChats.length})</span>
                )}
              </DropdownMenuItem>

              {/* Muted Chats */}
              <DropdownMenuItem onClick={handleViewMuted}>
                <BellOff className="mr-2 h-4 w-4" />
                Muted Chats
                {mutedChats.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500">({mutedChats.length})</span>
                )}
              </DropdownMenuItem>

              {(showArchived || showMuted) && (
                <DropdownMenuItem onClick={() => {
                  setShowArchived(false)
                  setShowMuted(false)
                }}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Back to Active Chats
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Mark all as read */}
              <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={isMarkingAllRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                {isMarkingAllRead ? 'Marking...' : 'Mark All as Read'}
              </DropdownMenuItem>

              {/* Clear read receipts */}
              <DropdownMenuItem onClick={handleClearAllReadReceipts} disabled={isClearingReadReceipts}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {isClearingReadReceipts ? 'Clearing...' : 'Clear All Read Receipts'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Mute/Unmute all notifications */}
              {mutedChats.length === chats.length && chats.length > 0 ? (
                <DropdownMenuItem onClick={handleUnmuteAllNotifications}>
                  <Bell className="mr-2 h-4 w-4" />
                  Unmute All Chats
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleMuteAllNotifications}>
                  <BellOff className="mr-2 h-4 w-4" />
                  Mute All Chats
                </DropdownMenuItem>
              )}
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
        {/* View Header (when viewing archived or muted) */}
        {(showArchived || showMuted) && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showArchived ? (
                  <>
                    <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Archived Chats
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {archivedChats.length}
                    </Badge>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Muted Chats
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {mutedChats.length}
                    </Badge>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowArchived(false)
                  setShowMuted(false)
                }}
                className="h-7 text-xs"
              >
                Back
              </Button>
            </div>
          </div>
        )}

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

        {/* Online Section - Only show when not viewing archived/muted */}
        {!showArchived && !showMuted && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Online ({onlineUsersList.length})
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {onlineUsersList.length > 0 ? (
                onlineUsersList.map((onlineUser: { id: string; firstName: string; avatar?: string }) => (
                  <div
                    key={onlineUser.id}
                    onClick={() => handleOnlineUserClick(onlineUser.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={onlineUser.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {onlineUser.firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-gray-900 dark:text-gray-100 font-medium max-w-[60px] truncate text-center">
                      {onlineUser.firstName}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 flex-shrink-0 opacity-50">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      <span className="text-base">💤</span>
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[60px] truncate">
                    All Offline
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recently Matched Section - Only show when not viewing archived/muted */}
        {!showArchived && !showMuted && recentlyMatchedChats.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Recently Matched ({recentlyMatchedChats.length})
              </h2>
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
              {showArchived 
                ? `Archived Chats (${archivedChats.length})` 
                : showMuted 
                ? `Muted Chats (${mutedChats.length})` 
                : `Active Chats (${activeConversations.length})`}
            </h2>
            {!showArchived && !showMuted && (() => {
              const totalUnread = activeConversations.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
              return totalUnread > 0 ? (
                <Badge variant="secondary" className="text-xs">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </Badge>
              ) : null
            })()}
          </div>
          {activeConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {showArchived 
                  ? 'No archived conversations' 
                  : showMuted 
                  ? 'No muted conversations' 
                  : 'No active conversations'}
              </p>
              {(showArchived && archivedChats.length === 0) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Archived chats will appear here
                </p>
              )}
              {(showMuted && mutedChats.length === 0) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Muted chats will appear here
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {activeConversations.map((chat) => {
                const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0]
                const isSelected = selectedChatId === chat.id
                const isArchived = archivedChats.includes(chat.id)

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-colors group',
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <div
                      onClick={() => onChatSelect(chat.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {otherParticipant?.name?.charAt(0) || chat.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {chat.name}
                            </p>
                            {isArchived && (
                              <Archive className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
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
                      {chat.unreadCount > 0 && !isArchived && (
                        <Badge className="bg-purple-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {(showArchived || showMuted) && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {showArchived && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnarchive(chat.id)
                            }}
                            className="h-7 w-7 p-0"
                            title="Unarchive"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </Button>
                        )}
                        {showMuted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const muted = JSON.parse(localStorage.getItem('muted_chats') || '[]')
                              const updated = muted.filter((id: string) => id !== chat.id)
                              localStorage.setItem('muted_chats', JSON.stringify(updated))
                              setMutedChats(updated)
                              window.dispatchEvent(new CustomEvent('mutedChatsChanged'))
                              showSuccessToast('Chat unmuted', 'Notifications for this chat have been enabled.')
                            }}
                            className="h-7 w-7 p-0"
                            title="Unmute"
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
