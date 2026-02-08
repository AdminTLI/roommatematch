'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, X } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function ComparisonTableSection() {
  const { locale } = useApp()
  const t = content[locale].comparison
  const Cell = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-5 w-5 text-emerald-400 mx-auto" aria-hidden />
    ) : (
      <X className="h-5 w-5 text-white/30 mx-auto" aria-hidden />
    )

  return (
    <Section
      id="comparison"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="comparison-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-indigo-950/15 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="comparison-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight"
          >
            {t.title}
          </h2>
          <p className="text-white/70">{t.subtitle}</p>
        </motion.div>

        <motion.div
          className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <table
            className="w-full min-w-[640px] border-collapse"
            role="grid"
            aria-label={t.title}
          >
            <thead>
              <tr className="bg-white/5">
                <th
                  scope="col"
                  className="text-left py-4 px-4 font-semibold text-white border-b border-white/10"
                >
                  {locale === 'nl' ? 'Functie' : 'Feature'}
                </th>
                {t.competitors.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className={cn(
                      'py-4 px-4 font-semibold text-center border-b border-white/10',
                      name === 'Domu Match'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'
                        : 'text-white/90'
                    )}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b border-white/5 last:border-b-0 transition-colors',
                    'hover:bg-white/5'
                  )}
                >
                  <td className="py-4 px-4 text-sm text-white/90 align-middle">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center align-middle bg-indigo-500/5">
                    <Cell value={row.domu} />
                  </td>
                  <td className="py-4 px-4 text-center align-middle">
                    <Cell value={row.kamernet} />
                  </td>
                  <td className="py-4 px-4 text-center align-middle">
                    <Cell value={row.roomster} />
                  </td>
                  <td className="py-4 px-4 text-center align-middle">
                    <Cell value={row.roomnl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          className="text-xs text-white/50 text-center mt-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {locale === 'nl'
            ? 'Vergelijking gebaseerd op publieke informatie (2025). Kamernet: premium abonnement vereist om te reageren. Roomster: FTC-aanklacht wegens neprecensies en valse advertenties. Room.nl: wachtlijst systeem, inschrijfgeld ~€35.'
            : 'Comparison based on public information (2025). Kamernet: premium subscription required to respond to ads. Roomster: FTC lawsuit over fake reviews and phony listings. Room.nl: waiting list system, registration fee ~€35.'}
        </motion.p>
      </Container>
    </Section>
  )
}
