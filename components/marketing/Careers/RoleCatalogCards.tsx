'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CircleDot } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/app/providers'

type Role = {
  title: string
  impact: string
  studentFriendly?: boolean
  dualFriendly?: boolean
  background?: string
  commitment?: string
  need?: string
  deliverable?: string
  greatFor?: string
  blurb?: string
}

type Group = {
  header: string
  sub: string
  roles: Role[]
}

const GROUPS_EN: Group[] = [
  {
    header: 'Product & Operations',
    sub: 'Safety flows, onboarding, verification',
    roles: [
      { title: 'Product strategist / roadmap', impact: 'Focuses our effort on high‑leverage trust features.', background: 'Product/ops; prioritization', commitment: '2–4 week sprints', dualFriendly: true, blurb: 'Turn scattered ideas into a simple, focused plan. You will help decide what matters most for trust and safety and shape a small roadmap slice we can ship quickly.' },
      { title: 'Research analyst', impact: 'Turns interviews into improvements to onboarding and matching.', studentFriendly: true, background: 'Psych, sociology, HCD', commitment: 'Weekly interview blocks', blurb: 'Talk to students, find the rough edges, and show us where they get stuck. You will turn interviews into a short, practical brief with clear fixes.' },
      { title: 'Onboarding/process coordinator', impact: 'Ensures students complete verification and profiles smoothly.', background: 'Ops/CX; detail‑oriented', commitment: '3–5 hrs/week', dualFriendly: true, blurb: 'Make onboarding feel effortless. You will set up simple checklists and reminders and document a small playbook we can reuse as we grow.' },
    ],
  },
  {
    header: 'Engineering & Data',
    sub: 'Trustworthy features, data-informed matching',
    roles: [
      { title: 'Full‑stack / Next.js', impact: 'Ships user‑facing improvements to reliability and trust.', background: 'TS/React/Next.js', commitment: 'Issue‑scoped tasks', blurb: 'Ship small, meaningful improvements. Pick scoped issues, tidy up UX and safety flows, and get clean PRs merged.' },
      { title: 'Matching researcher', impact: 'Improves match quality with statistics and experimentation.', background: 'Stats/ML', commitment: 'Research spikes', blurb: 'Help us measure what "good match" means. Define simple metrics, run a lightweight experiment, and share what moves the needle.' },
      { title: 'Supabase / Infra engineer', impact: 'Keeps RLS/security and observability tight.', background: 'SQL/RLS; infra', commitment: 'Infra tickets', blurb: 'Keep the foundation safe and visible. Review RLS, add basic dashboards, and leave us with clearer guardrails.' },
    ],
  },
  {
    header: 'Design & Experience',
    sub: 'Identity, UX research, content design',
    roles: [
      { title: 'Brand designer', impact: 'Builds a trustworthy identity across light/dark and marketing.', background: 'Brand systems; accessibility', commitment: 'Explorations', dualFriendly: true, blurb: 'Shape a simple, confident identity. Explore color, type, and basic tokens so the product and marketing feel like one.' },
      { title: 'UX researcher', impact: 'Finds friction and helps reduce verification/onboarding drop‑off.', studentFriendly: true, background: 'HCD, usability', commitment: 'Weekly cadence', blurb: 'Listen to students and turn empathy into action. Map the messy parts and suggest a short list of fixes we can ship quickly.' },
      { title: 'Content designer', impact: 'Guides users through safety and onboarding steps with clear copy.', background: 'Content/UX writing', commitment: 'Microcopy passes', dualFriendly: true, blurb: 'Make the product speak clearly. Tweak microcopy so safety and onboarding steps feel human and easy to follow.' },
    ],
  },
  {
    header: 'Marketing & Community',
    sub: 'Growth experiments, campus ambassadors, support',
    roles: [
      { title: 'Growth strategist', impact: 'Designs experiments that drive qualified student signups.', background: 'Growth analytics', commitment: 'Experiment cycles', blurb: 'Turn curiosity into experiments. Design a small test, run it, and show what works to reach the right students.' },
      { title: 'Student ambassador', impact: 'Builds trust/awareness on campus.', studentFriendly: true, background: 'Motivated students', commitment: '3–5 hrs/week', blurb: 'Be the spark on campus. Help students hear about Domu Match, plan simple activations, and gather honest feedback.' },
      { title: 'Community moderator', impact: 'Answers questions quickly and builds trust.', background: 'Support/community', commitment: 'Rotations', dualFriendly: true, blurb: 'Keep the conversation kind and clear. Answer questions, set a friendly tone, and document a small support cadence.' },
    ],
  },
  {
    header: 'Trust & Safety / Admissions',
    sub: 'Anti‑fraud, policy, partner relations',
    roles: [
      { title: 'Verification specialist', impact: 'Designs anti‑fraud processes to keep users safe.', background: 'Risk, T&S, ops', commitment: 'Process iterations', blurb: 'Design simple, effective checks that keep people safe. Document a straightforward verification flow and the tools we need.' },
      { title: 'Policy researcher', impact: 'Ensures privacy and housing compliance.', background: 'Policy/privacy', commitment: 'Short research briefs', dualFriendly: true, blurb: 'Make the rules easy to follow. Summarize key privacy and housing requirements and recommend what we must do next.' },
      { title: 'Partner relations', impact: 'Connects with universities and housing partners.', background: 'Partnerships/BD', commitment: 'Outreach sprints', dualFriendly: true, blurb: 'Open the first doors. Prepare a short partner list, script initial outreach, and help us start a few real conversations.' },
    ],
  },
]

const GROUPS_NL: Group[] = [
  {
    header: 'Product & Operations',
    sub: 'Veiligheidsflows, onboarding, verificatie',
    roles: [
      { title: 'Productstrateeg / roadmap', impact: 'Richt onze inspanningen op hoogwaardige vertrouwensfuncties.', background: 'Product/ops; prioritering', commitment: '2–4 weken sprints', dualFriendly: true, blurb: 'Verander verspreide ideeën in een eenvoudig, gefocust plan. Je helpt beslissen wat het belangrijkst is voor vertrouwen en veiligheid en vormt een klein roadmapdeel dat we snel kunnen leveren.' },
      { title: 'Onderzoeksanalist', impact: 'Zet interviews om in verbeteringen voor onboarding en matching.', studentFriendly: true, background: 'Psych, sociologie, HCD', commitment: 'Wekelijkse interviewblokken', blurb: 'Praat met studenten, vind de ruwe randen en laat ons zien waar ze vastlopen. Je zet interviews om in een kort, praktisch overzicht met duidelijke oplossingen.' },
      { title: 'Onboarding/procescoördinator', impact: 'Zorgt ervoor dat studenten verificatie en profielen soepel voltooien.', background: 'Ops/CX; detailgericht', commitment: '3–5 uur/week', dualFriendly: true, blurb: 'Maak onboarding moeiteloos. Je stelt eenvoudige checklists en herinneringen op en documenteert een kleine playbook die we kunnen hergebruiken terwijl we groeien.' },
    ],
  },
  {
    header: 'Engineering & Data',
    sub: 'Betrouwbare functies, datagestuurde matching',
    roles: [
      { title: 'Full‑stack / Next.js', impact: 'Levert gebruikersgerichte verbeteringen aan betrouwbaarheid en vertrouwen.', background: 'TS/React/Next.js', commitment: 'Issue-gescopeerde taken', blurb: 'Lever kleine, betekenisvolle verbeteringen. Kies gescopeerde issues, ruim UX en veiligheidsflows op, en krijg schone PRs gemerged.' },
      { title: 'Matchingonderzoeker', impact: 'Verbetert matchkwaliteit met statistieken en experimenten.', background: 'Stats/ML', commitment: 'Onderzoeksspikes', blurb: 'Help ons meten wat "goede match" betekent. Definieer eenvoudige metrics, voer een lichtgewicht experiment uit en deel wat het verschil maakt.' },
      { title: 'Supabase / Infra engineer', impact: 'Houdt RLS/beveiliging en observabiliteit strak.', background: 'SQL/RLS; infra', commitment: 'Infra tickets', blurb: 'Houd de basis veilig en zichtbaar. Review RLS, voeg basisdashboards toe en laat ons achter met duidelijkere guardrails.' },
    ],
  },
  {
    header: 'Design & Experience',
    sub: 'Identiteit, UX-onderzoek, contentdesign',
    roles: [
      { title: 'Branddesigner', impact: 'Bouwt een betrouwbare identiteit over light/dark en marketing heen.', background: 'Brandsystemen; toegankelijkheid', commitment: 'Verkenningen', dualFriendly: true, blurb: 'Vorm een eenvoudige, zelfverzekerde identiteit. Verken kleur, type en basistokens zodat product en marketing als één voelen.' },
      { title: 'UX-onderzoeker', impact: 'Vindt frictie en helpt verificatie/onboarding-uitval te verminderen.', studentFriendly: true, background: 'HCD, bruikbaarheid', commitment: 'Wekelijkse cadans', blurb: 'Luister naar studenten en verander empathie in actie. Map de rommelige delen en stel een korte lijst met fixes voor die we snel kunnen leveren.' },
      { title: 'Contentdesigner', impact: 'Begeleidt gebruikers door veiligheids- en onboardingstappen met duidelijke copy.', background: 'Content/UX writing', commitment: 'Microcopy passes', dualFriendly: true, blurb: 'Laat het product duidelijk spreken. Pas microcopy aan zodat veiligheids- en onboardingstappen menselijk en gemakkelijk te volgen aanvoelen.' },
    ],
  },
  {
    header: 'Marketing & Community',
    sub: 'Groei-experimenten, campusambassadeurs, ondersteuning',
    roles: [
      { title: 'Groeistrateeg', impact: 'Ontwerpt experimenten die gekwalificeerde studentenaanmeldingen stimuleren.', background: 'Groei-analytics', commitment: 'Experimentcycli', blurb: 'Verander nieuwsgierigheid in experimenten. Ontwerp een kleine test, voer deze uit en toon wat werkt om de juiste studenten te bereiken.' },
      { title: 'Studentambassadeur', impact: 'Bouwt vertrouwen/bewustzijn op de campus op.', studentFriendly: true, background: 'Gemotiveerde studenten', commitment: '3–5 uur/week', blurb: 'Wees de vonk op de campus. Help studenten over Domu Match horen, plan eenvoudige activaties en verzamel eerlijke feedback.' },
      { title: 'Communitymoderator', impact: 'Beantwoordt vragen snel en bouwt vertrouwen op.', background: 'Ondersteuning/community', commitment: 'Rotaties', dualFriendly: true, blurb: 'Houd het gesprek vriendelijk en duidelijk. Beantwoord vragen, zet een vriendelijke toon en documenteer een kleine ondersteuningscadans.' },
    ],
  },
  {
    header: 'Trust & Safety / Admissions',
    sub: 'Anti‑fraude, beleid, partnerrelaties',
    roles: [
      { title: 'Verificatiespecialist', impact: 'Ontwerpt anti‑fraudeprocessen om gebruikers veilig te houden.', background: 'Risico, T&S, ops', commitment: 'Procesiteraties', blurb: 'Ontwerp eenvoudige, effectieve controles die mensen veilig houden. Documenteer een rechttoe-rechtaan verificatieflow en de tools die we nodig hebben.' },
      { title: 'Beleidsonderzoeker', impact: 'Zorgt voor privacy- en huisvestingscompliance.', background: 'Beleid/privacy', commitment: 'Korte onderzoeksoverzichten', dualFriendly: true, blurb: 'Maak de regels gemakkelijk te volgen. Vat belangrijke privacy- en huisvestingsvereisten samen en beveel aan wat we vervolgens moeten doen.' },
      { title: 'Partnerrelaties', impact: 'Verbindt met universiteiten en huisvestingspartners.', background: 'Partnerships/BD', commitment: 'Outreach sprints', dualFriendly: true, blurb: 'Open de eerste deuren. Bereid een korte partnerlijst voor, script eerste outreach en help ons enkele echte gesprekken te starten.' },
    ],
  },
]

const badgeLabels = {
  en: {
    experienced: 'Experienced',
    studentFriendly: 'Student‑friendly'
  },
  nl: {
    experienced: 'Ervaren',
    studentFriendly: 'Studentvriendelijk'
  }
}

// Export for use in other components (defaults to English)
export const GROUPS = GROUPS_EN

export function RoleCatalogCards() {
  const { locale } = useApp()
  const groups = locale === 'nl' ? GROUPS_NL : GROUPS_EN
  const badges = badgeLabels[locale]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {groups.map((group, gi) => (
        <Card key={gi} className="border-muted shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">
              <span className="text-brand-primary">{group.header}</span>{' '}
              <span className="text-muted-foreground">– {group.sub}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.roles.map((r, ri) => (
              <div key={ri} className="rounded-lg border p-5 bg-muted/20 h-full flex flex-col">
                {/* Removed decorative circle icon for cleaner look */}
                {/* Title */}
                <div className="text-base font-medium">{r.title}</div>
                {/* Badge directly under title */}
                <div className="mt-1 flex items-center gap-2">
                  {r.dualFriendly ? (
                    <>
                      <Badge variant="secondary">{badges.experienced}</Badge>
                      <Badge>{badges.studentFriendly}</Badge>
                    </>
                  ) : r.studentFriendly ? (
                    <Badge>{badges.studentFriendly}</Badge>
                  ) : (
                    <Badge variant="secondary">{badges.experienced}</Badge>
                  )}
                </div>
                {/* Details as one coherent, human tone paragraph */}
                {r.blurb && (
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {r.blurb}
                  </p>
                )}
                <Separator className="my-3" />
                {/* Impact statement moved to bottom (no truncation) */}
                <p className="italic text-sm text-muted-foreground">
                  {r.impact}
                </p>
                {/* Chips row at very bottom for alignment */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span className={r.commitment ? '' : 'opacity-0'}>{r.commitment || '—'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                    <span className={r.background ? '' : 'opacity-0'}>{r.background || '—'}</span>
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


