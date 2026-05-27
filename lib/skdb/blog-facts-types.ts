export type SkdbBlogFact = {
  id: string
  label: string
  value: number | string
  unit?: 'count' | 'percent' | 'ratio' | 'text'
  scope?: string
  source: string
  peildatum?: string
  notes?: string
}

export type SkdbClusterAggregate = {
  cluster: string
  sector?: string
  programmeCount: number
  activeCount: number
}

export type SkdbSectorAggregate = {
  sector: string
  programmeCount: number
  activeCount: number
}

export type SkdbInstitutionAggregate = {
  instellingSkdb: number
  instellingNaam: string
  programmeCount: number
  activeCount: number
}

export type SkdbBlogFactsDocument = {
  generatedAt: string
  skdbRelease: string
  peildatum: string
  attribution: string
  sourceMode: 'api' | 'dump' | 'api+dump'
  facts: SkdbBlogFact[]
  byCluster: SkdbClusterAggregate[]
  bySector: SkdbSectorAggregate[]
  byInstitution: SkdbInstitutionAggregate[]
}
