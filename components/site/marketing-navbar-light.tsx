'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigationContent = {
  en: [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About Us', href: '/about' },
    { name: 'Beta', href: '/beta' },
  ],
  nl: [
    { name: 'Home', href: '/' },
    { name: 'Hoe het werkt', href: '/how-it-works' },
    { name: 'Over ons', href: '/about' },
    { name: 'Bèta', href: '/beta' },
  ],
}

const whoWeServeContent = {
  en: {
    label: 'Who We Serve',
    items: [
      { name: 'Students', href: '/students' },
      { name: 'Young Professionals', href: '/young-professionals' },
    ],
  },
  nl: {
    label: 'Voor wie',
    items: [
      { name: 'Studenten', href: '/students' },
      { name: 'Young Professionals', href: '/young-professionals' },
    ],
  },
}

const buttonContent = {
  en: {
    signIn: 'Sign In',
    getStarted: 'Get Started',
    skipToMain: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
  },
  nl: {
    signIn: 'Inloggen',
    getStarted: 'Aan de slag',
    skipToMain: 'Ga naar hoofdinhoud',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    menu: 'Menu',
  },
}

/** Inactive Beta nav label — matches landing headline gradient, bolder than other links */
const betaNavInactiveLabelClass =
  'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700 font-bold'

export function MarketingNavbarLight() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useApp()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const navigation = mounted ? navigationContent[locale] : navigationContent.en
  const buttons = mounted ? buttonContent[locale] : buttonContent.en
  const effectivePathname = mounted ? pathname : '/'

  const isActiveHref = (href: string) => {
    if (href === '/') return effectivePathname === '/'
    return effectivePathname === href || effectivePathname.startsWith(`${href}/`)
  }

  const isWhoWeServeActive =
    isActiveHref('/students') || isActiveHref('/young-professionals')

  useEffect(() => {
    if (!isMobileMenuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v)

  const whoWeServe =
    whoWeServeContent[mounted ? locale : 'en'].items

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-md"
      >
        <span suppressHydrationWarning>{buttons.skipToMain}</span>
      </a>

      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
        <div
          className={cn(
            'absolute inset-0',
            'bg-white/25 backdrop-blur-2xl saturate-150',
            'border-b border-white/20'
          )}
        />
        <div className="relative flex h-full w-full min-w-0 items-center px-4 sm:px-6 lg:px-8 md:justify-center">
          {/* Mobile: logo and actions share the row so the menu never overlaps CTAs */}
          <div className="flex md:hidden w-full min-w-0 items-center justify-between gap-2">
            <Link
              href="/"
              className="flex min-w-0 max-w-[min(100%,calc(100%-11rem))] items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Domu Match"
                  fill
                  className="object-contain rounded-lg"
                  priority
                  sizes="32px"
                />
              </div>
              <span className="truncate text-base font-bold text-slate-800 drop-shadow-sm">
                Domu Match
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="lg"
                className="h-9 max-sm:px-3 max-sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                onClick={() => router.push('/auth/sign-up')}
              >
                <span suppressHydrationWarning>{buttons.getStarted}</span>
              </Button>
              <button
                type="button"
                onClick={toggleMobileMenu}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-full h-10 w-10',
                  'bg-white/60 text-slate-900',
                  'hover:bg-white/80 transition-colors shadow-[0_10px_26px_rgba(15,23,42,0.10)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                )}
                aria-expanded={isMobileMenuOpen}
                aria-controls="marketing-mobile-menu"
                aria-label={isMobileMenuOpen ? buttons.closeMenu : buttons.openMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div className="hidden md:flex max-w-full min-w-0 flex-nowrap items-center gap-3 md:gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 hover:opacity-80 transition-opacity max-w-[min(100%,14rem)] sm:max-w-none"
              onClick={closeMobileMenu}
            >
              <div className="relative h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Domu Match"
                  fill
                  className="object-contain rounded-lg"
                  priority
                  sizes="(max-width: 768px) 32px, 40px"
                />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate drop-shadow-sm">
                Domu Match
              </span>
            </Link>

            <div className="hidden shrink-0 items-center md:flex">
              <div className="flex w-max min-w-0 max-w-[calc(100vw-2rem)] items-center justify-between gap-2 md:gap-3 lg:gap-5 rounded-full bg-white/25 p-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.08)] overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain md:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)]">
                {navigation.map((item) => {
                  if (item.href === '/about') {
                    return (
                      <div key="who-we-serve-and-about" className="flex items-center gap-2 md:gap-3 shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              'inline-flex items-center justify-center h-9 px-4 rounded-full shrink-0',
                              'text-sm font-semibold transition-colors outline-none',
                              'focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                              isWhoWeServeActive
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                            )}
                            suppressHydrationWarning
                          >
                            {mounted ? whoWeServeContent[locale].label : whoWeServeContent.en.label}
                            <ChevronDown className="ml-1 h-4 w-4 opacity-70" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="center"
                            sideOffset={10}
                            className="min-w-[220px] rounded-2xl border-0 bg-white/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] p-1"
                          >
                            {whoWeServeContent[mounted ? locale : 'en'].items.map((menuItem) => (
                              <DropdownMenuItem key={menuItem.href} asChild>
                                <Link
                                  href={menuItem.href}
                                  className={cn(
                                    'flex cursor-pointer items-center px-3 py-2.5 text-sm font-semibold outline-none rounded-xl mx-1',
                                    isActiveHref(menuItem.href)
                                      ? 'bg-slate-900 text-white'
                                      : 'text-slate-800 hover:bg-white/70 focus:bg-white/70'
                                  )}
                                  suppressHydrationWarning
                                >
                                  {menuItem.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                          href={item.href}
                          aria-current={isActiveHref(item.href) ? 'page' : undefined}
                          className={cn(
                            'relative inline-flex items-center justify-center h-9 px-4 rounded-full shrink-0',
                            'text-sm font-semibold transition-colors',
                            isActiveHref(item.href)
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                          )}
                          suppressHydrationWarning
                        >
                          {item.name}
                        </Link>
                      </div>
                    )
                  }

                  const active = isActiveHref(item.href)
                  const isBeta = item.href === '/beta'

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative inline-flex items-center justify-center h-9 px-4 rounded-full shrink-0',
                        'text-sm transition-colors',
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : isBeta
                            ? 'hover:bg-white/40'
                            : 'font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/40'
                      )}
                      suppressHydrationWarning
                    >
                      {isBeta && !active ? (
                        <span className={betaNavInactiveLabelClass}>{item.name}</span>
                      ) : (
                        item.name
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden md:flex items-center">
                <LanguageSwitcher variant="minimal" context="default" />
              </div>
              <button
                type="button"
                onClick={() => router.push('/auth/sign-in')}
                className={cn(
                  'hidden sm:inline-flex items-center justify-center rounded-full px-6 h-10 text-base',
                  'bg-white/85 text-slate-900',
                  'hover:bg-white transition-colors font-semibold shadow-[0_10px_26px_rgba(15,23,42,0.10)]'
                )}
              >
                <span suppressHydrationWarning>{buttons.signIn}</span>
              </button>
              <Button
                size="lg"
                className="h-10 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                onClick={() => router.push('/auth/sign-up')}
              >
                <span suppressHydrationWarning>{buttons.getStarted}</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div
          id="marketing-mobile-menu"
          className={cn(
            'md:hidden fixed inset-x-0 z-[70]',
            'mx-4 rounded-2xl border border-white/25 bg-white/80 backdrop-blur-2xl',
            'shadow-[0_24px_80px_rgba(15,23,42,0.22)] overflow-hidden'
          )}
          style={{
            top: '72px',
            maxHeight: 'calc(100vh - 72px - 1rem)',
          }}
        >
          <div className="px-4 py-4 border-b border-white/30 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                <span suppressHydrationWarning>{buttons.menu}</span>
              </p>
              <p className="text-xs text-slate-600 truncate">
                <span className="font-medium text-slate-700">Domu Match</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="minimal" context="default" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center rounded-xl h-9 w-9 text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-colors"
                aria-label={buttons.closeMenu}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="px-3 py-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              ...navigation.slice(0, 2),
              ...whoWeServe,
              ...navigation.slice(2),
            ].map((item) => {
              const active = isActiveHref(item.href)
              const isBeta = item.href === '/beta'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMobileMenu}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3.5 py-3',
                    'text-base transition-colors',
                    active
                      ? 'bg-slate-900 text-white font-semibold'
                      : isBeta
                        ? 'font-semibold hover:bg-white/70'
                        : 'text-slate-800 font-semibold hover:bg-white/70'
                  )}
                  suppressHydrationWarning
                >
                  <span suppressHydrationWarning>
                    {isBeta && !active ? (
                      <span className={betaNavInactiveLabelClass}>{item.name}</span>
                    ) : (
                      item.name
                    )}
                  </span>
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      active ? 'text-white/80' : 'text-slate-500 group-hover:text-slate-700',
                      'group-hover:translate-x-0.5'
                    )}
                    aria-hidden
                  />
                </Link>
              )
            })}

            <div className="my-3 border-t border-white/30" />

            <div className="grid gap-2 px-1 pb-2">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  router.push('/auth/sign-in')
                }}
                className={cn(
                  'inline-flex items-center justify-center rounded-2xl h-12 px-5 text-base font-semibold',
                  'bg-white/70 text-slate-900 hover:bg-white transition-colors',
                  'shadow-[0_10px_26px_rgba(15,23,42,0.10)]'
                )}
              >
                <span suppressHydrationWarning>{buttons.signIn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  router.push('/auth/sign-up')
                }}
                className={cn(
                  'inline-flex items-center justify-center rounded-2xl h-12 px-5 text-base font-semibold',
                  'bg-blue-600 text-white hover:bg-blue-700 transition-colors',
                  'shadow-[0_12px_30px_rgba(15,23,42,0.16)]'
                )}
              >
                <span suppressHydrationWarning>{buttons.getStarted}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

