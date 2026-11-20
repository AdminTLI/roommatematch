import { HostMessagesClient } from '@/components/host/host-messages-client'

export default function HostMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>
}) {
  return <HostMessagesClient searchParams={searchParams} />
}
