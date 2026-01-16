'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
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
import { queryKeys, queryClient } from '@/app/providers'
import { safeLogger } from '@/lib/utils/logger'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'
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
  MoreHorizontal,
  Ban,
  Trash2,
  CheckCircle,
  LogOut,
  BarChart3,
  Info,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react'
import { GroupCompatibilityDisplay } from '../../components/group-compatibility-display'
import { GroupFeedbackForm } from '../../components/group-feedback-form'
import { LockedGroupChat } from '../../components/locked-group-chat'
// Removed CompatibilityPanel and UserInfoPanel - now using ProfileCompatibilityPane in right sidebar
import { MessageSkeleton } from '@/components/ui/message-skeleton'
import { MessageSearch } from './message-search'
import { MessageReactions } from './message-reactions'

interface ChatInterfaceProps {
  roomId: string
  user: User
  onBack?: () => void
  onToggleRightPane?: () => void
  rightPaneOpen?: boolean
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

export function ChatInterface({ roomId, user, onBack, onToggleRightPane, rightPaneOpen = false }: ChatInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<ChatMember[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [profilesMap, setProfilesMap] = useState<Map<string, any>>(new Map())
  const [isGroup, setIsGroup] = useState(false)
  const [otherPersonName, setOtherPersonName] = useState<string>('')
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [showMessageReportDialog, setShowMessageReportDialog] = useState(false)
  const [selectedMessageForReport, setSelectedMessageForReport] = useState<Message | null>(null)
  const [messageReportReason, setMessageReportReason] = useState('')
  const [messageReportDetails, setMessageReportDetails] = useState('')
  const [isReportingMessage, setIsReportingMessage] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedUserId, setBlockedUserId] = useState<string | null>(null)
  const [readRetryQueue, setReadRetryQueue] = useState<Array<{ timestamp: number; attempt: number }>>([])
  const [readFailureCount, setReadFailureCount] = useState(0)
  const [readError, setReadError] = useState<string | null>(null)
  const [otherUserVerificationStatus, setOtherUserVerificationStatus] = useState<'verified' | 'unverified' | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [groupCompatibility, setGroupCompatibility] = useState<any>(null)
  const [showCompatibility, setShowCompatibility] = useState(false)
  const [showLeaveGroupDialog, setShowLeaveGroupDialog] = useState(false)
  const [isLeavingGroup, setIsLeavingGroup] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  // Removed panel state - now handled by right pane in ChatThreeColumnLayout
  const [hasMatch, setHasMatch] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [messageReactions, setMessageReactions] = useState<Map<string, Array<{ emoji: string; count: number; userReactions: string[] }>>>(new Map())
  const reactionsChannelRef = useRef<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const typingDebounceRef = useRef<NodeJS.Timeout>()
  const typingChannelRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)
  const messagesChannelRef = useRef<any>(null)
  const resubscribeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const readRetryIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUnmountingRef = useRef(false)
  const setupRealtimeSubscriptionRef = useRef<(() => void) | null>(null)
  const messageChannelRetryAttempts = useRef(0)
  const typingChannelRetryAttempts = useRef(0)
  const presenceChannelRetryAttempts = useRef(0)
  const typingChannelResubscribeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const presenceChannelResubscribeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastSeenMap, setLastSeenMap] = useState<Map<string, string>>(new Map())
  const [lastReadAt, setLastReadAt] = useState<string | null>(null)
  const firstUnreadMessageRef = useRef<HTMLDivElement>(null)

  // Helper function to scroll container to bottom (prevents page scroll)
  const scrollContainerToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    const container = messagesContainerRef.current
    if (!container) return
    
    if (behavior === 'smooth') {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    } else {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  // Helper function to scroll container to element (prevents page scroll)
  const scrollContainerToElement = useCallback((element: HTMLElement, block: 'start' | 'center' | 'end' | 'nearest' = 'center') => {
    const container = messagesContainerRef.current
    if (!container || !container.contains(element)) return

    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const containerScrollTop = container.scrollTop
    const elementOffsetTop = elementRect.top - containerRect.top + containerScrollTop

    let targetScrollTop: number
    if (block === 'center') {
      targetScrollTop = elementOffsetTop - (container.clientHeight / 2) + (elementRect.height / 2)
    } else if (block === 'start') {
      targetScrollTop = elementOffsetTop
    } else if (block === 'end') {
      targetScrollTop = elementOffsetTop - container.clientHeight + elementRect.height
    } else {
      // nearest - scroll only if element is not visible
      const isVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom
      if (isVisible) return
      targetScrollTop = elementOffsetTop - (container.clientHeight / 2) + (elementRect.height / 2)
    }

    container.scrollTop = Math.max(0, Math.min(targetScrollTop, container.scrollHeight - container.clientHeight))
  }, [])

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hi! Great to meet you through Domu Match!',
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
      safeLogger.error('[Chat] Failed to mark as read:', error)
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

  // Panel state now managed by ChatThreeColumnLayout parent component

  // Note: Auto-scroll logic is now handled in the useEffect that checks for unread messages
  // This prevents scrolling to bottom on every message change

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
      // Try to load with lock columns first, fallback to basic query if columns don't exist
      let roomData: any = null
      let roomError: any = null

      // First try with lock columns (for new schema)
      const { data: roomDataWithLock, error: roomErrorWithLock } = await supabase
        .from('chats')
        .select(`
          id,
          is_group,
          is_locked,
          lock_reason,
          lock_expires_at,
          created_at
        `)
        .eq('id', roomId)
        .single()

      // If error is about missing columns, try without them
      if (roomErrorWithLock && roomErrorWithLock.message?.includes('does not exist')) {
        const { data: roomDataBasic, error: roomErrorBasic } = await supabase
          .from('chats')
          .select(`
            id,
            is_group,
            created_at
          `)
          .eq('id', roomId)
          .single()

        if (roomErrorBasic) {
          roomError = roomErrorBasic
        } else {
          roomData = roomDataBasic ? { ...roomDataBasic, is_locked: false, lock_reason: null, lock_expires_at: null } : null
        }
      } else {
        roomData = roomDataWithLock
        roomError = roomErrorWithLock
      }

      if (roomError) {
        safeLogger.error('[Chat] Failed to load chat room:', roomError)
        throw new Error(`Failed to load chat room: ${roomError.message}`)
      }

      if (!roomData) {
        throw new Error('Chat room not found')
      }

      // Load chat members (with last_read_at for scroll position)
      const { data: membersData, error: membersError } = await supabase
        .from('chat_members')
        .select('user_id, last_read_at')
        .eq('chat_id', roomId)

      if (membersError) {
        safeLogger.error('[Chat] Failed to load chat members:', membersError)
        throw new Error(`Failed to load chat members: ${membersError.message}`)
      }

      // Get current user's last_read_at timestamp
      const currentUserMembership = membersData?.find(m => m.user_id === user.id)
      const userLastReadAt = currentUserMembership?.last_read_at || null
      setLastReadAt(userLastReadAt)

      // Load messages (without profile join) - paginated: last 50 messages
      const MESSAGE_LIMIT = 50
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          created_at
        `)
        .eq('chat_id', roomId)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT)

      if (messagesError) {
        safeLogger.error('[Chat] Failed to load messages:', messagesError)
        throw new Error(`Failed to load messages: ${messagesError.message}`)
      }

      // Reverse messages array to show newest at bottom (we fetched with descending order)
      const reversedMessages = (messagesData || []).reverse()

      // Check if there are more messages to load
      // If we got exactly MESSAGE_LIMIT messages, there might be more
      const totalMessages = messagesData?.length || 0
      setHasMoreMessages(totalMessages === MESSAGE_LIMIT)

      // Store the oldest message timestamp for pagination
      if (reversedMessages.length > 0) {
        setOldestMessageTimestamp(reversedMessages[0].created_at)
      }

      // Load read receipts for all messages
      const messageIds = (reversedMessages || []).map(m => m.id)
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

      // Load reactions for all messages (handle gracefully if table doesn't exist yet)
      const reactionsMap = new Map<string, Array<{ emoji: string; count: number; userReactions: string[] }>>()
      if (messageIds.length > 0) {
        try {
          const { data: reactionsData, error: reactionsError } = await supabase
            .from('message_reactions')
            .select('message_id, emoji, user_id')
            .in('message_id', messageIds)

          // Only process if no error (table exists) or error is not 404/PGRST116
          if (!reactionsError) {
            if (reactionsData) {
              // Group reactions by message_id and emoji
              const grouped = new Map<string, Map<string, string[]>>()
              reactionsData.forEach((reaction: any) => {
                if (!grouped.has(reaction.message_id)) {
                  grouped.set(reaction.message_id, new Map())
                }
                const emojiMap = grouped.get(reaction.message_id)!
                if (!emojiMap.has(reaction.emoji)) {
                  emojiMap.set(reaction.emoji, [])
                }
                emojiMap.get(reaction.emoji)!.push(reaction.user_id)
              })

              // Convert to expected format
              grouped.forEach((emojiMap, msgId) => {
                const reactions: Array<{ emoji: string; count: number; userReactions: string[] }> = []
                emojiMap.forEach((userIds, emoji) => {
                  reactions.push({
                    emoji,
                    count: userIds.length,
                    userReactions: userIds
                  })
                })
                reactionsMap.set(msgId, reactions)
              })
            }
          } else {
            // Table doesn't exist yet - silently ignore (migration not run)
            // Only log if it's not a "table doesn't exist" error
            if (reactionsError.code !== 'PGRST116' && reactionsError.code !== '42P01') {
              safeLogger.warn('[Chat] Failed to load reactions:', reactionsError)
            }
          }
        } catch (err) {
          // Silently handle - table may not exist yet
          safeLogger.debug('[Chat] Reactions table may not exist yet:', err)
        }
      }
      setMessageReactions(reactionsMap)

      // Collect all user IDs from members and messages
      const userIds = new Set<string>()
      membersData?.forEach(m => userIds.add(m.user_id))
      reversedMessages?.forEach(m => userIds.add(m.user_id))

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
          } else if (profilesResponse.status === 429) {
            // Rate limited - try fallback: fetch profiles directly from Supabase
            if (userIds.size > 0) {
              try {
                const { data: fallbackProfiles, error: fallbackError } = await supabase
                  .from('profiles')
                  .select('user_id, first_name, last_name')
                  .in('user_id', Array.from(userIds))

                if (!fallbackError && fallbackProfiles) {
                  profilesMap = new Map(fallbackProfiles.map((p: any) => [p.user_id, p]))
                  setProfilesMap(profilesMap)
                  safeLogger.debug(`[Chat] Fallback: Loaded ${profilesMap.size} profiles directly from Supabase`)
                }
              } catch (fallbackErr) {
                safeLogger.warn('[Chat] Fallback profile fetch also failed:', fallbackErr)
              }
            }
          } else {
            safeLogger.warn('[Chat] Failed to fetch profiles via API:', await profilesResponse.text())
          }
        } catch (err) {
          safeLogger.warn('[Chat] Failed to fetch profiles:', err)
          // Don't throw - continue with empty profiles map
        }
      }

      // Transform messages data - handle missing profiles gracefully
      const transformedMessages: Message[] = (reversedMessages || []).map(msg => {
        const profile = profilesMap.get(msg.user_id)
        let senderName = 'User'
        if (profile) {
          const firstName = profile.first_name?.trim()
          const lastName = profile.last_name?.trim()
          if (firstName && lastName) {
            senderName = `${firstName} ${lastName}`
          } else if (firstName) {
            senderName = firstName
          } else if (lastName) {
            senderName = lastName
          }
          // If profile exists but no names, keep 'User' as fallback
        } else {
          senderName = 'Unknown User'
        }

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
          let memberName = 'User'
          if (profile) {
            const firstName = profile.first_name?.trim()
            const lastName = profile.last_name?.trim()
            if (firstName && lastName) {
              memberName = `${firstName} ${lastName}`
            } else if (firstName) {
              memberName = firstName
            } else if (lastName) {
              memberName = lastName
            }
            // If profile exists but no names, keep 'User' as fallback
          } else {
            memberName = 'Unknown User'
          }

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
      setIsLocked(roomData.is_locked || false)

      // Load group compatibility if it's a group chat
      if (roomData.is_group) {
        try {
          const compatResponse = await fetch(`/api/chat/groups?chatId=${roomId}&action=compatibility`)
          if (compatResponse.ok) {
            const data = await compatResponse.json()
            setGroupCompatibility(data.compatibility)
          }
        } catch (err) {
          safeLogger.warn('[Chat] Failed to load group compatibility:', err)
        }
      }

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
          safeLogger.error('[Chat] Failed to check block status:', err)
          setIsBlocked(false)
        }

        // Check verification status for the other user
        // Use profile.verification_status instead of querying verifications table directly
        // This avoids RLS issues and is more efficient (profiles are already loaded)
        try {
          const profile = profilesMap.get(otherMember.id)
          if (profile?.verification_status === 'verified') {
            setOtherUserVerificationStatus('verified')
          } else {
            setOtherUserVerificationStatus('unverified')
          }
        } catch (err) {
          safeLogger.error('[Chat] Failed to check verification status:', err)
          setOtherUserVerificationStatus('unverified')
        }
      } else {
        setOtherPersonName('')
        setBlockedUserId(null)
        setIsBlocked(false)
        setOtherUserVerificationStatus(null)
      }

      // Load individual compatibility data if it's a 1-on-1 chat
      if (!roomData.is_group && transformedMembers.length === 1) {
        // Don't auto-load, only load when user clicks the button
        // This keeps the initial load fast
      }

      setMessages(transformedMessages)
      setMembers(transformedMembers)

      // Reset scroll flag when new messages are loaded
      hasScrolledInitiallyRef.current = false

    } catch (error) {
      safeLogger.error('[Chat] Failed to load chat data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chat messages'
      setError(`Failed to load chat: ${errorMessage}`)
      // Don't fall back to mock data - show error instead
      setMessages([])
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [user.id, roomId])

  const loadOlderMessages = useCallback(async () => {
    if (!oldestMessageTimestamp || isLoadingMoreMessages || !hasMoreMessages) return

    setIsLoadingMoreMessages(true)
    try {
      const MESSAGE_LIMIT = 50
      const { data: olderMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          created_at
        `)
        .eq('chat_id', roomId)
        .lt('created_at', oldestMessageTimestamp) // Get messages older than the oldest one we have
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT)

      if (error) {
        safeLogger.error('[Chat] Failed to load older messages:', error)
        return
      }

      if (!olderMessages || olderMessages.length === 0) {
        setHasMoreMessages(false)
        return
      }

      // Reverse to get chronological order (oldest first)
      const reversedOlder = olderMessages.reverse()

      // Check if there are more messages
      setHasMoreMessages(olderMessages.length === MESSAGE_LIMIT)

      // Update oldest message timestamp
      if (reversedOlder.length > 0) {
        setOldestMessageTimestamp(reversedOlder[0].created_at)
      }

      // Load read receipts for new messages
      const messageIds = reversedOlder.map(m => m.id)
      let readReceiptsMap = new Map<string, string[]>()
      if (messageIds.length > 0) {
        const { data: readsData } = await supabase
          .from('message_reads')
          .select('message_id, user_id')
          .in('message_id', messageIds)

        if (readsData) {
          readsData.forEach((read: any) => {
            const existing = readReceiptsMap.get(read.message_id) || []
            readReceiptsMap.set(read.message_id, [...existing, read.user_id])
          })
        }
      }

      // Get profiles for new messages
      const userIds = new Set<string>(reversedOlder.map(m => m.user_id))
      const profilesToFetch = Array.from(userIds).filter(id => !profilesMap.has(id))

      if (profilesToFetch.length > 0) {
        try {
          const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
            method: 'POST',
            body: JSON.stringify({
              chatId: roomId,
              userIds: profilesToFetch
            }),
          })

          if (profilesResponse.ok) {
            const { profiles: profilesData } = await profilesResponse.json()
            if (profilesData) {
              profilesData.forEach((p: any) => profilesMap.set(p.user_id, p))
              setProfilesMap(new Map(profilesMap))
            }
          }
        } catch (err) {
          safeLogger.warn('[Chat] Failed to fetch profiles for older messages:', err)
        }
      }

      // Transform new messages
      const transformedOlder: Message[] = reversedOlder.map(msg => {
        const profile = profilesMap.get(msg.user_id)
        const senderName = profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : 'Unknown User'

        const readBy = readReceiptsMap.get(msg.id) || []
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

      // Prepend older messages to existing messages
      setMessages(prev => [...transformedOlder, ...prev])

      // Maintain scroll position (don't jump to top)
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current
          const scrollHeightBefore = container.scrollHeight
          // Scroll position will be maintained automatically since we prepended
        }
      }, 0)

    } catch (error) {
      safeLogger.error('[Chat] Failed to load older messages:', error)
    } finally {
      setIsLoadingMoreMessages(false)
    }
  }, [oldestMessageTimestamp, isLoadingMoreMessages, hasMoreMessages, roomId, user.id, supabase, profilesMap])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }

      // Esc: Close modals/dialogs
      if (e.key === 'Escape') {
        if (showReportDialog) {
          setShowReportDialog(false)
          setReportReason('')
        }
        if (showDeleteDialog) {
          setShowDeleteDialog(false)
        }
        // Panels are now managed by parent layout component
        if (showLeaveGroupDialog) {
          setShowLeaveGroupDialog(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showReportDialog, showDeleteDialog, showLeaveGroupDialog])

  // Compatibility and user info fetching now handled by ProfileCompatibilityPane component

  // Match status check - simplified, ProfileCompatibilityPane will handle data fetching
  useEffect(() => {
    if (!isGroup && roomId && members.length === 1) {
      setHasMatch(true) // Assume matched if individual chat exists
    } else {
      setHasMatch(false)
    }
  }, [roomId, isGroup, members.length])

  // Check if error is JWT-related
  const isJWTError = useCallback((error: any): boolean => {
    if (!error) return false
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error)
    return errorStr.includes('JWT') ||
      errorStr.includes('Token') ||
      errorStr.includes('expired') ||
      errorStr.includes('InvalidJWTToken')
  }, [])

  const setupRealtimeSubscription = useCallback(() => {
    safeLogger.debug('[Realtime] Setting up subscription for roomId:', roomId)

    // Clean up existing subscription if any
    if (messagesChannelRef.current) {
      safeLogger.debug('[Realtime] Cleaning up existing messages channel')
      messagesChannelRef.current.unsubscribe()
      supabase.removeChannel(messagesChannelRef.current)
      messagesChannelRef.current = null
    }

    // Subscribe to new messages via broadcast channel
    const channelName = `room:${roomId}:messages`
    safeLogger.debug('[Realtime] Creating broadcast channel:', channelName)

    const messagesChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true, ack: true }
        }
      })
      .on('broadcast', { event: 'INSERT' }, async (payload) => {
        safeLogger.debug('[Realtime] Broadcast callback triggered', {
          timestamp: new Date().toISOString(),
          event: payload.event,
          payload: payload
        })

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
              scrollContainerToBottom('smooth')
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
          setConnectionStatus('connected')
          setError('') // Clear any connection error messages
          // Clear any pending error timeout since we're connected
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current)
            errorTimeoutRef.current = null
          }
          messageChannelRetryAttempts.current = 0 // Reset retry attempts on success
        } else if (status === 'CHANNEL_ERROR') {
          const hasError = !!err
          const errorMessage = hasError
            ? (typeof err === 'string' ? err : (err as any).message || 'Channel error')
            : 'Unknown error (no error details provided)'

          // Check if this is a JWT/token expiration error
          if (isJWTError(err)) {
            console.log('[Realtime] 🔐 JWT token error detected, refreshing session...')
            setConnectionStatus('connecting')
            setError('Refreshing connection...')
              // Refresh session and resubscribe
              ; (async () => {
                try {
                  const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

                  if (refreshError) {
                    console.error('[Realtime] ❌ Failed to refresh session:', refreshError)
                    setError('Session expired. Please refresh the page.')
                    return
                  }

                  if (session) {
                    console.log('[Realtime] ✅ Session refreshed successfully')
                    // Wait a bit for the new token to propagate, then resubscribe
                    setTimeout(() => {
                      if (setupRealtimeSubscriptionRef.current) {
                        setupRealtimeSubscriptionRef.current()
                      }
                    }, 500)
                  }
                } catch (refreshErr) {
                  console.error('[Realtime] ❌ Error refreshing session:', refreshErr)
                  setError('Failed to refresh connection. Please refresh the page.')
                }
              })()
            return
          }

          // For non-JWT errors, use exponential backoff retry
          const maxRetries = 10
          if (messageChannelRetryAttempts.current < maxRetries) {
            if (hasError) {
              console.warn('[Realtime] ⚠️ Channel subscription error - will retry:', errorMessage)
              if (process.env.NODE_ENV === 'development') {
                console.warn('[Realtime] ⚠️ Error details:', {
                  error: err,
                  channel: channelName,
                  roomId: roomId,
                  timestamp: new Date().toISOString()
                })
              }
            } else {
              console.warn('[Realtime] ⚠️ Channel reported CHANNEL_ERROR without details; will attempt resubscribe.', {
                channel: channelName,
                roomId: roomId
              })
            }

            // Update connection status
            setConnectionStatus('connecting')
            setError('Connection error. Reconnecting...')

            // Calculate exponential backoff delay
            const delay = Math.min(2000 * Math.pow(1.5, messageChannelRetryAttempts.current), 30000)
            messageChannelRetryAttempts.current++

            // Attempt to resubscribe after a delay (prevent multiple simultaneous attempts)
            if (resubscribeTimeoutRef.current) {
              clearTimeout(resubscribeTimeoutRef.current)
            }
            resubscribeTimeoutRef.current = setTimeout(() => {
              console.log(`[Realtime] 🔄 Attempting to resubscribe after error (attempt ${messageChannelRetryAttempts.current}/${maxRetries})...`)
              setupRealtimeSubscription()
              resubscribeTimeoutRef.current = null
            }, delay)
          } else {
            // Max retries reached - only log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Realtime] ⚠️ Max retry attempts reached after channel error. Connection failed.')
            }
            setConnectionStatus('disconnected')
            setError('Unable to connect. Please refresh the page.')
            messageChannelRetryAttempts.current = 0 // Reset for next attempt
          }
        } else if (status === 'TIMED_OUT') {
          const maxRetries = 10
          if (messageChannelRetryAttempts.current < maxRetries) {
            // Only log first few attempts to reduce noise
            if (messageChannelRetryAttempts.current < 3 || process.env.NODE_ENV === 'development') {
              console.warn('[Realtime] ⚠️ Channel subscription timed out - will retry')
              if (process.env.NODE_ENV === 'development') {
                console.warn('[Realtime] ⚠️ This may indicate network issues or Supabase Realtime service problems')
              }
            }

            // Update connection status and show user feedback
            setConnectionStatus('connecting')
            setError('Connection timeout. Reconnecting...')

            // Calculate exponential backoff delay (2s initial, 1.5x multiplier, max 30s)
            const delay = Math.min(2000 * Math.pow(1.5, messageChannelRetryAttempts.current), 30000)
            messageChannelRetryAttempts.current++

            // Attempt to resubscribe after a delay (prevent multiple simultaneous attempts)
            if (resubscribeTimeoutRef.current) {
              clearTimeout(resubscribeTimeoutRef.current)
            }
            resubscribeTimeoutRef.current = setTimeout(() => {
              console.log(`[Realtime] 🔄 Attempting to resubscribe after timeout (attempt ${messageChannelRetryAttempts.current}/${maxRetries})...`)
              setupRealtimeSubscription()
              resubscribeTimeoutRef.current = null
            }, delay)
          } else {
            // Max retries reached - only log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Realtime] ⚠️ Max retry attempts reached. Connection failed.')
            }
            setConnectionStatus('disconnected')
            setError('Unable to connect. Please refresh the page.')
            messageChannelRetryAttempts.current = 0 // Reset for next attempt
          }
        } else if (status === 'CLOSED') {
          console.log('[Realtime] ℹ️ Channel closed')
          console.log('[Realtime] ℹ️ This is normal when component unmounts or connection is lost')

          // Clear any pending error timeout since channel is closing
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current)
            errorTimeoutRef.current = null
          }

          // Only attempt to resubscribe if:
          // 1. We're not unmounting (component is still mounted)
          // 2. The channel reference still exists (wasn't intentionally cleaned up)
          // 3. We don't already have a resubscribe attempt pending
          if (!isUnmountingRef.current && messagesChannelRef.current && !resubscribeTimeoutRef.current) {
            // Don't show error immediately - wait to see if it reconnects quickly
            // This prevents flickering during token refreshes and HMR
            const attemptDelay = Math.min(2000 * Math.pow(1.5, readFailureCount), 10000)

            // Set a delayed check - only show error if still disconnected after delay
            // This prevents the flickering "Attempting to reconnect" popup
            errorTimeoutRef.current = setTimeout(() => {
              // Only show error if we're still disconnected and not unmounting
              if (!isUnmountingRef.current && messagesChannelRef.current && connectionStatus !== 'connected') {
                setConnectionStatus('disconnected')
                setError('Connection lost. Attempting to reconnect...')
              }
              errorTimeoutRef.current = null
            }, 3000) // Wait 3 seconds before showing error (gives time for quick reconnects)

            resubscribeTimeoutRef.current = setTimeout(() => {
              if (!isUnmountingRef.current && messagesChannelRef.current) {
                console.log('[Realtime] 🔄 Attempting to resubscribe after disconnect...')
                setConnectionStatus('connecting')
                // Clear error timeout if we're reconnecting
                if (errorTimeoutRef.current) {
                  clearTimeout(errorTimeoutRef.current)
                  errorTimeoutRef.current = null
                }
                setupRealtimeSubscription()
              }
              resubscribeTimeoutRef.current = null
            }, attemptDelay)
          } else if (isUnmountingRef.current) {
            // Component is unmounting, don't resubscribe
            console.log('[Realtime] ℹ️ Component unmounting, skipping resubscribe')
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
      .subscribe(async (status, err) => {
        if (status === 'SUBSCRIBED') {
          // Track our own presence when subscribed
          await typingChannel.track({
            typing: false,
            user_id: user.id
          })
          typingChannelRetryAttempts.current = 0 // Reset retry attempts on success
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          const maxRetries = 10
          if (typingChannelRetryAttempts.current < maxRetries) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Realtime] ⚠️ Typing channel ${status === 'TIMED_OUT' ? 'timed out' : 'error'} - will retry`)
            }

            // Calculate exponential backoff delay
            const delay = Math.min(2000 * Math.pow(1.5, typingChannelRetryAttempts.current), 30000)
            typingChannelRetryAttempts.current++

            // Clean up existing timeout if any
            if (typingChannelResubscribeTimeoutRef.current) {
              clearTimeout(typingChannelResubscribeTimeoutRef.current)
            }

            // Retry subscription
            typingChannelResubscribeTimeoutRef.current = setTimeout(() => {
              if (!isUnmountingRef.current && typingChannelRef.current) {
                // Recreate typing channel
                const newTypingChannel = supabase
                  .channel(`typing:${roomId}`)
                  .on('presence', { event: 'sync' }, () => {
                    const state = newTypingChannel.presenceState()
                    const typingUsers = Object.keys(state).filter(key => {
                      const presence = state[key] as any
                      const presenceUserId = presence?.[0]?.user_id || key
                      if (presenceUserId === user.id || key === user.id) return false
                      return presence && presence[0] && presence[0].typing === true
                    })
                    const filtered = typingUsers.filter(id => {
                      const presence = state[id] as any
                      const presenceUserId = presence?.[0]?.user_id || id
                      return id !== user.id && presenceUserId !== user.id
                    })
                    setTypingUsers(filtered)
                  })
                  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                    const newPresence = newPresences[0] as any
                    const presenceUserId = newPresence?.user_id || key
                    if (key !== user.id && presenceUserId !== user.id && newPresence?.typing) {
                      setTypingUsers(prev => {
                        const updated = [...prev.filter(id => {
                          const presence = newTypingChannel.presenceState()[id] as any
                          const idUserId = presence?.[0]?.user_id || id
                          return id !== key && id !== user.id && idUserId !== user.id
                        }), key]
                        return updated.filter(id => {
                          const presence = newTypingChannel.presenceState()[id] as any
                          const idUserId = presence?.[0]?.user_id || id
                          return id !== user.id && idUserId !== user.id
                        })
                      })
                    }
                  })
                  .on('presence', { event: 'leave' }, ({ key }) => {
                    setTypingUsers(prev => prev.filter(id => {
                      const presence = newTypingChannel.presenceState()[id] as any
                      const idUserId = presence?.[0]?.user_id || id
                      return id !== key && id !== user.id && idUserId !== user.id
                    }))
                  })
                  .subscribe(async (subscribeStatus) => {
                    if (subscribeStatus === 'SUBSCRIBED') {
                      await newTypingChannel.track({
                        typing: false,
                        user_id: user.id
                      })
                      typingChannelRetryAttempts.current = 0
                    }
                  })

                // Clean up old channel
                if (typingChannelRef.current) {
                  typingChannelRef.current.unsubscribe()
                  supabase.removeChannel(typingChannelRef.current)
                }
                typingChannelRef.current = newTypingChannel
              }
              typingChannelResubscribeTimeoutRef.current = null
            }, delay)
          } else {
            // Max retries reached - gracefully degrade by hiding typing indicators
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Realtime] ⚠️ Typing channel max retries reached. Typing indicators disabled.')
            }
            setTypingUsers([])
            typingChannelRetryAttempts.current = 0
          }
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
      .subscribe(async (status, err) => {
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
            ; (presenceChannelRef.current as any).intervalId = presenceInterval
          presenceChannelRetryAttempts.current = 0 // Reset retry attempts on success
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          const maxRetries = 10
          if (presenceChannelRetryAttempts.current < maxRetries) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Realtime] ⚠️ Presence channel ${status === 'TIMED_OUT' ? 'timed out' : 'error'} - will retry`)
            }

            // Calculate exponential backoff delay
            const delay = Math.min(2000 * Math.pow(1.5, presenceChannelRetryAttempts.current), 30000)
            presenceChannelRetryAttempts.current++

            // Clean up existing timeout if any
            if (presenceChannelResubscribeTimeoutRef.current) {
              clearTimeout(presenceChannelResubscribeTimeoutRef.current)
            }

            // Retry subscription
            presenceChannelResubscribeTimeoutRef.current = setTimeout(() => {
              if (!isUnmountingRef.current && presenceChannelRef.current) {
                // Recreate presence channel
                const newPresenceChannel = supabase
                  .channel(`presence:${roomId}`)
                  .on('presence', { event: 'sync' }, () => {
                    const state = newPresenceChannel.presenceState()
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
                    const state = newPresenceChannel.presenceState()
                    const presence = state[key] as any
                    const presenceUserId = presence?.[0]?.user_id || key
                    if (presenceUserId !== user.id) {
                      setOnlineUsers(prev => {
                        const updated = new Set(prev)
                        updated.delete(presenceUserId)
                        return updated
                      })
                      setLastSeenMap(prev => new Map(prev).set(presenceUserId, new Date().toISOString()))
                    }
                  })
                  .subscribe(async (subscribeStatus) => {
                    if (subscribeStatus === 'SUBSCRIBED') {
                      await newPresenceChannel.track({
                        online: true,
                        user_id: user.id,
                        last_seen: new Date().toISOString()
                      })

                      const presenceInterval = setInterval(async () => {
                        if (presenceChannelRef.current) {
                          await presenceChannelRef.current.track({
                            online: true,
                            user_id: user.id,
                            last_seen: new Date().toISOString()
                          })
                        }
                      }, 30000)

                        ; (presenceChannelRef.current as any).intervalId = presenceInterval
                      presenceChannelRetryAttempts.current = 0
                    }
                  })

                // Clean up old channel and interval
                if (presenceChannelRef.current) {
                  const intervalId = (presenceChannelRef.current as any).intervalId
                  if (intervalId) {
                    clearInterval(intervalId)
                  }
                  presenceChannelRef.current.unsubscribe()
                  supabase.removeChannel(presenceChannelRef.current)
                }
                presenceChannelRef.current = newPresenceChannel
              }
              presenceChannelResubscribeTimeoutRef.current = null
            }, delay)
          } else {
            // Max retries reached - gracefully degrade by keeping stale status
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Realtime] ⚠️ Presence channel max retries reached. Online status may be stale.')
            }
            presenceChannelRetryAttempts.current = 0
          }
        }
      })

    presenceChannelRef.current = presenceChannel

    // Store reference for refresh function
    setupRealtimeSubscriptionRef.current = setupRealtimeSubscription

    return () => {
      console.log('[Realtime] Cleaning up subscriptions')
      if (resubscribeTimeoutRef.current) {
        clearTimeout(resubscribeTimeoutRef.current)
        resubscribeTimeoutRef.current = null
      }
      if (typingChannelResubscribeTimeoutRef.current) {
        clearTimeout(typingChannelResubscribeTimeoutRef.current)
        typingChannelResubscribeTimeoutRef.current = null
      }
      if (presenceChannelResubscribeTimeoutRef.current) {
        clearTimeout(presenceChannelResubscribeTimeoutRef.current)
        presenceChannelResubscribeTimeoutRef.current = null
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
      // Reset retry attempts
      messageChannelRetryAttempts.current = 0
      typingChannelRetryAttempts.current = 0
      presenceChannelRetryAttempts.current = 0
    }
  }, [roomId, user.id, supabase, isJWTError])

  // Prevent body scrolling when chat is mounted
  useEffect(() => {
    // Prevent body and html scrolling to avoid conflicts with chat scrolling
    if (typeof window !== 'undefined') {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      const originalBodyHeight = document.body.style.height
      const originalHtmlHeight = document.documentElement.style.height
      const originalBodyPosition = document.body.style.position

      // Prevent scrolling on html and body
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.height = '100vh'
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'

      // Also prevent scroll on the main container
      const mainContainer = document.querySelector('main')
      if (mainContainer) {
        const originalMainOverflow = (mainContainer as HTMLElement).style.overflow
          ; (mainContainer as HTMLElement).style.overflow = 'hidden'

        return () => {
          document.documentElement.style.overflow = originalHtmlOverflow
          document.documentElement.style.height = originalHtmlHeight
          document.body.style.overflow = originalBodyOverflow
          document.body.style.height = originalBodyHeight
          document.body.style.position = originalBodyPosition
            ; (mainContainer as HTMLElement).style.overflow = originalMainOverflow
        }
      }

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow
        document.documentElement.style.height = originalHtmlHeight
        document.body.style.overflow = originalBodyOverflow
        document.body.style.height = originalBodyHeight
        document.body.style.position = originalBodyPosition
      }
    }
  }, [])

  // Listen for auth state changes (token refresh)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Realtime] 🔐 Auth state changed:', event, {
        hasSession: !!session,
        userId: session?.user?.id
      })

      // When token is refreshed, re-establish Realtime subscriptions
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        console.log('[Realtime] 🔄 Token refreshed, re-establishing subscriptions...')
        if (!isUnmountingRef.current && messagesChannelRef.current) {
          // Small delay to ensure token is fully propagated
          setTimeout(() => {
            if (setupRealtimeSubscriptionRef.current) {
              setupRealtimeSubscriptionRef.current()
            }
          }, 500)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Realtime] 👋 User signed out, cleaning up subscriptions')
        setConnectionStatus('disconnected')
        setError('You have been signed out. Please sign in again.')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    // Reset unmounting flag
    isUnmountingRef.current = false

    // Set up realtime subscription immediately
    setupRealtimeSubscription()

    // Load chat data
    loadChatData()

    // Mark as read
    markAsRead()

    return () => {
      // Mark as unmounting to prevent resubscription attempts
      isUnmountingRef.current = true

      // Clear any pending resubscribe attempts
      if (resubscribeTimeoutRef.current) {
        clearTimeout(resubscribeTimeoutRef.current)
        resubscribeTimeoutRef.current = null
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }

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

  // Track if we've done initial scroll
  const hasScrolledInitiallyRef = useRef(false)
  const scrollLockRef = useRef(false) // Lock to prevent scroll resets
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to first unread message or bottom when messages are loaded initially
  useEffect(() => {
    // Clear any pending scroll timeouts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }

    // Only run when loading is complete and we have messages
    if (messages.length > 0 && !isLoading && !hasScrolledInitiallyRef.current) {
      scrollLockRef.current = true // Lock scroll position

      const performScroll = () => {
        const container = messagesContainerRef.current
        if (!container || hasScrolledInitiallyRef.current) return false

        // Wait for container to have content
        const hasContent = container.scrollHeight > container.clientHeight
        if (!hasContent) {
          return false // Not ready yet
        }

        // First, try to scroll to first unread message if it exists and is in DOM
        if (firstUnreadMessageRef.current && container.contains(firstUnreadMessageRef.current)) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if (firstUnreadMessageRef.current && container.contains(firstUnreadMessageRef.current)) {
              scrollContainerToElement(firstUnreadMessageRef.current, 'center')
              hasScrolledInitiallyRef.current = true
              // Keep lock for 1 second after scroll
              setTimeout(() => {
                scrollLockRef.current = false
              }, 1000)
            }
          })
          return true
        }

        // No unread messages - scroll to bottom immediately
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight
            hasScrolledInitiallyRef.current = true
            // Keep lock for 1 second after scroll
            setTimeout(() => {
              scrollLockRef.current = false
            }, 1000)
          }
        })
        return true
      }

      // Try immediately
      if (!performScroll()) {
        // If not ready, try multiple times with increasing delays
        let attempts = 0
        const tryScroll = () => {
          attempts++
          if (performScroll() || attempts > 20) {
            return
          }
          scrollTimeoutRef.current = setTimeout(tryScroll, 50)
        }
        scrollTimeoutRef.current = setTimeout(tryScroll, 50)
      }
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
  }, [messages.length, isLoading, lastReadAt, user.id, isBlocked, blockedUserId])

  // Aggressive scroll maintenance - prevent any scroll to top for 3 seconds after load
  useEffect(() => {
    if (messages.length > 0 && !isLoading && hasScrolledInitiallyRef.current) {
      const container = messagesContainerRef.current
      if (!container) return

      // Check every 50ms and restore scroll if it was reset (only if lock is active)
      const interval = setInterval(() => {
        if (!scrollLockRef.current) {
          clearInterval(interval)
          return
        }

        const currentContainer = messagesContainerRef.current
        if (!currentContainer) {
          clearInterval(interval)
          return
        }

        const isNearTop = currentContainer.scrollTop < 100
        const hasContent = currentContainer.scrollHeight > currentContainer.clientHeight

        if (isNearTop && hasContent) {
          // Scroll was reset, restore to bottom immediately
          currentContainer.scrollTop = currentContainer.scrollHeight
        }
      }, 50)

      // Stop after 3 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval)
        scrollLockRef.current = false
      }, 3000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [messages.length, isLoading])

  // Reset scroll flag when roomId changes
  useEffect(() => {
    hasScrolledInitiallyRef.current = false
  }, [roomId])

  // React Query mutation for sending messages with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Content validation is now handled server-side, but we also validate client-side
      // for immediate feedback. Server will reject if validation fails.

      const response = await fetchWithCSRF('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: roomId,
          content: content.trim()
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to send message'
        let errorDetails: any = null
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          errorDetails = errorData.details || null
        } catch (parseError) {
          // If response isn't JSON, try to get text
          try {
            const text = await response.text()
            errorMessage = text || errorMessage
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        }
        console.error('[Chat] Send message error:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorDetails
        })
        // Include details in error message for development
        const fullErrorMessage = errorDetails
          ? `${errorMessage}\n\nDetails: ${JSON.stringify(errorDetails, null, 2)}`
          : errorMessage
        throw new Error(fullErrorMessage)
      }

      const { message } = await response.json()
      return message
    },
    onMutate: async (content) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.chats(user.id) })

      // Get sender name from profilesMap
      const profile = profilesMap.get(user.id)
      const senderName = profile
        ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        : 'You'

      // Optimistically update local messages
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: content.trim(),
        sender_id: user.id,
        sender_name: senderName,
        created_at: new Date().toISOString(),
        read_by: [user.id],
        is_own: true
      }

      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
    },
    onSuccess: async (message) => {
      // Replace optimistic message with real message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.id.startsWith('temp-'))
        const profile = profilesMap.get(user.id)
        const senderName = profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : 'You'

        return [...filtered, {
          id: message.id,
          content: message.content,
          sender_id: message.user_id,
          sender_name: senderName,
          created_at: message.created_at,
          read_by: [user.id],
          is_own: true
        }]
      })

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
        }
      }

      // Invalidate chats query to refresh chat list
      queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })

      showSuccessToast('Message sent', 'Your message has been delivered.')
    },
    onError: (error) => {
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      setError(errorMessage)
      showErrorToast('Failed to send message', errorMessage)
    },
  })

  const sendMessage = async () => {
    if (!newMessage.trim() || sendMessageMutation.isPending) return

    try {
      await sendMessageMutation.mutateAsync(newMessage.trim())
    } catch (error) {
      // Error handling is done in onError
    }
  }

  const isSending = sendMessageMutation.isPending

  // Validate content in real-time
  const validateContent = (text: string) => {
    if (!text.trim()) {
      setContentValidationError('')
      return true
    }
    
    const contentCheck = filterContent(text)
    const blockingViolations = contentCheck.violations.filter(v => 
      v === 'links' || v === 'email' || v === 'phone'
    )
    
    if (blockingViolations.length > 0) {
      const errorMessage = getViolationErrorMessage(blockingViolations)
      setContentValidationError(errorMessage)
      return false
    }
    
    // Clear error if no blocking violations
    setContentValidationError('')
    return true
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
      return <CheckCheck className="h-4 w-4 text-semantic-accent" />
    } else if (readByOthers.length > 0) {
      return <CheckCheck className="h-4 w-4 text-text-muted" />
    } else {
      return <Check className="h-4 w-4 text-text-muted" />
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
      showErrorToast('Validation Error', 'Please select a reason for reporting.')
      return
    }
    setIsReporting(true)
    try {
      const otherUserId = members.find(m => m.id !== user.id)?.id
      if (!otherUserId) {
        showErrorToast('Error', 'Unable to identify user to report.')
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

  const handleReportMessage = async () => {
    if (!messageReportReason.trim() || !selectedMessageForReport) {
      showErrorToast('Validation Error', 'Please select a reason for reporting.')
      return
    }
    setIsReportingMessage(true)
    try {
      const response = await fetchWithCSRF('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: selectedMessageForReport.sender_id,
          message_id: selectedMessageForReport.id,
          category: mapReportReasonToCategory(messageReportReason),
          details: messageReportDetails || messageReportReason
        })
      })
      if (response.ok) {
        setShowMessageReportDialog(false)
        setSelectedMessageForReport(null)
        setMessageReportReason('')
        setMessageReportDetails('')
        showSuccessToast('Report submitted', 'Thank you for your report. We will review it shortly.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }
    } catch (error: any) {
      console.error('Failed to report message:', error)
      showErrorToast('Failed to submit report', error.message || 'Please try again.')
    } finally {
      setIsReportingMessage(false)
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
        showErrorToast('Error', 'Unable to identify user to block.')
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

  // Show UI immediately, load data in background for faster perceived performance
  // if (isLoading) {
  //   return (
  //     <div className="max-w-4xl mx-auto">
  //       <div className="animate-pulse space-y-4">
  //         <div className="h-8 bg-bg-surface-alt rounded w-1/4"></div>
  //         <div className="h-96 bg-bg-surface-alt rounded-lg"></div>
  //       </div>
  //     </div>
  //   )
  // }

  // No longer showing panels as full-screen overlays - they're in the right pane now

  return (
    <div
      className="flex flex-col h-full w-full bg-transparent rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        contain: 'layout style'
      }}
    >
      {/* Modern Chat Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-white dark:border-gray-800 z-30">
        <div className="px-1 sm:px-4 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onBack) {
                    onBack()
                  } else {
                    router.back()
                  }
                }}
                className="h-10 w-10 p-0 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-white dark:border-gray-700 transition-all hover:scale-105 active:scale-95 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              </Button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {isLoading ? (
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <>
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        {isGroup ? 'Roommate Chat' : (otherPersonName || 'Chat')}
                      </h1>
                      {(() => {
                        const otherTypingUsers = typingUsers.filter(userId => userId !== user.id)
                        if (otherTypingUsers.length > 0 && !isGroup) {
                          const typingNames = otherTypingUsers.map(userId => {
                            const profile = profilesMap.get(userId)
                            return profile?.first_name?.trim() || 'Someone'
                          })
                          return (
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {typingNames.length === 1 
                                ? `${typingNames[0]} is typing...`
                                : 'Typing...'
                              }
                            </p>
                          )
                        }
                        return null
                      })()}
                    </>
                  )}
                </div>
                {!isGroup && otherUserVerificationStatus && (
                  <div className="flex-shrink-0">
                    {otherUserVerificationStatus === 'verified' ? (
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-semantic-accent flex items-center justify-center border-2 border-semantic-accent/30 shadow-sm">
                          <CheckCircle className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl border-2 border-border-subtle flex items-center justify-center bg-bg-surface-alt">
                          <div className="w-3 h-3 rounded-full bg-border-subtle"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {isGroup && (
                  <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-lg bg-bg-surface-alt border border-border-subtle">
                    <Users className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-semibold text-text-muted">
                      {members.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isGroup && groupCompatibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompatibility(!showCompatibility)}
                  className="h-10 w-10 p-0 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-white dark:border-gray-700 transition-all"
                  title="Compatibility"
                >
                  <BarChart3 className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                </Button>
              )}
              {/* Toggle right pane button (for individual chats) */}
              {!isGroup && onToggleRightPane && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRightPane}
                  className="h-10 w-10 p-0 rounded-xl hover:bg-bg-surface-alt border border-border-subtle"
                  title={rightPaneOpen ? 'Hide profile' : 'Show profile'}
                >
                  {rightPaneOpen ? (
                    <PanelRightClose className="h-5 w-5" />
                  ) : (
                    <PanelRightOpen className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle profile panel</span>
                </Button>
              )}
              {/* Group chat dropdown menu */}
              {isGroup && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-xl hover:bg-bg-surface-alt border border-border-subtle"
                    >
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShowCompatibility(!showCompatibility)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Compatibility
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowLeaveGroupDialog(true)}
                      className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {/* Individual chat dropdown menu */}
              {!isGroup && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-xl hover:bg-bg-surface-alt border border-border-subtle"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onToggleRightPane && (
                      <>
                        <DropdownMenuItem
                          onClick={onToggleRightPane}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          {rightPaneOpen ? 'Hide Profile' : 'Show Profile'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleBlockUser}
                      disabled={isBlocking}
                      className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {isBlocking ? 'Blocking...' : 'Block User'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowReportDialog(true)}
                      className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                      className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
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
      </div>

      {/* Blocked User Notice */}
      {isBlocked && blockedUserId && (
        <div className="flex-shrink-0 py-2">
          <div className="w-full lg:max-w-4xl lg:mx-auto px-1 sm:px-4 lg:px-8">
            <Alert variant="destructive" className="py-2 bg-semantic-danger/10 dark:bg-semantic-danger/20 border border-semantic-danger/30 rounded-lg">
              <Ban className="h-4 w-4" />
              <AlertDescription className="text-sm">
                You have blocked this user. Messages from blocked users are hidden.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Connection Status / Error Message */}
      {(error && connectionStatus === 'disconnected') || connectionStatus === 'connecting' ? (
        <div className="flex-shrink-0 py-2">
          <div className="w-full lg:max-w-4xl lg:mx-auto px-1 sm:px-4 lg:px-8">
            <Alert
              variant={connectionStatus === 'disconnected' ? 'destructive' : 'default'}
              className={`rounded-lg ${connectionStatus === 'disconnected'
                  ? 'bg-semantic-danger/10 dark:bg-semantic-danger/20 border border-semantic-danger/30'
                  : 'bg-bg-surface-alt border border-border-subtle'
                }`}
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <AlertDescription>Reconnecting to chat...</AlertDescription>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </>
              )}
            </Alert>
          </div>
        </div>
      ) : null}

      {/* Group Compatibility Display */}
      {isGroup && showCompatibility && groupCompatibility && (
        <div className="flex-shrink-0 py-3 border-b border-border-subtle bg-bg-surface-alt">
          <div className="w-full lg:max-w-4xl lg:mx-auto px-1 sm:px-4 lg:px-8">
            <GroupCompatibilityDisplay
              compatibility={groupCompatibility}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* Chat Members - Compact display for group chats */}
      {isGroup && members.length > 0 && (
        <div className="flex-shrink-0 py-2">
          <div className="w-full lg:max-w-4xl lg:mx-auto px-1 sm:px-4 lg:px-8">
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-semantic-success rounded-full border border-bg-surface"></div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-text-primary whitespace-nowrap">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages - Scrollable area OR Locked Group Chat */}
      {isGroup && isLocked ? (
        <div className="flex-1 overflow-y-auto min-h-0 relative bg-bg-surface scrollbar-visible">
          <div className="relative z-20 w-full lg:max-w-4xl lg:mx-auto px-1 sm:px-4 lg:px-8 py-4 lg:py-6">
            <LockedGroupChat
              chatId={roomId}
              userId={user.id}
              onUnlock={() => {
                setIsLocked(false)
                loadChatData()
              }}
            />
          </div>
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto relative bg-transparent scrollbar-visible"
          style={{
            // Prevent scroll reset during initial load
            scrollBehavior: hasScrolledInitiallyRef.current ? 'smooth' : 'auto',
            // THE FIX: This is the ONLY element allowed to scroll
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            position: 'relative',
            width: '100%',
            contain: 'layout'
          }}
          onScroll={(e) => {
            // If scroll is locked and user scrolled to top, restore to bottom
            if (scrollLockRef.current && hasScrolledInitiallyRef.current) {
              const target = e.currentTarget
              if (target.scrollTop < 100 && target.scrollHeight > target.clientHeight) {
                // Prevent the scroll to top
                target.scrollTop = target.scrollHeight
              }
            }
          }}
        >
          {/* Content overlay - Full width edge-to-edge like Messenger */}
          <div className="relative z-20 w-full px-1 sm:px-2 py-3 sm:py-4 lg:py-6 pb-4">
            {isLoading ? (
              <div className="space-y-3">
                <MessageSkeleton isOwn={false} />
                <MessageSkeleton isOwn={true} />
                <MessageSkeleton isOwn={false} />
                <MessageSkeleton isOwn={true} />
                <MessageSkeleton isOwn={false} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]">
                  <MessageCircle className="h-12 w-12 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No messages yet</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Start the conversation with your match!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Load Older Messages button */}
                {hasMoreMessages && (
                  <div className="flex justify-center py-2">
                    <Button
                      onClick={loadOlderMessages}
                      disabled={isLoadingMoreMessages}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {isLoadingMoreMessages ? 'Loading...' : 'Load Older Messages'}
                    </Button>
                  </div>
                )}
                {messages
                  .filter(message => !isBlocked || message.sender_id !== blockedUserId)
                  .map((message, index) => {
                    const showDateSeparator = shouldShowDateSeparator(index)

                    // Check if this is the first unread message
                    const isFirstUnread = (() => {
                      if (message.is_system_message || message.is_own) return false

                      const messageTime = new Date(message.created_at).getTime()
                      const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0
                      const isUnread = !message.read_by.includes(user.id) ||
                        (lastReadAt && messageTime > lastReadTime) ||
                        (!lastReadAt && messageTime > 0)

                      if (!isUnread) return false

                      // Check if this is the first unread (all previous messages are read)
                      const previousMessages = messages.slice(0, index).filter(m =>
                        !isBlocked || m.sender_id !== blockedUserId
                      )
                      const hasPreviousUnread = previousMessages.some(m => {
                        if (m.is_system_message || m.is_own) return false
                        const mTime = new Date(m.created_at).getTime()
                        const mLastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0
                        return !m.read_by.includes(user.id) ||
                          (lastReadAt && mTime > mLastReadTime) ||
                          (!lastReadAt && mTime > 0)
                      })

                      return !hasPreviousUnread
                    })()

                    return (
                      <div
                        key={message.id}
                        ref={isFirstUnread ? firstUnreadMessageRef : null}
                        data-message-id={message.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        {showDateSeparator && (
                          <div className="flex justify-center my-6">
                            <div className="bg-gray-100 dark:bg-gray-800 border border-white dark:border-gray-700 px-4 py-2 rounded-full shadow-lg">
                              <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                          </div>
                        )}

                        {message.is_system_message ? (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-100 dark:bg-gray-800 border border-white dark:border-gray-700 rounded-2xl px-5 py-3 shadow-lg">
                              <p className="text-sm text-chat-text-primary dark:text-gray-200 text-center font-bold">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex gap-2 ${message.is_own ? 'justify-end' : 'justify-start'}`}
                          >
                            {!message.is_own && (
                              <Avatar className="w-8 h-8 sm:w-7 sm:h-7 flex-shrink-0">
                                <AvatarImage src={message.sender_avatar} />
                                <AvatarFallback className="text-xs">
                                  {message.sender_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${message.is_own ? 'order-first' : ''}`}>
                              {!message.is_own && (
                                <div className="text-xs font-semibold text-chat-text-secondary mb-1.5 px-1">
                                  {message.sender_name}
                                </div>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className={`rounded-2xl px-4 py-3 shadow-lg max-w-full transition-all cursor-pointer hover:opacity-90 ${message.is_own
                                      ? 'bg-chat-surface-sent text-white rounded-tr-sm rounded-bl-2xl'
                                      : 'bg-chat-surface text-chat-text-primary rounded-tl-sm rounded-br-2xl'
                                    }`}>
                                    <p className={`text-sm sm:text-base break-words leading-relaxed ${message.is_own ? 'text-white font-medium' : 'text-chat-text-primary'}`}>{message.content}</p>
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={message.is_own ? 'end' : 'start'}>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(message.content)
                                      showSuccessToast('Copied', 'Message copied to clipboard')
                                    }}
                                  >
                                    Copy Message
                                  </DropdownMenuItem>
                                  {!message.is_own && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedMessageForReport(message)
                                          setShowMessageReportDialog(true)
                                        }}
                                        className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
                                      >
                                        <Flag className="h-4 w-4 mr-2" />
                                        Report Message
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <div className={`flex items-center gap-1.5 mt-1 px-1 ${message.is_own ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-chat-text-secondary font-medium">
                                  {formatTime(message.created_at)}
                                </span>
                                {message.is_own && getReadStatus(message)}
                              </div>
                              {!message.is_system_message && (
                                <div className={`px-1 ${message.is_own ? 'flex justify-end' : ''}`}>
                                  <MessageReactions
                                    messageId={message.id}
                                    userId={user.id}
                                    reactions={messageReactions.get(message.id) || []}
                                    onReactionChange={() => {
                                      // Reload reactions for this message
                                      const loadReactions = async () => {
                                        try {
                                          const { data: reactionsData, error } = await supabase
                                            .from('message_reactions')
                                            .select('message_id, emoji, user_id')
                                            .eq('message_id', message.id)

                                          if (error) {
                                            // Table may not exist - silently ignore
                                            if (error.code !== 'PGRST116' && error.code !== '42P01') {
                                              safeLogger.warn('[Chat] Failed to reload reactions:', error)
                                            }
                                            return
                                          }

                                          if (reactionsData) {
                                            const grouped = new Map<string, string[]>()
                                            reactionsData.forEach((r: any) => {
                                              if (!grouped.has(r.emoji)) {
                                                grouped.set(r.emoji, [])
                                              }
                                              grouped.get(r.emoji)!.push(r.user_id)
                                            })

                                            const reactions: Array<{ emoji: string; count: number; userReactions: string[] }> = []
                                            grouped.forEach((userIds, emoji) => {
                                              reactions.push({
                                                emoji,
                                                count: userIds.length,
                                                userReactions: userIds
                                              })
                                            })

                                            setMessageReactions(prev => {
                                              const updated = new Map(prev)
                                              updated.set(message.id, reactions)
                                              return updated
                                            })
                                          }
                                        } catch (err) {
                                          safeLogger.debug('[Chat] Failed to reload reactions:', err)
                                        }
                                      }
                                      loadReactions()
                                    }}
                                  />
                                </div>
                              )}
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
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-zinc-300 font-medium">
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
        </div>
      )}

      {/* Message Input - Fixed at bottom of chat container */}
      {!(isGroup && isLocked) && (
        <div 
          className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-white dark:border-gray-800 shadow-2xl rounded-b-lg"
          style={{
            flexShrink: 0,
            flexGrow: 0,
            flexBasis: 'auto',
            position: 'relative',
            zIndex: 100,
            minHeight: 'auto',
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--background, white)',
            order: 999,
            contain: 'layout style'
          }}
        >
          <div className="px-1 sm:px-4 lg:px-8 pt-4 sm:pt-5 pb-20 md:pb-5 w-full">
            <div className="w-full">
              <div className="flex gap-2 sm:gap-3 items-end">
                <div className="flex-1 min-w-0">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      const value = e.target.value
                      setNewMessage(value)
                      validateContent(value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (!contentValidationError) {
                          sendMessage()
                        }
                      }
                    }}
                    placeholder={isBlocked ? "You cannot send messages to a blocked user" : "Type your message..."}
                    disabled={isSending || isBlocked}
                    inputMode="text"
                    enterKeyHint="send"
                    className={`flex-1 min-w-0 h-12 sm:h-13 text-sm sm:text-base bg-gray-100 border rounded-full focus:bg-gray-100 focus:ring-2 transition-all placeholder:text-gray-500 text-gray-900 font-medium ${
                      contentValidationError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-300' 
                        : 'border-white focus:border-blue-500 focus:ring-blue-300'
                    }`}
                  />
                  {contentValidationError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 px-3">
                      {contentValidationError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending || isBlocked || !!contentValidationError}
                  className="h-12 sm:h-13 w-12 sm:w-13 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 p-0 flex-shrink-0 rounded-full bg-chat-surface-sent hover:opacity-90 text-white shadow-lg transition-all touch-manipulation disabled:opacity-50 disabled:shadow-none transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Report Message Dialog */}
      <Dialog open={showMessageReportDialog} onOpenChange={setShowMessageReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>
              Please select the reason for reporting this message. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          {selectedMessageForReport && (
            <div className="py-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Message:</p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-sm">{selectedMessageForReport.content}</p>
              </div>
            </div>
          )}
          <div className="space-y-2 py-4">
            {[
              { value: 'spam', label: 'Spam' },
              { value: 'harassment', label: 'Harassment' },
              { value: 'inappropriate', label: 'Inappropriate Content' },
              { value: 'other', label: 'Other' }
            ].map((reason) => (
              <label key={reason.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="messageReportReason"
                  value={reason.value}
                  checked={messageReportReason === reason.value}
                  onChange={(e) => setMessageReportReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>
          <div className="py-2">
            <label className="text-sm font-medium mb-2 block">Additional Details (Optional)</label>
            <textarea
              value={messageReportDetails}
              onChange={(e) => setMessageReportDetails(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowMessageReportDialog(false)
              setSelectedMessageForReport(null)
              setMessageReportReason('')
              setMessageReportDetails('')
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReportMessage} disabled={isReportingMessage || !messageReportReason}>
              {isReportingMessage ? 'Submitting...' : 'Submit Report'}
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

      {/* Message Search */}
      <MessageSearch
        messages={messages}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onMessageSelect={(messageId) => {
          // Scroll to message
          const messageElement = document.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement
          if (messageElement) {
            scrollContainerToElement(messageElement, 'center')
            // Highlight the message briefly
            messageElement.classList.add('ring-2', 'ring-semantic-accent', 'ring-offset-2')
            setTimeout(() => {
              messageElement.classList.remove('ring-2', 'ring-semantic-accent', 'ring-offset-2')
            }, 2000)
          }
        }}
      />

      {/* Leave Group Dialog */}
      <GroupFeedbackForm
        chatId={roomId}
        feedbackType="left"
        isOpen={showLeaveGroupDialog}
        onClose={() => setShowLeaveGroupDialog(false)}
        onSubmit={async () => {
          setIsLeavingGroup(true)
          try {
            const response = await fetchWithCSRF('/api/chat/groups', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: roomId,
                feedback_type: 'left'
              })
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.error || 'Failed to leave group')
            }

            showSuccessToast('Left group', 'You have successfully left the group.')
            if (onBack) {
              onBack()
            } else {
              router.push('/chat')
            }
          } catch (error: any) {
            console.error('Failed to leave group:', error)
            showErrorToast('Failed to leave group', error.message || 'Please try again.')
          } finally {
            setIsLeavingGroup(false)
            setShowLeaveGroupDialog(false)
          }
        }}
      />

    </div>
  )
}
