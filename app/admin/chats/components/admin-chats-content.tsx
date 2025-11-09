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
import { Users, MessageSquare, Download, X } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

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

export function AdminChatsContent() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/chats?limit=100')
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
      showErrorToast('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (chatId: string) => {
    try {
      const response = await fetch(`/api/admin/chats/export?chatId=${chatId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat-${chatId}-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showSuccessToast('Chat logs exported successfully')
      } else {
        showErrorToast('Failed to export chat logs')
      }
    } catch (error) {
      console.error('Failed to export chat:', error)
      showErrorToast('Failed to export chat logs')
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
        showSuccessToast('Chat closed successfully')
        setShowCloseDialog(false)
        setSelectedChat(null)
        loadChats()
      } else {
        showErrorToast('Failed to close chat')
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
      accessor: (row: Chat) => (
        <Badge variant={row.is_group ? 'default' : 'outline'}>
          {row.is_group ? 'Group' : '1-on-1'}
        </Badge>
      )
    },
    {
      header: 'Members',
      accessor: (row: Chat) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{row.member_count}</span>
          <div className="flex flex-col text-xs text-gray-500">
            {row.members.slice(0, 2).map(m => (
              <span key={m.id}>{m.name}</span>
            ))}
            {row.members.length > 2 && (
              <span>+{row.members.length - 2} more</span>
            )}
          </div>
        </div>
      )
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
            onClick={() => handleExport(row.id)}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedChat(row)
              setShowCloseDialog(true)
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Close
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage chat rooms ({total} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chats</CardTitle>
          <CardDescription>All chat rooms in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={chats}
            searchKey="id"
            searchPlaceholder="Search by room ID..."
            pageSize={20}
          />
        </CardContent>
      </Card>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Chat?</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this chat? This will remove all participants and effectively archive the chat.
              This action cannot be undone.
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
