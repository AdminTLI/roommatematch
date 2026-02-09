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
        className="relative overflow-hidden pt-8 md:pt-12 pb-16 md:pb-24"
        aria-label="Cost of inaction"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/50 via-purple-950/40 to-indigo-950/50" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
        </div>

        <Container className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center tracking-tight max-w-4xl mx-auto mb-6">
            Housing Conflict is a Retention Crisis.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 text-center max-w-3xl mx-auto mb-12 md:mb-16">
            Universities lose an average of €15.000 per year for every first-year dropout. Domu Match
            turns housing into a retention asset.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-8 flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                <Calculator className="h-7 w-7 text-indigo-400" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">€55.000</p>
              <p className="text-white/80 text-sm md:text-base mt-2">
                Avg. Loss per International Student Dropout.
              </p>
            </div>
            <div className="glass p-8 flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                <Users className="h-7 w-7 text-indigo-400" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">40%</p>
              <p className="text-white/80 text-sm md:text-base mt-2">
                Admin Time Wasted on Mediation.
              </p>
            </div>
            <div className="glass p-8 flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                <TrendingUp className="h-7 w-7 text-indigo-400" aria-hidden />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">Top 3</p>
              <p className="text-white/80 text-sm md:text-base mt-2">
                Reason for First-Year Attrition.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 2: Interactive Pricing Engine */}
      <Section className="bg-slate-950">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Choose your engagement
          </h2>
          <p className="text-white/80 text-center max-w-xl mx-auto mb-10">
            Two ways to work with us. Pick one and see what it means for your budget.
          </p>

          <Tabs
            value={pricingMode}
            onValueChange={(v) => setPricingMode(v as 'flexible' | 'campus')}
            className="w-full max-w-2xl mx-auto mb-12"
          >
            <TabsList
              className={cn(
                'relative grid w-full grid-cols-2 h-12 rounded-xl p-1 overflow-hidden',
                'bg-slate-800/80 border border-white/20'
              )}
            >
              {/* Sliding pill – matches CTA: gradient, rounded-xl, shadow */}
              <motion.div
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                animate={{ x: pricingMode === 'flexible' ? 0 : '100%' }}
                className={cn(
                  'absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-lg',
                  'bg-gradient-to-r from-indigo-500 to-purple-500',
                  'shadow-lg shadow-indigo-500/50 border border-white/10'
                )}
              />
              <TabsTrigger
                value="flexible"
                className={cn(
                  'relative z-10 h-full rounded-lg text-sm font-medium transition-colors',
                  'bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white',
                  'data-[state=inactive]:text-white/60 data-[state=active]:shadow-none',
                  'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
              >
                Flexible Pilot
              </TabsTrigger>
              <TabsTrigger
                value="campus"
                className={cn(
                  'relative z-10 h-full rounded-lg text-sm font-medium transition-colors',
                  'bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white',
                  'data-[state=inactive]:text-white/60 data-[state=active]:shadow-none',
                  'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
              >
                Campus License
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flexible" className="mt-8">
              <p className="text-white/80 text-center mb-8">
                Best for departments, specific cohorts, or a trial run. Set the sliders to your expected cohort; the total below is your estimated annual investment.
              </p>
              <div className="glass p-8 md:p-10 rounded-2xl max-w-2xl mx-auto">
                <p className="text-lg text-white font-semibold mb-6">
                  €{formatDutch(BASE_FEE)} / year infrastructure.
                </p>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
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
                    <label className="block text-sm font-medium text-white/90 mb-2">
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
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/80 mb-1">Estimated annual total (excl. VAT)</p>
                  <motion.p
                    key={flexibleTotal}
                    initial={{ opacity: 0.7, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white"
                  >
                    {formatEur(flexibleTotal)}
                  </motion.p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campus" className="mt-8">
              <p className="text-white/80 text-center mb-8">
                Best for a full rollout. Choose the tier that matches your campus size; the price is your annual investment, all-in.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 flex flex-col">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                    <Shield className="h-7 w-7 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-white">Small Campus</h3>
                  <p className="text-white/70 text-sm mt-1">&lt;10k Students</p>
                  <p className="text-2xl font-bold text-white mt-4">€12.250 / semester</p>
                  <ul className="mt-4 space-y-2 text-white/80 text-sm">
                    <li>Unlimited Matching</li>
                    <li>Basic Analytics</li>
                  </ul>
                </div>
                <div className="glass p-8 flex flex-col">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                    <Users className="h-7 w-7 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-white">Medium Campus</h3>
                  <p className="text-white/70 text-sm mt-1">10k–20k Students</p>
                  <p className="text-2xl font-bold text-white mt-4">€24.250 / semester</p>
                  <ul className="mt-4 space-y-2 text-white/80 text-sm">
                    <li>SIS Integration</li>
                    <li>Priority Support</li>
                    <li>White-labeling</li>
                  </ul>
                </div>
                <div className="glass p-8 flex flex-col">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                    <TrendingUp className="h-7 w-7 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-white">Large Campus</h3>
                  <p className="text-white/70 text-sm mt-1">&gt;20k Students</p>
                  <p className="text-2xl font-bold text-white mt-4">Custom Quote</p>
                  <ul className="mt-4 space-y-2 text-white/80 text-sm">
                    <li>Dedicated Success Manager</li>
                    <li>Custom API Access</li>
                    <li>Multi-Campus support</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {/* Section 3: ROI Calculator */}
      <Section className="bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none" aria-hidden />
        <Container className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Your Return on Investment
          </h2>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-white/80 mb-2">
              We assume a 30% first-year dropout rate (based on the average institution in The Netherlands) and estimate we can retain 2% (conservatively) of those at risk. The values below use the total revenue (LTV) each student would bring over their 3–4 years of study. The average LTV* is €25.000 for Dutch students and €55.000 for international students.
            </p>
            <p className="text-white/60 text-xs">
              * These values include government funding/subsidy per student enrolled.
            </p>
          </div>

          <div className="glass p-8 md:p-10 rounded-2xl max-w-xl mx-auto">
            <div className="space-y-6 mb-6">
              <div>
                <label htmlFor="roi-dutch-first-years" className="block text-sm font-medium text-white/90 mb-2">
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
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="roi-international-first-years" className="block text-sm font-medium text-white/90 mb-2">
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
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 space-y-4">
              <div>
                <p className="text-sm text-white/80 mb-1">Potential revenue saved (Dutch students)</p>
                <motion.p
                  key={roiDutch}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white"
                >
                  €{formatDutch(roiDutch)}
                </motion.p>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-1">Potential revenue saved (International students)</p>
                <motion.p
                  key={roiInternational}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white"
                >
                  €{formatDutch(roiInternational)}
                </motion.p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-white/80 mb-1">Total potential revenue saved</p>
                <motion.p
                  key={roiTotal}
                  initial={{ opacity: 0.7, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white"
                >
                  €{formatDutch(roiTotal)}
                </motion.p>
              </div>
            </div>

            <Link
              href="/contact"
              className={cn(
                'mt-8 inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold w-full',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
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
