'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
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

interface ChatRoom {
  id: string
  name: string
  type: 'individual' | 'group'
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
    isRead: boolean
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
}

interface ChatListProps {
  user: User
}

export function ChatList({ user }: ChatListProps) {
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [newChatMode, setNewChatMode] = useState<'individual' | 'group' | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const loadChats = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // First, get chat memberships for this user
      const { data: memberships, error: membershipsError } = await supabase
        .from('chat_members')
        .select('chat_id, user_id, last_read_at')
        .eq('user_id', user.id)

      if (membershipsError) throw membershipsError

      if (!memberships || memberships.length === 0) {
        setChats([])
        setIsLoading(false)
        return
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

      // Fetch profiles for each chat room using API route (bypasses RLS)
      // Fetch in parallel for better performance
      let profilesMap = new Map<string, any>()
      if (finalChatRooms && finalChatRooms.length > 0) {
        try {
          const profilePromises = finalChatRooms.map(async (room: any) => {
            try {
              const profilesResponse = await fetch('/api/chat/profiles', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chatId: room.id
                }),
              })

              if (profilesResponse.ok) {
                const { profiles: profilesData } = await profilesResponse.json()
                if (profilesData && Array.isArray(profilesData)) {
                  return profilesData
                }
                return []
              } else {
                const errorText = await profilesResponse.text()
                console.warn(`Failed to fetch profiles for chat ${room.id}:`, errorText)
                return []
              }
            } catch (err) {
              console.error(`Failed to fetch profiles for chat ${room.id}:`, err)
              return []
            }
          })

          const allProfilesArrays = await Promise.all(profilePromises)
          // Flatten and deduplicate profiles by user_id
          allProfilesArrays.flat().forEach((profile: any) => {
            if (profile && profile.user_id) {
              profilesMap.set(profile.user_id, profile)
            }
          })
          
          // Debug: Log profile count
          console.log(`[ChatList] Loaded ${profilesMap.size} profiles for ${finalChatRooms.length} chats`)
        } catch (err) {
          console.error('[ChatList] Failed to fetch profiles:', err)
        }
      }

      // Fetch unread counts
      const unreadResponse = await fetch('/api/chat/unread')
      const unreadData = unreadResponse.ok ? await unreadResponse.json() : { chat_counts: [] }
      const unreadMap = new Map(unreadData.chat_counts.map((c: any) => [c.chat_id, c.unread_count]))

      // Transform database results to ChatRoom format
      // Use allMessages already fetched above to determine if recently matched
      const transformedChats: ChatRoom[] = (finalChatRooms || []).map((room: any) => {
        // Check if recently matched: A chat is "recently matched" if all messages are system greetings
        // Use allMessages already fetched in the optimization above
        const allMessages = room.allMessages || []
        const hasUserMessages = allMessages.some((msg: any) => 
          msg.content !== "You're matched! Start your conversation 👋"
        )
        
        // A chat is recently matched if it has no user messages (only system greetings or empty)
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
        
        // Debug: Log if profile is missing
        if (!otherProfile && otherParticipant) {
          console.warn(`[ChatList] Profile not found for user ${otherParticipant.user_id} in chat ${room.id}`)
        }
        
        // Get last message
        const lastMessage = room.messages?.[0]
        const userMembership = room.chat_members?.find((p: any) => p.user_id === user.id)
        const lastReadAt = userMembership?.last_read_at || new Date(0).toISOString()
        
        return {
          id: room.id,
          name: room.is_group ? `Group Chat` : participantName,
          type: room.is_group ? 'group' : 'individual',
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.user_id === user.id ? 'You' : participantName,
            timestamp: new Date(lastMessage.created_at).toLocaleString(),
            isRead: new Date(lastMessage.created_at) <= new Date(lastReadAt)
          } : undefined,
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

      setChats(transformedChats)
      setIsLoading(false)
    } catch (error) {
      // Use console.error here as this is client-side code
      console.error('Failed to load chats:', error)
      setChats([])
      setIsLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadChats()
  }, [loadChats])

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
  const recentlyMatchedChats = filteredChats.filter(chat => chat.isRecentlyMatched)
  const activeConversations = filteredChats.filter(chat => !chat.isRecentlyMatched)

  const handleChatClick = (chatId: string, e?: React.MouseEvent) => {
    // Prevent event propagation if clicked on nested interactive elements
    if (e) {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) {
        return
      }
    }
    
    if (!chatId) {
      console.error('[ChatList] Cannot navigate: chatId is missing')
      return
    }
    console.log(`[ChatList] Navigating to chat room: ${chatId}`)
    router.push(`/chat/${chatId}`)
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
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">Messages</h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          Connect with your potential roommates and start meaningful conversations
        </p>
      </div>

      {/* Search and New Chat */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-body"
          />
        </div>
        <Button onClick={handleNewChat} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Recently Matched Section */}
      {recentlyMatchedChats.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Recently Matched</h2>
            <Badge variant="destructive" className="bg-red-600 text-white font-semibold">
              {recentlyMatchedChats.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Start conversations with your new matches
          </p>
          
          <div className="space-y-3">
            {recentlyMatchedChats.map((chat) => (
              <Card 
                key={chat.id} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-blue-200 bg-blue-50"
                onClick={(e) => handleChatClick(chat.id, e)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {chat.type === 'individual' ? (
                        <Avatar className="w-14 h-14">
                          {(() => {
                            // For individual chats, find the other participant (not the current user)
                            const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                            return (
                              <>
                                <AvatarImage src={otherParticipant?.avatar} />
                                <AvatarFallback className="text-lg font-semibold">
                                  {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </>
                            )
                          })()}
                        </Avatar>
                      ) : (
                        <div className="relative w-14 h-14">
                          <Avatar className="w-10 h-10 absolute top-0 left-0">
                            <AvatarImage src={chat.participants[0]?.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {chat.participants[0]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-10 h-10 absolute bottom-0 right-0">
                            <AvatarImage src={chat.participants[1]?.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {chat.participants[1]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {chat.compatibilityScore && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {chat.compatibilityScore}% match
                            </Badge>
                          )}
                          {chat.type === 'group' && (
                            <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                              <Users className="w-3 h-3 mr-1" />
                              Group
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-body-sm text-blue-700 font-medium">
                          Start a conversation with your new match!
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Conversations Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Active Conversations</h2>
          <Badge variant="secondary">
            {activeConversations.length}
          </Badge>
        </div>
        
        {activeConversations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-h3 text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No active conversations'}
              </h3>
              <p className="text-body text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : recentlyMatchedChats.length > 0 
                    ? 'Start conversations with your recent matches above'
                    : 'Start a conversation with your matches'
                }
              </p>
              {!searchQuery && recentlyMatchedChats.length === 0 && (
                <Button onClick={handleNewChat}>
                  Start New Chat
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeConversations.map((chat) => (
              <Card 
                key={chat.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  chat.isActive ? 'ring-2 ring-primary-600' : ''
                }`}
                onClick={(e) => handleChatClick(chat.id, e)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {chat.type === 'individual' ? (
                        <Avatar className="w-14 h-14">
                          {(() => {
                            // For individual chats, find the other participant (not the current user)
                            const otherParticipant = chat.participants.find((p: any) => p.id !== user.id) || chat.participants[0]
                            return (
                              <>
                                <AvatarImage src={otherParticipant?.avatar} />
                                <AvatarFallback className="text-lg font-semibold">
                                  {otherParticipant?.name?.charAt(0) || chat.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </>
                            )
                          })()}
                        </Avatar>
                      ) : (
                        <div className="relative w-14 h-14">
                          <Avatar className="w-10 h-10 absolute top-0 left-0">
                            <AvatarImage src={chat.participants[0]?.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {chat.participants[0]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-10 h-10 absolute bottom-0 right-0">
                            <AvatarImage src={chat.participants[1]?.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {chat.participants[1]?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {chat.participants.some(p => p.isOnline) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {chat.type === 'group' && (
                            <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                              <Users className="w-3 h-3 mr-1" />
                              Group
                            </Badge>
                          )}
                          {chat.lastMessage && (
                            <span className="text-body-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {chat.lastMessage.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {chat.lastMessage && (
                        <div className="flex items-center gap-3">
                          <p className={`text-body-sm truncate flex-1 ${
                            !chat.lastMessage.isRead 
                              ? 'font-semibold text-gray-900' 
                              : 'text-gray-600'
                          }`}>
                            <span className="font-medium">{chat.lastMessage.sender}:</span> {chat.lastMessage.content}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-red-600 text-white font-semibold">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleNewChat('group')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Group Chats</h3>
            <p className="text-body-sm text-gray-600">
              Find study groups and roommates
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleNewChat('individual')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Direct Messages</h3>
            <p className="text-body-sm text-gray-600">
              One-on-one conversations
            </p>
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}