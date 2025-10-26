'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="min-h-screen bg-dashboard">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Fixed Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-y-0 left-0 w-64 z-30"
        >
          <Sidebar user={user} />
        </motion.div>

        {/* Main Content with left padding */}
        <div className="flex-1 flex flex-col ml-64">
          <Topbar user={user} />
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
        {/* Mobile Topbar */}
        <div className="sticky top-0 z-50 bg-surface-0/95 backdrop-blur-sm border-b border-line pt-safe-top">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-h4 font-semibold text-ink-900">Roommate Match</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                <span className="text-brand-600 font-semibold text-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="p-3 sm:p-4 lg:p-6 pb-safe-bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
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
  )
}
