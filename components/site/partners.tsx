'use client'

import Image from 'next/image'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const partners = [
  {
    name: "B'WISE",
    href: 'https://bwise.tech/',
    logoSrc: '/images/partners/bwise-logo.png',
    width: 280,
    height: 60,
  },
]

const copy = {
  en: {
    title: 'In collaboration with',
    subtitle: 'Organisations helping us build a better way to find roommates.',
  },
  nl: {
    title: 'In samenwerking met',
    subtitle: 'Organisaties die ons helpen een betere manier te bouwen om housemates te vinden.',
  },
}

export function Partners() {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <Section className="py-8 md:py-10 lg:py-12">
      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            {t.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">{t.subtitle}</p>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
          {partners.map((partner) => (
            <li key={partner.name}>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-20 w-56 items-center justify-center rounded-2xl border border-white/60 bg-white/70 px-5 py-4 backdrop-blur-xl transition-all duration-200 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                aria-label={`${partner.name} (opens in a new tab)`}
              >
                <Image
                  src={partner.logoSrc}
                  alt={`${partner.name} logo`}
                  width={partner.width}
                  height={partner.height}
                  className="h-12 w-auto max-w-full object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
