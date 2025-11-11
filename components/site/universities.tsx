'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

interface University {
  id: string
  name: string
  slug: string
  city: string
  user_count: number
}

const content = {
  en: {
    title: "Find out how many potential matches are waiting for you",
    subtitle: "Select your city to see available universities and see how many students are already using Domu Match",
    initialMessage: "Find out how many potential matches are waiting for you at your university",
    selectCityPlaceholder: "Select a city",
    noUniversities: "No universities found in this city",
    students: "students",
    student: "student",
    contactText: "Interested in bringing Domu Match to your university? Get in touch to learn more.",
    buttonText: "Contact us",
    loading: "Loading...",
    selectCityHint: "Select a city above to get started",
  },
  nl: {
    title: "Ontdek hoeveel potentiële matches op je wachten",
    subtitle: "Selecteer je stad om beschikbare universiteiten te zien en ontdek hoeveel studenten Domu Match al gebruiken",
    initialMessage: "Ontdek hoeveel potentiële matches op je universiteit op je wachten",
    selectCityPlaceholder: "Selecteer een stad",
    noUniversities: "Geen universiteiten gevonden in deze stad",
    students: "studenten",
    student: "student",
    contactText: "Geïnteresseerd om Domu Match naar je universiteit te halen? Neem contact op om meer te weten te komen.",
    buttonText: "Neem contact op",
    loading: "Laden...",
    selectCityHint: "Selecteer hierboven een stad om te beginnen",
  }
}

export function Universities() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        const response = await fetch('/api/universities')
        if (!response.ok) {
          throw new Error('Failed to fetch cities')
        }
        const data = await response.json()
        setCities(data.cities || [])
      } catch (err) {
        console.error('Error fetching cities:', err)
        setError('Failed to load cities')
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Fetch universities when city changes
  useEffect(() => {
    const fetchUniversities = async () => {
      if (!selectedCity) {
        setUniversities([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/universities?city=${encodeURIComponent(selectedCity)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch universities')
        }
        const data = await response.json()
        setUniversities(data.universities || [])
      } catch (err) {
        console.error('Error fetching universities:', err)
        setError('Failed to load universities')
        setUniversities([])
      } finally {
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [selectedCity])

  const handleBecomePartner = () => {
    router.push('/contact')
  }

  const formatUserCount = (count: number): string => {
    if (count === 0) {
      return `0 ${t.students}`
    }
    if (count === 1) {
      return `1 ${t.student}`
    }
    return `${count} ${t.students}`
  }

  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            {t.title}
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted mb-8">
            {t.subtitle}
          </p>

          {/* City Selector */}
          <div className="max-w-md mx-auto mb-8">
            <Select
              value={selectedCity || ''}
              onValueChange={(value) => setSelectedCity(value || null)}
              disabled={loadingCities}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.selectCityPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {loadingCities ? (
                  <SelectItem value="loading" disabled>
                    {t.loading}
                  </SelectItem>
                ) : cities.length === 0 ? (
                  <SelectItem value="none" disabled>
                    {t.noUniversities}
                  </SelectItem>
                ) : (
                  cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Message or University List */}
          {!selectedCity ? (
            <div className="max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl font-semibold text-brand-text mb-4">
                {t.initialMessage}
              </p>
              <p className="text-base text-brand-muted">
                {t.selectCityHint}
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-brand-muted">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : universities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-muted">{t.noUniversities}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {universities.map((university) => (
                <Card
                  key={university.id}
                  className="rounded-xl border border-brand-border/50 bg-white/80 backdrop-blur-sm p-6 shadow-elev-1 hover:shadow-elev-2 transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    <h3 className="font-semibold text-brand-text text-lg mb-2 leading-tight">
                      {university.name}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-brand-border/30">
                      <p className="text-sm text-brand-muted">
                        {formatUserCount(university.user_count)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <p className="text-sm text-brand-muted mb-6">
            {t.contactText}
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={handleBecomePartner}
          >
            {t.buttonText}
          </Button>
        </div>
      </Container>
    </Section>
  )
}
