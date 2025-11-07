'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import { Menu, X, ChevronRight } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Universities', href: '/universities' },
    { name: 'Pricing', href: '/pricing' },
  ]

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  const handleSignIn = () => {
    router.push('/auth/sign-in')
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
              <button 
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-brand-text hover:text-brand-primary transition-colors"
              >
                Roommate Match
              </button>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={handleGetStarted}
              >
                Get Started
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
              >
                Get Started
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-brand-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
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
        </Container>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden bg-white border-t border-brand-border"
          >
            <Container>
              <div className="py-4 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-brand-muted hover:text-brand-text transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
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
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                    onClick={() => {
                      handleGetStarted()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Get Started
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