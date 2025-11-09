/**
 * Programme data types for DUO RIO integration
 * 
 * Based on DUO's "Overzicht Erkenningen ho" (RIO) dataset which contains
 * all recognised HBO/WO programmes in the Netherlands.
 * 
 * Source: DUO Open Onderwijsdata portal
 * Update frequency: Daily
 * Documentation: DUO column specification PDF
 */

export type DegreeLevel = 'bachelor' | 'premaster' | 'master';

export type Programme = {
  /** RIO OPLEIDINGSEENHEIDCODE - unique identifier from DUO */
  id: string;
  
  /** OPLEIDINGSEENHEID_NAAM - programme name in Dutch */
  name: string;
  
  /** OPLEIDINGSEENHEID_INTERNATIONALE_NAAM - English name if available */
  nameEn?: string;
  
  /** Our classification: bachelor, premaster, or master */
  level: DegreeLevel;
  
  /** Institution sector: hbo, wo, or wo_special */
  sector: 'hbo' | 'wo' | 'wo_special';
  
  /** VORM field parsed: fulltime, parttime, dual study modes */
  modes?: ('fulltime' | 'parttime' | 'dual')[];
  
  /** OPLEIDINGSEENHEID_SOORT == 'HO opleidingsvariant' */
  isVariant?: boolean;
  
  /** ONDERDEEL - discipline area */
  discipline?: string;
  
  /** SUBONDERDEEL - sub-discipline area */
  subDiscipline?: string;
  
  /** PLAATSNAAM - city if available */
  city?: string;
  
  /** External reference codes for cross-referencing */
  externalRefs?: {
    /** RIO code (OPLEIDINGSEENHEIDCODE) */
    rioCode: string;
    /** ISAT code (ERKENDEOPLEIDINGSCODE) if available */
    isat?: string;
    /** Institution code (INSTELLINGSCODE) */
    instCode: string;
  };
  
  /** Enrichment fields from Studiekeuzedatabase */
  /** CROHO code from Studiekeuzedatabase */
  crohoCode?: string;
  
  /** Language codes (e.g., ['nl', 'en']) */
  languageCodes?: string[];
  
  /** Faculty or department name */
  faculty?: string;
  
  /** Whether the programme is currently active */
  active?: boolean;
  
  /** Enrichment status */
  enrichmentStatus?: 'pending' | 'enriched' | 'failed' | 'not_found';
};

export type ProgrammesByLevel = {
  bachelor: Programme[];
  premaster: Programme[];
  master: Programme[];
};

/**
 * DUO CSV row structure matching "Overzicht Erkenningen ho" columns
 * 
 * Key columns:
 * - C: INSTELLINGSCODE (institution code/BRIN)
 * - D: INSTELLINGSNAAM (institution name)
 * - K: OPLEIDINGSEENHEIDCODE (programme code/RIO)
 * - M: OPLEIDINGSEENHEID_NAAM (programme name)
 * - N: OPLEIDINGSEENHEID_INTERNATIONALE_NAAM (international name)
 * - O: OPLEIDINGSEENHEID_SOORT (programme type)
 * - R: NIVEAU (level: HBO-BA, WO-MA, etc.)
 * - S: GRAAD (degree: Bachelor, Master, etc.)
 * - X: VORM (form: VOLTIJD, DEELTIJD, DUAAL)
 * - Y: ONDERDEEL (discipline)
 * - Z: SUBONDERDEEL (sub-discipline)
 */
export type DuoRow = {
  INSTELLINGSCODE: string;                 // C - Institution code (BRIN)
  INSTELLINGSNAAM: string;                 // D - Institution name
  VESTIGINGSNAAM?: string;                 // F - Campus name
  PLAATSNAAM?: string;                     // H - City
  ERKENDEOPLEIDINGSCODE?: string;          // I - ISAT code
  OPLEIDINGSEENHEIDCODE: string;           // K - RIO code (programme ID)
  OPLEIDINGSEENHEID_NAAM: string;          // M - Programme name
  OPLEIDINGSEENHEID_INTERNATIONALE_NAAM?: string; // N - International name
  OPLEIDINGSEENHEID_SOORT?: string;        // O - Programme type
  NIVEAU: string;                          // R - Level (HBO-BA, WO-MA, etc.)
  GRAAD?: string;                          // S - Degree (Bachelor, Master, etc.)
  VORM?: string;                           // X - Study form (VOLTIJD, DEELTIJD, DUAAL)
  ONDERDEEL?: string;                      // Y - Discipline
  SUBONDERDEEL?: string;                   // Z - Sub-discipline
};
