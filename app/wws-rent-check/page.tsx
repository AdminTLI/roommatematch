import { Metadata } from 'next'
import { WWSRentCheckClient } from './components/WWSRentCheckClient'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'

export const metadata: Metadata = {
  title: 'WWS Rent Check Calculator | Maximum Legal Rent | Domu Match',
  description:
    'Calculate your maximum legal rent based on Dutch WWS (Woningwaarderingsstelsel) regulations. Free calculator for Independent and Non-Independent housing.',
  openGraph: {
    title: 'WWS Rent Check Calculator | Domu Match',
    description:
      'Calculate your maximum legal rent based on Dutch WWS standards. Check if you are paying a fair price for your accommodation.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function WWSRentCheckPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <WWSRentCheckClient />
      </main>
      <Footer />
    </>
  )
}

