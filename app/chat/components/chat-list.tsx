'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Video
} from 'lucide-react'

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
}

interface ChatListProps {
  user: User
}

export function ChatList({ user }: ChatListProps) {
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const router = useRouter()
  const supabase = createClient()

  // Demo chat data
  const demoChats: ChatRoom[] = [
    {
      id: 'chat-1',
      name: 'Emma van der Berg',
      type: 'individual',
      lastMessage: {
        content: 'Hey! I saw your profile and we have so much in common. Would you like to chat about potentially living together?',
        sender: 'Emma van der Berg',
        timestamp: '2 hours ago',
        isRead: false
      },
      participants: [
        {
          id: 'user-1',
          name: 'Emma van der Berg',
          avatar: '/avatars/emma.jpg',
          isOnline: true
        }
      ],
      unreadCount: 2,
      isActive: false
    },
    {
      id: 'chat-2',
      name: 'Study Group - UvA CS',
      type: 'group',
      lastMessage: {
        content: 'Lucas: Anyone interested in finding a shared apartment near the Science Park?',
        sender: 'Lucas',
        timestamp: '1 day ago',
        isRead: true
      },
      participants: [
        {
          id: 'user-2',
          name: 'Lucas',
          avatar: '/avatars/lucas.jpg',
          isOnline: false
        },
        {
          id: 'user-3',
          name: 'Sophie',
          avatar: '/avatars/sophie.jpg',
          isOnline: true
        },
        {
          id: 'user-4',
          name: 'Alex',
          avatar: '/avatars/alex.jpg',
          isOnline: false
        }
      ],
      unreadCount: 0,
      isActive: false
    },
    {
      id: 'chat-3',
      name: 'Marcus Johnson',
      type: 'individual',
      lastMessage: {
        content: 'Thanks for the great conversation! I think we could be great roommates.',
        sender: 'Marcus Johnson',
        timestamp: '3 days ago',
        isRead: true
      },
      participants: [
        {
          id: 'user-5',
          name: 'Marcus Johnson',
          avatar: '/avatars/marcus.jpg',
          isOnline: false
        }
      ],
      unreadCount: 0,
      isActive: false
    }
  ]

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    
    try {
      // For demo mode, use mock data directly
      if (user.id === 'demo-user-id') {
        setTimeout(() => {
          setChats(demoChats)
          setIsLoading(false)
        }, 1000)
        return
      }

      // In a real app, this would fetch from Supabase
      // For demo, we'll use mock data
      setTimeout(() => {
        setChats(demoChats)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to load chats:', error)
      setChats(demoChats) // Fallback to demo data
      setIsLoading(false)
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const handleNewChat = () => {
    // In a real app, this would open a modal to start a new chat
    console.log('Start new chat')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with your potential roommates
            </p>
          </div>
          <Button onClick={handleNewChat} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No conversations found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation with your matches'}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewChat}>
                  Start New Chat
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredChats.map((chat) => (
            <Card 
              key={chat.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                chat.isActive ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleChatClick(chat.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {chat.type === 'individual' ? (
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={chat.participants[0]?.avatar} />
                        <AvatarFallback>
                          {chat.participants[0]?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="relative w-12 h-12">
                        <Avatar className="w-8 h-8 absolute top-0 left-0">
                          <AvatarImage src={chat.participants[0]?.avatar} />
                          <AvatarFallback>
                            {chat.participants[0]?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 absolute bottom-0 right-0">
                          <AvatarImage src={chat.participants[1]?.avatar} />
                          <AvatarFallback>
                            {chat.participants[1]?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    {chat.participants.some(p => p.isOnline) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {chat.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {chat.type === 'group' && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Group
                          </Badge>
                        )}
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {chat.lastMessage.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {chat.lastMessage && (
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${
                          !chat.lastMessage.isRead 
                            ? 'font-medium text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          <span className="font-medium">{chat.lastMessage.sender}:</span> {chat.lastMessage.content}
                        </p>
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground">
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
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Group Chats</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Find study groups and roommates
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Direct Messages</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              One-on-one conversations
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Video Calls</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Meet face-to-face safely
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
