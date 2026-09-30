'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const headlineGradientClass =
  'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700'

export function WaitlistSection() {
  const { locale } = useApp()
  const t = content[locale].waitlist
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error(locale === 'nl' ? 'Vul je e-mailadres in' : 'Please enter your email address')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, feature: 'professional_signup' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong')
      }
      setSubmitted(true)
      toast.success(
        locale === 'nl'
          ? 'Je staat op de lijst. We mailen je bij de launch.'
          : "You're on the list. We'll email you when professionals launch."
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section
      id="waitlist"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="waitlist-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className={cn(GLASS, 'mx-auto max-w-2xl p-8 md:p-12 text-center')}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex justify-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200/80 bg-indigo-50/80"
              aria-hidden
            >
              {submitted ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              ) : (
                <Bell className="h-7 w-7 text-indigo-700" />
              )}
            </div>
          </div>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t.eyebrow}
          </p>

          <h2
            id="waitlist-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl md:text-4xl"
          >
            {submitted ? (
              t.successTitle
            ) : (
              <>
                {t.title}
                <span className={headlineGradientClass}>{t.titleHighlight}</span>
              </>
            )}
          </h2>

          <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            {submitted ? t.successCopy : t.copy}
          </p>

          {!submitted && (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1 space-y-2 text-left">
                <Label
                  htmlFor="yp-waitlist-email"
                  className="text-sm font-semibold text-slate-800"
                >
                  {t.emailLabel}
                </Label>
                <Input
                  id="yp-waitlist-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  disabled={submitting}
                  className="h-12 rounded-xl border-slate-200/80 bg-white/90 shadow-none dark:border-slate-600 dark:bg-white/90"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2',
                  !submitting
                    ? 'bg-indigo-500 shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:bg-indigo-600'
                    : 'cursor-not-allowed bg-indigo-500/40'
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t.submitting}
                  </>
                ) : (
                  t.submit
                )}
              </button>
            </form>
          )}
        </motion.div>
      </Container>
    </Section>
  )
}
