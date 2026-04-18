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
import { MoreVertical, Archive, ArchiveRestore, Bell, BellOff, CheckCheck, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { queryKeys, queryClient } from '@/app/providers'
import { cn } from '@/lib/utils'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

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

export function MessengerSidebar({ user, onChatSelect, selectedChatId }: MessengerSidebarProps) {
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
                .select('user_id, first_name, last_name, avatar_id')
                .in('user_id', Array.from(allUserIds))

              if (!fallbackError && fallbackProfiles) {
                fallbackProfiles.forEach((profile: any) => {
                  if (profile?.user_id) {
                    profilesMap.set(profile.user_id, {
                      ...profile,
                      avatar_url: programmaticAvatarUrl(profile.avatar_id, profile.user_id),
                    })
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

      const latestReactionByChat = new Map<
        string,
        { reaction_at: string; emoji: string; reactor_id: string }
      >()
      if (chatIds.length > 0) {
        const { data: reactionRows, error: reactionRpcError } = await supabase.rpc(
          'latest_reaction_on_my_messages_per_chat',
          { p_user_id: user.id, p_chat_ids: chatIds },
        )
        if (reactionRpcError) {
          console.debug(
            '[MessengerSidebar] latest_reaction_on_my_messages_per_chat unavailable:',
            reactionRpcError.message,
          )
        } else if (Array.isArray(reactionRows)) {
          for (const row of reactionRows as Array<{
            chat_id: string
            reaction_at: string
            emoji: string
            reactor_id: string
          }>) {
            if (row?.chat_id && row.reaction_at) {
              latestReactionByChat.set(row.chat_id, {
                reaction_at: row.reaction_at,
                emoji: row.emoji,
                reactor_id: row.reactor_id,
              })
            }
          }
        }
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

        const reactionSnap = latestReactionByChat.get(room.id)
        const lastMessageRaw = latestMessage
        const lastMessageDate = lastMessageRaw?.created_at ? new Date(lastMessageRaw.created_at) : null
        const lastMessageTime = lastMessageDate ? lastMessageDate.getTime() : 0
        const reactionTime = reactionSnap?.reaction_at ? new Date(reactionSnap.reaction_at).getTime() : 0
        const useReactionPreview = Boolean(reactionSnap && reactionTime > lastMessageTime)

        let lastMessage: ChatRoom['lastMessage'] = undefined
        let mostRecentMessageTime = room.created_at ? new Date(room.created_at).getTime() : 0

        if (useReactionPreview && reactionSnap) {
          const reactorProfile = profilesMap.get(reactionSnap.reactor_id)
          let reactorName = 'User'
          if (reactorProfile) {
            const rfn = reactorProfile.first_name?.trim()
            const rln = reactorProfile.last_name?.trim()
            if (rfn && rln) {
              reactorName = `${rfn} ${rln}`
            } else if (rfn) {
              reactorName = rfn
            } else if (rln) {
              reactorName = rln
            }
          }
          const reactionDate = new Date(reactionSnap.reaction_at)
          lastMessage = {
            content: `reacted ${reactionSnap.emoji} to your message`,
            sender: reactorName,
            timestamp: reactionDate.toLocaleString(),
            isRead: false,
            created_at: reactionSnap.reaction_at,
          }
          mostRecentMessageTime = Math.max(mostRecentMessageTime, reactionTime)
        } else if (lastMessageRaw && lastMessageDate) {
          lastMessage = {
            content: lastMessageRaw.content,
            sender: lastMessageRaw.user_id === user.id ? 'You' : participantName,
            timestamp: lastMessageDate.toLocaleString(),
            isRead: false,
            created_at: lastMessageRaw.created_at,
          }
          mostRecentMessageTime = Math.max(mostRecentMessageTime, lastMessageTime)
        } else {
          mostRecentMessageTime = Math.max(
            mostRecentMessageTime,
            room.created_at ? new Date(room.created_at).getTime() : 0,
          )
        }

        return {
          id: room.id,
          name: room.is_group ? `Group Chat` : participantName,
          type: room.is_group ? 'group' : 'individual',
          lastMessage,
          mostRecentMessageTime,
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
              avatar: profile?.avatar_url || undefined,
              isOnline: false
            }
          }) || [],
          unreadCount: unreadMap.get(room.id) || 0,
          isRecentlyMatched
        }
      })

      const individualIds = transformedChats.filter((c) => c.type === 'individual').map((c) => c.id)
      if (individualIds.length > 0) {
        try {
          const pr = await fetchWithCSRF('/api/chat/privacy-state/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_ids: individualIds }),
          })
          if (pr.ok) {
            const body = (await pr.json()) as {
              by_chat_id?: Record<
                string,
                { partner_user_id: string | null; partner_avatar_url: string | null; partner_display_name: string }
              >
            }
            const byChat = body.by_chat_id || {}
            return transformedChats.map((chat) => {
              if (chat.type !== 'individual') return chat
              const snap = byChat[chat.id]
              if (!snap?.partner_user_id) return chat
              return {
                ...chat,
                name: snap.partner_display_name || chat.name,
                participants: chat.participants.map((p) =>
                  p.id === snap.partner_user_id ? { ...p, avatar: snap.partner_avatar_url || p.avatar } : p,
                ),
              }
            })
          }
        } catch (e) {
          console.warn('[MessengerSidebar] privacy-state batch failed (non-fatal)', e)
        }
      }

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

  // Keep sidebar chat list fresh when new messages arrive.
  useRealtimeInvalidation({
    table: 'messages',
    event: 'INSERT',
    queryKeys: queryKeys.chats(user.id),
    enabled: !!user.id,
  })

  useRealtimeInvalidation({
    table: 'message_reactions',
    event: 'INSERT',
    queryKeys: queryKeys.chats(user.id),
    enabled: !!user.id,
  })

  useRealtimeInvalidation({
    table: 'message_reactions',
    event: 'DELETE',
    queryKeys: queryKeys.chats(user.id),
    enabled: !!user.id,
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
  const { data: onlineUsersData = { users: [] } } = useQuery({
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

  /** Deduped “stories” row: API online users + any participant-flagged online */
  const storyPeople = useMemo(() => {
    const map = new Map<string, { id: string; displayName: string; avatar?: string }>()
    for (const u of onlineUsersList as { id: string; firstName: string; avatar?: string }[]) {
      if (u?.id) {
        map.set(u.id, {
          id: u.id,
          displayName: (u.firstName || 'User').trim() || 'User',
          avatar: u.avatar,
        })
      }
    }
    for (const u of onlineUsers) {
      if (!map.has(u.id)) {
        map.set(u.id, {
          id: u.id,
          displayName: (u.name || 'User').trim() || 'User',
          avatar: u.avatar,
        })
      }
    }
    return Array.from(map.values())
  }, [onlineUsersList, onlineUsers])

  const onlineIdSet = useMemo(() => new Set(storyPeople.map(p => p.id)), [storyPeople])

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
      className="flex h-full w-full flex-col overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Current User Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-3 py-3 dark:border-gray-800">
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
              <Button variant="ghost" size="sm" className="h-11 w-11 shrink-0 p-0 touch-manipulation">
                <MoreVertical className="h-5 w-5" />
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
          <Button variant="ghost" size="sm" className="h-11 w-11 shrink-0 p-0" disabled>
            <MoreVertical className="h-5 w-5" />
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

        {/* Stories-style online row (deduped) */}
        {!showArchived && !showMuted && (
          <div className="border-b border-gray-200 px-3 py-3 dark:border-gray-800">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active now
            </h2>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
              {storyPeople.length > 0 ? (
                storyPeople.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleOnlineUserClick(person.id)}
                    className="flex flex-shrink-0 flex-col items-center gap-1.5 touch-manipulation"
                  >
                    <div className="rounded-full bg-gradient-to-tr from-emerald-400 to-green-600 p-[2px]">
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-950">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="bg-purple-600 text-sm font-semibold text-white">
                          {person.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="max-w-[64px] truncate text-center text-xs font-medium text-gray-900 dark:text-gray-100">
                      {person.displayName}
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1 opacity-60">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200 text-base text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      💤
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[80px] truncate text-center text-xs text-gray-500 dark:text-gray-400">
                    All offline
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recently matched — flat rows */}
        {!showArchived && !showMuted && recentlyMatchedChats.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                New matches ({recentlyMatchedChats.length})
              </h2>
            </div>
            {recentlyMatchedChats.map(chat => {
              const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0]
              const isSelected = selectedChatId === chat.id
              const partnerId = otherParticipant?.id

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onChatSelect(chat.id)}
                  className={cn(
                    'flex w-full items-center gap-3 border-t border-gray-200/90 px-3 py-3 text-left transition-colors active:bg-gray-100 dark:border-gray-800 dark:active:bg-gray-900',
                    isSelected ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-950',
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {otherParticipant?.name?.charAt(0) || chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {partnerId && onlineIdSet.has(partnerId) ? (
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-950"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {chat.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Messages list — flat rows, trailing unread */}
        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {showArchived
                ? `Archived (${archivedChats.length})`
                : showMuted
                  ? `Muted (${mutedChats.length})`
                  : `Messages (${activeConversations.length})`}
            </h2>
            {!showArchived && !showMuted && (() => {
              const totalUnread = activeConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
              return totalUnread > 0 ? (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{totalUnread > 99 ? '99+' : totalUnread} new</span>
              ) : null
            })()}
          </div>
          {activeConversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {showArchived
                  ? 'No archived conversations'
                  : showMuted
                    ? 'No muted conversations'
                    : 'No conversations yet'}
              </p>
              {showArchived && archivedChats.length === 0 && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Archived chats will appear here</p>
              )}
              {showMuted && mutedChats.length === 0 && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Muted chats will appear here</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {activeConversations.map(chat => {
                const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0]
                const isSelected = selectedChatId === chat.id
                const isArchivedRow = archivedChats.includes(chat.id)
                const partnerId = otherParticipant?.id
                const unread = chat.unreadCount > 0 && !isArchivedRow ? chat.unreadCount : 0

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      'group flex items-stretch border-t border-gray-200/90 dark:border-gray-800',
                      isSelected ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-950',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onChatSelect(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-3 pr-2 text-left touch-manipulation active:bg-gray-50 dark:active:bg-gray-900/80"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {otherParticipant?.name?.charAt(0) || chat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {partnerId && onlineIdSet.has(partnerId) ? (
                          <span
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-950"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {chat.name}
                          </p>
                          {isArchivedRow ? <Archive className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden /> : null}
                          {chat.lastMessage ? (
                            <span className="shrink-0 text-[10px] tabular-nums text-gray-500 dark:text-gray-400">
                              {formatMessageTime(chat.lastMessage.created_at || chat.lastMessage.timestamp)}
                            </span>
                          ) : null}
                        </div>
                        {chat.lastMessage ? (
                          <p className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                            {chat.lastMessage.sender ? `${chat.lastMessage.sender}: ` : ''}
                            {chat.lastMessage.content}
                          </p>
                        ) : (
                          <p className="line-clamp-1 text-xs text-gray-400 dark:text-gray-500">No messages yet</p>
                        )}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1 pr-2">
                      {unread > 0 ? (
                        <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-purple-600 px-1.5 text-xs font-semibold text-white tabular-nums">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      ) : null}
                      {(showArchived || showMuted) && (
                        <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                          {showArchived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation()
                                handleUnarchive(chat.id)
                              }}
                              className="h-11 w-11 touch-manipulation p-0"
                              title="Unarchive"
                              type="button"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                          )}
                          {showMuted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation()
                                const muted = JSON.parse(localStorage.getItem('muted_chats') || '[]')
                                const updated = muted.filter((id: string) => id !== chat.id)
                                localStorage.setItem('muted_chats', JSON.stringify(updated))
                                setMutedChats(updated)
                                window.dispatchEvent(new CustomEvent('mutedChatsChanged'))
                                showSuccessToast('Chat unmuted', 'Notifications for this chat have been enabled.')
                              }}
                              className="h-11 w-11 touch-manipulation p-0"
                              title="Unmute"
                              type="button"
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
