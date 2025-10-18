import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/primitives/container'
import { Eyebrow } from '@/components/ui/primitives/eyebrow'
import { 
  Brain, 
  Filter, 
  MessageSquare, 
  Shield, 
  GraduationCap, 
  Home,
  ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "Smart matching",
    description: "AI-powered compatibility analysis based on lifestyle, study habits, and personality traits to find your perfect roommate match.",
    link: "Learn more"
  },
  {
    icon: Filter,
    title: "Advanced filters",
    description: "Filter by university, program, study year, budget, lifestyle preferences, and more to narrow down your ideal matches.",
    link: "Learn more"
  },
  {
    icon: MessageSquare,
    title: "Conversation starters",
    description: "Get personalized ice-breaker questions and compatibility insights to help you start meaningful conversations with potential roommates.",
    link: "Learn more"
  },
  {
    icon: Shield,
    title: "Verified & secure",
    description: "All users are verified through university email and ID verification. Your data is protected with enterprise-grade security.",
    link: "Learn more"
  },
  {
    icon: GraduationCap,
    title: "University partnerships",
    description: "Trusted by 50+ leading Dutch universities. Get access to exclusive housing opportunities and student support services.",
    link: "Learn more"
  },
  {
    icon: Home,
    title: "Complete housing solution",
    description: "Find roommates, discover verified housing listings, and get help with move-in planning all in one platform.",
    link: "Learn more"
  }
]

export function Features() {
  return (
    <section className="py-14 md:py-20 lg:py-28 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow>Everything you need to find your perfect roommate</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 md:mt-4">
            Powerful features for successful matches
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-slate-600 mt-4">
            Our comprehensive platform makes finding the right roommate simple and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="group rounded-2xl border shadow-sm p-6 md:p-8 h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4">
                    <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group-hover:translate-x-1 transform transition-transform duration-200">
                      {feature.link}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
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
