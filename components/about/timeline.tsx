'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'

interface TimelineItem {
  title: string
  description: string
  date?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-brand-border hidden md:block" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={index} className="relative flex gap-6">
            {/* Timeline dot */}
            <div className="flex-shrink-0 relative z-10">
              <div className="h-12 w-12 rounded-full bg-white border-2 border-brand-primary flex items-center justify-center">
                {index < items.length - 1 ? (
                  <Circle className="h-4 w-4 text-brand-primary fill-brand-primary" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                )}
              </div>
            </div>
            
            {/* Content card */}
            <div className="flex-1 pb-8">
              <Card className="border-brand-border/50 bg-white">
                <CardContent className="p-6">
                  {item.date && (
                    <p className="text-sm font-semibold text-brand-primary mb-2">{item.date}</p>
                  )}
                  <h3 className="text-lg font-semibold text-brand-text mb-2">{item.title}</h3>
                  <p className="text-brand-muted leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}




