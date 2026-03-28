import type { Locale } from '@/lib/i18n'

export type LearnFeatureBlock = {
  title: string
  description: string
  benefits: string[]
}

export type LearnAddonBlock = {
  title: string
  description: string
  price: string
}

export type LearnOutcomeBlock = {
  title: string
  description: string
  metric: string
}

export type LearnPageStrings = {
  heroTitle: string
  heroSub: string
  bookPilot: string
  viewDemo: string
  outcomesTitle: string
  outcomesSub: string
  outcomes: LearnOutcomeBlock[]
  typicalImprovement: string
  campusTitle: string
  campusSub: string
  features: LearnFeatureBlock[]
  addonsTitle: string
  addonsSub: string
  addons: LearnAddonBlock[]
  savingsTitle: string
  savingsSub: string
  statIntl: string
  statAttrition: string
  statRetention: string
  savingsCtaLead: string
  savingsCtaButton: string
  finalTitle: string
  finalSub: string
  finalPrimary: string
  finalSecondary: string
}

export const learnPageCopy: Record<Locale, LearnPageStrings> = {
  en: {
    heroTitle: 'Reduce conflicts. Improve satisfaction. Save staff time.',
    heroSub:
      'Domu Match helps universities create safer, more compatible living environments while reducing administrative burden and improving student satisfaction.',
    bookPilot: 'Book a pilot',
    viewDemo: 'View demo',
    outcomesTitle: 'Proven Outcomes',
    outcomesSub:
      'Universities using Domu Match see significant improvements in student housing satisfaction and reduced administrative overhead.',
    outcomes: [
      {
        title: 'Reduce conflicts',
        description: 'Fewer accommodation complaints and roommate disputes',
        metric: '60% reduction',
      },
      {
        title: 'Improve satisfaction',
        description: 'Higher student satisfaction with housing arrangements',
        metric: '85% satisfaction',
      },
      {
        title: 'Save staff time',
        description: 'Less admin workload with automated matching and moderation',
        metric: '40% less work',
      },
    ],
    typicalImprovement: 'Typical improvement',
    campusTitle: 'How it works on campus',
    campusSub: 'Seamless integration with your existing university infrastructure and processes.',
    features: [
      {
        title: 'Campus Integration',
        description: 'Seamless SSO with SURFconext and university systems',
        benefits: ['SURFconext SSO', 'Email domain validation', 'Campus-scoped communities'],
      },
      {
        title: 'Security & Verification',
        description: 'ID verification gate ensures only verified students join',
        benefits: ['Government ID verification', 'Live selfie checks', 'Campus email validation'],
      },
      {
        title: 'Analytics Dashboard',
        description: 'Comprehensive insights into student housing satisfaction',
        benefits: ['Signup analytics', 'Completion rates', 'Conflict reports', 'Retention metrics'],
      },
      {
        title: 'Admin Controls',
        description: 'Full control over branding, eligibility, and moderation',
        benefits: ['University branding', 'Eligibility rules', 'Announcements', 'Moderation queue'],
      },
    ],
    addonsTitle: 'Additional Services',
    addonsSub:
      'Extend the platform with powerful integrations and specialized tools for comprehensive housing management.',
    addons: [
      {
        title: 'API & Integrations',
        description: 'Connect with existing university systems and housing platforms',
        price: 'Custom',
      },
      {
        title: 'Conflict Resolution Toolkit',
        description: 'Structured mediation and resolution processes for disputes',
        price: '€500/month',
      },
      {
        title: 'White-label Solution',
        description: "Fully branded platform with your university's identity",
        price: '€2000/month',
      },
    ],
    savingsTitle: 'What could better housing mean for your budget?',
    savingsSub:
      'Housing conflict is a leading driver of first-year attrition. Retaining even a small percentage of at-risk students can add up to significant revenue - and better outcomes.',
    statIntl: 'Avg. loss per international dropout',
    statAttrition: 'Reason for first-year attrition',
    statRetention: 'Conservative retention lift from better matching',
    savingsCtaLead:
      'Use our interactive ROI calculator to estimate how much your university could save by retaining more students.',
    savingsCtaButton: 'Calculate your savings',
    finalTitle: 'Ready to improve student housing?',
    finalSub: 'Join leading Dutch universities in creating better living experiences for students.',
    finalPrimary: 'Book a pilot',
    finalSecondary: 'Contact sales',
  },
  nl: {
    heroTitle: 'Minder conflicten. Meer tevredenheid. Minder druk op teams.',
    heroSub:
      'Domu Match helpt universiteiten veiligere, beter passende woonervaringen te bieden — met minder administratieve last en hogere studenttevredenheid.',
    bookPilot: 'Plan een pilot',
    viewDemo: 'Bekijk demo',
    outcomesTitle: 'Aantoonbare resultaten',
    outcomesSub:
      'Instellingen die Domu Match gebruiken zien verbetering in huisvestingstevredenheid en minder administratieve overhead.',
    outcomes: [
      {
        title: 'Minder conflicten',
        description: 'Minder klachten over huisvesting en huisgenootgeschillen',
        metric: '60% reductie',
      },
      {
        title: 'Hogere tevredenheid',
        description: 'Meer tevredenheid over huisvesting en samenwonen',
        metric: '85% tevreden',
      },
      {
        title: 'Tijdwinst voor teams',
        description: 'Minder handwerk door geautomatiseerde matching en moderatie',
        metric: '40% minder werk',
      },
    ],
    typicalImprovement: 'Typische verbetering',
    campusTitle: 'Zo werkt het op de campus',
    campusSub: 'Aansluiting op bestaande infrastructuur en processen van je instelling.',
    features: [
      {
        title: 'Campus-integratie',
        description: 'Naadloze SSO met SURFconext en universitaire systemen',
        benefits: ['SURFconext SSO', 'E-maildomeinvalidatie', 'Campus-specifieke communities'],
      },
      {
        title: 'Veiligheid & verificatie',
        description: 'ID-check voordat studenten meedoen',
        benefits: ['Verificatie overheids-ID', 'Live selfie-checks', 'Campusmail-validatie'],
      },
      {
        title: 'Analytics-dashboard',
        description: 'Inzicht in tevredenheid en gebruik rond studentenhuisvesting',
        benefits: ['Aanmeld-analytics', 'Completion', 'Conflictmeldingen', 'Retentie-indicatoren'],
      },
      {
        title: 'Admin-beheer',
        description: 'Volledige regie over branding, toegang en moderatie',
        benefits: ['University branding', 'Toegangsregels', 'Aankondigingen', 'Moderatiewachtrij'],
      },
    ],
    addonsTitle: 'Extra diensten',
    addonsSub: 'Breid uit met integraties en gespecialiseerde tools voor huisvestingsmanagement.',
    addons: [
      {
        title: 'API & integraties',
        description: 'Koppel met bestaande systemen en huisvestingsplatforms',
        price: 'Op maat',
      },
      {
        title: 'Conflictbemiddeling',
        description: 'Gestructeerde mediation bij geschillen',
        price: '€500/maand',
      },
      {
        title: 'White-label',
        description: 'Volledig in jouw universiteitsidentiteit',
        price: '€2000/maand',
      },
    ],
    savingsTitle: 'Wat kan betere huisvesting voor je begroting betekenen?',
    savingsSub:
      'Woonconflict is een belangrijke driver van eerstejaars-uitval. Een klein deel extra behoud kan oplopen tot aanzienlijke omzet — en betere studentuitkomsten.',
    statIntl: 'Gem. verlies per uitvallende internationale student',
    statAttrition: 'Belangrijkste reden eerstejaars-uitval',
    statRetention: 'Voorzichtige retentiewinst door betere matching',
    savingsCtaLead:
      'Gebruik onze interactieve ROI-calculator om te schatten hoeveel je instelling kan behouden door meer studenten vast te houden.',
    savingsCtaButton: 'Bereken je besparing',
    finalTitle: 'Klaar om studentenhuisvesting te verbeteren?',
    finalSub: 'Sluit aan bij voorlopers in Nederland die betere woonervaringen voor studenten bouwen.',
    finalPrimary: 'Plan een pilot',
    finalSecondary: 'Contact verkoop',
  },
}
