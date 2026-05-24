/**
 * Domu Match - shared HTML email layout.
 *
 * Renders the brand chrome (header band with logo, body card, footer with
 * social links + legal + optional unsubscribe) around a body slot.
 *
 * Cross-client constraints encoded in this file:
 * - Table-based layout with role="presentation" (Outlook desktop).
 * - All styles inlined (Gmail strips <style>).
 * - 600px max width, fluid down to mobile via single-column tables.
 * - Web-safe font stack only (no @font-face).
 * - No flexbox, no CSS grid, no position.
 * - Images: absolute https URLs with explicit width/height + alt text.
 *
 * The Supabase Auth templates under templates/supabase/*.html mirror this
 * layout by hand because Supabase pastes raw HTML - keep the two visually
 * in sync when you change brand chrome here.
 */

import { BRAND, COLORS, FONT_STACK, SOCIAL, URLS } from './brand'

export function escapeHtml(input: string): string {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function nlToBr(text: string): string {
  return escapeHtml(text).replaceAll('\n', '<br/>')
}

export interface RenderLayoutOptions {
  /** Hidden preview text shown by Gmail/Apple Mail next to the subject. */
  preheader: string
  /** Page <title>. Often the email subject. */
  title: string
  /** Raw HTML for the body card content (between header and footer). */
  bodyHtml: string
  /** Recipient email (rendered in footer as "Sent to ..."). Optional. */
  recipientEmail?: string
  /** Show unsubscribe link in footer. Default false (transactional). */
  includeUnsubscribe?: boolean
  /** Full unsubscribe URL (must include opaque token). Required if includeUnsubscribe=true. */
  unsubscribeUrl?: string
}

/**
 * Build a bulletproof CTA button that renders on Outlook (no border-radius
 * inheritance issues - we use VML fallback via a table cell).
 */
export function renderButton(label: string, href: string): string {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${COLORS.primary}" style="border-radius:14px;background:${COLORS.primary};">
        <a href="${safeHref}"
           style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:14px;line-height:1;mso-padding-alt:0;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`
}

/**
 * Render the full email HTML around a body slot.
 *
 * Body slot guidance:
 * - Begin with an <h1 style="..."> for the email title.
 * - Use <p style="margin:0 0 16px;font-family:..."> for paragraphs.
 * - Use renderButton(...) for the primary CTA.
 * - For OTP / code-box, use the <table> idiom; do not rely on flexbox.
 */
export function renderEmailLayout(opts: RenderLayoutOptions): string {
  const {
    preheader,
    title,
    bodyHtml,
    recipientEmail,
    includeUnsubscribe = false,
    unsubscribeUrl,
  } = opts

  if (includeUnsubscribe && !unsubscribeUrl) {
    throw new Error('renderEmailLayout: includeUnsubscribe=true requires unsubscribeUrl')
  }

  const safePreheader = escapeHtml(preheader)
  const safeTitle = escapeHtml(title)

  const recipientLine = recipientEmail
    ? `This email was sent to <a href="mailto:${escapeHtml(recipientEmail)}" style="color:${COLORS.textMuted};text-decoration:underline;">${escapeHtml(recipientEmail)}</a>.`
    : ''

  const unsubLine = includeUnsubscribe && unsubscribeUrl
    ? `<p style="margin:8px 0 0;font-family:${FONT_STACK};font-size:12px;color:${COLORS.textFaint};">
         Don’t want these emails? <a href="${escapeHtml(unsubscribeUrl)}" style="color:${COLORS.primary};text-decoration:underline;">Manage your email preferences</a>.
       </p>`
    : ''

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;color:transparent;visibility:hidden;opacity:0;font-size:1px;line-height:1px;">${safePreheader}</div>
  <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.page};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">

          <!-- Header band -->
          <tr>
            <td align="center" style="padding:0 0 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.primarySoft};border-radius:20px;border:1px solid ${COLORS.primarySoftBorder};">
                <tr>
                  <td align="center" style="padding:28px 24px;">
                    <a href="${URLS.home}" style="text-decoration:none;display:inline-block;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="background:#ffffff;border-radius:18px;padding:10px;border:1px solid ${COLORS.primarySoftBorder};">
                            <img src="${BRAND.logoUrl}" width="44" height="44" alt="${escapeHtml(BRAND.name)}" style="display:block;border:0;outline:none;text-decoration:none;border-radius:12px;width:44px;height:44px;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                    <div style="margin-top:12px;font-family:${FONT_STACK};font-size:18px;font-weight:700;color:${COLORS.primaryInk};letter-spacing:-0.2px;">
                      ${escapeHtml(BRAND.name)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.card};border-radius:20px;border:1px solid ${COLORS.border};">
                <tr>
                  <td style="padding:32px 32px 28px;font-family:${FONT_STACK};color:${COLORS.textBody};font-size:16px;line-height:24px;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 16px;font-family:${FONT_STACK};">
                    <a href="${SOCIAL.linkedin}" style="display:inline-block;margin:0 8px;padding:8px 14px;background:${COLORS.primarySoft};color:${COLORS.primaryInk};text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;border:1px solid ${COLORS.primarySoftBorder};">LinkedIn</a>
                    <a href="${SOCIAL.instagram}" style="display:inline-block;margin:0 8px;padding:8px 14px;background:${COLORS.primarySoft};color:${COLORS.primaryInk};text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;border:1px solid ${COLORS.primarySoftBorder};">Instagram</a>
                    <a href="mailto:${BRAND.supportEmail}" style="display:inline-block;margin:0 8px;padding:8px 14px;background:${COLORS.primarySoft};color:${COLORS.primaryInk};text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;border:1px solid ${COLORS.primarySoftBorder};">Email us</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 12px;font-family:${FONT_STACK};font-size:13px;color:${COLORS.textMuted};">
                    <a href="${URLS.home}" style="color:${COLORS.textMuted};text-decoration:none;margin:0 6px;">Website</a>
                    <span style="color:${COLORS.textFaint};">·</span>
                    <a href="${URLS.helpCenter}" style="color:${COLORS.textMuted};text-decoration:none;margin:0 6px;">Help</a>
                    <span style="color:${COLORS.textFaint};">·</span>
                    <a href="${URLS.contact}" style="color:${COLORS.textMuted};text-decoration:none;margin:0 6px;">Contact</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 16px;font-family:${FONT_STACK};font-size:12px;color:${COLORS.textFaint};">
                    <a href="${URLS.privacy}" style="color:${COLORS.textFaint};text-decoration:none;margin:0 6px;">Privacy</a>
                    <span>·</span>
                    <a href="${URLS.terms}" style="color:${COLORS.textFaint};text-decoration:none;margin:0 6px;">Terms</a>
                    <span>·</span>
                    <a href="${URLS.cookies}" style="color:${COLORS.textFaint};text-decoration:none;margin:0 6px;">Cookies</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:12px 0 0;border-top:1px solid ${COLORS.borderSoft};font-family:${FONT_STACK};font-size:12px;color:${COLORS.textFaint};line-height:18px;">
                    <p style="margin:0 0 6px;font-size:13px;color:${COLORS.textMuted};">
                      ${escapeHtml(BRAND.tagline)}
                    </p>
                    <p style="margin:0 0 4px;">© ${BRAND.year} ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.address)}</p>
                    <p style="margin:0 0 4px;">
                      This message was sent from <strong style="color:${COLORS.textMuted};">${escapeHtml(BRAND.fromAddress)}</strong>, an unmonitored address - please don’t reply. For help, email
                      <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.primary};text-decoration:underline;">${BRAND.supportEmail}</a>.
                    </p>
                    ${recipientLine ? `<p style="margin:0 0 4px;">${recipientLine}</p>` : ''}
                    ${unsubLine}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Render a soft "info box" - e.g., the OTP container or a tip block.
 * Pass HTML for `content`; we don't escape it.
 */
export function renderInfoBox(content: string, tone: 'primary' | 'neutral' | 'warn' = 'primary'): string {
  const tones = {
    primary: { bg: COLORS.primarySoft, border: COLORS.primarySoftBorder, ink: COLORS.primaryInk },
    neutral: { bg: '#f8fafc', border: COLORS.borderSoft, ink: COLORS.textBody },
    warn: { bg: COLORS.warnSoft, border: '#fde68a', ink: COLORS.warnInk },
  } as const
  const t = tones[tone]
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td align="center" style="background:${t.bg};border:1px solid ${t.border};border-radius:16px;padding:20px;color:${t.ink};font-family:${FONT_STACK};font-size:14px;line-height:22px;">
        ${content}
      </td>
    </tr>
  </table>`
}

/**
 * Render a 6-digit OTP with spaced digits, large purple type, soft container.
 * Uses CSS letter-spacing (not per-digit spans) so the same renderer is
 * portable to the Supabase Go-template HTML where we cannot iterate digits.
 */
export function renderOtpDigits(code: string): string {
  const safeCode = escapeHtml(String(code).slice(0, 6))
  return renderInfoBox(
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:12px;">Verification code</div>
     <div style="font-family:'SF Mono','Menlo','Consolas','Courier New',monospace;font-size:36px;font-weight:700;color:${COLORS.primary};letter-spacing:14px;line-height:1;padding-left:14px;">${safeCode}</div>`,
    'primary'
  )
}
