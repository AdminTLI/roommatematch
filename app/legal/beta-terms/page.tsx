import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MarketingLayoutFixLight } from '@/app/(marketing)/components/marketing-layout-fix-light'
import { PastelMeshBackgroundStatic } from '@/components/site/pastel-mesh-background-static'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { LegalDocument } from '@/components/legal/legal-document'
import { LAST_UPDATED, termsContent } from '@/lib/legal/terms-content'

export const metadata: Metadata = {
  title: 'Beta Terms & Conditions | Domu Match',
  description:
    'Domu Match Public Beta Participation Agreement: as-is service, Founding Member Program, limitation of liability, and accurate user status (Student/Professional).',
}

export default function BetaTermsPage() {
  const terms = termsContent.en

  return (
    <>
      <MarketingLayoutFixLight />
      <div className="relative min-h-screen">
        <PastelMeshBackgroundStatic />

        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-slate-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Domu Match
            </Link>
          </div>
        </header>

        <main className="relative z-10">
          <Section className="py-12 md:py-16 lg:py-20">
            <Container>
              <div className="max-w-4xl mx-auto">
                <LegalDocument
                  {...terms}
                  title="Beta Program Terms"
                  lastUpdatedValue={LAST_UPDATED}
                  preamble="These Beta Program Terms govern your participation in the Domu Match public beta. They include the same legally binding terms as our Terms of Service, including the Founding Member Program for the first 200 verified beta users."
                  footer={
                    <footer className="mt-10 pt-6 border-t border-slate-200">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        By completing your profile and using Domu Match, you agree to these Beta
                        Program Terms. See also our{' '}
                        <Link
                          href="/terms"
                          className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </footer>
                  }
                />
              </div>
            </Container>
          </Section>
        </main>
      </div>
    </>
  )
}
