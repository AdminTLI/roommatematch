'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import { Menu, X, ChevronRight, ArrowRight } from 'lucide-react'
import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
import { useApp } from '@/app/providers'

const navigationContent = {
  en: [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Universities', href: '/universities' },
    { name: 'About us', href: '/about' },
  ],
  nl: [
    { name: 'Hoe het werkt', href: '/how-it-works' },
    { name: 'Functies', href: '/features' },
    { name: 'Universiteiten', href: '/universities' },
    { name: 'Over ons', href: '/about' },
  ]
}

const buttonContent = {
  en: {
    signIn: 'Sign In',
    getStarted: 'Get Started'
  },
  nl: {
    signIn: 'Inloggen',
    getStarted: 'Aan de slag'
  }
}

export function Navbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { locale } = useApp()
  
  // Only access locale-dependent content after mount to prevent hydration mismatch
  const navigation = mounted ? navigationContent[locale] : navigationContent['en']
  const buttons = mounted ? buttonContent[locale] : buttonContent['en']

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  const handleSignIn = () => {
    router.push('/auth/sign-in')
  }
  
  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleToggleMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  return (
    <>
      {/* Skip link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-brand-primary text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <nav className="h-16 md:h-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-brand-border fixed top-0 left-0 right-0 z-50 w-full">
        <Container className="h-full">
          <div className="flex items-center justify-between h-full py-0">
            {/* Logo */}
            <Link 
              href="/"
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity flex-shrink-0 h-full"
            >
              {/* Logo Image - will show if file exists, otherwise fallback to text */}
              <div className="relative h-8 w-8 md:h-10 md:w-10 flex-shrink-0 hidden sm:block">
                <Image 
                  src="/images/logo.png" 
                  alt="Domu Match" 
                  fill
                  className="object-contain rounded-lg"
                  priority
                  sizes="(max-width: 768px) 32px, 40px"
                  onError={(e) => {
                    // Hide image container if logo fails to load
                    const target = e.target as HTMLElement;
                    const container = target.closest('.relative');
                    if (container) {
                      container.style.display = 'none';
                    }
                  }}
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-brand-text leading-none">Domu Match</span>
            </Link>

            {/* Desktop Navigation - Full links for laptops (lg+) */}
            <div className="hidden lg:flex items-center gap-8 h-full">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-brand-muted hover:text-brand-text transition-colors font-medium leading-tight flex items-center h-full py-0 whitespace-nowrap"
                  suppressHydrationWarning
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA - Full buttons for laptops (lg+) */}
            <div className="hidden lg:flex items-center gap-4 h-full">
              <div className="flex items-center h-full">
                <LanguageSwitcher variant="minimal" />
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleSignIn}
                className="h-10"
              >
                <span suppressHydrationWarning>{buttons.signIn}</span>
              </Button>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="h-10"
              >
                <span suppressHydrationWarning>{buttons.getStarted}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button and language switcher - show on mobile and tablet (< lg) */}
            <div className="lg:hidden flex items-center gap-3 h-full">
              <div className="flex items-center h-full">
                <LanguageSwitcher variant="minimal" />
              </div>
              <button
                type="button"
                onClick={handleToggleMenu}
                className="p-2 rounded-md hover:bg-brand-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary relative z-[70] flex items-center justify-center h-10 w-10"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Mobile menu backdrop - outside nav to avoid stacking context issues */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={handleCloseMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu - outside nav to avoid stacking context issues */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden fixed inset-x-0 bg-white z-[70] shadow-2xl rounded-2xl animate-in slide-in-from-top duration-300"
          style={{ 
            top: '72px', 
            maxHeight: 'calc(100vh - 72px - 1rem)', 
            marginTop: '0.5rem',
            marginBottom: '1rem',
            marginLeft: '1rem',
            marginRight: '1rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Menu Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 className="text-xl font-bold text-brand-text">Domu Match</h2>
            <button
              type="button"
              onClick={handleCloseMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="px-4 py-6 space-y-1">
            {/* Navigation Links */}
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between py-3.5 px-4 rounded-xl text-base font-semibold text-gray-900 hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-brand-primary/10 hover:text-brand-primary transition-all duration-200 active:scale-[0.98] border border-transparent hover:border-brand-primary/20"
                onClick={handleCloseMenu}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span suppressHydrationWarning>{item.name}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-200" />
              </Link>
            ))}
            
            {/* Divider */}
            <div className="my-6 border-t border-gray-100" />
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full justify-center h-12 text-base font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={() => {
                  handleSignIn()
                  handleCloseMenu()
                }}
              >
                <span suppressHydrationWarning>{buttons.signIn}</span>
              </Button>
              <Button 
                variant="primary"
                size="lg"
                className="w-full justify-center h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  handleGetStarted()
                  handleCloseMenu()
                }}
              >
                <span suppressHydrationWarning>{buttons.getStarted}</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}