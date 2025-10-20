import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { HowItWorksSection } from '@/components/site/how-it-works-section'
import { SafetySection } from '@/components/site/safety-section'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works | Roommate Match - Student Flow Guide',
  description: 'Learn how Roommate Match works for students. From sign up to move-in, discover our intelligent matching process and safety features.',
  keywords: 'how roommate matching works, student housing process, roommate finder, housing matching algorithm',
  openGraph: {
    title: 'How It Works | Roommate Match',
    description: 'Learn how Roommate Match works for students. From sign up to move-in.',
    type: 'website',
  },
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <HowItWorksSection />
        <SafetySection />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  )
}
