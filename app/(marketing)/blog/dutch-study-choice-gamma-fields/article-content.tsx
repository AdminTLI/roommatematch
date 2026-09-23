'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Dutch Study Choice: Why Gamma Fields Dominate',
    excerpt:
      'Rathenau data show most Dutch bachelor students enrol in gamma fields. That concentration shapes how programme choice, fixus deadlines, and early switches work in practice.',
    publishDate: '2026-09-23',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Why Explainable AI Matters',
        href: '/blog/why-explainable-ai-matters',
        description:
          'How transparent decision systems help students evaluate structured recommendations.',
      },
      {
        title: 'Housemate Support When Living Away From Home',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Wellbeing patterns for students living away from parents, separate from study-field choice.',
      },
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'How daily study rhythms interact with shared living once a programme is underway.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Open a Dutch programme catalogue and the landscape looks infinite: hundreds of bachelor titles across
          hogescholen and universities. Enrolment numbers tell a narrower story. In study year 2022/2023, the{' '}
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>{' '}
          reported that <strong>56%</strong> of bachelor enrolments in publicly funded higher education sat in the
          gamma sciences - social sciences, education, business, and law - while bèta and technology took{' '}
          <strong>20%</strong>, medical programmes <strong>17%</strong>, and the alfa fields only{' '}
          <strong>8%</strong>.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Overhead view of hands writing in a notebook on a wooden desk with glasses, coffee, and a laptop"
          />
          <figcaption>
            Study choice is decided long before a first lecture: field concentration and calendar deadlines shape the
            options that feel real.
          </figcaption>
        </figure>

        <h2>What “gamma dominance” actually measures</h2>

        <p>
          Rathenau’s datapublicatie{' '}
          <em>Studenten in het hoger onderwijs naar wetenschapsgebied</em> groups fields for a parliamentary
          information request, not for marketing slogans. Under that definition, gamma covers social sciences,
          education, business administration, and law. Bèta and technology cover natural sciences, ICT, engineering,
          and agriculture. Alfa covers arts and humanities. Medical stands alone. Nearly{' '}
          <strong>680,000</strong> bachelor enrolments were counted in 2022/2023, with more than two-thirds at
          hogescholen and just under one-third at universities or university medical centres (
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut, 2023
          </a>
          ).
        </p>

        <p>
          The bachelor shares below come from that same release. They are shares of enrolments, not a ranking of
          programme quality, and they do not claim that gamma students chose “wrong.” They show where capacity and
          preference currently land.
        </p>

        <BlogBarChart
          data={[
            { label: 'Gamma', value: 56 },
            { label: 'Bèta/tech', value: 20 },
            { label: 'Medical', value: 17 },
            { label: 'Alfa', value: 8 },
          ]}
          yLabel="Share of bachelor enrolments"
          valueFormat="percent"
          caption="Source: Rathenau Instituut, Studenten in het hoger onderwijs naar wetenschapsgebied, study year 2022/2023. https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
        />

        <h2>Masters rebalance, but gamma still leads</h2>

        <p>
          At master level the picture softens. Among almost <strong>140,000</strong> master enrolments, gamma
          remains the largest group at <strong>47%</strong>, while bèta and technology rise to{' '}
          <strong>33%</strong>, medical programmes take <strong>13%</strong>, and alfa stays at{' '}
          <strong>8%</strong> (
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>
          ). Internationally, Dutch bachelor students lean unusually hard into gamma; master shares sit closer to
          peer-country averages. That pattern matters for anyone comparing HBO and WO pathways: the “popular”
          bachelor cluster is not identical to the master or labour-market mix that follows.
        </p>

        <h3>Labour-market signals sit beside popularity</h3>

        <p>
          A later Rathenau factsheet on internationalisation and the labour market notes that higher-education
          graduates living in the Netherlands generally find work at high rates, while field-level chances of working
          in the Netherlands one year after graduation differ by direction and by whether graduates are domestic or
          international (
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>
          ). The editorial point is modest: popularity and early employability are related but not the same map.
          Students who treat “everyone around me chose business or psychology” as the only evidence of fit risk
          skipping fields that are smaller in the bachelor count yet stronger in specific employer demand.
        </p>

        <h2>Deadlines compress how choice actually happens</h2>

        <p>
          Field shares describe outcomes. The Dutch calendar describes process. The national government confirms that
          students who register via Studielink by <strong>1 May</strong> keep toelatingsrecht and a right to a
          studiekeuzecheck for non-selective programmes, while numerus-fixus programmes require registration by{' '}
          <strong>15 January</strong>, with a maximum of two fixus programmes per year and stricter one-institution
          limits for medicine, dentistry, physiotherapy, midwifery, and mondzorgkunde (
          <a
            href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid, Studiekeuze en toelating
          </a>
          ).
        </p>

        <p>
          Those dates turn study choice into a sequenced decision, not a continuous browse. A student exploring a
          selective medical or psychology fixus must commit months earlier than a peer aiming at open-intake gamma or
          technology programmes. Changing direction after 1 May is still possible when the first registration was on
          time, but Studiekeuze123 notes that late switches into free-intake programmes can collide with matching or
          studiekeuzecheck requirements that are hard to finish before September (
          <a
            href="https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuze123
          </a>
          ).
        </p>

        <h2>Doubt in year one is a system feature, not a personal failure</h2>

        <p>
          Studiekeuze123’s guidance for first-year doubt treats switching as a normal pathway: talk with a study
          adviser, test whether the mismatch is content, teaching form, or pace, and check whether credits can travel
          inside the same institution (
          <a
            href="https://www.studiekeuze123.nl/wat-ga-jij-kiezen/artikel/twijfels-in-het-eerste-jaar"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuze123
          </a>
          ). That framing sits well beside Rathenau’s field map. When more than half of bachelor places sit in one
          broad gamma cluster, many students discover mid-year that they chose a neighbouring title inside a crowded
          field rather than the wrong “level” of education. Precision inside the cluster - research methods versus
          applied management, teacher education versus psychology - often matters more than the HBO/WO label alone.
        </p>

        <p>
          Domu Match’s{' '}
          <Link href="/universities">university and programme directory</Link> is one place students compare
          institutional contexts; the broader editorial archive on{' '}
          <Link href="/about">how Domu Match approaches student infrastructure</Link> stays separate from enrolment
          statistics. Living arrangements still interact with study load - see{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            housemate support when living away from home
          </Link>{' '}
          - but field concentration is a study-landscape issue first.
        </p>

        <h2>Practical reading for the next open day</h2>

        <ul>
          <li>
            Read popularity as density, not proof. A crowded gamma title can still be an excellent fit; it is simply
            not scarce information.
          </li>
          <li>
            Map the calendar before the brochure. Fixus by 15 January and general bachelor registration by 1 May are
            different decision tempos (
            <a
              href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>
            Compare neighbouring programmes inside a field, not only across fields. Master and labour-market
            compositions already diverge from bachelor shares (
            <a
              href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
              target="_blank"
              rel="noreferrer"
            >
              Rathenau
            </a>
            ).
          </li>
          <li>
            Treat first-year doubt as diagnostic. Advisers and switch rules exist because mismatch is common (
            <a
              href="https://www.studiekeuze123.nl/wat-ga-jij-kiezen/artikel/twijfels-in-het-eerste-jaar"
              target="_blank"
              rel="noreferrer"
            >
              Studiekeuze123
            </a>
            ).
          </li>
        </ul>

        <p>
          The Dutch study landscape is not a flat menu. It is a skewed distribution with early selective gates.
          Understanding that skew - where students actually enrol, when the calendar forces commitment, and how
          switches work afterward - is more useful than treating every brochure title as equally reachable.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Rathenau Instituut. (2023). Meeste studenten hoger onderwijs kiezen gammarichting.{' '}
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rathenau Instituut. (2023). Studenten in het hoger onderwijs naar wetenschapsgebied.{' '}
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rathenau Instituut. Internationalisering in perspectief: aantallen studenten, studiekeuzes en
          arbeidsmarkt.{' '}
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksoverheid. Studiekeuze en toelating.{' '}
          <a
            href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuze123. Praktische zaken rond aanmelden; Twijfel je over je studie in het eerste jaar?{' '}
          <a
            href="https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Studiekeuze in Nederland: waarom gamma zo dominant is',
    excerpt:
      'Rathenau-cijfers laten zien dat de meeste bachelorstudenten in gamma-richtingen zitten. Die concentratie kleurt programma-keuze, fixusdeadlines en vroege switches.',
    publishDate: '2026-09-23',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Why Explainable AI Matters',
        href: '/blog/why-explainable-ai-matters',
        description:
          'Hoe transparante beslislogica studenten helpt gestructureerde aanbevelingen te beoordelen.',
      },
      {
        title: 'Steun van huisgenoten als je uit huis woont',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Welzijnspatronen voor uitwonende studenten, los van studierichtingskeuze.',
      },
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Hoe dagelijkse studieritmen samengaan met samenwonen zodra een opleiding loopt.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Open een Nederlandse opleidingscatalogus en het aanbod lijkt eindeloos: honderden bachelortitels bij
          hogescholen en universiteiten. De inschrijvingscijfers vertellen een smaller verhaal. In studiejaar
          2022/2023 rapporteerde het{' '}
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>{' '}
          dat <strong>56%</strong> van de bachelorinschrijvingen in bekostigd hoger onderwijs in de
          gammawetenschappen zat - sociale wetenschappen, onderwijs, bedrijfskunde en recht - terwijl bèta en
          techniek <strong>20%</strong> namen, medische opleidingen <strong>17%</strong> en de alfawetenschappen
          slechts <strong>8%</strong>.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Bovenaanzicht van handen die in een schrift schrijven op een houten bureau met bril, koffie en een laptop"
          />
          <figcaption>
            Studiekeuze wordt beslist lang voor het eerste college: veldconcentratie en kalenderdeadlines bepalen
            welke opties echt haalbaar voelen.
          </figcaption>
        </figure>

        <h2>Wat “gammadominantie” precies meet</h2>

        <p>
          Rathenau’s datapublicatie{' '}
          <em>Studenten in het hoger onderwijs naar wetenschapsgebied</em> groepeert velden voor een
          Kamerinformatievraag, niet voor marketing. Onder die definitie dekken gamma sociale wetenschappen,
          onderwijs, bedrijfskunde en recht. Bèta en techniek dekken natuur, ICT, techniek en landbouw. Alfa dekt
          kunst en geesteswetenschappen. Medisch staat apart. Bijna <strong>680.000</strong> bachelorinschrijvingen
          werden geteld in 2022/2023, waarvan ruim tweederde bij hogescholen en bijna een derde bij universiteiten
          of umc’s (
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut, 2023
          </a>
          ).
        </p>

        <p>
          De bacheloraandelen hieronder komen uit diezelfde publicatie. Het zijn aandelen van inschrijvingen, geen
          kwaliteitsranking, en ze beweren niet dat gammastudenten “verkeerd” kozen. Ze laten zien waar capaciteit en
          voorkeur nu landen.
        </p>

        <BlogBarChart
          data={[
            { label: 'Gamma', value: 56 },
            { label: 'Bèta/tech', value: 20 },
            { label: 'Medisch', value: 17 },
            { label: 'Alfa', value: 8 },
          ]}
          yLabel="Aandeel bachelorinschrijvingen"
          valueFormat="percent"
          caption="Bron: Rathenau Instituut, Studenten in het hoger onderwijs naar wetenschapsgebied, studiejaar 2022/2023. https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
        />

        <h2>Masters herbalanceren, maar gamma blijft het grootst</h2>

        <p>
          Op masterniveau verzacht het beeld. Onder bijna <strong>140.000</strong> masterinschrijvingen blijft gamma
          met <strong>47%</strong> de grootste groep, terwijl bèta en techniek stijgen naar <strong>33%</strong>,
          medische masters <strong>13%</strong> nemen en alfa op <strong>8%</strong> blijft (
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>
          ). Internationaal leunen Nederlandse bachelorstudenten relatief sterk op gamma; masteraandelen liggen
          dichter bij het peergemiddelde. Dat patroon telt voor wie HBO- en WO-routes vergelijkt: het “populaire”
          bachelorcluster is niet identiek aan de master- of arbeidsmarktmix die volgt.
        </p>

        <h3>Arbeidsmarktsignalen zitten naast populariteit</h3>

        <p>
          Een latere Rathenau-factsheet over internationalisering en arbeidsmarkt merkt op dat gediplomeerden in
          Nederland doorgaans hoge werkpercentages hebben, terwijl de kans op werk in Nederland één jaar na afstuderen
          verschilt per richting en tussen Nederlandse en internationale gediplomeerden (
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt"
            target="_blank"
            rel="noreferrer"
          >
            Rathenau Instituut
          </a>
          ). Het redactionele punt is bescheiden: populariteit en vroege inzetbaarheid hangen samen, maar zijn niet
          dezelfde kaart. Wie “iedereen om mij heen koos bedrijfskunde of psychologie” als enig bewijs van fit
          gebruikt, mist velden die kleiner zijn in de bachelortelling maar sterker in specifieke werkgeversvraag.
        </p>

        <h2>Deadlines comprimeren hoe keuze echt werkt</h2>

        <p>
          Veldaandelen beschrijven uitkomsten. De Nederlandse kalender beschrijft het proces. De Rijksoverheid
          bevestigt dat studenten die zich via Studielink uiterlijk op <strong>1 mei</strong> aanmelden
          toelatingsrecht houden en recht hebben op een studiekeuzecheck bij niet-selecterende opleidingen, terwijl
          numerus-fixusopleidingen aanmelding tot en met <strong>15 januari</strong> eisen, met maximaal twee
          fixusopleidingen per jaar en strengere één-instelling-limieten voor geneeskunde, tandheelkunde,
          fysiotherapie, verloskunde en mondzorgkunde (
          <a
            href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid, Studiekeuze en toelating
          </a>
          ).
        </p>

        <p>
          Die data maken van studiekeuze een gesequenced besluit, geen doorlopend bladeren. Wie een selectieve
          medische of psychologiefixus verkent, moet maanden eerder committen dan iemand die mikt op open-intake
          gamma- of techniekopleidingen. Van richting wisselen na 1 mei kan nog als de eerste aanmelding op tijd was,
          maar Studiekeuze123 merkt op dat late switches naar vrije-instroomopleidingen kunnen botsen met matching-
          of studiekeuzecheck-eisen die moeilijk vóór september afrondbaar zijn (
          <a
            href="https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuze123
          </a>
          ).
        </p>

        <h2>Twijfel in jaar één is een systeemkenmerk, geen persoonlijk falen</h2>

        <p>
          Studiekeuze123 behandelt switchen bij eerstejaars twijfel als een normaal pad: praat met een
          studieadviseur, test of de mismatch inhoud, onderwijsvorm of tempo betreft, en check of studiepunten binnen
          dezelfde instelling meereizen (
          <a
            href="https://www.studiekeuze123.nl/wat-ga-jij-kiezen/artikel/twijfels-in-het-eerste-jaar"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuze123
          </a>
          ). Dat frame past bij Rathenau’s veldkaart. Als meer dan de helft van de bachelorplaatsen in één breed
          gammacluster zit, ontdekken veel studenten halverwege het jaar dat ze een naburige titel binnen een vol
          veld kozen, niet per se het “verkeerde” onderwijsniveau. Precisie binnen het cluster - onderzoeksmethoden
          versus toegepast management, pabo versus psychologie - telt vaak zwaarder dan alleen het HBO/WO-label.
        </p>

        <p>
          De{' '}
          <Link href="/universities">universiteits- en opleidingsdirectory</Link> van Domu Match is één plek om
          institutionele contexten te vergelijken; het bredere archief over{' '}
          <Link href="/about">hoe Domu Match studenteninfrastructuur benadert</Link> blijft gescheiden van
          inschrijvingsstatistiek. Woonvormen blijven wel interactie hebben met studielast - zie{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            steun van huisgenoten als je uit huis woont
          </Link>{' '}
          - maar veldconcentratie is eerst een studielandschapskwestie.
        </p>

        <h2>Praktische lezing voor de volgende open dag</h2>

        <ul>
          <li>
            Lees populariteit als dichtheid, niet als bewijs. Een volle gammatitel kan uitstekend passen; het is
            simpelweg geen schaarse informatie.
          </li>
          <li>
            Zet de kalender vóór de brochure. Fixus tot 15 januari en algemene bacheloraanmelding tot 1 mei zijn
            verschillende besluitstempels (
            <a
              href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>
            Vergelijk naburige opleidingen binnen een veld, niet alleen tussen velden. Master- en arbeidsmarktmixen
            wijken al af van bacheloraandelen (
            <a
              href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
              target="_blank"
              rel="noreferrer"
            >
              Rathenau
            </a>
            ).
          </li>
          <li>
            Behandel eerstejaarstwijfel als diagnose. Adviseurs en switchregels bestaan omdat mismatch gewoon is (
            <a
              href="https://www.studiekeuze123.nl/wat-ga-jij-kiezen/artikel/twijfels-in-het-eerste-jaar"
              target="_blank"
              rel="noreferrer"
            >
              Studiekeuze123
            </a>
            ).
          </li>
        </ul>

        <p>
          Het Nederlandse studielandschap is geen vlakke menukaart. Het is een scheve verdeling met vroege selectieve
          poorten. Die scheefheid begrijpen - waar studenten echt inschrijven, wanneer de kalender commitment
          forceert, en hoe switchen daarna werkt - is bruikbaarder dan elke brochures titel als even bereikbaar te
          behandelen.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          Rathenau Instituut. (2023). Meeste studenten hoger onderwijs kiezen gammarichting.{' '}
          <a
            href="https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/werking-van-het-wetenschapssysteem/meeste-studenten-hoger-onderwijs-kiezen-gammarichting
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rathenau Instituut. (2023). Studenten in het hoger onderwijs naar wetenschapsgebied.{' '}
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/wetenschap-cijfers/studenten-het-hoger-onderwijs-naar-wetenschapsgebied
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rathenau Instituut. Internationalisering in perspectief: aantallen studenten, studiekeuzes en
          arbeidsmarkt.{' '}
          <a
            href="https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rathenau.nl/nl/wetenschap-cijfers/internationalisering-perspectief-aantallen-studenten-studiekeuzes-en-arbeidsmarkt
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksoverheid. Studiekeuze en toelating.{' '}
          <a
            href="https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/themas/onderwijs/hoger-onderwijs/studiekeuze-en-toelating
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuze123. Praktische zaken rond aanmelden; Twijfel je over je studie in het eerste jaar?{' '}
          <a
            href="https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studiekeuze123.nl/nieuws/praktische-zaken-rond-aanmelden
          </a>
        </p>
      </div>
    ),
  },
}

export function DutchStudyChoiceGammaFieldsArticle() {
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
