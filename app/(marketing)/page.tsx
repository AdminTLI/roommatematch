'use client'

import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { Features } from '@/components/site/features'
import { Testimonials } from '@/components/site/testimonials'
import { Universities } from '@/components/site/universities'
import Footer from '@/components/site/footer'
import { useApp } from '@/app/providers'
import { SocialProof } from './components/social-proof'
import { FinalCTA as MarketingFinalCTA } from './components/final-cta'
import { LiveStats } from './components/live-stats'
import { ResearchCarousel } from './components/research-carousel'

export default function MarketingPage() {
  const { locale } = useApp()
  
  // Structured data for homepage
  const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://domumatch.vercel.app/#organization',
        name: 'Domu Match',
        url: 'https://domumatch.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://domumatch.vercel.app/images/logo.png',
          width: 1200,
          height: 630,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'domumatch@gmail.com',
          contactType: 'Customer Service',
        },
        sameAs: [
          'https://www.linkedin.com/company/domu-match',
          'https://www.instagram.com/domumatch',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://domumatch.vercel.app/#website',
        url: 'https://domumatch.vercel.app',
        name: 'Domu Match',
        description: 'Find compatible roommates in the Netherlands with science-backed matching',
        publisher: {
          '@id': 'https://domumatch.vercel.app/#organization',
        },
        inLanguage: ['en-US', 'nl-NL'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://domumatch.vercel.app/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://domumatch.vercel.app/#localbusiness',
        name: 'Domu Match',
        image: 'https://domumatch.vercel.app/images/logo.png',
        sameAs: 'https://domumatch.vercel.app/#organization',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'NL',
          addressLocality: 'Netherlands',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Netherlands',
        },
        serviceType: 'Roommate Matching Service',
        description: 'Science-backed roommate matching platform for students in the Netherlands',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://domumatch.vercel.app/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.vercel.app',
          },
        ],
      },
    ],
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />
      <main id="main-content" className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <ResearchCarousel locale={locale} />
        <LiveStats locale={locale} />
        <Universities />
        <SocialProof locale={locale} />
        <Features />
        <Testimonials />
        <MarketingFinalCTA locale={locale} />
        <Footer />
      </main>
    </>
  )
}
