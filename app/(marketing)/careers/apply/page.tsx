import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { ApplyForm } from '@/components/marketing/Careers/ApplyForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Apply to join – Domu Match',
  description: 'Tell us about yourself and the roles you’re interested in.'
}

export default function CareersApplyPage() {
  return (
    <main id="main-content">
      <Navbar />
      <Section className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-5xl text-center py-10 sm:py-12 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Apply to join
            </h1>
            <p className="text-muted-foreground">
              Share your skills, time commitment, and the roles you’re excited about.
            </p>
            <p className="text-sm text-muted-foreground">
              Because we’re pre‑team, every applicant will work directly with the founder to scope meaningful projects.
            </p>
          </div>

          
          <div className="mx-auto max-w-6xl space-y-6">
            <Card className="rounded-2xl border border-muted/40 bg-gradient-to-b from-brand-primary/5 to-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-center">Why your contribution matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <p className="text-muted-foreground max-w-2xl mx-auto text-center">
                  We’re building practical systems for safer, happier student housing. Your work ships fast and shapes how we build.
                </p>
                <div className="space-y-2 max-w-2xl mx-auto">
                  <div className="text-sm font-medium text-center">Current focus</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                    <li>Refine onboarding conversion and verification flow</li>
                    <li>Tighten matching quality signals and simple metrics</li>
                    <li>Design campus‑ready growth experiments</li>
                  </ul>
                </div>
                <div className="rounded-md border border-muted/40 bg-white/70 p-3 text-xs text-center max-w-2xl mx-auto">
                  <div className="font-medium text-foreground mb-1">Opportunity</div>
                  <p className="text-muted-foreground leading-relaxed">
                    You may be the first contributor in your area — set the standard and leave strong references behind you.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="lg:mt-0">
              <ApplyForm />
            </div>
          </div>

        </Container>
      </Section>
      <Footer />
    </main>
  )
}


