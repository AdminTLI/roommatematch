import institutions from '@/data/nl-institutions.v1.json'

export function getInstitutionType(institutionSlug: string): 'wo' | 'hbo' | 'wo_special' {
  // Search through all institution types
  for (const woInst of institutions.wo) {
    if (woInst.id === institutionSlug) return 'wo'
  }
  for (const woSpecialInst of institutions.wo_special) {
    if (woSpecialInst.id === institutionSlug) return 'wo_special'
  }
  for (const hboInst of institutions.hbo) {
    if (hboInst.id === institutionSlug) return 'hbo'
  }
  
  // Default to HBO for unknown (treat as 4-year)
  return 'hbo'
}
