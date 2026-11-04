'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { BlogDataTable } from '@/components/marketing/blog-data-table'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'HBO vs WO Housemates: Two Study Rhythms, One House',
    excerpt:
      'HBO and WO students often share one Dutch house but live different weeks. Contact hours, internships, and study pressure explain where the friction starts.',
    publishDate: '2026-11-04',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'How different daily schedules collide in shared kitchens and hallways.',
      },
      {
        title: 'Exam Week House Rules for Dutch Housemates',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Temporary norms that help when one housemate is in exams and another is not.',
      },
      {
        title: 'Dutch Study Choice: Why Gamma Fields Dominate',
        href: '/blog/dutch-study-choice-gamma-fields',
        description:
          'The wider programme landscape behind who ends up in the same house.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Picture a mixed Dutch student house on a Tuesday morning. One housemate is already gone for a
          project-group session that started at 08:30. Another is at the kitchen table with a reading list and
          nowhere to be until the afternoon. Both are full-time students. They are not living the same week. The
          2026 Nationale Studenten Enquête, run by{' '}
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            Landelijk Centrum Studiekeuze
          </a>{' '}
          and answered by about <strong>248,000</strong> students, found that <strong>31%</strong> of students
          feel too much study pressure, with WO students slightly more likely to say so than HBO students.
          Pressure is rarely visible from the next bedroom, but its rhythm is.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Top-down view of a wooden desk at night with hands writing in a planner beside a laptop, books, glasses, and a cup of coffee"
            priority
          />
          <figcaption>
            Two students can own the same desk habits and still keep completely different calendars.
          </figcaption>
        </figure>

        <h2>Same label, different calendar</h2>

        <p>
          HBO (hoger beroepsonderwijs) and WO (wetenschappelijk onderwijs) bachelors are equivalent in level, but
          they are built differently. According to the national government, an HBO bachelor carries{' '}
          <strong>240</strong> study points over four years, while a WO bachelor carries <strong>180</strong>{' '}
          over three, and a full-time study year is <strong>60</strong> points, or 1,680 hours of study (
          <a
            href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid
          </a>
          ). The day-to-day feel differs too. Utrecht University describes HBO as projects, teamwork, and an
          average of about 25 contact hours a week, and WO as lectures, self-study, and about 16 contact hours (
          <a
            href="https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit"
            target="_blank"
            rel="noreferrer"
          >
            Universiteit Utrecht
          </a>
          ). Those averages vary by programme, but the pattern is real: one house, two clocks.
        </p>

        <BlogDataTable
          columns={[
            { key: 'feature', label: 'Feature' },
            { key: 'hbo', label: 'HBO bachelor' },
            { key: 'wo', label: 'WO bachelor' },
          ]}
          rows={[
            { feature: 'Typical length', hbo: '4 years', wo: '3 years' },
            { feature: 'Study points', hbo: '240', wo: '180' },
            { feature: 'Average contact hours per week', hbo: 'About 25', wo: 'About 16' },
            { feature: 'Internship', hbo: 'Compulsory', wo: 'Often optional' },
            { feature: 'Typical working style', hbo: 'Group projects', wo: 'Self-study and lectures' },
          ]}
          caption="Sources: Rijksoverheid (study points); Universiteit Utrecht, Verschil hbo en universiteit (contact hours, internship, working style). Contact hours are averages and differ per programme."
        />

        <h2>What the 2026 survey says about pressure</h2>

        <p>
          The NSE gives a useful reality check on how these systems feel from the inside. Overall satisfaction with
          the programme is <strong>75%</strong>, with WO students at <strong>82%</strong> and HBO students at{' '}
          <strong>70%</strong>. On workload, <strong>59%</strong> say the pressure is just right and{' '}
          <strong>31%</strong> say it is too high, down from <strong>37%</strong> in 2023. HBO students report too
          much pressure slightly less often than WO students (<strong>30%</strong> versus <strong>34%</strong>
          ). By sector the spread is wider: 47% in education programmes against 24% in economics (
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            LCSK, NSE 2026
          </a>
          ).
        </p>

        <BlogBarChart
          data={[
            { label: 'WO satisfied', value: 82 },
            { label: 'HBO satisfied', value: 70 },
            { label: 'WO pressure too high', value: 34 },
            { label: 'HBO pressure too high', value: 30 },
          ]}
          yLabel="Share of students"
          valueFormat="percent"
          caption="Source: Landelijk Centrum Studiekeuze, Nationale Studenten Enquête 2026. https://lcsk.nl/nieuws/nse2026/"
        />

        <p>
          The takeaway for a shared house is not that one track is harder. It is that the same housemate can look
          relaxed and stressed in the same week, depending on where their deadlines sit.
        </p>

        <h2>Where the two rhythms collide at home</h2>

        <h3>Full timetables versus library days</h3>

        <p>
          A housemate with a packed timetable leaves early and returns tired. One with fewer scheduled hours may
          study from home, which means the kitchen is also their office. Neither pattern is lazy or virtuous. The
          friction appears when daytime noise, calls, and cooking meet someone else&apos;s focus block. The
          boundaries from{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">exam week house rules</Link> work well all year as
          a light rule: say out loud which hours are heads-down hours.
        </p>

        <h3>The internship exit</h3>

        <p>
          Nuffic notes that a typical HBO bachelor includes a compulsory internship of around nine months in the
          third year (
          <a
            href="https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic
          </a>
          ). For a house, that can mean a housemate who is half-present or moves for work placement while their
          room stays rented. Subletting is possible but not automatic: the Kamerbewoners Advies Bureau stresses
          that it is only allowed with the landlord&apos;s permission, and recommends a fixed-term written
          contract and an inventory of the room (
          <a
            href="https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/"
            target="_blank"
            rel="noreferrer"
          >
            KAB
          </a>
          ). Raise it early, before the placement starts, not the week someone packs a bag.
        </p>

        <h3>Graduating at different moments</h3>

        <p>
          A three-year WO bachelor and a four-year HBO bachelor that start together do not finish together. In a
          house of mixed programmes, one person may be writing a thesis while another has just finished first year.
          Treating this as a normal part of the calendar helps: agree on how to handle a vacated room
          before it happens. If rent splits are part of that conversation, the{' '}
          <Link href="/rent-calculator">rent calculator</Link> is a neutral place to test the numbers.
        </p>

        <h2>A note on mixed cities such as Tilburg and Breda</h2>

        <p>
          Cities with both a university and several hogescholen make this mix everyday. Tilburg hosts Tilburg
          University alongside Fontys and Avans, and Breda is home to Avans and Breda University of Applied
          Sciences, so a single corridor can contain both tracks. The{' '}
          <Link href="/tilburg">Tilburg</Link> and <Link href="/breda">Breda</Link> city pages describe the
          local student context. Where the local rule matters is subletting: Tilburg University&apos;s housing
          guide notes that WonenBreburg allows it, while other landlords may not, so always check your own
          contract (
          <a
            href="https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg"
            target="_blank"
            rel="noreferrer"
          >
            Tilburg University
          </a>
          ).
        </p>

        <h2>The calendar swap: a 10-minute house habit</h2>

        <p>
          The simplest tool is also the least dramatic: once a term, everyone shares their next six weeks. Put
          deadlines, exam weeks, and placements on one shared note or in the group chat.
        </p>

        <h3>Do</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Share exam weeks, presentation days, and internship start dates in advance.</li>
          <li>Agree on one quiet window that suits the earliest and latest risers.</li>
          <li>Ask before assuming that a housemate at home is free to talk.</li>
          <li>Plan any sublet or handover conversation well before the placement starts.</li>
        </ul>

        <h3>Don&apos;t</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Compare whose programme is harder. The survey shows pressure varies widely by sector, not just by track.</li>
          <li>Read an empty timetable as an empty day.</li>
          <li>Treat a housemate&apos;s early exit as a snub. It may be an 08:30 project meeting.</li>
          <li>Wait until the week of departure to talk about a vacated room.</li>
        </ul>

        <p>
          For recurring conflicts the group chat setup in{' '}
          <Link href="/blog/group-chats-ground-rules">group chats and ground rules</Link> keeps the calendar swap
          from turning into a debate.
        </p>

        <h2>Why mixed houses are the norm, not the exception</h2>

        <p>
          The programme catalogue is broad. The Studiekeuzedatabase lists <strong>3,312</strong> programmes across{' '}
          <strong>109</strong> institutions, of which <strong>2,002</strong> are bachelor-level and{' '}
          <strong>1,310</strong> are master-level (level inferred from programme data). With that spread, it is
          unusual for housemates to share a programme, never mind a track. The{' '}
          <Link href="/universities">universities directory</Link> shows how wide the landscape is, and
          Domu Match&apos;s <Link href="/about">about page</Link> frames shared living as part of that wider student
          system.
        </p>

        <p className="text-sm text-slate-600">
          Source: Studiekeuzedatabase (LCSK), release 26.3, peildatum 2026-11-04.
        </p>

        <p>
          Different clocks are not a compatibility failure. They are a feature of a diverse higher-education
          system, and a house that talks about its calendars early tends to avoid the quietest kind of conflict:
          the one nobody names.
        </p>

        <h2>Sources</h2>
        <p className="text-sm text-slate-600">
          Landelijk Centrum Studiekeuze. Nationale Studenten Enquête 2026.{' '}
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            https://lcsk.nl/nieuws/nse2026/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Universiteit Utrecht. Verschil hbo en universiteit.{' '}
          <a
            href="https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit"
            target="_blank"
            rel="noreferrer"
          >
            https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksoverheid. Wat is het aantal lesuren en studiepunten in het hoger onderwijs?{' '}
          <a
            href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. Hoger onderwijs (Nederland).{' '}
          <a
            href="https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Kamerbewoners Advies Bureau. Onderverhuur.{' '}
          <a
            href="https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Tilburg University. Op kamers in Tilburg.{' '}
          <a
            href="https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg"
            target="_blank"
            rel="noreferrer"
          >
            https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuzedatabase (LCSK), release 26.3, peildatum 2026-11-04.{' '}
          <a href="https://www.studiekeuzedatabase.nl/" target="_blank" rel="noreferrer">
            https://www.studiekeuzedatabase.nl/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Hbo- en wo-huisgenoten: twee ritmes, één huis',
    excerpt:
      'Hbo- en wo-studenten delen vaak één huis maar leven een andere week. Contacturen, stages en studiedruk verklaren waar de wrijving begint.',
    publishDate: '2026-11-04',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Hoe verschillende dagritmes botsen in gedeelde keukens en gangen.',
      },
      {
        title: 'Tentamenweek-huisregels voor Nederlandse huisgenoten',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Tijdelijke afspraken voor als de ene huisgenoot tentamens heeft en de andere niet.',
      },
      {
        title: 'Studiekeuze in Nederland: waarom gamma zo dominant is',
        href: '/blog/dutch-study-choice-gamma-fields',
        description:
          'Het bredere opleidingslandschap achter wie er in hetzelfde huis belandt.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Stel je een gemengd Nederlands studentenhuis voor op dinsdagochtend. Eén huisgenoot is al weg voor een
          projectgroep die om 08:30 begon. Een ander zit aan de keukentafel met een leeslijst en hoeft pas
          &apos;s middags ergens te zijn. Beiden zijn voltijdstudent. Ze leven niet dezelfde week. De Nationale
          Studenten Enquête 2026 van het{' '}
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            Landelijk Centrum Studiekeuze
          </a>
          , ingevuld door ongeveer <strong>248.000</strong> studenten, laat zien dat <strong>31%</strong> van de
          studenten de studiedruk te hoog vindt, waarbij wo-studenten dat iets vaker zeggen dan hbo-studenten.
          Druk is vanuit de slaapkamer ernaast zelden zichtbaar, maar het ritme wel.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Bovenaanzicht van een houten bureau 's avonds met handen die in een planner schrijven naast laptop, boeken, bril en een kop koffie"
            priority
          />
          <figcaption>
            Twee studenten kunnen dezelfde bureaugewoonten hebben en toch een totaal andere agenda voeren.
          </figcaption>
        </figure>

        <h2>Zelfde label, andere agenda</h2>

        <p>
          Hbo (hoger beroepsonderwijs) en wo (wetenschappelijk onderwijs) zijn qua niveau gelijkwaardig, maar
          anders opgebouwd. Volgens de Rijksoverheid heeft een hbo-bachelor <strong>240</strong> studiepunten
          verdeeld over vier jaar en een wo-bachelor <strong>180</strong> over drie jaar, en een voltijds
          studiejaar is <strong>60</strong> punten, oftewel 1.680 uur studie (
          <a
            href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid
          </a>
          ). Ook het dagelijks gevoel verschilt. De Universiteit Utrecht beschrijft hbo als projecten, teamwerk
          en gemiddeld zo&apos;n 25 contacturen per week, en wo als hoorcolleges, zelfstudie en ongeveer 16
          contacturen (
          <a
            href="https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit"
            target="_blank"
            rel="noreferrer"
          >
            Universiteit Utrecht
          </a>
          ). Die gemiddelden verschillen per opleiding, maar het patroon klopt: één huis, twee klokken.
        </p>

        <BlogDataTable
          columns={[
            { key: 'feature', label: 'Kenmerk' },
            { key: 'hbo', label: 'Hbo-bachelor' },
            { key: 'wo', label: 'Wo-bachelor' },
          ]}
          rows={[
            { feature: 'Gebruikelijke duur', hbo: '4 jaar', wo: '3 jaar' },
            { feature: 'Studiepunten', hbo: '240', wo: '180' },
            { feature: 'Gemiddeld aantal contacturen per week', hbo: 'Ongeveer 25', wo: 'Ongeveer 16' },
            { feature: 'Stage', hbo: 'Verplicht', wo: 'Vaak optioneel' },
            { feature: 'Typische werkvorm', hbo: 'Groepsprojecten', wo: 'Zelfstudie en hoorcolleges' },
          ]}
          caption="Bronnen: Rijksoverheid (studiepunten); Universiteit Utrecht, Verschil hbo en universiteit (contacturen, stage, werkvorm). Contacturen zijn gemiddelden en verschillen per opleiding."
        />

        <h2>Wat de enquête van 2026 zegt over druk</h2>

        <p>
          De NSE is een nuttige toets van hoe deze systemen van binnenuit voelen. De algemene tevredenheid met de
          opleiding is <strong>75%</strong>, met wo-studenten op <strong>82%</strong> en hbo-studenten op{' '}
          <strong>70%</strong>. Over de werkdruk zegt <strong>59%</strong> dat die precies goed is en{' '}
          <strong>31%</strong> dat die te hoog is, tegen <strong>37%</strong> in 2023. Hbo-studenten melden iets
          minder vaak te veel druk dan wo-studenten (<strong>30%</strong> tegenover <strong>34%</strong>). Per
          sector is het verschil groter: 47% bij onderwijsopleidingen tegenover 24% bij economie (
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            LCSK, NSE 2026
          </a>
          ).
        </p>

        <BlogBarChart
          data={[
            { label: 'Wo tevreden', value: 82 },
            { label: 'Hbo tevreden', value: 70 },
            { label: 'Wo druk te hoog', value: 34 },
            { label: 'Hbo druk te hoog', value: 30 },
          ]}
          yLabel="Aandeel studenten"
          valueFormat="percent"
          caption="Bron: Landelijk Centrum Studiekeuze, Nationale Studenten Enquête 2026. https://lcsk.nl/nieuws/nse2026/"
        />

        <p>
          De les voor een gedeeld huis is niet dat het ene traject zwaarder is. Dezelfde huisgenoot kan in
          dezelfde week ontspannen en gestrest lijken, afhankelijk van waar de deadlines liggen.
        </p>

        <h2>Waar de twee ritmes thuis botsen</h2>

        <h3>Volle roosters versus bibliotheekdagen</h3>

        <p>
          Een huisgenoot met een volgepland rooster vertrekt vroeg en komt moe thuis. Iemand met minder
          geroosterde uren studeert misschien thuis, waardoor de keuken ook kantoor is. Geen van beide patronen is
          lui of deugdzaam. De wrijving ontstaat wanneer geluid overdag, belletjes en koken het focusblok van een
          ander kruisen. De afspraken uit{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">tentamenweek-huisregels</Link> werken het hele jaar
          als lichte regel: zeg hardop welke uren focusuren zijn.
        </p>

        <h3>Het stage-vertrek</h3>

        <p>
          Nuffic meldt dat een gangbare hbo-bachelor in het derde jaar een verplichte stage van ongeveer negen
          maanden bevat (
          <a
            href="https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic
          </a>
          ). Voor een huis kan dat betekenen: een huisgenoot die half aanwezig is of voor de stage verhuist terwijl
          de kamer gehuurd blijft. Onderverhuur kan, maar niet automatisch: het Kamerbewoners Advies Bureau
          benadrukt dat het alleen mag met toestemming van de verhuurder en adviseert een schriftelijk contract
          voor bepaalde tijd en een opnamestaat van de kamer (
          <a
            href="https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/"
            target="_blank"
            rel="noreferrer"
          >
            KAB
          </a>
          ). Breng het vroeg ter sprake, voordat de stage begint, niet in de week dat iemand zijn tas pakt.
        </p>

        <h3>Op verschillende momenten afstuderen</h3>

        <p>
          Een driejarige wo-bachelor en een vierjarige hbo-bachelor die samen starten, eindigen niet samen. In een
          huis met gemengde opleidingen schrijft de een misschien een scriptie terwijl een ander net het eerste
          jaar heeft afgerond. Het helpt dit als normaal onderdeel van de kalender te zien en af te spreken hoe
          je met een vrijgekomen kamer omgaat voordat het zover is. Hoort de huurverdeling bij dat gesprek, dan is
          de <Link href="/rent-calculator">huurcalculator</Link> een neutrale plek om de cijfers te testen.
        </p>

        <h2>Een noot over gemengde steden als Tilburg en Breda</h2>

        <p>
          In steden met zowel een universiteit als meerdere hogescholen is deze mix alledaags. Tilburg heeft
          Tilburg University naast Fontys en Avans, en Breda is thuisbasis van Avans en de Breda University of
          Applied Sciences, dus één gang kan beide trajecten bevatten. De stadspagina&apos;s van{' '}
          <Link href="/tilburg">Tilburg</Link> en <Link href="/breda">Breda</Link> beschrijven de lokale
          studentencontext. Lokaal telt vooral onderverhuur: de huisvestingsgids van Tilburg University meldt dat
          WonenBreburg dit toestaat, terwijl andere verhuurders dat misschien niet doen, dus check altijd je eigen
          contract (
          <a
            href="https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg"
            target="_blank"
            rel="noreferrer"
          >
            Tilburg University
          </a>
          ).
        </p>

        <h2>De agenda-ruil: een huisgewoonte van 10 minuten</h2>

        <p>
          Het simpelste hulpmiddel is ook het minst dramatische: eens per periode deelt iedereen de komende zes
          weken. Zet deadlines, tentamenweken en stages in één gedeelde notitie of in de groepsapp.
        </p>

        <h3>Doen</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Deel tentamenweken, presentatiedagen en startdata van stages vooraf.</li>
          <li>Spreek één stil moment af dat past bij de vroegste en de laatste opstaander.</li>
          <li>Vraag eerst voordat je aanneemt dat een huisgenoot die thuis is tijd heeft om te praten.</li>
          <li>Plan een onderhuur- of overdrachtsgesprek ruim voor de stage begint.</li>
        </ul>

        <h3>Niet doen</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Vergelijken wiens opleiding zwaarder is. De enquête laat zien dat druk sterk per sector verschilt, niet alleen per traject.</li>
          <li>Een leeg rooster lezen als een lege dag.</li>
          <li>Een vroeg vertrek zien als een afwijzing. Het kan een projectoverleg van 08:30 zijn.</li>
          <li>Wachten tot de week van vertrek om over een vrijkomende kamer te praten.</li>
        </ul>

        <p>
          Voor terugkerende wrijving houdt de groepsapp-opzet uit{' '}
          <Link href="/blog/group-chats-ground-rules">groepsapps en spelregels</Link> de agenda-ruil uit het
          debat.
        </p>

        <h2>Waarom gemengde huizen de norm zijn</h2>

        <p>
          De opleidingscatalogus is breed. De Studiekeuzedatabase telt <strong>3.312</strong> opleidingen bij{' '}
          <strong>109</strong> instellingen, waarvan <strong>2.002</strong> op bachelorniveau en{' '}
          <strong>1.310</strong> op masterniveau (niveau afgeleid uit opleidingsdata). Bij zo&apos;n spreiding is het
          ongebruikelijk dat huisgenoten dezelfde opleiding delen, laat staan hetzelfde traject. De{' '}
          <Link href="/universities">universiteitengids</Link> laat zien hoe breed het landschap is, en de{' '}
          <Link href="/about">over ons-pagina</Link> van Domu Match plaatst samenwonen binnen dat bredere
          studentensysteem.
        </p>

        <p className="text-sm text-slate-600">
          Bron: Studiekeuzedatabase (LCSK), release 26.3, peildatum 2026-11-04.
        </p>

        <p>
          Verschillende klokken zijn geen compatibiliteitsfout. Ze horen bij een divers hoger-onderwijssysteem, en
          een huis dat vroeg over agenda&apos;s praat, voorkomt vaak het stilste soort conflict: dat waar niemand
          een naam aan geeft.
        </p>

        <h2>Bronnen</h2>
        <p className="text-sm text-slate-600">
          Landelijk Centrum Studiekeuze. Nationale Studenten Enquête 2026.{' '}
          <a href="https://lcsk.nl/nieuws/nse2026/" target="_blank" rel="noreferrer">
            https://lcsk.nl/nieuws/nse2026/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Universiteit Utrecht. Verschil hbo en universiteit.{' '}
          <a
            href="https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit"
            target="_blank"
            rel="noreferrer"
          >
            https://www.uu.nl/bachelors/algemene-informatie/hoe-kies-ik-een-studie/verschil-hbo-en-universiteit
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Rijksoverheid. Wat is het aantal lesuren en studiepunten in het hoger onderwijs?{' '}
          <a
            href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/schooltijden-en-onderwijstijd/hoeveel-lesuren-heb-ik-in-het-hoger-onderwijs
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. Hoger onderwijs (Nederland).{' '}
          <a
            href="https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/onderwijssystemen/nederland/hoger-onderwijs
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Kamerbewoners Advies Bureau. Onderverhuur.{' '}
          <a
            href="https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.kamerbewonersadviesburo.nl/huurrecht/onderverhuur/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Tilburg University. Op kamers in Tilburg.{' '}
          <a
            href="https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg"
            target="_blank"
            rel="noreferrer"
          >
            https://www.tilburguniversity.edu/nl/studenten/snelgids/welkom-nieuwe-student/op-kamers-tilburg
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Studiekeuzedatabase (LCSK), release 26.3, peildatum 2026-11-04.{' '}
          <a href="https://www.studiekeuzedatabase.nl/" target="_blank" rel="noreferrer">
            https://www.studiekeuzedatabase.nl/
          </a>
        </p>
      </div>
    ),
  },
}

export function HboWoHousematesStudyRhythmsArticle() {
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
