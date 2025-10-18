import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'

export default function MarketingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Navbar />
      <Hero />
    </main>
  )
}