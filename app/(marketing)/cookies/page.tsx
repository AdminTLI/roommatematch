'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const LAST_UPDATED_ISO = '2026-04-06'

const content = {
  en: {
    title: 'Cookie & Local Storage Statement',
    lastUpdatedLabel: 'Last updated',
    introduction:
      'This Cookie & Local Storage Statement explains how Domu Match (“we”, “us”) stores and reads information on your device  -  including HTTP cookies, browser local storage, session storage, and similar technologies  -  on domumatch.com and our web application. Dutch law and the EU ePrivacy rules apply to this kind of access, not only to traditional “cookies”. Non-essential technologies are only activated after you give consent through our cookie banner or preference centre.',
    controller: {
      title: 'Data controller',
      paragraphs: [
        'The controller responsible for personal data in connection with cookies and similar technologies (within the meaning of the GDPR and Dutch law) is DMS Enterprise (eenmanszaak), trading under the name Domu Match (handelsnaam), registered in the Netherlands, Chamber of Commerce (KVK) number 97573337. This identification matches our Privacy Policy.',
        'Privacy contact: domumatch@gmail.com'
      ]
    },
    whatAreCookies: {
      title: 'What are cookies and similar technologies?',
      paragraphs: [
        'Cookies are small text files placed on your device when you visit a website. Your browser sends them back on later requests so the site can recognise your browser or session.',
        'We also use similar technologies that are not HTTP cookies but work alongside them: for example browser localStorage and sessionStorage. Under EU guidance these are often treated like cookies when they store or access information on your device, so we describe them here as well.',
        'Technologies can be first-party (set by Domu Match on our domain) or third-party (set by a service provider on their domain, for example during embedded identity verification).'
      ]
    },
    categoriesIntro: {
      title: 'How we group choices in the preference centre',
      description:
        'Our cookie banner and Cookie Preference Centre use the same categories: Essential (always on), Analytics, Error tracking, Session replay, and Marketing. Only Essential is active without your opt-in. You can Accept all, Reject all, or Customize. Reject all is shown with equal prominence to Accept all, in line with Dutch DPA guidance.'
    },
    strictlyNecessary: {
      title: 'Category A  -  Strictly necessary cookies, local storage & platform integrity',
      description:
        'These entries are required to operate a secure logged-in service (authentication, session integrity, CSRF protection) and to deliver the site through our hosting provider. Under the ePrivacy framework they fall under the strictly necessary exemption because they are needed to provide the service you actively request  -  not for optional analytics or marketing.',
      tableCaption: 'Strictly necessary storage (device + HTTP)',
      headers: ['Name / pattern', 'Where it lives', 'Provider', 'Purpose', 'Duration'],
      rows: [
        [
          'Supabase Auth session (typically sb-<project-ref>-auth-token and related sb-* keys)',
          'localStorage',
          'Supabase (processor) / Domu Match',
          'Primary browser persistence for your Supabase Auth session: keeps you signed in and lets the client refresh tokens. The Supabase browser client typically stores these values in localStorage alongside any HTTP-cookie synchronisation used for server-side session checks.',
          'Until you sign out or clear site data for our origin; Supabase may refresh tokens while the session is active.'
        ],
        [
          'Supabase Auth session (sb-* pattern, may be chunked across multiple names)',
          'HTTP cookie',
          'Supabase (processor) / Domu Match',
          'Synchronised session data for server-side rendering, middleware, and protected routes (for example so the server can validate your session on each request). Exact names depend on your Supabase project reference.',
          'Session-based; refreshed while you use the site. Cleared when you sign out or remove cookies / site data.'
        ],
        [
          'csrf-token',
          'HTTP cookie',
          'Domu Match',
          'HTTP-only CSRF token for authenticated users. Protects POST/PUT/PATCH/DELETE requests to our APIs from cross-site request forgery.',
          'Up to 24 hours (rotated by our application)'
        ],
        [
          'Vercel platform identifiers (names vary; set by our host)',
          'HTTP cookie / edge mechanism (as determined by Vercel)',
          'Vercel Inc. (processor) / Domu Match',
          'Strictly necessary hosting and edge operations: for example request routing, TLS delivery, and proportionate abuse or denial-of-service mitigation on Vercel’s network. This is separate from optional Vercel Web Analytics and Speed Insights (those load only after Analytics consent  -  see below).',
          'Per Vercel’s platform behaviour; typically short-lived or session-oriented technical tokens.'
        ]
      ]
    },
    infrastructureNote: {
      title: 'Cloudflare / bot widgets',
      paragraphs: [
        'We do not load Cloudflare Turnstile or other Cloudflare challenge widgets in our application code. If we add them later, we will update this statement and assign them to the correct legal category (strictly necessary vs consent-based) before activation.'
      ]
    },
    universitySsoNote: {
      title: 'SURFconext and other university SSO (not live today)',
      paragraphs: [
        'Domu Match does not currently offer SURFconext or other institution-specific single sign-on in production.',
        'Technically, the stack can support future university SSO in two ways: (1) Supabase Auth can be linked to an external OIDC/OAuth identity provider (for example a national or institutional IdP); after login you would still use the same Supabase session persistence described in Category A (local storage and/or HTTP cookies). (2) The repository contains optional, feature-flagged placeholder code for a SAML-style SURFconext integration (environment variables such as ENABLE_SURFCONEXT in env.example)  -  this is not connected to the live sign-in experience and would need a full implementation and security review before use.',
        'If we launch SURFconext or similar SSO, we will update this Cookie & Local Storage Statement to list any additional first- or third-party cookies, storage keys, or domains involved.'
      ]
    },
    verificationThirdParties: {
      title: 'Strictly necessary third parties during ID verification',
      paragraphs: [
        'When you go through mandatory identity verification we embed or redirect to Persona (withpersona.com). Persona may set and read its own cookies and similar storage on Persona-controlled domains to operate fraud prevention, device signals, and the verification UI. We do not control those technologies.',
        'For details, see Persona’s own legal and privacy documentation. We only receive verification outcomes and related attributes in line with our Privacy Policy.'
      ]
    },
    essentialStorage: {
      title: 'Category B  -  Essential local and session storage (first-party)',
      description:
        'The following keys are used in your browser for core functionality. They are treated as strictly necessary for the service and are not tied to optional analytics or marketing in our application code.',
      tableCaption: 'Essential browser storage keys',
      headers: ['Key', 'Storage type', 'Purpose', 'Duration'],
      rows: [
        [
          'locale',
          'localStorage',
          'Remembers your selected interface language (English or Dutch).',
          'Until you change language or clear site data'
        ],
        [
          'theme',
          'localStorage',
          'Remembers your light/dark/system appearance preference.',
          'Until you change theme or clear site data'
        ],
        [
          'domu_consent_preferences',
          'localStorage',
          'Stores your cookie choices and policy version so we do not ask on every visit.',
          'Until you update preferences or clear site data'
        ],
        [
          'domu_anonymous_session_id',
          'localStorage',
          'Anonymous identifier used when saving consent to our database before you create an account. Only a one-way hash of this value is stored server-side.',
          'Until you clear site data'
        ],
        [
          'verification-email',
          'sessionStorage',
          'Temporarily remembers the email address during email verification and sign-in flows.',
          'Until you close the browser tab'
        ]
      ]
    },
    optionalIntro: {
      title: 'Optional categories (require consent)',
      description:
        'The technologies below load or run only if you opt in through the matching toggle in our preference centre (or Accept all). If you reject or withdraw consent, we stop using them in the browser to the extent technically possible without breaking the core service.'
    },
    analytics: {
      title: 'Analytics',
      description:
        'Helps us understand aggregate usage (traffic, performance, and product funnels) so we can improve Domu Match.',
      bullets: [
        'Vercel Web Analytics and Vercel Speed Insights (Vercel Inc.) load only when Analytics consent is on and are not globally disabled via NEXT_PUBLIC_DISABLE_ANALYTICS.',
        'Our own first-party “user journey” events (for example page views) are sent to Domu Match servers and stored in our database. The client uses localStorage keys domu_session_id and domu_session_start to group events into a browser session (30-minute inactivity timeout). When Analytics consent is off, this client-side journey tracking is not initialized.',
        'For each journey event we store a truncated client IP address (for IPv4, the last octet is replaced with 0; for IPv6, only a short prefix is kept) together with coarse location fields our host may supply (for example country/region/city). This reduces identifiability while still allowing aggregate geographic reporting.'
      ],
      tableCaption: 'Analytics-related providers and storage',
      headers: ['Technology', 'Provider', 'Purpose', 'Notes'],
      rows: [
        [
          'Vercel Web Analytics & Speed Insights',
          'Vercel Inc.',
          'Privacy-friendly, aggregate web analytics and Core Web Vitals style performance metrics for our deployment.',
          'See Vercel’s privacy policy. Loaded only after Analytics consent.'
        ],
        [
          'First-party journey / page events',
          'Domu Match',
          'Product analytics such as page_view and server-side business events linked to onboarding and matching flows.',
          'Uses localStorage session keys above; data is stored in our Supabase-backed database (user_journey_events and related tables).'
        ]
      ]
    },
    errorTracking: {
      title: 'Error tracking',
      description:
        'Client-side error monitoring through Sentry (Functional Software Inc.). When enabled, Sentry may collect error payloads, performance traces, and technical context needed to diagnose bugs. We strip cookies and sensitive headers from events in our SDK configuration where possible.',
      bullets: [
        'The browser Sentry SDK initializes only when Error tracking consent is granted and NEXT_PUBLIC_SENTRY_DSN is configured.',
        'Separately, Sentry on our servers and edge runtime may record unhandled errors and performance data to keep the service secure and available. We rely on our legitimate interests (and, where applicable, our contract with you) for that processing  -  not on advertising or profiling. It is not used for behavioural marketing. Sub-processors and details are listed in our Privacy Policy.'
      ]
    },
    sessionReplay: {
      title: 'Session replay',
      description:
        'Sentry Session Replay may record short clips of how the interface is used to debug complex issues. Replay is attached only when Session replay consent is on; sampling rates are configured in our Sentry client setup.',
      bullets: [
        'Replay can capture on-screen text you type or see. Only enable this if you are comfortable with that risk, or leave it off.',
        'Requires Error tracking consent path to be meaningful in our current client bundle (Sentry initializes only with Error tracking consent).'
      ]
    },
    marketing: {
      title: 'Marketing',
      description:
        'We provide a Marketing toggle so we can turn on measurement or advertising tags in a consent-aware way in the future.',
      bullets: [
        'We have confirmed that we do not load third-party advertising or remarketing pixels (such as Meta Pixel, Google Ads tags, or similar) in our production application code.',
        'If we add marketing technologies later, we will update this statement and map them to the Marketing category before activation.'
      ]
    },
    consentProof: {
      title: 'Proof of consent and preference changes',
      paragraphs: [
        'When you save choices, we write domu_consent_preferences in localStorage and send a record to our API (/api/privacy/consent). For logged-in users we store rows in the user_consents table; for anonymous visitors we store a SHA-256 hash of domu_anonymous_session_id instead of the raw id.',
        'We may store a truncated client IP address (same rules as for analytics journey events) and the user agent sent by your browser with that request to demonstrate compliance if ever questioned by a regulator. We do not use that data for advertising.'
      ]
    },
    functionalNote: {
      title: 'Other local storage for product features',
      paragraphs: [
        'Some product areas use localStorage for purely functional UX that is not used for cross-site advertising  -  for example caching dismissed tips or chat UI state on your device. These are not used to track you across other companies’ sites. If you clear site data, that state resets.'
      ]
    },
    bannerLogic: {
      title: 'Cookie banner and consent logic',
      paragraphs: [
        'On your first visit, if we have no saved preferences, you will see a banner with Accept all, Reject all, and Customize.',
        'Until you make a choice, we do not load optional Analytics (including Vercel Analytics), optional client-side error tracking/replay (Sentry in the browser), or first-party journey tracking that depends on Analytics consent.',
        'After you save a choice, a small Cookie settings control appears so you can reopen the preference centre at any time.'
      ],
      bullets: [
        'Non-essential toggles default to off; we do not use pre-ticked boxes for optional categories.',
        'If you choose Customize on your first visit (before any choice is saved), the preference centre opens with Analytics, Error tracking, Session replay, and Marketing all switched off until you actively enable them  -  matching GDPR / AP expectations.',
        'Reject all is as easy as Accept all (no dark patterns or forced scrolling).',
        'Saving preferences may reload the page so technologies align with your choice.'
      ]
    },
    manage: {
      title: 'How to manage or delete cookies and storage',
      description:
        'You can change optional categories in our Cookie Preference Centre at any time via Cookie settings, or clear all data for our site in your browser.',
      onSiteTitle: 'On Domu Match',
      onSiteItems: [
        'Click the Cookie settings button (lower-left on screen once you have saved a choice) to reopen the Cookie Preference Centre.',
        'Use Customize to switch Analytics, Error tracking, Session replay, or Marketing on or off, then Save preferences.',
        'Withdrawing consent updates our records and stops loading the related optional technologies on your device after reload where applicable.'
      ],
      browserTitle: 'In your browser',
      browserIntro:
        'You can delete or block cookies and site data through your browser settings. Official help pages:',
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
    processors: {
      title: 'Key processors and further reading',
      intro: 'Privacy and cookie information from core infrastructure providers:',
      links: [
        { name: 'Supabase', href: 'https://supabase.com/privacy' },
        { name: 'Vercel', href: 'https://vercel.com/legal/privacy-policy' },
        { name: 'Sentry / Functional Software', href: 'https://sentry.io/privacy/' },
        { name: 'Persona', href: 'https://withpersona.com/legal/privacy-policy' }
      ]
    },
    retention: {
      title: 'Retention (summary)',
      intro: 'Indicative periods  -  see our Privacy Policy for full retention schedules:',
      bullets: [
        'Supabase authentication data in localStorage and HTTP cookies follows Supabase session settings and is cleared when you sign out or remove site data / cookies.',
        'csrf-token is rotated on our application schedule (up to roughly 24 hours).',
        'Consent records in user_consents are kept for as long as needed to demonstrate compliance with telecom and privacy law.',
        'Analytics and journey data in our database are retained only for product improvement and security, then deleted or aggregated according to internal policies described in the Privacy Policy.'
      ]
    },
    compliance: {
      title: 'Compliance approach (Netherlands / EU)',
      paragraphs: [
        'We aim to meet the standard of freely given, specific, informed, and unambiguous consent for any optional storage and access that requires it.',
        'This statement is for transparency and is not legal advice. If you need certainty for your organisation, consult qualified counsel.'
      ]
    },
    contact: {
      title: 'Questions',
      description:
        'If something here does not match what you see in your browser or you want to exercise GDPR rights, contact us and we will help.',
      email: 'Email: domumatch@gmail.com'
    }
  },
  nl: {
    title: 'Cookie- en localStorage-verklaring',
    lastUpdatedLabel: 'Laatst bijgewerkt',
    introduction:
      'In deze Cookie- en localStorage-verklaring leggen we uit hoe Domu Match (“wij”) informatie op uw apparaat opslaat en uitleest  -  waaronder HTTP-cookies, localStorage en sessionStorage in de browser en vergelijkbare technologieën  -  op domumatch.com en in onze webapplicatie. Onder het Nederlandse recht en de ePrivacy-regels geldt die toegang breder dan alleen traditionele “cookies”. Niet-noodzakelijke technologieën worden pas ingeschakeld nadat u via de cookiebanner of het voorkeurencentrum toestemming geeft.',
    controller: {
      title: 'Verwerkingsverantwoordelijke',
      paragraphs: [
        'De verwerkingsverantwoordelijke voor persoonsgegevens in verband met cookies en vergelijkbare technologieën (in de zin van de AVG en het Nederlandse recht) is DMS Enterprise (eenmanszaak), handelend onder de naam Domu Match (handelsnaam), gevestigd in Nederland, KvK-nummer 97573337. Deze identificatie komt overeen met ons Privacybeleid.',
        'Contact voor privacy: domumatch@gmail.com'
      ]
    },
    whatAreCookies: {
      title: 'Wat zijn cookies en vergelijkbare technologieën?',
      paragraphs: [
        'Cookies zijn kleine tekstbestanden die op uw apparaat worden geplaatst wanneer u een website bezoekt. Uw browser stuurt ze bij latere verzoeken terug zodat de site uw browser of sessie kan herkennen.',
        'We gebruiken ook vergelijkbare technologieën die géén HTTP-cookies zijn maar wel informatie op uw apparaat kunnen opslaan of uitlezen, zoals localStorage en sessionStorage in de browser. Onder EU-richtsnoeren worden die vaak gelijk behandeld met cookies; daarom beschrijven we ze hier ook.',
        'Technologieën kunnen first-party zijn (gezet door Domu Match op ons domein) of third-party (gezet door een dienstverlener op hun domein, bijvoorbeeld tijdens ingesloten ID-verificatie).'
      ]
    },
    categoriesIntro: {
      title: 'Hoe we keuzes groeperen in het voorkeurencentrum',
      description:
        'Onze cookiebanner en het Cookie-voorkeurencentrum gebruiken dezelfde categorieën: Essentieel (altijd aan), Analyse, Foutopsporing, Sessie-opname en Marketing. Alleen Essentieel staat aan zonder uw actieve keuze. U kunt Alles accepteren, Alles weigeren of Aanpassen. “Alles weigeren” heeft dezelfde zichtbaarheid als “Alles accepteren”, conform de lijn van de Autoriteit Persoonsgegevens.'
    },
    strictlyNecessary: {
      title: 'Categorie A  -  Strikt noodzakelijke cookies, localStorage & platformintegriteit',
      description:
        'Deze items zijn nodig voor een veilig ingelogde dienst (authenticatie, sessie-integriteit, CSRF-bescherming) en voor het uitserveren van de site via onze hostingprovider. Ze vallen onder de uitzondering voor strikte noodzakelijkheid in het ePrivacy-kader omdat ze nodig zijn voor de dienst die u actief vraagt  -  niet voor optionele analyse of marketing.',
      tableCaption: 'Strikt noodzakelijke opslag (apparaat + HTTP)',
      headers: ['Naam / patroon', 'Waar het staat', 'Aanbieder', 'Doel', 'Duur'],
      rows: [
        [
          'Supabase Auth-sessie (doorgaans sb-<project-ref>-auth-token en aanverwante sb-*-sleutels)',
          'localStorage',
          'Supabase (verwerker) / Domu Match',
          'Primaire browser-opslag van uw Supabase Auth-sessie: houdt u ingelogd en laat de client tokens vernieuwen. De Supabase browserclient slaat deze waarden typisch op in localStorage, naast eventuele synchronisatie met HTTP-cookies voor server-side sessiecontroles.',
          'Tot u uitlogt of sitedata voor onze origin wist; Supabase kan tokens vernieuwen zolang de sessie actief is.'
        ],
        [
          'Supabase Auth-sessie (sb-*-patroon; kan over meerdere namen verdeeld zijn)',
          'HTTP-cookie',
          'Supabase (verwerker) / Domu Match',
          'Gesynchroniseerde sessiegegevens voor server-side rendering, middleware en beveiligde routes (zodat de server bij elk verzoek uw sessie kan valideren). Exacte namen hangen af van uw Supabase-projectreferentie.',
          'Sessie-gebaseerd; vernieuwd tijdens gebruik. Gewist bij uitloggen of verwijderen van cookies/sitedata.'
        ],
        [
          'csrf-token',
          'HTTP-cookie',
          'Domu Match',
          'HTTP-only CSRF-token voor ingelogde gebruikers. Beschermt POST/PUT/PATCH/DELETE-verzoeken aan onze API’s tegen cross-site request forgery.',
          'Tot ca. 24 uur (roulerend door onze applicatie)'
        ],
        [
          'Vercel-platformidentifiers (namen variëren; gezet door onze host)',
          'HTTP-cookie / edge-mechanisme (door Vercel bepaald)',
          'Vercel Inc. (verwerker) / Domu Match',
          'Strikt noodzakelijke hosting- en edge-werking: o.a. requestrouting, TLS-aflevering en evenredige bescherming tegen misbruik of denial-of-service op het netwerk van Vercel. Dit staat los van optionele Vercel Web Analytics en Speed Insights (die alleen na Analyse-toestemming laden  -  zie hieronder).',
          'Conform het platformgedrag van Vercel; doorgaans korte of sessie-gerichte technische tokens.'
        ]
      ]
    },
    infrastructureNote: {
      title: 'Cloudflare / bot-widgets',
      paragraphs: [
        'We laden Cloudflare Turnstile of andere Cloudflare challenge-widgets niet in onze applicatiecode. Als we die later toevoegen, werken we deze verklaring bij en wijzen we ze toe aan de juiste juridische categorie (strikt noodzakelijk vs toestemmingsplichtig) vóór activatie.'
      ]
    },
    universitySsoNote: {
      title: 'SURFconext en ander universiteits-SSO (nu niet live)',
      paragraphs: [
        'Domu Match biedt op dit moment geen SURFconext of ander instellingsspecifiek single sign-on in productie.',
        'Technisch kan de stack toekomstige universiteits-SSO op twee manieren ondersteunen: (1) Supabase Auth kan worden gekoppeld aan een externe OIDC/OAuth identity provider (bijvoorbeeld een nationale of instellings-IdP); na inloggen gebruikt u nog steeds dezelfde Supabase-sessiepersistentie als in categorie A (localStorage en/of HTTP-cookies). (2) In de repository staat optionele, achter een feature-flag geplaatste placeholdercode voor een SAML-achtige SURFconext-koppeling (omgevingsvariabelen zoals ENABLE_SURFCONEXT in env.example)  -  dit is niet gekoppeld aan de live inlogervaring en vereist een volledige implementatie en security review voordat het gebruikt kan worden.',
        'Als we SURFconext of vergelijkbaar SSO lanceren, werken we deze Cookie- en localStorage-verklaring bij met eventuele extra first- of third-party cookies, opslagsleutels of domeinen.'
      ]
    },
    verificationThirdParties: {
      title: 'Strikt noodzakelijke derden tijdens ID-verificatie',
      paragraphs: [
        'Bij verplichte identiteitsverificatie embedden of doorverwijzen we naar Persona (withpersona.com). Persona kan eigen cookies en vergelijkbare opslag op Persona-domeinen gebruiken voor fraudepreventie, apparaatsignalen en de verificatie-UI. Wij beheersen die technologieën niet.',
        'Zie de documentatie van Persona voor details. Wij ontvangen alleen uitkomsten en gerelateerde attributen zoals in ons Privacybeleid beschreven.'
      ]
    },
    essentialStorage: {
      title: 'Categorie B  -  Essentiële local- en session storage (first-party)',
      description:
        'De volgende sleutels worden in uw browser gebruikt voor kernfunctionaliteit. Ze zijn strikt noodzakelijk voor de dienst en zijn in onze applicatiecode niet bedoeld voor optionele analyse of marketing.',
      tableCaption: 'Essentiële browser-opsleutels',
      headers: ['Sleutel', 'Opslagtype', 'Doel', 'Duur'],
      rows: [
        [
          'locale',
          'localStorage',
          'Onthoudt uw gekozen interface-taal (Engels of Nederlands).',
          'Tot u van taal wisselt of sitedata wist'
        ],
        [
          'theme',
          'localStorage',
          'Onthoudt licht/donker/systeem voor de weergave.',
          'Tot u het thema wijzigt of sitedata wist'
        ],
        [
          'domu_consent_preferences',
          'localStorage',
          'Slaat uw cookiekeuzes en beleidsversie op zodat we niet bij elk bezoek opnieuw vragen.',
          'Tot u voorkeuren wijzigt of sitedata wist'
        ],
        [
          'domu_anonymous_session_id',
          'localStorage',
          'Anonieme id om toestemming in onze database te koppelen voordat u een account heeft. Alleen een eenrichtings-hash wordt server-side opgeslagen.',
          'Tot u sitedata wist'
        ],
        [
          'verification-email',
          'sessionStorage',
          'Onthoudt tijdelijk het e-mailadres tijdens verificatie- en inlogstromen.',
          'Tot u het browsertabblad sluit'
        ]
      ]
    },
    optionalIntro: {
      title: 'Optionele categorieën (toestemming vereist)',
      description:
        'De onderstaande technologieën worden alleen geladen of uitgevoerd als u dat via de bijbehorende schakelaar in het voorkeurencentrum (of via Alles accepteren) toestaat. Bij weigering of intrekking stoppen we met het gebruik ervan in de browser voor zover technisch mogelijk zonder de kernfunctionaliteit te breken.'
    },
    analytics: {
      title: 'Analyse',
      description:
        'Helpt ons gebruik in geaggregeerde vorm te begrijpen (verkeer, prestaties en productflows) om Domu Match te verbeteren.',
      bullets: [
        'Vercel Web Analytics en Vercel Speed Insights (Vercel Inc.) worden alleen geladen bij Analyse-toestemming en als NEXT_PUBLIC_DISABLE_ANALYTICS niet is gezet.',
        'Onze first-party “user journey”-events (bijv. page views) gaan naar servers van Domu Match en worden in onze database opgeslagen. De client gebruikt localStorage-sleutels domu_session_id en domu_session_start om events in een browsersessie te groeperen (30 minuten inactiviteit). Zonder Analyse-toestemming wordt deze client-side journey-tracking niet geïnitialiseerd.',
        'Bij elk journey-event slaan we een ingekorte client-IP op (bij IPv4 wordt het laatste octet 0; bij IPv6 houden we alleen een kort prefix), samen met grove locatievelden die onze host kan meeleveren (bijv. land/regio/stad). Dat vermindert herleidbaarheid en ondersteunt toch geaggregeerde geografische rapportages.'
      ],
      tableCaption: 'Analyse-gerelateerde aanbieders en opslag',
      headers: ['Technologie', 'Aanbieder', 'Doel', 'Toelichting'],
      rows: [
        [
          'Vercel Web Analytics & Speed Insights',
          'Vercel Inc.',
          'Privacy-vriendelijke, geaggregeerde webanalyse en prestatie-indicatoren voor onze hosting.',
          'Zie het privacybeleid van Vercel. Alleen na Analyse-toestemming geladen.'
        ],
        [
          'First-party journey- / pagina-events',
          'Domu Match',
          'Productanalyse zoals page_view en server-side business events rond onboarding en matching.',
          'Gebruikt bovenstaande session-sleutels; data staat in onze Supabase-database (user_journey_events e.d.).'
        ]
      ]
    },
    errorTracking: {
      title: 'Foutopsporing (error tracking)',
      description:
        'Client-side foutmonitoring via Sentry (Functional Software Inc.). Indien ingeschakeld kan Sentry foutmeldingen, performance-traces en technische context verzamelen. We strippen cookies en gevoelige headers in onze SDK-configuratie waar mogelijk.',
      bullets: [
        'De browser-Sentry-SDK start alleen bij toestemming voor Foutopsporing en als NEXT_PUBLIC_SENTRY_DSN is ingesteld.',
        'Daarnaast kan Sentry op onze servers en edge-runtime niet-afgehandelde fouten en prestatiegegevens vastleggen om de dienst veilig en beschikbaar te houden. Daarvoor steunen we op onze gerechtvaardigde belangen (en waar van toepassing op de overeenkomst met u)  -  niet op advertenties of profilering. Het wordt niet gebruikt voor gedragsmarketing. Subverwerkers en details staan in ons Privacybeleid.'
      ]
    },
    sessionReplay: {
      title: 'Sessie-opname (session replay)',
      description:
        'Sentry Session Replay kan korte opnames maken van hoe de interface wordt gebruikt om complexe problemen te debuggen. Alleen actief bij toestemming voor Sessie-opname; sampling volgt onze Sentry-clientconfiguratie.',
      bullets: [
        'Replay kan tekst op het scherm vastleggen. Schakel dit alleen in als u daarmee instemt.',
        'In de huidige clientbundle is zinvolle werking verbonden aan de Foutopsporing-pad (Sentry start alleen met Foutopsporing-toestemming).'
      ]
    },
    marketing: {
      title: 'Marketing',
      description:
        'We bieden een Marketing-schakelaar zodat we later meet- of advertentietags op een toestemmingsbewuste manier kunnen toevoegen.',
      bullets: [
        'We hebben bevestigd dat we geen third-party advertentie- of remarketingpixels (zoals Meta Pixel, Google Ads-tags of vergelijkbaar) laden in onze productie-applicatiecode.',
        'Als we later marketingtechnologieën toevoegen, werken we deze verklaring bij en koppelen we ze aan de categorie Marketing vóór activatie.'
      ]
    },
    consentProof: {
      title: 'Bewijs van toestemming en voorkeurswijzigingen',
      paragraphs: [
        'Als u opslaat, schrijven we domu_consent_preferences naar localStorage en sturen we een record naar onze API (/api/privacy/consent). Voor ingelogde gebruikers slaan we rijen op in user_consents; voor anonieme bezoekers slaan we een SHA-256-hash van domu_anonymous_session_id op, niet de ruwe id.',
        'We kunnen een ingekorte client-IP (dezelfde regels als bij analyse-journeyevents) en de user-agent die uw browser meestuurt bij dat verzoek bewaren om naleving aan te tonen. We gebruiken die gegevens niet voor advertenties.'
      ]
    },
    functionalNote: {
      title: 'Overige lokale opslag voor productfuncties',
      paragraphs: [
        'Sommige onderdelen gebruiken localStorage puur functioneel (bijv. weggeklikte tips of chat-UI-status). Die worden niet gebruikt om u op andere sites van derden te volgen. Als u sitedata wist, wordt die status gereset.'
      ]
    },
    bannerLogic: {
      title: 'Cookiebanner en logica',
      paragraphs: [
        'Bij uw eerste bezoek tonen we een banner als er nog geen voorkeuren zijn opgeslagen, met Alles accepteren, Alles weigeren en Aanpassen.',
        'Tot u een keuze maakt, laden we geen optionele Analyse (inclusief Vercel Analytics), optionele client-side foutopsporing/replay (Sentry in de browser), of first-party journey-tracking die aan Analyse-toestemming hangt.',
        'Na het opslaan verschijnt een kleine knop Cookie-instellingen zodat u het voorkeurencentrum altijd kunt heropenen.'
      ],
      bullets: [
        'Optionele schakelaars staan standaard uit; geen vooraf aangevinkte vakjes.',
        'Kiest u bij het eerste bezoek voor Aanpassen (voordat een keuze is opgeslagen), dan opent het voorkeurencentrum met Analyse, Foutopsporing, Sessie-opname en Marketing allemaal uit  -  tot u ze zelf aanzet. Dit sluit aan bij de verwachtingen van de AVG en de AP.',
        'Weigeren is net zo eenvoudig als accepteren.',
        'Na opslaan kan de pagina vernieuwen zodat technologieën aansluiten op uw keuze.'
      ]
    },
    manage: {
      title: 'Cookies en opslag beheren of wissen',
      description:
        'U kunt optionele categorieën wijzigen via het Cookie-voorkeurencentrum (Cookie-instellingen), of alle gegevens voor onze site wissen in uw browser.',
      onSiteTitle: 'Op Domu Match',
      onSiteItems: [
        'Klik op Cookie-instellingen (linksonder zodra u een keuze heeft opgeslagen) om het voorkeurencentrum te openen.',
        'Gebruik Aanpassen om Analyse, Foutopsporing, Sessie-opname of Marketing aan of uit te zetten en sla op.',
        'Intrekken werkt door onze registratie bij te werken en laadt gerelateerde optionele technologieën na vernieuwen niet op uw apparaat (voor zover van toepassing).'
      ],
      browserTitle: 'In uw browser',
      browserIntro:
        'U kunt cookies en sitedata wissen of blokkeren via uw browserinstellingen. Officiële helppagina’s:',
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
    processors: {
      title: 'Belangrijke verwerkers en verder lezen',
      intro: 'Privacy- en cookie-informatie van kernleveranciers:',
      links: [
        { name: 'Supabase', href: 'https://supabase.com/privacy' },
        { name: 'Vercel', href: 'https://vercel.com/legal/privacy-policy' },
        { name: 'Sentry / Functional Software', href: 'https://sentry.io/privacy/' },
        { name: 'Persona', href: 'https://withpersona.com/legal/privacy-policy' }
      ]
    },
    retention: {
      title: 'Bewaartermijnen (samenvatting)',
      intro: 'Indicatieve termijnen  -  zie ons Privacybeleid voor volledige schema’s:',
      bullets: [
        'Supabase-authenticatiegegevens in localStorage en HTTP-cookies volgen de sessie-instellingen van Supabase en worden gewist bij uitloggen of het verwijderen van sitedata/cookies.',
        'csrf-token rouleert volgens onze applicatie (tot ongeveer 24 uur).',
        'Toestemmingsrecords in user_consents bewaren we zolang nodig is om naleving van telecom- en privacyrecht aan te tonen.',
        'Analyse- en journeydata in onze database bewaren we alleen voor productverbetering en beveiliging, daarna verwijderen of aggregeren we volgens interne regels in het Privacybeleid.'
      ]
    },
    compliance: {
      title: 'Nalevingsbenadering (Nederland / EU)',
      paragraphs: [
        'We streven ernaar om aan de norm van vrijelijk gegeven, specifiek, geïnformeerd en ondubbelzinnig te voldoen voor optionele opslag en toegang waar toestemming vereist is.',
        'Deze verklaring is bedoeld voor transparantie en is geen juridisch advies. Raadpleeg bij twijfel een gespecialiseerde adviseur.'
      ]
    },
    contact: {
      title: 'Vragen',
      description:
        'Als iets niet overeenkomt met wat u in uw browser ziet of u rechten onder de AVG wilt uitoefenen, neem contact op  -  we helpen u graag.',
      email: 'E-mail: domumatch@gmail.com'
    }
  }
}

export default function CookiePolicyPage() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t.title}</h1>
              <p className="text-slate-600 mb-8">
                {t.lastUpdatedLabel}:{' '}
                {new Date(LAST_UPDATED_ISO).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              <div className="mb-10 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
                <p className="text-amber-900 font-semibold mb-1">Beta Notice</p>
                <p className="text-amber-900/90 leading-relaxed">
                  You are using a pre-release (beta) version of Domu Match. This means features may change, data
                  may be reset, and additional data collection (such as bug reports and session logs) may be done
                  to help us improve the product. Our Privacy Policy covers data practices in detail; this
                  statement focuses on cookies, local storage, and similar technologies.
                </p>
              </div>

              <p className="text-slate-700 mb-12 leading-relaxed">{t.introduction}</p>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.controller.title}</h2>
                <div className="space-y-3 text-slate-700">
                  {t.controller.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.whatAreCookies.title}</h2>
                <div className="space-y-3 text-slate-700">
                  {t.whatAreCookies.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.categoriesIntro.title}</h2>
                <p className="text-slate-700 mb-6">{t.categoriesIntro.description}</p>

                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white/60 p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.strictlyNecessary.title}</h3>
                    <p className="text-slate-700 mb-4">{t.strictlyNecessary.description}</p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                      <table className="min-w-full text-left text-sm text-slate-700">
                        <caption className="text-left text-xs text-slate-600 px-4 pt-2 pb-3">
                          {t.strictlyNecessary.tableCaption}
                        </caption>
                        <thead className="bg-slate-900 text-white text-xs uppercase">
                          <tr>
                            {t.strictlyNecessary.headers.map((header, index) => (
                              <th key={index} scope="col" className="px-4 py-3 font-semibold">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {t.strictlyNecessary.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
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
                    <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-slate-700">
                      <h4 className="text-base font-semibold text-slate-900">{t.infrastructureNote.title}</h4>
                      {t.infrastructureNote.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white/60 p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.universitySsoNote.title}</h3>
                    <div className="space-y-3 text-slate-700">
                      {t.universitySsoNote.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white/60 p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.verificationThirdParties.title}</h3>
                    <div className="space-y-3 text-slate-700">
                      {t.verificationThirdParties.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white/60 p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.essentialStorage.title}</h3>
                    <p className="text-slate-700 mb-4">{t.essentialStorage.description}</p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                      <table className="min-w-full text-left text-sm text-slate-700">
                        <caption className="text-left text-xs text-slate-600 px-4 pt-2 pb-3">
                          {t.essentialStorage.tableCaption}
                        </caption>
                        <thead className="bg-slate-900 text-white text-xs uppercase">
                          <tr>
                            {t.essentialStorage.headers.map((header, index) => (
                              <th key={index} scope="col" className="px-4 py-3 font-semibold">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {t.essentialStorage.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
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

                  <div className="rounded-xl border border-slate-200 bg-white/60 p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t.optionalIntro.title}</h3>
                    <p className="text-slate-700 mb-6">{t.optionalIntro.description}</p>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{t.analytics.title}</h4>
                        <p className="text-slate-700 mb-3">{t.analytics.description}</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                          {t.analytics.bullets.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                        <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white/60">
                          <table className="min-w-full text-left text-sm text-slate-700">
                            <caption className="text-left text-xs text-slate-600 px-4 pt-2 pb-3">
                              {t.analytics.tableCaption}
                            </caption>
                            <thead className="bg-slate-900 text-white text-xs uppercase">
                              <tr>
                                {t.analytics.headers.map((header, index) => (
                                  <th key={index} scope="col" className="px-4 py-3 font-semibold">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {t.analytics.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
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

                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{t.errorTracking.title}</h4>
                        <p className="text-slate-700 mb-3">{t.errorTracking.description}</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700">
                          {t.errorTracking.bullets.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{t.sessionReplay.title}</h4>
                        <p className="text-slate-700 mb-3">{t.sessionReplay.description}</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700">
                          {t.sessionReplay.bullets.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{t.marketing.title}</h4>
                        <p className="text-slate-700 mb-3">{t.marketing.description}</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700">
                          {t.marketing.bullets.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.consentProof.title}</h2>
                <div className="space-y-3 text-slate-700">
                  {t.consentProof.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.functionalNote.title}</h2>
                <div className="space-y-3 text-slate-700">
                  {t.functionalNote.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.bannerLogic.title}</h2>
                <div className="space-y-3 text-slate-700 mb-4">
                  {t.bannerLogic.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.bannerLogic.bullets.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.manage.title}</h2>
                <p className="text-slate-700 mb-4">{t.manage.description}</p>
                <div className="space-y-6 text-slate-700">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t.manage.onSiteTitle}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {t.manage.onSiteItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t.manage.browserTitle}</h3>
                    <p className="mb-3">{t.manage.browserIntro}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      {t.manage.browserLinks.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 underline hover:text-violet-700"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.processors.title}</h2>
                <p className="text-slate-700 mb-3">{t.processors.intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.processors.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 underline hover:text-violet-700"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.retention.title}</h2>
                <p className="text-slate-700 mb-4">{t.retention.intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.retention.bullets.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.compliance.title}</h2>
                <div className="space-y-3 text-slate-700">
                  {t.compliance.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t.contact.title}</h2>
                <p className="text-slate-700 mb-4">{t.contact.description}</p>
                <p className="text-slate-700">{t.contact.email}</p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
