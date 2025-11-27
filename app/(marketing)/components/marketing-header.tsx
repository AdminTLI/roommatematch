'use client'

import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'How it works', href: '#how-it-works' },
    { name: 'For Universities', href: '/learn' },
    { name: 'Support', href: '/support' }
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-4" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image 
                src="/images/logo.png" 
                alt="Domu Match" 
                fill
                className="object-contain rounded-lg"
                priority
                sizes="32px"
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
            <span className="text-2xl font-bold text-primary">Domu Match</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher variant="minimal" />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            
            <Link href="/auth/sign-up">
              <Button size="sm">
                Start now
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="minimal" />
            <ThemeToggle size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4"
          >
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center gap-3 py-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <ThemeToggle size="sm" />
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Theme
                </span>
              </div>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Start now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
