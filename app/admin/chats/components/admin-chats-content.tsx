'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, MessageSquare, Download, X, Eye, RefreshCw, Search } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { ChatFilters } from './chat-filters'
import { useDebounce } from '@/hooks/use-debounce'
import { Input } from '@/components/ui/input'

interface Chat {
  id: string
  is_group: boolean
  group_id?: string
  created_by: string
  created_at: string
  member_count: number
  members: Array<{
    id: string
    name: string
    email: string
  }>
  message_count: number
  unread_counts: Array<{
    user_id: string
    count: number
  }>
}

interface Message {
  id: string
  user_id: string
  user_name: string
  user_email: string
  content: string
  created_at: string
  timestamp: string
}

interface FilterMetadata {
  types: string[]
  createdMonths: string[]
}

export function AdminChatsContent() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [total, setTotal] = useState(0)
  const [filterMetadata, setFilterMetadata] = useState<FilterMetadata | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<{
    types: string[]
    createdMonths: string[]
  }>({
    types: [],
    createdMonths: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (filterMetadata !== null) {
      // Only reload when filters change after initial load
      loadChats(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters])

  useEffect(() => {
    // Reload when search query changes (debounced)
    if (filterMetadata !== null) {
      loadChats(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery])

  const loadChats = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    try {
      // Build query params with filters
      const params = new URLSearchParams()
      params.append('limit', '100')
      
      if (selectedFilters.types.length > 0) {
        params.append('types', selectedFilters.types.join(','))
      }
      if (selectedFilters.createdMonths.length > 0) {
        params.append('createdMonths', selectedFilters.createdMonths.join(','))
      }
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim())
      }

      const response = await fetch(`/api/admin/chats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
        setTotal(data.total || 0)
        if (data.filterMetadata) {
          setFilterMetadata(data.filterMetadata)
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
      showErrorToast('Failed to load chats')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleViewChat = async (chat: Chat) => {
    setSelectedChat(chat)
    setShowViewDialog(true)
    setIsLoadingMessages(true)
    
    try {
      const response = await fetch(`/api/admin/chats/${chat.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        showErrorToast('Failed to load messages')
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      showErrorToast('Failed to load messages')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleExport = async (chatId: string) => {
    setIsExporting(chatId)
    try {
      const response = await fetch(`/api/admin/chats/export?chatId=${chatId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat-export-${chatId}-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showSuccessToast('Chat logs exported successfully')
      } else {
        const errorData = await response.json().catch(() => ({}))
        showErrorToast(errorData.error || 'Failed to export chat logs')
      }
    } catch (error) {
      console.error('Failed to export chat:', error)
      showErrorToast('Failed to export chat logs')
    } finally {
      setIsExporting(null)
    }
  }

  const handleCloseChat = async () => {
    if (!selectedChat) return

    setIsClosing(true)
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          chatId: selectedChat.id
        })
      })

      if (response.ok) {
        showSuccessToast('Chat closed successfully. Users can no longer send messages.')
        setShowCloseDialog(false)
        setSelectedChat(null)
        loadChats()
      } else {
        const errorData = await response.json().catch(() => ({}))
        showErrorToast(errorData.error || 'Failed to close chat')
      }
    } catch (error) {
      console.error('Failed to close chat:', error)
      showErrorToast('Failed to close chat')
    } finally {
      setIsClosing(false)
    }
  }

  const columns = [
    {
      header: 'Room ID',
      accessor: (row: Chat) => (
        <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      header: 'Type',
      accessor: (row: Chat) => {
        // Determine type based on actual participant count
        // Individual = 2 people, Group = 3 or more
        const actualMembers = row.members || []
        const participantCount = actualMembers.length > 0 ? actualMembers.length : (row.member_count || 0)
        const isGroup = participantCount >= 3
        
        return (
          <span className="text-sm font-medium">
            {isGroup ? 'Group' : 'Individual'}
          </span>
        )
      },
      tooltip: 'Chat type: Individual (2 people) or Group (3 or more people)'
    },
    {
      header: 'Participants',
      accessor: (row: Chat) => {
        // Use the actual members array length if available, otherwise use member_count
        // This ensures we show the correct count even if member_count is 0
        const actualMembers = row.members || []
        const participantCount = actualMembers.length > 0 ? actualMembers.length : (row.member_count || 0)
        
        return (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
              </span>
            </div>
            {actualMembers.length > 0 ? (
              <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1 max-h-32 overflow-y-auto border-t pt-1">
                {actualMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{m.name || 'Unknown'}</span>
                    <span className="text-gray-500 text-xs">({m.email || 'No email'})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic mt-1">No participants found</div>
            )}
          </div>
        )
      },
      tooltip: 'All participants in this chat room. For 1-on-1 chats, shows both users (minimum 2). For group chats, shows all group members (up to 6).'
    },
    {
      header: 'Messages',
      accessor: (row: Chat) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span>{row.message_count}</span>
        </div>
      )
    },
    {
      header: 'Unread',
      accessor: (row: Chat) => {
        const totalUnread = row.unread_counts.reduce((sum, u) => sum + u.count, 0)
        return totalUnread > 0 ? (
          <Badge variant="destructive">{totalUnread}</Badge>
        ) : (
          <span className="text-gray-400">0</span>
        )
      }
    },
    {
      header: 'Created',
      accessor: (row: Chat) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: (row: Chat) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewChat(row)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport(row.id)}
            disabled={isExporting === row.id}
          >
            <Download className={`h-3 w-3 mr-1 ${isExporting === row.id ? 'animate-spin' : ''}`} />
            {isExporting === row.id ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedChat(row)
              setShowCloseDialog(true)
            }}
            disabled={row.member_count === 0}
          >
            <X className="h-3 w-3 mr-1" />
            Close
          </Button>
        </div>
      ),
      tooltip: 'Available actions: "View" shows all messages in the chat, "Export" downloads a comprehensive chat log, and "Close" terminates the chat (prevents all users from sending further messages).'
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage chat rooms ({total} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChatFilters
            filters={filterMetadata}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
          <Button onClick={() => loadChats(true)} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chats</CardTitle>
          <CardDescription>All chat rooms in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Custom Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by room ID or participant name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            
            <DataTable
              columns={columns}
              data={chats}
              pageSize={20}
            />
          </div>
        </CardContent>
      </Card>

      {/* View Chat Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat Messages</DialogTitle>
            <DialogDescription>
              Complete message history for this chat room
              {selectedChat && (
                <div className="mt-2 space-y-1">
                  <p><strong>Chat ID:</strong> <span className="font-mono text-xs">{selectedChat.id}</span></p>
                  <p><strong>Type:</strong> {selectedChat.is_group ? 'Group Chat' : '1-on-1 Chat'}</p>
                  <p><strong>Participants:</strong> {selectedChat.members.map(m => m.name || m.email).join(', ')}</p>
                  <p><strong>Total Messages:</strong> {messages.length}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages in this chat.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.user_name}</span>
                        <span className="text-xs text-gray-500">({msg.user_email})</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(msg.created_at).toLocaleString()}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {msg.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedChat && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewDialog(false)
                  handleExport(selectedChat.id)
                }}
                disabled={isExporting === selectedChat.id}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat Log
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Chat Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Chat?</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-2">
                <p>
                  Are you sure you want to close this chat? This will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Remove all participants from the chat</li>
                  <li>Prevent all users from sending further messages</li>
                  <li>Effectively terminate the chat room</li>
                </ul>
                <p className="text-red-600 dark:text-red-400 font-medium mt-2">
                  This action cannot be undone. Users will not be able to send messages to each other after this.
                </p>
                {selectedChat && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <p className="text-sm"><strong>Chat ID:</strong> <span className="font-mono text-xs">{selectedChat.id}</span></p>
                    <p className="text-sm"><strong>Participants:</strong> {selectedChat.members.map(m => m.name || m.email).join(', ')}</p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloseChat} disabled={isClosing}>
              {isClosing ? 'Closing...' : 'Close Chat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
