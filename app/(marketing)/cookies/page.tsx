'use client'

import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { Cookie } from 'lucide-react'

const content = {
  en: {
    title: "Cookie Policy",
    lastUpdated: "Last updated",
    introduction: "This Cookie Policy explains how Domu Match uses cookies and similar tracking technologies on our platform, in compliance with the EU ePrivacy Directive and Dutch Telecommunicatiewet.",
    whatAreCookies: {
      title: "What Are Cookies?",
      description: "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners."
    },
    howWeUse: {
      title: "How We Use Cookies",
      description: "We use cookies for the following purposes:"
    },
    types: {
      essential: {
        title: "Essential Cookies",
        description: "These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in or setting privacy preferences.",
        examples: [
          "Authentication cookies (to keep you logged in)",
          "Security cookies (to protect against fraud)",
          "Session management cookies"
        ]
      },
      analytics: {
        title: "Analytics Cookies",
        description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
        examples: [
          "Page views and navigation patterns",
          "Time spent on pages",
          "Error tracking and performance metrics"
        ],
        provider: "Vercel Analytics"
      },
      errorTracking: {
        title: "Error Tracking Cookies",
        description: "These cookies help us identify and fix technical issues by tracking errors and performance problems.",
        examples: [
          "JavaScript error tracking",
          "Performance monitoring",
          "Debugging information"
        ],
        provider: "Sentry",
        note: "Requires your explicit consent (opt-in)"
      },
      sessionReplay: {
        title: "Session Replay",
        description: "These cookies record user sessions to help us improve the user experience and debug issues. Session recordings may capture sensitive information.",
        examples: [
          "User interaction recordings",
          "Screen recordings",
          "Mouse movements and clicks"
        ],
        provider: "Sentry Replay",
        note: "Requires your explicit consent (opt-in). May capture sensitive information."
      },
      marketing: {
        title: "Marketing Cookies",
        description: "These cookies are used to track visitors across websites for marketing and advertising purposes.",
        examples: [
          "Advertising tracking",
          "Conversion tracking",
          "Retargeting"
        ],
        note: "Currently not used, but may be added in the future with your consent"
      }
    },
    thirdParty: {
      title: "Third-Party Cookies",
      description: "We use the following third-party services that may set cookies:",
      services: [
        {
          name: "Vercel Analytics",
          purpose: "Website analytics and performance monitoring",
          privacy: "https://vercel.com/legal/privacy-policy"
        },
        {
          name: "Sentry",
          purpose: "Error tracking and session replay",
          privacy: "https://sentry.io/privacy/"
        }
      ]
    },
    managing: {
      title: "Managing Your Cookie Preferences",
      description: "You can manage your cookie preferences at any time:",
      methods: [
        "Use our Cookie Preference Center (accessible from the cookie banner or settings)",
        "Change your browser settings to block or delete cookies",
        "Note: Blocking essential cookies may affect website functionality"
      ]
    },
    consent: {
      title: "Your Consent",
      description: "We only use non-essential cookies with your explicit consent. You can:",
      options: [
        "Accept all cookies",
        "Reject all non-essential cookies",
        "Customize your preferences for each cookie category"
      ],
      withdrawal: "You can withdraw your consent at any time through the Cookie Preference Center."
    },
    retention: {
      title: "Cookie Retention",
      description: "Cookies are retained for the following periods:",
      periods: [
        "Session cookies: Deleted when you close your browser",
        "Persistent cookies: Retained for up to 2 years or until you delete them",
        "Consent records: Retained for audit purposes per Telecommunicatiewet requirements"
      ]
    },
    contact: {
      title: "Contact Us",
      description: "If you have questions about our use of cookies, please contact us:",
      email: "Email: privacy@domumatch.nl"
    }
  },
  nl: {
    title: "Cookiebeleid",
    lastUpdated: "Laatst bijgewerkt",
    introduction: "Dit Cookiebeleid legt uit hoe Domu Match cookies en vergelijkbare trackingtechnologieën gebruikt op ons platform, in overeenstemming met de EU ePrivacy Richtlijn en de Nederlandse Telecommunicatiewet.",
    whatAreCookies: {
      title: "Wat zijn Cookies?",
      description: "Cookies zijn kleine tekstbestanden die op uw apparaat worden geplaatst wanneer u een website bezoekt. Ze worden veel gebruikt om websites efficiënter te laten werken en informatie te verstrekken aan website-eigenaren."
    },
    howWeUse: {
      title: "Hoe We Cookies Gebruiken",
      description: "We gebruiken cookies voor de volgende doeleinden:"
    },
    types: {
      essential: {
        title: "Essentiële Cookies",
        description: "Deze cookies zijn noodzakelijk voor de website om te functioneren en kunnen niet worden uitgeschakeld. Ze worden meestal ingesteld als reactie op acties die u onderneemt, zoals inloggen of privacyvoorkeuren instellen.",
        examples: [
          "Authenticatiecookies (om u ingelogd te houden)",
          "Beveiligingscookies (om fraude te voorkomen)",
          "Sessiebeheercookies"
        ]
      },
      analytics: {
        title: "Analytische Cookies",
        description: "Deze cookies helpen ons begrijpen hoe bezoekers met onze website interageren door informatie anoniem te verzamelen en te rapporteren.",
        examples: [
          "Paginaweergaven en navigatiepatronen",
          "Tijd besteed aan pagina's",
          "Foutopsporing en prestatiemetingen"
        ],
        provider: "Vercel Analytics"
      },
      errorTracking: {
        title: "Foutopsporingscookies",
        description: "Deze cookies helpen ons technische problemen te identificeren en op te lossen door fouten en prestatieproblemen bij te houden.",
        examples: [
          "JavaScript-foutopsporing",
          "Prestatiebewaking",
          "Debuginformatie"
        ],
        provider: "Sentry",
        note: "Vereist uw uitdrukkelijke toestemming (opt-in)"
      },
      sessionReplay: {
        title: "Sessieherhaling",
        description: "Deze cookies nemen gebruikerssessies op om ons te helpen de gebruikerservaring te verbeteren en problemen op te lossen. Sessieopnames kunnen gevoelige informatie vastleggen.",
        examples: [
          "Gebruikersinteractie-opnames",
          "Schermopnames",
          "Muismuisbewegingen en klikken"
        ],
        provider: "Sentry Replay",
        note: "Vereist uw uitdrukkelijke toestemming (opt-in). Kan gevoelige informatie vastleggen."
      },
      marketing: {
        title: "Marketing Cookies",
        description: "Deze cookies worden gebruikt om bezoekers op verschillende websites te volgen voor marketing- en advertentiedoeleinden.",
        examples: [
          "Advertentietracking",
          "Conversietracking",
          "Retargeting"
        ],
        note: "Momenteel niet gebruikt, maar kan in de toekomst met uw toestemming worden toegevoegd"
      }
    },
    thirdParty: {
      title: "Cookies van Derden",
      description: "We gebruiken de volgende services van derden die cookies kunnen instellen:",
      services: [
        {
          name: "Vercel Analytics",
          purpose: "Website-analyses en prestatiebewaking",
          privacy: "https://vercel.com/legal/privacy-policy"
        },
        {
          name: "Sentry",
          purpose: "Foutopsporing en sessieherhaling",
          privacy: "https://sentry.io/privacy/"
        }
      ]
    },
    managing: {
      title: "Uw Cookievoorkeuren Beheren",
      description: "U kunt uw cookievoorkeuren op elk moment beheren:",
      methods: [
        "Gebruik ons Cookie Voorkeurencentrum (toegankelijk via de cookiebanner of instellingen)",
        "Wijzig uw browserinstellingen om cookies te blokkeren of te verwijderen",
        "Opmerking: Het blokkeren van essentiële cookies kan de functionaliteit van de website beïnvloeden"
      ]
    },
    consent: {
      title: "Uw Toestemming",
      description: "We gebruiken alleen niet-essentiële cookies met uw uitdrukkelijke toestemming. U kunt:",
      options: [
        "Alle cookies accepteren",
        "Alle niet-essentiële cookies weigeren",
        "Uw voorkeuren voor elke cookiecategorie aanpassen"
      ],
      withdrawal: "U kunt uw toestemming op elk moment intrekken via het Cookie Voorkeurencentrum."
    },
    retention: {
      title: "Cookiebewaring",
      description: "Cookies worden bewaard voor de volgende perioden:",
      periods: [
        "Sessiecookies: Verwijderd wanneer u uw browser sluit",
        "Persistente cookies: Bewaard tot 2 jaar of totdat u ze verwijdert",
        "Toestemmingsrecords: Bewaard voor auditdoeleinden volgens Telecommunicatiewet vereisten"
      ]
    },
    contact: {
      title: "Neem Contact met Ons Op",
      description: "Als u vragen heeft over ons gebruik van cookies, neem dan contact met ons op:",
      email: "E-mail: privacy@domumatch.nl"
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
                {t.lastUpdated}: {new Date().toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US')}
              </p>
              
              <p className="text-brand-muted mb-12 leading-relaxed">
                {t.introduction}
              </p>

              {/* What Are Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.whatAreCookies.title}</h2>
                <p className="text-brand-muted">{t.whatAreCookies.description}</p>
              </section>

              {/* How We Use Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.howWeUse.title}</h2>
                <p className="text-brand-muted mb-6">{t.howWeUse.description}</p>
                
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.types.essential.title}</h3>
                    <p className="text-brand-muted mb-4">{t.types.essential.description}</p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.types.essential.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.types.analytics.title}</h3>
                    <p className="text-brand-muted mb-2">{t.types.analytics.description}</p>
                    <p className="text-sm text-brand-muted mb-4">
                      <strong>Provider:</strong> {t.types.analytics.provider}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.types.analytics.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Error Tracking */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.types.errorTracking.title}</h3>
                    <p className="text-brand-muted mb-2">{t.types.errorTracking.description}</p>
                    <p className="text-sm text-brand-muted mb-2">
                      <strong>Provider:</strong> {t.types.errorTracking.provider}
                    </p>
                    {t.types.errorTracking.note && (
                      <p className="text-sm text-orange-600 mb-4 font-medium">{t.types.errorTracking.note}</p>
                    )}
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.types.errorTracking.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Session Replay */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.types.sessionReplay.title}</h3>
                    <p className="text-brand-muted mb-2">{t.types.sessionReplay.description}</p>
                    <p className="text-sm text-brand-muted mb-2">
                      <strong>Provider:</strong> {t.types.sessionReplay.provider}
                    </p>
                    {t.types.sessionReplay.note && (
                      <p className="text-sm text-orange-600 mb-4 font-medium">{t.types.sessionReplay.note}</p>
                    )}
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.types.sessionReplay.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.types.marketing.title}</h3>
                    <p className="text-brand-muted mb-2">{t.types.marketing.description}</p>
                    {t.types.marketing.note && (
                      <p className="text-sm text-gray-600 mb-4 italic">{t.types.marketing.note}</p>
                    )}
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.types.marketing.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.thirdParty.title}</h2>
                <p className="text-brand-muted mb-4">{t.thirdParty.description}</p>
                <div className="space-y-4">
                  {t.thirdParty.services.map((service, index) => (
                    <div key={index} className="border-l-4 border-brand-600 pl-4">
                      <h4 className="font-semibold text-brand-text">{service.name}</h4>
                      <p className="text-brand-muted text-sm">{service.purpose}</p>
                      <a 
                        href={service.privacy} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline text-sm"
                      >
                        {locale === 'nl' ? 'Privacybeleid' : 'Privacy Policy'}
                      </a>
                    </div>
                  ))}
                </div>
              </section>

              {/* Managing Preferences */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.managing.title}</h2>
                <p className="text-brand-muted mb-4">{t.managing.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.managing.methods.map((method, index) => (
                    <li key={index}>{method}</li>
                  ))}
                </ul>
              </section>

              {/* Consent */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.consent.title}</h2>
                <p className="text-brand-muted mb-4">{t.consent.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.consent.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.consent.withdrawal}</p>
              </section>

              {/* Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.retention.title}</h2>
                <p className="text-brand-muted mb-4">{t.retention.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.retention.periods.map((period, index) => (
                    <li key={index}>{period}</li>
                  ))}
                </ul>
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

