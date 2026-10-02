import type { ArchetypeResult } from '@/lib/vibe-check/archetype'
import { VIBE_MODULE_LABELS, type VibeModule } from '@/lib/vibe-check/questions'

export interface VibeCheckPdfData {
  university: string
  city: string
  archetype: ArchetypeResult
  matchCount: number
  lifestyleFitPercent?: number
  generatedAt: string
  verificationId: string
  appUrl?: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const PROFILE_AXIS: Record<
  VibeModule,
  { low: string; mid: string; high: string }
> = {
  environment: { low: 'Early & quiet', mid: 'Flexible rhythm', high: 'Later & flexible' },
  cleanliness: { low: 'More relaxed', mid: 'Lived-in tidy', high: 'Very tidy' },
  communication: { low: 'Holds back', mid: 'Balanced', high: 'Speaks up early' },
  social: { low: 'Quiet home', mid: 'Occasional guests', high: 'Social hub' },
}

const MODULE_ORDER: VibeModule[] = [
  'environment',
  'cleanliness',
  'communication',
  'social',
]

export function generateVibeCheckPassportHtml(data: VibeCheckPdfData): string {
  const {
    university,
    city,
    archetype,
    matchCount,
    lifestyleFitPercent = 60,
    generatedAt,
    verificationId,
    appUrl = 'https://www.domumatch.com',
  } = data
  const { scores } = archetype
  const joinUrl = `${appUrl.replace(/\/$/, '')}/auth/sign-up?type=student&from=vibe-check`

  const scoreRows = MODULE_ORDER.map((mod) => {
    const meta = VIBE_MODULE_LABELS[mod]
    const pct = Math.round(scores[mod])
    const axis = PROFILE_AXIS[mod]
    const band = pct <= 33 ? axis.low : pct <= 66 ? axis.mid : axis.high
    return `
      <div class="score-row">
        <div class="score-label">
          <span>${escapeHtml(meta.title)}</span>
          <span class="band">${escapeHtml(band)}</span>
        </div>
        <div class="axis-ends"><span>${escapeHtml(axis.low)}</span><span>${escapeHtml(axis.high)}</span></div>
      </div>`
  }).join('')

  const traitPills = archetype.traits
    .map((t) => `<span class="trait-pill">${escapeHtml(t)}</span>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Domu Match - Living together passport</title>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0; padding: 0; color: #0f172a; background: #ffffff;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page {
      width: 210mm; height: 297mm; padding: 18mm 20mm;
      box-sizing: border-box; page-break-after: always; position: relative;
      background: #ffffff;
    }
    .page:last-child { page-break-after: auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 2px solid #eef2ff; padding-bottom: 14px; margin-bottom: 18px;
    }
    .brand { font-size: 20px; font-weight: 800; color: #6366f1; letter-spacing: -0.4px; }
    .brand span { font-weight: 400; font-size: 13px; color: #64748b; }
    .badge {
      background: #e0e7ff; color: #3730a3; padding: 4px 12px;
      border-radius: 9999px; font-size: 11px; font-weight: 600;
    }
    .meta-row {
      display: flex; justify-content: space-between; gap: 12px;
      font-size: 11px; color: #64748b; margin-bottom: 16px;
    }
    .archetype-hero {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #818cf8 100%);
      color: #ffffff; border-radius: 16px; padding: 22px; margin-bottom: 20px;
    }
    .archetype-title { font-size: 26px; font-weight: 800; margin: 0 0 4px 0; }
    .archetype-sub { font-size: 13px; opacity: 0.92; margin: 0 0 8px 0; }
    .archetype-tagline { font-size: 13px; font-style: italic; opacity: 0.9; margin-bottom: 14px; }
    .trait-pill {
      display: inline-block; background: rgba(255,255,255,0.22);
      padding: 4px 10px; border-radius: 6px; font-size: 11px; margin: 0 6px 6px 0;
    }
    .section-title {
      font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .overall.note {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 10px 14px; margin-bottom: 16px;
    }
    .overall-label { font-size: 12px; font-weight: 500; color: #475569; line-height: 1.4; }
    .score-row { margin-bottom: 12px; }
    .score-label {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; font-weight: 600; margin-bottom: 2px; color: #334155;
    }
    .score-label .band {
      background: #f1f5f9; color: #334155; padding: 2px 8px;
      border-radius: 9999px; font-size: 11px; font-weight: 600;
    }
    .axis-ends {
      display: flex; justify-content: space-between;
      font-size: 9px; color: #94a3b8; margin-top: 4px;
    }
    .progress-bar-bg {
      height: 9px; background: #f1f5f9; border-radius: 9999px; overflow: hidden;
    }
    .progress-bar-fill { height: 100%; border-radius: 9999px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
    .info-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;
    }
    .warning-card {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px;
    }
    .warning-card .section-title { color: #991b1b; }
    .research-box {
      background: #f0fdf4; border-left: 4px solid #22c55e;
      padding: 14px; border-radius: 0 12px 12px 0; margin-bottom: 18px;
    }
    .cta-box {
      text-align: center; background: #eef2ff; padding: 18px; border-radius: 12px;
    }
    .footer {
      position: absolute; bottom: 14mm; left: 20mm; right: 20mm;
      display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;
      border-top: 1px solid #f1f5f9; padding-top: 8px;
    }
    p { margin: 0; }
    ol { margin: 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">Domu Match <span>| Living together passport</span></div>
      <div class="badge">${escapeHtml(city.toUpperCase())} COHORT</div>
    </div>
    <div class="meta-row">
      <span>${escapeHtml(university)}</span>
      <span>Your living together passport</span>
    </div>
    <div class="archetype-hero">
      <div class="archetype-title">${escapeHtml(archetype.title)}</div>
      <div class="archetype-sub">${escapeHtml(archetype.subtitle)}</div>
      <div class="archetype-tagline">"${escapeHtml(archetype.tagline)}"</div>
      <div>${traitPills}</div>
    </div>
    <div class="overall note">
      <span class="overall-label">Your living style across the areas our research tracks - a preference snapshot, not a ranking vs other students.</span>
    </div>
    <div style="margin-bottom: 8px;">
      <div class="section-title">Lifestyle Profile</div>
      ${scoreRows}
    </div>
    <div class="grid-2">
      <div class="info-card">
        <div class="section-title" style="color: #4f46e5;">Ideal Match Profile</div>
        <p style="font-size: 12px; line-height: 1.5; color: #334155;">
          ${escapeHtml(archetype.description)}
        </p>
        <div style="margin-top: 10px; font-weight: 700; font-size: 12px; color: #1e293b;">
          Best Match Category: ${escapeHtml(archetype.idealMatch)}
        </div>
      </div>
      <div class="warning-card">
        <div class="section-title">Critical Dealbreakers</div>
        <p style="font-size: 12px; line-height: 1.5; color: #7f1d1d;">
          ${escapeHtml(archetype.dealbreakerWarning)}
        </p>
        <div style="margin-top: 10px; font-size: 11px; color: #991b1b; font-style: italic;">
          *Hard gates (Smoking, Pets, Registration, Subletting) override harmony matches.
        </div>
      </div>
    </div>
    <div class="footer">
      <span>Verification ID: ${escapeHtml(verificationId)}</span>
      <span>Generated on ${escapeHtml(generatedAt)}</span>
      <span>Domu Match &copy; 2026</span>
    </div>
  </div>

  <div class="page">
    <div class="header">
      <div class="brand">Domu Match <span>| The Science of Co-Living</span></div>
      <div class="badge">STUDENT RETENTION BRIEF</div>
    </div>
    <div class="research-box">
      <div style="font-weight: 800; font-size: 14px; color: #14532d; margin-bottom: 6px;">
        Why Roommate Harmony Dictates Academic Success
      </div>
      <p style="font-size: 12px; color: #166534; line-height: 1.5;">
        Research in Dutch student housing shows that non-academic dropouts at HBO and WO institutions
        are strongly correlated with domestic housing instability. Shared flat friction creates continuous
        baseline stress, disrupting sleep, study focus, and emotional well-being. Our research shows
        cleanliness and kitchen habits are among the strongest drivers of household conflict.
      </p>
    </div>
    <div style="margin-bottom: 18px;">
      <div class="section-title">The 3 Core Roommate Conflict Triggers</div>
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 700; font-size: 12px; color: #1e293b;">1. Circadian &amp; Sleep Misalignment (Horne-Ostberg Scale)</div>
        <p style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.4;">
          Mixing night owls with early lecture students without weekday quiet-hour agreements is a top cause of nocturnal friction and academic fatigue.
        </p>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 700; font-size: 12px; color: #1e293b;">2. Kitchen Hygiene &amp; Commons Dilemma</div>
        <p style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.4;">
          Most house-chat arguments stem from sink clutter. Mismatched expectations around immediate dish washing vs. next-day soaking rapidly decay household trust.
        </p>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 700; font-size: 12px; color: #1e293b;">3. Indirect Conflict Escalation</div>
        <p style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.4;">
          Passive-aggressive WhatsApp messages ruin flat dynamics. High-harmony houses set boundaries face-to-face.
        </p>
      </div>
    </div>
    <div class="info-card" style="margin-bottom: 18px;">
      <div class="section-title" style="color: #1e293b;">Your 5-Question Hospiteer Checklist</div>
      <ol style="font-size: 12px; color: #334155; line-height: 1.55;">
        <li>"What are the house rules for washing dishes after cooking dinner?"</li>
        <li>"How are overnight partners handled during exam weeks?"</li>
        <li>"What time do quiet hours start on Sunday through Thursday nights?"</li>
        <li>"How does the house handle chores: a fixed schedule or spontaneous effort?"</li>
        <li>"If someone breaks a house rule, do you address it face-to-face or in the house chat?"</li>
      </ol>
    </div>
    <div class="cta-box">
      <div style="font-weight: 800; font-size: 15px; color: #4f46e5; margin-bottom: 4px;">
        Meet your next roommate in ${escapeHtml(city)}
      </div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
        You share a ${lifestyleFitPercent}% lifestyle fit with at least ${matchCount} potential students. Connect with people also looking for roommates.
      </div>
      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
        Sign up: <span style="color: #6366f1;">${escapeHtml(joinUrl)}</span>
      </div>
    </div>
    <div class="footer">
      <span>Verification ID: ${escapeHtml(verificationId)}</span>
      <span>Generated on ${escapeHtml(generatedAt)}</span>
      <span>Domu Match &copy; 2026</span>
    </div>
  </div>
</body>
</html>`
}
