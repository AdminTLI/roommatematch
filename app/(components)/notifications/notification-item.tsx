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
      className={`w-full cursor-pointer transition-all duration-200 touch-manipulation min-h-[44px] rounded-lg border backdrop-blur-sm ${
        !notification.is_read 
          ? 'bg-white/50 dark:bg-white/5 border-white/10 dark:border-white/5 border-l-4 border-l-blue-500/80 dark:border-l-blue-400/60 hover:bg-white/70 dark:hover:bg-white/10 shadow-[0_0_12px_rgba(59,130,246,0.2)] dark:shadow-[0_0_12px_rgba(96,165,250,0.15)]' 
          : 'bg-white/50 dark:bg-white/5 border-white/10 dark:border-white/5 border-l-4 border-l-transparent hover:bg-white/70 dark:hover:bg-white/10'
      }`}
      onClick={handleClick}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Icon */}
          <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 backdrop-blur-sm ${
            config.color === 'blue' ? 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/20' :
            config.color === 'green' ? 'bg-green-100/60 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200/30 dark:border-green-500/20' :
            config.color === 'purple' ? 'bg-purple-100/60 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200/30 dark:border-purple-500/20' :
            config.color === 'orange' ? 'bg-orange-100/60 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/30 dark:border-orange-500/20' :
            config.color === 'red' ? 'bg-red-100/60 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/30 dark:border-red-500/20' :
            'bg-gray-100/60 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border border-gray-200/30 dark:border-gray-500/20'
          }`}>
            <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-xs sm:text-sm leading-tight ${
                  !notification.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                  !notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)] dark:shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
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
