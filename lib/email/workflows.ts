// Email Workflow System
// This module handles email notifications for tickets and other events

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import { renderEmailLayout, renderButton, renderInfoBox, escapeHtml } from './layout'
import { BRAND, COLORS, URLS } from './brand'

export interface EmailConfig {
  /** Mailjet API key (from Account settings → SMTP and SEND API settings) */
  apiKey: string
  /** Mailjet Secret Key (same page as API key) */
  secretKey: string
  fromEmail: string
  fromName: string
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
  /** Optional Reply-To address (e.g. form submitter) */
  replyTo?: string
}

/**
 * Get email configuration from environment variables.
 * Uses Mailjet (MAILJET_API_KEY + MAILJET_SECRET_KEY).
 * Auth emails (OTP, password reset) are sent by Supabase - configure SMTP in Supabase Dashboard (Mailjet SMTP supported).
 */
function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.MAILJET_API_KEY
  const secretKey = process.env.MAILJET_SECRET_KEY
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.MAILJET_FROM_EMAIL || 'domumatch@gmail.com'
  const fromName = process.env.SMTP_FROM_NAME || process.env.MAILJET_FROM_NAME || 'Domu Match'

  if (!apiKey || !secretKey || typeof apiKey !== 'string' || typeof secretKey !== 'string' || !apiKey.trim() || !secretKey.trim()) {
    safeLogger.warn('Email configuration not found (set MAILJET_API_KEY and MAILJET_SECRET_KEY). App-level email notifications will be disabled.')
    return null
  }

  return {
    apiKey: apiKey.trim(),
    secretKey: secretKey.trim(),
    fromEmail,
    fromName
  }
}

/**
 * Send email via Mailjet Send API v3.1
 */
export type SendEmailOptions = {
  /** Skip the platform-wide "email notifications" toggle (e.g. contact form to support). */
  skipPlatformGate?: boolean
}

export async function sendEmail(
  message: EmailMessage,
  options?: SendEmailOptions
): Promise<boolean> {
  try {
    if (!options?.skipPlatformGate) {
      const { getPlatformSettings } = await import('@/lib/platform-settings')
      const platformSettings = await getPlatformSettings()
      if (!platformSettings.emailNotificationsEnabled) {
        safeLogger.info('[Email] Skipped: platform email notifications are disabled')
        return false
      }
    }

    const config = getEmailConfig()

    if (!config) {
      safeLogger.warn('Email configuration not available. Skipping email send.')
      return false
    }

    const auth = Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: config.fromEmail,
              Name: config.fromName
            },
            To: [{ Email: message.to, Name: message.to }],
            ...(message.replyTo ? { ReplyTo: { Email: message.replyTo } } : {}),
            Subject: message.subject,
            HTMLPart: message.html,
            ...(message.text ? { TextPart: message.text } : {})
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      safeLogger.error('Failed to send email', { error: errorText, status: response.status })
      return false
    }

    safeLogger.info('Email sent successfully', { to: message.to, subject: message.subject })
    return true
  } catch (error) {
    safeLogger.error('Error sending email', { error })
    return false
  }
}

/**
 * Send ticket creation notification
 */
export async function sendTicketCreationNotification(
  ticketId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get ticket and user information
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('ticket_number, subject, category, priority')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError || !ticket) {
      safeLogger.error('Failed to fetch ticket', { error: ticketError })
      return false
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return false
    }

    const niceName = user.first_name || 'there'
    const helpUrl = URLS.helpCenter
    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        We got your support request
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Hi ${escapeHtml(niceName)} - thanks for reaching out. Our team will get back to you as soon as possible.
      </p>
      ${renderInfoBox(
        `<div style="text-align:left;">
           <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Ticket</div>
           <div style="font-size:15px;font-weight:600;color:${COLORS.textHeading};margin-bottom:12px;">${escapeHtml(String(ticket.ticket_number))}</div>
           <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Subject:</strong> ${escapeHtml(String(ticket.subject))}</div>
           <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Category:</strong> ${escapeHtml(String(ticket.category))}</div>
           <div style="font-size:13px;color:${COLORS.textMuted};"><strong style="color:${COLORS.textBody};">Priority:</strong> ${escapeHtml(String(ticket.priority))}</div>
         </div>`,
        'neutral'
      )}
      <div style="margin:24px 0;">
        ${renderButton('Visit the Help Center', helpUrl)}
      </div>`

    const html = renderEmailLayout({
      preheader: `Ticket ${ticket.ticket_number} received - we'll be in touch soon.`,
      title: `Support ticket created: ${ticket.ticket_number}`,
      bodyHtml,
      recipientEmail: user.email,
      includeUnsubscribe: false,
    })

    const text = `Hi ${niceName},\n\nWe received your support request.\n\nTicket: ${ticket.ticket_number}\nSubject: ${ticket.subject}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\n\nWe'll get back to you as soon as possible.\n\n- ${BRAND.name}\n`

    return await sendEmail({
      to: user.email,
      subject: `Support ticket created: ${ticket.ticket_number}`,
      html,
      text,
    })
  } catch (error) {
    safeLogger.error('Error sending ticket creation notification', { error })
    return false
  }
}

/**
 * Send ticket update notification
 */
export async function sendTicketUpdateNotification(
  ticketId: string,
  userId: string,
  message: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get ticket and user information
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('ticket_number, subject, status')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError || !ticket) {
      safeLogger.error('Failed to fetch ticket', { error: ticketError })
      return false
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return false
    }

    const niceName = user.first_name || 'there'
    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        New update on your ticket
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Hi ${escapeHtml(niceName)} - here’s the latest from the team on ticket <strong style="color:${COLORS.textHeading};">${escapeHtml(String(ticket.ticket_number))}</strong>.
      </p>
      ${renderInfoBox(
        `<div style="text-align:left;">
           <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:4px;"><strong style="color:${COLORS.textBody};">Subject:</strong> ${escapeHtml(String(ticket.subject))}</div>
           <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:12px;"><strong style="color:${COLORS.textBody};">Status:</strong> ${escapeHtml(String(ticket.status))}</div>
           <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Update</div>
           <div style="font-size:14px;color:${COLORS.textBody};line-height:22px;white-space:pre-wrap;">${escapeHtml(message)}</div>
         </div>`,
        'neutral'
      )}`

    const html = renderEmailLayout({
      preheader: `Update on ticket ${ticket.ticket_number}.`,
      title: `Support ticket update: ${ticket.ticket_number}`,
      bodyHtml,
      recipientEmail: user.email,
      includeUnsubscribe: false,
    })

    const text = `Hi ${niceName},\n\nThere's a new update on your support ticket.\n\nTicket: ${ticket.ticket_number}\nSubject: ${ticket.subject}\nStatus: ${ticket.status}\n\nUpdate:\n${message}\n\n- ${BRAND.name}\n`

    return await sendEmail({
      to: user.email,
      subject: `Support ticket update: ${ticket.ticket_number}`,
      html,
      text,
    })
  } catch (error) {
    safeLogger.error('Error sending ticket update notification', { error })
    return false
  }
}

/**
 * Send ticket resolution notification
 */
export async function sendTicketResolutionNotification(
  ticketId: string,
  userId: string,
  resolution: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get ticket and user information
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('ticket_number, subject')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError || !ticket) {
      safeLogger.error('Failed to fetch ticket', { error: ticketError })
      return false
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return false
    }

    const niceName = user.first_name || 'there'
    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        Your ticket is resolved
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Hi ${escapeHtml(niceName)} - we’ve closed out ticket <strong style="color:${COLORS.textHeading};">${escapeHtml(String(ticket.ticket_number))}</strong>. Here’s the outcome.
      </p>
      ${renderInfoBox(
        `<div style="text-align:left;">
           <div style="font-size:13px;color:${COLORS.textMuted};margin-bottom:12px;"><strong style="color:${COLORS.textBody};">Subject:</strong> ${escapeHtml(String(ticket.subject))}</div>
           <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.textMuted};text-transform:uppercase;margin-bottom:6px;">Resolution</div>
           <div style="font-size:14px;color:${COLORS.textBody};line-height:22px;white-space:pre-wrap;">${escapeHtml(resolution)}</div>
         </div>`,
        'neutral'
      )}
      <p style="margin:20px 0 0;text-align:center;color:${COLORS.textMuted};font-size:14px;">
        Need anything else? Just reply by emailing
        <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.primary};text-decoration:underline;">${BRAND.supportEmail}</a>.
      </p>`

    const html = renderEmailLayout({
      preheader: `Ticket ${ticket.ticket_number} resolved.`,
      title: `Support ticket resolved: ${ticket.ticket_number}`,
      bodyHtml,
      recipientEmail: user.email,
      includeUnsubscribe: false,
    })

    const text = `Hi ${niceName},\n\nYour support ticket is resolved.\n\nTicket: ${ticket.ticket_number}\nSubject: ${ticket.subject}\n\nResolution:\n${resolution}\n\nNeed more help? Email ${BRAND.supportEmail}.\n\n- ${BRAND.name}\n`

    return await sendEmail({
      to: user.email,
      subject: `Support ticket resolved: ${ticket.ticket_number}`,
      html,
      text,
    })
  } catch (error) {
    safeLogger.error('Error sending ticket resolution notification', { error })
    return false
  }
}

