'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Users, Target, Quote } from 'lucide-react'

interface ResearchStudy {
  icon: typeof BookOpen
  category: string
  title: string
  keyFinding: string
  stat?: string
  howItInformed: string
  citation: string
}

const studies: ResearchStudy[] = [
  {
    icon: Users,
    category: 'Roommate Conflict',
    title: 'Negative Roommate Relationships',
    keyFinding: 'Nearly half of all students face frequent or occasional conflict with roommates, impacting well-being and academic performance.',
    stat: '47.9%',
    howItInformed: 'Informed our comprehensive compatibility model that analyzes 40+ lifestyle factors to prevent conflicts before they start.',
    citation: 'Golding et al., "Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students"',
  },
  {
    icon: TrendingUp,
    category: 'Academic Peer Effects',
    title: 'Heterogeneous Peer Effects',
    keyFinding: 'The longer roommates live together, the stronger the peer effect on academic performance. Good matches deliver compounding benefits.',
    stat: 'Compounds over time',
    howItInformed: 'Shaped our long-term matching approach, prioritizing study habits, schedules, and academic goals alignment for sustained success.',
    citation: 'Cao et al., "Heterogeneous peer effects of college roommates on academic performance" (Nature, 2024)',
  },
  {
    icon: Target,
    category: 'Roommate Satisfaction',
    title: 'SDSU Roommate Satisfaction Survey',
    keyFinding: 'Having a satisfying roommate relationship clearly contributes to overall housing satisfaction - compatibility is a key driver.',
    stat: '70%',
    howItInformed: 'Validated our focus on transparent, explainable matching that shows students exactly why they\'re compatible, building trust from day one.',
    citation: 'InsideHigherEd article on SDSU survey (2024)',
  },
  {
    icon: BookOpen,
    category: 'Conflict Resolution',
    title: 'Cultural Modes of Conflict Resolution',
    keyFinding: 'Conflict affects almost half the cohort regardless of gender, emphasizing the unmet need for better matching solutions.',
    stat: '50.1% women, 44.1% men',
    howItInformed: 'Led to our ID verification system and compatibility algorithm that address root causes of conflict across all demographics.',
    citation: 'Burgos-Calvillo et al., "Cultural Modes of Conflict Resolution, Roommate Satisfaction & School Belonging" (2024)',
  },
]

export function ResearchDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {studies.map((study, index) => {
        const Icon = study.icon
        return (
          <Card key={index} className="border-brand-border/50">
            <CardHeader>
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-brand-primary mb-1">{study.category}</p>
                  <CardTitle className="text-lg">{study.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {study.stat && (
                <div className="bg-brand-primary/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-brand-primary mb-1">{study.stat}</div>
                  <p className="text-xs text-brand-muted">Key Finding</p>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-muted leading-relaxed italic">{study.keyFinding}</p>
              </div>

              <div className="pt-3 border-t border-brand-border/30">
                <p className="text-xs font-semibold text-brand-text mb-2">How it informed our algorithm:</p>
                <p className="text-sm text-brand-muted leading-relaxed">{study.howItInformed}</p>
              </div>

              <p className="text-xs text-brand-muted italic pt-2 border-t border-brand-border/20">
                {study.citation}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

