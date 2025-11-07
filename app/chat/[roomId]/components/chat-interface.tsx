'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { 
  Send, 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  Shield,
  MessageCircle,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react'

interface ChatInterfaceProps {
  roomId: string
  user: User
}

interface ChatMember {
  id: string
  name: string
  avatar?: string
  is_online: boolean
  last_seen?: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  created_at: string
  read_by: string[]
  is_own: boolean
  is_system_message?: boolean
}

export function ChatInterface({ roomId, user }: ChatInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<ChatMember[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [profilesMap, setProfilesMap] = useState<Map<string, any>>(new Map())
  const [isGroup, setIsGroup] = useState(false)
  const [otherPersonName, setOtherPersonName] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const typingChannelRef = useRef<any>(null)
  const messagesChannelRef = useRef<any>(null)
  const resubscribeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hi! Great to meet you through Roommate Match!',
      sender_id: 'other1',
      sender_name: 'Emma',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read_by: ['other1', user.id],
      is_own: false
    },
    {
      id: '2',
      content: 'Hi Emma! Yes, I\'m excited too. Your compatibility score was really high!',
      sender_id: user.id,
      sender_name: 'You',
      created_at: new Date(Date.now() - 3500000).toISOString(),
      read_by: ['other1', user.id],
      is_own: true
    },
    {
      id: '3',
      content: 'What are you studying? I saw you\'re in Computer Science.',
      sender_id: 'other1',
      sender_name: 'Emma',
      created_at: new Date(Date.now() - 3400000).toISOString(),
      read_by: ['other1'],
      is_own: false
    }
  ]

  const mockMembers: ChatMember[] = [
    {
      id: user.id,
      name: 'You',
      is_online: true
    },
    {
      id: 'other1',
      name: 'Emma',
      is_online: true
    }
  ]

  // Demo data function
  const getDemoChatData = (roomId: string) => {
    // Different demo data based on roomId
    switch (roomId) {
      case 'chat-1':
        return {
          messages: [
            {
              id: '1',
              content: 'Hey! I saw your profile and we have so much in common. Would you like to chat about potentially living together?',
              sender_id: 'emma',
              sender_name: 'Emma van der Berg',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read_by: ['emma', user.id],
              is_own: false
            },
            {
              id: '2',
              content: 'Hi Emma! Yes, I\'m excited too. Your compatibility score was really high!',
              sender_id: user.id,
              sender_name: 'You',
              created_at: new Date(Date.now() - 3500000).toISOString(),
              read_by: ['emma', user.id],
              is_own: true
            }
          ],
          members: [
            {
              id: user.id,
              name: 'You',
              is_online: true
            },
            {
              id: 'emma',
              name: 'Emma van der Berg',
              is_online: true
            }
          ]
        }
      case 'chat-2':
        return {
          messages: [
            {
              id: '1',
              content: 'Anyone interested in finding a shared apartment near the Science Park?',
              sender_id: 'lucas',
              sender_name: 'Lucas',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              read_by: ['lucas', 'sophie', user.id],
              is_own: false
            },
            {
              id: '2',
              content: 'I\'m definitely interested! I\'m looking for something close to campus.',
              sender_id: user.id,
              sender_name: 'You',
              created_at: new Date(Date.now() - 7000000).toISOString(),
              read_by: ['lucas', 'sophie', user.id],
              is_own: true
            },
            {
              id: '3',
              content: 'Great! We should all meet up to discuss preferences.',
              sender_id: 'sophie',
              sender_name: 'Sophie',
              created_at: new Date(Date.now() - 6800000).toISOString(),
              read_by: ['lucas', 'sophie'],
              is_own: false
            }
          ],
          members: [
            {
              id: user.id,
              name: 'You',
              is_online: true
            },
            {
              id: 'lucas',
              name: 'Lucas',
              is_online: false
            },
            {
              id: 'sophie',
              name: 'Sophie',
              is_online: true
            }
          ]
        }
      default:
        return {
          messages: mockMessages,
          members: mockMembers
        }
    }
  }

  const markAsRead = useCallback(async () => {
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: roomId
        })
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [roomId])

  useEffect(() => {
    console.log('[Realtime] Messages state updated, count:', messages.length)
    console.log('[Realtime] Message IDs:', messages.map(m => m.id))
    scrollToBottom()
  }, [messages])

  const loadChatData = useCallback(async () => {
    setIsLoading(true)
    setError('') // Clear any previous errors
    
    try {
      // For demo mode, use mock data directly
      if (user.id === 'demo-user-id') {
        // Demo data based on roomId
        const demoData = getDemoChatData(roomId)
        setMessages(demoData.messages)
        setMembers(demoData.members)
        setIsLoading(false)
        return
      }

      // Load chat room details
      const { data: roomData, error: roomError } = await supabase
        .from('chats')
        .select(`
          id,
          is_group,
          created_at
        `)
        .eq('id', roomId)
        .single()

      if (roomError) {
        console.error('Failed to load chat room:', roomError)
        throw new Error(`Failed to load chat room: ${roomError.message}`)
      }

      if (!roomData) {
        throw new Error('Chat room not found')
      }

      // Load chat members (without profile join)
      const { data: membersData, error: membersError } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', roomId)

      if (membersError) {
        console.error('Failed to load chat members:', membersError)
        throw new Error(`Failed to load chat members: ${membersError.message}`)
      }

      // Load messages (without profile join)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          created_at
        `)
        .eq('chat_id', roomId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Failed to load messages:', messagesError)
        throw new Error(`Failed to load messages: ${messagesError.message}`)
      }

      // Load read receipts for all messages
      const messageIds = (messagesData || []).map(m => m.id)
      let readReceiptsMap = new Map<string, string[]>()
      if (messageIds.length > 0) {
        const { data: readsData, error: readsError } = await supabase
          .from('message_reads')
          .select('message_id, user_id')
          .in('message_id', messageIds)

        if (!readsError && readsData) {
          // Group read receipts by message_id
          readsData.forEach((read: any) => {
            const existing = readReceiptsMap.get(read.message_id) || []
            readReceiptsMap.set(read.message_id, [...existing, read.user_id])
          })
        }
      }

      // Collect all user IDs from members and messages
      const userIds = new Set<string>()
      membersData?.forEach(m => userIds.add(m.user_id))
      messagesData?.forEach(m => userIds.add(m.user_id))

      // Fetch profiles separately using API route (bypasses RLS)
      let profilesMap = new Map<string, any>()
      if (userIds.size > 0) {
        try {
          const profilesResponse = await fetch('/api/chat/profiles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userIds: Array.from(userIds),
              chatId: roomId
            }),
          })

          if (profilesResponse.ok) {
            const { profiles: profilesData } = await profilesResponse.json()
            if (profilesData) {
              profilesMap = new Map(profilesData.map((p: any) => [p.user_id, p]))
              // Store profiles in state for use in typing indicators
              setProfilesMap(profilesMap)
            }
          } else {
            console.warn('Failed to fetch profiles via API:', await profilesResponse.text())
          }
        } catch (err) {
          console.warn('Failed to fetch profiles:', err)
          // Don't throw - continue with empty profiles map
        }
      }

      // Transform messages data - handle missing profiles gracefully
      const transformedMessages: Message[] = (messagesData || []).map(msg => {
        const profile = profilesMap.get(msg.user_id)
        const senderName = profile 
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : 'Unknown User'
        
        // Get read receipts for this message
        const readBy = readReceiptsMap.get(msg.id) || []
        
        // Check if this is a system greeting message
        const isSystemGreeting = msg.content === "You're matched! Start your conversation 👋"
        
        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.user_id,
          sender_name: senderName,
          created_at: msg.created_at,
          read_by: readBy,
          is_own: msg.user_id === user.id,
          is_system_message: isSystemGreeting
        }
      })

      // Transform participants data - handle missing profiles gracefully
      // Filter out current user so only other participants are shown
      // Also deduplicate by user_id in case of duplicate entries
      const uniqueMembers = Array.from(
        new Map((membersData || []).map(m => [m.user_id, m])).values()
      )
      
      const transformedMembers: ChatMember[] = uniqueMembers
        .filter(member => member.user_id !== user.id) // Exclude current user
        .map(member => {
          const profile = profilesMap.get(member.user_id)
          const memberName = profile
            ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
            : 'Unknown User'
          
          return {
            id: member.user_id,
            name: memberName,
            avatar: undefined, // Avatars not implemented - Avatar component will show initials via AvatarFallback
            is_online: true // This would need real-time presence tracking
          }
        })

      // Store chat type and other person's name for 1-on-1 chats
      setIsGroup(roomData.is_group || false)
      
      // For 1-on-1 chats, store the other person's name
      if (!roomData.is_group && transformedMembers.length === 1) {
        setOtherPersonName(transformedMembers[0].name)
      } else {
        setOtherPersonName('')
      }

      setMessages(transformedMessages)
      setMembers(transformedMembers)
      
    } catch (error) {
      console.error('Failed to load chat data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chat messages'
      setError(`Failed to load chat: ${errorMessage}`)
      // Don't fall back to mock data - show error instead
      setMessages([])
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [user.id, roomId])

  const setupRealtimeSubscription = useCallback(() => {
    console.log('[Realtime] Setting up subscription for roomId:', roomId)
    
    // Clean up existing subscription if any
    if (messagesChannelRef.current) {
      console.log('[Realtime] Cleaning up existing messages channel')
      messagesChannelRef.current.unsubscribe()
      supabase.removeChannel(messagesChannelRef.current)
      messagesChannelRef.current = null
    }

    // Subscribe to new messages via broadcast channel
    const channelName = `room:${roomId}:messages`
    console.log('[Realtime] Creating broadcast channel:', channelName)
    
    const messagesChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true, ack: true }
        }
      })
      .on('broadcast', { event: 'INSERT' }, async (payload) => {
        console.log('[Realtime] ===== BROADCAST CALLBACK TRIGGERED =====')
        console.log('[Realtime] Timestamp:', new Date().toISOString())
        console.log('[Realtime] Event:', payload.event)
        console.log('[Realtime] Full payload:', JSON.stringify(payload, null, 2))
        
        try {
          // Validate payload structure
          if (!payload || typeof payload !== 'object') {
            console.error('[Realtime] ❌ Invalid payload structure:', payload)
            return
          }

          // Broadcast events have payload.payload instead of payload.new
          if (!payload.payload || typeof payload.payload !== 'object') {
            console.error('[Realtime] ❌ Missing or invalid payload.payload:', payload)
            return
          }

          const newMessage = payload.payload as any
          
          // Validate required fields
          if (!newMessage.id) {
            console.error('[Realtime] ❌ Missing message ID in payload:', payload)
            return
          }

          if (!newMessage.chat_id) {
            console.error('[Realtime] ❌ Missing chat_id in payload:', payload)
            return
          }

          // Verify this message belongs to the current chat room
          if (newMessage.chat_id !== roomId) {
            console.warn('[Realtime] ⚠️ Message chat_id mismatch:', {
              messageChatId: newMessage.chat_id,
              currentRoomId: roomId,
              messageId: newMessage.id
            })
            return
          }

          console.log('[Realtime] ✅ Valid message received:', {
            messageId: newMessage.id,
            userId: newMessage.user_id,
            chatId: newMessage.chat_id,
            content: newMessage.content?.substring(0, 50),
            createdAt: newMessage.created_at,
            currentUserId: user.id,
            roomId: roomId
          })
          
          // Only add if it's not from the current user (to avoid duplicates from optimistic updates)
          if (newMessage.user_id === user.id) {
            console.log('[Realtime] ℹ️ Skipping own message (optimistic update already handled):', newMessage.id)
            return
          }
          
          // Fetch profile for the sender using API route
          let senderName = 'Unknown User'
          try {
            console.log('[Realtime] Fetching profile for user:', newMessage.user_id)
            const profilesResponse = await fetch('/api/chat/profiles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userIds: [newMessage.user_id],
                chatId: roomId
              }),
            })

            if (profilesResponse.ok) {
              const responseData = await profilesResponse.json()
              const profile = responseData?.profiles?.[0]
              if (profile) {
                senderName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
                console.log('[Realtime] ✅ Profile fetched successfully:', senderName)
                // Update profilesMap in state for use in typing indicators
                setProfilesMap(prev => {
                  const updated = new Map(prev)
                  updated.set(profile.user_id, profile)
                  return updated
                })
              } else {
                console.warn('[Realtime] ⚠️ Profile not found in response:', responseData)
              }
            } else {
              const errorText = await profilesResponse.text()
              console.warn('[Realtime] ⚠️ Failed to fetch profile, status:', profilesResponse.status, 'Error:', errorText)
            }
          } catch (err) {
            console.error('[Realtime] ❌ Error fetching profile for new message:', err)
            // Continue with 'Unknown User' - don't block message display
          }
          
          // Check if this is a system greeting message
          const isSystemGreeting = newMessage.content === "You're matched! Start your conversation 👋"
          
          setMessages(prev => {
            console.log('[Realtime] 📊 Current state before update:', {
              currentMessagesCount: prev.length,
              currentMessageIDs: prev.map(m => m.id),
              newMessageId: newMessage.id
            })
            
            // Double-check for duplicates
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) {
              console.warn('[Realtime] ⚠️ Message already exists in state, skipping duplicate:', newMessage.id)
              return prev
            }
            
            // Validate message content
            if (!newMessage.content || typeof newMessage.content !== 'string') {
              console.error('[Realtime] ❌ Invalid message content:', newMessage)
              return prev
            }
            
            console.log('[Realtime] ➕ Adding new message to state:', {
              id: newMessage.id,
              sender: senderName,
              senderId: newMessage.user_id,
              isSystem: isSystemGreeting,
              contentPreview: newMessage.content.substring(0, 30),
              createdAt: newMessage.created_at
            })
            
            const messageToAdd: Message = {
              id: newMessage.id,
              content: newMessage.content,
              sender_id: newMessage.user_id,
              sender_name: senderName,
              created_at: newMessage.created_at,
              read_by: [],
              is_own: false,
              is_system_message: isSystemGreeting
            }
            
            const updatedMessages = [...prev, messageToAdd]
            
            console.log('[Realtime] ✅ State updated successfully:', {
              previousCount: prev.length,
              newCount: updatedMessages.length,
              addedMessageId: newMessage.id
            })
            
            return updatedMessages
          })
          
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            try {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            } catch (scrollError) {
              console.warn('[Realtime] ⚠️ Error scrolling to bottom:', scrollError)
            }
          }, 100)
          
          console.log('[Realtime] ✅ Message processing completed successfully')
        } catch (error) {
          console.error('[Realtime] ❌ Fatal error processing new message:', error)
          console.error('[Realtime] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            payload: payload
          })
          
          // Try to reload chat data as fallback
          console.log('[Realtime] 🔄 Attempting to reload chat data as fallback...')
          try {
            await loadChatData()
          } catch (reloadError) {
            console.error('[Realtime] ❌ Failed to reload chat data:', reloadError)
          }
        }
      })
      .subscribe((status, err) => {
        console.log('[Realtime] ===== SUBSCRIPTION STATUS CHANGE =====')
        console.log('[Realtime] Timestamp:', new Date().toISOString())
        console.log('[Realtime] Status:', status)
        console.log('[Realtime] Error:', err)
        console.log('[Realtime] Channel:', channelName)
        console.log('[Realtime] RoomId:', roomId)
        console.log('[Realtime] User ID:', user.id)
        
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] ✅ Successfully subscribed to broadcast channel')
          console.log('[Realtime] 📡 Listening for INSERT broadcast events')
          console.log('[Realtime] 🔍 Channel: ' + channelName)
          console.log('[Realtime] ✅ Ready to receive real-time messages via broadcast')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] ❌ Channel subscription error:', err)
          console.error('[Realtime] ❌ Error details:', {
            error: err,
            channel: channelName,
            roomId: roomId
          })
          // Attempt to resubscribe after a delay (prevent multiple simultaneous attempts)
          if (resubscribeTimeoutRef.current) {
            clearTimeout(resubscribeTimeoutRef.current)
          }
          resubscribeTimeoutRef.current = setTimeout(() => {
            console.log('[Realtime] 🔄 Attempting to resubscribe after error...')
            setupRealtimeSubscription()
            resubscribeTimeoutRef.current = null
          }, 3000)
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] ❌ Channel subscription timed out')
          console.error('[Realtime] ❌ This may indicate network issues or Supabase Realtime service problems')
          // Attempt to resubscribe after a delay (prevent multiple simultaneous attempts)
          if (resubscribeTimeoutRef.current) {
            clearTimeout(resubscribeTimeoutRef.current)
          }
          resubscribeTimeoutRef.current = setTimeout(() => {
            console.log('[Realtime] 🔄 Attempting to resubscribe after timeout...')
            setupRealtimeSubscription()
            resubscribeTimeoutRef.current = null
          }, 3000)
        } else if (status === 'CLOSED') {
          console.log('[Realtime] ℹ️ Channel closed')
          console.log('[Realtime] ℹ️ This is normal when component unmounts or connection is lost')
        } else {
          console.warn('[Realtime] ⚠️ Unknown subscription status:', status)
        }
      })

    // Store channel reference
    messagesChannelRef.current = messagesChannel

    // Subscribe to typing indicators - reuse channel
    const typingChannel = supabase
      .channel(`typing:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState()
        // Debug: log presence state to understand key format
        if (process.env.NODE_ENV === 'development') {
          console.log('[Typing] Presence state keys:', Object.keys(state))
          console.log('[Typing] Current user.id:', user.id)
          console.log('[Typing] Presence state:', JSON.stringify(state, null, 2))
        }
        // Filter to only show typing indicators for other users, not yourself
        const typingUsers = Object.keys(state).filter(key => {
          // Defensive check: never include current user
          // Check both the key itself and the user_id in presence data
          const presence = state[key]
          const presenceUserId = presence?.[0]?.user_id || key
          if (presenceUserId === user.id || key === user.id) return false
          return presence && presence[0] && presence[0].typing === true
        })
        // Additional defensive filter before setting state - filter by both key and user_id
        const filtered = typingUsers.filter(id => {
          const presence = state[id]
          const presenceUserId = presence?.[0]?.user_id || id
          return id !== user.id && presenceUserId !== user.id
        })
        if (process.env.NODE_ENV === 'development') {
          console.log('[Typing] Filtered typing users:', filtered)
        }
        setTypingUsers(filtered)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle when someone joins - defensive check to never add current user
        const presenceUserId = newPresences[0]?.user_id || key
        if (key !== user.id && presenceUserId !== user.id && newPresences[0]?.typing) {
          setTypingUsers(prev => {
            const updated = [...prev.filter(id => {
              // Filter out both by key and by checking presence state
              const presence = typingChannel.presenceState()[id]
              const idUserId = presence?.[0]?.user_id || id
              return id !== key && id !== user.id && idUserId !== user.id
            }), key]
            // Final defensive filter - check both key and user_id
            return updated.filter(id => {
              const presence = typingChannel.presenceState()[id]
              const idUserId = presence?.[0]?.user_id || id
              return id !== user.id && idUserId !== user.id
            })
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // Handle when someone leaves - filter by both key and user_id
        setTypingUsers(prev => prev.filter(id => {
          const presence = typingChannel.presenceState()[id]
          const idUserId = presence?.[0]?.user_id || id
          return id !== key && id !== user.id && idUserId !== user.id
        }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our own presence when subscribed
          await typingChannel.track({
            typing: false,
            user_id: user.id
          })
        }
      })
    
    // Store channel reference for reuse
    typingChannelRef.current = typingChannel

    return () => {
      console.log('[Realtime] Cleaning up subscriptions')
      if (resubscribeTimeoutRef.current) {
        clearTimeout(resubscribeTimeoutRef.current)
        resubscribeTimeoutRef.current = null
      }
      if (messagesChannelRef.current) {
        messagesChannelRef.current.unsubscribe()
        supabase.removeChannel(messagesChannelRef.current)
        messagesChannelRef.current = null
      }
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe()
        supabase.removeChannel(typingChannelRef.current)
        typingChannelRef.current = null
      }
    }
  }, [roomId, user.id, supabase])

  useEffect(() => {
    // Set up realtime subscription immediately
    setupRealtimeSubscription()
    
    // Load chat data
    loadChatData()
    
    // Mark as read
    markAsRead()
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [roomId, loadChatData, setupRealtimeSubscription, markAsRead])

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    // Check for links (safety feature)
    if (containsLinks(newMessage)) {
      setError('Links are not allowed in chat messages for safety reasons.')
      return
    }

    setIsSending(true)
    setError('')

    try {
      // Use the API endpoint for sending messages
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: roomId,
          content: newMessage.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const { message } = await response.json()
      
      // Get sender name from profilesMap (current user's profile should already be loaded)
      const profile = profilesMap.get(user.id)
      const senderName = profile 
        ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        : 'You'
      
      // Add the message to local state immediately for better UX
      setMessages(prev => [...prev, {
        id: message.id,
        content: message.content,
        sender_id: message.user_id,
        sender_name: senderName,
        created_at: message.created_at,
        read_by: [user.id], // Initially only read by sender
        is_own: true
      }])

      // Broadcast the message to all subscribers via realtime channel
      const channel = messagesChannelRef.current
      if (channel) {
        try {
          const channelName = `room:${roomId}:messages`
          console.log('[Realtime] Broadcasting message to channel:', channelName)
          const broadcastPayload = {
            id: message.id,
            chat_id: roomId,
            user_id: message.user_id,
            content: message.content,
            created_at: message.created_at
          }
          
          const { error: broadcastError } = await channel.send({
            type: 'broadcast',
            event: 'INSERT',
            payload: broadcastPayload
          })
          
          if (broadcastError) {
            console.error('[Realtime] Failed to broadcast message:', broadcastError)
          } else {
            console.log('[Realtime] ✅ Message broadcasted successfully')
          }
        } catch (broadcastErr) {
          console.error('[Realtime] Error broadcasting message:', broadcastErr)
          // Don't fail the send - message was already inserted
        }
      } else {
        console.warn('[Realtime] Channel not available for broadcasting')
      }

            setNewMessage('')
            showSuccessToast('Message sent', 'Your message has been delivered.')
            
          } catch (error) {
            console.error('Failed to send message:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
            setError(errorMessage)
            showErrorToast('Failed to send message', errorMessage)
          } finally {
            setIsSending(false)
          }
  }

  const containsLinks = (text: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i
    return urlRegex.test(text)
  }

  const handleTyping = () => {
    // Reuse existing typing channel instead of creating new one
    const channel = typingChannelRef.current
    
    if (!channel) {
      console.warn('Typing channel not initialized')
      return
    }

    // Send typing indicator
    channel.track({
      typing: true,
      user_id: user.id
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      channel.track({
        typing: false,
        user_id: user.id
      })
    }, 3000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getReadStatus = (message: Message) => {
    if (!message.is_own) return null
    
    const otherMembers = members.filter(m => m.id !== user.id)
    const readByOthers = message.read_by.filter(id => id !== user.id)
    
    if (readByOthers.length === otherMembers.length) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (readByOthers.length > 0) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isGroup ? 'Roommate Chat' : (otherPersonName || 'Chat')}
            </h1>
            {isGroup && (
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {members.length} members
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Safe Chat
          </Badge>
        </div>
      </div>

      {/* Safety Notice */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This is a safe, text-only chat. Links and files are blocked for your protection. 
          All messages are moderated.
        </AlertDescription>
      </Alert>

      {/* Chat Members - Only show for group chats */}
      {isGroup && members.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Chat Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {member.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                // Render system messages centered and styled differently
                if (message.is_system_message) {
                  return (
                    <div key={message.id} className="flex justify-center my-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )
                }
                
                // Regular message rendering
                return (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${message.is_own ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.is_own && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={message.sender_avatar} />
                        <AvatarFallback className="text-xs">
                          {message.sender_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md ${message.is_own ? 'order-first' : ''}`}>
                      {!message.is_own && (
                        <div className="text-xs text-gray-500 mb-1">
                          {message.sender_name}
                        </div>
                      )}
                      <div className={`rounded-lg px-3 py-2 ${
                        message.is_own 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatTime(message.created_at)}
                        </span>
                        {message.is_own && getReadStatus(message)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            
            {/* Typing Indicator */}
            {(() => {
              // Filter out current user and get names
              const otherTypingUsers = typingUsers.filter(userId => userId !== user.id)
              if (otherTypingUsers.length === 0) return null

              const typingNames = otherTypingUsers.map(userId => {
                const profile = profilesMap.get(userId)
                if (profile) {
                  return profile.first_name?.trim() || 'User'
                }
                return 'Someone'
              })

              let typingText = ''
              if (typingNames.length === 1) {
                typingText = `${typingNames[0]} is typing...`
              } else if (typingNames.length === 2) {
                typingText = `${typingNames[0]} and ${typingNames[1]} are typing...`
              } else {
                typingText = 'Multiple people are typing...'
              }

              return (
                <div className="flex gap-3">
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {typingText}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message... (Links are not allowed)"
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{newMessage.length}/500 characters</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
