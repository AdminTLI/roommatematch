import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Beta Terms & Conditions | Domu Match',
  description:
    'Domu Match Public Beta Participation Agreement: as-is service, limitation of liability, and accurate user status (Student/Professional).',
}

export default function BetaTermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="sticky top-0 z-40 bg-background/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Domu Match
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="max-w-4xl mx-auto p-6 sm:p-8 bg-background/40 dark:bg-background/60 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl shadow-black/5">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Beta Program Terms
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: March 2026 · Domu Match Public Beta Terms
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.1 Nature of the Beta
              </h2>
              <ul>
                <li>
                  The beta is a pre-release version of Domu Match. It is provided “as-is” for
                  testing and feedback purposes.
                </li>
                <li>
                  Features, interfaces, and matching logic may change without notice during
                  the beta.
                </li>
                <li>
                  The service may experience outages, data resets, or be discontinued at any
                  time.
                </li>
                <li>
                  Domu Match makes no guarantees about the availability, reliability, or
                  accuracy of any beta feature.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.2 Beta Data and What Happens at the End
              </h2>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>What happens</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Beta ends, product launches</td>
                      <td>
                        Profile and account data carries over. Beta-specific logs deleted
                        within 90 days.
                      </td>
                    </tr>
                    <tr>
                      <td>Beta discontinued (no launch)</td>
                      <td>
                        Minimum 30 days’ notice. Data export available. All data
                        deleted/anonymized within 60 days.
                      </td>
                    </tr>
                    <tr>
                      <td>In-beta data reset</td>
                      <td>
                        Minimum 7 days’ in-app notice where possible. Matches and scores may
                        be wiped for technical reasons.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.3 Feedback License
              </h2>
              <p>
                By submitting bug reports, suggestions, usability feedback, or other input
                through the platform or any feedback channels (including email, forms,
                surveys, or private group chats), you
                grant DMS Enterprise a perpetual, irrevocable, royalty-free, worldwide
                license to use, adapt, and incorporate that feedback into our products and
                services, without any obligation to compensate you.
              </p>
              <p>
                This does not affect your ownership of any other content you post on the
                platform (profiles, chat messages).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.4 Confidentiality Request
              </h2>
              <p>
                The beta contains unreleased features, design concepts, and matching logic
                that are not yet public. We ask that you:
              </p>
              <ul>
                <li>
                  Refrain from publicly sharing screenshots, recordings, or detailed
                  descriptions of beta features.
                </li>
                <li>
                  Do not share your beta invite link with third parties unless we have
                  explicitly said you may.
                </li>
                <li>
                  Let us know if you accidentally disclose anything — we won’t hold it
                  against you.
                </li>
              </ul>
              <p>This is a courtesy request, not a binding NDA. We appreciate your discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.5 Bug Reporting
              </h2>
              <p>
                If you encounter bugs or unexpected behaviour, please report them via the
                in-app feedback tool, a private group chat (where applicable), or at{' '}
                <a href="mailto:domumatch@gmail.com">domumatch@gmail.com</a>.
                Responsible disclosure of any security issues to{' '}
                <a href="mailto:domumatch@gmail.com">domumatch@gmail.com</a> is greatly
                appreciated and is handled with priority.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3.6 Beta Termination Notice
              </h2>
              <p>
                If we decide to end the beta, we will give you at least 30 days’ notice by
                email and/or in-app notification. For urgent technical or legal reasons, this
                period may be shorter; we will explain why.
              </p>
            </section>
          </div>

          <footer className="mt-10 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              By completing your profile and using Domu Match, you agree to these Beta
              Program Terms. For our general Terms of Service and Privacy Policy, see the
              links in the website footer.
            </p>
          </footer>
        </article>
      </main>
    </div>
  )
}
