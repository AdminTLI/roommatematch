import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tracks } from '@/components/marketing/Careers/Tracks'
import { RoleCatalogCards } from '@/components/marketing/Careers/RoleCatalogCards'
import { Benefits } from '@/components/marketing/Careers/Benefits'
import { ApplyDialog } from '@/components/marketing/Careers/ApplyDialog'
import { Badge } from '@/components/ui/badge'
import { ProcessRibbon } from '@/components/marketing/Careers/ProcessRibbon'
import { ApplyProcessFAQ } from '@/components/marketing/Careers/ApplyProcessFAQ'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | Domu Match - Join Our Community',
  description: 'Volunteer with Domu Match as an experienced contributor or student. Build real impact on roommate safety and trust in the Netherlands. Join our mission-driven team.',
  keywords: [
    'Domu Match careers',
    'roommate matching jobs',
    'student housing careers',
    'volunteer opportunities Netherlands',
    'tech volunteer positions',
    'student housing platform jobs',
    'roommate matching company careers',
  ],
  openGraph: {
    title: 'Careers | Domu Match - Join Our Community',
    description: 'Volunteer with Domu Match as an experienced contributor or student. Build real impact on roommate safety and trust.',
    type: 'website',
    url: 'https://domumatch.vercel.app/careers',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Careers at Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Domu Match - Join Our Community',
    description: 'Volunteer with Domu Match. Build real impact on roommate safety and trust in the Netherlands.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/careers',
  },
}

export default function CareersPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://domumatch.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Careers',
        item: 'https://domumatch.vercel.app/careers',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content">
        <Navbar />

      <Section className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-4xl text-center py-12 sm:py-18 space-y-7">
            <div className="mb-3 flex items-center justify-center">
              <Badge variant="secondary">Early builder mission: safer, happier student housing</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Join our <span className="text-brand-primary">community of builders</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We’re mission‑driven to improve roommate safety and trust. Join as an experienced builder
              or as a student gaining real‑world experience - every contribution drives tangible impact.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild>
                <a href="#tracks">Explore tracks</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#roles">Meet the community</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Collaborate directly with the founder - small, focused projects with clear outcomes.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="relative overflow-hidden bg-white !py-4 md:!py-6 lg:!py-8">
        <Container>
          <div className="py-0">
            <ProcessRibbon />
          </div>
        </Container>
      </Section>

      <Section id="tracks" className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-5xl pt-8 pb-4 sm:pt-10 sm:pb-6">
            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Two ways to join
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-3xl mx-auto">
                Choose the path that fits your goals—both contribute directly to our mission.
              </p>
            </div>
            <Tracks />
          </div>
        </Container>
      </Section>

      <Section id="roles" className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-5xl pt-1 pb-4 sm:pt-2 sm:pb-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Role catalog by capability area
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-3xl mx-auto">
                Explore the capability areas and pick where you want to contribute.
              </p>
            </div>
            <RoleCatalogCards />
          </div>
        </Container>
      </Section>

      <Section id="focus" className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-5xl py-5 sm:py-6">
            <div className="mb-3 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight"><span className="text-brand-primary">Current focus</span> and open priorities</h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-3xl mx-auto">Plug in where it matters most right now.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="font-medium">Onboarding flows</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Reduce friction in verification and profile completion.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="font-medium">Matching quality</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Define metrics and improve suggestion relevance.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="font-medium">University partnerships</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Shape outreach and partner-facing materials.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              We don’t have a team yet. You’ll be in the builder seat.
            </p>
          </div>
        </Container>
      </Section>

      <Section id="benefits" className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-5xl py-5 sm:py-6">
            <div className="mb-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Volunteer experience <span className="text-brand-primary">benefits</span>
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-3xl mx-auto">
                Grow your skills while contributing to a safety‑first student platform.
              </p>
            </div>
            <Benefits />
          </div>
        </Container>
      </Section>

      <Section id="apply" className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center py-10 sm:py-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Tell us how <span className="text-brand-primary">you want to help</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              Choose your track, share your skills and time commitment, and
              we’ll get back to you.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Founder-led review happens weekly. Once we scope your time, you’ll get a Notion board with your project tasks and milestones.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We have zero volunteers right now—so you’ll set the tone. We review applications weekly and align on a scoped project before you commit.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <ApplyDialog cta="Open application form" />
            </div>
          </div>
          <div className="py-6">
            <ApplyProcessFAQ />
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
    </>
  )
}


