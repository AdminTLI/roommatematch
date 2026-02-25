'use client'

import { Users, MessageCircle, MapPin, ShieldCheck } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

export function WolfpackGroupChatsSection() {
  const { locale } = useApp()
  const isNl = locale === 'nl'

  const heading = isNl ? 'Vind huis met je roedel.' : 'Hunt for housing as a pack.'
  const eyebrow = isNl ? 'Binnenkort beschikbaar' : 'Coming soon'
  const badge = isNl ? 'Groepschats voor huisjacht' : 'Group chats for house hunting'

  const description = isNl
    ? 'In plaats van alleen te scrollen door eindeloze listings, stellen we straks veilige groepschats samen met 3 tot 5 compatibele studenten. Jullie vormen één "wolfpack" dat samen woningen spot, bezichtigingen plant en als één huishouden reageert - met meer kans op een goede match en minder stress.'
    : 'Instead of doom-scrolling listings alone, we will soon help you form safe group chats with 3 to 5 compatible students. Your "wolfpack" spots listings together, coordinates viewings, and applies as one household - giving you more options, fewer no-replies, and less stress.'

  const bullets = isNl
    ? [
        'Match eerst met je roedel, niet zomaar met willekeurige onbekenden.',
        'Deel links, foto\'s en rode vlaggen in één veilige groepschat.',
        'Plan bezichtigingen als één huis in plaats van vier losse aanmeldingen.',
      ]
    : [
        'Match with your pack first - not random strangers from a Facebook thread.',
        'Share listings, photos, and red flags in one safe group chat.',
        'Coordinate viewings and apply as a single, organised household.',
      ]

  const researchLabel = isNl ? 'Waarom samen zoeken werkt' : 'Why searching as a pack works'

  const cards = isNl
    ? [
        {
          title: 'Delen met onbekenden is zelden de eerste keuze',
          description:
            'Een Europees onderzoek onder jonge thuisdelers liet zien dat 52% eigenlijk liever alleen zou wonen, ook al woont bijna de helft nu met huisgenoten samen (HousingAnywhere, 2025). Als je toch moet delen om de huur te kunnen betalen, is het veiliger om als vooraf gematchte groep te reageren dan in te trekken bij willekeurige huisgenoten die je nog nooit hebt ontmoet.',
          icon: MapPin,
        },
        {
          title: 'Een compleet huis is aantrekkelijker dan één losse huurder',
          description:
            'Op de Nederlandse studentenmarkt trokken beschikbare kamers in de zomer van 2024 gemiddeld ongeveer 81 geïnteresseerde huurders per advertentie (Kamernet Rent Report, 2024). Een verhuurder kan dan kiezen voor een compleet, georganiseerd huis dat samen reageert in plaats van losse aanmeldingen van studenten die elkaar nog niet kennen.',
          icon: Users,
        },
        {
          title: 'Extreme schaarste - samen sterk',
          description:
            'Bij zulke schaarste letten verhuurders extra op rust in huis. Een groep die elkaar al kent, samen afspraken heeft gemaakt en als één huishouden reageert, voelt veel minder risicovol dan een mix van onbekenden die elkaar nog moeten leren kennen en misschien snel weer vertrekken.',
          icon: ShieldCheck,
        },
      ]
    : [
        {
          title: 'Sharing with strangers is rarely the first choice',
          description:
            'A 2025 survey of young home sharers in Europe found that 52% would actually prefer to live alone, even though almost half are currently sharing an apartment with others (HousingAnywhere, 2025). If you have to share to afford rent, applying as a pre matched group you already get along with is safer than moving into a house of strangers and hoping the chemistry works.',
          icon: MapPin,
        },
        {
          title: 'Complete groups are easier to say yes to',
          description:
            'In the Dutch student market, each available room attracted on average about 81 interested tenants per listing during summer 2024 (Kamernet Rent Report, 2024). When landlords can choose between dozens of individual applicants or one organised group with a clear story and house rules, a ready made pack is often the easier and more convincing option.',
          icon: Users,
        },
        {
          title: 'Scarcity means groups stand out',
          description:
            'With that level of scarcity, landlords care a lot about stability in the household. A group that already knows each other, has agreed on basic house rules, and applies as one household feels less risky than a mix of strangers who might clash and move out quickly.',
          icon: ShieldCheck,
        },
      ]

  return (
    <Section className="relative">
      <Container className="relative">
        <div className="grid gap-10 md:gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <span className="uppercase tracking-[0.14em] text-[10px] text-white/70">{eyebrow}</span>
              <span className="h-3 w-px bg-white/20" aria-hidden />
              <span className="text-[11px]">{badge}</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {heading.split('pack').length > 1 ? (
                <>
                  {heading.split('pack')[0]}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    pack
                  </span>
                  {heading.split('pack')[1]}
                </>
              ) : (
                heading
              )}
            </h2>

            <p className="text-base md:text-lg text-white/80 max-w-xl">
              {description}
            </p>

            <ul className="space-y-3 text-sm md:text-base text-white/80">
              {bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/40">
                    <MessageCircle className="h-3 w-3 text-indigo-300" aria-hidden />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden />
              <span>{researchLabel}</span>
            </div>
            <div className="grid gap-4">
              {cards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className={cn(
                      'glass noise-overlay border border-white/10 bg-white/5',
                      'rounded-2xl p-5 md:p-6 flex gap-4'
                    )}
                  >
                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/40">
                      <Icon className="h-5 w-5 text-indigo-300" aria-hidden />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-semibold text-white">
                        {card.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

