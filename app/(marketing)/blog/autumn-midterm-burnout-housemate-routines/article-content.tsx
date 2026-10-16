'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Autumn Midterm Burnout: Housemate Routines That Actually Help',
    excerpt:
      'Mid-block peaks and shorter days strain Dutch student houses. Practical indoor routines for study load, recovery gaps, and low-pressure bonding — without another tentamenweek rulebook.',
    publishDate: '2026-10-14',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Exam Week House Rules',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Temporary quiet, kitchen, and guest norms when a full tentamenweek arrives.',
      },
      {
        title: 'Surviving the Winter Blues',
        href: '/blog/surviving-the-winter-blues',
        description:
          'How shared living can buffer seasonal low mood when daylight and energy drop.',
      },
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Why sleep mismatches become louder once mid-semester pressure rises.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Mid-October in a Dutch student house has a particular soundtrack: rain on bike seats, the dishwasher
          running at midnight, and three different calendars claiming the same kitchen table. It is not yet deep
          winter, and it is not a classic tentamenweek. It is the mid-block stretch — papers, midterms, group
          deadlines — when daylight shrinks and the flat starts to feel smaller. Tilburg University researchers
          have shown how end-of-period study load can spike dramatically when students postpone deep work until
          assessment week, sometimes approaching ninety-four hours in a single week (
          <a
            href="https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/"
            target="_blank"
            rel="noreferrer"
          >
            Univers / Tilburg University workload study, 2026
          </a>
          ). The quieter story for housemates is what happens in the weeks before that spike — and the recovery
          gap right after.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Bright shared kitchen with white cabinets, wooden bar stools at a counter island, and daylight from large windows"
            priority
          />
          <figcaption>
            Autumn midterms turn the kitchen into both workspace and social hub — unless the house designs a
            gentler script.
          </figcaption>
        </figure>

        <h2>Why autumn midterms feel different from exam week</h2>

        <p>
          Exam week is a known storm. Housemates often invent temporary quiet hours and guest freezes for those
          intense days; we covered that system elsewhere in{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">exam week house rules</Link>. Mid-autumn is
          sneakier. Assessments are staggered. One person has a midterm on Tuesday, another a presentation on
          Thursday, a third is rewriting a paper while still attending lectures. There is no shared &quot;red
          zone&quot; on the wall calendar — only overlapping grey zones.
        </p>

        <p>
          That pattern matches what the Tilburg team describes after peaks: students want a week of rest while
          new lectures have already started, then the next pile-up arrives. In a shared house, the recovery gap
          becomes interpersonal — one person wants to talk, another is still in deadline mode, a third has checked
          out with headphones. Without a mid-semester script, the flat oscillates between silent tension and
          forced gezelligheid.
        </p>

        <h2>What national wellbeing data still says about load</h2>

        <p>
          National monitoring of HBO and university students continues to show that a large share report emotional
          exhaustion symptoms and that roughly three in ten experience substantial hindrance from psychological
          complaints such as low mood, worry, or nervousness (
          <a
            href="https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf"
            target="_blank"
            rel="noreferrer"
          >
            RIVM / Trimbos / GGD GHOR student mental health overview, 2025
          </a>
          ). Those figures are not proof that housemates cause burnout. They do explain why a mid-block kitchen
          dispute lands harder in October than in September: the baseline load is already high, and shorter days
          reduce the buffer that outdoor socialising used to provide.
        </p>

        <p>
          Clinical and youth-mental-health guidance also notes that seasonal mood patterns — irritability, heavier
          sleep, social withdrawal, slipping grades — can appear in autumn and winter for a minority of young
          people (
          <a
            href="https://kenniscentrum-kjp.nl/professionals/depressie/"
            target="_blank"
            rel="noreferrer"
          >
            Kenniscentrum Kinder- en Jeugdpsychiatrie
          </a>
          ). A student house is not a clinic. It is, however, the place where withdrawal first becomes visible as
          skipped dinners and closed doors. For a longer view on seasonal mood and living arrangements, see{' '}
          <Link href="/blog/surviving-the-winter-blues">surviving the winter blues</Link>.
        </p>

        <h2>The survival guide: three mid-autumn house systems</h2>

        <h3>1. A mid-block study map (not a full house constitution)</h3>

        <p>
          Once every two weeks in October and November, spend ten minutes updating a shared note: who has a hard
          deadline in the next fortnight, which evenings need quieter common rooms, and which mornings are sacred
          for sleep. Keep it operational — dates and rooms — not personality commentary. If sleep is already a
          friction point, pair the map with the habits discussed in{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">night owl vs. 8 a.m. lecture</Link>.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> mark &quot;focus windows&quot; (for example 19:00–22:00 Tue/Thu) when the living
            room stays low-noise.
          </li>
          <li>
            <strong>Do:</strong> name one &quot;loud window&quot; so social energy has a legal slot.
          </li>
          <li>
            <strong>Don&apos;t:</strong> treat every midterm as a house-wide lockdown. Staggered assessments need
            staggered protection.
          </li>
        </ul>

        <h3>2. Protect the recovery gap after a peak</h3>

        <p>
          After a midterm cluster, the house often splits: celebratory drinks versus total collapse. Plan a soft
          landing instead of an immediate return to normal chaos. Agree that the forty-eight hours after a heavy
          assessment day get lighter chores, fewer guests, and no guilt for early nights. That is not laziness; it
          is how you interrupt the Tilburg-described cycle where rest is postponed until the next overload.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> rotate who cooks a simple meal after someone&apos;s big deadline.
          </li>
          <li>
            <strong>Don&apos;t:</strong> schedule house parties the night someone finishes a brutal week unless
            they opt in.
          </li>
        </ul>

        <h3>3. Indoor bonding with a small social battery</h3>

        <p>
          When it rains for a week, gezelligheid cannot rely on terrace beers. Design low-demand contact: a
          twenty-minute shared dinner twice a week, a Sunday grocery run, a film with an agreed end time. Student
          support advice for worried housemates often lands on the same principle — small, regular contact beats
          one intense intervention (
          <a
            href="https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de"
            target="_blank"
            rel="noreferrer"
          >
            Nederlands Dagblad / IFES guidance on supporting a struggling housemate
          </a>
          ). You are building presence, not performing friendship.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> ask &quot;tea or quiet?&quot; before launching a long debrief.
          </li>
          <li>
            <strong>Do:</strong> keep one weekly ritual that survives midterms (shared pasta, crossword, short walk
            between lectures).
          </li>
          <li>
            <strong>Don&apos;t:</strong> treat closed doors as rejection by default — check once, then respect the
            answer.
          </li>
        </ul>

        <h2>Boundaries that keep bonding from becoming unpaid therapy</h2>

        <p>
          Autumn burnout makes emotional labour uneven. The housemate who notices first often becomes the default
          counsellor — a role that needs limits. Everyday support is valuable and still needs consent and capacity
          (see{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            housemate support when living away from home
          </Link>
          ). Keep a short chat norm: urgent practical messages anytime; heavier check-ins by invitation; campus
          and huisarts links when symptoms persist. For how to write that without killing the vibe, see{' '}
          <Link href="/blog/group-chats-ground-rules">group chats, ground rules</Link>.
        </p>

        <h2>What institutions quietly need from mid-semester housing</h2>

        <p>
          Programme retention is rarely framed as an October kitchen problem, yet mid-block attrition risk shows up
          first as sleep loss, conflict, and withdrawal at home. Teams that only publish intro-week and
          tentamenweek guidance miss the longest stretch of the semester. A one-page mid-autumn addendum — study
          map, recovery-gap etiquette, indoor bonding ideas, escalation paths — costs little and matches what
          workload research implies: peaks are predictable, recovery needs design. Institutional context sits on
          the <Link href="/universities">universities</Link> overview and{' '}
          <Link href="/about">about</Link> page; when money stress joins study stress, the{' '}
          <Link href="/rent-calculator">rent calculator</Link> keeps housing-cost talks factual rather than
          personal.
        </p>

        <h2>A short October checklist for the house WhatsApp</h2>

        <ul>
          <li>Update the fortnight study map this Sunday.</li>
          <li>Name two quiet evenings and one social evening.</li>
          <li>Book one low-effort shared dinner before the next midterm cluster.</li>
          <li>Agree a forty-eight-hour soft landing after each person&apos;s heaviest assessment.</li>
          <li>Save one link to campus wellbeing support in the pinned chat.</li>
        </ul>

        <p>
          Autumn midterms will still be hard. The difference is whether the house adds friction or quietly
          redistributes it — so that study load, recovery, and a little indoor warmth can coexist until the days
          start lengthening again.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-600">
          Univers. (2026, 16 June). Studiedruk kan in tentamentijd oplopen tot 94 uur per week, blijkt uit Tilburgs
          onderzoek.{' '}
          <a
            href="https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/"
            target="_blank"
            rel="noreferrer"
          >
            https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM, Trimbos-instituut &amp; GGD GHOR Nederland. (2025). Mentale gezondheid en middelengebruik studenten
          hbo en wo (overview).{' '}
          <a
            href="https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Kenniscentrum Kinder- en Jeugdpsychiatrie. Depressie (stemmingsstoornis) — seizoensgebonden patroon.{' '}
          <a
            href="https://kenniscentrum-kjp.nl/professionals/depressie/"
            target="_blank"
            rel="noreferrer"
          >
            https://kenniscentrum-kjp.nl/professionals/depressie/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nederlands Dagblad. (2024). Het gaat niet goed met mijn huisgenoot, wat kan ik doen?{' '}
          <a
            href="https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Herfst-midterms: huisgenotenroutines tegen burnout',
    excerpt:
      'Midden in het blok en kortere dagen belasten studentenhuizen. Praktische indoor-routines voor studiedruk, herstelgaten en low-pressure bonding — zonder opnieuw een tentamenweek-handboek.',
    publishDate: '2026-10-14',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Tentamenweek-huisregels',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Tijdelijke stilte-, keuken- en bezoeknormen wanneer een volle tentamenweek begint.',
      },
      {
        title: 'Winterblues overleven',
        href: '/blog/surviving-the-winter-blues',
        description:
          'Hoe samenwonen seizoensgebonden somberheid kan bufferen als daglicht en energie dalen.',
      },
      {
        title: 'Nachtuil vs. college om 8:00',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Waarom slaapmismatches harder klinken zodra de mid-semesterdruk oploopt.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Half oktober in een Nederlands studentenhuis heeft een herkenbaar soundtrack: regen op fietszadels, de
          vaatwasser om middernacht, en drie agenda&apos;s die dezelfde keukentafel claimen. Het is nog geen diepe
          winter, en het is geen klassieke tentamenweek. Het is de mid-blokperiode — papers, midterms,
          groepsdeadlines — waarin het daglicht krimpt en het huis kleiner voelt. Onderzoekers van Tilburg
          University laten zien hoe studiedruk aan het eind van een periode fors kan pieken wanneer diep leren
          wordt uitgesteld tot de toetsweek, soms tot bijna vierennegentig uur in één week (
          <a
            href="https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/"
            target="_blank"
            rel="noreferrer"
          >
            Univers / Tilburg University studiedrukonderzoek, 2026
          </a>
          ). Voor huisgenoten is het stillere verhaal wat er in de weken vóór die piek gebeurt — en het
          herstelgat vlak erna.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Lichte gedeelde keuken met witte kasten, houten barkrukken aan een kookeiland en daglicht via grote ramen"
            priority
          />
          <figcaption>
            Herfst-midterms maken van de keuken zowel werkplek als sociale hub — tenzij het huis een zachtere
            script afspreekt.
          </figcaption>
        </figure>

        <h2>Waarom herfst-midterms anders voelen dan tentamenweek</h2>

        <p>
          Tentamenweek is een bekende storm. Huisgenoten verzinnen dan tijdelijke stilte-uren en
          bezoekpauzes; dat systeem staat uitgewerkt in{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">tentamenweek-huisregels</Link>. Midden in de
          herfst is slimmer en verraderlijker. Toetsen liggen gespreid. De één heeft dinsdag een midterm, de ander
          donderdag een presentatie, een derde herschrijft een paper terwijl de colleges doorlopen. Er is geen
          gedeelde &quot;rode zone&quot; op de kalender — alleen overlappende grijze zones.
        </p>

        <p>
          Dat past bij wat het Tilburgse team na pieken beschrijft: studenten willen een week rust terwijl nieuwe
          colleges al begonnen zijn, waarna de volgende opeenhoping volgt. In een studentenhuis wordt dat
          herstelgat relationeel — de één wil praten, de ander zit nog in deadline-modus, een derde heeft afgehaakt
          met koptelefoon. Zonder mid-semester-script schommelt het huis tussen stille spanning en geforceerde
          gezelligheid.
        </p>

        <h2>Wat landelijke welzijnscijfers nog steeds over druk zeggen</h2>

        <p>
          Landelijke monitoring onder hbo- en wo-studenten blijft laten zien dat een groot deel
          emotionele-uitputtingsklachten meldt en dat ongeveer drie op de tien (heel) veel hinder ervaart door
          psychische klachten zoals somberheid, bezorgdheid of zenuwachtigheid (
          <a
            href="https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf"
            target="_blank"
            rel="noreferrer"
          >
            RIVM / Trimbos / GGD GHOR overzicht mentale gezondheid studenten, 2025
          </a>
          ). Die cijfers bewijzen niet dat huisgenoten burnout veroorzaken. Ze verklaren wel waarom een
          keukenruzie in oktober harder aankomt dan in september: de baseline-druk is al hoog, en kortere dagen
          verkleinen de buffer die buiten-afspreken eerder gaf.
        </p>

        <p>
          Jeugd-ggz-richtlijnen wijzen er ook op dat seizoensgebonden stemmingspatronen — prikkelbaarheid, zwaarder
          slapen, sociale terugtrekking, dalende cijfers — in herfst en winter bij een minderheid van jongeren
          kunnen optreden (
          <a
            href="https://kenniscentrum-kjp.nl/professionals/depressie/"
            target="_blank"
            rel="noreferrer"
          >
            Kenniscentrum Kinder- en Jeugdpsychiatrie
          </a>
          ). Een studentenhuis is geen kliniek. Het is wel de plek waar terugtrekking het eerst zichtbaar wordt
          als overgeslagen diners en dichte deuren. Voor een langere blik op seizoensgemoed en woonsituatie, zie{' '}
          <Link href="/blog/surviving-the-winter-blues">winterblues overleven</Link>.
        </p>

        <h2>Survival guide: drie mid-herfst huissystemen</h2>

        <h3>1. Een mid-blok studiemap (geen grondwet)</h3>

        <p>
          Elke twee weken in oktober en november: tien minuten een gedeelde notitie bijwerken — wie heeft een harde
          deadline, welke avonden moeten gemeenschappelijke ruimtes stiller, welke ochtenden zijn heilig voor
          slaap. Houd het operationeel — data en kamers — geen karaktercommentaar. Als slaap al schuurt, koppel de
          map aan de gewoontes uit{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">nachtuil vs. college om 8:00</Link>.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> markeer &quot;focusvensters&quot; (bijvoorbeeld 19:00–22:00 di/do) waarin de
            woonkamer low-noise blijft.
          </li>
          <li>
            <strong>Do:</strong> benoem één &quot;luid venster&quot; zodat sociale energie een legale plek heeft.
          </li>
          <li>
            <strong>Don&apos;t:</strong> maak van elke midterm een huisbrede lockdown. Gespreide toetsen vragen
            gespreide bescherming.
          </li>
        </ul>

        <h3>2. Bescherm het herstelgat na een piek</h3>

        <p>
          Na een cluster midterms splitst het huis vaak: borrel versus totale crash. Plan een zachte landing in
          plaats van meteen terug naar chaos. Spreek af dat de achtenveertig uur na een zware toetsdag lichtere
          klusjes, minder bezoek en geen schuldgevoel over vroege nachten krijgt. Dat is geen luiheid; het
          onderbreekt de Tilburgse cyclus waarin rust wordt uitgesteld tot de volgende overbelasting.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> roteer wie een eenvoudige maaltijd kookt na iemands grote deadline.
          </li>
          <li>
            <strong>Don&apos;t:</strong> plan een huisfeest de avond dat iemand een brute week afrondt, tenzij die
            persoon instemt.
          </li>
        </ul>

        <h3>3. Indoor bonding met een kleine sociale batterij</h3>

        <p>
          Als het een week regent, kan gezelligheid niet op terrasbiertjes leunen. Ontwerp low-demand contact: twee
          keer per week twintig minuten samen eten, een zondagse boodschappenronde, een film met afgesproken
          eindtijd. Advies voor bezorgde huisgenoten landt vaak op hetzelfde principe — klein, regelmatig contact
          wint van één intensieve interventie (
          <a
            href="https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de"
            target="_blank"
            rel="noreferrer"
          >
            Nederlands Dagblad / IFES over steun aan een worstelende huisgenoot
          </a>
          ). Je bouwt aanwezigheid, je voert geen vriendschap op.
        </p>

        <ul>
          <li>
            <strong>Do:</strong> vraag &quot;thee of stilte?&quot; voordat je een lang debrief start.
          </li>
          <li>
            <strong>Do:</strong> houd één wekelijks ritueel dat midterms overleeft (pasta, crossword, korte
            wandeling tussen colleges).
          </li>
          <li>
            <strong>Don&apos;t:</strong> lees dichte deuren standaard als afwijzing — check één keer, respecteer
            daarna het antwoord.
          </li>
        </ul>

        <h2>Grenzen zodat bonding geen onbetaalde therapie wordt</h2>

        <p>
          Herfstburnout maakt emotionele arbeid scheef. De huisgenoot die het eerst merkt, wordt al snel de
          standaard-counsellor — een rol met limieten. Alledaagse steun is waardevol en vraagt om toestemming en
          capaciteit (zie{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            steun van huisgenoten als je uit huis woont
          </Link>
          ). Houd een korte chatnorm: urgente praktische berichten altijd; zwaardere check-ins op uitnodiging;
          campus- en huisartslinks als klachten aanhouden. Hoe je dat opschrijft zonder de sfeer te doden, staat in{' '}
          <Link href="/blog/group-chats-ground-rules">group chats, ground rules</Link>.
        </p>

        <h2>Wat instellingen stilzwijgend nodig hebben van mid-semester wonen</h2>

        <p>
          Retentie wordt zelden als oktober-keukenprobleem geframed, terwijl mid-blok risico&apos;s zich eerst
          tonen als slaaptekort, conflict en terugtrekking thuis. Teams die alleen introweek- en
          tentamenweek-advies publiceren missen het langste deel van het semester. Een éénpagina mid-herfst
          addendum — studiemap, herstelgat-etiquette, indoor bonding, escalatiepaden — kost weinig en sluit aan bij
          studiedrukonderzoek: pieken zijn voorspelbaar, herstel vraagt ontwerp. Institutionele context staat op de{' '}
          <Link href="/universities">universities</Link>-pagina en{' '}
          <Link href="/about">about</Link>; bij geldstress houdt de{' '}
          <Link href="/rent-calculator">rent calculator</Link> woonkostengesprekken feitelijk.
        </p>

        <h2>Korte oktober-checklist voor de huis-WhatsApp</h2>

        <ul>
          <li>Werk zondag de tweewekelijkse studiemap bij.</li>
          <li>Benoem twee stille avonden en één sociale avond.</li>
          <li>Plan één low-effort gedeeld diner vóór de volgende midterm-cluster.</li>
          <li>Spreek een achtenveertig-uur zachte landing af na ieders zwaarste toets.</li>
          <li>Pin één link naar campus-welzijnsondersteuning in de chat.</li>
        </ul>

        <p>
          Herfst-midterms blijven zwaar. Het verschil is of het huis wrijving toevoegt of die stil herverdeelt —
          zodat studiedruk, herstel en een beetje indoor warmte kunnen samengaan tot de dagen weer langer worden.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Univers. (2026, 16 juni). Studiedruk kan in tentamentijd oplopen tot 94 uur per week, blijkt uit Tilburgs
          onderzoek.{' '}
          <a
            href="https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/"
            target="_blank"
            rel="noreferrer"
          >
            https://universonline.nl/nieuws/2026/06/16/studiedruk-kan-in-tentamentijd-oplopen-tot-94-uur-per-week-blijkt-uit-tilburgs-onderzoek/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          RIVM, Trimbos-instituut &amp; GGD GHOR Nederland. (2025). Mentale gezondheid en middelengebruik studenten
          hbo en wo (overzicht).{' '}
          <a
            href="https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/sites/default/files/2025-11/Mentale-gezondheid-en-middelengebruik-studenten-hbo-en-wo.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Kenniscentrum Kinder- en Jeugdpsychiatrie. Depressie (stemmingsstoornis) — seizoensgebonden patroon.{' '}
          <a
            href="https://kenniscentrum-kjp.nl/professionals/depressie/"
            target="_blank"
            rel="noreferrer"
          >
            https://kenniscentrum-kjp.nl/professionals/depressie/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nederlands Dagblad. Het gaat niet goed met mijn huisgenoot, wat kan ik doen?{' '}
          <a
            href="https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nd.nl/leven/leven/1236056/het-gaat-niet-goed-met-mijn-huisgenoot-wat-kan-ik-doen-zet-de
          </a>
        </p>
      </div>
    ),
  },
}

export function AutumnMidtermBurnoutArticle() {
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
