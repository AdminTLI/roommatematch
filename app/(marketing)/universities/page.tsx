import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { UniversitiesSection } from '@/components/site/universities-section'
import { AdminFeatures } from '@/components/site/admin-features'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Universities | Roommate Match - Housing Management Solutions',
  description: 'Reduce housing disputes by 40% with our intelligent roommate matching platform. Admin dashboard, analytics, and dedicated support for university housing teams.',
  keywords: 'university housing, housing management, student accommodation, roommate matching, admin dashboard, housing analytics',
  openGraph: {
    title: 'For Universities | Roommate Match',
    description: 'Reduce housing disputes by 40% with our intelligent roommate matching platform.',
    type: 'website',
  },
}

export default function UniversitiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <UniversitiesSection />
        <AdminFeatures />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  )
}
