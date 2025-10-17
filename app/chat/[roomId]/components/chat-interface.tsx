'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

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

  useEffect(() => {
    loadChatData()
    setupRealtimeSubscription()
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatData = async () => {
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

      // Load chat room details and participants
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          type,
          created_at,
          participants:chat_room_participants(
            user_id,
            profiles!inner(
              full_name,
              user_id
            )
          )
        `)
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          read_by,
          profiles!inner(
            full_name
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // Transform messages data
      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.profiles.full_name,
        created_at: msg.created_at,
        read_by: msg.read_by || [],
        is_own: msg.sender_id === user.id
      }))

      // Transform participants data
      const transformedMembers: ChatMember[] = (roomData.participants || []).map(participant => ({
        id: participant.user_id,
        name: participant.profiles.full_name,
        is_online: true // This would need real-time presence tracking
      }))

      setMessages(transformedMessages)
      setMembers(transformedMembers)
      
    } catch (error) {
      console.error('Failed to load chat data:', error)
      setError('Failed to load chat messages')
      // Fallback to mock data on error
      setMessages(mockMessages)
      setMembers(mockMembers)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        const newMessage = payload.new as any
        setMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          sender_id: newMessage.sender_id,
          sender_name: 'Unknown', // Would need to fetch from profiles
          created_at: newMessage.created_at,
          read_by: newMessage.read_by || [],
          is_own: newMessage.sender_id === user.id
        }])
      })
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState()
        const typingUsers = Object.keys(state).filter(userId => 
          userId !== user.id && state[userId]?.[0]?.typing
        )
        setTypingUsers(typingUsers)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(typingChannel)
    }
  }

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
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
      
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const containsLinks = (text: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i
    return urlRegex.test(text)
  }

  const handleTyping = () => {
    // Send typing indicator
    const channel = supabase.channel(`typing:${roomId}`)
    
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
              Roommate Chat
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {members.length} members
              </span>
            </div>
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

      {/* Chat Members */}
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
              messages.map((message) => (
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
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
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
                      {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
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
