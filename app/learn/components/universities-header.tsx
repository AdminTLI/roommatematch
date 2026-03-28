'use client'

import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/app/providers'
import type { Locale } from '@/lib/i18n'

const copy: Record<
  Locale,
  {
    navAria: string
    items: { name: string; href: string }[]
    signIn: string
    bookPilot: string
    menuToggle: string
  }
> = {
  en: {
    navAria: 'Main navigation',
    items: [
      { name: 'Overview', href: '#overview' },
      { name: 'Features', href: '#features' },
      { name: 'Integration', href: '#integration' },
      { name: 'Pricing', href: '#pricing' },
    ],
    signIn: 'Sign in',
    bookPilot: 'Book a pilot',
    menuToggle: 'Toggle navigation menu',
  },
  nl: {
    navAria: 'Hoofdnavigatie',
    items: [
      { name: 'Overzicht', href: '#overview' },
      { name: 'Functies', href: '#features' },
      { name: 'Integratie', href: '#integration' },
      { name: 'Prijzen', href: '#pricing' },
    ],
    signIn: 'Inloggen',
    bookPilot: 'Plan een pilot',
    menuToggle: 'Navigatiemenu openen of sluiten',
  },
}

export function UniversitiesHeader() {
  const { locale } = useApp()
  const t = copy[locale]
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-4"
        role="navigation"
        aria-label={t.navAria}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="relative h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Domu Match"
                fill
                className="object-contain rounded-lg"
                priority
                sizes="(max-width: 768px) 32px, 40px"
                onError={(e) => {
                  const target = e.target as HTMLElement
                  const container = target.closest('.relative')
                  if (container) {
                    container.style.display = 'none'
                  }
                }}
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary">Domu Match</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {t.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm">
                {t.signIn}
              </Button>
            </Link>
            <Button size="sm" asChild>
              <Link href="/contact">{t.bookPilot}</Link>
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <LanguageSwitcher variant="minimal" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={t.menuToggle}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4"
          >
            <div className="flex flex-col space-y-4">
              {t.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    {t.signIn}
                  </Button>
                </Link>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                    {t.bookPilot}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
