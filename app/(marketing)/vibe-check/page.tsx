import type { Metadata } from 'next'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { VibeCheckClient } from './VibeCheckClient'

export const metadata: Metadata = {
  title: 'Roommate Vibe Check | Domu Match',
  description:
    'Answer 8 lifestyle questions, discover your roommate archetype, and join the Domu Match beta to connect with compatible students in Breda and Tilburg.',
  openGraph: {
    title: 'Roommate Vibe Check | Domu Match',
    description:
      'Discover your roommate archetype and find students who match your living style.',
    type: 'website',
  },
}

export default function VibeCheckPage() {
  return (
    <MarketingSubpageWrapperLight footer>
      <VibeCheckClient />
    </MarketingSubpageWrapperLight>
  )
}
