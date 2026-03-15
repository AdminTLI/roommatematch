export const pdfStyles = `
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+000-5FF, U+1E00-1EFF, U+2000-206F, U+20A0-20CF;
}

:root {
  --ink: #111;
  --muted: #6B7280;
  --line: #D1D5DB;
  --accent: #0F766E;
  --warn: #B45309;
  --danger: #B91C1C;
  --success: #059669;
  --background: #FFFFFF;
}

@page {
  size: A4;
  margin: 18mm 16mm 20mm 16mm;
}

* {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink);
  margin: 0;
  padding: 0;
  background: var(--background);
}

.report-container {
  max-width: 210mm;
  margin: 0 auto;
}

.page {
  page-break-after: always;
  min-height: 297mm;
  padding: 32px 32px 40px;
}

.page:last-child {
  page-break-after: avoid;
}

/* Typography */
h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: var(--ink);
  border-bottom: 3px solid var(--accent);
  padding-bottom: 8px;
  letter-spacing: 0.02em;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  color: var(--ink);
}

h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: var(--ink);
}

p {
  margin: 0 0 12px 0;
  line-height: 1.6;
}

/* Cover Page */
.cover-page {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(circle at top left, #4f46e5, #0F766E 40%, #0f172a 100%);
  color: white;
}

.cover-content {
  max-width: 420px;
}

.logo-section {
  margin-bottom: 60px;
}

.brand-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: white;
  border: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.student-info {
  margin-bottom: 52px;
}

.student-name {
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: white;
}

.student-email {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 8px 0;
}

.report-date {
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
}

.privacy-note {
  font-size: 12px;
  opacity: 0.88;
  max-width: 320px;
  margin: 0 auto;
}

/* Table of Contents */
.toc-page h1 {
  text-align: left;
  margin-bottom: 24px;
}

.toc-nav {
  max-width: 480px;
  margin: 0;
}

.toc-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-nav li {
  margin: 8px 0;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.toc-nav a {
  color: var(--ink);
  text-decoration: none;
  font-weight: 500;
}

.toc-nav a:hover {
  color: var(--accent);
  text-decoration: underline;
}

/* Summary Page */
.summary-section {
  margin-bottom: 28px;
}

.signals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.signal-chip {
  background: #F3F4F6;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signal-label {
  font-weight: 500;
  color: var(--ink);
}

.signal-value {
  font-weight: 600;
  color: var(--accent);
  background: white;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  font-size: 11px;
}

.dealbreakers-callout {
  background: #FEF2F2;
  border: 1px solid var(--danger);
  border-radius: 12px;
  padding: 16px 18px;
  margin-top: 12px;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.heatmap-item {
  padding: 14px 12px;
  border-radius: 10px;
  text-align: left;
  border: 1px solid;
}

.heatmap-item.green {
  background: #F0FDF4;
  border-color: var(--success);
  color: #065F46;
}

.heatmap-item.amber {
  background: #FFFBEB;
  border-color: var(--warn);
  color: #92400E;
}

.heatmap-item.red {
  background: #FEF2F2;
  border-color: var(--danger);
  color: #991B1B;
}

.heatmap-title {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}

.heatmap-status {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
}

/* Section Pages */
.why-matters {
  font-style: italic;
  color: var(--muted);
  margin-bottom: 18px;
  padding: 10px 12px;
  background: #F9FAFB;
  border-left: 3px solid var(--accent);
  border-radius: 0 4px 4px 0;
}

.takeaways {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 18px 0;
}

.takeaways h3 {
  color: #065F46;
  margin-top: 0;
}

.takeaways ul {
  margin: 6px 0 0 0;
  padding-left: 18px;
}

.takeaways li {
  margin: 3px 0;
  color: #065F46;
}

.neutral-note {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 6px;
  padding: 10px 12px;
  margin: 14px 0;
  color: #92400E;
  font-style: italic;
  text-align: center;
}

/* Tables */
.qa-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  background: white;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.qa-table th {
  background: var(--accent);
  color: white;
  font-weight: 600;
  padding: 10px 14px;
  text-align: left;
}

.qa-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

.qa-table tr:last-child td {
  border-bottom: none;
}

.qa-table tr:nth-child(even) {
  background: #F9FAFB;
}

/* Scale Bar */
.scale-bar {
  width: 100%;
  max-width: 260px;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--muted);
  margin-bottom: 3px;
}

.scale-segments {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  margin-bottom: 3px;
}

.segment {
  height: 7px;
  background: var(--line);
  border-radius: 2px;
}

.segment.filled {
  background: var(--accent);
}

.scale-value {
  text-align: right;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
}

/* Deal Breaker Ribbon */
.dealbreaker-ribbon {
  background: var(--danger);
  color: white;
  padding: 7px 10px;
  border-radius: 999px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
}

.dealbreaker-ribbon .icon {
  font-weight: 700;
  font-size: 13px;
}

/* Deal Breakers Recap */
.dealbreakers-list {
  margin-top: 20px;
}

.dealbreaker-item {
  margin-bottom: 18px;
  padding: 14px 16px;
  border: 1px solid var(--danger);
  border-radius: 10px;
  background: #FEF2F2;
}

.dealbreaker-description {
  margin: 10px 0 0 0;
  font-size: 11px;
  color: #991B1B;
  font-style: italic;
}

/* Print optimizations */
@media print {
  .page {
    margin: 0;
    padding: 18mm 18mm 20mm;
    min-height: auto;
  }

  .qa-table,
  .takeaways,
  .dealbreakers-callout {
    page-break-inside: avoid;
  }
}
`;

