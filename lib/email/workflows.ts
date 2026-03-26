// Email Workflow System
// This module handles email notifications for tickets and other events

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

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
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.MAILJET_FROM_EMAIL || 'info@domumatch.com'
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
export async function sendEmail(
  message: EmailMessage
): Promise<boolean> {
  try {
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

    // Send email to user
    const emailSent = await sendEmail({
      to: user.email,
      subject: `Support Ticket Created: ${ticket.ticket_number}`,
      html: `
        <h2>Support Ticket Created</h2>
        <p>Hello ${user.first_name || 'there'},</p>
        <p>Your support ticket has been created successfully.</p>
        <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p>We'll get back to you as soon as possible.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Support Ticket Created
        
        Hello ${user.first_name || 'there'},
        
        Your support ticket has been created successfully.
        
        Ticket Number: ${ticket.ticket_number}
        Subject: ${ticket.subject}
        Category: ${ticket.category}
        Priority: ${ticket.priority}
        
        We'll get back to you as soon as possible.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
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

    // Send email to user
    const emailSent = await sendEmail({
      to: user.email,
      subject: `Support Ticket Update: ${ticket.ticket_number}`,
      html: `
        <h2>Support Ticket Update</h2>
        <p>Hello ${user.first_name || 'there'},</p>
        <p>Your support ticket has been updated.</p>
        <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Update:</strong></p>
        <p>${message}</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Support Ticket Update
        
        Hello ${user.first_name || 'there'},
        
        Your support ticket has been updated.
        
        Ticket Number: ${ticket.ticket_number}
        Subject: ${ticket.subject}
        Status: ${ticket.status}
        
        Update:
        ${message}
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
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

    // Send email to user
    const emailSent = await sendEmail({
      to: user.email,
      subject: `Support Ticket Resolved: ${ticket.ticket_number}`,
      html: `
        <h2>Support Ticket Resolved</h2>
        <p>Hello ${user.first_name || 'there'},</p>
        <p>Your support ticket has been resolved.</p>
        <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Resolution:</strong></p>
        <p>${resolution}</p>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Support Ticket Resolved
        
        Hello ${user.first_name || 'there'},
        
        Your support ticket has been resolved.
        
        Ticket Number: ${ticket.ticket_number}
        Subject: ${ticket.subject}
        
        Resolution:
        ${resolution}
        
        If you have any further questions, please don't hesitate to contact us.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
  } catch (error) {
    safeLogger.error('Error sending ticket resolution notification', { error })
    return false
  }
}

