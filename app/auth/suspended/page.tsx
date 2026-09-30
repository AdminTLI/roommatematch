import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Account suspended | Domu Match',
}

export default function SuspendedAccountPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">Your account is suspended</h1>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This account has been suspended for violating Domu Match&apos;s Terms of Service, Community
          Guidelines, and/or Privacy Policy. You no longer have access to matching or chat.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          If you believe this was a mistake, you can appeal by emailing{' '}
          <a href="mailto:contact@domumatch.com" className="text-indigo-600 underline">
            contact@domumatch.com
          </a>
          .
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary" className="bg-indigo-500 hover:bg-indigo-600">
            <a href="mailto:contact@domumatch.com">Appeal by email</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
