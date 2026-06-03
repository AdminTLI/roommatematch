'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'When Dutch Students Stop Searching for Rooms',
    excerpt:
      'Kences figures via NOS show fewer students even look for a room, while graduates block turnover and private supply shrinks. Here is what that pipeline failure means for access and wellbeing.',
    publishDate: '2026-06-03',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage Is a Retention Line Item',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How Dutch reporting ties room scarcity to students staying at home and stressed support loads.',
      },
      {
        title: 'Move-In Week Red Flags',
        href: '/blog/move-in-week-red-flags',
        description:
          'Early signals that a living situation may undermine your semester, and when to escalate.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contract and listing checks that matter when supply is tight and scams rise.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing headlines usually focus on rent levels or wait-list length. The sharper signal in
          2025 is quieter: fewer students are even trying to find a room. Reporting on the{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            Landelijke Monitor Studentenhuisvesting (NOS, September 2025)
          </a>{' '}
          describes students &quot;giving up hope&quot; after years of scarcity. That is not only a market story. It
          is a throughput story for access, social development, and the rooms that never free up because graduates
          cannot move on.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Cyclist passing residential streets in a Dutch student city — room search fatigue and commute pressure"
          />
          <figcaption>
            When searching feels futile, students stay at home longer. The cost shows up in travel time, networks,
            and who gets the rooms that do turn over.
          </figcaption>
        </figure>

        <h2>The hope gap: living out vs. wanting to</h2>

        <p>
          Kences, the national knowledge centre for student housing, reports that{' '}
          <strong>44 percent of students live in a student room</strong> while <strong>49 percent would want to</strong>.
          Eight years earlier, those shares were 52 percent and 59 percent respectively (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The gap between aspiration and reality is widening, and the monitor links falling search activity to
          sustained shortage rather than falling demand.
        </p>

        <p>
          The chart below compares those two snapshots. Notice that both &quot;actually living out&quot; and
          &quot;wanting to live out&quot; fell, which undermines the idea that students simply prefer staying with
          parents.
        </p>

        <BlogBarChart
          data={[
            { label: '2017: lives in room', value: 52 },
            { label: '2017: wants room', value: 59 },
            { label: '2025: lives in room', value: 44 },
            { label: '2025: wants room', value: 49 },
          ]}
          yLabel="Share of students"
          unit="%"
          valueFormat="percent"
          caption="Source: Kences, Landelijke Monitor Studentenhuisvesting, reported via NOS, 3 September 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Supply is shrinking while new build lags sales</h2>

        <p>
          The same monitor period shows why optimism is hard to sustain. About <strong>5,000 student rooms were built</strong>,
          yet private landlords sold student properties in large numbers after tighter rent rules. Net room supply in
          twenty student cities <strong>fell by an estimated 13,500 to roughly 322,400</strong>, and{' '}
          <strong>17,800 fewer students</strong> lived in the private rental sector than the previous academic year (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Follow-up reporting on landlord sales (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ) puts the scale in perspective: more than 5,000 homes sold in a year, roughly 10,000 rooms, with Kences
          warning that the Netherlands could lose about 9 percent of student rooms within two years if the trend
          continues.
        </p>

        <p>
          Average advertised rents keep climbing. Kamernet data cited by NOS in early 2025 put the average room at{' '}
          <strong>683 euros per month</strong>, up more than 6 percent year on year, while the formal shortage estimate
          stood at about <strong>23,000 rooms</strong> (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The September monitor revised the shortage to <strong>21,000 rooms</strong> but noted the true gap is
          larger because fewer students report searching (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Hands reviewing a rental contract — rent rules and landlord exits reshaping student supply"
          />
          <figcaption>
            Policy meant to protect tenants can reduce landlord supply. Students feel that trade-off in fewer listings
            and higher competition for what remains.
          </figcaption>
        </figure>

        <h2>Graduates who cannot leave block the next cohort</h2>

        <p>
          A second bottleneck rarely appears in student-facing advice: turnover. Kences reports that{' '}
          <strong>57 percent of graduates still live in their student room one year after finishing</strong>, often
          because they cannot access the regular housing market (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those rooms stay occupied on paper while new students cycle through sofa surfing, long commutes, or
          deferred moves.
        </p>

        <p>
          Municipal responses vary. Eindhoven announced plans for{' '}
          <strong>5,400 new student homes over eight years</strong> after local reporting linked housing gaps to early
          study withdrawal (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). That scale illustrates how cities now treat rooms as talent infrastructure, not a student lifestyle extra.
        </p>

        <h2>What forced stay-at-home means for wellbeing</h2>

        <p>
          Kences director Jolan de Bie told NOS that students who cannot move out may face longer travel, reconsider
          programme choice because of distance, and miss part of the social-emotional development that living near
          peers supports. She linked prolonged stay-at-home status to isolation and lower self-esteem when students
          feel partly outside student life (
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
          International students face the same supply curve with fewer fallback options. Nuffic survey work has long
          shown high study satisfaction alongside frequent stress and loneliness; about a third of international
          respondents reported often or always feeling lonely or bored, with stress the most common negative feeling (
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2021
          </a>
          ). Housing instability intensifies those patterns even when teaching quality stays strong. A prior editorial
          on this site examined integration risk through that lens:{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international student housing in the Netherlands
          </Link>
          .
        </p>

        <h3>Policy levers observers debate</h3>

        <p>
          Kences has argued for measures that make renting to students attractive again, including easier house-sharing
          rules for three to four tenants and temporary student contracts (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The Landelijke Studentenvakbond (LSVb) stresses affordability and supply, noting that students have limited
          earning capacity alongside full-time study (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Universities publishing local guidance often sit between those debates and individual casework; see how{' '}
          <Link href="/universities">institutions list housing resources</Link> for orientation, not as a guarantee of
          placement.
        </p>

        <h2>If you secure a room, protect the turnover you inherit</h2>

        <p>
          When supply is this tight, the quality of each occupied room matters more. A mismatch that forces a mid-year
          move burns time you cannot get back on the wait-list. Behavioural screening (sleep, guests, money, repair
          after conflict) is not a luxury; it is risk management. Articles on{' '}
          <Link href="/blog/how-to-find-a-great-roommate">finding a compatible roommate</Link> and the{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">hidden costs of a poor match</Link> walk through questions
          that reduce preventable moves.
        </p>

        <p>
          For context on how housing scarcity connects to completion and support load, see{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            student housing shortage and retention
          </Link>
          . Editorial background on how this publication approaches evidence: <Link href="/about">about this site</Link>.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, 3 September). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved 3
          June 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>. Retrieved 3 June
          2026, from{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Retrieved 3 June 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>. Retrieved 3
          June 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2021). <em>International students satisfied, but also stressed</em>. Retrieved 3 June 2026, from{' '}
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Waarom steeds meer Nederlandse studenten stoppen met kamers zoeken',
    excerpt:
      'Kences-cijfers via NOS: minder studenten zoeken actief, afgestudeerden blokkeren doorstroom en het aanbod krimpt. Wat die pipeline-storing betekent voor toegang en welzijn.',
    publishDate: '2026-06-03',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Studentenhuisvesting als retentiepost',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe Nederlandse berichtgeving krapte koppelt aan thuiswonen en druk op ondersteuning.',
      },
      {
        title: 'Red flags in je eerste woonweek',
        href: '/blog/move-in-week-red-flags',
        description:
          'Vroege signalen dat een woonsituatie je semester ondermijnt, en wanneer je hulp inschakelt.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contract- en advertentiecontroles die tellen als aanbod krap is en fraude toeneemt.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Nederlandse koppen over studentenhuisvesting gaan vaak over huur of wachtlijsten. Het scherpere signaal in
          2025 is stiller: <strong>minder studenten zoeken überhaupt nog een kamer</strong>. Berichtgeving over de{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            Landelijke Monitor Studentenhuisvesting (NOS, september 2025)
          </a>{' '}
          beschrijft dat studenten de hoop opgeven na jaren van schaarste. Dat is niet alleen een marktverhaal, maar
          een doorstroomverhaal voor toegang, sociale ontwikkeling en kamers die niet vrijkomen omdat afgestudeerden
          niet weg kunnen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Fietser langs woonstraten in een Nederlandse studentenstad — zoekmoeheid en reisdruk"
          />
          <figcaption>
            Als zoeken zinloos voelt, blijven studenten langer thuis. De rekening valt in reistijd, netwerken en wie de
            schaarse kamer wél krijgt.
          </figcaption>
        </figure>

        <h2>De hoopkloof: uitwonen vs. wens om uit te wonen</h2>

        <p>
          Kences meldt dat <strong>44 procent op kamers woont</strong> terwijl <strong>49 procent dat zou willen</strong>.
          Acht jaar eerder was dat 52 en 59 procent (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De kloof tussen wens en werkelijkheid wordt groter; de monitor koppelt dalende zoekactiviteit aan aanhoudend
          tekort, niet aan dalende vraag.
        </p>

        <p>
          In de grafiek hieronder twee momenten naast elkaar. Zowel &quot;woont uit&quot; als &quot;wil uitwonen&quot;
          daalden, wat het beeld ondermijnt dat studenten massaal thuis willen blijven.
        </p>

        <BlogBarChart
          data={[
            { label: '2017: woont op kamer', value: 52 },
            { label: '2017: wil op kamer', value: 59 },
            { label: '2025: woont op kamer', value: 44 },
            { label: '2025: wil op kamer', value: 49 },
          ]}
          yLabel="Aandeel studenten"
          unit="%"
          valueFormat="percent"
          caption="Bron: Kences, Landelijke Monitor Studentenhuisvesting, via NOS, 3 september 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Aanbod krimpt terwijl nieuwbouw achterblijft bij verkoop</h2>

        <p>
          In dezelfde monitorperiode werden circa <strong>5.000 kamers bijgebouwd</strong>, maar particuliere verhuurders
          verkochten massaal na strengere huurregels. Het totale aanbod in twintig studentensteden{' '}
          <strong>daalde met circa 13.500 naar 322.400</strong>; <strong>17.800 minder studenten</strong> woonden in de
          particuliere sector dan het jaar ervoor (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Vervolgberichtgeving over verkopen (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ) schat ruim 5.000 verkochte woningen per jaar (circa 10.000 kamers); Kences waarschuwt dat Nederland binnen
          twee jaar circa 9 procent van de studentenkamers kan verliezen als de trend doorzet.
        </p>

        <p>
          Gemiddelde huur blijft stijgen. Kamernet-data via NOS begin 2025: gemiddeld <strong>683 euro per maand</strong>,
          ruim 6 procent hoger jaar-op-jaar, met een tekort van circa <strong>23.000 kamers</strong> (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De septembermonitor komt uit op <strong>21.000 kamers</strong> tekort, met de kanttekening dat het echte
          tekort hoger ligt doordat minder studenten nog zoeken (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Handen die een huurcontract bekijken — huurwet en verhuurder-exit veranderen het aanbod"
          />
          <figcaption>
            Beleid ter bescherming van huurders kan het aanbod verlagen. Studenten merken dat in minder advertenties en
            scherpere concurrentie.
          </figcaption>
        </figure>

        <h2>Afgestudeerden die blijven zitten blokkeren de volgende lichting</h2>

        <p>
          Een tweede knelpunt: doorstroom. Kences: <strong>57 procent van de afgestudeerden woont een jaar later nog in de studentenkamer</strong>,
          vaak omdat de reguliere markt ontoegankelijk is (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Die kamers blijven bezet terwijl nieuwe studenten op de bank of met lange reistijden starten.
        </p>

        <p>
          Gemeenten reageren verschillend. Eindhoven kondigde plannen aan voor{' '}
          <strong>5.400 nieuwe studentenwoningen in acht jaar</strong> na berichtgeving over vroegtijdig studieverloop (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Dat laat zien dat kamers nu talentinfrastructuur zijn, geen luxe.
        </p>

        <h2>Gedwongen thuiswonen en welzijn</h2>

        <p>
          Kences-directeur Jolan de Bie zei tegen NOS dat niet uit huis kunnen leidt tot langere reistijden, soms andere
          studiekeuze door afstand, en gemiste sociaal-emotionele ontwikkeling. Lang thuiswonen kan isolatie en lager
          zelfbeeld versterken als je je deels buiten het studentenleven voelt (
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
          Internationale studenten zitten op dezelfde aanbodcurve met minder vangnet. Nuffic toont hoge studietevredenheid
          naast stress en eenzaamheid; circa een derde voelt zich vaak of altijd eenzaam of verveeld (
          <a
            href="https://www.nuffic.nl/nieuws/internationale-student-tevreden-maar-ook-gestrest"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2021
          </a>
          ). Eerder artikel op deze site:{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale studentenhuisvesting in Nederland
          </Link>
          .
        </p>

        <h3>Beleidshefbomen waarover wordt gedebatteerd</h3>

        <p>
          Kences pleit onder meer voor tijdelijke studentencontracten en makkelijker woningdelen met drie of vier personen (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De LSVb benadrukt betaalbaarheid en aanbod. Instellingen publiceren vaak lokale tips; zie{' '}
          <Link href="/universities">overzicht per onderwijsinstelling</Link> als orientatie, geen plaatsingsgarantie.
        </p>

        <h2>Heb je een kamer, bescherm de doorstroom die je erft</h2>

        <p>
          Bij deze krapte telt elke bezette kamer. Een verkeerde match en tussentijdse verhuizing kosten tijd die je niet
          terugwint op de markt. Gedragsvragen (slaap, logees, geld, conflict) zijn risicobeheer. Zie{' '}
          <Link href="/blog/how-to-find-a-great-roommate">een fijne huisgenoot vinden</Link> en{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">verborgen kosten van een slechte match</Link>. Achtergrond
          retentie:{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">tekort en retentie</Link>. Redactioneel kader:{' '}
          <Link href="/about">over deze site</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Geraadpleegd
          3 juni 2026, via{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>. Geraadpleegd 3 juni
          2026, via{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Geraadpleegd 3 juni 2026, via{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>. Geraadpleegd 3
          juni 2026, via{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2021). <em>Internationale student tevreden, maar ook gestrest</em>. Geraadpleegd 3 juni 2026, via{' '}
          <a
            href="https://www.nuffic.nl/nieuws/internationale-student-tevreden-maar-ook-gestrest"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/nieuws/internationale-student-tevreden-maar-ook-gestrest
          </a>
        </p>
      </div>
    ),
  },
}

export function StudentRoomSearchGivingUpArticle() {
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
