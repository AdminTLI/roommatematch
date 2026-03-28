import type { Locale } from '@/lib/i18n'

export type PricingTierCopy = {
  title: string
  subtitle: string
  price: { main: string; sub?: string }
  bullets: string[]
}

export type PartnershipRoiCopy = {
  costOfInactionAria: string
  heroTitle: string
  heroSubtitle: string
  statIntlLabel: string
  statAdminLabel: string
  statAttritionLabel: string
  sectionPartnershipsTitle: string
  sectionPartnershipsSubtitle: string
  tabFlexible: string
  tabCampus: string
  flexibleIntro: string
  campusIntro: string
  infraSuffix: string
  intlSliderLabel: string
  dutchSliderLabel: string
  estimatedAnnual: string
  campusPriceNote: string
  roiTitle: string
  roiLead: string
  roiFootnote: string
  roiDutchLabel: string
  roiIntlLabel: string
  roiDutchPlaceholder: string
  roiIntlPlaceholder: string
  revenueSavedDutch: string
  revenueSavedIntl: string
  revenueSavedTotal: string
  ctaPilot: string
  tiers: PricingTierCopy[]
}

export const partnershipRoiCopy: Record<Locale, PartnershipRoiCopy> = {
  en: {
    costOfInactionAria: 'Cost of inaction',
    heroTitle: 'Housing conflict is a retention problem.',
    heroSubtitle:
      'Reduce mediation, improve stability, and turn shared living into a student-success lever.',
    statIntlLabel: 'Avg. loss per international student dropout.',
    statAdminLabel: 'Admin time lost to mediation.',
    statAttritionLabel: 'Driver of first-year attrition.',
    sectionPartnershipsTitle: 'University partnerships',
    sectionPartnershipsSubtitle: 'Pilot or campus license — choose what fits your rollout.',
    tabFlexible: 'Flexible Pilot',
    tabCampus: 'Campus License',
    flexibleIntro:
      'Best for departments, specific cohorts, or a trial run. Set the sliders to your expected cohort; the total below is your estimated annual investment.',
    campusIntro:
      'Best for a full rollout. Choose the tier that matches your campus size; the price is your annual investment, all-in.',
    infraSuffix: ' / year infrastructure.',
    intlSliderLabel: 'International students (€15/student)',
    dutchSliderLabel: 'Dutch students (€5/student)',
    estimatedAnnual: 'Estimated annual total (excl. VAT)',
    campusPriceNote: 'Prices are per semester and excl. BTW.',
    roiTitle: 'Your Return on Investment',
    roiLead:
      'We assume a 30% first-year dropout rate (based on the average institution in The Netherlands) and estimate we can retain 2% (conservatively) of those at risk. The values below use the total revenue (LTV) each student would bring over their 3–4 years of study. The average LTV* is €25.000 for Dutch students and €55.000 for international students.',
    roiFootnote: '* These values include government funding/subsidy per student enrolled.',
    roiDutchLabel: 'How many Dutch first years do you expect?',
    roiIntlLabel: 'How many international first years do you expect?',
    roiDutchPlaceholder: 'e.g. 2000',
    roiIntlPlaceholder: 'e.g. 1000',
    revenueSavedDutch: 'Potential revenue saved (Dutch students)',
    revenueSavedIntl: 'Potential revenue saved (International students)',
    revenueSavedTotal: 'Total potential revenue saved',
    ctaPilot: 'Start Your Pilot',
    tiers: [
      {
        title: 'Small Campus',
        subtitle: '<10k Students',
        price: { main: '€12.250' },
        bullets: ['Unlimited Matching', 'Basic Analytics'],
      },
      {
        title: 'Medium Campus',
        subtitle: '10k–20k Students',
        price: { main: '€24.250' },
        bullets: ['SIS Integration', 'Priority Support', 'White-labeling'],
      },
      {
        title: 'Large Campus',
        subtitle: '>20k Students',
        price: { main: 'Custom Quote' },
        bullets: ['Dedicated Success Manager', 'Custom API Access', 'Multi-Campus support'],
      },
    ],
  },
  nl: {
    costOfInactionAria: 'Kosten van uitstel',
    heroTitle: 'Huisvestingsconflict is een retentieprobleem.',
    heroSubtitle:
      'Minder bemiddeling, meer stabiliteit, en samenwonen als hefboom voor studentensucces.',
    statIntlLabel: 'Gem. verlies per uitvallende internationale student.',
    statAdminLabel: 'Admin-tijd kwijt aan bemiddeling.',
    statAttritionLabel: 'Belangrijkste driever van eerstejaars-uitval.',
    sectionPartnershipsTitle: 'Universiteitspartnerships',
    sectionPartnershipsSubtitle: 'Pilot of campuslicentie — kies wat bij je uitrol past.',
    tabFlexible: 'Flexibele pilot',
    tabCampus: 'Campuslicentie',
    flexibleIntro:
      'Ideaal voor afdelingen, specifieke cohorten of een proef. Zet de schuifjes op je verwachte cohort; het totaal hieronder is je geschatte jaarlijkse investering.',
    campusIntro:
      'Ideaal voor een volledige uitrol. Kies het tier dat bij je campusgrootte past; de prijs is je jaarlijkse investering, all-in.',
    infraSuffix: ' / jaar infrastructuur.',
    intlSliderLabel: 'Internationale studenten (€15/student)',
    dutchSliderLabel: 'Nederlandse studenten (€5/student)',
    estimatedAnnual: 'Geschat jaarlijks totaal (excl. btw)',
    campusPriceNote: 'Prijzen zijn per semester en excl. btw.',
    roiTitle: 'Je return on investment',
    roiLead:
      'We nemen een eerstejaars-uitval van 30% aan (gemiddelde instelling in Nederland) en schatten dat we 2% (voorzichtig) van de risicogroep kunnen behouden. De waarden hieronder gebruiken de totale omzet (LTV) per student over 3–4 jaar studie. Gemiddelde LTV* is €25.000 voor Nederlandse studenten en €55.000 voor internationale studenten.',
    roiFootnote: '* Deze waarden omvatten overheidsbekostiging/subsidie per ingeschreven student.',
    roiDutchLabel: 'Hoeveel Nederlandse eerstejaars verwacht je?',
    roiIntlLabel: 'Hoeveel internationale eerstejaars verwacht je?',
    roiDutchPlaceholder: 'bijv. 2000',
    roiIntlPlaceholder: 'bijv. 1000',
    revenueSavedDutch: 'Potentieel behouden omzet (Nederlandse studenten)',
    revenueSavedIntl: 'Potentieel behouden omzet (internationale studenten)',
    revenueSavedTotal: 'Totaal potentieel behouden omzet',
    ctaPilot: 'Start je pilot',
    tiers: [
      {
        title: 'Kleine campus',
        subtitle: '<10k studenten',
        price: { main: '€12.250' },
        bullets: ['Onbeperkte matching', 'Basis analytics'],
      },
      {
        title: 'Middelgrote campus',
        subtitle: '10k–20k studenten',
        price: { main: '€24.250' },
        bullets: ['SIS-integratie', 'Priority support', 'White-labeling'],
      },
      {
        title: 'Grote campus',
        subtitle: '>20k studenten',
        price: { main: 'Op maat' },
        bullets: ['Dedicated success manager', 'Custom API', 'Multi-campus support'],
      },
    ],
  },
}
