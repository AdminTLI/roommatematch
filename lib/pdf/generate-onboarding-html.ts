import fs from 'fs'
import path from 'path'
import type { SectionKey } from '@/types/questionnaire'
import type { Item } from '@/types/questionnaire'
import { pdfStyles } from './styles'

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
  documentId: string
  sections: OnboardingPdfSection[]
}

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: [
    'Very uncomfortable',
    'Uncomfortable',
    'Neutral',
    'Comfortable',
    'Very comfortable',
  ],
}

function getLogoDataUri(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public/images/logo.png')
    const buf = fs.readFileSync(logoPath)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
}

function humanizeItemAnswer(item: Item, value: unknown): string {
  if (value === undefined || value === null) return ''

  let raw: any = value
  if (typeof value === 'object' && value !== null && 'kind' in (value as object)) {
    raw = value
  }

  switch (item.kind) {
    case 'likert': {
      const v =
        typeof raw === 'object' && raw !== null && 'value' in raw
          ? Number((raw as { value: number }).value)
          : Number(raw)
      const scale = (item.scale ?? 'agreement') as keyof typeof scaleAnchors
      return scaleAnchors[scale]?.[v - 1] || String(v)
    }
    case 'bipolar': {
      const v =
        typeof raw === 'object' && raw !== null && 'value' in raw
          ? Number((raw as { value: number }).value)
          : Number(raw)
      const left = item.bipolarLabels?.left ?? ''
      const right = item.bipolarLabels?.right ?? ''
      if (v === 1) return left
      if (v === 5) return right
      if (v === 3) return 'Neutral'
      if (v === 2) return item.bipolarLabels?.softLeft ?? left
      if (v === 4) return item.bipolarLabels?.softRight ?? right
      return `${v}/5`
    }
    case 'mcq': {
      const v =
        typeof raw === 'object' && raw !== null && 'value' in raw
          ? String((raw as { value: string }).value)
          : String(raw)
      return item.options?.find((o) => o.value === v)?.label || v
    }
    case 'toggle': {
      const v =
        typeof raw === 'object' && raw !== null && 'value' in raw
          ? Boolean((raw as { value: boolean }).value)
          : Boolean(raw)
      return v ? 'Yes' : 'No'
    }
    case 'timeRange': {
      if (typeof raw === 'object' && raw !== null && 'start' in raw && 'end' in raw) {
        const range = raw as { start: string; end: string }
        return `${range.start} - ${range.end}`
      }
      return String(raw)
    }
    case 'number': {
      const v =
        typeof raw === 'object' && raw !== null && 'value' in raw
          ? (raw as { value: number }).value
          : raw
      return String(v)
    }
    default:
      if (typeof raw === 'object' && raw !== null && 'value' in raw) {
        return String((raw as { value: unknown }).value)
      }
      return String(raw)
  }
}

export function generateOnboardingAgreementHtml(data: OnboardingPdfData): string {
  const logo = getLogoDataUri()
  const dealBreakers = data.sections.flatMap((s) =>
    s.items
      .filter((it) => it.dealBreaker)
      .map((it) => ({ sectionTitle: s.title, label: it.label, valueText: it.valueText }))
  )

  const generatedAt = formatLongDate(data.generatedAtISO)
  const sectionsHtml = data.sections.map((s) => generateSectionPage(s)).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Domu Match Compatibility Preference Profile</title>
  <style>
    ${pdfStyles}
    ${onboardingPdfExtraStyles}
  </style>
</head>
<body>
  <div class="report-container">
    ${generateCoverPage({ ...data, logo, generatedAt })}
    ${generateLegalPage(data, generatedAt)}
    ${generateTableOfContents(data.sections, dealBreakers.length > 0)}
    ${sectionsHtml}
    ${dealBreakers.length > 0 ? generateDealBreakersRecap(dealBreakers) : ''}
    ${generateClosingPage(data, generatedAt)}
  </div>
</body>
</html>
`.trim()
}

function generateCoverPage(args: {
  student: { name: string; email?: string }
  documentId: string
  logo: string
  generatedAt: string
}): string {
  return `
<div class="page cover-page onboarding-cover">
  <div class="cover-top">
    <div class="brand-lockup">
      ${args.logo ? `<img class="brand-logo" src="${args.logo}" alt="Domu Match" />` : ''}
      <div>
        <div class="brand-title">Domu Match</div>
        <div class="brand-subtitle">Roommate Compatibility</div>
      </div>
    </div>
    <div class="doc-badge">Official profile export</div>
  </div>

  <div class="cover-main">
    <p class="cover-kicker">Compatibility Preference Profile</p>
    <h1 class="cover-heading">Living preferences summary</h1>
    <p class="cover-lead">
      A structured overview of questionnaire answers used for roommate matching.
      Intended for personal use and sharing with prospective housemates.
    </p>

    <div class="cover-card">
      <div class="cover-row">
        <span class="cover-label">Prepared for</span>
        <span class="cover-value">${escapeHtml(args.student.name)}</span>
      </div>
      ${
        args.student.email
          ? `<div class="cover-row">
              <span class="cover-label">Account email</span>
              <span class="cover-value">${escapeHtml(args.student.email)}</span>
            </div>`
          : ''
      }
      <div class="cover-row">
        <span class="cover-label">Generated</span>
        <span class="cover-value">${escapeHtml(args.generatedAt)}</span>
      </div>
      <div class="cover-row">
        <span class="cover-label">Document ID</span>
        <span class="cover-value mono">${escapeHtml(args.documentId)}</span>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <p><strong>Confidential.</strong> Contains personal data under the EU GDPR. Share only with people you trust.</p>
    <p>Issued by DMS Enterprise (eenmanszaak), trading as Domu Match · Netherlands · KVK 97573337</p>
  </div>
</div>
  `
}

function generateLegalPage(data: OnboardingPdfData, generatedAt: string): string {
  return `
<div class="page legal-page" id="gdpr-notice">
  <h1>Document notice &amp; GDPR information</h1>

  <div class="info-grid">
    <div class="info-box">
      <h3>Data controller</h3>
      <p>
        DMS Enterprise (eenmanszaak), trading as Domu Match (handelsnaam), Netherlands.<br />
        KVK: 97573337<br />
        Privacy contact: domumatch@gmail.com<br />
        Website: https://domumatch.com
      </p>
    </div>
    <div class="info-box">
      <h3>Document details</h3>
      <p>
        Document ID: <span class="mono">${escapeHtml(data.documentId)}</span><br />
        Generated: ${escapeHtml(generatedAt)}<br />
        Format: PDF export of onboarding answers<br />
        Classification: Personal / confidential
      </p>
    </div>
  </div>

  <h2>Purpose of this document</h2>
  <p>
    This PDF is an export of your Domu Match compatibility questionnaire answers. It helps you review
    your preferences and, if you choose, share them with prospective roommates or housing contacts.
  </p>

  <h2>Legal basis (GDPR)</h2>
  <ul class="legal-list">
    <li><strong>Art. 6(1)(b) GDPR</strong> - processing needed to provide matching services under our terms.</li>
    <li><strong>Art. 6(1)(a) GDPR</strong> - where you choose to download or share this export yourself.</li>
    <li>Special-category answers (if any) are handled under the bases described in our Privacy Policy.</li>
  </ul>

  <h2>Your responsibilities when sharing</h2>
  <ul class="legal-list">
    <li>Only share this file with people you intend to live with or evaluate as housemates.</li>
    <li>Do not post this document publicly or upload it to open forums.</li>
    <li>Recipients should treat this file as confidential personal data.</li>
  </ul>

  <h2>Your rights</h2>
  <p>
    Under the GDPR and the Dutch UAVG you can request access, rectification, erasure, restriction,
    portability, and objection where applicable. Contact <strong>domumatch@gmail.com</strong>.
    Full details: https://domumatch.com/privacy
  </p>

  <div class="notice-box">
    <strong>Important:</strong> This export is generated from your live profile answers at the time of download.
    It is not a notarised certificate, lease, or identity document. Matching outcomes may still change as
    preferences or pool composition change.
  </div>
</div>
  `
}

function generateTableOfContents(sections: OnboardingPdfSection[], hasDealBreakers: boolean): string {
  return `
<div class="page toc-page">
  <h1>Contents</h1>
  <nav class="toc-nav">
    <ul>
      <li><a href="#gdpr-notice">Document notice &amp; GDPR information</a></li>
      ${sections.map((s) => `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`).join('')}
      ${hasDealBreakers ? `<li><a href="#deal-breakers-recap">Dealbreakers summary</a></li>` : ''}
      <li><a href="#closing">Authenticity &amp; contact</a></li>
    </ul>
  </nav>
</div>
  `
}

function generateSectionPage(section: OnboardingPdfSection): string {
  return `
<div class="page section-page" id="${escapeHtml(section.id)}">
  <div class="section-header">
    <p class="section-kicker">Module</p>
    <h2>${escapeHtml(section.title)}</h2>
    <p class="why-matters">${escapeHtml(section.whyItMatters)}</p>
  </div>

  <table class="qa-table">
    <thead>
      <tr><th style="width:58%">Question</th><th>Your answer</th></tr>
    </thead>
    <tbody>
      ${section.items
        .map(
          (it) => `
          <tr>
            <td>${escapeHtml(it.label)}</td>
            <td>
              <span>${escapeHtml(it.valueText)}</span>
              ${it.dealBreaker ? `<div class="dealbreaker-pill">Dealbreaker enabled</div>` : ''}
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

function generateDealBreakersRecap(
  dealBreakers: Array<{ sectionTitle: string; label: string; valueText: string }>
): string {
  return `
<div class="page" id="deal-breakers-recap">
  <h1>Dealbreakers summary</h1>
  <p>
    These answers were marked as dealbreakers. In Domu Match, dealbreaker matching only shows
    roommates who gave the same answer on that question.
  </p>
  <div class="dealbreakers-list">
    ${dealBreakers
      .map(
        (db) => `
      <div class="dealbreaker-item">
        <div class="dealbreaker-ribbon">
          <span class="icon" aria-hidden="true">!</span>
          <span>${escapeHtml(db.sectionTitle)}</span>
        </div>
        <p class="dealbreaker-description"><strong>${escapeHtml(db.label)}</strong><br />Answer: ${escapeHtml(db.valueText)}</p>
      </div>
    `
      )
      .join('')}
  </div>
</div>
  `
}

function generateClosingPage(data: OnboardingPdfData, generatedAt: string): string {
  return `
<div class="page" id="closing">
  <h1>Authenticity &amp; contact</h1>
  <p>
    This document was generated by Domu Match for the account holder named on the cover page.
    Verify authenticity by confirming the Document ID below against the download time in your Domu Match account.
  </p>

  <div class="info-box">
    <p>
      <strong>Document ID:</strong> <span class="mono">${escapeHtml(data.documentId)}</span><br />
      <strong>Generated:</strong> ${escapeHtml(generatedAt)}<br />
      <strong>Issuer:</strong> DMS Enterprise (eenmanszaak), trading as Domu Match<br />
      <strong>KVK:</strong> 97573337 · Netherlands<br />
      <strong>Support / privacy:</strong> domumatch@gmail.com<br />
      <strong>Privacy policy:</strong> https://domumatch.com/privacy<br />
      <strong>Terms:</strong> https://domumatch.com/terms
    </p>
  </div>

  <div class="notice-box">
    Domu Match · From strangers to roommates · © ${new Date(data.generatedAtISO).getFullYear()} DMS Enterprise.
    All rights reserved. Unauthorised alteration of this document may misrepresent the account holder&apos;s preferences.
  </div>
</div>
  `
}

function formatLongDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(iso))
  } catch {
    return new Date(iso).toISOString()
  }
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

const onboardingPdfExtraStyles = `
.onboarding-cover {
  background: linear-gradient(160deg, #312e81 0%, #4F46E5 42%, #0f172a 100%) !important;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px 28px 24px !important;
  min-height: auto !important;
}

.cover-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}

.onboarding-cover .brand-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: none;
  margin: 0;
  border: none;
  color: #fff;
}

.onboarding-cover .brand-subtitle {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.85;
}

.doc-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 999px;
  padding: 6px 10px;
  white-space: nowrap;
}

.cover-main {
  max-width: 520px;
  margin: 48px 0;
}

.cover-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.8;
  margin: 0 0 8px;
}

.cover-heading {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px;
  border: none;
  color: #fff;
  line-height: 1.2;
}

.cover-lead {
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.9;
  margin: 0 0 22px;
  max-width: 440px;
}

.cover-card {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 14px;
  padding: 14px 16px;
}

.cover-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  font-size: 12px;
}

.cover-row:last-child { border-bottom: none; }
.cover-label { opacity: 0.75; }
.cover-value { font-weight: 600; text-align: right; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }

.cover-footer {
  font-size: 10px;
  line-height: 1.45;
  opacity: 0.85;
}
.cover-footer p { margin: 0 0 6px; }

.legal-page h2 { margin-top: 18px; }
.legal-list { margin: 0 0 14px; padding-left: 18px; }
.legal-list li { margin: 6px 0; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0 0 18px;
}

.info-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 14px;
}
.info-box h3 { margin: 0 0 8px; font-size: 13px; }
.info-box p { margin: 0; font-size: 12px; color: #334155; }

.notice-box {
  margin-top: 16px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 12px;
  color: #312e81;
}

.section-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748B;
  margin: 0 0 4px;
}
.section-header h2 { margin-top: 0; border: none; }
.why-matters { color: #64748B; margin: 0 0 16px; }

.qa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.qa-table th {
  text-align: left;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748B;
  border-bottom: 2px solid #E2E8F0;
  padding: 8px 10px;
  background: #F8FAFC;
}
.qa-table td {
  border-bottom: 1px solid #E2E8F0;
  padding: 10px;
  vertical-align: top;
  color: #0F172A;
}

.dealbreaker-pill {
  display: inline-block;
  margin-top: 6px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
}
`

/**
 * Turn raw onboarding store values into the section structure expected by the generator.
 */
export function buildOnboardingPdfSections(args: {
  items: Item[]
  onboardingSections: Record<
    string,
    Record<string, { value: any; dealBreaker?: boolean; userSetGate?: boolean }>
  >
  sectionMeta: Record<string, { title: string; whyItMatters: string }>
}): OnboardingPdfSection[] {
  const { items, onboardingSections, sectionMeta } = args

  const itemsBySection = items.reduce<Record<string, Item[]>>((acc, it) => {
    acc[it.section] ??= []
    acc[it.section].push(it)
    return acc
  }, {})

  const orderedSectionKeys = Object.keys(sectionMeta)

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
            valueText: humanizeItemAnswer(it, ans.value),
            dealBreaker: !!ans.dealBreaker || !!ans.userSetGate,
          }
        })

      return {
        id: sectionId as SectionKey,
        title: sectionMeta[sectionId].title,
        whyItMatters: sectionMeta[sectionId].whyItMatters,
        items: answeredItems,
      }
    })
    .filter((s) => s.items.length > 0)
}
