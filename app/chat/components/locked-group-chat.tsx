'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lock, 
  Users, 
  Check, 
  X, 
  Clock, 
  Info,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { createClient } from '@/lib/supabase/client'
import { GroupCompatibilityDisplay } from './group-compatibility-display'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Member {
  user_id: string
  name: string
  program: string
  university: string
  status: 'pending' | 'accepted' | 'rejected'
  compatibility?: {
    compatibility_score: number
    personality_score: number
    schedule_score: number
    lifestyle_score: number
    social_score: number
    academic_bonus: number
    top_alignment: string
    watch_out: string
    house_rules_suggestion?: string
  }
}

interface LockedGroupChatProps {
  chatId: string
  userId: string
  onUnlock?: () => void
}

export function LockedGroupChat({ chatId, userId, onUnlock }: LockedGroupChatProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState({ total: 0, accepted: 0, pending: 0, rejected: 0 })
  const [groupCompatibility, setGroupCompatibility] = useState<any>(null)
  const [lockReason, setLockReason] = useState<string | null>(null)
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [pairwiseMatches, setPairwiseMatches] = useState<any[]>([])
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    loadLockedGroupData()
    loadPairwiseMatches()
  }, [chatId, userId])

  const loadPairwiseMatches = async () => {
    try {
      const response = await fetch(`/api/chat/pairwise-match?chatId=${chatId}`)
      if (response.ok) {
        const { pairwise_matches } = await response.json()
        setPairwiseMatches(pairwise_matches || [])
      }
    } catch (error) {
      console.error('Failed to load pairwise matches:', error)
    }
  }

  const loadLockedGroupData = async () => {
    setIsLoading(true)
    try {
      // Load chat info
      const supabase = createClient()
      const { data: chat } = await supabase
        .from('chats')
        .select('is_locked, lock_reason, lock_expires_at, name, group_intent, created_by')
        .eq('id', chatId)
        .single()

      if (chat) {
        setLockReason(chat.lock_reason)
        setLockExpiresAt(chat.lock_expires_at)
        setIsCreator(chat.created_by === userId)
      }

      // Load group compatibility
      const compatResponse = await fetch(`/api/chat/groups?chatId=${chatId}&action=compatibility`)
      if (compatResponse.ok) {
        const { compatibility } = await compatResponse.json()
        setGroupCompatibility(compatibility)
      }

      // Load all members including creator (for display)
      const { data: chatMembers } = await supabase
        .from('chat_members')
        .select(`
          user_id,
          status,
          profiles!chat_members_user_id_fkey (
            first_name,
            last_name,
            program,
            universities!profiles_university_id_fkey (
              name
            )
          )
        `)
        .eq('chat_id', chatId)
        .in('status', ['active', 'invited'])

      // Get compatibility scores using the API endpoint
      const otherMemberIds = chatMembers?.filter(m => m.user_id !== userId).map(m => m.user_id) || []
      const pairwiseScores: Record<string, any> = {}

      // Use the members-preview API which already computes compatibility
      const membersResponse = await fetch(`/api/chat/groups?chatId=${chatId}&action=members-preview`)
      if (membersResponse.ok) {
        const { members: membersWithCompat } = await membersResponse.json()
        membersWithCompat?.forEach((m: any) => {
          if (m.compatibility) {
            pairwiseScores[m.user_id] = m.compatibility
          }
        })
      }

      // Format members
      const formattedMembers: Member[] = (chatMembers || [])
        .filter(m => m.user_id !== userId) // Exclude self from the list
        .map(m => ({
          user_id: m.user_id,
          name: [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || 'User',
          program: m.profiles?.program || 'Program',
          university: m.profiles?.universities?.name || 'University',
          status: m.status as 'pending' | 'accepted' | 'rejected',
          compatibility: pairwiseScores[m.user_id] || null
        }))

      setMembers(formattedMembers)

      // Load pairwise match progress
      const progressResponse = await fetch(`/api/chat/pairwise-match?chatId=${chatId}`)
      if (progressResponse.ok) {
        const { progress: progressData } = await progressResponse.json()
        if (progressData) {
          setProgress({
            total: progressData.total_pairs || 0,
            accepted: progressData.accepted_pairs || 0,
            pending: progressData.pending_pairs || 0,
            rejected: progressData.rejected_pairs || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load locked group data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptReject = async (otherUserId: string, action: 'accept' | 'reject') => {
    setIsProcessing(otherUserId)
    try {
      const response = await fetchWithCSRF('/api/chat/pairwise-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          other_user_id: otherUserId,
          action
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process match')
      }

      const { progress: newProgress, can_unlock } = await response.json()
      
      if (newProgress) {
        setProgress({
          total: newProgress.total_pairs || 0,
          accepted: newProgress.accepted_pairs || 0,
          pending: newProgress.pending_pairs || 0,
          rejected: newProgress.rejected_pairs || 0
        })
      }

      // Reload members and pairwise matches to update status
      await loadLockedGroupData()
      await loadPairwiseMatches()

      // If unlocked, notify parent
      if (can_unlock && onUnlock) {
        setTimeout(() => {
          onUnlock()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Failed to process match:', error)
      alert(error.message || 'Failed to process match. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  const getMemberStatus = (memberId: string): 'pending' | 'accepted' | 'rejected' => {
    // Find pairwise match between current user and this member
    const userAId = userId < memberId ? userId : memberId
    const userBId = userId < memberId ? memberId : userId
    
    const match = pairwiseMatches.find(
      pm => pm.user_a_id === userAId && pm.user_b_id === userBId
    )
    
    if (!match) return 'pending'
    if (match.status === 'accepted') return 'accepted'
    if (match.status === 'rejected') return 'rejected'
    return 'pending'
  }

  const getTimeRemaining = () => {
    if (!lockExpiresAt) return null
    const expires = new Date(lockExpiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m remaining`
  }

  const handleCancelGroup = async () => {
    if (!confirm('Are you sure you want to cancel this group? All invitations will be cancelled and members will be notified.')) {
      return
    }

    setIsProcessing('cancel')
    try {
      const response = await fetchWithCSRF('/api/chat/groups/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel group')
      }

      alert('Group cancelled successfully')
      if (onUnlock) {
        onUnlock() // This will navigate away
      }
    } catch (error: any) {
      console.error('Failed to cancel group:', error)
      alert(error.message || 'Failed to cancel group. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading group information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Lock Status Banner */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Group Chat is Locked</p>
              <p className="text-sm text-gray-600 mt-1">
                All members must accept to match with each other before the group can unlock.
              </p>
              {lockReason && (
                <p className="text-sm text-orange-600 mt-1">{lockReason}</p>
              )}
            </div>
            {lockExpiresAt && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeRemaining()}</span>
                </div>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matching Progress</CardTitle>
          <CardDescription>
            {progress.accepted} of {progress.total} pairwise matches accepted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={(progress.accepted / progress.total) * 100} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Accepted: {progress.accepted}</span>
              <span>Pending: {progress.pending}</span>
              {progress.rejected > 0 && (
                <span className="text-orange-600">Rejected: {progress.rejected}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Compatibility Display */}
      {groupCompatibility && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Group Compatibility</CardTitle>
                <CardDescription>
                  How well this group works together
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompatibilityModal(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <GroupCompatibilityDisplay 
              compatibility={groupCompatibility}
              compact={true}
            />
            
            {/* Group Explanation */}
            {(groupCompatibility.member_deviations?.explanation || groupCompatibility.explanation) && (
              <div className="space-y-3 pt-4 border-t">
                {(() => {
                  const explanation = groupCompatibility.member_deviations?.explanation || groupCompatibility.explanation
                  if (!explanation) return null
                  
                  return (
                    <>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 mb-1">Why this group works:</p>
                        <p className="text-sm text-green-700">
                          {explanation.why_works}
                        </p>
                      </div>
                      
                      {explanation.why_doesnt_work && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-semibold text-orange-800 mb-1">Things to watch out for:</p>
                          <p className="text-sm text-orange-700">
                            {explanation.why_doesnt_work}
                          </p>
                        </div>
                      )}
                      
                      {explanation.suggestions && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 mb-1">Suggestions:</p>
                          <p className="text-sm text-blue-700">
                            {explanation.suggestions}
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Group Members</h3>
        <p className="text-sm text-gray-600 mb-4">
          {isCreator 
            ? 'View compatibility with each member. They need to accept to match with each other before the group unlocks.'
            : 'Review compatibility with each member and decide whether to match with them.'
          }
        </p>
        
        <div className="grid gap-4">
          {members.map((member) => {
            const isProcessingMember = isProcessing === member.user_id
            const memberStatus = getMemberStatus(member.user_id)
            
            return (
              <Card key={member.user_id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>
                          {member.program} • {member.university}
                        </CardDescription>
                      </div>
                    </div>
                    {memberStatus === 'accepted' && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                    {memberStatus === 'rejected' && (
                      <Badge variant="destructive">
                        <X className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Compatibility Score */}
                  {member.compatibility && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compatibility with you</span>
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {Math.round(member.compatibility.compatibility_score * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Personality: </span>
                          <span className="font-semibold">
                            {Math.round(member.compatibility.personality_score * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Schedule: </span>
                          <span className="font-semibold">
                            {Math.round(member.compatibility.schedule_score * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lifestyle: </span>
                          <span className="font-semibold">
                            {Math.round(member.compatibility.lifestyle_score * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Social: </span>
                          <span className="font-semibold">
                            {Math.round(member.compatibility.social_score * 100)}%
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member)
                          setShowCompatibilityModal(true)
                        }}
                        className="w-full text-xs"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        View Full Compatibility Details
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons - Only show if user is not the creator */}
                  {!isCreator && memberStatus === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleAcceptReject(member.user_id, 'reject')}
                        disabled={isProcessingMember}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        onClick={() => handleAcceptReject(member.user_id, 'accept')}
                        disabled={isProcessingMember}
                        className="flex-1"
                      >
                        {isProcessingMember ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Accept Match
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!isCreator && memberStatus === 'rejected' && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptReject(member.user_id, 'accept')}
                        disabled={isProcessingMember}
                        className="w-full"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Reverse Decision
                      </Button>
                    </div>
                  )}

                  {isCreator && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 text-center">
                        You've already matched with this person
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Compatibility Details Modal */}
      <Dialog open={showCompatibilityModal} onOpenChange={setShowCompatibilityModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember 
                ? `Compatibility with ${selectedMember.name}`
                : 'Group Compatibility Details'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedMember
                ? 'Detailed compatibility breakdown between you and this member'
                : 'Overall group compatibility scores and insights'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember?.compatibility ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(selectedMember.compatibility.compatibility_score * 100)}%
                </div>
                <p className="text-sm text-gray-600">Overall Compatibility</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Personality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(selectedMember.compatibility.personality_score * 100)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(selectedMember.compatibility.schedule_score * 100)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Lifestyle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(selectedMember.compatibility.lifestyle_score * 100)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Social</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(selectedMember.compatibility.social_score * 100)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedMember.compatibility.top_alignment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Top Alignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm capitalize">{selectedMember.compatibility.top_alignment}</p>
                  </CardContent>
                </Card>
              )}

              {selectedMember.compatibility.watch_out && selectedMember.compatibility.watch_out !== 'none' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">Watch Out</p>
                    <p className="text-sm mt-1">{selectedMember.compatibility.watch_out}</p>
                  </AlertDescription>
                </Alert>
              )}

              {selectedMember.compatibility.house_rules_suggestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">House Rules Suggestion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedMember.compatibility.house_rules_suggestion}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : groupCompatibility ? (
            <GroupCompatibilityDisplay 
              compatibility={groupCompatibility}
              compact={false}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

