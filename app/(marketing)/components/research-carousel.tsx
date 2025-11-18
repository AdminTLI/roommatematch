'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'

interface ResearchCarouselProps {
  locale?: 'en' | 'nl'
}

export function ResearchCarousel({ locale: localeProp }: ResearchCarouselProps) {
  const { locale: contextLocale } = useApp()
  const locale = localeProp || contextLocale
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Responsive card widths and gaps - calculated to fit exactly 3 cards in container
  // Default values for SSR to prevent hydration mismatch
  const getDefaultCardWidth = () => {
    // Default desktop values that match server render
    const containerMaxWidth = 1152
    const containerPadding = 64
    const gap = 24
    const minHeight = 850
    const availableWidth = containerMaxWidth - containerPadding // 1088px available
    const base = Math.floor((availableWidth - 40 - 2 * gap) / 3) // ~336px
    return { base, center: base + 40, gap, minHeight, containerWidth: containerMaxWidth, containerPadding }
  }
  
  const getCardWidth = () => {
    if (typeof window === 'undefined') return getDefaultCardWidth()
    const containerMaxWidth = 1152
    let containerPadding = 32 // px-4 = 16px each side
    let gap = 12
    let minHeight = 800 // Further increased min-height to prevent text truncation
    
    if (window.innerWidth < 640) {
      containerPadding = 32
      gap = 12
      minHeight = 500 // Reduced from 750px for mobile - text fits naturally
      const availableWidth = Math.min(window.innerWidth - containerPadding, containerMaxWidth - containerPadding)
      const base = Math.floor((availableWidth - 20 - 2 * gap) / 3)
      const containerWidth = Math.min(window.innerWidth, containerMaxWidth)
      return { base, center: base + 20, gap, minHeight, containerWidth, containerPadding }
    }
    if (window.innerWidth < 768) {
      containerPadding = 48 // sm:px-6 = 24px each side
      gap = 16
      minHeight = 550 // Reduced from 780px for tablet
      const availableWidth = Math.min(window.innerWidth - containerPadding, containerMaxWidth - containerPadding)
      const base = Math.floor((availableWidth - 20 - 2 * gap) / 3)
      const containerWidth = Math.min(window.innerWidth, containerMaxWidth)
      return { base, center: base + 20, gap, minHeight, containerWidth, containerPadding }
    }
    if (window.innerWidth < 1024) {
      containerPadding = 64 // md:px-8 = 32px each side
      gap = 20
      minHeight = 650 // Reduced from 820px
      const availableWidth = Math.min(window.innerWidth - containerPadding, containerMaxWidth - containerPadding)
      const base = Math.floor((availableWidth - 30 - 2 * gap) / 3)
      const containerWidth = Math.min(window.innerWidth, containerMaxWidth)
      return { base, center: base + 30, gap, minHeight, containerWidth, containerPadding }
    }
    // Desktop: max-w-[1152px] with md:px-8 (64px total padding)
    containerPadding = 64
    gap = 24
    minHeight = 850 // Increased by 100px from 750px for desktop to show all text
    const availableWidth = containerMaxWidth - containerPadding // 1088px available
    const base = Math.floor((availableWidth - 40 - 2 * gap) / 3) // ~336px
    return { base, center: base + 40, gap, minHeight, containerWidth: containerMaxWidth, containerPadding }
  }
  
  // Initialize with default values to match SSR
  const [cardDimensions, setCardDimensions] = useState(getDefaultCardWidth())
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    // Set mounted flag and update dimensions after hydration
    setIsMounted(true)
    setCardDimensions(getCardWidth())
    
    const handleResize = () => {
      setCardDimensions(getCardWidth())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const content = {
    en: {
      title: "problem",
      subtitle: "Research-backed insights on roommate compatibility and student housing satisfaction",
      stats: [
        {
          statistic: "47.9%",
          issue: "of students report frequent or occasional conflict with roommates",
          explanation: "Nearly half of all students face roommate conflict - a widespread problem that impacts well-being and academic performance.",
          source: "Golding et al., 'Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students'",
          solution: "Domu Match's compatibility scoring analyzes 40+ lifestyle factors - study habits, cleanliness preferences, social needs - to prevent conflicts before they start. Our algorithm matches students with similar values and complementary personalities.",
        },
        {
          statistic: "Compatibility compounds",
          issue: "Roommate assimilation effects increase over time",
          explanation: "The longer roommates live together, the stronger the peer effect on academic performance. Good matches deliver compounding benefits.",
          source: "Cao et al., 'Heterogeneous peer effects of college roommates on academic performance' (Nature, 2024)",
          solution: "Our matching isn't just for week one - it's designed for long-term success. By aligning study habits, schedules, and academic goals upfront, we create matches that improve over time, not deteriorate.",
        },
        {
          statistic: "67.6%",
          issue: "of students have considered changing dormitories due to roommate conflict",
          explanation: "When matches go wrong, students want to switch, creating disruption, cost, and stress for both students and housing departments.",
          source: "Deng (cited in Empirical Study of Dormitory Conflict)",
          solution: "Domu Match reduces churn by getting it right the first time. Our comprehensive compatibility model and transparent matching process help students make informed decisions, reducing the need for room changes.",
        },
        {
          statistic: "50.1% women, 44.1% men",
          issue: "report roommate conflict in first-year university students",
          explanation: "Conflict affects almost half the cohort regardless of gender, emphasizing the unmet need for better matching solutions.",
          source: "Burgos-Calvillo et al., 'Cultural Modes of Conflict Resolution, Roommate Satisfaction & School Belonging' (2024)",
          solution: "Our ID verification ensures all users are verified students, creating a safe environment. Combined with our compatibility algorithm, we address the root causes of conflict across all demographics.",
        },
        {
          statistic: "70%",
          issue: "of students are satisfied with their roommate",
          explanation: "Having a satisfying roommate relationship clearly contributes to overall housing satisfaction - compatibility is a key driver.",
          source: "InsideHigherEd article on SDSU survey (2024)",
          solution: "Domu Match's science-backed approach helps you find roommates as compatible as your best friends. Our transparent matching shows exactly why you're compatible, building trust from day one.",
        },
      ],
    },
    nl: {
      title: "probleem",
      subtitle: "Onderzoek-ondersteunde inzichten over huisgenootcompatibiliteit en studentenhuisvestingstevredenheid",
      stats: [
        {
          statistic: "47,9%",
          issue: "van de studenten meldt frequente of occasionele conflicten met huisgenoten",
          explanation: "Bijna de helft van alle studenten krijgt te maken met huisgenootconflicten - een wijdverbreid probleem dat het welzijn en de academische prestaties beïnvloedt.",
          source: "Golding et al., 'Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students'",
          solution: "De compatibiliteitsscore van Domu Match analyseert 40+ levensstijlfactoren - studiegewoonten, netheidsvoorkeuren, sociale behoeften - om conflicten te voorkomen voordat ze beginnen. Ons algoritme matcht studenten met vergelijkbare waarden en complementaire persoonlijkheden.",
        },
        {
          statistic: "Compatibiliteit componeert",
          issue: "Huisgenootassimilatie-effecten nemen in de loop van de tijd toe",
          explanation: "Hoe langer huisgenoten samenwonen, hoe sterker het peereffect op academische prestaties. Goede matches leveren samengestelde voordelen op.",
          source: "Cao et al., 'Heterogeneous peer effects of college roommates on academic performance' (Nature, 2024)",
          solution: "Onze matching is niet alleen voor week één - het is ontworpen voor langetermijnsucces. Door studiegewoonten, schema's en academische doelen van tevoren af te stemmen, creëren we matches die in de loop van de tijd verbeteren, niet verslechteren.",
        },
        {
          statistic: "67,6%",
          issue: "van de studenten heeft overwogen om van studentenhuis te veranderen vanwege huisgenootconflicten",
          explanation: "Wanneer matches misgaan, willen studenten wisselen, wat verstoring, kosten en stress veroorzaakt voor zowel studenten als huisvestingsafdelingen.",
          source: "Deng (geciteerd in Empirical Study of Dormitory Conflict)",
          solution: "Domu Match vermindert verloop door het vanaf het begin goed te doen. Ons uitgebreide compatibiliteitsmodel en transparante matchingproces helpen studenten weloverwogen beslissingen te nemen, waardoor de behoefte aan kamerwisselingen wordt verminderd.",
        },
        {
          statistic: "50,1% vrouwen, 44,1% mannen",
          issue: "meldt huisgenootconflicten bij eerstejaars universiteitsstudenten",
          explanation: "Conflict treft bijna de helft van de cohort ongeacht geslacht, wat de onvervulde behoefte aan betere matchingoplossingen benadrukt.",
          source: "Burgos-Calvillo et al., 'Cultural Modes of Conflict Resolution, Roommate Satisfaction & School Belonging' (2024)",
          solution: "Onze ID-verificatie zorgt ervoor dat alle gebruikers geverifieerde studenten zijn, wat een veilige omgeving creëert. Gecombineerd met ons compatibiliteitsalgoritme pakken we de oorzaken van conflicten aan in alle demografieën.",
        },
        {
          statistic: "70%",
          issue: "van de studenten is tevreden met hun huisgenoot",
          explanation: "Een bevredigende huisgenootrelatie draagt duidelijk bij aan de algehele huisvestingstevredenheid - compatibiliteit is een belangrijke drijvende kracht.",
          source: "InsideHigherEd artikel over SDSU-enquête (2024)",
          solution: "De wetenschappelijk onderbouwde aanpak van Domu Match helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden. Onze transparante matching laat precies zien waarom je compatibel bent, wat vertrouwen opbouwt vanaf dag één.",
        },
      ],
    },
  }

  const text = content[locale]
  const stats = text.stats

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(true)
  }

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : stats.length - 1
    goToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < stats.length - 1 ? currentIndex + 1 : 0
    goToIndex(newIndex)
  }

  // Auto-rotation every 7 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        return prevIndex < stats.length - 1 ? prevIndex + 1 : 0
      })
    }, 7000)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isAutoPlaying, stats.length])

  // Pause auto-play on user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
    }
    // Resume after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 10000)
  }

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    handleUserInteraction()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrev()
    }
  }

  return (
    <Section className="bg-white py-8 md:py-12">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4 leading-tight">
            {locale === 'nl' ? (
              <>Het <span className="text-brand-primary">probleem</span> dat we oplossen</>
            ) : (
              <>The <span className="text-brand-primary">problem</span> we are solving</>
            )}
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {text.subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full overflow-hidden pt-8 sm:pt-12 pb-0">
          {/* Carousel */}
          <div 
            ref={containerRef}
            className="relative w-full max-w-[1152px] mx-auto px-4 sm:px-6 md:px-8" 
          >
            <div className="relative overflow-hidden" style={{ width: '100%' }}>
              <div
                ref={carouselRef}
                className="flex items-center gap-3 sm:gap-4 md:gap-6 transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(calc(50% - ${cardDimensions.center / 2}px - ${currentIndex * (cardDimensions.base + cardDimensions.gap)}px))`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
              {stats.map((stat, index) => {
                const isCenter = index === currentIndex
                const distance = Math.abs(index - currentIndex)
                // Only show maximum 3 cards: left neighbor, center, right neighbor
                const shouldShow = distance <= 1
                
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 transition-all duration-1000 ease-in-out"
                    style={{
                      width: isCenter ? `${cardDimensions.center}px` : `${cardDimensions.base}px`,
                      minHeight: typeof window !== 'undefined' && window.innerWidth < 1024 
                        ? 'auto' 
                        : cardDimensions.minHeight + 'px',
                      opacity: shouldShow ? (distance === 1 ? 0.7 : 1) : 0,
                      visibility: shouldShow ? 'visible' : 'hidden',
                      transform: isCenter ? 'scale(1.05)' : 'scale(0.95)',
                      pointerEvents: shouldShow ? 'auto' : 'none',
                    }}
                  >
                    <Card
                      className={`border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 rounded-2xl transition-all duration-1000 flex flex-col ${
                        isCenter ? 'shadow-elev-2' : ''
                      }`}
                      style={{ minHeight: '100%' }}
                    >
                      <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 min-h-0">
                        <div className={`font-bold text-brand-primary mb-1.5 sm:mb-2 md:mb-3 transition-all duration-1000 flex-shrink-0 ${
                          isCenter ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                        }`}>
                          {stat.statistic}
                        </div>
                        <h3 className={`font-semibold text-brand-text mb-1.5 sm:mb-2 md:mb-3 transition-all duration-1000 flex-shrink-0 line-clamp-2 ${
                          isCenter ? 'text-xs sm:text-sm md:text-base lg:text-lg' : 'text-[10px] sm:text-xs md:text-sm lg:text-base'
                        }`}>
                          {stat.issue}
                        </h3>
                        <p className={`text-brand-muted mb-2 sm:mb-3 md:mb-4 leading-snug sm:leading-relaxed transition-all duration-1000 line-clamp-3 sm:line-clamp-none ${
                          isCenter ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[9px] sm:text-[10px] md:text-xs'
                        }`}>
                          {stat.explanation}
                        </p>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-brand-muted italic mb-2 sm:mb-3 md:mb-4 pb-2 sm:pb-3 md:pb-4 border-b border-brand-border/30 flex-shrink-0 line-clamp-2 sm:line-clamp-none">
                          {stat.source}
                        </p>
                        <div className="pt-1.5 sm:pt-2 flex-shrink-0 flex-1">
                          <p className={`text-brand-muted leading-snug sm:leading-relaxed transition-all duration-1000 line-clamp-4 sm:line-clamp-none ${
                            isCenter ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[9px] sm:text-[10px] md:text-xs'
                          }`}>
                            {stat.solution}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
              </div>
              
              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2" style={{ marginTop: '12px' }}>
                {stats.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      goToIndex(index)
                      handleUserInteraction()
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-brand-primary'
                        : 'bg-brand-border hover:bg-brand-primary/50'
                    }`}
                    style={{
                      width: '16px',
                      height: '16px',
                      minWidth: '16px',
                      minHeight: '16px',
                      flexShrink: 0,
                      padding: 0,
                    }}
                    aria-label={`${locale === 'nl' ? 'Ga naar slide' : 'Go to slide'} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
