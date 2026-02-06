'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TopNav } from './TopNav'
import { FloatingDock } from './navigation/floating-dock'
import { BottomTabBar } from './BottomTabBar'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import Link from 'next/link'
import { Users, AlertCircle, Mail, Shield, ArrowRight } from 'lucide-react'
import { MessageNotificationPopup } from '@/app/(components)/notifications/message-notification-popup'
import { usePathname } from 'next/navigation'
import { AppFooter } from './app-footer'

interface AppShellProps {
  children: React.ReactNode
  user: {
    id: string
    email: string
    email_confirmed_at?: string
    name: string
    avatar?: string
  }
  showQuestionnairePrompt?: boolean  // NEW: Control questionnaire modal
  hideVerificationBanner?: boolean  // NEW: Hide verification banner (e.g., on verify page)
}

export function AppShell({ children, user, showQuestionnairePrompt = false, hideVerificationBanner = false }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    emailVerified: boolean
    personaVerified: boolean
    needsEmailVerification: boolean
    needsPersonaVerification: boolean
  } | null>(null)
  const [isLoadingVerification, setIsLoadingVerification] = useState(true)

  // Hide banner on verify page
  const isVerifyPage = pathname === '/verify' || pathname?.startsWith('/verify')

  // Check verification status on mount
  useEffect(() => {
    const checkVerification = async () => {
      // Skip for demo user
      if (!user?.id || user.id === 'demo-user-id') {
        setIsLoadingVerification(false)
        return
      }

      try {
        const response = await fetch('/api/auth/verification-status')
        if (response.ok) {
          const data = await response.json()
          setVerificationStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch verification status:', error)
      } finally {
        setIsLoadingVerification(false)
      }
    }
    checkVerification()
  }, [user?.id])

  // On mount, check if the logged-in user has completed the questionnaire
  useEffect(() => {
    // Only check if we should show the prompt on this page
    if (!showQuestionnairePrompt) {
      setShowQuestionnaire(false)
      return
    }

    const check = async () => {
      // Check demo completion first
      if (!user?.id || user.id === 'demo-user-id') {
        const demoCompleted = localStorage.getItem('demo-questionnaire-completed') === 'true'
        setShowQuestionnaire(!demoCompleted)
        return
      }

      // Real user: check database
      const supabase = createClient()
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Questionnaire check failed:', error)
        }
        // Show error toast instead of silent failure
        setShowQuestionnaire(false)
        return
      }
      setShowQuestionnaire(!data || data.length === 0)
    }
    check()
  }, [user?.id, showQuestionnairePrompt])

  const handleCompleteEmailVerification = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verification-email', user.email)
    }
    router.push('/auth/verify-email')
  }

  const handleCompletePersonaVerification = () => {
    router.push('/verify')
  }

  const needsEmailVerification = verificationStatus?.needsEmailVerification ?? false
  const needsPersonaVerification = verificationStatus?.needsPersonaVerification ?? false
  const showVerificationBanner = !hideVerificationBanner && !isVerifyPage && !isLoadingVerification && (needsEmailVerification || needsPersonaVerification)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-transparent safe-area-inset">
        <div className="flex min-h-screen flex-col">
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden relative z-0">
            <TopNav user={user} />

            {/* Floating Dock Navigation */}
            <FloatingDock />

            {/* Verification Banner */}
            {showVerificationBanner && (
              <div className="px-4 pt-4 pb-0 w-full max-w-full overflow-hidden relative z-10">
                <Alert variant="destructive" className="w-full border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900 dark:text-amber-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold mb-1">
                          {needsEmailVerification ? 'Email verification required' : 'Identity verification required'}
                        </p>
                        <p className="text-sm">
                          {needsEmailVerification
                            ? 'Please verify your email address to access all features.'
                            : 'Please complete identity verification to access all features.'}
                        </p>
                      </div>
                      <Button
                        onClick={needsEmailVerification ? handleCompleteEmailVerification : handleCompletePersonaVerification}
                        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 min-h-[44px] w-full sm:w-auto"
                        size="sm"
                      >
                        {needsEmailVerification ? (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Verify Email
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Verify Identity
                          </>
                        )}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-40 chat-page-main">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="max-w-7xl mx-auto h-full"
                >
                  {children}
                  <div className="mt-6 sm:mt-8">
                    <AppFooter />
                  </div>
                </motion.div>
              </main>
            </div>
          </div>
        </div>

        {/* Message Notification Popup */}
        <MessageNotificationPopup userId={user.id} />

        {/* Questionnaire modal - gated by auth + only if never filled */}
        <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete your compatibility profile</DialogTitle>
              <DialogDescription>
                Answer a few questions to enable accurate matching. You can update answers later.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => { window.location.href = '/onboarding' }}
                className="w-full sm:w-auto"
              >
                Start now
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuestionnaire(false)}
                className="w-full sm:w-auto"
              >
                Later
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  )
}
