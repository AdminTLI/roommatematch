'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

type SectionItem = {
  id: string
  title: string
  description?: string
  quote?: string
  table?: {
    headers?: [string, string]
    rows: { left: string; right: string }[]
  }
  bullets?: string[]
  note?: string
}

const LAST_UPDATED = 'March 2026'

const content: Record<
  'en' | 'nl',
  {
    title: string
    lastUpdatedLabel: string
    lastUpdatedValue: string
    preamble: string
    languageNote: string
    sections: SectionItem[]
  }
> = {
  en: {
    title: 'Terms of Service',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: LAST_UPDATED,
    preamble:
      'These Terms of Service govern your use of Domu Match.',
    languageNote:
      'English is the primary language. If a Dutch translation is provided, the Dutch version will prevail in case of conflict.',
    sections: [
      {
        id: 'tldr',
        title: '0. TL;DR — Summary (not legally binding)',
        description:
          'This is a friendly overview. The numbered sections below are the legally binding terms.',
        table: {
          headers: ['Topic', 'Short Answer'],
          rows: [
            {
              left: 'What is Domu Match?',
              right: 'A roommate-matching platform for students (17+) and young professionals in the Netherlands.',
            },
            {
              left: 'Is this a finished product?',
              right:
                'No. Domu Match is in public beta. Features may be unstable, data may be reset, and the service may change frequently.',
            },
            {
              left: 'Who can use it?',
              right:
                'Students (17+) and young professionals who complete mandatory identity verification via Persona.',
            },
            {
              left: 'Is it free?',
              right:
                'Yes, for users during the beta. Domu Match is currently funded by the co-founders, and universities may subsidise student access in the future.',
            },
            {
              left: 'Can I share what I see?',
              right:
                'Please do not. Beta features are confidential (see Section 3).',
            },
            {
              left: 'What if I find a bug?',
              right:
                'Please report it. Bug reports are welcome and covered by Section 3.',
            },
            {
              left: 'Can I rely on matches?',
              right:
                'No. Scores are guidance only and you make the final decision. Domu Match is not a party to any tenancy.',
            },
            {
              left: 'What about my data?',
              right:
                'See the Privacy Policy at domumatch.com/privacy, including the beta-specific section.',
            },
          ],
        },
      },
      {
        id: 'service-scope',
        title: '1. About Domu Match and Service Scope',
        description:
          'Domu Match is a science-backed roommate matching platform for students and young professionals, operated from the Netherlands by DMS Enterprise.',
        bullets: [
          'Purpose: help users find lifestyle-compatible roommates using Harmony and Context scores.',
          'Status: Domu Match is not a landlord, rental agency, housing provider, or law firm.',
          'Tools: the WWS rent calculator and document templates are informational only (see Section 8).',
          'Legal form: Domu Match is a handelsnaam of DMS Enterprise (eenmanszaak), KvK 97573337.',
        ],
      },
      {
        id: 'eligibility',
        title: '2. Eligibility',
        bullets: [
          'You must be at least 17 years old.',
          'You must accurately represent your life stage: student (university, hogeschool, MBO, or similar) or young professional.',
          'Students and young professionals are matched within their own separate pools.',
          'Proof of life stage may be requested. Misrepresentation is a material breach and grounds for immediate termination.',
          'Using Domu Match outside the Netherlands: you remain responsible for compliance with local law.',
        ],
      },
      {
        id: 'beta',
        title: '3. Beta Program Terms',
        description:
          'This section applies specifically to the public beta period and supersedes or supplements the standard service terms where indicated.',
      },
      {
        id: 'beta-nature',
        title: '3.1 Nature of the Beta',
        bullets: [
          'The beta is a pre-release version of Domu Match. It is provided “as-is” for testing and feedback purposes.',
          'Features, interfaces, and matching logic may change without notice during the beta.',
          'The service may experience outages, data resets, or be discontinued at any time.',
          'Domu Match makes no guarantees about the availability, reliability, or accuracy of any beta feature.',
        ],
      },
      {
        id: 'beta-data',
        title: '3.2 Beta Data and What Happens at the End',
        table: {
          headers: ['Scenario', 'What happens'],
          rows: [
            {
              left: 'Beta ends, product launches',
              right: 'Profile and account data carries over. Beta-specific logs deleted within 90 days.',
            },
            {
              left: 'Beta discontinued (no launch)',
              right: 'Minimum 30 days’ notice. Data export available. All data deleted/anonymized within 60 days.',
            },
            {
              left: 'In-beta data reset',
              right: 'Minimum 7 days’ in-app notice where possible. Matches and scores may be wiped for technical reasons.',
            },
          ],
        },
      },
      {
        id: 'beta-feedback',
        title: '3.3 Feedback License',
        description:
          'By submitting bug reports, suggestions, usability feedback, or other input through the platform or any feedback channels (including email, forms, surveys, or private group chats), you grant DMS Enterprise a perpetual, irrevocable, royalty-free, worldwide license to use, adapt, and incorporate that feedback into our products and services, without any obligation to compensate you.',
        note:
          'This does not affect your ownership of any other content you post on the platform (profiles, chat messages).',
      },
      {
        id: 'beta-confidentiality',
        title: '3.4 Confidentiality Request',
        description:
          'The beta contains unreleased features, design concepts, and matching logic that are not yet public. We ask that you:',
        bullets: [
          'Refrain from publicly sharing screenshots, recordings, or detailed descriptions of beta features.',
          'Do not share your beta invite link with third parties unless we have explicitly said you may.',
          'Let us know if you accidentally disclose anything — we won’t hold it against you.',
        ],
        note:
          'This is a courtesy request, not a binding NDA. We appreciate your discretion.',
      },
      {
        id: 'beta-bugs',
        title: '3.5 Bug Reporting',
        description:
          'If you encounter bugs or unexpected behaviour, please report them via the in-app feedback tool, a private group chat (where applicable), or at domumatch@gmail.com. Responsible disclosure of any security issues to domumatch@gmail.com is greatly appreciated and is handled with priority.',
      },
      {
        id: 'beta-termination-notice',
        title: '3.6 Beta Termination Notice',
        description:
          'If we decide to end the beta, we will give you at least 30 days’ notice by email and/or in-app notification. For urgent technical or legal reasons, this period may be shorter; we will explain why.',
      },
      {
        id: 'account',
        title: '4. Account Registration and Accuracy',
        bullets: [
          'Provide accurate, current information and keep it updated.',
          'Do not share your account credentials; you are responsible for all activity on your account.',
          'Notify us promptly at domumatch@gmail.com if you suspect unauthorised access.',
          'One account per person. Duplicate or impersonation accounts will be terminated.',
        ],
      },
      {
        id: 'verification',
        title: '5. Mandatory Identity Verification (Persona)',
        bullets: [
          'ID verification is mandatory. We use Persona to review documents and perform liveness checks.',
          'Domu Match does not store raw ID images or biometric templates; we receive only the verification outcome and limited attributes.',
          'Verification may include government ID, selfie/video, and (for students) proof of student status.',
          'Refusing or failing verification may limit features or lead to suspension.',
          'No ghost, AI-generated, or borrowed identities — using AI faces or another person’s documents is a material breach.',
        ],
      },
      {
        id: 'matching',
        title: '6. The Matching Algorithm',
        bullets: [
          'Inputs: questionnaire answers, Harmony and Context scores, location/budget filters, recency, safety signals.',
          'Harmony (Lifestyle) and Context (academic/practical) scores are used to find compatibility. These scores may change during the beta.',
          'Scores and recommendations are guidance only. Human judgment remains essential.',
          'Active choice: you always decide who to contact, meet, or live with. No automated system binds you to a contract.',
          'Domu Match is not a party to any tenancy, sublease, or co-living arrangement and is not liable for disputes between users.',
        ],
      },
      {
        id: 'ugc',
        title: '7. User-Generated Content',
        bullets: [
          'Content must be lawful, honest, and must not infringe others’ rights (privacy, copyright, portrait rights).',
          'Profile photos must reasonably represent you. No AI-generated faces or heavily misleading edits.',
          'No pornographic, sexually explicit, hate-symbol, or extremist content.',
          'Chat must remain respectful and relevant to shared living. No threats, harassment, spam, phishing, or pressure to share financial data.',
          'We may use automated tools and human review to detect high-risk patterns in line with the DSA.',
        ],
      },
      {
        id: 'wws',
        title: '8. WWS Calculator and Legal Templates (Informational Only)',
        description: 'These tools are educational and informational only.',
        quote:
          'Important: Domu Match is not a law firm. Always validate rent points and contract terms with the Huurcommissie or qualified counsel.',
        bullets: [
          'Rules can change; outcomes depend on your specific circumstances.',
          'Do not rely solely on our tools for legal or financial decisions.',
        ],
      },
      {
        id: 'acceptable-use',
        title: '9. Acceptable Use and Prohibited Conduct',
        bullets: [
          'No fake profiles, impersonation, or misrepresentation of age or life stage.',
          'No scraping, data harvesting, automated access, or building competitive datasets from platform data.',
          'No harassment, stalking, discrimination, hate speech, threats, or abusive conduct.',
          'No illegal content, malware, fraud, or attempts to bypass/probe security systems.',
          'No scams (fake housing offers, deposit scams) or use of Domu Match as a dating/escort/MLM platform.',
          'Personal, non-commercial use only. No marketing or soliciting without written consent.',
        ],
      },
      {
        id: 'fees',
        title: '10. Pricing and Payment',
        bullets: [
          'Students and young professionals: access is free.',
          'Universities/partners: funded via institutional licensing under separate agreements.',
          'Beta access is free and does not create any commitment to paid tiers at launch.',
        ],
      },
      {
        id: 'liability',
        title: '11. Limitation of Liability',
        bullets: [
          'Mandatory rights: Nothing limits liability where Dutch/EU law does not allow it (e.g., intent/gross negligence, fraud, non-excludable consumer rights).',
          'Roommate and housing risks: Domu Match is not liable for personal injury, property damage, financial loss, or disputes from roommate matches or housing arrangements, except where liability cannot be limited by law.',
          'Beta disclaimer: during the beta, the service is provided “as-is”. We make no warranties about uninterrupted access or accuracy of matching scores.',
          'Third parties: we are not responsible for the actions of roommates, landlords, universities, or other third parties.',
          'Cap: total aggregate liability is capped at €100 or the amount received from your institution for your use in the past 12 months, whichever is higher, unless mandatory law requires more.',
        ],
      },
      {
        id: 'termination',
        title: '12. Suspension and Termination',
        bullets: [
          'We may suspend, restrict, or terminate accounts for safety risks, policy breaches, false identity or life stage, failed/refused verification, fraud, or legal/authority requirements.',
          'Content may be removed if reasonably believed illegal or in violation of these terms.',
          'Where required and feasible, we will notify you of significant enforcement actions and provide an appeal route.',
          'You may delete your account at any time via Settings. Data deletion follows the Privacy Policy timelines.',
        ],
      },
      {
        id: 'changes',
        title: '13. Changes to These Terms',
        bullets: [
          'Significant changes: at least 15 days’ advance notice by email and/or in-app notification.',
          'If you disagree with updates, stop using Domu Match and request account deletion. Continued use after the effective date means acceptance.',
        ],
      },
      {
        id: 'law',
        title: '14. Governing Law and Disputes',
        bullets: [
          'Dutch law governs, subject to mandatory consumer protections in your EU/EEA country of residence.',
          'Disputes go to the competent courts of the Netherlands. EU/EEA consumers may bring claims in their home forum where mandatory law allows.',
          'Please contact us first at domumatch@gmail.com to try informal resolution.',
        ],
      },
      {
        id: 'dsa',
        title: '15. DSA Notice and Reporting',
        bullets: [
          'Report illegal content or abuse via in-app tools or email domumatch@gmail.com with details, links, or screenshots.',
          'We review notices diligently under the EU Digital Services Act and take proportionate action.',
        ],
      },
      {
        id: 'contact',
        title: '16. Contact and Legal Inquiries',
        bullets: [
          'Support and DSA notices: domumatch@gmail.com',
          'Privacy / DPO: domumatch@gmail.com',
          'Legal and AI/DSA inquiries: domumatch@gmail.com',
          'Beta feedback: domumatch@gmail.com or the in-app feedback tool',
          'Address: DMS Enterprise (handelend onder de naam Domu Match), Breda, The Netherlands · KvK 97573337',
        ],
      },
    ],
  },
  nl: {
    title: 'Algemene Voorwaarden',
    lastUpdatedLabel: 'Laatst bijgewerkt',
    lastUpdatedValue: LAST_UPDATED,
    preamble:
      'Deze Algemene Voorwaarden (inclusief ons Acceptable Use-beleid en huisregels) gelden voor je gebruik van Domu Match. Door een account aan te maken of het platform te gebruiken, ga je hiermee akkoord. Gebruik het platform niet als je het hiermee oneens bent.',
    languageNote:
      'Engels is primair. Als er een Nederlandse vertaling beschikbaar is, gaat de Nederlandse tekst voor bij verschil.',
    sections: [
      {
        id: 'tldr',
        title: '0. Samenvatting (niet juridisch bindend)',
        description:
          'Dit is een vriendelijke samenvatting van de belangrijkste punten. Alleen de uitgebreide tekst hieronder is juridisch bindend.',
        bullets: [
          'Domu Match helpt studenten (17+) en young professionals compatibele huisgenoten te vinden. Studenten en young professionals worden in aparte pools gematcht. Harmony- en Context-scores en WWS-calculator ondersteunen je keuze.',
          'Je moet minimaal 17 jaar zijn, je levensfase (student of young professional) correct weergeven en verplichte Persona-ID-verificatie doorlopen. Geen nep-, ghost- of AI-gegenereerde profielen.',
          'De matchinglogica weegt Harmony (~75%) en Context (~25%) voor suggesties, maar jij maakt altijd zelf de uiteindelijke keuze met wie je chat of gaat samenwonen.',
          'Je bent zelf verantwoordelijk voor wat je plaatst (profiel, foto’s, chat). Geen discriminatie, intimidatie, scams of commercieel gebruik.',
          'De WWS-calculator is bedoeld ter informatie/empowerment en is geen juridisch advies of besluit van de Huurcommissie.',
          'Domu Match kan offline gedrag of je fysieke veiligheid niet garanderen. Conflicten en contracten zijn in de eerste plaats tussen jou, je huisgenoten en je verhuurder.',
        ],
      },
      {
        id: 'service-scope',
        title: '1. Over Domu Match & dienst',
        description:
          'Domu Match is een wetenschappelijk onderbouwd matchingplatform voor studenten en young professionals, vanuit Nederland.',
        bullets: [
          'Doel: studenten en young professionals helpen compatibele huisgenoten te vinden via Harmony- en Context-scores. Elke groep wordt binnen een eigen pool gematcht.',
          'Status: Domu Match is geen verhuurder, makelaar, woningaanbieder of advocatenkantoor.',
          'Verdienmodel: studenten en young professionals gebruiken het gratis; financiering loopt via licenties met onderwijsinstellingen.',
          'Informatieve tools: WWS-calculator en templates zijn puur ter informatie (zie paragraaf 6).',
          'Rechtsvorm: Domu Match is een handelsnaam van DMS Enterprise (eenmanszaak), KvK 97573337.',
        ],
      },
      {
        id: 'eligibility',
        title: '2. Toegang (studenten en young professionals)',
        description: 'Domu Match is voor studenten (17+) en young professionals. Elke groep wordt alleen met dezelfde groep gematcht.',
        bullets: [
          'Je bent minimaal 17 jaar.',
          'Je geeft je levensfase correct weer: actuele student (bijv. universiteit, hogeschool, MBO) of young professional. Bewijs kan worden gevraagd. Foutieve weergave is een materiële schending (zie Beta-voorwaarden).',
          'Gebruik buiten Nederland: je blijft zelf verantwoordelijk voor lokaal recht.',
        ],
      },
      {
        id: 'account',
        title: '3. Account & juistheid',
        bullets: [
          'Geef juiste en actuele gegevens door en houd ze bij.',
          'Deel je account of inloggegevens niet; jij bent verantwoordelijk voor gebruik van je account.',
          'Meld direct bij vermoeden van ongeautoriseerde toegang.',
        ],
      },
      {
        id: 'verification',
        title: '4. Verplichte ID- & verificatie (Persona)',
        description: 'Veiligheid vraagt betrouwbare identiteit.',
        bullets: [
          'ID-verificatie is verplicht. Domu Match gebruikt een derde partij (nu Persona) voor documentcontrole en liveness-checks.',
          'Domu Match bewaart geen ruwe ID-documenten of biometrische templates; we ontvangen alleen verificatieresultaten/attributen. Persona kan ruwe documenten bewaren als onze verwerker.',
          'Verificatie kan overheids-ID, selfie/video en (voor studenten) bewijs van studentstatus omvatten. Weigering of mislukking kan functies beperken of leiden tot opschorting/beëindiging.',
          'Gegevens worden verwerkt onder de AVG en ons Privacybeleid. Doel: leeftijd (17+), identiteit en (waar van toepassing) levensfase (student of young professional) bevestigen en koppelen aan je account.',
          'Geen ghost- of AI-profielen: je mag geen AI-gezichten, avatars of geleende identiteiten gebruiken om verificatie te doorstaan of misleidende accounts aan te maken.',
        ],
      },
      {
        id: 'matching',
        title: '5. Matchingparameters & geen garantie',
        bullets: [
          'Input: vragenlijsten, voorkeuren, Harmony-/Context-scores, activiteit-recency, locatie/budgetfilters en veiligheidsignalen (bijv. herhaalde meldingen).',
          'Weging: Harmony (lifestyle) weegt ongeveer 75% en Context (studie/praktische context) ongeveer 25% in de matchinglogica, met mogelijke aanpassingen naarmate de dienst verbetert.',
          'Gebruikerscontrole: waar beschikbaar kun je voorkeuren/filters aanpassen; de interface legt de invloed op aanbevelingen uit.',
          'Geen perfecte match: scores/aanbevelingen zijn hulpmiddel. Eigen beoordeling blijft essentieel.',
          'Geen aansprakelijkheid voor gedrag van huisgenoten; Domu Match is geen partij bij huur- of samenwoonafspraken.',
          'Actieve keuze: aanbevelingen zijn suggesties; je beslist altijd zelf met wie je contact legt, afspreekt of gaat samenwonen. Er is geen geautomatiseerde bindende beslissing.',
        ],
      },
      {
        id: 'ugc',
        title: '6. Door gebruikers gegenereerde content (profiel, foto’s & chat)',
        description:
          'Je bent zelf verantwoordelijk voor de inhoud die je op Domu Match plaatst, zoals profielinformatie, foto’s, kamerteksten en chatberichten.',
        bullets: [
          'Zorg dat je content rechtmatig, eerlijk en niet-misleidend is en de rechten van anderen (privacy, auteursrecht, portretrecht) respecteert.',
          'Profielfoto’s moeten jou redelijk weergeven; gebruik geen AI-gegenereerde gezichten of zwaar bewerkte beelden die anderen misleiden over je identiteit.',
          'Je mag geen pornografische, seksueel expliciete of uitbuitende beelden uploaden en geen afbeeldingen met haatsymbolen of extremistische content.',
          'Chat dient respectvol en relevant te blijven voor samenwonen. Geen bedreigingen, pesten, haatzaaien, spam, phishing-links of druk om overmatige persoonlijke/financiële gegevens te delen.',
          'We kunnen geautomatiseerde tools en menselijke beoordeling inzetten om bepaalde risicopatronen (bijv. spam, evidente illegale content) te detecteren, in lijn met de DSA en privacywetgeving.',
        ],
      },
      {
        id: 'wws',
        title: '7. WWS-calculator & templates (informatief)',
        description: 'Deze tools zijn puur informatief.',
        quote:
          'Domu Match is not a law firm or a rental agency. Users must verify all calculations with the Huurcommissie.',
        bullets: [
          'Regels kunnen wijzigen; uitkomsten hangen af van jouw situatie. Vertrouw niet alleen op onze tools.',
          'Controleer huurpunten, bedragen en contractvoorwaarden altijd bij de Huurcommissie of een deskundige.',
          'De WWS-calculator is geen formeel besluit of advies van de Huurcommissie of een andere autoriteit en vervangt geen onafhankelijk juridisch advies.',
        ],
      },
      {
        id: 'acceptable-use',
        title: '8. Toegestaan gebruik & verboden gedrag',
        bullets: [
          'Geen nep-profielen, geen valse leeftijd of levensfase (student/young professional), geen gebruik van andermans documenten.',
          'Geen scrapen, data-harvesting, geautomatiseerde toegang of commercieel gebruik van gebruikersdata; geen datasets/modellen bouwen uit platformdata.',
          'Geen intimidatie, stalking, discriminatie, haatzaaien, bedreigingen of misbruik op of buiten het platform in verband met Domu Match.',
          'Geen discriminatie op grond van beschermde kenmerken zoals geslacht, genderidentiteit/-expressie, seksuele oriëntatie, ras, etniciteit, nationaliteit, religie/levensovertuiging, handicap of leeftijd, in lijn met Nederlandse discriminatiewetgeving.',
          'Geen illegale content, malware, fraude of pogingen om beveiliging te omzeilen, systemen te testen of de dienst te verstoren.',
          'Geen scams of misleidende constructies (zoals valse woningaanbiedingen, borgscams of gebruik van Domu Match primair als dating-, escort- of MLM/marketingplatform).',
          'Alleen persoonlijk, niet-commercieel gebruik. Geen marketing of acquisitie zonder schriftelijke toestemming.',
        ],
      },
      {
        id: 'fees',
        title: '9. Prijzen & betaling',
        bullets: [
          'Studenten en young professionals: gebruik is gratis.',
          'Onderwijsinstellingen/partners: financiering via institutionele licenties (afzonderlijke afspraken).',
        ],
      },
      {
        id: 'liability',
        title: '10. Aansprakelijkheidsbeperking',
        bullets: [
          'Verplichte rechten: niets beperkt aansprakelijkheid waar dat wettelijk niet mag (bijv. overlijden/letsel door opzet of grove schuld, fraude, of niet-uitsluitbare consumentenrechten).',
          'Risico’s bij matches en wonen: Domu Match is niet aansprakelijk voor letsel, schade, financiële schade of geschillen door matches, ontmoetingen of woon-/huurovereenkomsten, behalve waar beperking niet is toegestaan.',
          'Derden: gedrag van huisgenoten, verhuurders, instellingen of anderen sturen wij niet; wij zijn niet verantwoordelijk voor hun handelingen of panden.',
          'Dienstcontinuïteit: geen garantie op ononderbroken of foutloze dienst; onderhoud/veiligheidsdowntime kan voorkomen.',
          'Plafond: totale aansprakelijkheid maximaal €100 of het bedrag (indien van toepassing) dat van jouw instelling is ontvangen voor jouw gebruik in de laatste 12 maanden, het hoogste van beide, tenzij dwingend recht anders vereist.',
        ],
      },
      {
        id: 'termination',
        title: '11. Opschorting & beëindiging',
        bullets: [
          'We kunnen accounts beperken/opschorten/beëindigen bij veiligheidsrisico’s, beleidschending, valse identiteit of levensfase (student/young professional), mislukte/weigering van verificatie, fraude of wettelijke/autoritaire vereisten.',
          'Content kan worden verwijderd/beperkt bij vermoeden van illegaliteit of schending van deze voorwaarden.',
          'Waar vereist en haalbaar informeren wij bij belangrijke maatregelen en bieden we een bezwaar/beroepmogelijkheid.',
        ],
      },
      {
        id: 'founder-liability',
        title: '12. Aansprakelijkheid oprichters & rechtsvorm',
        bullets: [
          'Domu Match kan opereren als VOF, BV of andere Nederlandse rechtsvorm; de actuele rechtsvorm en registratiedetails worden vermeld in onze imprint/juridische informatie.',
          'Domu Match biedt een digitaal platform en tools. Relaties tussen huisgenoten, huurovereenkomsten en interne conflicten zijn in de eerste plaats zaken tussen jou, je huisgenoten en je verhuurder.',
          'De persoonlijke aansprakelijkheid van oprichters, aandeelhouders en bestuurders is beperkt volgens de toepasselijke rechtsvorm en dwingend Nederlands recht.',
          'Niets in deze voorwaarden sluit aansprakelijkheid uit die volgens Nederlands/EU‑recht niet mag worden beperkt, waaronder bij opzet of grove schuld van Domu Match.',
        ],
      },
      {
        id: 'changes',
        title: '13. Wijzigingen',
        bullets: [
          'Belangrijke wijzigingen: minimaal 15 dagen vooraf aankondigen (bijv. e-mail of in-app), tenzij korter wettelijk of om dringende veiligheids-/juridische redenen nodig is.',
          'Ben je het niet eens, stop met gebruik en vraag verwijdering. Doorgaan na ingangsdatum betekent acceptatie.',
        ],
      },
      {
        id: 'law',
        title: '14. Recht en geschillen',
        bullets: [
          'Nederlands recht geldt, met inachtneming van dwingende consumentenbescherming in jouw EU/EER-land.',
          'Geschillen naar de bevoegde Nederlandse rechter; EU/EER-consumenten kunnen in hun eigen forum procederen waar dwingend recht dat toestaat.',
          'Neem eerst contact op via domumatch@gmail.com voor een informele oplossing.',
        ],
      },
      {
        id: 'dsa',
        title: '15. DSA-meldingen & rapportage',
        bullets: [
          'Meld illegale content/misbruik via in-app tools (indien beschikbaar) of e-mail domumatch@gmail.com met details/links/screenshots.',
          'We beoordelen meldingen zorgvuldig en handelen volgens de EU Digital Services Act en Nederlands recht, inclusief het bevestigen van bepaalde meldingen, een redelijke beoordelingstermijn en proportionele maatregelen.',
          'Maatregelen kunnen zijn: geen actie, verwijdering/beperking van content, functielimieten, tijdelijke opschorting of beëindiging van accounts. Waar vereist geven we een korte motivering en een bezwaar-/beroepsmogelijkheid.',
        ],
      },
      {
        id: 'contact',
        title: '16. Contact & juridische vragen',
        bullets: [
          'Support en DSA-meldingen: domumatch@gmail.com',
          'Adres: DMS Enterprise (handelend onder de naam Domu Match), Breda, Nederland · KvK 97573337',
          'Juridische en AI/DSA-vragen: domumatch@gmail.com',
          'Als er een Nederlandse vertaling is, gaat die voor bij verschillen met de Engelse tekst.',
        ],
      },
    ],
  },
}

export default function TermsPage() {
  const { locale } = useApp()
  const t = content[locale] ?? content.en

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">{t.title}</h1>
              <p className="text-slate-600 mb-2">
                {t.lastUpdatedLabel}: {t.lastUpdatedValue}
              </p>

              <div className="mb-10 mt-6 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
                <p className="text-amber-900 font-semibold mb-1">Beta Notice</p>
                <p className="text-amber-900/90 leading-relaxed">
                  You are using a pre-release (beta) version of Domu Match. This means features may change, data
                  may be reset, and additional data collection (such as bug reports and session logs) may be done
                  to help us improve the product. This policy explains all of that clearly below.
                </p>
              </div>

              <p className="text-slate-700 mb-4">{t.languageNote}</p>
              <p className="text-slate-700 mb-10 leading-relaxed">
                {t.preamble}
              </p>

              {t.sections.map((section) => (
                <section key={section.id} className="mb-10">
                  <h2 className="text-2xl font-semibold text-slate-900 mt-6 mb-3">{section.title}</h2>
                  {section.description && (
                    <p className="text-slate-700 mb-3">{section.description}</p>
                  )}
                  {section.quote && (
                    <div className="border-l-4 border-slate-900 bg-white/60 px-4 py-3 mb-3 text-slate-800 rounded-r">
                      {section.quote}
                    </div>
                  )}
                  {section.table && (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border border-slate-200 bg-white/60 rounded-lg overflow-hidden text-left">
                        {section.table.headers && (
                          <thead className="bg-slate-900 text-white">
                            <tr>
                              <th className="px-4 py-3 text-sm font-semibold">
                                {section.table.headers[0]}
                              </th>
                              <th className="px-4 py-3 text-sm font-semibold">
                                {section.table.headers[1]}
                              </th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="text-slate-700">
                          {section.table.rows.map((row, idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-white/40' : 'bg-transparent'}
                            >
                              <td className="px-4 py-3 align-top font-medium text-slate-900">
                                {row.left}
                              </td>
                              <td className="px-4 py-3 align-top">{row.right}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {section.bullets && (
                    <ul className="list-disc pl-6 space-y-2 text-slate-700">
                      {section.bullets.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.note && (
                    <p className="text-slate-700 mt-3">{section.note}</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
