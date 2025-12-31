// Types for the Rent Calculator (Housing Health Check)

export type EnergyLabel = 'A++' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown'

export type BuildingEra = 'before_1970' | 'after_1970' | null

export interface RentCalculatorFormData {
  roomSize: number | null
  housemates: number | null
  energyLabel: EnergyLabel | null
  privateKitchen: boolean | null
  privateBathroom: boolean | null
  outdoorSpace: boolean | null
  buildingEra: BuildingEra
  currentRent: number | null
}

export interface WWSOPointBreakdown {
  basePoints: number
  energyLabelPoints: number
  facilitiesPoints: number
  sharedPenalty: number
  totalPoints: number
}

export interface RentThreshold {
  maxRent: number
  category: 'social' | 'mid-range' | 'liberalized'
  label: string
}

export interface CalculationResult {
  points: WWSOPointBreakdown
  threshold: RentThreshold
  rentStatus: 'overpaying' | 'fair-price' | 'market-rate'
  isOverpaying: boolean
  estimatedMaxRent: number
}

export interface QuestionConfig {
  id: number
  key: keyof RentCalculatorFormData
  label: string
  type: 'numeric' | 'dropdown' | 'toggle' | 'toggle-era'
  tooltip: string
  placeholder?: string
  options?: Array<{ label: string; value: string | number | boolean }>
  min?: number
  max?: number
  required: boolean
}

