import type { SectionKey } from '@/types/questionnaire'
import type { Item } from '@/types/questionnaire'
import { pdfStyles } from './styles'
import { humanizeAnswer } from '@/lib/matching/answer-humanizer'

export type OnboardingPdfSection = {
  id: SectionKey
  title: string
  whyItMatters: string
  items: Array<{
    id: string
    label: string
    valueText: string
    dealBreaker: boolean
  }>
}

export type OnboardingPdfData = {
  student: { name: string; email?: string }
  generatedAtISO: string
  sections: OnboardingPdfSection[]
}

export function generateOnboardingAgreementHtml(data: OnboardingPdfData): string {
  const dealBreakers = data.sections
    .flatMap((s) => s.items.filter((it) => it.dealBreaker).map((it) => ({ sectionId: s.id, label: it.label })))

  const sectionsHtml = data.sections.map((s) => generateSectionPage(s)).join('')
  const tocHtml = generateTableOfContents(data.sections, dealBreakers.length > 0)
  const coverHtml = generateCoverPage(data.student, data.generatedAtISO)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roommate Agreement - Compatibility Profile</title>
  <style>
    ${pdfStyles}
  </style>
</head>
<body>
  <div class="report-container">
    ${coverHtml}
    ${tocHtml}
    ${sectionsHtml}
    ${dealBreakers.length > 0 ? generateDealBreakersRecap(dealBreakers) : ''}
  </div>
</body>
</html>
`.trim()
}

function generateCoverPage(student: { name: string; email?: string }, dateISO: string): string {
  const date = new Date(dateISO).toLocaleDateString()

  return `
<div class="page cover-page">
  <div class="cover-content">
    <div class="logo-section">
      <h1 class="brand-title">Domu Match</h1>
      <div class="brand-subtitle">Compatibility Profile</div>
    </div>

    <div class="student-info">
      <h2 class="student-name">${escapeHtml(student.name)}</h2>
      ${student.email ? `<p class="student-email">${escapeHtml(student.email)}</p>` : ''}
      <p class="report-date">Generated: ${escapeHtml(date)}</p>
    </div>

    <div class="privacy-note">
      <p>This report contains personal preferences and should be shared only with potential roommates.</p>
    </div>
  </div>
</div>
  `
}

function generateTableOfContents(sections: OnboardingPdfSection[], hasDealBreakers: boolean): string {
  return `
<div class="page toc-page">
  <h1>Table of Contents</h1>
  <nav class="toc-nav">
    <ul>
      ${sections.map((s) => `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`).join('')}
      ${hasDealBreakers ? `<li><a href="#deal-breakers-recap">Deal Breakers Recap</a></li>` : ''}
    </ul>
  </nav>
</div>
  `
}

function generateSectionPage(section: OnboardingPdfSection): string {
  return `
<div class="page section-page" id="${escapeHtml(section.id)}">
  <h2>${escapeHtml(section.title)}</h2>
  <p class="why-matters">${escapeHtml(section.whyItMatters)}</p>

  <table class="qa-table">
    <thead>
      <tr><th>Question</th><th>Your Answer</th></tr>
    </thead>
    <tbody>
      ${section.items
        .map(
          (it) => `
          <tr>
            <td>${escapeHtml(it.label)}</td>
            <td>
              <span>${escapeHtml(it.valueText)}</span>
              ${it.dealBreaker ? generateDealBreakerRibbon('Non-negotiable') : ''}
            </td>
          </tr>
        `
        )
        .join('')}
    </tbody>
  </table>
</div>
  `
}

function generateDealBreakerRibbon(text: string): string {
  return `
<div class="dealbreaker-ribbon">
  <span class="icon" aria-hidden="true">!</span>
  <span>Deal Breaker: ${escapeHtml(text)}</span>
</div>
  `
}

function generateDealBreakersRecap(dealBreakers: Array<{ sectionId: SectionKey; label: string }>): string {
  const unique = Array.from(new Map(dealBreakers.map((d) => [`${d.sectionId}:${d.label}`, d])).values())

  return `
<div class="page" id="deal-breakers-recap">
  <h1>Deal Breakers Recap</h1>
  <div class="dealbreakers-list">
    ${unique
      .map(
        (db) => `
      <div class="dealbreaker-item">
        ${generateDealBreakerRibbon(db.label)}
        <p class="dealbreaker-description">
          This is non-negotiable and must be respected in any roommate arrangement.
        </p>
      </div>
    `
      )
      .join('')}
  </div>
</div>
  `
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m)
}

/**
 * Convenience helper for servers/clients:
 * Turn raw onboarding store values into the section structure expected by the generator.
 */
export function buildOnboardingPdfSections(args: {
  items: Item[]
  onboardingSections: Record<SectionKey, Record<string, { value: any; dealBreaker?: boolean }>>
  sectionMeta: Record<SectionKey, { title: string; whyItMatters: string }>
}): OnboardingPdfSection[] {
  const { items, onboardingSections, sectionMeta } = args

  const itemsBySection = items.reduce<Record<SectionKey, Item[]>>((acc, it) => {
    acc[it.section as SectionKey] ??= []
    acc[it.section as SectionKey].push(it)
    return acc
  }, {} as Record<SectionKey, Item[]>)

  const orderedSectionKeys = Object.keys(sectionMeta) as SectionKey[]

  return orderedSectionKeys
    .map((sectionId) => {
      const itemList = itemsBySection[sectionId] || []
      const answers = onboardingSections[sectionId] || {}

      const answeredItems = itemList
        .filter((it) => answers[it.id]?.value !== undefined)
        .map((it) => {
          const ans = answers[it.id]
          return {
            id: it.id,
            label: it.label,
            valueText: humanizeAnswer(it.id, ans.value),
            dealBreaker: !!ans.dealBreaker,
          }
        })

      return {
        id: sectionId,
        title: sectionMeta[sectionId].title,
        whyItMatters: sectionMeta[sectionId].whyItMatters,
        items: answeredItems,
      }
    })
    .filter((s) => s.items.length > 0)
}

