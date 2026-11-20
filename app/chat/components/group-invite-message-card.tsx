'use client'

import { useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import type { GroupInviteMessageMetadata } from '@/lib/chat/group-invite-metadata'
import { cn } from '@/lib/utils'

const INTENT_LABELS: Record<GroupInviteMessageMetadata['group_intent'], string> = {
  housing: 'Housing',
  study: 'Study',
  social: 'Social',
  general: 'General',
}

function otherInviteesLabel(inviteeCount: number): string | null {
  const others = Math.max(0, Math.floor(Number(inviteeCount) || 0) - 1)
  if (others <= 0) return null
  return others === 1
    ? '1 other student invited'
    : `${others} other students invited`
}

interface GroupInviteMessageCardProps {
  metadata: GroupInviteMessageMetadata
  /** True when current user is the invite recipient (not the inviter) */
  canRespond: boolean
  onResolved?: (status: 'accepted' | 'declined', groupChatId: string) => void
  className?: string
}

export function GroupInviteMessageCard({
  metadata,
  canRespond,
  onResolved,
  className,
}: GroupInviteMessageCardProps) {
  const [status, setStatus] = useState(metadata.status)
  const [isProcessing, setIsProcessing] = useState(false)

  const groupName = metadata.group_name?.trim() || 'Group chat'
  const pending = status === 'pending'
  const othersLabel = otherInviteesLabel(metadata.member_count)

  const respond = async (action: 'accept' | 'reject') => {
    if (!canRespond || !pending) return
    setIsProcessing(true)
    try {
      const response = await fetchWithCSRF('/api/chat/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: metadata.group_chat_id,
          action,
        }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to respond')
      }
      const next = action === 'accept' ? 'accepted' : 'declined'
      setStatus(next)
      if (action === 'accept') {
        showSuccessToast('Joined group', 'Opening your new group…')
      } else {
        showSuccessToast('Invite declined', 'You declined this group invite.')
      }
      onResolved?.(next, metadata.group_chat_id)
    } catch (e: any) {
      showErrorToast('Could not update invite', e.message || 'Try again')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={cn(
        'box-border w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-left shadow-sm dark:border-white/10 dark:bg-zinc-900',
        className
      )}
    >
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Group invite
        </p>
        <p className="mt-1 text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {groupName}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {INTENT_LABELS[metadata.group_intent] || 'General'}
          {othersLabel ? ` · ${othersLabel}` : ''}
        </p>
      </div>

      {(metadata.group_description || metadata.context_message) && (
        <div className="space-y-2 px-4 py-3">
          {metadata.group_description ? (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {metadata.group_description}
            </p>
          ) : null}
          {metadata.context_message ? (
            <p className="rounded-xl bg-zinc-50 px-3 py-2 text-xs italic leading-relaxed text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
              “{metadata.context_message}”
            </p>
          ) : null}
        </div>
      )}

      <div className="px-4 pb-3">
        {pending && canRespond ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isProcessing}
              onClick={() => void respond('reject')}
              className="h-10 flex-1 rounded-xl border-zinc-200"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decline'}
            </Button>
            <Button
              type="button"
              disabled={isProcessing}
              onClick={() => void respond('accept')}
              className="h-10 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {status === 'accepted'
              ? 'You joined this group'
              : status === 'declined'
                ? 'You declined this invite'
                : canRespond
                  ? 'Waiting for your response'
                  : 'Invite sent'}
          </div>
        )}
      </div>
    </div>
  )
}
