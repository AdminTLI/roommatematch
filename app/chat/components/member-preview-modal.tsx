'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Member {
  user_id: string
  status: string
  name: string
  program: string
  university: string
  compatibility?: {
    compatibility_score: number
    personality_score: number
    schedule_score: number
    lifestyle_score: number
    social_score: number
    academic_bonus: number
  }
}

interface MemberPreviewModalProps {
  chatId: string
  members?: Member[]
  isOpen: boolean
  onClose: () => void
}

export function MemberPreviewModal({ chatId, members: initialMembers, isOpen, onClose }: MemberPreviewModalProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers || [])
  const [isLoading, setIsLoading] = useState(!initialMembers)

  useEffect(() => {
    if (isOpen && !initialMembers) {
      loadMembers()
    } else if (initialMembers) {
      setMembers(initialMembers)
    }
  }, [isOpen, chatId, initialMembers])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const response = await fetch(`/api/chat/groups?chatId=${chatId}&action=members-preview`)
      
      if (!response.ok) {
        throw new Error('Failed to load members')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Group Members Preview</DialogTitle>
          <DialogDescription>
            Preview members before accepting the invitation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No members found
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.user_id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-lg font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {member.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {member.program} • {member.university}
                    </p>
                  </div>
                </div>

                {member.compatibility && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Compatibility with you</span>
                      <Badge variant="secondary">
                        {Math.round(member.compatibility.compatibility_score * 100)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Personality: </span>
                        <span className={getScoreColor(member.compatibility.personality_score)}>
                          {Math.round(member.compatibility.personality_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Schedule: </span>
                        <span className={getScoreColor(member.compatibility.schedule_score)}>
                          {Math.round(member.compatibility.schedule_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lifestyle: </span>
                        <span className={getScoreColor(member.compatibility.lifestyle_score)}>
                          {Math.round(member.compatibility.lifestyle_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Social: </span>
                        <span className={getScoreColor(member.compatibility.social_score)}>
                          {Math.round(member.compatibility.social_score * 100)}%
                        </span>
                      </div>
                    </div>
                    {member.compatibility.academic_bonus > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        + Academic bonus: {Math.round(member.compatibility.academic_bonus * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

