'use client'

import { MarketingSubpageWrapperLight } from '@/app/(marketing)/components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import Link from 'next/link'

const LAST_UPDATED = 'April 2026'

const INLINE_LINK_CLASS =
  'text-violet-700 underline underline-offset-2 hover:text-violet-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 rounded-sm'

type InlinePart = string | { href: string; text: string }

type SummaryRow = { topic: string; answer: string }

type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'p-rich'; parts: InlinePart[] }
  | { type: 'ul'; items: (string | InlinePart[])[] }
  | { type: 'h3'; text: string }

type SectionDef = {
  id: string
  title: string
  blocks?: ContentBlock[]
  summaryTable?: SummaryRow[]
}

const content: Record<
  'en' | 'nl',
  {
    title: string
    lastUpdatedLabel: string
    lastUpdatedValue: string
    languageNote: string
    intro: string
    sections: SectionDef[]
    contactBoxTitle: string
    contactEmailLabel: string
    contactAddressLabel: string
    contactAddressLine: string
    contactResponseLabel: string
    contactResponseValue: string
    contactAltFormatsParts: InlinePart[]
    summaryColTopic: string
    summaryColAnswer: string
    betaTitle: string
    betaBody: string
  }
> = {
  en: {
    title: 'Accessibility Statement',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: LAST_UPDATED,
    languageNote:
      'English is the primary language of this statement. If we provide a Dutch version, the Dutch text prevails in case of conflict.',
    intro:
      'Domu Match wants roommate matching to be usable by as many people as possible, including people who use assistive technologies or adjust how they use the web. This statement describes our accessibility goals, what we do today, known limits (especially during beta), and how you can contact us with feedback or barriers.',
    summaryColTopic: 'Topic',
    summaryColAnswer: 'Short answer',
    betaTitle: 'Beta Notice',
    betaBody:
      'You are using a pre-release (beta) version of Domu Match. Interfaces and flows may change quickly; if accessibility regressions appear, please tell us so we can prioritise fixes.',
    contactBoxTitle: 'Accessibility Contact',
    contactEmailLabel: 'Email',
    contactAddressLabel: 'Postal address',
    contactResponseLabel: 'Response time',
    contactResponseValue:
      'We aim to acknowledge accessibility reports within five business days and to propose a practical next step (fix, workaround, or timeline) where we can.',
    contactAltFormatsParts: [
      'If you need this statement in another format (for example plain text or a larger print layout), email us at ',
      { href: 'mailto:domumatch@gmail.com', text: 'domumatch@gmail.com' },
      ' and we will try to accommodate you within a reasonable time.',
    ],
    contactAddressLine:
      'DMS Enterprise (trading as Domu Match), Breda, Netherlands · KVK 97573337',
    sections: [
      {
        id: 'summary',
        title: '1. Summary',
        summaryTable: [
          {
            topic: 'What does this cover?',
            answer: 'The marketing site and web application at domumatch.com, including logged-in areas.',
          },
          {
            topic: 'Standard we target',
            answer:
              'Web Content Accessibility Guidelines (WCAG) 2.2, Level AA, together with sensible AAA techniques where practical.',
          },
          {
            topic: 'Conformance today',
            answer:
              'We are actively improving accessibility; during public beta some areas may not yet fully meet WCAG 2.2 AA. We document known limits below.',
          },
          {
            topic: 'Third-party flows',
            answer:
              'Identity verification uses Persona’s interface on their domain; we do not control their accessibility experience.',
          },
          {
            topic: 'How to report a barrier',
            answer: 'Email domumatch@gmail.com with the page, what you tried, and (if possible) your browser and assistive technology.',
          },
        ],
      },
      {
        id: 'scope',
        title: '2. Scope',
        blocks: [
          {
            type: 'p',
            text: 'This statement applies to Domu Match services delivered through the website and progressive web experience at domumatch.com (including subdomains we use for the product), excluding:',
          },
          {
            type: 'ul',
            items: [
              'Third-party websites, widgets, or documents that we link to but do not operate (for example your bank, a landlord, or a government portal).',
              'Embedded or redirected experiences on another company’s domain (notably Persona during ID verification), except where we choose and control the integration points on our own pages.',
              'User-generated content (such as chat messages or profile photos) where the material originates from other users.',
            ],
          },
          {
            type: 'p',
            text: 'We review major product updates for accessibility impact and update this statement when our position materially changes.',
          },
        ],
      },
      {
        id: 'commitment',
        title: '3. Our commitment',
        blocks: [
          {
            type: 'p',
            text: 'We design and build Domu Match so that students and young professionals in the Netherlands can complete core tasks - sign up, verify, complete onboarding, view matches, chat, and manage settings - without unnecessary barriers. That includes support for keyboard use, visible focus, logical headings, and compatibility with common assistive technologies where we control the code.',
          },
          {
            type: 'p-rich',
            parts: [
              'Domu Match is operated from the Netherlands by DMS Enterprise (eenmanszaak), trading as Domu Match (handelsnaam), KVK 97573337. This matches the identification in our ',
              { href: '/privacy', text: 'Privacy Policy' },
              ' and ',
              { href: '/terms', text: 'Terms of Service' },
              '.',
            ],
          },
        ],
      },
      {
        id: 'standards',
        title: '4. Technical standards and law',
        blocks: [
          {
            type: 'p',
            text: 'We aim to meet WCAG 2.2 Level AA success criteria for web content we control. WCAG is an internationally recognised standard referenced in European technical specification EN 301 549 and in national transpositions that apply to certain categories of ICT procurement and services.',
          },
          {
            type: 'p',
            text: 'Domu Match is a consumer-facing platform, not a government body. Depending on how laws such as the European Accessibility Act apply to our services over time, we will align our practices and this statement with applicable obligations. Regardless of specific legal classification, accessibility is part of how we want the product to work for every user.',
          },
        ],
      },
      {
        id: 'measures',
        title: '5. What we implement (and keep improving)',
        blocks: [
          {
            type: 'h3',
            text: 'Structure and navigation',
          },
          {
            type: 'ul',
            items: [
              'Semantic HTML and landmarks so pages have a sensible outline.',
              'A “skip to main content” link in the marketing navigation.',
              'Consistent navigation patterns across major sections where the product allows.',
            ],
          },
          {
            type: 'h3',
            text: 'Visual design and readability',
          },
          {
            type: 'ul',
            items: [
              'Light and dark appearance options where the interface supports them, respecting system preference where appropriate.',
              'Focus styles on interactive controls so keyboard users can see where they are.',
              'Responsive layouts so content reflows when you zoom or use a smaller viewport.',
            ],
          },
          {
            type: 'h3',
            text: 'Forms and errors',
          },
          {
            type: 'ul',
            items: [
              'Labels and instructions tied to inputs.',
              'Error messages that identify what went wrong and how to correct it, where the platform surfaces validation.',
            ],
          },
          {
            type: 'h3',
            text: 'Media and non-text content',
          },
          {
            type: 'ul',
            items: [
              'Meaningful alternative text for informative images we add in the product and marketing site.',
              'When we publish video or audio with essential information, we work toward captions or transcripts as production capacity allows.',
            ],
          },
        ],
      },
      {
        id: 'keyboard-at',
        title: '6. Keyboard and assistive technology',
        blocks: [
          {
            type: 'p',
            text: 'Core flows are intended to be usable with a keyboard: Tab and Shift+Tab to move between focusable elements, Enter or Space to activate buttons and toggles, and Escape to close many overlays and dialogs where implemented.',
          },
          {
            type: 'p',
            text: 'We test with and design for common combinations such as VoiceOver on Apple platforms, TalkBack on Android, and screen readers on Windows. No two setups behave identically; if something fails in your environment, tell us the browser, version, and assistive technology so we can reproduce it.',
          },
        ],
      },
      {
        id: 'testing',
        title: '7. Testing and quality',
        blocks: [
          {
            type: 'p',
            text: 'We combine automated checks (for example axe-core in development workflows), manual keyboard review, and targeted testing with assistive technologies on critical journeys. During beta we may ship iterative UI changes; we treat regressions as bugs to be fixed or tracked.',
          },
        ],
      },
      {
        id: 'limitations',
        title: '8. Known limitations',
        blocks: [
          {
            type: 'p',
            text: 'Despite our efforts, some limitations may apply:',
          },
          {
            type: 'ul',
            items: [
              'Beta features and experiments may temporarily miss polish (focus order, announcements, or labelling) before we stabilise them.',
              'Persona’s verification UI lives on Persona-controlled domains; accessibility there depends on Persona. If you cannot complete verification, contact us - we will work with you on a reasonable alternative where the law and our risk controls allow.',
              [
                'Optional analytics, session replay, or marketing tools load only after consent; their interfaces are partly controlled by vendors listed in our ',
                { href: '/cookies', text: 'Cookie & Local Storage Statement' },
                '.',
              ],
              'Very old browsers or assistive technology versions may not support modern web standards we rely on; we test recent stable releases.',
            ],
          },
        ],
      },
      {
        id: 'feedback',
        title: '9. Feedback and complaints',
        blocks: [
          {
            type: 'p',
            text: 'Your reports directly influence our backlog. Please include the URL, a short description of the barrier, what you expected, and what happened instead. Screenshots or screen recordings help but are not required.',
          },
          {
            type: 'p-rich',
            parts: [
              'For self-service information you can also use our ',
              { href: '/help-center', text: 'Help Center' },
              ', ',
              { href: '/faq', text: 'FAQ' },
              ', and ',
              { href: '/safety', text: 'Safety' },
              ' pages. For how we process personal data and the rules of the platform, see the ',
              { href: '/privacy', text: 'Privacy Policy' },
              ' and ',
              { href: '/terms', text: 'Terms of Service' },
              '.',
            ],
          },
          {
            type: 'p',
            text: 'If you are not satisfied with our reply, you may escalate using the same contact channel and ask for a review. This does not affect any statutory rights you may have under Dutch or EU consumer or equality law, which depend on your situation.',
          },
        ],
      },
      {
        id: 'alternatives',
        title: '10. Alternative formats and reasonable adjustments',
        blocks: [
          {
            type: 'p-rich',
            parts: [
              'If you need information from this statement in another format, or need a reasonable adjustment to use Domu Match, ',
              { href: '/contact', text: 'contact us' },
              '. We will discuss options with you openly and without prejudice.',
            ],
          },
        ],
      },
      {
        id: 'updates',
        title: '11. Updates',
        blocks: [
          {
            type: 'p',
            text: 'We review this statement at least once a year and after substantial product changes. The “Last updated” date at the top changes when we publish a meaningful revision.',
          },
        ],
      },
    ],
  },
  nl: {
    title: 'Toegankelijkheidsverklaring',
    lastUpdatedLabel: 'Laatst bijgewerkt',
    lastUpdatedValue: LAST_UPDATED,
    languageNote:
      'Engels is de primaire taal van deze verklaring. Als we een Nederlandse versie publiceren, gaat de Nederlandse tekst voor bij tegenstrijdigheden.',
    intro:
      'Domu Match wil huisgenoot-matching voor zoveel mogelijk mensen bruikbaar maken, ook als u hulpsoftware gebruikt of de weergave van het web aanpast. Deze verklaring beschrijft onze toegankelijkheidsdoelen, wat we nu doen, bekende beperkingen (zeker tijdens de bètafase) en hoe u ons kunt bereiken met feedback of knelpunten.',
    summaryColTopic: 'Onderwerp',
    summaryColAnswer: 'Kort antwoord',
    betaTitle: 'Bèta-mededeling',
    betaBody:
      'U gebruikt een prerelease (bèta) van Domu Match. Schermen en stromen kunnen snel wijzigen; als u toegankelijkheidsregressies ziet, laat het ons weten zodat we herstel kunnen prioriteren.',
    contactBoxTitle: 'Contact Toegankelijkheid',
    contactEmailLabel: 'E-mail',
    contactAddressLabel: 'Postadres',
    contactResponseLabel: 'Reactietijd',
    contactResponseValue:
      'We streven ernaar toegankelijkheidsmeldingen binnen vijf werkdagen te bevestigen en waar mogelijk een concrete vervolgstap voor te stellen (herstel, tijdelijke workaround of planning).',
    contactAltFormatsParts: [
      'Als u deze verklaring in een ander formaat nodig hebt (bijvoorbeeld platte tekst of grotere weergave), mail ons op ',
      { href: 'mailto:domumatch@gmail.com', text: 'domumatch@gmail.com' },
      '; we proberen dit binnen redelijke termijn te leveren.',
    ],
    contactAddressLine:
      'DMS Enterprise (handelend onder de naam Domu Match), Breda, Nederland · KVK 97573337',
    sections: [
      {
        id: 'summary',
        title: '1. Samenvatting',
        summaryTable: [
          {
            topic: 'Wat valt hieronder?',
            answer: 'De marketingwebsite en webapplicatie op domumatch.com, inclusief ingelogde onderdelen.',
          },
          {
            topic: 'Standaard waar we naartoe werken',
            answer:
              'Web Content Accessibility Guidelines (WCAG) 2.2, niveau AA, aangevuld met niveau AAA-technieken waar dat praktisch is.',
          },
          {
            topic: 'Conformiteit vandaag',
            answer:
              'We verbeteren toegankelijkheid actief; tijdens de openbare bèta voldoen sommige onderdelen mogelijk nog niet volledig aan WCAG 2.2 AA. Bekende beperkingen staan hieronder.',
          },
          {
            topic: 'Derden',
            answer:
              'Identiteitsverificatie verloopt via de interface van Persona op hun domein; wij sturen die toegankelijkheid niet aan.',
          },
          {
            topic: 'Een knelpunt melden',
            answer:
              'Mail domumatch@gmail.com met de pagina, wat u probeerde, en (indien mogelijk) browser en hulpsoftware.',
          },
        ],
      },
      {
        id: 'scope',
        title: '2. Reikwijdte',
        blocks: [
          {
            type: 'p',
            text: 'Deze verklaring geldt voor de diensten van Domu Match via de website en progressive web-ervaring op domumatch.com (inclusief subdomeinen die we voor het product gebruiken), met uitzondering van:',
          },
          {
            type: 'ul',
            items: [
              'Websites, widgets of documenten van derden waarnaar we linken maar die wij niet beheren (bijvoorbeeld uw bank, een verhuurder of een overheidsportaal).',
              'Ingesloten of doorverwezen ervaringen op het domein van een andere aanbieder (met name Persona tijdens ID-verificatie), behalve waar wij de integratiepunten op onze eigen pagina’s kiezen en beheren.',
              'Door gebruikers gegenereerde inhoud (zoals chatberichten of profielfoto’s) waar het materiaal van andere gebruikers afkomstig is.',
            ],
          },
          {
            type: 'p',
            text: 'We beoordelen grotere productupdates op toegankelijkheidseffect en werken deze verklaring bij als onze positie wezenlijk verandert.',
          },
        ],
      },
      {
        id: 'commitment',
        title: '3. Onze toezegging',
        blocks: [
          {
            type: 'p',
            text: 'We ontwerpen en bouwen Domu Match zodat studenten en jonge professionals in Nederland de kernstappen kunnen voltooien - registreren, verifiëren, onboarding, matches bekijken, chatten en instellingen beheren - zonder onnodige drempels. Dat omvat ondersteuning voor toetsenbordgebruik, zichtbare focus, logische koppen en compatibiliteit met gangbare hulpsoftware waar wij de code bepalen.',
          },
          {
            type: 'p-rich',
            parts: [
              'Domu Match wordt vanuit Nederland geëxploiteerd door DMS Enterprise (eenmanszaak), handelend onder de naam Domu Match (handelsnaam), KVK 97573337. Dit komt overeen met de identificatie in ons ',
              { href: '/privacy', text: 'Privacybeleid' },
              ' en onze ',
              { href: '/terms', text: 'Algemene voorwaarden' },
              '.',
            ],
          },
        ],
      },
      {
        id: 'standards',
        title: '4. Technische standaarden en recht',
        blocks: [
          {
            type: 'p',
            text: 'We streven ernaar om aan de succescriteria van WCAG 2.2 niveau AA te voldoen voor webinhoud die wij beheersen. WCAG is een internationaal erkende standaard die in de Europese technische specificatie EN 301 549 en in nationale uitwerkingen voorkomt die voor bepaalde ICT-categorieën gelden.',
          },
          {
            type: 'p',
            text: 'Domu Match is een consumentenplatform, geen overheidsinstantie. Afhankelijk van hoe wetgeving zoals de European Accessibility Act in de loop van de tijd op onze diensten van toepassing is, stemmen we onze werkwijze en deze verklaring af op geldende verplichtingen. Los van die classificatie is toegankelijkheid onderdeel van hoe we het product voor iedereen willen laten werken.',
          },
        ],
      },
      {
        id: 'measures',
        title: '5. Wat we toepassen (en blijven verbeteren)',
        blocks: [
          {
            type: 'h3',
            text: 'Structuur en navigatie',
          },
          {
            type: 'ul',
            items: [
              'Semantische HTML en landmarks zodat pagina’s een begrijpelijke structuur hebben.',
              'Een link “ga naar hoofdinhoud” in de marketingnavigatie.',
              'Consistente navigatiepatronen in de hoofdonderdelen waar het product dat toelaat.',
            ],
          },
          {
            type: 'h3',
            text: 'Visueel ontwerp en leesbaarheid',
          },
          {
            type: 'ul',
            items: [
              'Lichte en donkere weergave waar de interface dat ondersteunt, met respect voor systeemvoorkeuren waar passend.',
              'Focusstijlen op interactieve elementen zodat toetsenbordgebruikers zien waar ze zijn.',
              'Responsieve lay-outs zodat inhoud meeschaaft bij zoomen of een smaller scherm.',
            ],
          },
          {
            type: 'h3',
            text: 'Formulieren en fouten',
          },
          {
            type: 'ul',
            items: [
              'Labels en instructies gekoppeld aan invoervelden.',
              'Foutmeldingen die aangeven wat misging en hoe u het kunt herstellen, waar het platform validatie toont.',
            ],
          },
          {
            type: 'h3',
            text: 'Media en niet-tekstuele inhoud',
          },
          {
            type: 'ul',
            items: [
              'Zinvolle alternatieve tekst voor informatieve afbeeldingen die wij in product en marketing toevoegen.',
              'Bij video of audio met essentiële informatie werken we waar de productiecapaciteit het toelaat toe aan ondertitels of transcripties.',
            ],
          },
        ],
      },
      {
        id: 'keyboard-at',
        title: '6. Toetsenbord en hulpsoftware',
        blocks: [
          {
            type: 'p',
            text: 'Kernflows zijn bedoeld bedienbaar te zijn met alleen een toetsenbord: Tab en Shift+Tab om tussen focusbare elementen te gaan, Enter of Spatie om knoppen en schakelaars te activeren, en Escape om veel overlays en dialoogvensters te sluiten waar dat is ingebouwd.',
          },
          {
            type: 'p',
            text: 'We testen met en ontwerpen voor gangbare combinaties zoals VoiceOver op Apple-platformen, TalkBack op Android en schermlezers op Windows. Geen twee omgevingen gedragen zich identiek; als iets in uw opstelling faalt, meld dan browser, versie en hulpsoftware zodat we het kunnen reproduceren.',
          },
        ],
      },
      {
        id: 'testing',
        title: '7. Testen en kwaliteit',
        blocks: [
          {
            type: 'p',
            text: 'We combineren geautomatiseerde controles (bijvoorbeeld axe-core in ontwikkelworkflows), handmatige toetsenbordreviews en gerichte tests met hulpsoftware op kritieke trajecten. Tijdens de bèta kunnen we UI iteratief uitbrengen; we behandelen regressies als bugs die we herstellen of registreren.',
          },
        ],
      },
      {
        id: 'limitations',
        title: '8. Bekende beperkingen',
        blocks: [
          {
            type: 'p',
            text: 'Ondanks onze inspanningen kunnen sommige beperkingen gelden:',
          },
          {
            type: 'ul',
            items: [
              'Bètafuncties en experimenten kunnen tijdelijk minder aandacht hebben voor details (focusvolgorde, aankondigingen of labelling) voordat we ze stabiliseren.',
              'De verificatie-UI van Persona staat op door Persona beheerde domeinen; de toegankelijkheid daar hangt van Persona af. Als u de verificatie niet kunt voltooien, neem contact op - we zoeken met u naar een redelijk alternatief voor zover de wet en onze risicoborging dat toelaten.',
              [
                'Optionele analytics, sessie-opname of marketingtools laden pas na toestemming; hun interfaces worden deels door leveranciers beheerd die in onze ',
                { href: '/cookies', text: 'Cookie- en localStorage-verklaring' },
                ' staan.',
              ],
              'Zeer oude browsers of versies van hulpsoftware ondersteunen mogelijk geen moderne webstandaarden waar wij op leunen; we testen recente stabiele versies.',
            ],
          },
        ],
      },
      {
        id: 'feedback',
        title: '9. Feedback en klachten',
        blocks: [
          {
            type: 'p',
            text: 'Uw meldingen beïnvloeden onze prioriteiten. Vermeld de URL, een korte beschrijving van het knelpunt, wat u verwachtte en wat er gebeurde. Screenshots of opnames helpen maar zijn niet verplicht.',
          },
          {
            type: 'p-rich',
            parts: [
              'Voor extra uitleg kunt u ook het ',
              { href: '/help-center', text: 'Helpcentrum' },
              ', de ',
              { href: '/faq', text: 'veelgestelde vragen' },
              ' en de pagina ',
              { href: '/safety', text: 'Veiligheid' },
              ' raadplegen. Voor gegevensverwerking en spelregels van het platform, zie het ',
              { href: '/privacy', text: 'Privacybeleid' },
              ' en de ',
              { href: '/terms', text: 'Algemene voorwaarden' },
              '.',
            ],
          },
          {
            type: 'p',
            text: 'Als u niet tevreden bent over ons antwoord, kunt u via hetzelfde contactkanaal escaleren en om herbeoordeling vragen. Dit tast geen wettelijke rechten aan die u onder Nederlands of EU-consumenten- of gelijkheidsrecht zou kunnen hebben, afhankelijk van uw situatie.',
          },
        ],
      },
      {
        id: 'alternatives',
        title: '10. Alternatieve vormen en redelijke aanpassingen',
        blocks: [
          {
            type: 'p-rich',
            parts: [
              'Als u informatie uit deze verklaring in een ander formaat nodig hebt, of een redelijke aanpassing om Domu Match te gebruiken, ',
              { href: '/contact', text: 'neem dan contact op' },
              '. We bespreken opties open en zonder vooroordeel met u.',
            ],
          },
        ],
      },
      {
        id: 'updates',
        title: '11. Wijzigingen',
        blocks: [
          {
            type: 'p',
            text: 'We herzien deze verklaring minimaal jaarlijks en na ingrijpende productwijzigingen. De datum “Laatst bijgewerkt” bovenaan wijzigt wanneer we een inhoudelijk gewijzigde versie publiceren.',
          },
        ],
      },
    ],
  },
}

function renderInlineParts(parts: InlinePart[]) {
  return parts.map((part, idx) =>
    typeof part === 'string' ? (
      <span key={idx}>{part}</span>
    ) : (
      <Link key={idx} href={part.href} className={INLINE_LINK_CLASS}>
        {part.text}
      </Link>
    ),
  )
}

function renderBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, i) => {
    if (block.type === 'p-rich') {
      return (
        <p key={i} className="text-slate-700 mb-4 leading-relaxed">
          {renderInlineParts(block.parts)}
        </p>
      )
    }
    if (block.type === 'p') {
      return (
        <p key={i} className="text-slate-700 mb-4 leading-relaxed">
          {block.text}
        </p>
      )
    }
    if (block.type === 'h3') {
      return (
        <h3 key={i} className="text-xl font-semibold text-slate-900 mb-2 mt-6">
          {block.text}
        </h3>
      )
    }
    return (
      <ul key={i} className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
        {block.items.map((item, j) => (
          <li key={j}>{typeof item === 'string' ? item : renderInlineParts(item)}</li>
        ))}
      </ul>
    )
  })
}

export default function AccessibilityPage() {
  const { locale } = useApp()
  const t = content[locale] ?? content.en

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t.title}</h1>
              <p className="text-slate-600 mb-8">
                {t.lastUpdatedLabel}: {t.lastUpdatedValue}
              </p>

              <div className="mb-10 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
                <p className="text-amber-900 font-semibold mb-1">{t.betaTitle}</p>
                <p className="text-amber-900/90 leading-relaxed">{t.betaBody}</p>
              </div>

              <p className="text-slate-700 mb-4">{t.languageNote}</p>
              <p className="text-slate-700 mb-10 leading-relaxed">{t.intro}</p>

              {t.sections.map((section) => (
                <section key={section.id} className="mb-12" aria-labelledby={`a11y-${section.id}`}>
                  <h2 id={`a11y-${section.id}`} className="text-2xl font-semibold text-slate-900 mb-4">
                    {section.title}
                  </h2>

                  {section.summaryTable && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60 mb-4">
                      <table className="min-w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            <th className="px-4 py-3 font-semibold">{t.summaryColTopic}</th>
                            <th className="px-4 py-3 font-semibold">{t.summaryColAnswer}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {section.summaryTable.map((row, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 align-top font-medium text-slate-900">{row.topic}</td>
                              <td className="px-4 py-3 align-top">{row.answer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.blocks && renderBlocks(section.blocks)}
                </section>
              ))}

              <section className="mb-6" aria-labelledby="a11y-contact">
                <h2 id="a11y-contact" className="text-2xl font-semibold text-slate-900 mb-4">
                  {t.contactBoxTitle}
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white/70 p-5 text-slate-700 space-y-3">
                  <p>
                    <span className="font-semibold text-slate-900">{t.contactEmailLabel}:</span>{' '}
                    <a href="mailto:domumatch@gmail.com" className="text-violet-700 underline underline-offset-2 hover:text-violet-900">
                      domumatch@gmail.com
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{t.contactAddressLabel}:</span>{' '}
                    {t.contactAddressLine}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{t.contactResponseLabel}:</span>{' '}
                    {t.contactResponseValue}
                  </p>
                </div>
                <p className="text-slate-700 mt-6 leading-relaxed">{renderInlineParts(t.contactAltFormatsParts)}</p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
