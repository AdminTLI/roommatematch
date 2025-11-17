import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'

type Role = {
  title: string
  why: string
  studentFriendly?: boolean
  timeframe?: string
  background?: string
}

type Area = {
  name: string
  impact: string
  roles: Role[]
}

const AREAS: Area[] = [
  {
    name: 'Product & Operations',
    impact: 'Help us design and run safety-critical onboarding and verification flows.',
    roles: [
      { title: 'Product strategist / roadmap contributor', why: 'Keeps us focused on high‑leverage safety and trust features.', timeframe: '2–4 week sprints', background: 'Product/ops experience; strong prioritization' },
      { title: 'Research analyst', why: 'Turns student interviews into actionable improvements for onboarding and matching.', studentFriendly: true, timeframe: 'Weekly interview blocks', background: 'Psychology, sociology, HCD, or research methods' },
      { title: 'Onboarding/process coordinator', why: 'Ensures students finish verification, questionnaires, and profiles smoothly.', timeframe: '3–5 hrs/week', background: 'Operations or CX; detail‑oriented' },
    ],
  },
  {
    name: 'Engineering & Data',
    impact: 'Build trustworthy features and improve match quality with data.',
    roles: [
      { title: 'Full‑stack / Next.js contributor', why: 'Ships user‑facing features that improve reliability and trust.', timeframe: 'Issue‑scoped tasks', background: 'TS/React/Next.js; basic testing' },
      { title: 'Matching algorithm researcher', why: 'Improves match quality using data science and statistics.', timeframe: 'Research spikes', background: 'Stats/ML, experimentation' },
      { title: 'Supabase / infra engineer', why: 'Keeps our infra secure (RLS), observable, and deployable.', timeframe: 'Infra tickets', background: 'SQL/RLS, observability, deployment' },
    ],
  },
  {
    name: 'Design & Experience',
    impact: 'Craft an experience students trust—from identity to everyday flows.',
    roles: [
      { title: 'Brand designer', why: 'Creates a trustworthy identity across light/dark modes and marketing.', timeframe: 'Design explorations', background: 'Brand systems; accessibility' },
      { title: 'UX researcher', why: 'Learns from students to reduce friction in verification and onboarding.', timeframe: 'Weekly research cadence', background: 'HCD, usability testing', studentFriendly: true },
      { title: 'Content designer', why: 'Crafts copy that guides users through safety and onboarding steps.', timeframe: 'Microcopy passes', background: 'Content design/UX writing' },
    ],
  },
  {
    name: 'Marketing & Community',
    impact: 'Grow awareness and trust on campus through practical experiments.',
    roles: [
      { title: 'Growth strategist', why: 'Designs experiments and campaigns that drive qualified student signups.', timeframe: 'Experiment cycles', background: 'Growth analytics; experimentation' },
      { title: 'Student ambassador / campus lead', why: 'Builds grassroots awareness and trust on campus.', studentFriendly: true, timeframe: '3–5 hrs/week', background: 'Motivated students; marketing/comm preferred' },
      { title: 'Community moderator / support lead', why: 'Answers questions quickly and builds long‑term trust.', timeframe: 'Rotations', background: 'Support/community experience' },
    ],
  },
  {
    name: 'Trust & Safety / Admissions',
    impact: 'Protect students with strong verification and fair, compliant processes.',
    roles: [
      { title: 'Verification specialist', why: 'Designs anti‑fraud and verification processes to keep users safe.', timeframe: 'Process iterations', background: 'Risk, trust & safety, ops' },
      { title: 'Policy researcher', why: 'Ensures privacy and housing compliance for students and partners.', timeframe: 'Short research briefs', background: 'Policy/privacy research' },
      { title: 'Partner relations', why: 'Connects with universities and housing partners to scale impact.', timeframe: 'Outreach sprints', background: 'Partnerships/BD; education sector a plus' },
    ],
  },
]

export function RoleCatalog() {
  return (
    <div className="mx-auto max-w-4xl">
      <Accordion type="single" collapsible className="w-full">
        {AREAS.map((area, idx) => (
          <AccordionItem key={idx} value={`area-${idx}`}>
            <AccordionTrigger className="text-left text-lg sm:text-xl">{area.name}</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <p className="text-sm text-muted-foreground mb-2">Impact: {area.impact}</p>
                {area.roles.map((role, rIdx) => (
                  <Card key={rIdx} className="border-muted">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {role.title}
                            {role.studentFriendly ? ' · Open to motivated students' : ''}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Why it matters for Domu Match: {role.why}
                          </p>
                          {(role.timeframe || role.background) && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {role.timeframe ? `Time frame: ${role.timeframe}` : ''}
                              {role.timeframe && role.background ? ' · ' : ''}
                              {role.background ? `Ideal background: ${role.background}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}


