'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, X } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function ComparisonTableSection() {
  const { locale } = useApp()
  const t = content[locale].comparison

  const Cell = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-5 w-5 text-emerald-500 mx-auto" aria-hidden />
    ) : (
      <X className="h-5 w-5 text-slate-300 mx-auto" aria-hidden />
    )

  return (
    <Section
      id="comparison"
      className="bg-white"
      aria-labelledby="comparison-heading"
    >
      <Container>
        <div className="text-center mb-10">
          <h2
            id="comparison-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
          >
            {t.title}
          </h2>
          <p className="text-slate-600">{t.subtitle}</p>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table
            className="w-full min-w-[640px] border-collapse"
            role="grid"
            aria-label={t.title}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-left py-3 px-4 font-semibold text-slate-900 border-b-2 border-slate-200"
                >
                  {locale === 'nl' ? 'Functie' : 'Feature'}
                </th>
                {t.competitors.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className={`py-3 px-4 font-semibold text-center border-b-2 ${
                      name === 'Domu Match'
                        ? 'text-indigo-600 border-indigo-500 bg-indigo-50'
                        : 'text-slate-900 border-slate-200'
                    }`}
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
                  className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-slate-900 align-middle">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center align-middle bg-indigo-50/50">
                    <Cell value={row.domu} />
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <Cell value={row.kamernet} />
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <Cell value={row.roomster} />
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <Cell value={row.roomnl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 text-center mt-6 max-w-2xl mx-auto">
          {locale === 'nl'
            ? 'Vergelijking gebaseerd op publieke informatie (2025). Kamernet: premium abonnement vereist om te reageren. Roomster: FTC-aanklacht wegens neprecensies en valse advertenties. Room.nl: wachtlijst systeem, inschrijfgeld ~€35.'
            : 'Comparison based on public information (2025). Kamernet: premium subscription required to respond to ads. Roomster: FTC lawsuit over fake reviews and phony listings. Room.nl: waiting list system, registration fee ~€35.'}
        </p>
      </Container>
    </Section>
  )
}
