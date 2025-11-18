'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

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
})

type ApplicationForm = z.infer<typeof ApplicationSchema>

export function ApplyDialog({ cta = 'Apply now' }: { cta?: string }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    },
  })

  const onSubmit = async (values: ApplicationForm) => {
    try {
      setSubmitting(true)
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to submit application')
      }

      toast.success('Application submitted. We’ll be in touch soon.')
      form.reset()
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">{cta}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl pr-6">Apply to join the builder community</DialogTitle>
          <DialogDescription className="text-sm sm:text-base leading-relaxed">
            Choose your track and tell us about your skills and interests. This is a volunteer experience (unpaid) designed for mentorship, portfolio‑quality work, and real impact.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 sm:space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Track</Label>
              <Select
                value={form.watch('track')}
                onValueChange={(v) => form.setValue('track', v as 'experienced' | 'student')}
              >
                <SelectTrigger className="h-10 sm:h-11 text-sm">
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experienced">Experienced contributor</SelectItem>
                  <SelectItem value="student">Student volunteer</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.track && (
                <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.track.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input id="name" className="h-10 sm:h-11 text-sm" {...form.register('name')} placeholder="Your name" />
              {form.formState.errors.name && (
                <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preferred impact area (optional)</Label>
            <Select
              value={form.watch('preferredArea')}
              onValueChange={(v) => form.setValue('preferredArea', v)}
            >
              <SelectTrigger className="h-10 sm:h-11 text-sm">
                <SelectValue placeholder="Choose an area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Product & Operations">Product & Operations</SelectItem>
                <SelectItem value="Engineering & Data">Engineering & Data</SelectItem>
                <SelectItem value="Design & Experience">Design & Experience</SelectItem>
                <SelectItem value="Marketing & Community">Marketing & Community</SelectItem>
                <SelectItem value="Trust & Safety / Admissions">Trust & Safety / Admissions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" type="email" className="h-10 sm:h-11 text-sm" {...form.register('email')} placeholder="you@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseProgram" className="text-sm font-medium">Current course/program (optional)</Label>
            <Input id="courseProgram" className="h-10 sm:h-11 text-sm" {...form.register('courseProgram')} placeholder="e.g., BSc Marketing, MSc HCI, BA Sociology" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
            <Textarea id="skills" className="text-sm min-h-[80px] resize-none" {...form.register('skills')} placeholder="Tell us about your skills and strengths" rows={3} />
            {form.formState.errors.skills && (
              <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.skills.message}</p>
            )}
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tools" className="text-sm font-medium">Tools (optional)</Label>
              <Input id="tools" className="h-10 sm:h-11 text-sm" {...form.register('tools')} placeholder="Figma, Python, SQL, Next.js…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeCommitment" className="text-sm font-medium">Time commitment</Label>
              <Input id="timeCommitment" className="h-10 sm:h-11 text-sm" {...form.register('timeCommitment')} placeholder="e.g., 3–5 hrs/week" />
              {form.formState.errors.timeCommitment && (
                <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.timeCommitment.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exampleProject" className="text-sm font-medium">Example project or impact</Label>
            <Textarea id="exampleProject" className="text-sm min-h-[80px] resize-none" {...form.register('exampleProject')} placeholder="What would you like to help with?" rows={3} />
            {form.formState.errors.exampleProject && (
              <p className="text-xs sm:text-sm text-destructive mt-1">{form.formState.errors.exampleProject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
            <Textarea id="notes" className="text-sm min-h-[80px] resize-none" {...form.register('notes')} placeholder="Anything else we should know?" rows={3} />
          </div>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t border-border/40 mt-4 sm:mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto h-10 sm:h-11 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto h-10 sm:h-11 order-1 sm:order-2">
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


