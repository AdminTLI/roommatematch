import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Roommate Match',
  description: 'Privacy policy for Roommate Match. Learn how we protect and handle your personal data.',
  robots: 'noindex, nofollow',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Section className="bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-brand-text mb-8">Privacy Policy</h1>
              <div className="prose prose-lg max-w-none text-brand-text">
                <p className="text-brand-muted mb-8">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  complete your profile, or communicate with us.
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Account information (email, password)</li>
                  <li>Profile information (name, university, program, preferences)</li>
                  <li>Verification documents (government ID, selfie)</li>
                  <li>Communication data (chat messages, support requests)</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Provide and improve our matching services</li>
                  <li>Verify your identity and ensure platform safety</li>
                  <li>Communicate with you about matches and platform updates</li>
                  <li>Analyze usage patterns to improve our algorithm</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">3. Information Sharing</h2>
                <p className="mb-4">
                  We do not sell your personal information. We may share information with:
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Your university housing department (for verification and support)</li>
                  <li>Service providers who assist in platform operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">4. Data Security</h2>
數據保護與隱私政策
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">5. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of certain communications</li>
                  <li>Request data portability</li>
                </ul>

                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">6. Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mb-6">
                  Email: privacy@roommatematch.com<br />
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
