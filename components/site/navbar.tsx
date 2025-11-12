'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import { Menu, X, ChevronRight } from 'lucide-react'
import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
import { useApp } from '@/app/providers'

const navigationContent = {
  en: [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Universities', href: '/universities' },
    { name: 'Pricing', href: '/pricing' },
  ],
  nl: [
    { name: 'Hoe het werkt', href: '/how-it-works' },
    { name: 'Functies', href: '/features' },
    { name: 'Universiteiten', href: '/universities' },
    { name: 'Prijzen', href: '/pricing' },
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
  const { locale } = useApp()
  const navigation = navigationContent[locale]
  const buttons = buttonContent[locale]

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

  return (
    <>
      {/* Skip link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-brand-primary text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <nav className="h-16 md:h-20 bg-white border-b border-brand-border sticky top-0 z-40">
        <Container className="h-full">
          <div className="flex items-center justify-between h-full py-0">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {/* Logo Image - will show if file exists, otherwise fallback to text */}
                <div className="relative h-8 w-8 md:h-10 md:w-10 flex-shrink-0 hidden sm:block">
                  <Image 
                    src="/images/logo.png" 
                    alt="Domu Match" 
                    fill
                    className="object-contain"
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
                <span className="text-2xl font-bold text-brand-text">Domu Match</span>
              </Link>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center space-x-6 h-full">
              {navigation.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-brand-muted hover:text-brand-text transition-colors font-medium text-sm flex items-center h-full"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 h-full">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-brand-muted hover:text-brand-text transition-colors font-medium flex items-center h-full"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Tablet CTA */}
            <div className="hidden md:flex lg:hidden items-center space-x-3">
              <LanguageSwitcher variant="minimal" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignIn}
              >
                {buttons.signIn}
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={handleGetStarted}
              >
                {buttons.getStarted}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <LanguageSwitcher variant="minimal" />
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleSignIn}
              >
                {buttons.signIn}
              </Button>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
              >
                {buttons.getStarted}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button and language switcher */}
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageSwitcher variant="minimal" />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md hover:bg-brand-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleCloseMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden fixed inset-x-0 top-16 md:top-20 bg-white border-t border-brand-border z-40 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <Container>
              <div className="py-4 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-brand-muted hover:text-brand-text transition-colors font-medium py-2"
                    onClick={handleCloseMenu}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-brand-border space-y-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full justify-center"
                    onClick={() => {
                      handleSignIn()
                      handleCloseMenu()
                    }}
                  >
                    {buttons.signIn}
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                    onClick={() => {
                      handleGetStarted()
                      handleCloseMenu()
                    }}
                  >
                    {buttons.getStarted}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        )}
      </nav>
    </>
  )
}