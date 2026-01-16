'use client'

import { 
  Users, 
  Heart, 
  CheckCircle, 
  MessageCircle, 
  User, 
  FileText, 
  Shield, 
  Home, 
  FileCheck, 
  AlertTriangle, 
  Megaphone,
  Clock
} from 'lucide-react'
import { Notification, NOTIFICATION_CONFIG } from '@/lib/notifications/types'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => Promise<void>
  onNavigate: (notification: Notification) => void
}

const iconMap = {
  Users,
  Heart,
  CheckCircle,
  MessageCircle,
  User,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onNavigate 
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type]
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || MessageCircle

  const handleClick = async () => {
    if (!notification.is_read) {
      await onMarkAsRead(notification.id)
    }
    onNavigate(notification)
  }

  return (
    <div 
      className={`w-full cursor-pointer transition-all duration-200 touch-manipulation min-h-[44px] rounded-2xl border border-border-subtle ${
        !notification.is_read 
          ? 'bg-bg-surface border-l-4 border-l-semantic-accent hover:bg-bg-surface-alt shadow-elev-1' 
          : 'bg-bg-surface hover:bg-bg-surface-alt'
      }`}
      onClick={handleClick}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Icon */}
          <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
            config.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50' :
            config.color === 'green' ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800/50' :
            config.color === 'purple' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50' :
            config.color === 'orange' ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50' :
            config.color === 'red' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50' :
            'bg-bg-surface-alt text-text-secondary border border-border-subtle'
          }`}>
            <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-xs sm:text-sm leading-tight ${
                  !notification.is_read ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                  !notification.is_read ? 'text-text-secondary' : 'text-text-muted'
                }`}>
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-semantic-accent rounded-full flex-shrink-0 shadow-[0_0_4px_hsl(var(--accent))]" />
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-text-muted">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
