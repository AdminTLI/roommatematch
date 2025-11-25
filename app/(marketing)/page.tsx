'use client'

import { useEffect } from 'react'
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

export default function MarketingPage() {
  const { locale } = useApp()
  
  // Add class to body to identify marketing page for scroll lock prevention
  useEffect(() => {
    document.body.classList.add('marketing-page')
    
    // Aggressively prevent scroll locking on marketing page
    const preventScrollLock = () => {
      if (document.body.style.overflow === 'hidden' || document.body.style.overflow === 'clip') {
        document.body.style.overflow = ''
      }
      if (document.documentElement.style.overflow === 'hidden' || document.documentElement.style.overflow === 'clip') {
        document.documentElement.style.overflow = ''
      }
      document.body.style.paddingRight = ''
      document.body.style.marginRight = ''
      document.body.removeAttribute('data-scroll-locked')
      document.body.removeAttribute('data-radix-scroll-lock')
      document.documentElement.removeAttribute('data-scroll-locked')
      document.documentElement.removeAttribute('data-radix-scroll-lock')
    }

    // Intercept setProperty at the document level
    const originalBodySetProperty = document.body.style.setProperty.bind(document.body.style)
    const originalHtmlSetProperty = document.documentElement.style.setProperty.bind(document.documentElement.style)
    
    document.body.style.setProperty = function(property: string, value: string, priority?: string) {
      if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
        return // Block scroll lock
      }
      return originalBodySetProperty(property, value, priority)
    }

    document.documentElement.style.setProperty = function(property: string, value: string, priority?: string) {
      if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
        return // Block scroll lock
      }
      return originalHtmlSetProperty(property, value, priority)
    }

    // Continuous monitoring
    const interval = setInterval(preventScrollLock, 10)
    const rafId = requestAnimationFrame(function loop() {
      preventScrollLock()
      requestAnimationFrame(loop)
    })

    // MutationObserver
    const observer = new MutationObserver(preventScrollLock)
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })

    return () => {
      document.body.classList.remove('marketing-page')
      clearInterval(interval)
      cancelAnimationFrame(rafId)
      observer.disconnect()
      document.body.style.setProperty = originalBodySetProperty
      document.documentElement.style.setProperty = originalHtmlSetProperty
      preventScrollLock()
    }
  }, [])
  
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
      <main id="main-content" className="min-h-screen bg-white pt-16 md:pt-20">
        <Navbar />
        <Hero />
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
