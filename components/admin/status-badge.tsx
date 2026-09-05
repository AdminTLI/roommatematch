import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type AdminStatusTone =
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral'

const TONE_CLASSES: Record<AdminStatusTone, string> = {
  success:
    'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning:
    'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  danger:
    'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  neutral:
    'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

/** Normalize common admin status strings to a tone. */
const STATUS_TONE_MAP: Record<string, AdminStatusTone> = {
  active: 'success',
  confirmed: 'success',
  verified: 'success',
  approved: 'success',
  accepted: 'success',
  actioned: 'success',
  completed: 'success',
  online: 'success',

  pending: 'warning',
  approaching: 'warning',
  degraded: 'warning',
  expired: 'warning',

  open: 'info',
  unverified: 'neutral',
  inactive: 'neutral',
  archived: 'neutral',
  dismissed: 'neutral',

  declined: 'danger',
  failed: 'danger',
  rejected: 'danger',
  suspended: 'danger',
  overdue: 'danger',
  offline: 'danger',
}

interface AdminStatusBadgeProps {
  status: string
  label?: string
  tone?: AdminStatusTone
  className?: string
}

export function resolveAdminStatusTone(status: string): AdminStatusTone {
  const key = status.trim().toLowerCase().replace(/\s+/g, '_')
  return STATUS_TONE_MAP[key] ?? 'neutral'
}

export function AdminStatusBadge({
  status,
  label,
  tone,
  className,
}: AdminStatusBadgeProps) {
  const resolvedTone = tone ?? resolveAdminStatusTone(status)
  const display = label ?? status

  return (
    <Badge
      className={cn(
        'px-2.5 py-1 text-xs font-semibold capitalize',
        TONE_CLASSES[resolvedTone],
        className
      )}
    >
      {display}
    </Badge>
  )
}
