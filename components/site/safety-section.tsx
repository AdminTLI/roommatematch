import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  Shield, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Users,
  Lock,
  FileText
} from 'lucide-react'

export function SafetySection() {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Students Only",
      description: "Every student must complete government ID + selfie verification before accessing the platform.",
      details: [
        "Government ID verification",
        "Selfie matching technology", 
        "University email confirmation",
        "Real identity verification"
      ]
    },
    {
      icon: MessageSquare,
      title: "Safe Communication",
      description: "Text-only messaging with built-in moderation and rate limiting to prevent harassment.",
      details: [
        "Text-only chat system",
        "Rate-limited conversations",
        "Automated content filtering",
        "Human moderation oversight"
      ]
    },
    {
      icon: Eye,
      title: "Transparent Process",
      description: "All matching decisions are explainable. You'll understand exactly why you're matched with someone.",
      details: [
        "Compatibility score breakdown",
        "Shared interests explanation",
        "Academic program matching",
        "Clear reasoning display"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Report & Block",
      description: "Easy reporting system with immediate escalation to university housing teams and our support staff.",
      details: [
        "One-click reporting",
        "Block and unmatch options",
        "University team notifications",
        "Support staff escalation"
      ]
    }
  ]

  const safetyStats = [
    { value: "100%", label: "Verified profiles" },
    { value: "0", label: "Safety incidents" },
    { value: "<1%", label: "Report rate" },
    { value: "24/7", label: "Moderation support" }
  ]

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Your safety is our priority
          </h2>
          <p className="text-lg text-brand-muted max-w-3xl mx-auto">
            Chat without worry. Text-only, rate-limited, moderated. 
            If something feels off, flag it instantly. We're here to help resolve concerns before move-in.
          </p>
        </div>

        {/* Safety Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {safetyStats.map((stat, index) => (
            <Card key={index} className="text-center border-brand-border">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-muted">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-brand-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-brand-muted mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-sm text-brand-text">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Safety Guidelines */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-brand-text mb-4">
              Safety Guidelines
            </h3>
            <p className="text-brand-muted">
              Follow these guidelines to ensure a safe and positive experience for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-primary" />
                For Students
              </h4>
              <ul className="space-y-3 text-sm text-brand-text">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Keep personal information private until you meet in person
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Meet in public places for the first time
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Trust your instincts - if something feels off, report it
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use our chat system for all communication initially
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-primary" />
                For Universities
              </h4>
              <ul className="space-y-3 text-sm text-brand-text">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Monitor the moderation queue regularly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Respond to safety reports within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Provide clear escalation paths for students
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Work with our support team on complex issues
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-brand-text mb-4">
            Need help or have concerns?
          </h3>
          <p className="text-brand-muted mb-6">
            Our safety team is here 24/7 to help resolve any issues or concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              Contact Safety Team
            </Button>
            <Button variant="outline" size="lg">
              View Safety Center
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
