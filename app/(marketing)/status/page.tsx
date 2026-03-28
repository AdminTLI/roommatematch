import { Metadata } from 'next'
import { StatusPageContent } from './status-page-content'

export const metadata: Metadata = {
  title: 'Status | Domu Match',
  description: 'Domu Match platform status and availability.',
}

export default function StatusPage() {
  return <StatusPageContent />
}
