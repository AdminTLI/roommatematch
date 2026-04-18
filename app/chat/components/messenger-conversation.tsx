'use client'

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { User } from '@supabase/supabase-js'
import {
  MoreHorizontal,
  ChevronLeft,
  Flag,
  Ban,
  Trash2,
  Bell,
  BellOff,
  Archive,
  Search,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { badgeVariants } from '@/components/ui/badge'
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
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { MessengerMessageBubble, type MessageReplyRef } from './messenger-message-bubble'
import { MessengerTypingBar } from './messenger-typing-bar'
import { ReportUserDialog } from './report-user-dialog'
import { cn } from '@/lib/utils'
import { queryClient, queryKeys } from '@/app/providers'
import type { ChatPrivacySnapshot } from '@/lib/privacy/profile-access-types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { fetchChatCompatibility } from '@/lib/chat/fetch-chat-compatibility'

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
  reply_to?: {
    id: string
    content: string
    sender_id: string
    sender_name: string
  }
}

interface MessageReaction {
  emoji: string
  count: number
  userReactions: string[]
}

interface BlockWindow {
  start: string
  end: string | null
}

interface MessengerConversationProps {
  chatId: string
  user: User
  onToggleProfile: () => void
  onBack?: () => void
  partnerName?: string
  partnerAvatar?: string
  /** Mobile: hide composer when profile/compatibility sheet is open */
  hideComposer?: boolean
  /** When set, scroll this message into view after messages load */
  highlightMessageId?: string | null
  /** Called after highlight ring is cleared (e.g. strip `messageId` from URL) */
  onHighlightConsumed?: () => void
}

export function MessengerConversation({
  chatId,
  user,
  onToggleProfile,
  onBack,
  partnerName = 'User',
  partnerAvatar,
  hideComposer = false,
  highlightMessageId = null,
  onHighlightConsumed,
}: MessengerConversationProps) {
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageReactions, setMessageReactions] = useState<Map<string, MessageReaction[]>>(new Map())
  const profilesMapRef = useRef<Map<string, any>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const conversationRootRef = useRef<HTMLDivElement>(null)
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
  const [isBlocking, setIsBlocking] = useState(false)
  // isBlocked = current user has an active block against the partner in this chat
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockWindows, setBlockWindows] = useState<BlockWindow[]>([])
  const [isMessagingDisabledByPrivacy, setIsMessagingDisabledByPrivacy] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMuting, setIsMuting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isMarkingUnread, setIsMarkingUnread] = useState(false)
  const [otherMembersCount, setOtherMembersCount] = useState(1)
  const [replyDraft, setReplyDraft] = useState<MessageReplyRef | null>(null)
  const [revealDialogOpen, setRevealDialogOpen] = useState(false)
  const [revealDetailsChoice, setRevealDetailsChoice] = useState(true)
  const [revealPictureChoice, setRevealPictureChoice] = useState(false)
  const [revealSubmitting, setRevealSubmitting] = useState(false)

  const { data: privacySnap } = useQuery<ChatPrivacySnapshot | null>({
    queryKey: queryKeys.chatPrivacy(chatId, user.id),
    queryFn: async () => {
      const r = await fetch(`/api/chat/privacy-state?chatId=${encodeURIComponent(chatId)}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!r.ok) return null
      return (await r.json()) as ChatPrivacySnapshot
    },
    enabled: Boolean(chatId && partnerUserId && !isGroupChat),
    staleTime: 15_000,
  })

  const { data: compatData, isLoading: compatLoading } = useQuery({
    queryKey: queryKeys.chatCompatibility(chatId),
    queryFn: () => fetchChatCompatibility(chatId),
    staleTime: 5 * 60 * 1000,
    enabled: !!chatId && !isGroupChat,
  })

  const matchPercent =
    compatData?.compatibility_score != null && !Number.isNaN(compatData.compatibility_score)
      ? Math.round(compatData.compatibility_score * 100)
      : null

  const isMessageHiddenByBlockWindow = useCallback((message: Message) => {
    if (!partnerUserId || message.sender_id !== partnerUserId) return false

    const messageTime = new Date(message.created_at).getTime()
    if (Number.isNaN(messageTime)) return false

    return blockWindows.some((window) => {
      const startTime = new Date(window.start).getTime()
      const endTime = window.end ? new Date(window.end).getTime() : Number.POSITIVE_INFINITY
      if (Number.isNaN(startTime) || Number.isNaN(endTime)) return false
      return messageTime >= startTime && messageTime <= endTime
    })
  }, [partnerUserId, blockWindows])

  const visibleMessages = messages.filter((message) => !isMessageHiddenByBlockWindow(message))

  const highlightAppliedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!highlightMessageId) {
      highlightAppliedRef.current = null
    }
  }, [highlightMessageId])

  useEffect(() => {
    highlightAppliedRef.current = null
  }, [chatId])

  useEffect(() => {
    if (!highlightMessageId || isLoading) return
    if (!visibleMessages.some((m) => m.id === highlightMessageId)) return
    if (highlightAppliedRef.current === highlightMessageId) return
    highlightAppliedRef.current = highlightMessageId

    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(highlightMessageId)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add(
        'ring-2',
        'ring-purple-500',
        'ring-offset-2',
        'rounded-2xl',
        'transition-shadow',
        'dark:ring-offset-gray-950',
      )
      window.setTimeout(() => {
        el.classList.remove(
          'ring-2',
          'ring-purple-500',
          'ring-offset-2',
          'rounded-2xl',
          'transition-shadow',
          'dark:ring-offset-gray-950',
        )
        onHighlightConsumed?.()
      }, 2200)
    })

    return () => cancelAnimationFrame(raf)
  }, [highlightMessageId, isLoading, visibleMessages, onHighlightConsumed])

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
        .select('id, content, user_id, created_at, reply_to_id')
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

      const senderNameForUser = (uid: string) => {
        const profile = newProfilesMap.get(uid)
        return profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          : 'User'
      }

      const replyIds = [
        ...new Set(
          reversedMessages
            .map((m: { reply_to_id?: string | null }) => m.reply_to_id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0),
        ),
      ]
      const parentById = new Map<string, { id: string; content: string; user_id: string }>()
      if (replyIds.length > 0) {
        const { data: parents } = await supabase.from('messages').select('id, content, user_id').in('id', replyIds)
        for (const p of parents || []) {
          parentById.set(p.id, p as { id: string; content: string; user_id: string })
        }
      }

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
          setIsMessagingDisabledByPrivacy(false)
          
          // Update partner name and avatar from loaded profiles
          const partnerProfile = newProfilesMap.get(otherMember.user_id)
          if (partnerProfile) {
            const partnerFullName = [partnerProfile.first_name?.trim(), partnerProfile.last_name?.trim()]
              .filter(Boolean)
              .join(' ') || 'User'
            setDisplayPartnerName(partnerFullName)
            setDisplayPartnerAvatar(partnerProfile.avatar_url || undefined)
          }

          // Load block windows for this pair and derive active blocked state.
          try {
            const { data: blockRows, error: blockError } = await supabase
              .from('match_blocklist')
              .select('created_at, ended_at')
              .eq('user_id', user.id)
              .eq('blocked_user_id', otherMember.user_id)
              .order('created_at', { ascending: true })

            if (blockError) {
              console.error('[MessengerConversation] Failed to check block status:', blockError)
              setIsBlocked(false)
              setBlockWindows([])
            } else {
              const windows: BlockWindow[] = (blockRows || []).map((row: any) => ({
                start: row.created_at,
                end: row.ended_at ?? null
              }))
              setBlockWindows(windows)
              setIsBlocked(windows.some((window) => window.end === null))
            }
          } catch (err) {
            console.error('[MessengerConversation] Failed to check block status:', err)
            setIsBlocked(false)
            setBlockWindows([])
          }
        }
      } else {
        setPartnerUserId(null)
        setIsBlocked(false)
        setBlockWindows([])
        setIsMessagingDisabledByPrivacy(false)
      }

      // Check if chat is muted (use localStorage as fallback since muted column may not exist)
      try {
        const mutedChats = JSON.parse(localStorage.getItem('muted_chats') || '[]')
        setIsMuted(mutedChats.includes(chatId))
      } catch {
        setIsMuted(false)
      }

      // Transform messages with sender names
      const formattedMessages: Message[] = reversedMessages.map((msg: {
        id: string
        content: string
        user_id: string
        created_at: string
        reply_to_id?: string | null
      }) => {
        const senderName = senderNameForUser(msg.user_id)

        const readBy = readReceiptsMap.get(msg.id) || []
        const isSystemGreeting = msg.content === "You're matched! Start your conversation 👋"

        let reply_to: Message['reply_to'] = undefined
        if (msg.reply_to_id) {
          const p = parentById.get(msg.reply_to_id)
          if (p) {
            reply_to = {
              id: p.id,
              content: p.content,
              sender_id: p.user_id,
              sender_name: senderNameForUser(p.user_id),
            }
          }
        }

        const senderProf = newProfilesMap.get(msg.user_id)
        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.user_id,
          sender_name: senderName,
          sender_avatar: senderProf?.avatar_url || undefined,
          created_at: msg.created_at,
          read_by: readBy,
          is_own: msg.user_id === user.id,
          is_system_message: isSystemGreeting,
          reply_to,
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
      setReplyDraft(null)
    }

    loadMessages()

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMsg = payload.new as {
          id: string
          content: string
          user_id: string
          created_at: string
          reply_to_id?: string | null
        }

        let senderName = 'User'
        const profile = profilesMapRef.current.get(newMsg.user_id)

        if (profile) {
          senderName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
        }

        const isSystemGreeting = newMsg.content === "You're matched! Start your conversation 👋"
        const isOwnMessage = newMsg.user_id === user.id
        const readBy = isOwnMessage ? [user.id] : []

        setMessages(prev => {
          if (prev.some(msg => msg.id === newMsg.id)) {
            return prev
          }

          let reply_to: Message['reply_to'] = undefined
          if (newMsg.reply_to_id) {
            const hit = prev.find(m => m.id === newMsg.reply_to_id)
            if (hit) {
              reply_to = {
                id: hit.id,
                content: hit.content,
                sender_id: hit.sender_id,
                sender_name: hit.sender_name,
              }
            }
          }

          const newMessage: Message = {
            id: newMsg.id,
            content: newMsg.content,
            sender_id: newMsg.user_id,
            sender_name: senderName,
            sender_avatar: profile?.avatar_url || undefined,
            created_at: newMsg.created_at,
            read_by: readBy,
            is_own: isOwnMessage,
            is_system_message: isSystemGreeting,
            reply_to,
          }

          const next = [...prev, newMessage]

          if (newMsg.reply_to_id && !reply_to) {
            void supabase
              .from('messages')
              .select('id, content, user_id')
              .eq('id', newMsg.reply_to_id)
              .maybeSingle()
              .then(({ data: p }) => {
                if (!p) return
                const pr = profilesMapRef.current.get(p.user_id)
                const sn = pr
                  ? [pr.first_name?.trim(), pr.last_name?.trim()].filter(Boolean).join(' ') || 'User'
                  : 'User'
                setMessages(curr =>
                  curr.map(m =>
                    m.id === newMsg.id
                      ? {
                          ...m,
                          reply_to: {
                            id: p.id,
                            content: p.content,
                            sender_id: p.user_id,
                            sender_name: sn,
                          },
                        }
                      : m,
                  ),
                )
              })
          }

          return next
        })

        void queryClient.invalidateQueries({ queryKey: queryKeys.chatPrivacy(chatId, user.id) })

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

  // Update partner name and avatar: progressive disclosure snapshot for 1:1, else profile/props.
  useEffect(() => {
    if (!partnerUserId) {
      setDisplayPartnerName(partnerName)
      setDisplayPartnerAvatar(partnerAvatar)
      return
    }
    if (isGroupChat) {
      if (profilesMapRef.current) {
        const partnerProfile = profilesMapRef.current.get(partnerUserId)
        if (partnerProfile) {
          const partnerFullName = [partnerProfile.first_name?.trim(), partnerProfile.last_name?.trim()]
            .filter(Boolean)
            .join(' ') || 'User'
          setDisplayPartnerName(partnerFullName)
          setDisplayPartnerAvatar(partnerProfile.avatar_url || undefined)
        }
      }
      return
    }
    if (privacySnap) {
      setDisplayPartnerName(privacySnap.partner_display_name)
      setDisplayPartnerAvatar(privacySnap.partner_avatar_url || undefined)
      return
    }
    if (profilesMapRef.current) {
      const partnerProfile = profilesMapRef.current.get(partnerUserId)
      if (partnerProfile) {
        const partnerFullName = [partnerProfile.first_name?.trim(), partnerProfile.last_name?.trim()]
          .filter(Boolean)
          .join(' ') || 'User'
        setDisplayPartnerName(partnerFullName)
        setDisplayPartnerAvatar(partnerProfile.avatar_url || undefined)
      }
    }
  }, [partnerUserId, partnerName, partnerAvatar, isGroupChat, privacySnap])

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

      const replySnapshot = replyDraft
      const payload: { chat_id: string; content: string; reply_to_id?: string } = {
        chat_id: chatId,
        content,
      }
      if (replySnapshot?.id) {
        payload.reply_to_id = replySnapshot.id
      }

      const response = await fetchWithCSRF('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to send message'
        let errorData: any = null
        try {
          errorData = await response.json()
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

        if (response.status === 403 && errorData?.reason === 'privacy_disabled_messaging') {
          setIsMessagingDisabledByPrivacy(true)
          showErrorToast('Messaging disabled', errorMessage)
          return
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

        const reply_to: Message['reply_to'] | undefined = replySnapshot
          ? {
              id: replySnapshot.id,
              content: replySnapshot.content,
              sender_id: replySnapshot.senderId,
              sender_name: replySnapshot.senderName,
            }
          : undefined

        setReplyDraft(null)

        setMessages(prev => {
          if (prev.some(msg => msg.id === sentMessage.id)) {
            return prev
          }

          return [
            ...prev,
            {
              id: sentMessage.id,
              content: sentMessage.content,
              sender_id: sentMessage.user_id,
              sender_name: senderName,
              sender_avatar: undefined,
              created_at: sentMessage.created_at,
              read_by: [user.id],
              is_own: true,
              is_system_message: isSystemGreeting,
              reply_to,
            },
          ]
        })
      }

      scrollToBottom(true)
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatPrivacy(chatId, user.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleConfirmReveal = async () => {
    if (!revealDetailsChoice && revealPictureChoice) {
      showErrorToast('Choose details first', 'Profile picture can only be shared together with profile details.')
      return
    }
    setRevealSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/chat/reveal-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          reveal_details: revealDetailsChoice,
          reveal_picture: revealDetailsChoice && revealPictureChoice,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save')
      }
      setRevealDialogOpen(false)
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatPrivacy(chatId, user.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats(user.id) })
      showSuccessToast('Preferences saved', 'Your sharing choices are updated for this chat.')
    } catch (e) {
      showErrorToast('Could not save', e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setRevealSubmitting(false)
    }
  }

  const avatarForDisplayedMessage = useCallback(
    (message: Message) => {
      if (isGroupChat || !privacySnap) return message.sender_avatar
      if (message.is_own) return privacySnap.viewer_avatar_url
      if (partnerUserId && message.sender_id === partnerUserId) return privacySnap.partner_avatar_url ?? undefined
      return message.sender_avatar
    },
    [isGroupChat, privacySnap, partnerUserId],
  )

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
  const shouldShowDateSeparator = (index: number, messageList: Message[] = messages) => {
    if (index === 0) return true

    const currentMsg = messageList[index]
    const previousMsg = messageList[index - 1]

    if (!currentMsg || !previousMsg) return false

    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()

    return currentDate !== previousDate
  }

  /** First bubble in a run from this sender (others only): show name inside bubble */
  const isFirstInOtherSenderGroup = (index: number, messageList: Message[]) => {
    const message = messageList[index]
    if (!message || message.is_own || message.is_system_message) return false
    if (index === 0) return true
    const prev = messageList[index - 1]
    if (!prev) return true
    if (prev.is_system_message) return true
    if (shouldShowDateSeparator(index, messageList)) return true
    return prev.sender_id !== message.sender_id
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

      const endpoint = isBlocked ? '/api/match/unblock' : '/api/match/block'
      const response = await fetchWithCSRF(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_user_id: partnerUserId })
      })

      if (response.ok) {
        if (isBlocked) {
          const unblockedAtIso = new Date().toISOString()
          setIsBlocked(false)
          setBlockWindows(prev =>
            prev.map((window, index) =>
              index === prev.length - 1 && window.end === null
                ? { ...window, end: unblockedAtIso }
                : window
            )
          )
          showSuccessToast(
            'User unblocked',
            'You can now message this user again. Messages sent while blocked remain hidden.'
          )
        } else {
          const blockedAtIso = new Date().toISOString()
          setIsBlocked(true)
          setBlockWindows(prev => [...prev, { start: blockedAtIso, end: null }])
          showSuccessToast(
            'User blocked',
            'This user has been blocked and you will no longer receive messages from them.'
          )
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update block status')
      }
    } catch (error: any) {
      console.error('Failed to block:', error)
      showErrorToast('Failed to update block status', error.message || 'Please try again.')
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

  const handleComposerFocus = useCallback(() => {
    // Replying usually means the user wants the latest messages in view; keep the list pinned to
    // the end while the keyboard/visual viewport settles (handled by ChatPageViewportRoot on /chat).
    setUserScrolledUp(false)
    userScrolledUpRef.current = false
    setShouldAutoScroll(true)

    const flushMessagesToEnd = () => {
      const c = messagesContainerRef.current
      if (c) {
        c.scrollTop = c.scrollHeight
      }
    }

    flushMessagesToEnd()
    requestAnimationFrame(() => {
      flushMessagesToEnd()
      requestAnimationFrame(() => {
        flushMessagesToEnd()
      })
    })
    window.setTimeout(flushMessagesToEnd, 50)
    window.setTimeout(flushMessagesToEnd, 200)
    window.setTimeout(flushMessagesToEnd, 450)
  }, [])

  const handleComposerBlur = useCallback(() => {
    // Some mobile browsers (notably iOS Chrome) can miss the final visualViewport event when the
    // keyboard closes. ChatPageViewportRoot listens to window resize; trigger a cheap resync.
    if (typeof window === 'undefined') return
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 120)
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 350)
  }, [])

  return (
    <div
      ref={conversationRootRef}
      data-messenger-conversation
      className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-gray-950 lg:rounded-t-lg"
    >
      {/* Fixed Header — single visual row: back · avatar · title + inline match · menu */}
      <div className="flex max-w-full flex-shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950 max-lg:pt-safe-top lg:px-4 lg:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                aria-label="Back to chats"
                className="h-11 w-11 shrink-0 touch-manipulation rounded-full bg-gray-100 p-0 text-gray-900 transition-colors hover:bg-gray-200 active:scale-[0.98] active:bg-gray-300 lg:hidden dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.25} aria-hidden />
              </Button>
            )}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={displayPartnerAvatar} />
              <AvatarFallback className="bg-purple-600 text-white">
                {displayPartnerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold leading-tight text-gray-900 dark:text-gray-100">
              {displayPartnerName}
            </h2>
            {!isGroupChat && partnerUserId && (
              <button
                type="button"
                onClick={onToggleProfile}
                aria-label={
                  matchPercent != null
                    ? `Compatibility ${matchPercent}% — open details`
                    : 'View compatibility details'
                }
                className={cn(
                  badgeVariants({ variant: 'outline', size: 'default' }),
                  'h-8 min-h-8 shrink-0 touch-manipulation gap-1.5 px-3 py-0 leading-none',
                  'border-purple-200/90 bg-surface-1 text-xs font-semibold shadow-sm',
                  'hover:border-purple-300 hover:bg-purple-50/90 active:bg-purple-100/80',
                  'dark:border-purple-800/80 dark:bg-purple-950/25',
                  'dark:hover:border-purple-600 dark:hover:bg-purple-950/45 dark:active:bg-purple-950/60',
                )}
              >
                <Sparkles
                  className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400"
                  aria-hidden
                  strokeWidth={2}
                />
                {compatLoading ? (
                  <span className="text-xs font-semibold tabular-nums text-ink-400 dark:text-ink-500">…</span>
                ) : matchPercent != null ? (
                  <span
                    className={cn(
                      'whitespace-nowrap bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-xs font-semibold tabular-nums text-transparent',
                      'dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400',
                    )}
                  >
                    {matchPercent}% Match
                  </span>
                ) : (
                  <span
                    className={cn(
                      'whitespace-nowrap bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-xs font-semibold text-transparent',
                      'dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400',
                    )}
                  >
                    View Match
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-11 w-11 touch-manipulation p-0">
                <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
                    {isBlocking ? (isBlocked ? 'Unblocking...' : 'Blocking...') : (isBlocked ? 'Unblock user' : 'Block user')}
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

      {partnerUserId && (
        <ReportUserDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          chatId={chatId}
          targetUserId={partnerUserId}
          targetDisplayName={displayPartnerName}
          variant="user"
        />
      )}

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

      <Dialog open={revealDialogOpen} onOpenChange={setRevealDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reveal profile</DialogTitle>
            <DialogDescription>
              Choose what you are comfortable sharing with this match. You can share details without sharing your profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="reveal-details"
                checked={revealDetailsChoice}
                onCheckedChange={(v) => setRevealDetailsChoice(v === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="reveal-details" className="text-sm font-medium">
                  Reveal my profile details
                </Label>
                <p className="text-xs text-muted-foreground">
                  Includes richer profile context shown in match insights (for example age and programme where available).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="reveal-picture"
                checked={revealPictureChoice}
                disabled={!revealDetailsChoice}
                onCheckedChange={(v) => setRevealPictureChoice(v === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="reveal-picture" className="text-sm font-medium">
                  Also reveal my profile picture
                </Label>
                <p className="text-xs text-muted-foreground">Only applies if you have uploaded a photo in Settings.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setRevealDialogOpen(false)} disabled={revealSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleConfirmReveal()} disabled={revealSubmitting}>
              {revealSubmitting ? 'Saving…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Feed - Scrollable */}
      <div
        ref={messagesContainerRef}
        data-messenger-messages
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
            {privacySnap?.show_reveal_prompt && !isGroupChat && (
              <div
                role="status"
                className="rounded-xl border border-violet-200 bg-violet-50/90 px-4 py-3 text-sm text-violet-950 shadow-sm dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
              >
                <p className="font-medium">You have built enough back-and-forth to share more safely.</p>
                <p className="mt-1 text-xs opacity-90">
                  When you are ready, choose whether to reveal profile details and/or your profile picture. Both people choose independently; details unlock when you have both agreed to share details.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 bg-violet-600 text-white hover:bg-violet-700"
                  onClick={() => setRevealDialogOpen(true)}
                >
                  Reveal profile details
                </Button>
              </div>
            )}
            {visibleMessages.map((message, index) => (
              <div key={message.id} id={message.id} className="scroll-mt-28">
                {shouldShowDateSeparator(index, visibleMessages) && (
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
                  senderAvatar={avatarForDisplayedMessage(message)}
                  createdAt={message.created_at}
                  isOwn={message.is_own}
                  isSystem={message.is_system_message}
                  readBy={message.read_by}
                  reactions={messageReactions.get(message.id) || []}
                  currentUserId={user.id}
                  showSenderName={isFirstInOtherSenderGroup(index, visibleMessages)}
                  onReactionChange={() => handleReactionChange(message.id)}
                  otherMembersCount={otherMembersCount}
                  chatId={chatId}
                  replyTo={
                    message.reply_to
                      ? {
                          id: message.reply_to.id,
                          content: message.reply_to.content,
                          senderName: message.reply_to.sender_name,
                          senderId: message.reply_to.sender_id,
                        }
                      : null
                  }
                  onReply={
                    message.is_system_message
                      ? undefined
                      : (target) => {
                          setReplyDraft(target)
                        }
                  }
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {!hideComposer && (
        <MessengerTypingBar
          onSend={handleSendMessage}
          onComposerFocus={handleComposerFocus}
          onComposerBlur={handleComposerBlur}
          replyDraft={
            replyDraft
              ? {
                  id: replyDraft.id,
                  content: replyDraft.content,
                  senderName: replyDraft.senderName,
                }
              : null
          }
          onCancelReply={() => setReplyDraft(null)}
          placeholder={
            isBlocked
              ? 'This user has been blocked. To send a message, unblock them.'
              : isMessagingDisabledByPrivacy
                ? 'Messaging is disabled by privacy settings.'
                : 'Type a message...'
          }
          disabled={isBlocked || isMessagingDisabledByPrivacy}
        />
      )}
    </div>
  )
}
