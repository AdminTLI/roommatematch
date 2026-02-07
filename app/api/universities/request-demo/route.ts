import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/workflows'
import { safeLogger } from '@/lib/utils/logger'

const DEMO_INBOX = process.env.UNIVERSITIES_DEMO_INBOX || 'domumatch@gmail.com'

const RequestDemoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  institution: z.string().optional().default(''),
  role: z.string().optional().default(''),
  message: z.string().optional().default(''),
})

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const parse = RequestDemoSchema.safeParse(body)
    if (!parse.success) {
      const errors = parse.error.flatten().fieldErrors
      const firstError = Object.values(errors).flat()[0]
      return NextResponse.json(
        { error: firstError || 'Invalid request', details: errors },
        { status: 400 }
      )
    }
    const data = parse.data

    const subject = 'Universities: Pilot / Strategy Call Request'
    const html = `
      <h2>New Pilot / Strategy Call Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      ${data.institution ? `<p><strong>Institution:</strong> ${escapeHtml(data.institution)}</p>` : ''}
      ${data.role ? `<p><strong>Role:</strong> ${escapeHtml(data.role)}</p>` : ''}
      ${data.message ? `<p><strong>Message:</strong><br/>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>` : ''}
    `.trim()

    const text = [
      'New Pilot / Strategy Call Request',
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.institution ? `Institution: ${data.institution}` : '',
      data.role ? `Role: ${data.role}` : '',
      data.message ? `\nMessage:\n${data.message}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const sent = await sendEmail({
      to: DEMO_INBOX,
      subject,
      html,
      text,
    })

    if (!sent) {
      safeLogger.warn('[Universities Request Demo] Email send failed (SMTP may not be configured)')
      // Still return success - the submission was received; email is best-effort
    }

    safeLogger.info('[Universities Request Demo] Demo request received', {
      email: data.email,
      institution: data.institution || '(not provided)',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    safeLogger.error('[Universities Request Demo] Unexpected error', { error: err })
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
