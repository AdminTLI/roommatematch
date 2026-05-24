/**
 * /unsubscribe — public, token-gated email preferences page.
 */

import { Suspense } from 'react'
import { UnsubscribeClient } from './UnsubscribeClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tokenFromServer = params.token?.trim() ?? ''

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-white text-sm text-slate-600">
          Loading…
        </div>
      }
    >
      <UnsubscribeClient initialToken={tokenFromServer} />
    </Suspense>
  )
}
