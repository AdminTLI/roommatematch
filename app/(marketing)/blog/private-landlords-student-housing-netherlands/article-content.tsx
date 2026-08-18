'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'Private Landlords Are Leaving Student Housing: What the Dutch Supply Shock Means for Renters',
    excerpt:
      'Kences and NOS reporting shows private landlords selling student homes as rental rules tighten. Here is how that supply loss interacts with woningdelen policy, municipal responses, and who bears the risk.',
    publishDate: '2026-08-05',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'How national monitoring data connects room access to integration risk for mobile students.',
      },
      {
        title: 'Student Housing Shortage and Retention',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Why fewer move-outs and longer parental-home stays show up on institutional retention ledgers.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contract verification and scam awareness when competition for rooms intensifies.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates often centre on how many beds a city still needs to build. That framing is
          incomplete. Reporting from{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS (2025)
          </a>{' '}
          and the Landelijke Monitor Studentenhuisvesting, relayed by Kences, describes a parallel shock:{' '}
          <strong>private landlords are exiting the student rental market faster than new stock arrives</strong>.
          The result is not only fewer listings, but a structural shift in who controls the remaining rooms.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Rental contract and documents on a desk - private landlord rules and student tenancy in the Netherlands"
          />
          <figcaption>
            Regulatory change is reshaping the private student rental sector, not only the price on the contract.
          </figcaption>
        </figure>

        <h2>When supply falls while demand holds</h2>

        <p>
          In September 2025, NOS reported Kences findings that the national room shortage stood at roughly{' '}
          <strong>21,000</strong>, with projections ranging up to roughly <strong>63,200</strong> by 2032-2033 under
          stressed supply assumptions (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). At the same time, the monitor recorded a widening gap between students who want to live independently and
          students who actually do: <strong>44 percent</strong> were living in a rented room while <strong>49 percent</strong>{' '}
          said they wanted to, compared with <strong>52 percent</strong> living out and <strong>59 percent</strong>{' '}
          wanting to eight years earlier (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences concluded that more students are effectively giving up on finding a room because the shortage
          persists.
        </p>

        <p>
          The supply side explains part of that resignation. NOS cited Kences data showing that total room availability
          across twenty student cities fell by an estimated <strong>13,500</strong> to roughly <strong>322,400</strong>,
          while <strong>17,800</strong> fewer students were housed in the private sector than in the previous academic
          year (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Roughly <strong>5,000</strong> new student rooms were built, but that gain was overwhelmed by landlords
          selling properties.
        </p>

        <h2>Why private landlords are selling</h2>

        <p>
          Nearly half of Dutch student housing sits in private hands. NOS Nieuwsuur reported that{' '}
          <strong>43 percent</strong> of student homes are owned by private landlords (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Three policy shifts are repeatedly cited as drivers of divestment.
        </p>

        <h3>The Wet betaalbare huur and point-based rent caps</h3>

        <p>
          The Affordable Rent Act introduced a points system that caps what landlords may charge. NOS Nieuwsuur noted
          that in many cases the permitted rent is lower than what owners expected to earn, reducing the incentive to
          keep renting to students (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Kences director Jolan de Bie told NOS that while parts of the law protect tenants, stricter rules on
          sharing with three or more renters make multi-tenant student houses less attractive to hold (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Permits for three or more tenants</h3>

        <p>
          Municipal permits are now required when more than two unrelated people share a home. That rule targets
          overcrowding, but it also raises compliance costs for classic Dutch student houses where three or four
          housemates split rent. LSVb chair Maaike Krom told NOS that woningdelen with up to three people should be
          allowed without a permit, provided fire-safety standards are met (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Tax and transaction volume</h3>

        <p>
          Higher box 3 taxation on rental income compounds the yield problem. NOS reported that more than{' '}
          <strong>5,000</strong> student homes were sold in a single year, equating to roughly <strong>10,000</strong>{' '}
          rooms, a rate one and a half times higher than the year before (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences estimated that the Netherlands could lose about <strong>9 percent</strong> of its student rooms
          within two years, with a projected decline of roughly <strong>45,000</strong> private-sector rooms over that
          period (
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
          The chart below shows where private rental sales have been most concentrated in major student cities, according
          to an ABF report cited by NOS.
        </p>

        <BlogBarChart
          data={[
            { label: 'Amsterdam', value: 2000 },
            { label: 'Rotterdam', value: 1025 },
            { label: 'Utrecht', value: 810 },
            { label: 'Groningen', value: 695 },
          ]}
          yLabel="Sold homes"
          unit="homes"
          caption="Source: ABF figures reported via NOS, 2025. Sold private rental homes in selected Dutch student cities."
        />

        <h2>Who feels the squeeze first</h2>

        <p>
          Domestic students can sometimes remain at a parental home when listings dry up. International degree students
          generally cannot. Nuffic&apos;s fact sheets note that while Dutch students often have a fallback address,
          international students depend on private rentals or institution-provided housing, making general market
          scarcity hit them directly (
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). That asymmetry is why room access functions as an integration variable, not only a rent line, as explored
          in{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            our earlier analysis of international student housing data
          </Link>
          .
        </p>

        <p>
          LSVb told NOS that shrinking supply, rising rents, and limited part-time work alongside full-time study are
          eroding student wellbeing, with many spending disproportionate energy on the financial side of housing (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). In Utrecht, NOS regional reporting linked a <strong>32 percent</strong> drop in available student rooms in
          2025 to landlords selling because of stricter rental rules (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Apartment buildings in a Dutch city - student housing supply in university towns"
          />
          <figcaption>
            City-level policy choices on woningdelen and newbuild targets now shape national shortage figures.
          </figcaption>
        </figure>

        <h2>Policy responses on the table</h2>

        <h3>Permit-free woningdelen</h3>

        <p>
          Kences and LSVb both argue that municipalities should allow sharing with up to three tenants without a
          separate permit, paired with fire-safety checks. De Bie suggested combining that flexibility with targeted
          rent support so students in private rooms can access assistance similar to some corporation tenants (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). LSVb&apos;s municipal review across fifteen cities, including Utrecht, also recommends easing parking
          requirements for shared homes and relaxing rules on living above retail premises (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <h3>Campus contracts and graduate turnover</h3>

        <p>
          NOS Nieuwsuur reported De Bie advocating campus contracts that require graduates to vacate, reducing the
          phenomenon where <strong>57 percent</strong> of graduates still occupy a student room one year after finishing,
          blocking turnover (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          , citing Kences monitor data relayed in{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Municipal newbuild as counterweight</h3>

        <p>
          Some cities are responding with volume targets. NOS reported that Eindhoven plans roughly{' '}
          <strong>5,400</strong> new student homes over eight years in partnership with TU/e, Fontys, and housing
          providers, partly funded through the national Beethoven investment programme (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). TU/e leadership linked inadequate housing to roughly <strong>500</strong> students ending their studies
          early in one intake cycle because they could not find a room (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). That figure illustrates how supply shocks translate into enrolment and completion risk, a theme developed
          in{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            our retention-focused housing analysis
          </Link>
          .
        </p>

        <h2>What students and institutions can realistically do</h2>

        <p>
          None of the above replaces individual due diligence in a tighter market. When listings are scarce, scam risk
          rises and contract clauses matter more. The{' '}
          <Link href="/blog/safety-checklist-for-student-renters">student renter safety checklist</Link> remains a
          practical starting point for verifying landlords, deposits, and registration obligations before money changes
          hands.
        </p>

        <p>
          Universities and municipalities that publish transparent housing guidance reduce information asymmetry for
          incoming cohorts. Context on how different institutions sit inside local housing regimes is summarised on the{' '}
          <Link href="/universities">universities overview</Link>. Editorial standards for how housing data is used in
          public writing are described on the <Link href="/about">about page</Link>.
        </p>

        <h2>Reading the next monitor cycle</h2>

        <p>
          The Dutch student housing story is no longer only about building faster. It is about{' '}
          <strong>whether private stock stays in the rental pool</strong> once regulatory returns compress, and whether
          municipalities will treat woningdelen as capacity policy rather than nuisance control. The next Landelijke
          Monitor Studentenhuisvesting release will show whether sales have plateaued or accelerated, and whether
          students who stopped searching are counted as demand that quietly disappeared.
        </p>

        <p>
          Until then, the honest headline is supply-side: every sold student house removes rooms that take years to
          replace, even when corporate newbuild continues. Students are not only competing with each other. They are
          competing with a market that is restructuring underneath them.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved
          5 August 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Retrieved 5 August 2026,{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS Nieuwsuur. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.
          Retrieved 5 August 2026,{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>In strijd tegen kamertekort wil studentenbond dat woningdelen makkelijker wordt</em>. Retrieved
          5 August 2026,{' '}
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>. Retrieved 5
          August 2026,{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>Fact sheet on international students</em> (PDF). Retrieved 5 August 2026,{' '}
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title:
      'Particuliere verhuurders verlaten de studentenmarkt: wat de Nederlandse aanbodschok betekent',
    excerpt:
      'Kences en NOS rapporteren dat particulieren studentenwoningen verkopen nu verhuurregels aanscherpen. Zo raakt het aanbodverlies woningdelen, gemeentelijk beleid en wie het risico draagt.',
    publishDate: '2026-08-05',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Internationale studentenhuisvesting in Nederland',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Hoe landelijke monitoring kamertoegang koppelt aan integratierisico voor mobiele studenten.',
      },
      {
        title: 'Studentenhuisvesting en retentie',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Waarom minder uitwonen en langer thuiswonen op retentiecijfers terugkomen.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Contractcontrole en oplichtingsbewustzijn wanneer concurrentie om kamers toeneemt.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting draait vaak om hoeveel bedden een stad nog moet bouwen. Dat beeld is
          onvolledig. Berichtgeving van{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS (2025)
          </a>{' '}
          en de Landelijke Monitor Studentenhuisvesting, via Kences, beschrijft een parallelle schok:{' '}
          <strong>particuliere verhuurders verlaten de studentenmarkt sneller dan nieuw aanbod arriveert</strong>. Het
          gevolg is niet alleen minder advertenties, maar een verschuiving in wie de resterende kamers beheert.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Huurcontract en documenten op een bureau - particuliere verhuur en studentenhuur in Nederland"
          />
          <figcaption>
            Regelgeving herstructureert de particuliere studentenhuurmarkt, niet alleen de prijs op het contract.
          </figcaption>
        </figure>

        <h2>Aanbod daalt terwijl vraag blijft</h2>

        <p>
          In september 2025 meldde NOS op basis van Kences dat het landelijke kamertekort rond de{' '}
          <strong>21.000</strong> lag, met projecties tot circa <strong>63.200</strong> in 2032-2033 onder stressscenario&apos;s (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Tegelijkertijd groeide de kloof tussen wens en werkelijkheid: <strong>44 procent</strong> woonde op kamers
          terwijl <strong>49 procent</strong> dat wilde, tegenover <strong>52 procent</strong> en <strong>59 procent</strong>{' '}
          acht jaar eerder (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences concludeerde dat steeds meer studenten de hoop opgeven.
        </p>

        <p>
          Aan de aanbodkant: het totale kameraanbod in twintig studentensteden daalde met naar schatting{' '}
          <strong>13.500</strong> tot circa <strong>322.400</strong>, en <strong>17.800</strong> minder studenten woonden
          in de particuliere sector dan het jaar ervoor (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Er kwamen ruwweg <strong>5.000</strong> kamers bij, maar verkopen overschaduwden die winst.
        </p>

        <h2>Waarom particulieren verkopen</h2>

        <p>
          Bijna de helft van het studentenwoningaanbod is particulier. NOS Nieuwsuur noemde <strong>43 procent</strong> (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Drie beleidswijzigingen worden steeds genoemd.
        </p>

        <h3>De Wet betaalbare huur</h3>

        <p>
          Het puntensysteem begrenst de huur. NOS Nieuwsuur noteerde dat toegestane huren vaak lager uitvallen dan
          verhuurders verwachtten (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Kences-directeur Jolan de Bie zei tegen NOS dat strengere regels voor wonen met drie of meer huurders
          studentenhuizen minder aantrekkelijk maken (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Vergunningen bij drie of meer bewoners</h3>

        <p>
          Gemeenten vereisen nu een vergunning bij meer dan twee ongerelateerde bewoners. LSVb-voorzitter Maaike Krom
          pleitte bij NOS voor vergunningsvrij woningdelen tot drie personen met brandveiligheidscontrole (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Belasting en verkoopvolume</h3>

        <p>
          Hogere box 3-belasting versterkt het rendementsprobleem. NOS meldde meer dan <strong>5.000</strong> verkochte
          studentenwoningen in een jaar, goed voor circa <strong>10.000</strong> kamers, anderhalf keer zoveel als het
          jaar ervoor (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences schatte dat Nederland in twee jaar circa <strong>9 procent</strong> van de studentenkamers kan
          verliezen, met een daling van ruwweg <strong>45.000</strong> particuliere kamers (
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
          De grafiek toont waar verkopen van particuliere huurwoningen het meest geconcentreerd waren, volgens een
          ABF-rapport via NOS.
        </p>

        <BlogBarChart
          data={[
            { label: 'Amsterdam', value: 2000 },
            { label: 'Rotterdam', value: 1025 },
            { label: 'Utrecht', value: 810 },
            { label: 'Groningen', value: 695 },
          ]}
          yLabel="Verkochte woningen"
          unit="woningen"
          caption="Bron: ABF-cijfers via NOS, 2025. Verkochte particuliere huurwoningen in geselecteerde studentensteden."
        />

        <h2>Wie de druk het eerst voelt</h2>

        <p>
          Nederlandse studenten kunnen soms thuis blijven wonen. Internationale studenten meestal niet. Nuffic benadrukt
          dat internationale studenten afhankelijk zijn van particuliere huur of instellingswoningen (
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). Zie ook{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            onze analyse van internationale studentenhuisvesting
          </Link>
          .
        </p>

        <p>
          In Utrecht daalde het aantal beschikbare studentenkamers in 2025 met <strong>32 procent</strong>, deels door
          verkopen (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Appartementencomplexen in een Nederlandse stad - studentenhuisvesting in universiteitssteden"
          />
          <figcaption>
            Gemeentelijk beleid over woningdelen en nieuwbouw bepaalt nu landelijke tekortcijfers.
          </figcaption>
        </figure>

        <h2>Beleidsantwoorden</h2>

        <h3>Vergunningsvrij woningdelen</h3>

        <p>
          Kences en LSVb pleiten voor delen tot drie personen zonder aparte vergunning, met brandveiligheidschecks. De
          Bie suggereerde gerichte huurondersteuning voor studenten in particuliere kamers (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). LSVb adviseert ook versoepeling van parkeereisen en wonen boven winkels (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS Utrecht, 2025
          </a>
          ).
        </p>

        <h3>Campuscontracten</h3>

        <p>
          De Bie pleitte voor campuscontracten zodat afgestudeerden vertrekken. <strong>57 procent</strong> woont nog na
          een jaar in de studentenkamer (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          , Kences via{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Gemeentelijke nieuwbouw</h3>

        <p>
          Eindhoven plant circa <strong>5.400</strong> studentenwoningen in acht jaar (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). TU/e koppelde gebrekkige huisvesting aan circa <strong>500</strong> voortijdige studiestops in één
          instroomcyclus. Zie ook{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">onze retentie-analyse</Link>.
        </p>

        <h2>Praktisch voor studenten en instellingen</h2>

        <p>
          In een krappere markt tellen contracten en oplichtingsbewustzijn meer. De{' '}
          <Link href="/blog/safety-checklist-for-student-renters">veiligheidschecklist voor studenthuurders</Link> is een
          startpunt. Instellingen en gemeenten die heldere huisvestingsinformatie publiceren, verkleinen
          informatie-asymmetrie. Context per instelling: <Link href="/universities">overzicht universiteiten</Link>.
          Redactionele kaders: <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>De volgende monitor</h2>

        <p>
          Het verhaal gaat niet meer alleen over sneller bouwen, maar over{' '}
          <strong>of particulier aanbod in de verhuurpool blijft</strong> en of gemeenten woningdelen als capaciteit
          zien. Tot de volgende Landelijke Monitor duidelijk is of verkopen afvlakken of versnellen, en of studenten die
          stoppen met zoeken als verdwenen vraag meetellen.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Geraadpleegd 5
          augustus 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Geraadpleegd 5 augustus 2026,{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS Nieuwsuur. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.
          Geraadpleegd 5 augustus 2026,{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Eindhoven gaat 5400 studentenwoningen bouwen om kamertekort tegen te gaan</em>. Geraadpleegd 5
          augustus 2026,{' '}
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>Fact sheet on international students</em> (PDF). Geraadpleegd 5 augustus 2026,{' '}
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/sites/default/files/2023-05/factsheet-international-students-2023.pdf
          </a>
        </p>
      </div>
    ),
  },
}

export function PrivateLandlordsStudentHousingArticle() {
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
