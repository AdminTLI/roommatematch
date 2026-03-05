'use client'

import { Navbar } from '@/components/site/navbar'
import { HeroAurora } from '@/components/site/hero-aurora'
import { LiveStats } from './components/live-stats'
import { BentoInfrastructure } from '@/components/site/bento-infrastructure'
import { Universities } from '@/components/site/universities'
import { Features } from '@/components/site/features'
import { Testimonials } from '@/components/site/testimonials'
import Footer from '@/components/site/footer'
import { MarketingLayoutFix } from './components/marketing-layout-fix'
import { StatsTicker } from './components/stats-ticker'
import { MarketingPageBackground } from './components/marketing-page-background'
import { WolfpackGroupChatsSection } from './components/wolfpack-group-chats-section'
import { SegregatedPoolsSection } from './components/segregated-pools-section'

export default function MarketingPage() {

  // Structured data for homepage
  const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://domumatch.com/#organization',
        name: 'Domu Match',
        url: 'https://domumatch.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://domumatch.com/images/logo.png',
          width: 1200,
          height: 630,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@domumatch.com',
          contactType: 'Customer Service',
        },
        sameAs: [
          'https://www.linkedin.com/company/domu-match',
          'https://www.instagram.com/domumatch',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://domumatch.com/#website',
        url: 'https://domumatch.com',
        name: 'Domu Match',
        description: 'Find compatible roommates in the Netherlands. Smart matching for verified students and young professionals.',
        publisher: {
          '@id': 'https://domumatch.com/#organization',
        },
        inLanguage: ['en-US', 'nl-NL'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://domumatch.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://domumatch.com/#localbusiness',
        name: 'Domu Match',
        image: 'https://domumatch.com/images/logo.png',
        sameAs: 'https://domumatch.com/#organization',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'NL',
          addressLocality: 'Netherlands',
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'Amsterdam',
          },
          {
            '@type': 'City',
            name: 'Rotterdam',
          },
          {
            '@type': 'City',
            name: 'Utrecht',
          },
          {
            '@type': 'City',
            name: 'Den Haag',
          },
          {
            '@type': 'City',
            name: 'Eindhoven',
          },
          {
            '@type': 'City',
            name: 'Groningen',
          },
          {
            '@type': 'City',
            name: 'Leiden',
          },
          {
            '@type': 'City',
            name: 'Nijmegen',
          },
        ],
        serviceType: 'Roommate Matching Service',
        description: 'AI-driven roommate matching for verified students and young professionals in the Netherlands.',
        priceRange: 'Free for students and young professionals',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://domumatch.com/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.com',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is Domu Match free for students and young professionals?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Domu Match is free for both students and young professionals in the Netherlands. Our platform helps you find compatible roommates at no cost.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the roommate matching work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our AI-powered algorithm analyzes 40+ factors including lifestyle habits, study schedules, cleanliness preferences, and personality traits to match you with compatible roommates. The system uses science-backed compatibility scoring to prevent conflicts before they start.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Domu Match only for students in the Netherlands?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Domu Match serves both verified students and young professionals in the Netherlands. Students match only with other students; professionals only with other professionals. We partner with 50+ universities and serve major cities including Amsterdam, Rotterdam, Utrecht, and more.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I verify my student or young professional status?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Students: sign up with your university email to verify. Young professionals: sign up with your email and complete our young-professional verification flow. All users are verified to ensure a safe, trustworthy community.',
            },
          },
          {
            '@type': 'Question',
            name: 'What makes Domu Match different from other roommate apps?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Domu Match uses science-backed compatibility matching with transparent explanations, verified access for students and young professionals (in separate pools), integration with Dutch universities, and explainable AI that shows you why matches are compatible. We focus on the Dutch shared-living market for both segments.',
            },
          },
        ],
      },
      {
        '@type': 'Product',
        name: 'Domu Match Roommate Matching Service',
        description: 'AI-powered roommate matching for verified students and young professionals in the Netherlands',
        brand: {
          '@type': 'Brand',
          name: 'Domu Match',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: 'https://domumatch.com',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
      },
    ],
  }

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden">
        <MarketingPageBackground />
        <div className="relative z-10">
          <Navbar />
          <HeroAurora />
          <StatsTicker />
          <LiveStats />
          <SegregatedPoolsSection />
          <BentoInfrastructure />
          <WolfpackGroupChatsSection />
          <Universities />
          <Features />
          <Testimonials />
          <Footer />
        </div>
      </main>
    </>
  )
}
