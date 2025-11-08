'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from './topbar'
import { Sidebar } from './sidebar'
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
}

export function AppShell({ children, user, showQuestionnairePrompt = false }: AppShellProps) {
  const router = useRouter()
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    emailVerified: boolean
    personaVerified: boolean
    needsEmailVerification: boolean
    needsPersonaVerification: boolean
  } | null>(null)
  const [isLoadingVerification, setIsLoadingVerification] = useState(true)

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
        console.error('Questionnaire check failed:', error)
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
  const showVerificationBanner = !isLoadingVerification && (needsEmailVerification || needsPersonaVerification)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-dashboard dark:bg-[#0F1419] safe-area-inset">
        <div className="flex min-h-screen lg:h-screen">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <Sidebar user={user} />
          </aside>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar user={user} />
            {/* Verification Banner */}
            {showVerificationBanner && (
              <Alert variant="destructive" className="m-4 mb-0 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900 dark:text-amber-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
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
                      className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
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
            )}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-safe-bottom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            </main>
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
            <div className="mt-6 flex gap-3">
              <button
                className="bg-brand-600 text-white px-4 py-2 rounded-md"
                onClick={() => { window.location.href = '/onboarding' }}
              >
                Start now
              </button>
              <button
                className="border px-4 py-2 rounded-md"
                onClick={() => setShowQuestionnaire(false)}
              >
                Later
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  )
}
