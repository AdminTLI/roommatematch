'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Overnight Guest Rules in Dutch Student Houses',
    excerpt:
      'Provider house rules and housemate consent are different layers. SSH, campus providers, and informal flats set overnight guest norms in incompatible ways until someone writes them down.',
    publishDate: '2026-09-09',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'The "Third Wheel" Policy',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'How partners reshape shared space, and how to set overnight limits without turning the flat into a tribunal.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to turn invisible guest and noise expectations into short, usable house agreements.',
      },
      {
        title: 'Roommate Chore Fairness in Dutch Student Houses',
        href: '/blog/roommate-chore-fairness-netherlands',
        description:
          'Why shared kitchens need the same precision as guest nights: define the fairness meter early.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Overnight guests sit at the awkward intersection of romance, friendship, and building policy. One person
          hears “my partner stays over sometimes.” Another hears “we suddenly have a fifth housemate who never
          signed the lease.” In Dutch student housing, those two readings often collide because{' '}
          <strong>provider rules and housemate consent are treated as the same conversation when they are not</strong>.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Bright calm living room with a blue sofa, armchair, plants, and wooden floor"
          />
          <figcaption>
            Shared living rooms make overnight guest load visible: privacy, quiet hours, and sofa space are part of the
            same boundary system.
          </figcaption>
        </figure>

        <h2>Two rulebooks, one shared bathroom</h2>

        <p>
          Institutional providers publish hard edges. SSH Short Stay guidance tells residents to check with roommates
          before inviting someone over, and states plainly that overnight guests are not allowed under the terms and
          conditions signed with the rental agreement (
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            SSH Student Housing help centre
          </a>
          ). That is not a vibe check. It is a contractual boundary that sits above whatever the kitchen WhatsApp group
          invents later.
        </p>

        <p>
          Other campus-style providers leave more room, but still set numbers. College Campus Meppel allows short
          visits without prior permission, holds the host responsible for guest behaviour, and treats stays of up to
          three nights as generally fine, while longer visits need a conversation with the caretaker and may trigger a
          visitor fee for shared facilities (
          <a href="https://collegecampus.nl/faq/" target="_blank" rel="noreferrer">
            College Campus FAQ
          </a>
          ). Quiet hours are explicit too: night’s rest from 23:00 on Sunday to Thursday, and from midnight on Friday
          and Saturday. Overnight guests and quiet hours are one system, not two hobbies.
        </p>

        <h2>When “logeren” starts looking like inwoning</h2>

        <p>
          Private student houses rarely start with a PDF. They start with politeness. A partner stays twice, then most
          weeknights, then leaves a toothbrush and a jacket on the hallway peg. Dutch rental practice still draws a
          line between short guest stays and structural use of the dwelling. Legal explainers note that brief lodging
          of family or partners is normally part of ordinary use, while longer or more autonomous stays can raise
          questions of inwoning or prohibited use depending on the contract (
          <a
            href="https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder"
            target="_blank"
            rel="noreferrer"
          >
            Clavix on onderhuur and inwoning
          </a>
          ). Housemates feel that shift before lawyers do: shower queues lengthen, fridge space shrinks, and exam-week
          silence gets harder to protect.
        </p>

        <p>
          Guidance aimed at student roommates treats guest policy as a core section of an internal agreement, alongside
          cleaning, quiet hours, and notice periods. A roommate agreement does not replace the landlord contract, but
          it is where frequency, notice, and bathroom etiquette become checkable instead of resentful (
          <a
            href="https://dutchstudenthousing.nl/papers/roommate-agreement-template"
            target="_blank"
            rel="noreferrer"
          >
            Dutch Student Housing roommate agreement notes
          </a>
          ). For context on how institutions think about living arrangements as part of study life, see{' '}
          <Link href="/universities">universities and housing partners</Link> and the background on{' '}
          <Link href="/about">about Domu Match</Link>.
        </p>

        <h2>The consent gap that creates third wheels</h2>

        <p>
          Earlier Domu Match reporting on partners in shared flats focused on the emotional squeeze of becoming a
          permanent third wheel (
          <Link href="/blog/third-wheel-policy-significant-others">The &quot;Third Wheel&quot; Policy</Link>
          ). The missing layer this week is procedural. Even when housemates like someone’s partner, they still need
          answers that can be verified after midnight:
        </p>

        <ul>
          <li>How many overnight stays per week count as “sometimes”?</li>
          <li>Does a guest need a yes from everyone, or only from the people sharing a bathroom wall?</li>
          <li>Who pays when utilities jump after a de facto extra resident arrives?</li>
          <li>What happens during exam weeks, when quiet hours matter more than hospitality?</li>
          <li>Does the landlord or provider ban overnight stays that the house has casually normalised?</li>
        </ul>

        <p>
          Without those answers, people negotiate through sighs, closed doors, and passive-aggressive kitchen notes.
          Written norms travel better than folklore; the habits in{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link> keep logistics out of late-night
          argument theatre.
        </p>

        <h3>Quiet hours are the stress test</h3>

        <p>
          SSH’s Short Stay guidance also points residents to Dutch night quiet expectations after 22:00 when nuisance
          escalates beyond the flat (
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            SSH house rules
          </a>
          ). College Campus closes communal sitting areas and large kitchens during night’s rest. A guest policy that
          ignores those clocks is unfinished. Arrival times, hallway conversations, and morning showers are part of the
          same boundary as “may they sleep here.”
        </p>

        <h2>A short house meeting that actually settles guests</h2>

        <p>
          Useful guest agreements are boring on purpose. They do not moralise dating. They define load on shared
          infrastructure. A week-one conversation can cover:
        </p>

        <ul>
          <li>Maximum overnight nights per guest per week, with a review date after six weeks.</li>
          <li>Advance notice channel (house chat, not a surprise knock at 23:30).</li>
          <li>Host responsibility: guests follow quiet hours, cleaning, and fridge labelling.</li>
          <li>Exam-week override: fewer overnight stays when any housemate has assessments.</li>
          <li>Contract check: does the lease or provider huisreglement already forbid overnight guests?</li>
        </ul>

        <p>
          The same precision helps kitchens. Houses that already struggle to define chore fairness, as in{' '}
          <Link href="/blog/roommate-chore-fairness-netherlands">
            Roommate Chore Fairness in Dutch Student Houses
          </Link>
          , will struggle even more when an unofficial fifth resident adds dishes and laundry without adding a name to
          the roster.
        </p>

        <h2>Boundaries are infrastructure, not jealousy</h2>

        <p>
          Overnight guest conflict is often misread as envy or control. The clearer frame is capacity. Student rooms
          and shared facilities are usually designed around named tenants. Provider rules, landlord contracts, and
          housemate consent each protect a different risk: building compliance, legal use of the dwelling, and daily
          dignity for the people who pay rent. When those layers stay unspoken, hospitality turns into occupation.
          Naming nights, notice, and quiet hours early keeps relationships and house systems from competing for the
          same bathroom.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          SSH Student Housing. House rules (Short Stay).{' '}
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            https://help.sshxl.nl/nl/articles/368429-house-rules
          </a>
        </p>
        <p className="text-sm text-slate-600">
          College Campus Meppel. Frequently asked questions (guests and night’s rest).{' '}
          <a href="https://collegecampus.nl/faq/" target="_blank" rel="noreferrer">
            https://collegecampus.nl/faq/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Clavix. Onderhuur en inwoning: wat is toegestaan en wat niet?{' '}
          <a
            href="https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder"
            target="_blank"
            rel="noreferrer"
          >
            https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Dutch Student Housing. Roommate agreement template notes.{' '}
          <a
            href="https://dutchstudenthousing.nl/papers/roommate-agreement-template"
            target="_blank"
            rel="noreferrer"
          >
            https://dutchstudenthousing.nl/papers/roommate-agreement-template
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Overnachtingsregels in Nederlandse studentenhuizen',
    excerpt:
      'Huisregels van aanbieders en toestemming van huisgenoten zijn verschillende lagen. SSH, campusaanbieders en informele flats zetten overnachtingsnormen op onverenigbare manieren tot iemand ze opschrijft.',
    publishDate: '2026-09-09',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Het "derde wiel"-beleid',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'Hoe partners gedeelde ruimte herschikken, en hoe je overnachtingslimieten zet zonder een tribunaal van je flat te maken.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe je onzichtbare verwachtingen over bezoek en geluid omzet in korte, bruikbare huisafspraken.',
      },
      {
        title: 'Eerlijke klusjesverdeling in Nederlandse studentenhuizen',
        href: '/blog/roommate-chore-fairness-netherlands',
        description:
          'Waarom gedeelde keukens dezelfde precisie nodig hebben als overnachtingen: definieer de eerlijkheidsmeter vroeg.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Overnachtende gasten zitten op het ongemakkelijke snijvlak van romantiek, vriendschap en gebouwbeleid. De één
          hoort “mijn partner blijft soms slapen.” De ander hoort “we hebben ineens een vijfde huisgenoot die nooit de
          huur heeft getekend.” In Nederlandse studentenhuisvesting botsen die lezingen vaak omdat{' '}
          <strong>
            regels van aanbieders en toestemming van huisgenoten als hetzelfde gesprek worden behandeld terwijl dat
            niet zo is
          </strong>
          .
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Lichte, rustige woonkamer met blauwe bank, fauteuil, planten en houten vloer"
          />
          <figcaption>
            In gedeelde woonkamers wordt de last van overnachtingen zichtbaar: privacy, nachtrust en bankruimte horen
            bij hetzelfde grenssysteem.
          </figcaption>
        </figure>

        <h2>Twee regelboeken, één gedeelde badkamer</h2>

        <p>
          Institutionele aanbieders publiceren harde randen. SSH Short Stay-advies zegt dat bewoners met huisgenoten
          moeten checken vóór ze iemand uitnodigen, en stelt duidelijk dat overnachtingen niet zijn toegestaan onder
          de voorwaarden bij de huurovereenkomst (
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            SSH Student Housing helpcentrum
          </a>
          ). Dat is geen sfeercheck. Het is een contractuele grens die boven wat de keuken-WhatsApp later verzint
          staat.
        </p>

        <p>
          Andere campusachtige aanbieders laten meer ruimte, maar zetten nog steeds cijfers. College Campus Meppel
          staat korte bezoeken zonder voorafgaande toestemming toe, houdt de host verantwoordelijk voor gedrag van
          gasten, en behandelt verblijven tot drie nachten als doorgaans oké, terwijl langere bezoeken met de
          conciërge moeten worden besproken en een bezoekersbijdrage voor gedeelde voorzieningen kunnen triggeren (
          <a href="https://collegecampus.nl/faq/" target="_blank" rel="noreferrer">
            College Campus FAQ
          </a>
          ). Nachtrust is ook expliciet: vanaf 23:00 op zondag tot en met donderdag, en vanaf middernacht op vrijdag
          en zaterdag. Overnachtingen en nachtrust zijn één systeem, geen twee hobby’s.
        </p>

        <h2>Wanneer “logeren” op inwoning begint te lijken</h2>

        <p>
          Privéstudentenhuizen beginnen zelden met een pdf. Ze beginnen met beleefdheid. Een partner blijft twee keer,
          daarna de meeste doordeweekse nachten, en dan hangt er een tandenborstel en een jas aan de kapstok. De
          Nederlandse huurpraktijk trekt nog steeds een lijn tussen kort logeren en structureel gebruik van de woning.
          Juridische uitleg wijst erop dat kort verblijf van familie of partners meestal tot normaal gebruik hoort,
          terwijl langere of zelfstandigere verblijven vragen over inwoning of verboden gebruik kunnen oproepen,
          afhankelijk van het contract (
          <a
            href="https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder"
            target="_blank"
            rel="noreferrer"
          >
            Clavix over onderhuur en inwoning
          </a>
          ). Huisgenoten voelen die verschuiving eerder dan juristen: douchewachtrijen groeien, koelkastruimte krimpt,
          en stilte in tentamenweken wordt moeilijker te beschermen.
        </p>

        <p>
          Advies voor studentenhuisgenoten behandelt bezoekbeleid als kernonderdeel van een interne overeenkomst,
          naast schoonmaak, stilte-uren en opzegtermijnen. Een roommate agreement vervangt het huurcontract niet, maar
          is wel de plek waar frequentie, aankondiging en badkamernetiquette controleerbaar worden in plaats van
          rancuneus (
          <a
            href="https://dutchstudenthousing.nl/papers/roommate-agreement-template"
            target="_blank"
            rel="noreferrer"
          >
            Dutch Student Housing notities over roommate agreements
          </a>
          ). Voor context over hoe instellingen woonvormen in studieleven plaatsen, zie{' '}
          <Link href="/universities">universiteiten en huisvestingspartners</Link> en de achtergrond op{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Het toestemmingsgat dat derde wielen maakt</h2>

        <p>
          Eerdere Domu Match-berichtgeving over partners in gedeelde flats ging over de emotionele knel van permanent
          derde wiel worden (
          <Link href="/blog/third-wheel-policy-significant-others">Het &quot;derde wiel&quot;-beleid</Link>
          ). De ontbrekende laag deze week is procedureel. Zelfs als huisgenoten iemands partner aardig vinden, hebben
          ze nog steeds antwoorden nodig die na middernacht te checken zijn:
        </p>

        <ul>
          <li>Hoeveel overnachtingen per week tellen als “soms”?</li>
          <li>Heeft een gast een ja van iedereen nodig, of alleen van wie een badkamermuur deelt?</li>
          <li>Wie betaalt als nutsvoorzieningen stijgen nadat een feitelijke extra bewoner arriveert?</li>
          <li>Wat gebeurt er in tentamenweken, wanneer stilte belangrijker is dan gastvrijheid?</li>
          <li>Verbiedt de verhuurder of aanbieder overnachtingen die het huis informeel heeft genormaliseerd?</li>
        </ul>

        <p>
          Zonder die antwoorden onderhandelen mensen via zuchten, dichte deuren en passief-agressieve keukenbriefjes.
          Geschreven normen reizen beter dan folklore; de gewoontes in{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link> houden logistiek buiten
          laatavond-ruzietheater.
        </p>

        <h3>Nachtrust is de stresstest</h3>

        <p>
          SSH Short Stay-advies wijst bewoners ook op Nederlandse nachtrustverwachtingen na 22:00 wanneer overlast
          buiten de flat escaleert (
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            SSH-huisregels
          </a>
          ). College Campus sluit gemeenschappelijke zitplekken en grote keukens tijdens de nachtrust. Een
          bezoekbeleid dat die klokken negeert is onaf. Aankomsttijden, gesprekken in de gang en ochtenddouches horen
          bij dezelfde grens als “mogen ze hier slapen.”
        </p>

        <h2>Een korte huisvergadering die bezoek echt regelt</h2>

        <p>
          Bruikbare bezoekafspraken zijn expres saai. Ze moraliseren daten niet. Ze definiëren belasting op gedeelde
          infrastructuur. Een gesprek in week één kan gaan over:
        </p>

        <ul>
          <li>Maximum overnachtingen per gast per week, met een evaluatie na zes weken.</li>
          <li>Aankondigingskanaal (huisapp, geen verrassingsklop om 23:30).</li>
          <li>Hostverantwoordelijkheid: gasten volgen nachtrust, schoonmaak en koelkastlabels.</li>
          <li>Tentamenweek-override: minder overnachtingen als een huisgenoot assessments heeft.</li>
          <li>Contractcheck: verbiedt de huur of het huisreglement van de aanbieder overnachtingen al?</li>
        </ul>

        <p>
          Dezelfde precisie helpt keukens. Huizen die al worstelen om klusjeseerlijkheid te definiëren, zoals in{' '}
          <Link href="/blog/roommate-chore-fairness-netherlands">
            Eerlijke klusjesverdeling in Nederlandse studentenhuizen
          </Link>
          , zullen nog meer worstelen wanneer een onofficiële vijfde bewoner afwas en was toevoegt zonder naam op het
          rooster.
        </p>

        <h2>Grenzen zijn infrastructuur, geen jaloezie</h2>

        <p>
          Conflict over overnachtingen wordt vaak gelezen als afgunst of controle. Het helderdere frame is capaciteit.
          Studentenkamers en gedeelde voorzieningen zijn meestal ontworpen rond genoemde huurders. Regels van
          aanbieders, huurcontracten en toestemming van huisgenoten beschermen elk een ander risico: naleving in het
          gebouw, rechtmatig gebruik van de woning, en dagelijkse waardigheid voor wie huur betaalt. Blijven die lagen
          onuitgesproken, dan wordt gastvrijheid bezetting. Nachten, aankondiging en nachtrust vroeg benoemen houdt
          relaties en huissystemen uit de concurrentie om dezelfde badkamer.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          SSH Student Housing. House rules (Short Stay).{' '}
          <a
            href="https://help.sshxl.nl/nl/articles/368429-house-rules"
            target="_blank"
            rel="noreferrer"
          >
            https://help.sshxl.nl/nl/articles/368429-house-rules
          </a>
        </p>
        <p className="text-sm text-slate-600">
          College Campus Meppel. Frequently asked questions (gasten en nachtrust).{' '}
          <a href="https://collegecampus.nl/faq/" target="_blank" rel="noreferrer">
            https://collegecampus.nl/faq/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Clavix. Onderhuur en inwoning: wat is toegestaan en wat niet?{' '}
          <a
            href="https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder"
            target="_blank"
            rel="noreferrer"
          >
            https://www.clavix.nl/post/onderhuur-en-inwoning-wat-mag-wel-en-wat-mag-niet-als-huurder
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Dutch Student Housing. Roommate agreement template notes.{' '}
          <a
            href="https://dutchstudenthousing.nl/papers/roommate-agreement-template"
            target="_blank"
            rel="noreferrer"
          >
            https://dutchstudenthousing.nl/papers/roommate-agreement-template
          </a>
        </p>
      </div>
    ),
  },
}

export function OvernightGuestRulesArticle() {
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
