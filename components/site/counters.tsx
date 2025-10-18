import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/primitives/container'
import { Users, Heart, Star, Shield } from 'lucide-react'

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
    icon: Shield,
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
    <section className="py-14 md:py-20 lg:py-28 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by thousands of students
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-slate-600">
            Join the growing community of students who found their perfect roommate match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card 
                key={index}
                className="p-6 md:p-8 rounded-2xl shadow-sm border min-h-[140px] flex flex-col justify-center text-center"
              >
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {stat.label}
                    </div>
                    <div className="text-xs text-slate-600">
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
