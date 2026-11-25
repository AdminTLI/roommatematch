'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { BlogDataTable } from '@/components/marketing/blog-data-table'
import { useApp } from '@/app/providers'

const sources = [
  {
    label: 'NOS. Meer studenten vragen hulp bij geldzaken, zien onderwijsinstellingen (17 November 2026).',
    href: 'https://nos.nl/artikel/2639827-meer-studenten-vragen-hulp-bij-geldzaken-zien-onderwijsinstellingen',
  },
  {
    label: 'Nibud. Meer huishoudens komen moeilijker rond (Geldzaken in de praktijk 2026, 23 June 2026).',
    href: 'https://www.nibud.nl/nieuws/meer-huishoudens-komen-moeilijker-rond/',
  },
  {
    label: 'Rijksoverheid. Waar moet ik aan denken als ik wil overstappen naar een andere zorgverzekeraar?',
    href: 'https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/zorgverzekering/overstappen-zorgverzekeraar',
  },
  {
    label: 'Rijksoverheid. Wanneer betaal ik een eigen risico voor mijn zorg?',
    href: 'https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/zorgverzekering/eigen-risico-zorgverzekering',
  },
  {
    label: 'Staatscourant 2026, 34372. Vaststelling verplicht eigen risico Zvw 2027.',
    href: 'https://zoek.officielebekendmakingen.nl/stcrt-2026-34372.html',
  },
  {
    label: 'Dienst Toeslagen. Hoe hoog mag mijn inkomen zijn voor zorgtoeslag?',
    href: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag',
  },
  {
    label: 'Dienst Toeslagen. Hoeveel zorgtoeslag krijg ik iedere maand uitbetaald?',
    href: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag',
  },
  {
    label: 'Dienst Toeslagen. Het inkomen dat telt voor toeslagen is het toetsingsinkomen.',
    href: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/inkomen/inkomen',
  },
  {
    label: 'SlimmeTGeld. Zorgverzekering 2027: premie, eigen risico en toeslag (13 November 2026).',
    href: 'https://www.slimmetgeld.nl/verzekeringen/zorgverzekering/zorgverzekering-2027-wat-verandert-er-en-wat-betekent-het-voor-u/',
  },
  {
    label: 'Studentenverzekering.nl. Studenten zorgverzekering vergelijken 2027 (comparison site).',
    href: 'https://www.studentenverzekering.nl/zorgverzekering/',
  },
]

function SourceList() {
  return (
    <>
      {sources.map((s) => (
        <p key={s.href} className="text-sm text-slate-600">
          {s.label}{' '}
          <a href={s.href} target="_blank" rel="noreferrer">
            {s.href}
          </a>
        </p>
      ))}
    </>
  )
}

const content = {
  en: {
    title: 'Student Money Stress: Your 2027 Cost Checklist',
    excerpt:
      'More Dutch students ask for money help. Use this 2027 health insurance and zorgtoeslag checklist plus a house chat script.',
    publishDate: '2026-11-25',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'No Student Loan Interest Cap: What To Do Now',
        href: '/blog/student-loan-interest-cap-scrapped-netherlands',
        description: 'The other big money number for students with DUO.',
      },
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description: 'The costs students rarely budget for beyond rent.',
      },
      {
        title: 'Rent Calculator',
        href: '/rent-calculator',
        description: 'Test what a room costs against your monthly budget.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          On 17 November NOS Stories reported that more than twenty mbo, hbo and university institutions see more
          students asking for payment plans, money advice and financial help (
          <a
            href="https://nos.nl/artikel/2639827-meer-studenten-vragen-hulp-bij-geldzaken-zien-onderwijsinstellingen"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          ). The timing matters: the 2027 health insurance prices are out, and the switching window closes on 31
          December. Here is what changed, and a 30-minute plan to get ahead of it.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Hands writing notes on paperwork, representing a student reviewing insurance and budget documents"
            priority
          />
          <figcaption>Thirty minutes with your paperwork now beats a stressful March.</figcaption>
        </figure>

        <h2>What happened, objectively</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Student money stress is rising.</strong> Nibud found that 54% of 18 to 30 year olds struggle to
            make ends meet in 2026, up from 40% in 2024 (
            <a href="https://www.nibud.nl/nieuws/meer-huishoudens-komen-moeilijker-rond/" target="_blank" rel="noreferrer">
              Nibud
            </a>
            ).
          </li>
          <li>
            <strong>Insurers published 2027 premiums</strong> from 12 November. The average basic premium rose from
            about €158 to about €173 a month (
            <a
              href="https://www.slimmetgeld.nl/verzekeringen/zorgverzekering/zorgverzekering-2027-wat-verandert-er-en-wat-betekent-het-voor-u/"
              target="_blank"
              rel="noreferrer"
            >
              SlimmeTGeld
            </a>
            ).
          </li>
          <li>
            <strong>The mandatory eigen risico rises to €400</strong> on 1 January 2027 (
            <a href="https://zoek.officielebekendmakingen.nl/stcrt-2026-34372.html" target="_blank" rel="noreferrer">
              Staatscourant
            </a>
            ).
          </li>
          <li>
            <strong>Zorgtoeslag goes up too:</strong> up to €140 a month for a single person earning up to €30,500,
            fading to zero above €43,017 (
            <a
              href="https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag"
              target="_blank"
              rel="noreferrer"
            >
              Dienst Toeslagen
            </a>
            ).
          </li>
        </ul>

        <BlogBarChart
          data={[
            { label: 'All households 2024', value: 32 },
            { label: 'All households 2026', value: 38 },
            { label: 'Ages 18-30 in 2024', value: 40 },
            { label: 'Ages 18-30 in 2026', value: 54 },
          ]}
          yLabel="Struggle to make ends meet"
          valueFormat="percent"
          caption="Source: Nibud, Geldzaken in de praktijk 2026. https://www.nibud.nl/nieuws/meer-huishoudens-komen-moeilijker-rond/"
        />

        <h2>What it means for your wallet</h2>

        <BlogDataTable
          columns={[
            { key: 'item', label: 'Health cost item' },
            { key: 'y2026', label: '2026' },
            { key: 'y2027', label: '2027' },
          ]}
          rows={[
            { item: 'Average basic premium (per month)', y2026: '€158', y2027: '€173' },
            { item: 'Mandatory eigen risico (per year)', y2026: '€385', y2027: '€400' },
            { item: 'Max zorgtoeslag, single (per month)', y2026: '€129', y2027: '€140' },
            { item: 'Income limit, single (per year)', y2026: '€40,857', y2027: '€43,017' },
          ]}
          caption="Sources: Dienst Toeslagen, Staatscourant 2026-34372, SlimmeTGeld (average premium, rounded)."
        />

        <p>
          The honest maths: the average premium rises by about €15 a month and the maximum zorgtoeslag by about €11. If
          you qualify for the full amount and pick a budget policy (comparison sites list the cheapest from roughly €148
          a month), your net cost can be under €10 a month. If you pay the full premium, the choice of policy matters
          far more than most students think.
        </p>

        <p>
          One trap the NOS report highlights is &quot;achteraf betalen&quot;: buy now, pay later makes spending feel
          frictionless and hard to track. A rule that works is to put every pay-later purchase on the same fixed-cost
          list as rent and premium, so you see the real monthly total before you add the next one.
        </p>

        <h2>Two audiences, two questions</h2>

        <h3>If you are a Dutch student or have DUO</h3>

        <p>
          Your studiefinanciering and student loan do not count as income for zorgtoeslag, but wages from a part-time
          job do (
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/inkomen/inkomen"
            target="_blank"
            rel="noreferrer"
          >
            Dienst Toeslagen
          </a>
          ). Picking up extra shifts over the holidays? Update your income estimate in Mijn toeslagen so you do not owe
          money back later.
        </p>

        <h3>If you are an international student</h3>

        <p>
          Whether Dutch basic insurance is compulsory for you depends on your residence and whether you work here, so
          check with your insurer or the Rijksoverheid before you sign anything. If you are insured and 18 or older, you
          may qualify for zorgtoeslag. If you are not covered by the Dutch system, do not copy a Dutch friend&apos;s
          policy: ask your institution which cover applies to you.
        </p>

        <h2>The Dutch way of talking about money</h2>

        <p>
          The Dutch happily say &quot;even afrekenen&quot; and split a bill to the cent, yet go quiet about income and
          stress. NOS quotes students who skip plans by saying they are busy when the real issue is money. Directness
          about prices is a feature; directness about feelings about prices is still in beta. In a shared house, that
          silence is how a €13 grocery gap becomes a cold war.
        </p>

        <h3>Three habits that lower money friction at home</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>One settle-up day a month.</strong> Collect Tikkies on the same evening instead of drip-feeding
            reminders all month.
          </li>
          <li>
            <strong>A shared basics list with a cap.</strong> Rice, oil, toilet paper and cleaning stuff are shared; snacks
            and oat milk are not.
          </li>
          <li>
            <strong>A low-cost ritual.</strong> A weekly cheap house dinner replaces three expensive nights out and keeps
            the social side alive for the housemate on a tight budget.
          </li>
        </ul>

        <h2>The Dutch cheat-sheet</h2>

        <BlogDataTable
          columns={[
            { key: 'term', label: 'Dutch term' },
            { key: 'meaning', label: 'What it means in practice' },
          ]}
          rows={[
            { term: 'Basisverzekering', meaning: 'The standard health insurance you must have if you fall under the Dutch system.' },
            { term: 'Eigen risico', meaning: 'The first €400 of care in 2027 you pay yourself. GP visits are exempt.' },
            { term: 'Zorgtoeslag', meaning: 'Monthly allowance towards your premium, based on income.' },
            { term: 'Toetsingsinkomen', meaning: 'The income Dienst Toeslagen checks. Wages count, studiefinanciering does not.' },
            { term: 'Voorschot', meaning: 'The advance monthly payment. If your income estimate was too low, you repay.' },
            { term: 'Overstappen', meaning: 'Switching insurer once a year.' },
            { term: 'Betalingsregeling', meaning: 'A payment plan. Insurers and institutions offer them.' },
            { term: 'Studentendecaan', meaning: 'The student counsellor who can point to funds and arrangements.' },
            { term: 'Tikkie', meaning: 'A payment request link. Dutch for "you owe me €4.20".' },
          ]}
          caption="Terms as used by Dutch insurers, Dienst Toeslagen and education institutions."
        />

        <h2>Your 30-minute money reset (screenshot it)</h2>

        <ol className="list-decimal pl-6 space-y-2">
          <li>Open your 2027 polis letter and note the monthly basic premium.</li>
          <li>Compare at the same eigen risico and coverage, then decide to stay or switch.</li>
          <li>
            To switch, sign up with the new insurer before 31 December and it cancels the old one. If you cancel
            yourself, do it by 31 December and take out a new basic policy before 1 February (
            <a
              href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/zorgverzekering/overstappen-zorgverzekeraar"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>Only choose a voluntary eigen risico if you could pay €900 in a bad month. Otherwise ask for it to be spread.</li>
          <li>Estimate your 2027 income (wages only) and update your zorgtoeslag in Mijn toeslagen.</li>
          <li>List fixed costs: rent, premium, phone, travel, energy share.</li>
          <li>Pause &quot;pay later&quot; purchases until the list balances.</li>
          <li>If it still does not balance, book the studentendecaan this week, not in March.</li>
        </ol>

        <h2>The house chat script</h2>

        <p>Money talk is easier when it is scheduled, short and optional. Copy, paste, adjust:</p>

        <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-700">
          Hey all, new year, new insurance prices, and I think everyone&apos;s budget shifts a bit. Sunday 20:00 in the
          kitchen, 15 minutes, no one has to share income. Just: does anyone want to change how we split groceries or
          energy, or do a cheap house dinner once a week? If you cannot join, reply with a thumbs up and a number you are
          comfortable with. Tea is on me.
        </blockquote>

        <p>
          Need to ask your institution for help? Try: &quot;Hello, I am a student in [programme]. I am struggling with
          fixed costs this semester and would like to ask about a payment arrangement or available funds. Could we
          schedule a short conversation?&quot;
        </p>

        <p>
          Housemates earn and spend differently, and early honesty is the same principle behind the{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">costs of a poor housemate match</Link>. Try the{' '}
          <Link href="/rent-calculator">rent calculator</Link> to see what a room leaves in your budget, read the{' '}
          <Link href="/blog/student-loan-interest-cap-scrapped-netherlands">student loan interest guide</Link>, or
          explore the <Link href="/universities">universities directory</Link> and the{' '}
          <Link href="/about">about page</Link> for how Domu Match thinks about shared living.
        </p>

        <h2>How to read the headlines without panic</h2>

        <p>
          A statistic like 54% describes a trend, not your bank balance. Ask three questions: is this a decision or a
          forecast, does it apply to my situation, and what is it in euros per month? If the answer is a few euros, note
          it and move on. If it is more, use the checklist this week while there is still time to switch.
        </p>

        <h2>The calm conclusion</h2>

        <p>
          Money stress grows in silence. Check the numbers once a year, ask for a payment plan early, and talk about
          costs in your house before they turn into tension in the hallway.
        </p>

        <h2>Sources</h2>
        <SourceList />
      </div>
    ),
  },
  nl: {
    title: 'Studenten en geldstress: je kostenchecklist 2027',
    excerpt:
      'Meer studenten vragen hulp bij geldzaken. Gebruik de checklist voor zorgverzekering en zorgtoeslag 2027 plus een appje voor je huisgroep.',
    publishDate: '2026-11-25',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Geen renteplafond studielening: wat nu?',
        href: '/blog/student-loan-interest-cap-scrapped-netherlands',
        description: 'Het andere grote geldgetal voor studenten met DUO.',
      },
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description: 'De kosten waar studenten zelden rekening mee houden naast huur.',
      },
      {
        title: 'Huurcalculator',
        href: '/rent-calculator',
        description: 'Toets wat een kamer kost aan je maandbudget.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Op 17 november meldde NOS Stories dat ruim twintig mbo&apos;s, hbo&apos;s en universiteiten meer studenten zien
          die vragen om betalingsregelingen, geldadvies en financiële hulp (
          <a
            href="https://nos.nl/artikel/2639827-meer-studenten-vragen-hulp-bij-geldzaken-zien-onderwijsinstellingen"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          ). De timing doet ertoe: de zorgpremies voor 2027 zijn bekend en het overstapmoment sluit op 31 december. Dit
          is wat er verandert, met een plan van 30 minuten.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Handen die notities maken op papieren, als symbool voor een student die verzekering en budget doorneemt"
            priority
          />
          <figcaption>Dertig minuten papierwerk nu is beter dan een stressvolle maart.</figcaption>
        </figure>

        <h2>Wat er gebeurde, zakelijk</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Geldstress onder jongeren groeit.</strong> Volgens het Nibud heeft in 2026 54% van de 18- tot
            30-jarigen moeite met rondkomen, tegenover 40% in 2024 (
            <a href="https://www.nibud.nl/nieuws/meer-huishoudens-komen-moeilijker-rond/" target="_blank" rel="noreferrer">
              Nibud
            </a>
            ).
          </li>
          <li>
            <strong>Zorgverzekeraars publiceerden de premies voor 2027</strong> vanaf 12 november. De gemiddelde
            basispremie steeg van ongeveer €158 naar ongeveer €173 per maand (
            <a
              href="https://www.slimmetgeld.nl/verzekeringen/zorgverzekering/zorgverzekering-2027-wat-verandert-er-en-wat-betekent-het-voor-u/"
              target="_blank"
              rel="noreferrer"
            >
              SlimmeTGeld
            </a>
            ).
          </li>
          <li>
            <strong>Het verplicht eigen risico stijgt naar €400</strong> op 1 januari 2027 (
            <a href="https://zoek.officielebekendmakingen.nl/stcrt-2026-34372.html" target="_blank" rel="noreferrer">
              Staatscourant
            </a>
            ).
          </li>
          <li>
            <strong>Ook de zorgtoeslag stijgt:</strong> maximaal €140 per maand voor een alleenstaande met een inkomen
            tot €30.500, aflopend tot nul boven €43.017 (
            <a
              href="https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag"
              target="_blank"
              rel="noreferrer"
            >
              Dienst Toeslagen
            </a>
            ).
          </li>
        </ul>

        <BlogBarChart
          data={[
            { label: 'Alle huishoudens 2024', value: 32 },
            { label: 'Alle huishoudens 2026', value: 38 },
            { label: '18-30 jaar in 2024', value: 40 },
            { label: '18-30 jaar in 2026', value: 54 },
          ]}
          yLabel="Moeite met rondkomen"
          valueFormat="percent"
          caption="Bron: Nibud, Geldzaken in de praktijk 2026. https://www.nibud.nl/nieuws/meer-huishoudens-komen-moeilijker-rond/"
        />

        <h2>Wat het voor je portemonnee betekent</h2>

        <BlogDataTable
          columns={[
            { key: 'item', label: 'Zorgkostenpost' },
            { key: 'y2026', label: '2026' },
            { key: 'y2027', label: '2027' },
          ]}
          rows={[
            { item: 'Gemiddelde basispremie (per maand)', y2026: '€158', y2027: '€173' },
            { item: 'Verplicht eigen risico (per jaar)', y2026: '€385', y2027: '€400' },
            { item: 'Max. zorgtoeslag, alleenstaand (per maand)', y2026: '€129', y2027: '€140' },
            { item: 'Inkomensgrens, alleenstaand (per jaar)', y2026: '€40.857', y2027: '€43.017' },
          ]}
          caption="Bronnen: Dienst Toeslagen, Staatscourant 2026-34372, SlimmeTGeld (gemiddelde premie, afgerond)."
        />

        <p>
          De eerlijke rekensom: de gemiddelde premie stijgt met ongeveer €15 per maand en de maximale zorgtoeslag met
          ongeveer €11. Heb je recht op het volle bedrag en kies je een voordelige polis (vergelijkingssites noemen de
          goedkoopste vanaf circa €148 per maand), dan kan je netto maandlast onder de €10 liggen. Betaal je de volle
          premie, dan telt je polis keuze veel zwaarder dan de meeste studenten denken.
        </p>

        <p>
          Een valkuil die het NOS-verslag noemt is &quot;achteraf betalen&quot;: kopen nu, betalen later maakt uitgeven
          zonder wrijving en lastig bij te houden. Een regel die werkt: zet elke achteraf-aankoop op dezelfde lijst met
          vaste lasten als huur en premie, zodat je het echte maandtotaal ziet voordat je de volgende toevoegt.
        </p>

        <h2>Twee doelgroepen, twee vragen</h2>

        <h3>Als je Nederlandse student bent of DUO hebt</h3>

        <p>
          Je studiefinanciering en studielening tellen niet mee als inkomen voor zorgtoeslag, maar loon uit een bijbaan
          wel (
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/inkomen/inkomen"
            target="_blank"
            rel="noreferrer"
          >
            Dienst Toeslagen
          </a>
          ). Pak je in de feestdagen extra diensten? Pas je inkomensschatting aan in Mijn toeslagen, zodat je later niets
          hoeft terug te betalen.
        </p>

        <h3>Als je internationale student bent</h3>

        <p>
          Of een Nederlandse basisverzekering verplicht is, hangt af van je verblijf en of je hier werkt. Check dat bij
          je verzekeraar of de Rijksoverheid voordat je iets tekent. Ben je verzekerd en 18 of ouder, dan kom je mogelijk
          in aanmerking voor zorgtoeslag. Val je niet onder het Nederlandse stelsel, kopieer dan niet de polis van een
          Nederlandse vriend: vraag je instelling welke dekking voor jou geldt.
        </p>

        <h2>Zo praat Nederland over geld</h2>

        <p>
          Nederlanders zeggen gul &quot;even afrekenen&quot; en splitsen een rekening tot op de cent, maar zwijgen over
          inkomen en stress. NOS laat studenten aan het woord die afspraken afzeggen met &quot;ik heb het druk&quot; terwijl
          het eigenlijk om geld gaat. Directheid over prijzen is een feature; directheid over gevoelens bij prijzen zit
          nog in de bètafase. In een studentenhuis is die stilte hoe een boodschappentekort van €13 een koude oorlog
          wordt.
        </p>

        <h3>Drie gewoontes die geldwrijving thuis verlagen</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Eén afrekendag per maand.</strong> Verzamel Tikkies op dezelfde avond in plaats van de hele maand te
            herinneren.
          </li>
          <li>
            <strong>Een gedeelde basislijst met plafond.</strong> Rijst, olie, wc-papier en schoonmaakspullen zijn
            gezamenlijk; snacks en haverdrink niet.
          </li>
          <li>
            <strong>Een goedkoop ritueel.</strong> Eén keer per week goedkoop samen eten vervangt drie dure avonden uit
            en houdt het sociale leven levend voor de huisgenoot met een krap budget.
          </li>
        </ul>

        <h2>De Nederlandse spiekbrief</h2>

        <BlogDataTable
          columns={[
            { key: 'term', label: 'Nederlandse term' },
            { key: 'meaning', label: 'Wat het in de praktijk betekent' },
          ]}
          rows={[
            { term: 'Basisverzekering', meaning: 'De standaard zorgverzekering die je moet hebben als je onder het Nederlandse stelsel valt.' },
            { term: 'Eigen risico', meaning: 'De eerste €400 zorg in 2027 betaal je zelf. Huisartsbezoek is uitgezonderd.' },
            { term: 'Zorgtoeslag', meaning: 'Maandelijkse tegemoetkoming in je premie, afhankelijk van je inkomen.' },
            { term: 'Toetsingsinkomen', meaning: 'Het inkomen dat Dienst Toeslagen bekijkt. Loon telt mee, studiefinanciering niet.' },
            { term: 'Voorschot', meaning: 'De maandelijkse voorlopige betaling. Was je schatting te laag, dan betaal je terug.' },
            { term: 'Overstappen', meaning: 'Eén keer per jaar van zorgverzekeraar wisselen.' },
            { term: 'Betalingsregeling', meaning: 'Termijnbetaling. Verzekeraars en instellingen bieden die aan.' },
            { term: 'Studentendecaan', meaning: 'De studentbegeleider die wijst op fondsen en regelingen.' },
            { term: 'Tikkie', meaning: 'Een betaalverzoek-link. Nederlands voor "je bent me €4,20 schuldig".' },
          ]}
          caption="Termen zoals gebruikt door Nederlandse verzekeraars, Dienst Toeslagen en onderwijsinstellingen."
        />

        <h2>Je geldreset van 30 minuten (maak een screenshot)</h2>

        <ol className="list-decimal pl-6 space-y-2">
          <li>Open je polisbrief voor 2027 en noteer de maandelijkse basispremie.</li>
          <li>Vergelijk met hetzelfde eigen risico en dezelfde dekking en kies: blijven of overstappen.</li>
          <li>
            Overstappen? Sluit vóór 31 december af bij de nieuwe verzekeraar, die zegt de oude op. Zeg je zelf op, doe
            dat dan uiterlijk 31 december en sluit vóór 1 februari een nieuwe basisverzekering af (
            <a
              href="https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/zorgverzekering/overstappen-zorgverzekeraar"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>Kies alleen een vrijwillig eigen risico als je in een slechte maand €900 kunt betalen. Vraag anders om spreiding.</li>
          <li>Schat je inkomen voor 2027 (alleen loon) en pas je zorgtoeslag aan in Mijn toeslagen.</li>
          <li>Noteer je vaste lasten: huur, premie, telefoon, reizen, energieaandeel.</li>
          <li>Zet &quot;achteraf betalen&quot;-aankopen op pauze tot de lijst klopt.</li>
          <li>Klopt het nog niet? Plan deze week een gesprek met de studentendecaan, niet pas in maart.</li>
        </ol>

        <h2>Het appje voor je huisgroep</h2>

        <p>Geldpraat gaat makkelijker als het gepland, kort en vrijblijvend is. Kopieer, plak, pas aan:</p>

        <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-700">
          Hoi allemaal, nieuw jaar, nieuwe zorgpremies, en ik denk dat ieders budget een beetje verschuift. Zondag 20:00 in
          de keuken, 15 minuten, niemand hoeft inkomen te delen. Alleen: willen we iets veranderen aan hoe we boodschappen
          of energie splitsen, of één keer per week goedkoop samen eten? Kun je niet komen, stuur dan een duimpje en een
          bedrag waar je je prettig bij voelt. Thee van mij.
        </blockquote>

        <p>
          Hulp vragen bij je instelling? Probeer: &quot;Hallo, ik ben student [opleiding]. Ik kom dit semester moeilijk
          rond met mijn vaste lasten en wil graag vragen naar een betalingsregeling of beschikbare fondsen. Kunnen we een
          kort gesprek plannen?&quot;
        </p>

        <p>
          Huisgenoten verdienen en besteden verschillend, en vroege eerlijkheid is hetzelfde principe als achter de{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">kosten van een slechte huisgenoot-match</Link>. Gebruik de{' '}
          <Link href="/rent-calculator">huurcalculator</Link> om te zien wat een kamer van je budget overlaat, lees de{' '}
          <Link href="/blog/student-loan-interest-cap-scrapped-netherlands">gids over rente op studieleningen</Link> of
          bekijk het <Link href="/universities">universiteitenoverzicht</Link> en de{' '}
          <Link href="/about">over ons-pagina</Link> om te zien hoe Domu Match over samenwonen denkt.
        </p>

        <h2>Zo lees je de koppen zonder paniek</h2>

        <p>
          Een cijfer als 54% beschrijft een trend, niet jouw banksaldo. Stel drie vragen: is dit een besluit of een
          verwachting, geldt het voor mijn situatie, en hoeveel is het in euro&apos;s per maand? Is het een paar euro,
          noteer het en ga door. Is het meer, gebruik dan deze week de checklist, zolang je nog kunt overstappen.
        </p>

        <h2>De rustige conclusie</h2>

        <p>
          Geldstress groeit in stilte. Check de cijfers één keer per jaar, vraag vroeg om een betalingsregeling en praat
          over kosten in je huis voordat ze spanning in de gang worden.
        </p>

        <h2>Bronnen</h2>
        <SourceList />
      </div>
    ),
  },
}

export function StudentMoneyStress2027Article() {
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
