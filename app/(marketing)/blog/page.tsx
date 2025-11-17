import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, Shield, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Domu Match - Student Housing Insights & Tips',
  description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living in the Netherlands.',
  keywords: [
    'student housing blog',
    'roommate tips Netherlands',
    'rental safety guide',
    'explainable AI housing',
    'Domu Match blog',
    'Netherlands student life',
    'roommate compatibility tips',
    'student housing advice',
    'roommate matching blog',
  ],
  openGraph: {
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living.',
    type: 'website',
    url: 'https://domumatch.vercel.app/blog',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match Blog - Student Housing Insights',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/blog',
  },
}

const posts = [
  {
    slug: 'how-to-find-a-great-roommate',
    title: 'How to Find a Great Roommate',
    excerpt: 'Evidence-based tips for compatibility and harmony in student housing. Learn how to navigate the Dutch student housing market and find your perfect match.',
    readTime: '4 min read',
    date: '2025-11-15',
    category: 'Compatibility',
    icon: BookOpen,
  },
  {
    slug: 'safety-checklist-for-student-renters',
    title: 'Safety Checklist for Student Renters',
    excerpt: 'Verification, contracts, and best practices for safe living in the Netherlands. Protect yourself from rental scams and understand your tenant rights.',
    readTime: '5 min read',
    date: '2025-11-10',
    category: 'Safety',
    icon: Shield,
  },
  {
    slug: 'why-explainable-ai-matters',
    title: 'Why Explainable AI Matters',
    excerpt: 'Understanding your matches builds trust and better decisions. Learn how transparency in AI matching aligns with EU regulations and protects your rights.',
    readTime: '8 min read',
    date: '2025-11-05',
    category: 'Technology',
    icon: Brain,
  },
]

export default function BlogPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://domumatch.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://domumatch.vercel.app/blog',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white">
        <Navbar />
      
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-white to-brand-surface/30 py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight">
              <span className="text-brand-primary">Insights</span> & Resources
            </h1>
            <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
              Expert guidance on finding compatible roommates, staying safe while renting, and understanding how technology can help you make better housing decisions.
            </p>
          </div>
        </Container>
      </Section>

      {/* Blog Posts Grid */}
      <Section className="bg-white py-12 md:py-16">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => {
              const Icon = post.icon
              return (
                <Card
                  key={post.slug}
                  className="group border border-brand-border/50 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-brand-primary" />
                      </div>
                      <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
                        {post.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-brand-muted mb-6 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-brand-border/50">
                      <div className="flex items-center gap-4 text-xs text-brand-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      asChild
                      variant="ghost"
                      className="mt-4 w-full group-hover:bg-brand-primary/5"
                    >
                      <Link href={`/blog/${post.slug}`}>
                        Read article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
    </>
  )
}
