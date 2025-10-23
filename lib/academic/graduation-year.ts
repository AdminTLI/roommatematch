export function calculateStudyYear(graduationYear: number, sector: 'hbo' | 'wo' | 'wo_special'): number {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12
  
  // Academic year starts in September (month 9)
  const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1
  
  // Calculate years remaining
  const yearsRemaining = graduationYear - academicYear
  
  // Total programme length
  const totalYears = sector === 'hbo' ? 4 : 3
  
  // Current year = total - remaining + 1
  const studyYear = totalYears - yearsRemaining
  
  // Clamp between 1 and totalYears
  return Math.max(1, Math.min(studyYear, totalYears))
}

export function getStudyYearOptions(sector: 'hbo' | 'wo' | 'wo_special' | null) {
  if (!sector) return []
  
  const maxYear = sector === 'hbo' ? 4 : 3
  const options = []
  
  for (let i = 1; i <= maxYear; i++) {
    options.push({
      value: i.toString(),
      label: `Year ${i}`
    })
  }
  
  options.push({
    value: (maxYear + 1).toString(),
    label: `Year ${maxYear}+`
  })
  
  return options
}
