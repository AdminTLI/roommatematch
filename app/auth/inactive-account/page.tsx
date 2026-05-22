import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Account inactive | Domu Match',
}

export default function InactiveAccountPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">Your account is inactive</h1>
        <p className="text-slate-600 mb-4 leading-relaxed">
          We have not seen activity on your account for over one year. In line with our{' '}
          <Link href="/privacy" className="text-violet-600 underline">
            Privacy Policy
          </Link>
          , your personal profile data has been anonymized and your account is no longer active in matching or chat.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          If you believe this is a mistake or you would like help restoring access, contact us at{' '}
          <a href="mailto:contact@domumatch.com" className="text-violet-600 underline">
            contact@domumatch.com
          </a>
          . You may also create a new account if you wish to use Domu Match again.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary" className="bg-violet-600 hover:bg-violet-700">
            <a href="mailto:contact@domumatch.com">Contact support</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
