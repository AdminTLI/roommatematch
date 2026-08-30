'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'Student Housing Loneliness in the Netherlands: What the Data Actually Show',
    excerpt:
      'Room shortages, studio-heavy campuses, and a rising share of students living at home are reshaping Dutch student life. Kences and CBS figures explain why loneliness is now a housing indicator, not a personal failing.',
    publishDate: '2026-07-15',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'International Student Housing: Integration Risk',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'How national room-shortage signals connect to integration, retention, and municipal routing for mobile students.',
      },
      {
        title: 'Surviving the Winter Blues in Shared Living',
        href: '/blog/surviving-the-winter-blues',
        description:
          'Seasonal wellbeing pressures in student households, and why stable social routines at home matter.',
      },
      {
        title: 'An Introvert\'s Survival Guide to Shared Living',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'Quiet students still need predictable boundaries and low-friction neighbour contact, not constant social performance.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Loneliness among Dutch students is often discussed as a mental-health trend detached from bricks and mortar. That framing misses the point. National housing monitors, demographic research, and municipal reporting now describe the same mechanism:{' '}
          <strong>when stable, shared living becomes harder to access, students lose the everyday encounters that build belonging</strong>. The outcome is not only fewer nights out. It is fewer weak ties, weaker campus anchoring, and a growing share of young adults who complete degrees while still living in the parental home.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Quiet shared living room - student housing loneliness and the loss of everyday neighbour contact in the Netherlands"
          />
          <figcaption>
            Loneliness in student life is increasingly tied to housing supply and building form, not only to individual coping skills.
          </figcaption>
        </figure>

        <h2>The shrinking window for moving out</h2>

        <p>
          Research by Statistics Netherlands (CBS) and the Netherlands Interdisciplinary Demographic Institute (NIDI), reported by NOS in 2026, documents a clear shift since the 2015 introduction of the student loan system. Among graduates who finished in 2023,{' '}
          <strong>43 percent</strong> had lived at home for the entire five years before graduation, compared with <strong>31 percent</strong> among those who graduated in 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Students who did move out did so later: <strong>79 percent</strong> of the 2023 cohort still lived at home after their first study year, against <strong>63 percent</strong> of the 2016 cohort at the same stage (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <p>
          Kences, the national knowledge centre for student housing, links that pattern to affordability and scarcity. In the 2025 Landelijke Monitor Studentenhuisvesting, reported by NOS, students on average spend <strong>48 percent</strong> of their income on rent, while the share who actually live in a rented room has fallen even as desire to move out remains high (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Maaike Krom, chair of the Dutch National Student Union (LSVb), told NOS that financial pressure and the hunt for rooms erode wellbeing because students are &quot;always busy with the financial side&quot; (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          The chart below compares how many students lived in a rented room versus how many said they wanted to, now and roughly eight years earlier. The gap between wish and reality is modest on paper, but the downward trend in both lines is the signal policymakers should read.
        </p>

        <BlogBarChart
          data={[
            { label: 'In a room (now)', value: 44 },
            { label: 'Want a room (now)', value: 49 },
            { label: 'In a room (8y ago)', value: 52 },
            { label: 'Want a room (8y ago)', value: 59 },
          ]}
          yLabel="Share of students"
          valueFormat="percent"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting, figures reported via NOS, September 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>When students stop searching, isolation does not stop</h2>

        <p>
          Kences director Jolan de Bie told NOS that students are effectively giving up on finding a room because the shortage persists (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De Bie warned that students who remain at home miss part of their social-emotional development and can experience isolation and lower self-esteem because they stand partly outside student life (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That is not abstract sociology. Fewer local weak ties mean fewer study partners, fewer referrals into internships, and less spontaneous exposure to the city where an institution markets its graduate pipeline.
        </p>

        <p>
          Nuffic survey work on international graduates shows housing as a parallel stressor for mobile students: <strong>37 percent</strong> of alumni who left the Netherlands cited not finding proper housing as an important reason (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2024
          </a>
          ). Institutions increasingly discourage enrolment when a room is not secured a month before classes start (
          <a
            href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2025
          </a>
          ). For context on how Dutch cities and institutions sit inside different housing regimes, see the{' '}
          <Link href="/universities">universities overview</Link>.
        </p>

        <h2>Studio campuses and the &quot;social ghost neighbourhood&quot;</h2>

        <p>
          Supply numbers alone do not explain loneliness. Building form matters. On Utrecht Science Park (De Uithof), more than <strong>3,300 students</strong> live largely in single-room studios, NOS reported in 2025. Residents&apos; representative Jeroen Polman described neighbours passing each other without contact, with closed hospitality at weekends and few low-threshold meeting points (
          <a
            href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Students arriving from Limburg or Groningen without existing networks are especially exposed: &quot;They know nobody. And they learn nobody,&quot; Polman said (
          <a
            href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="internationalCampus"
            alt="Students on a university campus - social infrastructure and neighbour contact in Dutch student cities"
          />
          <figcaption>
            Campus master plans that prioritise self-contained studios can deliver beds while quietly removing the shared kitchens and corridors where everyday friendships start.
          </figcaption>
        </figure>

        <p>
          Contrast that with older student-house models where shared kitchens and hospiteren rituals created deliberate group selection. In Leiden, local reporting in 2025 cited a chamber-of-associations survey finding that <strong>52 student houses</strong> had closed or were at risk of closure, removing at least <strong>317 rooms</strong>, partly linked to verkamering rules and national tax pressure on landlords (
          <a
            href="https://nos.nl/regio/zh-west/artikel/649347-studentenkamercrisis-explodeert-amsterdamse-toestanden"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Students interviewed for that coverage argued that losing the right to choose housemates undermines group dynamics and wellbeing (
          <a
            href="https://nos.nl/regio/zh-west/artikel/649347-studentenkamercrisis-explodeert-amsterdamse-toestanden"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h2>What cities and institutions can measure</h2>

        <p>
          Treating loneliness as a counselling-only issue shifts responsibility onto individuals for a system outcome. More useful indicators for municipal and university dashboards include: the share of enrolled students living more than 45 minutes from campus; time-to-room for first-years; percentage of graduates still in student rooms after 12 months (Kences cites <strong>57 percent</strong> in recent monitoring, reported by NOS); and utilisation of communal space in new builds (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Wellbeing programming still matters. Articles on{' '}
          <Link href="/blog/surviving-the-winter-blues">seasonal mood strain in shared households</Link> and{' '}
          <Link href="/blog/introverts-survival-guide-shared-living">quiet students navigating communal homes</Link> describe micro-level coping. But macro-level policy must address the stock and shape of rooms. The Dutch government target of <strong>60,000</strong> additional affordable student homes by 2030, reported by NOS, frames scale, yet delivery in university cores remains constrained (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ).
        </p>

        <p>
          Editorial context on how housing evidence is handled in this publication is summarised on the <Link href="/about">about page</Link>. The through-line is consistent: loneliness among students is not a mystery app category. It is what happens when access to shared, affordable, neighbour-rich housing narrows year after year.
        </p>

        <h2>References</h2>

        <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
          <li>
            NOS. (2025). Steeds meer studenten geven de hoop op om een kamer te vinden.{' '}
            <a
              href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
            </a>
          </li>
          <li>
            NOS. (2026). Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen.{' '}
            <a
              href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
            </a>
          </li>
          <li>
            NOS. (2025). &apos;Sociale spookwijk&apos; moet gaan leven: buren Uithof vieren burendag.{' '}
            <a
              href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag
            </a>
          </li>
          <li>
            Nuffic. (2024). This is why international students stay (or leave) after graduating in the Netherlands.{' '}
            <a
              href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
              target="_blank"
              rel="noreferrer"
            >
              https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
            </a>
          </li>
        </ul>
      </div>
    ),
  },
  nl: {
    title:
      'Eenzaamheid en studentenhuisvesting: wat Nederlandse cijfers laten zien',
    excerpt:
      'Kamertekorten, studio&apos;s en meer thuiswonende studenten veranderen het studentenleven. Kences- en CBS-cijfers tonen waarom eenzaamheid een huisvestingsindicator is, geen persoonlijk tekort.',
    publishDate: '2026-07-15',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Internationale studentenhuisvesting en integratie',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Hoe landelijke tekortcijfers samenhangen met integratie, retentie en gemeentelijk beleid voor mobiele studenten.',
      },
      {
        title: 'De winterdip overleven in een studentenhuis',
        href: '/blog/surviving-the-winter-blues',
        description:
          'Seizoensgebonden welzijnsdruk in gedeelde woningen en waarom stabiele sociale routines thuis ertoe doen.',
      },
      {
        title: 'Overlevingsgids voor introverte studenten',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'Stille studenten hebben voorspelbare grenzen en laagdrempelig burencontact nodig, geen constante sociale prestatiedruk.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Eenzaamheid onder studenten wordt vaak besproken alsof het losstaat van huisvesting. Die framing mist de kern. Landelijke monitors, demografisch onderzoek en gemeentelijke rapportages beschrijven hetzelfde mechanisme:{' '}
          <strong>als stabiel, gedeeld wonen moeilijker wordt, verdwijnen de alledaagse ontmoetingen waar binding uit ontstaat</strong>. Het gevolg is niet alleen minder uitgaan, maar minder zwakke banden, minder verankering op de campus en een groeiend aandeel jongvolwassenen dat afstudeert terwijl ze nog thuis wonen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Rustige gedeelde woonkamer - eenzaamheid en het verlies van alledaags burencontact in Nederlandse studentenhuisvesting"
          />
          <figcaption>
            Eenzaamheid in het studentenleven hangt steeds vaker samen met aanbod en gebouwvorm, niet alleen met individuele coping.
          </figcaption>
        </figure>

        <h2>Het krimpende venster om uit huis te gaan</h2>

        <p>
          Onderzoek van het CBS en het NIDI, gerapporteerd door NOS in 2026, laat een duidelijke verschuiving zien sinds het leenstelsel in 2015. Van de afgestudeerden in 2023 woonde <strong>43 procent</strong> in de vijf jaar ervoor continu thuis, tegenover <strong>31 procent</strong> bij afgestudeerden in 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Wie wél uit huis ging, deed dat later: <strong>79 procent</strong> van de 2023-cohort woonde na het eerste studiejaar nog thuis, tegen <strong>63 procent</strong> van de 2016-cohort op hetzelfde moment (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <p>
          Kences, het kenniscentrum voor studentenhuisvesting, koppelt dat patroon aan betaalbaarheid en schaarste. In de Landelijke Monitor Studentenhuisvesting 2025 meldde NOS dat studenten gemiddeld <strong>48 procent</strong> van hun inkomen aan huur besteden, terwijl het aandeel dat daadwerkelijk op een kamer woont daalt terwijl de wens om uit te gaan hoog blijft (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). LSVb-voorzitter Maaike Krom zei tegen NOS dat financiële druk en de kamersjacht het welzijn aantasten omdat studenten &quot;steeds bezig zijn met de financiële kant&quot; (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          De grafiek hieronder vergelijkt hoeveel studenten op een kamer wonen versus hoeveel dat willen, nu en ongeveer acht jaar eerder. Het verschil tussen wens en werkelijkheid is op papier klein, maar de neerwaartse trend in beide lijnen is het signaal voor beleid.
        </p>

        <BlogBarChart
          data={[
            { label: 'Op kamer (nu)', value: 44 },
            { label: 'Wil kamer (nu)', value: 49 },
            { label: 'Op kamer (8j geleden)', value: 52 },
            { label: 'Wil kamer (8j geleden)', value: 59 },
          ]}
          yLabel="Aandeel studenten"
          valueFormat="percent"
          caption="Bron: Kences Landelijke Monitor Studentenhuisvesting, cijfers via NOS, september 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Als studenten stoppen met zoeken, stopt eenzaamheid niet</h2>

        <p>
          Kences-directeur Jolan de Bie zei tegen NOS dat studenten de hoop op een kamer opgeven omdat het tekort aanhoudt (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De Bie waarschuwde dat thuiswonende studenten een deel van hun sociaal-emotionele ontwikkeling missen en isolatie en lager zelfbeeld kunnen ervaren doordat ze deels buiten het studentenleven staan (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Minder lokale zwakke banden betekent minder studiepartners, minder stageverwijzingen en minder spontaan contact met de stad waar een instelling haar alumni wil binden.
        </p>

        <p>
          Nuffic-onderzoek naar internationale afgestudeerden laat huisvesting als parallelle stressor zien: <strong>37 procent</strong> van vertrokken alumni noemde het niet vinden van passende huisvesting als belangrijke reden (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2024
          </a>
          ). Instellingen ontmoedigen steeds vaker inschrijving zonder kamer een maand voor aanvang (
          <a
            href="https://www.nuffic.nl/en/news/growth-international-student-population-declines-further"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2025
          </a>
          ). Context over Nederlandse steden en instellingen: het{' '}
          <Link href="/universities">universiteitenoverzicht</Link>.
        </p>

        <h2>Studiocampussen en de &apos;sociale spookwijk&apos;</h2>

        <p>
          Aantallen alleen verklaren eenzaamheid niet. Gebouwvorm telt mee. Op Utrecht Science Park (De Uithof) wonen ruim <strong>3.300 studenten</strong> grotendeels in eenkamerstudio&apos;s, meldde NOS in 2025. Bewonersvertegenwoordiger Jeroen Polman beschreef buren die langs elkaar heen leven, met gesloten horeca in het weekend en weinig laagdrempelige ontmoetingsplekken (
          <a
            href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Studenten uit Limburg of Groningen zonder netwerk zijn extra kwetsbaar: &quot;Die kennen niemand. En die leren ook niemand kennen,&quot; aldus Polman (
          <a
            href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="internationalCampus"
            alt="Studenten op een universiteitscampus - sociale infrastructuur en burencontact in Nederlandse studentensteden"
          />
          <figcaption>
            Campusplannen met losse studio&apos;s leveren bedden op, maar halen gedeelde keukens en gangen weg waar vriendschappen in het dagelijks leven ontstaan.
          </figcaption>
        </figure>

        <p>
          Vergelijk dat met oudere studentenhuismodellen met gedeelde keukens en hospiteren. In Leiden meldde NOS in 2025 dat een PKvV-enquête <strong>52 studentenhuizen</strong> gesloten of bedreigd noemde, goed voor minstens <strong>317 kamers</strong>, deels door verkamering en belastingdruk (
          <a
            href="https://nos.nl/regio/zh-west/artikel/649347-studentenkamercrisis-explodeert-amsterdamse-toestanden"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Studenten in dat artikel stelden dat het verlies van huisgenootkeuze groepsdynamiek en welzijn ondermijnt (
          <a
            href="https://nos.nl/regio/zh-west/artikel/649347-studentenkamercrisis-explodeert-amsterdamse-toestanden"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h2>Wat gemeenten en instellingen kunnen meten</h2>

        <p>
          Eenzaamheid alleen als zorgvraag behandelen legt verantwoordelijkheid bij individuen voor een systeemuitkomst. Bruikbaardere indicatoren: aandeel ingeschreven studenten dat meer dan 45 minuten van de campus woont; tijd-tot-kamer voor eerstejaars; percentage afgestudeerden dat na 12 maanden nog in een studentenkamer woont (Kences noemt <strong>57 procent</strong> in recente monitoring via NOS); en gebruik van gemeenschappelijke ruimte in nieuwbouw (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Welzijnsprogramma&apos;s blijven relevant. Artikelen over{' '}
          <Link href="/blog/surviving-the-winter-blues">seizoensgebonden stemming in studentenhuizen</Link> en{' '}
          <Link href="/blog/introverts-survival-guide-shared-living">introverte studenten in gedeelde woningen</Link> gaan over micro-niveau. Macro-beleid moet voorraad én vorm van kamers adresseren. Het rijksdoel van <strong>60.000</strong> extra betaalbare studentenwoningen in 2030, via NOS, schetst schaal, maar realisatie in universiteitskernen blijft beperkt (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2024
          </a>
          ).
        </p>

        <p>
          Redactionele context staat op de <Link href="/about">over-pagina</Link>. De rode draad: studenteneenzaamheid is geen mysterieus app-thema, maar het gevolg wanneer toegang tot gedeeld, betaalbaar, buurtrijk wonen jaar na jaar krimpt.
        </p>

        <h2>Referenties</h2>

        <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
          <li>
            NOS. (2025). Steeds meer studenten geven de hoop op om een kamer te vinden.{' '}
            <a
              href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
            </a>
          </li>
          <li>
            NOS. (2026). Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen.{' '}
            <a
              href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
            </a>
          </li>
          <li>
            NOS. (2025). &apos;Sociale spookwijk&apos; moet gaan leven: buren Uithof vieren burendag.{' '}
            <a
              href="https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag"
              target="_blank"
              rel="noreferrer"
            >
              https://nos.nl/regio/utrecht/artikel/677720-sociale-spookwijk-moet-gaan-leven-buren-uithof-vieren-burendag
            </a>
          </li>
          <li>
            Nuffic. (2024). This is why international students stay (or leave) after graduating in the Netherlands.{' '}
            <a
              href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
              target="_blank"
              rel="noreferrer"
            >
              https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
            </a>
          </li>
        </ul>
      </div>
    ),
  },
}

export function StudentHousingLonelinessNetherlandsArticle() {
  const { locale } = useApp()
  const article = content[locale]

  return (
    <BlogPostLayout
      title={article.title}
      excerpt={article.excerpt}
      publishDate={article.publishDate}
      readTime={article.readTime}
      relatedLinks={article.relatedLinks}
    >
      {article.body()}
    </BlogPostLayout>
  )
}
