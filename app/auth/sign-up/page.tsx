import { SignUpForm } from './components/sign-up-form'
import { AuthHeader } from '../components/auth-header'
import { AuthFooter } from '../components/auth-footer'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Join thousands of students finding their perfect roommate match.
            </p>
          </div>
          
          <SignUpForm />
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <a 
                href="/auth/sign-in" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  )
}
