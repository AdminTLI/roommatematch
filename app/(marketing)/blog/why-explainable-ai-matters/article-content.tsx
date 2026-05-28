'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Why Explainable AI Matters',
    excerpt:
      'If a system recommends who you should live with, you deserve to understand the reasoning. Explainable AI is the difference between a “black box” score and an outcome you can actually evaluate.',
    publishDate: '2025-11-05',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'A plain-language overview of how compatibility questions translate into recommendations.',
      },
      {
        title: 'Privacy Policy',
        href: '/privacy',
        description:
          'What to look for when a platform uses automated processing and personal data to generate outcomes.',
      },
      {
        title: 'About',
        href: '/about',
        description: 'Background on Domu Match and how the site is structured.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          If a system recommends who you should live with, the most important question is not “who” - it is
          “why”. A roommate match affects your sleep, safety, finances, study routine, and stress levels. When
          the reasoning is hidden, people default to guesswork: “Maybe the algorithm knows something I don’t.”
          Explainable AI exists to prevent exactly that.
        </p>

        <p>
          Explainability matters for two reasons. First, it is practical: it helps you spot mismatches early
          and ask better questions before you commit. Second, it is a governance issue: European rules
          increasingly expect transparency when automated systems influence meaningful decisions. The details
          are technical, but the principle is simple. You should be able to understand what a system is doing
          with your information and how it shaped the outcome.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Abstract visualization of connected data and decision paths"
          />
          <figcaption>
            Explainability turns “because the model said so” into reasons you can evaluate and challenge.
          </figcaption>
        </figure>

        <h2>What is explainable AI, in normal language?</h2>

        <p>
          Explainable AI (often shortened to XAI) refers to methods that make an AI-supported outcome
          understandable to a human. Instead of a black box score, you get a readable explanation such as: the
          factors that contributed, what information was used, what trade-offs were made, and where the system
          is uncertain.
        </p>

        <p>
          In roommate matching, an explanation is useful only if it is specific enough to act on. That
          typically means you can see:
        </p>

        <ul>
          <li>
            <strong>Which dimensions mattered</strong>, such as sleep schedules, guests, cleaning norms,
            communication style, noise expectations, or study rhythm.
          </li>
          <li>
            <strong>What the system inferred</strong> from your answers (and what it did not).
          </li>
          <li>
            <strong>What drove the match</strong>, for example shared quiet hours rather than “similar
            personality”.
          </li>
          <li>
            <strong>Potential friction points</strong> so you can discuss them early.
          </li>
        </ul>

        <p>
          Done well, transparency does not promise a perfect outcome. It gives you a clearer map of the risks.
        </p>

        <h2>Why Europe is pushing for transparency</h2>

        <p>
          European regulation is moving in a broadly human-centred direction: people should not be surprised
          by AI use, and systems should not be unaccountable. Two frameworks matter most in day-to-day terms.
        </p>

        <p>
          The{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noreferrer">
            EU AI Act (Regulation (EU) 2024/1689)
          </a>{' '}
          sets rules for AI systems, including transparency obligations for certain uses and risk management
          for higher-risk categories. Separately, the GDPR governs how personal data is processed, including
          automated decision-making.
        </p>

        <p>
          Even when a product is not “high risk” under the AI Act, explainability is still part of responsible
          design: if you cannot explain a recommendation, you cannot meaningfully debug it, audit it, or help
          users correct it.
        </p>

        <h2>GDPR and your rights around automated processing</h2>

        <p>
          GDPR Article 22 is often summarised as protection against being subject to certain decisions made
          solely by automated processing when they have legal or similarly significant effects. In practice,
          you should expect platforms to be clear about:
        </p>

        <ul>
          <li>Whether automated processing is used and what it is used for.</li>
          <li>What data categories feed into the outcome.</li>
          <li>How to correct inputs, withdraw consent where relevant, or request human review.</li>
        </ul>

        <p>
          If you want a quick grounding point, start with the official legal texts and then compare claims a
          platform makes with what it actually explains in the interface and policies.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Data dashboard showing simplified decision signals"
          />
          <figcaption>
            In a healthy system, data is not a mystery ingredient. You can see what is used and why it
            matters.
          </figcaption>
        </figure>

        <h2>What explainability changes for a student, practically</h2>

        <p>A roommate platform cannot guarantee chemistry. But explainability can make the process less fragile.</p>

        <ul>
          <li>
            <strong>It makes you faster at screening</strong>. If a match is driven by quiet weekdays, you
            immediately know what to verify in conversation.
          </li>
          <li>
            <strong>It helps you spot category errors</strong>. If the system misunderstood your “social”
            answer, you can correct it before it snowballs.
          </li>
          <li>
            <strong>It reduces false confidence</strong>. Black-box scores feel authoritative even when the
            underlying inputs are thin.
          </li>
          <li>
            <strong>It improves conversations</strong>. You can discuss specifics (quiet hours, guests, chores)
            instead of vague labels like “easygoing”.
          </li>
        </ul>

        <h2>What to be sceptical of</h2>

        <p>Some “explanations” are marketing rather than information. Watch for these red flags:</p>

        <ul>
          <li>
            <strong>Overly generic reasons</strong>, like “you are compatible”, without naming what actually
            aligned.
          </li>
          <li>
            <strong>Explanations that cannot be contested</strong>, for example no way to correct answers or
            priorities.
          </li>
          <li>
            <strong>Hidden inputs</strong>, where the platform will not tell you what data was used.
          </li>
          <li>
            <strong>Certainty language</strong>, like “perfect match”, that discourages critical thinking.
          </li>
        </ul>

        <p>
          If you want a concrete grounding exercise, compare this with classic roommate conflict domains:
          chores, noise, guests, and communication. A useful explanation connects to those real-life topics.
        </p>

        <p>
          For practical examples of how specific habits create (or prevent) friction, see{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Why “I’m Clean” Is a Lie</Link> and{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">Night Owl vs. 8 A.M. Lecture</Link>.
        </p>

        <h2>A short checklist before you trust a recommendation</h2>

        <p>If you are using any matching feature, you can ask a platform these questions:</p>

        <ul>
          <li>What are the top reasons this match was recommended?</li>
          <li>Can I see which answers drove the outcome?</li>
          <li>Can I adjust priorities and see the impact?</li>
          <li>Can I correct mistakes and request review if something looks wrong?</li>
          <li>Is there a clear explanation of what data is used, and what is not used?</li>
        </ul>

        <h2>Conclusion</h2>

        <p>
          Explainable AI is not a buzzword. It is the difference between being managed by a score and being
          supported by information. When you can see the reasoning, you can question it, correct it, and use it
          to make a decision that still belongs to you.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          European Union. (2024). <em>Regulation (EU) 2024/1689 (Artificial Intelligence Act)</em>.{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noreferrer">
            https://eur-lex.europa.eu/eli/reg/2024/1689/oj
          </a>
        </p>
        <p className="text-sm text-slate-300">
          European Parliament and Council. (2016). <em>Regulation (EU) 2016/679 (GDPR)</em>.{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noreferrer">
            https://eur-lex.europa.eu/eli/reg/2016/679/oj
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Waarom uitlegbare AI ertoe doet',
    excerpt:
      'Als een systeem adviseert met wie je gaat samenwonen, wil je het “waarom” kunnen zien. Uitlegbare AI maakt van een ondoorzichtige score een afweging die je zelf kunt beoordelen.',
    publishDate: '2025-11-05',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description:
          'Een overzicht in gewone taal van hoe vragen en voorkeuren leiden tot een aanbeveling.',
      },
      {
        title: 'Privacybeleid',
        href: '/privacy',
        description:
          'Hoe persoonsgegevens worden verwerkt, en welke vragen je altijd mag stellen bij automatische systemen.',
      },
      {
        title: 'Over Domu Match',
        href: '/about',
        description: 'Achtergrond over Domu Match en de opbouw van de site.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Als een systeem adviseert met wie je gaat samenwonen, is de belangrijkste vraag niet “met wie” maar
          “waarom”. Een roommate match raakt je slaap, veiligheid, geld, studieritme en stress. Als de
          redenering verborgen blijft, ga je gokken: “Misschien weet het algoritme meer dan ik.” Uitlegbare AI
          probeert precies dat te voorkomen.
        </p>

        <p>
          Uitlegbaarheid is praktisch én bestuurlijk belangrijk. Praktisch, omdat je sneller mismatch-signalen
          ziet en betere vragen stelt vóórdat je ergens instapt. Bestuurlijk, omdat Europa steeds vaker
          transparantie verwacht wanneer automatische systemen invloed hebben op betekenisvolle keuzes. Het is
          technisch, maar het principe is simpel: jij moet kunnen begrijpen wat er met je informatie gebeurt en
          hoe dat de uitkomst heeft gevormd.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Abstracte visualisatie van verbonden data en beslispaden"
          />
          <figcaption>
            Uitlegbaarheid maakt van “omdat het model het zegt” redenen die je kunt beoordelen en bevragen.
          </figcaption>
        </figure>

        <h2>Wat is uitlegbare AI, in gewone taal?</h2>

        <p>
          Uitlegbare AI (Explainable AI, vaak XAI) zijn methoden die een AI-ondersteunde uitkomst begrijpelijk
          maken voor mensen. In plaats van een black box-score krijg je uitleg zoals: welke factoren bijdroegen,
          welke informatie is gebruikt, welke afwegingen zijn gemaakt en waar het systeem onzeker is.
        </p>

        <p>Bij roommate matching is uitleg pas nuttig als ze concreet genoeg is om iets mee te doen. Denk aan:</p>

        <ul>
          <li>
            <strong>Welke dimensies meetellen</strong>, zoals slaap, logees, schoonmaak, communicatie, geluid en
            studieritme.
          </li>
          <li>
            <strong>Wat het systeem afleidt</strong> uit je antwoorden (en wat niet).
          </li>
          <li>
            <strong>Wat de match droeg</strong>, bijvoorbeeld gedeelde stilte-uren in plaats van “zelfde
            persoonlijkheid”.
          </li>
          <li>
            <strong>Mogelijke frictiepunten</strong> die je vroeg kunt bespreken.
          </li>
        </ul>

        <p>Goede uitleg belooft geen perfecte uitkomst. Het geeft je een kaart van de risico’s.</p>

        <h2>Waarom Europa transparantie steeds serieuzer neemt</h2>

        <p>
          Europese regels bewegen in een mensgerichte richting: je moet niet verrast worden door AI-gebruik, en
          systemen mogen niet oncontroleerbaar zijn. Twee kaders zijn in de praktijk het belangrijkst.
        </p>

        <p>
          De{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noreferrer">
            EU AI-verordening (AI Act, Verordening (EU) 2024/1689)
          </a>{' '}
          regelt AI-systemen en kent transparantieplichten voor bepaalde toepassingen, met zwaardere eisen voor
          hogere risicocategorieën. Daarnaast regelt de AVG (GDPR) hoe persoonsgegevens worden verwerkt, inclusief
          automatische besluitvorming.
        </p>

        <p>
          Ook als iets niet “hoog-risico” is onder de AI Act, hoort uitlegbaarheid bij verantwoord ontwerp: als
          je een aanbeveling niet kunt uitleggen, kun je haar niet goed debuggen, auditen of laten corrigeren.
        </p>

        <h2>AVG en je rechten rond automatische verwerking</h2>

        <p>
          Artikel 22 van de AVG wordt vaak samengevat als bescherming tegen bepaalde besluiten die uitsluitend
          automatisch worden genomen en die juridische of vergelijkbare grote impact hebben. In de praktijk mag je
          van platforms verwachten dat ze helder zijn over:
        </p>

        <ul>
          <li>Of automatische verwerking wordt gebruikt, en waarvoor precies.</li>
          <li>Welke categorieën gegevens meetellen.</li>
          <li>Hoe je inputs corrigeert, toestemming intrekt waar relevant, of menselijke review aanvraagt.</li>
        </ul>

        <p>
          Als snelle reality check kun je de officiële teksten erbij pakken en vervolgens kijken of een platform
          in de interface en in het beleid daadwerkelijk uitlegt wat het claimt.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Dashboard met vereenvoudigde signalen die een beslissing beïnvloeden"
          />
          <figcaption>
            In een gezond systeem zijn data geen geheim ingrediënt. Je ziet wat gebruikt wordt en waarom.
          </figcaption>
        </figure>

        <h2>Wat uitlegbaarheid voor studenten verandert</h2>

        <p>Een platform kan geen klik garanderen, maar uitlegbaarheid maakt het proces minder kwetsbaar.</p>

        <ul>
          <li>
            <strong>Sneller screenen</strong>: als de match vooral draait om stilte-uren, weet je direct wat je
            moet uitvragen.
          </li>
          <li>
            <strong>Category errors zien</strong>: als het systeem je antwoord verkeerd begreep, kun je het
            aanpassen vóórdat het verder doorwerkt.
          </li>
          <li>
            <strong>Minder schijnzekerheid</strong>: een black box-score voelt autoritair, zelfs als de data dun
            is.
          </li>
          <li>
            <strong>Betere gesprekken</strong>: je praat over gedrag in plaats van vage labels.\n+          </li>
        </ul>

        <h2>Waar je sceptisch op mag zijn</h2>

        <p>Sommige “uitleg” is eigenlijk marketing. Let op deze rode vlaggen:</p>

        <ul>
          <li>
            <strong>Algemene redenen</strong>, zoals “jullie passen”, zonder te zeggen waarop.
          </li>
          <li>
            <strong>Uitleg die je niet kunt corrigeren</strong>, bijvoorbeeld geen manier om antwoorden of
            prioriteiten aan te passen.
          </li>
          <li>
            <strong>Verborgen inputs</strong>, waarbij je niet te horen krijgt welke data meetelt.
          </li>
          <li>
            <strong>Schijnzekerheid</strong>, zoals “perfecte match”, die kritisch denken afremt.
          </li>
        </ul>

        <p>
          Als anker kun je de klassieke roommate-conflicten erbij pakken: afwas, geluid, logees en communicatie.
          Een bruikbare uitleg sluit daarop aan.
        </p>

        <p>
          Voor voorbeelden van hoe concreet gedrag wél of niet botst, zie{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Waarom “ik ben netjes” weinig zegt</Link> en{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">Nachtbraker vs. 8‑uurcollege</Link>.
        </p>

        <h2>Checklist: vóórdat je een aanbeveling vertrouwt</h2>

        <p>Je kunt elke matchingfunctie langs deze vragen leggen:</p>

        <ul>
          <li>Wat zijn de belangrijkste redenen voor deze match?</li>
          <li>Welke antwoorden hebben de uitkomst het meest beïnvloed?</li>
          <li>Kan ik prioriteiten aanpassen en het effect zien?</li>
          <li>Kan ik fouten corrigeren en review aanvragen als iets niet klopt?</li>
          <li>Is helder welke data wel, en welke data niet, wordt gebruikt?</li>
        </ul>

        <h2>Conclusie</h2>

        <p>
          Uitlegbare AI is geen buzzword. Het is het verschil tussen gestuurd worden door een score en geholpen
          worden door informatie. Als je de redenering kunt zien, kun je die bevragen, corrigeren en gebruiken om
          een keuze te maken die van jou blijft.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          Europese Unie. (2024). <em>Verordening (EU) 2024/1689 (AI Act)</em>.{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noreferrer">
            https://eur-lex.europa.eu/eli/reg/2024/1689/oj
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Europese Unie. (2016). <em>Verordening (EU) 2016/679 (AVG/GDPR)</em>.{' '}
          <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noreferrer">
            https://eur-lex.europa.eu/eli/reg/2016/679/oj
          </a>
        </p>
      </div>
    ),
  },
}

export function ExplainableAIArticle() {
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
