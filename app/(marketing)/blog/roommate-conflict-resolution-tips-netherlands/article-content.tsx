'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Roommate Conflict Resolution Tips for Dutch Students',
    excerpt:
      'Cleanliness and noise dominate student housing disputes. Dutch wellbeing monitoring and university guidance show how to de-escalate household friction before it reaches grades and mental health.',
    publishDate: '2026-06-10',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How written house norms reduce the passive-aggressive messages that often precede bigger blow-ups.',
      },
      {
        title: 'When Dishes = Disrespect',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Why chore conflicts feel personal, and how to reframe them as repairable system failures rather than character flaws.',
      },
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Behaviour-based screening questions that surface conflict style before anyone signs a lease.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Most student housing conflicts do not begin as dramatic confrontations. They start as a dish left
          overnight, a door that slams at 2 a.m., or a partner who &quot;just stays over&quot; three nights a
          week. By the time irritation becomes a house meeting, the underlying issue is often not the mess or
          the noise itself, but the feeling that{' '}
          <strong>your boundaries were never taken seriously</strong>. In the Netherlands, where shared rooms
          and student houses remain the default for many undergraduates, learning to resolve those frictions
          early is less a social nicety and more a wellbeing skill.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Shared student kitchen where chore and noise disputes often begin among Dutch housemates"
          />
          <figcaption>
            Kitchens and common rooms are where small frictions repeat until they feel like disrespect.
          </figcaption>
        </figure>

        <h2>What Dutch student-life professionals see first</h2>

        <p>
          When students seek outside help for roommate tension, two themes dominate the intake notes:
          cleanliness and noise. Aino Kekkonen, Student Life Officer at Amsterdam University College, told
          campus newspaper Ad Valvas that these are the most common reasons students contact her for guidance (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Her observation matches what student psychology coaches in the Netherlands report about shared
          households: conflict is rarely about a single event. It is about{' '}
          <strong>incompatible expectations that were never made explicit</strong> (
          <a
            href="https://wakeupstudent.nl/help-mijn-huisgenoot-is-rommelkont/"
            target="_blank"
            rel="noreferrer"
          >
            Wakeupstudent.nl
          </a>
          ).
        </p>

        <p>
          Kekkonen&apos;s practical advice is straightforward: talk before resentment hardens. Many students
          admit they have not raised an issue directly, assuming a roommate should already know something is
          wrong. &quot;Your roommate can&apos;t read your mind,&quot; she emphasises. That sounds obvious, yet
          it is the step most often skipped.
        </p>

        <h2>Why household friction sits on a wider wellbeing ledger</h2>

        <p>
          Roommate stress does not happen in isolation from national wellbeing trends. The Gezondheidsmonitor
          Jongvolwassenen 2024, conducted by municipal health services and RIVM among more than 135,000 young
          adults aged 16 to 25, found that mental health in this group still needs attention: only about half
          report good mental health, and many experience loneliness, stress, and performance pressure, with
          slight improvement on some indicators since 2022 (
          <a
            href="https://ggdghor.nl/wp-content/uploads/2025/03/Verdiepend-onderzoek-GMJV-2024.pdf"
            target="_blank"
            rel="noreferrer"
          >
            GGD GHOR Nederland, 2025
          </a>
          ). Separately, Panel Inzicht research commissioned by Resto VanHarte found that{' '}
          <strong>48 percent</strong> of Dutch young adults aged 18 to 34 felt lonely in the preceding three
          months, compared with <strong>31 percent</strong> across the general population (
          <a
            href="https://persportaal.anp.nl/artikel/ee87e565-de1f-4377-8ed1-17b5a56863a3/jongvolwassenen-meest-eenzame-groep-in-nederland-bijna-helft-voelt-zich-weleens-eenzaam"
            target="_blank"
            rel="noreferrer"
          >
            ANP / Resto VanHarte, 2025
          </a>
          ).
        </p>

        <p>
          A tense household will not single-handedly cause those figures, but it can amplify them. Chronic
          low-grade conflict at home adds sleep disruption, social withdrawal, and cognitive load at exactly
          the life stage when Dutch monitoring already flags elevated stress. RIVM&apos;s GOR Network update in
          June 2025 similarly reported rising loneliness and stress among young people relative to pre-pandemic
          baselines (
          <a
            href="https://www.rivm.nl/en/news/mental-health-decreasing-among-young-people-stable-among-adults"
            target="_blank"
            rel="noreferrer"
          >
            RIVM, 2025
          </a>
          ). Treating conflict resolution as a health-adjacent skill, not just a personality test, aligns with
          how institutions increasingly frame student support.
        </p>

        <h2>A practical de-escalation sequence</h2>

        <h3>1. Name the behaviour, not the person</h3>

        <p>
          Conflict research distinguishes between personal attacks and behaviour-focused feedback. Dutch student
          coaches recommend describing what you observe and how it affects you, rather than labelling someone
          lazy or selfish (
          <a
            href="https://wakeupstudent.nl/help-mijn-huisgenoot-is-rommelkont/"
            target="_blank"
            rel="noreferrer"
          >
            Wakeupstudent.nl
          </a>
          ). Hanze University of Applied Sciences student guidance suggests framing requests around shared
          benefit: &quot;It would be easier for everyone if dishes were cleared after use so plates are always
          available&quot; (
          <a
            href="https://www.hanze.nl/en/study/meet-us/student-blog/types-of-roommates"
            target="_blank"
            rel="noreferrer"
          >
            Hanze UAS, student blog
          </a>
          ). That keeps the conversation on systems, not moral judgment.
        </p>

        <h3>2. Write expectations down before you need them</h3>

        <p>
          Kekkonen advises students moving in together to document expectations in a simple agreement, even if
          it feels formal (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Written norms on guests, quiet hours, and cleaning cadence give you a neutral reference point when
          emotions run high. For a starting template on how flats translate norms into house rules, see{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>.
        </p>

        <h3>3. Schedule repair, do not ambush</h3>

        <p>
          University of Groningen student bloggers note that regular house check-ins, whether a weekly dinner or
          a short standing meeting, help resolve friction before it escalates (
          <a
            href="https://www.rug.nl/education/student-blog/4-things-you-should-do-when-living-with-roommates-04-09-2020"
            target="_blank"
            rel="noreferrer"
          >
            University of Groningen, 2020
          </a>
          ). Cornering a housemate in the hallway after a bad day tends to produce defensiveness. A planned
          fifteen-minute conversation signals that the relationship matters enough to prepare for.
        </p>

        <h3>4. Define three concrete changes</h3>

        <p>
          If an initial talk stalls, Ad Valvas reports that Kekkonen sometimes asks each party to name three
          specific adjustments they will make (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Vague promises like &quot;I&apos;ll be cleaner&quot; fail because they are not measurable. &quot;I
          will wash my dishes within two hours&quot; or &quot;No guests after midnight on weeknights&quot; can
          be reviewed in a follow-up without re-litigating character.
        </p>

        <h3>5. Know when to escalate beyond the kitchen table</h3>

        <p>
          Most Dutch student houses operate informally, but persistent harassment, discrimination, or safety
          concerns belong with institutional support channels, tenant unions, or legal aid, not with passive
          tolerance. Universities publish guidance on student life issues precisely because some conflicts exceed
          what housemates can mediate alone. Background on how editorial coverage approaches shared-living
          research is available on the{' '}
          <Link href="/about">about page</Link>.
        </p>

        <h2>Low-threshold tools that lower the activation energy</h2>

        <p>
          Not every household needs a formal intervention, but some benefit from structured conversation
          prompts. Radboud University&apos;s Vox magazine reported on a card game developed by Honours Academy
          students to help housemates discuss irritations without immediately naming the offender (
          <a
            href="https://www.voxweb.nl/nieuws/ruzie-met-je-huisgenoten-pak-er-een-kaartspel-bij"
            target="_blank"
            rel="noreferrer"
          >
            Vox, 2024
          </a>
          ). The designers argued that many students avoid direct confrontation because the social step feels
          large; a game creates distance that makes emotion and needs easier to articulate. Whether you use
          cards or a shared document, the principle is the same: reduce the shame tax on saying something early.
        </p>

        <h2>Prevention beats repair</h2>

        <p>
          The cheapest conflict resolution happens before move-in. Behaviour-based questions about sleep,
          guests, and cleaning standards surface incompatibility while exit costs are still low. Articles on{' '}
          <Link href="/blog/when-dishes-equal-disrespect">why chore fights feel like disrespect</Link> and on{' '}
          <Link href="/blog/how-to-find-a-great-roommate">screening for living habits</Link> explore that
          preventive layer in more detail. Dutch housing pressure makes it tempting to accept the first
          available room; the data on young-adult loneliness suggests that a socially draining home can cost
          more than a longer commute.
        </p>

        <p>
          Conflict in shared living is normal. Escalation is optional. The students who navigate it well treat
          their household like a small organisation: clear norms, scheduled communication, and behaviour-focused
          feedback when something drifts. That is not cynicism. It is the same infrastructure mindset universities
          apply to every other part of the degree, applied where you actually sleep.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Ad Valvas. (2023). <em>Your roommate can&apos;t read your mind</em>.{' '}
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ANP / Resto VanHarte. (2025). <em>Jongvolwassenen meest eenzame groep in Nederland</em>.{' '}
          <a
            href="https://persportaal.anp.nl/artikel/ee87e565-de1f-4377-8ed1-17b5a56863a3/jongvolwassenen-meest-eenzame-groep-in-nederland-bijna-helft-voelt-zich-weleens-eenzaam"
            target="_blank"
            rel="noreferrer"
          >
            Persportaal ANP
          </a>
        </p>
        <p className="text-sm text-slate-600">
          GGD GHOR Nederland. (2025). <em>Verdiepend onderzoek Gezondheidsmonitor Jongvolwassenen 2024</em>.{' '}
          <a
            href="https://ggdghor.nl/wp-content/uploads/2025/03/Verdiepend-onderzoek-GMJV-2024.pdf"
            target="_blank"
            rel="noreferrer"
          >
            GGD GHOR Nederland PDF
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM. (2025). <em>Mental health decreasing among young people, stable among adults</em>.{' '}
          <a
            href="https://www.rivm.nl/en/news/mental-health-decreasing-among-young-people-stable-among-adults"
            target="_blank"
            rel="noreferrer"
          >
            RIVM news release
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Conflicten met huisgenoten oplossen: tips voor Nederlandse studenten',
    excerpt:
      'Netheid en geluid domineren huisgenootgeschillen. Nederlandse welzijnsmonitoring en universitaire begeleiding laten zien hoe je huishoudelijke frictie de-escaleert vóór cijfers en mentale gezondheid eronder lijden.',
    publishDate: '2026-06-10',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe schriftelijke huisnormen passief-agressieve berichten verminderen die vaak aan grotere ruzies voorafgaan.',
      },
      {
        title: 'Als afwas = disrespect',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Waarom klusjesconflicten persoonlijk voelen, en hoe je ze herkadert als repareerbare systeemfouten.',
      },
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Gedragsvragen die conflictstijl blootleggen vóór iemand een contract tekent.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          De meeste conflicten in studentenhuizen beginnen niet als dramatische confrontaties. Ze starten als
          afwas die een nacht blijft staan, een deur die om 02.00 uur dichtslaat, of een partner die
          &quot;even blijft slapen&quot; drie keer per week. Tegen de tijd dat irritatie een huisoverleg wordt,
          gaat het vaak niet meer om de rommel of het lawaai zelf, maar om het gevoel dat{' '}
          <strong>jouw grenzen nooit serieus zijn genomen</strong>. In Nederland, waar gedeelde kamers en
          studentenhuizen voor veel bachelorstudenten norm blijven, is leren de-escaleren minder een sociale
          bonus en meer een welzijnsvaardigheid.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Gedeelde studentenkeuken waar klusjes- en geluidsconflicten vaak beginnen"
          />
          <figcaption>
            Keukens en gemeenschappelijke ruimtes zijn plekken waar kleine fricties zich opstapelen tot disrespect.
          </figcaption>
        </figure>

        <h2>Wat studentbegeleiders in Nederland het vaakst horen</h2>

        <p>
          Wanneer studenten hulp zoeken bij huisgenootspanning, domineren twee thema&apos;s de intake: netheid
          en geluidsoverlast. Aino Kekkonen, Student Life Officer aan Amsterdam University College, vertelde
          campuskrant Ad Valvas dat dit de meest voorkomende redenen zijn waarom studenten contact opnemen (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Dat sluit aan bij wat studentpsychologen rapporteren over gedeelde huishoudens: conflict gaat
          zelden over één incident, maar over{' '}
          <strong>ongelijke verwachtingen die nooit expliciet zijn gemaakt</strong> (
          <a
            href="https://wakeupstudent.nl/help-mijn-huisgenoot-is-rommelkont/"
            target="_blank"
            rel="noreferrer"
          >
            Wakeupstudent.nl
          </a>
          ).
        </p>

        <p>
          Kekkonens praktisch advies is helder: praat voordat wrok verhardt. Veel studenten geven toe dat ze
          een kwestie niet direct hebben aangesneden, in de veronderstelling dat een huisgenoot al zou moeten
          weten dat iets stoort. &quot;Je huisgenoot kan je gedachten niet lezen,&quot; benadrukt zij. Dat
          klinkt vanzelfsprekend, maar het is precies de stap die het vaakst wordt overgeslagen.
        </p>

        <h2>Waarom huishoudfrictie op een breder welzijnsdossier staat</h2>

        <p>
          Stress met huisgenoten staat niet los van landelijke welzijnstrends. De Gezondheidsmonitor
          Jongvolwassenen 2024, uitgevoerd door GGD&apos;en en RIVM onder ruim 135.000 jongvolwassenen van 16
          tot 25 jaar, laat zien dat mentale gezondheid in deze groep aandacht nodig heeft: slechts ongeveer
          de helft rapporteert een goede mentale gezondheid, en velen ervaren eenzaamheid, stress en
          prestatiedruk, met lichte verbetering op sommige indicatoren sinds 2022 (
          <a
            href="https://ggdghor.nl/wp-content/uploads/2025/03/Verdiepend-onderzoek-GMJV-2024.pdf"
            target="_blank"
            rel="noreferrer"
          >
            GGD GHOR Nederland, 2025
          </a>
          ). Onderzoek van Panel Inzicht in opdracht van Resto VanHarte vond dat{' '}
          <strong>48 procent</strong> van Nederlandse jongvolwassenen (18-34) zich in de afgelopen drie maanden
          eenzaam voelde, tegenover <strong>31 procent</strong> in de algemene bevolking (
          <a
            href="https://persportaal.anp.nl/artikel/ee87e565-de1f-4377-8ed1-17b5a56863a3/jongvolwassenen-meest-eenzame-groep-in-nederland-bijna-helft-voelt-zich-weleens-eenzaam"
            target="_blank"
            rel="noreferrer"
          >
            ANP / Resto VanHarte, 2025
          </a>
          ).
        </p>

        <p>
          Een gespannen huishouden veroorzaakt die cijfers niet alleen, maar kan ze wel versterken. Chronische
          low-level conflicten thuis voegen slaapverstoring, sociale terugtrekking en cognitieve belasting toe
          op precies het levensstadium waarin Nederlandse monitoring al verhoogde stress signaleert. RIVM&apos;s
          GOR-netwerk meldde in juni 2025 eveneens stijgende eenzaamheid en stress onder jongeren ten opzichte
          van pre-pandemische baselines (
          <a
            href="https://www.rivm.nl/en/news/mental-health-decreasing-among-young-people-stable-among-adults"
            target="_blank"
            rel="noreferrer"
          >
            RIVM, 2025
          </a>
          ). Conflictbeheersing zien als gezondheidsgerelateerde vaardigheid sluit aan bij hoe instellingen
          studentondersteuning steeds vaker framen.
        </p>

        <h2>Een praktische de-escalatiereeks</h2>

        <h3>1. Noem het gedrag, niet de persoon</h3>

        <p>
          Conflictonderzoek onderscheidt persoonlijke aanvallen van feedback op gedrag. Nederlandse
          studentcoaches raden aan te beschrijven wat je waarneemt en hoe het je raakt, in plaats van iemand
          lui of egoïstisch te noemen (
          <a
            href="https://wakeupstudent.nl/help-mijn-huisgenoot-is-rommelkont/"
            target="_blank"
            rel="noreferrer"
          >
            Wakeupstudent.nl
          </a>
          ). Hanzehogeschool adviseert verzoeken te kaderen rond gedeeld voordeel: &quot;Het zou voor iedereen
          makkelijker zijn als afwas direct wordt gedaan, zodat borden altijd beschikbaar zijn&quot; (
          <a
            href="https://www.hanze.nl/en/study/meet-us/student-blog/types-of-roommates"
            target="_blank"
            rel="noreferrer"
          >
            Hanze UAS, studentenblog
          </a>
          ). Zo blijft het gesprek over systemen, niet over morele oordelen.
        </p>

        <h3>2. Schrijf verwachtingen op vóór je ze nodig hebt</h3>

        <p>
          Kekkonen adviseert samenwonenden om verwachtingen vast te leggen in een eenvoudige afspraak, ook als
          dat formeel voelt (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Schriftelijke normen over logees, stiltetijden en schoonmaakritme geven een neutraal referentiepunt
          wanneer emoties oplopen. Een startpunt voor hoe flats normen vertalen naar huisregels staat in{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link>.
        </p>

        <h3>3. Plan herstel, overval niemand</h3>

        <p>
          Studentbloggers van de Rijksuniversiteit Groningen merken op dat regelmatige huis-check-ins, of dat nu
          een wekelijks diner of een kort overleg is, frictie helpen oplossen vóór escalatie (
          <a
            href="https://www.rug.nl/education/student-blog/4-things-you-should-do-when-living-with-roommates-04-09-2020"
            target="_blank"
            rel="noreferrer"
          >
            Rijksuniversiteit Groningen, 2020
          </a>
          ). Iemand in de gang confronteren na een slechte dag leidt vaak tot defensiviteit. Een gepland
          kwartiergesprek signaleert dat de relatie het waard is om je voor te bereiden.
        </p>

        <h3>4. Definieer drie concrete aanpassingen</h3>

        <p>
          Als een eerste gesprek vastloopt, vraagt Kekkonen soms elke partij drie specifieke aanpassingen te
          noemen (
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            Ad Valvas, 2023
          </a>
          ). Vage beloftes als &quot;ik word netter&quot; falen omdat ze niet meetbaar zijn. &quot;Ik doe mijn
          afwas binnen twee uur&quot; of &quot;Geen logees na middernacht doordeweeks&quot; zijn te evalueren
          zonder opnieuw over karakter te twisten.
        </p>

        <h3>5. Weet wanneer de keukentafel niet genoeg is</h3>

        <p>
          De meeste Nederlandse studentenhuizen draaien informeel, maar aanhoudende intimidatie, discriminatie
          of veiligheidsrisico&apos;s horen thuis bij institutionele ondersteuning, huurteams of juridische
          hulp, niet bij passieve tolerantie. Universiteiten publiceren begeleiding over studentenleven
          precies omdat sommige conflicten groter zijn dan huisgenoten alleen kunnen bemiddelen. Achtergrond
          over hoe redactionele coverage van gedeeld wonen wordt benaderd staat op de{' '}
          <Link href="/about">about-pagina</Link>.
        </p>

        <h2>Laagdrempelige hulpmiddelen die de drempel verlagen</h2>

        <p>
          Niet elk huishouden heeft een formele interventie nodig, maar sommige profiteren van gestructureerde
          gespreksstarters. Vox magazine berichtte over een kaartspel ontwikkeld door Honours Academy-studenten
          aan Radboud Universiteit om irritaties te bespreken zonder meteen de dader te benoemen (
          <a
            href="https://www.voxweb.nl/nieuws/ruzie-met-je-huisgenoten-pak-er-een-kaartspel-bij"
            target="_blank"
            rel="noreferrer"
          >
            Vox, 2024
          </a>
          ). De ontwerpers stelden dat veel studenten directe confrontatie vermijden omdat de sociale stap groot
          voelt; een spel creëert afstand waardoor emotie en behoeften makkelijker te verwoorden zijn. Of je
          nu kaarten of een gedeeld document gebruikt, het principe is hetzelfde: verlaag de schaamtebelasting
          van vroeg iets zeggen.
        </p>

        <h2>Voorkomen is goedkoper dan repareren</h2>

        <p>
          De goedkoopste conflictbeheersing gebeurt vóór intrek. Gedragsvragen over slaap, logees en
          schoonmaakstandaarden leggen incompabiliteit bloot terwijl uitstapkosten nog laag zijn. Artikelen over{' '}
          <Link href="/blog/when-dishes-equal-disrespect">waarom klusjesruzies als disrespect voelen</Link> en
          over{' '}
          <Link href="/blog/how-to-find-a-great-roommate">screenen op leefgewoontes</Link> verkennen die
          preventielaag verder. Nederlandse huisvestingsdruk maakt het verleidelijk de eerste beschikbare kamer
          te accepteren; cijfers over eenzaamheid onder jongvolwassenen suggereren dat een sociaal uitputtend
          thuis duurder kan zijn dan een langere reistijd.
        </p>

        <p>
          Conflict in gedeeld wonen is normaal. Escalatie is optioneel. Studenten die het goed doen, behandelen
          hun huishouden als een kleine organisatie: duidelijke normen, geplande communicatie en
          gedragsgerichte feedback wanneer iets afdrijft. Dat is geen cynisme. Het is dezelfde
          infrastructuurmentaliteit die universiteiten op elke andere studie-onderdeel toepassen, nu toegepast
          waar je daadwerkelijk slaapt.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          Ad Valvas. (2023). <em>Your roommate can&apos;t read your mind</em>.{' '}
          <a
            href="https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/"
            target="_blank"
            rel="noreferrer"
          >
            https://advalvas.vu.nl/en/student-society/your-roommate-cant-read-your-mind/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ANP / Resto VanHarte. (2025). <em>Jongvolwassenen meest eenzame groep in Nederland</em>.{' '}
          <a
            href="https://persportaal.anp.nl/artikel/ee87e565-de1f-4377-8ed1-17b5a56863a3/jongvolwassenen-meest-eenzame-groep-in-nederland-bijna-helft-voelt-zich-weleens-eenzaam"
            target="_blank"
            rel="noreferrer"
          >
            Persportaal ANP
          </a>
        </p>
        <p className="text-sm text-slate-600">
          GGD GHOR Nederland. (2025). <em>Verdiepend onderzoek Gezondheidsmonitor Jongvolwassenen 2024</em>.{' '}
          <a
            href="https://ggdghor.nl/wp-content/uploads/2025/03/Verdiepend-onderzoek-GMJV-2024.pdf"
            target="_blank"
            rel="noreferrer"
          >
            GGD GHOR Nederland PDF
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM. (2025). <em>Mental health decreasing among young people, stable among adults</em>.{' '}
          <a
            href="https://www.rivm.nl/en/news/mental-health-decreasing-among-young-people-stable-among-adults"
            target="_blank"
            rel="noreferrer"
          >
            RIVM persbericht
          </a>
        </p>
      </div>
    ),
  },
}

export function RoommateConflictResolutionArticle() {
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
