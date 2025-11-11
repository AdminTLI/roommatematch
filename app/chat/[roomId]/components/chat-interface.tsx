'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { 
  Send, 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  Shield,
  MessageCircle,
  Clock,
  Check,
  CheckCheck,
  Flag,
  MoreVertical,
  Ban,
  Trash2,
  CheckCircle,
  XCircle
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
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedUserId, setBlockedUserId] = useState<string | null>(null)
  const [readRetryQueue, setReadRetryQueue] = useState<Array<{ timestamp: number; attempt: number }>>([])
  const [readFailureCount, setReadFailureCount] = useState(0)
  const [readError, setReadError] = useState<string | null>(null)
  const [otherUserVerificationStatus, setOtherUserVerificationStatus] = useState<'verified' | 'unverified' | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const typingDebounceRef = useRef<NodeJS.Timeout>()
  const typingChannelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)
  const messagesChannelRef = useRef<any>(null)
  const resubscribeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const readRetryIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastSeenMap, setLastSeenMap] = useState<Map<string, string>>(new Map())

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

  const markAsRead = useCallback(async (retry = false, attempt = 0) => {
    try {
      const response = await fetchWithCSRF('/api/chat/read', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: roomId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `Failed to mark messages as read (${response.status})`
        
        if (!retry) {
          // Add to retry queue with attempt number for exponential backoff
          setReadRetryQueue(prev => [...prev, { timestamp: Date.now(), attempt: 0 }])
          setReadFailureCount(prev => prev + 1)
          setReadError(errorMessage)
        } else {
          // Update attempt count for retry
          setReadFailureCount(prev => prev + 1)
        }
      } else {
        // Reset failure count and error on success
        setReadFailureCount(0)
        setReadRetryQueue([])
        setReadError(null)
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      const errorMessage = error instanceof Error ? error.message : 'Network error while marking as read'
      
      if (!retry) {
        setReadRetryQueue(prev => [...prev, { timestamp: Date.now(), attempt: 0 }])
        setReadFailureCount(prev => prev + 1)
        setReadError(errorMessage)
      } else {
        setReadFailureCount(prev => prev + 1)
      }
    }
  }, [roomId])

  // Retry failed read receipts with exponential backoff
  useEffect(() => {
    if (readRetryQueue.length === 0) return

    const processRetryQueue = () => {
      if (readRetryQueue.length === 0) return

      const [nextRetry, ...remaining] = readRetryQueue
      const now = Date.now()
      const timeSinceFailure = now - nextRetry.timestamp
      
      // Exponential backoff: 2^attempt seconds (max 60 seconds)
      const backoffDelay = Math.min(1000 * Math.pow(2, nextRetry.attempt), 60000)
      
      if (timeSinceFailure >= backoffDelay) {
        // Time to retry
        markAsRead(true, nextRetry.attempt + 1).then(() => {
          // Remove this retry from queue after attempting
          setReadRetryQueue(prev => prev.slice(1))
        })
      } else {
        // Not time yet, wait and check again
        const waitTime = backoffDelay - timeSinceFailure
        setTimeout(processRetryQueue, waitTime)
      }
    }

    // Process queue immediately
    processRetryQueue()

    // Also set up periodic check (every 5 seconds) as fallback
    const retryInterval = setInterval(processRetryQueue, 5000)
    readRetryIntervalRef.current = retryInterval

    return () => {
      if (readRetryIntervalRef.current) {
        clearInterval(readRetryIntervalRef.current)
      }
    }
  }, [readRetryQueue, markAsRead])

  // Show error toast if read receipts fail repeatedly
  useEffect(() => {
    if (readFailureCount >= 3 && readError) {
      showErrorToast(
        'Connection issue', 
        `Unable to mark messages as read. Retrying automatically... (${readFailureCount} attempts)`
      )
      // Don't reset count - let exponential backoff handle retries
    }
  }, [readFailureCount, readError])

  // Persist last visited room (user-specific)
  useEffect(() => {
    if (roomId && user?.id && typeof window !== 'undefined') {
      localStorage.setItem(`last_chat_room_${user.id}`, roomId)
    }
  }, [roomId, user?.id])

  useEffect(() => {
    console.log('[Realtime] Messages state updated, count:', messages.length)
    console.log('[Realtime] Message IDs:', messages.map(m => m.id))
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }, [messages])

  // Auto-scroll when typing indicators change
  useEffect(() => {
    if (typingUsers.length > 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [typingUsers])

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
      // Only send chatId - server will fetch members server-side
      let profilesMap = new Map<string, any>()
      if (roomId) {
        try {
          const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
            method: 'POST',
            body: JSON.stringify({
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
            is_online: onlineUsers.has(member.user_id),
            last_seen: lastSeenMap.get(member.user_id)
          }
        })

      // Store chat type and other person's name for 1-on-1 chats
      setIsGroup(roomData.is_group || false)
      
      // For 1-on-1 chats, store the other person's name and check if blocked
      if (!roomData.is_group && transformedMembers.length === 1) {
        const otherMember = transformedMembers[0]
        setOtherPersonName(otherMember.name)
        setBlockedUserId(otherMember.id)
        
        // Check if this user is blocked
        try {
          const { data: blockCheck } = await supabase
            .from('match_blocklist')
            .select('id')
            .eq('user_id', user.id)
            .eq('blocked_user_id', otherMember.id)
            .maybeSingle()
          
          setIsBlocked(!!blockCheck)
        } catch (err) {
          console.error('Failed to check block status:', err)
          setIsBlocked(false)
        }
        
        // Check verification status for the other user
        try {
          const { data: verification } = await supabase
            .from('verifications')
            .select('status')
            .eq('user_id', otherMember.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (verification?.status === 'approved') {
            setOtherUserVerificationStatus('verified')
          } else {
            // Also check profile verification_status as fallback
            const profile = profilesMap.get(otherMember.id)
            if (profile?.verification_status === 'verified') {
              setOtherUserVerificationStatus('verified')
            } else {
              setOtherUserVerificationStatus('unverified')
            }
          }
        } catch (err) {
          console.error('Failed to check verification status:', err)
          setOtherUserVerificationStatus('unverified')
        }
      } else {
        setOtherPersonName('')
        setBlockedUserId(null)
        setIsBlocked(false)
        setOtherUserVerificationStatus(null)
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
            const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
              method: 'POST',
              body: JSON.stringify({
                chatId: roomId
              }),
            })

            if (profilesResponse.ok) {
              const responseData = await profilesResponse.json()
              const profiles = responseData?.profiles || []
              // Find the profile for the message sender
              const profile = profiles.find((p: any) => p.user_id === newMessage.user_id)
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
                console.warn('[Realtime] ⚠️ Profile not found for user:', newMessage.user_id, 'Available profiles:', profiles.map((p: any) => p.user_id))
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
          // Show disconnect message if not intentional
          if (messagesChannelRef.current) {
            setError('Connection lost. Attempting to reconnect...')
            // Attempt to resubscribe after a delay
            if (resubscribeTimeoutRef.current) {
              clearTimeout(resubscribeTimeoutRef.current)
            }
            resubscribeTimeoutRef.current = setTimeout(() => {
              console.log('[Realtime] 🔄 Attempting to resubscribe after disconnect...')
              setupRealtimeSubscription()
              resubscribeTimeoutRef.current = null
            }, 2000)
          }
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
          const presence = state[key] as any
          const presenceUserId = presence?.[0]?.user_id || key
          if (presenceUserId === user.id || key === user.id) return false
          return presence && presence[0] && presence[0].typing === true
        })
        // Additional defensive filter before setting state - filter by both key and user_id
        const filtered = typingUsers.filter(id => {
          const presence = state[id] as any
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
        const newPresence = newPresences[0] as any
        const presenceUserId = newPresence?.user_id || key
        if (key !== user.id && presenceUserId !== user.id && newPresence?.typing) {
          setTypingUsers(prev => {
            const updated = [...prev.filter(id => {
              // Filter out both by key and by checking presence state
              const presence = typingChannel.presenceState()[id] as any
              const idUserId = presence?.[0]?.user_id || id
              return id !== key && id !== user.id && idUserId !== user.id
            }), key]
            // Final defensive filter - check both key and user_id
            return updated.filter(id => {
              const presence = typingChannel.presenceState()[id] as any
              const idUserId = presence?.[0]?.user_id || id
              return id !== user.id && idUserId !== user.id
            })
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // Handle when someone leaves - filter by both key and user_id
        setTypingUsers(prev => prev.filter(id => {
          const presence = typingChannel.presenceState()[id] as any
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

    // Set up presence channel for online/offline status
    const presenceChannel = supabase
      .channel(`presence:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const onlineSet = new Set<string>()
        const lastSeen = new Map<string, string>()
        
        Object.keys(state).forEach(key => {
          const presence = state[key] as any
          const presenceUserId = presence?.[0]?.user_id || key
          if (presenceUserId !== user.id) {
            const presenceData = presence?.[0]
            if (presenceData?.online) {
              onlineSet.add(presenceUserId)
            }
            if (presenceData?.last_seen) {
              lastSeen.set(presenceUserId, presenceData.last_seen)
            }
          }
        })
        
        setOnlineUsers(onlineSet)
        setLastSeenMap(lastSeen)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const newPresence = newPresences[0] as any
        const presenceUserId = newPresence?.user_id || key
        if (presenceUserId !== user.id) {
          setOnlineUsers(prev => {
            const updated = new Set(prev)
            updated.add(presenceUserId)
            return updated
          })
          if (newPresence?.last_seen) {
            setLastSeenMap(prev => new Map(prev).set(presenceUserId, newPresence.last_seen))
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        const state = presenceChannel.presenceState()
        const presence = state[key] as any
        const presenceUserId = presence?.[0]?.user_id || key
        if (presenceUserId !== user.id) {
          setOnlineUsers(prev => {
            const updated = new Set(prev)
            updated.delete(presenceUserId)
            return updated
          })
          // Update last seen when user goes offline
          setLastSeenMap(prev => new Map(prev).set(presenceUserId, new Date().toISOString()))
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our own presence
          await presenceChannel.track({
            online: true,
            user_id: user.id,
            last_seen: new Date().toISOString()
          })
          
          // Update presence every 30 seconds to show we're still online
          const presenceInterval = setInterval(async () => {
            if (presenceChannelRef.current) {
              await presenceChannelRef.current.track({
                online: true,
                user_id: user.id,
                last_seen: new Date().toISOString()
              })
            }
          }, 30000)
          
          // Store interval ID for cleanup
          ;(presenceChannelRef.current as any).intervalId = presenceInterval
        }
      })
    
    presenceChannelRef.current = presenceChannel

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
      if (presenceChannelRef.current) {
        // Clear presence interval if it exists
        const intervalId = (presenceChannelRef.current as any).intervalId
        if (intervalId) {
          clearInterval(intervalId)
        }
        // Mark ourselves as offline before leaving
        presenceChannelRef.current.track({
          online: false,
          user_id: user.id,
          last_seen: new Date().toISOString()
        }).then(() => {
          presenceChannelRef.current?.unsubscribe()
          supabase.removeChannel(presenceChannelRef.current!)
          presenceChannelRef.current = null
        })
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
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current)
      }
      if (readRetryIntervalRef.current) {
        clearInterval(readRetryIntervalRef.current)
      }
    }
  }, [roomId, loadChatData, setupRealtimeSubscription, markAsRead])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [messages.length])

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
      const response = await fetchWithCSRF('/api/chat/send', {
        method: 'POST',
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
    // Debounce typing indicator updates (500ms)
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current)
    }

    typingDebounceRef.current = setTimeout(() => {
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

      // Stop typing after 3 seconds of inactivity (improved timeout)
      typingTimeoutRef.current = setTimeout(() => {
        if (channel) {
          channel.track({
            typing: false,
            user_id: user.id
          })
        }
      }, 3000)
    }, 300) // Reduced debounce delay for better responsiveness
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dateStr = date.toDateString()
    const todayStr = today.toDateString()
    const yesterdayStr = yesterday.toDateString()
    
    if (dateStr === todayStr) {
      return 'Today'
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const shouldShowDateSeparator = (currentIndex: number) => {
    if (currentIndex === 0) return true
    const currentMessage = messages[currentIndex]
    const previousMessage = messages[currentIndex - 1]
    
    if (!currentMessage || !previousMessage) return false
    
    const currentDate = new Date(currentMessage.created_at).toDateString()
    const previousDate = new Date(previousMessage.created_at).toDateString()
    
    return currentDate !== previousDate
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

  const mapReportReasonToCategory = (reason: string): 'spam' | 'harassment' | 'inappropriate' | 'other' => {
    const lowerReason = reason.toLowerCase()
    if (lowerReason.includes('spam') || lowerReason.includes('fake')) {
      return 'spam'
    }
    if (lowerReason.includes('harassment')) {
      return 'harassment'
    }
    if (lowerReason.includes('inappropriate') || lowerReason.includes('safety')) {
      return 'inappropriate'
    }
    return 'other'
  }

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      alert('Please select a reason for reporting.')
      return
    }
    setIsReporting(true)
    try {
      const otherUserId = members.find(m => m.id !== user.id)?.id
      if (!otherUserId) {
        alert('Unable to identify user to report.')
        return
      }
      const response = await fetchWithCSRF('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_user_id: otherUserId, 
          category: mapReportReasonToCategory(reportReason),
          details: reportReason,
          message_id: null
        })
      })
      if (response.ok) {
        setShowReportDialog(false)
        setReportReason('')
        showSuccessToast('Report submitted', 'Thank you for your report. We will review it shortly.')
      } else {
        throw new Error('Failed to submit report')
      }
    } catch (error) {
      console.error('Failed to report:', error)
      showErrorToast('Failed to submit report', 'Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  const handleBlockUser = async () => {
    if (isGroup) {
      showErrorToast('Cannot block', 'Blocking is only available for individual chats.')
      return
    }
    
    setIsBlocking(true)
    try {
      const otherUserId = members.find(m => m.id !== user.id)?.id
      if (!otherUserId) {
        alert('Unable to identify user to block.')
        return
      }
      
      // Block user via API
      const response = await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_user_id: otherUserId })
      })
      
      if (response.ok) {
        showSuccessToast('User blocked', 'This user has been blocked and you will no longer receive messages from them.')
        router.push('/chat')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to block user')
      }
    } catch (error: any) {
      console.error('Failed to block:', error)
      showErrorToast('Failed to block user', error.message || 'Please try again.')
    } finally {
      setIsBlocking(false)
    }
  }

  const handleDeleteConversation = async () => {
    setIsDeleting(true)
    try {
      // Remove user from chat members (effectively deleting the conversation for them)
      const response = await fetchWithCSRF(`/api/chat/${roomId}/leave`, {
        method: 'POST'
      })
      
      if (response.ok) {
        showSuccessToast('Conversation deleted', 'The conversation has been deleted.')
        router.push('/chat')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete conversation')
      }
    } catch (error: any) {
      console.error('Failed to delete:', error)
      showErrorToast('Failed to delete conversation', error.message || 'Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
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
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      {/* Compact Chat Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate whitespace-nowrap">
                {isGroup ? 'Roommate Chat' : (otherPersonName || 'Chat')}
              </h1>
              {!isGroup && otherUserVerificationStatus && (
                <div className="flex-shrink-0">
                  {otherUserVerificationStatus === 'verified' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" title="Verified" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" title="Unverified" />
                  )}
                </div>
              )}
              {isGroup && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {members.length}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isGroup && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleBlockUser}
                    disabled={isBlocking}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {isBlocking ? 'Blocking...' : 'Block User'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Conversation'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Message Input - Moved to top */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-2 items-center">
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
            placeholder={isBlocked ? "You cannot send messages to a blocked user" : "Type your message..."}
            disabled={isSending || isBlocked}
            className="flex-1 h-10 text-sm"
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending || isBlocked}
            className="h-10 w-10 p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Blocked User Notice */}
      {isBlocked && blockedUserId && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-b border-red-200">
          <Alert variant="destructive" className="py-2">
            <Ban className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You have blocked this user. Messages from blocked users are hidden.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Chat Members - Compact display for group chats */}
      {isGroup && members.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {member.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages - Scrollable area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages
              .filter(message => !isBlocked || message.sender_id !== blockedUserId)
              .map((message, index) => {
                const showDateSeparator = shouldShowDateSeparator(index)
                
                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-200 px-3 py-1 rounded-full">
                          <span className="text-xs text-gray-600 font-medium">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {message.is_system_message ? (
                      <div className="flex justify-center my-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                          <p className="text-sm text-blue-700 text-center">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flex gap-2 ${message.is_own ? 'justify-end' : 'justify-start'}`}
                      >
                        {!message.is_own && (
                          <Avatar className="w-7 h-7 flex-shrink-0">
                            <AvatarImage src={message.sender_avatar} />
                            <AvatarFallback className="text-xs">
                              {message.sender_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[75%] ${message.is_own ? 'order-first' : ''}`}>
                          {!message.is_own && (
                            <div className="text-xs text-gray-500 mb-1">
                              {message.sender_name}
                            </div>
                          )}
                          <div className={`rounded-lg px-3 py-2 ${
                            message.is_own 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_own && getReadStatus(message)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            
            {/* Typing Indicator */}
            {(() => {
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
                <div className="flex gap-2">
                  <div className="w-7 h-7 flex-shrink-0"></div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
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
        )}
      </div>

      {/* Report User Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {otherPersonName || 'User'}?</DialogTitle>
            <DialogDescription>
              Please select the reason for reporting this user. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              'Inappropriate behavior',
              'Spam or fake profile',
              'Harassment',
              'Safety concerns',
              'Other'
            ].map((reason) => (
              <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReportDialog(false)
              setReportReason('')
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReportUser} disabled={isReporting || !reportReason}>
              {isReporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
