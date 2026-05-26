/**
 * GET /api/dev/email-preview?kind=<template>[&format=html|json]
 *
 * Dev-only renderer for every email the platform sends. Used by the
 * /dev/email-preview page (iframes) and for one-off curl checks.
 *
 * In production we still allow it for support diagnostics but require the
 * cron secret in the Authorization header (same pattern as the existing
 * /api/email-digests/preview route).
 */

import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import {
  buildMatchesDigestEmail,
  buildMessagesDigestEmail,
  buildPlatformUpdatesDigestEmail,
} from '@/lib/email/notification-digests'
import { renderEmailLayout, renderButton, renderInfoBox, escapeHtml } from '@/lib/email/layout'
import { BRAND, COLORS, URLS, buildUnsubscribeUrl } from '@/lib/email/brand'
import { safeLogger } from '@/lib/utils/logger'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://domumatch.com'
const SAMPLE_EMAIL = 'sample.user@example.com'
const SAMPLE_NAME = 'Alex'

/** Avoid throwing at module load when unsubscribe secret is unset in local dev. */
function sampleUnsubscribeUrl(): string {
  try {
    return buildUnsubscribeUrl('00000000-0000-4000-8000-000000000000', APP_URL)
  } catch {
    return `${APP_URL.replace(/\/$/, '')}/unsubscribe?token=preview-token-unavailable`
  }
}

export interface PreviewKind {
  id: string
  category: 'supabase' | 'app'
  label: string
  description: string
  /** True if the rendered HTML still contains unresolved Go template vars. */
  hasUnresolvedVars?: boolean
}

export const PREVIEW_KINDS: PreviewKind[] = [
  // Supabase Auth - static HTML pasted into the dashboard
  {
    id: 'supabase-verify',
    category: 'supabase',
    label: 'Verify email (OTP)',
    description: 'Confirm signup - sample OTP rendered in place of {{ .Token }}.',
    hasUnresolvedVars: false,
  },
  {
    id: 'supabase-password-reset',
    category: 'supabase',
    label: 'Reset password',
    description: 'Sample {{ .ConfirmationURL }} link.',
    hasUnresolvedVars: false,
  },
  {
    id: 'supabase-magic-link',
    category: 'supabase',
    label: 'Magic link',
    description: 'Passwordless sign-in.',
    hasUnresolvedVars: false,
  },
  {
    id: 'supabase-email-change',
    category: 'supabase',
    label: 'Email change confirmation',
    description: 'Shows both old and new addresses.',
    hasUnresolvedVars: false,
  },
  {
    id: 'supabase-invite',
    category: 'supabase',
    label: 'Invite user',
    description: 'Used when an admin invites a new account.',
    hasUnresolvedVars: false,
  },
  {
    id: 'supabase-reauthentication',
    category: 'supabase',
    label: 'Reauthentication',
    description: 'OTP before a sensitive action (e.g. change password, delete account).',
    hasUnresolvedVars: false,
  },

  // App-sent - rendered live via shared layout
  {
    id: 'app-welcome',
    category: 'app',
    label: 'Welcome (signup)',
    description: 'Sent right after signup.',
  },
  {
    id: 'app-onboarding-complete',
    category: 'app',
    label: 'Profile complete',
    description: 'Sent when the user finishes the questionnaire.',
  },
  {
    id: 'app-verification-reminder',
    category: 'app',
    label: 'Verification reminder',
    description: 'Sent ~24h after signup if not verified.',
  },
  {
    id: 'app-first-match',
    category: 'app',
    label: 'First matches available',
    description: 'Sent when the first match suggestions arrive.',
  },
  {
    id: 'app-verification-complete',
    category: 'app',
    label: 'Verification complete',
    description: 'Sent after identity verification finishes.',
  },
  {
    id: 'app-matches-digest',
    category: 'app',
    label: 'Matches digest',
    description: 'Periodic roll-up of new matches.',
  },
  {
    id: 'app-messages-digest',
    category: 'app',
    label: 'Messages digest',
    description: 'Roll-up of unread messages.',
  },
  {
    id: 'app-platform-update',
    category: 'app',
    label: 'Platform update / announcement',
    description: 'Used for opt-in product updates.',
  },
  {
    id: 'app-ticket-created',
    category: 'app',
    label: 'Support ticket created',
    description: 'Acknowledgement after creating a ticket.',
  },
  {
    id: 'app-ticket-update',
    category: 'app',
    label: 'Support ticket update',
    description: 'Sent when a ticket gets a reply.',
  },
  {
    id: 'app-ticket-resolved',
    category: 'app',
    label: 'Support ticket resolved',
    description: 'Sent when a ticket is closed.',
  },
  {
    id: 'app-inactivity-warning',
    category: 'app',
    label: 'Inactivity warning',
    description: '30-day / 7-day reminder before anonymization.',
  },
]

async function readSupabaseTemplate(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'lib', 'email', 'templates', 'supabase', filename)
  return readFile(filePath, 'utf-8')
}

/**
 * Substitute Supabase Go-template variables with realistic sample values so
 * the dev preview matches what the recipient will see. Used only for the
 * /dev/email-preview iframe, never for actual sends.
 */
function substituteSupabaseVars(html: string, overrides: Record<string, string> = {}): string {
  const defaults: Record<string, string> = {
    '{{ .Token }}': '138166',
    '{{ .Email }}': SAMPLE_EMAIL,
    '{{ .NewEmail }}': 'new.email@example.com',
    '{{ .ConfirmationURL }}': `${APP_URL}/auth/callback?token=sample-confirmation`,
    '{{ .TokenHash }}': 'sample-token-hash',
    '{{ .SiteURL }}': APP_URL,
    ...overrides,
  }
  let out = html
  for (const [needle, value] of Object.entries(defaults)) {
    out = out.split(needle).join(value)
  }
  return out
}

async function renderById(kind: string): Promise<{ subject: string; html: string; text?: string }> {
  switch (kind) {
    case 'supabase-verify': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('verify-otp.html'))
      return { subject: 'Your Domu Match verification code', html }
    }
    case 'supabase-password-reset': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('password-reset.html'))
      return { subject: 'Reset your Domu Match password', html }
    }
    case 'supabase-magic-link': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('magic-link.html'))
      return { subject: 'Sign in to Domu Match', html }
    }
    case 'supabase-email-change': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('email-change.html'))
      return { subject: 'Confirm your new email - Domu Match', html }
    }
    case 'supabase-invite': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('invite-user.html'))
      return { subject: "You're invited to Domu Match", html }
    }
    case 'supabase-reauthentication': {
      const html = substituteSupabaseVars(await readSupabaseTemplate('reauthentication.html'))
      return { subject: '138166 is your Domu Match verification code', html }
    }

    case 'app-welcome':
      return previewAppEmail({
        subject: 'Welcome to Domu Match',
        preheader: 'Welcome to Domu Match - set up your profile in about 5 minutes.',
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Welcome to Domu Match</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Hey ${SAMPLE_NAME} - we’re so glad you’re here. Your perfect match could be just a few questions away.</p>
          <div style="margin:24px 0;">${renderButton('Set up your profile', URLS.signIn)}</div>
          ${renderInfoBox(
            `<strong style="color:${COLORS.textBody};">Quick start:</strong>
             <ol style="margin:8px 0 0;padding-left:18px;color:${COLORS.textMuted};font-size:14px;line-height:22px;">
               <li>Verify your email and identity.</li>
               <li>Answer the compatibility questionnaire.</li>
               <li>Set your preferences - budget, move-in, dealbreakers.</li>
             </ol>`,
            'neutral'
          )}`,
      })
    case 'app-onboarding-complete':
      return previewAppEmail({
        subject: 'Your profile is ready - Domu Match',
        preheader: 'Your Domu Match profile is complete - matches are on the way.',
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Your profile is ready</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Nice work, ${SAMPLE_NAME}. We’re already running compatibility checks.</p>
          <div style="margin:24px 0;">${renderButton('Open your dashboard', `${URLS.home}/dashboard`)}</div>`,
      })
    case 'app-verification-reminder':
      return previewAppEmail({
        subject: 'Finish verifying your Domu Match account',
        preheader: 'A quick verification step unlocks Domu Match.',
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Finish verifying your account</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Hey ${SAMPLE_NAME} - a quick verification step keeps Domu Match a safe place for everyone.</p>
          <div style="margin:24px 0;">${renderButton('Complete verification', `${URLS.home}/settings`)}</div>`,
      })
    case 'app-first-match':
      return previewAppEmail({
        subject: 'You have 3 new matches',
        preheader: '3 new compatible roommates are waiting on Domu Match.',
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Your first matches are here</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Big moment, ${SAMPLE_NAME} - we found <strong style="color:${COLORS.textHeading};">3</strong> compatible roommates for you.</p>
          <div style="margin:24px 0;">${renderButton('See your matches', `${URLS.home}/matches`)}</div>`,
      })
    case 'app-verification-complete':
      return previewAppEmail({
        subject: 'Verification complete - Domu Match',
        preheader: 'Your Domu Match identity verification is complete.',
        includeUnsubscribe: false,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Verification complete</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">You’re all set, ${SAMPLE_NAME}. Every Domu Match feature is now unlocked.</p>
          <div style="margin:24px 0;">${renderButton('Open your dashboard', `${URLS.home}/dashboard`)}</div>`,
      })

    case 'app-matches-digest':
      return buildMatchesDigestEmail({ toName: SAMPLE_NAME, toEmail: SAMPLE_EMAIL, appUrl: APP_URL, count: 4 })
    case 'app-messages-digest':
      return buildMessagesDigestEmail({ toName: SAMPLE_NAME, toEmail: SAMPLE_EMAIL, appUrl: APP_URL, count: 6 })
    case 'app-platform-update':
      return buildPlatformUpdatesDigestEmail({
        toName: SAMPLE_NAME,
        toEmail: SAMPLE_EMAIL,
        appUrl: APP_URL,
        announcementTitle: 'Group matching just dropped',
        announcementBody: 'You can now form groups of 2-4 and get matched together - perfect for friends co-signing.\n\nOpen the dashboard to try it.',
        actionUrl: `${APP_URL}/dashboard`,
      })

    case 'app-ticket-created':
      return previewAppEmail({
        subject: 'Support ticket created: DM-2046',
        preheader: 'Ticket DM-2046 received - we’ll be in touch soon.',
        includeUnsubscribe: false,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">We got your support request</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Hi ${SAMPLE_NAME} - our team will get back to you as soon as possible.</p>
          ${renderInfoBox(
            `<div style="text-align:left;">
               <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Ticket</div>
               <div style="font-size:15px;font-weight:600;color:${COLORS.textHeading};margin-bottom:12px;">DM-2046</div>
               <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Subject:</strong> Trouble verifying my .edu email</div>
               <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Category:</strong> Account</div>
               <div style="font-size:13px;color:${COLORS.textMuted};"><strong style="color:${COLORS.textBody};">Priority:</strong> Normal</div>
             </div>`,
            'neutral'
          )}`,
      })
    case 'app-ticket-update':
      return previewAppEmail({
        subject: 'Support ticket update: DM-2046',
        preheader: 'Update on ticket DM-2046.',
        includeUnsubscribe: false,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">New update on your ticket</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Hi ${SAMPLE_NAME} - here’s the latest from the team on ticket <strong>DM-2046</strong>.</p>
          ${renderInfoBox(
            `<div style="text-align:left;">
               <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Subject:</strong> Trouble verifying my .edu email</div>
               <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:12px;"><strong style="color:${COLORS.textBody};">Status:</strong> In progress</div>
               <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Update</div>
               <div style="font-size:14px;color:${COLORS.textBody};line-height:22px;">We’ve allowlisted your university domain - try requesting the verification code again.</div>
             </div>`,
            'neutral'
          )}`,
      })
    case 'app-ticket-resolved':
      return previewAppEmail({
        subject: 'Support ticket resolved: DM-2046',
        preheader: 'Ticket DM-2046 resolved.',
        includeUnsubscribe: false,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Your ticket is resolved</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">Hi ${SAMPLE_NAME} - we’ve closed out ticket <strong>DM-2046</strong>.</p>
          ${renderInfoBox(
            `<div style="text-align:left;">
               <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:12px;"><strong style="color:${COLORS.textBody};">Subject:</strong> Trouble verifying my .edu email</div>
               <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Resolution</div>
               <div style="font-size:14px;color:${COLORS.textBody};line-height:22px;">Verification went through - you should see the verified badge on your profile now.</div>
             </div>`,
            'neutral'
          )}
          <p style="margin:20px 0 0;text-align:center;color:${COLORS.textMuted};font-size:14px;">Need anything else? Email <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.primary};text-decoration:underline;">${BRAND.supportEmail}</a>.</p>`,
      })
    case 'app-inactivity-warning':
      return previewAppEmail({
        subject: 'Your Domu Match account will be anonymized in 30 days',
        preheader: 'Log in within 30 days to keep your Domu Match account.',
        includeUnsubscribe: false,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">Your account will be anonymized in 30 days</h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">We haven’t seen activity on your Domu Match account for a long time. Per our <a href="${URLS.privacy}" style="color:${COLORS.primary};text-decoration:underline;">Privacy Policy</a>, accounts inactive for one year are anonymized.</p>
          <div style="margin:24px 0;">${renderButton('Log in to keep your account', URLS.signIn)}</div>`,
      })

    default:
      throw new Error(`Unknown preview kind: ${kind}`)
  }
}

function previewAppEmail(args: {
  subject: string
  preheader: string
  bodyHtml: string
  includeUnsubscribe?: boolean
}): { subject: string; html: string } {
  const includeUnsubscribe = args.includeUnsubscribe ?? true
  const html = renderEmailLayout({
    preheader: args.preheader,
    title: args.subject,
    bodyHtml: args.bodyHtml,
    recipientEmail: SAMPLE_EMAIL,
    includeUnsubscribe,
    unsubscribeUrl: includeUnsubscribe ? sampleUnsubscribeUrl() : undefined,
  })
  return { subject: args.subject, html }
}

const SUPABASE_FILE_BY_KIND: Record<string, string> = {
  'supabase-verify': 'verify-otp.html',
  'supabase-password-reset': 'password-reset.html',
  'supabase-magic-link': 'magic-link.html',
  'supabase-email-change': 'email-change.html',
  'supabase-invite': 'invite-user.html',
  'supabase-reauthentication': 'reauthentication.html',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kind = searchParams.get('kind') || ''
    const format = (searchParams.get('format') || 'html').toLowerCase()
    const wantRaw = searchParams.get('raw') === '1' || searchParams.get('raw') === 'true'

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!kind) {
      return NextResponse.json({ templates: PREVIEW_KINDS })
    }

    // `raw=1` on Supabase kinds returns the on-disk template (with {{ .Token }} etc.)
    // for pasting into the Supabase dashboard. The visual preview uses substituted HTML.
    if (wantRaw && SUPABASE_FILE_BY_KIND[kind]) {
      const html = await readSupabaseTemplate(SUPABASE_FILE_BY_KIND[kind])
      if (format === 'json') {
        return NextResponse.json({ subject: PREVIEW_KINDS.find((k) => k.id === kind)?.label ?? kind, html })
      }
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    }

    const rendered = await renderById(kind)

    if (format === 'json') {
      return NextResponse.json(rendered)
    }

    return new NextResponse(rendered.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Email-Subject': escapeHtml(rendered.subject),
      },
    })
  } catch (error) {
    safeLogger.error('[DevEmailPreview] Failed', { error })
    return NextResponse.json({ error: 'Preview failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
