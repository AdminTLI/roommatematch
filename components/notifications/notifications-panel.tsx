'use client'

import { NotificationsList, type NotificationsListProps } from './notifications-list'

type Props = Omit<NotificationsListProps, 'layout'>

export function NotificationsPanel(props: Props) {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-col overflow-hidden"
      style={{ height: 'min(780px, 108vh)', maxHeight: 840 }}
    >
      <NotificationsList layout="panel" {...props} />
    </div>
  )
}
