'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

/** Selected via selectHeroImageKey({ category: 'Lifestyle', secondaryCategory: 'Compatibility' }); avoids last-4 registry keys. */
const heroImageKey = 'sharedKitchen' as const

const content = {
  en: {
    title: 'Autumn Huisavond: Indoor Bonding for Dutch Students',
    excerpt:
      'Late October pushes student life indoors. Huisavond, shared dinners, and low-pressure rituals keep Dutch housemates connected when daylight and campus social life shrink.',
    publishDate: '2026-10-21',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How houses write short norms without turning every invite into a late-night message war.',
      },
      {
        title: 'Housemate Support When Living Away From Home',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'How emotional support expectations change once students live away from parents.',
      },
      {
        title: 'Exam Week House Rules',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Temporary quiet, kitchen, and guest norms when tentamenweek compresses the house calendar.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          By late October, Dutch student cities flip a quiet switch. Terrace season fades, bike rides get wetter, and the
          shared kitchen becomes the default social venue. That is not a mood board detail. National student monitoring
          still finds that about <strong>23%</strong> of HBO and university students report strong loneliness (
          <a
            href="https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid"
            target="_blank"
            rel="noreferrer"
          >
            RIVM / Trimbos / GGD GHOR, MMMS student loneliness indicator, 2025
          </a>
          ). When weather and midterms pull people indoors, the house either becomes a soft landing—or a set of closed
          bedroom doors.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Bright open-plan kitchen with wooden cabinets, a long dining table, bar stools, and houseplants—typical shared-house gathering space"
            priority
          />
          <figcaption>
            Autumn bonding rarely needs a party theme. It needs a kitchen people can enter without performing.
          </figcaption>
        </figure>

        <h2>Why indoor bonding is a late-autumn skill</h2>

        <p>
          September social life is external: intro weeks, association nights, spontaneous after-lecture plans. October
          is internal. Daylight shortens, study blocks lengthen, and housemates see each other more—but often only as
          shadows between lectures and bed. Research on students living away from home keeps finding the same pattern:
          being <em>uitwonend</em> can raise loneliness and stress compared with living with parents, especially in
          smaller shared setups (
          <a
            href="https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558"
            target="_blank"
            rel="noreferrer"
          >
            NRC coverage of Inholland wellbeing research, 2025
          </a>
          ). The protective factor is not square metres. It is whether anyone still cooks with the door open.
        </p>

        <p>
          Dutch houses already have a cultural technology for this: <strong>huisavond</strong>—a recurring house night
          that is more ritual than rave. Guides for first-time co-living still treat shared dinners, house evenings, and
          low-stakes events as the glue that turns strangers into a working household (
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuzelab housemate agreement guidance
          </a>
          ). Autumn is when that glue gets tested.
        </p>

        <h2>Gezelligheid without the group chat pressure</h2>

        <p>
          Gezelligheid is often mistranslated as “cosy.” In a student house it is closer to{' '}
          <em>permission to linger without a pitch</em>. The midterm mistake is to schedule bonding like a project:
          mandatory fun, three-hour board-game marathons, or “everyone must come” WhatsApp threads that punish the
          exhausted. Better indoor bonding is optional, short, and repeatable.
        </p>

        <h3>Do&apos;s for an autumn huisavond</h3>
        <ul>
          <li>
            <strong>Pick a fixed slot, not a fixed vibe.</strong> Same night each week (or fortnight). Cancel once if
            exams explode; do not invent a new night every time.
          </li>
          <li>
            <strong>Cook once, eat together, leave early.</strong> Ninety minutes beats an all-evening obligation. People
            with 08:30 lectures still get a shared meal.
          </li>
          <li>
            <strong>Offer an opt-in, not a roll call.</strong> “Soup at 19:00 if you want” lands softer than “Who is not
            coming?”
          </li>
          <li>
            <strong>Keep one communal light on.</strong> A lit kitchen or living room is an invitation; dark corridors
            become hotel hallways.
          </li>
        </ul>

        <h3>Don&apos;ts that kill winter-prep connection</h3>
        <ul>
          <li>Turning huisavond into a drinking contest. MMMS reporting already links student-house drinking cultures
            to heavier use patterns; autumn bonding does not need that script.</li>
          <li>Using the night to litigate chores. Park the schoonmaakrooster for another message—or for the quieter
            process described in{' '}
            <Link href="/blog/group-chats-ground-rules">group-chat ground rules</Link>.</li>
          <li>Expecting every housemate to be a best friend. Compatibility is routines and respect, not identical
            social batteries.</li>
        </ul>

        <h2>A simple indoor bonding menu for midterm weeks</h2>

        <p>
          Think of late October as maintenance, not festival season. Houses that stay connected usually rotate a few
          low-cost rituals:
        </p>

        <ul>
          <li>
            <strong>Soup Sunday / soepavond:</strong> one pot, phones face-down for twenty minutes, no presentations
            about your thesis chapter.
          </li>
          <li>
            <strong>Parallel study hour:</strong> same table, headphones welcome, zero conversation required. Connection
            without performance.
          </li>
          <li>
            <strong>Corridor check-ins:</strong> a two-sentence “How is your week looking?” beats waiting for someone to
            cry in the kitchen—see also{' '}
            <Link href="/blog/housemate-support-living-away-from-home">housemate support boundaries</Link>.
          </li>
          <li>
            <strong>Guest pause window:</strong> during heavy midterm blocks, agree that overnight guests need a quick
            house ping. That is courtesy, not a ban—different from temporary exam-week systems covered in{' '}
            <Link href="/blog/exam-week-house-rules-netherlands">exam-week house rules</Link>.
          </li>
        </ul>

        <h2>What institutions quietly need from house culture</h2>

        <p>
          Programme pages and student services can list coaches and peer groups, but daily belonging still happens at
          kitchen tables. When students feel they can be themselves in their living environment, wellbeing monitors
          tend to look better; when the house is only a storage unit between lectures, loneliness has more room to grow.
          That is why campus wellbeing work and housing culture are the same retention story told in different offices.
          For context on how Dutch institutions frame student life beyond a single city, the overview on{' '}
          <Link href="/universities">universities</Link> sits alongside the broader mission on{' '}
          <Link href="/about">about</Link>. Practical household budgeting tools such as the{' '}
          <Link href="/rent-calculator">rent calculator</Link> matter too—shared dinners collapse when nobody can afford
          the groceries—but money is the infrastructure, not the ritual.
        </p>

        <h2>A 10-minute house check-in script</h2>

        <p>Drop this in the house chat once. No emoji campaign required:</p>

        <ol>
          <li>Propose one recurring huisavond for November (day + end time).</li>
          <li>Ask everyone to name one “green” bonding activity (cook / study-together / walk) and one hard no.</li>
          <li>Agree that silence is a valid reply—opt-in only.</li>
          <li>Assign a rotating cook, not a permanent host.</li>
        </ol>

        <p>
          Indoor bonding is not about becoming a sitcom household. It is about making late autumn survivable: enough
          contact that loneliness does not harden into isolation, enough quiet that midterms still get done. The houses
          that manage both rarely invent new personalities. They invent a weekly table.
        </p>

        <h2>Sources</h2>
        <p className="text-sm text-slate-600">
          RIVM / Trimbos-instituut / GGD GHOR Nederland. Monitor Mentale gezondheid en Middelengebruik Studenten —
          loneliness indicator (verslagjaar 2025).{' '}
          <a
            href="https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NRC. (2025, 31 August). Student op kamers voelt zich mentaal minder goed (Inholland wellbeing research).{' '}
          <a
            href="https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuzelab. Op kamers? Zo maak je afspraken met je huisgenoten.{' '}
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut. Eenzaamheid onder studenten vraagt om aandacht, herkenning én actie.{' '}
          <a
            href="https://www.trimbos.nl/actueel/blogs/eenzaamheid-onder-studenten-vraagt-om-aandacht-herkenning-en-actie/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/actueel/blogs/eenzaamheid-onder-studenten-vraagt-om-aandacht-herkenning-en-actie/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksuniversiteit Groningen (Philosophy outreach). Een huis delen: hoe hou je het leuk?{' '}
          <a
            href="https://www.rug.nl/filosofie/outreach/een-huis-delen-hoe-hou-je-het-leuk-reduced.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rug.nl/filosofie/outreach/een-huis-delen-hoe-hou-je-het-leuk-reduced.pdf
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Herfst-huisavond: indoor bonding voor studenten',
    excerpt:
      'Eind oktober schuift het studentenleven naar binnen. Huisavond, samen eten en lage-druk rituelen houden huisgenoten verbonden als daglicht en campusleven afnemen.',
    publishDate: '2026-10-21',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Groepsappen, huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe je korte huisnormen opschrijft zonder dat elke uitnodiging een middernachtelijke app-oorlog wordt.',
      },
      {
        title: 'Steun van huisgenoten als je uit huis woont',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Hoe verwachtingen over emotionele steun veranderen als studenten niet meer bij hun ouders wonen.',
      },
      {
        title: 'Tentamenweek-huisregels',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Tijdelijke stilte-, keuken- en bezoeknormen wanneer tentamenweek de huiskalender comprimeert.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Eind oktober zet Nederlandse studentensteden een stille knop om. Terrassen raken leeg, fietsritten natter, en
          de gedeelde keuken wordt de standaard sociale plek. Dat is geen moodboarddetail. Landelijke
          studentenmonitoring laat nog steeds zien dat ongeveer <strong>23%</strong> van de hbo- en wo-studenten zich
          sterk eenzaam voelt (
          <a
            href="https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid"
            target="_blank"
            rel="noreferrer"
          >
            RIVM / Trimbos / GGD GHOR, MMMS-indicator eenzaamheid, 2025
          </a>
          ). Als weer en midterms mensen naar binnen trekken, wordt het huis óf een zachte landing—óf een rij gesloten
          slaapkamerdeuren.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Lichte open keuken met houten kasten, een lange eettafel, barkrukken en kamerplanten—typische gedeelde huiskamer"
            priority
          />
          <figcaption>
            Herfstbonding heeft zelden een feestthema nodig. Het heeft een keuken nodig waar je binnenloopt zonder te
            performen.
          </figcaption>
        </figure>

        <h2>Waarom indoor bonding een late-herfstvaardigheid is</h2>

        <p>
          Het sociale leven in september is vooral extern: introweken, verenigingsavonden, spontane plannen na college.
          Oktober is intern. Het daglicht wordt korter, studieblokken langer, en huisgenoten zien elkaar vaker—maar vaak
          alleen als schimmen tussen college en bed. Onderzoek onder uitwonende studenten blijft hetzelfde patroon
          laten zien: op kamers wonen kan eenzaamheid en stress verhogen ten opzichte van studenten die nog bij hun
          ouders wonen, vooral in kleinere woonsituaties (
          <a
            href="https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558"
            target="_blank"
            rel="noreferrer"
          >
            NRC over Inholland-welzijnsonderzoek, 2025
          </a>
          ). De beschermende factor is niet het aantal vierkante meters. Het is of iemand nog kookt met de deur open.
        </p>

        <p>
          Nederlandse huizen hebben daar al een culturele technologie voor: <strong>huisavond</strong>—een terugkerende
          avond die meer ritueel is dan rave. Guides voor eerste keer samenwonen behandelen gedeelde etentjes,
          huisavonden en low-stakes activiteiten nog steeds als de lijm die vreemden tot een werkend huishouden maakt (
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuzelab-advies over huisafspraken
          </a>
          ). De herfst is het moment waarop die lijm wordt getest.
        </p>

        <h2>Gezelligheid zonder groepsapp-druk</h2>

        <p>
          Gezelligheid wordt vaak vertaald als “cosy.” In een studentenhuis ligt het dichter bij{' '}
          <em>toestemming om te blijven zonder pitch</em>. De midterm-fout is bonding plannen als een project: verplichte
          fun, drie uur bordspel, of “iedereen moet komen”-threads die uitgeputte huisgenoten straffen. Betere indoor
          bonding is optioneel, kort en herhaalbaar.
        </p>

        <h3>Do&apos;s voor een herfst-huisavond</h3>
        <ul>
          <li>
            <strong>Kies een vast moment, geen vaste vibe.</strong> Dezelfde avond per week (of tweewekelijks). Annuleer
            één keer als tentamens exploderen; verzin niet elke keer een nieuwe avond.
          </li>
          <li>
            <strong>Eén keer koken, samen eten, vroeg weg.</strong> Negentig minuten wint het van een avondlange
            verplichting. Mensen met college om 08:30 krijgen wél een gedeelde maaltijd.
          </li>
          <li>
            <strong>Bied opt-in, geen presentielijst.</strong> “Soep om 19:00 als je zin hebt” voelt zachter dan “Wie komt
            er niet?”
          </li>
          <li>
            <strong>Houd één gemeenschappelijk licht aan.</strong> Een verlichte keuken of woonkamer is een uitnodiging;
            donkere gangen worden hotelgangen.
          </li>
        </ul>

        <h3>Don&apos;ts die verbinding kapotmaken</h3>
        <ul>
          <li>Huisavond veranderen in een drinkwedstrijd. MMMS-rapportages linken studenthuis-drinkcultuur al aan
            zwaarder middelengebruik; herfstbonding heeft dat script niet nodig.</li>
          <li>De avond gebruiken om klusjes uit te vechten. Parkeer het schoonmaakrooster voor een ander bericht—of voor
            het rustigere proces in{' '}
            <Link href="/blog/group-chats-ground-rules">groepsapp-huisregels</Link>.</li>
          <li>Van elke huisgenoot een beste vriend verwachten. Compatibiliteit is routines en respect, niet identieke
            sociale batterijen.</li>
        </ul>

        <h2>Een eenvoudig indoor-bondingmenu voor midtermweken</h2>

        <p>
          Zie eind oktober als onderhoud, niet als festival. Huizen die verbonden blijven, roteren meestal een paar
          goedkope rituelen:
        </p>

        <ul>
          <li>
            <strong>Soepzondag / soepavond:</strong> één pan, telefoons twintig minuten omlaag, geen presentatie over je
            scriptiehoofdstuk.
          </li>
          <li>
            <strong>Parallel studie-uur:</strong> dezelfde tafel, koptelefoon welkom, geen gesprek verplicht. Contact
            zonder performance.
          </li>
          <li>
            <strong>Gang-check-ins:</strong> twee zinnen “Hoe ziet je week eruit?” wint het van wachten tot iemand huilt
            in de keuken—zie ook{' '}
            <Link href="/blog/housemate-support-living-away-from-home">grenzen bij huisgenootsteun</Link>.
          </li>
          <li>
            <strong>Gast-pauzevenster:</strong> in zware midtermblokken afspreken dat overnachtingsgasten een korte
            huisping krijgen. Dat is hoffelijkheid, geen verbod—anders dan tijdelijke tentamenweek-systemen in{' '}
            <Link href="/blog/exam-week-house-rules-netherlands">tentamenweek-huisregels</Link>.
          </li>
        </ul>

        <h2>Wat instellingen stilzwijgend nodig hebben van huiscultuur</h2>

        <p>
          Opleidingspagina&apos;s en studentenservices kunnen coaches en peergroepen vermelden, maar dagelijks
          erbij-horen gebeurt nog steeds aan keukentafels. Als studenten zichzelf kunnen zijn in hun woonomgeving,
          zien welzijnsmonitors er vaak beter uit; als het huis alleen een opslagplek tussen colleges is, krijgt
          eenzaamheid meer ruimte. Daarom zijn campuswelzijn en huiscultuur hetzelfde retentieverhaal in verschillende
          kantoren. Voor context over hoe Nederlandse instellingen studentenleven kaderen, staat het overzicht op{' '}
          <Link href="/universities">universities</Link> naast de bredere missie op <Link href="/about">about</Link>.
          Praktische huishoudtools zoals de <Link href="/rent-calculator">rent calculator</Link> doen ertoe—gedeelde
          etentjes vallen plat als niemand boodschappen kan betalen—maar geld is de infrastructuur, niet het ritueel.
        </p>

        <h2>Een check-in-script van 10 minuten</h2>

        <p>Gooi dit één keer in de huisapp. Geen emoji-campagne nodig:</p>

        <ol>
          <li>Stel één terugkerende huisavond voor november voor (dag + eindtijd).</li>
          <li>Vraag iedereen één “groene” bondingactiviteit (koken / samen studeren / wandelen) en één harde no.</li>
          <li>Spreek af dat stilte een geldig antwoord is—alleen opt-in.</li>
          <li>Wijs een roterende kok aan, geen permanente host.</li>
        </ol>

        <p>
          Indoor bonding gaat niet over een sitcomhuishouden worden. Het gaat over late herfst overleefbaar maken:
          genoeg contact zodat eenzaamheid niet verhardt tot isolatie, genoeg stilte zodat midterms nog gedaan worden.
          De huizen die beide lukken, verzinnen zelden nieuwe persoonlijkheden. Ze verzinnen een wekelijkse tafel.
        </p>

        <h2>Bronnen</h2>
        <p className="text-sm text-slate-600">
          RIVM / Trimbos-instituut / GGD GHOR Nederland. Monitor Mentale gezondheid en Middelengebruik Studenten —
          indicator eenzaamheid (verslagjaar 2025).{' '}
          <a
            href="https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/mentale-gezondheid/monitor/studenten/eenzaamheid
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NRC. (2025, 31 augustus). Student op kamers voelt zich mentaal minder goed (Inholland-welzijnsonderzoek).{' '}
          <a
            href="https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nrc.nl/nieuws/2025/08/31/student-op-kamers-voelt-zich-mentaal-minder-goed-het-lijkt-eerst-zo-fijn-uit-huis-gaan-a4904558
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuzelab. Op kamers? Zo maak je afspraken met je huisgenoten.{' '}
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut. Eenzaamheid onder studenten vraagt om aandacht, herkenning én actie.{' '}
          <a
            href="https://www.trimbos.nl/actueel/blogs/eenzaamheid-onder-studenten-vraagt-om-aandacht-herkenning-en-actie/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/actueel/blogs/eenzaamheid-onder-studenten-vraagt-om-aandacht-herkenning-en-actie/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksuniversiteit Groningen (Philosophy outreach). Een huis delen: hoe hou je het leuk?{' '}
          <a
            href="https://www.rug.nl/filosofie/outreach/een-huis-delen-hoe-hou-je-het-leuk-reduced.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rug.nl/filosofie/outreach/een-huis-delen-hoe-hou-je-het-leuk-reduced.pdf
          </a>
        </p>
      </div>
    ),
  },
}

export function AutumnHuisavondIndoorBondingArticle() {
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
