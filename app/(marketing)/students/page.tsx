import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FeaturesForStudents } from '@/components/site/features-for-students'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Students | Domu Match - Science-Backed Roommate Matching',
  description:
    "Don't let a bad roommate ruin your year. The only student platform that matches you on lifestyle, sleep schedules, and study habits. 100% ID Verified. Zero Scams. Perfect for international students.",
  keywords: [
    'student roommate matching',
    'international student housing',
    'first year roommate finder',
    'compatibility matching students',
    'ID verified roommate platform',
    'science-backed roommate matching',
    'student housing Netherlands',
    'roommate conflict prevention',
    'lifestyle matching students',
    'verified student roommates',
  ],
  openGraph: {
    title: 'For Students | Domu Match - Find Your Perfect Roommate',
    description:
      "The only student platform that matches you on lifestyle, sleep schedules, and study habits. 100% ID Verified. Zero Scams.",
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
      "The only student platform that matches you on lifestyle, sleep schedules, and study habits. 100% ID Verified.",
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
      name: 'How does the roommate matching algorithm work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Our algorithm analyzes 40+ compatibility factors including sleep schedules, cleanliness preferences, social habits, study routines, noise tolerance, and personality traits. We use science-backed research on roommate compatibility to weight these factors appropriately. You get a Harmony score showing how well you match before you even say hello.",
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
        text: 'Every user on Domu Match is government-ID verified through Persona before they can chat. No bots, no fake profiles, no AI-generated identities. We also verify student status through university email addresses. If something feels wrong, our safety team reviews reports within 24 hours.',
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
      <main id="main-content" className="min-h-screen bg-white pt-16 md:pt-20 pb-24">
        <Navbar />
        <div>
          <FeaturesForStudents />
        </div>
        <Footer />
      </main>
    </>
  )
}
