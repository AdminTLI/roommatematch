import {
  buildInstellingNaamMap,
  fetchInstellingen,
  fetchOpleidingen,
} from './client'
import { buildAdmissionRequirements, mapOpleidingToProgramme } from './map-opleiding'
import type {
  SkdbBlogFactsDocument,
  SkdbBlogFact,
  SkdbClusterAggregate,
  SkdbSectorAggregate,
  SkdbInstitutionAggregate,
} from './blog-facts-types'

export async function buildSkdbBlogFactsDocument(): Promise<SkdbBlogFactsDocument> {
  const instellingen = await fetchInstellingen()
  const instellingNaamById = buildInstellingNaamMap(instellingen)
  const now = new Date()
  const raw = await fetchOpleidingen()

  const opleidingen: NonNullable<ReturnType<typeof mapOpleidingToProgramme>>[] = []
  let activeCount = 0
  let withAdmission = 0
  let withEcts = 0
  let withLanguages = 0
  const byLevel: Record<string, number> = { bachelor: 0, master: 0, premaster: 0 }
  const clusterMap = new Map<string, SkdbClusterAggregate>()
  const sectorMap = new Map<string, SkdbSectorAggregate>()
  const instMap = new Map<number, SkdbInstitutionAggregate>()

  for (const row of raw) {
    const institutionName =
      instellingNaamById.get(Number(row.instellingSkdb)) ||
      row.instellingNaam ||
      'Unknown'
    const mapped = mapOpleidingToProgramme(row, String(institutionName), now)
    if (!mapped) continue

    opleidingen.push(mapped)
    if (mapped.active) activeCount++
    if (buildAdmissionRequirements(row)) withAdmission++
    if (mapped.ectsCredits != null) withEcts++
    if (mapped.languageCodes.length > 0) withLanguages++
    byLevel[mapped.degreeLevel] = (byLevel[mapped.degreeLevel] || 0) + 1

    const cluster = mapped.lcskCluster || 'Unknown cluster'
    const sector = mapped.lcskSector || 'Unknown sector'
    const c = clusterMap.get(cluster) || {
      cluster,
      sector: mapped.lcskSector,
      programmeCount: 0,
      activeCount: 0,
    }
    c.programmeCount++
    if (mapped.active) c.activeCount++
    clusterMap.set(cluster, c)

    const s = sectorMap.get(sector) || {
      sector,
      programmeCount: 0,
      activeCount: 0,
    }
    s.programmeCount++
    if (mapped.active) s.activeCount++
    sectorMap.set(sector, s)

    const instId = Number(row.instellingSkdb) || 0
    const inst = instMap.get(instId) || {
      instellingSkdb: instId,
      instellingNaam: institutionName,
      programmeCount: 0,
      activeCount: 0,
    }
    inst.programmeCount++
    if (mapped.active) inst.activeCount++
    instMap.set(instId, inst)
  }

  const total = opleidingen.length
  const facts: SkdbBlogFact[] = [
    {
      id: 'programmes_total_count',
      label: 'Programmes in Studiekeuzedatabase (API)',
      value: total,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_active_count',
      label: 'Active programmes (at least one open vorm)',
      value: activeCount,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_with_admission_requirements_count',
      label: 'Programmes with admission requirements text',
      value: withAdmission,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_with_admission_requirements_pct',
      label: 'Share of programmes with admission requirements',
      value: total > 0 ? Math.round((withAdmission / total) * 1000) / 10 : 0,
      unit: 'percent',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_with_ects_count',
      label: 'Programmes with ECTS credits',
      value: withEcts,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_with_language_codes_count',
      label: 'Programmes with instruction language codes',
      value: withLanguages,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_bachelor_count',
      label: 'Bachelor programmes (inferred level)',
      value: byLevel.bachelor || 0,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_master_count',
      label: 'Master programmes (inferred level)',
      value: byLevel.master || 0,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'programmes_premaster_count',
      label: 'Pre-master / bridge programmes (inferred level)',
      value: byLevel.premaster || 0,
      unit: 'count',
      scope: 'nl',
      source: 'opleidingen',
    },
    {
      id: 'institutions_count',
      label: 'Institutions in SKDB',
      value: instMap.size,
      unit: 'count',
      scope: 'nl',
      source: 'instellingen',
    },
  ]

  const peildatum = process.env.SKDB_PEILDATUM || new Date().toISOString().slice(0, 10)
  const skdbRelease = process.env.SKDB_RELEASE || '26.3'

  return {
    generatedAt: new Date().toISOString(),
    skdbRelease,
    peildatum,
    attribution: 'Studiekeuzedatabase (LCSK)',
    sourceMode: 'api',
    facts,
    byCluster: [...clusterMap.values()].sort((a, b) => b.programmeCount - a.programmeCount),
    bySector: [...sectorMap.values()].sort((a, b) => b.programmeCount - a.programmeCount),
    byInstitution: [...instMap.values()]
      .filter((i) => i.instellingSkdb > 0)
      .sort((a, b) => b.programmeCount - a.programmeCount),
  }
}
