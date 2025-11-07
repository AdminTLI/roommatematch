'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Search, X, Users, Check, Loader2 } from 'lucide-react'

interface Match {
  match_user_id: string
  name: string
  university_name: string
  program_name: string
  compatibility_score: number
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

export function NewChatModal({ isOpen, onClose, user }: NewChatModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isGroupMode, setIsGroupMode] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMatches()
      setSelectedMatches(new Set())
      setGroupName('')
      setIsGroupMode(false)
      setSearchQuery('')
    }
  }, [isOpen])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_user_matches', {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
        p_university_ids: null,
        p_degree_levels: null,
        p_program_ids: null,
        p_study_years: null
      })

      if (error) {
        console.error('Error loading matches:', error)
        return
      }

      if (data) {
        setMatches(data.map((match: any) => ({
          match_user_id: match.match_user_id,
          name: match.name || 'User',
          university_name: match.university_name || 'University',
          program_name: match.program_name || 'Program',
          compatibility_score: match.compatibility_score || 0
        })))
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.program_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleMatchSelection = (matchId: string) => {
    const newSelected = new Set(selectedMatches)
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId)
    } else {
      if (isGroupMode) {
        if (newSelected.size >= 6) {
          alert('Maximum 6 people allowed in a group')
          return
        }
      } else {
        // For individual chat, clear selection and select only this one
        newSelected.clear()
      }
      newSelected.add(matchId)
    }
    setSelectedMatches(newSelected)
  }

  const handleCreateChat = async () => {
    if (selectedMatches.size === 0) {
      alert('Please select at least one person to chat with')
      return
    }

    if (isGroupMode && selectedMatches.size < 2) {
      alert('Please select at least 2 people for a group chat')
      return
    }

    if (isGroupMode && selectedMatches.size > 6) {
      alert('Maximum 6 people allowed in a group')
      return
    }

    setIsCreatingChat(true)
    try {
      const selectedUserIds = Array.from(selectedMatches)
      
      if (isGroupMode) {
        // Create group chat
        const response = await fetch('/api/chat/create-group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            member_ids: selectedUserIds,
            name: groupName || undefined
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create group chat')
        }

        const { chat_id } = await response.json()
        router.push(`/chat/${chat_id}`)
      } else {
        // Create individual chat
        const otherUserId = selectedUserIds[0]
        const response = await fetch('/api/chat/get-or-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            other_user_id: otherUserId
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create chat')
        }

        const { chat_id } = await response.json()
        router.push(`/chat/${chat_id}`)
      }

      onClose()
    } catch (error: any) {
      console.error('Failed to create chat:', error)
      alert(error.message || 'Failed to create chat. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  const selectedMatchesList = Array.from(selectedMatches).map(id => 
    matches.find(m => m.match_user_id === id)
  ).filter(Boolean) as Match[]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isGroupMode ? 'Create Group Chat' : 'New Chat'}
          </DialogTitle>
          <DialogDescription>
            {isGroupMode 
              ? 'Select up to 6 people to create a group chat'
              : 'Select a person to start a conversation'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!isGroupMode ? 'default' : 'outline'}
              onClick={() => {
                setIsGroupMode(false)
                setSelectedMatches(new Set())
                setGroupName('')
              }}
              className="flex-1"
            >
              Individual Chat
            </Button>
            <Button
              variant={isGroupMode ? 'default' : 'outline'}
              onClick={() => {
                setIsGroupMode(true)
                setSelectedMatches(new Set())
              }}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Group Chat
            </Button>
          </div>

          {/* Group Name Input (only for group mode) */}
          {isGroupMode && selectedMatches.size > 0 && (
            <div>
              <Input
                placeholder="Group name (optional)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          {/* Selected Matches Display (for group mode) */}
          {isGroupMode && selectedMatchesList.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
              {selectedMatchesList.map((match) => (
                <Badge
                  key={match.match_user_id}
                  variant="secondary"
                  className="flex items-center gap-2 pr-1"
                >
                  {match.name}
                  <button
                    onClick={() => toggleMatchSelection(match.match_user_id)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedMatches.size >= 6 && (
                <Badge variant="outline" className="text-xs">
                  Maximum reached
                </Badge>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Matches List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? 'No matches found' : 'No matches available'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredMatches.map((match) => {
                  const isSelected = selectedMatches.has(match.match_user_id)
                  const isDisabled = !isGroupMode && selectedMatches.size > 0 && !isSelected
                  
                  return (
                    <button
                      key={match.match_user_id}
                      onClick={() => toggleMatchSelection(match.match_user_id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg font-semibold">
                          {match.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {match.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(match.compatibility_score * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {match.program_name} • {match.university_name}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {isGroupMode && (
                <span>
                  {selectedMatches.size} of 6 selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateChat}
                disabled={selectedMatches.size === 0 || isCreatingChat}
              >
                {isCreatingChat ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {isGroupMode ? 'Create Group' : 'Start Chat'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

