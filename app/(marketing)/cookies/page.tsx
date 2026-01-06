'use client'

import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { Cookie } from 'lucide-react'

const content = {
  en: {
    title: 'Cookie Statement',
    lastUpdatedLabel: 'Last updated',
    introduction:
      'This Cookie Statement explains how Domu Match uses cookies and similar technologies on our platform, in line with the EU ePrivacy rules and the Dutch Telecommunications Act (Telecommunicatiewet, Tw). We want you to understand what we do and give consent in a freely given, specific, informed and unambiguous way.',
    whatAreCookies: {
      title: 'What are cookies?',
      paragraphs: [
        'Cookies are small text files that a website stores on your device (for example your laptop or phone) when you visit the site. Each time you visit, your browser sends the cookie back so the website can recognise your device.',
        'Domu Match uses first-party cookies (placed by domumatch.com itself) and may use third-party cookies (placed by carefully selected partners that provide services to Domu Match).',
        'We also use both session cookies (which are deleted when you close your browser) and persistent cookies (which remain for a set period or until you delete them).'
      ]
    },
    categoriesIntro: {
      title: 'Cookie categories we use',
      description:
        'We group our cookies into categories so you can make clear choices. Only the strictly necessary cookies are always active; all other categories require your active consent.'
    },
    strictlyNecessary: {
      title: 'Category 1: Strictly Necessary (Functional) Cookies',
      description:
        'These cookies are essential for the platform to work, for secure login via your university and for ID verification. Without them, Domu Match cannot function properly. Because they only support the service you request, they do not require consent, but we want to be transparent about them.',
      tableCaption: 'Strictly necessary cookies used by Domu Match',
      headers: ['Name', 'Provider', 'Purpose', 'Duration'],
      rows: [
        [
          'surf_auth_session',
          'Domu Match / SURFconext',
          'Maintains your secure login session with your university via Surf Connect so you can access Domu Match and stay signed in as you navigate.',
          'Session (deleted when you close your browser)'
        ],
        [
          'surf_auth_state',
          'Domu Match / SURFconext',
          'Stores temporary state information needed to complete the Surf Connect single sign-on flow and to protect against login abuse.',
          'Session (deleted when the login flow is completed or the browser is closed)'
        ],
        [
          'persona_session_id',
          'Persona',
          'Supports secure ID-verification flows (for example when uploading your ID) and helps prevent fraud during the verification process.',
          'Session (deleted when you close your browser)'
        ],
        [
          'persona_csrf_token',
          'Persona',
          'Security cookie that protects the ID verification flow against cross-site request forgery (CSRF) attacks.',
          'Session (deleted when the verification flow ends or the browser is closed)'
        ],
        [
          'domu_app_session',
          'Domu Match',
          'Keeps you logged in to the Domu Match platform and links your actions to your account in a secure way.',
          'Session (deleted when you log out or close your browser)'
        ],
        [
          'domu_functional_preferences',
          'Domu Match',
          'Stores basic functional preferences (such as language settings and previously dismissed onboarding hints) so you do not have to set them every time.',
          '12 months'
        ]
      ]
    },
    analytics: {
      title: 'Category 2: Analytical Cookies (Questionnaire Experience)',
      description:
        'We use low-impact analytical cookies to understand how well our questionnaire flow works and how long it takes to complete. This helps us keep your matching experience smooth without using invasive tracking or behavioural advertising.',
      processing: [
        'We measure how long it takes to complete the multi-block questionnaire (for example 8 blocks of around 25 questions). This tells us if certain steps are confusing or if users get stuck.',
        'We look at aggregated completion rates (for example how many people reach the final block) to improve the design and wording of questions.',
        'We do not build behavioural profiles and we do not use these cookies for advertising.'
      ],
      privacyMeasures: [
        'IP addresses are truncated (for example by masking the last octet) before they are stored or analysed, in line with Dutch “low-impact analytics” expectations.',
        'Analytics data is only used in aggregate form (for example statistics per group), not to make decisions about individual students.',
        'Where possible, we remove or pseudonymise identifiers so they cannot easily be linked back to you.'
      ],
      tableCaption: 'Analytical cookies used by Domu Match',
      headers: ['Name', 'Provider', 'Purpose', 'Duration'],
      rows: [
        [
          'domu_analytics_session',
          'Domu Match',
          'Counts visits and measures overall questionnaire progress so we can see where users drop off and improve the 10–15 minute completion experience.',
          'Session (deleted when you close your browser)'
        ],
        [
          'domu_questionnaire_timing',
          'Domu Match',
          'Measures how long each questionnaire block takes to complete in anonymised form so we can simplify or re-order blocks if needed.',
          'Up to 13 months'
        ]
      ]
    },
    bannerLogic: {
      title: 'Cookie banner and consent logic',
      paragraphs: [
        'When you first visit Domu Match, we show a cookie banner with three clear options: “Accept All”, “Reject All”, and “Customize”. The “Reject All” button is shown on the same layer and with equal visual weight as “Accept All”, in line with the 2026 guidance of the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).',
        'No analytical or other tracking cookies are placed before you actively choose “Accept All” or grant consent through “Customize”. Before that moment, only the strictly necessary (functional and security) cookies described above are active.',
        'You can always open the Cookie Preference Center again through the floating “Cookie Settings” button that is visible on the site. There you can change your choices per category at any time.'
      ],
      bullets: [
        'No pre-ticked boxes are used for non-essential cookies.',
        'Rejecting is just as easy as accepting (no nudging colours or complex flows).',
        'Your choices are stored in a consent record so we do not repeatedly ask you for the same consent.'
      ]
    },
    manage: {
      title: 'How to manage or delete cookies',
      description:
        'You stay in control of your cookies. You can withdraw consent or delete cookies in two ways: on Domu Match itself and in your browser.',
      onSiteTitle: 'On Domu Match',
      onSiteItems: [
        'Use the floating “Cookie Settings” button that appears on the site to reopen the Cookie Preference Center at any time.',
        'In the Cookie Preference Center you can turn analytical and other non-essential categories on or off. Changes take effect after you save your preferences.',
        'If you withdraw consent, we stop using the relevant cookies and update our consent records accordingly.'
      ],
      browserTitle: 'In your browser',
      browserIntro:
        'You can also delete or block cookies through your browser settings. The following links contain step-by-step instructions from the main browser providers:',
      browserLinks: [
        {
          name: 'Google Chrome',
          href: 'https://support.google.com/chrome/answer/95647'
        },
        {
          name: 'Mozilla Firefox',
          href: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer'
        },
        {
          name: 'Apple Safari',
          href: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471'
        },
        {
          name: 'Microsoft Edge',
          href: 'https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09'
        }
      ]
    },
    retention: {
      title: 'Retention periods',
      intro:
        'We only keep cookies and consent records for as long as needed for the purposes described above. In summary:',
      bullets: [
        'Session cookies (for example login and Surf Connect / Persona security cookies) are deleted when you log out or close your browser.',
        'Functional preference cookies (for example language and dismissed hints) are stored for up to 12 months, after which you may be asked again.',
        'Analytical cookies for questionnaire timing and completion are stored for up to 13 months.',
        'Consent records (proof that you accepted or rejected certain categories) are stored for the period required under Dutch law and to demonstrate compliance to regulators.'
      ]
    },
    compliance: {
      title: 'Compliance with Dutch DPA (Autoriteit Persoonsgegevens)',
      paragraphs: [
        'Domu Match is designed to follow the “freely given, specific, informed and unambiguous” consent standard from the ePrivacy rules and the Dutch Telecommunications Act.',
        'We avoid dark patterns: we do not hide the “Reject All” option, we do not use misleading colours, and we do not force you to accept analytical cookies to use the core service.',
        'Because we see you as a co‑partner in the matching process, we aim to be transparent and honest about how and why we use cookies and analytics data.'
      ]
    },
    contact: {
      title: 'Questions or feedback',
      description:
        'If you have questions about this Cookie Statement or how Domu Match uses cookies, please contact us. We are happy to explain our approach in more detail.',
      email: 'Email: info@domumatch.com'
    }
  },
  nl: {
    title: 'Cookieverklaring',
    lastUpdatedLabel: 'Laatst bijgewerkt',
    introduction:
      'In deze Cookieverklaring leggen we uit hoe Domu Match cookies en vergelijkbare technologieën gebruikt op ons platform, in lijn met de ePrivacy-regels en de Nederlandse Telecommunicatiewet (Tw). We willen dat u begrijpt wat we doen en uw toestemming vrij, specifiek, geïnformeerd en ondubbelzinnig kunt geven.',
    whatAreCookies: {
      title: 'Wat zijn cookies?',
      paragraphs: [
        'Cookies zijn kleine tekstbestanden die een website op uw apparaat plaatst (bijvoorbeeld uw laptop of telefoon) wanneer u de site bezoekt. Bij een volgend bezoek stuurt uw browser de cookie terug zodat de website uw apparaat herkent.',
        'Domu Match gebruikt first-party cookies (geplaatst door domumatch.com zelf) en kan third-party cookies gebruiken (geplaatst door zorgvuldig geselecteerde partners die diensten aan Domu Match leveren).',
        'We gebruiken zowel sessiecookies (die worden verwijderd wanneer u uw browser sluit) als permanente cookies (die gedurende een bepaalde periode blijven bestaan of totdat u ze verwijdert).'
      ]
    },
    categoriesIntro: {
      title: 'Cookiecategorieën die wij gebruiken',
      description:
        'We delen onze cookies in categorieën in zodat u duidelijke keuzes kunt maken. Alleen strikt noodzakelijke cookies staan altijd aan; alle andere categorieën vereisen uw actieve toestemming.'
    },
    strictlyNecessary: {
      title: 'Categorie 1: Strikt noodzakelijke (functionele) cookies',
      description:
        'Deze cookies zijn essentieel voor het functioneren van het platform, voor veilig inloggen via uw onderwijsinstelling en voor ID-verificatie. Zonder deze cookies kan Domu Match niet goed werken. Omdat ze alleen de door u gevraagde dienst mogelijk maken, is geen toestemming vereist, maar we zijn hier wel graag transparant over.',
      tableCaption: 'Strikt noodzakelijke cookies die Domu Match gebruikt',
      headers: ['Naam', 'Aanbieder', 'Doel', 'Duur'],
      rows: [
        [
          'surf_auth_session',
          'Domu Match / SURFconext',
          'Houdt uw beveiligde inlogsessie via Surf Connect in stand zodat u toegang heeft tot Domu Match en ingelogd blijft terwijl u door het platform navigeert.',
          'Sessie (verwijderd wanneer u uw browser sluit)'
        ],
        [
          'surf_auth_state',
          'Domu Match / SURFconext',
          'Slaat tijdelijke statusinformatie op die nodig is om de Surf Connect single sign-on stroom af te ronden en misbruik van het inlogproces te voorkomen.',
          'Sessie (verwijderd wanneer de inlogstroom is afgerond of de browser wordt gesloten)'
        ],
        [
          'persona_session_id',
          'Persona',
          'Ondersteunt veilige ID-verificatie (bijvoorbeeld wanneer u uw ID uploadt) en helpt fraude tijdens het verificatieproces te voorkomen.',
          'Sessie (verwijderd wanneer u uw browser sluit)'
        ],
        [
          'persona_csrf_token',
          'Persona',
          'Beveiligingscookie die de ID-verificatiestroom beschermt tegen cross-site request forgery (CSRF)-aanvallen.',
          'Sessie (verwijderd wanneer de verificatiestroom eindigt of de browser wordt gesloten)'
        ],
        [
          'domu_app_session',
          'Domu Match',
          'Houdt u ingelogd op het Domu Match-platform en koppelt uw handelingen op een veilige manier aan uw account.',
          'Sessie (verwijderd wanneer u uitlogt of uw browser sluit)'
        ],
        [
          'domu_functional_preferences',
          'Domu Match',
          'Slaat basis-voorkeuren op (zoals taalinstellingen en eerder weggeklikte tips) zodat u deze niet telkens opnieuw hoeft in te stellen.',
          '12 maanden'
        ]
      ]
    },
    analytics: {
      title: 'Categorie 2: Analytische cookies (vragenlijst-ervaring)',
      description:
        'We gebruiken laag-impact analytische cookies om te begrijpen hoe goed onze vragenlijst werkt en hoe lang het invullen duurt. Dit helpt ons om uw matching-ervaring soepel te houden, zonder invasieve tracking of gedragsgerichte advertenties.',
      processing: [
        'We meten hoe lang het duurt om de meerbloksvragenlijst in te vullen (bijvoorbeeld 8 blokken van ongeveer 25 vragen). Zo zien we of bepaalde stappen onduidelijk zijn of waar gebruikers vastlopen.',
        'We kijken naar geaggregeerde voltooiingspercentages (bijvoorbeeld hoeveel mensen het laatste blok halen) om de opbouw en formulering van vragen te verbeteren.',
        'We bouwen geen gedragsprofielen en gebruiken deze cookies niet voor advertenties.'
      ],
      privacyMeasures: [
        'IP-adressen worden ingekort (bijvoorbeeld door het laatste octet te maskeren) voordat ze worden opgeslagen of geanalyseerd, in lijn met de Nederlandse verwachtingen voor “laag-impact analytics”.',
        'Analysedata wordt alleen in geaggregeerde vorm gebruikt (bijvoorbeeld statistieken per groep), niet om beslissingen over individuele studenten te nemen.',
        'Waar mogelijk verwijderen of pseudonimiseren we identificerende gegevens zodat deze niet eenvoudig aan u kunnen worden gekoppeld.'
      ],
      tableCaption: 'Analytische cookies die Domu Match gebruikt',
      headers: ['Naam', 'Aanbieder', 'Doel', 'Duur'],
      rows: [
        [
          'domu_analytics_session',
          'Domu Match',
          'Telt bezoeken en meet de voortgang in de vragenlijst zodat we kunnen zien waar gebruikers uitvallen en de invulervaring van 10–15 minuten kunnen verbeteren.',
          'Sessie (verwijderd wanneer u uw browser sluit)'
        ],
        [
          'domu_questionnaire_timing',
          'Domu Match',
          'Meet hoeveel tijd het kost om elk vragenlijstblok in anonieme vorm te voltooien, zodat we blokken indien nodig kunnen vereenvoudigen of herschikken.',
          'Tot 13 maanden'
        ]
      ]
    },
    bannerLogic: {
      title: 'Cookiebanner en toestemmingslogica',
      paragraphs: [
        'Bij uw eerste bezoek aan Domu Match tonen we een cookiebanner met drie duidelijke opties: “Alles accepteren”, “Alles weigeren” en “Aanpassen”. De knop “Alles weigeren” staat op dezelfde laag en met hetzelfde visuele gewicht als “Alles accepteren”, in lijn met de richtsnoeren van de Autoriteit Persoonsgegevens voor 2026.',
        'Er worden geen analytische of andere trackingcookies geplaatst voordat u actief kiest voor “Alles accepteren” of via “Aanpassen” toestemming geeft. Tot dat moment zijn alleen de strikt noodzakelijke (functionele en beveiligings-)cookies die hierboven zijn beschreven actief.',
        'U kunt het Cookie Voorkeurencentrum altijd opnieuw openen via de zwevende knop “Cookie-instellingen” die op de site zichtbaar is. Daar kunt u uw keuzes per categorie op elk moment wijzigen.'
      ],
      bullets: [
        'Er worden geen vooraf aangevinkte vakjes gebruikt voor niet-essentiële cookies.',
        'Weigeren is net zo eenvoudig als accepteren (geen misleidende kleuren of ingewikkelde stappen).',
        'Uw keuzes worden opgeslagen in een toestemmingsregister zodat we u niet onnodig vaak om dezelfde toestemming vragen.'
      ]
    },
    manage: {
      title: 'Hoe u cookies kunt beheren of verwijderen',
      description:
        'U houdt zelf de controle over cookies. U kunt toestemming intrekken of cookies verwijderen op twee manieren: op Domu Match zelf en in uw browser.',
      onSiteTitle: 'Op Domu Match',
      onSiteItems: [
        'Gebruik de zwevende knop “Cookie-instellingen” die op de site verschijnt om het Cookie Voorkeurencentrum op elk moment opnieuw te openen.',
        'In het Cookie Voorkeurencentrum kunt u analytische en andere niet-essentiële categorieën aan- of uitzetten. Wijzigingen worden toegepast nadat u uw voorkeuren opslaat.',
        'Als u toestemming intrekt, stoppen we met het gebruiken van de betreffende cookies en werken we onze toestemmingsregistratie bij.'
      ],
      browserTitle: 'In uw browser',
      browserIntro:
        'U kunt ook cookies verwijderen of blokkeren via de instellingen van uw browser. De onderstaande links bevatten stapsgewijze uitleg van de belangrijkste browserleveranciers:',
      browserLinks: [
        {
          name: 'Google Chrome',
          href: 'https://support.google.com/chrome/answer/95647'
        },
        {
          name: 'Mozilla Firefox',
          href: 'https://support.mozilla.org/nl/kb/cookies-informatie-die-websites-op-uw-computer-opslag'
        },
        {
          name: 'Apple Safari',
          href: 'https://support.apple.com/nl-nl/guide/safari/sfri11471'
        },
        {
          name: 'Microsoft Edge',
          href: 'https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09'
        }
      ]
    },
    retention: {
      title: 'Bewaartermijnen',
      intro:
        'We bewaren cookies en toestemmingsgegevens niet langer dan nodig is voor de hierboven beschreven doelen. Samengevat:',
      bullets: [
        'Sessiecookies (zoals inlog- en Surf Connect / Persona-beveiligingscookies) worden verwijderd wanneer u uitlogt of uw browser sluit.',
        'Functionele voorkeurscookies (zoals taal en weggeklikte tips) worden maximaal 12 maanden bewaard, waarna we u mogelijk opnieuw om uw voorkeuren vragen.',
        'Analytische cookies voor timing en voltooiing van de vragenlijst worden maximaal 13 maanden bewaard.',
        'Toestemmingsrecords (bewijs dat u bepaalde categorieën heeft geaccepteerd of geweigerd) worden bewaard voor de periode die nodig is onder het Nederlandse recht en om naleving richting toezichthouders aan te tonen.'
      ]
    },
    compliance: {
      title: 'Naleving van de Autoriteit Persoonsgegevens',
      paragraphs: [
        'Domu Match is ingericht volgens de norm van “vrijelijk gegeven, specifiek, geïnformeerd en ondubbelzinnig” uit de ePrivacy-regels en de Telecommunicatiewet.',
        'We vermijden dark patterns: we verbergen de optie “Alles weigeren” niet, gebruiken geen misleidende kleuren en dwingen u niet om analytische cookies te accepteren om de kernfunctionaliteit te gebruiken.',
        'Omdat we u zien als co‑partner in het matchingproces, willen we open en eerlijk zijn over hoe en waarom we cookies en analysedata gebruiken.'
      ]
    },
    contact: {
      title: 'Vragen of feedback',
      description:
        'Als u vragen heeft over deze Cookieverklaring of over hoe Domu Match cookies gebruikt, neem dan gerust contact met ons op. We leggen onze aanpak graag verder uit.',
      email: 'E-mail: info@domumatch.com'
    }
  }
}

export default function CookiePolicyPage() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Section className="bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-8 w-8 text-brand-600" />
                <h1 className="text-4xl font-bold text-brand-text">{t.title}</h1>
              </div>
              <p className="text-brand-muted mb-8">
                {t.lastUpdatedLabel}:{' '}
                {new Date('2026-01-06').toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US')}
              </p>

              {/* Introduction */}
              <p className="text-brand-muted mb-12 leading-relaxed">{t.introduction}</p>

              {/* What are cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.whatAreCookies.title}</h2>
                <div className="space-y-3 text-brand-muted">
                  {t.whatAreCookies.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Categories intro */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">
                  {t.categoriesIntro.title}
                </h2>
                <p className="text-brand-muted mb-6">{t.categoriesIntro.description}</p>

                <div className="space-y-6">
                  {/* Strictly Necessary */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">
                      {t.strictlyNecessary.title}
                    </h3>
                    <p className="text-brand-muted mb-4">{t.strictlyNecessary.description}</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-brand-muted border border-gray-200 rounded-lg overflow-hidden">
                        <caption className="text-left text-xs text-gray-500 px-4 pt-2 pb-3">
                          {t.strictlyNecessary.tableCaption}
                        </caption>
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                          <tr>
                            {t.strictlyNecessary.headers.map((header, index) => (
                              <th key={index} scope="col" className="px-4 py-3">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.strictlyNecessary.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 align-top">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.analytics.title}</h3>
                    <p className="text-brand-muted mb-4">{t.analytics.description}</p>

                    <div className="space-y-4 text-brand-muted">
                      <div>
                        <p className="font-semibold mb-2">
                          {locale === 'nl'
                            ? 'Hoe we deze analytische cookies gebruiken'
                            : 'How we use these analytical cookies'}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          {t.analytics.processing.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">
                          {locale === 'nl'
                            ? 'Privacybeschermende maatregelen'
                            : 'Privacy-protective measures'}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          {t.analytics.privacyMeasures.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm text-left text-brand-muted border border-gray-200 rounded-lg overflow-hidden">
                        <caption className="text-left text-xs text-gray-500 px-4 pt-2 pb-3">
                          {t.analytics.tableCaption}
                        </caption>
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                          <tr>
                            {t.analytics.headers.map((header, index) => (
                              <th key={index} scope="col" className="px-4 py-3">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.analytics.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 align-top">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookie banner logic */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">
                  {t.bannerLogic.title}
                </h2>
                <div className="space-y-3 text-brand-muted mb-4">
                  {t.bannerLogic.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.bannerLogic.bullets.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Manage / delete cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.manage.title}</h2>
                <p className="text-brand-muted mb-4">{t.manage.description}</p>

                <div className="space-y-6 text-brand-muted">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-text mb-2">
                      {t.manage.onSiteTitle}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {t.manage.onSiteItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-brand-text mb-2">
                      {t.manage.browserTitle}
                    </h3>
                    <p className="mb-3">{t.manage.browserIntro}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      {t.manage.browserLinks.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">
                  {t.retention.title}
                </h2>
                <p className="text-brand-muted mb-4">{t.retention.intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.retention.bullets.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Compliance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">
                  {t.compliance.title}
                </h2>
                <div className="space-y-3 text-brand-muted">
                  {t.compliance.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.contact.title}</h2>
                <p className="text-brand-muted mb-4">{t.contact.description}</p>
                <p className="text-brand-muted">{t.contact.email}</p>
              </section>
            </div>
          </Container>
        </Section>
      </div>
      <Footer />
    </main>
  )
}

