'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { 
  TrendingDown, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Building2,
  Lock,
  Globe,
  Zap
} from 'lucide-react'

export function UniversitiesPage() {
  const { t } = useApp()

  const outcomes = [
    {
      icon: TrendingDown,
      title: "Reduce conflicts",
      description: "Fewer accommodation complaints and roommate disputes",
      metric: "60% reduction",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Users,
      title: "Improve satisfaction", 
      description: "Higher student satisfaction with housing arrangements",
      metric: "85% satisfaction",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Shield,
      title: "Save staff time",
      description: "Less admin workload with automated matching and moderation",
      metric: "40% less work",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ]

  const features = [
    {
      icon: Building2,
      title: "Campus Integration",
      description: "Seamless SSO with SURFconext and university systems",
      benefits: ["SURFconext SSO", "Email domain validation", "Campus-scoped communities"]
    },
    {
      icon: Lock,
      title: "Security & Verification",
      description: "ID verification gate ensures only verified students join",
      benefits: ["Government ID verification", "Live selfie checks", "Campus email validation"]
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into student housing satisfaction",
      benefits: ["Signup analytics", "Completion rates", "Conflict reports", "Retention metrics"]
    },
    {
      icon: Settings,
      title: "Admin Controls",
      description: "Full control over branding, eligibility, and moderation",
      benefits: ["University branding", "Eligibility rules", "Announcements", "Moderation queue"]
    }
  ]

  const addons = [
    {
      icon: Globe,
      title: "API & Integrations",
      description: "Connect with existing university systems and housing platforms",
      price: "Custom"
    },
    {
      icon: MessageSquare,
      title: "Conflict Resolution Toolkit",
      description: "Structured mediation and resolution processes for disputes",
      price: "€500/month"
    },
    {
      icon: Zap,
      title: "White-label Solution",
      description: "Fully branded platform with your university's identity",
      price: "€2000/month"
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Reduce conflicts. Improve satisfaction. Save staff time.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Roommate Match helps universities create safer, more compatible living environments 
              while reducing administrative burden and improving student satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Book a pilot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                View demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Proven Outcomes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Universities using Roommate Match see significant improvements in student housing satisfaction and reduced administrative overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((outcome, index) => (
              <Card key={index} className={`border-2 ${outcome.bgColor} hover:shadow-lg transition-shadow`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                    <outcome.icon className={`h-8 w-8 ${outcome.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{outcome.title}</CardTitle>
                  <CardDescription className="text-base">
                    {outcome.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className={`text-3xl font-bold ${outcome.color} mb-2`}>
                    {outcome.metric}
                  </div>
                  <Badge variant="outline" className={outcome.color}>
                    Typical improvement
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works on campus
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Seamless integration with your existing university infrastructure and processes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">
                    {feature.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Extend the platform with powerful integrations and specialized tools for comprehensive housing management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {addons.map((addon, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <addon.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{addon.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">
                    {addon.description}
                  </CardDescription>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {addon.price}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to improve student housing?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join leading Dutch universities in creating better living experiences for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Book a pilot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Contact sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
