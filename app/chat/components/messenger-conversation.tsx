'use client'

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { ChevronLeft, MoreHorizontal, Sparkles, Flag, Ban, Trash2, Bell, BellOff, Archive, Search, MessageSquare, XCircle, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { MessengerMessageBubble } from './messenger-message-bubble'
import { MessengerTypingBar } from './messenger-typing-bar'
import { cn } from '@/lib/utils'
import { queryClient, queryKeys } from '@/app/providers'

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

interface MessageReaction {
  emoji: string
  count: number
  userReactions: string[]
}

interface MessengerConversationProps {
  chatId: string
  user: User
  onToggleProfile: () => void
  onBack?: () => void
  partnerName?: string
  partnerAvatar?: string
}

export function MessengerConversation({
  chatId,
  user,
  onToggleProfile,
  onBack,
  partnerName = 'User',
  partnerAvatar
}: MessengerConversationProps) {
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageReactions, setMessageReactions] = useState<Map<string, MessageReaction[]>>(new Map())
  const profilesMapRef = useRef<Map<string, any>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesChannelRef = useRef<any>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const userScrolledUpRef = useRef(false)
  const scrollToBottomRef = useRef<((force?: boolean) => void) | null>(null)
  const isLoadingMessagesRef = useRef(false)
  const lastLoadedChatIdRef = useRef<string | null>(null)
  
  // Partner user ID and action states
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null)
  const [displayPartnerName, setDisplayPartnerName] = useState<string>(partnerName)
  const [displayPartnerAvatar, setDisplayPartnerAvatar] = useState<string | undefined>(partnerAvatar)
  const [isGroupChat, setIsGroupChat] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [reportCategory, setReportCategory] = useState<string>('')
  const [reportDetails, setReportDetails] = useState<string>('')
  const [isReporting, setIsReporting] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  // isBlocked = current user has an active block against the partner in this chat
  const [isBlocked, setIsBlocked] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMuting, setIsMuting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isMarkingUnread, setIsMarkingUnread] = useState(false)
  const [otherMembersCount, setOtherMembersCount] = useState(1)

  // Auto-scroll to bottom (prevents page scroll)
  const scrollToBottom = useCallback((force = false) => {
    if ((shouldAutoScroll && !userScrolledUp) || force) {
      setTimeout(() => {
        const container = messagesContainerRef.current
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [shouldAutoScroll, userScrolledUp])

  // Keep ref in sync
  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom
  }, [scrollToBottom])

  // Check if user scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

    if (isAtBottom) {
      setUserScrolledUp(false)
      userScrolledUpRef.current = false
      setShouldAutoScroll(true)
    } else {
      setUserScrolledUp(true)
      userScrolledUpRef.current = true
      setShouldAutoScroll(false)
    }
  }, [])

  // Mark messages as read when chat is opened
  const markAsRead = useCallback(async () => {
    if (!chatId) return

    try {
      const response = await fetchWithCSRF('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      })

      if (response.ok) {
        // Invalidate chat queries to refresh unread counts immediately
        queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
      }
    } catch (error) {
      // Silently fail - we don't want to interrupt user experience
      console.warn('[MessengerConversation] Failed to mark as read:', error)
    }
  }, [chatId, user.id])

  // Load messages
  const loadMessages = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingMessagesRef.current) {
      return
    }
    
    // Skip if we've already loaded this chat
    if (lastLoadedChatIdRef.current === chatId) {
      return
    }

    try {
      isLoadingMessagesRef.current = true
      setIsLoading(true)

      // Load messages directly from Supabase
      const MESSAGE_LIMIT = 50
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, user_id, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT)

      if (messagesError) {
        console.error('Failed to load messages:', messagesError)
        throw new Error('Failed to load messages')
      }

      // Reverse messages array to show newest at bottom
      const reversedMessages = (messagesData || []).reverse()

      // Load read receipts
      const messageIds = reversedMessages.map(m => m.id)
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

      // Fetch profiles
      let newProfilesMap = new Map<string, any>()
      try {
        const profilesResponse = await fetchWithCSRF('/api/chat/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId })
        })

        if (profilesResponse.ok) {
          const { profiles: profilesData } = await profilesResponse.json()
          if (Array.isArray(profilesData)) {
            profilesData.forEach((profile: any) => {
              if (profile?.user_id) {
                newProfilesMap.set(profile.user_id, profile)
              }
            })
            console.log('[MessengerConversation] Loaded profiles:', newProfilesMap.size, 'profiles for chat:', chatId)
          } else {
            console.warn('[MessengerConversation] Profiles response is not an array:', profilesData)
          }
        } else {
          // Handle 429 rate limit errors gracefully - don't log as errors since rate limiting is expected
          if (profilesResponse.status === 429) {
            // Rate limited - profiles will be empty, use fallback names
            // Silently skip - don't log anything
          } else {
            const errorText = await profilesResponse.text()
            console.error('[MessengerConversation] Failed to fetch profiles:', profilesResponse.status, errorText)
          }
        }
      } catch (err: any) {
        // Only log non-rate-limit errors
        if (err?.status !== 429 && err?.response?.status !== 429) {
          console.error('[MessengerConversation] Error fetching profiles:', err)
        }
      }

      // Update profiles map ref
      profilesMapRef.current = newProfilesMap

      // Get chat info and partner user ID
      const { data: chatData } = await supabase
        .from('chats')
        .select('is_group')
        .eq('id', chatId)
        .single()

      if (chatData) {
        setIsGroupChat(chatData.is_group || false)
      }

      const { data: chatMembers } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId)

      // Calculate other members count (excluding current user)
      const otherMembers = chatMembers?.filter(m => m.user_id !== user.id) || []
      setOtherMembersCount(Math.max(otherMembers.length, 1))

      // For individual chats, get partner user ID
      if (chatMembers && chatMembers.length === 2 && !chatData?.is_group) {
        const otherMember = chatMembers.find(m => m.user_id !== user.id)
        if (otherMember) {
          setPartnerUserId(otherMember.user_id)
          
          // Update partner name and avatar from loaded profiles
          const partnerProfile = newProfilesMap.get(otherMember.user_id)
          if (partnerProfile) {
            const partnerFullName = [partnerProfile.first_name?.trim(), partnerProfile.last_name?.trim()]
              .filter(Boolean)
              .join(' ') || 'User'
            setDisplayPartnerName(partnerFullName)
            setDisplayPartnerAvatar(partnerProfile.avatar_url || undefined)
          }

          // Check if the current user has an active block against this partner (ended_at IS NULL)
          try {
            const { data: blockCheck, error: blockError } = await supabase
              .from('match_blocklist')
              .select('id, ended_at')
              .eq('user_id', user.id)
              .eq('blocked_user_id', otherMember.user_id)
              .is('ended_at', null)
              .maybeSingle()

            if (blockError) {
              console.error('[MessengerConversation] Failed to check block status:', blockError)
              setIsBlocked(false)
            } else {
              setIsBlocked(!!blockCheck)
            }
          } catch (err) {
            console.error('[MessengerConversation] Failed to check block status:', err)
            setIsBlocked(false)
          }
        }
      } else {
        setPartnerUserId(null)
        setIsBlocked(false)
      }

      // Check if chat is muted (use localStorage as fallback since muted column may not exist)
      try {
        const mutedChats = JSON.parse(localStorage.getItem('muted_chats') || '[]')
        setIsMuted(mutedChats.includes(chatId))
      } catch {
        setIsMuted(false)
      }

      // Transform messages with sender names
      const formattedMessages: Message[] = reversedMessages.map(msg => {
        const profile = newProfilesMap.get(msg.user_id)
        const senderName = profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : msg.user_id == null
            ? 'Deleted User'
            : 'User'

        const readBy = readReceiptsMap.get(msg.id) || []
        const isSystemGreeting = msg.content === "You're matched! Start your conversation 👋"

        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.user_id,
          sender_name: senderName,
          sender_avatar: undefined,
          created_at: msg.created_at,
          read_by: readBy,
          is_own: msg.user_id === user.id,
          is_system_message: isSystemGreeting
        }
      })

      setMessages(formattedMessages)

      // Load reactions
      try {
        const reactionsMap = new Map<string, MessageReaction[]>()
        if (messageIds.length > 0) {
          const { data: reactionsData } = await supabase
            .from('message_reactions')
            .select('message_id, emoji, user_id')
            .in('message_id', messageIds)

          if (reactionsData) {
            const grouped = new Map<string, Map<string, string[]>>()
            reactionsData.forEach((r: any) => {
              if (!grouped.has(r.message_id)) {
                grouped.set(r.message_id, new Map())
              }
              const emojiMap = grouped.get(r.message_id)!
              if (!emojiMap.has(r.emoji)) {
                emojiMap.set(r.emoji, [])
              }
              emojiMap.get(r.emoji)!.push(r.user_id)
            })

            grouped.forEach((emojiMap, msgId) => {
              const reactions: MessageReaction[] = []
              emojiMap.forEach((userIds, emoji) => {
                reactions.push({
                  emoji,
                  count: userIds.length,
                  userReactions: userIds
                })
              })
              if (reactions.length > 0) {
                reactionsMap.set(msgId, reactions)
              }
            })
          }
        }
        setMessageReactions(reactionsMap)
      } catch (err) {
        console.warn('Failed to load reactions:', err)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      isLoadingMessagesRef.current = false
      setIsLoading(false)
      lastLoadedChatIdRef.current = chatId
    }
  }, [chatId, user.id, supabase])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId) {
      // Mark as read immediately when chat is opened
      markAsRead()
    }
  }, [chatId, markAsRead])

  // Setup real-time subscription
  useEffect(() => {
    if (!chatId) return

    // Reset loading state when chatId changes
    if (lastLoadedChatIdRef.current !== chatId) {
      lastLoadedChatIdRef.current = null
      isLoadingMessagesRef.current = false
      setPartnerUserId(null) // Reset partner user ID when chat changes
      setIsGroupChat(false) // Reset group chat state
      setIsMuted(false) // Reset muted state
      setDisplayPartnerName(partnerName) // Reset to prop value
      setDisplayPartnerAvatar(partnerAvatar) // Reset to prop value
    }

    loadMessages()

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, async (payload) => {
        const newMsg = payload.new as any

        // Get sender name from profiles map (profiles already loaded when messages loaded)
        let senderName = 'User'
        const profile = profilesMapRef.current.get(newMsg.user_id)
        
        if (profile) {
          senderName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        }

        const isSystemGreeting = newMsg.content === "You're matched! Start your conversation 👋"
        const isOwnMessage = newMsg.user_id === user.id
        const readBy = isOwnMessage ? [user.id] : []
        
        // Append new message instead of reloading
        setMessages(prev => {
          // Check for duplicates
          if (prev.some(msg => msg.id === newMsg.id)) {
            return prev
          }
          
          const newMessage: Message = {
            id: newMsg.id,
            content: newMsg.content,
            sender_id: newMsg.user_id,
            sender_name: senderName,
            sender_avatar: undefined,
            created_at: newMsg.created_at,
            read_by: readBy,
            is_own: isOwnMessage,
            is_system_message: isSystemGreeting
          }
          
          return [...prev, newMessage]
        })

        // Only auto-scroll if user is at bottom
        if (!userScrolledUpRef.current && scrollToBottomRef.current) {
          scrollToBottomRef.current(true)
        }
      })
      .subscribe()

    messagesChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, user.id, supabase, loadMessages])

  // Update partner name and avatar when partnerUserId or profiles change
  useEffect(() => {
    if (partnerUserId && profilesMapRef.current) {
      const partnerProfile = profilesMapRef.current.get(partnerUserId)
      if (partnerProfile) {
        const partnerFullName = [partnerProfile.first_name?.trim(), partnerProfile.last_name?.trim()]
          .filter(Boolean)
          .join(' ') || 'User'
        setDisplayPartnerName(partnerFullName)
        setDisplayPartnerAvatar(partnerProfile.avatar_url || undefined)
      }
    } else if (!partnerUserId) {
      // Reset to prop values if no partner
      setDisplayPartnerName(partnerName)
      setDisplayPartnerAvatar(partnerAvatar)
    }
  }, [partnerUserId, partnerName, partnerAvatar])

  // Auto-scroll on initial load only
  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0 && !userScrolledUp) {
      scrollToBottom(true)
    }
  }, [isLoading, messages.length, scrollToBottom, userScrolledUp])

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    try {
      // If you've blocked this user, you must unblock before sending
      if (isBlocked) {
        throw new Error('This user has been blocked. To send a message, unblock them first.')
      }

      const response = await fetchWithCSRF('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, content })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to send message'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response isn't JSON, try to get text
          try {
            const text = await response.text()
            if (text) errorMessage = text
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        }
        console.error('[MessengerConversation] Failed to send message:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage
        })
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      const sentMessage = responseData?.message

      if (sentMessage?.id) {
        const profile = profilesMapRef.current.get(sentMessage.user_id) || sentMessage.profiles
        const senderName = profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : 'User'
        const isSystemGreeting = sentMessage.content === "You're matched! Start your conversation 👋"

        setMessages(prev => {
          if (prev.some(msg => msg.id === sentMessage.id)) {
            return prev
          }

          return [...prev, {
            id: sentMessage.id,
            content: sentMessage.content,
            sender_id: sentMessage.user_id,
            sender_name: senderName,
            sender_avatar: undefined,
            created_at: sentMessage.created_at,
            read_by: [user.id],
            is_own: true,
            is_system_message: isSystemGreeting
          }]
        })
      }

      scrollToBottom(true)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle reaction change
  const handleReactionChange = async (messageId: string) => {
    try {
      const { data: reactionsData } = await supabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .eq('message_id', messageId)

      if (reactionsData) {
        const grouped = new Map<string, string[]>()
        reactionsData.forEach((r: any) => {
          if (!grouped.has(r.emoji)) {
            grouped.set(r.emoji, [])
          }
          grouped.get(r.emoji)!.push(r.user_id)
        })

        const reactions: MessageReaction[] = []
        grouped.forEach((userIds, emoji) => {
          reactions.push({
            emoji,
            count: userIds.length,
            userReactions: userIds
          })
        })

        setMessageReactions(prev => {
          const updated = new Map(prev)
          if (reactions.length > 0) {
            updated.set(messageId, reactions)
          } else {
            updated.delete(messageId)
          }
          return updated
        })
      }
    } catch (err) {
      console.warn('Failed to reload reactions:', err)
    }
  }

  // Group messages by date
  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true

    const currentMsg = messages[index]
    const previousMsg = messages[index - 1]

    if (!currentMsg || !previousMsg) return false

    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()

    return currentDate !== previousDate
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  // Handle report user
  const handleReport = async () => {
    if (!partnerUserId || !reportCategory || !reportDetails.trim()) {
      showErrorToast('Missing information', 'Please select a category and provide details.')
      return
    }

    setIsReporting(true)
    try {
      const response = await fetchWithCSRF('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: partnerUserId,
          category: reportCategory,
          details: reportDetails.trim()
        })
      })

      if (response.ok) {
        showSuccessToast('Report submitted', 'Thank you for reporting. We will review this issue.')
        setShowReportDialog(false)
        setReportCategory('')
        setReportDetails('')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }
    } catch (error: any) {
      console.error('Failed to report:', error)
      showErrorToast('Failed to submit report', error.message || 'Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  // Handle block / unblock user (compact messenger header)
  const handleBlock = async () => {
    if (!partnerUserId) {
      showErrorToast('Error', 'Unable to identify user to update block status.')
      return
    }

    setIsBlocking(true)
    try {
      if (isBlocking) {
        // Prevent double-click while request is in-flight
        return
      }

      // For this compact view we always treat it as "block"; users can manage unblock in full chat view
      const response = await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_user_id: partnerUserId })
      })

      if (response.ok) {
        showSuccessToast(
          'User blocked',
          'This user has been blocked and you will no longer receive messages from them.'
        )
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

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    setIsDeleting(true)
    try {
      const response = await fetchWithCSRF(`/api/chat/${chatId}/leave`, {
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

  // Handle mute/unmute notifications
  const handleToggleMute = async () => {
    setIsMuting(true)
    try {
      const newMutedState = !isMuted
      // Store muted status in localStorage
      // In the future, this could be stored in a user_chat_settings table
      const mutedChats = JSON.parse(localStorage.getItem('muted_chats') || '[]')
      if (newMutedState) {
        if (!mutedChats.includes(chatId)) {
          mutedChats.push(chatId)
        }
      } else {
        const index = mutedChats.indexOf(chatId)
        if (index > -1) {
          mutedChats.splice(index, 1)
        }
      }
      localStorage.setItem('muted_chats', JSON.stringify(mutedChats))
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('mutedChatsChanged'))

      setIsMuted(newMutedState)
      showSuccessToast(
        newMutedState ? 'Conversation muted' : 'Conversation unmuted',
        newMutedState 
          ? 'You will not receive notifications from this conversation.'
          : 'You will receive notifications from this conversation.'
      )
    } catch (error: any) {
      console.error('Failed to toggle mute:', error)
      showErrorToast('Failed to update mute status', error.message || 'Please try again.')
    } finally {
      setIsMuting(false)
    }
  }

  // Handle archive conversation
  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      // Update chat invitation_status to 'archived' for this user
      // Since we can't archive per-user, we'll use a user_chat_settings approach
      // For now, we'll use localStorage as a fallback
      const archivedChats = JSON.parse(localStorage.getItem('archived_chats') || '[]')
      if (!archivedChats.includes(chatId)) {
        archivedChats.push(chatId)
        localStorage.setItem('archived_chats', JSON.stringify(archivedChats))
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('archivedChatsChanged'))
      }

      showSuccessToast('Conversation archived', 'The conversation has been archived.')
      router.push('/chat')
    } catch (error: any) {
      console.error('Failed to archive:', error)
      showErrorToast('Failed to archive conversation', error.message || 'Please try again.')
    } finally {
      setIsArchiving(false)
    }
  }

  // Handle clear chat history
  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      // Delete all messages in this chat for the current user's view
      // We'll delete read receipts and mark messages as deleted for this user
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('chat_id', chatId)

      if (messages && messages.length > 0) {
        const messageIds = messages.map(m => m.id)
        
        // Delete read receipts
        await supabase
          .from('message_reads')
          .delete()
          .eq('user_id', user.id)
          .in('message_id', messageIds)

        // Note: We don't delete the actual messages as other users might still need them
        // Instead, we could create a user_deleted_messages table to track which messages
        // a user has deleted from their view
      }

      // Clear local messages state
      setMessages([])
      setShowClearHistoryDialog(false)
      showSuccessToast('Chat history cleared', 'All messages have been cleared from this conversation.')
    } catch (error: any) {
      console.error('Failed to clear history:', error)
      showErrorToast('Failed to clear chat history', error.message || 'Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  // Handle mark as unread
  const handleMarkAsUnread = async () => {
    setIsMarkingUnread(true)
    try {
      // Delete all read receipts for this chat to mark as unread
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('chat_id', chatId)

      if (messages && messages.length > 0) {
        const messageIds = messages.map(m => m.id)
        await supabase
          .from('message_reads')
          .delete()
          .eq('user_id', user.id)
          .in('message_id', messageIds)
      }

      showSuccessToast('Marked as unread', 'This conversation has been marked as unread.')
      router.push('/chat')
    } catch (error: any) {
      console.error('Failed to mark as unread:', error)
      showErrorToast('Failed to mark as unread', error.message || 'Please try again.')
    } finally {
      setIsMarkingUnread(false)
    }
  }

  // Handle search in conversation (client-side)
  const handleSearch = () => {
    // This would open a search dialog/modal
    // For now, we'll just show a toast indicating this feature
    showErrorToast('Search feature', 'Search functionality will be implemented soon.')
  }

  return (
    <div
      data-messenger-conversation
      className="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 lg:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">Back to chats</span>
            </Button>
          )}
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={displayPartnerAvatar} />
            <AvatarFallback className="bg-purple-600 text-white">
              {displayPartnerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayPartnerName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Compatibility Icon Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleProfile}
            className="h-8 w-8 p-0"
            title="View profile & compatibility"
          >
            <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="sr-only">View profile & compatibility</span>
          </Button>
          
          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* User-specific actions (only for individual chats) */}
              {partnerUserId && !isGroupChat && (
                <>
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report user
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBlock} disabled={isBlocking}>
                    <Ban className="mr-2 h-4 w-4" />
                    {isBlocking ? 'Blocking...' : 'Block user'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Conversation actions */}
              <DropdownMenuItem onClick={handleToggleMute} disabled={isMuting}>
                {isMuted ? (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    {isMuting ? 'Unmuting...' : 'Unmute notifications'}
                  </>
                ) : (
                  <>
                    <BellOff className="mr-2 h-4 w-4" />
                    {isMuting ? 'Muting...' : 'Mute notifications'}
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                <Archive className="mr-2 h-4 w-4" />
                {isArchiving ? 'Archiving...' : 'Archive conversation'}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search in conversation
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleMarkAsUnread} disabled={isMarkingUnread}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {isMarkingUnread ? 'Marking...' : 'Mark as unread'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setShowClearHistoryDialog(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear chat history
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              Report User
            </DialogTitle>
            <DialogDescription>
              Help us keep the platform safe by reporting this user: {displayPartnerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Reason for reporting</Label>
              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (required)</Label>
              <Textarea
                id="details"
                placeholder="Please provide specific details about why you're reporting this user..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500">
                {reportDetails.length}/500 characters
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReportDialog(false)
                setReportCategory('')
                setReportDetails('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              disabled={isReporting || !reportCategory || !reportDetails.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isReporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation {isGroupChat ? '' : `with ${displayPartnerName}`}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConversation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear History Dialog */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Clear Chat History
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages in this conversation? This will remove all messages from your view, but other participants will still see them. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearHistoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearHistory}
              disabled={isClearing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isClearing ? 'Clearing...' : 'Clear History'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Feed - Scrollable */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4 scrollbar-visible"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                {shouldShowDateSeparator(index) && (
                  <div className="flex justify-center my-6">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                )}
                <MessengerMessageBubble
                  id={message.id}
                  content={message.content}
                  senderId={message.sender_id}
                  senderName={message.sender_name}
                  senderAvatar={message.sender_avatar}
                  createdAt={message.created_at}
                  isOwn={message.is_own}
                  isSystem={message.is_system_message}
                  readBy={message.read_by}
                  reactions={messageReactions.get(message.id) || []}
                  currentUserId={user.id}
                  showSenderName={!message.is_own && index > 0 && messages[index - 1]?.sender_id !== message.sender_id}
                  onReactionChange={() => handleReactionChange(message.id)}
                  otherMembersCount={otherMembersCount}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Typing Bar */}
      <MessengerTypingBar
        onSend={handleSendMessage}
        placeholder={
          isBlocked
            ? 'This user has been blocked. To send a message, unblock them.'
            : 'Type a message...'
        }
        disabled={isBlocked}
      />
    </div>
  )
}
