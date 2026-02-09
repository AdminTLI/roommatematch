export type Locale = 'en' | 'nl'

export interface HeroContent {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
  chartLabel: string
  chartCaption: string
  chartSourceUrl: string
  chartSourceLabel: string
}

export interface ProblemContent {
  title: string
  isolation: { title: string; description: string }
  conflict: { title: string; description: string }
  void: { title: string; description: string }
}

export interface SolutionFeature {
  title: string
  description: string
}

export interface SolutionContent {
  feature1: SolutionFeature
  feature2: SolutionFeature
  feature3: SolutionFeature
}

export interface PrivacyContent {
  heading: string
  bullets: string[]
  badgeText: string
}

export interface PilotContent {
  title: string
  pitch: string
  cta: string
  benefits: { label: string; detail: string }[]
  trustPrefix: string
  trustItems: { name: string; description: string }[]
}

export interface OfferContent {
  heading: string
  copy: string
  cta: string
}

export interface SavingsCalculatorContent {
  heading: string
  subheading: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  ctaSubtext: string
  cta: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface RequestDemoContent {
  heading: string
  subheading: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  institutionLabel: string
  institutionPlaceholder: string
  roleLabel: string
  rolePlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  submitLabel: string
  successMessage: string
}

export interface UniversitiesLandingContent {
  hero: HeroContent
  problem: ProblemContent
  solution: SolutionContent
  privacy: PrivacyContent
  pilot: PilotContent
  offer: OfferContent
  savingsCalculator: SavingsCalculatorContent
  faq: FAQItem[]
  requestDemo: RequestDemoContent
}

export const content: Record<Locale, UniversitiesLandingContent> = {
  en: {
    hero: {
      headline: 'Housing Stability = Student Retention.',
      subheadline:
        'Reduce dropouts and boost student wellbeing by ensuring your students live in compatible, conflict-free homes.',
      ctaPrimary: 'Request a Pilot',
      ctaSecondary: 'Download Impact Report',
      chartLabel: 'Student Satisfaction Index',
      chartCaption:
        'Roommate relationship quality declines over the academic year - both across and within semesters.\n\nRRS means: Oct 3.82 → Apr 3.42. Compatible matching can help reverse this trend.',
      chartSourceUrl: 'https://doi.org/10.3389/fpsyg.2022.960421',
      chartSourceLabel: 'Willis & Lane (2022), Frontiers in Psychology',
    },
    problem: {
      title: 'The Silent Cause of Dropouts.',
      isolation: {
        title: 'Isolation',
        description:
          'International students often drop out due to loneliness, not academics.',
      },
      conflict: {
        title: 'Conflict',
        description:
          'Roommate disputes drain Student counsellor resources.',
      },
      void: {
        title: 'The Void',
        description:
          "You know their grades, but you don't know their living environment - until it's too late.",
      },
    },
    solution: {
      feature1: {
        title: "The 'Safe Search' Ecosystem",
        description:
          'Stop sending your students to the wild west of Facebook groups. We provide a 100% ID-verified, gated environment where students can connect safely without fear of bots or scams.',
      },
      feature2: {
        title: "Living Experience Dashboard",
        description:
          'Gain aggregated insights into how your student population is coping. Are first-years lonely? Are international students integrating?',
      },
      feature3: {
        title: 'Psychological Matching',
        description:
          'Our algorithm pairs students based on study habits and lifestyle, creating micro-support systems in every apartment.',
      },
    },
    privacy: {
      heading: 'Privacy First. GDPR Compliant by Design.',
      bullets: [
        'Aggregated, Anonymized Data Reporting only.',
        "Full \"Right to be Forgotten\" integration for students.",
        'Server locations in the EU.',
        'Compliance with Dutch Higher Education data standards.',
      ],
      badgeText: 'GDPR Compliant',
    },
    pilot: {
      title: 'Join the 2026 Student Wellbeing Pilot.',
      pitch:
        'We are selecting 3 innovative Dutch Universities to co-design our dashboard standards.',
      cta: 'Request a Pilot',
      benefits: [
        {
          label: 'Early Access',
          detail: "Lock in 'Founding Partner' pricing for the first 2 years.",
        },
        {
          label: 'Customization',
          detail: 'Tailor the analytics to your specific retention KPIs.',
        },
        {
          label: 'Zero Risk',
          detail: '6-Month Free Trial for the first 3 partners.',
        },
      ],
      trustPrefix: 'Enterprise-grade security powered by:',
      trustItems: [
        { name: 'Persona', description: 'Identity Verification' },
        { name: 'GDPR Compliant', description: 'EU Servers' },
        { name: 'SSL Encrypted', description: '' },
      ],
    },
    offer: {
      heading: 'Start with a Pilot Program.',
      copy: "You don't need to change your entire infrastructure. Run a pilot for your incoming International First-Years.",
      cta: 'Schedule a Strategy Call',
    },
    savingsCalculator: {
      heading: 'What could better housing mean for your budget?',
      subheading:
        'Housing conflict is a leading driver of first-year attrition. Retaining even a small percentage of at-risk students can add up to significant revenue—and better outcomes.',
      stat1Value: '€55.000',
      stat1Label: 'Avg. loss per international dropout',
      stat2Value: 'Top 3',
      stat2Label: 'Reason for first-year attrition',
      stat3Value: '2%+',
      stat3Label: 'Conservative retention lift from better matching',
      ctaSubtext:
        'Use our interactive ROI calculator to estimate how much your university could save by retaining more students.',
      cta: 'Calculate your savings',
    },
    faq: [
      {
        question: 'Does this integrate with our existing SIS (Student Information System)?',
        answer:
          'Yes. We offer API access and custom integrations for Enterprise partners. We can connect with most student information systems to sync programmes and support single sign-on. Pilot programmes can start with manual or CSV-based setup and add SIS integration as you scale.',
      },
      {
        question: 'How do you handle student consent for data?',
        answer:
          'Students give explicit consent before any of their data is used for matching or analytics. For university dashboards we only provide aggregated, anonymized insights - no identifiable student data is shared. We support full "Right to be Forgotten" and data export in line with GDPR.',
      },
      {
        question: 'What is the cost model for universities?',
        answer:
          'We offer pilot programmes with transparent pricing. Founding Partners in the 2026 pilot lock in preferential rates for the first 2 years and can start with a 6-month free trial. Contact us for a tailored proposal based on your cohort size and needs.',
      },
    ],
    requestDemo: {
      heading: 'Request a Pilot',
      subheading: 'Tell us about your institution and we’ll get back within 2 business days.',
      nameLabel: 'Your name',
      namePlaceholder: 'Jane Smith',
      emailLabel: 'Work email',
      emailPlaceholder: 'jane.smith@university.nl',
      institutionLabel: 'Institution',
      institutionPlaceholder: 'Your university name',
      roleLabel: 'Role',
      rolePlaceholder: 'e.g. Housing Coordinator, Student Success',
      messageLabel: 'Message (optional)',
      messagePlaceholder: 'Cohort size, timeline, or questions',
      submitLabel: 'Send request',
      successMessage: 'Thank you. We’ll be in touch soon.',
    },
  },
  nl: {
    hero: {
      headline: 'Huisvestingsstabiliteit = Studentretentie.',
      subheadline:
        'Verminder uitval en versterk het welzijn van studenten door ervoor te zorgen dat ze in compatibele, conflictvrije woningen wonen.',
      ctaPrimary: 'Vraag een pilot aan',
      ctaSecondary: 'Download impactrapport',
      chartLabel: 'Studenttevredenheidsindex',
      chartCaption:
        'De kwaliteit van de huisgenotenrelatie daalt in de loop van het academisch jaar—zowel tussen als binnen semesters.\n\nRRS-gemiddelden: okt 3,82 → apr 3,42. Compatibele matching kan helpen deze trend te keren.',
      chartSourceUrl: 'https://doi.org/10.3389/fpsyg.2022.960421',
      chartSourceLabel: 'Willis & Lane (2022), Frontiers in Psychology',
    },
    problem: {
      title: 'De stille oorzaak van uitval.',
      isolation: {
        title: 'Isolatie',
        description:
          'Internationale studenten vallen vaak uit door eenzaamheid, niet door studie.',
      },
      conflict: {
        title: 'Conflict',
        description:
          'Geschillen tussen huisgenoten putten de middelen van studentbegeleiders uit.',
      },
      void: {
        title: 'Het vacuüm',
        description:
          'U kent hun cijfers, maar niet hun leefomgeving - tot het te laat is.',
      },
    },
    solution: {
      feature1: {
        title: "Het 'Safe Search' ecosysteem",
        description:
          'Stuur uw studenten niet meer naar de wild west van Facebook-groepen. Wij bieden een 100% ID-geverifieerde, afgeschermde omgeving waar studenten veilig kunnen koppelen zonder angst voor bots of oplichting.',
      },
      feature2: {
        title: 'Living Experience Dashboard',
        description:
          'Krijg geaggregeerde inzichten in hoe uw studentenpopulatie ervoor staat. Zijn eerstejaars eenzaam? Integreren internationale studenten?',
      },
      feature3: {
        title: 'Psychologische matching',
        description:
          'Ons algoritme koppelt studenten op basis van studiegewoonten en levensstijl, en creëert micro-ondersteuningssystemen in elk appartement.',
      },
    },
    privacy: {
      heading: 'Privacy eerst. AVG-conform door ontwerp.',
      bullets: [
        'Alleen geaggregeerde, geanonimiseerde datarapportage.',
        'Volledige "Recht op vergetelheid" voor studenten.',
        'Serverlocaties in de EU.',
        'In overeenstemming met Nederlandse hogeronderwijs-datastandaarden.',
      ],
      badgeText: 'AVG-conform',
    },
    pilot: {
      title: 'Doe mee met de Student Wellbeing Pilot 2026.',
      pitch:
        'We selecteren 3 innovatieve Nederlandse universiteiten om samen onze dashboardstandaarden vorm te geven.',
      cta: 'Vraag een pilot aan',
      benefits: [
        {
          label: 'Vroege toegang',
          detail: "Verzeker je van 'Founding Partner'-tarieven voor de eerste 2 jaar.",
        },
        {
          label: 'Customization',
          detail: 'Pas de analytics aan op jouw retentie-KPI\'s.',
        },
        {
          label: 'Zero risk',
          detail: '6 maanden gratis proefperiode voor de eerste 3 partners.',
        },
      ],
      trustPrefix: 'Enterprise-beveiliging o.a.:',
      trustItems: [
        { name: 'Persona', description: 'Identiteitsverificatie' },
        { name: 'AVG-conform', description: 'EU-servers' },
        { name: 'SSL-versleuteld', description: '' },
      ],
    },
    offer: {
      heading: 'Begin met een pilot.',
      copy: 'U hoeft uw hele infrastructuur niet om te gooien. Draai een pilot voor uw binnenkomende internationale eerstejaars.',
      cta: 'Plan een strategiegesprek',
    },
    savingsCalculator: {
      heading: 'Wat kan betere huisvesting betekenen voor uw begroting?',
      subheading:
        'Huisvestingsconflicten zijn een belangrijke oorzaak van eerstejaarsuitval. Het behouden van zelfs een klein percentage risicostudenten kan uitmonden in aanzienlijke opbrengst—en betere uitkomsten.',
      stat1Value: '€55.000',
      stat1Label: 'Gem. verlies per internationale uitval',
      stat2Value: 'Top 3',
      stat2Label: 'Reden voor eerstejaarsuitval',
      stat3Value: '2%+',
      stat3Label: 'Conservatieve retentiewinst door betere matching',
      ctaSubtext:
        'Gebruik onze interactieve ROI-calculator om te schatten hoeveel uw universiteit kan besparen door meer studenten te behouden.',
      cta: 'Bereken uw besparing',
    },
    faq: [
      {
        question: 'Integreert dit met ons bestaande SIS (studentinformatiesysteem)?',
        answer:
          'Ja. We bieden API-toegang en maatwerkintegraties voor Enterprise-partners. We kunnen koppelen met de meeste studentinformatiesystemen voor programma-sync en single sign-on. Piloten kunnen starten met handmatige of CSV-setup en later SIS-integratie toevoegen.',
      },
      {
        question: 'Hoe gaan jullie om met toestemming van studenten voor data?',
        answer:
          'Studenten geven expliciet toestemming voordat hun data wordt gebruikt voor matching of analytics. Voor universiteitsdashboards leveren we alleen geaggregeerde, geanonimiseerde inzichten - geen identificeerbare studentdata. We ondersteunen volledig "Recht op vergetelheid" en data-export conform de AVG.',
      },
      {
        question: 'Wat is het kostenmodel voor universiteiten?',
        answer:
          'We bieden piloten met transparante prijzen. Founding Partners in de 2026-pilot krijgen preferentiële tarieven voor de eerste 2 jaar en kunnen starten met 6 maanden gratis proef. Neem contact op voor een voorstel op maat op basis van cohortgrootte en behoeften.',
      },
    ],
    requestDemo: {
      heading: 'Vraag een pilot aan',
      subheading: 'Vertel ons over uw instelling; we reageren binnen 2 werkdagen.',
      nameLabel: 'Uw naam',
      namePlaceholder: 'Jan de Vries',
      emailLabel: 'Werk-e-mail',
      emailPlaceholder: 'jan.devries@universiteit.nl',
      institutionLabel: 'Instelling',
      institutionPlaceholder: 'Naam van uw universiteit',
      roleLabel: 'Rol',
      rolePlaceholder: 'bijv. Huisvestingscoördinator, Studentensucces',
      messageLabel: 'Bericht (optioneel)',
      messagePlaceholder: 'Cohortgrootte, planning of vragen',
      submitLabel: 'Verstuur verzoek',
      successMessage: 'Bedankt. We nemen snel contact op.',
    },
  },
}
