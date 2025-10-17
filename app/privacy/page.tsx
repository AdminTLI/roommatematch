import { AuthHeader } from '@/app/auth/components/auth-header'
import { AuthFooter } from '@/app/auth/components/auth-footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            <strong>Last updated:</strong> December 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Roommate Match ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our roommate matching platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Email address and authentication credentials</li>
                <li>First name and university affiliation</li>
                <li>Government ID for verification purposes</li>
                <li>Selfie images for identity verification</li>
                <li>Questionnaire responses about lifestyle preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">
                2.2 Usage Information
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Platform usage patterns and interactions</li>
                <li>Chat messages and forum posts</li>
                <li>Match preferences and compatibility scores</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Provide roommate matching services and compatibility analysis</li>
                <li>Verify user identity and maintain platform security</li>
                <li>Enable communication between matched users</li>
                <li>Improve our matching algorithms and platform features</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>With other users:</strong> Only after mutual match acceptance, and only the information necessary for roommate communication</li>
                <li><strong>With universities:</strong> Anonymized analytics and verification status for campus administration</li>
                <li><strong>With service providers:</strong> Trusted third parties who assist in platform operations (hosting, analytics, verification)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your information, 
                including encryption in transit and at rest, secure authentication, and 
                regular security audits. All sensitive data is stored securely and access 
                is strictly limited to authorized personnel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Your Rights (GDPR Compliance)
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Under the General Data Protection Regulation (GDPR), you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Right of access:</strong> Request copies of your personal data</li>
                <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
                <li><strong>Right to data portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to object:</strong> Opt out of certain data processing activities</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                To exercise these rights, contact us at privacy@roommatematch.nl
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We retain your personal information only as long as necessary to provide our 
                services and fulfill the purposes outlined in this policy. When you delete 
                your account, we will permanently remove your personal data within 30 days, 
                except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We use essential cookies for platform functionality and optional analytics 
                cookies to improve our services. You can manage cookie preferences through 
                your browser settings or our cookie consent banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. International Transfers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your data may be transferred to and processed in countries outside the 
                European Economic Area. We ensure appropriate safeguards are in place, 
                including Standard Contractual Clauses and adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you 
                of any material changes by email or through our platform. Your continued 
                use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> privacy@roommatematch.nl<br />
                  <strong>Address:</strong> Roommate Match BV, Amsterdam, Netherlands<br />
                  <strong>Data Protection Officer:</strong> dpo@roommatematch.nl
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  )
}
