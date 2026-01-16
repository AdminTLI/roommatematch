'use client'

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { MessengerMessageBubble } from './messenger-message-bubble'
import { MessengerTypingBar } from './messenger-typing-bar'
import { cn } from '@/lib/utils'

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

      // Transform messages with sender names
      const formattedMessages: Message[] = reversedMessages.map(msg => {
        const profile = newProfilesMap.get(msg.user_id)
        const senderName = profile
          ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
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

  // Setup real-time subscription
  useEffect(() => {
    if (!chatId) return

    // Reset loading state when chatId changes
    if (lastLoadedChatIdRef.current !== chatId) {
      lastLoadedChatIdRef.current = null
      isLoadingMessagesRef.current = false
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

  // Auto-scroll on initial load only
  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0 && !userScrolledUp) {
      scrollToBottom(true)
    }
  }, [isLoading, messages.length, scrollToBottom, userScrolledUp])

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetchWithCSRF('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, content })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
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
            <AvatarImage src={partnerAvatar} />
            <AvatarFallback className="bg-purple-600 text-white">
              {partnerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {partnerName}
            </h2>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleProfile}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Button>
      </div>

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
        placeholder="Type a message..."
      />
    </div>
  )
}
