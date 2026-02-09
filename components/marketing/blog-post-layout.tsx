'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useApp } from '@/app/providers'

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
    ctaFallback: 'Get Started'
  },
  nl: {
    back: 'Terug naar blog',
    by: 'Door',
    related: 'Gerelateerde bronnen',
    learnMore: 'Meer lezen',
    ctaFallback: 'Aan de slag'
  }
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
    year: 'numeric'
  })

  return (
    <>
      <MarketingLayoutFix />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        
        {/* Hero Header */}
        <Section className="bg-slate-950 py-12 md:py-16 lg:py-20">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-slate-400 hover:text-violet-400 transition-colors mb-6"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  {t.back}
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {title}
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed">
                {excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{dateFormatter.format(new Date(publishDate))}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t.by} {author}</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

        {/* Main Content */}
        <Section className="bg-slate-950 py-12 md:py-16">
          <Container>
            <article className="max-w-4xl mx-auto prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-white prose-a:text-violet-400">
              <div className="blog-content space-y-8">
                {children}
              </div>
            </article>
          </Container>
        </Section>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <Section className="bg-slate-900/50 py-12 md:py-16">
            <Container>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                  {t.related}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedLinks.map((link, index) => (
                    <Card key={index} className="border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {link.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                          {link.description}
                        </p>
                        <Button asChild variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                          <Link href={link.href}>
                            {t.learnMore}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* CTA Section */}
        {(ctaTitle || ctaHref) && (
          <Section className="bg-gradient-to-br from-violet-600 to-violet-700 text-white py-16 md:py-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              {ctaTitle && (
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {ctaTitle}
                </h2>
              )}
              {ctaDescription && (
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  {ctaDescription}
                </p>
              )}
              {ctaHref && (
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href={ctaHref}>
                    {ctaText || t.ctaFallback}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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

