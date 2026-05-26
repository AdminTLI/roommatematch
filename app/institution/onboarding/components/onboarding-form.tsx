'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

export function InstitutionOnboardingForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [institutionName, setInstitutionName] = useState('')
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [notes, setNotes] = useState('')
  const [contactConsent, setContactConsent] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/auth/sign-in?redirect=/institution/onboarding')
          return
        }

        setEmail(user.email || '')
        setWorkEmail(user.email || '')
        setNeedsPassword(Boolean(user.user_metadata?.invited_role))

        const res = await fetch('/api/institution/me')
        if (res.ok) {
          const data = await res.json()
          setInstitutionName(data.institution_name || '')
          if (data.profile_complete) {
            router.replace('/institution/dashboard')
            return
          }
          const p = data.profile
          if (p) {
            setFirstName(p.first_name || '')
            setLastName(p.last_name || '')
            setJobTitle(p.job_title || '')
            setWorkEmail(p.work_email || user.email || '')
            setPhone(p.phone || '')
            setDepartment(p.department || '')
            setNotes(p.notes_for_support || '')
            setContactConsent(!!p.contact_consent)
          } else {
            setFirstName(user.user_metadata?.invited_first_name || '')
            setLastName(user.user_metadata?.invited_last_name || '')
          }
        }
      } catch {
        setError('Failed to load onboarding context')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [router, supabase])

  const validatePassword = (value: string) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (needsPassword) {
        if (!validatePassword(password)) {
          throw new Error('Password must be at least 8 characters with upper, lower, and a number')
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { error: pwError } = await supabase.auth.updateUser({ password })
        if (pwError) {
          const msg = pwError.message.toLowerCase()
          const alreadySet =
            msg.includes('same password') ||
            msg.includes('should be different') ||
            msg.includes('already')
          if (!alreadySet) {
            throw new Error(pwError.message)
          }
        }
      }

      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('First and last name are required')
      }
      if (!jobTitle.trim()) {
        throw new Error('Job title is required')
      }
      if (!privacyAccepted) {
        throw new Error('You must accept the privacy notice')
      }
      if (!termsAccepted) {
        throw new Error('You must accept the terms of service')
      }

      const res = await fetchWithCSRF('/api/institution/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: jobTitle.trim(),
          work_email: workEmail.trim(),
          phone: phone.trim() || null,
          department: department.trim() || null,
          notes_for_support: notes.trim() || null,
          contact_consent: contactConsent,
          privacy_notice_accepted: privacyAccepted,
          terms_accepted: termsAccepted,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save profile')

      router.replace('/institution/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading your invitation…
      </div>
    )
  }

  return (
    <Card className="border-teal-100 dark:border-teal-900/40 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium">Complete your admin registration</span>
        </div>
        <CardTitle className="text-2xl">Welcome to the institution portal</CardTitle>
        <CardDescription>
          {institutionName
            ? `You've been invited as an administrator for ${institutionName}.`
            : 'Finish setting up your account to view anonymised student insights.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {needsPassword && (
            <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                Set your password
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                At least 8 characters, including uppercase, lowercase, and a number.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Your details
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title / role *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Director of Student Housing"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEmail">Work email *</Label>
              <Input
                id="workEmail"
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department (optional)</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for platform support (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Topics you care about, preferred contact times, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(v) => setPrivacyAccepted(!!v)}
              />
              <Label htmlFor="privacy" className="leading-snug cursor-pointer">
                I have read and accept the{' '}
                <a href="/privacy" className="text-teal-600 underline" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>{' '}
                regarding how my contact details are processed. *
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(!!v)}
              />
              <Label htmlFor="terms" className="leading-snug cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-teal-600 underline" target="_blank" rel="noreferrer">
                  Terms of Service
                </a>
                . *
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="contactConsent"
                checked={contactConsent}
                onCheckedChange={(v) => setContactConsent(!!v)}
              />
              <Label htmlFor="contactConsent" className="leading-snug cursor-pointer">
                I consent to being contacted about platform partnership matters (optional).
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Complete registration'
            )}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Signed in as {email}. Student data in the portal is anonymised — no names or emails are
            shown.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
