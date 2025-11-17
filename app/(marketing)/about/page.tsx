import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import { 
  Shield, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Heart, 
  CheckCircle2,
  BookOpen,
  Target,
  Lightbulb,
  ArrowRight,
  User
} from 'lucide-react'
import Link from 'next/link'
import { Timeline } from '@/components/about/timeline'
import { EvidenceTile } from '@/components/about/evidence-tile'
import { ResearchDashboard } from '@/components/about/research-dashboard'

export const metadata: Metadata = {
  title: 'About Us | Domu Match - Science-Driven Matching',
  description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands through science-backed roommate compatibility matching.',
  keywords: [
    'about Domu Match',
    'roommate matching company',
    'student housing platform',
    'compatibility matching',
    'Netherlands student housing',
    'roommate matching mission',
    'student accommodation company',
    'science-backed matching',
  ],
  openGraph: {
    title: 'About Us | Domu Match',
    description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands through science-backed matching.',
    type: 'website',
    url: 'https://domumatch.vercel.app/about',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'About Domu Match - Science-Driven Roommate Matching',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Domu Match',
    description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/about',
  },
}

export default function AboutPage() {
  const timelineItems = [
    {
      title: 'The Problem Identified',
      description: 'We recognized that nearly half of all students face roommate conflicts that impact their well-being and academic performance. Traditional random assignment wasn\'t working.',
      date: '2025 August'
    },
    {
      title: 'Research Phase',
      description: 'We analyzed peer-reviewed studies on roommate compatibility, peer effects, and student housing satisfaction from institutions including Nature and leading universities.',
      date: '2025 September'
    },
    {
      title: 'Algorithm Development',
      description: 'Built a science-driven matching algorithm that analyzes 40+ lifestyle and academic factors, informed by social compatibility research and university housing best practices.',
      date: '2025 October'
    },
    {
      title: 'Launch',
      description: 'Launched Domu Match to help students find compatible roommates through transparent, explainable matching backed by verification and safety measures.',
      date: '2025 November'
    },
    {
      title: 'Growing Impact',
      description: 'Today, we\'re helping students across multiple universities find better matches, with verified users and growing partnerships to make science-backed matching the standard.',
      date: 'Present'
    }
  ]

  const evidenceTiles = [
    {
      statistic: '47.9%',
      title: 'Report Roommate Conflict',
      explanation: 'Nearly half of all students face frequent or occasional conflict with roommates. Research shows these conflicts directly impact academic performance through negative peer effects - students with incompatible roommates see lower GPAs and higher stress levels.',
      source: 'Golding et al., "Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students"',
      solution: 'Domu Match\'s compatibility scoring analyzes 40+ lifestyle factors - study habits, cleanliness preferences, social needs - to prevent conflicts before they start. Our algorithm matches students with similar values and complementary personalities, creating positive peer effects that support academic success.',
      icon: 'Users' as const
    },
    {
      statistic: '67.6%',
      title: 'Want to Switch Rooms',
      explanation: 'When matches go wrong, students want to switch, creating disruption, cost, and stress for both students and housing departments. This churn reduces housing satisfaction and increases administrative burden.',
      source: 'Deng (cited in Empirical Study of Dormitory Conflict)',
      solution: 'Domu Match reduces churn by getting it right the first time. Our comprehensive compatibility model and transparent matching process help students make informed decisions, reducing the need for room changes and improving retention.',
      icon: 'TrendingUp' as const
    },
    {
      statistic: '70%',
      title: 'Satisfied When Compatible',
      explanation: 'Research shows that 70% of students are satisfied with their roommates when compatibility is prioritized. Roommate satisfaction is a key driver of overall housing satisfaction and student retention.',
      source: 'InsideHigherEd article on SDSU survey (2024)',
      solution: 'Our science-backed approach helps students find roommates as compatible as their best friends. By prioritizing compatibility from the start, we create matches that lead to higher satisfaction and better retention rates.',
      icon: 'Shield' as const
    }
  ]

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
        name: 'About',
        item: 'https://domumatch.vercel.app/about',
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
      <Section className="bg-gradient-to-b from-white to-brand-surface/30 pb-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight">
              <span className="text-brand-primary">Our Mission:</span> Better Roommate Matches Through Science
            </h1>
            <p className="text-lg md:text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed mb-10">
              We believe finding a compatible roommate shouldn't be a gamble. That's why we built Domu Match - a science-driven platform that uses compatibility research to help students find roommates they'll actually get along with. Safety, transparency, and evidence-based matching guide everything we do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center"></div>
          </div>
        </Container>
      </Section>

      {/* Our Story Section */}
      <Section id="our-story" className="bg-white py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                <span className="text-brand-primary">Our Story</span>
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                How we started, what drives us, and where we're headed.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 mb-20">
              <div className="lg:col-span-2 space-y-6">
                <p className="text-lg text-brand-muted leading-relaxed">
                  Finding a good roommate shouldn't be a gamble. Yet for millions of students every year, it is. You fill out a form, get randomly assigned, and hope for the best. Sometimes it works out. Often it doesn't.
                </p>
                <p className="text-lg text-brand-muted leading-relaxed">
                  Domu Match was founded by <strong className="text-brand-text">Danish Samsudin</strong>, Founder and Developer, who saw the same problem play out again and again: students struggling with roommate conflicts that hurt their grades, their mental health, and their college experience. Research shows that nearly half of all students face frequent or occasional conflict with their roommates. That's not acceptable.
                </p>
                <p className="text-lg text-brand-muted leading-relaxed">
                  So we built a better way. We use compatibility science - the same principles that help people form lasting friendships - to match students based on lifestyle, personality, and academic factors. We verify every user is a real student. We make the matching process transparent. And we partner with universities to make this the standard for student housing.
                </p>
                <p className="text-lg text-brand-muted leading-relaxed font-medium text-brand-text">
                  Our goal is simple: make student living safer, happier, and more compatible. One match at a time.
                </p>
              </div>
              <div className="lg:col-span-1">
                <Card className="border-brand-border/50 bg-brand-surface/30">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-brand-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Danish Samsudin</CardTitle>
                        <p className="text-sm text-brand-muted">Founder and Developer</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-muted leading-relaxed">
                      "We started Domu Match because we saw too many students struggling with roommate conflicts. Our mission is to use science and technology to create better matches - matches that last."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-20">
              <h3 className="text-2xl font-bold text-brand-text mb-12 text-center">
                Our Journey
              </h3>
              <Timeline items={timelineItems} />
            </div>

            {/* Where We're Headed */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-brand-text mb-8 text-center">Where We're Headed</h3>
              <div className="max-w-3xl mx-auto space-y-8">
                <p className="text-lg text-brand-muted leading-relaxed text-center">
                  Our vision is to make science-backed roommate matching the standard for student housing. We're working toward a future where every student has access to compatibility-based matching that considers lifestyle, personality, and academic factors - not just random assignment.
                </p>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="font-semibold text-brand-text mb-4 text-lg">Short-term goals</h4>
                    <ul className="space-y-3 text-brand-muted">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Expand partnerships with universities across the Netherlands</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Build a community of verified students finding better matches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Refine and continuously tune the matching model using outcomes and student feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Launch student-created group chats to make forming housemates easier</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Introduce richer profiles with bios, interests, and highlights for better context</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-4 text-lg">Long-term vision</h4>
                    <ul className="space-y-3 text-brand-muted">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Partner with housing agencies to offer rooms matched by compatibility and housing type</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Provide in-platform legal contracts that students can review and sign securely</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Enable roommate agreements to set expectations and keep each other accountable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Offer individual and group calling to move from chat to real conversations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span>Launch mobile apps for iOS and Android to make Domu Match accessible everywhere</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Evidence Section */}
      <Section className="bg-brand-surface/50 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                <span className="text-brand-primary">The Evidence:</span> Why Compatibility Matters
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                Research shows that roommate compatibility directly impacts academic performance, retention, and student satisfaction. Here's what the data tells us about peer effects, housing churn, and why getting matches right from the start matters.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {evidenceTiles.map((tile, index) => (
                <EvidenceTile key={index} {...tile} />
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-10 border border-brand-border/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-text mb-4">
                    Why Compatibility Matters: Peer Effects, Retention, and Satisfaction
                  </h3>
                  <p className="text-brand-muted leading-relaxed mb-4">
                    Roommate conflicts don't just make living uncomfortable - they have real consequences for academic performance, retention, and student satisfaction. Research shows that compatibility compounds over time. The longer roommates live together, the stronger the peer effect on academic performance. Good matches deliver compounding benefits: better grades, higher retention, and greater satisfaction. Bad matches create compounding problems: lower performance, higher churn, and increased stress.
                  </p>
                  <p className="text-xs text-brand-muted italic">
                    Cao et al., "Heterogeneous peer effects of college roommates on academic performance" (Nature, 2024)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>


      {/* Values Section */}
      <Section className="bg-brand-surface/30 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                What We <span className="text-brand-primary">Value</span>
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                These principles guide everything we do, from building our matching algorithm to working with universities. They reflect our commitment to making student living safer, happier, and more compatible.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-brand-border/50 text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-brand-primary" />
                  </div>
                  <CardTitle className="text-lg">Safety First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Student safety is non-negotiable. We verify every user and prioritize secure, respectful interactions. This commitment to safety is at the core of our founder's vision.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-brand-border/50 text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-brand-primary" />
                  </div>
                  <CardTitle className="text-lg">Science-Driven</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Our matching is backed by research, not guesswork. We use proven compatibility principles from peer-reviewed studies to create better matches.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-brand-border/50 text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-brand-primary" />
                  </div>
                  <CardTitle className="text-lg">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    No black boxes. We explain how matching works and why you're compatible with each potential roommate. Transparency builds trust.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-brand-border/50 text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-brand-primary" />
                  </div>
                  <CardTitle className="text-lg">University Partnership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    We work with universities to integrate our matching into their housing systems, making better matches the standard for student housing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-br from-brand-primary to-brand-primaryHover text-white py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Drives Us
            </h2>
            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              We're a mission-led organization focused on making student living safer, happier, and more compatible. Our values - safety, science, transparency, and partnership - guide every decision we make.
            </p>
            
            <div className="bg-white/10 rounded-2xl p-8 mb-10 max-w-2xl mx-auto">
              <ul className="text-left space-y-4 text-white/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Safety above all:</strong> Every user is verified. Every interaction is secure.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Science-driven:</strong> Our matching is backed by peer-reviewed research, not guesswork.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Transparent:</strong> We show you exactly why you're compatible with each match.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Partnership-focused:</strong> We work with universities to make better matching the standard.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">
                  Partner With Us
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
    </>
  )
}
