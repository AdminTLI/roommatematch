import type { SkdbOpleiding, SkdbOpleidingVorm } from './client'

export type DegreeLevel = 'bachelor' | 'master' | 'premaster'

export type MappedSkdbProgramme = {
  institutionName: string
  name: string
  nameEn?: string
  crohoCode?: string
  rioCode?: string
  degreeLevel: DegreeLevel
  languageCodes: string[]
  faculty?: string
  lcskSector?: string
  lcskCluster?: string
  active: boolean
  ectsCredits?: number
  durationYears?: number
  durationMonths?: number
  admissionRequirements?: string
  metadata: Record<string, string | undefined>
}

function parseLanguageToken(raw: string): string | null {
  const t = raw.trim().toLowerCase()
  if (!t) return null
  if (t === 'nl' || t === 'nederlands' || t === 'dutch') return 'nl'
  if (t === 'en' || t === 'engels' || t === 'english') return 'en'
  if (t.length === 2) return t
  return null
}

function normalizeLanguageList(value: unknown): string[] {
  if (value == null) return []
  const parts: string[] = []
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') parts.push(item)
      else if (item && typeof item === 'object' && 'code' in item) {
        parts.push(String((item as { code: unknown }).code))
      }
    }
  } else if (typeof value === 'string') {
    parts.push(
      ...value.split(/[,;|/]/).map((s) => s.trim()).filter(Boolean)
    )
  }
  const codes = new Set<string>()
  for (const part of parts) {
    const code = parseLanguageToken(part)
    if (code) codes.add(code)
  }
  return [...codes]
}

export function extractLanguageCodes(opleiding: SkdbOpleiding): string[] {
  const fromRoot = normalizeLanguageList(
    opleiding.talen ?? opleiding.taalCodes ?? opleiding.onderwijstaal
  )
  if (fromRoot.length > 0) return fromRoot

  const vormen: SkdbOpleidingVorm[] = Array.isArray(opleiding.vormen)
    ? opleiding.vormen
    : []
  for (const vorm of vormen) {
    const fromVorm = normalizeLanguageList(
      vorm.talen ?? vorm.taalCodes ?? vorm.onderwijstaal
    )
    if (fromVorm.length > 0) return fromVorm
  }
  return []
}

export function isOpleidingActive(
  opleiding: SkdbOpleiding,
  now: Date = new Date()
): boolean {
  const vormen: SkdbOpleidingVorm[] = Array.isArray(opleiding.vormen)
    ? opleiding.vormen
    : []
  if (vormen.length === 0) return true
  return vormen.some((v) => {
    const end = v?.eindeOpleidingDatum
    if (!end) return true
    const d = new Date(end)
    return !Number.isNaN(d.getTime()) && d >= now
  })
}

export function parseEcts(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  const n = Number(String(raw).replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export function deriveDuration(
  degreeLevel: DegreeLevel,
  ects?: number
): { durationYears?: number; durationMonths?: number } {
  if (ects == null || !Number.isFinite(ects)) {
    return {}
  }
  let durationYears: number | undefined
  if (degreeLevel === 'bachelor') {
    durationYears = Math.max(1, Math.min(6, Math.round((ects / 60) * 10) / 10))
  } else if (degreeLevel === 'master') {
    durationYears = Math.max(0.5, Math.min(3, Math.round((ects / 60) * 10) / 10))
  } else if (degreeLevel === 'premaster') {
    durationYears = Math.max(0.5, Math.min(1.5, Math.round((ects / 60) * 10) / 10))
  }
  const durationMonths =
    durationYears != null ? Math.round(durationYears * 12) : undefined
  return { durationYears, durationMonths }
}

export function determineDegreeLevel(programmeData: {
  name?: string
  opleidingNaam?: string
  description?: string
  niveau?: string
  level?: string
  graad?: string
  titel?: string
  Titel?: string
  soortHo?: string
  SoortHo?: string
}): DegreeLevel {
  const name = (programmeData.name || programmeData.opleidingNaam || '').toLowerCase()
  const description = (programmeData.description || '').toLowerCase()
  const niveau = (programmeData.niveau || programmeData.level || programmeData.graad || '')
    .toString()
    .toLowerCase()
    .replace(/["']/g, '')
  const titel = (programmeData.Titel || programmeData.titel || '').toLowerCase()
  const soortHo = (programmeData.soortHo || programmeData.SoortHo || '')
    .toString()
    .toLowerCase()

  if (
    name.includes('pre-master') ||
    name.includes('schakelprogramma') ||
    name.includes('premaster') ||
    name.includes('bridge') ||
    name.includes('schakel') ||
    soortHo.includes('pre-master') ||
    soortHo.includes('premaster') ||
    soortHo.includes('schakel')
  ) {
    return 'premaster'
  }
  if (niveau.includes('master') || soortHo.includes('master')) return 'master'
  if (niveau.includes('bachelor')) return 'bachelor'
  if (titel.includes('master')) return 'master'
  if (titel.includes('bachelor')) return 'bachelor'
  if (
    name.includes('master') ||
    description.includes('master') ||
    name.includes('msc') ||
    name.includes('ma ')
  ) {
    return 'master'
  }
  if (
    name.includes('bachelor') ||
    description.includes('bachelor') ||
    name.includes('bsc') ||
    name.includes('ba ')
  ) {
    return 'bachelor'
  }
  return 'bachelor'
}

export function buildAdmissionRequirements(opleiding: SkdbOpleiding): string | undefined {
  const parts = [
    opleiding.wettelijkeVooropleidingEisenVwo,
    opleiding.wettelijkeAanvullendeEisenVwo,
    opleiding.wettelijkeVooropleidingEisenHavo,
    opleiding.wettelijkeAanvullendeEisenHavo,
    opleiding.toelatingsEisenMbo,
  ].filter(Boolean) as string[]
  return parts.length > 0 ? parts.join('\n\n') : undefined
}

export function resolveIdentifiers(opleiding: SkdbOpleiding): {
  crohoCode?: string
  rioCode?: string
  skdbOpleidingCode?: string
} {
  const opleidingCodeRaw =
    opleiding.opleidingCode !== undefined && opleiding.opleidingCode !== null
      ? String(opleiding.opleidingCode)
      : undefined
  const crohoRaw =
    opleiding.crohoCode !== undefined && opleiding.crohoCode !== null
      ? String(opleiding.crohoCode)
      : undefined

  const crohoCode = crohoRaw || opleidingCodeRaw
  const skdbOpleidingCode = opleidingCodeRaw
  const rioCode =
    crohoRaw && opleidingCodeRaw && crohoRaw !== opleidingCodeRaw
      ? opleidingCodeRaw
      : opleiding.rioCode != null
        ? String(opleiding.rioCode)
        : undefined

  return { crohoCode, rioCode, skdbOpleidingCode }
}

export function mapOpleidingToProgramme(
  opleiding: SkdbOpleiding,
  institutionName: string,
  now: Date = new Date()
): MappedSkdbProgramme | null {
  const name = opleiding.opleidingNaam
  if (!name || !institutionName) return null

  const degreeLevel = determineDegreeLevel({
    opleidingNaam: name,
    graad: opleiding.graad,
    soortHo: opleiding.soortHo,
  })
  const ectsCredits = parseEcts(opleiding.studieLastEcts)
  const { durationYears, durationMonths } = deriveDuration(degreeLevel, ectsCredits)
  const { crohoCode, rioCode, skdbOpleidingCode } = resolveIdentifiers(opleiding)
  const lcskSector = opleiding.lcskSector || undefined
  const lcskCluster = opleiding.lcskCluster || undefined

  return {
    institutionName,
    name,
    nameEn: opleiding.opleidingNaamEngels || opleiding.rioNaamEngels || undefined,
    crohoCode,
    rioCode,
    degreeLevel,
    languageCodes: extractLanguageCodes(opleiding),
    faculty: lcskSector || lcskCluster || undefined,
    lcskSector,
    lcskCluster,
    active: isOpleidingActive(opleiding, now),
    ectsCredits,
    durationYears,
    durationMonths,
    admissionRequirements: buildAdmissionRequirements(opleiding),
    metadata: {
      skdb_opleiding_code: skdbOpleidingCode,
      lcsk_sector: lcskSector,
      lcsk_cluster: lcskCluster,
    },
  }
}
