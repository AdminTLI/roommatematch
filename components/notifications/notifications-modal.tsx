'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NotificationsList, type NotificationsListProps } from './notifications-list'

type Props = Omit<NotificationsListProps, 'layout'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange, ...listProps }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-notification-dropdown
        side="right"
        className="flex h-[100dvh] w-full max-w-none flex-col border-zinc-200 p-0 dark:border-slate-700 sm:max-w-md [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <NotificationsList layout="modal" {...listProps} />
      </SheetContent>
    </Sheet>
  )
}
