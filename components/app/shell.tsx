'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from './topbar'
import { Sidebar } from './sidebar'
import { useState } from 'react'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ThemeProvider } from '@/lib/theme/theme-provider'

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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-dashboard">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          {/* Sidebar */}
          <Sidebar user={user} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Topbar */}
            <Topbar user={user} />
            
            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8">
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

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Topbar */}
          <Topbar user={user} />
          
          {/* Main Content */}
          <main className="flex-1 p-4">
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
