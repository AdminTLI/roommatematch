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
      <div className="flex justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </main>
  )
}