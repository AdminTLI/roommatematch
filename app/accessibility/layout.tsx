import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement | Domu Match',
  description:
    'How Domu Match approaches digital accessibility: WCAG 2.2 AA, keyboard and screen reader support, feedback channels, and known limitations for domumatch.com and our web app.',
  keywords: [
    'Domu Match accessibility',
    'WCAG',
    'screen reader',
    'keyboard navigation',
    'digital accessibility Netherlands',
    'inclusive design',
  ],
  openGraph: {
    title: 'Accessibility Statement | Domu Match',
    description:
      'Our commitment to accessible roommate matching: standards, support options, and how to reach us with accessibility feedback.',
    type: 'website',
    url: 'https://domumatch.com/accessibility',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Accessibility statement - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Statement | Domu Match',
    description:
      'Our commitment to accessible roommate matching: standards, support options, and how to reach us with accessibility feedback.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/accessibility',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AccessibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}
