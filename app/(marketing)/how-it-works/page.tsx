import { HowItWorksSection } from '@/components/site/how-it-works-section'
import { SocialFinalCTA } from '@/components/site/social-final-cta'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { HowItWorksSafetyBand } from './how-it-works-safety-band'
import { Metadata } from 'next'

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
          <HowItWorksSafetyBand />
          <SocialFinalCTA />
        </div>
      </MarketingSubpageWrapperLight>
    </>
  )
}
