import { Suspense } from 'react'
import { Metadata } from 'next'
import { AcceptInvitationClient } from '@/components/auth/accept-invitation-client'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accept invitation | Domu Match',
  description: 'Accept your Domu Match institution administrator invitation.',
}

function AcceptInvitationFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" aria-label="Loading" />
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationFallback />}>
      <AcceptInvitationClient />
    </Suspense>
  )
}
