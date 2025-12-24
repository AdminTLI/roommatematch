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
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center py-20 sm:py-24 lg:py-28">
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </section>
    </main>
  )
}