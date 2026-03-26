import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/workflows'
import { safeLogger } from '@/lib/utils/logger'

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  topic: z.string().min(2),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const parse = ContactSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const data = parse.data
    const inbox = 'domumatch@gmail.com'

    const sent = await sendEmail({
      to: inbox,
      replyTo: data.email,
      subject: `[Contact] ${data.topic} - ${data.name}`,
      html: `
        <h2>New contact form message</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Topic:</strong> ${escapeHtml(data.topic)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>
      `,
      text: `
New contact form message

Name: ${data.name}
Email: ${data.email}
Topic: ${data.topic}

Message:
${data.message}
      `.trim(),
    })

    if (!sent) {
      safeLogger.warn('[Contact] Email send failed')
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    safeLogger.error('[Contact] Unexpected error', { err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

