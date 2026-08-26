'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Housemate Support When Living Away From Home',
    excerpt:
      'Inholland and national wellbeing data show students living away from home face more loneliness and stress. The overlooked variable is how housemates negotiate everyday emotional support.',
    publishDate: '2026-08-26',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'The Introvert’s Survival Guide to Shared Living',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'How to protect alone time without treating a flat as a second campus performance.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How written house norms reduce the passive-aggressive messages that often precede bigger blow-ups.',
      },
      {
        title: 'Roommate Conflict Resolution Tips',
        href: '/blog/roommate-conflict-resolution-tips-netherlands',
        description:
          'How to de-escalate cleanliness and noise friction before it reaches grades and mental health.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Moving out is often sold as freedom: your own key, a shorter commute, and a social life that no longer
          ends at the last train home. For many Dutch students, that story is incomplete. Research from Hogeschool
          Inholland among more than 6,500 students found that those living away from home report more loneliness,
          stress, and depressive symptoms than peers still living with parents, and feel less connected to their
          study programme (
          <a
            href="https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/"
            target="_blank"
            rel="noreferrer"
          >
            Nationale Onderwijsgids / Inholland, 2025
          </a>
          ). The gap is not only about four walls. It is about who replaces the daily emotional infrastructure
          parents once provided.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Group of students talking around a table in a shared study or living space"
          />
          <figcaption>
            Shared housing can buffer stress when housemates agree on how support, quiet, and privacy actually work.
          </figcaption>
        </figure>

        <h2>Why living away raises the wellbeing stakes</h2>

        <p>
          National monitoring points in the same direction. The Gezondheidsmonitor Jongvolwassenen 2024, run by
          municipal health services and RIVM among more than 135,000 young adults aged 16 to 25, found that only about
          half (51%) rate their mental health as good, while more than two in five often feel stressed, mainly from
          study and work (
          <a
            href="https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering"
            target="_blank"
            rel="noreferrer"
          >
            RIVM, 2025
          </a>
          ). Young adults who live alone report good mental health less often than others in the same survey. That
          pattern matters for student houses: when you leave the parental home, informal care does not disappear. It
          relocates, often onto housemates who never agreed to be counsellors.
        </p>

        <p>
          The Sociaal en Cultureel Planbureau reaches a related conclusion in its 2025 youth reports:{' '}
          <strong>emotional support, especially from parents, is tightly linked to resilience and wellbeing</strong>{' '}
          (
          <a
            href="https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt"
            target="_blank"
            rel="noreferrer"
          >
            SCP, 2025
          </a>
          ). Students who move out do not lose the need for that support. They lose proximity to the people who used
          to provide it. For context on how institutions think about living arrangements and student life, see the
          overview on{' '}
          <Link href="/universities">universities and student housing partners</Link> and the broader mission on{' '}
          <Link href="/about">about Domu Match</Link>.
        </p>

        <h2>Housemates are not therapists, but they are a system</h2>

        <p>
          Inholland researcher Lisa Klinkenberg notes that loneliness among students living away often becomes
          visible after introduction weeks, when the first social rush fades and study, money, and daily living
          pressure return. Students living alone or with only one or two housemates report loneliness more often.
          Earlier Trimbos figures cited in the same reporting show 62% of students reporting loneliness feelings and
          24% feeling strongly lonely. None of that means a flat must double as a clinic. It means the household is
          already doing wellbeing work, whether anyone named it or not.
        </p>

        <p>
          Compatible living is therefore not only about dishes and guests. It is also about{' '}
          <strong>how much emotional availability people expect from each other</strong>. One person wants a quiet
          dinner and zero processing talk. Another assumes that “we live together” includes late-night venting after
          a failed exam. Both preferences are legitimate. The conflict starts when neither is stated.
        </p>

        <h2>Three support boundaries worth negotiating early</h2>

        <h3>1. Availability windows</h3>

        <p>
          Agree when it is fair to knock, and when a closed door means “not now”. Exam weeks, early shifts, and
          recovery nights are not personality quirks. They are schedule facts. A house that only discusses quiet hours
          as noise control misses half the point: quiet is also a support boundary. For introverts who need recovery
          time without apology, see{' '}
          <Link href="/blog/introverts-survival-guide-shared-living">
            The Introvert’s Survival Guide to Shared Living
          </Link>
          .
        </p>

        <h3>2. Emotional labour load</h3>

        <p>
          In many student houses, one person becomes the default listener. That feels flattering until it becomes
          unpaid care work. A practical check: rotate who initiates house check-ins, and allow “I can listen for ten
          minutes, then I need to study” as a complete sentence. Support that cannot be bounded usually collapses into
          resentment.
        </p>

        <h3>3. Escalation routes outside the house</h3>

        <p>
          Institutions and municipalities remain part of the picture. National student wellbeing policy expects
          programmes to help students spot and address obstacles early, and Trimbos research summarised in the
          Inholland coverage still finds that about a third of students with psychological complaints receive no
          support at all. Housemates can notice change. They should not be the only referral pathway. Naming student
          dean contacts, campus coaches, or municipal youth services in a shared note reduces the pressure to “fix”
          each other.
        </p>

        <h2>Make support explicit without making it heavy</h2>

        <p>
          A short house conversation at the start of the year works better than an emergency meeting in November.
          Useful prompts include:
        </p>

        <ul>
          <li>What does a rough week look like for you, and what helps at home?</li>
          <li>When do you need silence versus company?</li>
          <li>Who is comfortable being asked for advice, and who prefers practical help only?</li>
          <li>How will we handle it if one person is struggling and another is overloaded?</li>
        </ul>

        <p>
          Write the answers somewhere durable. A group chat is fine for logistics; it is a poor archive for care
          norms. The habits described in{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link> apply here too: invisible
          expectations create visible conflict. When friction does appear, de-escalation skills from{' '}
          <Link href="/blog/roommate-conflict-resolution-tips-netherlands">
            Roommate Conflict Resolution Tips
          </Link>{' '}
          matter as much as empathy.
        </p>

        <h2>Compatibility includes how you hold each other</h2>

        <p>
          Shared living is often framed as a logistics problem: rent, chores, guests, noise. Those domains still
          matter. But the Inholland and national wellbeing findings suggest another axis for student households in the
          Netherlands: whether people can live near each other’s stress without becoming either strangers or unpaid
          carers. The healthier middle is negotiated support, clear limits, and routes beyond the kitchen table when
          the load exceeds what a flat can carry.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Nationale Onderwijsgids / Hogeschool Inholland. (2025).{' '}
          <em>Uitwonende studenten hebben meer last van eenzaamheid, stress en depressieve klachten</em>.{' '}
          <a
            href="https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM. (2025).{' '}
          <em>Blijvende zorgen over mentale gezondheid jongvolwassenen ondanks lichte verbetering</em>.{' '}
          <a
            href="https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Sociaal en Cultureel Planbureau. (2025).{' '}
          <em>Veerkracht en mentaal welzijn: naar een toekomst die jongeren toekomt</em>.{' '}
          <a
            href="https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Steun van huisgenoten als je uit huis woont',
    excerpt:
      'Inholland en landelijke welzijnscijfers laten zien dat uitwonende studenten vaker eenzaamheid en stress ervaren. De onderschatte factor is hoe huisgenoten alledaagse emotionele steun afspreken.',
    publishDate: '2026-08-26',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Survivalgids voor introverte studenten in een studentenhuis',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'Hoe je hersteltijd beschermt zonder van je huis een podium te maken.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe schriftelijke huisnormen passief-agressieve berichten verminderen.',
      },
      {
        title: 'Conflicten met huisgenoten oplossen',
        href: '/blog/roommate-conflict-resolution-tips-netherlands',
        description:
          'Hoe je frictie over netheid en geluid de-escaleert vóór cijfers en mentale gezondheid eronder lijden.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Op kamers gaan wordt vaak verkocht als vrijheid: een eigen sleutel, een kortere reis, en een sociaal
          leven dat niet meer stopt bij de laatste trein. Voor veel Nederlandse studenten is dat verhaal
          onvolledig. Onderzoek van Hogeschool Inholland onder ruim 6.500 studenten laat zien dat uitwonende
          studenten vaker eenzaamheid, stress en depressieve klachten rapporteren dan thuiswonende studiegenoten,
          en zich minder verbonden voelen met hun opleiding (
          <a
            href="https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/"
            target="_blank"
            rel="noreferrer"
          >
            Nationale Onderwijsgids / Inholland, 2025
          </a>
          ). Het verschil zit niet alleen in vier muren. Het zit in wie de dagelijkse emotionele infrastructuur
          overneemt die ouders eerder boden.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Groep studenten in gesprek rond een tafel in een gedeelde studie- of woonruimte"
          />
          <figcaption>
            Samenwonen kan stress dempen als huisgenoten afspreken hoe steun, stilte en privacy echt werken.
          </figcaption>
        </figure>

        <h2>Waarom uit huis wonen de welzijnsinzet verhoogt</h2>

        <p>
          Landelijke monitoring wijst dezelfde kant op. De Gezondheidsmonitor Jongvolwassenen 2024, uitgevoerd door
          GGD’en en RIVM onder meer dan 135.000 jongvolwassenen van 16 tot 25 jaar, laat zien dat slechts ongeveer
          de helft (51%) de eigen mentale gezondheid als goed beoordeelt, terwijl ruim twee op de vijf zich vaak
          gestrest voelt, vooral door studie en werk (
          <a
            href="https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering"
            target="_blank"
            rel="noreferrer"
          >
            RIVM, 2025
          </a>
          ). Alleenwonenden rapporteren minder vaak een goede mentale gezondheid. Dat patroon is relevant voor
          studentenhuizen: als je het ouderlijk huis verlaat, verdwijnt informele zorg niet. Ze verplaatst zich,
          vaak naar huisgenoten die nooit hebben afgesproken om coach te zijn.
        </p>

        <p>
          Het Sociaal en Cultureel Planbureau trekt in de jeugdrapporten van 2025 een verwante conclusie:{' '}
          <strong>
            emotionele steun, vooral van ouders, hangt sterk samen met veerkracht en welbevinden
          </strong>{' '}
          (
          <a
            href="https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt"
            target="_blank"
            rel="noreferrer"
          >
            SCP, 2025
          </a>
          ). Studenten die uit huis gaan, verliezen die behoefte niet. Ze verliezen de nabijheid van de mensen die
          die steun gaven.           Voor context over hoe instellingen naar wonen en studentenleven kijken, zie{' '}
          <Link href="/universities">universiteiten en huisvestingspartners</Link> en de bredere missie op{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Huisgenoten zijn geen therapeuten, wel een systeem</h2>

        <p>
          Inholland-onderzoeker Lisa Klinkenberg merkt op dat eenzaamheid bij uitwonende studenten vaak pas zichtbaar
          wordt na de introductieweken, wanneer de eerste sociale rush wegebt en studie-, geld- en woonstress
          terugkomen. Studenten die alleen of met één of twee huisgenoten wonen, rapporteren vaker eenzaamheid.
          Eerdere Trimbos-cijfers in dezelfde berichtgeving tonen dat 62% van de studenten eenzaamheidsgevoelens
          rapporteert en 24% zich sterk eenzaam voelt. Dat betekent niet dat een huis een kliniek moet worden. Het
          betekent dat het huishouden al welzijnswerk doet, of je het nou benoemt of niet.
        </p>

        <p>
          Compatibel samenwonen gaat dus niet alleen over afwas en logees. Het gaat ook over{' '}
          <strong>hoeveel emotionele beschikbaarheid mensen van elkaar verwachten</strong>. De één wil een stille
          avond zonder verwerking. De ander gaat ervan uit dat “samenwonen” ook late-night venten na een mislukt
          tentamen omvat. Beide voorkeuren zijn legitiem. Conflict begint wanneer geen van beide wordt uitgesproken.
        </p>

        <h2>Drie steungrenzen die je vroeg moet afspreken</h2>

        <h3>1. Beschikbaarheidsramen</h3>

        <p>
          Spreek af wanneer aankloppen oké is, en wanneer een dichte deur “niet nu” betekent. Tentamenweken, vroege
          diensten en herstelavonden zijn geen persoonlijkheidskwesties. Het zijn roosterkwesties. Een huis dat
          stilte alleen als geluidsregel ziet, mist de helft: stilte is ook een steungrens. Voor introverten die
          hersteltijd nodig hebben zonder excuses, zie{' '}
          <Link href="/blog/introverts-survival-guide-shared-living">
            Survivalgids voor introverte studenten in een studentenhuis
          </Link>
          .
        </p>

        <h3>2. Emotionele werklast</h3>

        <p>
          In veel studentenhuizen wordt één persoon de standaard luisteraar. Dat voelt vleiend tot het onbetaald
          zorgwerk wordt. Een praktische check: wissel af wie huischeck-ins start, en laat “Ik kan tien minuten
          luisteren, daarna moet ik studeren” een volledige zin zijn. Steun zonder grens eindigt meestal in wrok.
        </p>

        <h3>3. Escalatie buiten het huis</h3>

        <p>
          Instellingen en gemeenten blijven deel van het plaatje. Landelijk studentenwelzijnsbeleid verwacht dat
          opleidingen obstakels vroeg helpen signaleren, en Trimbos-onderzoek in de Inholland-berichtgeving laat zien
          dat ongeveer een derde van de studenten met psychische klachten helemaal geen steun krijgt. Huisgenoten
          kunnen verandering zien. Zij moeten niet de enige doorverwijzing zijn. Studentendecanen, coaches of
          gemeentelijke jongerenvoorzieningen in een gedeeld briefje zetten, vermindert de druk om elkaar te
          “fixen”.
        </p>

        <h2>Maak steun expliciet zonder het zwaar te maken</h2>

        <p>
          Een kort huisgesprek aan het begin van het jaar werkt beter dan een noodvergadering in november. Bruikbare
          vragen:
        </p>

        <ul>
          <li>Hoe ziet een zware week er voor jou uit, en wat helpt thuis?</li>
          <li>Wanneer heb je stilte nodig, en wanneer gezelschap?</li>
          <li>Wie wil advies geven, en wie liever alleen praktische hulp?</li>
          <li>Wat doen we als de één het zwaar heeft en de ander overbelast is?</li>
        </ul>

        <p>
          Schrijf antwoorden ergens duurzaam op. Een groepsapp is prima voor logistiek, maar een slecht archief voor
          zorgnormen. De gewoontes uit{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link> gelden hier ook: onzichtbare
          verwachtingen maken zichtbaar conflict. Als frictie toch ontstaat, zijn de-escalatievaardigheden uit{' '}
          <Link href="/blog/roommate-conflict-resolution-tips-netherlands">
            Conflicten met huisgenoten oplossen
          </Link>{' '}
          net zo belangrijk als empathie.
        </p>

        <h2>Compatibiliteit omvat hoe je elkaar draagt</h2>

        <p>
          Samenwonen wordt vaak als logistiek probleem gezien: huur, klusjes, logees, geluid. Die domeinen blijven
          ertoe doen. Maar Inholland en landelijke welzijnscijfers wijzen op een extra as voor studentenhuizen in
          Nederland: of mensen elkaars stress kunnen verdragen zonder vreemden of onbetaalde zorgverleners te worden.
          Het gezondere midden is onderhandelde steun, duidelijke grenzen, en routes buiten de keukentafel wanneer de
          last groter is dan een huis aankan.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          Nationale Onderwijsgids / Hogeschool Inholland. (2025).{' '}
          <em>Uitwonende studenten hebben meer last van eenzaamheid, stress en depressieve klachten</em>.{' '}
          <a
            href="https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nationaleonderwijsgids.nl/hbo/uitwonende-studenten-hebben-meer-last-van-eenzaamheid-stress-en-depressieve-klachten/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM. (2025).{' '}
          <em>Blijvende zorgen over mentale gezondheid jongvolwassenen ondanks lichte verbetering</em>.{' '}
          <a
            href="https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/nieuws/blijvende-zorgen-over-mentale-gezondheid-jongvolwassenen-ondanks-lichte-verbetering
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Sociaal en Cultureel Planbureau. (2025).{' '}
          <em>Veerkracht en mentaal welzijn: naar een toekomst die jongeren toekomt</em>.{' '}
          <a
            href="https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scp.nl/publicaties-scp/2025/10/toekomst-die-jongeren-toekomt
          </a>
        </p>
      </div>
    ),
  },
}

export function HousemateSupportLivingAwayArticle() {
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
