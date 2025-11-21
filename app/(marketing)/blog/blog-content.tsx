'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, Shield, Brain } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Insights & Resources',
    subtitle: 'Expert guidance on finding compatible roommates, staying safe while renting, and understanding how technology can help you make better housing decisions.',
    readArticle: 'Read article',
    posts: [
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
    ],
  },
  nl: {
    title: 'Inzichten & hulpmiddelen',
    subtitle: 'Deskundige tips om compatibele huisgenoten te vinden, veilig te huren en te begrijpen hoe technologie je helpt betere woonbeslissingen te nemen.',
    readArticle: 'Lees artikel',
    posts: [
      {
        slug: 'how-to-find-a-great-roommate',
        title: 'Zo vind je een fijne huisgenoot',
        excerpt: 'Evidence-based tips voor harmonieus samenwonen. Leer hoe je de Nederlandse studentenhuisvestingsmarkt navigeert en je ideale match vindt.',
        readTime: '4 min lezen',
        date: '2025-11-15',
        category: 'Compatibiliteit',
        icon: BookOpen,
      },
      {
        slug: 'safety-checklist-for-student-renters',
        title: 'Veiligheidschecklist voor studenthuurders',
        excerpt: 'Verificatie, contracten en best practices voor veilig wonen in Nederland. Bescherm jezelf tegen fraude en ken je huurdersrechten.',
        readTime: '5 min lezen',
        date: '2025-11-10',
        category: 'Veiligheid',
        icon: Shield,
      },
      {
        slug: 'why-explainable-ai-matters',
        title: 'Waarom uitlegbare AI belangrijk is',
        excerpt: 'Begrijp je matches en neem betere beslissingen. Zie hoe transparantie in AI-matching aansluit bij EU-regels en je rechten beschermt.',
        readTime: '8 min lezen',
        date: '2025-11-05',
        category: 'Technologie',
        icon: Brain,
      },
    ],
  },
}

export function BlogContent() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <>
      <Section className="bg-gradient-to-b from-white to-brand-surface/30 py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight">
              <span className="text-brand-primary">{t.title.split(' ')[0]}</span>{' '}
              {t.title.replace(t.title.split(' ')[0], '').trim()}
            </h1>
            <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-white py-12 md:py-16">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.posts.map((post) => {
              const Icon = post.icon
              const dateFormatter = new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

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
                          <span>{dateFormatter.format(new Date(post.date))}</span>
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
                        {t.readArticle}
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
    </>
  )
}

