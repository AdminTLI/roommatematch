'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ResearchCarouselProps {
  locale?: 'en' | 'nl'
}

export function ResearchCarousel({ locale: localeProp }: ResearchCarouselProps) {
  const { locale: contextLocale } = useApp()
  const locale = localeProp || contextLocale
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const content = {
    en: {
      title: "The problem we're solving",
      subtitle: "Research-backed insights on roommate compatibility and student housing satisfaction",
      stats: [
        {
          statistic: "47.9%",
          issue: "of students report frequent or occasional conflict with roommates",
          explanation: "Nearly half of all students face roommate conflict—a widespread problem that impacts well-being and academic performance.",
          source: "Golding et al., 'Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students'",
          solution: "Domu Match's compatibility scoring analyzes 40+ lifestyle factors—study habits, cleanliness preferences, social needs—to prevent conflicts before they start. Our algorithm matches students with similar values and complementary personalities.",
        },
        {
          statistic: "Compatibility compounds",
          issue: "Roommate assimilation effects increase over time",
          explanation: "The longer roommates live together, the stronger the peer effect on academic performance. Good matches deliver compounding benefits.",
          source: "Cao et al., 'Heterogeneous peer effects of college roommates on academic performance' (Nature, 2024)",
          solution: "Our matching isn't just for week one—it's designed for long-term success. By aligning study habits, schedules, and academic goals upfront, we create matches that improve over time, not deteriorate.",
        },
        {
          statistic: "67.6%",
          issue: "of students have considered changing dormitories due to roommate conflict",
          explanation: "When matches go wrong, students want to switch—creating disruption, cost, and stress for both students and housing departments.",
          source: "Deng (cited in Empirical Study of Dormitory Conflict)",
          solution: "Domu Match reduces churn by getting it right the first time. Our comprehensive compatibility model and transparent matching process help students make informed decisions, reducing the need for room changes.",
        },
        {
          statistic: "50.1% women, 44.1% men",
          issue: "report roommate conflict in first-year university students",
          explanation: "Conflict affects almost half the cohort regardless of gender—emphasizing the unmet need for better matching solutions.",
          source: "Burgos-Calvillo et al., 'Cultural Modes of Conflict Resolution, Roommate Satisfaction & School Belonging' (2024)",
          solution: "Our ID verification ensures all users are verified students, creating a safe environment. Combined with our compatibility algorithm, we address the root causes of conflict across all demographics.",
        },
        {
          statistic: "70%",
          issue: "of students are satisfied with their roommate",
          explanation: "Having a satisfying roommate relationship clearly contributes to overall housing satisfaction—compatibility is a key driver.",
          source: "InsideHigherEd article on SDSU survey (2024)",
          solution: "Domu Match's science-backed approach helps you find roommates as compatible as your best friends. Our transparent matching shows exactly why you're compatible, building trust from day one.",
        },
      ],
    },
    nl: {
      title: "Het probleem dat we oplossen",
      subtitle: "Onderzoek-ondersteunde inzichten over huisgenootcompatibiliteit en studentenhuisvestingstevredenheid",
      stats: [
        {
          statistic: "47,9%",
          issue: "van de studenten meldt frequente of occasionele conflicten met huisgenoten",
          explanation: "Bijna de helft van alle studenten krijgt te maken met huisgenootconflicten—een wijdverbreid probleem dat het welzijn en de academische prestaties beïnvloedt.",
          source: "Golding et al., 'Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students'",
          solution: "De compatibiliteitsscore van Domu Match analyseert 40+ levensstijlfactoren—studiegewoonten, netheidsvoorkeuren, sociale behoeften—om conflicten te voorkomen voordat ze beginnen. Ons algoritme matcht studenten met vergelijkbare waarden en complementaire persoonlijkheden.",
        },
        {
          statistic: "Compatibiliteit componeert",
          issue: "Huisgenootassimilatie-effecten nemen in de loop van de tijd toe",
          explanation: "Hoe langer huisgenoten samenwonen, hoe sterker het peereffect op academische prestaties. Goede matches leveren samengestelde voordelen op.",
          source: "Cao et al., 'Heterogeneous peer effects of college roommates on academic performance' (Nature, 2024)",
          solution: "Onze matching is niet alleen voor week één—het is ontworpen voor langetermijnsucces. Door studiegewoonten, schema's en academische doelen van tevoren af te stemmen, creëren we matches die in de loop van de tijd verbeteren, niet verslechteren.",
        },
        {
          statistic: "67,6%",
          issue: "van de studenten heeft overwogen om van studentenhuis te veranderen vanwege huisgenootconflicten",
          explanation: "Wanneer matches misgaan, willen studenten wisselen—wat verstoring, kosten en stress veroorzaakt voor zowel studenten als huisvestingsafdelingen.",
          source: "Deng (geciteerd in Empirical Study of Dormitory Conflict)",
          solution: "Domu Match vermindert verloop door het vanaf het begin goed te doen. Ons uitgebreide compatibiliteitsmodel en transparante matchingproces helpen studenten weloverwogen beslissingen te nemen, waardoor de behoefte aan kamerwisselingen wordt verminderd.",
        },
        {
          statistic: "50,1% vrouwen, 44,1% mannen",
          issue: "meldt huisgenootconflicten bij eerstejaars universiteitsstudenten",
          explanation: "Conflict treft bijna de helft van de cohort ongeacht geslacht—wat de onvervulde behoefte aan betere matchingoplossingen benadrukt.",
          source: "Burgos-Calvillo et al., 'Cultural Modes of Conflict Resolution, Roommate Satisfaction & School Belonging' (2024)",
          solution: "Onze ID-verificatie zorgt ervoor dat alle gebruikers geverifieerde studenten zijn, wat een veilige omgeving creëert. Gecombineerd met ons compatibiliteitsalgoritme pakken we de oorzaken van conflicten aan in alle demografieën.",
        },
        {
          statistic: "70%",
          issue: "van de studenten is tevreden met hun huisgenoot",
          explanation: "Een bevredigende huisgenootrelatie draagt duidelijk bij aan de algehele huisvestingstevredenheid—compatibiliteit is een belangrijke drijvende kracht.",
          source: "InsideHigherEd artikel over SDSU-enquête (2024)",
          solution: "De wetenschappelijk onderbouwde aanpak van Domu Match helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden. Onze transparante matching laat precies zien waarom je compatibel bent, wat vertrouwen opbouwt vanaf dag één.",
        },
      ],
    },
  }

  const text = content[locale]
  const stats = text.stats

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.scrollWidth / stats.length
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      })
    }
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : stats.length - 1
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < stats.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(newIndex)
  }

  // Handle scroll to update current index
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / stats.length
      const newIndex = Math.round(container.scrollLeft / cardWidth)
      setCurrentIndex(newIndex)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [stats.length])

  return (
    <Section className="bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4 leading-tight">
            {text.title}
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {text.subtitle}
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200 rounded-2xl"
            >
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-brand-primary mb-3">
                  {stat.statistic}
                </div>
                <h3 className="text-lg font-semibold text-brand-text mb-3">
                  {stat.issue}
                </h3>
                <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                  {stat.explanation}
                </p>
                <p className="text-xs text-brand-muted italic mb-4 pb-4 border-b border-brand-border/30">
                  {stat.source}
                </p>
                <div className="pt-2">
                  <p className="text-sm font-medium text-brand-text mb-1">
                    {locale === 'nl' ? 'Hoe Domu Match dit oplost:' : 'How Domu Match solves this:'}
                  </p>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {stat.solution}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-[85vw] max-w-sm border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 rounded-2xl snap-center"
              >
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-brand-primary mb-3">
                    {stat.statistic}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text mb-3">
                    {stat.issue}
                  </h3>
                  <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                    {stat.explanation}
                  </p>
                  <p className="text-xs text-brand-muted italic mb-4 pb-4 border-b border-brand-border/30">
                    {stat.source}
                  </p>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-brand-text mb-1">
                      {locale === 'nl' ? 'Hoe Domu Match dit oplost:' : 'How Domu Match solves this:'}
                    </p>
                    <p className="text-sm text-brand-muted leading-relaxed">
                      {stat.solution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              className="border-2 border-brand-border hover:border-brand-primary text-brand-text hover:bg-brand-primary/5 transition-all duration-200"
              aria-label={locale === 'nl' ? 'Vorige' : 'Previous'}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {stats.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'w-8 bg-brand-primary'
                      : 'w-2 bg-brand-border hover:bg-brand-primary/50'
                  }`}
                  aria-label={`${locale === 'nl' ? 'Ga naar slide' : 'Go to slide'} ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              className="border-2 border-brand-border hover:border-brand-primary text-brand-text hover:bg-brand-primary/5 transition-all duration-200"
              aria-label={locale === 'nl' ? 'Volgende' : 'Next'}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}

