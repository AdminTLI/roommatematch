import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

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
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Header */}
      <Section className="bg-gradient-to-b from-white to-brand-surface/30 py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-brand-muted hover:text-brand-primary transition-colors mb-6"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to blog
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight">
              {title}
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-muted mb-8 leading-relaxed">
              {excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(publishDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {author}</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Main Content */}
      <Section className="bg-white py-12 md:py-16">
        <Container>
          <article className="max-w-4xl mx-auto">
            <div className="blog-content space-y-8">
              {children}
            </div>
          </article>
        </Container>
      </Section>

      {/* Related Links */}
      {relatedLinks.length > 0 && (
        <Section className="bg-brand-surface/30 py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-8">
                Related Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedLinks.map((link, index) => (
                  <Card key={index} className="border-brand-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-brand-text mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-brand-muted mb-4">
                        {link.description}
                      </p>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={link.href}>
                          Learn more
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
        <Section className="bg-gradient-to-br from-brand-primary to-brand-primaryHover text-white py-16 md:py-20">
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
                    {ctaText || 'Get Started'}
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
  )
}

