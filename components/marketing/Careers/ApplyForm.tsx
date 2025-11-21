'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { GROUPS } from '@/components/marketing/Careers/RoleCatalogCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, GraduationCap, MapPin } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { useApp } from '@/app/providers'

const ApplicationSchema = z.object({
  track: z.enum(['experienced', 'student']),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  skills: z.string().min(2, 'Tell us a bit about your skills'),
  tools: z.string().optional().default(''),
  timeCommitment: z.string().min(1, 'Please share your expected commitment'),
  exampleProject: z.string().min(2, 'Share an example project or impact'),
  notes: z.string().optional().default(''),
  preferredArea: z.string().optional().default(''),
  courseProgram: z.string().optional().default(''),
  roles: z.array(z.string()).optional().default([])
})

type ApplicationForm = z.infer<typeof ApplicationSchema>

const content = {
  en: {
    title: 'Apply to join',
    yourDetails: 'Your details',
    track: 'Track',
    selectTrack: 'Select track',
    experiencedContributor: 'Experienced contributor',
    studentVolunteer: 'Student volunteer',
    trackHelp: 'Choose the option that best fits how you want to contribute.',
    currentCourse: 'Current course/program (optional)',
    coursePlaceholder: 'e.g., BSc Marketing, MSc HCI',
    courseHelp: 'Helps us align a project with your studies.',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    preferredArea: 'Preferred impact area (optional)',
    chooseArea: 'Choose an area',
    areaHelp: "We'll try to align you with work in this area.",
    skills: 'Skills',
    skillsPlaceholder: 'Tell us about your skills and strengths',
    skillsHelp: "Describe what you ship weekly and where you're most effective.",
    availability: 'Availability',
    tools: 'Tools (optional)',
    toolsPlaceholder: 'Figma, Python, SQL, Next.js…',
    toolsHelp: 'Optional',
    timeCommitment: 'Time commitment',
    timePlaceholder: 'e.g., 3–5 hrs/wk',
    timeHelp: 'What can you realistically dedicate each week?',
    interests: 'Interests',
    exampleProject: 'Example project or impact',
    examplePlaceholder: 'What would you like to help with?',
    rolesInterested: "Roles you're interested in",
    focusOutcome: 'Focus on meaningful outcomes',
    typicallyCommitment: 'Commitment: typically 3–5 hrs/week',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Anything else we should know?',
    submit: 'Submit application',
    submitNote: "Once submitted, expect a reply within 7 days. We'll schedule a 30‑min sync, scope a deliverable, and set up your Notion board before your first contribution.",
    successMessage: 'Thanks for applying. We will be in touch soon.',
    errorMessage: 'Something went wrong',
    failedSubmit: 'Failed to submit application'
  },
  nl: {
    title: 'Aanmelden om mee te doen',
    yourDetails: 'Jouw gegevens',
    track: 'Track',
    selectTrack: 'Selecteer track',
    experiencedContributor: 'Ervaren contributor',
    studentVolunteer: 'Studentvrijwilliger',
    trackHelp: 'Kies de optie die het beste past bij hoe je wilt bijdragen.',
    currentCourse: 'Huidige cursus/programma (optioneel)',
    coursePlaceholder: 'bijv. BSc Marketing, MSc HCI',
    courseHelp: 'Helpt ons een project af te stemmen op je studies.',
    name: 'Naam',
    namePlaceholder: 'Je naam',
    email: 'E-mail',
    emailPlaceholder: 'je@voorbeeld.nl',
    preferredArea: 'Gewenste impactgebied (optioneel)',
    chooseArea: 'Kies een gebied',
    areaHelp: 'We proberen je af te stemmen op werk in dit gebied.',
    skills: 'Vaardigheden',
    skillsPlaceholder: 'Vertel ons over je vaardigheden en sterke punten',
    skillsHelp: 'Beschrijf wat je wekelijks levert en waar je het meest effectief bent.',
    availability: 'Beschikbaarheid',
    tools: 'Tools (optioneel)',
    toolsPlaceholder: 'Figma, Python, SQL, Next.js…',
    toolsHelp: 'Optioneel',
    timeCommitment: 'Tijdsinzet',
    timePlaceholder: 'bijv. 3–5 uur/week',
    timeHelp: 'Wat kun je realistisch elke week besteden?',
    interests: 'Interesses',
    exampleProject: 'Voorbeeldproject of impact',
    examplePlaceholder: 'Waar zou je graag mee willen helpen?',
    rolesInterested: 'Rollen waarin je geïnteresseerd bent',
    focusOutcome: 'Focus op betekenisvolle resultaten',
    typicallyCommitment: 'Commitment: meestal 3–5 uur/week',
    notes: 'Notities (optioneel)',
    notesPlaceholder: 'Iets anders dat we moeten weten?',
    submit: 'Aanmelding indienen',
    submitNote: 'Na indiening kun je binnen 7 dagen een reactie verwachten. We plannen een 30 min sync, scopen een deliverable en stellen je Notion-board op voordat je eerste bijdrage.',
    successMessage: 'Bedankt voor je aanmelding. We nemen binnenkort contact op.',
    errorMessage: 'Er is iets misgegaan',
    failedSubmit: 'Aanmelding indienen mislukt'
  }
}

export function ApplyForm() {
  const { locale } = useApp()
  const t = content[locale]
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      track: 'experienced',
      name: '',
      email: '',
      skills: '',
      tools: '',
      timeCommitment: '',
      exampleProject: '',
      notes: '',
      preferredArea: '',
      courseProgram: '',
      roles: []
    }
  })

  const allRoles = GROUPS.flatMap(g => g.roles.map(r => ({ group: g.header, title: r.title })))

  const onSubmit = async (values: ApplicationForm) => {
    const notesWithRoles =
      values.roles && values.roles.length > 0
        ? `${values.notes ? values.notes + '\n' : ''}Roles: ${values.roles.join(', ')}`
        : values.notes || ''

    try {
      const res = await fetchWithCSRF('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, notes: notesWithRoles })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errorMessage = data?.error || t.failedSubmit
        const errorDetails = data?.details
        console.error('[ApplyForm] Submission failed:', { status: res.status, error: errorMessage, details: errorDetails })
        throw new Error(errorMessage + (errorDetails ? `: ${JSON.stringify(errorDetails)}` : ''))
      }
      toast.success(t.successMessage)
      form.reset()
    } catch (err: any) {
      console.error('[ApplyForm] Error:', err)
      toast.error(err?.message || t.errorMessage)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded-2xl border border-muted/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-5 text-sm" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="text-sm font-medium">{t.yourDetails}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.track}</Label>
                <Select
                  value={form.watch('track') || 'experienced'}
                  onValueChange={(v) => form.setValue('track', v as 'experienced' | 'student')}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder={t.selectTrack} />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="z-50">
                    <SelectItem value="experienced">{t.experiencedContributor}</SelectItem>
                    <SelectItem value="student">{t.studentVolunteer}</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.track && (
                  <p className="text-sm text-destructive">{form.formState.errors.track.message}</p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> {t.trackHelp}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseProgram">{t.currentCourse}</Label>
                <Input id="courseProgram" className="h-10 text-sm" {...form.register('courseProgram')} placeholder={t.coursePlaceholder} />
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" /> {t.courseHelp}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input id="name" className="h-10 text-sm" {...form.register('name')} placeholder={t.namePlaceholder} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" className="h-10 text-sm" {...form.register('email')} placeholder={t.emailPlaceholder} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.preferredArea}</Label>
              <Select
                value={form.watch('preferredArea')}
                onValueChange={(v) => form.setValue('preferredArea', v)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder={t.chooseArea} />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g.header} value={g.header}>{g.header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {t.areaHelp}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">{t.skills}</Label>
              <Textarea id="skills" rows={3} className="text-sm" {...form.register('skills')} placeholder={t.skillsPlaceholder} />
              {form.formState.errors.skills && (
                <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t.skillsHelp}
              </p>
            </div>

            <div className="text-sm font-medium">{t.availability}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tools">{t.tools}</Label>
                <Input id="tools" className="h-10 text-sm" {...form.register('tools')} placeholder={t.toolsPlaceholder} />
                <p className="text-xs text-muted-foreground">{t.toolsHelp}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeCommitment">{t.timeCommitment}</Label>
                <Input id="timeCommitment" className="h-10 text-sm" {...form.register('timeCommitment')} placeholder={t.timePlaceholder} />
                {form.formState.errors.timeCommitment && (
                  <p className="text-sm text-destructive">{form.formState.errors.timeCommitment.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t.timeHelp}
                </p>
              </div>
            </div>

            <div className="text-sm font-medium">{t.interests}</div>
            <div className="space-y-2">
              <Label htmlFor="exampleProject">{t.exampleProject}</Label>
              <Textarea id="exampleProject" rows={3} className="text-sm" {...form.register('exampleProject')} placeholder={t.examplePlaceholder} />
              {form.formState.errors.exampleProject && (
                <p className="text-sm text-destructive">{form.formState.errors.exampleProject.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>{t.rolesInterested}</Label>
              <div className="grid gap-4">
                {GROUPS.map((g) => (
                  <div key={g.header} className="rounded-xl border border-muted/40 bg-white/90 p-4 shadow-sm">
                    <details>
                      <summary className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-sm font-medium">{g.header}</span>
                        <span className="text-xs text-muted-foreground">{g.sub || t.focusOutcome} · {t.typicallyCommitment}</span>
                      </summary>
                      <div className="mt-3 space-y-2">
                        {g.roles.map((r) => {
                          const id = `${g.header}-${r.title}`
                          const checked = form.watch('roles')?.includes(r.title) || false
                          return (
                            <label key={id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5"
                                checked={checked}
                                onChange={(e) => {
                                  const current = new Set(form.getValues('roles'))
                                  if (e.target.checked) current.add(r.title)
                                  else current.delete(r.title)
                                  form.setValue('roles', Array.from(current))
                                }}
                              />
                              <span>{r.title}</span>
                            </label>
                          )
                        })}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea id="notes" rows={3} className="text-sm" {...form.register('notes')} placeholder={t.notesPlaceholder} />
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg">{t.submit}</Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {t.submitNote}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


