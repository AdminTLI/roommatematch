import { Shield, GitBranch, GraduationCap } from 'lucide-react'

const METRICS = [
  { icon: Shield, title: 'Privacy-first', note: 'Row Level Security (RLS) on by default' },
  { icon: GitBranch, title: 'Weekly iteration', note: 'Scoped sprints; small, shippable units' },
  { icon: GraduationCap, title: 'Pilot-ready', note: 'Built for student communities' },
]

export function EvidenceRibbon() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {METRICS.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <m.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <div className="text-sm font-medium">{m.title}</div>
              <div className="text-xs text-muted-foreground">{m.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


