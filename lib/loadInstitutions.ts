import data from '@/data/nl-institutions.v1.json'
import type { Institution } from '@/types/institution'

export function loadInstitutions(): { wo: Institution[]; wo_special: Institution[]; hbo: Institution[] } {
  return data as any
}

export function toGroupedOptions() {
  const { wo, wo_special, hbo } = loadInstitutions()
  const map = (arr: Institution[]) => arr.map((i) => ({ value: i.id, label: i.label }))
  return [
    { group: 'WO', options: map(wo) },
    { group: 'WO (special)', options: map(wo_special) },
    { group: 'HBO', options: map(hbo) },
  ]
}

/** Get the full display label for an institution by slug (same source as InstitutionSelect). */
export function getInstitutionLabel(slug: string): string | undefined {
  if (!slug || slug === 'other') return undefined
  const { wo, wo_special, hbo } = loadInstitutions()
  const all = [...wo, ...wo_special, ...hbo]
  return all.find((i) => i.id === slug)?.label
}


