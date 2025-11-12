import { SignUpForm } from '@/components/auth/sign-up-form'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Domu Match',
  description: 'Create your Domu Match account to find compatible roommates.',
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </main>
  )
}