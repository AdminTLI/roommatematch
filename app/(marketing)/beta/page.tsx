import { Metadata } from 'next'
import { BetaPageContent } from './beta-page-content'

export const metadata: Metadata = {
  title: 'Beta Programme | Domu Match - Founding Circle',
  description:
    'Join the invite-only Domu Match beta: early access, founding perks, and a direct line to the team building safer roommate matching for the Netherlands.',
}

export default function BetaPage() {
  return <BetaPageContent />
}
