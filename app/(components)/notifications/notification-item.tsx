'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Clock,
  ExternalLink
} from 'lucide-react'
import { Notification, NOTIFICATION_CONFIG } from '@/lib/notifications/types'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
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
  const [isHovered, setIsHovered] = useState(false)
  const config = NOTIFICATION_CONFIG[notification.type]
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || MessageCircle

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    onNavigate(notification)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
      } ${isHovered ? 'shadow-md' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-full ${
            config.color === 'blue' ? 'bg-blue-100 text-blue-600' :
            config.color === 'green' ? 'bg-green-100 text-green-600' :
            config.color === 'purple' ? 'bg-purple-100 text-purple-600' :
            config.color === 'orange' ? 'bg-orange-100 text-orange-600' :
            config.color === 'red' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <IconComponent className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${
                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Priority Badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(config.priority)}`}
                >
                  {config.priority}
                </Badge>
                
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Action indicator */}
            {isHovered && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                <ExternalLink className="h-3 w-3" />
                <span>Click to view</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
