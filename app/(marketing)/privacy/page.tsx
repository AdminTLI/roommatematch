'use client'

import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated",
    introduction: "At Domu Match, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our roommate matching platform.",
    sections: {
      informationWeCollect: {
        title: "1. Information We Collect",
        description: "We collect information you provide directly to us, such as when you create an account, complete your profile, or communicate with us.",
        types: {
          account: {
            title: "Account Information",
            items: [
              "University email address",
              "Password (hashed and encrypted)",
              "Account creation date"
            ]
          },
          profile: {
            title: "Profile Information",
            items: [
              "Name and contact details",
              "University and program of study",
              "Study year and academic preferences",
              "Lifestyle preferences (cleanliness, quiet hours, social activities)",
              "Personality traits and compatibility factors",
              "Profile photos (optional)"
            ]
          },
          verification: {
            title: "Verification Documents",
            items: [
              "Government-issued ID (for identity verification)",
              "Selfie photo (for facial recognition matching)",
              "University email verification"
            ]
          },
          communication: {
            title: "Communication Data",
            items: [
              "Chat messages with potential roommates",
              "Support requests and inquiries",
              "Feedback and survey responses"
            ]
          },
          usage: {
            title: "Usage Data",
            items: [
              "Platform usage patterns and interactions",
              "Matching preferences and selections",
              "Device information and IP address",
              "Cookies and tracking technologies"
            ]
          }
        }
      },
      howWeUse: {
        title: "2. How We Use Your Information",
        description: "We use the information we collect to provide, maintain, and improve our services:",
        uses: [
          "Provide and improve our roommate matching services",
          "Verify your identity and ensure platform safety",
          "Communicate with you about potential matches and platform updates",
          "Analyze usage patterns to improve our matching algorithm",
          "Prevent fraud, abuse, and security threats",
          "Comply with legal obligations and enforce our terms",
          "Send you important notifications and updates",
          "Personalize your experience and recommendations"
        ]
      },
      informationSharing: {
        title: "3. Information Sharing and Disclosure",
        description: "We do not sell your personal information. We may share your information in the following circumstances:",
        sharing: [
          {
            title: "With Your University",
            description: "We may share information with your university housing department for verification purposes and to provide support services."
          },
          {
            title: "With Potential Matches",
            description: "We share your profile information (excluding sensitive data like ID documents) with compatible students to facilitate roommate matching."
          },
          {
            title: "With Service Providers",
            description: "We may share information with third-party service providers who assist in platform operations. All processors have signed Data Processing Agreements (DPAs) and comply with GDPR requirements. See our Third-Party Processors section below for details."
          },
          {
            title: "For Legal Compliance",
            description: "We may disclose information when required by law, court order, or governmental authority, or to protect our rights and safety."
          },
          {
            title: "With Your Consent",
            description: "We may share information with your explicit consent or at your direction."
          }
        ]
      },
      dataSecurity: {
        title: "4. Data Security",
        description: "We implement appropriate technical and organizational security measures to protect your personal information:",
        measures: [
          "Encryption of data in transit and at rest",
          "Secure authentication and access controls",
          "Regular security audits and vulnerability assessments",
          "Employee training on data protection",
          "Limited access to personal data on a need-to-know basis",
          "Regular backups and disaster recovery procedures"
        ],
        note: "While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security."
      },
      yourRights: {
        title: "5. Your Rights and Choices (GDPR Articles 15-20)",
        description: "You have the following rights regarding your personal information:",
        rights: [
          {
            title: "Right of Access (Article 15)",
            description: "You have the right to access and review your personal information. Request a data export through Privacy Settings → Download Your Data, or contact privacy@domumatch.nl. We will provide your data within 30 days."
          },
          {
            title: "Right to Rectification (Article 16)",
            description: "You can update or correct your profile information at any time through your account settings."
          },
          {
            title: "Right to Erasure (Article 17)",
            description: "You can request deletion of your account and associated data through Privacy Settings → Delete Account. Your account will be deleted after a 7-day grace period, subject to legal retention requirements (e.g., verification documents: 4 weeks per Dutch law)."
          },
          {
            title: "Right to Data Portability (Article 20)",
            description: "You can request a copy of your data in JSON format through Privacy Settings → Download Your Data. Data is provided in a structured, machine-readable format."
          },
          {
            title: "Right to Restrict Processing (Article 18)",
            description: "You can request restriction of processing by contacting privacy@domumatch.nl. We will restrict processing while your request is being reviewed."
          },
          {
            title: "Right to Object (Article 21)",
            description: "You can object to certain processing activities, such as automated decision-making (matching algorithm). Contact privacy@domumatch.nl to exercise this right."
          },
          {
            title: "Right to Withdraw Consent (Article 7)",
            description: "You can withdraw consent for non-essential cookies and tracking at any time through the Cookie Preference Center (accessible from the cookie banner or settings)."
          }
        ],
        dsarInstructions: "To exercise your rights, you can: (1) Use the Privacy Settings page in your account, (2) Email privacy@domumatch.nl with your request, or (3) Contact our Data Protection Officer at dpo@domumatch.nl. All requests are processed within 30 days as required by GDPR."
      },
      cookies: {
        title: "6. Cookies and Tracking Technologies",
        description: "We use cookies and similar tracking technologies to collect and store information about your use of our platform:",
        types: [
          {
            title: "Essential Cookies",
            description: "Required for the platform to function properly, such as authentication and session management."
          },
          {
            title: "Analytics Cookies",
            description: "Help us understand how users interact with our platform to improve our services."
          },
          {
            title: "Preference Cookies",
            description: "Remember your preferences and settings for a personalized experience."
          }
        ],
        management: "You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality."
      },
      gdpr: {
        title: "7. GDPR Compliance",
        description: "If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):",
        rights: [
          "Right to be informed about data processing",
          "Right of access to your personal data",
          "Right to rectification of inaccurate data",
          "Right to erasure ('right to be forgotten')",
          "Right to restrict processing",
          "Right to data portability",
          "Right to object to processing",
          "Rights related to automated decision-making"
        ],
        legalBasis: "We process your personal data based on the following legal bases:",
        bases: [
          "Consent: When you provide explicit consent for data processing",
          "Contract: To perform our contract with you (providing matching services)",
          "Legal obligation: To comply with legal requirements",
          "Legitimate interests: To improve our services and ensure platform safety"
        ]
      },
      dataRetention: {
        title: "8. Data Retention",
        description: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, in compliance with GDPR and Dutch law:",
        periods: [
          "Account data: Retained while your account is active, anonymized after 2 years of inactivity",
          "Verification documents: Retained for 4 weeks after verification (Dutch law requirement - UAVG), then deleted",
          "Chat messages: Retained for 1 year after last message in chat, then deleted",
          "Match suggestions: Retained for 90 days after expiry, then deleted",
          "Reports: Retained for 1 year after resolution, then deleted",
          "Application logs: Retained for 90 days, then deleted",
          "Analytics data: Retained in anonymized form for up to 2 years"
        ],
        deletion: "You can request deletion of your account and data at any time through your Privacy Settings or by contacting privacy@domumatch.nl. We will process your request within 30 days (GDPR requirement), subject to legal retention requirements (e.g., verification documents: 4 weeks per Dutch law)."
      },
      children: {
        title: "9. Children's Privacy",
        description: "Our platform is intended for students aged 17 and older. We do not knowingly collect personal information from children under 17. If you believe we have collected information from a child under 17, please contact us immediately."
      },
      changes: {
        title: "10. Changes to This Privacy Policy",
        description: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. We encourage you to review this Privacy Policy periodically."
      },
      thirdPartyProcessors: {
        title: "11. Third-Party Processors",
        description: "We use the following third-party service providers to operate our platform. All processors have signed Data Processing Agreements (DPAs) and comply with GDPR requirements:",
        processors: [
          {
            name: "Supabase",
            purpose: "Database, authentication, hosting, storage",
            location: "EU (primary), US (backup)",
            dpa: "Standard Contractual Clauses (SCCs)"
          },
          {
            name: "Sentry",
            purpose: "Error tracking, session replay (with your consent)",
            location: "US, EU",
            dpa: "Standard Contractual Clauses (SCCs)"
          },
          {
            name: "Vercel",
            purpose: "Hosting, analytics (with your consent)",
            location: "US, EU",
            dpa: "Standard Contractual Clauses (SCCs)"
          },
          {
            name: "Persona/Veriff/Onfido",
            purpose: "Identity verification (KYC)",
            location: "US, EU",
            dpa: "Signed DPAs"
          },
          {
            name: "Email Providers",
            purpose: "Transactional emails, notifications",
            location: "US, EU",
            dpa: "Standard Contractual Clauses (SCCs)"
          }
        ],
        note: "For detailed information about our processors, DPAs, and transfer mechanisms, see our Third-Party Processors documentation. You can request information about processors by contacting privacy@domumatch.nl."
      },
      contact: {
        title: "12. Contact Us",
        description: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
        email: "Email: privacy@domumatch.nl",
        dpo: "Data Protection Officer: dpo@domumatch.nl",
        dsar: "DSAR Requests: Use Privacy Settings in your account or email privacy@domumatch.nl",
        note: "For Data Subject Access Requests (DSAR), you can also use the Privacy Settings page in your account to request data export or account deletion."
      }
    }
  },
  nl: {
    title: "Privacybeleid",
    lastUpdated: "Laatst bijgewerkt",
    introduction: "Bij Domu Match nemen we uw privacy serieus. Dit Privacybeleid legt uit hoe we uw informatie verzamelen, gebruiken, delen en beschermen wanneer u ons huisgenoot matchingplatform gebruikt.",
    sections: {
      informationWeCollect: {
        title: "1. Informatie die we verzamelen",
        description: "We verzamelen informatie die u rechtstreeks aan ons verstrekt, bijvoorbeeld wanneer u een account aanmaakt, uw profiel voltooit of met ons communiceert.",
        types: {
          account: {
            title: "Accountinformatie",
            items: [
              "Universiteits-e-mailadres",
              "Wachtwoord (gehasht en versleuteld)",
              "Datum van accountaanmaak"
            ]
          },
          profile: {
            title: "Profielinformatie",
            items: [
              "Naam en contactgegevens",
              "Universiteit en studieprogramma",
              "Studiejaar en academische voorkeuren",
              "Levensstijlvoorkeuren (netheid, stilte uren, sociale activiteiten)",
              "Persoonlijkheidskenmerken en compatibiliteitsfactoren",
              "Profielfoto's (optioneel)"
            ]
          },
          verification: {
            title: "Verificatiedocumenten",
            items: [
              "Door de overheid uitgegeven ID (voor identiteitsverificatie)",
              "Selfiefoto (voor gezichtsherkenning)",
              "Universiteits-e-mailverificatie"
            ]
          },
          communication: {
            title: "Communicatiegegevens",
            items: [
              "Chatberichten met potentiële huisgenoten",
              "Ondersteuningsverzoeken en vragen",
              "Feedback en enquêtereacties"
            ]
          },
          usage: {
            title: "Gebruiksgegevens",
            items: [
              "Platformgebruikspatronen en interacties",
              "Matchingvoorkeuren en selecties",
              "Apparaatinformatie en IP-adres",
              "Cookies en trackingtechnologieën"
            ]
          }
        }
      },
      howWeUse: {
        title: "2. Hoe we uw informatie gebruiken",
        description: "We gebruiken de verzamelde informatie om onze diensten te verlenen, te onderhouden en te verbeteren:",
        uses: [
          "Onze huisgenoot matchingdiensten verlenen en verbeteren",
          "Uw identiteit verifiëren en platforms veiligheid waarborgen",
          "Met u communiceren over potentiële matches en platformupdates",
          "Gebruikspatronen analyseren om ons matchingalgoritme te verbeteren",
          "Fraude, misbruik en beveiligingsbedreigingen voorkomen",
          "Voldoen aan wettelijke verplichtingen en onze voorwaarden handhaven",
          "Belangrijke meldingen en updates verzenden",
          "Uw ervaring en aanbevelingen personaliseren"
        ]
      },
      informationSharing: {
        title: "3. Informatiedeling en openbaarmaking",
        description: "We verkopen uw persoonlijke informatie niet. We kunnen uw informatie delen in de volgende omstandigheden:",
        sharing: [
          {
            title: "Met uw universiteit",
            description: "We kunnen informatie delen met uw universiteitshuisvestingsafdeling voor verificatiedoeleinden en om ondersteuningsdiensten te verlenen."
          },
          {
            title: "Met potentiële matches",
            description: "We delen uw profielinformatie (exclusief gevoelige gegevens zoals ID-documenten) met compatibele studenten om huisgenootmatching te vergemakkelijken."
          },
          {
            title: "Met dienstverleners",
            description: "We kunnen informatie delen met externe dienstverleners die helpen bij platformoperaties, zoals cloudhosting, e-maildiensten en analyses."
          },
          {
            title: "Voor wettelijke naleving",
            description: "We kunnen informatie openbaar maken wanneer dit wordt vereist door de wet, gerechtelijk bevel of overheidsautoriteit, of om onze rechten en veiligheid te beschermen."
          },
          {
            title: "Met uw toestemming",
            description: "We kunnen informatie delen met uw uitdrukkelijke toestemming of op uw aanwijzing."
          }
        ]
      },
      dataSecurity: {
        title: "4. Gegevensbeveiliging",
        description: "We implementeren passende technische en organisatorische beveiligingsmaatregelen om uw persoonlijke informatie te beschermen:",
        measures: [
          "Versleuteling van gegevens tijdens overdracht en in rust",
          "Veilige authenticatie en toegangscontroles",
          "Regelmatige beveiligingsaudits en kwetsbaarheidsbeoordelingen",
          "Medewerkertraining over gegevensbescherming",
          "Beperkte toegang tot persoonlijke gegevens op basis van need-to-know",
          "Regelmatige back-ups en disaster recovery procedures"
        ],
        note: "Hoewel we ernaar streven uw informatie te beschermen, is geen enkele methode van overdracht via internet of elektronische opslag 100% veilig. We kunnen absolute veiligheid niet garanderen."
      },
      yourRights: {
        title: "5. Uw rechten en keuzes (AVG Artikelen 15-20)",
        description: "U heeft de volgende rechten met betrekking tot uw persoonlijke informatie:",
        rights: [
          {
            title: "Recht van toegang (Artikel 15)",
            description: "U heeft het recht om toegang te krijgen tot en uw persoonlijke informatie te bekijken. Vraag een gegevensexport aan via Privacy Instellingen → Uw gegevens downloaden, of neem contact op met privacy@domumatch.nl. We zullen uw gegevens binnen 30 dagen verstrekken."
          },
          {
            title: "Recht op rectificatie (Artikel 16)",
            description: "U kunt uw profielinformatie op elk moment bijwerken of corrigeren via uw accountinstellingen."
          },
          {
            title: "Recht op gegevenswissing (Artikel 17)",
            description: "U kunt verwijdering van uw account en bijbehorende gegevens aanvragen via Privacy Instellingen → Account verwijderen. Uw account wordt verwijderd na een respijtperiode van 7 dagen, onder voorbehoud van wettelijke bewaarvereisten (bijv. verificatiedocumenten: 4 weken volgens Nederlandse wet)."
          },
          {
            title: "Recht op gegevensportabiliteit (Artikel 20)",
            description: "U kunt een kopie van uw gegevens aanvragen in JSON-formaat via Privacy Instellingen → Uw gegevens downloaden. Gegevens worden verstrekt in een gestructureerd, machineleesbaar formaat."
          },
          {
            title: "Recht op beperking van verwerking (Artikel 18)",
            description: "U kunt beperking van verwerking aanvragen door contact op te nemen met privacy@domumatch.nl. We zullen de verwerking beperken terwijl uw verzoek wordt beoordeeld."
          },
          {
            title: "Recht van bezwaar (Artikel 21)",
            description: "U kunt bezwaar maken tegen bepaalde verwerkingsactiviteiten, zoals geautomatiseerde besluitvorming (matchingalgoritme). Neem contact op met privacy@domumatch.nl om dit recht uit te oefenen."
          },
          {
            title: "Recht om toestemming in te trekken (Artikel 7)",
            description: "U kunt toestemming voor niet-essentiële cookies en tracking op elk moment intrekken via het Cookie Voorkeurencentrum (toegankelijk via de cookiebanner of instellingen)."
          }
        ],
        dsarInstructions: "Om uw rechten uit te oefenen, kunt u: (1) De pagina Privacy Instellingen in uw account gebruiken, (2) E-mailen naar privacy@domumatch.nl met uw verzoek, of (3) Contact opnemen met onze Functionaris voor gegevensbescherming op dpo@domumatch.nl. Alle verzoeken worden binnen 30 dagen verwerkt zoals vereist door de AVG."
      },
      cookies: {
        title: "6. Cookies en trackingtechnologieën",
        description: "We gebruiken cookies en vergelijkbare trackingtechnologieën om informatie over uw gebruik van ons platform te verzamelen en op te slaan:",
        types: [
          {
            title: "Essentiële cookies",
            description: "Vereist voor het correct functioneren van het platform, zoals authenticatie en sessiebeheer."
          },
          {
            title: "Analytische cookies",
            description: "Helpen ons begrijpen hoe gebruikers met ons platform interacteren om onze diensten te verbeteren."
          },
          {
            title: "Voorkeurscookies",
            description: "Onthouden uw voorkeuren en instellingen voor een gepersonaliseerde ervaring."
          }
        ],
        management: "U kunt uw cookievoorkeuren beheren via uw browserinstellingen. Houd er rekening mee dat het uitschakelen van bepaalde cookies de platformfunctionaliteit kan beïnvloeden."
      },
      gdpr: {
        title: "7. AVG-naleving",
        description: "Als u zich in de Europese Economische Ruimte (EER) bevindt, heeft u aanvullende rechten onder de Algemene Verordening Gegevensbescherming (AVG):",
        rights: [
          "Recht op informatie over gegevensverwerking",
          "Recht van toegang tot uw persoonlijke gegevens",
          "Recht op rectificatie van onjuiste gegevens",
          "Recht op gegevenswissing ('recht om vergeten te worden')",
          "Recht op beperking van verwerking",
          "Recht op gegevensportabiliteit",
          "Recht van bezwaar tegen verwerking",
          "Rechten met betrekking tot geautomatiseerde besluitvorming"
        ],
        legalBasis: "We verwerken uw persoonlijke gegevens op basis van de volgende wettelijke grondslagen:",
        bases: [
          "Toestemming: Wanneer u uitdrukkelijke toestemming verleent voor gegevensverwerking",
          "Contract: Om ons contract met u uit te voeren (verlenen van matchingdiensten)",
          "Wettelijke verplichting: Om te voldoen aan wettelijke vereisten",
          "Gerechtvaardigde belangen: Om onze diensten te verbeteren en platforms veiligheid te waarborgen"
        ]
      },
      dataRetention: {
        title: "8. Gegevensbewaring",
        description: "We bewaren uw persoonlijke informatie zolang als nodig is om de doeleinden uiteengezet in dit Privacybeleid te vervullen, in overeenstemming met de AVG en Nederlandse wet:",
        periods: [
          "Accountgegevens: Bewaard zolang uw account actief is, geanonimiseerd na 2 jaar inactiviteit",
          "Verificatiedocumenten: Bewaard voor 4 weken na verificatie (Nederlandse wet vereiste - UAVG), daarna verwijderd",
          "Chatberichten: Bewaard voor 1 jaar na laatste bericht in chat, daarna verwijderd",
          "Match suggesties: Bewaard voor 90 dagen na vervaldatum, daarna verwijderd",
          "Rapporten: Bewaard voor 1 jaar na afhandeling, daarna verwijderd",
          "Applicatielogs: Bewaard voor 90 dagen, daarna verwijderd",
          "Analytische gegevens: Bewaard in geanonimiseerde vorm tot 2 jaar"
        ],
        deletion: "U kunt op elk moment verwijdering van uw account en gegevens aanvragen via uw Privacy Instellingen of door contact op te nemen met privacy@domumatch.nl. We zullen uw verzoek binnen 30 dagen verwerken (AVG vereiste), onder voorbehoud van wettelijke bewaarvereisten (bijv. verificatiedocumenten: 4 weken volgens Nederlandse wet)."
      },
      children: {
        title: "9. Privacy van kinderen",
        description: "Ons platform is bedoeld voor studenten van 17 jaar en ouder. We verzamelen niet opzettelijk persoonlijke informatie van kinderen onder de 17. Als u denkt dat we informatie hebben verzameld van een kind onder de 17, neem dan onmiddellijk contact met ons op."
      },
      changes: {
        title: "10. Wijzigingen in dit Privacybeleid",
        description: "We kunnen dit Privacybeleid van tijd tot tijd bijwerken. We zullen u op de hoogte stellen van belangrijke wijzigingen door het nieuwe Privacybeleid op deze pagina te plaatsen en de datum 'Laatst bijgewerkt' bij te werken. We moedigen u aan dit Privacybeleid periodiek te bekijken."
      },
      informationSharing: {
        title: "3. Informatiedeling en openbaarmaking",
        description: "We verkopen uw persoonlijke informatie niet. We kunnen uw informatie delen in de volgende omstandigheden:",
        sharing: [
          {
            title: "Met uw universiteit",
            description: "We kunnen informatie delen met uw universiteitshuisvestingsafdeling voor verificatiedoeleinden en om ondersteuningsdiensten te verlenen."
          },
          {
            title: "Met potentiële matches",
            description: "We delen uw profielinformatie (exclusief gevoelige gegevens zoals ID-documenten) met compatibele studenten om huisgenootmatching te vergemakkelijken."
          },
          {
            title: "Met dienstverleners",
            description: "We kunnen informatie delen met externe dienstverleners die helpen bij platformoperaties. Alle verwerkers hebben ondertekende gegevensverwerkingsovereenkomsten (DPA's) en voldoen aan AVG-vereisten. Zie onze sectie Verwerkers van derden hieronder voor details."
          },
          {
            title: "Voor wettelijke naleving",
            description: "We kunnen informatie openbaar maken wanneer dit wordt vereist door de wet, gerechtelijk bevel of overheidsautoriteit, of om onze rechten en veiligheid te beschermen."
          },
          {
            title: "Met uw toestemming",
            description: "We kunnen informatie delen met uw uitdrukkelijke toestemming of op uw aanwijzing."
          }
        ]
      },
      thirdPartyProcessors: {
        title: "11. Verwerkers van derden",
        description: "We gebruiken de volgende externe dienstverleners om ons platform te exploiteren. Alle verwerkers hebben ondertekende gegevensverwerkingsovereenkomsten (DPA's) en voldoen aan AVG-vereisten:",
        processors: [
          {
            name: "Supabase",
            purpose: "Database, authenticatie, hosting, opslag",
            location: "EU (primair), VS (backup)",
            dpa: "Standaard contractuele bepalingen (SCC's)"
          },
          {
            name: "Sentry",
            purpose: "Foutopsporing, sessieherhaling (met uw toestemming)",
            location: "VS, EU",
            dpa: "Standaard contractuele bepalingen (SCC's)"
          },
          {
            name: "Vercel",
            purpose: "Hosting, analyses (met uw toestemming)",
            location: "VS, EU",
            dpa: "Standaard contractuele bepalingen (SCC's)"
          },
          {
            name: "Persona/Veriff/Onfido",
            purpose: "Identiteitsverificatie (KYC)",
            location: "VS, EU",
            dpa: "Ondertekende DPA's"
          },
          {
            name: "E-mailproviders",
            purpose: "Transactionele e-mails, meldingen",
            location: "VS, EU",
            dpa: "Standaard contractuele bepalingen (SCC's)"
          }
        ],
        note: "Voor gedetailleerde informatie over onze verwerkers, DPA's en overdrachtsmechanismen, zie onze documentatie over verwerkers van derden. U kunt informatie over verwerkers aanvragen door contact op te nemen met privacy@domumatch.nl."
      },
      contact: {
        title: "12. Neem contact met ons op",
        description: "Als u vragen, zorgen of verzoeken heeft met betrekking tot dit Privacybeleid of onze gegevenspraktijken, neem dan contact met ons op:",
        email: "E-mail: privacy@domumatch.nl",
        dpo: "Functionaris voor gegevensbescherming: dpo@domumatch.nl",
        dsar: "DSAR Verzoeken: Gebruik Privacy Instellingen in uw account of e-mail privacy@domumatch.nl",
        note: "Voor verzoeken tot toegang tot persoonsgegevens (DSAR) kunt u ook de pagina Privacy Instellingen in uw account gebruiken om gegevensexport of accountverwijdering aan te vragen."
      }
    }
  }
}

export default function PrivacyPage() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Section className="bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-brand-text mb-4">{t.title}</h1>
              <p className="text-brand-muted mb-8">
                {t.lastUpdated}: {new Date().toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US')}
              </p>
              
              <p className="text-brand-muted mb-12 leading-relaxed">
                {t.introduction}
              </p>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.informationWeCollect.title}</h2>
                <p className="text-brand-muted mb-6">{t.sections.informationWeCollect.description}</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.sections.informationWeCollect.types.account.title}</h3>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.sections.informationWeCollect.types.account.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.sections.informationWeCollect.types.profile.title}</h3>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.sections.informationWeCollect.types.profile.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.sections.informationWeCollect.types.verification.title}</h3>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.sections.informationWeCollect.types.verification.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.sections.informationWeCollect.types.communication.title}</h3>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.sections.informationWeCollect.types.communication.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3">{t.sections.informationWeCollect.types.usage.title}</h3>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {t.sections.informationWeCollect.types.usage.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.howWeUse.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.howWeUse.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.sections.howWeUse.uses.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.informationSharing.title}</h2>
                <p className="text-brand-muted mb-6">{t.sections.informationSharing.description}</p>
                <div className="space-y-4">
                  {t.sections.informationSharing.sharing.map((share, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-brand-text mb-2">{share.title}</h3>
                      <p className="text-brand-muted">{share.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.dataSecurity.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.dataSecurity.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.dataSecurity.measures.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
                <p className="text-brand-muted italic">{t.sections.dataSecurity.note}</p>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.yourRights.title}</h2>
                <p className="text-brand-muted mb-6">{t.sections.yourRights.description}</p>
                <div className="space-y-4">
                  {t.sections.yourRights.rights.map((right, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-brand-text mb-2">{right.title}</h3>
                      <p className="text-brand-muted">{right.description}</p>
                    </div>
                  ))}
                </div>
                {t.sections.yourRights.dsarInstructions && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>How to Exercise Your Rights:</strong> {t.sections.yourRights.dsarInstructions}
                    </p>
                  </div>
                )}
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.cookies.title}</h2>
                <p className="text-brand-muted mb-6">{t.sections.cookies.description}</p>
                <div className="space-y-4 mb-4">
                  {t.sections.cookies.types.map((type, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-brand-text mb-2">{type.title}</h3>
                      <p className="text-brand-muted">{type.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-brand-muted">{t.sections.cookies.management}</p>
              </section>

              {/* GDPR */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.gdpr.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.gdpr.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-6">
                  {t.sections.gdpr.rights.map((right, index) => (
                    <li key={index}>{right}</li>
                  ))}
                </ul>
                <p className="text-brand-muted mb-4">{t.sections.gdpr.legalBasis}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.sections.gdpr.bases.map((basis, index) => (
                    <li key={index}>{basis}</li>
                  ))}
                </ul>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.dataRetention.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.dataRetention.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.dataRetention.periods.map((period, index) => (
                    <li key={index}>{period}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.dataRetention.deletion}</p>
              </section>

              {/* Children */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.children.title}</h2>
                <p className="text-brand-muted">{t.sections.children.description}</p>
              </section>

              {/* Changes */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.changes.title}</h2>
                <p className="text-brand-muted">{t.sections.changes.description}</p>
              </section>

              {/* Third-Party Processors */}
              {t.sections.thirdPartyProcessors && (
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.thirdPartyProcessors.title}</h2>
                  <p className="text-brand-muted mb-6">{t.sections.thirdPartyProcessors.description}</p>
                  <div className="space-y-4">
                    {t.sections.thirdPartyProcessors.processors.map((processor: any, index: number) => (
                      <div key={index} className="border-l-4 border-brand-600 pl-4 py-2">
                        <h3 className="font-semibold text-brand-text mb-1">{processor.name}</h3>
                        <p className="text-sm text-brand-muted mb-1">{processor.purpose}</p>
                        <p className="text-xs text-brand-muted">
                          <strong>Location:</strong> {processor.location} | <strong>DPA:</strong> {processor.dpa}
                        </p>
                      </div>
                    ))}
                  </div>
                  {t.sections.thirdPartyProcessors.note && (
                    <p className="text-brand-muted mt-4 text-sm italic">{t.sections.thirdPartyProcessors.note}</p>
                  )}
                </section>
              )}

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.contact.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.contact.description}</p>
                <p className="text-brand-muted mb-2">{t.sections.contact.email}</p>
                {t.sections.contact.dpo && <p className="text-brand-muted mb-2">{t.sections.contact.dpo}</p>}
                {t.sections.contact.dsar && <p className="text-brand-muted mb-2">{t.sections.contact.dsar}</p>}
                {t.sections.contact.note && <p className="text-brand-muted text-sm italic mt-4">{t.sections.contact.note}</p>}
              </section>
            </div>
          </Container>
        </Section>
      </div>
      <Footer />
    </main>
  )
}
