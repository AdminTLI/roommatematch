'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Roommate Chore Fairness in Dutch Student Houses',
    excerpt:
      'A schoonmaakrooster is not fairness by itself. Student houses clash when people count contribution differently: hours, standards, or invisible noticing work.',
    publishDate: '2026-09-02',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'When Dishes = Disrespect',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Why tiny unfinished tasks turn into stories about respect and unequal labour.',
      },
      {
        title: 'Why "I’m Clean" Is a Lie',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          'Behaviour-based questions that replace vague cleanliness labels before move-in.',
      },
      {
        title: 'Housemate Support When Living Away From Home',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'How emotional support norms sit beside practical house systems for students living away from parents.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Most Dutch student houses eventually invent a cleaning roster. Someone prints a grid, names rotate through
          the bathroom and hallway, and for a week the kitchen looks briefly intentional. Then the arguments return,
          not because the grid was missing, but because{' '}
          <strong>fairness was never defined the same way by everyone who signed it</strong>. One housemate counts
          completed boxes. Another counts smell, crumbs, and whether the sponge was rinsed. A third counts the mental
          load of noticing what needs doing.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Shared kitchen interior with counters, cabinets, and cooking space"
          />
          <figcaption>
            Shared kitchens make unequal contribution visible fast: the same sink can look “fine” to one person and
            unfinished to another.
          </figcaption>
        </figure>

        <h2>Why chore fairness breaks before conflict does</h2>

        <p>
          Preventive Law researchers at Zuyd University of Applied Sciences note a pattern that many students
          recognise only after the first blow-up: housemates often move in with almost no explicit agreements on
          cleaning, shared costs, guests, privacy, or communication (
          <a
            href="https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/"
            target="_blank"
            rel="noreferrer"
          >
            Roomietalks / Preventive Law, Zuyd
          </a>
          ). Their Roomietalks checklist treats those topics as preventive infrastructure, not as paperwork for
          killjoys. The point is practical. When expectations stay informal, irritation fills the gap, and a roster
          alone cannot repair what was never negotiated.
        </p>

        <p>
          Guidance aimed at students moving into rooms makes the same case in plainer language. Studiekeuzelab
          advises new housemates to ask about existing house rules early, write points everyone accepts, and use a
          cleaning schedule so bathroom and kitchen work does not default to whoever gets annoyed first (
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuzelab
          </a>
          ). Those tips sound basic because they are. Compatibility problems often start in the basics that people
          assume are already shared.
        </p>

        <h2>Three incompatible fairness meters</h2>

        <p>
          Houses rarely argue about whether cleaning matters. They argue about the unit of fairness. Three meters show
          up again and again in student flats:
        </p>

        <h3>1. Task-box fairness</h3>

        <p>
          This meter treats a roster as a contract: if your name is on the bathroom this week, and you wipe the sink
          once, you are done. It is efficient and easy to audit. It also fails when someone cleans to a lower standard
          than the house needs, or when daily kitchen mess never appears on the grid.
        </p>

        <h3>2. Standard-based fairness</h3>

        <p>
          Here the question is not “Did you do your turn?” but “Is the shared space usable?” People with stronger
          sensory thresholds or higher cleanliness baselines often live on this meter. They may complete extra work
          off-roster and still feel short-changed, because the outcome, not the schedule, is their definition of
          contribution. Earlier Domu Match reporting on subjective “I’m clean” language maps onto this gap:{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Why &quot;I’m Clean&quot; Is a Lie</Link>.
        </p>

        <h3>3. Invisible-labour fairness</h3>

        <p>
          The third meter counts noticing: buying dishwasher tablets, scraping the pan nobody claimed, emptying the
          bin before it overflows, wiping the hob after someone else’s rush to class. That labour is easy to miss if
          you only track named chores. It is also the labour that turns into resentment stories about respect, as
          explored in{' '}
          <Link href="/blog/when-dishes-equal-disrespect">When Dishes = Disrespect</Link>.
        </p>

        <p>
          When one person uses task-box fairness and another uses invisible-labour fairness, both can feel cheated
          while insisting they are doing their share. That is a compatibility mismatch, not a morality play.
        </p>

        <h2>Household labour is already patterned, even before flatmates meet</h2>

        <p>
          National statistics do not describe student houses directly, but they do show that everyday household labour
          is socially patterned. In the Emancipatiemonitor 2024, CBS reports that 70% of women aged 16 and older in
          the Netherlands say they spend time on household tasks daily, compared with 55% of men, a gap that is
          relatively small by EU standards but still material (
          <a
            href="https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/"
            target="_blank"
            rel="noreferrer"
          >
            CBS Emancipatiemonitor 2024
          </a>
          ). Student houses are not free of those inherited scripts. People arrive with different training in what
          “done” looks like, who notices mess first, and whether asking for help feels normal or rude.
        </p>

        <p>
          That inheritance matters for institutions and housing partners as much as for individual flats. Matching and
          orientation work that only screens for “friendly” or “tidy” still leaves the fairness meter undefined. For
          context on how living arrangements sit inside campus life, see{' '}
          <Link href="/universities">universities and student housing partners</Link> and the background on{' '}
          <Link href="/about">about Domu Match</Link>.
        </p>

        <h2>A fairness conversation that belongs on week one</h2>

        <p>
          A useful house meeting is short, concrete, and boring on purpose. It does not need a constitution. It needs
          answers that can be checked later:
        </p>

        <ul>
          <li>
            Which tasks are personal (your dishes after cooking) versus shared (bathroom, hallway, fridge wipe)?
          </li>
          <li>What does “done” mean for kitchen counters after dinner?</li>
          <li>How do exam weeks, jobs, and travel change the roster without dumping the load on one person?</li>
          <li>Who tracks supplies, and how are shared costs settled?</li>
          <li>Where do we raise missed turns: privately, in a house meeting, or only after a second miss?</li>
        </ul>

        <p>
          Studiekeuzelab’s shared-costs advice is part of the same system. Cleaning products, toilet paper, and bin
          bags are fairness issues too. A simple shared ledger reduces the quiet tax on whoever always shops. Written
          norms also travel better than group-chat lore; the habits in{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link> help keep logistics from
          becoming passive-aggressive theatre.
        </p>

        <h2>Fairness is a compatibility trait, not a personality insult</h2>

        <p>
          Chore conflict feels personal because kitchens are intimate. The more useful frame is systems design: which
          fairness meter does this house use, and can everyone live with it? Preventive agreements, rotating shared
          tasks, and outcome checks after two weeks beat silence followed by an explosion in November. Emotional
          support norms still matter for students living away from home, as discussed in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            Housemate Support When Living Away From Home
          </Link>
          , but support without a workable kitchen system usually frays. Compatibility is partly about whether people
          can agree on how contribution is counted when nobody is watching.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Preventive Law / Zuyd University of Applied Sciences. Roomietalks: samen afspreken, beter wonen.{' '}
          <a
            href="https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/
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
          CBS. (2024). Emancipatiemonitor 2024: Gelijk in Europees perspectief?{' '}
          <a
            href="https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/"
            target="_blank"
            rel="noreferrer"
          >
            https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Eerlijke klusjesverdeling in Nederlandse studentenhuizen',
    excerpt:
      'Een schoonmaakrooster is nog geen eerlijkheid. Conflicten ontstaan wanneer huisgenoten bijdrage anders tellen: uren, standaarden of onzichtbaar noticeerwerk.',
    publishDate: '2026-09-02',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Wanneer afwas = respectloos',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Waarom kleine openstaande taken uitgroeien tot verhalen over respect en ongelijke arbeid.',
      },
      {
        title: 'Waarom "Ik ben netjes" een leugen is',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          'Gedragsvragen die vage netheidslabels vervangen vóór je intrekt.',
      },
      {
        title: 'Steun van huisgenoten als je uit huis woont',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Hoe emotionele steunnormen naast praktische huissystemen staan voor uitwonende studenten.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          De meeste Nederlandse studentenhuizen verzinnen ooit een schoonmaakrooster. Iemand print een raster, namen
          rouleren over badkamer en gang, en een week lang oogt de keuken even bewust. Daarna komen de ruzies terug,
          niet omdat het rooster ontbrak, maar omdat{' '}
          <strong>eerlijkheid nooit voor iedereen hetzelfde betekende</strong>. De één telt afgevinkte vakjes. De
          ander telt geur, kruimels en of de spons is uitgespoeld. Een derde telt de mentale last van opmerken wat er
          nog moet gebeuren.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Interieur van een gedeelde keuken met aanrechten, kastjes en kookruimte"
          />
          <figcaption>
            In gedeelde keukens wordt ongelijke bijdrage snel zichtbaar: dezelfde gootsteen kan voor de één “prima”
            zijn en voor de ander onaf.
          </figcaption>
        </figure>

        <h2>Waarom eerlijkheid al breekt vóór het conflict</h2>

        <p>
          Onderzoekers van Preventive Law aan Zuyd Hogeschool zien een patroon dat veel studenten pas herkennen na de
          eerste uitbarsting: huisgenoten trekken vaak in zonder expliciete afspraken over schoonmaak, gedeelde
          kosten, bezoek, privacy of communicatie (
          <a
            href="https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/"
            target="_blank"
            rel="noreferrer"
          >
            Roomietalks / Preventive Law, Zuyd
          </a>
          ). Hun Roomietalks-checklist behandelt die onderwerpen als preventieve infrastructuur, niet als papierwerk
          voor spelbedervers. Het punt is praktisch. Blijven verwachtingen informeel, dan vullen irritaties het gat,
          en een rooster alleen herstelt niet wat nooit is onderhandeld.
        </p>

        <p>
          Advies voor studenten die op kamers gaan zegt hetzelfde in gewonere taal. Studiekeuzelab raadt nieuwe
          huisgenoten aan vroeg naar bestaande huisregels te vragen, punten op te schrijven waar iedereen achter
          staat, en een schoonmaakrooster te gebruiken zodat badkamer- en keukenwerk niet standaard bij wie het eerst
          geïrriteerd raakt belandt (
          <a
            href="https://www.studiekeuzelab.nl/kies/zo-maak-je-afspraken-met-je-huisgenoten"
            target="_blank"
            rel="noreferrer"
          >
            Studiekeuzelab
          </a>
          ). Die tips klinken basaal omdat ze dat zijn. Compatibiliteitsproblemen starten vaak bij basisdingen die
          mensen als vanzelfsprekend delen.
        </p>

        <h2>Drie onverenigbare eerlijkheidsmeters</h2>

        <p>
          Huizen ruziën zelden over of schoonmaken ertoe doet. Ze ruziën over de eenheid van eerlijkheid. Drie meters
          komen steeds terug in studentenflats:
        </p>

        <h3>1. Vakjes-eerlijkheid</h3>

        <p>
          Deze meter ziet een rooster als contract: staat jouw naam deze week bij de badkamer, en poets je één keer
          de wasbak, dan ben je klaar. Het is efficiënt en makkelijk te controleren. Het faalt wanneer iemand tot een
          lagere standaard schoonmaakt dan het huis nodig heeft, of wanneer dagelijkse keukenrommel nooit op het
          rooster staat.
        </p>

        <h3>2. Standaard-eerlijkheid</h3>

        <p>
          Hier is de vraag niet “Heb je je beurt gedaan?” maar “Is de gedeelde ruimte bruikbaar?” Mensen met sterkere
          zintuiglijke drempels of hogere netheidsbaselines leven vaak op deze meter. Zij doen soms extra werk buiten
          het rooster en voelen zich toch tekortgedaan, omdat het resultaat, niet het schema, hun definitie van
          bijdrage is. Eerdere Domu Match-berichtgeving over subjectieve “Ik ben netjes”-taal raakt precies dit gat:{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Waarom &quot;Ik ben netjes&quot; een leugen is</Link>.
        </p>

        <h3>3. Onzichtbare-arbeid-eerlijkheid</h3>

        <p>
          De derde meter telt opmerken: vaatwastabletten kopen, de pan scrapen die niemand claimt, de vuilnisbak
          legen vóór die overloopt, de kookplaat afnemen na andermans haast naar college. Die arbeid is makkelijk te
          missen als je alleen benoemde klusjes volgt. Het is ook de arbeid die uitgroeit tot wrokverhalen over
          respect, zoals in{' '}
          <Link href="/blog/when-dishes-equal-disrespect">Wanneer afwas = respectloos</Link>.
        </p>

        <p>
          Gebruikt de één vakjes-eerlijkheid en de ander onzichtbare-arbeid-eerlijkheid, dan kunnen beiden zich
          benadeeld voelen terwijl ze volhouden dat ze hun deel doen. Dat is een compatibiliteitsmismatch, geen
          moraliteitsstuk.
        </p>

        <h2>Huishoudelijke arbeid is al gepatroneerd vóór flatmates elkaar kennen</h2>

        <p>
          Landelijke statistiek beschrijft studentenhuizen niet rechtstreeks, maar laat wel zien dat alledaagse
          huishoudelijke arbeid sociaal gepatroneerd is. In de Emancipatiemonitor 2024 meldt CBS dat 70% van de
          vrouwen van 16 jaar en ouder in Nederland zegt dagelijks tijd te besteden aan huishoudelijke taken, tegen
          55% van de mannen, een verschil dat klein is naar EU-maatstaven maar nog steeds materieel (
          <a
            href="https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/"
            target="_blank"
            rel="noreferrer"
          >
            CBS Emancipatiemonitor 2024
          </a>
          ). Studentenhuizen zijn niet vrij van die geërfde scripts. Mensen komen binnen met verschillende training in
          hoe “klaar” eruitziet, wie rommel het eerst ziet, en of om hulp vragen normaal of onbeleefd voelt.
        </p>

        <p>
          Die erfenis telt voor instellingen en huisvestingspartners net zo goed als voor individuele flats. Matching
          en introductiewerk dat alleen op “vriendelijk” of “netjes” screent, laat de eerlijkheidsmeter ongedefinieerd.
          Voor context over hoe woonvormen in campusleven zitten, zie{' '}
          <Link href="/universities">universiteiten en studentenhuisvestingspartners</Link> en de achtergrond op{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Een eerlijkheidsgesprek dat in week één hoort</h2>

        <p>
          Een bruikbare huisvergadering is kort, concreet en expres saai. Er is geen grondwet nodig. Wel antwoorden
          die later te checken zijn:
        </p>

        <ul>
          <li>
            Welke taken zijn persoonlijk (jouw afwas na het koken) versus gedeeld (badkamer, gang, koelkast afnemen)?
          </li>
          <li>Wat betekent “klaar” voor keukenaanrechten na het avondeten?</li>
          <li>Hoe veranderen tentamenweken, bijbanen en reizen het rooster zonder de last op één persoon te dumpen?</li>
          <li>Wie houdt spullen bij, en hoe worden gedeelde kosten verrekend?</li>
          <li>Waar brengen we gemiste beurten op: privé, in een huisvergadering, of pas na een tweede misser?</li>
        </ul>

        <p>
          Het advies van Studiekeuzelab over gedeelde kosten hoort bij hetzelfde systeem. Schoonmaakmiddelen,
          toiletpapier en vuilniszakken zijn ook eerlijkheidskwesties. Een eenvoudige gedeelde administratie verlaagt
          de stille belasting op wie altijd boodschappen doet. Geschreven normen reizen beter dan groepsapp-folklore;
          de gewoontes in{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link> helpen logistiek te houden zonder
          passief-agressief theater.
        </p>

        <h2>Eerlijkheid is een compatibiliteitstrek, geen persoonlijke belediging</h2>

        <p>
          Klusjesconflict voelt persoonlijk omdat keukens intiem zijn. Het bruikbaardere frame is systeemontwerp:
          welke eerlijkheidsmeter gebruikt dit huis, en kan iedereen daarmee leven? Preventieve afspraken, roulerende
          gedeelde taken en een resultaatcheck na twee weken winnen van stilte gevolgd door een explosie in november.
          Emotionele steunnormen blijven belangrijk voor uitwonende studenten, zoals in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            Steun van huisgenoten als je uit huis woont
          </Link>
          , maar steun zonder werkbaar keukensysteem rafelt meestal. Compatibiliteit gaat deels over of mensen eens
          kunnen worden over hoe bijdrage wordt geteld wanneer niemand kijkt.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          Preventive Law / Zuyd Hogeschool. Roomietalks: samen afspreken, beter wonen.{' '}
          <a
            href="https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.preventivelaw.nl/publicaties/roomietalks-samen-afspreken-beter-wonen/
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
          CBS. (2024). Emancipatiemonitor 2024: Gelijk in Europees perspectief?{' '}
          <a
            href="https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/"
            target="_blank"
            rel="noreferrer"
          >
            https://longreads.cbs.nl/emancipatiemonitor-2024/gelijk-in-europees-perspectief/
          </a>
        </p>
      </div>
    ),
  },
}

export function RoommateChoreFairnessArticle() {
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
