'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NotificationsList, type NotificationsListProps } from './notifications-list'
import { cn } from '@/lib/utils'

type Props = Omit<NotificationsListProps, 'layout'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange, ...listProps }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-notification-dropdown
        side="bottom"
        className={cn(
          'notif-glass-panel flex h-[min(90dvh,100%)] max-h-[90dvh] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-x-0 border-b-0 p-0',
          'border-white/50 bg-white/65 backdrop-blur-[24px] backdrop-saturate-[1.9]',
          'dark:border-white/10 dark:bg-slate-900/70',
          'pb-[max(0px,env(safe-area-inset-bottom))]',
          '[&>button]:hidden',
          'data-[state=open]:duration-300 data-[state=closed]:duration-200'
        )}
      >
        <div
          className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-zinc-300/80 dark:bg-slate-600"
          aria-hidden
        />
        <SheetHeader className="sr-only">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <NotificationsList layout="modal" {...listProps} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
