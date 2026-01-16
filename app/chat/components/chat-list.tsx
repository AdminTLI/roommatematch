'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  MessageCircle,
  Users,
  Clock,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Star
} from 'lucide-react'
import { NewChatModal } from './new-chat-modal'
import { GroupInvitationCard } from './group-invitation-card'
import { queryKeys, queryClient } from '@/app/providers'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'

interface ChatRoom {
  id: string
  name: string
  type: 'individual' | 'group'
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
    isRead: boolean
    created_at?: string // For sorting
  }
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
  unreadCount: number
  isActive: boolean
  // New fields for match integration
  matchId?: string
  compatibilityScore?: number
  firstMessageAt?: string
  isRecentlyMatched: boolean
  allMessages?: string[] // All message content for search
  mostRecentMessageTime?: number // Timestamp for sorting (most recent first)
}

interface ChatListProps {
  user: User
  onChatSelect?: (chatId: string) => void
  selectedChatId?: string
}

// Helper function for smart timestamp formatting (same as chat interface)
const formatMessageTime = (timestamp: string) => {
  const messageDate = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
  
  // Same day - show time
  if (messageDay.getTime() === today.getTime()) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Yesterday - show "Yesterday"
  if (messageDay.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }
  
  // Same week (Monday to Sunday) - show day name
  const daysDiff = Math.floor((today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff >= 2 && daysDiff < 7) {
    // Check if same week by getting Monday of both weeks
    const getMonday = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      return new Date(d.setDate(diff))
    }
    
    const messageMonday = getMonday(messageDate)
    const todayMonday = getMonday(now)
    
    // Same week and same year - show day name
    if (messageMonday.getTime() === todayMonday.getTime() && messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { weekday: 'long' })
    }
  }
  
  // Older - show short date format (e.g., "1 Jan", "18 Mar")
  return messageDate.toLocaleDateString([], {
    day: 'numeric',
    month: 'short'
  })
}

export function ChatList({ user, onChatSelect, selectedChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [newChatMode, setNewChatMode] = useState<'individual' | 'group' | null>(null)
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Fetch chats with React Query
  const fetchChats = useCallback(async (): Promise<ChatRoom[]> => {
    try {
      // First, get chat memberships for this user
      const { data: memberships, error: membershipsError } = await supabase
        .from('chat_members')
        .select('chat_id, user_id, last_read_at')
        .eq('user_id', user.id)

      if (membershipsError) throw membershipsError

      if (!memberships || memberships.length === 0) {
        return []
      }

      const chatIds = memberships.map(m => m.chat_id)
      const membershipMap = new Map(memberships.map(m => [m.chat_id, m]))

      // Fetch chats with match information (excluding profiles join)
      // Note: Supabase doesn't support ordering nested relations directly,
      // so we fetch messages separately and order them
      const { data: chatRooms, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner(
            user_id,
            last_read_at
          )
        `)
        .in('id', chatIds)
        .order('created_at', { ascending: false })

      if (chatsError) {
        console.error('[ChatList] Error fetching chats:', chatsError)
        throw chatsError
      }

      if (!chatRooms || chatRooms.length === 0) {
        console.warn('[ChatList] No chat rooms found', {
          chatIdsCount: chatIds.length,
          chatIds: chatIds,
          membershipsCount: memberships?.length || 0
        })
        return []
      }

      console.log('[ChatList] Fetched chat rooms:', {
        chatIdsCount: chatIds.length,
        chatRoomsCount: chatRooms.length,
        chatRooms: chatRooms.map((r: any) => ({ id: r.id, is_group: r.is_group, memberCount: r.chat_members?.length || 0 }))
      })

      // Optimize: Fetch latest messages per chat using efficient query
      // For "recently matched" check, we'll check if any message is not a system greeting
      let latestMessagesMap = new Map<string, any>()
      let allMessagesMap = new Map<string, any[]>() // Store all messages per chat for search and active chat detection
      const systemGreeting = "You're matched! Start your conversation 👋"

      if (chatIds.length > 0) {
        // First, fetch latest message per chat for display
        try {
          const { data: allMessages, error: messagesError } = await supabase
            .from('messages')
            .select('chat_id, content, created_at, user_id')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: false })
            .limit(chatIds.length * 10) // Increased limit to get more messages per chat

          if (messagesError) {
            console.warn('[ChatList] Error fetching messages (non-fatal):', messagesError)
            // Continue without messages - chats should still be shown
          }

          // Group by chat_id and keep only the latest (first) message per chat
          // Also store all messages per chat for search functionality
          if (allMessages && allMessages.length > 0) {
            const seenChatIds = new Set<string>()
            allMessages.forEach((msg: any) => {
              const chatId = msg.chat_id
              // Store latest message
              if (!seenChatIds.has(chatId)) {
                latestMessagesMap.set(chatId, msg)
                seenChatIds.add(chatId)
              }
              // Store all messages for search (grouped by chat_id)
              if (!allMessagesMap.has(chatId)) {
                allMessagesMap.set(chatId, [])
              }
              allMessagesMap.get(chatId)!.push(msg)
            })
          }
        } catch (messagesError) {
          console.warn('[ChatList] Exception fetching messages (non-fatal):', messagesError)
          // Continue without messages - chats should still be shown
        }

        // Second, use a more reliable method: check for ANY non-system messages per chat
        // This ensures we catch all chats with user messages, even if the limit above missed them
        try {
          const { data: nonSystemMessages, error: nonSystemError } = await supabase
            .from('messages')
            .select('chat_id')
            .in('chat_id', chatIds)
            .neq('content', systemGreeting) // Get any message that is NOT the system greeting
            .limit(1000) // High limit to ensure we check all chats

          if (!nonSystemError && nonSystemMessages) {
            // Create a set of chat IDs that have non-system messages
            const chatsWithUserMessages = new Set(nonSystemMessages.map((msg: any) => msg.chat_id))
            
            // Update allMessagesMap to mark chats with user messages
            // This ensures we have the correct hasUserMessages flag even if the first query missed messages
            chatsWithUserMessages.forEach((chatId) => {
              // If we don't have messages in allMessagesMap for this chat, add an empty array
              // so that hasUserMessages will be true
              if (!allMessagesMap.has(chatId)) {
                allMessagesMap.set(chatId, [])
              }
            })
            
            // Store the set for later use
            (allMessagesMap as any).chatsWithUserMessages = chatsWithUserMessages
          }
        } catch (nonSystemError) {
          console.warn('[ChatList] Exception checking for non-system messages (non-fatal):', nonSystemError)
          // Continue - we'll rely on the messages we already fetched
        }
      }

      // Process chat rooms with messages from the map
      // IMPORTANT: Always include all chat rooms, even if they have no messages
      const chatsWithUserMessages = (allMessagesMap as any).chatsWithUserMessages || new Set<string>()
      
      const chatRoomsWithMessages = (chatRooms || []).map((room: any) => {
        const latestMessage = latestMessagesMap.get(room.id)
        const messages = latestMessage ? [latestMessage] : []
        
        // Get all messages for this chat to check if there are any user messages
        const allChatMessages = allMessagesMap.get(room.id) || []

        // For "recently matched" check: if ANY message exists and is NOT a system greeting,
        // then the chat is active (has user messages)
        // If there's no message at all, or only system greetings, it's "recently matched"
        // Use the reliable check from the non-system messages query first, then fall back to checking fetched messages
        const hasUserMessages = chatsWithUserMessages.has(room.id) || 
                                allChatMessages.some((msg: any) => msg.content !== systemGreeting)

        return {
          ...room,
          messages: messages,
          // Store flag instead of all messages for memory efficiency
          hasUserMessages: hasUserMessages
        }
      })

      const finalChatRooms = chatRoomsWithMessages

      console.log('[ChatList] Processed chat rooms:', {
        totalRooms: finalChatRooms.length,
        roomsWithMessages: finalChatRooms.filter((r: any) => r.messages.length > 0).length,
        roomsWithoutMessages: finalChatRooms.filter((r: any) => r.messages.length === 0).length
      })

      // Fetch profiles for all chat rooms in a single batch request
      let profilesMap = new Map<string, any>()
      if (finalChatRooms && finalChatRooms.length > 0) {
        try {
          const chatIds = finalChatRooms.map((room: any) => room.id)

          const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatIds: chatIds
            }),
          })

          if (profilesResponse.ok) {
            const { profiles: profilesData } = await profilesResponse.json()
            if (profilesData && Array.isArray(profilesData)) {
              // Build map of profiles by user_id
              profilesData.forEach((profile: any) => {
                if (profile && profile.user_id) {
                  profilesMap.set(profile.user_id, profile)
                }
              })
              console.log(`[ChatList] Loaded ${profilesMap.size} profiles for ${finalChatRooms.length} chats`, {
                profileCount: profilesMap.size,
                chatCount: finalChatRooms.length,
                profiles: Array.from(profilesMap.entries()).map(([id, p]) => ({
                  userId: id,
                  firstName: p.first_name,
                  lastName: p.last_name,
                  fullName: [p.first_name?.trim(), p.last_name?.trim()].filter(Boolean).join(' ') || 'User'
                }))
              })
            } else {
              console.warn(`[ChatList] Profiles data is not an array:`, profilesData)
            }
          } else if (profilesResponse.status === 429) {
            // Rate limited - try fallback: fetch profiles directly from Supabase
            // Collect all user IDs from chat members
            const allUserIds = new Set<string>()
            finalChatRooms.forEach((room: any) => {
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
                console.log(`[ChatList] Fallback: Loaded ${profilesMap.size} profiles directly from Supabase`)
              } else if (fallbackError) {
                // RLS likely blocking - this is expected, log at debug level
                console.debug('[ChatList] Fallback profile fetch blocked by RLS (expected):', fallbackError.message)
              }
            } catch (fallbackErr) {
              console.debug('[ChatList] Fallback profile fetch failed (RLS likely blocking):', fallbackErr)
            }
            }
          } else {
            // Try to read error text, but handle potential errors
            let errorText = ''
            try {
              errorText = await profilesResponse.text()
            } catch (textError) {
              errorText = `Failed to read error response: ${textError instanceof Error ? textError.message : String(textError)}`
            }
            console.warn(`[ChatList] Failed to fetch profiles batch:`, {
              status: profilesResponse.status,
              statusText: profilesResponse.statusText,
              error: errorText
            })
            // Continue without profiles - chats should still be shown with fallback names
          }
        } catch (err) {
          // Handle network errors and other fetch failures gracefully
          const errorMessage = err instanceof Error ? err.message : String(err)
          console.error('[ChatList] Failed to fetch profiles:', {
            error: errorMessage,
            errorType: err instanceof Error ? err.constructor.name : typeof err,
            chatCount: finalChatRooms.length
          })
          // Continue without profiles - chats should still be shown with fallback names
        }
      }

      // Fetch unread counts (GET request doesn't need CSRF)
      let unreadMap = new Map<string, number>()
      try {
        const unreadResponse = await fetch('/api/chat/unread', {
          credentials: 'include',
        })
        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json()
          unreadMap = new Map((unreadData.chat_counts || []).map((c: any) => [c.chat_id, c.unread_count]))
        } else {
          console.warn('[ChatList] Failed to fetch unread counts:', {
            status: unreadResponse.status,
            statusText: unreadResponse.statusText
          })
          // Continue with empty unread map
        }
      } catch (err) {
        console.warn('[ChatList] Error fetching unread counts (non-fatal):', err)
        // Continue with empty unread map - chats will show 0 unread
      }

      // Transform database results to ChatRoom format
      // Use hasUserMessages flag to determine if recently matched
      const transformedChats: ChatRoom[] = (finalChatRooms || []).map((room: any) => {
        // Check if recently matched: A chat is "recently matched" if it has no user messages
        // A chat becomes "active" the moment ANY message is sent or received (not just system greetings)
        // Use the hasUserMessages flag set during message fetching (checks all messages, not just latest)
        const hasUserMessages = room.hasUserMessages || false

        // A chat is recently matched ONLY if it has no user messages (only system greetings or empty)
        // The moment a user sends or receives ANY message, it becomes active
        // If there are ANY messages that are not the system greeting, the chat is active
        const isRecentlyMatched = !hasUserMessages;

        // Compatibility score not available without matches table - set to undefined
        const compatibilityScore = undefined;

        // Get the other participant for individual chats
        const otherParticipant = room.chat_members?.find((p: any) => p.user_id !== user.id)
        const otherProfile = otherParticipant ? profilesMap.get(otherParticipant.user_id) : null

        // Construct participant name with better fallback logic
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
          // Profile not found but participant exists - log for debugging
          console.warn(`[ChatList] Profile not found for participant ${otherParticipant.user_id} in chat ${room.id}`)
        }

        // Debug: Log detailed info about profile lookup (only at debug level to avoid spam)
        if (!otherProfile && otherParticipant) {
          console.debug(`[ChatList] Profile not found for user ${otherParticipant.user_id} in chat ${room.id}`, {
            otherParticipantUserId: otherParticipant.user_id,
            chatId: room.id,
            profilesMapSize: profilesMap.size
          })
        }

        // Get last message
        const lastMessage = room.messages?.[0]
        const userMembership = room.chat_members?.find((p: any) => p.user_id === user.id)
        const lastReadAt = userMembership?.last_read_at || new Date(0).toISOString()

        // Get the most recent message timestamp for sorting
        // Safely parse dates with validation
        const safeParseDate = (dateStr: string | null | undefined): Date | null => {
          if (!dateStr) return null
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date
        }

        const lastMessageDate = lastMessage?.created_at ? safeParseDate(lastMessage.created_at) : null
        const roomCreatedDate = room.created_at ? safeParseDate(room.created_at) : null
        const lastReadDate = safeParseDate(lastReadAt)

        const mostRecentMessageTime = lastMessageDate
          ? lastMessageDate.getTime()
          : (roomCreatedDate ? roomCreatedDate.getTime() : 0)

        // Get all messages for this chat for search functionality
        const chatMessages = allMessagesMap.get(room.id) || []
        const allMessagesContent = chatMessages.map((msg: any) => msg.content)

        return {
          id: room.id,
          name: room.is_group ? `Group Chat` : participantName,
          type: room.is_group ? 'group' : 'individual',
          lastMessage: lastMessage && lastMessageDate ? {
            content: lastMessage.content,
            sender: lastMessage.user_id === user.id ? 'You' : participantName,
            timestamp: lastMessageDate.toLocaleString(),
            isRead: lastReadDate ? lastMessageDate <= lastReadDate : false,
            created_at: lastMessage.created_at // Store raw timestamp for sorting
          } : undefined,
          mostRecentMessageTime, // Add timestamp for sorting
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
              avatar: undefined, // Avatars not implemented - Avatar component will show initials via AvatarFallback
              isOnline: false
            }
          }) || [],
          unreadCount: unreadMap.get(room.id) || 0,
          isActive: false,
          matchId: undefined,
          compatibilityScore,
          firstMessageAt: undefined,
          isRecentlyMatched,
          allMessages: allMessagesContent // Store all message content for search
        }
      })

      console.log('[ChatList] Successfully transformed chats:', {
        totalChats: transformedChats.length,
        recentlyMatched: transformedChats.filter(c => c.isRecentlyMatched).length,
        activeConversations: transformedChats.filter(c => !c.isRecentlyMatched).length,
        chatIds: transformedChats.map(c => c.id)
      })

      return transformedChats
    } catch (error) {
      // Use console.error here as this is client-side code
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : typeof error
      const isNetworkError = error instanceof TypeError && errorMessage === 'Failed to fetch'

      console.error('[ChatList] Failed to load chats:', {
        error: errorMessage,
        errorName,
        isNetworkError,
        userId: user.id,
        stack: error instanceof Error ? error.stack : undefined
      })

      // Return empty array to prevent UI crash - user can retry by refreshing
      return []
    }
  }, [user.id])

  // Memoize queryKeys to prevent unnecessary re-subscriptions
  const chatsQueryKeys = useMemo(() => queryKeys.chats(user.id), [user.id])

  // Use React Query to fetch and cache chats
  const { data: chats = [], isLoading, refetch } = useQuery({
    queryKey: chatsQueryKeys,
    queryFn: fetchChats,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user.id,
  })

  // Set up real-time invalidation for messages
  useRealtimeInvalidation({
    table: 'messages',
    event: 'INSERT',
    queryKeys: chatsQueryKeys,
    enabled: !!user.id,
  })

  // Load pending invitations
  const loadInvitations = useCallback(async () => {
    setIsLoadingInvitations(true)
    try {
      const response = await fetch('/api/chat/invitations')
      if (response.ok) {
        const data = await response.json()
        setPendingInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setIsLoadingInvitations(false)
    }
  }, [])

  // Load invitations on mount
  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])

  // Extract online users from chats using useMemo to avoid infinite loops
  const onlineUsers = useMemo(() => {
    const onlineUsersMap = new Map<string, {id: string, name: string, avatar?: string}>()
    
    chats.forEach(chat => {
      chat.participants.forEach(participant => {
        // Only include participants who are online and not the current user
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

  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()

    // Search in chat name
    if (chat.name.toLowerCase().includes(query)) {
      return true
    }

    // Search in participant names
    if (chat.participants.some(p => p.name.toLowerCase().includes(query))) {
      return true
    }

    // Search in message content
    if (chat.allMessages && chat.allMessages.some(msg =>
      msg.toLowerCase().includes(query)
    )) {
      return true
    }

    // Search in last message
    if (chat.lastMessage?.content.toLowerCase().includes(query)) {
      return true
    }

    return false
  })

  // Separate chats into recently matched and active conversations
  // Sort both sections by most recent message timestamp (most recent first)
  const recentlyMatchedChats = filteredChats
    .filter(chat => chat.isRecentlyMatched)
    .sort((a, b) => {
      // Sort by most recent message timestamp, or chat creation time if no messages
      const timeA = (a as any).mostRecentMessageTime || 0
      const timeB = (b as any).mostRecentMessageTime || 0
      return timeB - timeA // Most recent first
    })

  const activeConversations = filteredChats
    .filter(chat => !chat.isRecentlyMatched)
    .sort((a, b) => {
      // Sort by most recent message timestamp (most recent first)
      const timeA = (a as any).mostRecentMessageTime || 0
      const timeB = (b as any).mostRecentMessageTime || 0
      return timeB - timeA // Most recent first
    })

  // Debug: Log chat counts
  console.log('[ChatList] Chat counts:', {
    total: chats.length,
    filtered: filteredChats.length,
    recentlyMatched: recentlyMatchedChats.length,
    active: activeConversations.length,
    isLoading
  })

  const handleChatClick = (chatId: string, e?: React.MouseEvent) => {
    // Prevent event propagation if clicked on nested interactive elements
    if (e) {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) {
        return
      }
      // Prevent default to avoid any form submission or other default behaviors
      e.preventDefault()
      e.stopPropagation()
    }

    if (!chatId) {
      console.error('[ChatList] Cannot select: chatId is missing')
      return
    }

    // Persist last visited room
    try {
      localStorage.setItem(`last_chat_room_${user.id}`, chatId)
    } catch (error) {
      // Silently fail if localStorage is unavailable
    }

    console.log(`[ChatList] Selecting chat room: ${chatId}`, {
      chatId,
      userId: user.id
    })

    // Call the selection callback instead of navigating
    if (onChatSelect) {
      onChatSelect(chatId)
    }
  }

  const handleNewChat = (mode?: 'individual' | 'group') => {
    setNewChatMode(mode || null)
    setIsNewChatModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-h1 text-gray-900">Messages</h1>
          <p className="text-body-lg text-gray-600">
            Connect with your potential roommates
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-full flex flex-col w-full bg-white overflow-hidden min-h-0"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-6 border-b border-white bg-white">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
            <p className="text-sm text-gray-600 font-medium">Connect with your matches</p>
          </div>
          <Button
            onClick={() => handleNewChat()}
            size="sm"
            className="h-10 w-10 p-0 rounded-full bg-chat-surface-sent hover:opacity-90 text-white shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-white rounded-full focus:ring-2 focus:ring-chat-surface-sent/50 focus:border-chat-surface-sent/50 focus:bg-gray-100 text-sm min-h-[44px] text-gray-900 placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto relative mt-2 scrollbar-visible bg-white">
        {/* Online Now Section */}
        {onlineUsers.length > 0 && (
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Online now
              </h2>
              <button className="text-xs text-chat-surface-sent hover:opacity-80 transition-opacity font-medium">
                More &gt;
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {onlineUsers.slice(0, 10).map((onlineUser) => (
                <div
                  key={onlineUser.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Find chat with this user and select it
                    const chatWithUser = chats.find(chat => 
                      chat.type === 'individual' && 
                      chat.participants.some(p => p.id === onlineUser.id)
                    )
                    if (chatWithUser && onChatSelect) {
                      onChatSelect(chatWithUser.id)
                    }
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={onlineUser.avatar} />
                      <AvatarFallback className="text-sm font-semibold bg-chat-surface text-gray-900">
                        {onlineUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-chat-online rounded-full border-2 border-chat-bg-primary"></div>
                  </div>
                  <span className="text-xs text-gray-900 font-medium max-w-[60px] truncate">
                    {onlineUser.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-chat-surface-sent rounded-full"></span>
                Pending Invitations
              </h2>
              <Badge className="bg-chat-surface-sent text-white font-bold text-xs px-2 py-0.5 h-5 shadow-sm rounded-full">
                {pendingInvitations.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <GroupInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccepted={(chatId) => {
                    loadInvitations()
                    queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
                    if (onChatSelect) {
                      onChatSelect(chatId)
                    }
                  }}
                  onRejected={() => {
                    loadInvitations()
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recently Matched Section */}
        {recentlyMatchedChats.length > 0 && (
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-chat-online rounded-full"></span>
                Recently Matched
              </h2>
              <Badge className="bg-chat-online/20 text-chat-online border border-chat-online/40 text-xs font-bold px-2 py-0.5 h-5 shadow-sm rounded-full">
                {recentlyMatchedChats.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {recentlyMatchedChats.map((chat, index) => {
                const isSelected = selectedChatId === chat.id
                console.log(`[ChatList] Rendering chat card:`, {
                  chatId: chat.id,
                  chatName: chat.name,
                  participantCount: chat.participants.length,
                  participants: chat.participants.map((p: any) => ({ id: p.id, name: p.name }))
                })
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleChatClick(chat.id, e)}
                    className={`
                    cursor-pointer transition-all duration-300 rounded-2xl p-4 mb-1 group relative overflow-hidden
                    ${isSelected
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-lg'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                  `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {chat.type === 'individual' ? (
                          <div className="relative">
                            <Avatar className={`w-14 h-14 ring-2 shadow-lg ${isSelected ? 'ring-chat-surface-sent/50' : 'ring-chat-border/30'}`}>
                              {(() => {
                                // For individual chats, find the other participant (not the current user)
                                const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                                return (
                                  <>
                                    <AvatarImage src={otherParticipant?.avatar} />
                                    <AvatarFallback className="text-base font-bold bg-chat-surface-sent text-white">
                                      {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </>
                                )
                              })()}
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-bg-surface shadow-sm"></div>
                          </div>
                        ) : (
                          <div className="relative w-14 h-14">
                            <Avatar className="w-8 h-8 absolute top-0 left-0 ring-2 ring-bg-surface shadow-md">
                              <AvatarImage src={chat.participants[0]?.avatar} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                {chat.participants[0]?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="w-8 h-8 absolute bottom-0 right-0 ring-2 ring-bg-surface shadow-md">
                              <AvatarImage src={chat.participants[1]?.avatar} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                {chat.participants[1]?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                            {chat.name}
                          </h3>
                        </div>
                        <p className={`text-xs font-medium truncate ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>
                          ✨ Start a conversation with your new match!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Conversations Section */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-chat-surface-sent rounded-full"></span>
              Active Conversations
            </h2>
            <Badge className="bg-gray-100 text-gray-600 border border-white text-xs font-bold px-2 py-0.5 h-5 shadow-sm rounded-full">
              {activeConversations.length}
            </Badge>
          </div>

          {activeConversations.length === 0 ? (
            <div className="text-center py-16 px-2 sm:px-4 lg:px-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                <MessageCircle className="h-10 w-10 text-indigo-400/60" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No active conversations'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : recentlyMatchedChats.length > 0
                    ? 'Start conversations with your recent matches above'
                    : 'Start a conversation with your matches'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeConversations.map((chat, index) => {
                const isSelected = selectedChatId === chat.id
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleChatClick(chat.id, e)}
                    className={`
                    cursor-pointer transition-all duration-300 rounded-2xl p-4 mb-1 group relative overflow-hidden
                    ${isSelected
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-lg'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                  `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {chat.type === 'individual' ? (
                          <div className="relative">
                            <Avatar className={`w-12 h-12 ring-2 shadow-lg ${isSelected ? 'ring-chat-surface-sent/50' : 'ring-chat-border/30'}`}>
                              {(() => {
                                // For individual chats, find the other participant (not the current user)
                                const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                                return (
                                  <>
                                    <AvatarImage src={otherParticipant?.avatar} />
                                    <AvatarFallback className={`text-sm font-bold ${isSelected ? 'bg-chat-surface-sent text-white' : 'bg-chat-surface text-gray-900 transition-all'}`}>
                                      {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </>
                                )
                              })()}
                            </Avatar>
                            {chat.participants.some((p: any) => p.isOnline) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-chat-online rounded-full border-2 border-chat-bg-primary shadow-lg"></div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-12 h-12">
                            <Avatar className="w-7 h-7 absolute top-0 left-0 ring-2 ring-bg-surface shadow-md">
                              <AvatarImage src={chat.participants[0]?.avatar} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                {chat.participants[0]?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="w-7 h-7 absolute bottom-0 right-0 ring-2 ring-bg-surface shadow-md">
                              <AvatarImage src={chat.participants[1]?.avatar} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                {chat.participants[1]?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className={`text-sm truncate ${!chat.lastMessage?.isRead 
                            ? `font-bold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`
                            : `font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`
                            }`}>
                            {chat.name}
                          </h3>
                          {chat.lastMessage && chat.lastMessage.created_at && (
                            <span className={`text-[10px] whitespace-nowrap flex-shrink-0 font-medium ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>
                              {(() => {
                                const date = new Date(chat.lastMessage.created_at)
                                if (isNaN(date.getTime())) return ''
                                return formatMessageTime(chat.lastMessage.created_at)
                              })()}
                            </span>
                          )}
                        </div>

                        {chat.lastMessage && (
                          <div className="flex items-center gap-2">
                            <p className={`text-xs truncate flex-1 ${!chat.lastMessage.isRead
                              ? `font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`
                              : `font-medium ${isSelected ? 'text-gray-600' : 'text-gray-600'}`
                              }`}>
                              {chat.lastMessage.content}
                            </p>
                            {chat.unreadCount > 0 && (
                              <Badge className="bg-chat-surface-sent text-white font-bold text-xs flex-shrink-0 min-w-[22px] h-5 flex items-center justify-center px-2 rounded-full">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => {
          setIsNewChatModalOpen(false)
          setNewChatMode(null)
        }}
        user={user}
        initialMode={newChatMode || undefined}
        onChatCreated={(chatId) => {
          // Refresh chat list to show the new chat
          queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
          // Select the newly created chat
          if (onChatSelect) {
            onChatSelect(chatId)
          }
          // Close modal
          setIsNewChatModalOpen(false)
          setNewChatMode(null)
        }}
      />
    </div>
  )
}