'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Users, TrendingUp, Shield } from 'lucide-react'

interface EvidenceTileProps {
  statistic: string
  title: string
  explanation: string
  source: string
  solution: string
  icon: 'Users' | 'TrendingUp' | 'Shield'
}

const iconMap = {
  Users,
  TrendingUp,
  Shield,
}

export function EvidenceTile({
  statistic,
  title,
  explanation,
  source,
  solution,
  icon
}: EvidenceTileProps) {
  const Icon = iconMap[icon]
  
  return (
    <Card className="border-brand-border/50 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl font-bold text-brand-primary">{statistic}</div>
          <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-brand-primary" />
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-brand-muted text-sm leading-relaxed mb-3">{explanation}</p>
            <p className="text-xs text-brand-muted italic border-l-2 border-brand-primary/20 pl-3">
              {source}
            </p>
          </div>
          
          <div className="pt-4 border-t border-brand-border/30 mt-auto">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-brand-text mb-1">How we solve it:</p>
                <p className="text-sm text-brand-muted leading-relaxed">{solution}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

