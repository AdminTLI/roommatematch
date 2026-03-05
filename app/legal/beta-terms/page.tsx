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
            Beta Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: March 2026 · Domu Match Public Beta Participation Agreement
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                1. Public Beta (&quot;As-Is&quot; Clause)
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Domu Match is currently in active <strong>Public Beta</strong>. The platform,
                including the matching algorithm, chat services, and all related features, is
                provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> without
                warranties of any kind, whether express or implied. You may encounter bugs,
                incomplete features, or temporary service interruptions. By participating in
                the beta, you acknowledge that you are using the service in its current
                developmental state and accept the associated risks.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                2. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Domu Match is a <strong>software matching platform</strong>, not a real estate
                broker, landlord, or housing provider. We are not liable for any disputes,
                financial losses, lease agreements, or housing-related issues that arise
                between matched users off-platform. Any arrangements you make with other
                users (including co-living, subletting, or tenancy) are solely between you
                and those parties. We recommend that you conduct your own due diligence and
                seek independent legal or financial advice where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3. Misrepresentation Clause
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You must accurately represent your <strong>life stage</strong> when using Domu
                Match. Falsely registering as a &quot;Student&quot; when you are not currently
                enrolled at a verified educational institution—or falsely registering as a
                &quot;Young Professional&quot; when you do not meet the applicable criteria—is a
                <strong> material breach</strong> of these terms. Such misrepresentation will
                result in an <strong>immediate, permanent account ban</strong> and may be
                reported where required by law or policy.
              </p>
            </section>
          </div>

          <footer className="mt-10 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              By completing your profile and using Domu Match, you agree to these Beta Terms
              &amp; Conditions. For our general Terms of Service and Privacy Policy, see the
              links in the app footer.
            </p>
          </footer>
        </article>
      </main>
    </div>
  )
}
