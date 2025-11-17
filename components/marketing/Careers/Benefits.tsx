import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, GraduationCap, Shield, Target } from 'lucide-react'

export function Benefits() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="h-full text-center rounded-2xl border border-muted/40 bg-white shadow-sm hover:shadow-md transition">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10">
            <Briefcase className="h-5 w-5 text-brand-primary" />
          </div>
          <CardTitle className="text-lg">What volunteers get</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">
            Ship real work with thoughtful review and support.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Portfolio pieces</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Mentorship</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">References</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full text-center rounded-2xl border border-muted/40 bg-white shadow-sm hover:shadow-md transition">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10">
            <GraduationCap className="h-5 w-5 text-brand-primary" />
          </div>
          <CardTitle className="text-lg">Student benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">
            Learn by building on a live platform - research, design, analytics, and growth.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Growth experiments</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Analytics & matching</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">UX & content</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full text-center rounded-2xl border border-muted/40 bg-white shadow-sm hover:shadow-md transition">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10">
            <Shield className="h-5 w-5 text-brand-primary" />
          </div>
          <CardTitle className="text-lg">Why we do it</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm px-6 pb-6">
            <p className="text-muted-foreground leading-relaxed">
              Safer, happier student housing - privacy‑first, accessible, evidence‑based.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Privacy‑first</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Accessible</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Evidence‑based</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full text-center rounded-2xl border border-muted/40 bg-white shadow-sm hover:shadow-md transition">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10">
            <Target className="h-5 w-5 text-brand-primary" />
          </div>
          <CardTitle className="text-lg">Immediate priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">
            Help where it counts now - your work ships fast.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Onboarding verification</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Matching metrics</span>
            <span className="inline-flex items-center rounded-full bg-muted/40 px-3 py-1 text-xs">Campus partnerships</span>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


