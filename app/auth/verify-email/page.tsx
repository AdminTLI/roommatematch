import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Verify Email | Roommate Match',
  description: 'Verify your email address to complete your Roommate Match account setup.',
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
