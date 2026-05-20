'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'International Student Housing in the Netherlands: Where Data Meets Integration Risk',
    excerpt:
      'Dutch monitoring data shows a widening gap between students who want a room and students who have one. Here is how those national signals connect to integration, retention, and local institution roles.',
    publishDate: '2026-05-20',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Beyond Beds: Student Housing and Retention',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'A companion piece on how room shortages and mismatch load the same wellbeing and persistence ledger universities already measure.',
      },
      {
        title: 'Universities and cities we track',
        href: '/universities',
        description:
          'Context on how Dutch institutions sit inside different municipal housing regimes and student populations.',
      },
      {
        title: 'How we approach editorial work',
        href: '/about',
        description:
          'Background on Domu Match as a research-led voice on shared living, separate from any product surface.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          When policymakers talk about &quot;internationalisation&quot;, the public debate often jumps to enrolment caps and English-taught programmes. The quieter operational layer is the same for domestic and international students:{' '}
          <strong>whether you can secure stable, affordable housing before teaching weeks begin</strong>. In the Netherlands, that layer is now described in hard numbers, not anecdotes.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt="International student housing Netherlands: graduation caps and gowns symbolising mobility and completion"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Housing friction is an integration variable: it shapes commutes, social access, and how quickly students can anchor in a city.
          </figcaption>
        </figure>

        <h2>What national monitoring now shows</h2>

        <p>
          In September 2025, Dutch public broadcaster NOS reported findings from Kences, the national knowledge centre for student housing, published in the Landelijke Monitor Studentenhuisvesting. The article quoted the monitor&apos;s conclusion that more students are effectively giving up on finding a room because the shortage persists (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The same piece cited a measurable wish-versus-reality gap:{' '}
          <strong>44 percent</strong> of students were living in a rented room, while <strong>49 percent</strong> said they wanted to, compared with <strong>52 percent</strong> actually living out eight years earlier and <strong>59 percent</strong> wanting to at that time (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The underlying government document is published on the national open-data portal linked from that reporting (
          <a
            href="https://open.overheid.nl/documenten/d92d885f-2234-416d-b599-972ac5ef9b4f/file"
            target="_blank"
            rel="noreferrer"
          >
            open.overheid.nl
          </a>
          ).
        </p>

        <p>
          NOS also relayed Kences&apos;s estimate that the shortage stood at roughly <strong>21,000</strong> rooms at the time of publication, with a projected range up to roughly <strong>63,200</strong> by 2032-2033 under stressed supply assumptions (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those figures are national, but they set the boundary conditions inside which every city, including student-heavy places such as Breda and Tilburg, has to operate.
        </p>

        <h3>Why this is not only a &quot;rent&quot; story</h3>

        <p>
          The same NOS article quoted Kences director Jolan de Bie on students who remain at their parents&apos; home: they can miss part of their social-emotional development, and the experience of standing partly outside student life can feed isolation and lower self-image, with network effects that later touch labour-market access (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That framing matters for international students in particular, because many do not have a parental address in the Netherlands at all. If domestic students describe a loss of belonging when they cannot move out, international students often start from a higher baseline of administrative load (registration, insurance, bank identity checks) while facing the same tight room market.
        </p>

        <h2>Graduate decisions: housing as a stated reason to leave</h2>

        <p>
          Nuffic&apos;s mixed-method report on graduates who stay or leave, published in 2023 and summarised on its English news channel, gives a direct bridge between housing and long-term integration outcomes. Among alumni who left the Netherlands after graduation,{' '}
          <strong>37 percent</strong> pointed to not finding proper housing as an important reason, the same share as cited financing life in the country (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). That single statistic does not explain every individual path, but it does justify treating student housing as part of the Netherlands&apos; talent pipeline, not only as a campus services topic.
        </p>

        <p>
          The full PDF report linked from that page contains the underlying questionnaire and methodology for readers who want to audit claims themselves (
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, &quot;Staying after graduation&quot;, 2023
          </a>
          ).
        </p>

        <h2>Local anchoring: how municipalities and institutions route supply</h2>

        <p>
          National percentages still feel abstract on day one of a degree. A concrete illustration is how municipalities publish operational guidance to landlords. The City of Breda explains that owners who rent a room under the national &quot;hospitaregeling&quot; do not need a municipal permit if they live in the home and share facilities, and it explicitly tells landlords seeking student tenants to contact{' '}
          <strong>Avans University of Applied Sciences</strong> and <strong>Breda University of Applied Sciences (BUas)</strong> via their published accommodation mailboxes (
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            Gemeente Breda
          </a>
          ). That sentence is administrative, but it carries a research implication: in several Dutch cities, universities are listed as intake nodes on the same webpage as housing law, which concentrates demand on a narrow set of channels when private listings thin out.
        </p>

        <p>
          Dutch higher-education media have also repeatedly framed discrimination and repeated rejection on the private room market as a barrier for international students (
          <a
            href="https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/"
            target="_blank"
            rel="noreferrer"
          >
            ScienceGuide, 2023
          </a>
          ). Those articles are descriptive rather than experimental, yet they track with the Nuffic finding that housing sits next to financing as a top exit pressure.
        </p>

        <h3>How to read the evidence as a student or practitioner</h3>

        <p>
          Three checks keep this topic honest. First, separate <strong>stock indicators</strong> (how many rooms exist nationally) from <strong>search experience</strong> (how long it takes to secure a contract), because optimising the first does not automatically fix the second. Second, treat wellbeing claims that come from quoted experts in reputable outlets as <strong>hypotheses to monitor</strong>, not as individual predictions. Third, compare cities using local vacancy tools and municipal pages, not only national averages.
        </p>

        <p>
          For practical roommate-fit questions in a scarce market, our earlier reporting walks through how shortages load the same retention ledger as academic factors (
          <Link href="/blog/student-housing-gap-retention-roi">student housing and retention</Link>
          ). For behavioural questions you can ask before signing, see{' '}
          <Link href="/blog/how-to-find-a-great-roommate">how to find a great roommate</Link>. Institution-level context sits in the{' '}
          <Link href="/universities">universities</Link> overview, and our editorial stance on evidence-led housing writing is summarised on the{' '}
          <Link href="/about">about</Link> page.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (n.d.). <em>Kamer verhuren met de hospitaregeling</em>. Retrieved May 20, 2026, from{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, September 3). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved May 20, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023, December 5). <em>This is why international students stay (or leave) after graduating in the Netherlands</em>. Retrieved May 20, 2026, from{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>Staying after graduation</em> (research report PDF). Retrieved May 20, 2026, from{' '}
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ScienceGuide. (2023, January). <em>Internationale studenten ervaren veel afwijzing in Nederland</em>. Retrieved May 20, 2026, from{' '}
          <a
            href="https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title:
      'Internationale studentenhuisvesting in Nederland: waar data en integratierisico elkaar raken',
    excerpt:
      'NOS en Kences cijfers over kamernood, Nuffic-data over vertrek na afstuderen, en wat gemeenten en hogescholen praktisch doen om aanbod en vraag te verbinden.',
    publishDate: '2026-05-20',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Meer dan een bed: huisvesting en retentie',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'Verdieping op hoe tekorten en een verkeerde match dezelfde welzijns- en studiespanning veroorzaken.',
      },
      {
        title: 'Steden en instellingen',
        href: '/universities',
        description:
          'Overzicht van instellingen en context per regio, nuttig om lokale krapte naast landelijke trends te lezen.',
      },
      {
        title: 'Over onze redactionele lijn',
        href: '/about',
        description:
          'Kader over hoe Domu Match evidence-led schrijft over samenwonen, los van productteksten.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Internationale studentenhuisvesting in Nederland wordt vaak benaderd als een inschrijvingsvraagstuk. De meetbare realiteit zit in kamers: wie een contract heeft, wie er een wil, en wat er gebeurt als die twee uiteenlopen. Publieke bronnen op .nl-domeinen geven daar intussen scherpere contouren dan een enkele anecdote.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt="Internationale studentenhuisvesting Nederland: studenten met afstudeerhoeden, symbool voor mobiliteit en studiesucces"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Woonfrictie beïnvloedt integratie: reistijd, netwerk en toegang tot het studentenleven hangen samen met een adres.
          </figcaption>
        </figure>

        <h2>Wat de Landelijke Monitor laat zien</h2>

        <p>
          NOS berichtte op basis van de Landelijke Monitor Studentenhuisvesting van Kences dat steeds meer studenten de hoop op een kamer verliezen. De omroep noemde het contrast tussen wie op kamers woont en wie dat wil: <strong>44 procent</strong> woonde op een kamer, <strong>49 procent</strong> wilde dat, terwijl dat acht jaar eerder <strong>52 procent</strong> tegen <strong>59 procent</strong> was (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Het open-data dossier staat op{' '}
          <a
            href="https://open.overheid.nl/documenten/d92d885f-2234-416d-b599-972ac5ef9b4f/file"
            target="_blank"
            rel="noreferrer"
          >
            open.overheid.nl
          </a>
          . Kences schatte het tekort in dat bericht op circa <strong>21.000</strong> kamers, met een bandbreedte tot circa <strong>63.200</strong> in 2032-2033 (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h3>Waarom dit meer is dan alleen huur</h3>

        <p>
          In hetzelfde NOS-artikel waarschuwt Kences-directeur Jolan de Bie dat thuiswonen sociaal-emotionele ontwikkeling kan beperken en isolatiegevoelens kan versterken als je buiten het studentenleven valt (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Internationale studenten hebben die dynamiek vaak scherper: zonder Nederlands ouderlijk adres is &quot;thuis blijven&quot; geen duurzaam alternatief, terwijl de zoektocht naar een kamer dezelfde krapte raakt.
        </p>

        <h2>Nuffic: huisvesting als vertrekreden</h2>

        <p>
          Uit Nuffics samenvatting van het onderzoek &quot;Staying after graduation&quot; blijkt dat onder afgestudeerden die vertrokken <strong>37 procent</strong> &quot;niet geschikte huisvesting vinden&quot; als belangrijke reden noemde, naast dezelfde mate voor financiering (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). De volledige methodiek staat in het PDF-rapport (
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ).
        </p>

        <h2>Lokale keten: gemeente Breda en instellingen</h2>

        <p>
          Gemeente Breda verwijst verhuurders onder de hospitaregeling expliciet door naar Avans en BUas voor studenthuurders (
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            Gemeente Breda, z.d.
          </a>
          ). Dat maakt zichtbaar hoe onderwijsinstellingen in de praktijk als loket fungeren wanneer marktaanbod krimpt. ScienceGuide heeft discriminatierisico&apos;s op de kamermarkt voor internationale studenten eveneens breed uitgelicht (
          <a
            href="https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/"
            target="_blank"
            rel="noreferrer"
          >
            ScienceGuide, 2023
          </a>
          ).
        </p>

        <h3>Verder lezen op deze site</h3>

        <p>
          Voor het bredere retentiebeeld:{' '}
          <Link href="/blog/student-housing-gap-retention-roi">studentenhuisvesting en retentie</Link>. Voor gedragsvragen vóór het tekenen:{' '}
          <Link href="/blog/how-to-find-a-great-roommate">een fijne huisgenoot vinden</Link>. Context per instelling:{' '}
          <Link href="/universities">universiteiten en hogescholen</Link>. Redactionele kaders:{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (z.d.). <em>Kamer verhuren met de hospitaregeling</em>. Geraadpleegd 20 mei 2026,{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Geraadpleegd 20 mei 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023, 5 december). <em>This is why international students stay (or leave) after graduating in the Netherlands</em>. Geraadpleegd 20 mei 2026,{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023). <em>Staying after graduation</em> (PDF). Geraadpleegd 20 mei 2026,{' '}
          <a
            href="https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/sites/default/files/2023-12/staying-after-graduation.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          ScienceGuide. (2023, januari). <em>Internationale studenten ervaren veel afwijzing in Nederland</em>. Geraadpleegd 20 mei 2026,{' '}
          <a
            href="https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.scienceguide.nl/2023/01/internationale-studenten-ervaren-veel-afwijzing-in-nederland/
          </a>
        </p>
      </div>
    ),
  },
}

export function InternationalStudentHousingNetherlandsArticle() {
  const { locale } = useApp()
  const article = content[locale]

  return (
    <BlogPostLayout
      title={article.title}
      excerpt={article.excerpt}
      publishDate={article.publishDate}
      readTime={article.readTime}
      relatedLinks={article.relatedLinks}
    >
      {article.body()}
    </BlogPostLayout>
  )
}
