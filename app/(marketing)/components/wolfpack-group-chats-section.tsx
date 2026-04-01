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
    ? 'In plaats van alleen te scrollen door eindeloze listings, stellen we straks veilige groepschats samen met 3 tot 5 compatibele huisgenoten. Jullie vormen één "wolfpack" dat samen woningen spot, bezichtigingen plant en als één huishouden reageert - met meer kans op een goede match en minder stress.'
    : 'Instead of doom-scrolling listings alone, we will soon help you form safe group chats with 3 to 5 compatible roommates. Your "wolfpack" spots listings together, coordinates viewings, and applies as one household - giving you more options, fewer no-replies, and less stress.'

  const bullets = isNl
    ? [
        'Match eerst met je roedel, niet zomaar met willekeurige onbekenden.',
        'Deel links, foto\'s en rode vlaggen in één veilige groepschat.',
        'Plan bezichtigingen als één huis in plaats van vier losse aanmeldingen.',
      ]
    : [
        'Match with your pack first - not random strangers from an unverified group thread.',
        'Share listings, photos, and red flags in one safe group chat.',
        'Coordinate viewings and apply as a single, organised household.',
      ]

  const researchLabel = isNl ? 'Waarom samen zoeken werkt' : 'Why searching as a pack works'

  const cards = isNl
    ? [
        {
          title: 'Delen met onbekenden is zelden de droom',
          description:
            'Een Europees onderzoek onder ruim 3.000 jonge woningdelers liet zien dat 52% eigenlijk liever alleen zou wonen, ook al delen velen nu een huis (HousingAnywhere, 2025). Als je toch moet delen, is het veiliger om als vooraf gematchte groep van studenten en young professionals te reageren dan in te trekken bij willekeurige onbekenden.',
          icon: MapPin,
        },
        {
          title: 'Een compleet huishouden valt sneller op',
          description:
            'Op de Nederlandse gedeelde huurmarkt trokken gewilde kamers in 2024 rond de 80 geïnteresseerde huurders per advertentie (Kamernet Rent Report, 2024). Verhuurders kiezen dan liever voor één georganiseerd huishouden met een duidelijk verhaal dan voor losse aanmeldingen van mensen die elkaar nog niet kennen.',
          icon: Users,
        },
        {
          title: 'Extreme schaarste beloont georganiseerde groepen',
          description:
            'Bij zo weinig beschikbare woonruimte letten verhuurders extra op rust en stabiliteit. Een groep van jongvolwassenen die elkaar al kent, afspraken heeft gemaakt en als één huishouden reageert, voelt veel minder risicovol dan een mix van onbekenden die elkaar nog moeten leren kennen.',
          icon: ShieldCheck,
        },
      ]
    : [
        {
          title: 'Sharing with strangers isn’t the dream',
          description:
            'A 2025 survey of 3,100 young Europeans found that 52% of home‑sharers would actually prefer to live alone, even though many currently share to afford rent (HousingAnywhere, 2025). If you have to share, joining a pre‑matched group of students and young professionals is safer than moving in with total strangers and hoping the chemistry works.',
          icon: MapPin,
        },
        {
          title: 'Complete households stand out',
          description:
            'In the Dutch shared housing market, popular rooms attracted around 80 interested tenants per listing in 2024 (Kamernet Rent Report, 2024). When owners can choose between dozens of individual applicants or one organised group with a clear story and house rules, a ready‑made household is often the easier “yes”.',
          icon: Users,
        },
        {
          title: 'Scarcity rewards organised groups',
          description:
            'With this level of scarcity, landlords care a lot about stability at home. A group that already knows each other, has agreed on basic house rules, and applies as one household feels less risky than a mix of strangers who might clash and move out quickly.',
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

