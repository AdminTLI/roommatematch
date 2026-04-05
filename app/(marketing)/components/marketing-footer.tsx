'use client'

import { LanguageSwitcher } from './language-switcher'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { Users, Mail, ExternalLink } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const copy: Record<
  Locale,
  {
    brandBlurb: string
    sections: { title: string; links: { name: string; href: string }[] }[]
    copyright: string
    privacy: string
    terms: string
    accessibility: string
    github: string
    gdpr: string
    wcag: string
    iso: string
  }
> = {
  en: {
    brandBlurb:
      'From strangers to roommates - the safest way in the Netherlands. ID-verified, compatibility-first for students and young professionals.',
    sections: [
      {
        title: 'Product',
        links: [
          { name: 'For Students', href: '/students' },
          { name: 'For Young Professionals', href: '/young-professionals' },
          { name: 'How it works', href: '/#how-it-works' },
          { name: 'Safety', href: '/#safety' },
          { name: 'Pricing', href: '/pricing' },
        ],
      },
      {
        title: 'For Universities',
        links: [
          { name: 'Overview', href: '/learn' },
          { name: 'Integration', href: '/learn#integration' },
          { name: 'Analytics', href: '/learn#analytics' },
          { name: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Support',
        links: [
          { name: 'Help Center', href: '/help-center' },
          { name: 'Contact Us', href: '/contact' },
          { name: 'FAQ', href: '/faq' },
          { name: 'Status', href: '/status' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { name: 'Privacy Policy', href: '/privacy' },
          { name: 'Terms & Conditions', href: '/terms' },
          { name: 'Cookie Policy', href: '/cookies' },
          { name: 'Accessibility', href: '/accessibility' },
        ],
      },
    ],
    copyright: '© 2026 Domu Match. All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms & Conditions',
    accessibility: 'Accessibility',
    github: 'GitHub',
    gdpr: 'GDPR Compliant',
    wcag: 'WCAG 2.2 AA',
    iso: 'ISO 27001 Ready',
  },
  nl: {
    brandBlurb:
      'Van vreemden naar huisgenoten - op de veiligste manier in Nederland. ID-geverifieerd, compatibiliteit eerst voor studenten en young professionals.',
    sections: [
      {
        title: 'Product',
        links: [
          { name: 'Voor studenten', href: '/students' },
          { name: 'Voor young professionals', href: '/young-professionals' },
          { name: 'Hoe het werkt', href: '/#how-it-works' },
          { name: 'Veiligheid', href: '/#safety' },
          { name: 'Prijzen', href: '/pricing' },
        ],
      },
      {
        title: 'Voor universiteiten',
        links: [
          { name: 'Overzicht', href: '/learn' },
          { name: 'Integratie', href: '/learn#integration' },
          { name: 'Analytics', href: '/learn#analytics' },
          { name: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Ondersteuning',
        links: [
          { name: 'Helpcentrum', href: '/help-center' },
          { name: 'Neem contact op', href: '/contact' },
          { name: 'Veelgestelde vragen', href: '/faq' },
          { name: 'Status', href: '/status' },
        ],
      },
      {
        title: 'Juridisch',
        links: [
          { name: 'Privacybeleid', href: '/privacy' },
          { name: 'Algemene voorwaarden', href: '/terms' },
          { name: 'Cookiebeleid', href: '/cookies' },
          { name: 'Toegankelijkheid', href: '/accessibility' },
        ],
      },
    ],
    copyright: '© 2026 Domu Match. Alle rechten voorbehouden.',
    privacy: 'Privacy',
    terms: 'Algemene voorwaarden',
    accessibility: 'Toegankelijkheid',
    github: 'GitHub',
    gdpr: 'AVG-conform',
    wcag: 'WCAG 2.2 AA',
    iso: 'ISO 27001 Ready',
  },
}

export function MarketingFooter() {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Domu Match</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">{t.brandBlurb}</p>

            <div className="mb-6">
              <LanguageSwitcher showLabel={true} variant="default" />
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="h-4 w-4" />
              <a href="mailto:domumatch@gmail.com" className="hover:text-white transition-colors">
                domumatch@gmail.com
              </a>
            </div>
          </div>

          {t.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-gray-400 text-sm text-center px-4">{t.copyright}</div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400 px-4">
              <Link href="/privacy" className="hover:text-white transition-colors whitespace-nowrap">
                {t.privacy}
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors whitespace-nowrap">
                {t.terms}
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors whitespace-nowrap">
                {t.accessibility}
              </Link>
              <a
                href="https://github.com/domumatch"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                {t.github}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {t.gdpr}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              {t.wcag}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              {t.iso}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
