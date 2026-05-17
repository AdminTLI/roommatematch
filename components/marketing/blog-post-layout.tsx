'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { PastelMeshBackground } from '@/components/site/pastel-mesh-background'
import { MarketingLayoutFixLight } from '@/app/(marketing)/components/marketing-layout-fix-light'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

interface BlogPostLayoutProps {
  title: string
  excerpt: string
  publishDate: string
  readTime: string
  author?: string
  children: React.ReactNode
  relatedLinks?: Array<{ title: string; href: string; description: string }>
  ctaTitle?: string
  ctaDescription?: string
  ctaHref?: string
  ctaText?: string
}

const layoutContent = {
  en: {
    back: 'Back to blog',
    by: 'By',
    related: 'Related Resources',
    learnMore: 'Learn more',
    ctaFallback: 'Get Started',
  },
  nl: {
    back: 'Terug naar blog',
    by: 'Door',
    related: 'Gerelateerde bronnen',
    learnMore: 'Meer lezen',
    ctaFallback: 'Aan de slag',
  },
}

export function BlogPostLayout({
  title,
  excerpt,
  publishDate,
  readTime,
  author = 'Domu Match Team',
  children,
  relatedLinks = [],
  ctaTitle,
  ctaDescription,
  ctaHref,
  ctaText,
}: BlogPostLayoutProps) {
  const { locale } = useApp()
  const t = layoutContent[locale]
  const dateFormatter = new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <MarketingLayoutFixLight />
      <main id="main-content" className="relative min-h-screen pt-16 md:pt-20 overflow-hidden">
        <PastelMeshBackground />
        <div className="relative z-10">
          <MarketingNavbarLight />

          <Section className="relative overflow-hidden pt-10 md:pt-14 pb-8 md:pb-10">
            <Container className="relative z-10">
              <div className="max-w-4xl mx-auto">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-slate-600 hover:text-blue-700 transition-colors mb-8"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  {t.back}
                </Link>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                  {title}
                </h1>

                <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed">{excerpt}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{dateFormatter.format(new Date(publishDate))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      {t.by} {author}
                    </span>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          <Section className="relative overflow-hidden py-0 pb-16 md:pb-20">
            <Container className="relative z-10">
              <div className="max-w-5xl mx-auto">
                <div
                  className={cn(
                    'relative rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl',
                    'shadow-[0_18px_50px_rgba(15,23,42,0.08)] px-6 py-8 md:px-10 md:py-10'
                  )}
                >
                  <article
                    className={cn(
                      'prose prose-lg max-w-none',
                      'prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight',
                      'prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4',
                      'prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3',
                      'prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4',
                      'prose-li:text-slate-700 prose-li:my-1',
                      'prose-strong:text-slate-900 prose-strong:font-semibold',
                      'prose-a:text-blue-700 prose-a:no-underline hover:prose-a:text-blue-800 hover:prose-a:underline',
                      'prose-img:rounded-2xl prose-img:border prose-img:border-white/60',
                      'prose-figcaption:text-slate-600 prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:mt-2'
                    )}
                  >
                    <div className="blog-content space-y-10">{children}</div>
                  </article>
                </div>
              </div>
            </Container>
          </Section>

          {relatedLinks.length > 0 && (
            <Section className="relative overflow-hidden py-12 md:py-16">
              <Container className="relative z-10">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">{t.related}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {relatedLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className={cn(
                          'block p-6 md:p-8 transition-all duration-300',
                          'rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl',
                          'shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                          'hover:bg-white/60 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]'
                        )}
                      >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{link.title}</h3>
                        <p className="text-sm text-slate-700 mb-4 leading-relaxed">{link.description}</p>
                        <span className="inline-flex items-center text-sm font-semibold text-blue-700">
                          {t.learnMore}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Container>
            </Section>
          )}

          {(ctaTitle || ctaHref) && (
            <Section className="relative overflow-hidden py-16 md:py-24">
              <Container className="relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                  {ctaTitle && (
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                      {ctaTitle}
                    </h2>
                  )}
                  {ctaDescription && (
                    <p className="text-base md:text-lg text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                      {ctaDescription}
                    </p>
                  )}
                  {ctaHref && (
                    <Link
                      href={ctaHref}
                      className={cn(
                        'inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold',
                        'bg-slate-900 text-white hover:bg-slate-900/90',
                        'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-105 transition-all duration-200',
                        'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2'
                      )}
                    >
                      {ctaText || t.ctaFallback}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  )}
                </div>
              </Container>
            </Section>
          )}

          <Footer />
        </div>
      </main>
    </>
  )
}
