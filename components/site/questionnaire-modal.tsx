'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'qm_questionnaire_dismissed_v1'

export default function QuestionnaireModal() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const dismissedAt = localStorage.getItem(STORAGE_KEY)
    if (dismissedAt) return
    const t = setTimeout(() => setOpen(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleLater = () => {
    // snooze for 7 days
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setOpen(false)
  }

  const handleStart = () => {
    setOpen(false)
    router.push('/questionnaire')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Build your compatibility profile</DialogTitle>
          <DialogDescription>
            Answer a few quick questions about lifestyle and study habits. It takes 3 minutes and improves your matches.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleStart} className="bg-brand-600 text-white">Start questionnaire</Button>
          <Button variant="outline" onClick={handleLater}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


