export type InstitutionKind = 'wo' | 'wo_special' | 'hbo'

/**
 * Institution codes for mapping to external datasets
 * 
 * BRIN codes are used by DUO for institution identification
 * RIO institution codes are used in RIO programme dataset
 */
export type InstitutionCodes = {
  /** INSTELLINGSCODE from DUO - former BRIN code */
  brin?: string;
  /** RIO institution code for programme lookups */
  rioInstCode?: string;
};

export type Institution = {
  id: string
  label: string
  kind: InstitutionKind
  aliases?: string[]
  /** External reference codes for data mapping */
  codes?: InstitutionCodes
}


