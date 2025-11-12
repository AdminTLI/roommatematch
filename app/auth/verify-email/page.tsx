import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Verify Email | Domu Match',
  description: 'Verify your email address to complete your Domu Match account setup.',
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
