import type { Metadata } from 'next'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { VibeCheckClient } from './VibeCheckClient'

const OG_IMAGE = {
  url: 'https://www.domumatch.com/images/logo.png',
  width: 500,
  height: 500,
  alt: 'Domu Match',
}

export const metadata: Metadata = {
  title: 'Living together check | Domu Match',
  description:
    'Answer 8 lifestyle questions, discover your roommate archetype, and join the Domu Match beta to connect with students in Breda and Tilburg.',
  openGraph: {
    title: 'Living together check | Domu Match',
    description:
      'Discover your roommate archetype and find students who fit how you live.',
    type: 'website',
    url: 'https://www.domumatch.com/vibe-check',
    siteName: 'Domu Match',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: 'Living together check | Domu Match',
    description:
      'Discover your roommate archetype and find students who fit how you live.',
    images: [OG_IMAGE.url],
  },
}

export default function VibeCheckPage() {
  return (
    <MarketingSubpageWrapperLight footer>
      <VibeCheckClient />
    </MarketingSubpageWrapperLight>
  )
}
