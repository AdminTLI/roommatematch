import { SignInForm } from './components/sign-in-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-surface-0/95 backdrop-blur-sm border-b border-line">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span className="font-semibold text-ink-900">Roommate Match</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-h1 text-ink-900">
              Sign in to your account
            </h1>
            <p className="mt-2 text-h4 text-ink-700">
              Welcome back! Please sign in to continue.
            </p>
          </div>
          
          <SignInForm />
          
          <div className="text-center">
            <p className="text-body text-ink-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/sign-up" 
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
