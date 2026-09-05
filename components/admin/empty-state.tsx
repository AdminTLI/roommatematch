import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ADMIN_HELPER_TEXT } from '@/lib/admin/ui'

interface AdminEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className
      )}
    >
      <Icon
        className="mb-5 h-14 w-14 text-gray-300 dark:text-gray-600"
        aria-hidden
      />
      <div className="max-w-md space-y-2">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </p>
        {description ? (
          <p className={ADMIN_HELPER_TEXT}>{description}</p>
        ) : null}
      </div>
    </div>
  )
}
