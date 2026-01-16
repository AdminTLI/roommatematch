'use client'

import { LanguageSwitcher } from '@/app/(marketing)/components/language-switcher'
import Link from 'next/link'
import { Users, Mail, ExternalLink } from 'lucide-react'

export function UniversitiesFooter() {
  const footerSections = [
    {
      title: 'For Universities',
      links: [
        { name: 'Overview', href: '/learn' },
        { name: 'Integration', href: '/learn#integration' },
        { name: 'Analytics', href: '/learn#analytics' },
        { name: 'Pricing', href: '/learn#pricing' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Sales', href: '/contact' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Status', href: '/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Data Processing Agreement', href: '/dpa' },
        { name: 'Accessibility', href: '/accessibility' }
      ]
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Domu Match</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Helping universities create safer, more compatible living environments 
              for students through intelligent roommate matching.
            </p>
            
            {/* Language Switcher */}
            <div className="mb-6">
              <LanguageSwitcher showLabel={true} variant="default" />
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:info@domumatch.com" 
                className="hover:text-white transition-colors"
              >
                info@domumatch.com
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-gray-400 text-sm text-center">
              © 2026 Domu Match. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/dpa" className="hover:text-white transition-colors">
                DPA
              </Link>
              <a 
                href="https://github.com/domumatch" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              GDPR Compliant
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              WCAG 2.2 AA
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              ISO 27001 Ready
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              SOC 2 Type II
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
