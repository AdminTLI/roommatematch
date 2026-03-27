import { PastelMeshBackground } from '@/components/site/pastel-mesh-background'
import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { MarketingLayoutFixLight } from '../components/marketing-layout-fix-light'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ShieldCheck, Users, Sparkles, Rocket, FileCheck2, Wrench, Scale } from 'lucide-react'

const perks = [
  {
    icon: ShieldCheck,
    title: 'Lifetime VIP Status.',
    description:
      "Get free lifetime access to Domu Match and a permanent 'Founding Member' badge on your profile so everyone knows you were here first.",
  },
  {
    icon: Users,
    title: 'The Inner Circle.',
    description:
      'Gain access to a private community of like-minded early adopters and receive exclusive invites to Domu Match real-world events.',
  },
  {
    icon: Rocket,
    title: 'Shape the Future (And your CV).',
    description:
      "Work directly with our founders to dictate what features we build next. Active testers receive a personalized LinkedIn Endorsement for 'Product Advisory'.",
  },
]

const expectations = [
  {
    icon: Wrench,
    title: "It's a work in progress:",
    description:
      "You will encounter bugs, missing features, and weird glitches. That's the point! Your feedback helps us fix them.",
  },
  {
    icon: Sparkles,
    title: 'You are a volunteer:',
    description:
      'This is an unpaid program for early believers who want to solve the roommate crisis and find great people to live with.',
  },
  {
    icon: FileCheck2,
    title: 'Confidentiality:',
    description:
      "Because you're getting a behind-the-scenes look at unreleased technology, we ask all testers to sign a standard Non-Disclosure Agreement (NDA).",
  },
  {
    icon: Scale,
    title: 'Liability:',
    description:
      'We provide this beta "as-is" without warranties. You help us test it, and we promise to listen to your feedback.',
  },
]

const formUrl = 'YOUR_GOOGLE_FORM_LINK_HERE'

export default function BetaPage() {
  return (
    <main id="main-content" className="relative overflow-hidden pt-16 md:pt-20">
      <PastelMeshBackground />

      <div className="relative z-10">
        <MarketingLayoutFixLight />
        <MarketingNavbarLight />

        {/* Section 1: Hero */}
        <Section className="py-14 md:py-20 lg:py-24">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
              <div className="lg:col-span-8 bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-8 sm:p-10 lg:p-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl px-4 py-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-blue-600" aria-hidden />
                  Invite-only beta
                </div>
                <h1 className="mt-5 text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  Join the Domu Match Founding Circle.
                </h1>
                <p className="mt-5 max-w-3xl text-slate-700 text-base sm:text-lg leading-relaxed">
                  We&apos;re revolutionizing how students and young professionals find roommates. Join our
                  exclusive, invite-only Beta to find your perfect match before the public launch—and
                  help us build the platform you actually want to use.
                </p>
                <div className="mt-8">
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-4 transition-colors"
                  >
                    Apply for Beta Access
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">First wave</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">
                    Early testers get direct founder access and the most influence.
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">Real impact</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">
                    Your feedback will shape the product roadmap before public launch.
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">Limited spots</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">
                    We&apos;re intentionally keeping this cohort small and high-quality.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Section 2: Perks */}
        <Section className="py-10 md:py-14 lg:py-16">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-7 sm:p-8">
                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">
                  Why join now
                </p>
                <h2 className="mt-3 text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">
                  Early access with real upside.
                </h2>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  This isn&apos;t just a waitlist. It&apos;s a founding opportunity to get meaningful perks,
                  influence product decisions, and be recognized as an early builder.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {perks.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <article
                      key={perk.title}
                      className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-7 sm:p-8"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl">
                        <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                      </div>
                      <h3 className="mt-4 text-slate-900 text-xl font-semibold tracking-tight">{perk.title}</h3>
                      <p className="mt-3 text-slate-700 leading-relaxed">{perk.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </Container>
        </Section>

        {/* Section 3: Fine Print */}
        <Section className="py-10 md:py-14 lg:py-16">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-7 sm:p-8">
                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">The fine print</p>
                <h2 className="mt-3 text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">
                  What it means to be a Beta Tester.
                </h2>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  Clear expectations up front, so you know exactly what you&apos;re signing up for.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {expectations.map((item) => {
                  const Icon = item.icon
                  return (
                    <article
                      key={item.title}
                      className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-6 sm:p-7"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl">
                        <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                      </div>
                      <h3 className="mt-4 text-slate-900 text-lg font-semibold tracking-tight">{item.title}</h3>
                      <p className="mt-2 text-slate-700 leading-relaxed">{item.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </Container>
        </Section>

        {/* Section 4: Final CTA */}
        <Section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-8 sm:p-10">
              <div className="lg:col-span-8">
                <p className="text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">
                  Ready to shape the future of shared living?
                </p>
                <p className="mt-3 text-slate-700 leading-relaxed max-w-2xl">
                  Become one of the earliest Domu Match testers and help define the product before
                  everyone else arrives.
                </p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full lg:w-auto items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-4 transition-colors"
                >
                  Take me to the Application Form
                </a>
              </div>
            </div>
          </Container>
        </Section>

        <Footer />
      </div>
    </main>
  )
}
