'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

interface University {
  id: string
  name: string
  slug: string
  city: string
  user_count: number
}

const content = {
  en: {
    title: 'Find out how many compatible roommates are waiting for you',
    titleHighlight: 'compatible roommates',
    subtitle:
      'Select your city to see how many students and young professionals in that city are already using Domu Match.',
    selectCityPlaceholder: 'Select a city',
    noUniversities: 'No users found in this city yet',
    students: 'people',
    student: 'person',
    potentialOne: 'potential roommate',
    potentialMany: 'potential roommates',
    peopleWord: 'people',
    cityBody:
      'are already using Domu Match in this city, a growing pool of potential matches who share your lifestyle, budget, and expectations for shared living.',
    contactText: 'Interested in bringing Domu Match to your university or city? Get in touch to learn more.',
    buttonText: 'Contact us',
    loading: 'Loading...',
  },
  nl: {
    title: 'Ontdek hoeveel compatibele huisgenoten op je wachten',
    titleHighlight: 'compatibele huisgenoten',
    subtitle:
      'Selecteer je stad en zie hoeveel studenten en young professionals in die stad Domu Match al gebruiken.',
    selectCityPlaceholder: 'Selecteer een stad',
    noUniversities: 'Nog geen gebruikers in deze stad',
    students: 'personen',
    student: 'persoon',
    potentialOne: 'potentiële huisgenoot',
    potentialMany: 'potentiële huisgenoten',
    peopleWord: 'personen',
    cityBody:
      'gebruiken Domu Match al in deze stad, een groeiende groep mogelijke huisgenoten die jouw levensstijl, budget en verwachtingen rond samenwonen delen.',
    contactText: 'Geïnteresseerd om Domu Match naar jouw universiteit of stad te halen? Neem contact op om meer te weten te komen.',
    buttonText: 'Neem contact op',
    loading: 'Laden...',
  },
}

export function Universities() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectReady, setSelectReady] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        setError(null)
        const response = await fetch('/api/universities')
        if (!response.ok) throw new Error(`Failed to fetch cities: ${response.status}`)
        const data = await response.json()
        if (data.cities && Array.isArray(data.cities)) {
          setCities(data.cities)
        } else {
          setCities([])
        }
      } catch (err) {
        setError('Failed to load cities')
        setCities([])
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  useEffect(() => {
    if (!selectedCity) {
      setUniversities([])
      return
    }
    const fetchUniversities = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/universities?city=${encodeURIComponent(selectedCity)}`)
        if (!response.ok) throw new Error('Failed to fetch universities')
        const data = await response.json()
        setUniversities(data.universities || [])
      } catch (err) {
        setUniversities([])
      } finally {
        setLoading(false)
      }
    }
    fetchUniversities()
  }, [selectedCity])

  useEffect(() => {
    setSelectReady(true)
  }, [])

  const formatUserCount = (count: number): string => {
    if (count === 0) return `0 ${t.students}`
    if (count === 1) return `1 ${t.student}`
    return `${count} ${t.students}`
  }

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reducedMotion ? 0 : i * 0.06, duration: 0.35, ease: 'easeOut' },
    }),
  }

  return (
    <Section className="relative overflow-hidden py-16 md:py-24">
      <Container className="relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 max-w-4xl mx-auto">
            {locale === 'nl' ? (
              <>Ontdek hoeveel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{t.titleHighlight}</span> op je wachten</>
            ) : (
              <>Find out how many <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{t.titleHighlight}</span> are waiting for you</>
            )}
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {selectReady && (
            <Select
              value={selectedCity || ''}
              onValueChange={(value) => setSelectedCity(value || null)}
              disabled={loadingCities}
            >
              <SelectTrigger
                className={cn(
                  'w-full h-12 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm',
                  '!text-white hover:bg-white/10 hover:border-white/30',
                  'focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50',
                  '[&>span]:flex-1 [&>span]:text-center [&>span]:!text-white',
                  '[&>span[data-placeholder]]:!text-white/70',
                  '[&_svg]:!text-white [&_svg]:opacity-80'
                )}
              >
                <SelectValue placeholder={t.selectCityPlaceholder} />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  'glass noise-overlay border border-white/15 rounded-2xl bg-slate-900/80 backdrop-blur-2xl',
                  'shadow-[0_18px_45px_rgba(15,23,42,0.75)] max-h-[280px] overflow-y-auto px-1 py-2'
                )}
                disableScrollLock
              >
                {loadingCities ? (
                  <SelectItem
                    value="loading"
                    disabled
                    className="text-white/70 justify-center text-sm px-4 py-2.5"
                  >
                    {t.loading}
                  </SelectItem>
                ) : error ? (
                  <SelectItem
                    value="error"
                    disabled
                    className="text-white/70 justify-center text-sm px-4 py-2.5"
                  >
                    Error loading cities
                  </SelectItem>
                ) : cities.length === 0 ? (
                  <SelectItem
                    value="none"
                    disabled
                    className="text-white/70 justify-center text-sm px-4 py-2.5"
                  >
                    No cities available
                  </SelectItem>
                ) : (
                  cities.map((city) => (
                    <SelectItem
                      key={city}
                      value={city}
                      className={cn(
                        'relative text-white text-sm justify-center rounded-xl px-4 py-2.5 cursor-pointer',
                        'transition-colors duration-150',
                        'hover:bg-white/10 focus:bg-white/10',
                        'focus:text-white data-[highlighted]:text-white data-[state=checked]:text-white',
                        'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500/40 data-[state=checked]:to-purple-500/40'
                      )}
                    >
                      {city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </motion.div>

        {selectedCity && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white/60">{t.loading}</p>
              </div>
            ) : (
              <>
                {universities.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/60">{t.noUniversities}</p>
                  </div>
                ) : (
                  <motion.div
                    className="max-w-xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  >
                    <motion.div
                      className={cn(
                        'glass noise-overlay p-6 md:p-7 flex flex-col items-center text-center min-h-[160px]',
                        'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                      )}
                      variants={itemVariants}
                      custom={0}
                      whileHover={reducedMotion ? undefined : { scale: 1.02, y: -2 }}
                    >
                      {(() => {
                        const totalUsers = universities.reduce(
                          (sum, uni) => sum + (uni.user_count || 0),
                          0
                        )
                        return (
                          <>
                            <div className="mb-5">
                              <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 shadow-lg shadow-indigo-500/20">
                                <span className="font-semibold text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                                  {selectedCity}
                                </span>
                              </span>
                            </div>
                            <p className="text-2xl md:text-3xl font-semibold text-white mb-3">
                              {totalUsers.toLocaleString('en-US')}{' '}
                              {totalUsers === 1 ? t.potentialOne : t.potentialMany}
                            </p>
                            <p className="text-sm md:text-base text-white/70 max-w-md">
                              {t.cityBody}
                            </p>
                          </>
                        )
                      })()}
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-white/60 mb-6 max-w-xl mx-auto">{t.contactText}</p>
          <Link
            href="/contact"
            className={cn(
              'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
              'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
            )}
          >
            {t.buttonText}
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}
