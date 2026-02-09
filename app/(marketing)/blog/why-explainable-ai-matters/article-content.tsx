'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
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
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          When an algorithm decides who you should live with, shouldn&apos;t you understand why? As artificial intelligence becomes increasingly integrated into housing, admissions, and employment decisions, transparency has moved from academic debate to legal requirement.
        </p>

        <p>
          The European Union's AI Act, fully in force since 2024, is the world's first comprehensive AI regulation. For students in the Netherlands using AI-powered platforms to find roommates, this legislation directly protects your right to understand, question, and control algorithmic decisions that affect your housing situation.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"
            alt="Abstract visualization of AI and data connections"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Explainable AI helps you understand the factors behind every recommendation.</figcaption>
        </figure>

        <h2>What Is Explainable AI?</h2>

        <p>
          Explainable AI (XAI) refers to systems that can provide clear, understandable reasons for their recommendations. Rather than operating as black boxes, explainable systems reveal the factors, weights, and logic behind their outputs.
        </p>

        <p>
          In roommate matching, this means you can see which compatibility factors contributed most to a match, how lifestyle, academic, and personality preferences were weighted, why some matches scored higher than others, where complementary traits helped create a pairing, and potential friction points you should discuss with a match. At <Link href="/how-it-works">Domu Match</Link>, we built our matching process around these principles from the ground up.
        </p>

        <h2>The EU AI Act: Raising the Bar for Transparency</h2>

        <p>
          The EU AI Act establishes a risk-based framework for AI. Even if roommate matching is not classified as high risk, the Act's principles apply: users must be informed when AI is used, systems must be explainable, and humans must retain oversight.
        </p>

        <p>
          Key requirements for matching platforms include transparency - users must know they are interacting with AI and understand its scope. Human oversight means critical decisions require human review and the ability to override recommendations. Systems must monitor for errors and provide mechanisms to correct them. And users have the right to request explanations and contest recommendations.
        </p>

        <p>
          The Netherlands backs these requirements with its own human-centric AI strategy. Dutch regulators emphasize accountability, fairness, and explainability in all AI deployments.
        </p>

        <h2>GDPR Safeguards Your Algorithmic Rights</h2>

        <p>
          GDPR's Article 22 grants you the right not to be subject to decisions based solely on automated processing if those decisions significantly affect you. When automation is used, you have rights to explanation, human intervention, and contestation.
        </p>

        <p>
          Platforms must provide a meaningful explanation describing the logic behind decisions. You can request that a person re-evaluates an automated outcome. You may challenge an AI-generated recommendation. And you can request the data used to generate a recommendation. Our <Link href="/privacy">privacy policy</Link> outlines how we uphold these rights.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
            alt="Data visualization and analytics dashboard"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Transparent systems let you see how your data shapes your matches.</figcaption>
        </figure>

        <h2>Why Transparency Builds Trust</h2>

        <p>
          Studies consistently show that users who receive explanations for AI recommendations report higher trust, better satisfaction, and are more likely to follow through on recommendations. Explanations foster confidence in the process. Users feel in control and empowered to decide. Feedback improves when users understand the rationale. And expectations are aligned before moving into a shared space.
        </p>

        <h2>The Problem with Black Box Algorithms</h2>

        <p>
          Opaque systems cause several major issues. Without visibility, you cannot verify if the system works correctly or fairly - limited accountability. Users cannot pinpoint what went wrong, making it harder to improve recommendations - poor feedback loops. Blind trust creates anxiety and discourages users from making confident decisions - reduced agency. And hidden logic can perpetuate unfair patterns without detection - bias risks.
        </p>

        <p>
          That is why we designed <Link href="/matches">Domu Match</Link> to be transparent from the start. You never have to guess why a match was suggested.
        </p>

        <h2>Explainable AI in Practice at Domu Match</h2>

        <p>
          We have embedded explainability into every step of our matching workflow. Every match shows the underlying lifestyle, academic, and social factors - transparent compatibility scores. You will see how heavily each factor was considered - weighting insights. You can tell us whether a match felt accurate, improving future recommendations - user feedback loop. And you can tweak your priorities and immediately see how matches change - adjustable preferences.
        </p>

        <p>
          When you use <Link href="/how-it-works">Domu Match</Link>, you don&apos;t just get a score - you get context, rationale, and control. Our <Link href="/about">mission</Link> is built on the belief that science-driven matching should be understandable and trustworthy.
        </p>

        <h2>Real Benefits of Explainable Matching</h2>

        <p>
          Understanding why you matched with someone helps you decide whether to move forward - better decision-making. Knowing alignment areas lets you discuss relevant topics quickly with potential roommates - improved conversations. Clarity reduces uncertainty and helps you trust the process - lower stress. And users who understand their matches are more confident, leading to better outcomes - higher satisfaction.
        </p>

        <h2>Looking Ahead</h2>

        <p>
          As EU and Dutch regulations evolve, explainability standards will only rise. We expect more detailed explanation requirements, standard formats, and advances in how complex models can be interpreted. Staying ahead of these standards is part of our commitment to <Link href="/safety">student safety and trust</Link>.
        </p>

        <h2>Your Rights and Responsibilities</h2>

        <p>
          You have the right to know how AI recommendations are produced, to request human review and clarification, to challenge or opt out of automated matching, and to access and export your matching data. At the same time, you are responsible for providing accurate information, reviewing explanations before proceeding, offering feedback to improve recommendations, and making informed decisions instead of deferring blindly to AI.
        </p>

        <h2>Conclusion: Transparency Is the Foundation of Trust</h2>

        <p>
          Explainable AI isn&apos;t optional - it&apos;s becoming the baseline for any system that influences meaningful life decisions. By demanding transparency and choosing platforms that provide it, you protect your rights, gain confidence, and create better living situations.
        </p>

        <p>
          At Domu Match, explainability isn&apos;t a legal checkbox; it&apos;s a design philosophy. We believe you should always understand why we recommend a roommate - and that clarity helps you build safer, happier homes. <Link href="/auth/sign-up">Get started</Link> and experience matching that puts you in control.
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
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Als een algoritme bepaalt met wie je gaat samenwonen, wil je weten waarom. Nu AI steeds vaker keuzes rond wonen, studie en werk beïnvloedt, is transparantie geen luxe meer maar een wettelijke eis.
        </p>

        <p>
          De Europese AI-verordening, sinds 2024 volledig van kracht, beschermt jouw recht om algoritmische beslissingen te begrijpen, te bevragen en te laten corrigeren. Voor studenten in Nederland betekent dat: je hoeft een match nooit blind te vertrouwen.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"
            alt="Abstracte visualisatie van AI en dataconnecties"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Uitlegbare AI helpt je de factoren achter elke aanbeveling te begrijpen.</figcaption>
        </figure>

        <h2>Wat is uitlegbare AI?</h2>

        <p>
          Uitlegbare AI (Explainable AI) zijn systemen die duidelijk laten zien welke factoren, wegingen en logica tot een aanbeveling hebben geleid. Geen black box, maar inzicht in het waarom.
        </p>

        <p>
          Bij roommate matching zie je bijvoorbeeld welke lifestyle-, studie- en persoonlijkheidsfactoren het zwaarst wogen, waarom een match hoger scoort dan een andere, welke overeenkomsten of aanvullingen zijn gevonden, en waar mogelijk frictie kan ontstaan zodat je dat vooraf bespreekt. Bij <Link href="/how-it-works">Domu Match</Link> bouwden we ons matchingproces van meet af aan rond deze principes.
        </p>

        <h2>EU AI Act: hogere lat voor transparantie</h2>

        <p>
          De AI Act werkt met risicocategorieën, maar legt altijd nadruk op transparantie, menselijk toezicht en gebruikersrechten. Je moet weten dat AI wordt ingezet en wat de grenzen zijn. Beslissingen moeten kunnen worden herzien of aangepast. Systemen moeten fouten opsporen en corrigeren. En je mag uitleg vragen en aanbevelingen aanvechten.
        </p>

        <p>
          Nederland sluit hierop aan met een eigen mensgerichte AI-strategie waarin uitlegbaarheid centraal staat.
        </p>

        <h2>GDPR beschermt je bij automatische beslissingen</h2>

        <p>
          Artikel 22 van de AVG geeft je het recht om geen besluiten te krijgen die puur automatisch tot stand komen als die grote impact hebben. Gebeurt dat wel, dan heb je recht op uitleg, menselijke tussenkomst en bezwaar. Je mag weten welke logica en gegevens zijn gebruikt. Je mag een menselijke beoordeling vragen. Je kunt een aanbeveling laten heroverwegen. En je mag de onderliggende data opvragen of meenemen. Ons <Link href="/privacy">privacybeleid</Link> legt uit hoe we deze rechten waarborgen.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
            alt="Datavisualisatie en analytics-dashboard"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>Transparante systemen laten zien hoe je gegevens je matches beïnvloeden.</figcaption>
        </figure>

        <h2>Transparantie bouwt vertrouwen</h2>

        <p>
          Onderzoek toont aan dat gebruikers die uitleg krijgen meer vertrouwen hebben, betere keuzes maken en zich eigenaar voelen van het proces. Je begrijpt waarom een match logisch is. Je voelt controle en kunt gerichte vragen stellen. Je feedback wordt nuttiger, wat het systeem verbetert. En je verwachtingen liggen op één lijn vóórdat je samenwoont.
        </p>

        <h2>Waarom black box-algoritmen problematisch zijn</h2>

        <p>
          Niet-uitlegbare systemen leiden tot geen verantwoordelijkheid - je kunt niet controleren of het systeem eerlijk of correct werkt. Geen leermomenten - zonder inzicht kun je niet aangeven wat beter moet. Minder regie - je vertrouwt blind en voelt je minder zeker over de uitkomst. En bias-risico - vooroordelen blijven verborgen zolang de logica niet zichtbaar is. Daarom ontwierpen we <Link href="/matches">Domu Match</Link> vanaf het begin transparant.
        </p>

        <h2>Zo passen wij uitlegbare AI toe</h2>

        <p>
          Bij Domu Match zit uitleg in elke stap. Je ziet welke factoren het meest bijdragen - heldere scores. Je weet hoe zwaar elk onderdeel telt - weging inzichtelijk. Jij geeft aan of een match klopte, waardoor het systeem verbetert - feedbackloop. En je past je voorkeuren aan en ziet direct het effect - instelbare voorkeuren.
        </p>

        <p>
          Via <Link href="/how-it-works">Domu Match</Link> krijg je dus geen kale score maar context en regie. Onze <Link href="/about">missie</Link> is gebaseerd op het idee dat wetenschappelijke matching begrijpelijk en betrouwbaar moet zijn.
        </p>

        <h2>Concrete voordelen</h2>

        <p>
          Je weet precies waarom iemand past en of je verder wilt - betere beslissingen. Je bespreekt meteen relevante onderwerpen - gerichtere gesprekken. Transparantie haalt onzekerheid weg - minder stress. En wie het proces begrijpt, staat sterker in elke stap - meer tevredenheid.
        </p>

        <h2>Vooruitblik</h2>

        <p>
          Verwacht strengere uitlegvereisten, standaarden voor hoe uitleg wordt getoond en nieuwe technieken om complexe modellen toch begrijpelijk te maken. Vooroplopen in deze standaarden hoort bij onze inzet voor <Link href="/safety">studentveiligheid en vertrouwen</Link>.
        </p>

        <h2>Jouw rechten en plichten</h2>

        <p>
          Je mag weten hoe AI tot een aanbeveling komt, menselijke interventie vragen, bezwaar maken of afzien van automatische beslissingen, en je gegevens inzien en meenemen. Je bent verantwoordelijk voor eerlijke en volledige informatie geven, uitleg echt lezen vóórdat je beslist, feedback delen om het systeem beter te maken, en zelfstandig een keuze maken in plaats van blind op AI te varen.
        </p>

        <h2>Conclusie</h2>

        <p>
          Uitlegbare AI is de basis voor vertrouwen. Door te kiezen voor platforms die transparant zijn, bescherm je jezelf én krijg je betere matches. Bij Domu Match is uitlegbaarheid geen vinkje, maar een ontwerpprincipe. Je verdient het om te weten waarom we een roommate aanraden - zo bouw je aan een veilig, prettig thuis. <Link href="/auth/sign-up">Start vandaag</Link> en ervaar matching die jou in controle zet.
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
