import fs from 'fs'
import path from 'path'

export interface Campus {
  value: string
  label: string
  group: string
}

export interface CampusData {
  [universitySlug: string]: Campus[]
}

// Load campus data from JSON file
export function loadCampuses(): CampusData {
  try {
    const filePath = path.join(process.cwd(), 'data', 'nl-campuses.v1.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to load campus data:', error)
    return {}
  }
}

// Get campuses for a specific university
export function getCampusesForUniversity(universitySlug: string): Campus[] {
  const campusData = loadCampuses()
  return campusData[universitySlug] || []
}

// Get all campuses grouped by university
export function getAllCampuses(): CampusData {
  return loadCampuses()
}

// Map university domains to slugs for campus filtering
const universityDomainMap: Record<string, string> = {
  'student.uva.nl': 'uva',
  'uva.nl': 'uva',
  'student.tudelft.nl': 'tudelft',
  'tudelft.nl': 'tudelft',
  'student.eur.nl': 'eur',
  'eur.nl': 'eur',
  'student.vu.nl': 'vu',
  'vu.nl': 'vu',
  'student.hva.nl': 'hva',
  'hva.nl': 'hva',
}

// Get university slug from domain
export function getUniversitySlugFromDomain(domain: string): string | null {
  return universityDomainMap[domain] || null
}

// Get campuses for a university by domain
export function getCampusesByDomain(domain: string): Campus[] {
  const slug = getUniversitySlugFromDomain(domain)
  if (!slug) return []
  return getCampusesForUniversity(slug)
}