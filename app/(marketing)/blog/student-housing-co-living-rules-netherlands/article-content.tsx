'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'Student Co-Living Rules Are Blocking Dutch Housing Supply',
    excerpt:
      'National policy wants easier room sharing, but municipal parking norms, permit rules, and split-housing limits still remove thousands of student rooms from the market each year.',
    publishDate: '2026-07-01',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage Is a Retention Line Item',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How Dutch room scarcity shows up in commutes, counselling load, and completion risk beyond the rent table.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Why room access is an integration indicator for international arrivals, not a side file in orientation week.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Practical steps for verifying listings, reading contracts, and avoiding common scam patterns in the Dutch rental market.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates usually centre on rent caps, landlord exits, and how many rooms get built each
          year. Less visible, but equally structural, is a layer of <strong>municipal co-living rules</strong> that
          decide whether a house with three bedrooms can legally house three students at all. National politicians talk
          about making room sharing easier. In practice, parking norms, permit requirements, and local fears of
          overcrowding still block supply that already exists on paper.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Shared kitchen in a Dutch student house - co-living rules and municipal permits shape how many rooms are legally rentable"
          />
          <figcaption>
            A spare bedroom only counts as housing supply if local rules allow three independent tenants behind one
            front door.
          </figcaption>
        </figure>

        <h2>The supply math students never see</h2>

        <p>
          Kences, the Dutch knowledge centre for student housing, estimates the national room shortage at roughly{' '}
          <strong>21,000 units</strong> in the 2024-2025 academic cycle, with projections rising to between 26,000 and
          63,200 by 2032-2033 if private landlords keep selling and co-living stays difficult (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those figures land in headlines about students giving up on moving out. Behind them sits a quieter
          mechanism: rooms that could exist inside existing buildings never reach the market because a gemeente treats
          three roommates as three households that each need a parking space.
        </p>

        <p>
          The chart below shows how Kences projects the shortage may widen even as student enrolment is expected to
          flatten. The gap is driven less by demand spikes than by shrinking private supply and stalled turnover among
          graduates who cannot move into regular rental housing.
        </p>

        <BlogBarChart
          data={[
            { label: '2024-25', value: 21000 },
            { label: '2032-33 (low)', value: 26000 },
            { label: '2032-33 (high)', value: 63200 },
          ]}
          yLabel="Estimated shortage"
          unit="rooms"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting, figures reported via NOS, 2025."
        />

        <p>
          Universities and municipalities both track enrolment and completion. Few publish how many legally rentable
          rooms disappear when a landlord needs a permit to house a third tenant, or when parking norms make splitting a
          family home uneconomical. That blind spot matters because, as reporting on the broader{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            student housing shortage and retention
          </Link>{' '}
          shows, room access is already shaping who stays near campus and who commutes from a parental home.
        </p>

        <h2>When three roommates need a permit</h2>

        <p>
          Since the Wet betaalbare huur took effect, renting to more than two unrelated tenants often requires a
          municipal permit (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Kences director Jolan de Bie has argued that many gemeenten still refuse such permits, pushing private
          owners to sell rather than navigate capped rents and administrative friction. In Utrecht alone, available
          student rooms fell by an estimated <strong>32 percent</strong> in 2025 compared with the prior year, with
          landlord sales cited as a major driver (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <p>
          The Landelijke Studentenvakbond (LSVb) surveyed fifteen student cities and found that local rules frequently
          make intentional co-living harder than the national coalition agreement intends. The union calls on gemeenten
          to relax parking requirements, ease rules for living above shops, and allow permit-free room sharing for
          small groups where nuisance risk is low. Kences has made a similar plea: permit-free sharing for up to three
          or four tenants, paired with targeted rent support for students in private rooms (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Parking rules written for cars, not cyclists</h3>

        <p>
          Natuur &amp; Milieu research, cited by NOS in March 2026, identifies <strong>parking norms</strong> as the
          single largest barrier to splitting and sharing homes (
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). When each additional household triggers a parking-place requirement, a student house with no car need still
          fails zoning checks. Aniek Blokzijl of Natuur &amp; Milieu notes the mismatch bluntly: in neighbourhoods where
          most residents bike, treating every extra tenant as a new car is wasteful policy.
        </p>

        <p>
          For international students, who already face longer searches and institution-level warnings about securing
          housing before arrival (
          <a href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further" target="_blank" rel="noreferrer">
            Nuffic, 2024
          </a>
          ), municipal friction adds another filter. As covered in our analysis of{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international student housing and integration risk
          </Link>
          , room scarcity does not only delay move-in. It shapes social networks, language practice, and whether students
          feel the city is workable at all.
        </p>

        <h2>A patchwork, not a playbook</h2>

        <p>
          Coalition documents promise simpler rules for verkamering and room rental. Implementation varies sharply by
          gemeente. Nijmegen has relaxed sharing policy and is working toward permit-free rental of three rooms;
          Beverwijk tightened split-and-share rules in 2026 citing noise, liveability, and parking complaints (
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Arnhem is still weighing exceptions for housing corporations after years of anti-slumlord rules that also
          blocked legitimate sharing.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Rental contract and keys on a desk - Dutch student renters navigate national rent law and local co-living permits"
          />
          <figcaption>
            National rent law sets the price ceiling. Local permits decide whether three signed contracts are legal in
            the first place.
          </figcaption>
        </figure>

        <p>
          Platform31 adviser Frank Wassenberg told NOS that many gemeenten intellectually support sharing but lack
          operational follow-through. The Vereniging van Nederlandse Gemeenten (VNG) acknowledges uneven progress and
          stresses that cities want guardrails against overcrowding and exploitative landlords in vulnerable
          neighbourhoods. That tension is real. The student housing crisis suggests the guardrails are also catching
          ordinary shared flats where turnover, not nuisance, is the issue.
        </p>

        <h2>What students and cities should watch next</h2>

        <p>
          Three policy threads will shape the next academic year. First, cabinet plans to expand temporary student
          contracts and ease some rent-law constraints, reported by NOS in June 2026, may bring marginal supply back if
          landlords see predictable exit clauses (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Second, national guidance on when gemeenten may restrict verkamering should, in theory, reduce arbitrary
          blocks. Third, coalition negotiations in student cities this autumn will test whether LSVb recommendations on
          parking and shop-top housing move from manifesto lines into zoning codes.
        </p>

        <p>
          For students signing leases this summer, the practical lesson is to verify <em>both</em> the contract and the
          household count. A fourth roommate without a permit can invalidate an entire arrangement and trigger fines for
          tenants and landlords alike. Guides on{' '}
          <Link href="/blog/safety-checklist-for-student-renters">rental safety and contract review</Link> remain
          relevant precisely because supply pressure pushes people toward informal arrangements.
        </p>

        <p>
          Housing infrastructure is not only cranes and campus beds. It is also the administrative layer that decides
          whether an existing kitchen can legally feed three degree programmes. Until national ambition and municipal
          practice align, co-living rules will keep subtracting rooms from a market that already runs short - and
          students will keep paying the difference in longer commutes, delayed independence, and stress that never
          appears on a university brochure.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-300">
          NOS. (2025). Steeds meer studenten geven de hoop om een kamer te vinden op.{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2025). Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2025). In strijd tegen kamertekort wil studentenbond dat woningdelen makkelijker wordt.{' '}
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2026). Woningdelen: de wil is er, maar niet overal komt het van de grond.{' '}
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2026). Kabinet wil sneller bouwen met prefabwoningen en versoepelt de huurwet.{' '}
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Nuffic. (2024). Growth international student population declines further.{' '}
          <a
            href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/growth-international-student-population-declines-further
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title:
      'Co-livingregels remmen het Nederlandse studentenhuisvestingsaanbod',
    excerpt:
      'Landelijk beleid wil woningdelen vergemakkelijken, maar gemeentelijke parkeernormen, vergunningen en splitsingsregels halen nog steeds duizenden studentenkamers uit de markt.',
    publishDate: '2026-07-01',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Studentenhuisvestingstekort als retentiepost',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe kamerschaarste zich uit in reistijd, begeleidingsdruk en studiesucces, ver buiten de huurprijs alleen.',
      },
      {
        title: 'Internationale studentenhuisvesting in Nederland',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Waarom kamertoegang een integratie-indicator is voor internationale aankomst, geen bijlage bij de introductieweek.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Praktische stappen voor het controleren van advertenties, contracten en veelvoorkomende fraudepatronen.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting draait vaak om huurplafonds, verkopen door verhuurders en nieuwbouw. Minder
          zichtbaar, maar minstens zo structureel, is een laag <strong>gemeentelijke co-livingregels</strong> die
          bepalen of een huis met drie slaapkamers überhaupt drie studenten mag huisvesten. Nationale politici spreken
          over makkelijker woningdelen. In de praktijk blokkeren parkeernormen, vergunningen en angst voor overbewoning
          nog steeds aanbod dat op papier al bestaat.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Gedeelde keuken in een Nederlands studentenhuis - co-livingregels en gemeentelijke vergunningen bepalen hoeveel kamers legaal verhuurbaar zijn"
          />
          <figcaption>
            Een vrije slaapkamer telt alleen als aanbod als lokale regels drie onafhankelijke huurders achter één voordeur
            toestaan.
          </figcaption>
        </figure>

        <h2>De voorraadberekening die studenten niet zien</h2>

        <p>
          Kences schat het landelijke kamertekort op ongeveer <strong>21.000 eenheden</strong> in het collegejaar
          2024-2025, met een verwachte stijging naar 26.000 tot 63.200 in 2032-2033 als particuliere verhuurders blijven
          verkopen en woningdelen moeilijk blijft (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Die cijfers verschijnen in koppen over studenten die de hoop op uitwonen opgeven. Daarachter zit een stiller
          mechanisme: kamers die in bestaande panden konden bestaan, komen nooit op de markt omdat een gemeente drie
          huisgenoten behandelt als drie huishoudens die elk een parkeerplaats nodig hebben.
        </p>

        <p>
          De grafiek hieronder laat zien hoe Kences verwacht dat het tekort kan oplopen, zelfs als de instroom naar
          verwachting afvlakt. De kloof wordt vooral gedreven door krimpend particulier aanbod en stilstaande doorstroom
          van afgestudeerden die niet op de reguliere huurmarkt kunnen.
        </p>

        <BlogBarChart
          data={[
            { label: '2024-25', value: 21000 },
            { label: '2032-33 (laag)', value: 26000 },
            { label: '2032-33 (hoog)', value: 63200 },
          ]}
          yLabel="Geschat tekort"
          unit="kamers"
          caption="Bron: Kences Landelijke Monitor Studentenhuisvesting, cijfers via NOS, 2025."
        />

        <p>
          Universiteiten en gemeenten volgen instroom en studiesucces. Weinigen publiceren hoeveel legaal verhuurbare
          kamers verdwijnen wanneer een verhuurder een vergunning nodig heeft voor een derde huurder, of wanneer
          parkeernormen het splitsen van een gezinswoning onrendabel maken. Die blinde vlek telt, want zoals eerder
          beschreven in ons stuk over het{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            studentenhuisvestingstekort en retentie
          </Link>{' '}
          beïnvloedt kamertoegang al wie dicht bij de campus woont en wie van huis pendelt.
        </p>

        <h2>Wanneer drie huisgenoten een vergunning nodig hebben</h2>

        <p>
          Sinds de Wet betaalbare huur is verhuren aan meer dan twee ongerelateerde huurders vaak vergunningsplichtig (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Kences-directeur Jolan de Bie stelt dat veel gemeenten dergelijke vergunningen weigeren, waardoor
          particuliere eigenaren verkopen in plaats van gedempte huren en administratie te accepteren. Alleen al in
          Utrecht daalde het beschikbare studentenaanbod in 2025 met naar schatting <strong>32 procent</strong> ten
          opzichte van het jaar ervoor, mede door verkopen (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <p>
          De LSVb onderzocht vijftien studentensteden en constateerde dat lokale regels bewust woningdelen vaak
          moeilijker maken dan het coalitieakkoord beoogt. De bond roept gemeenten op parkeereisen te versoepelen, regels
          voor wonen boven winkels aan te passen en vergunningsvrij delen toe te staan voor kleine groepen met laag
          overlastrisico. Kences pleit voor vergelijkbaar beleid: vergunningsvrij delen tot drie of vier personen,
          gecombineerd met gerichte huurondersteuning voor studenten in particuliere kamers (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Parkeerregels voor auto&apos;s, niet voor fietsers</h3>

        <p>
          Onderzoek van Natuur &amp; Milieu, geciteerd door NOS in maart 2026, noemt <strong>parkeernormen</strong> de
          grootste belemmering voor splitsen en delen (
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Wanneer elk extra huishouden een parkeerplaats vereist, faalt een studentenhuis zonder auto alsnog op
          bestemmingsplannen. Aniek Blokzijl van Natuur &amp; Milieu wijst op de mismatch: in wijken waar vrijwel
          iedereen fietst, is elke extra huurder als nieuwe auto beleid verspilling.
        </p>

        <p>
          Voor internationale studenten, die al langere zoektochten kennen en waarschuwingen krijgen om vóór aankomst
          huisvesting te regelen (
          <a href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further" target="_blank" rel="noreferrer">
            Nuffic, 2024
          </a>
          ), voegt gemeentelijke frictie nog een filter toe. Zoals beschreven in onze analyse van{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale studentenhuisvesting en integratierisico
          </Link>{' '}
          vertraagt kamerschaarste niet alleen de verhuizing. Het beïnvloedt sociale netwerken, taalgebruik en het
          gevoel dat de stad werkbaar is.
        </p>

        <h2>Een lappendeken, geen draaiboek</h2>

        <p>
          Coalitiedocumenten beloven eenvoudigere regels voor verkamering en kamerverhuur. De uitvoering verschilt sterk
          per gemeente. Nijmegen heeft delen versoepeld en werkt aan vergunningsvrije verhuur van drie kamers;
          Beverwijk verscherpte in 2026 de regels vanwege klachten over geluid, leefbaarheid en parkeren (
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Arnhem weegt nog uitzonderingen voor woningcorporaties af, na jaren van anti-huisjesmelkerregels die ook
          legitiem delen bemoeilijkten.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Huurcontract en sleutels op een bureau - Nederlandse studenthuurders navigeren landelijke huurwet én lokale co-livingvergunningen"
          />
          <figcaption>
            Landelijke huurwet bepaalt het plafond. Lokale vergunningen bepalen of drie getekende contracten überhaupt
            legaal zijn.
          </figcaption>
        </figure>

        <p>
          Platform31-adviseur Frank Wassenberg vertelde NOS dat veel gemeenten delen intellectueel steunen maar
          operationeel achterlopen. De VNG erkent ongelijke voortgang en benadrukt dat steden waarborgen willen tegen
          overbewoning en uitbuiting in kwetsbare wijken. Die spanning is reëel. De studentenhuisvestingscrisis suggereert
          dat de waarborgen ook gewone gedeelde flats raken waar omloop, niet overlast, het probleem is.
        </p>

        <h2>Wat studenten en steden de komende maanden moeten volgen</h2>

        <p>
          Drie beleidslijnen bepalen het komende collegejaar. Ten eerste kunnen kabinetsplannen voor bredere tijdelijke
          studentencontracten en versoepeling van de huurwet marginaal aanbod terugbrengen als verhuurders voorspelbare
          vertrekclausules zien (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Ten tweede zou landelijke richting over verkamering willekeur moeten verminderen. Ten derde testen
          coalitieonderhandelingen in studentensteden dit najaar of LSVb-adviezen over parkeren en wonen boven winkels
          bestemmingsplannen worden.
        </p>

        <p>
          Voor studenten die deze zomer tekenen, geldt: controleer <em>zowel</em> het contract als het aantal bewoners.
          Een vierde huisgenoot zonder vergunning kan een hele constructie ongeldig maken en boetes opleveren. Gidsen
          over{' '}
          <Link href="/blog/safety-checklist-for-student-renters">huurveiligheid en contractcontrole</Link> blijven
          relevant omdat schaarste mensen naar informele constructies duwt.
        </p>

        <p>
          Huisvestingsinfrastructuur is niet alleen kranen en campusbetten. Het is ook de administratieve laag die
          bepaalt of een bestaande keuken legaal drie opleidingen kan bedienen. Tot nationale ambitie en gemeentelijke
          praktijk samenkomen, blijven co-livingregels kamers aftrekken van een markt die al tekortschiet - en betalen
          studenten het verschil in langere reistijden, uitgesteld zelfstandig wonen en stress die nooit op een
          universiteitsbrochure staat.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-300">
          NOS. (2025). Steeds meer studenten geven de hoop om een kamer te vinden op.{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2025). Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2025). In strijd tegen kamertekort wil studentenbond dat woningdelen makkelijker wordt.{' '}
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2026). Woningdelen: de wil is er, maar niet overal komt het van de grond.{' '}
          <a
            href="https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2607352-woningdelen-de-wil-is-er-maar-niet-overal-komt-het-van-de-grond
          </a>
        </p>
        <p className="text-sm text-slate-300">
          NOS. (2026). Kabinet wil sneller bouwen met prefabwoningen en versoepelt de huurwet.{' '}
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Nuffic. (2024). Growth international student population declines further.{' '}
          <a
            href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/growth-international-student-population-declines-further
          </a>
        </p>
      </div>
    ),
  },
}

export function StudentHousingCoLivingRulesArticle() {
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
