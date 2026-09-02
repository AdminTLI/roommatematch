'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import {
  LAB_BODY_MAX,
  LAB_STATUS_LABELS,
  LAB_TITLE_MAX,
} from '@/lib/lab/constants'
import type { LabVoteIntensity, LabWishPublic } from '@/lib/lab/types'
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  Shield,
  Flag,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { ReportWishDialog } from '@/components/lab/report-wish-dialog'
import { cn } from '@/lib/utils'
import { formatCompactTimeAgo } from '@/lib/utils/time'

const LAB_PAGE_TEXT = 'text-[#0F172A] dark:text-slate-50'
const LAB_BODY_TEXT =
  'text-sm leading-relaxed text-slate-600 dark:text-slate-300'
const LAB_LABEL_TEXT =
  'text-sm font-semibold text-[#334155] dark:text-slate-300'
const LAB_HEADING =
  'text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[1.75rem]'
const LAB_EYEBROW =
  'text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'
const LAB_INPUT =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-none placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-400 '
const LAB_CARD =
  'rounded-2xl border-0 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80'

const SORT_TABS = [
  { id: 'top' as const, label: 'Top' },
  { id: 'new' as const, label: 'New' },
]

export function DomuLabInterface() {
  const searchParams = useSearchParams()
  const composeOnMount = searchParams.get('compose') === '1'

  const [wishes, setWishes] = useState<LabWishPublic[]>([])
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(composeOnMount)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [focusGroupOptIn, setFocusGroupOptIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [similar, setSimilar] = useState<
    Array<{ id: string; title: string; vote_count: number }>
  >([])
  const [votingId, setVotingId] = useState<string | null>(null)
  const [reportWishId, setReportWishId] = useState<string | null>(null)
  const [reportWishTitle, setReportWishTitle] = useState('')

  const loadWishes = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/lab/wishes?sort=${sort}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(
          typeof data.error === 'string'
            ? data.error
            : 'We could not load wishes right now. You can still post yours below.'
        )
        setWishes([])
        return
      }
      setWishes(data.wishes ?? [])
    } catch {
      setLoadError(
        'We could not load wishes right now. You can still post yours below.'
      )
      setWishes([])
    } finally {
      setIsLoading(false)
    }
  }, [sort])

  useEffect(() => {
    loadWishes()
  }, [loadWishes])

  useEffect(() => {
    if (title.trim().length < 3) {
      setSimilar([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/lab/wishes/similar?q=${encodeURIComponent(title)}`
        )
        if (res.ok) {
          const data = await res.json()
          setSimilar(data.similar ?? [])
        }
      } catch {
        // ignore
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [title])

  const submitWish = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/lab/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          focus_group_opt_in: focusGroupOptIn,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post')
      }
      showSuccessToast('Wish posted anonymously')
      setTitle('')
      setBody('')
      setFocusGroupOptIn(false)
      setShowComposer(false)
      setSimilar([])
      await loadWishes()
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to post wish')
    } finally {
      setIsSubmitting(false)
    }
  }

  const vote = async (wishId: string, intensity: LabVoteIntensity) => {
    const wish = wishes.find(w => w.id === wishId)
    const hasSameVote = wish?.user_vote_intensity === intensity
    setVotingId(wishId)
    try {
      const res = await fetchWithCSRF(
        `/api/lab/wishes/${wishId}/vote`,
        hasSameVote
          ? { method: 'DELETE' }
          : {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ intensity }),
            }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Vote failed')

      setWishes(prev =>
        prev.map(w =>
          w.id === wishId
            ? {
                ...w,
                vote_count: data.vote_count,
                use_this_count: data.use_this_count,
                user_vote_intensity: data.user_vote_intensity,
              }
            : w
        )
      )
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : 'Could not record vote'
      )
    } finally {
      setVotingId(null)
    }
  }

  const openReportDialog = (wish: LabWishPublic) => {
    setReportWishId(wish.id)
    setReportWishTitle(wish.title)
  }

  return (
    <div className={cn('max-w-4xl mx-auto', LAB_PAGE_TEXT)}>
      <ReportWishDialog
        wishId={reportWishId}
        wishTitle={reportWishTitle}
        open={reportWishId !== null}
        onOpenChange={open => {
          if (!open) {
            setReportWishId(null)
            setReportWishTitle('')
          }
        }}
      />
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-[#6366F1] dark:text-indigo-400" />
              <span className={LAB_EYEBROW}>Domu Lab</span>
            </div>
            <h1 className={LAB_HEADING}>What should we build?</h1>
            <p className={cn(LAB_BODY_TEXT, 'mt-2 max-w-xl')}>
              Tell us what is missing. Upvote what you would actually use. Text
              only – no links or attachments. Posts are anonymous.
            </p>
          </div>
          <Button onClick={() => setShowComposer(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New wish
          </Button>
        </div>

        <Card className={cn(LAB_CARD, 'mb-6')}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#6366F1] mt-0.5 shrink-0 dark:text-indigo-400" />
              <p className={LAB_BODY_TEXT}>
                This is not a social feed – it is a ranked wish list for product
                ideas. Describe a problem, not a solution slogan. Verified
                students only.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-2">
          <div className="flex gap-1 rounded-2xl bg-gray-50 p-1 backdrop-blur-xl dark:bg-white/5 sm:max-w-xs">
            {SORT_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSort(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  sort === tab.id
                    ? 'bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                    : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <Card className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30">
            <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                {loadError}
              </p>
              <Button size="sm" variant="outline" onClick={() => loadWishes()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showComposer && (
        <Card className={cn(LAB_CARD, 'mb-6')}>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
              Share a wish
            </CardTitle>
            <p className={cn(LAB_BODY_TEXT, 'mt-2')}>
              Stuck? Think about what frustrated you during onboarding, what you
              still had to ask in chat after matching, or a roommate situation
              Domu has not helped with yet.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="lab-title"
                className={cn(LAB_LABEL_TEXT, 'block mb-2')}
              >
                Headline ({title.length}/{LAB_TITLE_MAX})
              </label>
              <input
                id="lab-title"
                type="text"
                className={LAB_INPUT}
                placeholder="Short headline for your wish"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={LAB_TITLE_MAX}
              />
            </div>

            {similar.length > 0 && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Someone may have said this already – upvote instead?
                </p>
                <ul className="space-y-1">
                  {similar.map(s => (
                    <li
                      key={s.id}
                      className="text-amber-800 dark:text-amber-200"
                    >
                      {s.title} ({s.vote_count} votes)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label
                htmlFor="lab-body"
                className={cn(LAB_LABEL_TEXT, 'block mb-2')}
              >
                What happened? ({body.length}/{LAB_BODY_MAX})
              </label>
              <Textarea
                id="lab-body"
                rows={4}
                className={cn(LAB_INPUT, 'min-h-[120px] resize-y')}
                placeholder="Describe the situation or frustration..."
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={LAB_BODY_MAX}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="focus-group"
                checked={focusGroupOptIn}
                onCheckedChange={c => setFocusGroupOptIn(!!c)}
              />
              <label htmlFor="focus-group" className={cn(LAB_BODY_TEXT)}>
                I&apos;d join a small focus group (8–10 people) to talk about
                this and brainstorm solutions
              </label>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Posted anonymously to other students.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitWish}
                disabled={
                  isSubmitting ||
                  title.trim().length < 3 ||
                  body.trim().length < 10
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post wish'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"
            />
          ))}
        </div>
      ) : wishes.length === 0 ? (
        <Card className={cn(LAB_CARD, 'text-center py-12')}>
          <CardContent>
            <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4 dark:text-slate-500" />
            <CardTitle className="text-lg font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 mb-2">
              No wishes yet
            </CardTitle>
            <p className={cn(LAB_BODY_TEXT, 'mb-4')}>
              Be the first to tell us what Domu Match should do better.
            </p>
            <Button onClick={() => setShowComposer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post the first wish
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {wishes.map(wish => (
            <Card
              key={wish.id}
              data-testid="lab-wish"
              className={cn(LAB_CARD, 'hover:shadow-2xl transition-shadow')}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-extrabold leading-snug tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-lg">
                      {wish.title}
                    </CardTitle>
                    <p
                      className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                      title={new Date(wish.created_at).toLocaleString()}
                    >
                      {formatCompactTimeAgo(wish.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'shrink-0 text-xs',
                      wish.status === 'shipped' &&
                        'bg-emerald-100 text-emerald-800',
                      wish.status === 'looking' && 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {LAB_STATUS_LABELS[wish.status] ?? wish.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className={cn(LAB_BODY_TEXT, 'mb-4 whitespace-pre-wrap')}>
                  {wish.body}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={wish.user_vote_intensity ? 'primary' : 'outline'}
                    size="sm"
                    disabled={
                      votingId === wish.id ||
                      !['open', 'looking'].includes(wish.status)
                    }
                    onClick={() => vote(wish.id, 'use_this')}
                    className="gap-1.5"
                  >
                    <ThumbsUp
                      className={cn(
                        'h-4 w-4',
                        wish.user_vote_intensity && 'fill-current'
                      )}
                    />
                    I&apos;d use this ({wish.use_this_count})
                  </Button>
                  <Button
                    variant={
                      wish.user_vote_intensity === 'nice_to_have'
                        ? 'secondary'
                        : 'ghost'
                    }
                    size="sm"
                    disabled={
                      votingId === wish.id ||
                      !['open', 'looking'].includes(wish.status)
                    }
                    onClick={() => vote(wish.id, 'nice_to_have')}
                  >
                    Nice to have
                  </Button>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                    {wish.vote_count} total votes
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400"
                    onClick={() => openReportDialog(wish)}
                  >
                    <Flag className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
