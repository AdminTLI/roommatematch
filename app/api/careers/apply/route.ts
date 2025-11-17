import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/email/workflows'

const ApplicationSchema = z.object({
  track: z.enum(['experienced', 'student']),
  name: z.string().min(2),
  email: z.string().email(),
  skills: z.string().min(2),
  tools: z.string().optional().default(''),
  timeCommitment: z.string().min(1),
  exampleProject: z.string().min(2),
  notes: z.string().optional().default(''),
  preferredArea: z.string().optional().default(''),
  courseProgram: z.string().optional().default(''),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parse = ApplicationSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid request', details: parse.error.flatten() }, { status: 400 })
    }
    const data = parse.data

    const supabase = createServiceClient()
    const { error } = await supabase.from('career_applications').insert({
      track: data.track,
      name: data.name,
      email: data.email,
      skills: data.skills,
      tools: data.tools || '',
      time_commitment: data.timeCommitment,
      example_project: data.exampleProject,
      notes: data.notes || '',
      preferred_area: data.preferredArea || '',
      course_program: data.courseProgram || '',
      status: 'new',
    })

    if (error) {
      console.error('Failed to insert career application', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    const inbox = process.env.CAREERS_INBOX || process.env.SUPPORT_INBOX
    if (inbox) {
      // Best-effort notification
      await sendEmail({
        to: inbox,
        subject: `New ${data.track} volunteer application – ${data.name}`,
        html: `
          <h2>New Volunteer Application</h2>
          <p><strong>Track:</strong> ${data.track}</p>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.preferredArea ? `<p><strong>Preferred area:</strong> ${data.preferredArea}</p>` : ''}
          ${data.courseProgram ? `<p><strong>Course/program:</strong> ${data.courseProgram}</p>` : ''}
          <p><strong>Time commitment:</strong> ${data.timeCommitment}</p>
          <p><strong>Skills:</strong><br/>${escapeHtml(data.skills).replace(/\n/g, '<br/>')}</p>
          <p><strong>Tools:</strong><br/>${escapeHtml(data.tools || '').replace(/\n/g, '<br/>')}</p>
          <p><strong>Example project or impact:</strong><br/>${escapeHtml(data.exampleProject).replace(/\n/g, '<br/>')}</p>
          ${data.notes ? `<p><strong>Notes:</strong><br/>${escapeHtml(data.notes).replace(/\n/g, '<br/>')}</p>` : ''}
        `,
        text: `
New Volunteer Application

Track: ${data.track}
Name: ${data.name}
Email: ${data.email}
${data.preferredArea ? `Preferred area: ${data.preferredArea}\n` : ''}${data.courseProgram ? `Course/program: ${data.courseProgram}\n` : ''}Time commitment: ${data.timeCommitment}
Skills:
${data.skills}

Tools:
${data.tools || ''}

Example project or impact:
${data.exampleProject}

${data.notes ? `Notes:\n${data.notes}\n` : ''}
        `.trim(),
      }).catch(() => null)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Application submit error', err)
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


