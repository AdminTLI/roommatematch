'use client'

import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated",
    introduction: "By accessing and using Domu Match, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our platform.",
    sections: {
      acceptance: {
        title: "1. Acceptance of Terms",
        description: "By accessing and using Domu Match, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
        modifications: "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the 'Last updated' date. Your continued use of the service after such modifications constitutes acceptance of the updated terms."
      },
      useLicense: {
        title: "2. Use License",
        description: "Permission is granted to use Domu Match for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:",
        restrictions: [
          "Modify or copy the materials",
          "Use the materials for any commercial purpose or for any public display",
          "Attempt to reverse engineer, decompile, or disassemble any software",
          "Remove any copyright or other proprietary notations from the materials",
          "Transfer the materials to another person or 'mirror' the materials on any other server"
        ],
        termination: "This license shall automatically terminate if you violate any of these restrictions and may be terminated by Domu Match at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession."
      },
      userAccounts: {
        title: "3. User Accounts and Responsibilities",
        description: "To use our service, you must create an account and provide accurate and complete information. You are responsible for:",
        responsibilities: [
          "Providing accurate and complete information during registration",
          "Maintaining the security and confidentiality of your password",
          "Accepting responsibility for all activities that occur under your account",
          "Being at least 17 years old or having parental consent",
          "Completing identity verification as required",
          "Keeping your profile information up to date",
          "Complying with all applicable laws and regulations"
        ],
        accountSecurity: "You must immediately notify us of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from your failure to comply with this section.",
        accountTermination: "We reserve the right to suspend or terminate your account at any time, with or without cause or notice, for any reason, including but not limited to violation of these terms."
      },
      prohibitedUses: {
        title: "4. Prohibited Uses",
        description: "You may not use our service for any unlawful purpose or in any way that violates these terms. Prohibited uses include but are not limited to:",
        prohibited: [
          "Using the service for any unlawful purpose or to solicit others to perform unlawful acts",
          "Violating any international, federal, provincial, state, or local regulations, rules, laws, or ordinances",
          "Infringing upon or violating our intellectual property rights or the intellectual property rights of others",
          "Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating against any user",
          "Submitting false or misleading information",
          "Uploading or transmitting viruses, malware, or any other malicious code",
          "Collecting or storing personal data about other users without their consent",
          "Using automated systems to access the service without authorization",
          "Interfering with or disrupting the service or servers",
          "Attempting to gain unauthorized access to the service or other accounts"
        ]
      },
      contentStandards: {
        title: "5. Content Standards",
        description: "All content submitted to our platform must comply with applicable laws and regulations. You agree that your content will:",
        standards: [
          "Be accurate and truthful",
          "Not violate any laws or regulations",
          "Not infringe upon the rights of others",
          "Not contain false, misleading, or deceptive information",
          "Not contain hate speech, harassment, or discrimination",
          "Not contain explicit, pornographic, or offensive material",
          "Not contain spam, unsolicited communications, or advertising",
          "Not impersonate any person or entity"
        ],
        contentRemoval: "We reserve the right to remove any content that violates these standards or our terms of service. We are not obligated to review all content but may do so at our discretion."
      },
      intellectualProperty: {
        title: "6. Intellectual Property Rights",
        description: "The service and its original content, features, and functionality are owned by Domu Match and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
        userContent: "By submitting content to our platform, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content for the purpose of operating and promoting the service.",
        userRights: "You retain all rights to your content and may request deletion of your content at any time. We will remove your content within a reasonable time after your request."
      },
      privacy: {
        title: "7. Privacy Policy",
        description: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your personal information."
      },
      matching: {
        title: "8. Roommate Matching Service",
        description: "Our platform provides a roommate matching service that connects compatible students. You understand and agree that:",
        terms: [
          "We do not guarantee matches or compatibility",
          "We are not responsible for the actions or conduct of other users",
          "You are solely responsible for your interactions with other users",
          "We are not a party to any agreements or arrangements between users",
          "We do not verify the accuracy of user-provided information",
          "You should exercise caution and use your own judgment when interacting with other users"
        ],
        disclaimer: "We provide the matching service as-is and make no warranties or representations regarding the accuracy, reliability, or suitability of matches."
      },
      liability: {
        title: "9. Limitation of Liability",
        description: "To the fullest extent permitted by law, Domu Match shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:",
        exclusions: [
          "Your use or inability to use the service",
          "Any conduct or content of third parties on the service",
          "Any unauthorized access to or use of our servers and/or any personal information stored therein",
          "Any interruption or cessation of transmission to or from the service",
          "Any bugs, viruses, trojan horses, or the like that may be transmitted to or through the service",
          "Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content"
        ],
        maximumLiability: "To the fullest extent permitted by law, our total liability for any claims arising out of or relating to the use of the service shall not exceed the amount you paid us, if any, in the 12 months preceding the claim."
      },
      disclaimer: {
        title: "10. Disclaimer",
        description: "The information on this service is provided on an 'as is' basis. To the fullest extent permitted by law, we exclude all representations, warranties, conditions, and terms, express or implied, including but not limited to:",
        exclusions: [
          "Warranties of merchantability, fitness for a particular purpose, or non-infringement",
          "Warranties regarding the accuracy, reliability, or availability of the service",
          "Warranties regarding the quality, suitability, or compatibility of matches",
          "Warranties regarding the security or safety of the service"
        ],
        userResponsibility: "You acknowledge that you use the service at your own risk and are solely responsible for your decisions and actions."
      },
      indemnification: {
        title: "11. Indemnification",
        description: "You agree to indemnify, defend, and hold harmless Domu Match, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, or expenses, including reasonable attorney's fees, arising out of or relating to:",
        claims: [
          "Your use or misuse of the service",
          "Your violation of these terms",
          "Your violation of any rights of another",
          "Your content or conduct on the service"
        ]
      },
      termination: {
        title: "12. Termination",
        description: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, for any reason whatsoever, including but not limited to:",
        reasons: [
          "Violation of these terms",
          "Fraudulent, abusive, or illegal activity",
          "Failure to pay fees, if applicable",
          "Request by law enforcement or government agencies",
          "Discontinuation or modification of the service"
        ],
        userTermination: "You may terminate your account at any time by contacting us or using the account deletion feature in your account settings.",
        effect: "Upon termination, your right to use the service will immediately cease. All provisions of these terms that by their nature should survive termination shall survive termination."
      },
      disputeResolution: {
        title: "13. Dispute Resolution",
        description: "If you have any dispute with us, you agree to first contact us and attempt to resolve the dispute informally. If we are unable to resolve the dispute within 60 days, you agree to resolve the dispute through binding arbitration in accordance with the rules of the Netherlands Arbitration Institute.",
        governingLaw: "These terms shall be governed by and construed in accordance with the laws of the Netherlands, without regard to its conflict of law provisions.",
        jurisdiction: "Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts of the Netherlands."
      },
      changes: {
        title: "14. Changes to Terms",
        description: "We reserve the right to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
        continuedUse: "By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the service."
      },
      contact: {
        title: "15. Contact Information",
        description: "If you have any questions about these Terms of Service, please contact us:",
        email: "Email: info@domumatch.com",
        address: "Address: [Your Business Address]"
      }
    }
  },
  nl: {
    title: "Servicevoorwaarden",
    lastUpdated: "Laatst bijgewerkt",
    introduction: "Door toegang te krijgen tot en Domu Match te gebruiken, accepteert en gaat u akkoord met de voorwaarden van deze overeenkomst. Als u niet akkoord gaat met deze voorwaarden, gebruik dan ons platform niet.",
    sections: {
      acceptance: {
        title: "1. Acceptatie van voorwaarden",
        description: "Door toegang te krijgen tot en Domu Match te gebruiken, accepteert en gaat u akkoord met de voorwaarden en bepalingen van deze overeenkomst. Als u niet akkoord gaat met het bovenstaande, gebruik dan deze dienst niet.",
        modifications: "We behouden ons het recht voor om deze voorwaarden te allen tijde te wijzigen. We zullen gebruikers op de hoogte stellen van belangrijke wijzigingen door de nieuwe voorwaarden op deze pagina te plaatsen en de datum 'Laatst bijgewerkt' bij te werken. Uw voortgezet gebruik van de dienst na dergelijke wijzigingen betekent acceptatie van de bijgewerkte voorwaarden."
      },
      useLicense: {
        title: "2. Gebruikerslicentie",
        description: "Toestemming wordt verleend om Domu Match alleen voor persoonlijke, niet-commerciële doeleinden te gebruiken. Dit is de verlening van een licentie, geen overdracht van eigendom, en onder deze licentie mag u niet:",
        restrictions: [
          "Materialen wijzigen of kopiëren",
          "Materialen gebruiken voor commerciële doeleinden of voor openbare weergave",
          "Pogingen doen om software te reverse engineeren, decompileren of disassembleren",
          "Auteursrechten of andere eigendomsnotaties uit de materialen verwijderen",
          "Materialen overdragen aan een andere persoon of materialen 'spiegelen' op een andere server"
        ],
        termination: "Deze licentie wordt automatisch beëindigd als u een van deze beperkingen overtreedt en kan door Domu Match te allen tijde worden beëindigd. Bij het beëindigen van uw weergave van deze materialen of bij beëindiging van deze licentie, moet u alle gedownloade materialen in uw bezit vernietigen."
      },
      userAccounts: {
        title: "3. Gebruikersaccounts en verantwoordelijkheden",
        description: "Om onze dienst te gebruiken, moet u een account aanmaken en accurate en volledige informatie verstrekken. U bent verantwoordelijk voor:",
        responsibilities: [
          "Accurate en volledige informatie verstrekken tijdens registratie",
          "De veiligheid en vertrouwelijkheid van uw wachtwoord behouden",
          "Verantwoordelijkheid accepteren voor alle activiteiten die onder uw account plaatsvinden",
          "Ten minste 18 jaar oud zijn of toestemming van ouders hebben",
          "Identiteitsverificatie voltooien zoals vereist",
          "Uw profielinformatie up-to-date houden",
          "Voldoen aan alle toepasselijke wetten en regelgeving"
        ],
        accountSecurity: "U moet ons onmiddellijk op de hoogte stellen van elk ongeautoriseerd gebruik van uw account of andere beveiligingsinbreuk. We zijn niet aansprakelijk voor verlies of schade voortvloeiend uit uw niet-naleving van deze sectie.",
        accountTermination: "We behouden ons het recht voor om uw account te allen tijde op te schorten of te beëindigen, met of zonder reden of kennisgeving, om welke reden dan ook, inclusief maar niet beperkt tot schending van deze voorwaarden."
      },
      prohibitedUses: {
        title: "4. Verboden gebruik",
        description: "U mag onze dienst niet gebruiken voor enig onwettig doel of op een manier die deze voorwaarden schendt. Verboden gebruik omvat maar is niet beperkt tot:",
        prohibited: [
          "De dienst gebruiken voor onwettige doeleinden of om anderen aan te zetten tot onwettige handelingen",
          "Schending van internationale, federale, provinciale, staat of lokale regelgeving, regels, wetten of verordeningen",
          "Inbreuk maken op of schenden van onze intellectuele eigendomsrechten of de intellectuele eigendomsrechten van anderen",
          "Lastigvallen, misbruiken, beledigen, schaden, lasteren, discrimineren of intimideren van gebruikers",
          "Valse of misleidende informatie indienen",
          "Virussen, malware of andere schadelijke code uploaden of verzenden",
          "Persoonlijke gegevens over andere gebruikers verzamelen of opslaan zonder hun toestemming",
          "Geautomatiseerde systemen gebruiken om zonder autorisatie toegang te krijgen tot de dienst",
          "De dienst of servers verstoren of verstoren",
          "Pogingen doen om ongeautoriseerde toegang te krijgen tot de dienst of andere accounts"
        ]
      },
      contentStandards: {
        title: "5. Inhoudsnormen",
        description: "Alle inhoud die aan ons platform wordt ingediend, moet voldoen aan toepasselijke wetten en regelgeving. U gaat akkoord dat uw inhoud zal:",
        standards: [
          "Accuraat en waarheidsgetrouw zijn",
          "Geen wetten of regelgeving schenden",
          "Geen inbreuk maken op de rechten van anderen",
          "Geen valse, misleidende of bedrieglijke informatie bevatten",
          "Geen haatdragende taal, intimidatie of discriminatie bevatten",
          "Geen expliciet, pornografisch of aanstootgevend materiaal bevatten",
          "Geen spam, ongevraagde communicatie of reclame bevatten",
          "Geen persoon of entiteit imiteren"
        ],
        contentRemoval: "We behouden ons het recht voor om inhoud te verwijderen die deze normen of onze servicevoorwaarden schendt. We zijn niet verplicht om alle inhoud te beoordelen, maar kunnen dit naar eigen goeddunken doen."
      },
      intellectualProperty: {
        title: "6. Intellectuele eigendomsrechten",
        description: "De dienst en zijn oorspronkelijke inhoud, functies en functionaliteit zijn eigendom van Domu Match en worden beschermd door internationale auteursrecht-, handelsmerk-, octrooi-, handelsgeheim- en andere intellectuele eigendomswetten.",
        userContent: "Door inhoud aan ons platform in te dienen, verleent u ons een niet-exclusieve, wereldwijde, royalty-vrije licentie om dergelijke inhoud te gebruiken, te reproduceren, te wijzigen, aan te passen, te publiceren, te vertalen en te distribueren voor het doel van het exploiteren en promoten van de dienst.",
        userRights: "U behoudt alle rechten op uw inhoud en kunt op elk moment verwijdering van uw inhoud aanvragen. We zullen uw inhoud binnen een redelijke tijd na uw verzoek verwijderen."
      },
      privacy: {
        title: "7. Privacybeleid",
        description: "Uw privacy is belangrijk voor ons. Bekijk ons Privacybeleid, dat ook uw gebruik van de dienst regelt, om onze praktijken met betrekking tot het verzamelen en gebruiken van uw persoonlijke informatie te begrijpen."
      },
      matching: {
        title: "8. Huisgenoot matchingdienst",
        description: "Ons platform biedt een huisgenoot matchingdienst die compatibele studenten verbindt. U begrijpt en gaat akkoord dat:",
        terms: [
          "We geen matches of compatibiliteit garanderen",
          "We niet verantwoordelijk zijn voor de acties of het gedrag van andere gebruikers",
          "U uitsluitend verantwoordelijk bent voor uw interacties met andere gebruikers",
          "We geen partij zijn bij overeenkomsten of regelingen tussen gebruikers",
          "We de nauwkeurigheid van gebruikersinformatie niet verifiëren",
          "U voorzichtigheid moet betrachten en uw eigen oordeel moet gebruiken bij interacties met andere gebruikers"
        ],
        disclaimer: "We bieden de matchingdienst aan zoals-ie-is en geven geen garanties of verklaringen met betrekking tot de nauwkeurigheid, betrouwbaarheid of geschiktheid van matches."
      },
      liability: {
        title: "9. Aansprakelijkheidsbeperking",
        description: "Voor zover toegestaan door de wet, is Domu Match niet aansprakelijk voor indirecte, incidentele, speciale, gevolgschade of strafschade, of verlies van winst of omzet, direct of indirect, of verlies van gegevens, gebruik, goodwill of andere immateriële verliezen, voortvloeiend uit:",
        exclusions: [
          "Uw gebruik of onvermogen om de dienst te gebruiken",
          "Elk gedrag of inhoud van derden op de dienst",
          "Elke ongeautoriseerde toegang tot of gebruik van onze servers en/of daarin opgeslagen persoonlijke informatie",
          "Elke onderbreking of stopzetting van transmissie naar of van de dienst",
          "Bugs, virussen, trojans of dergelijke die mogelijk worden verzonden naar of via de dienst",
          "Fouten of weglatingen in inhoud of verlies of schade als gevolg van het gebruik van inhoud"
        ],
        maximumLiability: "Voor zover toegestaan door de wet, bedraagt onze totale aansprakelijkheid voor claims voortvloeiend uit of gerelateerd aan het gebruik van de dienst niet meer dan het bedrag dat u ons heeft betaald, indien van toepassing, in de 12 maanden voorafgaand aan de claim."
      },
      disclaimer: {
        title: "10. Disclaimer",
        description: "De informatie op deze dienst wordt verstrekt op een 'zoals-ie-is' basis. Voor zover toegestaan door de wet, sluiten we alle verklaringen, garanties, voorwaarden en termen uit, uitdrukkelijk of impliciet, inclusief maar niet beperkt tot:",
        exclusions: [
          "Garanties van verkoopbaarheid, geschiktheid voor een bepaald doel of niet-inbreuk",
          "Garanties met betrekking tot de nauwkeurigheid, betrouwbaarheid of beschikbaarheid van de dienst",
          "Garanties met betrekking tot de kwaliteit, geschiktheid of compatibiliteit van matches",
          "Garanties met betrekking tot de veiligheid van de dienst"
        ],
        userResponsibility: "U erkent dat u de dienst op eigen risico gebruikt en uitsluitend verantwoordelijk bent voor uw beslissingen en acties."
      },
      indemnification: {
        title: "11. Vrijwaring",
        description: "U gaat akkoord om Domu Match, zijn gelieerde ondernemingen, functionarissen, directeuren, werknemers, agenten en licentiegevers vrij te houden van claims, aansprakelijkheden, schade, verliezen, kosten of uitgaven, inclusief redelijke advocaatkosten, voortvloeiend uit of gerelateerd aan:",
        claims: [
          "Uw gebruik of misbruik van de dienst",
          "Uw schending van deze voorwaarden",
          "Uw schending van rechten van anderen",
          "Uw inhoud of gedrag op de dienst"
        ]
      },
      termination: {
        title: "12. Beëindiging",
        description: "We kunnen uw account te allen tijde onmiddellijk beëindigen of opschorten en toegang tot de dienst blokkeren, zonder voorafgaande kennisgeving of aansprakelijkheid, om welke reden dan ook, inclusief maar niet beperkt tot:",
        reasons: [
          "Schending van deze voorwaarden",
          "Frauduleuze, misbruikende of illegale activiteit",
          "Niet-betaling van kosten, indien van toepassing",
          "Verzoek van wetshandhavings- of overheidsinstanties",
          "Stopzetting of wijziging van de dienst"
        ],
        userTermination: "U kunt uw account op elk moment beëindigen door contact met ons op te nemen of de accountverwijderingsfunctie in uw accountinstellingen te gebruiken.",
        effect: "Bij beëindiging stopt uw recht om de dienst te gebruiken onmiddellijk. Alle bepalingen van deze voorwaarden die naar hun aard beëindiging moeten overleven, blijven van kracht."
      },
      disputeResolution: {
        title: "13. Geschillenbeslechting",
        description: "Als u een geschil met ons heeft, gaat u akkoord om eerst contact met ons op te nemen en te proberen het geschil informeel op te lossen. Als we het geschil niet binnen 60 dagen kunnen oplossen, gaat u akkoord om het geschil op te lossen door middel van bindende arbitrage in overeenstemming met de regels van het Nederlands Arbitrage Instituut.",
        governingLaw: "Deze voorwaarden worden beheerst door en geïnterpreteerd in overeenstemming met de wetten van Nederland, zonder rekening te houden met conflictregels.",
        jurisdiction: "Alle geschillen voortvloeiend uit of gerelateerd aan deze voorwaarden vallen onder de exclusieve jurisdictie van de rechtbanken van Nederland."
      },
      changes: {
        title: "14. Wijzigingen in voorwaarden",
        description: "We behouden ons het recht voor om deze voorwaarden te allen tijde te wijzigen of te vervangen. Als een revisie materieel is, geven we ten minste 30 dagen van tevoren kennis voordat nieuwe voorwaarden van kracht worden. Wat een materiële wijziging vormt, wordt naar eigen goeddunken bepaald.",
        continuedUse: "Door toegang te blijven krijgen tot of onze dienst te blijven gebruiken na dat die revisies van kracht worden, gaat u akkoord met de bijgewerkte voorwaarden. Als u niet akkoord gaat met de nieuwe voorwaarden, stop dan met het gebruik van de dienst."
      },
      contact: {
        title: "15. Contactgegevens",
        description: "Als u vragen heeft over deze Servicevoorwaarden, neem dan contact met ons op:",
        email: "E-mail: info@domumatch.com",
        address: "Adres: [Uw bedrijfsadres]"
      }
    }
  }
}

export default function TermsPage() {
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

              {/* Acceptance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.acceptance.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.acceptance.description}</p>
                <p className="text-brand-muted">{t.sections.acceptance.modifications}</p>
              </section>

              {/* Use License */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.useLicense.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.useLicense.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.useLicense.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.useLicense.termination}</p>
              </section>

              {/* User Accounts */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.userAccounts.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.userAccounts.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.userAccounts.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
                <p className="text-brand-muted mb-4">{t.sections.userAccounts.accountSecurity}</p>
                <p className="text-brand-muted">{t.sections.userAccounts.accountTermination}</p>
              </section>

              {/* Prohibited Uses */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.prohibitedUses.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.prohibitedUses.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.sections.prohibitedUses.prohibited.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Content Standards */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.contentStandards.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.contentStandards.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.contentStandards.standards.map((standard, index) => (
                    <li key={index}>{standard}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.contentStandards.contentRemoval}</p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.intellectualProperty.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.intellectualProperty.description}</p>
                <p className="text-brand-muted mb-4">{t.sections.intellectualProperty.userContent}</p>
                <p className="text-brand-muted">{t.sections.intellectualProperty.userRights}</p>
              </section>

              {/* Privacy */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.privacy.title}</h2>
                <p className="text-brand-muted">{t.sections.privacy.description}</p>
              </section>

              {/* Matching */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.matching.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.matching.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.matching.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.matching.disclaimer}</p>
              </section>

              {/* Liability */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.liability.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.liability.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.liability.exclusions.map((exclusion, index) => (
                    <li key={index}>{exclusion}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.liability.maximumLiability}</p>
              </section>

              {/* Disclaimer */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.disclaimer.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.disclaimer.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.disclaimer.exclusions.map((exclusion, index) => (
                    <li key={index}>{exclusion}</li>
                  ))}
                </ul>
                <p className="text-brand-muted">{t.sections.disclaimer.userResponsibility}</p>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.indemnification.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.indemnification.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                  {t.sections.indemnification.claims.map((claim, index) => (
                    <li key={index}>{claim}</li>
                  ))}
                </ul>
              </section>

              {/* Termination */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.termination.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.termination.description}</p>
                <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-4">
                  {t.sections.termination.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
                <p className="text-brand-muted mb-4">{t.sections.termination.userTermination}</p>
                <p className="text-brand-muted">{t.sections.termination.effect}</p>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.disputeResolution.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.disputeResolution.description}</p>
                <p className="text-brand-muted mb-4">{t.sections.disputeResolution.governingLaw}</p>
                <p className="text-brand-muted">{t.sections.disputeResolution.jurisdiction}</p>
              </section>

              {/* Changes */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.changes.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.changes.description}</p>
                <p className="text-brand-muted">{t.sections.changes.continuedUse}</p>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{t.sections.contact.title}</h2>
                <p className="text-brand-muted mb-4">{t.sections.contact.description}</p>
                <p className="text-brand-muted mb-2">{t.sections.contact.email}</p>
                <p className="text-brand-muted">{t.sections.contact.address}</p>
              </section>
            </div>
          </Container>
        </Section>
      </div>
      <Footer />
    </main>
  )
}
