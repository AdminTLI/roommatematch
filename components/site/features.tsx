import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  Brain, 
  Filter, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
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
    icon: ShieldCheck,
    title: "Verified & secure",
    description: "All users are verified through university email and ID verification. Your data is protected with enterprise-grade security.",
    link: "Learn more"
  },
  {
    icon: Building2,
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
    <Section className="bg-brand-surface">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Everything you need to find your perfect roommate
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Our comprehensive platform makes finding the right roommate simple and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="rounded-2xl border border-brand-border shadow-elev-1 p-6 md:p-8 bg-white h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-text mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-brand-muted line-clamp-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4">
                    <Button 
                      variant="ghost" 
                      className="inline-flex items-center text-sm font-medium text-brand-primary hover:text-brand-primaryHover transition-colors group-hover:translate-x-1 transform transition-transform duration-200 p-0 h-auto"
                    >
                      {feature.link}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}