'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  AlertTriangle,
  Loader2,
  ArrowLeft,
  EyeOff,
  Trash2,
  Home,
  Heart
} from 'lucide-react'

/** Exit survey reason options - matches backend enum/tagging */
const EXIT_REASONS = [
  { value: 'found_room', label: "I found a room! (Success)", isWin: true },
  { value: 'not_looking', label: "I'm not looking for housing anymore.", isWin: false },
  { value: 'bad_matches', label: "I didn't like the matches/results.", isWin: false },
  { value: 'technical_issues', label: 'Technical issues / Buggy experience.', isWin: false },
  { value: 'privacy_concerns', label: 'Privacy concerns.', isWin: false },
  { value: 'other', label: 'Other', isWin: false },
] as const

type Step = 'convince' | 'survey' | 'deleting' | 'done'

interface DeleteAccountClientProps {
  questionCount: number
  isProfileHidden: boolean
}

export function DeleteAccountClient({
  questionCount,
  isProfileHidden
}: DeleteAccountClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('convince')
  const [surveyReason, setSurveyReason] = useState<string>('')
  const [surveyOther, setSurveyOther] = useState('')
  const [surveyComment, setSurveyComment] = useState('')
  const [hideLoading, setHideLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleHideProfile = async () => {
    setError(null)
    setHideLoading(true)
    try {
      const res = await fetch('/api/settings/hide-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Failed to hide profile')
      }
      router.push('/settings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hide profile')
    } finally {
      setHideLoading(false)
    }
  }

  const handleProceedToSurvey = () => {
    setError(null)
    setStep('survey')
  }

  const handlePermanentlyDelete = async () => {
    if (!surveyReason) {
      setError('Please select a reason for leaving.')
      return
    }
    setError(null)
    setDeleteLoading(true)
    setStep('deleting')
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_reason: surveyReason === 'other' ? `other: ${surveyOther}` : surveyReason,
          survey_comment: surveyComment || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to delete account')
      }
      setStep('done')
      // Clear local session (auth user already deleted server-side)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setStep('survey')
    } finally {
      setDeleteLoading(false)
    }
  }

  const selectedReason = EXIT_REASONS.find((r) => r.value === surveyReason)
  const isWin = selectedReason?.isWin ?? false

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {step === 'convince' && (
        <Card className="border-zinc-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Delete Account?</CardTitle>
            <CardDescription>
              Before you go, here are a couple of things to consider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Effort Preservation & Safety Net copy */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 space-y-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Are you sure? You spent time answering <strong>{questionCount} compatibility questions</strong>.
                If you delete now, you lose that progress forever.
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Student housing is unpredictable. Keep your account as a backup in case your current
                housing falls through.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary: Hide Profile */}
              <Button
                onClick={handleHideProfile}
                disabled={hideLoading}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                {hideLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Hiding...
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Just Hide My Profile
                  </>
                )}
              </Button>
              {/* Secondary: Delete Everything */}
              <Button
                variant="ghost"
                onClick={handleProceedToSurvey}
                disabled={hideLoading}
                className="flex-1 h-12 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
              >
                No, Delete Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'survey' && (
        <Card className="border-zinc-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Why are you leaving?</CardTitle>
            <CardDescription>
              Your feedback helps us improve. This is collected before your account is deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Reason (required)</Label>
              <RadioGroup
                value={surveyReason}
                onValueChange={setSurveyReason}
                className="grid gap-3"
              >
                {EXIT_REASONS.map((r) => (
                  <div
                    key={r.value}
                    className="flex items-center space-x-3 rounded-lg border border-zinc-200 dark:border-white/10 p-3 hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label
                      htmlFor={r.value}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {r.label}
                      {r.isWin && (
                        <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Heart className="w-3.5 h-3.5" />
                          Win
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {surveyReason === 'other' && (
                <Textarea
                  placeholder="Please describe..."
                  value={surveyOther}
                  onChange={(e) => setSurveyOther(e.target.value)}
                  className="mt-2"
                  rows={2}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Tell us more (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Any additional feedback..."
                value={surveyComment}
                onChange={(e) => setSurveyComment(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              variant="destructive"
              onClick={handlePermanentlyDelete}
              disabled={deleteLoading}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'deleting' && (
        <Card className="border-zinc-200 dark:border-white/10">
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-zinc-600 dark:text-zinc-400">Deleting your account...</p>
          </CardContent>
        </Card>
      )}

      {step === 'done' && (
        <Card className="border-zinc-200 dark:border-white/10">
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
            <Home className="w-12 h-12 text-zinc-400" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Your account has been deleted. Redirecting...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
