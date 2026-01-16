// Types for the WWS (Woningwaarderingsstelsel) Rent Check Calculator

export type HousingType = 'independent' | 'non-independent'

export type EnergyLabel = 'A++++' | 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown'

export type KitchenCounterLength = '<1m' | '1-2m' | '≥2m'

export type HobType = 'induction' | 'ceramic' | 'gas'

export type ToiletType = 'standard' | 'hanging' | 'sanibroyeur'

export type HeatingType = 'central' | 'gas'

export type SanitaryFacilityType = 
  | 'washbasin'
  | 'multi-washbasin'
  | 'shower'
  | 'bath'
  | 'bath-separate-shower'

export interface KitchenAppliance {
  type: 
    | 'hob-induction'
    | 'hob-ceramic'
    | 'hob-gas'
    | 'extractor-hood'
    | 'fridge'
    | 'freezer'
    | 'oven-electric'
    | 'oven-combi'
    | 'dishwasher'
  points: number
}

export interface SanitaryFacility {
  type: SanitaryFacilityType
  points: number
}

export interface WWSFormData {
  housingType: HousingType | null
  privateSurfaceArea: number | null
  sharedSurfaceArea: number | null
  wozValue: number | null
  energyLabel: EnergyLabel | null
  kitchenCounterLength: KitchenCounterLength | null
  kitchenAppliances: KitchenAppliance[]
  kitchenShared: boolean | null
  kitchenNumSharers: number | null
  toiletType: ToiletType | null
  toiletInBathroom: boolean
  sanitaryFacilities: SanitaryFacility[]
  sanitaryShared: boolean | null
  sanitaryNumSharers: number | null
  heatingType: HeatingType | null
  numHeatedRooms: number | null
  thermostatValves: boolean
  numThermostatValves: number | null
  privateOutdoorSpace: number | null
  sharedOutdoorSpace: number | null
  outdoorNumSharers: number | null
  address: string
  currentRent: number | null
}

export interface WWSPointBreakdown {
  // Section A: Kitchen
  kitchen: {
    counterLength: number
    appliances: number
    total: number
    shared: boolean
    numSharers: number | null
    finalPoints: number // After division if shared
  }
  // Section B: Sanitary
  sanitary: {
    toilet: number
    washing: number
    heating: number
    thermostatBonus: number
    total: number
    shared: boolean
    numSharers: number | null
    finalPoints: number // After division if shared
  }
  // Section C: Surface Area
  surface: {
    private: number
    shared: number
    total: number
  }
  // Section D: Energy Label
  energy: number
  // Section E: Outdoor Space
  outdoor: {
    private: number
    shared: number
    total: number
  }
  // Section F: WOZ
  woz: {
    rawPoints: number
    cappedPoints: number
    applied: boolean // false for non-independent
  }
  // Total
  totalPoints: number
}

export interface WWSResult {
  points: WWSPointBreakdown
  maxRent: number
  category: 'social' | 'mid-range' | 'liberalized'
  currentRent: number | null
  isOverpaying: boolean
  overpaymentAmount: number | null
}



