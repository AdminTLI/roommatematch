'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { termsContent } from '@/lib/legal/terms-content'
import { LegalDocument } from '@/components/legal/legal-document'

export default function TermsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const { locale } = useApp()
  const t = termsContent[locale] ?? termsContent.en

  const document = <LegalDocument {...t} embedded={embedded} />

  if (embedded) return document

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">{document}</div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
