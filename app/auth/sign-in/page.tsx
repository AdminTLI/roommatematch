import { SignInForm } from '@/components/auth/sign-in-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Domu Match',
  description: 'Sign in to your Domu Match account to find compatible roommates.',
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <SignInForm />
        </div>
      </div>
    </main>
  )
}