'use client'

import Container from "@/components/ui/primitives/container"
import Link from "next/link"
import { Twitter, Linkedin, Instagram } from "lucide-react"
import { useApp } from '@/app/providers'

const content = {
  en: {
    brandDescription: "The smartest way to find compatible roommates. Science-backed matching for better living.",
    product: "Product",
    company: "Company",
    support: "Support",
    howItWorks: "How it works",
    features: "Features",
    pricing: "Pricing",
    universities: "Universities",
    aboutUs: "About us",
    blog: "Blog",
    careers: "Careers",
    contact: "Contact",
    helpCenter: "Help center",
    safety: "Safety",
    privacyPolicy: "Privacy policy",
    termsOfService: "Terms of service",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    allRightsReserved: "All rights reserved."
  },
  nl: {
    brandDescription: "De slimste manier om compatibele huisgenoten te vinden. Wetenschappelijk onderbouwde matching voor beter wonen.",
    product: "Product",
    company: "Bedrijf",
    support: "Ondersteuning",
    howItWorks: "Hoe het werkt",
    features: "Functies",
    pricing: "Prijzen",
    universities: "Universiteiten",
    aboutUs: "Over ons",
    blog: "Blog",
    careers: "Carrières",
    contact: "Contact",
    helpCenter: "Helpcentrum",
    safety: "Veiligheid",
    privacyPolicy: "Privacybeleid",
    termsOfService: "Servicevoorwaarden",
    privacy: "Privacy",
    terms: "Voorwaarden",
    cookies: "Cookies",
    allRightsReserved: "Alle rechten voorbehouden."
  }
}

export default function Footer() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <footer className="bg-[#0B1220] text-slate-300">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-white text-lg sm:text-xl font-semibold">Domu Match</h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-prose">{t.brandDescription}</p>
            <div className="flex items-center gap-3">
              <a aria-label="Twitter" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary flex items-center justify-center min-w-[44px] min-h-[44px]"><Twitter size={18}/></a>
              <a aria-label="LinkedIn" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary flex items-center justify-center min-w-[44px] min-h-[44px]"><Linkedin size={18}/></a>
              <a aria-label="Instagram" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary flex items-center justify-center min-w-[44px] min-h-[44px]"><Instagram size={18}/></a>
            </div>
          </div>

          {/* Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.product}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link href="/how-it-works" className="hover:text-white">{t.howItWorks}</Link></li>
              <li><Link href="/features" className="hover:text-white">{t.features}</Link></li>
              <li><Link href="/pricing" className="hover:text-white">{t.pricing}</Link></li>
              <li><Link href="/universities" className="hover:text-white">{t.universities}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t.company}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link href="/about" className="hover:text-white">{t.aboutUs}</Link></li>
              <li><Link href="/blog" className="hover:text-white">{t.blog}</Link></li>
              <li><Link href="/careers" className="hover:text-white">{t.careers}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t.support}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link href="/help-center" className="hover:text-white">{t.helpCenter}</Link></li>
              <li><Link href="/safety" className="hover:text-white">{t.safety}</Link></li>
              <li><Link href="/privacy" className="hover:text-white">{t.privacyPolicy}</Link></li>
              <li><Link href="/terms" className="hover:text-white">{t.termsOfService}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">© {new Date().getFullYear()} Domu Match. {t.allRightsReserved}</p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white py-2">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-white py-2">{t.terms}</Link>
            <a className="hover:text-white py-2">{t.cookies}</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}