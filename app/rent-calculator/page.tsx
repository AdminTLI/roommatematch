'use client'

import { RentCalculatorClient } from './components/RentCalculatorClient'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'

export default function RentCalculatorPage() {

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <RentCalculatorClient />
      </main>
      <Footer />
    </>
  )
}
