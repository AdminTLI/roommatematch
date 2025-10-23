'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    
    try {
      // Fetch real chats from database
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            profiles(first_name, avatar_url)
          ),
          chat_messages(
            content,
            created_at,
            sender_id
          )
        `)
        .contains('chat_participants.user_id', [user.id])
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transform database results to ChatRoom format
      const transformedChats: ChatRoom[] = (chatRooms || []).map((room: any) => ({
        id: room.id,
        name: room.name || 'Chat',
        type: room.type || 'individual',
        lastMessage: room.chat_messages?.[0] ? {
          content: room.chat_messages[0].content,
          sender: room.chat_messages[0].sender_id,
          timestamp: new Date(room.chat_messages[0].created_at).toLocaleString(),
          isRead: true
        } : undefined,
        participants: room.chat_participants?.map((p: any) => ({
          id: p.user_id,
          name: p.profiles?.first_name || 'User',
          avatar: p.profiles?.avatar_url,
          isOnline: false
        })) || [],
        unreadCount: 0,
        isActive: false
      }))

      setChats(transformedChats)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load chats:', error)
      setChats([])
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
    <div className="max-w-4xl mx-auto space-y-8">
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

      {/* Chat List */}
      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-h3 text-gray-900 mb-2">
                No conversations found
              </h3>
              <p className="text-body text-gray-600 mb-6">
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
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                chat.isActive ? 'ring-2 ring-primary-600' : ''
              }`}
              onClick={() => handleChatClick(chat.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {chat.type === 'individual' ? (
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={chat.participants[0]?.avatar} />
                        <AvatarFallback className="text-lg font-semibold">
                          {chat.participants[0]?.name?.charAt(0) || '?'}
                        </AvatarFallback>
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
                          <Badge className="bg-primary-600 text-white">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-secondary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Video Calls</h3>
            <p className="text-body-sm text-gray-600">
              Meet face-to-face safely
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}