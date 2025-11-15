'use client'

import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Search, X, Users, Check, Loader2 } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

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
  initialMode?: 'individual' | 'group'
}

export function NewChatModal({ isOpen, onClose, user, initialMode }: NewChatModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isGroupMode, setIsGroupMode] = useState(initialMode === 'group')

  useEffect(() => {
    if (isOpen) {
      loadMatches()
      setSelectedMatches(new Set())
      setGroupName('')
      setIsGroupMode(initialMode === 'group' || false)
      setSearchQuery('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMode, user.id])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      // Fetch matches from chat_members table (users you've actually matched and accepted with)
      const { data: memberships, error: membershipsError } = await supabase
        .from('chat_members')
        .select('chat_id, user_id')
        .eq('user_id', user.id)

      if (membershipsError) {
        console.error('Error loading chat memberships:', membershipsError)
        setMatches([])
        setIsLoading(false)
        return
      }

      if (!memberships || memberships.length === 0) {
        setMatches([])
        setIsLoading(false)
        return
      }

      const chatIds = memberships.map(m => m.chat_id)

      // Fetch chats to get other participants (only individual chats)
      const { data: chatRooms, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          is_group,
          chat_members!inner(user_id)
        `)
        .in('id', chatIds)
        .eq('is_group', false) // Only individual chats for matches

      if (chatsError) {
        console.error('Error loading chats:', chatsError)
        setMatches([])
        setIsLoading(false)
        return
      }

      // Get other user IDs from chat members
      const otherUserIds = new Set<string>()
      chatRooms?.forEach((room: any) => {
        room.chat_members?.forEach((member: any) => {
          if (member.user_id !== user.id) {
            otherUserIds.add(member.user_id)
          }
        })
      })

      if (otherUserIds.size === 0) {
        setMatches([])
        setIsLoading(false)
        return
      }

      // Fetch profiles for other users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, program, university_id, universities(name)')
        .in('user_id', Array.from(otherUserIds))

      // Fetch match suggestion data for compatibility scores
      const userIdsArray = Array.from(otherUserIds)
      const now = new Date().toISOString()
      const { data: suggestions } = await supabase
        .from('match_suggestions')
        .select('member_ids, fit_score')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])
        .neq('status', 'rejected')
        .gte('expires_at', now) // Only non-expired suggestions

      // Create a map of user_id to match score
      const matchScoreMap = new Map<string, number>()
      suggestions?.forEach((s: any) => {
        const memberIds = s.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) return
        
        // Find the other user (not the current user)
        const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        if (userIdsArray.includes(otherUserId)) {
          matchScoreMap.set(otherUserId, Number(s.fit_score || 0))
        }
      })

      // Format matches - ensure no user codes are displayed
      const formattedMatches = (profiles || []).map((profile: any) => {
        // Construct name from first_name and last_name only - never use user_id
        const firstName = profile.first_name?.trim() || ''
        const lastName = profile.last_name?.trim() || ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
        const score = matchScoreMap.get(profile.user_id) || 0
        
        // Ensure we never expose user_id in the UI - only use it as internal identifier
        return {
          match_user_id: profile.user_id, // Internal use only - never displayed
          name: fullName, // Only display name
          university_name: profile.universities?.name || 'University',
          program_name: profile.program || 'Program',
          compatibility_score: score
        }
      }).sort((a, b) => b.compatibility_score - a.compatibility_score) // Sort by score descending

      setMatches(formattedMatches)
    } catch (error) {
      console.error('Failed to load matches:', error)
      setMatches([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.program_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleMatchSelection = (matchId: string, e?: MouseEvent) => {
    // Prevent event propagation to avoid any conflicts
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setSelectedMatches(prev => {
      const newSelected = new Set(prev)
      
      if (newSelected.has(matchId)) {
        // Deselect if already selected
        newSelected.delete(matchId)
      } else {
        // Select logic
        if (isGroupMode) {
          // Group mode: allow multiple selections (up to 5)
          if (newSelected.size >= 5) {
            alert('Maximum 5 people allowed in a group')
            return prev // Return previous state if limit reached
          }
          newSelected.add(matchId)
        } else {
          // Individual mode: clear and select only this one
          newSelected.clear()
          newSelected.add(matchId)
        }
      }
      
      return newSelected
    })
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

    if (isGroupMode && selectedMatches.size > 5) {
      alert('Maximum 5 people allowed in a group')
      return
    }

    setIsCreatingChat(true)
    try {
      const selectedUserIds = Array.from(selectedMatches)
      
      if (isGroupMode) {
        // Create group chat
        const response = await fetchWithCSRF('/api/chat/create-group', {
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
        const response = await fetchWithCSRF('/api/chat/get-or-create', {
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
              ? 'Select up to 5 people to create a group chat'
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
                setSearchQuery('')
                // Reload matches when switching to individual mode
                loadMatches()
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
                setSearchQuery('')
                // Reload matches when switching to group mode
                loadMatches()
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
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleMatchSelection(match.match_user_id, e)
                    }}
                    type="button"
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedMatches.size >= 5 && (
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
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No matches available. Complete your profile to get matched!
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No matches found matching your search
              </div>
            ) : (
              <div className="divide-y">
                {filteredMatches.map((match) => {
                  const isSelected = selectedMatches.has(match.match_user_id)
                  
                  return (
                    <button
                      key={match.match_user_id}
                      onClick={(e) => toggleMatchSelection(match.match_user_id, e)}
                      type="button"
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
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
                            {Math.round(match.compatibility_score * 100)}
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
                  {selectedMatches.size} of 5 selected
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

