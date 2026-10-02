import Link from 'next/link'
import { FeaturesForStudents } from '@/components/site/features-for-students'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Students | Domu Match - Roommate Matching That Fits How You Live',
  description:
    'Your best years deserve the right roommates. Matching on lifestyle, sleep, and study habits. 100% ID verified. Built for students and internationals in the Netherlands.',
  keywords: [
    'student roommate matching',
    'international student housing',
    'first year roommate finder',
    'compatibility matching students',
    'ID verified roommate app',
    'student housing Netherlands',
    'roommate conflict prevention',
    'lifestyle matching students',
    'verified student roommates',
  ],
  openGraph: {
    title: 'For Students | Domu Match - Find Housemates Who Fit',
    description:
      'Made for students. We match you on lifestyle, sleep schedules, and study habits. 100% ID Verified. Zero Scams.',
    type: 'website',
    url: 'https://domumatch.com/students',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match - For Students',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domu Match - For Students',
    description:
      'Made for students. We match you on lifestyle, sleep schedules, and study habits. 100% ID Verified.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/students',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does roommate matching work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We look at how you live day to day - sleep, cleanliness, guests, study rhythm, noise, and more. You get a Harmony score (how well you'd click living together) before you say hello, plus clear reasons why.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Domu Match free for students?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Domu Match is completely free for all students in the Netherlands. There are no hidden fees, no premium tiers, and no charges for messaging or viewing matches. We believe finding a compatible roommate should be accessible to everyone.',
      },
    },
    {
      '@type': 'Question',
      name: "Can I find a roommate if I don't have a room yet?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolutely! You can use Domu Match whether you're looking for roommates for an existing apartment or searching for housing together with potential matches. Many users find their roommate first, then search for housing together. It's perfect for international students arriving without housing.",
      },
    },
    {
      '@type': 'Question',
      name: 'How do you prevent housing scams?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every user on Domu Match is government-ID verified through Persona before they can chat. No bots, no fake profiles, no AI-generated identities. We don’t keep your ID photos — Persona runs that check; we mainly store that you passed. We also verify student status through university email addresses. If something feels wrong, our safety team reviews reports within 24 hours.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
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
      name: 'For Students',
      item: 'https://domumatch.com/students',
    },
  ],
}

export default function StudentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingSubpageWrapperLight>
        <div>
          <FeaturesForStudents />
        </div>
        <div className="relative z-10 border-t border-white/60 bg-white/35 backdrop-blur-xl py-4">
          <div className="container mx-auto px-4 text-center text-sm text-slate-700">
            We also help{' '}
            <Link
              href="/young-professionals"
              className="text-slate-900 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              young professionals
            </Link>{' '}
            find compatible flatmates.
          </div>
        </div>
      </MarketingSubpageWrapperLight>
    </>
  )
}
