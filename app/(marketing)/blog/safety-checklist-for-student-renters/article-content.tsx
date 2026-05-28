'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Safety Checklist for Student Renters',
    excerpt:
      'A practical safety checklist for renting in the Netherlands: how to verify listings, review contracts, avoid common scam patterns, and protect yourself before you pay a deposit.',
    publishDate: '2025-11-10',
    readTime: '5 min read',
    relatedLinks: [
      {
        title: 'Privacy Policy',
        href: '/privacy',
        description:
          'What to look for when sharing documents, bank details, and personal data during a rental search.',
      },
      {
        title: 'Safety & Security',
        href: '/safety',
        description:
          'General safety guidance and how Domu Match approaches safety across the product.',
      },
      {
        title: 'Housing',
        href: '/housing',
        description:
          'Background resources for navigating student housing searches in the Netherlands.',
      }
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          A competitive housing market creates opportunities for scammers and fraudulent listings. The pattern
          is predictable: urgency, pressure, and requests for money or documents before you have verified who
          you are dealing with. This checklist is designed to slow the process down just enough to protect
          you.
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
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Rental contract and paperwork on a desk with a pen"
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
          If you are joining an existing household, verify the people you will live with. Meet face-to-face,
          ask for basic proof they are who they say they are, and check references where possible. Do not hand
          over sensitive documents until you know who the counterparty is and why they need the document.
        </p>

        <h2>Understanding Dutch Rental Contracts</h2>

        <p>
          The Netherlands has strong tenant protections, but you still need to understand what you are signing.
          Your contract should clearly state the rent amount and payment terms, deposit details including
          amount and return conditions, contract duration and notice periods, included utilities and shared
          costs, house rules and restrictions, and maintenance responsibilities.
        </p>

        <p>
          Be alert for red flags in contracts: vague language about deposit returns, pressure to sign without
          time for review, or requests for fees that are not clearly explained. When in doubt, consult your
          university’s housing office or student support resources, and compare against official guidance.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Bright apartment living room for an in-person rental viewing"
          />
          <figcaption>Always review rental contracts carefully and seek legal advice if something seems unclear.</figcaption>
        </figure>

        <h2>Financial Safety Measures</h2>

        <p>
          Keep proof of all payments and avoid cash without receipts. Use traceable bank transfers, never pay
          before viewing and signing, verify bank account ownership, and store all receipts and communication.
        </p>

        <h2>Safety When Meeting Potential Roommates</h2>

        <p>
          When meeting potential roommates for the first time, arrange to meet in a public place. Bring a
          friend or let someone know your whereabouts. Trust your instincts if something feels off. Keep the
          first interactions low-risk until you have verified identities and basic details.
        </p>

        <h2>Municipal Registration and Insurance</h2>

        <p>
          Dutch law requires registering your address with the local municipality (gemeente) within five days. This is essential for obtaining a BSN, opening a bank account, and accessing healthcare. Landlords must cooperate - refusal is a red flag. Consider liability insurance (aansprakelijkheidsverzekering) to cover accidental damage to others, and contents insurance (inboedelverzekering) to protect personal belongings. Check whether your contract requires specific coverage.
        </p>

        <h2>How Domu Match Protects You</h2>

        <p>
          Domu Match includes verification and safe messaging features. Regardless of what platform you use, the
          key safety principle is the same: do not let urgency push you into sharing documents or sending money
          before you have verified the counterparty.
        </p>

        <p>
          If you do share documents, share the minimum, watermark them where appropriate, and confirm the
          purpose. Our <Link href="/privacy">privacy policy</Link> explains how data is handled on this site.
        </p>

        <h2>What to Do If You Suspect Fraud</h2>

        <p>
          If you suspect you have encountered a rental scam, stop communication immediately. Report the listing to the platform and, if necessary, to the police. Contact ACM or Consumentenbond for guidance, and warn other students through university channels.
        </p>

        <h2>Conclusion</h2>

        <p>
          Navigating the Dutch rental market safely requires vigilance, knowledge, and patience. Pressure is
          normal, but skipping verification exposes you to risk. Follow this checklist, understand your rights,
          and treat urgency as a warning sign. Legitimate landlords and roommates will respect thorough
          verification. If they refuse, walk away.
        </p>
      </div>
    )
  },
  nl: {
    title: 'Veiligheidschecklist voor studenthuurders',
    excerpt:
      'Een praktische veiligheidschecklist voor huren in Nederland: advertenties verifiëren, contracten lezen, veelvoorkomende fraude herkennen en jezelf beschermen vóór je borg betaalt.',
    publishDate: '2025-11-10',
    readTime: '5 min lezen',
    relatedLinks: [
      {
        title: 'Privacybeleid',
        href: '/privacy',
        description:
          'Waar je op moet letten bij het delen van documenten, bankgegevens en persoonsgegevens tijdens je zoektocht.',
      },
      {
        title: 'Veiligheid & beveiliging',
        href: '/safety',
        description:
          'Algemene veiligheidsinformatie en hoe Domu Match veiligheid benadert in het product.',
      },
      {
        title: 'Huisvesting',
        href: '/housing',
        description:
          'Achtergrondbronnen voor studentenhuisvesting zoeken in Nederland.',
      }
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Een krappe woningmarkt biedt kansen voor oplichters en malafide advertenties. Het patroon is
          voorspelbaar: haast, druk, en vragen om geld of documenten vóórdat je weet met wie je te maken hebt.
          Deze checklist helpt je het proces net genoeg te vertragen om jezelf te beschermen.
        </p>

        <p>
          Als je de Nederlandse huurregels kent, rode vlaggen herkent en een goede verificatieprocedure volgt, bescherm je jezelf tegen geldverlies, onveilige situaties en juridische problemen. Deze gids helpt je veilig en zeker door het huurproces.
        </p>

        <h2>Zo vaak komt huurfraude voor</h2>

        <p>
          In de studentenmarkt duiken geregeld nepadvertenties, valse contracten en gestolen identiteiten op. Oplichters misbruiken de woningnood door niet-bestaande kamers te verhuren of borg te eisen voor huizen die ze niet bezitten. Instellingen als de Autoriteit Consument & Markt (ACM) en Consumentenbond waarschuwen hier regelmatig voor.
        </p>

        <p>
          Veelgebruikte trucs zijn nepadvertenties op populaire platforms, vragen om vooruitbetaling vóór een
          bezichtiging, &quot;verhuurders&quot; die in het buitenland zouden zitten en niet kunnen afspreken,
          druk om meteen te tekenen zonder contractreview, en persoonlijke documenten of financiële info vragen
          vóór verificatie. Onze <Link href="/housing">huisvestingszoekfunctie</Link> bundelt achtergrondbronnen.
        </p>

        <h2>Checklist vóórdat je tekent</h2>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Huurcontract en papieren op een bureau met een pen"
          />
          <figcaption>Verifieer de verhuurder en bekijk de woning persoonlijk voordat je tekent.</figcaption>
        </figure>

        <p>
          Ga alleen verder als je zeker weet dat de verhuurder bevoegd is. Vraag om een geldig ID - paspoort of Nederlandse ID-kaart - en controleer of de naam overeenkomt met de eigenaar. Via het Kadaster kun je eigendom controleren. Spreek elkaar in het echt; alleen online contact is een rode vlag. Controleer contactgegevens en gebruik traceerbare telefoonnummers en e-mails.
        </p>

        <p>
          Betaal nooit borg of teken nooit zonder bezichtiging. Echte verhuurders regelen graag een viewing.
          Controleer het adres, let op rookmelders, sloten en brandveiligheid, leg de staat vast met foto&apos;s
          en video&apos;s, en praat met huidige bewoners als dat kan. Ga je in een bestaand huis wonen? Ontmoet
          elkaar persoonlijk en deel geen gevoelige documenten voordat je weet wie de tegenpartij is en waarom
          die het document nodig heeft.
        </p>

        <h2>Snap je contract</h2>

        <p>
          Nederlandse huurders worden goed beschermd, maar dan moet je het contract begrijpen. De Wet goed verhuurderschap (2023) verplicht eerlijke verhuur. Je contract moet huurprijs, betalingstermijn en betaalmethode bevatten, borgbedrag en terugbetalingstermijn, contractduur en opzegtermijnen, welke nutsvoorzieningen zijn inbegrepen, huisregels, en wie verantwoordelijk is voor onderhoud.
        </p>

        <p>
          Let op rode vlaggen: bemiddelingskosten die illegaal bij de huurder worden neergelegd, onduidelijke taal over huurverhogingen of borg, onredelijke beperkingen op jouw rechten, druk om meteen te tekenen. Twijfel? Vraag advies bij de juridische dienst van je hogeschool, de Woonlijn of Consumentenbond. Lees meer op onze <Link href="/safety">veiligheidspagina</Link>.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Lichte woonkamer van een appartement voor een bezichtiging"
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
          Als je documenten deelt, deel het minimum, overweeg watermerken, en controleer het doel. Ons{' '}
          <Link href="/privacy">privacybeleid</Link> legt uit hoe data op deze site wordt behandeld.
        </p>

        <h2>Wat als je fraude vermoedt?</h2>

        <p>
          Stop direct met communiceren. Meld de advertentie bij het platform en eventueel bij de politie. Vraag advies bij de ACM of Consumentenbond. Waarschuw andere studenten via universitaire kanalen.
        </p>

        <h2>Conclusie</h2>

        <p>
          Veilig huren vraagt om alertheid en kennis. De woningnood zorgt voor haast, maar het overslaan van
          checks levert grotere problemen op. Volg deze checklist, ken je rechten en behandel urgentie als een
          waarschuwing. Eerlijke verhuurders en huisgenoten hebben begrip voor een grondige check. Als ze dat
          niet willen, bedank vriendelijk en loop weg. Je veiligheid is de extra tijd waard.
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
