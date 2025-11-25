'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, UserX, UserCheck, ShieldCheck, ShieldX, Trash2, Loader2 } from 'lucide-react'

interface UserActionsDropdownProps {
  userId: string
  isActive: boolean
  verificationStatus: string
  onActionComplete: () => void
}

export function UserActionsDropdown({
  userId,
  isActive,
  verificationStatus,
  onActionComplete,
}: UserActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleAction = async (action: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) {
      return
    }

    setIsLoading(true)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: [userId],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${action} user`)
      }

      // Show success message
      alert(`User ${action}d successfully`)
      onActionComplete()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action} user`
      setActionError(errorMessage)
      alert(`Error: ${errorMessage}`)
      console.error(`Failed to ${action} user:`, err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MoreVertical className="h-3 w-3" />
                Actions
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isActive ? (
            <DropdownMenuItem
              onClick={() =>
                handleAction(
                  'suspend',
                  'Are you sure you want to suspend this user? They will not be able to access the platform.'
                )
              }
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Suspend User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                handleAction(
                  'activate',
                  'Are you sure you want to activate this user? They will be able to access the platform.'
                )
              }
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Activate User
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {verificationStatus !== 'verified' ? (
            <DropdownMenuItem
              onClick={() =>
                handleAction(
                  'verify',
                  'Are you sure you want to verify this user? This will mark their identity as verified.'
                )
              }
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                handleAction(
                  'unverify',
                  'Are you sure you want to unverify this user? This will remove their verified status.'
                )
              }
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ShieldX className="h-4 w-4" />
              Unverify User
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              handleAction(
                'delete',
                'WARNING: Are you sure you want to permanently delete this user? This action cannot be undone and will delete all associated data including profile, matches, and chats.'
              )
            }
            disabled={isLoading}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {actionError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{actionError}</p>
      )}
    </div>
  )
}


