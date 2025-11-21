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
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

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
      setCurrentIndex((prev) => (prev < stats.length - 1 ? prev + 1 : 0))
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : stats.length - 1))
    }
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
    handleUserInteraction()
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
        <div className="relative w-full">
          <div 
            className="relative overflow-hidden px-2 sm:px-4 md:px-6 lg:px-8"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-center">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 16}px))`,
                }}
              >
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[96%] sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%]"
                    style={{
                      paddingRight: index < stats.length - 1 ? '1rem' : '0',
                    }}
                  >
                    <Card className="border border-brand-border/50 bg-white rounded-2xl shadow-lg">
                      <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col">
                        <div className="font-bold text-brand-primary mb-3 text-2xl sm:text-3xl md:text-4xl">
                          {stat.statistic}
                        </div>
                        <h3 className="font-semibold text-brand-text mb-3 text-sm sm:text-base md:text-lg">
                          {stat.issue}
                        </h3>
                        <p className="text-brand-muted mb-4 leading-relaxed text-xs sm:text-sm md:text-base">
                          {stat.explanation}
                        </p>
                        <p className="text-brand-muted italic mb-4 pb-4 border-b border-brand-border/30 text-[10px] sm:text-xs">
                          {stat.source}
                        </p>
                        <p className="text-brand-muted leading-relaxed text-xs sm:text-sm md:text-base">
                          {stat.solution}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10 md:mt-12">
            {stats.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-brand-primary'
                    : 'bg-brand-border hover:bg-brand-primary/50'
                }`}
                style={{
                  width: '12px',
                  height: '12px',
                  minWidth: '12px',
                  minHeight: '12px',
                }}
                aria-label={`${locale === 'nl' ? 'Ga naar slide' : 'Go to slide'} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
