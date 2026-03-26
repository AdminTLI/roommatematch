import { HowItWorksSection } from '@/components/site/how-it-works-section'
import { SocialFinalCTA } from '@/components/site/social-final-cta'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { Metadata } from 'next'
import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How Roommate Matching Works | Domu Match - Guide for Students & Young Professionals',
  description: 'Discover how our science-backed roommate matching works in the Netherlands. From sign-up to move-in, for verified students and young professionals. Compatibility algorithm, ID verification, separate pools.',
  keywords: [
    'how roommate matching works',
    'student housing process Netherlands',
    'roommate finder process',
    'young professionals flatmate',
    'housing matching algorithm',
    'how to find roommate Netherlands',
    'student housing platform process',
    'roommate matching steps',
    'verified roommate matching',
    'roommate matching guide',
    'how to use roommate app',
    'find roommate step by step',
    'roommate compatibility matching',
    'verified platform',
  ],
  openGraph: {
    title: 'How Roommate Matching Works | Domu Match',
    description: 'Discover how our science-backed roommate matching works in the Netherlands. For verified students and young professionals.',
    type: 'website',
    url: 'https://domumatch.com/how-it-works',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'How Roommate Matching Works - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Roommate Matching Works | Domu Match',
    description: 'Discover how our science-backed roommate matching works in the Netherlands.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/how-it-works',
  },
}

export default function HowItWorksPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How Roommate Matching Works',
        description: 'Step-by-step guide to using Domu Match roommate matching platform',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Sign Up',
            text: 'Create an account with your email. Students use a university email address; young professionals use their email.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Verify Your Identity',
            text: 'Complete identity verification with government ID and selfie for safety',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Complete Compatibility Quiz',
            text: 'Answer questions about your lifestyle, daily rhythms, and preferences',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Get Matched',
            text: 'Receive compatible roommate matches based on 40+ factors',
          },
          {
            '@type': 'HowToStep',
            position: 5,
            name: 'Connect and Chat',
            text: 'Message your matches safely through our platform',
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'How It Works',
            item: 'https://domumatch.com/how-it-works',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <div>
          <HowItWorksSection />
          <Section className="py-10 md:py-14 lg:py-16">
            <Container className="relative z-10">
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                      Safety built in
                    </div>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                      Verified people. Calm, safe chat.
                    </h2>
                    <p className="mt-3 text-slate-600">
                      Everyone is government‑ID verified before they can chat. You can always block or report, and you stay in your life‑stage pool (students with students, professionals with professionals).
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                    <Button
                      size="lg"
                      className="bg-slate-900 text-white hover:bg-slate-900/90 shadow-[0_12px_30px_rgba(15,23,42,0.18)] rounded-2xl"
                      asChild
                    >
                      <Link href="/auth/sign-up">Get started</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/50 backdrop-blur-xl border-white/60 text-slate-800 hover:bg-white/70 rounded-2xl"
                      asChild
                    >
                      <Link href="/safety">Safety</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
          <SocialFinalCTA />
        </div>
      </MarketingSubpageWrapperLight>
    </>
  )
}
