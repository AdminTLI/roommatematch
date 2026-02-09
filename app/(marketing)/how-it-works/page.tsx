import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { HowItWorksSection } from '@/components/site/how-it-works-section'
import { SafetySection } from '@/components/site/safety-section'
import { FinalCTA } from '@/components/site/final-cta'
import { MarketingPageBackground } from '../components/marketing-page-background'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Roommate Matching Works | Domu Match - Student Guide',
  description: 'Discover how our science-backed roommate matching works in the Netherlands. From sign-up to move-in, learn about our verified student platform and compatibility algorithm.',
  keywords: [
    'how roommate matching works',
    'student housing process Netherlands',
    'roommate finder process',
    'housing matching algorithm',
    'how to find roommate Netherlands',
    'student housing platform process',
    'roommate matching steps',
    'verified roommate matching',
    'roommate matching guide',
    'how to use roommate app',
    'student housing matching process',
    'find roommate step by step',
    'roommate compatibility matching',
    'verified student platform',
  ],
  openGraph: {
    title: 'How Roommate Matching Works | Domu Match',
    description: 'Discover how our science-backed roommate matching works in the Netherlands. From sign-up to move-in, learn about our verified student platform.',
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
            text: 'Create an account with your university email address',
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
            text: 'Answer questions about your lifestyle, study habits, and preferences',
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
      <main
        id="main-content"
        className="relative pt-16 md:pt-20 overflow-hidden"
      >
        <MarketingPageBackground />
        <div className="relative z-10">
          <Navbar />
          <div>
            <HowItWorksSection />
            <SafetySection />
            <FinalCTA variant="dark" />
          </div>
          <Footer />
        </div>
      </main>
    </>
  )
}
