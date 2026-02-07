'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/app/providers'
import { content } from './content'
import { toast } from 'sonner'

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
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section
      id="request-demo"
      className="bg-gradient-to-b from-indigo-50/50 to-slate-50"
      aria-labelledby="request-demo-heading"
    >
      <Container>
        <div className="max-w-2xl mx-auto">
          <h2
            id="request-demo-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2"
          >
            {t.heading}
          </h2>
          <p className="text-slate-600 text-center mb-8">
            {t.subheading}
          </p>
          {submitted ? (
            <p className="text-center text-slate-600 py-8" role="status">
              {t.successMessage}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-white p-6 md:p-8 shadow-elev-1"
              noValidate
            >
              <div>
                <Label htmlFor="demo-name" className="text-slate-900">
                  {t.nameLabel}
                </Label>
                <Input
                  id="demo-name"
                  name="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  required
                  className="mt-1"
                  aria-label={t.nameLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-email" className="text-slate-900">
                  {t.emailLabel}
                </Label>
                <Input
                  id="demo-email"
                  name="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  required
                  className="mt-1"
                  aria-label={t.emailLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-institution" className="text-slate-900">
                  {t.institutionLabel}
                </Label>
                <Input
                  id="demo-institution"
                  name="institution"
                  type="text"
                  placeholder={t.institutionPlaceholder}
                  className="mt-1"
                  aria-label={t.institutionLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-role" className="text-slate-900">
                  {t.roleLabel}
                </Label>
                <Input
                  id="demo-role"
                  name="role"
                  type="text"
                  placeholder={t.rolePlaceholder}
                  className="mt-1"
                  aria-label={t.roleLabel}
                />
              </div>
              <div>
                <Label htmlFor="demo-message" className="text-slate-900">
                  {t.messageLabel}
                </Label>
                <Textarea
                  id="demo-message"
                  name="message"
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className="mt-1"
                  aria-label={t.messageLabel}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 min-h-[48px] px-8 rounded-2xl border-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (locale === 'nl' ? 'Versturen…' : 'Sending…') : t.submitLabel}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  )
}
