import { CheckCircle2, Clock, Rocket, Users } from 'lucide-react'

const STEPS = [
  { icon: Users, title: 'Apply', note: '5 min form + track selection' },
  { icon: CheckCircle2, title: 'Foundersync', note: '30‑min alignment call' },
  { icon: Rocket, title: 'Project sprint', note: '3–5 hrs/wk commitment' },
  { icon: Clock, title: 'Showcase', note: 'Deliverable in 2–3 weeks' },
]

export function ProcessRibbon() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-primary/20 bg-primary/5 text-card-foreground p-4 sm:p-5 shadow-md">
        {STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-lg bg-white/70 p-3">
            <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


