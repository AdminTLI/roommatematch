import type { QuestionnaireResult, Section, SectionAnswer } from '@/types/report';
import { extractTopSignals, extractDealBreakers, sectionTrafficLight, sectionScore } from './scoring';
import { deriveTakeaways } from './derive-takeaways';

export function generateReportHtml(data: QuestionnaireResult): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roommate Compatibility Report</title>
  <link rel="stylesheet" href="/pdf-styles.css">
</head>
<body>
  <div class="report-container">
    ${generateCoverPage(data.student, data.generatedAtISO)}
    ${generateTableOfContents(data.sections)}
    ${generateSummaryPage(data.sections)}
    ${data.sections.map(section => generateSectionBlock(section)).join('')}
    ${generateDealBreakersRecap(data.sections)}
  </div>
</body>
</html>
  `.trim();
}

function generateCoverPage(student: { name: string; email?: string }, date: string): string {
  return `
<div class="page cover-page">
  <div class="cover-content">
    <div class="logo-section">
      <h1 class="brand-title">Domu Match</h1>
      <div class="brand-subtitle">Compatibility Report</div>
    </div>
    
    <div class="student-info">
      <h2 class="student-name">${escapeHtml(student.name)}</h2>
      ${student.email ? `<p class="student-email">${escapeHtml(student.email)}</p>` : ''}
      <p class="report-date">Generated: ${new Date(date).toLocaleDateString()}</p>
    </div>
    
    <div class="privacy-note">
      <p>This report contains personal preferences and should be shared only with potential roommates.</p>
    </div>
  </div>
</div>
  `;
}

function generateTableOfContents(sections: Section[]): string {
  return `
<div class="page toc-page">
  <h1>Table of Contents</h1>
  <nav class="toc-nav">
    <ul>
      <li><a href="#summary">Executive Summary</a></li>
      ${sections.map(s => `<li><a href="#${s.id}">${escapeHtml(s.title)}</a></li>`).join('')}
      <li><a href="#deal-breakers-recap">Deal Breakers Recap</a></li>
    </ul>
  </nav>
</div>
  `;
}

function generateSummaryPage(sections: Section[]): string {
  const topSignals = extractTopSignals(sections);
  const dealBreakers = extractDealBreakers(sections);
  const heatMap = sections.map(s => ({
    title: s.title,
    status: sectionTrafficLight(sectionScore(s))
  }));

  return `
<div class="page" id="summary">
  <h1>Executive Summary</h1>
  
  <section class="summary-section">
    <h2>Top 10 Signals</h2>
    <div class="signals-grid">
      ${topSignals.map(signal => generateSignalChip(signal)).join('')}
    </div>
  </section>

  ${dealBreakers.length > 0 ? `
  <section class="summary-section">
    <h2>Deal Breakers</h2>
    <div class="dealbreakers-callout">
      ${dealBreakers.map(db => generateDealBreakerRibbon(db.label)).join('')}
    </div>
  </section>
  ` : ''}

  <section class="summary-section">
    <h2>Section Heat Map</h2>
    <div class="heatmap-grid">
      ${heatMap.map(item => `
        <div class="heatmap-item ${item.status}">
          <span class="heatmap-title">${escapeHtml(item.title)}</span>
          <span class="heatmap-status">${item.status}</span>
        </div>
      `).join('')}
    </div>
  </section>
</div>
  `;
}

function generateSignalChip(signal: SectionAnswer): string {
  const value = formatSignalValue(signal.value);
  return `
<div class="signal-chip">
  <span class="signal-label">${escapeHtml(signal.label)}</span>
  <span class="signal-value">${escapeHtml(value)}</span>
</div>
  `;
}

function formatSignalValue(value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  return String(value);
}

function generateSectionBlock(section: Section): string {
  const takeaways = deriveTakeaways(section);
  const neutralCount = section.answers.filter(a => a.value === 'Neutral').length;
  const showCollapsed = neutralCount > section.answers.length * 0.6;

  return `
<div class="page section-page" id="${section.id}">
  <h2>${escapeHtml(section.title)}</h2>
  <p class="why-matters">${escapeHtml(section.whyItMatters)}</p>
  
  ${takeaways.length > 0 ? `
  <div class="takeaways">
    <h3>Key Takeaways</h3>
    <ul>
      ${takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${showCollapsed ? '<p class="neutral-note">Most responses neutral; outliers highlighted below.</p>' : ''}

  <table class="qa-table">
    <thead>
      <tr><th>Question</th><th>Answer</th></tr>
    </thead>
    <tbody>
      ${section.answers
        .filter(a => !showCollapsed || a.value !== 'Neutral')
        .map(answer => `
          <tr>
            <td>${escapeHtml(answer.label)}</td>
            <td>
              ${typeof answer.value === 'number' && answer.meta?.endpoints 
                ? generateScaleBar(answer.value as 1|2|3|4|5, answer.meta.endpoints[0], answer.meta.endpoints[1])
                : `<span>${escapeHtml(String(answer.value))}</span>`
              }
              ${answer.dealBreaker?.isDealBreaker 
                ? generateDealBreakerRibbon(answer.dealBreaker.note || 'Non-negotiable')
                : ''
              }
            </td>
          </tr>
        `).join('')}
    </tbody>
  </table>
</div>
  `;
}

function generateScaleBar(value: 1|2|3|4|5, leftLabel: string, rightLabel: string): string {
  const segments = Array.from({length: 5}, (_, i) => 
    `<div class="segment ${i < value ? 'filled' : ''}"></div>`
  ).join('');

  return `
<div class="scale-bar">
  <div class="scale-labels">
    <span>${escapeHtml(leftLabel)}</span>
    <span>${escapeHtml(rightLabel)}</span>
  </div>
  <div class="scale-segments">
    ${segments}
  </div>
  <div class="scale-value">${value}/5</div>
</div>
  `;
}

function generateDealBreakerRibbon(text: string): string {
  return `
<div class="dealbreaker-ribbon">
  <span class="icon" aria-hidden="true">!</span>
  <span>Deal Breaker: ${escapeHtml(text)}</span>
</div>
  `;
}

function generateDealBreakersRecap(sections: Section[]): string {
  const dealBreakers = extractDealBreakers(sections);
  
  if (dealBreakers.length === 0) return '';

  return `
<div class="page" id="deal-breakers-recap">
  <h1>Deal Breakers Recap</h1>
  <div class="dealbreakers-list">
    ${dealBreakers.map((db, index) => `
      <div class="dealbreaker-item">
        ${generateDealBreakerRibbon(db.label)}
        <p class="dealbreaker-description">
          This is non-negotiable and must be respected in any roommate arrangement.
        </p>
      </div>
    `).join('')}
  </div>
</div>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
