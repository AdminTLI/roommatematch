import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/primitives/container'
import { Users, Heart, GraduationCap, Star } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Students matched",
    description: "Successfully paired roommates"
  },
  {
    icon: Heart,
    value: "94%",
    label: "Satisfaction rate",
    description: "Happy with their match"
  },
  {
    icon: GraduationCap,
    value: "50+",
    label: "Partner universities",
    description: "Trusted by leading institutions"
  },
  {
    icon: Star,
    value: "4.8★",
    label: "Average rating",
    description: "Based on 2,000+ reviews"
  }
]

export function Counters() {
  return (
    <section className="py-14 md:py-20 lg:py-28 bg-brand-surface">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Trusted by thousands of students
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Join the growing community of students who found their perfect roommate match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card 
                key={index}
                className="rounded-2xl border border-brand-border shadow-elev-1 p-6 md:p-8 bg-white min-h-[140px] flex flex-col justify-center text-center transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
              >
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-semibold text-brand-text">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-brand-text">
                      {stat.label}
                    </div>
                    <div className="text-xs text-brand-muted">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}