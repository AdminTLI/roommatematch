'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Settings } from 'lucide-react'
import { InstitutionPageHeader } from '../../components/institution-shell'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

export function InstitutionSettingsContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [institutionName, setInstitutionName] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [notes, setNotes] = useState('')
  const [contactConsent, setContactConsent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/institution/me')
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        setInstitutionName(data.institution_name || '')
        const p = data.profile
        if (p) {
          setFirstName(p.first_name || '')
          setLastName(p.last_name || '')
          setJobTitle(p.job_title || '')
          setWorkEmail(p.work_email || '')
          setPhone(p.phone || '')
          setDepartment(p.department || '')
          setNotes(p.notes_for_support || '')
          setContactConsent(!!p.contact_consent)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF('/api/institution/profile', {
        method: 'PATCH',
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
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSuccess('Profile updated.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <InstitutionPageHeader
        title="Your profile"
        description={`Update your contact details for ${institutionName || 'your institution'}.`}
        icon={Settings}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
          <CardDescription>
            This information helps our team know who to contact about partnership matters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEmail">Work email</Label>
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
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for support</Label>
              <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="contactConsent"
                checked={contactConsent}
                onCheckedChange={(v) => setContactConsent(!!v)}
              />
              <Label htmlFor="contactConsent" className="text-sm leading-snug cursor-pointer">
                I consent to being contacted about platform partnership matters.
              </Label>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
