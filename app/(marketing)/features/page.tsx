import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { FeaturesSection } from '@/components/site/features-section'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | Roommate Match - Smart Matching Technology',
  description: 'Discover Roommate Match features: AI-powered matching, verified students, safe chat, academic integration, and admin tools for universities.',
  keywords: 'roommate matching features, AI matching algorithm, verified students, safe chat, academic integration',
  openGraph: {
    title: 'Features | Roommate Match',
    description: 'Discover Roommate Match features: AI-powered matching, verified students, safe chat.',
    type: 'website',
  },
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <FeaturesSection />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  )
}
