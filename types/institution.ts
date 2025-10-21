export type InstitutionKind = 'wo' | 'wo_special' | 'hbo'

export type Institution = {
  id: string
  label: string
  kind: InstitutionKind
  aliases?: string[]
}


