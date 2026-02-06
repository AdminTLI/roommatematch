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
      className={`group w-full cursor-pointer transition-all duration-300 touch-manipulation rounded-2xl border ${
        !notification.is_read
          ? 'bg-zinc-50 dark:bg-slate-700/50 border-zinc-200 dark:border-slate-600 hover:bg-zinc-100 dark:hover:bg-slate-700 hover:border-violet-500/50 dark:hover:border-violet-500/50 shadow-sm border-l-4 border-l-violet-500'
          : 'bg-white dark:bg-slate-700/30 border-zinc-200/50 dark:border-slate-600/50 hover:bg-zinc-50 dark:hover:bg-slate-700/50 hover:border-zinc-300 dark:hover:border-slate-600'
      }`}
      onClick={handleClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
            config.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' :
            config.color === 'green' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
            config.color === 'purple' ? 'bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20' :
            config.color === 'orange' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' :
            config.color === 'red' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
            'bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20'
          }`}>
            <IconComponent className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-xs leading-tight mb-1 ${
                  !notification.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-slate-300'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-xs mt-1 leading-snug ${
                  !notification.is_read ? 'text-zinc-600 dark:text-slate-300' : 'text-zinc-500 dark:text-slate-400'
                }`}>
                  {notification.message}
                </p>
              </div>

              <div className="flex items-center flex-shrink-0 pt-0.5">
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 shadow-[0_0_3px_rgba(139,92,246,0.6)]" />
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-400 dark:text-slate-500">
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
