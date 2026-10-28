'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

/** Selected via selectHeroImageKey({ category: 'Lifestyle' }); last-4 registry avoided: studentsCollaborating, internationalCampus, studyLateNight, quietRoommate. */
const heroImageKey = 'cityBikeStudent' as const

const content = {
  en: {
    title: 'Wintertijd House Rhythm for Dutch Students',
    excerpt:
      'After the October clock change, Dutch student houses face earlier dark evenings. Reset living-room time, quiet hours, and light routines early.',
    publishDate: '2026-10-28',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'How mismatched sleep schedules create predictable conflict once darkness arrives earlier.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to write short house norms without turning every request into a late-night message war.',
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
          On Sunday 25 October 2026, Dutch clocks jumped back an hour at 03:00. That is not trivia for a
          student house: it is the moment outdoor evening life ends earlier, bike rides home feel darker, and
          the living room suddenly hosts more of the day. The government confirms the switch every last
          Sunday of October (
          <a
            href="https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid, zomertijd / wintertijd
          </a>
          ). Wintertijd is the seasonal milestone most houses forget to renegotiate—until someone is studying
          at 17:30 while someone else wants Netflix at full volume.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Amsterdam canal at dusk with bikes lined along a bridge railing and historic houses reflecting in the water"
            priority
          />
          <figcaption>
            After wintertijd, the commute home is darker and the house absorbs hours that used to happen
            outside.
          </figcaption>
        </figure>

        <h2>Why the clock change is a housemate event</h2>

        <p>
          Chronobiology is blunt: humans are day animals. Morning daylight advances the body clock; bright
          evening light delays it. Leiden University Medical Center chronobiologist Joke Meijer notes that
          short Dutch winters already compress mood and light exposure—and that sleeping through the morning
          light on weekends makes winter days even shorter (
          <a
            href="https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/"
            target="_blank"
            rel="noreferrer"
          >
            LUMC interview with Joke Meijer, 2024
          </a>
          ). In a studentenhuis, that science shows up as logistics: who claims the sofa at 18:00, who needs
          silence for an evening seminar, and who treats the kitchen as a second living room because their
          bedroom is freezing.
        </p>

        <p>
          Sleep friction is already common among young people. CBS reported that in 2022,{' '}
          <strong>22%</strong> of 12- to 25-year-olds had sleep problems in the previous two weeks—up from
          14% in 2017 (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren"
            target="_blank"
            rel="noreferrer"
          >
            CBS / Jeugdmonitor, 2023
          </a>
          ). Shared walls do not invent that trend. They amplify it when dark evenings stretch indoor noise
          and screen light later into the night. The mismatch patterns in{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">night owl vs early lecture conflict</Link> get louder
          once sunset arrives before dinner.
        </p>

        <h2>Three flashpoints after wintertijd</h2>

        <h3>1. Living-room peak hour moves earlier</h3>

        <p>
          Before the switch, 18:00 still felt like late afternoon. After it, 18:00 often feels like night.
          That compresses cooking, studying, gaming, and guests into the same window. Houses that never wrote
          a living-room claim rule discover they need one: a short rotation for TV, headphones-default after
          a set hour, or a study-priority night twice a week. Put it in the group chat once, not as a
          passive-aggressive emoji thread—see{' '}
          <Link href="/blog/group-chats-ground-rules">group chats and ground rules</Link>.
        </p>

        <h3>2. Quiet hours collide with dark-start evenings</h3>

        <p>
          Many informal flats keep quiet hours starting around 23:00. Wintertijd does not change that label,
          but it changes how long people have already been indoors by then. Mid-semester presentations and
          group calls also pile into early evening. Temporary exam norms from{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">exam week house rules</Link> can be borrowed
          lightly for November: kitchen cut-off windows, guest opt-outs on weeknights, and a clear signal
          when someone needs a focus block.
        </p>

        <h3>3. Light becomes a shared resource</h3>

        <p>
          Artificial evening light—especially blue-rich screen light—pushes sleep later just when daylight is
          weakest. Radboud University&apos;s student wellbeing guidance flags winter evenings as a high-risk
          window for blue-light disruption and recommends warmer lighting plus screen wind-downs (
          <a
            href="https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden"
            target="_blank"
            rel="noreferrer"
          >
            Radboud Universiteit, Recharge
          </a>
          ). Student lifestyle educators similarly advise fixed wake times, cooler dark bedrooms, and
          cutting screens about an hour before sleep (
          <a
            href="https://www.studentenleefstijl.nl/slaaphygiene/"
            target="_blank"
            rel="noreferrer"
          >
            Student en Leefstijl, slaaphygiëne
          </a>
          ). In practice: dim the hallway after 22:00, agree that the living-room lamp is warm-white, and
          stop treating every closed-curtain room as a personal nightclub.
        </p>

        <h2>A 20-minute wintertijd house reset</h2>

        <p>Treat the week after the clock change like a mini move-in renegotiation. Agenda:</p>

        <ul>
          <li>
            <strong>Map the new dark window.</strong> Note when it is fully dark midweek. That is your
            conflict peak, not midnight.
          </li>
          <li>
            <strong>Assign living-room priority nights.</strong> Two study-priority evenings, two social
            evenings, one flexible. Write the days, not vibes.
          </li>
          <li>
            <strong>Reset quiet hours in clock time.</strong> Confirm start time after wintertijd so nobody
            argues about &quot;old time&quot; vs phone time.
          </li>
          <li>
            <strong>Agree a light and bike check.</strong> Shared porch light bulbs, reflective bike gear,
            and who buys the warm-white bulb for the kitchen. Darker commutes are a safety topic, not a
            personality quirk—basic renter diligence also belongs on the{' '}
            <Link href="/blog/safety-checklist-for-student-renters">student renter safety checklist</Link>.
          </li>
          <li>
            <strong>Protect morning daylight.</strong> If one housemate routinely sleeps through the short
            light window, the whole house loses morning calm. Soft norms beat lectures: curtains open by
            noon on weekdays unless someone is ill.
          </li>
        </ul>

        <h2>Do&apos;s and don&apos;ts for dark-season co-living</h2>

        <p>
          <strong>Do:</strong> renegotiate once, in writing, for November–January. Borrow structure from
          how houses already talk about chores and guests—predictable beats charismatic.
        </p>
        <p>
          <strong>Do:</strong> separate social gezelligheid from sleep hygiene. A short shared dinner can
          coexist with early quiet if both are scheduled.
        </p>
        <p>
          <strong>Don&apos;t:</strong> treat earlier darkness as proof your housemate &quot;became annoying.&quot;
          The calendar changed; the habits did not update.
        </p>
        <p>
          <strong>Don&apos;t:</strong> solve winter friction only with more parties. Volume is not the same as
          contact, and exhausted mid-semester houses need reclaimable quiet more than themed nights.
        </p>

        <h2>What institutions quietly need from this season</h2>

        <p>
          Universities and hogescholen cannot rewrite sunset. They can still recognise that retention risk
          rises when living environments lose rhythm: missed morning lectures, louder conflict, thinner
          sleep. Programme directories and student-life offices already track study load; household rhythm is
          the missing layer between campus services and private leases. Context for where students study sits
          in the{' '}
          <Link href="/universities">universities directory</Link>; Domu Match&apos;s{' '}
          <Link href="/about">about page</Link> frames shared-living infrastructure as part of that wider
          student system. Practical money tools such as the{' '}
          <Link href="/rent-calculator">rent calculator</Link> matter too—dark-season stress stacks faster
          when energy bills and rent surprise people at once—but the editorial point stays behavioural: after
          wintertijd, houses need a clock-aware contract with themselves.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Rijksoverheid. Waarom wordt de klok 2 keer per jaar verzet?{' '}
          <a
            href="https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland
          </a>
        </p>
        <p className="text-sm text-slate-600">
          LUMC. (2024). Mensen zijn dagdieren die met de lichtknop het hele aardse programma in de war kunnen
          schoppen.{' '}
          <a
            href="https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          CBS. (2023, 8 November). Meer slaapproblemen en psychische klachten onder jongeren.{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Radboud Universiteit. Verminder blauw licht om beter te slapen tijdens de winteravonden.{' '}
          <a
            href="https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Student en Leefstijl. Slaaphygiëne.{' '}
          <a
            href="https://www.studentenleefstijl.nl/slaaphygiene/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studentenleefstijl.nl/slaaphygiene/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Wintertijd-huisritme voor Nederlandse studenten',
    excerpt:
      'Na de oktoberwissel worden avonden eerder donker in studentenhuizen. Heronderhandel woonkamer-tijd, stilte-uren en lichtroutines voordat wrijving vastloopt.',
    publishDate: '2026-10-28',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Nachtuil vs. 8-uur college',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Hoe botsende slaapritmes voorspelbare conflicten geven zodra het eerder donker wordt.',
      },
      {
        title: 'Groepschats en huisafspraken',
        href: '/blog/group-chats-ground-rules',
        description:
          'Korte huisnormen schrijven zonder dat elk verzoek een late-night berichtenoorlog wordt.',
      },
      {
        title: 'Huisregels in tentamenweek',
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
          Op zondag 25 oktober 2026 sprong de klok om 03:00 een uur terug. Voor een studentenhuis is dat geen
          trivia: buitenavonden eindigen eerder, de fietsrit naar huis voelt donkerder, en de woonkamer
          vangt uren op die eerst buiten gebeurden. De overheid bevestigt de wissel op de laatste zondag van
          oktober (
          <a
            href="https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland"
            target="_blank"
            rel="noreferrer"
          >
            Rijksoverheid, zomertijd / wintertijd
          </a>
          ). Wintertijd is het seizoensmoment dat huizen het vaakst vergeten te heronderhandelen—tot iemand
          om 17:30 studeert terwijl iemand anders Netflix op volle volume wil.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Amsterdamse gracht in de schemering met fietsen langs een brugleuning en grachtenpanden die in het water weerspiegelen"
            priority
          />
          <figcaption>
            Na wintertijd is de thuisrit donkerder en absorbeert het huis uren die eerder buiten plaatsvonden.
          </figcaption>
        </figure>

        <h2>Waarom de klokwissel een huisgenoot-event is</h2>

        <p>
          Chronobiologie is bot: mensen zijn dagdieren. Ochtendlicht zet de biologische klok vooruit; fel
          avondlicht vertraagt die. LUMC-chronobioloog Joke Meijer wijst erop dat korte Nederlandse winters
          stemming en lichtblootstelling al comprimeren—en dat uitslapen tot ver na het ochtendlicht de winterdag
          nog korter maakt (
          <a
            href="https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/"
            target="_blank"
            rel="noreferrer"
          >
            LUMC-interview met Joke Meijer, 2024
          </a>
          ). In een studentenhuis wordt die wetenschap logistiek: wie claimt de bank om 18:00, wie heeft stilte
          nodig voor een avondcollege, en wie maakt van de keuken een tweede woonkamer omdat de slaapkamer
          koud is.
        </p>

        <p>
          Slaapwrijving is onder jongeren al gebruikelijk. Het CBS meldde dat in 2022{' '}
          <strong>22%</strong> van de 12- tot 25-jarigen in de voorgaande twee weken slaapproblemen had—tegenover
          14% in 2017 (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren"
            target="_blank"
            rel="noreferrer"
          >
            CBS / Jeugdmonitor, 2023
          </a>
          ). Dunne muren verzinnen die trend niet. Ze versterken hem wanneer donkere avonden indoor lawaai en
          schermlicht langer de nacht in trekken. De mismatch uit{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">nachtuil versus vroeg college</Link> wordt luider zodra
          zonsondergang vóór het avondeten valt.
        </p>

        <h2>Drie flashpoints na wintertijd</h2>

        <h3>1. Spitsuur in de woonkamer schuift naar voren</h3>

        <p>
          Voor de wissel voelde 18:00 nog als late middag. Daarna voelt 18:00 vaak als nacht. Koken, studeren,
          gamen en bezoek belanden in hetzelfde venster. Huizen zonder woonkamerclaim ontdekken dat ze er een
          nodig hebben: een korte rotatie voor tv, koptelefoon als default na een vast uur, of twee
          studie-avonden per week. Zet het één keer in de groepschat—niet als passief-agressieve
          emoji-thread. Zie{' '}
          <Link href="/blog/group-chats-ground-rules">groepschats en huisafspraken</Link>.
        </p>

        <h3>2. Stilte-uren botsen met donker-start avonden</h3>

        <p>
          Veel informele flats beginnen stilte rond 23:00. Wintertijd verandert dat label niet, wel hoe lang
          mensen al binnen zijn. Mid-semester presentaties en groepscalls stapelen ook in de vroege avond.
          Tijdelijke tentamen-normen uit{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">huisregels in tentamenweek</Link> kun je licht
          lenen voor november: keuken-cutoffs, bezoek-opt-outs op doordeweekse avonden, en een duidelijk
          signaal wanneer iemand een focusblok nodig heeft.
        </p>

        <h3>3. Licht wordt een gedeelde hulpbron</h3>

        <p>
          Kunstmatig avondlicht—zeker blauwrijk schermlicht—duwt slaap later, juist wanneer daglicht het
          zwakst is. Radboud Universiteit wijst winteravonden aan als risicovenster voor blauwlichtverstoring
          en adviseert warmer licht plus scherm-afbouw (
          <a
            href="https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden"
            target="_blank"
            rel="noreferrer"
          >
            Radboud Universiteit, Recharge
          </a>
          ). Student en Leefstijl adviseert vaste opstaantijden, koele donkere slaapkamers en schermen ongeveer
          een uur vóór slapen stopzetten (
          <a
            href="https://www.studentenleefstijl.nl/slaaphygiene/"
            target="_blank"
            rel="noreferrer"
          >
            Student en Leefstijl, slaaphygiëne
          </a>
          ). Praktisch: gang dimmen na 22:00, warm-wit lampje in de woonkamer, en geen gesloten-gordijnen-kamer
          behandelen als privé-nachtclub.
        </p>

        <h2>Een wintertijd-huisreset van 20 minuten</h2>

        <p>Behandel de week na de klokwissel als een mini heronderhandeling bij intrek. Agenda:</p>

        <ul>
          <li>
            <strong>Kaart het nieuwe donkere venster.</strong> Noteer wanneer het midweek volledig donker is.
            Dáár zit je conflictpiek, niet om middernacht.
          </li>
          <li>
            <strong>Wijs woonkamer-prioriteitsavonden toe.</strong> Twee studie-avonden, twee sociale avonden,
            één flexibel. Schrijf dagen, geen vibes.
          </li>
          <li>
            <strong>Reset stilte-uren in kloktijd.</strong> Bevestig de starttijd na wintertijd zodat niemand
            over &quot;oude tijd&quot; versus telefoontijd ruziet.
          </li>
          <li>
            <strong>Spreek licht- en fietscheck af.</strong> Gedeelde portierlampen, reflecterende fietsgear,
            en wie de warm-witte keukenlamp koopt. Donkerdere woon-werkverkeer is veiligheid, geen
            persoonlijkheidskwestie—basischeck hoort ook op de{' '}
            <Link href="/blog/safety-checklist-for-student-renters">veiligheidschecklist voor student-huurders</Link>.
          </li>
          <li>
            <strong>Bescherm ochtendlicht.</strong> Als één huisgenoot systematisch door het korte lichtvenster
            slaapt, verliest het hele huis ochtendrust. Zachte normen winnen van preken: gordijnen open vóór
            twaalf op weekdagen, tenzij iemand ziek is.
          </li>
        </ul>

        <h2>Do&apos;s en don&apos;ts voor donker-seizoen co-living</h2>

        <p>
          <strong>Do:</strong> heronderhandel één keer, schriftelijk, voor november–januari. Leen structuur
          van hoe huizen al over klusjes en bezoek praten—voorspelbaar wint van charismatisch.
        </p>
        <p>
          <strong>Do:</strong> scheid sociale gezelligheid van slaaphygiëne. Een kort gedeeld diner kan
          samengaan met vroege stilte als beide gepland zijn.
        </p>
        <p>
          <strong>Don&apos;t:</strong> lees eerder donker af als bewijs dat je huisgenoot &quot;irritant werd.&quot;
          De kalender veranderde; de gewoontes nog niet.
        </p>
        <p>
          <strong>Don&apos;t:</strong> los winterwrijving alleen op met meer feesten. Volume is geen contact, en
          uitgeputte mid-semester huizen hebben herwinbare stilte harder nodig dan themanachten.
        </p>

        <h2>Wat instellingen stilzwijgend van dit seizoen nodig hebben</h2>

        <p>
          Universiteiten en hogescholen kunnen zonsondergang niet herschrijven. Ze kunnen wel erkennen dat
          retentierisico stijgt wanneer woonomgevingen ritme verliezen: gemiste ochtendcolleges, luider
          conflict, dunnere slaap. Programmadirecties en studentenzaken volgen studielast al; huisritme is de
          ontbrekende laag tussen campusservices en privéhuur. Context over waar studenten studeren staat in
          de{' '}
          <Link href="/universities">universiteitsdirectory</Link>; de{' '}
          <Link href="/about">about-pagina</Link> van Domu Match kaderstelt gedeelde wooninfrastructuur als
          deel van dat bredere studentsysteem. Praktische geldtools zoals de{' '}
          <Link href="/rent-calculator">huurcalculator</Link> tellen ook—donker-seizoenstress stapelt sneller
          wanneer energierekening en huur tegelijk verrassen—maar het redactionele punt blijft gedrag: na
          wintertijd heeft een huis een klokbewust contract met zichzelf nodig.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Rijksoverheid. Waarom wordt de klok 2 keer per jaar verzet?{' '}
          <a
            href="https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rijksoverheid.nl/vraag-en-antwoord/zomertijd-wintertijd/klok-verzetten-nederland
          </a>
        </p>
        <p className="text-sm text-slate-600">
          LUMC. (2024). Mensen zijn dagdieren die met de lichtknop het hele aardse programma in de war kunnen
          schoppen.{' '}
          <a
            href="https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.lumc.nl/actueel/2024/mensen-zijn-dagdieren-die-met-de-lichtknop-het-hele-aardse-programma-in-de-war-kunnen-schoppen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          CBS. (2023, 8 november). Meer slaapproblemen en psychische klachten onder jongeren.{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/nieuws/2023/45/meer-slaapproblemen-en-psychische-klachten-onder-jongeren
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Radboud Universiteit. Verminder blauw licht om beter te slapen tijdens de winteravonden.{' '}
          <a
            href="https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden"
            target="_blank"
            rel="noreferrer"
          >
            https://www.ru.nl/diensten/recharge/overzicht/verminder-blauw-licht-om-beter-te-slapen-tijdens-de-winteravonden
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Student en Leefstijl. Slaaphygiëne.{' '}
          <a
            href="https://www.studentenleefstijl.nl/slaaphygiene/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.studentenleefstijl.nl/slaaphygiene/
          </a>
        </p>
      </div>
    ),
  },
}

export function WintertijdDarkEveningsStudentHousesArticle() {
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
