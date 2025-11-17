import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, ClipboardList, Target, Users, Rocket } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Tracks() {
  return (
    <>
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
      <Card className="h-full">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-brand-primary text-xl sm:text-2xl">Experienced contributors</CardTitle>
            <div className="mt-1">
              <Badge variant="secondary">Pro bono</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-muted-foreground text-center">
            Professionals and grads who care about the mission and want to contribute hands‑on.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Target className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Ship trust & safety features
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Collaborate with a focused team
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Rocket className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Flexible, sprint‑style work
            </div>
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground text-center">
            Pitch an idea or choose a scoped project. Light onboarding included.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
              <CalendarClock className="h-3 w-3" /> Time: sprint‑style
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
              <ClipboardList className="h-3 w-3" /> Deliverable: scoped issue(s)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            We’ll reply within one week, scope a project, and share a Notion board to get started.
          </p>
          {/* CTA removed per request - single CTA will appear below both cards */}
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-brand-primary text-xl sm:text-2xl">Student volunteers</CardTitle>
            <div className="mt-1">
              <Badge>Student-ready</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-muted-foreground text-center">
            Students build real projects in marketing, product, design, research, data, and more.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Rocket className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Portfolio work on a live platform
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Mentorship and review
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Target className="mx-auto h-4 w-4 text-brand-primary mb-1" />
              Aligned with your studies
            </div>
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground text-center">
            Choose an area; we scope a project and onboard you. Typical time: 3–5 hrs/week.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
              <CalendarClock className="h-3 w-3" /> Time: 3–5 hrs/week
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
              <ClipboardList className="h-3 w-3" /> Deliverable: scoped project
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            We’ll reply within one week, scope a project aligned to your studies, and share a Notion board.
          </p>
          {/* CTA removed per request - single CTA will appear below both cards */}
        </CardContent>
      </Card>
    </div>
    {/* Single CTA below cards */}
    <div className="mt-6 text-center">
      <Button asChild size="lg">
        <a href="/careers/apply">Apply to join</a>
      </Button>
    </div>
    </>
  )
}


