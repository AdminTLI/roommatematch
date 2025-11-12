// Email Workflow System
// This module handles email notifications for tickets and other events

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromEmail: string
  fromName: string
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Get email configuration from environment variables
 */
function getEmailConfig(): EmailConfig | null {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@domumatch.nl'
  const fromName = process.env.SMTP_FROM_NAME || 'Domu Match'

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    safeLogger.warn('Email configuration not found. Email notifications will be disabled.')
    return null
  }

  return {
    smtpHost,
    smtpPort: parseInt(smtpPort),
    smtpUser,
    smtpPass,
    fromEmail,
    fromName
  }
}

/**
 * Send email using SMTP
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

    // For now, we'll use a simple fetch-based email sending
    // In production, you should use a proper email service like SendGrid, Mailgun, or Nodemailer
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.smtpPass}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: message.to }]
        }],
        from: {
          email: config.fromEmail,
          name: config.fromName
        },
        subject: message.subject,
        content: [
          {
            type: 'text/html',
            value: message.html
          },
          ...(message.text ? [{
            type: 'text/plain',
            value: message.text
          }] : [])
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

