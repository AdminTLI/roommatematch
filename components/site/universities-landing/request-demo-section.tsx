'use client'

import { useState } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/app/providers'
import { content } from './content'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

const inputBase =
  'bg-white/60 border border-white/70 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-slate-900/20 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition-colors'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function RequestDemoSection() {
  const { locale } = useApp()
  const t = content[locale].requestDemo
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: (data.get('name') as string) || '',
      email: (data.get('email') as string) || '',
      institution: (data.get('institution') as string) || '',
      role: (data.get('role') as string) || '',
      message: (data.get('message') as string) || '',
    }

    try {
      const res = await fetch('/api/universities/request-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong')
      }

      setSubmitted(true)
      form.reset()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section
      id="request-demo"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="request-demo-heading"
    >
      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2
            id="request-demo-heading"
            className="text-3xl md:text-4xl font-bold text-slate-800 text-center tracking-tight mb-2"
          >
            {t.heading}
          </h2>
          <p className="text-slate-600 text-center mb-8">{t.subheading}</p>
          {submitted ? (
            <div
              className={cn(
                GLASS,
                'p-8 md:p-10 text-center',
                'border border-white/60 bg-white/55 shadow-[0_18px_50px_rgba(15,23,42,0.08)]'
              )}
              role="status"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" aria-hidden />
              </div>
              <p className="text-base sm:text-lg font-semibold text-slate-900">
                {t.successMessage}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {locale === 'nl'
                  ? 'We reageren meestal binnen 1-2 werkdagen.'
                  : 'We typically respond within 1-2 business days.'}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={cn(
                GLASS,
                'space-y-4 p-6 md:p-8 rounded-2xl',
                'transition-all duration-300 hover:bg-white/75'
              )}
              noValidate
            >
              <div>
                <Label htmlFor="demo-name" className="text-slate-800">
                  {t.nameLabel}
                </Label>
                <Input
                  id="demo-name"
                  name="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  required
                  className={cn('mt-1', inputBase)}
                  aria-label={t.nameLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-email" className="text-slate-800">
                  {t.emailLabel}
                </Label>
                <Input
                  id="demo-email"
                  name="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  required
                  className={cn('mt-1', inputBase)}
                  aria-label={t.emailLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-institution" className="text-slate-800">
                  {t.institutionLabel}
                </Label>
                <Input
                  id="demo-institution"
                  name="institution"
                  type="text"
                  placeholder={t.institutionPlaceholder}
                  className={cn('mt-1', inputBase)}
                  aria-label={t.institutionLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-role" className="text-slate-800">
                  {t.roleLabel}
                </Label>
                <Input
                  id="demo-role"
                  name="role"
                  type="text"
                  placeholder={t.rolePlaceholder}
                  className={cn('mt-1', inputBase)}
                  aria-label={t.roleLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-message" className="text-slate-800">
                  {t.messageLabel}
                </Label>
                <Textarea
                  id="demo-message"
                  name="message"
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className={cn('mt-1', inputBase)}
                  aria-label={t.messageLabel}
                />
              </div>
              {error && (
                <p className="text-sm text-rose-400" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 min-h-[48px] text-base font-semibold',
                  'bg-slate-900 text-white hover:bg-slate-900/90',
                  'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                )}
              >
                {loading
                  ? locale === 'nl'
                    ? 'Versturen…'
                    : 'Sending…'
                  : t.submitLabel}
              </button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  )
}
