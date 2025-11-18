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

export function ApplyForm() {
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
        const errorMessage = data?.error || 'Failed to submit application'
        const errorDetails = data?.details
        console.error('[ApplyForm] Submission failed:', { status: res.status, error: errorMessage, details: errorDetails })
        throw new Error(errorMessage + (errorDetails ? `: ${JSON.stringify(errorDetails)}` : ''))
      }
      toast.success('Thanks for applying. We will be in touch soon.')
      form.reset()
    } catch (err: any) {
      console.error('[ApplyForm] Error:', err)
      toast.error(err?.message || 'Something went wrong')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded-2xl border border-muted/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Apply to join</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-5 text-sm" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="text-sm font-medium">Your details</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Track</Label>
                <Select
                  value={form.watch('track') || 'experienced'}
                  onValueChange={(v) => form.setValue('track', v as 'experienced' | 'student')}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="z-50">
                    <SelectItem value="experienced">Experienced contributor</SelectItem>
                    <SelectItem value="student">Student volunteer</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.track && (
                  <p className="text-sm text-destructive">{form.formState.errors.track.message}</p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> Choose the option that best fits how you want to contribute.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseProgram">Current course/program (optional)</Label>
                <Input id="courseProgram" className="h-10 text-sm" {...form.register('courseProgram')} placeholder="e.g., BSc Marketing, MSc HCI" />
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" /> Helps us align a project with your studies.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" className="h-10 text-sm" {...form.register('name')} placeholder="Your name" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="h-10 text-sm" {...form.register('email')} placeholder="you@example.com" />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred impact area (optional)</Label>
              <Select
                value={form.watch('preferredArea')}
                onValueChange={(v) => form.setValue('preferredArea', v)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Choose an area" />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g.header} value={g.header}>{g.header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> We’ll try to align you with work in this area.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea id="skills" rows={3} className="text-sm" {...form.register('skills')} placeholder="Tell us about your skills and strengths" />
              {form.formState.errors.skills && (
                <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Describe what you ship weekly and where you’re most effective.
              </p>
            </div>

            <div className="text-sm font-medium">Availability</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tools">Tools (optional)</Label>
                <Input id="tools" className="h-10 text-sm" {...form.register('tools')} placeholder="Figma, Python, SQL, Next.js…" />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time commitment</Label>
                <Input id="timeCommitment" className="h-10 text-sm" {...form.register('timeCommitment')} placeholder="e.g., 3–5 hrs/wk" />
                {form.formState.errors.timeCommitment && (
                  <p className="text-sm text-destructive">{form.formState.errors.timeCommitment.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  What can you realistically dedicate each week?
                </p>
              </div>
            </div>

            <div className="text-sm font-medium">Interests</div>
            <div className="space-y-2">
              <Label htmlFor="exampleProject">Example project or impact</Label>
              <Textarea id="exampleProject" rows={3} className="text-sm" {...form.register('exampleProject')} placeholder="What would you like to help with?" />
              {form.formState.errors.exampleProject && (
                <p className="text-sm text-destructive">{form.formState.errors.exampleProject.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Roles you’re interested in</Label>
              <div className="grid gap-4">
                {GROUPS.map((g) => (
                  <div key={g.header} className="rounded-xl border border-muted/40 bg-white/90 p-4 shadow-sm">
                    <details>
                      <summary className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-sm font-medium">{g.header}</span>
                        <span className="text-xs text-muted-foreground">{g.sub || 'Focus on meaningful outcomes'} · Commitment: typically 3–5 hrs/week</span>
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
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={3} className="text-sm" {...form.register('notes')} placeholder="Anything else we should know?" />
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg">Submit application</Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Once submitted, expect a reply within 7 days. We’ll schedule a 30‑min sync, scope a deliverable, and set up your Notion board before your first contribution.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


