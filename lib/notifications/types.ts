export type NotificationType = 
  | 'match_created'
  | 'match_accepted' 
  | 'match_confirmed'
  | 'chat_message'
  | 'profile_updated'
  | 'questionnaire_completed'
  | 'verification_status'
  | 'housing_update'
  | 'agreement_update'
  | 'safety_alert'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
}

// Notification type configurations
export const NOTIFICATION_CONFIG = {
  match_created: {
    icon: 'Users',
    color: 'blue',
    priority: 'high' as const,
  },
  match_accepted: {
    icon: 'Heart',
    color: 'green',
    priority: 'high' as const,
  },
  match_confirmed: {
    icon: 'CheckCircle',
    color: 'green',
    priority: 'high' as const,
  },
  chat_message: {
    icon: 'MessageCircle',
    color: 'purple',
    priority: 'medium' as const,
  },
  profile_updated: {
    icon: 'User',
    color: 'blue',
    priority: 'low' as const,
  },
  questionnaire_completed: {
    icon: 'FileText',
    color: 'green',
    priority: 'medium' as const,
  },
  verification_status: {
    icon: 'Shield',
    color: 'orange',
    priority: 'high' as const,
  },
  housing_update: {
    icon: 'Home',
    color: 'blue',
    priority: 'medium' as const,
  },
  agreement_update: {
    icon: 'FileCheck',
    color: 'green',
    priority: 'medium' as const,
  },
  safety_alert: {
    icon: 'AlertTriangle',
    color: 'red',
    priority: 'high' as const,
  },
  system_announcement: {
    icon: 'Megaphone',
    color: 'purple',
    priority: 'medium' as const,
  },
} as const;

export type NotificationPriority = 'low' | 'medium' | 'high';
