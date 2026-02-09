'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
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
      <MarketingLayoutFix />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />

        {/* Hero + main content with shared background to avoid harsh cutoff */}
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-purple-950/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px]"
            aria-hidden
          />

          {/* Hero section - matching About/subpage design */}
          <Section className="relative z-10 overflow-hidden py-0 pt-16 md:pt-24 pb-10 md:pb-12">
            <Container>
              <div className="max-w-4xl mx-auto">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-white/60 hover:text-indigo-400 transition-colors mb-8"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  {t.back}
                </Link>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                  {title}
                </h1>

                <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                  {excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
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

          {/* Main Content */}
          <Section className="relative z-10 overflow-hidden py-0 pt-8 pb-16 md:pt-10 md:pb-20">
            <Container>
              <div className="max-w-5xl mx-auto">
                <div className="relative rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-xl px-6 py-8 md:px-10 md:py-10">
                  <div className="pointer-events-none absolute -top-16 right-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />
                  <article
                    className={cn(
                      'prose prose-invert prose-lg max-w-none',
                      'prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight',
                      'prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4',
                      'prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3',
                      'prose-p:text-slate-200 prose-p:leading-relaxed prose-p:mb-4',
                      'prose-li:text-slate-200 prose-li:my-1',
                      'prose-strong:text-white prose-strong:font-semibold',
                      'prose-a:text-indigo-300 prose-a:no-underline hover:prose-a:text-indigo-200 hover:prose-a:underline',
                      'prose-img:rounded-2xl prose-img:border prose-img:border-white/20',
                      'prose-figcaption:text-slate-400 prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:mt-2'
                    )}
                  >
                    <div className="blog-content space-y-10">
                      {children}
                    </div>
                  </article>
                </div>
              </div>
            </Container>
          </Section>
        </div>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <Section className="relative overflow-hidden py-12 md:py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-purple-950/20 pointer-events-none" aria-hidden />

            <Container className="relative z-10">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                  {t.related}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className={cn(
                        'glass noise-overlay block p-6 md:p-8 transition-all duration-300',
                        'hover:border-white/30 hover:bg-white/10'
                      )}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300">
                        {link.title}
                      </h3>
                      <p className="text-sm text-white/70 mb-4 leading-relaxed">
                        {link.description}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-indigo-400">
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

        {/* CTA Section - matches How It Works / About page aesthetic */}
        {(ctaTitle || ctaHref) && (
          <Section className="relative overflow-hidden py-16 md:py-24">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-purple-950/20 pointer-events-none" aria-hidden />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" aria-hidden />

            <Container className="relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                {ctaTitle && (
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                    {ctaTitle}
                  </h2>
                )}
                {ctaDescription && (
                  <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {ctaDescription}
                  </p>
                )}
                {ctaHref && (
                  <Link
                    href={ctaHref}
                    className={cn(
                      'inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold',
                      'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                      'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                      'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
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
      </main>
    </>
  )
}
