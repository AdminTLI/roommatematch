'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'International Student Housing Rights in the Netherlands: What Happens After Move-In',
    excerpt:
      'Finding a room is only the first hurdle. Dutch student unions logged 263 international housing help requests in 2026, from bedbugs to illegal rents, as shortage pressure meets weak enforcement.',
    publishDate: '2026-07-08',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contract red flags, deposit norms, and verification habits before you transfer money or sign.',
      },
      {
        title: 'International Student Housing and Integration Risk',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'How national shortage figures connect to loneliness, retention, and municipal routing.',
      },
      {
        title: 'Universities and cities we track',
        href: '/universities',
        description:
          'Context on how Dutch institutions sit inside different municipal housing regimes.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Public debate about international students in the Netherlands often stops at enrolment numbers and room shortages. Less visible is what happens{' '}
          <strong>after</strong> someone signs a contract: bedbug infestations left untreated, rooms without heating or working plumbing, rents far above legal limits, and scams that target newcomers who cannot read Dutch housing law. In early 2026, the Landelijke Studentenvakbond (LSVb) reported that its Housing Hotline had already received{' '}
          <strong>263 help requests from international students</strong> that year (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). The headline is not only about bad landlords. It is about a market where scarcity removes leverage.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Rental documents and keys on a desk — international student tenant rights and contract review in the Netherlands"
          />
          <figcaption>
            A signed contract does not end housing risk for international students when enforcement pathways are unclear or fear of eviction silences complaints.
          </figcaption>
        </figure>

        <h2>Why the shortage follows you into the contract</h2>

        <p>
          National monitoring has documented a structural gap between students who want a room and students who have one. NOS reporting on Kences&apos;s Landelijke Monitor Studentenhuisvesting cited roughly{' '}
          <strong>21,000</strong> missing rooms at publication, with projections ranging up to roughly{' '}
          <strong>63,200</strong> by 2032-2033 under stressed supply assumptions (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). When supply tightens, bargaining power shifts to whoever controls the keys. LSVb chair Evy Kras told NOS that international students are &quot;forced to choose landlords who ignore almost all the rules&quot; because alternatives are scarce (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <p>
          That dynamic intersects with price pressure. Kamernet data reported via NOS put the average student room rent at roughly{' '}
          <strong>683 euros</strong> per month in early 2025, up more than 6 percent year-on-year (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Students arriving from abroad often face compressed search windows, language barriers, and unfamiliarity with point-based rent caps under the Wet betaalbare huur. The result is not random bad luck. It is a predictable pattern when demand outruns both supply and accessible legal literacy.
        </p>

        <h2>What the Housing Hotline caseload actually contains</h2>

        <p>
          The LSVb&apos;s 263 international cases are not a single story type. NOS listed illegal rentals, unhygienic conditions, online fraud, and extreme rents (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). RTV Utrecht quoted an anonymous student describing a bedbug infestation where neither the rental agency nor the landlord responded after repeated contact. Cases like that illustrate a secondary failure mode: not only exploitation, but{' '}
          <strong>institutional non-response</strong> when a tenant lacks local networks.
        </p>

        <p>
          LSVb officials also noted that many international students did not seek help at all, either because they did not know how, or because they feared losing the only room they could find (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). That fear aligns with broader LSVb reporting: students on temporary contracts often avoid action because eviction anxiety outweighs the prospect of a legal win (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>The huurteam gap</h3>

        <p>
          A further structural layer is the retreat of municipal huurteams in cities such as Utrecht and Rotterdam. These teams inform tenants of their rights and can flag market problems earlier. LSVb told NOS that their disappearance makes both Dutch and international students more vulnerable (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Rights on paper matter less when the local pathway to assert them is thin.
        </p>

        <h2>Rights exist, but the activation rate is the bottleneck</h2>

        <p>
          Dutch rental law does offer remedies: rent assessment procedures, reporting to municipalities, and, where huurteams remain active, structured complaints. LSVb data cited in NOS reporting on rising rents noted that in roughly{' '}
          <strong>80 percent</strong> of cases where students pursued legal steps through huurteams, tenants prevailed (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The gap is not primarily legal weakness. It is that international students disproportionately never reach that stage.
        </p>

        <p>
          Universities have published arrival guidance for years, yet ISO-led surveys reported via NOS have repeatedly flagged information gaps: large shares of international students unaware of study finance eligibility, healthcare rules, or local support channels (
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ). Housing rights information sits in the same bucket. For a fuller pre-sign checklist, see{' '}
          <Link href="/blog/safety-checklist-for-student-renters">Safety Checklist for Student Renters</Link>. For how room access shapes integration before problems escalate, see{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            International Student Housing and Integration Risk
          </Link>
          .
        </p>

        <h2>What institutions and cities could treat as infrastructure</h2>

        <p>
          Three evidence-aligned priorities emerge from the 2025-2026 reporting cycle, without requiring new speculative statistics.
        </p>

        <ul>
          <li>
            <strong>Pre-arrival rights briefings in plain English</strong>, linked to municipal complaint routes, not buried in PDF annexes.
          </li>
          <li>
            <strong>Restoring or funding huurteam capacity</strong> in high-intake cities, because early intervention is cheaper than crisis casework.
          </li>
          <li>
            <strong>Separating housing misconduct metrics from enrolment metrics</strong>, so integration policy tracks post-move-in conditions, not only visa counts.
          </li>
        </ul>

        <p>
          The LSVb has also argued for easing municipal rules that block lawful room sharing, including parking norms tied to occupant counts, as one supply-side lever (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That debate is contested, but it underscores a shared premise: when legal rooms are scarce, illegal ones fill the gap.
        </p>

        <h2>The wellbeing ledger beyond rent</h2>

        <p>
          Housing misconduct is not only a financial line item. ISO survey reporting relayed by NOS has linked international student wellbeing strain to housing instability and weak information access (
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ). Living with unresolved infestation, unsafe heat, or the constant threat of arbitrary eviction competes with the same cognitive bandwidth universities measure as study engagement. The hidden costs of housing friction, including deposit loss and forced moves, are unpacked in{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">The Hidden Cost of the Wrong Roommate</Link>.
        </p>

        <p>
          Dutch cities and institutions publish guidance on shared living and student routes through municipal portals. Editorial coverage on this site, including background on{' '}
          <Link href="/about">how research-led housing commentary is produced</Link>, treats those sources as part of the public record, not as product recommendations.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Studentenvakbond: misstanden bij huisvesting internationale studenten neemt toe</em>.{' '}
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>.{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>.{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2024). <em>Enquête: toestroom buitenlandse studenten zet kwaliteit onder druk</em>.{' '}
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title:
      'Huurrechten voor internationale studenten in Nederland: wat er na het intrekken misgaat',
    excerpt:
      'Een kamer vinden is niet het eindpunt. De LSVb registreerde in 2026 al 263 hulpverzoeken van internationale studenten, van bedwantsen tot illegale huren, terwijl schaarste en angst om te klagen samenkomen.',
    publishDate: '2026-07-08',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contractsignalen, borgnormen en verificatie voordat je geld overmaakt of tekent.',
      },
      {
        title: 'Internationale studentenhuisvesting en integratierisico',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Hoe landelijke tekortcijfers samenhangen met eenzaamheid, doorstroom en gemeentelijk beleid.',
      },
      {
        title: 'Universiteiten en steden die we volgen',
        href: '/universities',
        description:
          'Context over hoe Nederlandse instellingen in verschillende woonregimes opereren.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het publieke debat over internationale studenten in Nederland stopt vaak bij instroomcijfers en kamertekorten. Minder zichtbaar is wat er gebeurt{' '}
          <strong>ná</strong> het tekenen van een contract: onbehandelde bedwantsen, kamers zonder verwarming of werkend sanitair, huren ver boven de wettelijke grens, en oplichting gericht op nieuwkomers die het Nederlandse huurrecht niet kennen. Begin 2026 meldde de Landelijke Studentenvakbond (LSVb) dat haar Housing Hotline dat jaar al{' '}
          <strong>263 hulpverzoeken van internationale studenten</strong> had ontvangen (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Het gaat niet alleen om slechte verhuurders. Het gaat om een markt waarin schaarste onderhandelingsruimte wegneemt.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Huurcontract en sleutels op een bureau — huurrechten en contractcontrole voor internationale studenten in Nederland"
          />
          <figcaption>
            Een getekend contract beëindigt het woonrisico niet als handhavingsroutes onduidelijk zijn of angst voor ontruiming klachten dempt.
          </figcaption>
        </figure>

        <h2>Waarom het tekort je het contract in volgt</h2>

        <p>
          Landelijke monitoring documenteert een structurele kloof tussen studenten die op kamers willen en studenten die er wonen. NOS-berichtgeving over de Landelijke Monitor Studentenhuisvesting van Kences noemde bij publicatie ruwweg{' '}
          <strong>21.000</strong> ontbrekende kamers, met projecties tot ongeveer{' '}
          <strong>63.200</strong> in 2032-2033 onder stressscenario&apos;s (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Als het aanbod krimpt, verschuift macht naar wie de sleutels heeft. LSVb-voorzitter Evy Kras zei tegen NOS dat internationale studenten &quot;noodgedwongen kiezen voor verhuurders die vrijwel alle regels aan hun laars lappen&quot; omdat alternatieven schaars zijn (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <p>
          Die dynamiek raakt ook de prijs. Kamernet-cijfers via NOS kwamen begin 2025 uit op gemiddeld ruwweg{' '}
          <strong>683 euro</strong> per maand voor een studentenkamer, meer dan 6 procent hoger dan een jaar eerder (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Internationale studenten hebben vaak een korte zoekperiode, taalbarrières en weinig vertrouwdheid met het puntensysteem van de Wet betaalbare huur. Het patroon is voorspelbaar wanneer vraag zowel aanbod als toegankelijke rechtskennis overtreft.
        </p>

        <h2>Wat de Housing Hotline-cijfers laten zien</h2>

        <p>
          De 263 internationale zaken van de LSVb zijn geen enkel verhaal. NOS noemde illegale verhuur, onhygiënische omstandigheden, online fraude en extreme huren (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). RTV Utrecht citeerde een anonieme student met een bedwantsenplaag waarbij verhuurbedrijf en huisbaas niet reageerden. Zulke gevallen tonen een tweede faalmodes: niet alleen uitbuiting, maar ook{' '}
          <strong>institutioneel niet-reageren</strong> wanneer een huurder geen lokaal netwerk heeft.
        </p>

        <p>
          LSVb meldde ook dat veel internationale studenten helemaal geen hulp zochten, omdat ze niet wisten hoe, of bang waren hun enige kamer te verliezen (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Die angst sluit aan bij bredere LSVb-signalen: studenten met tijdelijke contracten laten klachten vaak liggen uit vrees voor ontruiming (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Het gat rond huurteams</h3>

        <p>
          Een structurele laag is het verdwijnen van gemeentelijke huurteams in steden als Utrecht en Rotterdam. Die teams informeren huurders over rechten en signaleren marktproblemen vroeg. De LSVb zei tegen NOS dat daardoor zowel Nederlandse als internationale studenten kwetsbaarder worden (
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Rechten op papier tellen minder wanneer het lokale pad om ze in te roepen dun is.
        </p>

        <h2>Rechten bestaan, maar activering is de bottleneck</h2>

        <p>
          Het Nederlandse huurrecht biedt remedies: huurprijschecks, meldingen bij gemeenten en, waar huurteams actief zijn, gestructureerde klachten. LSVb-data in NOS-berichtgeving over stijgende huren meldde dat in ongeveer{' '}
          <strong>80 procent</strong> van de zaken waarin studenten via huurteams juridische stappen zetten, huurders gelijk kregen (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De zwakte zit niet primair in de wet. Internationale studenten bereiken die fase onevenredig vaak niet.
        </p>

        <p>
          Instellingen publiceren al jaren aankomstinformatie, maar ISO-enquêtes via NOS wezen herhaaldelijk op informatiegaten: grote groepen internationale studenten wist niet van studiefinanciering, zorgverzekering of lokale hulp (
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ). Huurrechten zitten in dezelfde categorie. Zie voor een checklist vóór het tekenen{' '}
          <Link href="/blog/safety-checklist-for-student-renters">Veiligheidschecklist voor studenthuurders</Link>. Voor hoe kamer-toegang integratie beïnvloedt vóór problemen escaleren, zie{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            Internationale studentenhuisvesting en integratierisico
          </Link>
          .
        </p>

        <h2>Wat instellingen en steden als infrastructuur kunnen behandelen</h2>

        <p>
          Drie evidence-gedreven prioriteiten uit de berichtgeving van 2025-2026, zonder nieuwe speculatieve cijfers.
        </p>

        <ul>
          <li>
            <strong>Huurrechten vóór aankomst in begrijpelijk Engels</strong>, gekoppeld aan gemeentelijke meldroutes, niet verstopt in PDF-bijlagen.
          </li>
          <li>
            <strong>Huurteamcapaciteit herstellen of financieren</strong> in instroomsteden, omdat vroege interventie goedkoper is dan crisishulp.
          </li>
          <li>
            <strong>Woonmisstanden loskoppelen van alleen instroomcijfers</strong>, zodat integratiebeleid ook na-intrek-omstandigheden meet.
          </li>
        </ul>

        <p>
          De LSVb pleit ook voor versoepeling van gemeentelijke regels die legaal woningdelen bemoeilijken, waaronder parkeernormen per bewoner (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Dat debat is omstreden, maar de premisse is gedeeld: wanneer legale kamers schaars zijn, vullen illegale het gat.
        </p>

        <h2>Het welzijnsrekeningstuk naast de huur</h2>

        <p>
          Woonmisstand is niet alleen financieel. ISO-enquêtes via NOS koppelen welzijnsdruk bij internationale studenten aan woononzekerheid en zwakke informatie (
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ). Leven met onopgeloste plagen, onveilige verwarming of voortdurende ontruimingsangst concurreert met dezelfde cognitieve bandbreedte die instellingen als studiebetrokkenheid meten. Verborgen kosten van woonfrictie, inclusief borgverlies en gedwongen verhuizingen, staan in{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">De verborgen kosten van de verkeerde huisgenoot</Link>.
        </p>

        <p>
          Nederlandse steden en instellingen publiceren via gemeentelijke portals richtlijnen over samenwonen en studentenroutes. Redactionele dekking op deze site, inclusief achtergrond over{' '}
          <Link href="/about">hoe onderzoeksgerichte wooncommentaar tot stand komt</Link>, behandelt die bronnen als onderdeel van het publieke dossier, niet als productaanbevelingen.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Studentenvakbond: misstanden bij huisvesting internationale studenten neemt toe</em>.{' '}
          <a
            href="https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2619777-studentenvakbond-misstanden-bij-huisvesting-internationale-studenten-neemt-toe
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>.{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>.{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2024). <em>Enquête: toestroom buitenlandse studenten zet kwaliteit onder druk</em>.{' '}
          <a
            href="https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2441965-enquete-toestroom-buitenlandse-studenten-zet-kwaliteit-onder-druk
          </a>
        </p>
      </div>
    ),
  },
}

export function InternationalStudentHousingRightsArticle() {
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
