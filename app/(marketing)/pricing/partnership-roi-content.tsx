'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calculator, Users, Shield, TrendingUp } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const BASE_FEE = 5000
const PER_STUDENT_INTERNATIONAL = 15
const PER_STUDENT_DUTCH = 5
const ROI_DROPOUT_RATE = 0.30 // 30% first-year dropout (conservative)
const ROI_RETENTION_PCT = 0.02 // we estimate we can retain 2% of those at risk
const ROI_LTV_DUTCH = 25000 // total revenue per Dutch student over 3/4 years (LTV)
const ROI_LTV_INTERNATIONAL = 55000 // total revenue per international student over 3/4 years (LTV)

/** Dutch notation: dot as thousands separator (e.g. 12.500) */
function formatDutch(value: number): string {
  return value.toLocaleString('nl-NL', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
}

function formatEur(value: number): string {
  return `€${formatDutch(value)}`
}

export function PartnershipROIContent() {
  const [pricingMode, setPricingMode] = useState<'flexible' | 'campus'>('flexible')
  const [internationalCount, setInternationalCount] = useState(0)
  const [dutchCount, setDutchCount] = useState(0)
  const [expectedDutchFirstYears, setExpectedDutchFirstYears] = useState<number>(0)
  const [expectedInternationalFirstYears, setExpectedInternationalFirstYears] = useState<number>(0)

  const flexibleTotal = useMemo(
    () => BASE_FEE + internationalCount * PER_STUDENT_INTERNATIONAL + dutchCount * PER_STUDENT_DUTCH,
    [internationalCount, dutchCount]
  )

  // ROI: 30% dropout rate → 2% of those we retain → × LTV (total revenue over 3/4 years)
  const roiDutch = useMemo(
    () =>
      Math.round(
        expectedDutchFirstYears * ROI_DROPOUT_RATE * ROI_RETENTION_PCT * ROI_LTV_DUTCH
      ),
    [expectedDutchFirstYears]
  )
  const roiInternational = useMemo(
    () =>
      Math.round(
        expectedInternationalFirstYears * ROI_DROPOUT_RATE * ROI_RETENTION_PCT * ROI_LTV_INTERNATIONAL
      ),
    [expectedInternationalFirstYears]
  )
  const roiTotal = roiDutch + roiInternational

  return (
    <>
      {/* Section 1: Cost of Inaction Hero */}
      <section
        className="relative pt-8 md:pt-12 pb-16 md:pb-24"
        aria-label="Cost of inaction"
      >
        <Container className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 text-center tracking-tight max-w-4xl mx-auto mb-6">
            Housing conflict is a retention problem.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 text-center max-w-3xl mx-auto mb-12 md:mb-16">
            Reduce mediation, improve stability, and turn shared living into a student-success lever.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn(GLASS, 'p-8 flex flex-col')}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                <Calculator className="h-7 w-7 text-indigo-700" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">€55.000</p>
              <p className="text-slate-600 text-sm md:text-base mt-2">
                Avg. loss per international student dropout.
              </p>
            </div>
            <div className={cn(GLASS, 'p-8 flex flex-col')}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                <Users className="h-7 w-7 text-indigo-700" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">40%</p>
              <p className="text-slate-600 text-sm md:text-base mt-2">
                Admin time lost to mediation.
              </p>
            </div>
            <div className={cn(GLASS, 'p-8 flex flex-col')}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                <TrendingUp className="h-7 w-7 text-indigo-700" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Top 3</p>
              <p className="text-slate-600 text-sm md:text-base mt-2">
                Driver of first-year attrition.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 2: Interactive Pricing Engine */}
      <Section className="py-10 md:py-14 lg:py-16">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
            University partnerships
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-10">
            Pilot or campus license — choose what fits your rollout.
          </p>

          <Tabs
            value={pricingMode}
            onValueChange={(v) => setPricingMode(v as 'flexible' | 'campus')}
            className="w-full mb-12"
          >
            <div className="w-full max-w-2xl mx-auto">
              <TabsList
                className={cn(
                  'relative grid w-full grid-cols-2 h-12 rounded-full p-0.5 overflow-hidden',
                  'bg-white/70 border border-white/80 backdrop-blur-xl',
                  'shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
                  'items-center'
                )}
              >
                {/* Sliding pill */}
                <motion.div
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  animate={{ x: pricingMode === 'flexible' ? 0 : '100%' }}
                  className={cn(
                    'absolute left-0.5 top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full',
                    'bg-slate-900',
                    'shadow-[0_12px_30px_rgba(15,23,42,0.14)] border border-slate-900/10'
                  )}
                />
                <TabsTrigger
                  value="flexible"
                  className={cn(
                    'relative z-10 h-full w-full rounded-full px-0 py-0 text-sm font-medium leading-none transition-colors',
                    'bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'data-[state=inactive]:text-slate-700 data-[state=active]:shadow-none',
                    'focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                  )}
                >
                  Flexible Pilot
                </TabsTrigger>
                <TabsTrigger
                  value="campus"
                  className={cn(
                    'relative z-10 h-full w-full rounded-full px-0 py-0 text-sm font-medium leading-none transition-colors',
                    'bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'data-[state=inactive]:text-slate-700 data-[state=active]:shadow-none',
                    'focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                  )}
                >
                  Campus License
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="flexible" className="mt-8">
              <p className="text-slate-600 text-center mb-8">
                Best for departments, specific cohorts, or a trial run. Set the sliders to your expected cohort; the total below is your estimated annual investment.
              </p>
              <div className={cn(GLASS, 'p-8 md:p-10 rounded-2xl max-w-2xl mx-auto')}>
                <p className="text-lg text-slate-800 font-semibold mb-6">
                  €{formatDutch(BASE_FEE)} / year infrastructure.
                </p>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      International students (€15/student)
                    </label>
                    <Slider
                      value={[internationalCount]}
                      onValueChange={([v]) => setInternationalCount(v)}
                      min={0}
                      max={10000}
                      step={100}
                      variant="institutional"
                    />
                    <p className="text-white/70 text-sm mt-1">{formatDutch(internationalCount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Dutch students (€5/student)
                    </label>
                    <Slider
                      value={[dutchCount]}
                      onValueChange={([v]) => setDutchCount(v)}
                      min={0}
                      max={30000}
                      step={100}
                      variant="institutional"
                    />
                    <p className="text-white/70 text-sm mt-1">{formatDutch(dutchCount)}</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/60">
                  <p className="text-sm text-slate-600 mb-1">Estimated annual total (excl. VAT)</p>
                  <motion.p
                    key={flexibleTotal}
                    initial={{ opacity: 0.7, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-slate-900"
                  >
                    {formatEur(flexibleTotal)}
                  </motion.p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campus" className="mt-8">
              <p className="text-slate-600 text-center mb-8">
                Best for a full rollout. Choose the tier that matches your campus size; the price is your annual investment, all-in.
              </p>
              <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'Small Campus',
                    subtitle: '<10k Students',
                    price: { main: '€12.250' },
                    bullets: ['Unlimited Matching', 'Basic Analytics'],
                  },
                  {
                    icon: Users,
                    title: 'Medium Campus',
                    subtitle: '10k–20k Students',
                    price: { main: '€24.250' },
                    bullets: ['SIS Integration', 'Priority Support', 'White-labeling'],
                  },
                  {
                    icon: TrendingUp,
                    title: 'Large Campus',
                    subtitle: '>20k Students',
                    price: { main: 'Custom Quote' },
                    bullets: ['Dedicated Success Manager', 'Custom API Access', 'Multi-Campus support'],
                  },
                ].map((tier) => {
                  const Icon = tier.icon
                  return (
                    <div key={tier.title} className={cn(GLASS, 'p-8 flex flex-col')}>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                        <Icon className="h-7 w-7 text-indigo-700" aria-hidden />
                      </div>

                      <div className="min-h-[52px]">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight text-balance">
                          {tier.title}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">{tier.subtitle}</p>
                      </div>

                      <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900 leading-tight">
                          <span className="block">{tier.price.main}</span>
                          {'sub' in tier.price ? <span className="block">{tier.price.sub}</span> : null}
                        </p>
                      </div>

                      <ul className="mt-4 space-y-2 text-slate-700 text-sm">
                        {tier.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-900/60" aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
              <p className="mt-6 text-center text-sm text-slate-500">
                Prices are per semester and excl. BTW.
              </p>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {/* Section 3: ROI Calculator */}
      <Section className="py-10 md:py-14 lg:py-16">
        <Container className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
            Your Return on Investment
          </h2>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-slate-600 mb-2">
              We assume a 30% first-year dropout rate (based on the average institution in The Netherlands) and estimate we can retain 2% (conservatively) of those at risk. The values below use the total revenue (LTV) each student would bring over their 3–4 years of study. The average LTV* is €25.000 for Dutch students and €55.000 for international students.
            </p>
            <p className="text-slate-500 text-xs">
              * These values include government funding/subsidy per student enrolled.
            </p>
          </div>

          <div className={cn(GLASS, 'p-8 md:p-10 rounded-2xl max-w-xl mx-auto')}>
            <div className="space-y-6 mb-6">
              <div>
                <label
                  htmlFor="roi-dutch-first-years"
                  className="block text-sm font-medium text-slate-800 mb-2"
                >
                  How many Dutch first years do you expect?
                </label>
                <input
                  id="roi-dutch-first-years"
                  type="number"
                  min={0}
                  max={100000}
                  value={expectedDutchFirstYears || ''}
                  onChange={(e) =>
                    setExpectedDutchFirstYears(
                      e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                    )
                  }
                  placeholder="e.g. 2000"
                  className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                />
              </div>
              <div>
                <label
                  htmlFor="roi-international-first-years"
                  className="block text-sm font-medium text-slate-800 mb-2"
                >
                  How many international first years do you expect?
                </label>
                <input
                  id="roi-international-first-years"
                  type="number"
                  min={0}
                  max={100000}
                  value={expectedInternationalFirstYears || ''}
                  onChange={(e) =>
                    setExpectedInternationalFirstYears(
                      e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                    )
                  }
                  placeholder="e.g. 1000"
                  className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/60 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Potential revenue saved (Dutch students)</p>
                <motion.p
                  key={roiDutch}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-slate-900"
                >
                  €{formatDutch(roiDutch)}
                </motion.p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  Potential revenue saved (International students)
                </p>
                <motion.p
                  key={roiInternational}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-slate-900"
                >
                  €{formatDutch(roiInternational)}
                </motion.p>
              </div>
              <div className="pt-2 border-t border-white/40">
                <p className="text-sm text-slate-600 mb-1">Total potential revenue saved</p>
                <motion.p
                  key={roiTotal}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-slate-900"
                >
                  €{formatDutch(roiTotal)}
                </motion.p>
              </div>
            </div>

            <Link
              href="/contact"
              className={cn(
                'mt-8 inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold w-full',
                'bg-slate-900 text-white',
                'shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
            >
              Start Your Pilot
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
