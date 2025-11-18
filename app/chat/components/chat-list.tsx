'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
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
      
      if (chatsError) throw chatsError

      // Optimize: Fetch all messages for all chats in a single query, then process in memory
      // This reduces from O(n²) queries to O(1) query
      // Reuse chatIds already defined above
      let allMessagesMap = new Map<string, any[]>()
      
      if (chatIds.length > 0) {
        const { data: allMessages } = await supabase
          .from('messages')
          .select('chat_id, content, created_at, user_id')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })
        
        // Group messages by chat_id
        if (allMessages) {
          allMessages.forEach((msg: any) => {
            const existing = allMessagesMap.get(msg.chat_id) || []
            allMessagesMap.set(msg.chat_id, [...existing, msg])
          })
        }
      }

      // Process chat rooms with messages from the map
      const chatRoomsWithMessages = (chatRooms || []).map((room: any) => {
        const messages = allMessagesMap.get(room.id) || []
        // Get latest message (first one since we ordered descending)
        const latestMessage = messages.length > 0 ? [messages[0]] : []
        
        return {
          ...room,
          messages: latestMessage,
          allMessages: messages // Store all messages for recently matched check
        }
      })
      
      const finalChatRooms = chatRoomsWithMessages

      // Fetch profiles for all chat rooms in a single batch request
      let profilesMap = new Map<string, any>()
      if (finalChatRooms && finalChatRooms.length > 0) {
        try {
          const chatIds = finalChatRooms.map((room: any) => room.id)
          
          const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
            method: 'POST',
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
          } else {
            const errorText = await profilesResponse.text()
            console.warn(`[ChatList] Failed to fetch profiles batch:`, {
              status: profilesResponse.status,
              statusText: profilesResponse.statusText,
              error: errorText
            })
          }
        } catch (err) {
          console.error('[ChatList] Failed to fetch profiles:', err)
        }
      }

      // Fetch unread counts (GET request doesn't need CSRF)
      const unreadResponse = await fetch('/api/chat/unread')
      const unreadData = unreadResponse.ok ? await unreadResponse.json() : { chat_counts: [] }
      const unreadMap = new Map(unreadData.chat_counts.map((c: any) => [c.chat_id, c.unread_count]))

      // Transform database results to ChatRoom format
      // Use allMessages already fetched above to determine if recently matched
      const transformedChats: ChatRoom[] = (finalChatRooms || []).map((room: any) => {
        // Check if recently matched: A chat is "recently matched" if it has no user messages
        // A chat becomes "active" the moment ANY message is sent or received (not just system greetings)
        const allMessages = room.allMessages || []
        const systemGreeting = "You're matched! Start your conversation 👋"
        
        // Check if there are any user messages (messages that are NOT system greetings)
        // If there are ANY user messages (sent or received), the chat is active
        const hasUserMessages = allMessages.some((msg: any) => {
          // Exclude system greeting messages
          return msg.content !== systemGreeting && msg.user_id !== null
        })
        
        // A chat is recently matched ONLY if it has no user messages (only system greetings or empty)
        // The moment a user sends or receives ANY message, it becomes active
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
          if (firstName) {
            participantName = lastName ? `${firstName} ${lastName}` : firstName
          } else if (lastName) {
            participantName = lastName
          }
        }
        
        // Debug: Log detailed info about profile lookup
        if (!otherProfile && otherParticipant) {
          console.warn(`[ChatList] Profile not found for user ${otherParticipant.user_id} in chat ${room.id}`, {
            otherParticipantUserId: otherParticipant.user_id,
            chatId: room.id,
            profilesMapSize: profilesMap.size,
            profilesMapKeys: Array.from(profilesMap.keys()),
            allChatMemberIds: room.chat_members?.map((m: any) => m.user_id)
          })
        } else if (otherProfile) {
          console.log(`[ChatList] Found profile for user ${otherParticipant.user_id}:`, {
            userId: otherParticipant.user_id,
            firstName: otherProfile.first_name,
            lastName: otherProfile.last_name,
            constructedName: participantName
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
              if (firstName) {
                fullName = lastName ? `${firstName} ${lastName}` : firstName
              } else if (lastName) {
                fullName = lastName
              }
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
          allMessages: allMessages.map((msg: any) => msg.content) // Store all message content for search
        }
      })

      return transformedChats
    } catch (error) {
      // Use console.error here as this is client-side code
      console.error('Failed to load chats:', error)
      return []
    }
  }, [user.id])

  // Use React Query to fetch and cache chats
  const { data: chats = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.chats(user.id),
    queryFn: fetchChats,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user.id,
  })

  // Set up real-time invalidation for messages
  useRealtimeInvalidation({
    table: 'messages',
    event: 'INSERT',
    queryKeys: queryKeys.chats(user.id),
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
    <div className="h-full flex flex-col w-full bg-bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-border-subtle bg-bg-surface">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary mb-0.5">Messages</h1>
            <p className="text-xs sm:text-sm text-text-muted font-normal">Connect with your matches</p>
          </div>
          <Button 
            onClick={handleNewChat} 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg bg-semantic-accent hover:bg-semantic-accent-hover text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-semantic-accent focus:border-semantic-accent/50 text-sm min-h-[40px] bg-bg-surface-alt text-text-primary placeholder:text-text-muted transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto bg-bg-surface relative mt-2">
        {/* White corner overlay to prevent grey showing through rounded corners */}
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-bg-surface rounded-tr-2xl pointer-events-none z-10"></div>
        
        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Pending Invitations</h2>
              <Badge variant="destructive" className="bg-semantic-accent text-white font-bold text-xs px-1.5 py-0.5 h-5">
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
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Recently Matched</h2>
              <Badge variant="destructive" className="bg-semantic-danger text-white font-bold text-xs px-1.5 py-0.5 h-5">
                {recentlyMatchedChats.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {recentlyMatchedChats.map((chat) => {
                const isSelected = selectedChatId === chat.id
                console.log(`[ChatList] Rendering chat card:`, {
                  chatId: chat.id,
                  chatName: chat.name,
                  participantCount: chat.participants.length,
                  participants: chat.participants.map((p: any) => ({ id: p.id, name: p.name }))
                })
                return (
                <div
                  key={chat.id}
                  onClick={(e) => handleChatClick(chat.id, e)}
                  className={`
                    cursor-pointer transition-all duration-200 rounded-xl p-3.5
                    ${isSelected 
                      ? 'bg-semantic-accent/15 border-2 border-semantic-accent/40 shadow-md' 
                      : 'bg-bg-surface border border-border-subtle hover:bg-bg-surface-alt hover:border-semantic-accent/20 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {chat.type === 'individual' ? (
                        <Avatar className="w-12 h-12 ring-2 ring-semantic-accent/20">
                          {(() => {
                            // For individual chats, find the other participant (not the current user)
                            const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                            return (
                              <>
                                <AvatarImage src={otherParticipant?.avatar} />
                                <AvatarFallback className="text-sm font-bold bg-semantic-accent-soft text-semantic-accent">
                                  {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </>
                            )
                          })()}
                        </Avatar>
                      ) : (
                        <div className="relative w-12 h-12">
                          <Avatar className="w-7 h-7 absolute top-0 left-0 ring-2 ring-bg-surface">
                            <AvatarImage src={chat.participants[0]?.avatar} />
                            <AvatarFallback className="text-xs font-semibold">
                              {chat.participants[0]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-7 h-7 absolute bottom-0 right-0 ring-2 ring-bg-surface">
                            <AvatarImage src={chat.participants[1]?.avatar} />
                            <AvatarFallback className="text-xs font-semibold">
                              {chat.participants[1]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {chat.name}
                        </h3>
                        {chat.compatibilityScore && (
                          <Badge className="bg-semantic-success text-white border-0 text-xs font-bold px-1.5 py-0.5 h-5">
                            {chat.compatibilityScore}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-semantic-accent font-medium truncate">
                        Start a conversation with your new match!
                      </p>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Conversations Section */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Active Conversations</h2>
            <Badge variant="secondary" className="text-xs font-bold px-1.5 py-0.5 h-5">
              {activeConversations.length}
            </Badge>
          </div>
          
          {activeConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-bg-surface-alt flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-2">
                {searchQuery ? 'No conversations found' : 'No active conversations'}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : recentlyMatchedChats.length > 0 
                    ? 'Start conversations with your recent matches above'
                    : 'Start a conversation with your matches'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeConversations.map((chat) => {
                const isSelected = selectedChatId === chat.id
                return (
                <div
                  key={chat.id}
                  onClick={(e) => handleChatClick(chat.id, e)}
                  className={`
                    cursor-pointer transition-all duration-200 rounded-xl p-3.5
                    ${isSelected 
                      ? 'bg-semantic-accent/15 border-2 border-semantic-accent/40 shadow-md' 
                      : 'bg-bg-surface border border-border-subtle hover:bg-bg-surface-alt hover:border-semantic-accent/20 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {chat.type === 'individual' ? (
                        <Avatar className="w-12 h-12 ring-2 ring-border-subtle">
                          {(() => {
                            // For individual chats, find the other participant (not the current user)
                            const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                            return (
                              <>
                                <AvatarImage src={otherParticipant?.avatar} />
                                <AvatarFallback className="text-sm font-bold bg-bg-surface-alt text-text-primary">
                                  {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </>
                            )
                          })()}
                        </Avatar>
                      ) : (
                        <div className="relative w-12 h-12">
                          <Avatar className="w-7 h-7 absolute top-0 left-0 ring-2 ring-bg-surface">
                            <AvatarImage src={chat.participants[0]?.avatar} />
                            <AvatarFallback className="text-xs font-semibold">
                              {chat.participants[0]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-7 h-7 absolute bottom-0 right-0 ring-2 ring-bg-surface">
                            <AvatarImage src={chat.participants[1]?.avatar} />
                            <AvatarFallback className="text-xs font-semibold">
                              {chat.participants[1]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {chat.participants.some((p: any) => p.isOnline) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-semantic-success rounded-full border-2 border-bg-surface shadow-sm"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`text-sm truncate ${
                          !chat.lastMessage?.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'
                        }`}>
                          {chat.name}
                        </h3>
                        {chat.lastMessage && chat.lastMessage.created_at && (
                          <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0 font-medium">
                            {(() => {
                              // Parse the raw created_at timestamp, not the formatted timestamp string
                              const date = new Date(chat.lastMessage.created_at)
                              if (isNaN(date.getTime())) return ''
                              return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
                            })()}
                          </span>
                        )}
                      </div>
                      
                      {chat.lastMessage && (
                        <div className="flex items-center gap-2">
                          <p className={`text-xs truncate flex-1 ${
                            !chat.lastMessage.isRead 
                              ? 'font-semibold text-text-primary' 
                              : 'text-text-secondary font-medium'
                          }`}>
                            {chat.lastMessage.content}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-semantic-danger text-white font-bold text-xs flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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