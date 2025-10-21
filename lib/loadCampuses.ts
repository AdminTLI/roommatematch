import data from '@/data/nl-campuses.v1.json'

type CampusOption = { value: string; label: string; group?: string }

export function loadCampuses(): CampusOption[] {
  return (data as any) as CampusOption[]
}


