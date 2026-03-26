import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, MessageSquare, Sparkles } from 'lucide-react'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_18px_50px_rgba(15,23,42,0.08)] rounded-3xl'

export function ApplyProcessFAQ() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
      <Card className={cn(GLASS, 'border-white/60')}>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-900 text-xl">Application process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {[
              {
                icon: CheckCircle2,
                title: 'Apply',
                body: 'Pick your track and share what you want to contribute.',
              },
              {
                icon: MessageSquare,
                title: '30‑min sync',
                body: 'Align with the founder on scope, timeline, and outcomes.',
              },
              {
                icon: Sparkles,
                title: 'Start shipping',
                body: 'Begin with a scoped project or a few starter issues.',
              },
            ].map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-2xl border border-white/60 bg-white/55 p-4"
                >
                  <div className="mt-0.5 h-10 w-10 rounded-2xl border border-white/70 bg-white/60 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-slate-800" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900">{step.title}</div>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-4 py-3">
            <div className="h-9 w-9 rounded-2xl border border-white/70 bg-white/60 grid place-items-center shrink-0">
              <Clock className="h-4 w-4 text-slate-700" aria-hidden />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Weekly review. Typical commitment: 3-5 hrs/week.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(GLASS, 'border-white/60')}>
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-900 text-xl">FAQ</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="paid" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                Is this paid?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                This is a volunteer builder program right now. In return, you get founder mentorship, portfolio-quality shipped work, and a strong reference based on concrete contributions. If we open paid roles later, early contributors are first in line to be considered.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="exams" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                What if I have exams?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                Totally fine. We keep scopes small and flexible, so you can pause during exams and pick things up after. We will agree on a realistic weekly time range and choose work that does not create pressure if you need to skip a week.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="references" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                Do you provide references?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                Yes. If you ship work and collaborate well, we can provide a reference or letter that reflects what you actually delivered, how you worked, and the impact you made. We can also point to public work (with your permission) like merged PRs, a case study, or a shipped page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="time" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                How much time do I need per week?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                Most contributors do best with a consistent 3-5 hours per week. That is enough to make progress, get feedback, and ship something real without it taking over your schedule. If you have less time, we can pick smaller tasks like copy improvements, QA checks, or a single scoped bug fix.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="start" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                I am new - can I still contribute?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                Yes. If you are newer, we will start you with beginner-friendly, well-scoped work and clear success criteria. You will get guidance, quick feedback loops, and tasks that build your confidence while still helping users. If you are experienced, we will lean into higher-leverage problems where you can move faster.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tools" className="border-0">
              <AccordionTrigger className="no-underline hover:no-underline rounded-2xl border border-white/60 bg-white/55 px-4 py-4 text-left text-slate-900 hover:bg-white/70">
                What tools will we use to collaborate?
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-2 text-slate-700 leading-relaxed">
                We keep it simple and async-first. You will get a small project board for tasks and milestones, and we coordinate in short check-ins when needed. Engineering work ships through GitHub PRs, and we can share a clear definition of done so you always know what "finished" looks like.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}


