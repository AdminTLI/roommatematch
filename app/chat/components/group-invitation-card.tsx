'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Users, Eye } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { GroupCompatibilityDisplay } from './group-compatibility-display'
import { MemberPreviewModal } from './member-preview-modal'

interface GroupInvitation {
  id: string
  chat_id: string
  inviter_id: string
  invitee_id: string
  status: 'pending' | 'accepted' | 'rejected'
  context_message?: string
  invited_at: string
  chats: {
    id: string
    name?: string
    group_intent?: 'housing' | 'study' | 'social' | 'general'
    invitation_status: string
    created_by: string
  }
  inviter: {
    first_name?: string
    last_name?: string
  }
  compatibility?: {
    overall_score: number
    personality_score: number
    schedule_score: number
    lifestyle_score: number
    social_score: number
    academic_score: number
  }
  other_members?: Array<{
    user_id: string
    status: string
    name: string
    program: string
    university: string
  }>
  mutual_connections?: string[]
}

interface GroupInvitationCardProps {
  invitation: GroupInvitation
  onAccepted?: (chatId: string) => void
  onRejected?: () => void
}

export function GroupInvitationCard({ invitation, onAccepted, onRejected }: GroupInvitationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const inviterName = invitation.inviter
    ? [invitation.inviter.first_name, invitation.inviter.last_name].filter(Boolean).join(' ') || 'Someone'
    : 'Someone'

  const groupName = invitation.chats.name || 'Group Chat'
  const groupIntent = invitation.chats.group_intent || 'general'
  const intentLabels = {
    housing: 'Housing / Roommates',
    study: 'Study Group',
    social: 'Social / Friends',
    general: 'General'
  }

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      const response = await fetchWithCSRF('/api/chat/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: invitation.chat_id,
          action: 'accept'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept invitation')
      }

      if (onAccepted) {
        onAccepted(invitation.chat_id)
      }
    } catch (error: any) {
      console.error('Failed to accept invitation:', error)
      alert(error.message || 'Failed to accept invitation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      const response = await fetchWithCSRF('/api/chat/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: invitation.chat_id,
          action: 'reject'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject invitation')
      }

      if (onRejected) {
        onRejected()
      }
    } catch (error: any) {
      console.error('Failed to reject invitation:', error)
      alert(error.message || 'Failed to reject invitation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {groupName}
              </CardTitle>
              <CardDescription>
                {inviterName} invited you to join a {intentLabels[groupIntent]} group
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {intentLabels[groupIntent]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Message */}
          {invitation.context_message && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 italic">
                "{invitation.context_message}"
              </p>
            </div>
          )}

          {/* Mutual Connections */}
          {invitation.mutual_connections && invitation.mutual_connections.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                You're also matched with {invitation.mutual_connections.length === 1 
                  ? invitation.mutual_connections[0]
                  : invitation.mutual_connections.slice(0, -1).join(', ') + ' and ' + invitation.mutual_connections[invitation.mutual_connections.length - 1]
                }
              </span>
            </div>
          )}

          {/* Compatibility Display */}
          {invitation.compatibility && (
            <div>
              <GroupCompatibilityDisplay 
                compatibility={invitation.compatibility}
                compact={true}
              />
            </div>
          )}

          {/* Other Members Preview */}
          {invitation.other_members && invitation.other_members.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Other Members ({invitation.other_members.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {invitation.other_members.slice(0, 3).map((member) => (
                  <div key={member.user_id} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-gray-500">{member.program}</p>
                    </div>
                  </div>
                ))}
                {invitation.other_members.length > 3 && (
                  <div className="flex items-center text-xs text-gray-500">
                    +{invitation.other_members.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && invitation.other_members && (
        <MemberPreviewModal
          chatId={invitation.chat_id}
          members={invitation.other_members}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

