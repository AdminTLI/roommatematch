'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Why Explainable AI Matters',
    excerpt: 'Understanding your matches builds trust and better decisions. Learn how transparency in AI matching aligns with EU regulations and protects your rights.',
    publishDate: '2025-11-05',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description: 'Learn about our transparent matching process and how we explain compatibility scores.'
      },
      {
        title: 'About Our Approach',
        href: '/about',
        description: 'Discover our commitment to transparency and science-driven matching.'
      },
      {
        title: 'View Your Matches',
        href: '/matches',
        description: 'See how we explain your compatibility with each potential roommate.'
      }
    ],
    ctaTitle: 'Experience Transparent Matching',
    ctaDescription: "See exactly why you're compatible with each match. Our explainable AI shows you the factors behind every recommendation.",
    ctaHref: '/auth/sign-up',
    ctaText: 'Get Started',
    body: () => (
      <div className="space-y-8">
        <p className="text-lg text-brand-muted leading-relaxed">
          When an algorithm decides who you should live with, shouldn't you understand why? As artificial intelligence becomes increasingly integrated into housing, admissions, and employment decisions, transparency has moved from academic debate to legal requirement.
        </p>

        <p>
          The European Union's AI Act, fully in force since 2024, is the world's first comprehensive AI regulation. For students in the Netherlands using AI-powered platforms to find roommates, this legislation directly protects your right to understand, question, and control algorithmic decisions that affect your housing situation.
        </p>

        <h2>What Is Explainable AI?</h2>

        <p>
          Explainable AI (XAI) refers to systems that can provide clear, understandable reasons for their recommendations. Rather than operating as "black boxes," explainable systems reveal the factors, weights, and logic behind their outputs.
        </p>

        <p>In roommate matching this means you can see:</p>

        <ul>
          <li>Which compatibility factors contributed most to a match</li>
          <li>How lifestyle, academic, and personality preferences were weighted</li>
          <li>Why some matches scored higher than others</li>
          <li>Where complementary traits helped create a pairing</li>
          <li>Potential friction points you should discuss with a match</li>
        </ul>

        <h2>The EU AI Act: Raising the Bar for Transparency</h2>

        <p>
          The EU AI Act establishes a risk-based framework for AI. Even if roommate matching is not classified as high risk, the Act's principles apply: users must be informed when AI is used, systems must be explainable, and humans must retain oversight.
        </p>

        <h3>Key Requirements for Matching Platforms</h3>

        <ul>
          <li><strong>Transparency:</strong> Users must know they're interacting with AI and understand its scope.</li>
          <li><strong>Human oversight:</strong> Critical decisions require human review and the ability to override recommendations.</li>
          <li><strong>Accuracy:</strong> Systems must monitor for errors and provide mechanisms to correct them.</li>
          <li><strong>User rights:</strong> Individuals can request explanations and contest recommendations.</li>
        </ul>

        <p>
          The Netherlands backs these requirements with its own "human-centric AI" strategy. Dutch regulators emphasize accountability, fairness, and explainability in all AI deployments.
        </p>

        <h2>GDPR Safeguards Your Algorithmic Rights</h2>

        <p>
          GDPR's Article 22 grants you the right not to be subject to decisions based solely on automated processing if those decisions significantly affect you. When automation is used, you have rights to explanation, human intervention, and contestation.
        </p>

        <ul>
          <li><strong>Meaningful explanation:</strong> Platforms must describe the logic behind decisions.</li>
          <li><strong>Human review:</strong> You can request that a person re-evaluates an automated outcome.</li>
          <li><strong>Right to contest:</strong> You may challenge an AI-generated recommendation.</li>
          <li><strong>Data access:</strong> You can request the data used to generate a recommendation.</li>
        </ul>

        <h2>Why Transparency Builds Trust</h2>

        <p>
          Studies consistently show that users who receive explanations for AI recommendations report higher trust, better satisfaction, and are more likely to follow through on recommendations.
        </p>

        <ul>
          <li>Explanations foster confidence in the process</li>
          <li>Users feel in control and empowered to decide</li>
          <li>Feedback improves when users understand the rationale</li>
          <li>Expectations are aligned before moving into a shared space</li>
        </ul>

        <h2>The Problem with Black Box Algorithms</h2>

        <p>Opaque systems cause four major issues:</p>

        <h3>1. Limited Accountability</h3>
        <p>Without visibility, you cannot verify if the system works correctly or fairly.</p>

        <h3>2. Poor Feedback Loops</h3>
        <p>Users cannot pinpoint what went wrong, making it harder to improve recommendations.</p>

        <h3>3. Reduced Agency</h3>
        <p>Blind trust creates anxiety and discourages users from making confident decisions.</p>

        <h3>4. Bias Risks</h3>
        <p>Hidden logic can perpetuate unfair patterns without detection.</p>

        <h2>Explainable AI in Practice at Domu Match</h2>

        <p>We've embedded explainability into every step of our matching workflow:</p>

        <ul>
          <li><strong>Transparent compatibility scores:</strong> Every match shows the underlying lifestyle, academic, and social factors.</li>
          <li><strong>Weighting insights:</strong> You'll see how heavily each factor was considered.</li>
          <li><strong>User feedback loop:</strong> You can tell us whether a match felt accurate, improving future recommendations.</li>
          <li><strong>Adjustable preferences:</strong> Tweak your priorities and immediately see how matches change.</li>
        </ul>

        <p>
          When you use <Link href="/matches" className="text-brand-primary hover:underline">Domu Match</Link>, you don't just get a score—you get context, rationale, and control.
        </p>

        <h2>Real Benefits of Explainable Matching</h2>

        <h3>Better Decision-Making</h3>
        <p>Understanding why you matched with someone helps you decide whether to move forward.</p>

        <h3>Improved Conversations</h3>
        <p>Knowing alignment areas lets you discuss relevant topics quickly.</p>

        <h3>Lower Stress</h3>
        <p>Clarity reduces uncertainty and helps you trust the process.</p>

        <h3>Higher Satisfaction</h3>
        <p>Users who understand their matches are more confident, leading to better outcomes.</p>

        <h2>Looking Ahead</h2>

        <p>
          As EU and Dutch regulations evolve, explainability standards will only rise. We expect more detailed explanation requirements, standard formats, and advances in how complex models can be interpreted.
        </p>

        <h2>Your Rights and Responsibilities</h2>

        <h3>You Have the Right To:</h3>

        <ul>
          <li>Know how AI recommendations are produced</li>
          <li>Request human review and clarification</li>
          <li>Challenge or opt out of automated matching</li>
          <li>Access and export your matching data</li>
        </ul>

        <h3>You Are Responsible For:</h3>

        <ul>
          <li>Providing accurate information</li>
          <li>Reviewing explanations before proceeding</li>
          <li>Offering feedback to improve recommendations</li>
          <li>Making informed decisions instead of deferring blindly to AI</li>
        </ul>

        <h2>Conclusion: Transparency Is the Foundation of Trust</h2>

        <p>
          Explainable AI isn't optional—it is becoming the baseline for any system that influences meaningful life decisions. By demanding transparency and choosing platforms that provide it, you protect your rights, gain confidence, and create better living situations.
        </p>

        <p>
          At Domu Match, explainability is not a legal checkbox; it's a design philosophy. We believe you should always understand why we recommend a roommate—and that clarity helps you build safer, happier homes.
        </p>
      </div>
    )
  },
  nl: {
    title: 'Waarom uitlegbare AI ertoe doet',
    excerpt: 'Begrijp waarom je gematcht wordt en neem betere beslissingen. Ontdek hoe transparantie in AI-matching aansluit bij EU-regels en jouw rechten beschermt.',
    publishDate: '2025-11-05',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description: 'Lees hoe ons transparante matchingproces werkt en hoe we compatibiliteit uitleggen.'
      },
      {
        title: 'Onze aanpak',
        href: '/about',
        description: 'Ontdek onze focus op transparantie en wetenschappelijk onderbouwde matching.'
      },
      {
        title: 'Bekijk je matches',
        href: '/matches',
        description: 'Zie waarom je met iemand compatibel bent voordat je contact opneemt.'
      }
    ],
    ctaTitle: 'Ervaar transparante matching',
    ctaDescription: 'Zie precies waarom je met iemand wordt gematcht. Onze uitlegbare AI toont de factoren achter elke aanbeveling.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-8">
        <p className="text-lg text-brand-muted leading-relaxed">
          Als een algoritme bepaalt met wie je gaat samenwonen, wil je weten waarom. Nu AI steeds vaker keuzes rond wonen, studie en werk beïnvloedt, is transparantie geen luxe meer maar een wettelijke eis.
        </p>

        <p>
          De Europese AI-verordening, sinds 2024 volledig van kracht, beschermt jouw recht om algoritmische beslissingen te begrijpen, te bevragen en te laten corrigeren. Voor studenten in Nederland betekent dat: je hoeft een match nooit blind te vertrouwen.
        </p>

        <h2>Wat is uitlegbare AI?</h2>

        <p>
          Uitlegbare AI (Explainable AI) zijn systemen die duidelijk laten zien welke factoren, wegingen en logica tot een aanbeveling hebben geleid. Geen black box, maar inzicht in het waarom.
        </p>

        <p>Bij roommate matching zie je bijvoorbeeld:</p>

        <ul>
          <li>Welke lifestyle-, studie- en persoonlijkheidsfactoren het zwaarst wogen</li>
          <li>Waarom een match hoger scoort dan een andere</li>
          <li>Welke overeenkomsten of aanvullingen zijn gevonden</li>
          <li>Waar mogelijk frictie kan ontstaan zodat je dat vooraf bespreekt</li>
        </ul>

        <h2>EU AI Act: hogere lat voor transparantie</h2>

        <p>
          De AI Act werkt met risicocategorieën, maar legt altijd nadruk op transparantie, menselijk toezicht en gebruikersrechten.
        </p>

        <ul>
          <li><strong>Transparantie:</strong> Je moet weten dat AI wordt ingezet en wat de grenzen zijn.</li>
          <li><strong>Menselijke controle:</strong> Beslissingen moeten kunnen worden herzien of aangepast.</li>
          <li><strong>Nauwkeurigheid:</strong> Systemen moeten fouten opsporen en corrigeren.</li>
          <li><strong>Gebruikersrechten:</strong> Je mag uitleg vragen en aanbevelingen aanvechten.</li>
        </ul>

        <p>
          Nederland sluit hierop aan met een eigen mensgerichte AI-strategie waarin uitlegbaarheid centraal staat.
        </p>

        <h2>GDPR beschermt je bij automatische beslissingen</h2>

        <p>
          Artikel 22 van de AVG geeft je het recht om geen besluiten te krijgen die puur automatisch tot stand komen als die grote impact hebben. Gebeurt dat wel, dan heb je recht op uitleg, menselijke tussenkomst en bezwaar.
        </p>

        <ul>
          <li><strong>Inzicht:</strong> Je mag weten welke logica en gegevens zijn gebruikt.</li>
          <li><strong>Mensenwerk:</strong> Je mag een menselijke beoordeling vragen.</li>
          <li><strong>Bezwaar:</strong> Je kunt een aanbeveling laten heroverwegen.</li>
          <li><strong>Data-inzicht:</strong> Je mag de onderliggende data opvragen of meenemen.</li>
        </ul>

        <h2>Transparantie bouwt vertrouwen</h2>

        <p>
          Onderzoek toont aan dat gebruikers die uitleg krijgen meer vertrouwen hebben, betere keuzes maken en zich eigenaar voelen van het proces.
        </p>

        <ul>
          <li>Je begrijpt waarom een match logisch is</li>
          <li>Je voelt controle en kunt gerichte vragen stellen</li>
          <li>Je feedback wordt nuttiger, wat het systeem verbetert</li>
          <li>Je verwachtingen liggen op één lijn vóórdat je samenwoont</li>
        </ul>

        <h2>Waarom black box-algoritmen problematisch zijn</h2>

        <p>Niet-uitlegbare systemen leiden tot:</p>

        <h3>1. Geen verantwoordelijkheid</h3>
        <p>Je kunt niet controleren of het systeem eerlijk of correct werkt.</p>

        <h3>2. Geen leermomenten</h3>
        <p>Zonder inzicht kun je niet aangeven wat beter moet.</p>

        <h3>3. Minder regie</h3>
        <p>Je vertrouwt blind en voelt je minder zeker over de uitkomst.</p>

        <h3>4. Bias-risico</h3>
        <p>Vooroordelen blijven verborgen zolang de logica niet zichtbaar is.</p>

        <h2>Zo passen wij uitlegbare AI toe</h2>

        <p>Bij Domu Match zit uitleg in elke stap:</p>

        <ul>
          <li><strong>Heldere scores:</strong> Je ziet welke factoren het meest bijdragen.</li>
          <li><strong>Weging inzichtelijk:</strong> Je weet hoe zwaar elk onderdeel telt.</li>
          <li><strong>Feedbackloop:</strong> Jij geeft aan of een match klopte, waardoor het systeem verbetert.</li>
          <li><strong>Instelbare voorkeuren:</strong> Pas je voorkeuren aan en zie direct het effect.</li>
        </ul>

        <p>
          Via <Link href="/matches" className="text-brand-primary hover:underline">Domu Match</Link> krijg je dus geen kale score maar context en regie.
        </p>

        <h2>Concrete voordelen</h2>

        <h3>Betere beslissingen</h3>
        <p>Je weet precies waarom iemand past en of je verder wilt.</p>

        <h3>Gerichtere gesprekken</h3>
        <p>Je bespreekt meteen relevante onderwerpen.</p>

        <h3>Minder stress</h3>
        <p>Transparantie haalt onzekerheid weg.</p>

        <h3>Meer tevredenheid</h3>
        <p>Wie het proces begrijpt, staat sterker in elke stap.</p>

        <h2>Vooruitblik</h2>

        <p>
          Verwacht strengere uitlegvereisten, standaarden voor hoe uitleg wordt getoond en nieuwe technieken om complexe modellen toch begrijpelijk te maken.
        </p>

        <h2>Jouw rechten en plichten</h2>

        <h3>Je mag:</h3>

        <ul>
          <li>Weten hoe AI tot een aanbeveling komt</li>
          <li>Menselijke interventie vragen</li>
          <li>Bezwaar maken of afzien van automatische beslissingen</li>
          <li>Je gegevens inzien en meenemen</li>
        </ul>

        <h3>Je bent verantwoordelijk voor:</h3>

        <ul>
          <li>Eerlijke en volledige informatie geven</li>
          <li>Uitleg echt lezen vóórdat je beslist</li>
          <li>Feedback delen om het systeem beter te maken</li>
          <li>Zelfstandig een keuze maken en niet blind varen op AI</li>
        </ul>

        <h2>Conclusie</h2>

        <p>
          Uitlegbare AI is de basis voor vertrouwen. Door te kiezen voor platforms die transparant zijn, bescherm je jezelf én krijg je betere matches. Bij Domu Match is uitlegbaarheid geen vinkje, maar een ontwerpprincipe. Je verdient het om te weten waarom we een roommate aanraden – zo bouw je aan een veilig, prettig thuis.
        </p>
      </div>
    )
  }
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

