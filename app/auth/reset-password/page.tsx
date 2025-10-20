import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Roommate Match',
  description: 'Reset your Roommate Match account password.',
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  )
}
