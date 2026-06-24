'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Graduates Blocking Student Rooms: What Dutch Data Shows',
    excerpt:
      'When more than half of graduates still occupy student rooms a year after finishing, the shortage is not only about new supply. Kences and NOS data explain the turnover bottleneck and what cities are planning.',
    publishDate: '2026-06-24',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage and Retention',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How room scarcity shows up in wellbeing dashboards and completion risk, not only in rent tables.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'National monitor data on who wants a room versus who has one, and what that means for integration.',
      },
      {
        title: 'Beyond Beds: Student Housing and Retention',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'A wider look at how housing friction loads the same persistence ledger universities already track.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates often focus on how many rooms to build next year. A less visible
          variable sits inside the stock that already exists:{' '}
          <strong>how quickly graduates leave student rooms once their degree ends</strong>. When exit slows,
          incoming students compete for the same keys, official shortage figures understate the pressure, and
          cities that depend on young talent see friction long before graduation day.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Student cycling through a Dutch university city — symbolising mobility between campus and student housing"
          />
          <figcaption>
            Turnover in student rooms shapes who can move in each September, not only how many units get built.
          </figcaption>
        </figure>

        <h2>The graduate bottleneck in national monitoring data</h2>

        <p>
          In September 2025, Dutch public broadcaster NOS reported findings from Kences, the national knowledge
          centre for student housing, in the Landelijke Monitor Studentenhuisvesting. Among the headline
          numbers was a throughput statistic easy to miss:{' '}
          <strong>57 percent of graduated students were still living in their student room one year after
          finishing</strong>, largely because they could not move into regular rental housing (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those rooms remain occupied on paper, but they no longer function as student intake capacity.
        </p>

        <p>
          Kences used that figure to explain why the published shortage of roughly{' '}
          <strong>21,000 rooms</strong> likely understates real pressure. Fewer students report actively
          searching for a room when the market has felt hopeless for years, and vocational students who want to
          move out are not fully counted in the monitor (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The result is a market that looks calmer in survey responses than it feels on the ground.
        </p>

        <h3>How the shortage is projected to grow</h3>

        <p>
          The chart below compares the monitor&apos;s point estimate for the current shortage with Kences
          projections for 2032-2033 under stressed supply assumptions. The gap between the lower and upper
          bounds reflects uncertainty about private landlord exits and build pace, not a single forecast.
        </p>

        <BlogBarChart
          data={[
            { label: '2025 (current)', value: 21000 },
            { label: '2032-33 (low)', value: 26000 },
            { label: '2032-33 (high)', value: 63200 },
          ]}
          yLabel="Room shortage"
          unit="rooms"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting, reported via NOS, 3 September 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Supply is shrinking while demand psychology shifts</h2>

        <p>
          The same NOS article described a supply-side squeeze that makes turnover problems worse. Roughly{' '}
          <strong>5,000 student rooms</strong> were added through new construction, yet{' '}
          <strong>17,800 fewer students</strong> were housed in the private rental sector compared with the
          previous academic year, and total room stock across twenty student cities fell by an estimated{' '}
          <strong>13,500 units</strong> to about <strong>322,400</strong> (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Private landlords have sold properties in large numbers following tighter rental rules, a dynamic
          NOS covered separately when reporting more than <strong>5,000 sold student homes</strong> in a single
          year, equivalent to roughly <strong>10,000 rooms</strong> (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          On the demand side, the wish-versus-reality gap has widened.{' '}
          <strong>44 percent</strong> of students lived in a rented room while <strong>49 percent</strong>{' '}
          said they wanted to, compared with <strong>52 percent</strong> actually living out and{' '}
          <strong>59 percent</strong> wanting to eight years earlier (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences director Jolan de Bie told NOS that students are effectively giving up on finding a room,
          which makes headline search statistics an unreliable comfort metric for policymakers.
        </p>

        <h2>Wellbeing costs when rooms do not turn over</h2>

        <p>
          Housing stress is not only a logistics problem. In the same NOS reporting, de Bie noted that students
          who remain at their parents&apos; home can miss part of their social-emotional development, and that
          standing partly outside student life can feed isolation and lower self-image, with network effects
          that later touch labour-market access (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Nuffic survey work on international students in Dutch higher education found that{' '}
          <strong>62 percent</strong> often or always feel stressed, with study results and career prospects
          among the drivers (
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2021
          </a>
          ). Housing search friction sits in that same stress bundle even when academic satisfaction scores
          remain high.
        </p>

        <p>
          For graduates stuck in student rooms, the wellbeing ledger looks different but related: delayed
          independence, uncertain tenancy status, and competition with current students for mental bandwidth.
          The Landelijke Studentenvakbond (LSVb), quoted in NOS coverage of rising rents, described students
          juggling financial strain alongside full-time study loads (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kamernet reported an average student room rent of <strong>683 euros</strong> per month in early
          2025, up more than 6 percent year-on-year, while supply barely moved (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h2>When cities treat housing as talent infrastructure</h2>

        <p>
          Municipal responses are starting to frame student rooms as economic infrastructure, not a campus
          afterthought. NOS reported in June 2026 that the City of Eindhoven, TU/e, Fontys, Vestide, and SSH
          plan to deliver roughly <strong>5,400 student homes</strong> over eight years to address chronic
          shortage (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). The article quoted a TU/e board member citing roughly <strong>500 students</strong> who ended their
          studies early the previous September because they could not secure housing. That is a retention signal
          measured in dropped credits, not wait-list length.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Hands reviewing a rental contract — illustrating tenancy turnover and housing agreements for students"
          />
          <figcaption>
            Build plans matter, but so does exit: graduates who cannot sign a regular lease keep student rooms
            off the market for incoming cohorts.
          </figcaption>
        </figure>

        <h3>Policy levers that affect turnover, not only construction</h3>

        <p>
          Kences has argued that allowing temporary student contracts and easing municipal permit requirements
          for shared housing of three or four people could make existing stock work harder without waiting for
          cranes (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those proposals sit next to the graduate-throughput problem: even perfect newbuild pipelines stall
          if rooms never recycle. Nuffic&apos;s 2023 graduate survey found that{' '}
          <strong>37 percent</strong> of alumni who left the Netherlands cited not finding proper housing as an
          important reason, matching the share who cited financing (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). Retention policy and housing policy converge at that point.
        </p>

        <h2>How to read the evidence without false precision</h2>

        <p>
          Three checks keep this topic honest for students, housing officers, and city planners. First, separate{' '}
          <strong>headline shortage counts</strong> from <strong>effective availability</strong>, because
          graduate occupancy and discouraged search behaviour both hide pressure. Second, compare{' '}
          <strong>national monitors</strong> with <strong>local vacancy reality</strong>, since Amsterdam,
          Rotterdam, Utrecht, and Groningen saw the highest private sales volumes in related ABF reporting
          relayed by NOS (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Third, treat wellbeing quotes from institutional leaders as hypotheses to monitor at cohort level,
          not as predictions about any one household.
        </p>

        <p>
          For broader national context on who wants a room versus who has one, see the earlier analysis of{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international student housing in the Netherlands
          </Link>
          . For how shortages connect to retention metrics, read{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            student housing shortage and retention
          </Link>
          . Institution-level context sits in the{' '}
          <Link href="/universities">universities and cities overview</Link>, and the editorial approach behind
          these pieces is summarised on the <Link href="/about">about</Link> page.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, September 3). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>.
          Retrieved June 24, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>. Retrieved
          June 24, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Retrieved June 24,
          2026, from{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>.
          Retrieved June 24, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2021). <em>International students satisfied, but also stressed</em>. Retrieved June 24, 2026,
          from{' '}
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>This is why international students stay (or leave) after graduating in the
          Netherlands</em>. Retrieved June 24, 2026, from{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Afgestudeerden houden studentenkamers bezet: wat Nederlandse data laten zien',
    excerpt:
      'Meer dan de helft van de afgestudeerden woont een jaar later nog op een studentenkamer. Kences- en NOS-cijfers tonen het doorstroomflessenkraag en wat steden plannen.',
    publishDate: '2026-06-24',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Kamertekort en retentie',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe schaarste zichtbaar wordt in welzijn en studiesucces, niet alleen in huurcijfers.',
      },
      {
        title: 'Internationale studentenhuisvesting',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Landelijke monitorcijfers over wie een kamer wil versus wie er een heeft.',
      },
      {
        title: 'Meer dan een bed: huisvesting en retentie',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'Breder beeld van hoe woonfrictie dezelfde retentielijn belast als studiefactoren.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting draait vaak om nieuwbouw. Minder zichtbaar is een factor in de
          bestaande voorraad:{' '}
          <strong>hoe snel afgestudeerden vertrekken uit studentenkamers</strong>. Als die doorstroom vertraagt,
          concurreren instromers om dezelfde sleutels, lijken tekortcijfers lager dan de werkelijkheid, en
          ontstaat frictie in steden die jong talent willen vasthouden.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Student op de fiets in een Nederlandse studentenstad — symbool voor mobiliteit tussen campus en huisvesting"
          />
          <figcaption>
            Doorstroom in studentenkamers bepaalt wie elke september kan intrekken, los van nieuwbouwplannen.
          </figcaption>
        </figure>

        <h2>Het doorstroomflessenkraag in landelijke monitorcijfers</h2>

        <p>
          NOS berichtte in september 2025 over de Landelijke Monitor Studentenhuisvesting van Kences. Daarin
          viel een doorstroomcijfer op:{' '}
          <strong>57 procent van de afgestudeerden woonde een jaar na afstuderen nog in de studentenkamer</strong>,
          grotendeels omdat doorstromen naar reguliere huurwoningen niet lukte (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Die kamers tellen mee in de voorraad, maar niet als instroomcapaciteit voor nieuwe studenten.
        </p>

        <p>
          Kences gebruikte dat cijfer om te verklaren waarom het gepubliceerde tekort van circa{' '}
          <strong>21.000 kamers</strong> de werkelijke druk waarschijnlijk onderschat. Minder studenten zeggen
          actief te zoeken wanneer de markt al jaren krap aanvoelt, en mbo-studenten die uit huis willen worden
          niet volledig meegeteld (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Verwachte groei van het tekort</h3>

        <p>
          Onderstaande grafiek vergelijkt het actuele tekort met Kences-projecties voor 2032-2033 onder
          stressscenario&apos;s voor aanbod. De bandbreedte weerspiegelt onzekerheid over particuliere
          verkoop en bouwtempo.
        </p>

        <BlogBarChart
          data={[
            { label: '2025 (nu)', value: 21000 },
            { label: '2032-33 (laag)', value: 26000 },
            { label: '2032-33 (hoog)', value: 63200 },
          ]}
          yLabel="Kamertekort"
          unit="kamers"
          caption="Bron: Kences Landelijke Monitor Studentenhuisvesting, via NOS, 3 september 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Aanbod krimpt terwijl de vraagpsychologie verschuift</h2>

        <p>
          Hetzelfde NOS-artikel beschreef een aanbodklem. Circa <strong>5.000 studentenkamers</strong> zijn
          bijgebouwd, maar <strong>17.800 minder studenten</strong> woonden in de particuliere sector dan het
          vorige studiejaar. Het totaal in twintig studentensteden daalde met circa{' '}
          <strong>13.500 eenheden</strong> naar ongeveer <strong>322.400</strong> (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Particuliere verhuurders verkochten massaal na strengere regelgeving; NOS meldde meer dan{' '}
          <strong>5.000 verkochte studentenwoningen</strong> in een jaar, goed voor circa{' '}
          <strong>10.000 kamers</strong> (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Aan vraagzijde is de kloof tussen wens en werkelijkheid gegroeid: <strong>44 procent</strong> woonde
          op kamers terwijl <strong>49 procent</strong> dat wilde, tegen <strong>52 procent</strong> en{' '}
          <strong>59 procent</strong> acht jaar eerder (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences-directeur Jolan de Bie concludeerde dat studenten de hoop op een kamer opgeven, waardoor
          zoekcijfers misleidend geruststellend kunnen ogen.
        </p>

        <h2>Welzijn wanneer kamers niet vrijkomen</h2>

        <p>
          Woonstress is meer dan logistiek. De Bie wees in NOS op sociaal-emotionele ontwikkeling die
          thuiswoners missen en op isolatie wanneer je deels buiten het studentenleven valt (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Nuffic-enquêtes onder internationale studenten lieten zien dat <strong>62 procent</strong> vaak of
          altijd gestrest is (
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2021
          </a>
          ). Afgestudeerden die vastzitten op studentenkamers ervaren andere maar verwante druk: uitgestelde
          zelfstandigheid en concurrentie met instromende studenten.
        </p>

        <p>
          Kamernet meldde begin 2025 een gemiddelde kamerhuur van <strong>683 euro</strong> per maand, meer dan
          6 procent hoger dan een jaar eerder, terwijl het aanbod nauwelijks groeide (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De LSVb benadrukte in dat bericht de combinatie van stijgende huren en beperkte verdiensten naast
          een voltijdstudie.
        </p>

        <h2>Steden die huisvesting als talentinfrastructuur zien</h2>

        <p>
          NOS berichtte in juni 2026 dat Eindhoven, TU/e, Fontys, Vestide en SSH in acht jaar circa{' '}
          <strong>5.400 studentenwoningen</strong> willen realiseren (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Een bestuurslid van TU/e noemde circa <strong>500 studenten</strong> die vorig september hun
          studie vroegtijdig staakten omdat ze geen huisvesting vonden. Dat is retentieverlies in studiepunten,
          niet in wachtlijstlengte.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Handen die een huurcontract bekijken — illustratie van huurovereenkomsten en doorstroom bij studenten"
          />
          <figcaption>
            Nieuwbouw helpt, maar doorstroom telt mee: wie geen regulier contract tekent, houdt kamers bezet
            voor instromers.
          </figcaption>
        </figure>

        <h3>Beleidshefbomen naast bouwen</h3>

        <p>
          Kences pleit voor tijdelijke studentencontracten en eenvoudiger vergunningen voor woningdelen met
          drie of vier personen (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Nuffic meldde dat <strong>37 procent</strong> van vertrokken alumni &quot;geen geschikte
          huisvesting&quot; als belangrijke reden noemde, net als financiering (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). Retentie- en huisvestingsbeleid raken elkaar daar.
        </p>

        <h2>Verder lezen</h2>

        <p>
          Landelijk context:{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale studentenhuisvesting in Nederland
          </Link>
          . Retentieperspectief:{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">kamertekort en retentie</Link>. Per
          instelling: <Link href="/universities">steden en hogescholen</Link>. Redactionele lijn:{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>.
          Geraadpleegd 24 juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>.
          Geraadpleegd 24 juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Geraadpleegd 24 juni
          2026,{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>.
          Geraadpleegd 24 juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2021). <em>International students satisfied, but also stressed</em>. Geraadpleegd 24 juni
          2026,{' '}
          <a
            href="https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/international-students-satisfied-but-also-stressed
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>This is why international students stay (or leave) after graduating in the
          Netherlands</em>. Geraadpleegd 24 juni 2026,{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
      </div>
    ),
  },
}

export function GraduatesBlockingStudentRoomsArticle() {
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
