'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
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
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          The competitive Dutch student housing market creates opportunities for scammers and fraudulent landlords. With a shortage of 23,100 student accommodations across major cities and average rents reaching €683 per month (and €979 in Amsterdam), students are often desperate to secure housing quickly, making them vulnerable targets.
        </p>

        <p>
          Understanding Dutch rental law, recognizing red flags, and following proper verification procedures can protect you from financial loss, unsafe living conditions, and legal complications. This guide will help you navigate the rental process safely and confidently.
        </p>

        <h2>The Reality of Rental Fraud in the Netherlands</h2>

        <p>
          Rental scams are unfortunately common in the Dutch student housing market. Scammers take advantage of the housing shortage by creating fake listings, requesting deposits for properties they do not own, or using stolen identity documents to appear legitimate. The Dutch Authority for Consumers and Markets (ACM) and consumer organizations like Consumentenbond regularly warn students about these tactics.
        </p>

        <p>
          Common warning signs include fake listings on popular housing platforms, requests for upfront payments before viewing properties, landlords who claim to be abroad and cannot meet in person, pressure to sign contracts quickly without proper review, and requests for personal documents or financial information before verification. If you are browsing housing listings, our <Link href="/housing">housing search</Link> connects you with verified platforms and resources.
        </p>

        <h2>Pre-Rental Verification Checklist</h2>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"
            alt="Modern apartment keys and rental documents"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Before signing any rental agreement, verify the landlord and inspect the property in person.</figcaption>
        </figure>

        <p>
          Before committing to any rental agreement, verify that the person you are dealing with actually owns or has the legal right to rent the property. Request official identification - a valid passport or Dutch ID card - and confirm the name matches the property owner. You can verify property ownership through the Kadaster (Land Registry). Insist on meeting the landlord or their authorized representative face-to-face; be wary of people who claim to be abroad. Ensure phone numbers and emails are verifiable and not throwaway accounts.
        </p>

        <p>
          Never pay a deposit or sign a contract without viewing the property in person. Legitimate landlords allow viewings - refusals or excuses are red flags. Confirm the property location matches the listing, inspect safety features such as smoke detectors and secure locks, and document the condition with photos or videos during the viewing. If possible, speak with current residents to confirm legitimacy.
        </p>

        <p>
          If you are joining an existing household, verify the people you will live with. Meet face-to-face, request student IDs or other proof, and check references from previous roommates or landlords when possible. Platforms like <Link href="/verify">Domu Match</Link> verify all users, reducing the risk of connecting with strangers who have not been vetted.
        </p>

        <h2>Understanding Dutch Rental Contracts</h2>

        <p>
          The Netherlands has strong tenant protections, but you need to understand your contract. The Good Landlordship Act (Wet goed verhuurderschap), introduced in 2023, aims to prevent exploitation and ensure fair treatment. Your contract should clearly state the rent amount and payment terms, deposit details including amount and return conditions, contract duration and notice periods, included utilities and shared costs, house rules and restrictions, and maintenance responsibilities.
        </p>

        <p>
          Be alert for red flags in contracts: illegal agency fees charged to tenants, vague language about rent increases or deposit returns, unreasonable restrictions that limit tenant rights, and pressure to sign without time for review. When in doubt, consult your university's legal or housing office, the Housing Hotline (Woonlijn), or consumer organizations such as Consumentenbond. You can also learn more about our approach to safety and verification on our <Link href="/safety">safety page</Link>.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80"
            alt="Student reviewing documents at a desk"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Always review rental contracts carefully and seek legal advice if something seems unclear.</figcaption>
        </figure>

        <h2>Financial Safety Measures</h2>

        <p>
          Deposits for unfurnished rentals are capped at three months' rent. Landlords must return deposits within 14 days after move-out, minus legitimate damages. Keep proof of all payments and avoid cash without receipts. Use traceable bank transfers, never pay before viewing and signing, verify bank account ownership, and store all receipts and communication.
        </p>

        <h2>Safety When Meeting Potential Roommates</h2>

        <p>
          When meeting potential roommates for the first time, arrange to meet in a public place. Bring a friend or let someone know your whereabouts. Trust your instincts if something feels off. Prioritize platforms that verify users - <Link href="/how-it-works">Domu Match</Link> verifies every student on the platform, so you can focus on compatibility rather than worrying about authenticity.
        </p>

        <h2>Municipal Registration and Insurance</h2>

        <p>
          Dutch law requires registering your address with the local municipality (gemeente) within five days. This is essential for obtaining a BSN, opening a bank account, and accessing healthcare. Landlords must cooperate - refusal is a red flag. Consider liability insurance (aansprakelijkheidsverzekering) to cover accidental damage to others, and contents insurance (inboedelverzekering) to protect personal belongings. Check whether your contract requires specific coverage.
        </p>

        <h2>How Domu Match Protects You</h2>

        <p>
          We verify every user with ID and university email checks. Our platform provides safe messaging without requiring you to share personal contact details until you are ready. Transparent profile indicators show which students have completed verification, so you can connect with confidence.
        </p>

        <p>
          Using a platform that verifies every user dramatically reduces your risk of encountering scammers. <Link href="/verify">Complete your verification</Link> to connect with real students. Our <Link href="/privacy">privacy policy</Link> explains how we protect your data throughout the process.
        </p>

        <h2>What to Do If You Suspect Fraud</h2>

        <p>
          If you suspect you have encountered a rental scam, stop communication immediately. Report the listing to the platform and, if necessary, to the police. Contact ACM or Consumentenbond for guidance, and warn other students through university channels.
        </p>

        <h2>Conclusion</h2>

        <p>
          Navigating the Dutch rental market safely requires vigilance, knowledge, and patience. The housing shortage adds pressure, but skipping verification exposes you to significant risk. Follow this checklist, understand your rights, and use verified platforms like <Link href="/auth/sign-up">Domu Match</Link> to protect yourself from scams. Legitimate landlords and roommates will respect thorough verification - if they refuse, walk away. Your safety is worth the extra time. Take a methodical approach, and you will find secure housing that supports your studies instead of adding stress.
        </p>
      </div>
    )
  },
  nl: {
    title: 'Veiligheidschecklist voor studenthuurders',
    excerpt: 'Verificatie, contracten en best practices om veilig te wonen in Nederland. Bescherm jezelf tegen huurfraude en leer je huurdersrechten kennen.',
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
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          De krappe Nederlandse studentenmarkt biedt kansen voor oplichters en malafide verhuurders. Met een tekort van 23.100 studentenkamers en gemiddelde huren van €683 per maand (en €979 in Amsterdam) voelen studenten vaak tijdsdruk, waardoor ze kwetsbaarder zijn.
        </p>

        <p>
          Als je de Nederlandse huurregels kent, rode vlaggen herkent en een goede verificatieprocedure volgt, bescherm je jezelf tegen geldverlies, onveilige situaties en juridische problemen. Deze gids helpt je veilig en zeker door het huurproces.
        </p>

        <h2>Zo vaak komt huurfraude voor</h2>

        <p>
          In de studentenmarkt duiken geregeld nepadvertenties, valse contracten en gestolen identiteiten op. Oplichters misbruiken de woningnood door niet-bestaande kamers te verhuren of borg te eisen voor huizen die ze niet bezitten. Instellingen als de Autoriteit Consument & Markt (ACM) en Consumentenbond waarschuwen hier regelmatig voor.
        </p>

        <p>
          Veelgebruikte trucs zijn nepadvertenties op populaire platforms, vragen om vooruitbetaling vóór een bezichtiging, "verhuurders" die in het buitenland zouden zitten en niet kunnen afspreken, druk om meteen te tekenen zonder contractreview, en persoonlijke documenten of financiële info vragen vóór verificatie. Onze <Link href="/housing">huisvestingszoekfunctie</Link> verbindt je met geverifieerde platformen.
        </p>

        <h2>Checklist vóórdat je tekent</h2>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"
            alt="Moderne appartementssleutels en huurdocumenten"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Verifieer de verhuurder en bekijk de woning persoonlijk voordat je tekent.</figcaption>
        </figure>

        <p>
          Ga alleen verder als je zeker weet dat de verhuurder bevoegd is. Vraag om een geldig ID - paspoort of Nederlandse ID-kaart - en controleer of de naam overeenkomt met de eigenaar. Via het Kadaster kun je eigendom controleren. Spreek elkaar in het echt; alleen online contact is een rode vlag. Controleer contactgegevens en gebruik traceerbare telefoonnummers en e-mails.
        </p>

        <p>
          Betaal nooit borg of teken nooit zonder bezichtiging. Echte verhuurders regelen graag een viewing. Controleer het adres, let op rookmelders, sloten en brandveiligheid, leg de staat vast met foto's en video's, en praat met huidige bewoners als dat kan. Ga je in een bestaand huis wonen? Ontmoet elkaar persoonlijk, vraag naar studentenkaart of verificatie, check referenties en gebruik platforms zoals <Link href="/verify">Domu Match</Link> waar iedereen geverifieerd is.
        </p>

        <h2>Snap je contract</h2>

        <p>
          Nederlandse huurders worden goed beschermd, maar dan moet je het contract begrijpen. De Wet goed verhuurderschap (2023) verplicht eerlijke verhuur. Je contract moet huurprijs, betalingstermijn en betaalmethode bevatten, borgbedrag en terugbetalingstermijn, contractduur en opzegtermijnen, welke nutsvoorzieningen zijn inbegrepen, huisregels, en wie verantwoordelijk is voor onderhoud.
        </p>

        <p>
          Let op rode vlaggen: bemiddelingskosten die illegaal bij de huurder worden neergelegd, onduidelijke taal over huurverhogingen of borg, onredelijke beperkingen op jouw rechten, druk om meteen te tekenen. Twijfel? Vraag advies bij de juridische dienst van je hogeschool, de Woonlijn of Consumentenbond. Lees meer op onze <Link href="/safety">veiligheidspagina</Link>.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80"
            alt="Student die documenten bekijkt aan een bureau"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Lees huurcontracten zorgvuldig door en vraag juridisch advies als iets onduidelijk is.</figcaption>
        </figure>

        <h2>Financiële veiligheid</h2>

        <p>
          Borg voor ongemeubileerde woningen is gemaximeerd op drie maanden huur. Terugbetaling binnen 14 dagen na vertrek, minus echte schade. Bewaar alle betaalbewijzen; betaal bij voorkeur niet contant. Gebruik bankoverschrijvingen, betaal nooit voordat je hebt bezichtigd én getekend, controleer op welke naam de bankrekening staat, en bewaar bonnen en communicatie.
        </p>

        <h2>Veilig kennismaken</h2>

        <p>
          Spreek eerst af op een openbare plek. Neem iemand mee of meld waar je bent. Luister naar je gevoel; twijfel is vaak terecht. Kies voor geverifieerde communities zoals <Link href="/how-it-works">Domu Match</Link>, waar elke student wordt gecontroleerd.
        </p>

        <h2>Gemeentelijke inschrijving en verzekeringen</h2>

        <p>
          Je móét je adres binnen vijf dagen registreren bij de gemeente. Dat heb je nodig voor je BSN, bankzaken en zorg. De verhuurder moet meewerken; weigering is verdacht. Overweeg een aansprakelijkheidsverzekering en inboedelverzekering. Controleer of je contract bepaalde verzekeringen vereist.
        </p>

        <h2>Hoe Domu Match helpt</h2>

        <p>
          We verifiëren iedere gebruiker met ID- en universiteitsmailcontroles. Onze chat werkt veilig zonder dat je direct persoonlijke gegevens hoeft te delen. Duidelijke indicatoren tonen wie geverifieerd is.
        </p>

        <p>
          Wie via een geverifieerd platform zoekt, verkleint de kans op fraude enorm. <Link href="/verify">Rond je verificatie af</Link> en match met echte studenten. Ons <Link href="/privacy">privacybeleid</Link> legt uit hoe we je gegevens beschermen.
        </p>

        <h2>Wat als je fraude vermoedt?</h2>

        <p>
          Stop direct met communiceren. Meld de advertentie bij het platform en eventueel bij de politie. Vraag advies bij de ACM of Consumentenbond. Waarschuw andere studenten via universitaire kanalen.
        </p>

        <h2>Conclusie</h2>

        <p>
          Veilig huren vraagt om alertheid en kennis. De woningnood zorgt voor haast, maar het overslaan van verificatie levert veel grotere problemen op. Volg deze checklist, ken je rechten en gebruik geverifieerde platformen zoals <Link href="/auth/sign-up">Domu Match</Link> om fraude te vermijden. Eerlijke verhuurders en huisgenoten hebben begrip voor een grondige check - als ze dat niet willen, bedank vriendelijk en loop weg. Je veiligheid is de extra tijd waard.
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
