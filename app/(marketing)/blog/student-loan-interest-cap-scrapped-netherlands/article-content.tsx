'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { BlogDataTable } from '@/components/marketing/blog-data-table'
import { useApp } from '@/app/providers'

const sources = [
  {
    label: 'Rijksoverheid. Renteplafond studieleningen duurder en risicovol (22 October 2026).',
    href: 'https://www.rijksoverheid.nl/actueel/nieuws/2026/10/22/renteplafond-studieleningen-duurder-en-risicovol-minister-in-gesprek-met-parlement',
  },
  {
    label: 'ScienceGuide. Kamer stemt in met schrappen renteplafond en wil hbo hervormen (3 November 2026).',
    href: 'https://www.scienceguide.nl/2026/11/kamer-stemt-in-met-schrappen-renteplafond-en-wil-hbo-hervormen/',
  },
  {
    label: 'AD. Definitief geen renteplafond op studieleningen.',
    href: 'https://www.ad.nl/politiek/definitief-geen-renteplafond-op-studieleningen-geld-naar-mboers-en-iets-hogere-beurs~a4a6cf8d/',
  },
  {
    label: 'DUO. Rente voor studenten (rentepercentages 2023 to 2027).',
    href: 'https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp',
  },
  {
    label: 'DUO. Rentepercentages studiefinanciering voor 2026 bekend.',
    href: 'https://www.duo.nl/organisatie/pers/rentepercentages-studiefinanciering-voor-2026-bekend.jsp',
  },
  {
    label: 'DUO. Student finance for citizens of an EU/EEA country, Switzerland or the United Kingdom: eligibility.',
    href: 'https://www.duo.nl/particulier/student-finance-citizens-eu-eer-switzerland-or-uk/eligibility.jsp',
  },
  {
    label: 'OCO Amsterdam. Hoeveel studiefinanciering krijg ik per maand in het hoger onderwijs?',
    href: 'https://ocoamsterdam.nl/vragen/hoeveel-studiefinanciering-krijg-ik-per-maand-in-het-hoger-onderwijs-hbo-en-wo',
  },
  {
    label: 'Dienst Toeslagen. Ik woon op kamers - kan ik huurtoeslag krijgen?',
    href: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/student-op-kamers-huurtoeslag',
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
    title: 'No Student Loan Interest Cap: What To Do Now',
    excerpt:
      'The 2.5% student loan interest cap is gone. See what DUO rates mean for your budget, plus a checklist and a house chat script.',
    publishDate: '2026-11-11',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description: 'The costs students rarely budget for beyond rent.',
      },
      {
        title: 'Roommate Chore Fairness in Dutch Student Houses',
        href: '/blog/roommate-chore-fairness-netherlands',
        description: 'Another way to turn a touchy house topic into a clear agreement.',
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
          On Tuesday 3 November the Tweede Kamer closed a chapter many borrowers had circled in their calendars: the
          promised <strong>2.5% cap</strong> on student loan interest is off the table. A motion to keep it was voted
          down, with the coalition parties D66, VVD and CDA against (
          <a
            href="https://www.scienceguide.nl/2026/11/kamer-stemt-in-met-schrappen-renteplafond-en-wil-hbo-hervormen/"
            target="_blank"
            rel="noreferrer"
          >
            ScienceGuide
          </a>
          ). No cap does not mean your debt doubles overnight. It means the interest rate keeps following the
          market, and the smartest move is to know exactly where you stand.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Modern apartment buildings in a Dutch city, representing the monthly housing costs students balance against their budget"
            priority
          />
          <figcaption>Rent, insurance, groceries, interest: every student budget is a stack of small numbers.</figcaption>
        </figure>

        <h2>What happened, objectively</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>22 October:</strong> Minister Letschert (OCW) said the cap would now cost at least{' '}
            <strong>€160 million</strong> a year, against the <strong>€40 million</strong> reserved in the
            coalition agreement. The long-term interest rate that student loans follow rose from 2.7% to 3.3% (
            <a
              href="https://www.rijksoverheid.nl/actueel/nieuws/2026/10/22/renteplafond-studieleningen-duurder-en-risicovol-minister-in-gesprek-met-parlement"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>
            <strong>3 November:</strong> The Kamer rejected the motion to restore the cap.
          </li>
          <li>
            <strong>What the budget does instead:</strong> The €40 million stays with students. According to the AD,
            most goes to tuition refunds for mbo students who leave early, plus €5 on top of the already planned
            €50 extra for uitwonende basisbeurs from 2028/29 (
            <a
              href="https://www.ad.nl/politiek/definitief-geen-renteplafond-op-studieleningen-geld-naar-mboers-en-iets-hogere-beurs~a4a6cf8d/"
              target="_blank"
              rel="noreferrer"
            >
              AD
            </a>
            ).
          </li>
        </ul>

        <h2>What it means for your wallet</h2>

        <p>
          DUO sets the rate every October. For 2027 it is <strong>2.70%</strong> for the repayment regime most current
          students are on (SF35) and <strong>3.28%</strong> for the smaller SF15 group. In 2026 it was 2.33% and 2.29%.
          The rate is fixed for one year while you study, then for five years once you repay, and interest is
          calculated monthly on your whole debt, including interest already added (
          <a href="https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp" target="_blank" rel="noreferrer">
            DUO
          </a>
          ).
        </p>

        <BlogBarChart
          data={[
            { label: '2023', value: 0.46 },
            { label: '2024', value: 2.56 },
            { label: '2025', value: 2.57 },
            { label: '2026', value: 2.33 },
            { label: '2027', value: 2.7 },
          ]}
          yLabel="DUO rate (SF35)"
          unit="%"
          caption="Source: DUO, Rente voor studenten (rentepercentage for repayment regime SF35). https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp"
        />

        <p>
          Here is the honest maths. In 2027 the gap between the scrapped cap (2.5%) and the real rate (2.70%) is small:
          about €20 a year per €10,000 of debt. What the cap really offered was protection if rates keep climbing.
          Use the table to see how much a rate move changes your yearly interest.
        </p>

        <BlogDataTable
          columns={[
            { key: 'scenario', label: 'Rate scenario' },
            { key: 'a', label: '€10,000 debt' },
            { key: 'b', label: '€15,000 debt' },
          ]}
          rows={[
            { scenario: '2.33% (DUO 2026, SF35)', a: '€233 a year', b: '€350 a year' },
            { scenario: '2.50% (the scrapped cap)', a: '€250 a year', b: '€375 a year' },
            { scenario: '2.70% (DUO 2027, SF35)', a: '€270 a year', b: '€405 a year' },
            { scenario: '3.28% (DUO 2027, SF15)', a: '€328 a year', b: '€492 a year' },
            { scenario: '4.00% (hypothetical)', a: '€400 a year', b: '€600 a year' },
          ]}
          caption="Illustration: debt multiplied by the annual rate. DUO calculates monthly with compounding, so real figures are slightly higher. Rates from DUO."
        />

        <p>
          For scale: the maximum loan of €315.17 a month adds up to roughly €15,100 over four years, before any
          tuition credit (
          <a
            href="https://ocoamsterdam.nl/vragen/hoeveel-studiefinanciering-krijg-ik-per-maand-in-het-hoger-onderwijs-hbo-en-wo"
            target="_blank"
            rel="noreferrer"
          >
            OCO
          </a>
          ). One reassurance: if you graduate within ten years, the prestatiebeurs part of your debt (basisbeurs,
          aanvullende beurs, travel product) becomes a gift, including the interest on it (
          <a
            href="https://www.duo.nl/organisatie/pers/rentepercentages-studiefinanciering-voor-2026-bekend.jsp"
            target="_blank"
            rel="noreferrer"
          >
            DUO
          </a>
          ). Only the loan itself is the part to manage.
        </p>

        <h2>Two audiences, two questions</h2>

        <h3>If you are a Dutch student or have DUO</h3>

        <p>
          The loan is optional, and it is adjustable. Many students borrow the maximum &quot;just in case&quot; and
          then use it for convenience spending. Add up rent, health insurance, groceries and your travel costs, then
          borrow what the gap requires. If you are comparing rooms, the{' '}
          <Link href="/rent-calculator">rent calculator</Link> shows what a monthly rent leaves you. And do not count
          on huurtoeslag for a room: Dienst Toeslagen says you generally need a self-contained home with your own
          kitchen, toilet and shower (
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/student-op-kamers-huurtoeslag"
            target="_blank"
            rel="noreferrer"
          >
            Dienst Toeslagen
          </a>
          ).
        </p>

        <h3>If you are an international student</h3>

        <p>
          This vote may not touch you at all. Student finance from DUO is for Dutch nationals, certain residence
          permit holders, and EU/EEA, Swiss or UK citizens who work in the Netherlands for at least 32 hours a month
          (or 24 on average after six months), or who have lived here five years or more (
          <a
            href="https://www.duo.nl/particulier/student-finance-citizens-eu-eer-switzerland-or-uk/eligibility.jsp"
            target="_blank"
            rel="noreferrer"
          >
            DUO
          </a>
          ). If you are eligible, everything above applies. If not, the lesson still travels: before you take any loan
          at home, check whether its rate is fixed or variable, and ask who sets it.
        </p>

        <h2>How to read policy news without panic</h2>

        <p>
          Headlines about student debt tend to sound bigger than the monthly effect. A quick triage helps. First, ask
          whether the change is already law or only a plan: the extra beurs from 2028/29 is a plan, while the missing
          cap is a decision. Second, ask whether it applies to your repayment regime. Third, convert it into euros a
          month using the table above. If the answer is under the price of a few borrel rounds, note it and move on. If
          it is more, talk to your study adviser or the DUO helpdesk before changing your budget.
        </p>

        <h2>The Dutch cheat-sheet</h2>

        <BlogDataTable
          columns={[
            { key: 'term', label: 'Dutch term' },
            { key: 'meaning', label: 'What it means in practice' },
          ]}
          rows={[
            { term: 'Renteplafond', meaning: 'A ceiling on interest. The 2.5% student one is now scrapped.' },
            { term: 'Rentepercentage', meaning: 'The yearly interest rate DUO announces each October.' },
            { term: 'Studielening', meaning: 'The optional DUO loan that you pay interest on.' },
            { term: 'Prestatiebeurs', meaning: 'Grants that turn into a gift if you graduate within ten years.' },
            { term: 'Terugbetalingsregels', meaning: 'Your repayment regime (SF35 or SF15), visible in Mijn DUO.' },
            { term: 'Mijn DUO', meaning: 'Your personal DUO account with debt, rate and rules.' },
            { term: 'Collegegeldkrediet', meaning: 'A loan for your tuition fee, separate from the monthly loan.' },
            { term: 'Huurtoeslag', meaning: 'Rent benefit. Usually not for rooms with shared facilities.' },
          ]}
          caption="Terms as used by DUO and Dienst Toeslagen."
        />

        <h2>Your 15-minute checklist (screenshot it)</h2>

        <ol className="list-decimal pl-6 space-y-2">
          <li>Log in to Mijn DUO and note your terugbetalingsregels: SF35 or SF15.</li>
          <li>Check your current studieschuld and how it splits between loan and prestatiebeurs.</li>
          <li>Write down fixed monthly costs: rent, health insurance, phone, travel.</li>
          <li>Set your monthly loan to the gap, not the maximum.</li>
          <li>Put the October rate announcement in your calendar every year.</li>
          <li>Note your ten-year diploma deadline so grants can still become a gift.</li>
          <li>Do not assume huurtoeslag for a room with a shared kitchen or toilet.</li>
        </ol>

        <h2>The house chat script</h2>

        <p>Money talk is easier when it is scheduled and low-stakes. Copy, paste, adjust:</p>

        <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-700">
          Hey all, the 2.5% student loan cap got scrapped and DUO rates for 2027 are out. Sunday 20:00 in the kitchen,
          15 minutes? Nobody has to share numbers. Just: do you borrow, and does anyone want to change how we handle
          rent splits or deposits? Tea is on me.
        </blockquote>

        <p>
          Housemates earn, borrow and budget differently, and that is normal. Putting expectations on the table early is
          the same principle behind the{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">costs of a poor housemate match</Link>. If you are still
          choosing where to live, the <Link href="/universities">universities directory</Link> and the{' '}
          <Link href="/about">about page</Link> show how Domu Match thinks about shared living.
        </p>

        <h2>The calm conclusion</h2>

        <p>
          The cap was a promise. Without it, the tool is a habit: look at your rate once a year, borrow to the gap, and
          talk about money before it becomes tension in the hallway.
        </p>

        <h2>Sources</h2>
        <SourceList />
      </div>
    ),
  },
  nl: {
    title: 'Geen renteplafond studielening: wat nu?',
    excerpt:
      'Het renteplafond van 2,5% is geschrapt. Wat betekenen de DUO-rentes voor je budget? Met checklist en appje voor je huisgroep.',
    publishDate: '2026-11-11',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description: 'De kosten waar studenten zelden rekening mee houden naast huur.',
      },
      {
        title: 'Eerlijke klusverdeling in Nederlandse studentenhuizen',
        href: '/blog/roommate-chore-fairness-netherlands',
        description: 'Nog een manier om een gevoelig huisthema om te zetten in een duidelijke afspraak.',
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
          Op dinsdag 3 november sloot de Tweede Kamer een hoofdstuk af waar veel lenende studenten op rekenden: het
          beloofde <strong>renteplafond van 2,5%</strong> op studieleningen gaat niet door. Een motie om het plafond te
          behouden werd verworpen, met D66, VVD en CDA tegen (
          <a
            href="https://www.scienceguide.nl/2026/11/kamer-stemt-in-met-schrappen-renteplafond-en-wil-hbo-hervormen/"
            target="_blank"
            rel="noreferrer"
          >
            ScienceGuide
          </a>
          ). Geen plafond betekent niet dat je schuld ineens verdubbelt. Het betekent dat de rente de markt blijft
          volgen, en dat je het beste precies kunt weten waar je staat.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Moderne flatgebouwen in een Nederlandse stad, als symbool voor de maandelijkse woonlasten die studenten afwegen tegen hun budget"
            priority
          />
          <figcaption>Huur, verzekering, boodschappen, rente: elk studentenbudget is een stapel kleine bedragen.</figcaption>
        </figure>

        <h2>Wat er gebeurde, zakelijk</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>22 oktober:</strong> Minister Letschert (OCW) meldde dat het plafond nu minimaal{' '}
            <strong>€160 miljoen</strong> per jaar zou kosten, tegenover de <strong>€40 miljoen</strong> uit het
            coalitieakkoord. De langetermijnrente waaraan studieleningen gekoppeld zijn, steeg van 2,7% naar 3,3% (
            <a
              href="https://www.rijksoverheid.nl/actueel/nieuws/2026/10/22/renteplafond-studieleningen-duurder-en-risicovol-minister-in-gesprek-met-parlement"
              target="_blank"
              rel="noreferrer"
            >
              Rijksoverheid
            </a>
            ).
          </li>
          <li>
            <strong>3 november:</strong> De Kamer verwierp de motie om het plafond alsnog te herstellen.
          </li>
          <li>
            <strong>Wat er in plaats komt:</strong> De €40 miljoen blijft voor studenten. Volgens het AD gaat het
            grootste deel naar teruggave van lesgeld voor mbo-studenten die voortijdig stoppen, plus €5 bovenop de al
            geplande €50 extra uitwonende basisbeurs vanaf 2028/29 (
            <a
              href="https://www.ad.nl/politiek/definitief-geen-renteplafond-op-studieleningen-geld-naar-mboers-en-iets-hogere-beurs~a4a6cf8d/"
              target="_blank"
              rel="noreferrer"
            >
              AD
            </a>
            ).
          </li>
        </ul>

        <h2>Wat het voor je portemonnee betekent</h2>

        <p>
          DUO stelt de rente elk jaar in oktober vast. Voor 2027 is dat <strong>2,70%</strong> voor de terugbetalingsregels
          waaronder de meeste huidige studenten vallen (SF35) en <strong>3,28%</strong> voor de kleinere SF15-groep. In
          2026 was dat 2,33% en 2,29%. Het percentage staat een jaar vast zolang je studeert, en vijf jaar zodra je
          terugbetaalt. De rente wordt maandelijks berekend over je hele schuld, inclusief de rente die er al bij is
          gekomen (
          <a href="https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp" target="_blank" rel="noreferrer">
            DUO
          </a>
          ).
        </p>

        <BlogBarChart
          data={[
            { label: '2023', value: 0.46 },
            { label: '2024', value: 2.56 },
            { label: '2025', value: 2.57 },
            { label: '2026', value: 2.33 },
            { label: '2027', value: 2.7 },
          ]}
          yLabel="DUO-rente (SF35)"
          unit="%"
          caption="Bron: DUO, Rente voor studenten (rentepercentage terugbetalingsregels SF35). https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp"
        />

        <p>
          De eerlijke rekensom: in 2027 is het verschil tussen het geschrapte plafond (2,5%) en de echte rente (2,70%)
          klein, ongeveer €20 per jaar per €10.000 schuld. Wat het plafond echt bood, was bescherming als de rente
          blijft stijgen. Met de tabel zie je hoeveel een renteverandering uitmaakt voor je jaarlijkse rente.
        </p>

        <BlogDataTable
          columns={[
            { key: 'scenario', label: 'Rentescenario' },
            { key: 'a', label: '€10.000 schuld' },
            { key: 'b', label: '€15.000 schuld' },
          ]}
          rows={[
            { scenario: '2,33% (DUO 2026, SF35)', a: '€233 per jaar', b: '€350 per jaar' },
            { scenario: '2,50% (het geschrapte plafond)', a: '€250 per jaar', b: '€375 per jaar' },
            { scenario: '2,70% (DUO 2027, SF35)', a: '€270 per jaar', b: '€405 per jaar' },
            { scenario: '3,28% (DUO 2027, SF15)', a: '€328 per jaar', b: '€492 per jaar' },
            { scenario: '4,00% (hypothetisch)', a: '€400 per jaar', b: '€600 per jaar' },
          ]}
          caption="Illustratie: schuld maal jaarpercentage. DUO rekent maandelijks met rente op rente, dus de werkelijke bedragen liggen iets hoger. Percentages van DUO."
        />

        <p>
          Ter vergelijking: de maximale lening van €315,17 per maand loopt in vier jaar op tot ongeveer €15.100, nog
          zonder collegegeldkrediet (
          <a
            href="https://ocoamsterdam.nl/vragen/hoeveel-studiefinanciering-krijg-ik-per-maand-in-het-hoger-onderwijs-hbo-en-wo"
            target="_blank"
            rel="noreferrer"
          >
            OCO
          </a>
          ). Een geruststelling: haal je binnen tien jaar je diploma, dan wordt het prestatiebeursdeel van je schuld
          (basisbeurs, aanvullende beurs, reisproduct) een gift, inclusief de rente erover (
          <a
            href="https://www.duo.nl/organisatie/pers/rentepercentages-studiefinanciering-voor-2026-bekend.jsp"
            target="_blank"
            rel="noreferrer"
          >
            DUO
          </a>
          ). Alleen de lening zelf is het deel om te beheren.
        </p>

        <h2>Twee doelgroepen, twee vragen</h2>

        <h3>Als je Nederlandse student bent of DUO hebt</h3>

        <p>
          De lening is optioneel en aan te passen. Het is verleidelijk om het maximum te lenen &quot;voor de zekerheid&quot;. Tel huur, zorgverzekering, boodschappen en reiskosten bij elkaar op en leen wat het gat
          vraagt. Vergelijk je kamers? De <Link href="/rent-calculator">huurcalculator</Link> laat zien wat een
          maandhuur overlaat. En reken niet op huurtoeslag voor een kamer: volgens Dienst Toeslagen heb je in het
          algemeen een zelfstandige woning nodig met eigen keuken, wc en douche (
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/student-op-kamers-huurtoeslag"
            target="_blank"
            rel="noreferrer"
          >
            Dienst Toeslagen
          </a>
          ).
        </p>

        <h3>Als je internationale student bent</h3>

        <p>
          Deze stemming raakt jou misschien helemaal niet. Studiefinanciering van DUO is er voor Nederlanders, bepaalde
          verblijfsvergunninghouders en EU/EER-, Zwitserse of Britse burgers die in Nederland minstens 32 uur per maand
          werken (of gemiddeld 24 na zes maanden), of hier al vijf jaar of langer wonen (
          <a
            href="https://www.duo.nl/particulier/studiefinanciering-burgers-eu-eer-zwitserland-of-vk/voorwaarden.jsp"
            target="_blank"
            rel="noreferrer"
          >
            DUO
          </a>
          ). Kom je in aanmerking, dan geldt alles hierboven. Zo niet, dan blijft de les bruikbaar: check bij elke
          lening in je thuisland of de rente vast of variabel is, en wie hem bepaalt.
        </p>

        <h2>Zo lees je beleidsnieuws zonder paniek</h2>

        <p>
          Koppen over studieschuld klinken groter dan het effect per maand. Een snelle triage helpt. Vraag eerst of de
          wijziging al wet is of nog een plan: de extra beurs vanaf 2028/29 is een plan, het ontbrekende plafond is een
          besluit. Vraag daarna of het voor jouw terugbetalingsregels geldt. Reken het tot slot om naar euro&apos;s per
          maand met de tabel hierboven. Is het minder dan een paar rondjes op de borrel, noteer het en ga door. Is het
          meer, praat dan met je studieadviseur of de DUO-helpdesk voordat je je budget aanpast.
        </p>

        <h2>De Nederlandse spiekbrief</h2>

        <BlogDataTable
          columns={[
            { key: 'term', label: 'Nederlandse term' },
            { key: 'meaning', label: 'Wat het in de praktijk betekent' },
          ]}
          rows={[
            { term: 'Renteplafond', meaning: 'Een bovengrens voor de rente. Het studentenplafond van 2,5% is geschrapt.' },
            { term: 'Rentepercentage', meaning: 'De jaarlijkse rente die DUO elk jaar in oktober bekendmaakt.' },
            { term: 'Studielening', meaning: 'De optionele DUO-lening waarover je rente betaalt.' },
            { term: 'Prestatiebeurs', meaning: 'Beurs die een gift wordt als je binnen tien jaar afstudeert.' },
            { term: 'Terugbetalingsregels', meaning: 'Je terugbetaalregime (SF35 of SF15), zichtbaar in Mijn DUO.' },
            { term: 'Mijn DUO', meaning: 'Je persoonlijke DUO-account met schuld, rente en regels.' },
            { term: 'Collegegeldkrediet', meaning: 'Een lening voor je collegegeld, los van de maandelijkse lening.' },
            { term: 'Huurtoeslag', meaning: 'Tegemoetkoming in de huur. Meestal niet voor kamers met gedeelde voorzieningen.' },
          ]}
          caption="Termen zoals gebruikt door DUO en Dienst Toeslagen."
        />

        <h2>Je checklist van 15 minuten (maak een screenshot)</h2>

        <ol className="list-decimal pl-6 space-y-2">
          <li>Log in op Mijn DUO en noteer je terugbetalingsregels: SF35 of SF15.</li>
          <li>Bekijk je huidige studieschuld en hoe die verdeeld is over lening en prestatiebeurs.</li>
          <li>Schrijf je vaste maandlasten op: huur, zorgverzekering, telefoon, reizen.</li>
          <li>Stel je maandelijkse lening in op het gat, niet op het maximum.</li>
          <li>Zet de renteaankondiging van oktober elk jaar in je agenda.</li>
          <li>Noteer je tienjaarsgrens voor het diploma, zodat beurzen nog een gift kunnen worden.</li>
          <li>Reken niet op huurtoeslag voor een kamer met gedeelde keuken of wc.</li>
        </ol>

        <h2>Het appje voor je huisgroep</h2>

        <p>Geldpraat gaat makkelijker als het gepland en vrijblijvend is. Kopieer, plak, pas aan:</p>

        <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-700">
          Hoi allemaal, het renteplafond van 2,5% op studieleningen is geschrapt en de DUO-rentes voor 2027 zijn bekend.
          Zondag 20:00 in de keuken, 15 minuten? Niemand hoeft bedragen te delen. Alleen: leen je, en wil iemand iets
          veranderen aan hoe we huur of borg regelen? Thee van mij.
        </blockquote>

        <p>
          Huisgenoten verdienen, lenen en budgetteren verschillend, en dat is normaal. Verwachtingen vroeg op tafel
          leggen is hetzelfde principe als achter de{' '}
          <Link href="/blog/hidden-cost-of-wrong-roommate">kosten van een slechte huisgenoot-match</Link>. Zoek je nog
          een plek, dan laten de <Link href="/universities">universiteitenoverzicht</Link> en de{' '}
          <Link href="/about">over ons-pagina</Link> zien hoe Domu Match over samenwonen denkt.
        </p>

        <h2>De rustige conclusie</h2>

        <p>
          Het plafond was een belofte. Zonder plafond is het gereedschap een gewoonte: kijk een keer per jaar naar je
          rente, leen naar het gat en praat over geld voordat het spanning in de gang wordt.
        </p>

        <h2>Bronnen</h2>
        <SourceList />
      </div>
    ),
  },
}

export function StudentLoanInterestCapScrappedArticle() {
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
