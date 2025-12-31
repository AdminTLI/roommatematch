import { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Rent Calculator | Housing Health Check | Domu Match',
  description:
    'Calculate your legal maximum rent based on Dutch WWSO (Woonruimte Wet) standards. Free rent calculator to check if you\'re paying a fair price for your room.',
  openGraph: {
    title: 'Rent Calculator | Housing Health Check | Domu Match',
    description:
      'Calculate your legal maximum rent based on Dutch WWSO standards. Check if you\'re paying a fair price.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RentCalculatorLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}

