'use client'

import { useState, useEffect } from 'react'
import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useApp } from '@/app/providers'
import { helpContent, getSectionById, getArticleById } from './help-content'
import { HelpCenterSearch } from './components/help-center-search'
import { HelpSection } from './components/help-section'
import { useSearchParams, useRouter } from 'next/navigation'

export function HelpCenterContent() {
  const { locale } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedSection, setSelectedSection] = useState<string>('getting-started')
  const [highlightArticleId, setHighlightArticleId] = useState<string | undefined>()
  
  const content = helpContent[locale as 'en' | 'nl'] || helpContent.en
  const sections = content

  // Handle URL params for direct article links
  useEffect(() => {
    const sectionParam = searchParams.get('section')
    const articleParam = searchParams.get('article')
    
    if (sectionParam) {
      const section = getSectionById(sectionParam, locale as 'en' | 'nl')
      if (section) {
        setSelectedSection(sectionParam)
      }
    }
    
    if (articleParam) {
      setHighlightArticleId(articleParam)
      const article = getArticleById(articleParam, locale as 'en' | 'nl')
      if (article) {
        setSelectedSection(article.section)
      }
    }
  }, [searchParams, locale])

  const handleArticleSelect = (articleId: string, sectionId: string) => {
    setSelectedSection(sectionId)
    setHighlightArticleId(articleId)
    router.push(`/help-center?section=${sectionId}&article=${articleId}`)
    
    // Scroll to article after a brief delay
    setTimeout(() => {
      const element = document.getElementById(`article-${articleId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId)
    setHighlightArticleId(undefined)
    router.push(`/help-center?section=${sectionId}`)
  }

  return (
    <Section className="min-h-screen py-12 md:py-16">
      <Container>
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600/70" aria-hidden />
            Domu Match
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {locale === 'nl' ? 'Helpcentrum' : 'Help Center'}
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            {locale === 'nl' 
              ? 'Vind antwoorden op je vragen en leer hoe je het platform optimaal gebruikt'
              : 'Find answers to your questions and learn how to make the most of our platform'
            }
          </p>
          <HelpCenterSearch onArticleSelect={handleArticleSelect} />
        </div>

        {/* Section Navigation Tabs */}
        <div className="mb-8">
          <Tabs value={selectedSection} onValueChange={handleSectionChange}>
            <TabsList className="flex-wrap h-auto p-2 rounded-3xl overflow-x-auto border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="px-4 py-2 rounded-2xl transition-colors duration-200 whitespace-nowrap text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  aria-label={`View ${section.title} section`}
                >
                  <span className="mr-2">{section.icon}</span>
                  <span className="hidden sm:inline">{section.title}</span>
                  <span className="sm:hidden">{section.icon}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Section Content */}
            {sections.map((section) => {
              const sectionData = getSectionById(section.id, locale as 'en' | 'nl')
              if (!sectionData) return null

              return (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="mt-8 focus-visible:outline-none"
                >
                  <div id={`section-${section.id}`} className="scroll-mt-8">
                    <HelpSection
                      section={sectionData}
                      highlightArticleId={highlightArticleId}
                      onArticleClick={handleArticleSelect}
                    />
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 pt-12 border-t border-white/60">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            {locale === 'nl' ? 'Nog steeds hulp nodig?' : 'Still need help?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="/contact"
              className="p-6 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:bg-white/60 transition-all duration-200 text-center"
              aria-label="Contact us for help"
            >
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {locale === 'nl' ? 'Contact Ons' : 'Contact Us'}
              </h3>
              <p className="text-sm text-slate-700">
                {locale === 'nl' 
                  ? 'Stuur ons een bericht voor persoonlijke hulp'
                  : 'Send us a message for personalized assistance'
                }
              </p>
            </a>
            <a
              href="/safety"
              className="p-6 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:bg-white/60 transition-all duration-200 text-center"
              aria-label="Visit safety center"
            >
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {locale === 'nl' ? 'Veiligheidscentrum' : 'Safety Center'}
              </h3>
              <p className="text-sm text-slate-700">
                {locale === 'nl' 
                  ? 'Leer meer over veiligheidsfuncties en rapportage'
                  : 'Learn about safety features and reporting'
                }
              </p>
            </a>
            <a
              href="mailto:support@domumatch.com"
              className="p-6 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:bg-white/60 transition-all duration-200 text-center"
              aria-label="Email support"
            >
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {locale === 'nl' ? 'Directe Support' : 'Direct Support'}
              </h3>
              <p className="text-sm text-slate-700">
                {locale === 'nl' 
                  ? 'E-mail ons direct voor snelle hulp'
                  : 'Email us directly for quick help'
                }
              </p>
            </a>
          </div>
        </div>
      </Container>
    </Section>
  )
}
