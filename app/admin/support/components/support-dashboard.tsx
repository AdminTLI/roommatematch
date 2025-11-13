'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Search,
  Filter,
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Send,
  Loader2,
  User,
  Mail,
  Calendar,
  Tag
} from 'lucide-react'

interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: 'technical' | 'account' | 'matching' | 'payment' | 'safety' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  user_id: string
  university_id?: string
  assigned_to?: string
  assigned_at?: string
  resolution?: string
  resolved_at?: string
  resolved_by?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  closed_at?: string
  user?: {
    email: string
    first_name?: string
    last_name?: string
  }
}

interface TicketMessage {
  id: string
  message: string
  message_type: 'user' | 'admin' | 'system'
  sender_id?: string
  sender_name?: string
  sender_email?: string
  is_internal: boolean
  created_at: string
}

interface SupportDashboardProps {
  admin: {
    id: string
    university_id: string
    role: string
    permissions: string[]
  }
}

export function SupportDashboard({ admin }: SupportDashboardProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technical' | 'account' | 'matching' | 'payment' | 'safety' | 'other'>('all')
  const [newMessage, setNewMessage] = useState('')
  const [newResolution, setNewResolution] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter)
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/support/tickets?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }
      const data = await response.json()
      setTickets(data.data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a ticket
  const fetchMessages = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data.data?.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Update ticket status
  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!selectedTicket) return
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          resolution: status === 'resolved' || status === 'closed' ? newResolution : undefined
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update ticket status')
      }
      await fetchTickets()
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id)
      if (updatedTicket) {
        setSelectedTicket({ ...updatedTicket, status, resolution: newResolution || updatedTicket.resolution })
      }
      if (status === 'resolved' || status === 'closed') {
        setNewResolution('')
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
      alert('Failed to update ticket status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return
    setSendingMessage(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage, is_internal: false })
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      const data = await response.json()
      setMessages([...messages, data.data])
      setNewMessage('')
      await fetchTickets()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Select ticket
  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    await fetchMessages(ticket.id)
  }

  // Get status badge
  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Open</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">In Progress</Badge>
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">Resolved</Badge>
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">Closed</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Get category badge
  const getCategoryBadge = (category: SupportTicket['category']) => {
    return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">{category}</Badge>
  }

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Load tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [statusFilter, priorityFilter, categoryFilter])

  // Auto-refresh messages for selected ticket
  useEffect(() => {
    if (selectedTicket) {
      const interval = setInterval(() => {
        fetchMessages(selectedTicket.id)
        fetchTickets()
      }, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)
      return () => {
        if (interval) clearInterval(interval)
      }
    } else {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [selectedTicket])

  // Get ticket statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">Support Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground mt-2">
          Manage support tickets and help users resolve their issues.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tickets</CardTitle>
              <CardDescription className="mt-2">
                Filter and search tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="matching">Matching</option>
                    <option value="payment">Payment</option>
                    <option value="safety">Safety</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No tickets found</p>
                </div>
              ) : (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            #{ticket.ticket_number}
                          </p>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {getPriorityBadge(ticket.priority)}
                        {getCategoryBadge(ticket.category)}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      Ticket #{selectedTicket.ticket_number} • {new Date(selectedTicket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </CardDescription>
                    {selectedTicket.user && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{selectedTicket.user.first_name} {selectedTicket.user.last_name}</span>
                        <Mail className="w-4 h-4 ml-2" />
                        <span>{selectedTicket.user.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                    {getCategoryBadge(selectedTicket.category)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Description */}
                <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm font-medium text-gray-900 dark:text-foreground mb-2">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Messages */}
                <div className="border-t p-4 space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.message_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.message_type === 'admin'
                            ? 'bg-blue-600 text-white'
                            : message.message_type === 'user'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-foreground'
                            : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.sender_name || 'System'} • {new Date(message.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resolution */}
                {selectedTicket.resolution && (
                  <div className="border-t dark:border-gray-700 p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">Resolution</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">{selectedTicket.resolution}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'cancelled' && (
                  <div className="border-t p-4 space-y-4">
                    {/* Status Update */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Update Status</label>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateStatus('in_progress')}
                          disabled={updatingStatus || selectedTicket.status === 'in_progress'}
                          size="sm"
                          variant="outline"
                        >
                          Mark In Progress
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus('resolved')}
                          disabled={updatingStatus || selectedTicket.status === 'resolved'}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50"
                        >
                          Resolve
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus('closed')}
                          disabled={updatingStatus || selectedTicket.status === 'closed'}
                          size="sm"
                          variant="outline"
                          className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Close
                        </Button>
                      </div>
                    </div>

                    {/* Resolution Input */}
                    {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && !selectedTicket.resolution && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Resolution</label>
                        <Textarea
                          value={newResolution}
                          onChange={(e) => setNewResolution(e.target.value)}
                          placeholder="Describe how the issue was resolved..."
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Message Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Reply</label>
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          rows={3}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="self-end"
                        >
                          {sendingMessage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a ticket to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

