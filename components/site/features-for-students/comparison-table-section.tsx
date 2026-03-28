'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, X } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const featureTh =
  'sticky left-0 z-30 box-border border-b border-r border-slate-200/90 bg-white py-4 pl-3 pr-2 text-left align-bottom text-sm font-semibold text-slate-800 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.1)] sm:pl-4 sm:text-base'

const featureTd =
  'sticky left-0 z-20 box-border border-b border-r border-slate-200/80 bg-white px-3 py-3 text-left align-top text-sm text-slate-800 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)] break-words [overflow-wrap:anywhere] sm:px-4'

const iconTd =
  'box-border border-b border-white/60 px-2 py-3 text-center align-middle sm:px-3'

export function ComparisonTableSection() {
  const { locale } = useApp()
  const t = content[locale].comparison

  const Cell = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="mx-auto h-5 w-5 text-emerald-600" aria-hidden />
    ) : (
      <X className="mx-auto h-5 w-5 text-slate-300" aria-hidden />
    )

  return (
    <Section
      id="comparison"
      className="relative overflow-x-clip py-16 md:py-24"
      aria-labelledby="comparison-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className="mb-10 text-center md:mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="comparison-heading"
            className="mb-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl"
          >
            {locale === 'en' ? (
              <>
                How we{' '}
                <span className="text-slate-800">compare</span>
              </>
            ) : (
              <>
                Zo{' '}
                <span className="text-slate-800">vergelijken</span> we
              </>
            )}
          </h2>
          <p className="text-slate-600">{t.subtitle}</p>
        </motion.div>

        <div className="w-full">
          <div
            className={cn(
              GLASS,
              'min-w-0 w-full max-w-full overflow-x-auto overscroll-x-contain'
            )}
          >
            <table
              className="w-full min-w-[640px] border-separate border-spacing-0 table-fixed"
              role="grid"
              aria-label={t.title}
            >
              <colgroup>
                <col style={{ width: 'min(42vw, 14rem)' }} />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr className="bg-white">
                  <th scope="col" className={featureTh}>
                    {locale === 'nl' ? 'Functie' : 'Feature'}
                  </th>
                  {t.competitors.map((name) => (
                    <th
                      key={name}
                      scope="col"
                      className={cn(
                        'box-border border-b border-white/60 px-1 py-4 text-center align-bottom text-xs font-semibold sm:px-2 sm:text-sm',
                        name === 'Domu Match' ? 'bg-indigo-100/90' : 'bg-white'
                      )}
                    >
                      {name === 'Domu Match' ? (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                          {name}
                        </span>
                      ) : (
                        <span className="text-slate-800">{name}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white transition-colors hover:bg-zinc-50/70"
                  >
                    <td className={featureTd}>{row.feature}</td>
                    <td className={cn(iconTd, 'bg-indigo-100/70')}>
                      <Cell value={row.domu} />
                    </td>
                    <td className={cn(iconTd, 'bg-white')}>
                      <Cell value={row.kamernet} />
                    </td>
                    <td className={cn(iconTd, 'bg-white')}>
                      <Cell value={row.roomster} />
                    </td>
                    <td className={cn(iconTd, 'bg-white')}>
                      <Cell value={row.roomnl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500"
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
