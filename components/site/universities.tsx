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
      'Select your city to see available universities and how many students are already using Domu Match.',
    selectCityPlaceholder: 'Select a city',
    noUniversities: 'No universities found in this city',
    students: 'students',
    student: 'student',
    contactText: 'Interested in bringing Domu Match to your university? Get in touch to learn more.',
    buttonText: 'Contact us',
    loading: 'Loading...',
  },
  nl: {
    title: 'Ontdek hoeveel compatibele huisgenoten op je wachten',
    titleHighlight: 'compatibele huisgenoten',
    subtitle:
      'Selecteer je stad om beschikbare universiteiten te zien en ontdek hoeveel studenten Domu Match al gebruiken.',
    selectCityPlaceholder: 'Selecteer een stad',
    noUniversities: 'Geen universiteiten gevonden in deze stad',
    students: 'studenten',
    student: 'student',
    contactText: 'Geïnteresseerd om Domu Match naar je universiteit te halen? Neem contact op om meer te weten te komen.',
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
              className="bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl"
              disableScrollLock
            >
              {loadingCities ? (
                <SelectItem value="loading" disabled className="text-white/70 justify-center">
                  {t.loading}
                </SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled className="text-white/70 justify-center">
                  Error loading cities
                </SelectItem>
              ) : cities.length === 0 ? (
                <SelectItem value="none" disabled className="text-white/70 justify-center">
                  No cities available
                </SelectItem>
              ) : (
                cities.map((city) => (
                  <SelectItem
                    key={city}
                    value={city}
                    className="text-white hover:bg-white/10 focus:bg-white/10 justify-center"
                  >
                    {city}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </motion.div>

        {selectedCity && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white/60">{t.loading}</p>
              </div>
            ) : universities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">{t.noUniversities}</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {universities.map((university, index) => (
                  <motion.div
                    key={university.id}
                    className={cn(
                      'glass noise-overlay p-6 flex flex-col min-h-[140px]',
                      'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                    )}
                    variants={itemVariants}
                    custom={index}
                    whileHover={reducedMotion ? undefined : { scale: 1.02, y: -2 }}
                  >
                    <h3 className="font-semibold text-white text-lg mb-4 leading-tight text-center flex-1">
                      {university.name}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-white/10 text-center">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
                        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                          {formatUserCount(university.user_count)}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
