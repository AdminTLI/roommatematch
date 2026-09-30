'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Language Gaps With Dutch Housemates',
    excerpt:
      'ResearchNed and Nuffic data show many international students struggle to connect with Dutch peers. In mixed student houses, kitchen Dutch and unspoken norms often matter more than lecture English.',
    publishDate: '2026-09-30',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Housemate Support When Living Away From Home',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'How emotional support expectations differ once students live away from parents.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How houses write short norms without turning every request into a late-night message war.',
      },
      {
        title: 'International Student Housing Rights',
        href: '/blog/international-student-housing-rights-netherlands',
        description:
          'What happens after move-in when contracts and tenant rights need activation.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In academic year 2025-26,{' '}
          <strong>129,764</strong> international degree students studied at publicly funded Dutch universities
          and universities of applied sciences - about <strong>17%</strong> of the total student population (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, International Students in the Netherlands 2026
          </a>
          ). Campus English can look seamless from the outside. Shared kitchens tell a harder story: many
          internationals report good contact with other internationals, while contact with Dutch peers remains the
          weak link.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Group of students sitting around a table with laptops, collaborating on a shared project"
          />
          <figcaption>
            Mixed houses run on everyday talk. When that talk defaults to Dutch without a bridge, the room can feel
            full and still lonely.
          </figcaption>
        </figure>

        <h2>Satisfaction with study is not the same as belonging</h2>

        <p>
          Nuffic&apos;s 2026 overview notes that <strong>76%</strong> of international students are (very) satisfied
          with their studies in the Netherlands, while just over half are satisfied with their social life (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, citing ResearchNed, 2026
          </a>
          ). That split matters for student houses. A flat can host four people who all pass courses and still never
          become a household. Integration is not only a campus orientation problem; it is a language-of-the-corridor
          problem.
        </p>

        <p>
          The sixth Annual International Student Survey, run by ResearchNed for ISO, LSVb, and ESN Netherlands,
          surveyed <strong>698</strong> international students. Student organisations summarised a sharp contact gap:{' '}
          <strong>60%</strong> reported difficulty interacting with Dutch students, and <strong>76%</strong> were
          dissatisfied with the accessibility of student associations (
          <a
            href="https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/"
            target="_blank"
            rel="noreferrer"
          >
            ISO / ResearchNed AISS, 2026
          </a>
          ). ResearchNed&apos;s own summary adds that internationals mainly build strong ties with other
          internationals and want more contact with Dutch students than they get (
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            ResearchNed, 2026
          </a>
          ).
        </p>

        <h2>Why kitchen Dutch still beats lecture English</h2>

        <p>
          English-taught programmes create a misleading cue. At research universities in 2025-26,{' '}
          <strong>53%</strong> of unique bachelor programmes were taught in Dutch and <strong>32%</strong> in English,
          while <strong>71%</strong> of master programmes were English-only (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic / UNL, 2026
          </a>
          ). Outside the classroom, Dutch remains the default for house meetings, joke timing, and the half-sentence
          that decides whose turn it is to buy toilet paper.
        </p>

        <h3>What exclusion looks like at the dinner table</h3>

        <p>
          Coverage of the ResearchNed survey describes a familiar pattern: internationals feel shut out when the
          conversation switches to Dutch, or when Dutch students prefer to work and socialise among themselves (
          <a
            href="https://www.cursor.tue.nl/en/news/2026/maart/week-3/international-students-dont-always-feel-at-home-here"
            target="_blank"
            rel="noreferrer"
          >
            Cursor / HOP summary of ResearchNed, 2026
          </a>
          ). In a student house that pattern is louder than in a lecture hall. There is no facilitator, no slide deck,
          and no timed breakout group. There is only who laughs first at a Dutch meme in the group chat.
        </p>

        <p>
          Dutch society also treats language as a civic marker of belonging. The Sociaal en Cultureel Planbureau notes
          that speaking Dutch and endorsing Dutch cultural practices are among the civic criteria people use when they
          decide who counts as a &quot;real&quot; Nederlander (
          <a
            href="https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden"
            target="_blank"
            rel="noreferrer"
          >
            SCP, Migratie als spiegel van maatschappijbeelden, 2025
          </a>
          ). Housemates rarely cite SCP. They still act on the same shortcut: if you cannot follow the joke, you are
          not fully in the room.
        </p>

        <h2>Wellbeing compounds when help-seeking is also linguistic</h2>

        <p>
          Nuffic&apos;s literature review on the wellbeing of international and refugee-background students groups
          challenges into language, socio-cultural factors, education, health, and practical or financial problems -
          and stresses that those domains reinforce one another (
          <a
            href="https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2026
          </a>
          ). ResearchNed likewise flags limited, costly Dutch courses as a barrier while noting that language skills
          matter for social integration and later work (
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            ResearchNed, 2026
          </a>
          ).
        </p>

        <p>
          That compound effect shows up in small house decisions. Who asks the landlord about the heating? Who
          translates the gemeente letter? Who becomes the unpaid interpreter for every WhatsApp thread? Without an
          explicit language plan, emotional labour drifts to the most bilingual person - or to silence. The same
          dynamic that appears in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            housemate support when living away from home
          </Link>{' '}
          becomes sharper when one person lacks both family nearby and the local language.
        </p>

        <h2>House practices that treat language as infrastructure</h2>

        <p>
          Mixed houses do not need a corporate diversity policy. They need a few boring agreements that make contact
          possible. Patterns that recur in university wellbeing guidance and student surveys include:
        </p>

        <ul>
          <li>
            <strong>Name the default language for house meetings.</strong> English for decisions that bind everyone;
            optional Dutch for side talk, with a one-line recap so nobody votes on a rule they did not hear.
          </li>
          <li>
            <strong>Rotate who posts in the group chat.</strong> If chores, guests, and quiet hours only appear in
            rapid Dutch, the house is running two operating systems. Short bilingual notes beat long English essays
            after the fact. See also{' '}
            <Link href="/blog/group-chats-ground-rules">group chat ground rules</Link>.
          </li>
          <li>
            <strong>Separate friendship from logistics.</strong> Dutch housemates can be warm and still fail at
            inclusion if logistics stay monolingual. Compatibility work starts with routines, as{' '}
            <Link href="/blog/roommate-chore-fairness-netherlands">chore fairness</Link> pieces emphasise - language
            is simply another routine.
          </li>
          <li>
            <strong>Budget for language learning as a household topic.</strong> ResearchNed respondents want
            affordable Dutch courses. Houses cannot invent institutional provision, but they can stop treating
            &quot;why don&apos;t you just learn Dutch&quot; as a moral test and treat it as a calendar and cost
            question.
          </li>
        </ul>

        <p>
          Institutions and municipalities remain the main providers of language support and orientation. The{' '}
          <Link href="/universities">university and programme directory</Link> helps place students in institutional
          context; the{' '}
          <Link href="/about">about page</Link> outlines how Domu Match frames student infrastructure without turning
          every friction into a product pitch. The editorial point stands either way: language is part of the living
          system, not a soft accessory after enrolment.
        </p>

        <h2>What the data imply for the next house meeting</h2>

        <p>
          International degree students are a durable share of Dutch higher education, not a temporary spike. Nuffic
          shows study satisfaction can coexist with thin Dutch networks. ResearchNed shows the contact gap is
          measurable. SCP shows language sits inside wider belonging criteria. For mixed student houses, the practical
          conclusion is narrow: decide how decisions are spoken before resentment decides for you. Belonging is built
          in the same place as the dish roster - out loud, on a schedule, in a language everyone can act on.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Nuffic. (2026). International Students in the Netherlands 2026.{' '}
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ResearchNed. (2026). Leven en leren als internationale student in het Nederlandse hoger onderwijs.{' '}
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ISO. (2026). Niet alleen aantrekken, maar ook goed ontvangen.{' '}
          <a
            href="https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/"
            target="_blank"
            rel="noreferrer"
          >
            https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2026). Hoe verbeteren we het welzijn van internationale studenten?{' '}
          <a
            href="https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Sociaal en Cultureel Planbureau. (2025). Migratie als spiegel van maatschappijbeelden.{' '}
          <a
            href="https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Taalkloven met Nederlandse huisgenoten',
    excerpt:
      'ResearchNed en Nuffic laten zien dat veel internationale studenten moeite hebben contact te maken met Nederlandse peers. In gemengde studentenhuizen telt keuken-Nederlands vaak zwaarder dan college-Engels.',
    publishDate: '2026-09-30',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Steun van huisgenoten als je uit huis woont',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Hoe verwachtingen over emotionele steun verschillen zodra studenten uit huis wonen.',
      },
      {
        title: 'Groepschats en huisafspraken',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe huizen korte normen opschrijven zonder elk verzoek tot een middernachtelijke app-oorlog te maken.',
      },
      {
        title: 'Huisvestingsrechten voor internationale studenten',
        href: '/blog/international-student-housing-rights-netherlands',
        description:
          'Wat er na de verhuizing gebeurt wanneer contracten en huurdersrechten activering nodig hebben.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In studiejaar 2025-26 studeerden{' '}
          <strong>129.764</strong> internationale degree-studenten aan bekostigde universiteiten en hogescholen -
          ongeveer <strong>17%</strong> van de totale studentenpopulatie (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, International Students in the Netherlands 2026
          </a>
          ). Campus-Engels kan van buiten soepel ogen. Gedeelde keukens vertellen een harder verhaal: veel
          internationals hebben goed contact met andere internationals, terwijl contact met Nederlandse peers de
          zwakke schakel blijft.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Groep studenten rond een tafel met laptops, samenwerkend aan een gedeeld project"
          />
          <figcaption>
            Gemengde huizen draaien op alledaags praten. Als dat gesprek standaard Nederlands is zonder brug, kan de
            kamer vol voelen en toch eenzaam.
          </figcaption>
        </figure>

        <h2>Tevredenheid over de studie is niet hetzelfde als erbij horen</h2>

        <p>
          Nuffic&apos;s overzicht uit 2026 noteert dat <strong>76%</strong> van de internationale studenten (zeer)
          tevreden is over hun studie in Nederland, terwijl iets meer dan de helft tevreden is over hun sociale leven (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, met verwijzing naar ResearchNed, 2026
          </a>
          ). Dat verschil telt in studentenhuizen. Een flat kan vier mensen huisvesten die allemaal vakken halen en
          toch geen huishouden vormen. Integratie is niet alleen een introductieweekprobleem; het is een
          taal-van-de-gang-probleem.
        </p>

        <p>
          De zesde Annual International Student Survey van ResearchNed voor ISO, LSVb en ESN Nederland peilde{' '}
          <strong>698</strong> internationale studenten. Studentenorganisaties vatten een scherpe contactkloof samen:{' '}
          <strong>60%</strong> had moeite met interactie met Nederlandse studenten, en <strong>76%</strong> was
          ontevreden over de toegankelijkheid van studentenverenigingen (
          <a
            href="https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/"
            target="_blank"
            rel="noreferrer"
          >
            ISO / ResearchNed AISS, 2026
          </a>
          ). ResearchNed zelf voegt toe dat internationals vooral sterke banden met andere internationals opbouwen en
          meer contact met Nederlandse studenten willen dan ze krijgen (
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            ResearchNed, 2026
          </a>
          ).
        </p>

        <h2>Waarom keuken-Nederlands college-Engels nog steeds verslaat</h2>

        <p>
          Engelstalige opleidingen geven een misleidend signaal. Aan universiteiten was in 2025-26{' '}
          <strong>53%</strong> van de unieke bacheloropleidingen Nederlandstalig en <strong>32%</strong> Engelstalig,
          terwijl <strong>71%</strong> van de masteropleidingen uitsluitend Engels was (
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic / UNL, 2026
          </a>
          ). Buiten de collegezaal blijft Nederlands de standaard voor huisvergaderingen, timing van grappen, en de
          halve zin die bepaalt wie toiletpapier koopt.
        </p>

        <h3>Hoe uitsluiting er aan tafel uitziet</h3>

        <p>
          Berichten over het ResearchNed-onderzoek beschrijven een bekend patroon: internationals voelen zich
          buitengesloten als het gesprek naar het Nederlands schakelt, of als Nederlandse studenten onderling willen
          werken en socializen (
          <a
            href="https://www.cursor.tue.nl/en/news/2026/maart/week-3/international-students-dont-always-feel-at-home-here"
            target="_blank"
            rel="noreferrer"
          >
            Cursor / HOP-samenvatting van ResearchNed, 2026
          </a>
          ). In een studentenhuis klinkt dat harder dan in een collegezaal. Er is geen moderator, geen slides, en geen
          getimede breakout. Er is alleen wie eerst lacht om een Nederlandse meme in de groepschat.
        </p>

        <p>
          De Nederlandse samenleving behandelt taal ook als civiel teken van erbij horen. Het Sociaal en Cultureel
          Planbureau merkt op dat Nederlands spreken en meedoen met Nederlandse culturele praktijken tot de civiele
          criteria horen waarmee mensen bepalen wie als &quot;echte&quot; Nederlander telt (
          <a
            href="https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden"
            target="_blank"
            rel="noreferrer"
          >
            SCP, Migratie als spiegel van maatschappijbeelden, 2025
          </a>
          ). Huisgenoten citeren zelden SCP. Ze handelen wel naar dezelfde snelle regel: als je de grap niet volgt,
          zit je niet volledig in de kamer.
        </p>

        <h2>Welzijn stapelt op als hulp zoeken ook taalkundig is</h2>

        <p>
          Nuffic&apos;s literatuurstudie over welzijn van internationale studenten en studenten met een
          vluchtelingenachtergrond groepeert uitdagingen in taal, sociaal-culturele factoren, onderwijs, gezondheid
          en praktische of financiële problemen - en benadrukt dat die domeinen elkaar versterken (
          <a
            href="https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2026
          </a>
          ). ResearchNed signaleert eveneens beperkte, dure Nederlandse cursussen als drempel, terwijl taalvaardigheid
          telt voor sociale integratie en later werk (
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            ResearchNed, 2026
          </a>
          ).
        </p>

        <p>
          Dat stapel-effect zie je in kleine huisbeslissingen. Wie belt de verhuurder over de verwarming? Wie vertaalt
          de gemeentebrief? Wie wordt de onbetaalde tolk voor elke WhatsApp-thread? Zonder expliciet taalplan verschuift
          emotioneel werk naar de meest tweetalige persoon - of naar stilte. Dezelfde dynamiek die in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            steun van huisgenoten als je uit huis woont
          </Link>{' '}
          voorkomt, wordt scherper wanneer iemand zowel familie dichtbij als de lokale taal mist.
        </p>

        <h2>Huispraktijken die taal als infrastructuur behandelen</h2>

        <p>
          Gemengde huizen hebben geen corporate diversiteitsbeleid nodig. Ze hebben een paar saaie afspraken nodig
          die contact mogelijk maken. Patronen die terugkomen in welzijnsadvies en studentenpeilingen:
        </p>

        <ul>
          <li>
            <strong>Benoem de standaardtaal voor huisvergaderingen.</strong> Engels voor besluiten die iedereen
            binden; optioneel Nederlands voor zijgesprekken, met een éénregelige samenvatting zodat niemand stemt over
            een regel die hij niet hoorde.
          </li>
          <li>
            <strong>Roteer wie in de groepschat post.</strong> Als klusjes, bezoek en stilte-uren alleen in snel
            Nederlands verschijnen, draait het huis op twee besturingssystemen. Korte tweetalige notities verslaan
            lange Engelse essays achteraf. Zie ook{' '}
            <Link href="/blog/group-chats-ground-rules">groepschats en huisafspraken</Link>.
          </li>
          <li>
            <strong>Scheid vriendschap van logistiek.</strong> Nederlandse huisgenoten kunnen warm zijn en toch falen
            in inclusie als logistiek eentalig blijft. Compatibiliteitswerk begint bij routines, zoals{' '}
            <Link href="/blog/roommate-chore-fairness-netherlands">eerlijke klusjesverdeling</Link> benadrukt - taal
            is gewoon een andere routine.
          </li>
          <li>
            <strong>Behandel taalleren als huishoudonderwerp.</strong> ResearchNed-respondenten willen betaalbare
            Nederlandse cursussen. Huizen kunnen institutioneel aanbod niet uitvinden, maar ze kunnen stoppen met
            &quot;leer gewoon Nederlands&quot; als morele test en het als kalender- en kostenvraag behandelen.
          </li>
        </ul>

        <p>
          Instellingen en gemeenten blijven de hoofdleveranciers van taalsteun en oriëntatie. De{' '}
          <Link href="/universities">universiteits- en opleidingsdirectory</Link> helpt studenten in institutionele
          context te plaatsen; de{' '}
          <Link href="/about">about-pagina</Link> schetst hoe Domu Match studenteninfrastructuur kaderstelt zonder
          elke wrijving tot een productpitch te maken. Het redactionele punt blijft hoe dan ook: taal hoort bij het
          woonsysteem, niet bij een zachte bijlage na inschrijving.
        </p>

        <h2>Wat de data betekenen voor de volgende huisvergadering</h2>

        <p>
          Internationale degree-studenten zijn een duurzaam aandeel van het Nederlandse hoger onderwijs, geen
          tijdelijke piek. Nuffic laat zien dat studietevredenheid kan samengaan met dunne Nederlandse netwerken.
          ResearchNed laat zien dat de contactkloof meetbaar is. SCP laat zien dat taal in bredere
          erbij-horen-criteria zit. Voor gemengde studentenhuizen is de praktische conclusie smal: besluit hoe
          besluiten worden uitgesproken voordat wrok het voor je beslist. Erbij horen wordt gebouwd op dezelfde
          plek als het afwasrooster - hardop, op een schema, in een taal waarop iedereen kan handelen.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-600">
          Nuffic. (2026). International Students in the Netherlands 2026.{' '}
          <a
            href="https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/research-facts-and-figures/research/international-students-in-the-netherlands-2026
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ResearchNed. (2026). Leven en leren als internationale student in het Nederlandse hoger onderwijs.{' '}
          <a
            href="https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.researchned.nl/publicatie/leven-en-leren-als-internationale-student-in-het-nederlandse-hoger-onderwijs/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ISO. (2026). Niet alleen aantrekken, maar ook goed ontvangen.{' '}
          <a
            href="https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/"
            target="_blank"
            rel="noreferrer"
          >
            https://iso.nl/2026/03/niet-alleen-aantrekken-maar-ook-goed-ontvangen-internationale-studenten-verdienen-goede-ondersteuning/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2026). Hoe verbeteren we het welzijn van internationale studenten?{' '}
          <a
            href="https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/nieuws/hoe-verbeteren-we-het-welzijn-van-internationale-studenten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Sociaal en Cultureel Planbureau. (2025). Migratie als spiegel van maatschappijbeelden.{' '}
          <a
            href="https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scp.nl/publicaties-scp/2025/04/migratie-als-spiegel-van-maatschappijbeelden
          </a>
        </p>
      </div>
    ),
  },
}

export function InternationalStudentsDutchHousematesLanguageArticle() {
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
