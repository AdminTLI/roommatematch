'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Scale, Check, Clock } from 'lucide-react'
import Link from 'next/link'

interface MatchingRightsSectionProps {
  /** Open review modal on mount (e.g. ?review=1 from compatibility UI). */
  openReviewOnMount?: boolean
}

export function MatchingRightsSection({ openReviewOnMount = false }: MatchingRightsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [details, setDetails] = useState('')
  const [reason, setReason] = useState('score_seems_wrong')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pendingReview, setPendingReview] = useState<{ id: string; sla_deadline: string } | null>(
    null
  )

  useEffect(() => {
    if (openReviewOnMount) setDialogOpen(true)
  }, [openReviewOnMount])

  useEffect(() => {
    fetch('/api/privacy/requests')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const open = data?.requests?.find(
          (r: { request_type: string; status: string }) =>
            r.request_type === 'automated_decision_review' &&
            ['pending', 'in_progress'].includes(r.status)
        )
        if (open) {
          setPendingReview({
            id: open.id,
            sla_deadline: open.sla_deadline,
          })
        }
      })
      .catch(() => {})
  }, [success])

  const submitReview = async () => {
    setLoading(true)
    setError(null)
    try {
      const { getCSRFHeaders } = await import('@/lib/utils/csrf-client')
      const headers = await getCSRFHeaders()
      const res = await fetch('/api/privacy/automated-decision-review', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Request failed')
      setSuccess(true)
      setDialogOpen(false)
      setDetails('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">
        Matching &amp; your rights
      </h3>
      <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
        <div className="flex gap-3">
          <Scale className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              Compatibility scores are <strong className="text-zinc-800 dark:text-zinc-200">suggestions only</strong> based on
              your questionnaire answers. You always choose who to contact. The score breakdown in the app shows the main
              factors; optional &quot;Living together&quot; text is an AI summary and is not the sole basis for matching.
            </p>
            <p>
              Under GDPR Article 22 you may request a <strong className="text-zinc-800 dark:text-zinc-200">human review</strong>,
              an explanation, or challenge a suggestion. See our{' '}
              <Link href="/privacy" className="text-violet-600 underline">
                Privacy Policy
              </Link>{' '}
              (Section 6).
            </p>
          </div>
        </div>

        {pendingReview && !success && (
          <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Review request in progress. We aim to respond by{' '}
              {new Date(pendingReview.sla_deadline).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <Check className="h-4 w-4" />
            <AlertDescription>Request submitted. Our team will respond within one month.</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto rounded-xl"
          onClick={() => setDialogOpen(true)}
          disabled={!!pendingReview}
        >
          Request human review of a match
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request human review</DialogTitle>
            <DialogDescription>
              Tell us which match or score concerns you. We will review the algorithm factors and respond within the GDPR
              one-month deadline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="review-reason">What is this about?</Label>
              <select
                id="review-reason"
                className="mt-1 w-full rounded-md border border-zinc-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="score_seems_wrong">The compatibility score seems wrong</option>
                <option value="missing_context">Important context was not considered</option>
                <option value="fairness">I feel the suggestion is unfair</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="review-details">Details (required)</Label>
              <Textarea
                id="review-details"
                className="mt-1"
                rows={4}
                placeholder="Which match or person? What did you expect instead?"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={submitReview} disabled={loading || !details.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit request'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
