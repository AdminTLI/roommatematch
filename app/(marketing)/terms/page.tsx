import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Domu Match',
  description: 'Terms of service for Domu Match. Read our terms and conditions for using our platform.',
  robots: 'noindex, nofollow',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Section className="bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-brand-text mb-8">Terms of Service</h1>
              <div className="prose prose-lg max-w-none text-brand-text">
                <p className="text-brand-muted mb-8">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-6">
                  By accessing and using Domu Match, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">2. Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily use Domu Match for personal, 
                  non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">3. User Accounts</h2>
                <p className="mb-4">To use our service, you must:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Be at least 18 years old or have parental consent</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">4. Prohibited Uses</h2>
                <p className="mb-4">You may not use our service:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">5. Content Standards</h2>
                <p className="mb-4">
                  All content must comply with applicable laws and regulations. We reserve the right to 
                  remove any content that violates these standards.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">6. Privacy Policy</h2>
                <p className="mb-6">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">7. Termination</h2>
                <p className="mb-6">
                  We may terminate or suspend your account and bar access to the service immediately, 
                  without prior notice or liability, for any reason whatsoever.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">8. Disclaimer</h2>
                <p className="mb-6">
                  The information on this service is provided on an "as is" basis. To the fullest extent 
                  permitted by law, we exclude all representations, warranties, and conditions.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">9. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="mb-6">
                  Email: legal@domumatch.com<br />
                  Address: [Your Business Address]
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </div>
      <Footer />
    </main>
  )
}
