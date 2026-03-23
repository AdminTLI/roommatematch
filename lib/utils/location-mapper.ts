const INSTITUTION_CITY_MAP: Record<string, string> = {
  // WO universities
  uva: 'Amsterdam',
  vu: 'Amsterdam',
  uu: 'Utrecht',
  leiden: 'Leiden',
  rug: 'Groningen',
  eur: 'Rotterdam',
  tud: 'Delft',
  tudelft: 'Delft', // Alternative slug for TU Delft
  tue: 'Eindhoven',
  utwente: 'Enschede',
  wur: 'Wageningen',
  ru: 'Nijmegen',
  um: 'Maastricht',
  tilburg: 'Tilburg',
  ou: 'Heerlen',

  // WO special
  uvh: 'Utrecht',
  pthu: 'Amsterdam',
  tua: 'Apeldoorn',
  tuu: 'Utrecht',

  // HBO universities (main campus cities)
  aeres: 'Wageningen',
  ahk: 'Amsterdam',
  artez: 'Arnhem',
  avans: 'Breda',
  buas: 'Breda',
  che: 'Ede',
  codarts: 'Rotterdam',
  hhs: 'Den Haag',
  dekempel: 'Helmond',
  dae: 'Eindhoven',
  driestar: 'Gouda',
  fontys: 'Eindhoven',
  gerritrietveld: 'Amsterdam',
  han: 'Nijmegen',
  hanze: 'Groningen',
  has: "'s-Hertogenbosch",
  'hdk-denhaag': 'Den Haag',
  inholland: 'Amsterdam',
  ipabo: 'Amsterdam',
  kpz: 'Zwolle',
  hsleiden: 'Leiden',
  hr: 'Rotterdam',
  hu: 'Utrecht',
  hva: 'Amsterdam',
  viaa: 'Zwolle',
  hku: 'Utrecht',
  hotelschool: 'Den Haag',
  hz: 'Vlissingen',
  iselinge: 'Doetinchem',
  marnix: 'Utrecht',
  nhlstenden: 'Leeuwarden',
  saxion: 'Enschede',
  thomasmore: 'Rotterdam',
  vhl: 'Leeuwarden',
  windesheim: 'Zwolle',
  zuyd: 'Maastricht',
}

const INSTITUTION_SLUG_ALIASES: Record<string, string> = {
  // Common slug variants used in db seeds/imports
  'tilburg-university': 'tilburg',
  tiu: 'tilburg',
  'university-of-tilburg': 'tilburg',
  'tu-delft': 'tud',
  'erasmus-university-rotterdam': 'eur',
  'university-of-amsterdam': 'uva',
  'vrije-universiteit-amsterdam': 'vu',
  'utrecht-university': 'uu',
  'maastricht-university': 'um',
  'radboud-university': 'ru',
  'wageningen-university': 'wur',
  'university-of-twente': 'utwente',
  'open-universiteit': 'ou',
}

/**
 * Map an institution slug (from nl-institutions.v1.json / intro step) to its primary city.
 * Returns null when we don't have a confident mapping.
 */
export function mapInstitutionToCity(institutionSlug: string | null | undefined): string | null {
  if (!institutionSlug) return null
  const key = institutionSlug.toLowerCase().trim()
  const canonical = INSTITUTION_SLUG_ALIASES[key] ?? key
  return INSTITUTION_CITY_MAP[canonical] ?? null
}

/**
 * Helper to derive an initial preferred cities array from an institution slug.
 * Used to pre-fill the first city in the onboarding "Preferred Cities" step.
 */
export function getDefaultPreferredCitiesFromInstitution(
  institutionSlug: string | null | undefined
): string[] {
  const city = mapInstitutionToCity(institutionSlug)
  return city ? [city] : []
}

