import Link from 'next/link'
import { BETA_SIGNUP_GOOGLE_FORM_URL } from '@/lib/marketing/beta-signup'
import { Button } from '@/components/ui/button'

export const socialHeroContent = {
  en: {
    headline: 'Find a roommate you actually click with.',
    subline: 'Verified people, clear reasons, and homes that feel easier to live in.',
    ctaPrimary: 'Get started',
    ctaSecondary: 'See how it works',
    trustLine: 'No catfish. No awkward interviews. Just verified matches.',
  },
  nl: {
    headline: 'Vind een huisgenoot waar je echt mee klikt.',
    subline: 'Geverifieerde mensen, duidelijke redenen, en een huis dat rustiger aanvoelt.',
    ctaPrimary: 'Begin nu',
    ctaSecondary: 'Bekijk hoe het werkt',
    trustLine: 'Geen catfish. Geen awkward interviews. Wel geverifieerde matches.',
  },
} as const

export type SocialHeroLocale = keyof typeof socialHeroContent

/** Presentational hero copy — safe for Server Components (LCP text path). */
export function SocialHeroCopy({ locale }: { locale: SocialHeroLocale }) {
  const t = socialHeroContent[locale]

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.02]">
        {t.headline}
      </h1>

      <p className="text-lg sm:text-xl text-slate-700">{t.subline}</p>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          size="lg"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full px-8 py-4 shadow-lg transition-transform hover:-translate-y-1"
          asChild
        >
          <a href={BETA_SIGNUP_GOOGLE_FORM_URL}>{t.ctaPrimary}</a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="bg-white/90 backdrop-blur-2xl border-white/80 text-slate-900 hover:bg-white dark:bg-white/90 dark:hover:bg-white dark:text-slate-900 dark:border-white/80 rounded-full px-8 py-4 shadow-sm"
          asChild
        >
          <Link href="/how-it-works">{t.ctaSecondary}</Link>
        </Button>
      </div>

      <p className="text-sm sm:text-base text-slate-700">{t.trustLine}</p>
    </div>
  )
}
