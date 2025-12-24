import { ResetPasswordConfirmForm } from '@/components/auth/reset-password-confirm-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password | Domu Match',
  description: 'Set a new password for your Domu Match account.',
}

export default function ResetPasswordConfirmPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ResetPasswordConfirmForm />
        </div>
      </div>
    </main>
  )
}

