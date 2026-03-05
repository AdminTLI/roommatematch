import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal | Domu Match',
  description: 'Domu Match legal documents and participation agreements.',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
