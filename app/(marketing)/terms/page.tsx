'use client'

import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

type SectionItem = {
  id: string
  title: string
  description?: string
  quote?: string
  bullets?: string[]
  note?: string
}

const LAST_UPDATED = '6 January 2026'

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
    title: 'Terms and Conditions',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: LAST_UPDATED,
    preamble:
      'These Terms of Service (including our Acceptable Use Policy and Rules of Engagement) govern your use of Domu Match. By creating an account or using the platform you agree to them. If you do not agree, do not use Domu Match.',
    languageNote:
      'English is the primary language. If a Dutch translation is provided, the Dutch version will prevail in case of conflict.',
    sections: [
      {
        id: 'tldr',
        title: '0. TL;DR (not legally binding)',
        description:
          'This is a friendly summary of what matters most. It is not legally binding; the detailed sections below are.',
        bullets: [
          'Domu Match helps students (17+) find compatible roommates and understand their rent, using Harmony (lifestyle) and Context (academic) scores plus a WWS calculator.',
          'You must be at least 17, be (and remain) a student, and complete mandatory Persona ID verification. No fake, ghost, or AI-generated profiles.',
          'The matching algorithm weighs Harmony (~75%) and Context (~25%) to suggest matches, but you always make the final “Active Choice” about who you chat with or live with.',
          'You are responsible for what you post (profiles, photos, chat). No discrimination, harassment, scams, or use of Domu Match for non-student-housing or commercial purposes.',
          'The WWS calculator is for information and empowerment only and is not legal advice or a decision of the Huurcommissie.',
          'Domu Match cannot guarantee offline behaviour or your physical safety. Roommate disputes and housing contracts are mainly between you, your roommates, and your landlord.',
        ],
      },
      {
        id: 'service-scope',
        title: '1. About Domu Match & Service Scope',
        description:
          'Domu Match is a science-backed roommate matching platform for students operated from the Netherlands.',
        bullets: [
          'Purpose: help students find lifestyle-compatible roommates using Harmony and Context scores and other inputs.',
          'Status: Domu Match is not a landlord, rental agency, housing provider, or law firm.',
          'Revenue: Students use Domu Match for free; the platform is funded via university or institutional licence fees.',
          'Informational tools: WWS rent calculator and document templates are provided for guidance only (see Section 6).',
        ],
      },
      {
        id: 'eligibility',
        title: '2. Eligibility (17+ students only)',
        description: 'Domu Match is exclusively for students.',
        bullets: [
          'You must be at least 17 years old.',
          'You must be a current student (e.g., university, hogeschool, MBO, or other recognised institution). Proof may be requested.',
          'Using Domu Match outside the Netherlands: you remain responsible for compliance with local law.',
        ],
      },
      {
        id: 'account',
        title: '3. Account Registration & Accuracy',
        bullets: [
          'Provide accurate, current information and keep it updated.',
          'Do not share your account or credentials; you are responsible for all activity on your account.',
          'Notify us promptly if you suspect unauthorised access.',
        ],
      },
      {
        id: 'verification',
        title: '4. Mandatory Identity & Student Verification (Persona)',
        description: 'Safety depends on trusted identities.',
        bullets: [
          'ID verification is mandatory. Domu Match uses a third-party provider (currently Persona) to review documents and perform liveness checks.',
          'Domu Match does not store raw ID documents or biometric templates; we receive verification results/attributes only. Persona may store raw documents as our processor.',
          'Verification may include government ID, selfie/video checks, and proof of student status. Refusing or failing verification may limit features or lead to suspension/termination.',
          'Data is processed under the GDPR and our Privacy Policy. Core purpose: confirm age (17+), identity, and student status, and link verification to your account.',
          'No ghost or AI-generated profiles: you may not use AI faces, avatars, or borrowed identities to pass verification or create deceptive accounts.',
        ],
      },
      {
        id: 'matching',
        title: '5. Matching Algorithm, Parameters & No Guarantee',
        bullets: [
          'Inputs: questionnaire responses, lifestyle/preferences, Harmony and Context scores, recency of activity, location/budget filters, and safety signals (e.g., repeated reports).',
          'Weighting: Harmony (lifestyle) is weighted around 75% and Context (academic and practical context) around 25% in the matching logic, subject to iterative improvements.',
          'User control: where available, you can adjust preferences/filters; the interface explains how these affect recommendations.',
          'No perfect match: scores and recommendations are guidance only. Human judgment and your own due diligence remain essential.',
          'No responsibility for roommate behaviour: Domu Match is not a party to any tenancy, sublease, or co-living agreement and is not liable for conflicts between users.',
          'Active choice: recommendations are suggestions only. You always decide whom to contact, meet, or live with; no automated system binds you to a contract.',
        ],
      },
      {
        id: 'ugc',
        title: '6. User-Generated Content (profiles, photos & chat)',
        description:
          'You are responsible for the content you provide on Domu Match, including profiles, photos, room descriptions, and chat messages.',
        bullets: [
          'Ensure your content is lawful, honest, and does not infringe the rights of others (e.g., privacy, copyright, portrait rights).',
          'Profile photos should reasonably represent you; do not use AI-generated faces or heavily edited images that mislead others about your identity.',
          'You may not upload pornographic, sexually explicit, or sexually exploitative images, or images containing hate symbols or extremist content.',
          'Chat must remain respectful and relevant to student housing. No threats, bullying, hate speech, spam, phishing links, or pressure to share excessive personal or financial data.',
          'We may use automated tools and human review to detect certain high-risk patterns (e.g., spam, obvious illegal content) in line with the DSA and privacy laws.',
        ],
      },
      {
        id: 'wws',
        title: '7. WWS Calculator & Legal Templates (Informational Only)',
        description: 'These tools are informational and educational only.',
        quote:
          'Domu Match is not a law firm or a rental agency. Users must verify all calculations with the Huurcommissie.',
        bullets: [
          'Rules can change; outcomes depend on your specific facts. Do not rely solely on our tools.',
          'Always validate rent points, amounts, and contract terms with the Huurcommissie or qualified counsel before acting.',
          'The WWS calculator is not a formal decision or advice from the Huurcommissie or any authority and does not replace independent legal advice.',
        ],
      },
      {
        id: 'acceptable-use',
        title: '8. Acceptable Use & Prohibited Conduct',
        bullets: [
          'No fake profiles, impersonation, or misrepresenting age/student status; no use of another person’s documents.',
          'No scraping, harvesting, automated access, or commercial use of student data; do not build competitive datasets or models from platform data.',
          'No harassment, stalking, discrimination, hate speech, threats, or abusive conduct on or off platform when connected to Domu Match.',
          'No discrimination based on protected characteristics such as gender, sex, sexual orientation, gender identity or expression, race, ethnic origin, nationality, religion or belief, disability, or age, in line with Dutch non-discrimination law.',
          'No illegal content, malware, fraud, or attempts to bypass security, probe systems, or disrupt service integrity.',
          'No scams or misleading schemes (including fake housing offers, deposit scams, or using Domu Match primarily as a dating, escort, or MLM/marketing platform).',
          'Personal, non-commercial use only. Do not market, advertise, or solicit on Domu Match without written consent.',
        ],
      },
      {
        id: 'fees',
        title: '9. Pricing & Payment',
        bullets: [
          'Students: access is free.',
          'Universities/partners: platform funded via institutional licensing (separate agreements may apply).',
        ],
      },
      {
        id: 'liability',
        title: '10. Limitation of Liability',
        bullets: [
          'Mandatory rights: Nothing limits liability where this is not allowed under Dutch/EU law (e.g., death/personal injury by intent or gross negligence, fraud, or non-excludable consumer rights).',
          'Roommate and housing risks: Domu Match is not liable for personal injury, property damage, financial loss, or disputes arising from roommate matches, meetings, or housing/lease arrangements, except where liability cannot be limited by law.',
          'Third parties: We do not control roommates, landlords, universities, or other third parties and are not responsible for their actions or properties.',
          'Service continuity: We do not guarantee uninterrupted or error-free service. Maintenance/security downtime may occur.',
          'Cap: If liability arises despite the above, total aggregate liability is capped at €100 or the amount (if any) received from your institution specifically for your use in the past 12 months, whichever is higher, unless mandatory law requires more.',
        ],
      },
      {
        id: 'termination',
        title: '11. Suspension & Termination',
        bullets: [
          'We may suspend, restrict, or terminate accounts for safety risks, policy breaches, false identity/student status, failed/refused verification, fraud, or legal/authority requirements.',
          'Content may be removed or restricted if reasonably believed illegal or violating these Terms.',
          'Where required and feasible, we will notify you of significant enforcement actions and provide an appeal route.',
        ],
      },
      {
        id: 'founder-liability',
        title: '12. Founder Liability & Company Structure',
        bullets: [
          'Domu Match may operate as a VOF, BV, or other Dutch legal form; we will disclose the current legal form and registration details in our imprint/legal information.',
          'Domu Match provides a digital platform and tools only. Roommate relationships, rental contracts, and in-house disputes are primarily between you, your roommates, and your landlord.',
          'The personal liability of founders, shareholders, and directors is limited in accordance with the applicable legal form and mandatory Dutch law.',
          'Nothing in these Terms excludes liability that cannot be limited under Dutch/EU law, including where caused by intentional misconduct or gross negligence by Domu Match.',
        ],
      },
      {
        id: 'changes',
        title: '13. Changes to These Terms',
        bullets: [
          'Significant changes: at least 15 days’ advance notice (e.g., email or in-app), unless shorter notice is required by law or for urgent legal/safety reasons.',
          'If you disagree with updates, stop using Domu Match and request account deletion. Continued use after the effective date means acceptance.',
        ],
      },
      {
        id: 'law',
        title: '14. Governing Law & Disputes',
        bullets: [
          'Dutch law governs, subject to any mandatory consumer protections in your EU/EEA country of residence.',
          'Disputes go to the competent courts of the Netherlands. Consumers in the EU/EEA may bring claims in their home forum where mandatory law allows.',
          'Please contact us first at info@domumatch.com to try informal resolution.',
        ],
      },
      {
        id: 'dsa',
        title: '15. DSA Notice & Reporting',
        bullets: [
          'Report illegal content or abuse via in-app tools (where available) or email info@domumatch.com with details, links, or screenshots.',
          'We review notices diligently and act in line with the EU Digital Services Act and Dutch law, including acknowledging certain notices, assessing them within a reasonable time, and taking proportionate action.',
          'Actions may include no action, content removal or restriction, feature limitations, temporary suspension, or account termination. Where required, we provide a brief statement of reasons and an appeal route.',
        ],
      },
      {
        id: 'contact',
        title: '16. Contact & Legal Inquiries',
        bullets: [
          'Support and DSA notices: info@domumatch.com',
          'Address: Breda, The Netherlands (no KVK number available yet).',
          'Legal and AI/DSA inquiries: legal@domumatch.com (or another designated legal contact address).',
          'If a Dutch translation is provided, it prevails if there is a conflict with this English text.',
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
          'Domu Match helpt studenten (17+) compatibele huisgenoten te vinden en hun huur beter te begrijpen via Harmony- (lifestyle) en Context-scores (studiecontext) en een WWS-calculator.',
          'Je moet minimaal 17 jaar zijn, student zijn (en blijven) en verplichte Persona-ID-verificatie doorlopen. Geen nep-, ghost- of AI-gegenereerde profielen.',
          'De matchinglogica weegt Harmony (~75%) en Context (~25%) voor suggesties, maar jij maakt altijd zelf de uiteindelijke keuze met wie je chat of gaat samenwonen.',
          'Je bent zelf verantwoordelijk voor wat je plaatst (profiel, foto’s, chat). Geen discriminatie, intimidatie, scams of gebruik voor niet-studentenhuisvesting of commerciële doeleinden.',
          'De WWS-calculator is bedoeld ter informatie/empowerment en is geen juridisch advies of besluit van de Huurcommissie.',
          'Domu Match kan offline gedrag of je fysieke veiligheid niet garanderen. Conflicten en contracten zijn in de eerste plaats tussen jou, je huisgenoten en je verhuurder.',
        ],
      },
      {
        id: 'service-scope',
        title: '1. Over Domu Match & dienst',
        description:
          'Domu Match is een wetenschappelijk onderbouwd matchingplatform voor studenten vanuit Nederland.',
        bullets: [
          'Doel: studenten helpen compatibele huisgenoten te vinden via Harmony- en Context-scores en andere input.',
          'Status: Domu Match is geen verhuurder, makelaar, woningaanbieder of advocatenkantoor.',
          'Verdienmodel: studenten gebruiken het gratis; financiering loopt via licenties met onderwijsinstellingen.',
          'Informatieve tools: WWS-calculator en templates zijn puur ter informatie (zie paragraaf 6).',
        ],
      },
      {
        id: 'eligibility',
        title: '2. Toegang (alleen studenten 17+)',
        description: 'Domu Match is uitsluitend voor studenten.',
        bullets: [
          'Je bent minimaal 17 jaar.',
          'Je bent een actuele student (bijv. universiteit, hogeschool, MBO of andere erkende instelling). Bewijs kan worden gevraagd.',
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
        title: '4. Verplichte ID- & studentverificatie (Persona)',
        description: 'Veiligheid vraagt betrouwbare identiteit.',
        bullets: [
          'ID-verificatie is verplicht. Domu Match gebruikt een derde partij (nu Persona) voor documentcontrole en liveness-checks.',
          'Domu Match bewaart geen ruwe ID-documenten of biometrische templates; we ontvangen alleen verificatieresultaten/attributen. Persona kan ruwe documenten bewaren als onze verwerker.',
          'Verificatie kan overheids-ID, selfie/video en bewijs van studentstatus omvatten. Weigering of mislukking kan functies beperken of leiden tot opschorting/beëindiging.',
          'Gegevens worden verwerkt onder de AVG en ons Privacybeleid. Doel: leeftijd (17+), identiteit en studentstatus bevestigen en de verificatie koppelen aan je account.',
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
          'Chat dient respectvol en relevant te blijven voor studentenhuisvesting. Geen bedreigingen, pesten, haatzaaien, spam, phishing-links of druk om overmatige persoonlijke/financiële gegevens te delen.',
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
          'Geen nep-profielen, geen valse leeftijd/studentstatus, geen gebruik van andermans documenten.',
          'Geen scrapen, data-harvesting, geautomatiseerde toegang of commercieel gebruik van studentdata; geen datasets/modellen bouwen uit platformdata.',
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
          'Studenten: gebruik is gratis.',
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
          'We kunnen accounts beperken/opschorten/beëindigen bij veiligheidsrisico’s, beleidschending, valse identiteit/studentstatus, mislukte/weigering van verificatie, fraude of wettelijke/autoritaire vereisten.',
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
          'Neem eerst contact op via info@domumatch.com voor een informele oplossing.',
        ],
      },
      {
        id: 'dsa',
        title: '15. DSA-meldingen & rapportage',
        bullets: [
          'Meld illegale content/misbruik via in-app tools (indien beschikbaar) of e-mail info@domumatch.com met details/links/screenshots.',
          'We beoordelen meldingen zorgvuldig en handelen volgens de EU Digital Services Act en Nederlands recht, inclusief het bevestigen van bepaalde meldingen, een redelijke beoordelingstermijn en proportionele maatregelen.',
          'Maatregelen kunnen zijn: geen actie, verwijdering/beperking van content, functielimieten, tijdelijke opschorting of beëindiging van accounts. Waar vereist geven we een korte motivering en een bezwaar-/beroepsmogelijkheid.',
        ],
      },
      {
        id: 'contact',
        title: '16. Contact & juridische vragen',
        bullets: [
          'Support en DSA-meldingen: info@domumatch.com',
          'Adres: Breda, Nederland (geen KVK-nummer beschikbaar).',
          'Juridische en AI/DSA-vragen: legal@domumatch.com (of een ander aangewezen juridisch contactadres).',
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
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Section className="bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-brand-text mb-3">{t.title}</h1>
              <p className="text-brand-muted mb-2">
                {t.lastUpdatedLabel}: {t.lastUpdatedValue}
              </p>
              <p className="text-brand-muted mb-4">{t.languageNote}</p>
              <p className="text-brand-muted mb-10 leading-relaxed">
                {t.preamble}
              </p>

              {t.sections.map((section) => (
                <section key={section.id} className="mb-10">
                  <h2 className="text-2xl font-semibold text-brand-text mt-6 mb-3">{section.title}</h2>
                  {section.description && (
                    <p className="text-brand-muted mb-3">{section.description}</p>
                  )}
                  {section.quote && (
                    <div className="border-l-4 border-brand-primary bg-slate-50 px-4 py-3 mb-3 text-brand-text">
                      {section.quote}
                    </div>
                  )}
                  {section.bullets && (
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                      {section.bullets.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.note && (
                    <p className="text-brand-muted mt-3">{section.note}</p>
                  )}
                </section>
              ))}
            </div>
          </Container>
        </Section>
      </div>
      <Footer />
    </main>
  )
}
