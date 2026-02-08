import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversitiesLanding } from '@/components/site/universities-landing'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Universities | Domu Match - Retention Infrastructure & Student Wellbeing',
  description:
    'Housing stability = student retention. GDPR-compliant Student Wellbeing Dashboard for Dutch universities. Aggregated insights, psychological matching, zero scams. Pilot programme for 2026.',
  keywords: [
    'university housing',
    'student retention',
    'student wellbeing dashboard',
    'GDPR compliant analytics',
    'Dutch universities',
    'roommate matching universities',
    'student housing Netherlands',
    'aggregated insights',
    'housing coordinator',
    'student success',
  ],
  openGraph: {
    title: 'For Universities | Domu Match - Retention & Wellbeing',
    description:
      'Housing stability = student retention. GDPR-compliant Student Wellbeing Dashboard for Dutch universities. Pilot programme 2026.',
    type: 'website',
    url: 'https://domumatch.com/universities',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match - For Universities',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Universities | Domu Match',
    description:
      'Housing stability = student retention. GDPR-compliant Student Wellbeing Dashboard for Dutch universities.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/universities',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does this integrate with our existing SIS (Student Information System)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We offer API access and custom integrations for Enterprise partners. We can connect with most student information systems to sync programmes and support single sign-on. Pilot programmes can start with manual or CSV-based setup and add SIS integration as you scale.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you handle student consent for data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Students give explicit consent before any of their data is used for matching or analytics. For university dashboards we only provide aggregated, anonymized insights - no identifiable student data is shared. We support full "Right to be Forgotten" and data export in line with GDPR.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the cost model for universities?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer pilot programmes with transparent pricing. Founding Partners in the 2026 pilot lock in preferential rates for the first 2 years and can start with a 6-month free trial. Contact us for a tailored proposal based on your cohort size and needs.',
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
      name: 'For Universities',
      item: 'https://domumatch.com/universities',
    },
  ],
}

export default function UniversitiesPage() {
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
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20 pb-24">
        <Navbar />
        <div>
          <UniversitiesLanding />
        </div>
        <Footer />
      </main>
    </>
  )
}
