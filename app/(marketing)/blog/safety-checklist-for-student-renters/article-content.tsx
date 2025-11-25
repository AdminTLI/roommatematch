'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Safety Checklist for Student Renters',
    excerpt: 'Verification, contracts, and best practices for safe living in the Netherlands. Protect yourself from rental scams and understand your tenant rights.',
    publishDate: '2025-11-10',
    readTime: '5 min read',
    relatedLinks: [
      {
        title: 'Get Verified',
        href: '/verify',
        description: 'Complete ID verification to ensure you and your potential roommates are verified students.'
      },
      {
        title: 'Safety & Security',
        href: '/safety',
        description: 'Learn more about our safety measures and verification processes.'
      },
      {
        title: 'Privacy Policy',
        href: '/privacy',
        description: 'Understand how we protect your personal information and data.'
      }
    ],
    ctaTitle: 'Stay Safe with Verified Roommates',
    ctaDescription: 'Join a community of verified students. Our ID verification process ensures you\'re connecting with real students, not scammers.',
    ctaHref: '/verify',
    ctaText: 'Get Verified',
    body: () => (
      <div className="space-y-8">
        <p className="text-lg text-brand-muted leading-relaxed">
          The competitive Dutch student housing market creates opportunities for scammers and fraudulent landlords. With a shortage of 23,100 student accommodations across major cities and average rents reaching €683 per month (and €979 in Amsterdam), students are often desperate to secure housing quickly, making them vulnerable targets.
        </p>

        <p>
          Understanding Dutch rental law, recognizing red flags, and following proper verification procedures can protect you from financial loss, unsafe living conditions, and legal complications. This comprehensive checklist will help you navigate the rental process safely and confidently.
        </p>

        <h2>The Reality of Rental Fraud in the Netherlands</h2>

        <p>
          Rental scams are unfortunately common in the Dutch student housing market. Scammers take advantage of the housing shortage by creating fake listings, requesting deposits for properties they don't own, or using stolen identity documents to appear legitimate. The high demand and time pressure students face make them particularly vulnerable.
        </p>

        <p>
          The Dutch Authority for Consumers and Markets (ACM) and consumer organizations like Consumentenbond regularly warn students about rental fraud. Common tactics include:
        </p>

        <ul>
          <li>Fake listings on popular housing platforms</li>
          <li>Requests for upfront payments before viewing properties</li>
          <li>Landlords who claim to be abroad and can't meet in person</li>
          <li>Pressure to sign contracts quickly without proper review</li>
          <li>Requests for personal documents or financial information before verification</li>
        </ul>

        <h2>Pre-Rental Verification Checklist</h2>

        <h3>1. Verify the Landlord's Identity</h3>

        <p>
          Before committing to any rental agreement, verify that the person you're dealing with actually owns or has the legal right to rent the property:
        </p>

        <ul>
          <li><strong>Request official identification:</strong> Ask to see a valid ID (passport or Dutch ID card) and verify the name matches the property owner.</li>
          <li><strong>Check property ownership:</strong> You can verify property ownership through the Kadaster (Land Registry). Ask for the address and cross-reference it with public records if possible.</li>
          <li><strong>Meet in person:</strong> Insist on meeting the landlord or their authorized representative face-to-face. Be wary of people who claim to be abroad.</li>
          <li><strong>Verify contact information:</strong> Make sure phone numbers and emails are verifiable and not throwaway accounts.</li>
        </ul>

        <h3>2. Inspect the Property Thoroughly</h3>

        <p>
          Never pay a deposit or sign a contract without viewing the property in person:
        </p>

        <ul>
          <li><strong>Schedule a viewing:</strong> Legitimate landlords allow viewings. Refusals or excuses are red flags.</li>
          <li><strong>Check the address:</strong> Confirm the property location matches the listing.</li>
          <li><strong>Inspect safety features:</strong> Look for smoke detectors, secure locks, emergency exits, and compliance with fire regulations.</li>
          <li><strong>Document the condition:</strong> Take photos or videos during the viewing to protect against false damage claims.</li>
          <li><strong>Talk to current tenants:</strong> If possible, speak with current residents to confirm legitimacy.</li>
        </ul>

        <h3>3. Verify Your Potential Roommates</h3>

        <p>
          If you're joining an existing household, verify the people you'll live with:
        </p>

        <ul>
          <li><strong>Meet face-to-face:</strong> Chemistry and trust matter.</li>
          <li><strong>Request verification:</strong> Ask for student IDs or other proof.</li>
          <li><strong>Check references:</strong> Speak to previous roommates or landlords if possible.</li>
          <li><strong>Use verified platforms:</strong> Platforms like <Link href="/verify" className="text-brand-primary hover:underline">Domu Match</Link> verify all users.</li>
        </ul>

        <h2>Understanding Dutch Rental Contracts</h2>

        <p>
          The Netherlands has strong tenant protections, but you need to understand your contract. The Good Landlordship Act (Wet goed verhuurderschap) introduced in 2023 aims to prevent exploitation and ensure fair treatment.
        </p>

        <h3>Essential Contract Elements</h3>

        <p>Your contract should clearly state:</p>

        <ul>
          <li><strong>Rent amount and payment terms</strong></li>
          <li><strong>Deposit details</strong> (amount, return conditions, timelines)</li>
          <li><strong>Contract duration</strong> and notice periods</li>
          <li><strong>Included utilities</strong> and shared costs</li>
          <li><strong>House rules</strong> and restrictions</li>
          <li><strong>Maintenance responsibilities</strong></li>
        </ul>

        <h3>Red Flags in Contracts</h3>

        <ul>
          <li>Illegal agency fees charged to tenants</li>
          <li>Vague language about rent increases or deposit returns</li>
          <li>Unreasonable restrictions that limit tenant rights</li>
          <li>Pressure to sign without time for review</li>
        </ul>

        <h3>Get Legal Review</h3>

        <p>When in doubt, consult:</p>

        <ul>
          <li>Your university's legal or housing office</li>
          <li>The Housing Hotline (Woonlijn)</li>
          <li>Consumer organizations such as Consumentenbond</li>
        </ul>

        <h2>Financial Safety Measures</h2>

        <h3>Deposit Protection</h3>

        <ul>
          <li>Deposits for unfurnished rentals are capped at three months' rent.</li>
          <li>Landlords must return deposits within 14 days after move-out, minus legitimate damages.</li>
          <li>Keep proof of all payments; avoid cash without receipts.</li>
        </ul>

        <h3>Payment Security</h3>

        <ul>
          <li>Use traceable bank transfers.</li>
          <li>Never pay before viewing and signing.</li>
          <li>Verify bank account ownership.</li>
          <li>Store all receipts and communication.</li>
        </ul>

        <h2>Safety When Meeting Potential Roommates</h2>

        <ul>
          <li>Meet in public places first.</li>
          <li>Bring a friend or let someone know your whereabouts.</li>
          <li>Trust your instincts if something feels off.</li>
          <li>Prioritize verified platforms.</li>
        </ul>

        <h2>Municipal Registration Requirements</h2>

        <p>
          Dutch law requires registering your address with the local municipality (gemeente) within five days. This is essential for obtaining a BSN, opening a bank account, and accessing healthcare. Landlords must cooperate—refusal is a red flag.
        </p>

        <h2>Insurance Considerations</h2>

        <ul>
          <li><strong>Liability insurance (aansprakelijkheidsverzekering):</strong> Covers accidental damage to others.</li>
          <li><strong>Contents insurance (inboedelverzekering):</strong> Protects personal belongings.</li>
          <li>Check whether your contract requires specific coverage.</li>
        </ul>

        <h2>How Domu Match Protects You</h2>

        <ul>
          <li>ID and university email verification for all users</li>
          <li>Safe messaging without sharing personal contact details</li>
          <li>Transparent profile indicators for verified students</li>
        </ul>

        <p>
          Using a platform that verifies every user dramatically reduces your risk of encountering scammers. <Link href="/verify" className="text-brand-primary hover:underline">Complete your verification</Link> to connect with real students.
        </p>

        <h2>What to Do If You Suspect Fraud</h2>

        <ul>
          <li>Stop communication immediately.</li>
          <li>Report the listing to the platform and, if necessary, to the police.</li>
          <li>Contact ACM or Consumentenbond for guidance.</li>
          <li>Warn other students through university channels.</li>
        </ul>

        <h2>Conclusion</h2>

        <p>
          Navigating the Dutch rental market safely requires vigilance, knowledge, and patience. The housing shortage adds pressure, but skipping verification exposes you to significant risk.
        </p>

        <p>
          Follow this checklist, understand your rights, and use verified platforms to protect yourself from scams. Legitimate landlords and roommates will respect thorough verification—if they refuse, walk away.
        </p>

        <p>
          Your safety is worth the extra time. Take a methodical approach, and you'll find secure housing that supports your studies instead of adding stress.
        </p>
      </div>
    )
  },
  nl: {
    title: 'Veiligheidschecklist voor studenthuurders',
    excerpt: 'Verificatie, contracten en best practices om veilig te wonen in Nederland. Bescherm jezelf tegen huurfraude en leer je huurrechten kennen.',
    publishDate: '2025-11-10',
    readTime: '5 min lezen',
    relatedLinks: [
      {
        title: 'Laat jezelf verifiëren',
        href: '/verify',
        description: 'Rond de ID-verificatie af zodat jij en je toekomstige huisgenoten geverifieerde studenten zijn.'
      },
      {
        title: 'Veiligheid & beveiliging',
        href: '/safety',
        description: 'Lees meer over onze veiligheidsmaatregelen en verificatieprocessen.'
      },
      {
        title: 'Privacybeleid',
        href: '/privacy',
        description: 'Ontdek hoe wij zorgvuldig met jouw persoonsgegevens omgaan.'
      }
    ],
    ctaTitle: 'Blijf veilig met geverifieerde huisgenoten',
    ctaDescription: 'Word onderdeel van een community van geverifieerde studenten. Onze ID-check zorgt ervoor dat je echte studenten ontmoet en geen oplichters.',
    ctaHref: '/verify',
    ctaText: 'Nu verifiëren',
    body: () => (
      <div className="space-y-8">
        <p className="text-lg text-brand-muted leading-relaxed">
          De krappe Nederlandse studentenmarkt biedt kansen voor oplichters en malafide verhuurders. Met een tekort van 23.100 studentenkamers en gemiddelde huren van €683 per maand (en €979 in Amsterdam) voelen studenten vaak tijdsdruk, waardoor ze kwetsbaarder zijn.
        </p>

        <p>
          Als je de Nederlandse huurregels kent, rode vlaggen herkent en een goede verificatieprocedure volgt, bescherm je jezelf tegen geldverlies, onveilige situaties en juridische problemen. Deze checklist helpt je veilig en zeker door het huurproces.
        </p>

        <h2>Zo vaak komt huurfraude voor</h2>

        <p>
          In de studentenmarkt duiken geregeld nepadvertenties, valse contracten en gestolen identiteiten op. Oplichters misbruiken de woningnood door niet-bestaande kamers te verhuren of borg te eisen voor huizen die ze niet bezitten.
        </p>

        <p>
          Instellingen als de Autoriteit Consument & Markt (ACM) en Consumentenbond waarschuwen hier regelmatig voor. Veelgebruikte trucs:
        </p>

        <ul>
          <li>Nepadvertenties op populaire platforms</li>
          <li>Vragen om vooruitbetaling vóór een bezichtiging</li>
          <li>“Verhuurders” die in het buitenland zouden zitten en niet kunnen afspreken</li>
          <li>Druk zetten om meteen te tekenen zonder contractreview</li>
          <li>Persoonlijke documenten of financiële info vragen vóór verificatie</li>
        </ul>

        <h2>Checklist vóórdat je tekent</h2>

        <h3>1. Controleer de identiteit van de verhuurder</h3>

        <p>Ga alleen verder als je zeker weet dat de verhuurder bevoegd is:</p>

        <ul>
          <li><strong>Vraag om een geldig ID:</strong> Paspoort of Nederlandse ID-kaart en controleer of de naam overeenkomt met de eigenaar.</li>
          <li><strong>Check eigendom:</strong> Via het Kadaster kun je controleren wie de eigenaar is. Vraag het adres en vergelijk het.</li>
          <li><strong>Spreek elkaar in het echt:</strong> Alleen online contact is een rode vlag.</li>
          <li><strong>Controleer contactgegevens:</strong> Gebruik traceerbare telefoonnummers en e-mails.</li>
        </ul>

        <h3>2. Bekijk de woning zelf</h3>

        <p>Betaal nooit borg of teken nooit zonder bezichtiging:</p>

        <ul>
          <li><strong>Plan een afspraak:</strong> Echte verhuurders regelen graag een viewing.</li>
          <li><strong>Controleer het adres:</strong> Klopt de locatie met de advertentie?</li>
          <li><strong>Let op veiligheid:</strong> Rookmelders, sloten, nooduitgangen en brandveiligheid.</li>
          <li><strong>Leg de staat vast:</strong> Foto’s en video’s beschermen je tegen valse schadeclaims.</li>
          <li><strong>Praat met huidige bewoners:</strong> Zij kunnen bevestigen of alles klopt.</li>
        </ul>

        <h3>3. Check toekomstige huisgenoten</h3>

        <p>Ga je in een bestaand huis wonen? Verifieer de bewoners:</p>

        <ul>
          <li>Ontmoet elkaar persoonlijk.</li>
          <li>Vraag naar studentenkaart of andere verificatie.</li>
          <li>Check referenties van vorige huisgenoten of verhuurders.</li>
          <li>Gebruik platforms zoals <Link href="/verify" className="text-brand-primary hover:underline">Domu Match</Link> waar iedereen geverifieerd is.</li>
        </ul>

        <h2>Snap je contract</h2>

        <p>
          Nederlandse huurders worden goed beschermd, maar dan moet je het contract begrijpen. De Wet goed verhuurderschap (2023) verplicht eerlijke verhuur.
        </p>

        <h3>Wat moet erin staan?</h3>

        <ul>
          <li>Huurprijs, betalingstermijn en betaalmethode</li>
          <li>Borgbedrag, voorwaarden en terugbetalingstermijn</li>
          <li>Contractduur en opzegtermijnen</li>
          <li>Welke nutsvoorzieningen zijn inbegrepen</li>
          <li>Huisregels (bezoek, geluid, huisdieren)</li>
          <li>Wie verantwoordelijk is voor onderhoud</li>
        </ul>

        <h3>Let op deze rode vlaggen</h3>

        <ul>
          <li>Bemiddelingskosten die illegaal bij de huurder worden neergelegd</li>
          <li>Onduidelijke taal over huurverhogingen of borg</li>
          <li>Onredelijke beperkingen op jouw rechten</li>
          <li>Druk om meteen te tekenen zonder bedenktijd</li>
        </ul>

        <h3>Laat het nakijken</h3>

        <p>Twijfel? Vraag advies bij:</p>

        <ul>
          <li>De juridische dienst van je hogeschool/universiteit</li>
          <li>De Woonlijn</li>
          <li>Consumentenorganisaties zoals Consumentenbond</li>
        </ul>

        <h2>Financiële veiligheid</h2>

        <h3>Borg</h3>

        <ul>
          <li>Borg voor ongemeubileerde woningen is gemaximeerd op drie maanden huur.</li>
          <li>Terugbetaling binnen 14 dagen na vertrek, minus echte schade.</li>
          <li>Bewaar alle betaalbewijzen; betaal bij voorkeur niet contant.</li>
        </ul>

        <h3>Betalingen</h3>

        <ul>
          <li>Gebruik bankoverschrijvingen zodat alles traceerbaar is.</li>
          <li>Betaal nooit voordat je hebt bezichtigd én getekend.</li>
          <li>Controleer op welke naam de bankrekening staat.</li>
          <li>Bewaar bonnen en communicatie.</li>
        </ul>

        <h2>Veilig kennismaken</h2>

        <ul>
          <li>Spreek eerst af op een openbare plek.</li>
          <li>Neem iemand mee of meld waar je bent.</li>
          <li>Luister naar je gevoel; twijfel is vaak terecht.</li>
          <li>Kies voor geverifieerde communities.</li>
        </ul>

        <h2>Gemeentelijke inschrijving</h2>

        <p>
          Je móét je adres binnen vijf dagen registreren bij de gemeente. Dat heb je nodig voor je BSN, bankzaken en zorg. De verhuurder moet meewerken; weigering is verdacht.
        </p>

        <h2>Verzekeringen</h2>

        <ul>
          <li><strong>Aansprakelijkheidsverzekering:</strong> Dekt schade die jij per ongeluk veroorzaakt.</li>
          <li><strong>Inboedelverzekering:</strong> Beschermt je spullen bij diefstal, brand of waterschade.</li>
          <li>Controleer of je contract bepaalde verzekeringen vereist.</li>
        </ul>

        <h2>Hoe Domu Match helpt</h2>

        <ul>
          <li>ID-verificatie en controle van universiteitsmail voor alle gebruikers</li>
          <li>Veilige chat zonder direct persoonlijke gegevens te delen</li>
          <li>Duidelijke indicatoren of iemand geverifieerd is</li>
        </ul>

        <p>
          Wie via een geverifieerd platform zoekt, verkleint de kans op fraude enorm. <Link href="/verify" className="text-brand-primary hover:underline">Rond je verificatie af</Link> en match met echte studenten.
        </p>

        <h2>Wat als je fraude vermoedt?</h2>

        <ul>
          <li>Stop direct met communiceren.</li>
          <li>Meld de advertentie bij het platform en eventueel bij de politie.</li>
          <li>Vraag advies bij de ACM of Consumentenbond.</li>
          <li>Waarschuw andere studenten via universitaire kanalen.</li>
        </ul>

        <h2>Conclusie</h2>

        <p>
          Veilig huren vraagt om alertheid en kennis. De woningnood zorgt voor haast, maar het overslaan van verificatie levert veel grotere problemen op.
        </p>

        <p>
          Volg deze checklist, ken je rechten en gebruik geverifieerde platformen om fraude te vermijden. Eerlijke verhuurders en huisgenoten hebben begrip voor een grondige check—als ze dat niet willen, bedank vriendelijk en loop weg.
        </p>

        <p>
          Je veiligheid is de extra tijd waard. Werk stap voor stap en vind een veilige woonplek die je studie ondersteunt in plaats van bemoeilijkt.
        </p>
      </div>
    )
  }
}

export function SafetyChecklistArticle() {
  const { locale } = useApp()
  const article = content[locale]

  return (
    <BlogPostLayout
      title={article.title}
      excerpt={article.excerpt}
      publishDate={article.publishDate}
      readTime={article.readTime}
      relatedLinks={article.relatedLinks}
      ctaTitle={article.ctaTitle}
      ctaDescription={article.ctaDescription}
      ctaHref={article.ctaHref}
      ctaText={article.ctaText}
    >
      {article.body()}
    </BlogPostLayout>
  )
}


