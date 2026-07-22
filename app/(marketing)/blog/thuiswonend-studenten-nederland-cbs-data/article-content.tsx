'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'More Dutch Students Live at Home: What CBS Data Reveals About Housing',
    excerpt:
      'New CBS and NIDI figures show a sharp rise in students who never move out during their degree. The pattern is not only about student loans; it tracks room shortages, rents, and uneven access between HBO and university students.',
    publishDate: '2026-07-22',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage and Retention',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How national room scarcity connects to wellbeing, completion risk, and city talent pipelines.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Why room access is an integration indicator for mobile students, not only a rent line item.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Practical guidance on contracts, deposits, and tenant rights when the private market is tight.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          For decades, moving into a student room was treated as a rite of passage in the Netherlands. New
          research from the Centraal Bureau voor de Statistiek (CBS) and the Nederlands Interdisciplinair
          Demografisch Instituut (NIDI) suggests that passage is opening later, and for a growing share of
          students, never at all. Among graduates who finished a five-year higher-education programme in 2023,{' '}
          <strong>43 percent had lived at their parents&apos; home for the entire study period</strong>, up
          from 31 percent among the 2016 graduation cohort (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ;{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ). That shift matters for how municipalities, institutions, and student unions read the housing
          crisis: <strong>thuiswonend studenten Nederland</strong> is no longer a fringe category. It is
          becoming a default pathway for nearly half of a graduating cohort.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Student studying late at a desk at home — thuiswonend students and delayed move-out in the Netherlands"
          />
          <figcaption>
            When leaving home slips from year one to year three, campus social life and commute patterns
            reorganise around the parental address.
          </figcaption>
        </figure>

        <h2>What changed between 2016 and 2023</h2>

        <p>
          The CBS analysis tracks students at HBO colleges and universities (wo) who started a programme before
          age twenty and completed a five-year trajectory. The researchers deliberately narrowed the sample to
          avoid mixing in students who had already lived independently before enrolment (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis/studenten"
            target="_blank"
            rel="noreferrer"
          >
            CBS methodology note, 2026
          </a>
          ). Within that frame, the delay is visible at every milestone. Of the 2016 cohort, 63 percent still
          lived at home after the first study year; for the 2023 cohort that figure rose to 79 percent. After
          three years, the share still at home climbed from 43 percent to 60 percent (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ).
        </p>

        <p>
          The chart below compares three milestones for the 2016 and 2023 graduation cohorts. The gap widens at
          each stage, which suggests that delayed move-out is compounding rather than a one-year blip.
        </p>

        <BlogBarChart
          data={[
            { label: '2016: home entire study', value: 31 },
            { label: '2023: home entire study', value: 43 },
            { label: '2016: home after yr 3', value: 43 },
            { label: '2023: home after yr 3', value: 60 },
          ]}
          yLabel="Share of graduates"
          valueFormat="percent"
          caption="Source: CBS and NIDI, as reported by NOS (June 2026). Cohorts are students who completed a five-year HBO or university programme; percentages refer to living at the parental home."
        />

        <h3>HBO students carry most of the shift</h3>

        <p>
          The pattern is not evenly distributed across sectors. Among HBO graduates who finished in 2016, 41
          percent had not moved out during their studies; by 2023 that share reached 55 percent. At
          universities the increase was smaller in absolute terms but still significant: from 19 percent to 32
          percent (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Regional college networks often draw students from shorter commuting distances, which partly
          explains the HBO skew, but the direction of travel is the same everywhere: fewer young adults anchor
          near campus during their degree.
        </p>

        <h2>Student loans are part of the story, not the whole story</h2>

        <p>
          Public commentary frequently links thuiswonen to the 2015 introduction of the student loan system
          (leenstelsel). The CBS timeline supports a correlation: move-out rates shifted after loans replaced
          the basic grant. In 2023 the basic grant returned, yet the housing market had tightened further in
          the interim. LSVb chair Maaike Krom told NOS that scarcity and affordability now reinforce each
          other: students skip the room search because they already know supply is insufficient (
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
          National shortage estimates underline that structural constraint. In early 2026, government housing
          coordinator Ardin Mourik told NOS that roughly <strong>23,000 student rooms</strong> were still
          missing nationwide, with a policy target of 60,000 additional affordable units by 2030 (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Separate reporting on the Wet Betaalbare Huur and tighter rental rules documented a sharp drop in
          private room listings in 2025, with students able to respond to fewer than 5,800 units under 25
          square metres in one quarter, down about 30 percent year on year (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). When rooms disappear from the market, staying at home is not only cheaper. For many students it
          is the only realistic option.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Residential housing in a Dutch city — student room shortage and thuiswonend students"
          />
          <figcaption>
            Policy responses now include satellite student cities such as Almere and Assen, but national
            shortage figures show demand still outpaces new supply.
          </figcaption>
        </figure>

        <h2>What thuiswonen means for wellbeing and campus life</h2>

        <p>
          Living at home is not inherently harmful. For some students it offers financial stability and family
          support during intense study years. The risk appears when thuiswonen is involuntary: when students
          who want independent housing cannot secure it, or when long commutes replace time on campus. Kences
          director Jolan de Bie has argued in Dutch media that students who remain at their parents&apos; home
          can miss parts of social-emotional development tied to student life, with downstream effects on
          networks and labour-market entry (quoted in{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That framing treats housing access as infrastructure for belonging, not a lifestyle choice.
        </p>

        <p>
          Institutions already track attendance, counselling referrals, and study delay. Fewer publish how
          housing status correlates with those indicators. As thuiswonen becomes normal for nearly half of
          some graduating cohorts, that blind spot grows. Commute time, evening social access, and the ability
          to participate in internships or part-time work near campus all hinge on whether a student can live
          within reasonable distance of their programme.
        </p>

        <h3>Regional spillover and the commuter-student model</h3>

        <p>
          Municipalities outside traditional university cities are experimenting with absorbing overflow demand.
          Almere is building 1,250 new student units, including 500 reserved for Amsterdam students who face a
          half-hour train commute (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Assen, near Groningen, aims to house 300 to 400 students as programmes expand locally. These
          projects may ease pressure in core cities, but they also extend the commuter-student model that CBS
          data already describes at the parental-home end of the spectrum.
        </p>

        <h2>Questions for policymakers and institutions</h2>

        <p>
          The CBS release gives planners a clearer baseline. Three questions follow from the numbers. First,
          how many enrolled students in each faculty are thuiswonend by choice versus by constraint, and does
          that split differ between HBO and university tracks? Second, do students who never move out during
          their degree show different progression or wellbeing signals in institutional data? Third, as rental
          reform continues to shrink private room supply, what interim measures (hospita schemes, flex
          housing, regional satellite capacity) can prevent thuiswonen from hardening into the default path
          for students who would prefer to live near campus?
        </p>

        <p>
          The basic grant&apos;s return may ease financial pressure for some households. It does not by itself
          create rooms. Until supply catches up with demand, Dutch higher education is effectively running a
          dual-track experience: students who secure scarce rooms near campus, and students who build their
          degree around a parental address. The CBS figures make that divide measurable.
        </p>

        <h3>Further reading on this site</h3>

        <p>
          For the broader retention picture, see{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            student housing shortage and retention
          </Link>
          . For international students facing a different but related access gap, see{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international student housing in the Netherlands
          </Link>
          . Institutional context by city and sector is summarised on the{' '}
          <Link href="/universities">universities and colleges</Link> page. Editorial standards for this
          series are described on <Link href="/about">about Domu Match</Link>.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-600">
          CBS. (2026, June). <em>Steeds meer studenten wonen hun hele studie thuis</em>.{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis
          </a>
        </p>
        <p className="text-sm text-slate-600">
          CBS. (2026). <em>Thuiswonende studenten, 2016-2023</em> (maatwerk).{' '}
          <a
            href="https://www.cbs.nl/nl-nl/maatwerk/2026/06/thuiswonende-studenten-2016-2023"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/maatwerk/2026/06/thuiswonende-studenten-2016-2023
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen</em>.{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Kamertekort blijft hoog, Assen en Almere bieden zich aan als studentenstad</em>.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
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
      </div>
    ),
  },
  nl: {
    title:
      'Meer thuiswonende studenten: wat CBS-cijfers zeggen over de wooncrisis',
    excerpt:
      'Nieuw CBS- en NIDI-onderzoek laat zien dat steeds meer studenten hun hele studie thuis blijven wonen. Het patroon gaat verder dan het leenstelsel en volgt kamertekorten, huren en verschillen tussen hbo en wo.',
    publishDate: '2026-07-22',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Studentenhuisvesting en retentie',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe landelijke kamertekorten doorwerken in welzijn, studiesucces en stedelijke talentstromen.',
      },
      {
        title: 'Internationale studentenhuisvesting',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Waarom kamertoegang een integratie-indicator is voor mobiele studenten.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Praktische tips over contracten, borg en huurdersrechten in een krappe markt.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Jarenlang gold uit huis gaan als vanzelfsprekend in het Nederlandse studentenleven. Nieuw onderzoek
          van het Centraal Bureau voor de Statistiek (CBS) en het Nederlands Interdisciplinair Demografisch
          Instituut (NIDI) laat zien dat die stap steeds later komt, en voor een groeiende groep helemaal
          niet. Van de studenten die in 2023 een vijfjarige hbo- of universitaire opleiding afrondden, bleef{' '}
          <strong>43 procent de gehele studieperiode thuis wonen</strong>, tegenover 31 procent bij de
          afstudeercohort van 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ;{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ). Voor gemeenten, instellingen en studentenorganisaties betekent dit dat{' '}
          <strong>thuiswonend studenten Nederland</strong> geen randverschijnsel meer is, maar een
          standaardpad voor bijna de helft van een afstudeerklasse.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Student die laat thuis studeert — thuiswonende studenten en uitstel van uit huis gaan"
          />
          <figcaption>
            Als uit huis gaan verschuift van jaar één naar jaar drie, verandert ook het sociale leven op
            campus en de reistijd naar college.
          </figcaption>
        </figure>

        <h2>Wat er veranderde tussen 2016 en 2023</h2>

        <p>
          CBS en NIDI volgden studenten die vóór hun twintigste met een opleiding begonnen en na vijf jaar
          afstudeerden. De steekproef sluit studenten uit die al zelfstandig woonden vóór de studie (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis/studenten"
            target="_blank"
            rel="noreferrer"
          >
            CBS methodologische toelichting, 2026
          </a>
          ). Binnen dat kader is de vertraging op elk moment zichtbaar. Van de cohort 2016 woonde 63 procent
          na het eerste studiejaar nog thuis; bij de cohort 2023 was dat 79 procent. Na drie jaar steeg het
          aandeel thuiswonenden van 43 naar 60 procent (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ).
        </p>

        <p>
          De grafiek hieronder vergelijkt drie momenten voor de afstudeercohorten 2016 en 2023. Het verschil
          wordt op elk moment groter, wat wijst op een oplopend patroon in plaats van een eenmalige dip.
        </p>

        <BlogBarChart
          data={[
            { label: '2016: heel studie thuis', value: 31 },
            { label: '2023: heel studie thuis', value: 43 },
            { label: '2016: thuis na jr 3', value: 43 },
            { label: '2023: thuis na jr 3', value: 60 },
          ]}
          yLabel="Aandeel afgestudeerden"
          valueFormat="percent"
          caption="Bron: CBS en NIDI, via NOS (juni 2026). Cohorten: studenten die een vijfjarige hbo- of wo-opleiding afrondden; percentages betreffen wonen bij de ouders."
        />

        <h3>Hbo-studenten dragen het grootste deel van de verschuiving</h3>

        <p>
          Het patroon is niet gelijk verdeeld. Van de hbo-afgestudeerden in 2016 ging 41 procent niet op
          kamers; in 2023 was dat 55 procent. Aan universiteiten steeg het aandeel van 19 naar 32 procent (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Regionale hbo-netwerken trekken vaak studenten uit kortere reisafstand, wat deels het hbo-verschil
          verklaart, maar de richting is overal hetzelfde: minder jongvolwassenen vestigen zich tijdens de
          studie bij de campus.
        </p>

        <h2>Het leenstelsel is deel van het verhaal, niet het hele verhaal</h2>

        <p>
          In het publieke debat wordt thuiswonen vaak gekoppeld aan het leenstelsel van 2015. De CBS-tijdlijn
          ondersteunt die correlatie. In 2023 keerde de basisbeurs terug, maar de woningmarkt was intussen
          verder aangescherpt. LSVb-voorzitter Maaike Krom zei tegen NOS dat schaarste en betaalbaarheid elkaar
          versterken: studenten beginnen de zoektocht niet eens meer omdat ze weten dat het aanbod tekortschiet
          (
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
          Landelijke tekortcijfers onderstrepen die structurele beperking. Begin 2026 meldde
          rijksregisseur studentenhuisvesting Ardin Mourik aan NOS dat er nog ruim{' '}
          <strong>23.000 studentenkamers</strong> tekort waren, met als doel 60.000 extra betaalbare eenheden
          in 2030 (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Berichtgeving over de Wet Betaalbare Huur en strengere verhuurregels documenteerde in 2025 een
          scherpe daling van particuliere kamers: in één kwartaal konden studenten reageren op minder dan 5.800
          woningen onder 25 vierkante meter, ongeveer 30 procent minder dan een jaar eerder (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Als kamers uit de markt verdwijnen, is thuisblijven niet alleen goedkoper, maar voor velen de
          enige realistische optie.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Woningen in een Nederlandse stad — kamertekort en thuiswonende studenten"
          />
          <figcaption>
            Beleidsantwoorden omvatten satelliet-studentensteden zoals Almere en Assen, maar landelijke
            tekortcijfers laten zien dat vraag het aanbod nog steeds overtreft.
          </figcaption>
        </figure>

        <h2>Wat thuiswonen betekent voor welzijn en campusleven</h2>

        <p>
          Thuis wonen is op zichzelf niet schadelijk. Voor sommige studenten biedt het financiële stabiliteit
          en gezinsondersteuning. Het risico ontstaat wanneer thuiswonen onvrijwillig is: wanneer studenten
          die zelfstandig willen wonen geen kamer vinden, of wanneer lange reistijden tijd op campus
          vervangen. Kences-directeur Jolan de Bie heeft in media betoogd dat studenten die bij hun ouders
          blijven delen van hun sociaal-emotionele ontwikkeling kunnen missen, met gevolgen voor netwerken en
          arbeidsmarkttoegang (geciteerd in{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Daarmee wordt kamertoegang infrastructuur voor belonging, geen lifestylekeuze.
        </p>

        <p>
          Instellingen meten aanwezigheid, studieloopbaan en hulpverlening. Weinigen publiceren hoe
          woonstatus daarmee samenhangt. Nu thuiswonen normaal wordt voor bijna de helft van sommige cohorten,
          groeit die blinde vlek. Reistijd, avondactiviteiten en stages in de buurt van de opleiding hangen
          allemaal af van de vraag of een student redelijk dicht bij de campus kan wonen.
        </p>

        <h3>Regionale spill-over en het pendelstudentenmodel</h3>

        <p>
          Gemeenten buiten traditionele studentensteden experimenteren met het opvangen van overschotvraag.
          Almere bouwt 1.250 studentenwoningen, waarvan 500 gereserveerd voor Amsterdammers met een half uur
          trein (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Assen, bij Groningen, wil 300 tot 400 studenten huisvesten naarmate opleidingen lokaal groeien.
          Dat kan druk verlichten in kernsteden, maar verlengt ook het pendelstudentenmodel dat CBS-data al
          beschrijft aan de kant van het ouderlijk huis.
        </p>

        <h2>Vragen voor beleid en onderwijs</h2>

        <p>
          De CBS-publicatie geeft planners een scherper uitgangspunt. Drie vragen volgen uit de cijfers. Ten
          eerste: hoeveel ingeschreven studenten per faculteit wonen uit vrije keuze thuis versus uit
          noodzaak, en verschilt dat tussen hbo en wo? Ten tweede: vertonen studenten die nooit uit huis gaan
          andere signalen in studiesucces of welzijnsdata? Ten derde: welke tussenmaatregelen (hospitaverhuur,
          flexwoningen, regionale capaciteit) kunnen voorkomen dat thuiswonen het standaardpad wordt voor
          studenten die liever bij de campus wonen, zolang verhuurhervorming het particuliere aanbod krimpt?
        </p>

        <p>
          De terugkeer van de basisbeurs kan financiële druk verlichten. Het creëert geen kamers. Tot het
          aanbod bij de vraag aansluit, kent het Nederlandse hoger onderwijs feitelijk twee sporen: studenten
          met een schaarse kamer bij de campus, en studenten die hun studie rond het ouderlijk adres
          organiseren. De CBS-cijfers maken die tweedeling meetbaar.
        </p>

        <h3>Verder lezen op deze site</h3>

        <p>
          Voor het bredere retentiebeeld:{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            studentenhuisvesting en retentie
          </Link>
          . Voor internationale studenten met een ander maar verwant toegangsprobleem:{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale studentenhuisvesting in Nederland
          </Link>
          . Context per instelling: <Link href="/universities">universiteiten en hogescholen</Link>.
          Redactionele kaders: <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          CBS. (2026, juni). <em>Steeds meer studenten wonen hun hele studie thuis</em>.{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis
          </a>
        </p>
        <p className="text-sm text-slate-600">
          CBS. (2026). <em>Thuiswonende studenten, 2016-2023</em> (maatwerk).{' '}
          <a
            href="https://www.cbs.nl/nl-nl/maatwerk/2026/06/thuiswonende-studenten-2016-2023"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/maatwerk/2026/06/thuiswonende-studenten-2016-2023
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen</em>.{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Kamertekort blijft hoog, Assen en Almere bieden zich aan als studentenstad</em>.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2535619-kamertekort-blijft-hoog-assen-en-almere-bieden-zich-aan-als-studentenstad
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
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
      </div>
    ),
  },
}

export function ThuiswonendStudentenNederlandArticle() {
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
